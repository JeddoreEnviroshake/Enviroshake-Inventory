import React, { useState, useEffect } from "react";
import { generateCode39Barcode, renderBarcodeSVG } from "../utils/barcode";
const ReceivingView = ({ addRawMaterial, settings }) => {
  const [formData, setFormData] = useState({
    rawMaterial: '',
    poNumber: '',
    vendor: '',
    bagsReceived: '',
    startingWeight: ''
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
    
    // Validate form data
    if (!formData.rawMaterial || !formData.poNumber || !formData.vendor || 
        !formData.bagsReceived || !formData.startingWeight) {
      alert('Please fill in all required fields');
      return;
    }
    
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
      bagsReceived: '',
      startingWeight: ''
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
                placeholder="e.g., 6"
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
                placeholder="e.g., 9259"
                min="0"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#09713c] text-white px-6 py-2 rounded-lg hover:bg-[#09713c] transition-colors"
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
                <h4 className="font-bold text-xl">Enviroshake</h4>
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
                  {renderBarcodeSVG(generateCode39Barcode(generatedBarcode || 'BARCODE'), 250, 60)}
                  <div className="barcode-text font-mono text-sm font-bold mt-2">{generatedBarcode || 'BARCODE-PENDING'}</div>
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

export default ReceivingView;
