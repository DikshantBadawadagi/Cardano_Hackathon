// workflowLoader.js - Utility functions for loading and converting workflow data

import { getCurrentWorkspace, getCurrentWorkflow, getWorkflow } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Fetches workflow data from the API using workspace and workflow IDs
 */
export const fetchWorkflowData = async (workspaceId, workflowId) => {
  try {
    // If IDs not provided, try to get from context
    const wsId = workspaceId || getCurrentWorkspace();
    const wfId = workflowId || getCurrentWorkflow();
    
    if (!wsId || !wfId) {
      throw new Error('Workspace or Workflow not selected. Please select a workspace and workflow first.');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/workspaces/${wsId}/workflows/${wfId}`,
      {
        credentials: 'include',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the workflow object which contains body_json
    return data.workflow || data;
  } catch (error) {
    console.error('Failed to fetch workflow data:', error);
    throw error;
  }
};

/**
 * Converts backend node data to React Flow node format
 */
export const convertToReactFlowNode = (backendNode, handleNodeClick) => {
  const nodeId = `node-${Date.now()}-${Math.random()}`;
  
  // Extract position from metadata
  const position = backendNode.metadata?.position || { x: 0, y: 0 };
  
  // Determine node type
  const nodeType = backendNode.type === 'tool' ? 'tool' : 'conversation';
  
  return {
    id: nodeId,
    type: nodeType,
    position: position,
    data: {
      nodeData: backendNode,
      onNodeClick: handleNodeClick
    }
  };
};

/**
 * Converts backend edge data to React Flow edge format
 */
export const convertToReactFlowEdge = (backendEdge, nodes, handleEdgeDelete) => {
  // Find source and target node IDs by matching names
  const sourceNode = nodes.find(node => node.data.nodeData.name === backendEdge.from);
  const targetNode = nodes.find(node => node.data.nodeData.name === backendEdge.to);
  
  if (!sourceNode || !targetNode) {
    console.warn(`Could not find nodes for edge from ${backendEdge.from} to ${backendEdge.to}`);
    return null;
  }
  
  const edgeId = `edge-${Date.now()}-${Math.random()}`;
  
  return {
    id: edgeId,
    source: sourceNode.id,
    target: targetNode.id,
    type: 'custom',
    data: {
      edgeData: backendEdge,
      onEdgeDelete: handleEdgeDelete
    }
  };
};

/**
 * Main function to load and convert workflow data for React Flow
 * @param {string} workspaceId - Optional workspace ID (uses context if not provided)
 * @param {string} workflowId - Optional workflow ID (uses context if not provided)
 * @param {function} handleNodeClick - Node click handler
 * @param {function} handleEdgeDelete - Edge delete handler
 */
export const loadWorkflowForReactFlow = async (workspaceId, workflowId, handleNodeClick, handleEdgeDelete) => {
  try {
    // Fetch workflow data (will use context if IDs not provided)
    const workflow = await fetchWorkflowData(workspaceId, workflowId);
    
    // Extract body_json which contains nodes and edges
    const workflowData = workflow.body_json || workflow;
    
    // Convert nodes first
    const reactFlowNodes = workflowData.nodes?.map(node => 
      convertToReactFlowNode(node, handleNodeClick)
    ) || [];
    
    // Convert edges (needs nodes to be converted first for ID mapping)
    const reactFlowEdges = workflowData.edges?.map(edge => 
      convertToReactFlowEdge(edge, reactFlowNodes, handleEdgeDelete)
    ).filter(edge => edge !== null) || []; // Filter out null edges (failed conversions)
    
    return {
      nodes: reactFlowNodes,
      edges: reactFlowEdges,
      workflowData: workflowData,
      workflow: workflow // Full workflow object including metadata
    };
  } catch (error) {
    console.error('Failed to load workflow:', error);
    return {
      nodes: [],
      edges: [],
      workflowData: null,
      workflow: null
    };
  }
};

/**
 * Hook-like function that can be called to refresh workflow data
 * This can be used when external components add nodes directly to the workflow
 */
export const refreshWorkflowData = async (setNodes, setEdges, handleNodeClick, handleEdgeDelete, workspaceId, workflowId) => {
  try {
    const { nodes, edges } = await loadWorkflowForReactFlow(workspaceId, workflowId, handleNodeClick, handleEdgeDelete);
    setNodes(nodes);
    setEdges(edges);
    console.log('Workflow refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh workflow:', error);
  }
};