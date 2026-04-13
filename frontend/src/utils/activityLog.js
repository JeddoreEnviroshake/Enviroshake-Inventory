import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// No-op stubs — data is loaded via Firestore subscription in App.js
export function loadLogs() { return []; }
export function saveLogs() {}

export function logActivity({
  user = 'System',
  action = '',
  itemId = null,
  fieldChanged = null,
  value = null,
  oldValue = null,
  newValue = null,
  comment = '',
  referenceId = null,
  formData = null
}) {
  const entry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    user,
    action,
    itemId,
    fieldChanged,
    value,
    oldValue,
    newValue,
    comment,
    referenceId,
    details: comment,
    formData: formData || null
  };
  // Fire-and-forget write to Firestore
  addDoc(collection(db, 'activityHistory'), entry).catch(console.error);
  return entry;
}

export function logFormSubmission({ action = '', user = 'System', itemId = null, formData = {}, comment = '', referenceId = null }) {
  return logActivity({ action, user, itemId, comment, referenceId, formData });
}

export function getLogs(filters = {}) {
  // Filtering is now done in the component against the subscribed data
  return [];
}

export function exportLogs(logs, format = 'csv') {
  const data = logs || [];
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  const headers = ['id', 'timestamp', 'user', 'action', 'itemId', 'fieldChanged', 'value', 'oldValue', 'newValue', 'comment', 'referenceId', 'formData'];
  const rows = [headers.join(',')];
  data.forEach(log => {
    const row = headers.map(h => {
      let val = log[h] !== undefined && log[h] !== null ? log[h] : '';
      if (typeof val === 'object') val = JSON.stringify(val);
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
    rows.push(row);
  });
  return rows.join('\n');
}
