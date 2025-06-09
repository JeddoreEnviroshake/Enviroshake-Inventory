import React from "react";

const ThisMonthView = ({ rawMaterials, warehouseInventory, activityHistory }) => {
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
    </div>
  );
};

export default ThisMonthView;
