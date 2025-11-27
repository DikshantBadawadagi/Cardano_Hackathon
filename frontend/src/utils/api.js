// utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// Node API calls
export const createOrUpdateNode = async (nodeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating/updating node:', error);
    throw error;
  }
};

export const deleteNode = async (nodeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/nodes/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting node:', error);
    throw error;
  }
};

// Edge API calls
export const createOrUpdateEdge = async (edgeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/edges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(edgeData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating/updating edge:', error);
    throw error;
  }
};

export const deleteEdge = async (edgeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/edges/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(edgeData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting edge:', error);
    throw error;
  }
};

export const updateWorkflowName = async (workflowName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workflow/name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: workflowName
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating workflow name:', error);
    throw error;
  }
};

export const makeCall = async (phoneNumber, name, workflowName) => {
  try {
    // Step 1: Update workflow name
    await updateWorkflowName(workflowName);

    // Step 2: Upload workflow
    const workflowUploadResponse = await fetch(`${API_BASE_URL}/api/workflow/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include any required body if needed. If not, send empty body:
      body: JSON.stringify({}), 
    });

    if (!workflowUploadResponse.ok) {
      throw new Error(`Failed to upload workflow: ${workflowUploadResponse.status}`);
    }

    const workflowUploadData = await workflowUploadResponse.json();
    const workflowId = workflowUploadData?.vapi_response?.id;

    if (!workflowId) {
      throw new Error('Workflow ID not found in upload response.');
    }

    // Step 3: Use the workflow ID to make the call
    const callResponse = await fetch(`${API_BASE_URL}/api/make-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        name,
        workflow_id: workflowId,
      }),
    });

    if (!callResponse.ok) {
      throw new Error(`Call initiation failed: ${callResponse.status}`);
    }

    return await callResponse.json();

  } catch (error) {
    console.error('Error in makeCall:', error);
    throw error;
  }
};

// ----------------- Auth helpers -----------------
export const registerUser = async ({ name, email, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // important so cookies (if any) are set
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    // Backend returns created user in data.user
    const user = data.user || null;
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    // If backend returns a token in body, store it as well (best-effort)
    if (data.token) localStorage.setItem('access_token', data.token);
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
      credentials: 'include', // allow HttpOnly cookie to be set by backend
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    // If backend returns token in body (optional), store it
    if (data.token) localStorage.setItem('access_token', data.token);

    // Best-effort: fetch /api/me to get current user (relies on cookie)
    try {
      const meResp = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        credentials: 'include'
      });
      if (meResp.ok) {
        const meData = await meResp.json();
        const user = meData.user || meData.user || null;
        if (user) localStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (e) {
      // ignore me fetch failure; still consider login success if server returned ok
    }

    return { raw: data };
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
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
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
  localStorage.removeItem('currentUser');
  localStorage.removeItem('access_token');
};
