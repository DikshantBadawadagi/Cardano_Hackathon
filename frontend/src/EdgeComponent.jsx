import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleEdgeClick = (event) => {
    event.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = () => {
    if (data?.onEdgeDelete && data?.edgeData) {
      data.onEdgeDelete(id, data.edgeData);
    }
    setShowMenu(false);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      <BaseEdge path={edgePath} />
      
      <EdgeLabelRenderer>
        {/* Edge Label with Condition Text */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div 
            onClick={handleEdgeClick}
            className="bg-white border border-gray-300 rounded px-2 py-1 text-xs shadow-sm cursor-pointer hover:bg-gray-50 max-w-[150px] text-black"
          >
            {data?.edgeData?.condition?.prompt || 'Condition'}
          </div>

          {/* Delete Menu */}
          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={handleCloseMenu}
              />
              
              {/* Menu */}
              <div className="absolute z-50 bg-white rounded-lg shadow-lg border p-2 mt-2 min-w-[120px]">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Edge
                </Button>
              </div>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;