import React, { useMemo } from "react";

const formatTimestamp = ts => {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const ActivitySnapshotView = ({ activityHistory }) => {
  const logs = useMemo(
    () => activityHistory,
    [activityHistory]
  );

  const fields = useMemo(() => {
    const set = new Set();
    logs.forEach(l => {
      Object.keys(l.formData || {}).forEach(f => set.add(f));
    });
    return Array.from(set).sort();
  }, [logs]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Activity</h2>
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left">Timestamp</th>
              <th className="px-2 py-3 text-left">Action</th>
              <th className="px-2 py-3 text-left">User</th>
              <th className="px-2 py-3 text-left">Item ID</th>
              <th className="px-2 py-3 text-left">Field</th>
              <th className="px-2 py-3 text-left">Old Value</th>
              <th className="px-2 py-3 text-left">New Value</th>
              {fields.map(f => (
                <th key={f} className="px-2 py-3 text-left">{f}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                <td className="px-2 py-2 whitespace-nowrap">{log.action}</td>
                <td className="px-2 py-2 whitespace-nowrap">{log.user}</td>
                <td className="px-2 py-2 whitespace-nowrap">{log.itemId || '-'}</td>
                <td className="px-2 py-2 whitespace-nowrap">{log.fieldChanged || '-'}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {log.oldValue !== null && log.oldValue !== undefined ? String(log.oldValue) : '-'}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {log.newValue !== null && log.newValue !== undefined ? String(log.newValue) : (log.value !== null && log.value !== undefined ? String(log.value) : '-')}
                </td>
                {fields.map(f => (
                  <td key={f} className="px-2 py-2 whitespace-nowrap">
                    {log.formData && log.formData[f] !== undefined ? String(log.formData[f]) : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivitySnapshotView;
