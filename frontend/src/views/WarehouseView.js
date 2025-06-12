import React, { useState } from "react";
import { PRODUCTS, WAREHOUSES, TYPES, STAGES } from "../constants";
const WarehouseView = ({
  inventory,
  allInventory,
  selectedWarehouse = 'All',
  setSelectedWarehouse = () => {},
  selectedStage,
  setSelectedStage,
  updateWarehouseItem,
  deleteWarehouseItem,
  splitWarehouseItem,
  transferWarehouseItem,
  settings,
  openAlert,
  title = 'Warehouse Inventory',
  stageOptions = STAGES,
  showWarehouseFilter = true,
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitItemId, setSplitItemId] = useState(null);
  const [splitQuantity, setSplitQuantity] = useState(1);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferQuantity, setTransferQuantity] = useState(1);
  const [originalWarehouse, setOriginalWarehouse] = useState('');
  const [targetWarehouse, setTargetWarehouse] = useState('');
  const [expanded, setExpanded] = useState({});

  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditFormData(item);
    setOriginalWarehouse(item.warehouse);
  };

  const saveEdit = () => {
    const originalData = inventory.find(i => i.id === editingItem);
    
    // Check if warehouse was changed
    if (editFormData.warehouse !== originalWarehouse) {
      setTargetWarehouse(editFormData.warehouse);
      setTransferQuantity(editFormData.numberOfBundles);
      setShowTransferModal(true);
      return;
    }
    
    updateWarehouseItem(editingItem, editFormData, originalData);
    setEditingItem(null);
    setEditFormData({});
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const confirmTransfer = () => {
    const originalData = inventory.find(i => i.id === editingItem);
    
    // Validation: Check if trying to transfer more than available
    if (transferQuantity > originalData.numberOfBundles) {
      openAlert(`Cannot move more bundles than available. Current quantity: ${originalData.numberOfBundles} bundles`);
      return;
    }
    
    // Validation: Check minimum transfer
    if (transferQuantity < 1) {
      openAlert('Transfer quantity must be at least 1');
      return;
    }
    
    // Use the new transferWarehouseItem function to handle both full and partial transfers
    transferWarehouseItem(editingItem, transferQuantity, targetWarehouse);
    
    // Close modal and reset
    setShowTransferModal(false);
    setEditingItem(null);
    setEditFormData({});
    setTransferQuantity(1);
    setOriginalWarehouse('');
    setTargetWarehouse('');
  };

  const cancelTransfer = () => {
    setShowTransferModal(false);
    // Reset warehouse to original
    setEditFormData({...editFormData, warehouse: originalWarehouse});
  };

  const handleSplit = (item) => {
    if (item.numberOfBundles <= 1) {
      openAlert('Cannot split items with 1 or fewer bundles');
      return;
    }
    setSplitItemId(item.id);
    setSplitQuantity(1);
    setShowSplitModal(true);
  };

  const confirmSplit = () => {
    const item = inventory.find(i => i.id === splitItemId);
    if (splitQuantity >= item.numberOfBundles) {
      openAlert('Split quantity must be less than current quantity');
      return;
    }
    if (splitQuantity < 1) {
      openAlert('Split quantity must be at least 1');
      return;
    }
    
    splitWarehouseItem(splitItemId, splitQuantity);
    setShowSplitModal(false);
    setSplitItemId(null);
    setSplitQuantity(1);
  };

  // Group inventory by product then colour
  const groupedByProduct = PRODUCTS.reduce((acc, p) => {
    acc[p] = {};
    return acc;
  }, {});

  inventory.forEach(item => {
    if (!groupedByProduct[item.product]) groupedByProduct[item.product] = {};
    if (!groupedByProduct[item.product][item.colour]) {
      groupedByProduct[item.product][item.colour] = [];
    }
    groupedByProduct[item.product][item.colour].push(item);
  });

  const toggleColour = (product, colour) => {
    const key = `${product}-${colour}`;
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate summary for selected warehouse and stage
  const calculateSummary = () => {
    const filteredData = allInventory.filter(
      item =>
        (showWarehouseFilter
          ? selectedWarehouse === 'All' || item.warehouse === selectedWarehouse
          : true) &&
        (selectedStage === 'All' || item.stage === selectedStage)
    );

    const summary = {};
    PRODUCTS.forEach(product => {
      // Bundles
      const bundleTotal = filteredData
        .filter(item => item.product === product && item.type === 'Bundle')
        .reduce((sum, item) => sum + item.numberOfBundles, 0);
      if (bundleTotal > 0) {
        summary[`${product} Bundles`] = bundleTotal;
      }

      // Caps (group all cap types together)
      const capsTotal = filteredData
        .filter(item => item.product === product && item.type.startsWith('Cap'))
        .reduce((sum, item) => sum + item.numberOfBundles, 0);
      if (capsTotal > 0) {
        summary[`${product} Caps`] = capsTotal;
      }
    });

    return summary;
  };

  const summary = calculateSummary();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>

        <div className="flex items-center gap-4">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Stages</option>
            {stageOptions.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>

          {showWarehouseFilter && (
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Warehouses</option>
              {WAREHOUSES.map(warehouse => (
                <option key={warehouse} value={warehouse}>{warehouse}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {Object.keys(summary).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {(showWarehouseFilter
              ? (selectedWarehouse === 'All' ? 'All Warehouses' : selectedWarehouse) + ' - '
              : '') +
              (selectedStage === 'All' ? 'All Stages' : selectedStage)} Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-2xl font-bold text-blue-600">{value.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{key}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {PRODUCTS.map(product => {
        const colours = groupedByProduct[product] || {};
        const hasRows = Object.values(colours).some(r => r.length > 0);
        if (!hasRows) return null;
        return (
          <div key={product} className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
            <h3 className="text-lg font-semibold text-gray-900 p-4 border-b bg-gray-50">{product}</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
<tbody className="divide-y divide-gray-200">
  {Object.entries(colours)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([colour, rows]) => {
      const totals = rows.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.numberOfBundles;
        return acc;
      }, {});
      const bundleTotal = totals['Bundle'] || 0;
      const capTotal = Object.keys(totals)
        .filter(type => type.startsWith('Cap'))
        .reduce((sum, type) => sum + totals[type], 0);
      const isExpanded = expanded[`${product}-${colour}`];
      return (
        <React.Fragment key={`${product}-${colour}`}>
          {/* "Colour" grouping row */}
          <tr
            onClick={() => toggleColour(product, colour)}
            className="cursor-pointer hover:bg-gray-200"
          >
            {/* colspan = number of <th> = 8 */}
            <td colSpan="8" className="p-3 font-medium">
              <div className="flex justify-between items-center">
                <div className="grid grid-cols-5 w-full">
                  <div>{colour}</div>
                  <div>{bundleTotal > 0 ? `Bundles: ${bundleTotal}` : ''}</div>
                  <div>{capTotal > 0 ? `Caps: ${capTotal}` : ''}</div>
                  <div></div>
                  <div></div>
                </div>
                <span className="ml-4">{isExpanded ? '▼' : '▶'}</span>
              </div>
            </td>
          </tr>

          {/* Header row for expanded colour */}
          {isExpanded && (
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Colour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number of Bundles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warehouse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          )}

          {/* Expandable detail rows for just this product + this colour */}
          {isExpanded &&
            rows
              .slice()
              .sort((a, b) => TYPES.indexOf(a.type) - TYPES.indexOf(b.type))
              .map(item => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              {editingItem === item.id ? (
                <select
                  value={editFormData.colour}
                  onChange={e =>
                    setEditFormData({ ...editFormData, colour: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                    {settings.colors
                      .slice()
                      .sort((a, b) => a.localeCompare(b))
                      .map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                </select>
              ) : (
                <span className="text-gray-900">{item.colour}</span>
              )}
            </td>
            <td className="px-6 py-4">
              <span className="font-mono text-sm text-blue-600">
                {item.productId}
              </span>
            </td>
            <td className="px-6 py-4">
              {editingItem === item.id ? (
                <select
                  value={editFormData.type}
                  onChange={e =>
                    setEditFormData({ ...editFormData, type: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-900">{item.type}</span>
              )}
            </td>
            <td className="px-6 py-4">
              {editingItem === item.id ? (
                <select
                  value={editFormData.stage}
                  onChange={e =>
                    setEditFormData({ ...editFormData, stage: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {stageOptions.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.stage === 'Allocated' || item.stage === 'Pass'
                      ? 'bg-green-100 text-green-800'
                      : item.stage === 'Open' || item.stage === 'Pending Review'
                      ? 'bg-blue-100 text-blue-800'
                      : item.stage === 'Released' || item.stage === 'Quarantine'
                      ? 'bg-yellow-100 text-yellow-800'
                      : item.stage === 'Staged' || item.stage === 'Add to Regrind in Queue'
                      ? 'bg-purple-100 text-purple-800'
                      : item.stage === 'Disposal'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.stage}
                </span>
              )}
            </td>
            <td className="px-6 py-4">
              {editingItem === item.id ? (
                <input
                  type="date"
                  value={editFormData.dateCreated}
                  onChange={e =>
                    setEditFormData({ ...editFormData, dateCreated: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              ) : (
                <span className="text-gray-900">{item.dateCreated}</span>
              )}
            </td>
            <td className="px-6 py-4">
              {editingItem === item.id ? (
                <input
                  type="number"
                  value={editFormData.numberOfBundles}
                  onChange={e =>
                    setEditFormData({
                      ...editFormData,
                      numberOfBundles: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              ) : (
                <span className="font-medium">{item.numberOfBundles}</span>
              )}
            </td>
            <td className="px-6 py-4">
              {editingItem === item.id ? (
                <select
                  value={editFormData.warehouse}
                  onChange={e =>
                    setEditFormData({ ...editFormData, warehouse: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {WAREHOUSES.map(w => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-900">{item.warehouse}</span>
              )}
            </td>
            <td className="px-6 py-4">
              {editingItem === item.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setEditFormData({});
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSplit(item)}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                    disabled={item.numberOfBundles <= 1}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Are you sure you want to delete this inventory item?'
                        )
                      ) {
                        deleteWarehouseItem(item.id);
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
        ))}
    </React.Fragment>
  );
})
      }
</tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Split Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-6">Split Inventory Item</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many bundles do you want to split off?
              </label>
              <input
                type="number"
                min="1"
                max={inventory.find(i => i.id === splitItemId)?.numberOfBundles - 1 || 1}
                value={splitQuantity}
                onChange={(e) => setSplitQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                Current quantity: {inventory.find(i => i.id === splitItemId)?.numberOfBundles} bundles
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSplit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Split
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-6">Transfer Inventory</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-4">
                You are changing the warehouse location from <strong>{originalWarehouse}</strong> to <strong>{targetWarehouse}</strong>. 
                {transferQuantity < editFormData.numberOfBundles ? 
                  ` ${transferQuantity} bundles will be transferred to ${targetWarehouse}, and ${editFormData.numberOfBundles - transferQuantity} bundles will remain in ${originalWarehouse}.` :
                  ` All bundles will be moved to ${targetWarehouse}.`
                }
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of bundles to transfer:
              </label>
              <input
                type="number"
                min="1"
                max={editFormData.numberOfBundles || 1}
                value={transferQuantity}
                onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                Current quantity: {editFormData.numberOfBundles} bundles (Maximum transferable)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelTransfer}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseView;
