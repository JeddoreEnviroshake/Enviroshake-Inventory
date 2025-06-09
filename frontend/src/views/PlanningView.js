import React, { useState, useEffect } from "react";
import { PRODUCTS } from "../constants";

const PlanningView = ({ rawMaterials, settings }) => {
  const [formData, setFormData] = useState({
    product: '',
    colour: '',
    type: '',
    numberOfBundles: ''
  });
  const [result, setResult] = useState(null);
  const [batchInfo, setBatchInfo] = useState(null);

  useEffect(() => {
    const { product, colour, type } = formData;
    if (!product || !colour || !type) {
      setBatchInfo(null);
      return;
    }

    const recipe = settings.colorRecipes?.[colour] || [];
    const sumWeight = recipe.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
    if (recipe.length === 0 || sumWeight === 0) {
      setBatchInfo({ error: 'No recipe found for selected colour.' });
      return;
    }

    const divProduct = product === 'Enviroshake' ? 2 : 2.1;
    const divType = type === 'Bundle' ? 13 : 10;

    const data = recipe.map(r => {
      const perBatch = (parseFloat(r.weight) || 0) / divProduct;
      const available = rawMaterials
        .filter(m => m.rawMaterial === r.rawMaterial)
        .reduce((sum, m) => sum + (parseFloat(m.currentWeight) || 0), 0);
      const possible = perBatch > 0 ? available / perBatch : Infinity;
      return {
        rawMaterial: r.rawMaterial,
        perBatch,
        perBundle: perBatch / divType,
        available,
        possible
      };
    });
    const minBatches = Math.floor(Math.min(...data.map(d => d.possible)) || 0);
    setBatchInfo({ divType, data, minBatches });
  }, [formData.product, formData.colour, formData.type, rawMaterials, settings.colorRecipes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { product, colour, type, numberOfBundles } = formData;
    if (!product || !colour || !type || !numberOfBundles || !batchInfo) return;

    const additional = parseFloat(numberOfBundles);
    if (isNaN(additional) || additional <= 0) return;

    const purchases = batchInfo.data.map(d => {
      const usedForAvailable = batchInfo.minBatches * d.perBatch;
      const leftover = d.available - usedForAvailable;
      const needed = additional * d.perBundle;
      const toBuy = Math.max(0, needed - leftover);
      return { rawMaterial: d.rawMaterial, amount: toBuy };
    }).filter(p => p.amount > 0);

    setResult({ purchases });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Planning</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">Plan Production</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Product</option>
                {PRODUCTS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
              <select
                value={formData.colour}
                onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Colour</option>
                {(settings?.colors || []).slice().sort((a,b)=>a.localeCompare(b)).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                {['Bundle','Cap'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Bundles / Caps</label>
              <input
                type="number"
                value={formData.numberOfBundles}
                onChange={(e) => setFormData({ ...formData, numberOfBundles: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <button type="submit" className="w-full bg-[#09713c] text-white px-6 py-2 rounded-lg hover:bg-[#09713c] transition-colors">
              Check Materials
            </button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">Details</h3>
          {!batchInfo && (
            <p>Select product, colour and type to view available batches.</p>
          )}
          {batchInfo && !batchInfo.error && (
            <div className="space-y-4">
              <p><strong>Total Batches Available:</strong> {batchInfo.minBatches} ({batchInfo.minBatches * batchInfo.divType} bundles/caps)</p>
              {result && result.purchases && result.purchases.length > 0 && (
                <div>
                  <p className="font-semibold">Additional Raw Material Needed:</p>
                  <ul className="list-disc list-inside">
                    {result.purchases.map(p => (
                      <li key={p.rawMaterial}>{`${p.rawMaterial}: ${p.amount.toFixed(1)} lbs`}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result && result.purchases && result.purchases.length === 0 && (
                <p>No additional raw material required for the requested amount.</p>
              )}
            </div>
          )}
          {batchInfo && batchInfo.error && (
            <p className="text-red-600">{batchInfo.error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningView;
