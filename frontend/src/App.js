import React, { useState, useEffect } from 'react';
import './App.css';

// Mock data for Enviroshake products
const initialInventory = [
  // Enviroshake products
  { id: 1, mainProduct: 'Enviroshake', color: 'Weathered Wood', materialLot: 'EWW-2024-001', sku: 'ES-WW-001', quantity: 150, location: 'A1-B3', lastUpdated: '2024-12-15', reorderLevel: 50 },
  { id: 2, mainProduct: 'Enviroshake', color: 'Cedar Blend', materialLot: 'ECB-2024-002', sku: 'ES-CB-002', quantity: 200, location: 'A1-B4', lastUpdated: '2024-12-14', reorderLevel: 50 },
  { id: 3, mainProduct: 'Enviroshake', color: 'Rustic Red', materialLot: 'ERR-2024-003', sku: 'ES-RR-003', quantity: 75, location: 'A2-C1', lastUpdated: '2024-12-13', reorderLevel: 50 },
  { id: 4, mainProduct: 'Enviroshake', color: 'Storm Grey', materialLot: 'ESG-2024-004', sku: 'ES-SG-004', quantity: 30, location: 'A2-C2', lastUpdated: '2024-12-12', reorderLevel: 50 },
  
  // Enviroslate products
  { id: 5, mainProduct: 'Enviroslate', color: 'Charcoal', materialLot: 'ELC-2024-005', sku: 'EL-CH-005', quantity: 120, location: 'B1-D2', lastUpdated: '2024-12-15', reorderLevel: 40 },
  { id: 6, mainProduct: 'Enviroslate', color: 'Midnight Blue', materialLot: 'EMB-2024-006', sku: 'EL-MB-006', quantity: 85, location: 'B1-D3', lastUpdated: '2024-12-14', reorderLevel: 40 },
  { id: 7, mainProduct: 'Enviroslate', color: 'Weathered Copper', materialLot: 'EWC-2024-007', sku: 'EL-WC-007', quantity: 25, location: 'B2-E1', lastUpdated: '2024-12-13', reorderLevel: 40 },
  
  // Enviroshingle products
  { id: 8, mainProduct: 'Enviroshingle', color: 'Driftwood', materialLot: 'SHD-2024-008', sku: 'SH-DW-008', quantity: 180, location: 'C1-F2', lastUpdated: '2024-12-15', reorderLevel: 60 },
  { id: 9, mainProduct: 'Enviroshingle', color: 'Sage Green', materialLot: 'SHG-2024-009', sku: 'SH-SG-009', quantity: 95, location: 'C1-F3', lastUpdated: '2024-12-14', reorderLevel: 60 },
  { id: 10, mainProduct: 'Enviroshingle', color: 'Coastal Blue', materialLot: 'SCB-2024-010', sku: 'SH-CB-010', quantity: 40, location: 'C2-G1', lastUpdated: '2024-12-12', reorderLevel: 60 },
  { id: 11, mainProduct: 'Enviroshingle', color: 'Autumn Bronze', materialLot: 'SAB-2024-011', sku: 'SH-AB-011', quantity: 220, location: 'C2-G2', lastUpdated: '2024-12-15', reorderLevel: 60 }
];

function App() {
  const [inventory, setInventory] = useState(initialInventory);
  const [filteredInventory, setFilteredInventory] = useState(initialInventory);
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  // Filter inventory based on selected product and search term
  useEffect(() => {
    let filtered = inventory;
    
    if (selectedProduct !== 'All') {
      filtered = filtered.filter(item => item.mainProduct === selectedProduct);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialLot.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mainProduct.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInventory(filtered);
  }, [inventory, selectedProduct, searchTerm]);

  // Calculate dashboard stats
  const calculateStats = () => {
    const stats = {
      Enviroshake: { total: 0, lowStock: 0, totalValue: 0 },
      Enviroslate: { total: 0, lowStock: 0, totalValue: 0 },
      Enviroshingle: { total: 0, lowStock: 0, totalValue: 0 }
    };

    inventory.forEach(item => {
      stats[item.mainProduct].total += item.quantity;
      if (item.quantity <= item.reorderLevel) {
        stats[item.mainProduct].lowStock++;
      }
    });

    return stats;
  };

  const stats = calculateStats();

  // Add new product function
  const addProduct = (newProduct) => {
    const product = {
      ...newProduct,
      id: Math.max(...inventory.map(p => p.id)) + 1,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setInventory([...inventory, product]);
    setShowAddForm(false);
  };

  // Update quantity function
  const updateQuantity = (id, newQuantity) => {
    setInventory(inventory.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ));
  };

  // Delete product function
  const deleteProduct = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">Enviroshake</h1>
          <p className="text-sm text-gray-300 mt-1">Inventory Management</p>
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
          <button
            onClick={() => setCurrentView('inventory')}
            className={`w-full text-left px-6 py-3 hover:bg-slate-800 transition-colors ${
              currentView === 'inventory' ? 'bg-slate-800 border-r-2 border-blue-400' : ''
            }`}
          >
            📦 Inventory
          </button>
          
          <div className="mt-6 px-6">
            <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-3">Product Lines</h3>
            {['All', 'Enviroshake', 'Enviroslate', 'Enviroshingle'].map(product => (
              <button
                key={product}
                onClick={() => {
                  setSelectedProduct(product);
                  setCurrentView('inventory');
                }}
                className={`block w-full text-left py-2 px-3 rounded text-sm hover:bg-slate-800 transition-colors ${
                  selectedProduct === product ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
                }`}
              >
                {product}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {currentView === 'dashboard' && (
          <DashboardView stats={stats} inventory={inventory} setCurrentView={setCurrentView} setSelectedProduct={setSelectedProduct} />
        )}
        
        {currentView === 'inventory' && (
          <InventoryView 
            filteredInventory={filteredInventory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            addProduct={addProduct}
            updateQuantity={updateQuantity}
            deleteProduct={deleteProduct}
          />
        )}
      </div>
    </div>
  );
}

// Dashboard View Component
const DashboardView = ({ stats, inventory, setCurrentView, setSelectedProduct }) => {
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Inventory</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalItems.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Units in stock</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{lowStockItems.length}</p>
          <p className="text-sm text-gray-600 mt-1">Items need reorder</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Product Variants</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{inventory.length}</p>
          <p className="text-sm text-gray-600 mt-1">Active SKUs</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Product Lines</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
          <p className="text-sm text-gray-600 mt-1">Active lines</p>
        </div>
      </div>

      {/* Product Line Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(stats).map(([productLine, data]) => (
          <div key={productLine} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => { setSelectedProduct(productLine); setCurrentView('inventory'); }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{productLine}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                data.lowStock > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {data.lowStock > 0 ? `${data.lowStock} Low Stock` : 'All Good'}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{data.total.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total units in stock</p>
          </div>
        ))}
      </div>

      {/* Recent Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="divide-y">
            {lowStockItems.slice(0, 5).map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.mainProduct} - {item.color}</p>
                  <p className="text-sm text-gray-600">Lot: {item.materialLot}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">{item.quantity} units</p>
                  <p className="text-xs text-gray-500">Reorder at {item.reorderLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Inventory View Component
const InventoryView = ({ 
  filteredInventory, 
  searchTerm, 
  setSearchTerm, 
  selectedProduct, 
  setSelectedProduct,
  showAddForm,
  setShowAddForm,
  addProduct,
  updateQuantity,
  deleteProduct
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by color, lot number, SKU, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Products</option>
            <option value="Enviroshake">Enviroshake</option>
            <option value="Enviroslate">Enviroslate</option>
            <option value="Enviroshingle">Enviroshingle</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Lot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map(item => (
                <InventoryRow 
                  key={item.id} 
                  item={item} 
                  updateQuantity={updateQuantity}
                  deleteProduct={deleteProduct}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddForm && (
        <AddProductModal 
          onClose={() => setShowAddForm(false)} 
          onAdd={addProduct}
        />
      )}
    </div>
  );
};

// Inventory Row Component
const InventoryRow = ({ item, updateQuantity, deleteProduct }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(item.quantity);

  const handleUpdate = () => {
    updateQuantity(item.id, parseInt(newQuantity));
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    if (item.quantity <= item.reorderLevel) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Low Stock</span>;
    } else if (item.quantity <= item.reorderLevel * 1.5) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Medium</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">In Stock</span>;
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{item.mainProduct}</div>
      </td>
      <td className="px-6 py-4 text-gray-900">{item.color}</td>
      <td className="px-6 py-4">
        <span className="font-mono text-sm text-gray-600">{item.materialLot}</span>
      </td>
      <td className="px-6 py-4">
        <span className="font-mono text-sm text-gray-900">{item.sku}</span>
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <button onClick={handleUpdate} className="text-green-600 hover:text-green-800">✓</button>
            <button onClick={() => setIsEditing(false)} className="text-red-600 hover:text-red-800">✗</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.quantity}</span>
            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-gray-600">{item.location}</td>
      <td className="px-6 py-4">{getStatusBadge()}</td>
      <td className="px-6 py-4">
        <button
          onClick={() => deleteProduct(item.id)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

// Add Product Modal Component
const AddProductModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    mainProduct: 'Enviroshake',
    color: '',
    materialLot: '',
    sku: '',
    quantity: 0,
    location: '',
    reorderLevel: 50
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-6">Add New Product</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Line</label>
            <select
              value={formData.mainProduct}
              onChange={(e) => setFormData({...formData, mainProduct: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Enviroshake">Enviroshake</option>
              <option value="Enviroslate">Enviroslate</option>
              <option value="Enviroshingle">Enviroshingle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Lot Number</label>
            <input
              type="text"
              value={formData.materialLot}
              onChange={(e) => setFormData({...formData, materialLot: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., A1-B3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
            <input
              type="number"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;