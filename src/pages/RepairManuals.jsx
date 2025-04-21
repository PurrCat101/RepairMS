import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AddRepairManual from "../components/RepairManuals/AddRepairManual";
import EditRepairManual from "../components/RepairManuals/EditRepairManual";
import { X, Search, Book, Tool, Package } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-500">Loading repair manuals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-red-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-800">
            Error Loading Data
          </h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold flex items-center text-gray-900">
          <Book className="w-8 h-8 mr-3 text-blue-500" />
          Repair Manuals
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center shadow-sm"
        >
          <svg
            className="w-5 h-5 mr-2"
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
          Add New Manual
        </button>
      </div>

      <div className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by device name or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Tool className="w-5 h-5 mr-2 text-blue-500" />
                  {guide.device_name}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedGuide(guide);
                      setShowEditModal(true);
                    }}
                    className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
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
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
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

              <div className="mb-4">
                <div className="text-lg text-red-600 font-medium flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100">
                    Issue
                  </span>
                  {guide.issue}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                    <Tool className="w-4 h-4 mr-2 text-gray-500" />
                    Repair Steps
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {guide.steps.steps.slice(0, 3).map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="font-medium mr-2">{index + 1}.</span>
                        <span className="line-clamp-2">{step}</span>
                      </li>
                    ))}
                    {guide.steps.steps.length > 3 && (
                      <li className="text-blue-500 text-sm">
                        +{guide.steps.steps.length - 3} more steps...
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-500" />
                    Required Parts
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guide.parts.parts.map((part, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {part.name} ({part.quantity})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGuides.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No repair manuals found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search terms or add a new manual
          </p>
        </div>
      )}

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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirm Delete
              </h2>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedGuide(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete the repair manual for "
              <span className="font-medium text-gray-900">
                {selectedGuide.device_name}
              </span>
              "? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedGuide(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepairGuide;
