import React from 'react';
import { Handle, Position } from '@xyflow/react';

const ToolNode = ({ data, id }) => {
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
  const tool = nodeData.tool || {};
  
  // Extract body properties (variables to send)
  const bodyProperties = tool.body?.properties || {};
  const bodyVars = Object.keys(bodyProperties);
  
  // Extract header properties
  const headerProperties = tool.headers?.properties || {};
  const headerKeys = Object.keys(headerProperties);
  
  // Extract response variables (from variableExtractionPlan)
  const responseVars = tool.variableExtractionPlan?.schema?.properties || {};
  const responseVarKeys = Object.keys(responseVars);
  const requiredResponseVars = tool.variableExtractionPlan?.schema?.required || [];

  return (
    <>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
      />
      
      <div 
        onClick={handleNodeClick}
        className="bg-white rounded-lg shadow-lg border-2 border-green-400 p-4 min-w-[280px] cursor-pointer hover:shadow-xl transition-shadow"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-gray-800">{nodeData.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded uppercase font-medium">
              {tool.method || 'GET'}
            </span>
          </div>
        </div>

        {/* Type */}
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
          TOOL - {tool.type || 'API REQUEST'}
        </div>

        {/* Tool Name */}
        {tool.name && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">Tool Name:</div>
            <div className="text-sm text-gray-800 bg-green-50 p-2 rounded break-words">
              {tool.name}
            </div>
          </div>
        )}

        {/* URL */}
        {tool.url && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">URL:</div>
            <div className="text-sm text-gray-800 bg-blue-50 p-2 rounded break-words font-mono text-xs">
              {tool.url}
            </div>
          </div>
        )}

        {/* Body Variables */}
        {bodyVars.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">Body Variables:</div>
            <div className="flex flex-wrap gap-1">
              {bodyVars.map((varName, idx) => {
                const varData = bodyProperties[varName];
                return (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {varName} ({varData.type})
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Headers */}
        {headerKeys.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">Headers:</div>
            <div className="space-y-1">
              {headerKeys.map((headerKey, idx) => {
                const headerData = headerProperties[headerKey];
                return (
                  <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-700">{headerKey}:</span>
                    <span className="text-gray-600 ml-1">{headerData.value || 'Not set'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Response Variables */}
        {responseVarKeys.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-medium text-gray-600 mb-1">Response Variables:</div>
            <div className="flex flex-wrap gap-1">
              {responseVarKeys.map((varName, idx) => {
                const varData = responseVars[varName];
                const isRequired = requiredResponseVars.includes(varName);
                return (
                  <span 
                    key={idx} 
                    className={`text-xs px-2 py-1 rounded ${
                      isRequired 
                        ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {varName} ({varData.type})
                    {isRequired && <span className="ml-1 font-bold">*</span>}
                  </span>
                );
              })}
            </div>
            {requiredResponseVars.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                * = Required variables
              </div>
            )}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
      />
    </>
  );
};

export default ToolNode;