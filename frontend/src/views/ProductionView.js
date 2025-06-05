import React, { useState } from "react";
import { PRODUCTS, TYPES } from "../constants";
const ProductionView = ({ addProduction, settings, openAlert }) => {
  const [formData, setFormData] = useState({
    leadHandName: '',
    product: '',
    colour: '',
    type: '',
    shift: 'First',
    numberOfBundles: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addProduction({
      ...formData,
      numberOfBundles: parseInt(formData.numberOfBundles),
      shift: formData.shift,
      leadHandName: formData.leadHandName
    });
    
    // Reset form
    setFormData({
      leadHandName: '',
      product: '',
      colour: '',
      type: '',
      shift: 'First',
      numberOfBundles: ''
    });
    
    openAlert('Production logged successfully!');
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
              <select
                value={formData.colour}
                onChange={(e) => setFormData({...formData, colour: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Colour</option>
                {(settings?.colors || [])
                  .slice()
                  .sort((a, b) => a.localeCompare(b))
                  .map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Hand</label>
              <input
                type="text"
                value={formData.leadHandName}
                onChange={(e) => setFormData({...formData, leadHandName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lead hand name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bundles</label>
              <input
                type="number"
                value={formData.numberOfBundles}
                onChange={(e) => setFormData({...formData, numberOfBundles: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 25"
                min="1"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#09713c] text-white px-6 py-2 rounded-lg hover:bg-[#09713c] transition-colors"
            >
              Submit Production
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductionView;
