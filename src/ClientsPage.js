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

  // Consistent button and card styles (ItsMyApp Light-Mode Standard)
  const cardClass = "mb-4 rounded-2xl border border-slate-200 shadow-sm bg-white p-5";
  const buttonClass = "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition-colors";

  return (
    <div className="p-2 md:p-4 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <h2 className="text-2xl font-extrabold flex items-center gap-2.5 text-slate-900 tracking-tight">
          <FaUsers className="text-blue-700" /> Clients
        </h2>
        <div className="flex gap-2.5">
          <button
            className="text-slate-700 bg-white hover:bg-slate-50 font-semibold text-sm px-4 py-2.5 border border-slate-200 rounded-xl shadow-xs transition-colors"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
            No {showArchived ? "archived" : "active"} clients found.
          </div>
        ) : (
          <div className="mb-8">
            {filteredClients.map(client => (
              <div key={client.id} className={cardClass}>
                <div className="font-extrabold text-lg text-slate-900 mb-1.5">{client.name}</div>
                <div className="text-sm text-slate-700 mb-1"><span className="font-semibold text-slate-900">Email:</span> {client.email || "-"}</div>
                <div className="text-sm text-slate-700 mb-1"><span className="font-semibold text-slate-900">Phone:</span> {client.phone || "-"}</div>
                <div className="text-sm text-slate-700 mb-1">
                  <span className="font-semibold text-slate-900">Address:</span> {client.address}
                  {client.town && `, ${client.town}`}
                  {client.county && `, ${client.county}`}
                  {client.postcode && `, ${client.postcode}`}
                </div>
                {client.terms && (
                  <div className="text-sm text-slate-600 mt-1">
                    <span className="font-semibold text-slate-900">Terms:</span> {client.terms}
                  </div>
                )}
                <div className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1">
                  <span><strong className="text-slate-900">Day Rate:</strong> £{client.dayRate?.toFixed?.(2) ?? Number(client.dayRate || 0).toFixed(2)}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span><strong className="text-slate-900">Half Day Rate:</strong> £{client.halfDayRate?.toFixed?.(2) ?? Number(client.halfDayRate || 0).toFixed(2)}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span><strong className="text-slate-900">Hour Rate:</strong> £{client.hourRate?.toFixed?.(2) ?? Number(client.hourRate || 0).toFixed(2)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                    onClick={() => handleEdit(client)}
                    title="Edit Client"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className={`${client.isArchived ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-500 hover:bg-orange-600"} text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors`}
                    onClick={() => archiveClient(client.id, !client.isArchived)}
                    title={client.isArchived ? "Unarchive" : "Archive"}
                  >
                    {client.isArchived ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-xs overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-lg relative" style={{ zIndex: 2001 }}>
              <h3 className="text-xl font-extrabold mb-4 text-slate-900">
                {editingClient ? "Edit Client" : "Add Client"}
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