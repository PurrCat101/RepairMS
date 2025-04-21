import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

function AddRepairGuide({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    device_name: "",
    issue: "",
    steps: [""],
    parts: [{ name: "", quantity: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedData = {
        device_name: formData.device_name,
        issue: formData.issue,
        steps: { steps: formData.steps.filter((step) => step.trim() !== "") },
        parts: {
          parts: formData.parts.filter((part) => part.name.trim() !== ""),
        },
      };

      const { data, error } = await supabase
        .from("repair_manuals")
        .insert([formattedData])
        .select(); // เพิ่ม select() เพื่อรับข้อมูลที่เพิ่มกลับมา

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }));
  };

  const removeStep = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, index) => index !== indexToRemove),
    }));
  };

  const updateStep = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData((prev) => ({
      ...prev,
      steps: newSteps,
    }));
  };

  const addPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [...prev.parts, { name: "", quantity: "" }],
    }));
  };

  const removePart = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, index) => index !== indexToRemove),
    }));
  };

  const updatePart = (index, field, value) => {
    const newParts = [...formData.parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      parts: newParts,
    }));
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all ease-in-out duration-300 scale-100">
            {/* Header */}
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add New Repair Guide
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Device Name
                    </label>
                    <input
                      type="text"
                      value={formData.device_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          device_name: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue
                    </label>
                    <input
                      type="text"
                      value={formData.issue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          issue: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Repair Steps
                      </label>
                      <button
                        type="button"
                        onClick={addStep}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 text-sm flex items-center shadow-sm hover:shadow-md"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add Step
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.steps.map((step, index) => (
                        <div key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-8 text-sm font-medium text-gray-700 pt-3">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => updateStep(index, e.target.value)}
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 mr-2"
                            placeholder={`Step ${index + 1}`}
                          />
                          {formData.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors duration-200"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Required Parts
                      </label>
                      <button
                        type="button"
                        onClick={addPart}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 text-sm flex items-center shadow-sm hover:shadow-md"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add Part
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.parts.map((part, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <span className="flex-shrink-0 w-8 text-sm font-medium text-gray-700">
                            {index + 1}.
                          </span>
                          <input
                            type="text"
                            value={part.name}
                            onChange={(e) =>
                              updatePart(index, "name", e.target.value)
                            }
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                            placeholder="Part name"
                          />
                          <input
                            type="number"
                            min="1"
                            value={part.quantity}
                            onChange={(e) =>
                              updatePart(index, "quantity", e.target.value)
                            }
                            className="w-24 border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                            placeholder="Qty"
                          />
                          {formData.parts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePart(index)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors duration-200"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-8 py-5 border-t border-gray-100 rounded-b-2xl">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:bg-indigo-300 disabled:shadow-none"
                >
                  {loading ? "Saving..." : "Save Guide"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRepairGuide;
