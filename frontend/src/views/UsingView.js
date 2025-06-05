import React, { useState } from "react";
const UsingView = ({ rawMaterials, useRawMaterial, openAlert }) => {
  const [formData, setFormData] = useState({
    barcode: '',
    leadHandName: '',
    weightIn: '',
    weightOut: '',
    estimatedSpillage: '',
    finishedBag: 'Yes',
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
      openAlert('Please scan a valid barcode');
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
      weightIn: '',
      weightOut: '',
      estimatedSpillage: '',
      finishedBag: 'Yes',
      notes: ''
    });
    setScannedMaterial(null);

    openAlert('Material usage recorded successfully!');
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
                placeholder="e.g., 1500.5"
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
                placeholder="e.g., 15.2"
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
                placeholder="e.g., 2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finished Bag?</label>
              <select
                value={formData.finishedBag}
                onChange={(e) => setFormData({...formData, finishedBag: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
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
              className="w-full bg-[#09713c] text-white px-6 py-2 rounded-lg hover:bg-[#09713c] transition-colors"
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
                      <strong>Material Used: {(parseFloat(formData.weightIn) - parseFloat(formData.weightOut)).toFixed(1)} lbs</strong>
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

export default UsingView;
