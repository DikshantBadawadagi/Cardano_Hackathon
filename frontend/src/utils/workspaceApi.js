// utils/workspaceApi.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Make authenticated API call with cookies
 */
const authenticatedFetch = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (response.status === 401) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentWorkspaceId');
      localStorage.removeItem('currentWorkflowId');
      window.location.href = '/login';
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

// ==================== WORKSPACE API ====================

/**
 * Get all workspaces for current user
 */
export const getAllWorkspaces = async () => {
  try {
    const url = `${API_BASE_URL}/api/workspaces`;
    return await authenticatedFetch(url, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

/**
 * Get workspace by ID
 */
export const getWorkspaceById = async (workspaceId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}`;
    return await authenticatedFetch(url, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    throw error;
  }
};

/**
 * Create a new workspace
 */
export const createWorkspace = async (name, isEditableByCollaborators = true) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces`;
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('is_editable_by_collaborators', isEditableByCollaborators);
    
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
    
    // Store the new workspace ID as current
    if (response.workspace?._id) {
      localStorage.setItem('currentWorkspaceId', response.workspace._id);
    }
    
    return response;
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw error;
  }
};

/**
 * Update workspace
 */
export const updateWorkspace = async (workspaceId, name, isEditableByCollaborators) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}`;
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('is_editable_by_collaborators', isEditableByCollaborators);
    
    return await authenticatedFetch(url, {
      method: 'PUT',
      body: formData,
      headers: {}
    });
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw error;
  }
};

/**
 * Delete workspace
 */
export const deleteWorkspace = async (workspaceId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}`;
    return await authenticatedFetch(url, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw error;
  }
};

// ==================== WORKSPACE MEMBERS API ====================

/**
 * Get all members of a workspace
 */
export const getWorkspaceMembers = async (workspaceId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/members`;
    return await authenticatedFetch(url, { method: 'GET' });
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    throw error;
  }
};

/**
 * Add member to workspace
 */
export const addWorkspaceMember = async (workspaceId, email, role = 'viewer') => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/members`;
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('role', role);
    
    return await authenticatedFetch(url, {
      method: 'POST',
      body: formData,
      headers: {}
    });
  } catch (error) {
    console.error('Error adding workspace member:', error);
    throw error;
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (workspaceId, userId, newRole) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/members/${userId}`;
    
    const formData = new FormData();
    formData.append('role', newRole);
    
    return await authenticatedFetch(url, {
      method: 'PUT',
      body: formData,
      headers: {}
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

/**
 * Remove member from workspace
 */
export const removeMember = async (workspaceId, userId) => {
  try {
    const url = `${API_BASE_URL}/api/workspaces/${workspaceId}/members/${userId}`;
    return await authenticatedFetch(url, { method: 'DELETE' });
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Set current workspace ID
 */
export const setCurrentWorkspace = (workspaceId) => {
  localStorage.setItem('currentWorkspaceId', workspaceId);
};

/**
 * Get current workspace ID
 */
export const getCurrentWorkspace = () => {
  return localStorage.getItem('currentWorkspaceId');
};

/**
 * Set current workflow ID
 */
export const setCurrentWorkflow = (workflowId) => {
  localStorage.setItem('currentWorkflowId', workflowId);
};

/**
 * Get current workflow ID
 */
export const getCurrentWorkflow = () => {
  return localStorage.getItem('currentWorkflowId');
};

/**
 * Clear workspace context
 */
export const clearWorkspaceContext = () => {
  localStorage.removeItem('currentWorkspaceId');
  localStorage.removeItem('currentWorkflowId');
};

/**
 * Get user's role in workspace
 */
export const getUserRoleInWorkspace = async (workspaceId, userId) => {
  try {
    const { members } = await getWorkspaceMembers(workspaceId);
    const membership = members.find(m => m.user_id === userId);
    return membership?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};