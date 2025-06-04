import React, { useState, useEffect } from "react";
const SettingsView = ({ settings, updateSettings }) => {
  const [formData, setFormData] = useState(settings);
  const [materialValues, setMaterialValues] = useState(settings.rawMaterialValues || {});
  const [showValuesModal, setShowValuesModal] = useState(false);
  const [newRawMaterial, setNewRawMaterial] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newColor, setNewColor] = useState('');

  // Update formData when settings prop changes
  useEffect(() => {
    setFormData(settings);
    // Ensure materialValues contains an entry for every raw material
    const baseValues = settings.rawMaterialValues || {};
    const normalizedValues = { ...baseValues };
    (settings.rawMaterials || []).forEach(name => {
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
    setMaterialValues(normalizedValues);
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    alert('Settings saved successfully! Changes will be available immediately.');
  };

  const addRawMaterial = () => {
    if (newRawMaterial.trim() && !formData.rawMaterials.includes(newRawMaterial.trim())) {
      const updatedValues = {
        ...materialValues,
        [newRawMaterial.trim()]: {
          vendor: '',
          minQuantity: 0,
          pricePerLb: 0,
          usagePerBatch: 0,
          avgBatchesPerDay: 0
        }
      };
      const updatedFormData = {
        ...formData,
        rawMaterials: [...formData.rawMaterials, newRawMaterial.trim()],
        rawMaterialValues: updatedValues
      };
      setFormData(updatedFormData);
      setMaterialValues(updatedValues);
      updateSettings(updatedFormData);
      setNewRawMaterial('');
    } else if (formData.rawMaterials.includes(newRawMaterial.trim())) {
      alert('This raw material already exists!');
    }
  };

  const removeRawMaterial = (material) => {
    const { [material]: removed, ...rest } = materialValues;
    const updatedFormData = {
      ...formData,
      rawMaterials: formData.rawMaterials.filter(m => m !== material),
      rawMaterialValues: rest
    };
    setFormData(updatedFormData);
    setMaterialValues(rest);
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

  const handleNameChange = (oldName, newName) => {
    setMaterialValues(prev => {
      const { [oldName]: oldVal, ...rest } = prev;
      return { ...rest, [newName]: oldVal };
    });

    setFormData(prev => {
      const { rawMaterialValues, rawMaterials, ...rest } = prev;
      const { [oldName]: oldVal, ...otherVals } = rawMaterialValues;
      return {
        ...rest,
        rawMaterials: rawMaterials.map(n => n === oldName ? newName : n),
        rawMaterialValues: { ...otherVals, [newName]: oldVal }
      };
    });
  };

  const handleValueChange = (name, field, value) => {
    setMaterialValues(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: value }
    }));
  };

  const saveMaterialValues = () => {
    const updatedFormData = { ...formData, rawMaterialValues: materialValues };
    setFormData(updatedFormData);
    updateSettings(updatedFormData);
    setShowValuesModal(false);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>
      
      <div className="space-y-8">

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
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span>Raw Materials</span>
            <button
              onClick={() => setShowValuesModal(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit Values
            </button>
          </h3>
          
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

      {showValuesModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowValuesModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-h-[80vh] overflow-y-auto w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Raw Material Values</h3>
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Raw Material</th>
                  <th className="px-2 py-1 border">Vendor</th>
                  <th className="px-2 py-1 border">Minimum Quantity (lb)</th>
                  <th className="px-2 py-1 border">Price Per lb (CDN)</th>
                  <th className="px-2 py-1 border">Usage / Batch (lb)</th>
                  <th className="px-2 py-1 border">Avg Batches / Day</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(materialValues)
                  .sort((a, b) => a.localeCompare(b))
                  .map(name => (
                    <tr key={name}>
                      <td className="px-2 py-1 border">
                        <input
                          type="text"
                          value={name}
                          onChange={e => handleNameChange(name, e.target.value)}
                          className="w-full border rounded px-1"
                        />
                      </td>
                      <td className="px-2 py-1 border">
                        <select
                          value={materialValues[name].vendor}
                          onChange={e => handleValueChange(name, 'vendor', e.target.value)}
                          className="w-full border rounded px-1"
                        >
                          <option value="">Select Vendor</option>
                          {formData.vendors
                            .slice()
                            .sort((a, b) => a.localeCompare(b))
                            .map(vendor => (
                              <option key={vendor} value={vendor}>{vendor}</option>
                            ))}
                        </select>
                      </td>
                      <td className="px-2 py-1 border">
                        <input
                          type="number"
                          step="0.01"
                          value={materialValues[name].minQuantity}
                          onChange={e => handleValueChange(name, 'minQuantity', parseFloat(e.target.value) || 0)}
                          className="w-full border rounded px-1"
                        />
                      </td>
                      <td className="px-2 py-1 border">
                        <input
                          type="number"
                          step="0.01"
                          value={materialValues[name].pricePerLb}
                          onChange={e => handleValueChange(name, 'pricePerLb', parseFloat(e.target.value) || 0)}
                          className="w-full border rounded px-1"
                        />
                      </td>
                      <td className="px-2 py-1 border">
                        <input
                          type="number"
                          step="0.01"
                          value={materialValues[name].usagePerBatch}
                          onChange={e => handleValueChange(name, 'usagePerBatch', parseFloat(e.target.value) || 0)}
                          className="w-full border rounded px-1"
                        />
                      </td>
                      <td className="px-2 py-1 border">
                        <input
                          type="number"
                          step="0.01"
                          value={materialValues[name].avgBatchesPerDay}
                          onChange={e => handleValueChange(name, 'avgBatchesPerDay', parseFloat(e.target.value) || 0)}
                          className="w-full border rounded px-1"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={saveMaterialValues}
                className="bg-[#09713c] text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setShowValuesModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsView;
