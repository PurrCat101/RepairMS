import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AddRepairManual from "../components/AddRepairManual";
import EditRepairManual from "../components/EditRepairManual";

function RepairGuide() {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
            />
          </svg>
          Repair Manuals
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
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

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by device name or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
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

      {filteredGuides.map((guide) => (
        <div
          key={guide.id}
          className="bg-white rounded-lg shadow-md mb-6 p-6 border border-gray-200"
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold text-blue-600">
              {guide.device_name}
            </h2>
            <button
              onClick={() => {
                setSelectedGuide(guide);
                setShowEditModal(true);
              }}
              className="text-gray-600 hover:text-blue-600 flex items-center"
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
          </div>

          <div className="text-xl text-red-600 mb-6">Issue: {guide.issue}</div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Repair Steps:</h3>
            <ul className="space-y-2">
              {guide.steps.steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Required Parts:</h3>
            <div className="flex flex-wrap gap-2">
              {guide.parts.parts.map((part, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-200"
                >
                  {part.name} ({part.quantity})
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

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
    </div>
  );
}

export default RepairGuide;
