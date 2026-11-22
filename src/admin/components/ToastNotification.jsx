import React from "react";
import { useStudioAdmin } from "../context/StudioAdminContext.jsx";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ToastNotification() {
  const { toast } = useStudioAdmin();
  if (!toast) return null;

  return (
    <div className="studio-toast">
      {toast.type === "error" ? (
        <AlertCircle size={16} style={{ color: "#FFFFFF" }} />
      ) : (
        <CheckCircle2 size={16} style={{ color: "#FFFFFF" }} />
      )}
      <span>{toast.message}</span>
    </div>
  );
}
