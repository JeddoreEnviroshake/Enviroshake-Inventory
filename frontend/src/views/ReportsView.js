import React, { useState } from "react";
const ReportsView = ({ rawMaterials, warehouseInventory, activityHistory }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  // CSV Export function
  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filter activities by date range and type
  const getFilteredActivities = (type) => {
    return activityHistory.filter(activity => {
      const activityDate = activity.timestamp.split(' ')[0];
      const activityDateTime = new Date(activityDate);
      const startDateTime = new Date(dateRange.startDate);
      const endDateTime = new Date(dateRange.endDate);
      
      const isInDateRange = activityDateTime >= startDateTime && activityDateTime <= endDateTime;
      
      switch(type) {
        case 'Receiving':
          return isInDateRange && activity.action === 'Raw Material Received';
        case 'Using':
          return isInDateRange && activity.action === 'Material Used';
        case 'Lead Hand Log':
          return isInDateRange && activity.action === 'Production Added';
        default:
          return isInDateRange;
      }
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Reports</h2>
      
      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* CSV Export Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => exportToCSV(
              rawMaterials,
              'raw_materials.csv',
              ['barcode', 'poNumber', 'rawMaterial', 'vendor', 'startingWeight', 'currentWeight', 'bagsAvailable', 'dateCreated', 'lastUsed']
            )}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            📊 Export Raw Materials
          </button>
          <button
            onClick={() => exportToCSV(
              warehouseInventory,
              'warehouse_inventory.csv',
              ['productId', 'product', 'colour', 'type', 'stage', 'numberOfBundles', 'warehouse', 'dateCreated']
            )}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🏭 Export Warehouse
          </button>
          <button
            onClick={() => exportToCSV(
              activityHistory,
              'activity_history.csv',
              ['timestamp', 'action', 'details', 'user']
            )}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            📋 Export Activity
          </button>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['Receiving', 'Using', 'Lead Hand Log'].map(type => {
          const activities = getFilteredActivities(type);
          return (
            <div key={type} className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{type} Summary</h4>
              <p className="text-3xl font-bold text-blue-600 mb-2">{activities.length}</p>
              <p className="text-sm text-gray-600 mb-4">Total activities in date range</p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="text-sm">
                    <div className="font-medium text-gray-900">{activity.timestamp.split(' ')[0]}</div>
                    <div className="text-gray-600 truncate">{activity.details}</div>
                  </div>
                ))}
                {activities.length > 5 && (
                  <div className="text-sm text-gray-500">...and {activities.length - 5} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsView;
