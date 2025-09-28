// utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://plugin-administrator-angela-ser.trycloudflare.com';

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
