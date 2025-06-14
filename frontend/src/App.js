import React, { useState, useEffect } from 'react';
import './App.css';
import { generateCode39Barcode, renderBarcodeSVG } from './utils/barcode';
import { PRODUCTS, WAREHOUSES, TYPES } from './constants';
import DashboardView from './views/DashboardView';
import ReceivingView from './views/ReceivingView';
import UsingView from './views/UsingView';
import ProductionView from './views/ProductionView';
import PlanningView from './views/PlanningView';
import RawMaterialsView from './views/RawMaterialsView';
import WarehouseView from './views/WarehouseView';
import QCCheckpointView from './views/QCCheckpointView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import ActivitySnapshotView from './views/ActivitySnapshotView';
import ThisMonthView from './views/ThisMonthView';
import DailyProductionSummaryView from './views/DailyProductionSummaryView';
import AlertModal from './components/AlertModal';
import { loadLogs, saveLogs, logActivity, logFormSubmission } from './utils/activityLog';


// Initial configuration values
const rawMaterialNames = [
  'PP EFS', 'PP Clear Co-Polymer', 'PP White', 'PE EFS', 'PE Clear', 'PE White',
  'LXR', 'Rubber Crumb', 'Colour Masterbatch', 'PP EFS - HMF', 'Microingredients',
  'Wax', 'AC MB CR20050', 'SC MB CR20060', 'Carbon Black MB CB84002',
  'Cool Roof MB CSC 10030', 'TSL/CR CSC 10050', 'TSL MB CR20062',
  'Disney Brown MB CR20080', 'FR78070PP', 'PP Co-Polymer Virgin', 'Wood Fiber'
];

const initialSettings = {
  rawMaterials: rawMaterialNames,
  rawMaterialValues: rawMaterialNames.reduce((acc, name) => {
    acc[name] = {
      vendor: '',
      minQuantity: 0,
      pricePerLb: 0,
      usagePerBatch: 0,
      avgBatchesPerDay: 0
    };
    return acc;
  }, {}),
  avgBatchesPerDay: 0,
  vendors: ['EFS Plastics', 'SM Polymers', 'Kraton', 'CRM Canada', 'Polyten', 'AWF'],
  emailAddresses: ['jeddore.mcdonald@enviroshake.com'],
  colors: ['Weathered Wood', 'Cedar Blend', 'Rustic Red', 'Storm Grey', 'Charcoal', 'Midnight Blue', 'Weathered Copper', 'Driftwood', 'Sage Green', 'Coastal Blue', 'Autumn Bronze'],
  colorRecipes: {
    'Weathered Wood': [],
    'Cedar Blend': [],
    'Rustic Red': [],
    'Storm Grey': [],
    'Charcoal': [],
    'Midnight Blue': [],
    'Weathered Copper': [],
    'Driftwood': [],
    'Sage Green': [],
    'Coastal Blue': [],
    'Autumn Bronze': []
  }
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
    stage: 'Allocated',
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
    stage: 'Allocated',
    shift: 'Second'
  }
];

const initialQCInventory = [];

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
    action: 'End Weight Recorded',
    details: 'Barcode: BAR001PO5691, Used: 1159 lbs',
    user: 'Lead Hand - John Smith'
  },
  {
    id: 3,
    timestamp: '2024-12-16 09:00:00',
    action: 'Raw Material Edited',
    itemId: 'BAR001PO5691',
    changes: {
      bagsAvailable: { from: 6, to: 5 },
      currentWeight: { from: 9259, to: 8100 }
    },
    user: 'Inventory Manager'
  }
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [settings, setSettings] = useState(() => {
    const loaded = loadFromLocalStorage('enviroshake_settings', initialSettings);
    if (loaded.avgBatchesPerDay === undefined) {
      loaded.avgBatchesPerDay = 0;
    }
    // Ensure rawMaterialValues exists for all raw materials
    const baseValues = loaded.rawMaterialValues || {};
    const normalizedValues = { ...baseValues };
    (loaded.rawMaterials || rawMaterialNames).forEach(name => {
      if (!normalizedValues[name]) {
        normalizedValues[name] = {
          vendor: '',
          minQuantity: 0,
          pricePerLb: 0,
          usagePerBatch: 0,
          avgBatchesPerDay: 0
        };
      } else {
        normalizedValues[name] = {
          vendor: normalizedValues[name].vendor || '',
          minQuantity: normalizedValues[name].minQuantity || 0,
          pricePerLb: normalizedValues[name].pricePerLb || 0,
          usagePerBatch: normalizedValues[name].usagePerBatch || 0,
          avgBatchesPerDay: normalizedValues[name].avgBatchesPerDay || 0
        };
      }
    });
    const baseRecipes = loaded.colorRecipes || {};
    const normalizedRecipes = { ...baseRecipes };
    (loaded.colors || initialSettings.colors).forEach(color => {
      if (!normalizedRecipes[color]) {
        normalizedRecipes[color] = [];
      }
    });
    return { ...loaded, rawMaterialValues: normalizedValues, colorRecipes: normalizedRecipes };
  });
  const [rawMaterials, setRawMaterials] = useState(() => loadFromLocalStorage('enviroshake_rawMaterials', initialRawMaterials));
  const [warehouseInventory, setWarehouseInventory] = useState(() => loadFromLocalStorage('enviroshake_warehouseInventory', initialWarehouseInventory));
  const [qcInventory, setQcInventory] = useState(() => loadFromLocalStorage('enviroshake_qcInventory', initialQCInventory));
  const [activityHistory, setActivityHistory] = useState(() => loadLogs().length ? loadLogs() : initialActivityHistory);
  const [openCheckouts, setOpenCheckouts] = useState(() => loadFromLocalStorage('enviroshake_openCheckouts', []));
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedQCStage, setSelectedQCStage] = useState('All');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const openAlert = (msg) => {
    setAlertMessage(msg);
    setShowAlert(true);
  };

  const closeAlert = () => setShowAlert(false);

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
    saveToLocalStorage('enviroshake_qcInventory', qcInventory);
  }, [qcInventory]);

  useEffect(() => {
    saveLogs(activityHistory);
  }, [activityHistory]);

  useEffect(() => {
    saveToLocalStorage('enviroshake_openCheckouts', openCheckouts);
  }, [openCheckouts]);

  // Email function (simulated for demo)
  const sendEmail = (to, subject, body) => {
    // In a real application, this would integrate with an email service
    console.log('Email sent to:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    openAlert(`Email would be sent to: ${to.join(', ')}\nSubject: ${subject}\nBody: ${body}`);
  };

  // Add activity log entry with enhanced details
  const addActivity = (action, details, user = 'System') => {
    const entry = logActivity({ action, user, comment: details });
    setActivityHistory(history => [entry, ...history]);
  };

  // Enhanced activity logging for edits
  const addEditActivity = (action, itemId, changes, user = 'System') => {
    const entries = Object.entries(changes).map(([field, value]) =>
      logActivity({
        action,
        user,
        itemId,
        fieldChanged: field,
        value: value.to,
        oldValue: value.from,
        newValue: value.to
      })
    );
    setActivityHistory(history => [...entries, ...history]);
  };

  const addFormSubmissionLog = (params) => {
    const entry = logFormSubmission(params);
    setActivityHistory(history => [entry, ...history]);
    return entry;
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
    addEditActivity(
      'Received Raw Material',
      barcode,
      {
        'Current Weight': { from: null, to: materialData.startingWeight }
      },
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
        'Raw Material Edited',
        originalData.barcode,
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

    // Logging handled in checkinRawMaterial with "End Weight Recorded" action
  };

  const checkoutRawMaterial = (checkoutData) => {
    const newEntry = {
      ...checkoutData,
      id: Math.max(0, ...openCheckouts.map(c => c.id)) + 1,
      timestamp: new Date().toISOString()
    };
    setOpenCheckouts(entries => [newEntry, ...entries]);
    addEditActivity(
      'Initial Weight Recorded',
      checkoutData.barcode,
      {
        'Weight In (lbs)': { from: null, to: checkoutData.weightIn }
      },
      `Lead Hand - ${checkoutData.leadHandName}`
    );
  };

  const checkinRawMaterial = (checkoutId, weightOut, estimatedSpillage, finishedBag, notes) => {
    const entry = openCheckouts.find(c => c.id === checkoutId);
    if (!entry) return;
    const weightOutNum = parseFloat(weightOut);
    const material = rawMaterials.find(m => m.barcode === entry.barcode);
    const oldWeight = material ? material.currentWeight : null;
    const weightUsed = entry.weightIn - weightOutNum - (estimatedSpillage || 0);
    const newWeight = material ? Math.max(0, material.currentWeight - weightUsed) : null;
    const usageData = {
      ...entry,
      weightOut: weightOutNum,
      estimatedSpillage,
      finishedBag,
      notes
    };
    useRawMaterial(usageData);
    setOpenCheckouts(entries => entries.filter(c => c.id !== checkoutId));

    const entryLog = logActivity({
      action: 'End Weight Recorded',
      user: `Lead Hand - ${entry.leadHandName}`,
      itemId: entry.barcode,
      fieldChanged: 'Weight Out (lbs)',
      value: weightOutNum,
      oldValue: oldWeight,
      newValue: newWeight,
      comment: notes
    });
    setActivityHistory(history => [entryLog, ...history]);
  };

  // Delete raw material
  const deleteRawMaterial = (id) => {
    const material = rawMaterials.find(r => r.id === id);
    setRawMaterials(rawMaterials.filter(r => r.id !== id));
    const entry = logActivity({
      action: 'Raw Material Deleted',
      user: 'Inventory Manager',
      itemId: material.barcode,
      oldValue: `${material.rawMaterial}`,
      newValue: 'Deleted'
    });
    setActivityHistory(history => [entry, ...history]);
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

    setQcInventory(prevInventory => {
      const newProduction = {
        ...productionData,
        id: Math.max(...prevInventory.map(w => w.id), 0) + 1,
        productId,
        dateCreated: new Date().toISOString().split('T')[0],
        warehouse: 'Dresden', // All production starts in Dresden
        stage: 'Pending Review', // Default stage in QC
        shift: productionData.shift,
        leadHandName: productionData.leadHandName
      };
      return [...prevInventory, newProduction];
    });

    const entry = logActivity({
      action: 'Product Added',
      user: `Lead Hand - ${productionData.leadHandName}`,
      itemId: productId,
      fieldChanged: 'Number of Bundles',
      newValue: productionData.numberOfBundles
    });
    setActivityHistory(history => [entry, ...history]);
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
        'Warehouse Inventory Edited',
        originalData.productId,
        changes,
        'Warehouse Manager'
      );
    }
  };

  // QC inventory operations
  const deleteQCItem = (id) => {
    const item = qcInventory.find(q => q.id === id);
    setQcInventory(qcInventory.filter(q => q.id !== id));
    addActivity(
      'QC Item Deleted',
      `Product ID: ${item.productId}, ${item.product} - ${item.colour} (${item.type}), ${item.numberOfBundles} bundles`,
      'Quality Control'
    );
  };

  const splitQCItem = (id, splitQuantity) => {
    const originalItem = qcInventory.find(q => q.id === id);
    const remainingQuantity = originalItem.numberOfBundles - splitQuantity;

    const updatedOriginal = { ...originalItem, numberOfBundles: remainingQuantity };
    const newSplitItem = { ...originalItem, id: Math.max(...qcInventory.map(w => w.id), 0) + 1, numberOfBundles: splitQuantity };

    setQcInventory(inv => inv.map(i => i.id === id ? updatedOriginal : i).concat(newSplitItem));

    addActivity(
      'QC Item Split',
      `Product ID: ${originalItem.productId}, Split ${splitQuantity} bundles from ${originalItem.numberOfBundles} total`,
      'Quality Control'
    );
  };

  const transferQCItem = (id, quantity, targetWarehouse) => {
    const originalItem = qcInventory.find(q => q.id === id);
    if (!originalItem) return;

    if (quantity === originalItem.numberOfBundles) {
      const updatedItem = { ...originalItem, warehouse: targetWarehouse };
      setQcInventory(inv => inv.map(i => i.id === id ? updatedItem : i));
    } else {
      const remainingQuantity = originalItem.numberOfBundles - quantity;
      const updatedOriginal = { ...originalItem, numberOfBundles: remainingQuantity };
      const newTransferItem = { ...originalItem, id: Math.max(...qcInventory.map(w => w.id), 0) + 1, numberOfBundles: quantity, warehouse: targetWarehouse };
      setQcInventory(inv => inv.map(i => i.id === id ? updatedOriginal : i).concat(newTransferItem));
    }

    addActivity(
      'QC Transfer',
      `Product ID: ${originalItem.productId}, Transferred ${quantity} bundles to ${targetWarehouse}`,
      'Quality Control'
    );
  };

  const updateQCItem = (id, updatedData, originalData) => {
    if (updatedData.stage === 'Pass') {
      // remove from QC and add to warehouse
      setQcInventory(inv => inv.filter(i => i.id !== id));
      setWarehouseInventory(prev => {
        const newItem = { ...originalData, ...updatedData, stage: 'Allocated', id: Math.max(...prev.map(w => w.id), 0) + 1 };
        return [...prev, newItem];
      });
      addActivity('QC Passed', `Product ID: ${originalData.productId} moved to Warehouse`, 'Quality Control');
    } else {
      setQcInventory(inv => inv.map(i => i.id === id ? { ...i, ...updatedData } : i));

      const changes = {};
      Object.keys(updatedData).forEach(key => {
        if (originalData[key] !== updatedData[key]) {
          changes[key] = { from: originalData[key], to: updatedData[key] };
        }
      });

      if (Object.keys(changes).length > 0) {
        addEditActivity('QC Inventory Edited', originalData.productId, changes, 'Quality Control');
      }
    }
  };

  // Update settings
  const updateSettings = (newSettings, options = {}) => {
    const old = settings;
    setSettings(newSettings);

    // Track changes between old and new settings
    const entries = [];

    if (newSettings.avgBatchesPerDay !== old.avgBatchesPerDay) {
      entries.push(
        logActivity({
          action: options.actionOverride || 'Settings Changed',
          user: 'Administrator',
          itemId: 'Avg Batches / Day',
          fieldChanged: 'Avg Batches / Day',
          value: newSettings.avgBatchesPerDay,
          oldValue: old.avgBatchesPerDay,
          newValue: newSettings.avgBatchesPerDay
        })
      );
    }

    const arrayFields = [
      ['emailAddresses', 'Email Addresses'],
      ['colors', 'Colors'],
      ['rawMaterials', 'Raw Materials'],
      ['vendors', 'Vendors']
    ];

    arrayFields.forEach(([key, label]) => {
      const oldArr = old[key] || [];
      const newArr = newSettings[key] || [];
      newArr.forEach(val => {
        if (!oldArr.includes(val)) {
          entries.push(
            logActivity({
              action: options.actionOverride || 'Settings Changed',
              user: 'Administrator',
              itemId: label,
              fieldChanged: label,
              value: val,
              newValue: val
            })
          );
        }
      });
    });

    if (options.csvField) {
      entries.unshift(
        logActivity({
          action: 'CSV Import',
          user: 'Administrator',
          fieldChanged: options.csvField
        })
      );
    }

    if (entries.length === 0) {
      entries.push(
        logActivity({
          action: options.actionOverride || 'Settings Changed',
          user: 'Administrator'
        })
      );
    }

    setActivityHistory(history => [...entries, ...history]);
  };

  // Filter warehouse inventory by selected warehouse and stage
  const filteredWarehouseInventory = warehouseInventory.filter(
    item =>
      (selectedWarehouse === 'All' || item.warehouse === selectedWarehouse) &&
      (selectedStage === 'All' || item.stage === selectedStage)
  );

  const filteredQCInventory = qcInventory.filter(
    item => selectedQCStage === 'All' || item.stage === selectedQCStage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#09713c] text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">Enviroshake</h1>
          <p className="text-sm text-gray-300 mt-1">Inventory Tracking System</p>
        </div>
        
        <nav className="mt-8">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full text-left px-6 py-3 hover:bg-green-700 transition-colors ${
              currentView === 'dashboard' ? 'bg-green-700 border-r-2 border-green-300' : ''
            }`}
          >
            📊 Dashboard
          </button>
          
          <div className="mt-6 px-6">
            <h3 className="text-xs uppercase tracking-wide text-white mb-3">Operations</h3>
            
            <button
              onClick={() => setCurrentView('receiving')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'receiving' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              📦 Receiving
            </button>

            <button
              onClick={() => setCurrentView('planning')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'planning' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              🗓️ Planning
            </button>
            
            <button
              onClick={() => setCurrentView('using')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'using' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              🔧 Using
            </button>
            
            <button
              onClick={() => setCurrentView('production')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'production' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              📝 Lead Hand Log
            </button>
          </div>

          <div className="mt-6 px-6">
            <h3 className="text-xs uppercase tracking-wide text-white mb-3">Inventory</h3>
            
            <button
              onClick={() => setCurrentView('rawMaterials')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'rawMaterials' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              🧱 Raw Materials
            </button>

            <button
              onClick={() => setCurrentView('qc')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'qc' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              🧪 QC Checkpoint
            </button>

            <button
              onClick={() => setCurrentView('warehouse')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'warehouse' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              🏭 Warehouse
            </button>
          </div>

          <div className="mt-6 px-6">
            <h3 className="text-xs uppercase tracking-wide text-white mb-3">Reports</h3>

            <button
              onClick={() => setCurrentView('reports')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'reports' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              📊 Reports
            </button>

            <button
              onClick={() => setCurrentView('thisMonth')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'thisMonth' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              📆 This Month
            </button>

            <button
              onClick={() => setCurrentView('dailyProductionSummary')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'dailyProductionSummary' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              📅 Daily Production
            </button>
          </div>

          <div className="mt-6 px-6">
            <h3 className="text-xs uppercase tracking-wide text-white mb-3">System</h3>

            <button
              onClick={() => setCurrentView('activity')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'activity' ? 'bg-green-700 text-white' : 'text-gray-300'
              }`}
            >
              📋 Activity
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors ${
                currentView === 'settings' ? 'bg-green-700 text-white' : 'text-gray-300'
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
          <ReceivingView
            addRawMaterial={addRawMaterial}
            settings={settings}
            openAlert={openAlert}
            logFormSubmission={addFormSubmissionLog}
          />
        )}

        {currentView === 'planning' && (
          <PlanningView rawMaterials={rawMaterials} settings={settings} />
        )}

        {currentView === 'using' && (
          <UsingView
            rawMaterials={rawMaterials}
            openCheckouts={openCheckouts}
            checkoutRawMaterial={checkoutRawMaterial}
            checkinRawMaterial={checkinRawMaterial}
            openAlert={openAlert}
            logFormSubmission={addFormSubmissionLog}
          />
        )}
        
        {currentView === 'production' && (
          <ProductionView
            addProduction={addProduction}
            settings={settings}
            openAlert={openAlert}
            logFormSubmission={addFormSubmissionLog}
          />
        )}
        
        {currentView === 'rawMaterials' && (
          <RawMaterialsView
            rawMaterials={rawMaterials}
            updateRawMaterial={updateRawMaterial}
            deleteRawMaterial={deleteRawMaterial}
            settings={settings}
          />
        )}

        {currentView === 'qc' && (
          <QCCheckpointView
            inventory={filteredQCInventory}
            allInventory={qcInventory}
            selectedStage={selectedQCStage}
            setSelectedStage={setSelectedQCStage}
            updateWarehouseItem={updateQCItem}
            deleteWarehouseItem={deleteQCItem}
            splitWarehouseItem={splitQCItem}
            transferWarehouseItem={transferQCItem}
            settings={settings}
            openAlert={openAlert}
          />
        )}

        {currentView === 'warehouse' && (
          <WarehouseView
            inventory={filteredWarehouseInventory}
            allInventory={warehouseInventory}
            selectedWarehouse={selectedWarehouse}
            setSelectedWarehouse={setSelectedWarehouse}
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
            updateWarehouseItem={updateWarehouseItem}
            deleteWarehouseItem={deleteWarehouseItem}
            splitWarehouseItem={splitWarehouseItem}
            transferWarehouseItem={transferWarehouseItem}
            settings={settings}
            openAlert={openAlert}
          />
        )}
        
        {currentView === 'activity' && (
          <ActivitySnapshotView activityHistory={activityHistory} />
        )}


        {currentView === 'settings' && (
          <SettingsView settings={settings} updateSettings={updateSettings} openAlert={openAlert} />
        )}

        {currentView === 'reports' && (
          <ReportsView
            rawMaterials={rawMaterials}
            warehouseInventory={warehouseInventory}
            activityHistory={activityHistory}
          />
        )}

        {currentView === 'thisMonth' && (
          <ThisMonthView
            rawMaterials={rawMaterials}
            warehouseInventory={warehouseInventory}
            activityHistory={activityHistory}
            qcInventory={qcInventory}
          />
        )}

        {currentView === 'dailyProductionSummary' && (
          <DailyProductionSummaryView activityHistory={activityHistory} />
        )}
      </div>
      {showAlert && (
        <AlertModal message={alertMessage} onClose={closeAlert} />
      )}
    </div>
  );
}

export default App;