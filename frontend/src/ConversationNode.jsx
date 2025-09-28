import React from 'react';
import { Handle, Position } from '@xyflow/react';

const ConversationNode = ({ data, id }) => {
  const handleNodeClick = (event) => {
    event.stopPropagation();
    // Pass the click event to parent with node data and click position
    if (data.onNodeClick) {
      data.onNodeClick(id, data.nodeData, {
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const { nodeData } = data;
  const hasVariables = nodeData.variableExtractionPlan && nodeData.variableExtractionPlan.output.length > 0;

  return (
    <>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      
      <div 
        onClick={handleNodeClick}
        className="bg-white rounded-lg shadow-lg border-2 border-blue-400 p-4 min-w-[250px] cursor-pointer hover:shadow-xl transition-shadow"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-semibold text-gray-800">{nodeData.name}</span>
          </div>
          {nodeData.isStart && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">START</span>
          )}
        </div>

        {/* Type */}
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
          {nodeData.type}
        </div>

        {/* Prompt */}
        {nodeData.prompt && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">Prompt:</div>
            <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded break-words max-w-[200px]">
              {nodeData.prompt}
            </div>
          </div>
        )}

        {/* First Message */}
        {nodeData.messagePlan?.firstMessage && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">First Message:</div>
            <div className="text-sm text-gray-800 bg-blue-50 p-2 rounded break-words">
              {nodeData.messagePlan.firstMessage}
            </div>
          </div>
        )}

        {/* Variables */}
        {hasVariables && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">Variables:</div>
            <div className="flex flex-wrap gap-1">
              {nodeData.variableExtractionPlan.output.map((variable, idx) => (
                <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {variable.title} ({variable.type})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
    </>
  );
};

export default ConversationNode;