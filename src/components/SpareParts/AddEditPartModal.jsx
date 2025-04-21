import React from "react";
import { X } from "lucide-react";

export default function AddEditPartModal({
  isOpen,
  onClose,
  onSubmit,
  part,
  setPart,
  mode = "add",
}) {
  if (!isOpen) return null;

  const title = mode === "add" ? "Add New Spare Part" : "Edit Spare Part";
  const submitText = mode === "add" ? "Add Part" : "Update Part";

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all ease-in-out duration-300 scale-100">
            {/* Header */}
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={part.name}
                    onChange={(e) => setPart({ ...part, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={part.description}
                    onChange={(e) =>
                      setPart({ ...part, description: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NSN
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={part.nsn}
                    onChange={(e) => setPart({ ...part, nsn: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Part Number
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={part.part_number}
                    onChange={(e) =>
                      setPart({ ...part, part_number: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={part.quantity}
                    onChange={(e) =>
                      setPart({ ...part, quantity: parseInt(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={part.price}
                    onChange={(e) =>
                      setPart({ ...part, price: parseFloat(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  />
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
                  onClick={onSubmit}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  {submitText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
