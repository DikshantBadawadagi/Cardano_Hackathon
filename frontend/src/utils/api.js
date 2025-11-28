// // utils/api.js
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// // Node API calls
// export const createOrUpdateNode = async (nodeData) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/nodes`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(nodeData)
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error creating/updating node:', error);
//     throw error;
//   }
// };

// export const deleteNode = async (nodeData) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/nodes/delete`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(nodeData)
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error deleting node:', error);
//     throw error;
//   }
// };

// // Edge API calls
// export const createOrUpdateEdge = async (edgeData) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/edges`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(edgeData)
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error creating/updating edge:', error);
//     throw error;
//   }
// };

// export const deleteEdge = async (edgeData) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/edges/delete`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(edgeData)
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error deleting edge:', error);
//     throw error;
//   }
// };

// export const updateWorkflowName = async (workflowName) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/workflow/name`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         name: workflowName
//       })
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error updating workflow name:', error);
//     throw error;
//   }
// };

// export const makeCall = async (phoneNumber, name, workflowName) => {
//   try {
//     // Step 1: Update workflow name
//     await updateWorkflowName(workflowName);

//     // Step 2: Upload workflow
//     const workflowUploadResponse = await fetch(`${API_BASE_URL}/api/workflow/upload`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       // Include any required body if needed. If not, send empty body:
//       body: JSON.stringify({}), 
//     });

//     if (!workflowUploadResponse.ok) {
//       throw new Error(`Failed to upload workflow: ${workflowUploadResponse.status}`);
//     }

//     const workflowUploadData = await workflowUploadResponse.json();
//     const workflowId = workflowUploadData?.vapi_response?.id;

//     if (!workflowId) {
//       throw new Error('Workflow ID not found in upload response.');
//     }

//     // Step 3: Use the workflow ID to make the call
//     const callResponse = await fetch(`${API_BASE_URL}/api/make-call`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         phone_number: phoneNumber,
//         name,
//         workflow_id: workflowId,
//       }),
//     });

//     if (!callResponse.ok) {
//       throw new Error(`Call initiation failed: ${callResponse.status}`);
//     }

//     return await callResponse.json();

//   } catch (error) {
//     console.error('Error in makeCall:', error);
//     throw error;
//   }
// };

// // ----------------- Auth helpers -----------------
// export const registerUser = async ({ name, email, password }) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/register`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include', // important so cookies (if any) are set
//       body: JSON.stringify({ name, email, password })
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data?.error || `HTTP ${response.status}`);
//     }

//     // Backend returns created user in data.user
//     const user = data.user || null;
//     if (user) localStorage.setItem('currentUser', JSON.stringify(user));
//     // If backend returns a token in body, store it as well (best-effort)
//     if (data.token) localStorage.setItem('access_token', data.token);
//     return { user, raw: data };
//   } catch (err) {
//     console.error('Error registering user:', err);
//     throw err;
//   }
// };

// export const loginUser = async ({ email, password }) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include', // allow HttpOnly cookie to be set by backend
//       body: JSON.stringify({ email, password })
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data?.error || `HTTP ${response.status}`);
//     }

//     // If backend returns token in body (optional), store it
//     if (data.token) localStorage.setItem('access_token', data.token);

//     // Best-effort: fetch /api/me to get current user (relies on cookie)
//     try {
//       const meResp = await fetch(`${API_BASE_URL}/api/me`, {
//         method: 'GET',
//         credentials: 'include'
//       });
//       if (meResp.ok) {
//         const meData = await meResp.json();
//         const user = meData.user || meData.user || null;
//         if (user) localStorage.setItem('currentUser', JSON.stringify(user));
//       }
//     } catch (e) {
//       // ignore me fetch failure; still consider login success if server returned ok
//     }

//     return { raw: data };
//   } catch (err) {
//     console.error('Error logging in:', err);
//     throw err;
//   }
// };

// export const fetchCurrentUser = async () => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/me`, {
//       method: 'GET',
//       credentials: 'include'
//     });
//     if (!response.ok) return null;
//     const data = await response.json();
//     const user = data.user || null;
//     if (user) localStorage.setItem('currentUser', JSON.stringify(user));
//     return user;
//   } catch (err) {
//     console.error('Error fetching current user:', err);
//     return null;
//   }
// };

// export const logoutUser = async () => {
//   try {
//     await fetch(`${API_BASE_URL}/api/logout`, {
//       method: 'POST',
//       credentials: 'include'
//     });
//   } catch (e) {
//     // ignore
//   }
//   localStorage.removeItem('currentUser');
//   localStorage.removeItem('access_token');
// };

// utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || 'd55f90ea-6106-4634-a462-dbf049e0c240';

// ==================== HELPER FUNCTIONS ====================

/**
 * Get current workspace and workflow IDs from context/state
 * You'll need to pass these as parameters or store them in a global state
 */
const getContextIds = () => {
  // TODO: Replace this with your actual state management
  // Options: Context API, Redux, Zustand, or pass as parameters
  const workspaceId = localStorage.getItem('currentWorkspaceId');
  const workflowId = localStorage.getItem('currentWorkflowId');
  return { workspaceId, workflowId };
};

/**
 * Make authenticated API call with cookies
 */
const authenticatedFetch = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include', // IMPORTANT: Send cookies with every request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Handle authentication errors
    if (response.status === 401) {
      // User not authenticated, redirect to login
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentWorkspaceId');
      localStorage.removeItem('currentWorkflowId');
      window.location.href = '/login'; // Adjust based on your routing
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// ==================== AUTH API ====================

export const registerUser = async ({ name, email, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    const user = data.user || null;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }
    
    return { user, raw: data };
  } catch (err) {
    console.error('Error registering user:', err);
    throw err;
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }

    // Fetch current user after login
    const user = await fetchCurrentUser();
    
    return { user, raw: data };
  } catch (err) {
    console.error('Error logging in:', err);
    throw err;
  }
};

export const fetchCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/me`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const user = data.user || null;
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    return user;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    // ignore
  }
  
  // Clear all stored data
  localStorage.removeItem('currentUser');
  localStorage.removeItem('access_token');
  localStorage.removeItem('currentWorkspaceId');
  localStorage.removeItem('currentWorkflowId');
};

// ==================== WORKFLOW API ====================

/**
 * Create a new workflow in a workspace
 */
export const createWorkflow = async (workspaceId, workflowName) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows`;
    const data = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify({ name: workflowName })
    });
    
    // Store the new workflow ID
    if (data.workflow?._id) {
      localStorage.setItem('currentWorkflowId', data.workflow._id);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
};

/**
 * Get all workflows in a workspace
 */
export const getAllWorkflows = async (workspaceId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows`;
    return await authenticatedFetch(url, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }
};

/**
 * Get a specific workflow
 */
export const getWorkflow = async (workspaceId, workflowId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}`;
    return await authenticatedFetch(url, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    throw error;
  }
};

/**
 * Update workflow name
 */
export const updateWorkflowName = async (workspaceId, workflowId, workflowName) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}/name`;
    return await authenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify({ name: workflowName })
    });
  } catch (error) {
    console.error('Error updating workflow name:', error);
    throw error;
  }
};

/**
 * Delete a workflow
 */
export const deleteWorkflow = async (workspaceId, workflowId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}`;
    return await authenticatedFetch(url, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
};

// ==================== NODE API ====================

/**
 * Create or update a node
 * @param {string} workspaceId - The workspace ID
 * @param {string} workflowId - The workflow ID
 * @param {object} nodeData - The node data
 */
export const createOrUpdateNode = async (workspaceId, workflowId, nodeData) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}/nodes`;
    return await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(nodeData)
    });
  } catch (error) {
    console.error('Error creating/updating node:', error);
    throw error;
  }
};

/**
 * Get all nodes in a workflow
 */
export const getAllNodes = async (workspaceId, workflowId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}/nodes`;
    return await authenticatedFetch(url, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    throw error;
  }
};

/**
 * Delete a node
 * @param {string} workspaceId - The workspace ID
 * @param {string} workflowId - The workflow ID
 * @param {object} nodeData - The exact node object to delete
 */
export const deleteNode = async (workspaceId, workflowId, nodeData) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}/nodes/delete`;
    return await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(nodeData)
    });
  } catch (error) {
    console.error('Error deleting node:', error);
    throw error;
  }
};

// ==================== EDGE API ====================

/**
 * Create or update an edge
 * @param {string} workspaceId - The workspace ID
 * @param {string} workflowId - The workflow ID
 * @param {object} edgeData - The edge data
 */
export const createOrUpdateEdge = async (workspaceId, workflowId, edgeData) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}/edges`;
    return await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(edgeData)
    });
  } catch (error) {
    console.error('Error creating/updating edge:', error);
    throw error;
  }
};

/**
 * Get all edges in a workflow
 */
export const getAllEdges = async (workspaceId, workflowId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}/edges`;
    return await authenticatedFetch(url, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching edges:', error);
    throw error;
  }
};

/**
 * Delete an edge
 * @param {string} workspaceId - The workspace ID
 * @param {string} workflowId - The workflow ID
 * @param {object} edgeData - The exact edge object to delete
 */
export const deleteEdge = async (workspaceId, workflowId, edgeData) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/workflows/${workflowId}/edges/delete`;
    return await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(edgeData)
    });
  } catch (error) {
    console.error('Error deleting edge:', error);
    throw error;
  }
};

// ==================== VAPI INTEGRATION ====================

/**
 * Upload workflow to Vapi and make a call
 */
export const makeCall = async (workspaceId, workflowId, phoneNumber, name, workflowName) => {
  try {
    // Step 1: Update workflow name (optional, if needed)
    if (workflowName) {
      await updateWorkflowName(workspaceId, workflowId, workflowName);
    }

    // Step 2: Upload workflow to Vapi
    const workflowUploadResponse = await authenticatedFetch(
      `${API_BASE_URL}/api/vapi/upload-workflow`,
      {
        method: 'POST',
        body: JSON.stringify({
          workspace_id: workspaceId,
          workflow_id: workflowId
        })
      }
    );

    const vapiWorkflowId = workflowUploadResponse?.vapi_response?.id;
    if (!vapiWorkflowId) {
      throw new Error('Workflow ID not found in upload response.');
    }

    // Step 3: Use the workflow ID to make the call
    const callResponse = await authenticatedFetch(
      `${API_BASE_URL}/api/make-call`,
      {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phoneNumber,
          name,
          workflow_id: vapiWorkflowId,
          assistant_id: VAPI_ASSISTANT_ID
        })
      }
    );

    return callResponse;
  } catch (error) {
    console.error('Error in makeCall:', error);
    throw error;
  }
};

// ==================== CONTEXT HELPER FUNCTIONS ====================

/**
 * Set current workspace ID
 */
export const setCurrentWorkspace = (workspaceId) => {
  localStorage.setItem('currentWorkspaceId', workspaceId);
};

/**
 * Set current workflow ID
 */
export const setCurrentWorkflow = (workflowId) => {
  localStorage.setItem('currentWorkflowId', workflowId);
};

/**
 * Get current workspace ID
 */
export const getCurrentWorkspace = () => {
  return localStorage.getItem('currentWorkspaceId');
};

/**
 * Get current workflow ID
 */
export const getCurrentWorkflow = () => {
  return localStorage.getItem('currentWorkflowId');
};

/**
 * Clear current context (useful on logout or workspace switch)
 */
export const clearContext = () => {
  localStorage.removeItem('currentWorkspaceId');
  localStorage.removeItem('currentWorkflowId');
};

// ==================== CONVENIENCE WRAPPERS ====================
// These use the stored context IDs so you don't have to pass them every time

/**
 * Create or update node using stored context
 */
export const createOrUpdateNodeWithContext = async (nodeData) => {
  const { workspaceId, workflowId } = getContextIds();
  if (!workspaceId || !workflowId) {
    throw new Error('Workspace or Workflow not selected. Please select a workspace and workflow first.');
  }
  return createOrUpdateNode(workspaceId, workflowId, nodeData);
};

/**
 * Delete node using stored context
 */
export const deleteNodeWithContext = async (nodeData) => {
  const { workspaceId, workflowId } = getContextIds();
  if (!workspaceId || !workflowId) {
    throw new Error('Workspace or Workflow not selected.');
  }
  return deleteNode(workspaceId, workflowId, nodeData);
};

/**
 * Create or update edge using stored context
 */
export const createOrUpdateEdgeWithContext = async (edgeData) => {
  const { workspaceId, workflowId } = getContextIds();
  if (!workspaceId || !workflowId) {
    throw new Error('Workspace or Workflow not selected.');
  }
  return createOrUpdateEdge(workspaceId, workflowId, edgeData);
};

/**
 * Delete edge using stored context
 */
export const deleteEdgeWithContext = async (edgeData) => {
  const { workspaceId, workflowId } = getContextIds();
  if (!workspaceId || !workflowId) {
    throw new Error('Workspace or Workflow not selected.');
  }
  return deleteEdge(workspaceId, workflowId, edgeData);
};

/**
 * Get all nodes using stored context
 */
export const getAllNodesWithContext = async () => {
  const { workspaceId, workflowId } = getContextIds();
  if (!workspaceId || !workflowId) {
    throw new Error('Workspace or Workflow not selected.');
  }
  return getAllNodes(workspaceId, workflowId);
};

/**
 * Get all edges using stored context
 */
export const getAllEdgesWithContext = async () => {
  const { workspaceId, workflowId } = getContextIds();
  if (!workspaceId || !workflowId) {
    throw new Error('Workspace or Workflow not selected.');
  }
  return getAllEdges(workspaceId, workflowId);
};

/**
 * Update workflow name using stored context
 */
export const updateWorkflowNameWithContext = async (workflowName) => {
  const { workspaceId, workflowId } = getContextIds();
  if (!workspaceId || !workflowId) {
    throw new Error('Workspace or Workflow not selected.');
  }
  return updateWorkflowName(workspaceId, workflowId, workflowName);
};

/**
 * Get current workflow using stored context
 */
export const getCurrentWorkflowData = async () => {
  const { workspaceId, workflowId } = getContextIds();
  if (!workspaceId || !workflowId) {
    throw new Error('Workspace or Workflow not selected.');
  }
  return getWorkflow(workspaceId, workflowId);
};