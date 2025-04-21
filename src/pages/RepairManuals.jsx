import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AddRepairManual from "../components/RepairManuals/AddRepairManual";
import EditRepairManual from "../components/RepairManuals/EditRepairManual";
import RepairManualDetailsModal from "../components/RepairManuals/RepairManualDetailsModal";
import { X, Book } from "lucide-react";

function RepairGuide() {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedGuideForDetails, setSelectedGuideForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchRepairGuides();
  }, []);

  useEffect(() => {
    const filtered = guides.filter(
      (guide) =>
        guide.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.issue.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGuides(filtered);
  }, [searchTerm, guides]);

  const fetchRepairGuides = async () => {
    try {
      const { data, error } = await supabase.from("repair_manuals").select("*");

      if (error) throw error;
      setGuides(data);
      setFilteredGuides(data);
      console.log(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGuide) return;

    try {
      const { error: deleteError } = await supabase
        .from("repair_manuals")
        .delete()
        .eq("id", selectedGuide.id);

      if (deleteError) {
        setError("Error deleting repair manual");
        return;
      }

      setShowDeleteDialog(false);
      setSelectedGuide(null);
      fetchRepairGuides();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Book className="h-6 w-6 text-indigo-600" />
          Repair Manuals
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add New Manual
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by device name or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition hover:shadow-lg"
            onClick={(e) => {
              // Prevent opening details modal when clicking edit or delete buttons
              if (!e.target.closest("button")) {
                setSelectedGuideForDetails(guide);
                setIsDetailsModalOpen(true);
              }
            }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {guide.device_name}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGuide(guide);
                      setShowEditModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGuide(guide);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
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
                </div>
              </div>

              <div className="mt-3">
                <div className="text-red-600 font-medium">
                  Issue: {guide.issue}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Repair Steps:
                </h3>
                <ul className="mt-2 space-y-1">
                  {guide.steps.steps.slice(0, 3).map((step, index) => (
                    <li key={index} className="text-sm text-gray-500">
                      {index + 1}. {step}
                    </li>
                  ))}
                  {guide.steps.steps.length > 3 && (
                    <li className="text-sm text-gray-500">...</li>
                  )}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Required Parts:
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {guide.parts.parts.map((part, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {part.name} ({part.quantity})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddRepairManual
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchRepairGuides();
            setShowAddModal(false);
          }}
        />
      )}

      {showEditModal && selectedGuide && (
        <EditRepairManual
          guide={selectedGuide}
          onClose={() => {
            setShowEditModal(false);
            setSelectedGuide(null);
          }}
          onSuccess={() => {
            fetchRepairGuides();
            setShowEditModal(false);
            setSelectedGuide(null);
          }}
        />
      )}

      {showDeleteDialog && selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedGuide(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="mb-6 text-gray-700">
              Are you sure you want to delete the repair manual for "
              {selectedGuide.device_name}"? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedGuide(null);
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <RepairManualDetailsModal
        guide={selectedGuideForDetails}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedGuideForDetails(null);
        }}
      />
    </div>
  );
}

export default RepairGuide;
