const STORAGE_KEY = 'enviroshake_activityHistory';

function generateId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
  );
}

export function loadLogs() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load activity logs', err);
    return [];
  }
}

export function saveLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save activity logs', err);
  }
}

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
  const logs = loadLogs();
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
    details: comment, // for backward compatibility
    formData
  };
  logs.unshift(entry);
  saveLogs(logs);
  return entry;
}


export function logFormSubmission({ action = '', user = 'System', itemId = null, formData = {}, comment = '', referenceId = null }) {
  return logActivity({ action, user, itemId, comment, referenceId, formData });
}

export function getLogs({
  itemId,
  startDate,
  endDate,
  action,
  user,
  search
} = {}) {
  let logs = loadLogs();
  if (itemId) {
    logs = logs.filter(l => l.itemId === itemId);
  }
  if (startDate) {
    const s = new Date(startDate);
    logs = logs.filter(l => new Date(l.timestamp) >= s);
  }
  if (endDate) {
    const e = new Date(endDate);
    logs = logs.filter(l => new Date(l.timestamp) <= e);
  }
  if (action) {
    logs = logs.filter(l => l.action === action);
  }
  if (user) {
    logs = logs.filter(l => l.user === user);
  }
  if (search) {
    const term = search.toLowerCase();
    logs = logs.filter(l => {
      return (
        (l.comment && l.comment.toLowerCase().includes(term)) ||
        (l.fieldChanged && l.fieldChanged.toLowerCase().includes(term)) ||
        (l.itemId && l.itemId.toLowerCase().includes(term))
      );
    });
  }
  return logs;
}

export function exportLogs(logs, format = 'csv') {
  const data = logs || loadLogs();
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  const headers = [
    'id',
    'timestamp',
    'user',
    'action',
    'itemId',
    'fieldChanged',
    'value',
    'oldValue',
    'newValue',
    'comment',
    'referenceId',
    'formData'
  ];
  const rows = [headers.join(',')];
  data.forEach(log => {
    const row = headers
      .map(h => {
        let val = log[h] !== undefined && log[h] !== null ? log[h] : '';
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
    rows.push(row);
  });
  return rows.join('\n');
}
