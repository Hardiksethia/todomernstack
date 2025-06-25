import React from "react";
import button from './button';

export function AlertDialog({ open, onClose, onConfirm, title, description }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="rounded-md bg-white p-6 shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex justify-end gap-2">
          <button variant="ghost" onClick={onClose}>Cancel</button>
          <button variant="default" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
export default AlertDialog;