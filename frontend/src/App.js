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
import Login from './components/Login';
import { logActivity, logFormSubmission } from './utils/activityLog';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  subscribeToCollection,
  subscribeToDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  setDocument
} from './utils/firestore';


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

// Generate unique product ID
const generateProductId = () => {
  return 'PID' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
};

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data state
  const [currentView, setCurrentView] = useState('dashboard');
  const [settings, setSettings] = useState(initialSettings);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [warehouseInventory, setWarehouseInventory] = useState([]);
  const [qcInventory, setQcInventory] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [openCheckouts, setOpenCheckouts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedQCStage, setSelectedQCStage] = useState('All');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Firestore subscriptions — only set up when authenticated
  useEffect(() => {
    if (!user) return;

    const loaded = { rm: false, wh: false, qc: false, ah: false, oc: false, st: false };
    const checkAllLoaded = () => {
      if (Object.values(loaded).every(Boolean)) setDataLoading(false);
    };

    const unsubRM = subscribeToCollection('rawMaterials', (data) => {
      setRawMaterials(data);
      loaded.rm = true;
      checkAllLoaded();
    });

    const unsubWH = subscribeToCollection('warehouseInventory', (data) => {
      setWarehouseInventory(data);
      loaded.wh = true;
      checkAllLoaded();
    });

    const unsubQC = subscribeToCollection('qcInventory', (data) => {
      setQcInventory(data);
      loaded.qc = true;
      checkAllLoaded();
    });

    const unsubAH = subscribeToCollection('activityHistory', (data) => {
      setActivityHistory(data);
      loaded.ah = true;
      checkAllLoaded();
    }, 'timestamp');

    const unsubOC = subscribeToCollection('openCheckouts', (data) => {
      setOpenCheckouts(data);
      loaded.oc = true;
      checkAllLoaded();
    });

    const unsubST = subscribeToDocument('settings', 'config', (doc) => {
      if (doc) {
        setSettings(prev => ({ ...initialSettings, ...doc }));
      }
      loaded.st = true;
      checkAllLoaded();
    });

    return () => {
      unsubRM();
      unsubWH();
      unsubQC();
      unsubAH();
      unsubOC();
      unsubST();
    };
  }, [user]);

  const openAlert = (msg) => {
    setAlertMessage(msg);
    setShowAlert(true);
  };

  const closeAlert = () => setShowAlert(false);

  // Email function (simulated for demo)
  const sendEmail = (to, subject, body) => {
    console.log('Email sent to:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    openAlert(`Email would be sent to: ${to.join(', ')}\nSubject: ${subject}\nBody: ${body}`);
  };

  // Add activity log entry with enhanced details
  const addActivity = (action, details, user = 'System') => {
    logActivity({ action, user, comment: details });
  };

  // Enhanced activity logging for edits
  const addEditActivity = (action, itemId, changes, user = 'System') => {
    Object.entries(changes).forEach(([field, value]) =>
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
  };

  const addFormSubmissionLog = (params) => {
    return logFormSubmission(params);
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
      id: Date.now(),
      barcode,
      currentWeight: materialData.startingWeight,
      dateReceived: currentDate,
      dateCreated: currentDate,
      lastUsed: null,
      bagsAvailable: materialData.bagsReceived
    };

    addDocument('rawMaterials', newMaterial).catch(console.error);
    addEditActivity(
      'Received Raw Material',
      barcode,
      { 'Current Weight': { from: null, to: materialData.startingWeight } },
      'Purchasing Manager'
    );

    return barcode;
  };

  // Update raw material
  const updateRawMaterial = (id, updatedData, originalData) => {
    const item = rawMaterials.find(m => m.id === id);
    if (!item || !item._id) return;

    updateDocument('rawMaterials', item._id, updatedData).catch(console.error);

    // Track changes for activity log
    const changes = {};
    Object.keys(updatedData).forEach(key => {
      if (originalData[key] !== updatedData[key]) {
        changes[key] = { from: originalData[key], to: updatedData[key] };
      }
    });

    if (Object.keys(changes).length > 0) {
      addEditActivity('Raw Material Edited', originalData.barcode, changes, 'Inventory Manager');
    }
  };

  // Use raw material (called internally by checkinRawMaterial)
  const useRawMaterial = (usageData) => {
    const weightUsed = usageData.weightIn - usageData.weightOut - (usageData.estimatedSpillage || 0);
    const currentDate = new Date().toISOString().split('T')[0];

    const material = rawMaterials.find(m => m.barcode === usageData.barcode);
    if (!material || !material._id) return;

    const newWeight = Math.max(0, material.currentWeight - weightUsed);
    let newBags = material.bagsAvailable;
    if (usageData.finishedBag === 'Yes') {
      newBags = Math.max(0, material.bagsAvailable - 1);
    }

    updateDocument('rawMaterials', material._id, {
      currentWeight: newWeight,
      bagsAvailable: newBags,
      lastUsed: currentDate
    }).catch(console.error);

    // Send email if notes are provided
    if (usageData.notes && usageData.notes.trim()) {
      sendEmail(
        settings.emailAddresses,
        'Note added by lead hand',
        `Note: ${usageData.notes}`
      );
    }
  };

  const checkoutRawMaterial = (checkoutData) => {
    const newEntry = {
      ...checkoutData,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    addDocument('openCheckouts', newEntry).catch(console.error);
    addEditActivity(
      'Initial Weight Recorded',
      checkoutData.barcode,
      { 'Weight In (lbs)': { from: null, to: checkoutData.weightIn } },
      `Lead Hand - ${checkoutData.leadHandName}`
    );
  };

  const checkinRawMaterial = (checkoutId, weightOut, estimatedSpillage, finishedBag, notes) => {
    const entry = openCheckouts.find(c => c.id === checkoutId);
    if (!entry || !entry._id) return;

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
    deleteDocument('openCheckouts', entry._id).catch(console.error);

    logActivity({
      action: 'End Weight Recorded',
      user: `Lead Hand - ${entry.leadHandName}`,
      itemId: entry.barcode,
      fieldChanged: 'Weight Out (lbs)',
      value: weightOutNum,
      oldValue: oldWeight,
      newValue: newWeight,
      comment: notes
    });
  };

  // Delete raw material
  const deleteRawMaterial = (id) => {
    const material = rawMaterials.find(r => r.id === id);
    if (!material || !material._id) return;

    deleteDocument('rawMaterials', material._id).catch(console.error);
    logActivity({
      action: 'Raw Material Deleted',
      user: 'Inventory Manager',
      itemId: material.barcode,
      oldValue: `${material.rawMaterial}`,
      newValue: 'Deleted'
    });
  };

  // Delete warehouse item
  const deleteWarehouseItem = (id) => {
    const item = warehouseInventory.find(w => w.id === id);
    if (!item || !item._id) return;

    deleteDocument('warehouseInventory', item._id).catch(console.error);
    addActivity(
      'Warehouse Item Deleted',
      `Product ID: ${item.productId}, ${item.product} - ${item.colour} (${item.type}), ${item.numberOfBundles} bundles`,
      'Warehouse Manager'
    );
  };

  // Split warehouse item
  const splitWarehouseItem = (id, splitQuantity) => {
    const originalItem = warehouseInventory.find(w => w.id === id);
    if (!originalItem || !originalItem._id) return;

    const remainingQuantity = originalItem.numberOfBundles - splitQuantity;

    updateDocument('warehouseInventory', originalItem._id, { numberOfBundles: remainingQuantity }).catch(console.error);

    const { _id, ...itemData } = originalItem;
    addDocument('warehouseInventory', {
      ...itemData,
      id: Date.now(),
      numberOfBundles: splitQuantity
    }).catch(console.error);

    addActivity(
      'Warehouse Item Split',
      `Product ID: ${originalItem.productId}, Split ${splitQuantity} bundles from ${originalItem.numberOfBundles} total`,
      'Warehouse Manager'
    );
  };

  // Transfer warehouse item
  const transferWarehouseItem = (id, quantity, targetWarehouse) => {
    const originalItem = warehouseInventory.find(w => w.id === id);
    if (!originalItem || !originalItem._id) return;

    if (quantity === originalItem.numberOfBundles) {
      updateDocument('warehouseInventory', originalItem._id, { warehouse: targetWarehouse }).catch(console.error);
    } else {
      const remainingQuantity = originalItem.numberOfBundles - quantity;
      updateDocument('warehouseInventory', originalItem._id, { numberOfBundles: remainingQuantity }).catch(console.error);

      const { _id, ...itemData } = originalItem;
      addDocument('warehouseInventory', {
        ...itemData,
        id: Date.now(),
        numberOfBundles: quantity,
        warehouse: targetWarehouse
      }).catch(console.error);
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
      id: Date.now(),
      productId,
      dateCreated: new Date().toISOString().split('T')[0],
      warehouse: 'Dresden',
      stage: 'Pending Review',
      shift: productionData.shift,
      leadHandName: productionData.leadHandName
    };

    addDocument('qcInventory', newProduction).catch(console.error);

    logActivity({
      action: 'Product Added',
      user: `Lead Hand - ${productionData.leadHandName}`,
      itemId: productId,
      fieldChanged: 'Number of Bundles',
      newValue: productionData.numberOfBundles
    });
  };

  // Update warehouse inventory with enhanced logging
  const updateWarehouseItem = (id, updatedData, originalData) => {
    const item = warehouseInventory.find(w => w.id === id);
    if (!item || !item._id) return;

    updateDocument('warehouseInventory', item._id, updatedData).catch(console.error);

    const changes = {};
    Object.keys(updatedData).forEach(key => {
      if (originalData[key] !== updatedData[key]) {
        changes[key] = { from: originalData[key], to: updatedData[key] };
      }
    });

    if (Object.keys(changes).length > 0) {
      addEditActivity('Warehouse Inventory Edited', originalData.productId, changes, 'Warehouse Manager');
    }
  };

  // QC inventory operations
  const deleteQCItem = (id) => {
    const item = qcInventory.find(q => q.id === id);
    if (!item || !item._id) return;

    deleteDocument('qcInventory', item._id).catch(console.error);
    addActivity(
      'QC Item Deleted',
      `Product ID: ${item.productId}, ${item.product} - ${item.colour} (${item.type}), ${item.numberOfBundles} bundles`,
      'Quality Control'
    );
  };

  const splitQCItem = (id, splitQuantity) => {
    const originalItem = qcInventory.find(q => q.id === id);
    if (!originalItem || !originalItem._id) return;

    const remainingQuantity = originalItem.numberOfBundles - splitQuantity;
    updateDocument('qcInventory', originalItem._id, { numberOfBundles: remainingQuantity }).catch(console.error);

    const { _id, ...itemData } = originalItem;
    addDocument('qcInventory', {
      ...itemData,
      id: Date.now(),
      numberOfBundles: splitQuantity
    }).catch(console.error);

    addActivity(
      'QC Item Split',
      `Product ID: ${originalItem.productId}, Split ${splitQuantity} bundles from ${originalItem.numberOfBundles} total`,
      'Quality Control'
    );
  };

  const transferQCItem = (id, quantity, targetWarehouse) => {
    const originalItem = qcInventory.find(q => q.id === id);
    if (!originalItem || !originalItem._id) return;

    if (quantity === originalItem.numberOfBundles) {
      updateDocument('qcInventory', originalItem._id, { warehouse: targetWarehouse }).catch(console.error);
    } else {
      const remainingQuantity = originalItem.numberOfBundles - quantity;
      updateDocument('qcInventory', originalItem._id, { numberOfBundles: remainingQuantity }).catch(console.error);

      const { _id, ...itemData } = originalItem;
      addDocument('qcInventory', {
        ...itemData,
        id: Date.now(),
        numberOfBundles: quantity,
        warehouse: targetWarehouse
      }).catch(console.error);
    }

    addActivity(
      'QC Transfer',
      `Product ID: ${originalItem.productId}, Transferred ${quantity} bundles to ${targetWarehouse}`,
      'Quality Control'
    );
  };

  const updateQCItem = (id, updatedData, originalData) => {
    const item = qcInventory.find(q => q.id === id);
    if (!item || !item._id) return;

    if (updatedData.stage === 'Pass') {
      deleteDocument('qcInventory', item._id).catch(console.error);

      const { _id, ...itemData } = item;
      addDocument('warehouseInventory', {
        ...itemData,
        ...updatedData,
        stage: 'Allocated',
        id: Date.now()
      }).catch(console.error);

      addActivity('QC Passed', `Product ID: ${originalData.productId} moved to Warehouse`, 'Quality Control');
    } else {
      updateDocument('qcInventory', item._id, updatedData).catch(console.error);

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
    setDocument('settings', 'config', newSettings).catch(console.error);

    const entries = [];

    if (newSettings.avgBatchesPerDay !== old.avgBatchesPerDay) {
      logActivity({
        action: options.actionOverride || 'Settings Changed',
        user: 'Administrator',
        itemId: 'Avg Batches / Day',
        fieldChanged: 'Avg Batches / Day',
        value: newSettings.avgBatchesPerDay,
        oldValue: old.avgBatchesPerDay,
        newValue: newSettings.avgBatchesPerDay
      });
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
          logActivity({
            action: options.actionOverride || 'Settings Changed',
            user: 'Administrator',
            itemId: label,
            fieldChanged: label,
            value: val,
            newValue: val
          });
        }
      });
    });

    if (options.csvField) {
      logActivity({
        action: 'CSV Import',
        user: 'Administrator',
        fieldChanged: options.csvField
      });
    } else if (newSettings.avgBatchesPerDay === old.avgBatchesPerDay) {
      // Only log a generic "Settings Changed" if nothing more specific was logged
      const anyArrayChange = arrayFields.some(([key]) => {
        const oldArr = old[key] || [];
        const newArr = newSettings[key] || [];
        return newArr.some(v => !oldArr.includes(v));
      });
      if (!anyArrayChange) {
        logActivity({
          action: options.actionOverride || 'Settings Changed',
          user: 'Administrator'
        });
      }
    }
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

  // Auth loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Login screen
  if (!user) return <Login />;

  // Data loading screen
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading inventory data...</p>
      </div>
    );
  }

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

            <button
              onClick={() => signOut(auth)}
              className="block w-full text-left py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors text-gray-300 mt-2"
            >
              🚪 Sign Out
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
