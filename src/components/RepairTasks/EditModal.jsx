import React from "react";
import { toast } from "react-hot-toast";
import NotificationService from "../../services/NotificationService";
import ExportPDFButton from "./ExportPDFButton";

export default function EditModal({
  isOpen,
  onClose,
  selectedLog,
  editForm,
  setEditForm,
  handleSubmit,
  users,
  sparePartSearch,
  setSparePartSearch,
  spareParts,
  handleAddSparePart,
  selectedSpareParts,
  handleSparePartQuantityChange,
  handleRemoveSparePart,
  user, // เพิ่ม prop user
}) {
  if (!isOpen) return null;

  const pdfData = {
    ...editForm,
    spare_parts: selectedSpareParts.map((sp) => ({
      name: sp.spare_part.name,
      part_number: sp.spare_part.part_number,
      quantity: sp.quantity,
    })),
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.device_name.trim() || !editForm.issue.trim()) {
      toast.error("Device name and Issue are required");
      return;
    }

    try {
      console.log("Form submission started:", {
        isNewTask: !selectedLog?.id,
        formData: editForm,
      });

      const result = await handleSubmit(e);

      console.log("Form submission result:", result);
      const currentTime = new Date().toISOString();

      if (result?.taskId) {
        console.log("Processing new task notification");

        // สร้างการแจ้งเตือนสำหรับงานใหม่
        await NotificationService.createNewTaskNotification(
          user.id,
          editForm.device_name,
          editForm.issue,
          result.taskId
        );

        // ถ้ามีการมอบหมายงานตั้งแต่ตอนสร้างงาน
        if (editForm.assigned_user_id) {
          await NotificationService.createTaskAssignedNotification(
            editForm.assigned_user_id,
            editForm.device_name,
            editForm.issue,
            result.taskId,
            user.full_name || "ไม่ระบุชื่อ"
          );
        }
      } else if (selectedLog?.id) {
        // กรณีอัพเดทงาน
        const isAssignmentChanged =
          selectedLog.assigned_user_id !== editForm.assigned_user_id;

        // ถ้ามีการเปลี่ยนแปลงการมอบหมายงาน และมีผู้รับมอบหมายใหม่
        if (isAssignmentChanged && editForm.assigned_user_id) {
          await NotificationService.createTaskAssignedNotification(
            editForm.assigned_user_id,
            editForm.device_name,
            editForm.issue,
            selectedLog.id,
            user.full_name || "ไม่ระบุชื่อ"
          );
        }

        // ถ้ามีการเปลี่ยนสถานะ
        if (
          selectedLog.status !== editForm.status &&
          (editForm.status === "completed" || editForm.status === "incompleted")
        ) {
          const userFullName =
            users.find((u) => u.id === user.id)?.full_name || "ไม่ระบุชื่อ";

          // แปลง role เป็นภาษาไทย
          const roleMap = {
            admin: "ผู้ดูแลระบบ",
            officer: "เจ้าหน้าที่",
            technician: "ช่างเทคนิค",
          };
          const userRole = roleMap[user.role] || "ไม่ระบุ";

          await NotificationService.createStatusChangeNotification(
            user.id,
            editForm.device_name,
            editForm.issue,
            editForm.status,
            userFullName,
            userRole,
            selectedLog.id
          );
        }
      }
    } catch (err) {
      console.error("Error in handleFormSubmit:", err);
      toast.error("An unexpected error occurred");
    }
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
                {selectedLog?.id ? "Edit Repair Log" : "Add New Repair Log"}
              </h2>
              {selectedLog?.id && (
                <ExportPDFButton
                  pdfData={pdfData}
                  users={users}
                  taskId={selectedLog.id}
                />
              )}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <form onSubmit={handleFormSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Device name
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.device_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          device_name: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      value={editForm.issue}
                      onChange={(e) =>
                        setEditForm({ ...editForm, issue: e.target.value })
                      }
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="incompleted">Incomplete</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <select
                      value={editForm.assigned_user_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          assigned_user_id: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {users
                        .filter((user) => user.role === "technician")
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Spare Parts
                    </label>
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="text"
                        value={sparePartSearch}
                        onChange={(e) => setSparePartSearch(e.target.value)}
                        placeholder="Search spare parts..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                      />
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <div className="max-h-40 overflow-y-auto">
                        {spareParts
                          .filter((part) =>
                            part.name
                              .toLowerCase()
                              .includes(sparePartSearch.toLowerCase())
                          )
                          .map((part) => {
                            const isSelected = selectedSpareParts.some(
                              (sp) => sp.spare_part_id === part.id
                            );
                            return (
                              <div
                                key={part.id}
                                className={`flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${
                                  isSelected
                                    ? "bg-gray-50/90 cursor-not-allowed opacity-60"
                                    : "cursor-pointer"
                                }`}
                                onClick={() => {
                                  if (!isSelected) {
                                    handleAddSparePart(part.id);
                                  }
                                }}
                              >
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {part.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {part.part_number}
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="text-sm text-gray-600 mr-3 font-medium">
                                    ${part.price}
                                  </div>
                                  {isSelected && (
                                    <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">
                                      Added
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {selectedSpareParts.map((sp) => (
                        <div
                          key={sp.spare_part_id}
                          className="flex items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                        >
                          <div>
                            <div className="font-medium text-gray-800">
                              {sp.spare_part.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {sp.spare_part.part_number}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <input
                              type="number"
                              min="1"
                              value={sp.quantity}
                              onChange={(e) =>
                                handleSparePartQuantityChange(
                                  sp.spare_part_id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-24 border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveSparePart(sp.spare_part_id);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                            >
                              Remove
                            </button>
                          </div>
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
                  onClick={handleFormSubmit}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  {selectedLog?.id ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
