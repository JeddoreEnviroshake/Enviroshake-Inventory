import React, { useMemo, useState, useEffect } from "react";

const formatTimestamp = ts => {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const PAGE_SIZE = 10;

const ActivitySnapshotView = ({ activityHistory }) => {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activityHistory]);

  const logs = useMemo(
    () => activityHistory,
    [activityHistory]
  );

  const pageCount = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const pageData = useMemo(
    () => logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [logs, page]
  );

  const fields = useMemo(() => {
    const set = new Set();
    pageData.forEach(l => {
      Object.keys(l.formData || {}).forEach(f => set.add(f));
    });
    return Array.from(set).sort();
  }, [pageData]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Activity</h2>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
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
            {pageData.map(log => (
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
        <div className="flex justify-between items-center p-2 text-sm">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page} of {pageCount}</span>
          <button
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ActivitySnapshotView);
