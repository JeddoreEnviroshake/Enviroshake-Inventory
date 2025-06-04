import React, { useState, useEffect } from 'react';
import './App.css';
import { generateCode39Barcode, renderBarcodeSVG } from './utils/barcode';
import { PRODUCTS, WAREHOUSES, TYPES, STAGES } from './constants';
import DashboardView from './views/DashboardView';
import ReceivingView from './views/ReceivingView';
import UsingView from './views/UsingView';
import ProductionView from './views/ProductionView';
import RawMaterialsView from './views/RawMaterialsView';
import WarehouseView from './views/WarehouseView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import ActivityView from './views/ActivityView';


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
  vendors: ['EFS Plastics', 'SM Polymers', 'Kraton', 'CRM Canada', 'Polyten', 'AWF'],
  emailAddresses: ['jeddore.mcdonald@enviroshake.com'],
  colors: ['Weathered Wood', 'Cedar Blend', 'Rustic Red', 'Storm Grey', 'Charcoal', 'Midnight Blue', 'Weathered Copper', 'Driftwood', 'Sage Green', 'Coastal Blue', 'Autumn Bronze']
};


// Local Storage functions for data persistence
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

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
    dateCreated: '2024-12-15',
    lastUsed: '2024-12-15',
    bagsAvailable: 5,
    shift: 'First'
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
    dateCreated: '2024-12-14',
    lastUsed: null,
    bagsAvailable: 4,
    shift: 'Second'
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
    warehouse: 'Dresden',
    stage: 'Available',
    shift: 'First'
  },
  {
    id: 2,
    productId: 'PID002DEF',
    product: 'Enviroslate',
    colour: 'Charcoal',
    type: 'Bundle',
    dateCreated: '2024-12-14',
    numberOfBundles: 18,
    warehouse: 'BC',
    stage: 'Available',
    shift: 'Second'
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
  const [settings, setSettings] = useState(() => loadFromLocalStorage('enviroshake_settings', initialSettings));
  const [rawMaterials, setRawMaterials] = useState(() => loadFromLocalStorage('enviroshake_rawMaterials', initialRawMaterials));
  const [warehouseInventory, setWarehouseInventory] = useState(() => loadFromLocalStorage('enviroshake_warehouseInventory', initialWarehouseInventory));
  const [activityHistory, setActivityHistory] = useState(() => loadFromLocalStorage('enviroshake_activityHistory', initialActivityHistory));
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToLocalStorage('enviroshake_settings', settings);
  }, [settings]);

  useEffect(() => {
    saveToLocalStorage('enviroshake_rawMaterials', rawMaterials);
  }, [rawMaterials]);

  useEffect(() => {
    saveToLocalStorage('enviroshake_warehouseInventory', warehouseInventory);
  }, [warehouseInventory]);

  useEffect(() => {
    saveToLocalStorage('enviroshake_activityHistory', activityHistory);
  }, [activityHistory]);

  // Email function (simulated for demo)
  const sendEmail = (to, subject, body) => {
    // In a real application, this would integrate with an email service
    console.log('Email sent to:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    alert(`Email would be sent to: ${to.join(', ')}\nSubject: ${subject}\nBody: ${body}`);
  };

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
    const currentDate = new Date().toISOString().split('T')[0];
    const newMaterial = {
      ...materialData,
      id: Math.max(...rawMaterials.map(r => r.id), 0) + 1,
      barcode,
      currentWeight: materialData.startingWeight,
      dateReceived: currentDate,
      dateCreated: currentDate,
      lastUsed: null,
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
    const currentDate = new Date().toISOString().split('T')[0];
    
    setRawMaterials(materials => 
      materials.map(material => {
        if (material.barcode === usageData.barcode) {
          const newWeight = Math.max(0, material.currentWeight - weightUsed);
          let newBags = material.bagsAvailable;
          
          // If finished bag is Yes, subtract a bag
          if (usageData.finishedBag === 'Yes') {
            newBags = Math.max(0, material.bagsAvailable - 1);
          }
          
          return {
            ...material,
            currentWeight: newWeight,
            bagsAvailable: newBags,
            lastUsed: currentDate
          };
        }
        return material;
      })
    );

    // Send email if notes are provided
    if (usageData.notes && usageData.notes.trim()) {
      sendEmail(
        settings.emailAddresses, 
        'Note added by lead hand', 
        `Note: ${usageData.notes}`
      );
    }

    addActivity(
      'Material Used',
      `Barcode: ${usageData.barcode}, Used: ${weightUsed.toFixed(1)} lbs, Spillage: ${usageData.estimatedSpillage || 0} lbs, Finished Bag: ${usageData.finishedBag || 'No'}${usageData.notes ? `, Notes: ${usageData.notes}` : ''}`,
      `Lead Hand - ${usageData.leadHandName}`
    );
  };

  // Delete raw material
  const deleteRawMaterial = (id) => {
    const material = rawMaterials.find(r => r.id === id);
    setRawMaterials(rawMaterials.filter(r => r.id !== id));
    addActivity(
      'Raw Material Deleted',
      `Barcode: ${material.barcode}, ${material.rawMaterial}, PO: ${material.poNumber}`,
      'Inventory Manager'
    );
  };

  // Delete warehouse item
  const deleteWarehouseItem = (id) => {
    const item = warehouseInventory.find(w => w.id === id);
    setWarehouseInventory(warehouseInventory.filter(w => w.id !== id));
    addActivity(
      'Warehouse Item Deleted',
      `Product ID: ${item.productId}, ${item.product} - ${item.colour} (${item.type}), ${item.numberOfBundles} bundles`,
      'Warehouse Manager'
    );
  };

  // Split warehouse item
  // Split and transfer functions
  const splitWarehouseItem = (id, splitQuantity) => {
    const originalItem = warehouseInventory.find(w => w.id === id);
    const remainingQuantity = originalItem.numberOfBundles - splitQuantity;

    // Update original item
    const updatedOriginal = {
      ...originalItem,
      numberOfBundles: remainingQuantity
    };

    // Create new split item
    const newSplitItem = {
      ...originalItem,
      id: Math.max(...warehouseInventory.map(w => w.id), 0) + 1,
      numberOfBundles: splitQuantity
      // Product ID remains the same
    };

    // Update inventory
    setWarehouseInventory(inventory =>
      inventory.map(item => item.id === id ? updatedOriginal : item).concat(newSplitItem)
    );

    addActivity(
      'Warehouse Item Split',
      `Product ID: ${originalItem.productId}, Split ${splitQuantity} bundles from ${originalItem.numberOfBundles} total`,
      'Warehouse Manager'
    );
  };

  // Transfer function that handles split and warehouse change
  const transferWarehouseItem = (id, quantity, targetWarehouse) => {
    const originalItem = warehouseInventory.find(w => w.id === id);
    if (!originalItem) return;
    
    if (quantity === originalItem.numberOfBundles) {
      // Full transfer - just update warehouse
      const updatedItem = {
        ...originalItem,
        warehouse: targetWarehouse
      };
      setWarehouseInventory(inventory =>
        inventory.map(item => item.id === id ? updatedItem : item)
      );
    } else {
      // Partial transfer - split and change warehouse
      const remainingQuantity = originalItem.numberOfBundles - quantity;
      
      // Update original item to have remaining quantity at original warehouse
      const updatedOriginal = {
        ...originalItem,
        numberOfBundles: remainingQuantity
      };
      
      // Create new item with transfer quantity at target warehouse
      const newTransferItem = {
        ...originalItem,
        id: Math.max(...warehouseInventory.map(w => w.id), 0) + 1,
        numberOfBundles: quantity,
        warehouse: targetWarehouse
      };
      
      // Update inventory with both items
      setWarehouseInventory(inventory =>
        inventory.map(item => item.id === id ? updatedOriginal : item).concat(newTransferItem)
      );
    }
    
    addActivity(
      'Warehouse Transfer',
      `Product ID: ${originalItem.productId}, Transferred ${quantity} bundles to ${targetWarehouse}`,
      'Warehouse Manager'
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
      warehouse: 'Dresden', // All production starts in Dresden
      stage: 'Available', // Default stage
      shift: productionData.shift
    };

    setWarehouseInventory([...warehouseInventory, newProduction]);
    addActivity(
      'Production Added',
      `Product ID: ${productId}, ${productionData.product} - ${productionData.colour} (${productionData.type}), ${productionData.numberOfBundles} bundles, ${productionData.shift} Shift`,
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
      <div className="fixed inset-y-0 left-0 w-64 bg-[#09713c] text-white">
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
            
            <button
              onClick={() => setCurrentView('reports')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                currentView === 'reports' ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
              }`}
            >
              📊 Reports
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
          <ProductionView addProduction={addProduction} settings={settings} />
        )}
        
        {currentView === 'rawMaterials' && (
          <RawMaterialsView 
            rawMaterials={rawMaterials} 
            updateRawMaterial={updateRawMaterial}
            deleteRawMaterial={deleteRawMaterial}
            settings={settings}
          />
        )}
        
        {currentView === 'warehouse' && (
          <WarehouseView
            inventory={filteredWarehouseInventory}
            allInventory={warehouseInventory}
            selectedWarehouse={selectedWarehouse}
            setSelectedWarehouse={setSelectedWarehouse}
            updateWarehouseItem={updateWarehouseItem}
            deleteWarehouseItem={deleteWarehouseItem}
            splitWarehouseItem={splitWarehouseItem}
            transferWarehouseItem={transferWarehouseItem}
            settings={settings}
          />
        )}
        
        {currentView === 'activity' && (
          <ActivityView activityHistory={activityHistory} />
        )}

        {currentView === 'settings' && (
          <SettingsView settings={settings} updateSettings={updateSettings} />
        )}

        {currentView === 'reports' && (
          <ReportsView 
            rawMaterials={rawMaterials}
            warehouseInventory={warehouseInventory}
            activityHistory={activityHistory}
          />
        )}
      </div>
    </div>
  );
}

export default App;