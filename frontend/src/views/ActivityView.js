import React from "react";
const ActivityView = ({ activityHistory }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Activity History</h2>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes / Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activityHistory.map(activity => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{activity.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{activity.itemId || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {activity.changes ? (
                      <ul className="list-disc pl-4">
                        {Object.entries(activity.changes).map(([field, value]) => (
                          <li key={field}>
                            {field}: "{value.from}" → "{value.to}"
                          </li>
                        ))}
                      </ul>
                    ) : (
                      activity.details
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{activity.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ActivityView;
