import React, { useState, useEffect } from 'react';
import './App.css';

// Initial configuration values
const initialSettings = {
  lowStockAlertLevel: 0.2, // 20% of starting weight
  rawMaterials: [
    'PP EFS', 'PP Clear Co-Polymer', 'PP White', 'PE EFS', 'PE Clear', 'PE White', 
    'LXR', 'Rubber Crumb', 'Colour Masterbatch', 'PP EFS - HMF', 'Microingredients', 
    'Wax', 'AC MB CR20050', 'SC MB CR20060', 'Carbon Black MB CB84002', 
    'Cool Roof MB CSC 10030', 'TSL/CR CSC 10050', 'TSL MB CR20062', 
    'Disney Brown MB CR20080', 'FR78070PP', 'PP Co-Polymer Virgin', 'Wood Fiber'
  ],
  vendors: ['EFS Plastics', 'SM Polymers', 'Kraton', 'CRM Canada', 'Polyten', 'AWF']
};

const PRODUCTS = ['Enviroshake', 'Enviroslate', 'Enviroshingle'];
const WAREHOUSES = ['Dresden', 'BC', 'Buffalo'];
const TYPES = ['Bundle', 'Cap'];

// Generate unique product ID
const generateProductId = () => {
  return 'PID' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
};

// Mock initial data
const initialRawMaterials = [
  {
    id: 1,
    barcode: 'BAR001PO5691',
    poNumber: '5691',
    rawMaterial: 'PP EFS',
    vendor: 'EFS Plastics',
    bagsReceived: 6,
    startingWeight: 9259,
    currentWeight: 8100,
    dateReceived: '2024-12-15',
    bagsAvailable: 5
  },
  {
    id: 2,
    barcode: 'BAR002PO5692',
    poNumber: '5692',
    rawMaterial: 'Wood Fiber',
    vendor: 'AWF',
    bagsReceived: 4,
    startingWeight: 3200,
    currentWeight: 3200,
    dateReceived: '2024-12-14',
    bagsAvailable: 4
  }
];

const initialWarehouseInventory = [
  {
    id: 1,
    productId: 'PID001ABC',
    product: 'Enviroshake',
    colour: 'Weathered Wood',
    type: 'Bundle',
    dateCreated: '2024-12-15',
    numberOfBundles: 25,
    warehouse: 'Dresden'
  },
  {
    id: 2,
    productId: 'PID002DEF',
    product: 'Enviroslate',
    colour: 'Charcoal',
    type: 'Bundle',
    dateCreated: '2024-12-14',
    numberOfBundles: 18,
    warehouse: 'BC'
  }
];

const initialActivityHistory = [
  {
    id: 1,
    timestamp: '2024-12-15 14:30:25',
    action: 'Raw Material Received',
    details: 'PO: 5691, PP EFS, 6 bags, 9,259 lbs',
    user: 'Purchasing Manager'
  },
  {
    id: 2,
    timestamp: '2024-12-15 15:45:12',
    action: 'Material Used',
    details: 'Barcode: BAR001PO5691, Used: 1159 lbs',
    user: 'Lead Hand - John Smith'
  }
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [settings, setSettings] = useState(initialSettings);
  const [rawMaterials, setRawMaterials] = useState(initialRawMaterials);
  const [warehouseInventory, setWarehouseInventory] = useState(initialWarehouseInventory);
  const [activityHistory, setActivityHistory] = useState(initialActivityHistory);
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');

  // Add activity log entry with enhanced details
  const addActivity = (action, details, user = 'System') => {
    const newActivity = {
      id: Math.max(...activityHistory.map(a => a.id), 0) + 1,
      timestamp: new Date().toLocaleString(),
      action,
      details,
      user
    };
    setActivityHistory([newActivity, ...activityHistory]);
  };

  // Enhanced activity logging for edits
  const addEditActivity = (action, itemId, changes, user = 'System') => {
    const changeDetails = Object.entries(changes)
      .map(([field, {from, to}]) => `${field}: "${from}" → "${to}"`)
      .join(', ');
    
    addActivity(action, `${itemId} - ${changeDetails}`, user);
  };

  // Generate barcode
  const generateBarcode = (poNumber, rawMaterial) => {
    const timestamp = Date.now().toString().slice(-4);
    return `BAR${timestamp}PO${poNumber}`;
  };

  // Add raw material (Receiving)
  const addRawMaterial = (materialData) => {
    const barcode = generateBarcode(materialData.poNumber, materialData.rawMaterial);
    const newMaterial = {
      ...materialData,
      id: Math.max(...rawMaterials.map(r => r.id), 0) + 1,
      barcode,
      currentWeight: materialData.startingWeight,
      dateReceived: new Date().toISOString().split('T')[0],
      bagsAvailable: materialData.bagsReceived
    };
    
    setRawMaterials([...rawMaterials, newMaterial]);
    addActivity(
      'Raw Material Received',
      `PO: ${materialData.poNumber}, ${materialData.rawMaterial}, ${materialData.bagsReceived} bags, ${materialData.startingWeight.toLocaleString()} lbs`,
      'Purchasing Manager'
    );
    
    return barcode;
  };

  // Update raw material
  const updateRawMaterial = (id, updatedData, originalData) => {
    setRawMaterials(materials =>
      materials.map(material => 
        material.id === id ? { ...material, ...updatedData } : material
      )
    );

    // Track changes for activity log
    const changes = {};
    Object.keys(updatedData).forEach(key => {
      if (originalData[key] !== updatedData[key]) {
        changes[key] = { from: originalData[key], to: updatedData[key] };
      }
    });

    if (Object.keys(changes).length > 0) {
      addEditActivity(
        'Raw Material Updated',
        `Barcode: ${originalData.barcode}`,
        changes,
        'Inventory Manager'
      );
    }
  };

  // Use raw material
  const useRawMaterial = (usageData) => {
    const weightUsed = usageData.weightIn - usageData.weightOut - (usageData.estimatedSpillage || 0);
    
    setRawMaterials(materials => 
      materials.map(material => {
        if (material.barcode === usageData.barcode) {
          const newWeight = Math.max(0, material.currentWeight - weightUsed);
          const newBags = newWeight === 0 ? 0 : material.bagsAvailable - 1;
          
          return {
            ...material,
            currentWeight: newWeight,
            bagsAvailable: Math.max(0, newBags)
          };
        }
        return material;
      })
    );

    addActivity(
      'Material Used',
      `Barcode: ${usageData.barcode}, Used: ${weightUsed.toFixed(1)} lbs, Spillage: ${usageData.estimatedSpillage || 0} lbs`,
      `Lead Hand - ${usageData.leadHandName}`
    );
  };

  // Add production (Lead Hand Log)
  const addProduction = (productionData) => {
    const productId = generateProductId();
    const newProduction = {
      ...productionData,
      id: Math.max(...warehouseInventory.map(w => w.id), 0) + 1,
      productId,
      dateCreated: new Date().toISOString().split('T')[0],
      warehouse: 'Dresden' // All production starts in Dresden
    };

    setWarehouseInventory([...warehouseInventory, newProduction]);
    addActivity(
      'Production Added',
      `Product ID: ${productId}, ${productionData.product} - ${productionData.colour} (${productionData.type}), ${productionData.numberOfBundles} bundles`,
      'Lead Hand'
    );
  };

  // Update warehouse inventory with enhanced logging
  const updateWarehouseItem = (id, updatedData, originalData) => {
    setWarehouseInventory(inventory =>
      inventory.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      )
    );

    // Track changes for activity log
    const changes = {};
    Object.keys(updatedData).forEach(key => {
      if (originalData[key] !== updatedData[key]) {
        changes[key] = { from: originalData[key], to: updatedData[key] };
      }
    });

    if (Object.keys(changes).length > 0) {
      addEditActivity(
        'Warehouse Item Updated',
        `Product ID: ${originalData.productId}`,
        changes,
        'Warehouse Manager'
      );
    }
  };

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    addActivity(
      'Settings Updated',
      'System configuration updated',
      'Administrator'
    );
  };

  // Filter warehouse inventory by selected warehouse
  const filteredWarehouseInventory = selectedWarehouse === 'All' 
    ? warehouseInventory 
    : warehouseInventory.filter(item => item.warehouse === selectedWarehouse);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">Enviroshake</h1>
          <p className="text-sm text-gray-300 mt-1">Inventory Tracking System</p>
        </div>
        
        <nav className="mt-8">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full text-left px-6 py-3 hover:bg-slate-800 transition-colors ${
              currentView === 'dashboard' ? 'bg-slate-800 border-r-2 border-blue-400' : ''
            }`}
          >
            📊 Dashboard
          </button>
          
          <div className="mt-6 px-6">
            <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-3">Operations</h3>
            
            <button
              onClick={() => setCurrentView('receiving')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                currentView === 'receiving' ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              📦 Receiving
            </button>
            
            <button
              onClick={() => setCurrentView('using')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                currentView === 'using' ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              🔧 Using
            </button>
            
            <button
              onClick={() => setCurrentView('production')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                currentView === 'production' ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              📝 Lead Hand Log
            </button>
          </div>

          <div className="mt-6 px-6">
            <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-3">Inventory</h3>
            
            <button
              onClick={() => setCurrentView('rawMaterials')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                currentView === 'rawMaterials' ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              🧱 Raw Materials
            </button>
            
            <button
              onClick={() => setCurrentView('warehouse')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                currentView === 'warehouse' ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              🏭 Warehouse
            </button>
          </div>

          <div className="mt-6 px-6">
            <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-3">System</h3>
            
            <button
              onClick={() => setCurrentView('activity')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                currentView === 'activity' ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              📋 Activity History
            </button>
            
            <button
              onClick={() => setCurrentView('settings')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                currentView === 'settings' ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {currentView === 'dashboard' && (
          <DashboardView 
            rawMaterials={rawMaterials}
            warehouseInventory={warehouseInventory}
            activityHistory={activityHistory}
            settings={settings}
            setCurrentView={setCurrentView}
          />
        )}
        
        {currentView === 'receiving' && (
          <ReceivingView addRawMaterial={addRawMaterial} settings={settings} />
        )}
        
        {currentView === 'using' && (
          <UsingView rawMaterials={rawMaterials} useRawMaterial={useRawMaterial} />
        )}
        
        {currentView === 'production' && (
          <ProductionView addProduction={addProduction} />
        )}
        
        {currentView === 'rawMaterials' && (
          <RawMaterialsView 
            rawMaterials={rawMaterials} 
            updateRawMaterial={updateRawMaterial}
            settings={settings}
          />
        )}
        
        {currentView === 'warehouse' && (
          <WarehouseView 
            inventory={filteredWarehouseInventory}
            selectedWarehouse={selectedWarehouse}
            setSelectedWarehouse={setSelectedWarehouse}
            updateWarehouseItem={updateWarehouseItem}
          />
        )}
        
        {currentView === 'activity' && (
          <ActivityView activityHistory={activityHistory} />
        )}

        {currentView === 'settings' && (
          <SettingsView settings={settings} updateSettings={updateSettings} />
        )}
      </div>
    </div>
  );
}

// Dashboard View Component
const DashboardView = ({ rawMaterials, warehouseInventory, activityHistory, settings, setCurrentView }) => {
  const totalRawMaterialWeight = rawMaterials.reduce((sum, item) => sum + item.currentWeight, 0);
  const lowStockRawMaterials = rawMaterials.filter(item => 
    item.currentWeight < (item.startingWeight * settings.lowStockAlertLevel)
  );
  const totalFinishedGoods = warehouseInventory.reduce((sum, item) => sum + item.numberOfBundles, 0);
  const recentActivities = activityHistory.slice(0, 5);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <h3 className="text-sm font-medium text-gray-500">Active Materials</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{rawMaterials.length}</p>
          <p className="text-sm text-gray-600 mt-1">Different batches</p>
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
                <div key={material.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{material.rawMaterial}</p>
                      <p className="text-sm text-gray-600">PO: {material.poNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">{material.currentWeight.toLocaleString()} lbs</p>
                      <p className="text-xs text-gray-500">{((material.currentWeight / material.startingWeight) * 100).toFixed(1)}% remaining</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings View Component
const SettingsView = ({ settings, updateSettings }) => {
  const [formData, setFormData] = useState(settings);
  const [newRawMaterial, setNewRawMaterial] = useState('');
  const [newVendor, setNewVendor] = useState('');

  // Update formData when settings prop changes
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    alert('Settings saved successfully! Changes will be available immediately.');
  };

  const addRawMaterial = () => {
    if (newRawMaterial.trim() && !formData.rawMaterials.includes(newRawMaterial.trim())) {
      const updatedFormData = {
        ...formData,
        rawMaterials: [...formData.rawMaterials, newRawMaterial.trim()]
      };
      setFormData(updatedFormData);
      updateSettings(updatedFormData); // Immediate update to parent
      setNewRawMaterial('');
    } else if (formData.rawMaterials.includes(newRawMaterial.trim())) {
      alert('This raw material already exists!');
    }
  };

  const removeRawMaterial = (material) => {
    const updatedFormData = {
      ...formData,
      rawMaterials: formData.rawMaterials.filter(m => m !== material)
    };
    setFormData(updatedFormData);
    updateSettings(updatedFormData); // Immediate update to parent
  };

  const addVendor = () => {
    if (newVendor.trim() && !formData.vendors.includes(newVendor.trim())) {
      const updatedFormData = {
        ...formData,
        vendors: [...formData.vendors, newVendor.trim()]
      };
      setFormData(updatedFormData);
      updateSettings(updatedFormData); // Immediate update to parent
      setNewVendor('');
    } else if (formData.vendors.includes(newVendor.trim())) {
      alert('This vendor already exists!');
    }
  };

  const removeVendor = (vendor) => {
    const updatedFormData = {
      ...formData,
      vendors: formData.vendors.filter(v => v !== vendor)
    };
    setFormData(updatedFormData);
    updateSettings(updatedFormData); // Immediate update to parent
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>
      
      <div className="space-y-8">
        {/* Low Stock Alert Level */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Low Stock Alert Level</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert when raw material drops below this percentage of starting weight
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={formData.lowStockAlertLevel}
                onChange={(e) => {
                  const updatedFormData = {...formData, lowStockAlertLevel: parseFloat(e.target.value)};
                  setFormData(updatedFormData);
                  updateSettings(updatedFormData); // Immediate update to parent
                }}
                className="flex-1"
              />
              <span className="text-lg font-medium w-16">
                {(formData.lowStockAlertLevel * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Raw Materials Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Raw Materials</h3>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newRawMaterial}
                onChange={(e) => setNewRawMaterial(e.target.value)}
                placeholder="Add new raw material"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addRawMaterial}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {formData.rawMaterials.map((material, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{material}</span>
                <button
                  onClick={() => removeRawMaterial(material)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Vendors</h3>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
                placeholder="Add new vendor"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addVendor}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {formData.vendors.map((vendor, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{vendor}</span>
                <button
                  onClick={() => removeVendor(vendor)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Receiving View Component
const ReceivingView = ({ addRawMaterial, settings }) => {
  const [formData, setFormData] = useState({
    rawMaterial: '',
    poNumber: '',
    vendor: '',
    bagsReceived: 0,
    startingWeight: 0
  });
  const [showLabel, setShowLabel] = useState(false);
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [labelData, setLabelData] = useState({}); // Store label data separately

  // Reset vendor selection if it's no longer available in settings
  useEffect(() => {
    if (formData.vendor && !settings.vendors.includes(formData.vendor)) {
      setFormData(prev => ({ ...prev, vendor: '' }));
    }
    if (formData.rawMaterial && !settings.rawMaterials.includes(formData.rawMaterial)) {
      setFormData(prev => ({ ...prev, rawMaterial: '' }));
    }
  }, [settings.vendors, settings.rawMaterials, formData.vendor, formData.rawMaterial]);

  // Force component to re-render when settings change
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store label data before form reset
    const currentLabelData = {
      rawMaterial: formData.rawMaterial,
      vendor: formData.vendor,
      poNumber: formData.poNumber,
      bagsReceived: formData.bagsReceived,
      startingWeight: formData.startingWeight,
      dateReceived: new Date().toLocaleDateString()
    };
    
    const barcode = addRawMaterial({
      ...formData,
      bagsReceived: parseInt(formData.bagsReceived),
      startingWeight: parseFloat(formData.startingWeight)
    });
    
    setLabelData(currentLabelData);
    setGeneratedBarcode(barcode);
    setShowLabel(true);
    
    // Reset form
    setFormData({
      rawMaterial: '',
      poNumber: '',
      vendor: '',
      bagsReceived: 0,
      startingWeight: 0
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Receiving</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">Add Raw Material</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raw Material</label>
              <select
                value={formData.rawMaterial}
                onChange={(e) => setFormData({...formData, rawMaterial: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Raw Material</option>
                {settings.rawMaterials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
              <input
                type="text"
                value={formData.poNumber}
                onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5691"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <select
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Vendor</option>
                {settings.vendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bags Received</label>
              <input
                type="number"
                value={formData.bagsReceived}
                onChange={(e) => setFormData({...formData, bagsReceived: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight Received (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={formData.startingWeight}
                onChange={(e) => setFormData({...formData, startingWeight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit & Generate Label
            </button>
          </form>
        </div>

        {/* Label Preview */}
        {showLabel && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Label Preview</h3>
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors no-print"
              >
                🖨️ Print Label
              </button>
            </div>
            
            <div className="zebra-label border-2 border-dashed border-gray-300 p-4 bg-gray-50">
              <div className="text-center mb-4">
                <h4 className="font-bold text-xl">ENVIROSHAKE INC.</h4>
                <p className="text-sm text-gray-700">Raw Material Inventory Label</p>
              </div>
              
              <div className="label-content space-y-3 text-base">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Material:</strong><br />
                    <span className="material-name">{labelData.rawMaterial || 'Not Selected'}</span>
                  </div>
                  <div>
                    <strong>Vendor:</strong><br />
                    <span className="vendor-name">{labelData.vendor || 'Not Selected'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>PO Number:</strong><br />
                    <span className="po-number">{labelData.poNumber || 'Not Entered'}</span>
                  </div>
                  <div>
                    <strong>Date Received:</strong><br />
                    <span className="date-received">{labelData.dateReceived || new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Bags Received:</strong><br />
                    <span className="bags-count">{labelData.bagsReceived || 0}</span>
                  </div>
                  <div>
                    <strong>Weight (lbs):</strong><br />
                    <span className="weight-received">{labelData.startingWeight ? parseFloat(labelData.startingWeight).toLocaleString() : 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center barcode-section">
                <div className="bg-white p-3 border-2 border-black inline-block">
                  <div className="barcode-lines font-mono text-lg mb-2">||||| |||| ||||| |||| |||||</div>
                  <div className="barcode-text font-mono text-sm font-bold">{generatedBarcode || 'BARCODE-PENDING'}</div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-xs text-gray-600">
                <p>Scan barcode for material tracking and usage logging</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Using View Component
const UsingView = ({ rawMaterials, useRawMaterial }) => {
  const [formData, setFormData] = useState({
    barcode: '',
    leadHandName: '',
    weightIn: 0,
    weightOut: 0,
    estimatedSpillage: 0,
    notes: ''
  });
  const [scannedMaterial, setScannedMaterial] = useState(null);

  const handleBarcodeChange = (e) => {
    const barcode = e.target.value;
    setFormData({...formData, barcode});
    
    // Find material by barcode
    const material = rawMaterials.find(m => m.barcode === barcode);
    setScannedMaterial(material);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!scannedMaterial) {
      alert('Please scan a valid barcode');
      return;
    }

    useRawMaterial({
      ...formData,
      weightIn: parseFloat(formData.weightIn),
      weightOut: parseFloat(formData.weightOut),
      estimatedSpillage: parseFloat(formData.estimatedSpillage) || 0
    });

    // Reset form
    setFormData({
      barcode: '',
      leadHandName: '',
      weightIn: 0,
      weightOut: 0,
      estimatedSpillage: 0,
      notes: ''
    });
    setScannedMaterial(null);
    
    alert('Material usage recorded successfully!');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Using Raw Materials</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">Record Material Usage</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scan Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={handleBarcodeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Scan or enter barcode"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Hand Name</label>
              <input
                type="text"
                value={formData.leadHandName}
                onChange={(e) => setFormData({...formData, leadHandName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight In (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weightIn}
                onChange={(e) => setFormData({...formData, weightIn: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight Out (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weightOut}
                onChange={(e) => setFormData({...formData, weightOut: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Spillage (lbs) - Optional</label>
              <input
                type="number"
                step="0.1"
                value={formData.estimatedSpillage}
                onChange={(e) => setFormData({...formData, estimatedSpillage: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes - Optional</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any additional notes..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!scannedMaterial}
            >
              Submit Usage
            </button>
          </form>
        </div>

        {/* Material Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">Scanned Material Info</h3>
          
          {scannedMaterial ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">✓ Material Found</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Raw Material:</strong> {scannedMaterial.rawMaterial}</div>
                  <div><strong>Vendor:</strong> {scannedMaterial.vendor}</div>
                  <div><strong>PO Number:</strong> {scannedMaterial.poNumber}</div>
                  <div><strong>Current Weight:</strong> {scannedMaterial.currentWeight.toLocaleString()} lbs</div>
                  <div><strong>Bags Available:</strong> {scannedMaterial.bagsAvailable}</div>
                </div>
              </div>
              
              {formData.weightIn && formData.weightOut && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Usage Calculation</h4>
                  <div className="space-y-1 text-sm">
                    <div>Weight In: {formData.weightIn} lbs</div>
                    <div>Weight Out: {formData.weightOut} lbs</div>
                    <div>Spillage: {formData.estimatedSpillage || 0} lbs</div>
                    <div className="font-medium pt-2 border-t">
                      <strong>Material Used: {(parseFloat(formData.weightIn) - parseFloat(formData.weightOut) - parseFloat(formData.estimatedSpillage || 0)).toFixed(1)} lbs</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">📷</div>
              <p>Scan a barcode to view material information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Production View Component (Lead Hand Log)
const ProductionView = ({ addProduction }) => {
  const [formData, setFormData] = useState({
    product: '',
    colour: '',
    type: '',
    numberOfBundles: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addProduction({
      ...formData,
      numberOfBundles: parseInt(formData.numberOfBundles)
    });
    
    // Reset form
    setFormData({
      product: '',
      colour: '',
      type: '',
      numberOfBundles: 0
    });
    
    alert('Production logged successfully!');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Lead Hand Log Sheet</h2>
      
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">Log Production</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Product</option>
                {PRODUCTS.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
              <input
                type="text"
                value={formData.colour}
                onChange={(e) => setFormData({...formData, colour: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter colour"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                {TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bundles</label>
              <input
                type="number"
                value={formData.numberOfBundles}
                onChange={(e) => setFormData({...formData, numberOfBundles: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Production
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Enhanced Raw Materials View Component with editing
const RawMaterialsView = ({ rawMaterials, updateRawMaterial, settings }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Raw Material Inventory</h2>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Starting Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bags Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rawMaterials.map(material => {
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
                          onChange={(e) => setEditFormData({...editFormData, poNumber: e.target.value})}
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
                          onChange={(e) => setEditFormData({...editFormData, rawMaterial: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {settings.rawMaterials.map(rm => (
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
                          onChange={(e) => setEditFormData({...editFormData, vendor: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {settings.vendors.map(vendor => (
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
                          onChange={(e) => setEditFormData({...editFormData, startingWeight: parseFloat(e.target.value)})}
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
                          onChange={(e) => setEditFormData({...editFormData, currentWeight: parseFloat(e.target.value)})}
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
                          onChange={(e) => setEditFormData({...editFormData, bagsAvailable: parseInt(e.target.value)})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-900">{material.bagsAvailable}</span>
                      )}
                    </td>
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
                        <button
                          onClick={() => startEdit(material)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Warehouse View Component with Product ID
const WarehouseView = ({ inventory, selectedWarehouse, setSelectedWarehouse, updateWarehouseItem }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditFormData(item);
  };

  const saveEdit = () => {
    const originalData = inventory.find(i => i.id === editingItem);
    updateWarehouseItem(editingItem, editFormData, originalData);
    setEditingItem(null);
    setEditFormData({});
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Warehouse Inventory</h2>
        
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
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Bundles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-blue-600">{item.productId}</span>
                  </td>
                  <td className="px-6 py-4">
                    {editingItem === item.id ? (
                      <select
                        value={editFormData.product}
                        onChange={(e) => setEditFormData({...editFormData, product: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {PRODUCTS.map(product => (
                          <option key={product} value={product}>{product}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-medium text-gray-900">{item.product}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingItem === item.id ? (
                      <input
                        type="text"
                        value={editFormData.colour}
                        onChange={(e) => setEditFormData({...editFormData, colour: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="text-gray-900">{item.colour}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingItem === item.id ? (
                      <select
                        value={editFormData.type}
                        onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-900">{item.type}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{item.dateCreated}</td>
                  <td className="px-6 py-4">
                    {editingItem === item.id ? (
                      <input
                        type="number"
                        value={editFormData.numberOfBundles}
                        onChange={(e) => setEditFormData({...editFormData, numberOfBundles: parseInt(e.target.value)})}
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
                        onChange={(e) => setEditFormData({...editFormData, warehouse: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {WAREHOUSES.map(warehouse => (
                          <option key={warehouse} value={warehouse}>{warehouse}</option>
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
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Activity View Component
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
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
                  <td className="px-6 py-4 text-sm text-gray-900">{activity.details}</td>
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

export default App;