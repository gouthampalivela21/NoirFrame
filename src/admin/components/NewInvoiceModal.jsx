import React, { useState, useEffect } from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import { X, Plus, Receipt } from "lucide-react";

export default function NewInvoiceModal() {
  const { newInvoiceModalOpen, setNewInvoiceModalOpen, projects, addInvoice } = useStudioAdmin();

  const [formData, setFormData] = useState({
    projectId: "",
    client: "",
    project: "",
    amount: "",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    status: "Balance Due",
  });

  useEffect(() => {
    if (projects.length > 0 && !formData.projectId) {
      const p = projects[0];
      setFormData((prev) => ({
        ...prev,
        projectId: p.id,
        client: p.client,
        project: p.name,
        amount: p.due > 0 ? p.due : p.quote,
      }));
    }
  }, [projects, formData.projectId]);

  if (!newInvoiceModalOpen) return null;

  const handleProjectSelect = (projId) => {
    const sel = projects.find((p) => p.id === projId);
    if (sel) {
      setFormData({
        ...formData,
        projectId: sel.id,
        client: sel.client,
        project: sel.name,
        amount: sel.due > 0 ? sel.due : sel.quote,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.client || !formData.amount) return;
    addInvoice({
      ...formData,
      amount: Number(formData.amount) || 0,
    });
  };

  return (
    <div className="studio-modal-overlay" onClick={() => setNewInvoiceModalOpen(false)}>
      <div className="studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="studio-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Receipt size={18} style={{ color: "#111111" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111111", margin: 0 }}>
              Issue Client Milestone Invoice
            </h3>
          </div>
          <button
            type="button"
            className="studio-btn-secondary studio-btn-sm"
            style={{ width: "28px", height: "28px", padding: 0, justifyContent: "center" }}
            onClick={() => setNewInvoiceModalOpen(false)}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="studio-modal-body">
            {projects.length > 0 ? (
              <div className="studio-form-group">
                <label className="studio-form-label">Link to Shoot Project</label>
                <select
                  className="studio-select"
                  value={formData.projectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                >
                  <option value="">Select a commission...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.client}) — Balance: {formatINR(p.due)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="studio-form-group">
                <label className="studio-form-label">Project / Commission Name *</label>
                <input
                  type="text"
                  required
                  className="studio-input"
                  placeholder="e.g. Autumn Lookbook Shoot"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                />
              </div>
            )}

            <div className="studio-form-group">
              <label className="studio-form-label">Client / Patron *</label>
              <input
                type="text"
                required
                className="studio-input"
                placeholder="Client name"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="studio-form-group">
                <label className="studio-form-label">Invoice Amount (₹ INR) *</label>
                <input
                  type="number"
                  required
                  className="studio-input studio-mono"
                  placeholder="e.g. 50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="studio-form-group">
                <label className="studio-form-label">Due Date *</label>
                <input
                  type="date"
                  required
                  className="studio-input studio-mono"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Initial Invoice Status</label>
              <select
                className="studio-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Balance Due">Balance Due</option>
                <option value="Paid">Paid in Full</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="studio-modal-footer">
            <button
              type="button"
              className="studio-btn-secondary"
              onClick={() => setNewInvoiceModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="studio-btn-primary">
              <Plus size={14} />
              Issue & Record Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
