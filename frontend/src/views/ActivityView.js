import React, { useMemo, useState } from "react";
import { updateComment, exportLogs } from "../utils/activityLog";

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

const ActivityView = ({ activityHistory, setActivityHistory }) => {
  const [filters, setFilters] = useState({
    search: "",
    user: "",
    action: "",
    startDate: "",
    endDate: ""
  });
  const [page, setPage] = useState(1);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const filteredLogs = useMemo(() => {
    return activityHistory.filter(log => {
      if (filters.user && log.user !== filters.user) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const haystack = `${log.itemId || ""} ${log.fieldChanged || ""} ${log.comment || ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [activityHistory, filters]);

  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const pageData = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const uniqueActions = Array.from(new Set(activityHistory.map(a => a.action)));
  const uniqueUsers = Array.from(new Set(activityHistory.map(a => a.user)));

  const handleCommentBlur = (id, value) => {
    const updated = updateComment(id, value);
    if (updated) {
      setActivityHistory(history => history.map(l => (l.id === id ? updated : l)));
    }
  };

  const triggerExport = (format) => {
    const data = exportLogs(filteredLogs, format);
    const blob = new Blob([data], { type: format === "json" ? "application/json" : "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_history.${format === "json" ? "json" : "csv"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Activity History</h2>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="Search"
            value={filters.search}
            onChange={e => handleFilterChange("search", e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <select
            value={filters.user}
            onChange={e => handleFilterChange("user", e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Users</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <select
            value={filters.action}
            onChange={e => handleFilterChange("action", e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => handleFilterChange("startDate", e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={e => handleFilterChange("endDate", e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div>
          <button
            onClick={() => triggerExport("csv")}
            className="mr-2 px-3 py-1 bg-[#09713c] text-white rounded hover:bg-[#09713c]"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left">Timestamp</th>
                <th className="px-2 py-3 text-left">Action</th>
                <th className="px-2 py-3 text-left">Item ID</th>
                <th className="px-2 py-3 text-left">Field</th>
                <th className="px-2 py-3 text-left">Value</th>
                <th className="px-2 py-3 text-left">From &gt; To</th>
                <th className="px-2 py-3 text-left">User</th>
                <th className="px-2 py-3 text-left">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pageData.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{log.action}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{log.itemId || '-'}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{log.fieldChanged || '-'}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{log.value ?? log.newValue ?? log.oldValue ?? '-'}</td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {log.oldValue !== null && log.oldValue !== undefined && log.newValue !== null && log.newValue !== undefined
                      ? `${log.oldValue} > ${log.newValue}`
                      : '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">{log.user}</td>
                  <td className="px-2 py-2">
                      <input
                        className="border px-1 py-0.5 rounded w-full"
                        defaultValue={log.comment || ''}
                        onBlur={e => handleCommentBlur(log.id, e.target.value)}
                      />
                  </td>
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

export default ActivityView;
