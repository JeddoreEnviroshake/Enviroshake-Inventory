import React from "react";

const getTotals = (logs) => {
  return logs.reduce(
    (acc, log) => {
      const data = log.formData || {};
      const line1Production = parseInt(data.line1Production) || 0;
      const line1Scrap = parseInt(data.line1Scrap) || 0;
      const line2Production = parseInt(data.line2Production) || 0;
      const line2Scrap = parseInt(data.line2Scrap) || 0;
      let bundles = 0;
      try {
        const arr = JSON.parse(data.bundles || '[]');
        bundles = arr.reduce(
          (sum, b) => sum + (parseInt(b.numberOfBundles) || 0),
          0
        );
      } catch (_) {
        // ignore parsing errors
      }
      let batches = 0;
      try {
        const arr = JSON.parse(data.batches || '[]');
        batches = arr.reduce(
          (sum, b) => sum + (parseInt(b.batchesMade) || 0),
          0
        );
      } catch (_) {
        // ignore parsing errors
      }

      acc.bundles += bundles;
      acc.batches += batches;
      acc.line1Production += line1Production;
      acc.line1Scrap += line1Scrap;
      acc.line2Production += line2Production;
      acc.line2Scrap += line2Scrap;
      return acc;
    },
    {
      bundles: 0,
      batches: 0,
      line1Production: 0,
      line1Scrap: 0,
      line2Production: 0,
      line2Scrap: 0,
    }
  );
};

const DailyProductionSummaryView = ({ activityHistory }) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const leadHandLogs = (activityHistory || []).filter((log) => {
    if (log.action !== 'Lead Hand Log') return false;
    const date = new Date(log.timestamp);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  const totals = getTotals(leadHandLogs);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Daily Production Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Batches Made</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totals.batches}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Number of Bundles</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totals.bundles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Line 1 Production</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totals.line1Production}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Line 1 Scrap</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totals.line1Scrap}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Line 2 Production</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totals.line2Production}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Line 2 Scrap</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totals.line2Scrap}</p>
        </div>
      </div>
    </div>
  );
};

export default DailyProductionSummaryView;
