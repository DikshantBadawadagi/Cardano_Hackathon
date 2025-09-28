// workflowLoader.js - Utility functions for loading and converting workflow data

/**
 * Fetches workflow data from the API
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://plugin-administrator-angela-ser.trycloudflare.com';

export const fetchWorkflowData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workflow`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = JSON.parse(responseText);
    return data;
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
 */
export const loadWorkflowForReactFlow = async (handleNodeClick, handleEdgeDelete) => {
  try {
    const workflowData = await fetchWorkflowData();
    
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
      workflowData: workflowData
    };
  } catch (error) {
    console.error('Failed to load workflow:', error);
    return {
      nodes: [],
      edges: [],
      workflowData: null
    };
  }
};

/**
 * Hook-like function that can be called to refresh workflow data
 * This can be used when external components add nodes directly to the workflow
 */
export const refreshWorkflowData = async (setNodes, setEdges, handleNodeClick, handleEdgeDelete) => {
  try {
    const { nodes, edges } = await loadWorkflowForReactFlow(handleNodeClick, handleEdgeDelete);
    setNodes(nodes);
    setEdges(edges);
    console.log('Workflow refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh workflow:', error);
  }
};