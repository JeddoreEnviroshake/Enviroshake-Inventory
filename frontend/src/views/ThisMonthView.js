import React from "react";

const ThisMonthView = ({ rawMaterials, warehouseInventory, activityHistory, qcInventory = [] }) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const receivedThisMonth = rawMaterials
    .filter(item => {
      const date = new Date(item.dateReceived);
      return date.getMonth() === month && date.getFullYear() === year;
    })
    .reduce((sum, item) => sum + item.startingWeight, 0);

  const consumedThisMonth = activityHistory
    .filter(activity => {
      if (activity.action !== 'End Weight Recorded') return false;
      const date = new Date(activity.timestamp);
      return date.getMonth() === month && date.getFullYear() === year;
    })
    .reduce((sum, activity) => {
      const oldVal = parseFloat(activity.oldValue ?? 0);
      const newVal = parseFloat(activity.newValue ?? oldVal);
      const used = oldVal - newVal;
      return sum + (isNaN(used) ? 0 : used);
    }, 0);

  const spillageLogs = activityHistory.filter(a => {
    if (a.action !== 'End Weight') return false;
    const d = new Date(a.timestamp);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const spillageEntries = spillageLogs.map(log => ({
    id: log.id,
    timestamp: log.timestamp,
    user: log.user,
    lbs: parseFloat(log.formData?.estimatedSpillage) || 0,
    description: `Spillage - ${log.formData?.barcode || ''}`
  }));

  const disposalLabelMap = {
    matilda: 'Matilda',
    grinder: 'Grinder',
    magnet: 'Magnet',
    purges: 'Purges',
    others: 'Others',
    line1: 'Line 1',
    line2: 'Line 2'
  };

  const leadHandLogs = activityHistory.filter(log => {
    if (log.action !== 'Lead Hand Log') return false;
    const d = new Date(log.timestamp);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const leadHandEntries = [];
  leadHandLogs.forEach(log => {
    let disposalData = {};
    try {
      disposalData = JSON.parse(log.formData?.disposal || '{}');
    } catch (_) {
      disposalData = {};
    }
    Object.entries(disposalData).forEach(([key, val]) => {
      const lbs = parseFloat(val);
      if (lbs) {
        leadHandEntries.push({
          id: `${log.id}-${key}`,
          timestamp: log.timestamp,
          user: log.user,
          lbs,
          description: `${disposalLabelMap[key] || key}`
        });
      }
    });
  });

  const qcEntries = qcInventory
    .filter(item => {
      if (item.stage !== 'Disposal') return false;
      const d = new Date(item.dateCreated);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .map(item => {
      const factor =
        item.product === 'Enviroslate' ? 13 * 2.1 : 13 * 2;
      const lbs = item.numberOfBundles * factor;
      return {
        id: item.id,
        timestamp: item.dateCreated,
        user: 'Quality Control',
        lbs,
        description: `${item.product} - ${item.colour} (${item.type})`
      };
    });

  const disposalActivities = [...spillageEntries, ...leadHandEntries, ...qcEntries].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const totalDisposal = disposalActivities.reduce(
    (sum, a) => sum + (isNaN(a.lbs) ? 0 : a.lbs),
    0
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">This Month</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Raw Materials Received</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{receivedThisMonth.toLocaleString()} lbs</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Raw Materials Consumed</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{consumedThisMonth.toLocaleString()} lbs</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Disposal</h3>
            <span className="text-lg font-semibold text-blue-600">{totalDisposal.toLocaleString()} lbs</span>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {disposalActivities.map(act => (
              <div key={act.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{act.description}</p>
                    <p className="text-sm text-gray-600 mt-1">{act.lbs.toLocaleString()} lbs</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{act.timestamp}</p>
                    <p className="text-xs text-gray-400">{act.user}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThisMonthView;
