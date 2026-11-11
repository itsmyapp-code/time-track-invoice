import React, { useState, useEffect } from "react";
import { FaUsers, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const DEFAULT_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  town: "",
  county: "",
  postcode: "",
  terms: "",
  dayRate: "",
  halfDayRate: "",
  hourRate: ""
};

const ClientsPage = ({
  clients,
  addClient,
  editClient,
  deleteClient,
  archiveClient,
  savedInvoices,
  appVersion,
  setActiveView
}) => {
  // Dropdown menu state
  // const [menuOpen, setMenuOpen] = useState(false); // Removed
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (showForm) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      console.log("Deep Lock Modal logic active v2");
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [showForm]);

  const filteredClients = clients.filter(c => showArchived ? c.isArchived : !c.isArchived);

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      town: client.town || "",
      county: client.county || "",
      postcode: client.postcode || "",
      terms: client.terms || "",
      dayRate: client.dayRate?.toString() ?? "",
      halfDayRate: client.halfDayRate?.toString() ?? "",
      hourRate: client.hourRate?.toString() ?? ""
    });
    setShowForm(true);
  };

  const handleDelete = (clientId) => {
    if (window.confirm("Delete client?")) {
      deleteClient(clientId);
    }
  };

  const handleSave = () => {
    const clientObj = {
      ...formData,
      dayRate: parseFloat(formData.dayRate) || 0,
      halfDayRate: parseFloat(formData.halfDayRate) || 0,
      hourRate: parseFloat(formData.hourRate) || 0
    };
    if (editingClient) {
      editClient(editingClient.id, clientObj);
    } else {
      addClient(clientObj);
    }
    setShowForm(false);
    setEditingClient(null);
    setFormData(DEFAULT_FORM);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
    setFormData(DEFAULT_FORM);
  };

  // Consistent button and card styles
  const cardClass = "app-card mb-4 rounded-lg shadow-sm bg-white p-2";
  const buttonClass = "app-add-btn flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition";

  return (
    <div className="p-4 pt-8 md:pt-4 max-w-2xl mx-auto">
      {/* Mobile Dropdown Menu Button on the left */}
      {/* Mobile Menu Removed */}
      {/* Add Client Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-slate-800">
          <FaUsers className="text-indigo-600" /> Clients
        </h2>
        <div className="flex gap-2">
          <button
            className="text-gray-600 hover:text-gray-800 font-medium px-3 py-1 border rounded"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
          <button
            className={buttonClass}
            onClick={() => setShowForm(true)}
            aria-label="Add Client"
          >
            <FaPlus /> <span className="hidden sm:inline">Add Client</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClients.length === 0 ? (
          <div className="text-gray-500 mb-4">No {showArchived ? "archived" : "active"} clients found.</div>
        ) : (
          <div className="mb-8">
            {filteredClients.map(client => (
              <div key={client.id} className={cardClass}>
                <div className="font-semibold text-lg mb-1">{client.name}</div>
                <div className="text-gray-700 mb-1"><span className="font-medium">Email:</span> {client.email}</div>
                <div className="text-gray-700 mb-1"><span className="font-medium">Phone:</span> {client.phone}</div>
                <div className="text-gray-700 mb-1">
                  <span className="font-medium">Address:</span> {client.address}
                  {client.town && `, ${client.town}`}
                  {client.county && `, ${client.county}`}
                  {client.postcode && `, ${client.postcode}`}
                </div>
                {client.terms && (
                  <div className="text-gray-600 mt-1">
                    <span className="font-medium">Terms:</span> {client.terms}
                  </div>
                )}
                <div className="text-gray-600 mt-1">
                  <span className="font-medium">Day Rate:</span> £{client.dayRate?.toFixed?.(2) ?? Number(client.dayRate || 0).toFixed(2)}
                  {" • "}
                  <span className="font-medium">Half Day Rate:</span> £{client.halfDayRate?.toFixed?.(2) ?? Number(client.halfDayRate || 0).toFixed(2)}
                  {" • "}
                  <span className="font-medium">Hour Rate:</span> £{client.hourRate?.toFixed?.(2) ?? Number(client.hourRate || 0).toFixed(2)}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    onClick={() => handleEdit(client)}
                    title="Edit Client"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className={`${client.isArchived ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"} text-white px-3 py-1 rounded flex items-center gap-1`}
                    onClick={() => archiveClient(client.id, !client.isArchived)}
                    title={client.isArchived ? "Unarchive" : "Archive"}
                  >
                    {client.isArchived ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    onClick={() => handleDelete(client.id)}
                    title="Delete Client"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[2000] bg-black bg-opacity-40 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 w-full max-w-lg relative" style={{ zIndex: 2001 }}>
              <h3 className="text-xl font-bold mb-4 text-indigo-600">
                {editingClient ? "Edit Client (v2)" : "Add Client (v2)"}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <input
                  className="p-2 border rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Client Name"
                />
                <input
                  className="p-2 border rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                />
                <input
                  className="p-2 border rounded"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone"
                />
                <input
                  className="p-2 border rounded"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Address"
                />
                <input
                  className="p-2 border rounded"
                  value={formData.town}
                  onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                  placeholder="Town"
                />
                <input
                  className="p-2 border rounded"
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  placeholder="County"
                />
                <input
                  className="p-2 border rounded"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  placeholder="Postcode"
                />
                <textarea
                  className="p-2 border rounded"
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  placeholder="Client Terms"
                  rows={2}
                />
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Day Rate (£):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="p-2 border rounded w-full"
                    value={formData.dayRate}
                    onChange={e => setFormData({ ...formData, dayRate: e.target.value })}
                    placeholder="Day Rate"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Half Day Rate (£):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="p-2 border rounded w-full"
                    value={formData.halfDayRate}
                    onChange={e => setFormData({ ...formData, halfDayRate: e.target.value })}
                    placeholder="Half Day Rate"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Hour Rate (£):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="p-2 border rounded w-full"
                    value={formData.hourRate}
                    onChange={e => setFormData({ ...formData, hourRate: e.target.value })}
                    placeholder="Hour Rate"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-1"
                  onClick={handleSave}
                >
                  <FaPlus /> Save
                </button>
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>
              </div>
              <button
                className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={handleCloseForm}
                title="Close"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer matches other pages, see ![image1](image1) */}
      {/* Footer Removed */}
    </div>
  );
};

export default ClientsPage;