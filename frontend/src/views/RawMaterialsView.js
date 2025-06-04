import React, { useState } from "react";
import { generateCode39Barcode, renderBarcodeSVG } from "../utils/barcode";
const RawMaterialsView = ({ rawMaterials, updateRawMaterial, deleteRawMaterial, settings }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [printingItem, setPrintingItem] = useState(null);
  const [expanded, setExpanded] = useState({});

  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditFormData(item);
  };

  const saveEdit = () => {
    const originalData = rawMaterials.find(r => r.id === editingItem);
    updateRawMaterial(editingItem, editFormData, originalData);
    setEditingItem(null);
    setEditFormData({});
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const printLabel = (material) => {
    setPrintingItem(material);
    // Use setTimeout to ensure state is set before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getStatusInfo = (material) => {
    const percentage = (material.currentWeight / material.startingWeight);
    if (percentage < settings.lowStockAlertLevel) {
      return { status: 'Low Stock', color: 'bg-red-100 text-red-800' };
    } else if (percentage < 0.5) {
      return { status: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'Good', color: 'bg-green-100 text-green-800' };
    }
  };

  const groupedByMaterial = rawMaterials.reduce((acc, item) => {
    if (!acc[item.rawMaterial]) acc[item.rawMaterial] = [];
    acc[item.rawMaterial].push(item);
    return acc;
  }, {});

  const toggleMaterial = (name) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Raw Material Inventory</h2>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              {Object.entries(groupedByMaterial)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([materialName, rows]) => {
                  const totalWeight = rows.reduce((sum, r) => sum + r.currentWeight, 0);
                  const totalBags = rows.reduce((sum, r) => sum + r.bagsAvailable, 0);
                  const isExpanded = expanded[materialName];
                  return (
                    <React.Fragment key={materialName}>
                      <tr
                        onClick={() => toggleMaterial(materialName)}
                        className="cursor-pointer hover:bg-gray-200"
                      >
                        <td colSpan="11" className="p-3 font-medium">
                          <div className="flex justify-between items-center">
                            <div className="grid grid-cols-3 w-full">
                              <div>{materialName}</div>
                              <div>{`Total Weight: ${totalWeight.toLocaleString()} lbs`}</div>
                              <div>{`Bags: ${totalBags}`}</div>
                            </div>
                            <span className="ml-4">{isExpanded ? '▼' : '▶'}</span>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Material</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starting Weight</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Weight</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bags Available</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      )}

                      {isExpanded &&
                        rows.map(material => {
                          const statusInfo = getStatusInfo(material);
                          return (
                            <tr key={material.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm">{material.barcode}</span>
                              </td>
                              <td className="px-6 py-4">
                                {editingItem === material.id ? (
                                  <input
                                    type="text"
                                    value={editFormData.poNumber}
                                    onChange={(e) => setEditFormData({ ...editFormData, poNumber: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-gray-900">{material.poNumber}</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {editingItem === material.id ? (
                                  <select
                                    value={editFormData.rawMaterial}
                                    onChange={(e) => setEditFormData({ ...editFormData, rawMaterial: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    {settings.rawMaterials
                                      .slice()
                                      .sort((a, b) => a.localeCompare(b))
                                      .map(rm => (
                                        <option key={rm} value={rm}>{rm}</option>
                                      ))}
                                  </select>
                                ) : (
                                  <span className="font-medium text-gray-900">{material.rawMaterial}</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {editingItem === material.id ? (
                                  <select
                                    value={editFormData.vendor}
                                    onChange={(e) => setEditFormData({ ...editFormData, vendor: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    {settings.vendors
                                      .slice()
                                      .sort((a, b) => a.localeCompare(b))
                                      .map(vendor => (
                                        <option key={vendor} value={vendor}>{vendor}</option>
                                      ))}
                                  </select>
                                ) : (
                                  <span className="text-gray-900">{material.vendor}</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {editingItem === material.id ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editFormData.startingWeight}
                                    onChange={(e) => setEditFormData({ ...editFormData, startingWeight: parseFloat(e.target.value) })}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-gray-900">{material.startingWeight.toLocaleString()} lbs</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {editingItem === material.id ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editFormData.currentWeight}
                                    onChange={(e) => setEditFormData({ ...editFormData, currentWeight: parseFloat(e.target.value) })}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-gray-900">{material.currentWeight.toLocaleString()} lbs</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {editingItem === material.id ? (
                                  <input
                                    type="number"
                                    value={editFormData.bagsAvailable}
                                    onChange={(e) => setEditFormData({ ...editFormData, bagsAvailable: parseInt(e.target.value) })}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-gray-900">{material.bagsAvailable}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-gray-900">{material.dateCreated}</td>
                              <td className="px-6 py-4 text-gray-900">{material.lastUsed || 'Never'}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  {statusInfo.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {editingItem === material.id ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={saveEdit}
                                      className="text-green-600 hover:text-green-800 text-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => startEdit(material)}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => printLabel(material)}
                                      className="text-green-600 hover:text-green-800 text-sm"
                                    >
                                      Print
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this raw material?')) {
                                          deleteRawMaterial(material.id);
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Print Label for Raw Materials */}
      {printingItem && (
        <div className="print-only-label" style={{ display: 'none' }}>
          <div className="zebra-label">
            <div className="text-center mb-4">
              <h4 className="font-bold text-xl">Enviroshake</h4>
              <p className="text-sm text-gray-700">Raw Material Inventory Label</p>
            </div>
            
            <div className="label-content space-y-3 text-base">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Material:</strong><br />
                  <span className="material-name">{printingItem.rawMaterial}</span>
                </div>
                <div>
                  <strong>Vendor:</strong><br />
                  <span className="vendor-name">{printingItem.vendor}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>PO Number:</strong><br />
                  <span className="po-number">{printingItem.poNumber}</span>
                </div>
                <div>
                  <strong>Date Received:</strong><br />
                  <span className="date-received">{printingItem.dateReceived}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Bags Received:</strong><br />
                  <span className="bags-count">{printingItem.bagsReceived}</span>
                </div>
                <div>
                  <strong>Weight (lbs):</strong><br />
                  <span className="weight-received">{printingItem.startingWeight.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center barcode-section">
              <div className="bg-white p-3 border-2 border-black inline-block">
                {renderBarcodeSVG(generateCode39Barcode(printingItem.barcode), 250, 60)}
                <div className="barcode-text font-mono text-sm font-bold mt-2">{printingItem.barcode}</div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-600">
              <p>Scan barcode for material tracking and usage logging</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterialsView;
