import React, { useState } from "react";
import { PRODUCTS } from "../constants";

const PlanningView = ({ rawMaterials, settings }) => {
  const [formData, setFormData] = useState({
    product: '',
    colour: '',
    type: '',
    numberOfBundles: ''
  });
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { product, colour, type, numberOfBundles } = formData;
    if (!product || !colour || !type || !numberOfBundles) return;

    const recipe = settings.colorRecipes?.[colour] || [];
    const sumWeight = recipe.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
    if (recipe.length === 0 || sumWeight === 0) {
      setResult({ error: 'No recipe found for selected colour.' });
      return;
    }

    const divProduct = product === 'Enviroshake' ? 2 : 2.1;
    const divType = type === 'Bundle' ? 13 : 10;

    const required = recipe.map(r => {
      const perBundle = (parseFloat(r.weight) || 0) / divProduct / divType;
      return {
        rawMaterial: r.rawMaterial,
        requiredWeight: perBundle * parseFloat(numberOfBundles)
      };
    });

    const shortages = required.filter(req => {
      const available = rawMaterials
        .filter(m => m.rawMaterial === req.rawMaterial)
        .reduce((sum, m) => sum + (parseFloat(m.currentWeight) || 0), 0);
      req.available = available;
      return available < req.requiredWeight;
    });

    if (shortages.length === 0) {
      setResult({ enough: true, required });
    } else {
      setResult({ enough: false, shortages });
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Planning</h2>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6">Check Order Feasibility</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bundles / Caps</label>
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
          {result && !result.error && (
            <div className={`mt-6 p-4 rounded-lg border ${result.enough ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {result.enough ? (
                <p>Enough raw material is available for this order.</p>
              ) : (
                <div>
                  <p className="font-semibold mb-2">Insufficient Raw Material:</p>
                  <ul className="list-disc list-inside">
                    {result.shortages.map(s => (
                      <li key={s.rawMaterial}>{`${s.rawMaterial}: need ${s.requiredWeight.toFixed(1)} lbs, have ${s.available.toFixed(1)} lbs`}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {result && result.error && (
            <p className="mt-4 text-red-600">{result.error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningView;
