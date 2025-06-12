import React, { useState } from "react";
import { PRODUCTS, TYPES } from "../constants";


const emptyBundle = { product: "", colour: "", type: "", numberOfBundles: "" };
const emptyBatch = { batchesMade: "", colour: "" };

const ProductionView = ({ addProduction, settings, openAlert, logFormSubmission }) => {
  const [basic, setBasic] = useState({ leadHandName: "", shift: "First" });
  const [production, setProduction] = useState({
    line1Production: "",
    line1Scrap: "",
    line2Production: "",
    line2Scrap: "",
  });
  const [bundles, setBundles] = useState([emptyBundle]);
  const [batches, setBatches] = useState([emptyBatch]);
  const [binLevels, setBinLevels] = useState({
    rubber: 0,
    pp: 0,
    pe: 0,
    lxr: 0,
    hopper1: 0,
    hopper2: 0,
  });
  const [disposal, setDisposal] = useState({
    matilda: "",
    grinder: "",
    magnet: "",
    purges: "",
    others: "",
    line1: "",
    line2: "",
  });
  const [avgWeight, setAvgWeight] = useState({
    line1Product: "",
    line1Weight: "",
    line2Product: "",
    line2Weight: "",
  });
  const [downtime, setDowntime] = useState({
    line1Type: "Scheduled",
    line1Minutes: "",
    line2Type: "Scheduled",
    line2Minutes: "",
  });

  const addBundleRow = () => setBundles((b) => [...b, emptyBundle]);
  const addBatchRow = () => setBatches((b) => [...b, emptyBatch]);
  const deleteBundleRow = (idx) =>
    setBundles((b) => b.filter((_, i) => i !== idx));
  const deleteBatchRow = (idx) =>
    setBatches((b) => b.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();

    bundles.forEach(({ product, colour, type, numberOfBundles }) => {
      if (!product) return;
      addProduction({
        leadHandName: basic.leadHandName,
        product,
        colour,
        type,
        shift: basic.shift,
        numberOfBundles: parseInt(numberOfBundles) || 0,
      });
    });

    logFormSubmission({
      action: 'Lead Hand Log',
      user: `Lead Hand - ${basic.leadHandName}`,
      formData: {
        ...basic,
        ...production,
        averageTileWeight: JSON.stringify(avgWeight),
        downtime: JSON.stringify(downtime),
        bundles: JSON.stringify(bundles),
        batches: JSON.stringify(batches),
        binLevels: JSON.stringify(binLevels),
        disposal: JSON.stringify(disposal)
      }
    });

    setBasic({ leadHandName: "", shift: "First" });
    setProduction({
      line1Production: "",
      line1Scrap: "",
      line2Production: "",
      line2Scrap: "",
    });
    setBundles([emptyBundle]);
    setBatches([emptyBatch]);
    setBinLevels({ rubber: 0, pp: 0, pe: 0, lxr: 0, hopper1: 0, hopper2: 0 });
    setDisposal({ matilda: "", grinder: "", magnet: "", purges: "", others: "", line1: "", line2: "" });
    setAvgWeight({ line1Product: "", line1Weight: "", line2Product: "", line2Weight: "" });
    setDowntime({ line1Type: "Scheduled", line1Minutes: "", line2Type: "Scheduled", line2Minutes: "" });

    openAlert("Production logged successfully!");
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Lead Hand Log Sheet</h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* Basic Fields */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Lead Hand</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Hand</label>
              <input
                type="text"
                value={basic.leadHandName}
                onChange={(e) => setBasic({ ...basic, leadHandName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select
                value={basic.shift}
                onChange={(e) => setBasic({ ...basic, shift: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
              </select>
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Production (pieces)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line 1 Production</label>
              <input
                type="number"
                value={production.line1Production}
                onChange={(e) => setProduction({ ...production, line1Production: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line 1 Scrap</label>
              <input
                type="number"
                value={production.line1Scrap}
                onChange={(e) => setProduction({ ...production, line1Scrap: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line 2 Production</label>
              <input
                type="number"
                value={production.line2Production}
                onChange={(e) => setProduction({ ...production, line2Production: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line 2 Scrap</label>
              <input
                type="number"
                value={production.line2Scrap}
                onChange={(e) => setProduction({ ...production, line2Scrap: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
        </div>
      </div>

        {/* Average Tile Weight */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Average Tile Weight</h3>
          <div className="space-y-4">
            {[
              ["Line 1", "line1"],
              ["Line 2", "line2"],
            ].map(([label, key]) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <select
                    value={avgWeight[`${key}Product`]}
                    onChange={(e) => setAvgWeight({ ...avgWeight, [`${key}Product`]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Product</option>
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                  <input
                    type="number"
                    value={avgWeight[`${key}Weight`]}
                    onChange={(e) => setAvgWeight({ ...avgWeight, [`${key}Weight`]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bundles Strapped */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Bundles Strapped</h3>
          {bundles.map((bundle, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-end"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={bundle.product}
                  onChange={(e) => {
                    const arr = [...bundles];
                    arr[idx] = { ...arr[idx], product: e.target.value };
                    setBundles(arr);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Product</option>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
                <select
                  value={bundle.colour}
                  onChange={(e) => {
                    const arr = [...bundles];
                    arr[idx] = { ...arr[idx], colour: e.target.value };
                    setBundles(arr);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Colour</option>
                  {(settings?.colors || [])
                    .slice()
                    .sort((a, b) => a.localeCompare(b))
                    .map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={bundle.type}
                  onChange={(e) => {
                    const arr = [...bundles];
                    arr[idx] = { ...arr[idx], type: e.target.value };
                    setBundles(arr);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bundles</label>
                <input
                  type="number"
                  value={bundle.numberOfBundles}
                  onChange={(e) => {
                    const arr = [...bundles];
                    arr[idx] = { ...arr[idx], numberOfBundles: e.target.value };
                    setBundles(arr);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => deleteBundleRow(idx)}
                  className="text-red-500 text-2xl font-bold"
                >
                  -
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addBundleRow}
            className="bg-[#09713c] text-white px-4 py-2 rounded-lg hover:bg-[#09713c]"
          >
            Add Product
          </button>
        </div>

        {/* Batches Made */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Batches Made</h3>
          {batches.map((batch, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
                <select
                  value={batch.colour}
                  onChange={(e) => {
                    const arr = [...batches];
                    arr[idx] = { ...arr[idx], colour: e.target.value };
                    setBatches(arr);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Colour</option>
                  {(settings?.colors || [])
                    .slice()
                    .sort((a, b) => a.localeCompare(b))
                    .map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batches Made</label>
                <input
                  type="number"
                  value={batch.batchesMade}
                  onChange={(e) => {
                    const arr = [...batches];
                    arr[idx] = { ...arr[idx], batchesMade: e.target.value };
                    setBatches(arr);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => deleteBatchRow(idx)}
                  className="text-red-500 text-2xl font-bold"
                >
                  -
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addBatchRow}
            className="bg-[#09713c] text-white px-4 py-2 rounded-lg hover:bg-[#09713c]"
          >
            Add Batch
          </button>
        </div>

        {/* Bin Levels */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Bin Levels</h3>
          <div className="space-y-4">
            {[
              ["Rubber", "rubber"],
              ["PP", "pp"],
              ["PE", "pe"],
              ["LXR", "lxr"],
              ["Hopper 1", "hopper1"],
              ["Hopper 2", "hopper2"],
            ].map(([label, key]) => (
              <div key={key} className="flex items-center gap-4">
                <label className="w-28 text-sm font-medium text-gray-700">{label}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={binLevels[key]}
                  onChange={(e) => setBinLevels({ ...binLevels, [key]: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm">{binLevels[key]}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disposal */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Disposal (lbs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
            ["Matilda", "matilda"],
            ["Grinder", "grinder"],
            ["Magnet", "magnet"],
            ["Purges", "purges"],
            ["Others", "others"],
            ["Line 1", "line1"],
            ["Line 2", "line2"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={disposal[key]}
                  onChange={(e) => setDisposal({ ...disposal, [key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Downtime (minutes) */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Downtime (minutes)</h3>
          <div className="space-y-4">
            {[
              ["Line 1", "line1"],
              ["Line 2", "line2"],
            ].map(([label, key]) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <select
                    value={downtime[`${key}Type`]}
                    onChange={(e) => setDowntime({ ...downtime, [`${key}Type`]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Unscheduled">Unscheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={downtime[`${key}Minutes`]}
                    onChange={(e) => setDowntime({ ...downtime, [`${key}Minutes`]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#09713c] text-white px-6 py-2 rounded-lg hover:bg-[#09713c] transition-colors"
        >
          Submit Production
        </button>
      </form>
    </div>
  );
};

export default ProductionView;
