import React from "react";
import Aurora from "../components/Aurora";
const DashboardView = ({ rawMaterials, warehouseInventory, activityHistory, settings, setCurrentView }) => {
  const totalRawMaterialWeight = rawMaterials.reduce((sum, item) => sum + item.currentWeight, 0);
  // Calculate total weight received for the current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const totalWeightReceivedThisMonth = rawMaterials
    .filter(item => {
      const date = new Date(item.dateReceived);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, item) => sum + item.startingWeight, 0);

  const totalWeightConsumedThisMonth = activityHistory
    .filter(activity => {
      if (activity.action !== 'Material Used') return false;
      const date = new Date(activity.timestamp);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, activity) => {
      const match = activity.details.match(/Used:\s*([\d,.]+)/i);
      const used = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
      return sum + used;
    }, 0);
  const totalByMaterial = rawMaterials.reduce((acc, item) => {
    acc[item.rawMaterial] = (acc[item.rawMaterial] || 0) + item.currentWeight;
    return acc;
  }, {});
  const lowStockRawMaterials = Object.entries(totalByMaterial)
    .filter(([name, weight]) => {
      const minQty = settings.rawMaterialValues?.[name]?.minQuantity || 0;
      return weight < minQty;
    })
    .map(([name, weight]) => ({ rawMaterial: name, totalWeight: weight }));
  const totalFinishedGoods = warehouseInventory.reduce((sum, item) => sum + item.numberOfBundles, 0);
  const recentActivities = activityHistory.slice(0, 5);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => setCurrentView('rawMaterials')}>
          <h3 className="text-sm font-medium text-gray-500">Raw Materials</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalRawMaterialWeight.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Total lbs available</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
             onClick={() => setCurrentView('warehouse')}>
          <h3 className="text-sm font-medium text-gray-500">Finished Goods</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalFinishedGoods.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Total bundles</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{lowStockRawMaterials.length}</p>
          <p className="text-sm text-gray-600 mt-1">Materials need reorder</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Received</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalWeightReceivedThisMonth.toLocaleString()} lbs</p>
          <p className="text-sm text-gray-600 mt-1">of raw materials this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Consumed</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalWeightConsumedThisMonth.toLocaleString()} lbs</p>
          <p className="text-sm text-gray-600 mt-1">of raw materials this month</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {recentActivities.map(activity => (
              <div key={activity.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    <p className="text-xs text-gray-400">{activity.user}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockRawMaterials.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Materials</h3>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {lowStockRawMaterials.map(material => (
                <div key={material.rawMaterial} className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-900">{material.rawMaterial}</p>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">{material.totalWeight.toLocaleString()} lbs</p>
                      <p className="text-xs text-gray-500">
                        Min: {(settings.rawMaterialValues?.[material.rawMaterial]?.minQuantity || 0).toLocaleString()} lbs
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 h-40">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
    </div>
  );
};

export default DashboardView;
