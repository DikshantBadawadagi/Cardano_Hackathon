# This file will handle the communication with the Vapi API.
import os
import json
import requests


def create_vapi_workflow(api_key: str):
    """
    Builds the Maukikh workflow JSON and sends it to the Vapi API
    to create a new workflow.
    """
    vapi_api_url = "https://api.vapi.ai/workflow"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Print the API key to verify it is being read correctly
    print(f"Using API Key: {api_key}")

 

    # Open and load the JSON file
    with open('data.json', 'r') as f:
        workflow_data = json.load(f)

    try:
        response = requests.post(vapi_api_url, headers=headers, json=workflow_data)
        response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating Vapi workflow: {e}")
        # You might want to handle this error more gracefully in a real application
        return {"error": str(e)}


def create_vapi_workflow_from_object(api_key: str, workflow_data: dict):
    """
    Sends the given workflow JSON object directly to the Vapi API.
    This function mirrors `create_vapi_workflow` but accepts the workflow
    JSON object instead of reading from `data.json` on disk.
    """
    vapi_api_url = "https://api.vapi.ai/workflow"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Print a masked API key for debugging
    masked = api_key[:8] + "..." + api_key[-4:] if api_key and len(api_key) > 12 else "***"
    print(f"Using API Key: {masked}")

    try:
        # Ensure we send a single JSON object (not a list)
        if not isinstance(workflow_data, dict):
            print("Warning: workflow_data is not an object, attempting to coerce")

        response = requests.post(vapi_api_url, headers=headers, json=workflow_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating Vapi workflow from object: {e}")
        return {"error": str(e)}



def make_call(phone_number, name, workflow_id=None, assistant_id=None):
    """
    Makes a phone call using the VAPI API and Twilio integration.
    """
    api_key = os.getenv("VAPI_API_KEY")
    if not api_key:
        return {"error": "VAPI_API_KEY environment variable not set"}

    final_workflow_id = workflow_id 
    print(f"Using workflow ID: {final_workflow_id}")

    payload = {
        "workflowId": final_workflow_id,
        "customer": {
            "number": phone_number,
            "name": name
        },
        "phoneNumber": {
            "twilioAuthToken": os.getenv("TWILIO_AUTH_TOKEN"),
            "twilioAccountSid": os.getenv("TWILIO_ACCOUNT_SID"),
            "twilioPhoneNumber": os.getenv("TWILIO_PHONE_NUMBER")
        }
    }

    # Add assistantId if provided
    # if assistant_id:
    #     payload["assistantId"] = assistant_id

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post("https://api.vapi.ai/call/phone", headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making call: {e}")
        return {"error": str(e)}