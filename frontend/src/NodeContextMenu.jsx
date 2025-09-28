import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const NodeContextMenu = ({ position, onDelete, onClose }) => {
  if (!position) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-lg border p-2 min-w-[120px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </>
  );
};

export default NodeContextMenu;