import React, { useState, useEffect } from "react";
import { useStudioAdmin, formatINR } from "../context/StudioAdminContext.jsx";
import { X, DollarSign, CheckCircle2 } from "lucide-react";

export default function LogPaymentModal() {
  const {
    logPaymentModalOpen,
    setLogPaymentModalOpen,
    paymentTargetProject,
    setPaymentTargetProject,
    logPayment,
  } = useStudioAdmin();

  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("Client Milestone Payment");

  useEffect(() => {
    if (paymentTargetProject) {
      setAmount(paymentTargetProject.due > 0 ? paymentTargetProject.due : 25000);
      setNote(`Final Balance Settlement — ${paymentTargetProject.name}`);
    }
  }, [paymentTargetProject]);

  if (!logPaymentModalOpen || !paymentTargetProject) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    logPayment(paymentTargetProject.id, amount, note);
  };

  return (
    <div
      className="studio-modal-overlay"
      onClick={() => {
        setLogPaymentModalOpen(false);
        setPaymentTargetProject(null);
      }}
    >
      <div className="studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="studio-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <DollarSign size={18} style={{ color: "#111111" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111111", margin: 0 }}>
              Log Client Shoot Payment
            </h3>
          </div>
          <button
            type="button"
            className="studio-btn-secondary studio-btn-sm"
            style={{ width: "28px", height: "28px", padding: 0, justifyContent: "center" }}
            onClick={() => {
              setLogPaymentModalOpen(false);
              setPaymentTargetProject(null);
            }}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="studio-modal-body">
            <div style={{ background: "#FAF9F6", border: "1px solid #EAEAEA", borderRadius: "8px", padding: "14px", marginBottom: "18px" }}>
              <div style={{ fontSize: "11px", color: "var(--studio-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Target Commission
              </div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#111111", marginTop: "2px" }}>
                {paymentTargetProject.name}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--studio-text-muted)", marginTop: "4px" }}>
                Client: {paymentTargetProject.client} · Total Quote: {formatINR(paymentTargetProject.quote)} · Current Due: <strong>{formatINR(paymentTargetProject.due)}</strong>
              </div>
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Payment Amount (₹ INR) *</label>
              <input
                type="number"
                required
                className="studio-input studio-mono"
                style={{ fontSize: "16px", fontWeight: "600" }}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label">Milestone / Transaction Note</label>
              <input
                type="text"
                className="studio-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="studio-modal-footer">
            <button
              type="button"
              className="studio-btn-secondary"
              onClick={() => {
                setLogPaymentModalOpen(false);
                setPaymentTargetProject(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="studio-btn-primary">
              <CheckCircle2 size={14} />
              Confirm Payment Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
