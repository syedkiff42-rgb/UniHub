const pdfParse = require('pdf-parse');
const fs       = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Gemini setup ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ── Rule-based fallback config ────────────────────────────────
const MONTHS = {
  january:1, february:2, march:3, april:4, may:5, june:6,
  july:7, august:8, september:9, october:10, november:11, december:12,
  jan:1, feb:2, mar:3, apr:4, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12,
};

const TYPE_KEYWORDS = {
  exam:       ['exam', 'final', 'mid-term', 'midterm', 'test'],
  lecture:    ['lecture', 'class', 'tutorial'],
  lab:        ['lab', 'practical', 'practicum'],
  assignment: ['assignment', 'submission', 'submit', 'deadline', 'due'],
  holiday:    ['holiday', 'break', 'public holiday', 'no class'],
};

const COURSE_CODE_PATTERN = /\b([A-Z]{2,4}\d{4}[A-Z]?)\b/g;
const TIME_PATTERN = /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/gi;

// ── Gemini AI parser ──────────────────────────────────────────
async function parseWithAI(text) {
  const prompt = `
You are an academic schedule parser. Extract all schedule events from the following university PDF text.

Return ONLY a valid JSON array with no extra text, no markdown, no backticks.
Each object in the array must have these fields:
- title: string (event/subject name)
- event_type: one of "exam", "lecture", "lab", "assignment", "holiday", "other"
- event_date: string in "YYYY-MM-DD" format
- start_time: string in "HH:MM:00" 24hr format or null
- end_time: string in "HH:MM:00" 24hr format or null
- venue: string or null
- course_code: string (e.g. "CSC3534") or null

Rules:
- If no valid events found, return empty array []
- Skip page numbers, headers, footers
- For date ranges, create one event per day
- Convert all dates to YYYY-MM-DD format
- Convert all times to 24hr HH:MM:00 format

PDF TEXT:
${text.slice(0, 12000)}
`;

  const result   = await model.generateContent(prompt);
  const response = await result.response;
  const raw      = response.text().trim();

  // Strip markdown fences if present
  const clean = raw.replace(/```json|```/g, '').trim();
  const events = JSON.parse(clean);

  if (!Array.isArray(events)) throw new Error('AI did not return an array.');

  // Validate and sanitize each event
  const valid = events.filter(e => e.event_date && e.title);
  return valid;
}

// ── Rule-based fallback parser ────────────────────────────────
function detectType(text) {
  const lower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return type;
  }
  return 'other';
}

function extractCourseCode(text) {
  const matches = [...text.matchAll(COURSE_CODE_PATTERN)];
  return matches.length ? matches[0][1] : null;
}

function parseDate(dayStr, monthStr, yearStr) {
  const day   = parseInt(dayStr, 10);
  const month = typeof monthStr === 'string' && isNaN(monthStr)
    ? MONTHS[monthStr.toLowerCase()]
    : parseInt(monthStr, 10);
  const year  = parseInt(yearStr, 10);
  if (!day || !month || !year) return null;
  const d = new Date(year, month - 1, day);
  return d.toISOString().split('T')[0];
}

function extractDatesFromLine(line) {
  const dates = [];
  let m;

  // DD Month YYYY
  const p1 = /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})\b/gi;
  while ((m = p1.exec(line)) !== null) {
    const d = parseDate(m[1], m[2], m[3]);
    if (d) dates.push(d);
  }

  // Month DD YYYY
  const p2 = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{4})\b/gi;
  while ((m = p2.exec(line)) !== null) {
    const d = parseDate(m[2], m[1], m[3]);
    if (d) dates.push(d);
  }

  // DD/MM/YYYY
  const p3 = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g;
  while ((m = p3.exec(line)) !== null) {
    const d = parseDate(m[1], m[2], m[3]);
    if (d) dates.push(d);
  }

  return [...new Set(dates)];
}

function extractTimeFromLine(line) {
  const m = TIME_PATTERN.exec(line);
  TIME_PATTERN.lastIndex = 0;
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const min = m[2];
  if (m[3]) {
    if (m[3].toLowerCase() === 'pm' && hour < 12) hour += 12;
    if (m[3].toLowerCase() === 'am' && hour === 12) hour = 0;
  }
  return `${String(hour).padStart(2, '0')}:${min}:00`;
}

function parseWithRules(text) {
  const events = [];
  const lines  = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const dates = extractDatesFromLine(line);
    if (!dates.length) continue;

    const eventType  = detectType(line);
    const courseCode = extractCourseCode(line);
    const startTime  = extractTimeFromLine(line);

    let title = line
      .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/g, '')
      .replace(/\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi, '')
      .replace(/\d{1,2}:\d{2}\s*(am|pm)?/gi, '')
      .replace(COURSE_CODE_PATTERN, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!title || title.length < 3) title = `Event on ${dates[0]}`;

    for (const date of dates) {
      events.push({
        title,
        event_type:  eventType,
        event_date:  date,
        start_time:  startTime,
        course_code: courseCode,
        source:      'pdf',
      });
    }
  }

  // Deduplicate
  const seen = new Set();
  return events.filter(e => {
    const key = `${e.event_date}::${e.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Main export ───────────────────────────────────────────────
async function parsePdf(input) {
  const buffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
  const data   = await pdfParse(buffer);
  const text   = data.text;

  if (!text || text.trim().length < 50) {
    console.warn('[pdf] PDF has no extractable text (possibly scanned image).');
    return [];
  }

  // 1. Try AI first
  try {
    console.log('[pdf] Trying AI parsing with Gemini...');
    const aiEvents = await parseWithAI(text);

    if (aiEvents.length > 0) {
      console.log(`[pdf] Gemini extracted ${aiEvents.length} events.`);
      return aiEvents;
    }

    console.warn('[pdf] Gemini returned 0 events, falling back to rules.');
  } catch (err) {
    console.warn('[pdf] Gemini failed, falling back to rules:', err.message);
  }

  // 2. Fall back to rule-based
  console.log('[pdf] Using rule-based parsing...');
  const ruleEvents = parseWithRules(text);
  console.log(`[pdf] Rules extracted ${ruleEvents.length} events.`);
  return ruleEvents;
}

module.exports = { parsePdf };