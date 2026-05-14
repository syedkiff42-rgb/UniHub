const path         = require('path');
const fs           = require('fs');
const db           = require('../config/db');
const { parsePdf } = require('./pdfService');

// ── POST /api/pdf/upload ──────────────────────────────────────
async function uploadPdf(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
  }

  const { originalname, filename, size } = req.file;

  try {
    // 1. Persist upload record
    const [ins] = await db.query(
      `INSERT INTO pdf_uploads (user_id, filename, original_name, file_size, status)
       VALUES (?,?,?,?,'pending')`,
      [req.user.id, filename, originalname, size]
    );
    const uploadId = ins.insertId;

    // 2. Respond immediately, parse in background
    res.status(202).json({
      success: true,
      message: 'Upload received. Parsing in background.',
      upload_id: uploadId,
    });

    // 3. Background parse
    _parsePdfBackground(uploadId, req.file.path, req.user.id);

  } catch (err) {
    console.error('[uploadPdf]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function _parsePdfBackground(uploadId, filePath, userId) {
  try {
    await db.query("UPDATE pdf_uploads SET status='processing' WHERE id=?", [uploadId]);

    const events = await parsePdf(filePath);

    if (!events.length) {
      await db.query(
        "UPDATE pdf_uploads SET status='done', parsed_at=NOW(), error_msg='No dates found in PDF.' WHERE id=?",
        [uploadId]
      );
      return;
    }

    // Bulk insert schedule events
    const values = events.map(e => [
      userId,
      uploadId,
      e.title,
      e.event_type,
      e.event_date,
      e.start_time  || null,
      e.end_time    || null,
      e.venue       || null,
      e.course_code || null,
      'pdf',
    ]);

    await db.query(
      `INSERT INTO schedule_events
         (user_id, pdf_id, title, event_type, event_date, start_time, end_time, venue, course_code, source)
       VALUES ?`,
      [values]
    );

    await db.query(
      "UPDATE pdf_uploads SET status='done', parsed_at=NOW() WHERE id=?",
      [uploadId]
    );

    console.log(`[pdf] Upload ${uploadId}: extracted ${events.length} events.`);
  } catch (err) {
    console.error('[_parsePdfBackground]', err);
    await db.query(
      "UPDATE pdf_uploads SET status='failed', error_msg=? WHERE id=?",
      [err.message, uploadId]
    );
  }
}

// ── GET /api/pdf/status/:uploadId ─────────────────────────────
async function getStatus(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, original_name, file_size, status, error_msg, uploaded_at, parsed_at
       FROM pdf_uploads
       WHERE id = ? AND user_id = ?`,
      [req.params.uploadId, req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Upload not found.' });
    }

    const upload = rows[0];

    let events = [];
    if (upload.status === 'done') {
      const [evRows] = await db.query(
        `SELECT id, title, event_type, event_date, start_time, venue, course_code
         FROM schedule_events WHERE pdf_id = ? ORDER BY event_date`,
        [upload.id]
      );
      events = evRows;
    }

    return res.json({ success: true, upload, events });
  } catch (err) {
    console.error('[getStatus]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/pdf ──────────────────────────────────────────────
async function listUploads(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, original_name, file_size, status, uploaded_at, parsed_at
       FROM pdf_uploads WHERE user_id = ? ORDER BY uploaded_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, uploads: rows });
  } catch (err) {
    console.error('[listUploads]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── DELETE /api/pdf/:uploadId ─────────────────────────────────
async function deleteUpload(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT filename FROM pdf_uploads WHERE id = ? AND user_id = ?',
      [req.params.uploadId, req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Upload not found.' });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', rows[0].filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM pdf_uploads WHERE id = ?', [req.params.uploadId]);

    return res.json({ success: true, message: 'Upload and events deleted.' });
  } catch (err) {
    console.error('[deleteUpload]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ── GET /api/pdf/:uploadId/events ─────────────────────────────
async function getEvents(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT se.*
       FROM schedule_events se
       JOIN pdf_uploads pu ON pu.id = se.pdf_id
       WHERE se.pdf_id = ? AND pu.user_id = ?
       ORDER BY se.event_date`,
      [req.params.uploadId, req.user.id]
    );
    return res.json({ success: true, events: rows });
  } catch (err) {
    console.error('[getEvents]', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { uploadPdf, getStatus, listUploads, deleteUpload, getEvents };