import React from "react";
import { X, Package } from "lucide-react";

export default function PartDetailsModal({ part, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">รายละเอียดอะไหล่</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{part.name}</h3>
            <p className="text-gray-600">{part.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                NSN
              </label>
              <p className="mt-1 text-gray-900">{part.nsn || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Part Number
              </label>
              <p className="mt-1 text-gray-900">{part.part_number || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                จำนวนในคลัง
              </label>
              <p className="mt-1 text-gray-900">{part.quantity} ชิ้น</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                ราคาต่อชิ้น
              </label>
              <p className="mt-1 text-gray-900">${part.price.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <p className="mt-1 text-xl font-semibold text-indigo-600">
              ${(part.price * part.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
