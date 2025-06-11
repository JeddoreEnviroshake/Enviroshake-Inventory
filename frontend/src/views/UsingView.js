import React, { useState } from "react";
const UsingView = ({ rawMaterials, openCheckouts, checkoutRawMaterial, checkinRawMaterial, openAlert, logFormSubmission }) => {
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
  const [mode, setMode] = useState('checkout');
  const [selectedCheckoutId, setSelectedCheckoutId] = useState('');

  const isCheckedOut =
    mode === 'checkout' && openCheckouts.some(c => c.barcode === formData.barcode);

  const handleBarcodeChange = (e) => {
    const barcode = e.target.value;
    setFormData({ ...formData, barcode });

    if (mode === 'checkout') {
      const material = rawMaterials.find(m => m.barcode === barcode);
      setScannedMaterial(material);
    } else {
      const entry = openCheckouts.find(c => c.barcode === barcode);
      if (entry) {
        setSelectedCheckoutId(entry.id.toString());
        const material = rawMaterials.find(m => m.barcode === barcode);
        setScannedMaterial(material);
        setFormData({
          ...formData,
          barcode,
          weightIn: entry.weightIn,
          weightOut: '',
          estimatedSpillage: '',
          finishedBag: 'Yes',
          notes: ''
        });
      } else {
        setSelectedCheckoutId('');
        setScannedMaterial(null);
      }
    }
  };

  const handleSelectCheckout = (e) => {
    const id = parseInt(e.target.value, 10);
    setSelectedCheckoutId(e.target.value);
    const entry = openCheckouts.find(c => c.id === id);
    if (entry) {
      const material = rawMaterials.find(m => m.barcode === entry.barcode);
      setScannedMaterial(material);
      setFormData({
        ...formData,
        barcode: entry.barcode,
        weightIn: entry.weightIn,
        weightOut: '',
        estimatedSpillage: '',
        finishedBag: 'Yes',
        notes: ''
      });
    } else {
      setScannedMaterial(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'checkout') {
      if (!scannedMaterial) {
        openAlert('Please scan a valid barcode');
        return;
      }
      checkoutRawMaterial({
        barcode: formData.barcode,
        leadHandName: formData.leadHandName,
        weightIn: parseFloat(formData.weightIn)
      });
      logFormSubmission({
        action: 'Initial Weight',
        user: `Lead Hand - ${formData.leadHandName}`,
        itemId: formData.barcode,
        formData: { barcode: formData.barcode, leadHandName: formData.leadHandName, weightIn: formData.weightIn }
      });
      openAlert('Material checked out successfully!');
    } else {
      if (!selectedCheckoutId) {
        openAlert('Please select a checkout record');
        return;
      }
      checkinRawMaterial(
        parseInt(selectedCheckoutId, 10),
        parseFloat(formData.weightOut),
        parseFloat(formData.estimatedSpillage) || 0,
        formData.finishedBag,
        formData.notes
      );
      logFormSubmission({
        action: 'End Weight',
        user: `Lead Hand - ${formData.leadHandName}`,
        itemId: formData.barcode,
        formData: {
          barcode: formData.barcode,
          weightOut: formData.weightOut,
          estimatedSpillage: formData.estimatedSpillage,
          finishedBag: formData.finishedBag,
          notes: formData.notes
        }
      });
      openAlert('Material checked in successfully!');
      setSelectedCheckoutId('');
    }

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
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Using Raw Materials</h2>

      <div className="mb-4 space-x-2">
        <button
          type="button"
          onClick={() => setMode('checkout')}
          className={`px-4 py-2 rounded ${mode === 'checkout' ? 'bg-[#09713c] text-white' : 'bg-gray-200'}`}
        >
          Initial Weight
        </button>
        <button
          type="button"
          onClick={() => setMode('checkin')}
          className={`px-4 py-2 rounded ${mode === 'checkin' ? 'bg-[#09713c] text-white' : 'bg-gray-200'}`}
        >
          End Weight
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">{mode === 'checkout' ? 'Check Out Material' : 'Check In Material'}</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'checkout' && (
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
            )}

            {mode === 'checkin' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scan Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={handleBarcodeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Scan or enter barcode"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Checkout</label>
                  <select
                    value={selectedCheckoutId}
                    onChange={handleSelectCheckout}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select...</option>
                    {openCheckouts.map(co => (
                      <option key={co.id} value={co.id}>
                        {co.barcode} - {co.leadHandName}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {mode === 'checkout' && (
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
            )}

            {mode === 'checkout' && (
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
            )}

            {mode === 'checkin' && (
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
            )}

            {mode === 'checkin' && (
              <>
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
              </>
            )}

            <button
              type="submit"
              className="w-full bg-[#09713c] text-white px-6 py-2 rounded-lg hover:bg-[#09713c] transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={mode === 'checkout' ? !scannedMaterial || isCheckedOut : !selectedCheckoutId || !formData.weightOut}
            >
              Record Weight
            </button>
          </form>
        </div>

        {/* Material Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">Scanned Material Info</h3>
          
          {scannedMaterial ? (
            <div className="space-y-4">
              <div className={`${isCheckedOut ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'} rounded-lg p-4`}>
                <h4 className={`font-medium mb-2 ${isCheckedOut ? 'text-orange-800' : 'text-green-800'}`}>{isCheckedOut ? '⚠️ Material Checked Out' : '✓ Material Found'}</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Raw Material:</strong> {scannedMaterial.rawMaterial}</div>
                  <div><strong>Vendor:</strong> {scannedMaterial.vendor}</div>
                  <div><strong>PO Number:</strong> {scannedMaterial.poNumber}</div>
                  <div><strong>Current Weight:</strong> {scannedMaterial.currentWeight.toLocaleString()} lbs</div>
                  <div><strong>Bags Available:</strong> {scannedMaterial.bagsAvailable}</div>
                  <div><strong>Expected Bag Weight:</strong> {scannedMaterial.bagsAvailable ? (scannedMaterial.currentWeight / scannedMaterial.bagsAvailable).toFixed(1) : 'N/A'} lbs</div>
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
              <p>{mode === 'checkout' ? 'Scan a barcode to view material information' : 'Scan a barcode or select a checkout above'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsingView;
