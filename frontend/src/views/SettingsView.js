import React, { useState, useEffect } from "react";
const SettingsView = ({ settings, updateSettings }) => {
  const [formData, setFormData] = useState(settings);
  const [newRawMaterial, setNewRawMaterial] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newColor, setNewColor] = useState('');

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
      updateSettings(updatedFormData);
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
    updateSettings(updatedFormData);
  };

  const addVendor = () => {
    if (newVendor.trim() && !formData.vendors.includes(newVendor.trim())) {
      const updatedFormData = {
        ...formData,
        vendors: [...formData.vendors, newVendor.trim()]
      };
      setFormData(updatedFormData);
      updateSettings(updatedFormData);
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
    updateSettings(updatedFormData);
  };

  const addEmail = () => {
    if (newEmail.trim() && !formData.emailAddresses.includes(newEmail.trim())) {
      const updatedFormData = {
        ...formData,
        emailAddresses: [...formData.emailAddresses, newEmail.trim()]
      };
      setFormData(updatedFormData);
      updateSettings(updatedFormData);
      setNewEmail('');
    } else if (formData.emailAddresses.includes(newEmail.trim())) {
      alert('This email address already exists!');
    }
  };

  const removeEmail = (email) => {
    const updatedFormData = {
      ...formData,
      emailAddresses: formData.emailAddresses.filter(e => e !== email)
    };
    setFormData(updatedFormData);
    updateSettings(updatedFormData);
  };

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      const updatedFormData = {
        ...formData,
        colors: [...formData.colors, newColor.trim()]
      };
      setFormData(updatedFormData);
      updateSettings(updatedFormData);
      setNewColor('');
    } else if (formData.colors.includes(newColor.trim())) {
      alert('This color already exists!');
    }
  };

  const removeColor = (color) => {
    const updatedFormData = {
      ...formData,
      colors: formData.colors.filter(c => c !== color)
    };
    setFormData(updatedFormData);
    updateSettings(updatedFormData);
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
                  updateSettings(updatedFormData);
                }}
                className="flex-1"
              />
              <span className="text-lg font-medium w-16">
                {(formData.lowStockAlertLevel * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Email Addresses Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Email Addresses</h3>
          <p className="text-sm text-gray-600 mb-4">Email addresses that will receive notifications when lead hands add notes.</p>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Add new email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addEmail}
                className="bg-[#09713c] text-white px-4 py-2 rounded-lg hover:bg-[#09713c]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {formData.emailAddresses.map((email, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{email}</span>
                <button
                  onClick={() => removeEmail(email)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Colors Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Colors</h3>
          <p className="text-sm text-gray-600 mb-4">Available colors for Lead Hand Log production entries.</p>
          
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Add new color"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addColor}
                className="bg-[#09713c] text-white px-4 py-2 rounded-lg hover:bg-[#09713c]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {formData.colors.map((color, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{color}</span>
                <button
                  onClick={() => removeColor(color)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
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
                className="bg-[#09713c] text-white px-4 py-2 rounded-lg hover:bg-[#09713c]"
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
                className="bg-[#09713c] text-white px-4 py-2 rounded-lg hover:bg-[#09713c]"
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
            className="bg-[#09713c] text-white px-6 py-2 rounded-lg hover:bg-[#09713c]"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
export default SettingsView;
