"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<void>;
  itemName?: string;
}

export default function DeleteButton({ id, action, itemName = "Item" }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await action(id);
      toast.success(`${itemName} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${itemName.toLowerCase()}`);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Confirm
        </button>
        <button 
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-2 py-1 bg-[#222] hover:bg-[#333] text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowConfirm(true)}
      title="Delete"
      className="p-1.5 text-[#888] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
