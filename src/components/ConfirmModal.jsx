import React from "react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยัน",
  message = "คุณต้องการดำเนินการต่อหรือไม่?",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  confirmButtonClass = "bg-indigo-600 hover:bg-indigo-700",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-sm w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
