import React, { useState, useEffect } from "react";
const SettingsView = ({ settings, updateSettings, openAlert }) => {
  const [formData, setFormData] = useState({
    ...settings,
    avgBatchesPerDay: settings.avgBatchesPerDay || 0
  });
  const [materialValues, setMaterialValues] = useState(settings.rawMaterialValues || {});
  const [showValuesModal, setShowValuesModal] = useState(false);
  const [recipes, setRecipes] = useState(settings.colorRecipes || {});
  const [showRecipesModal, setShowRecipesModal] = useState(false);
  const [newRawMaterial, setNewRawMaterial] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newColor, setNewColor] = useState('');

  // Utility to export data to CSV
  const exportToCSV = (data, filename, headers) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const value = row[h] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Update formData when settings prop changes
  useEffect(() => {
    const baseRecipes = settings.colorRecipes || {};
    const normalizedRecipes = { ...baseRecipes };
    (settings.colors || []).forEach(color => {
      if (!normalizedRecipes[color]) {
        normalizedRecipes[color] = [];
      }
    });
    setFormData({
      ...settings,
      avgBatchesPerDay: settings.avgBatchesPerDay || 0,
      colorRecipes: normalizedRecipes
    });
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
    setRecipes(normalizedRecipes);
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    openAlert('Settings saved successfully! Changes will be available immediately.');
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
      openAlert('This raw material already exists!');
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
      openAlert('This vendor already exists!');
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
      openAlert('This email address already exists!');
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
      const updatedRecipes = { ...recipes, [newColor.trim()]: [] };
      const updatedFormData = {
        ...formData,
        colors: [...formData.colors, newColor.trim()],
        colorRecipes: updatedRecipes
      };
      setFormData(updatedFormData);
      setRecipes(updatedRecipes);
      updateSettings(updatedFormData);
      setNewColor('');
    } else if (formData.colors.includes(newColor.trim())) {
      openAlert('This color already exists!');
    }
  };

  const removeColor = (color) => {
    const { [color]: removed, ...restRecipes } = recipes;
    const updatedFormData = {
      ...formData,
      colors: formData.colors.filter(c => c !== color),
      colorRecipes: restRecipes
    };
    setFormData(updatedFormData);
    setRecipes(restRecipes);
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

  const addRecipeRow = (color) => {
    setRecipes(prev => ({
      ...prev,
      [color]: [...(prev[color] || []), { rawMaterial: '', weight: 0 }]
    }));
  };

  const removeRecipeRow = (color, index) => {
    setRecipes(prev => ({
      ...prev,
      [color]: prev[color].filter((_, i) => i !== index)
    }));
  };

  const handleRecipeChange = (color, index, field, value) => {
    setRecipes(prev => ({
      ...prev,
      [color]: prev[color].map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      )
    }));
  };

  const saveRecipes = () => {
    const updatedFormData = { ...formData, colorRecipes: recipes };
    setFormData(updatedFormData);
    updateSettings(updatedFormData);
    setShowRecipesModal(false);
  };

  // Export / Import Helpers
  const exportColors = () => {
    const data = formData.colors.map(c => ({ color: c }));
    exportToCSV(data, 'colors.csv', ['color']);
  };

  const importColors = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      const lines = e.target.result.trim().split(/\r?\n/).slice(1);
      const colors = lines.map(l => l.split(',')[0].replace(/"/g, '').trim()).filter(Boolean);
      const updated = { ...formData, colors };
      setFormData(updated);
      updateSettings(updated);
    };
    if (file) reader.readAsText(file);
  };

  const exportVendors = () => {
    const data = formData.vendors.map(v => ({ vendor: v }));
    exportToCSV(data, 'vendors.csv', ['vendor']);
  };

  const importVendors = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      const lines = e.target.result.trim().split(/\r?\n/).slice(1);
      const vendors = lines.map(l => l.split(',')[0].replace(/"/g, '').trim()).filter(Boolean);
      const updated = { ...formData, vendors };
      setFormData(updated);
      updateSettings(updated);
    };
    if (file) reader.readAsText(file);
  };

  const exportRawMaterials = () => {
    const data = formData.rawMaterials.map(name => ({
      rawMaterial: name,
      vendor: materialValues[name]?.vendor || '',
      minQuantity: materialValues[name]?.minQuantity || 0,
      pricePerLb: materialValues[name]?.pricePerLb || 0,
      usagePerBatch: materialValues[name]?.usagePerBatch || 0,
      avgBatchesPerDay: materialValues[name]?.avgBatchesPerDay || 0
    }));
    exportToCSV(
      data,
      'raw_materials_settings.csv',
      ['rawMaterial','vendor','minQuantity','pricePerLb','usagePerBatch','avgBatchesPerDay']
    );
  };

  const importRawMaterials = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      const lines = e.target.result.trim().split(/\r?\n/).slice(1);
      const materials = [];
      const values = {};
      lines.forEach(line => {
        const [rawMaterial,vendor,minQty,pricePerLb,usagePerBatch,avgB] = line.split(',').map(s => s.replace(/"/g,'').trim());
        if(rawMaterial){
          materials.push(rawMaterial);
          values[rawMaterial] = {
            vendor: vendor || '',
            minQuantity: parseFloat(minQty) || 0,
            pricePerLb: parseFloat(pricePerLb) || 0,
            usagePerBatch: parseFloat(usagePerBatch) || 0,
            avgBatchesPerDay: parseFloat(avgB) || 0
          };
        }
      });
      const updated = { ...formData, rawMaterials: materials, rawMaterialValues: values };
      setMaterialValues(values);
      setFormData(updated);
      updateSettings(updated);
    };
    if (file) reader.readAsText(file);
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
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span>Colors</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRecipesModal(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Recipes
              </button>
              <button
                onClick={exportColors}
                className="text-sm text-blue-600 hover:underline"
              >
                Export CSV
              </button>
              <label className="text-sm text-blue-600 hover:underline cursor-pointer">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => {
                    importColors(e.target.files[0]);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </h3>
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
            {formData.colors
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map((color, index) => (
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

        {/* Avg Batches / Day */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Avg Batches / Day</h3>
          <div className="mb-4">
            <input
              type="number"
              step="0.01"
              value={formData.avgBatchesPerDay}
              onChange={e => setFormData({ ...formData, avgBatchesPerDay: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Raw Materials Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span>Raw Materials</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowValuesModal(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit Values
              </button>
              <button
                onClick={exportRawMaterials}
                className="text-sm text-blue-600 hover:underline"
              >
                Export CSV
              </button>
              <label className="text-sm text-blue-600 hover:underline cursor-pointer">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => {
                    importRawMaterials(e.target.files[0]);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>
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
            {formData.rawMaterials
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map((material, index) => (
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
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span>Vendors</span>
            <div className="flex gap-2">
              <button
                onClick={exportVendors}
                className="text-sm text-blue-600 hover:underline"
              >
                Export CSV
              </button>
              <label className="text-sm text-blue-600 hover:underline cursor-pointer">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => {
                    importVendors(e.target.files[0]);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </h3>
          
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
            {formData.vendors
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map((vendor, index) => (
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

      {showRecipesModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRecipesModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-h-[80vh] overflow-y-auto w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Recipes</h3>
            {formData.colors
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map(color => (
              <div key={color} className="mb-6">
                <h4 className="font-semibold text-center mb-2">{color}</h4>
                {recipes[color] && recipes[color].length > 0 && (
                  <table className="min-w-full border text-sm mb-2">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 border">Raw Material</th>
                        <th className="px-2 py-1 border">Weight (lbs)</th>
                        <th className="px-2 py-1 border"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes[color].map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1 border">
                            <select
                              value={row.rawMaterial}
                              onChange={e => handleRecipeChange(color, idx, 'rawMaterial', e.target.value)}
                              className="w-full border rounded px-1"
                            >
                              <option value="">Select Raw Material</option>
                              {formData.rawMaterials
                                .slice()
                                .sort((a, b) => a.localeCompare(b))
                                .map(rm => (
                                  <option key={rm} value={rm}>{rm}</option>
                                ))}
                            </select>
                          </td>
                          <td className="px-2 py-1 border">
                            <input
                              type="number"
                              step="0.01"
                              value={row.weight}
                              onChange={e => handleRecipeChange(color, idx, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-full border rounded px-1"
                            />
                          </td>
                          <td className="px-2 py-1 border text-center">
                            <button
                              onClick={() => removeRecipeRow(color, idx)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="flex justify-center">
                  <button
                    onClick={() => addRecipeRow(color)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Add Raw Material
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={saveRecipes}
                className="bg-[#09713c] text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setShowRecipesModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
