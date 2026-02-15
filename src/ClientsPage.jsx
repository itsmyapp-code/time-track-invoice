import React, { useState } from "react";
import { FaUser, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

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
  halfDayRate: ""
};

const ClientsPage = ({
  clients,
  addClient,
  editClient,
  deleteClient,
  savedInvoices,
  appVersion
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [editingClient, setEditingClient] = useState(null);

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
      halfDayRate: client.halfDayRate?.toString() ?? ""
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
      halfDayRate: parseFloat(formData.halfDayRate) || 0
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

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <FaUser /> Clients
        </h2>
        {/* Updated button style to match other pages (see ![image1](image1)) */}
        <button
          className="app-add-btn mt-2 sm:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow transition duration-200"
          onClick={() => {
            setShowForm(true);
            setEditingClient(null);
            setFormData(DEFAULT_FORM);
          }}
          style={{
            minWidth: 140,
            justifyContent: 'center',
            fontSize: '16px'
          }}
        >
          <FaPlus size={18} /> Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clients && clients.map((client) => (
          <div key={client.id || client.email} className="app-card bg-white rounded-lg shadow-md p-4">
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

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" style={{ zIndex: 2000 }}>
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative" style={{ zIndex: 2001 }}>
            <h3 className="text-xl font-bold mb-4">
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
      )}

      {/* Footer matches other pages, see ![image1](image1) */}
      <footer className="app-footer" style={{textAlign: "center", marginTop: "32px"}}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          borderBottom: "1px solid #ccc"
        }}>
          <img src={`/logo.png?v=${new Date().getTime()}`} alt="" style={{ height: "36px", width: "36px", objectFit: "contain" }} />
          <img src={`/itsmyapp-logo.png?v=${new Date().getTime()}`} alt="" style={{ height: "36px", width: "36px", objectFit: "contain" }} />
        </div>
      </footer>
    </div>
  );
};

export default ClientsPage;