import React from "react";
import { X, Book } from "lucide-react";

export default function RepairManualDetailsModal({ guide, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Book className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">รายละเอียดคู่มือซ่อม</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {guide.device_name}
            </h3>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                ปัญหา: {guide.issue}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              ขั้นตอนการซ่อม:
            </h4>
            <ol className="list-decimal list-inside space-y-2">
              {guide.steps.steps.map((step, index) => (
                <li key={index} className="text-gray-700">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">
              อะไหล่ที่ต้องใช้:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guide.parts.parts.map((part, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                >
                  <span className="text-gray-700">{part.name}</span>
                  <span className="text-gray-500">จำนวน: {part.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
