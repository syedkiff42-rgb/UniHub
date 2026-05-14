import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from './config';
import { apiFetch } from './authService';

const PdfService = {

  // ── Upload a PDF file ──────────────────────────────────────
  // ── Upload a PDF file ──────────────────────────────────────
async uploadPdf(fileUri, fileName) {
  let token = await AsyncStorage.getItem('accessToken');

  const doUpload = async (accessToken) => {
    const formData = new FormData();
    formData.append('pdf', {
      uri:  fileUri,
      name: fileName || 'upload.pdf',
      type: 'application/pdf',
    });
    return fetch(`${BASE_URL}/api/pdf/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type':  'multipart/form-data',
      },
      body: formData,
    });
  };

  let res  = await doUpload(token);
  let data = await res.json();

  // If token expired, refresh and retry once
  if (res.status === 401 && data.code === 'TOKEN_EXPIRED') {
    const { AuthService } = require('./authService');
    token = await AuthService.refreshToken();
    res   = await doUpload(token);
    data  = await res.json();
  }

  if (!data.success) throw new Error(data.message);
  return data;
},

  // ── Poll parse status ──────────────────────────────────────
  async getStatus(uploadId) {
    const res  = await apiFetch(`${BASE_URL}/api/pdf/status/${uploadId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // ── List all uploads ───────────────────────────────────────
  async listUploads() {
    const res  = await apiFetch(`${BASE_URL}/api/pdf`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.uploads;
  },

  // ── Get events from a specific upload ─────────────────────
  async getEvents(uploadId) {
    const res  = await apiFetch(`${BASE_URL}/api/pdf/${uploadId}/events`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.events;
  },

  // ── Delete an upload ───────────────────────────────────────
  async deleteUpload(uploadId) {
    const res  = await apiFetch(`${BASE_URL}/api/pdf/${uploadId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // ── Poll until done (max 30 seconds) ──────────────────────
  async pollUntilDone(uploadId, onProgress) {
    const maxAttempts = 15;
    const interval    = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getStatus(uploadId);
      if (onProgress) onProgress(result.upload.status);
      if (result.upload.status === 'done')   return result;
      if (result.upload.status === 'failed') throw new Error(result.upload.error_msg || 'Parsing failed.');
      await new Promise(r => setTimeout(r, interval));
    }

    throw new Error('Parsing timed out. Please try again.');
  },

};

export { PdfService };