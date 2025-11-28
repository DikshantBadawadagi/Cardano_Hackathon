from flask import Flask, request, jsonify
import json
import os
import requests
from dotenv import load_dotenv  
load_dotenv() 
from flask_cors import CORS
from vapi_manager import make_call
#import the vapi_bp
from dashboard import vapi_bpt

app = Flask(__name__)
CORS(app,origins=["http://127.0.0.1:5173"],supports_credentials=True)

app.register_blueprint(vapi_bpt)
# JSON file path
JSON_FILE_PATH = 'workflow.json'

def initialize_json_file():
    """Initialize JSON file if it doesn't exist"""
    if not os.path.exists(JSON_FILE_PATH):
        initial_data = {
            "name": "",
            "nodes": [],
            "edges": [],
            "globalPrompt": ""
        }
        with open(JSON_FILE_PATH, 'w') as f:
            json.dump(initial_data, f, indent=2)
        print(f"Created new JSON file: {JSON_FILE_PATH}")
    else:
        print(f"JSON file already exists: {JSON_FILE_PATH}")

def load_workflow_data():
    """Load workflow data from JSON file"""
    try:
        with open(JSON_FILE_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading JSON file: {e}")
        return None

def save_workflow_data(data):
    """Save workflow data to JSON file"""
    try:
        with open(JSON_FILE_PATH, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving JSON file: {e}")
        return False

@app.route('/api/workflow/name', methods=['POST'])
def set_workflow_name():
    """Set the workflow name in JSON"""
    try:
        # Get name from request body
        request_data = request.get_json()
        
        if not request_data or not request_data.get('name'):
            return jsonify({"error": "Workflow name is required"}), 400
        
        workflow_name = request_data.get('name')
        
        # Load current workflow data
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
        
        # Update the name field
        workflow_data["name"] = workflow_name
        
        # Save updated workflow data
        if not save_workflow_data(workflow_data):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(f"Workflow name set to: '{workflow_name}'")
        
        return jsonify({
            "status": "success",
            "message": "Workflow name updated successfully",
            "name": workflow_name
        }), 200
        
    except Exception as e:
        print(f"Error setting workflow name: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/nodes', methods=['POST'])
def upsert_node():
    """Upsert a node - update if name exists, insert if not"""
    try:
        # Get the ready node object from frontend
        node_data = request.get_json()
        
        if not node_data:
            return jsonify({"error": "No node data provided"}), 400
        
        # Basic validation - check if name exists
        if not node_data.get("name"):
            return jsonify({"error": "Node must have a name"}), 400
        
        # Load current workflow data
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
        
        # Find existing node by name
        node_name = node_data.get("name")
        existing_node_index = None
        
        for i, node in enumerate(workflow_data["nodes"]):
            if node.get("name") == node_name:
                existing_node_index = i
                break
        
        operation = ""
        if existing_node_index is not None:
            # Update existing node - replace entire object
            workflow_data["nodes"][existing_node_index] = node_data
            operation = "updated"
            print(f"Node '{node_name}' updated:")
        else:
            # Insert new node
            workflow_data["nodes"].append(node_data)
            operation = "created"
            print(f"Node '{node_name}' created:")
        
        # Save updated workflow data
        if not save_workflow_data(workflow_data):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(json.dumps(node_data, indent=2))
        print(f"Total nodes now: {len(workflow_data['nodes'])}")
        
        return jsonify({
            "status": "success",
            "message": f"Node {operation} successfully",
            "operation": operation,
            "node": node_data
        }), 200 if operation == "updated" else 201
        
    except Exception as e:
        print(f"Error upserting node: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/nodes', methods=['GET'])
def get_all_nodes():
    """Get all nodes"""
    try:
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
            
        return jsonify({
            "status": "success",
            "nodes": workflow_data["nodes"],
            "count": len(workflow_data["nodes"])
        })
        
    except Exception as e:
        print(f"Error getting nodes: {e}")
        return jsonify({"error": "Internal server error"}), 500
    


@app.route('/api/nodes/delete', methods=['POST'])
def delete_specific_node():
    """Delete a specific node and all its edges"""
    try:
        # Get the node object to delete from frontend
        node_to_delete = request.get_json()
        
        if not node_to_delete:
            return jsonify({"error": "No node data provided"}), 400
        
        node_name = node_to_delete.get("name")
        if not node_name:
            return jsonify({"error": "Node must have a name"}), 400
        
        # Load current workflow data
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
        
        # Find and remove the exact node
        node_found = False
        for i, node in enumerate(workflow_data["nodes"]):
            if node == node_to_delete:  # Exact match
                removed_node = workflow_data["nodes"].pop(i)
                node_found = True
                break
        
        if not node_found:
            return jsonify({"error": "Exact node not found"}), 404
        
        # Save updated workflow data after node removal
        if not save_workflow_data(workflow_data):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        # Call the helper function to delete related edges
        try:
            result = delete_all_edges_for_node(node_name)
            edges_deleted = result.get("deletedCount", 0)
        except Exception as e:
            print(f"Warning: Could not delete edges for node '{node_name}': {e}")
            edges_deleted = 0
        
        print(f"Node '{node_name}' deleted")
        print(f"Associated {edges_deleted} edges also deleted")
        print(f"Total nodes now: {len(workflow_data['nodes'])}")
        
        return jsonify({
            "status": "success",
            "message": f"Node and {edges_deleted} associated edges deleted successfully",
            "deletedNode": removed_node,
            "edgesDeleted": edges_deleted
        })
        
    except Exception as e:
        print(f"Error deleting specific node: {e}")
        return jsonify({"error": "Internal server error"}), 500


# @app.route('/api/nodes/delete', methods=['POST'])
# def delete_specific_node():
#     """Delete a specific node and all its edges"""
#     try:
#         # Get the node object to delete from frontend
#         node_to_delete = request.get_json()
        
#         if not node_to_delete:
#             return jsonify({"error": "No node data provided"}), 400
        
#         node_name = node_to_delete.get("name")
#         if not node_name:
#             return jsonify({"error": "Node must have a name"}), 400
        
#         # Load current workflow data
#         workflow_data = load_workflow_data()
#         if workflow_data is None:
#             return jsonify({"error": "Failed to load workflow data"}), 500
        
#         # Find and remove the exact node
#         node_found = False
#         for i, node in enumerate(workflow_data["nodes"]):
#             if node == node_to_delete:  # Exact match
#                 removed_node = workflow_data["nodes"].pop(i)
#                 node_found = True
#                 break
        
#         if not node_found:
#             return jsonify({"error": "Exact node not found"}), 404
        
#         # Save updated workflow data
#         if not save_workflow_data(workflow_data):
#             return jsonify({"error": "Failed to save workflow data"}), 500
        
#         # Call deleteAllEdge method to delete all related edges
#         try:
#             response = requests.delete(f'http://localhost:5000/api/edges/deleteAll/{node_name}')
#             edges_deleted = response.json().get('deletedCount', 0) if response.status_code == 200 else 0
#         except Exception as e:
#             print(f"Warning: Could not delete edges for node '{node_name}': {e}")
#             edges_deleted = 0
        
#         print(f"Node '{node_name}' deleted")
#         print(f"Associated {edges_deleted} edges also deleted")
#         print(f"Total nodes now: {len(workflow_data['nodes'])}")
        
#         return jsonify({
#             "status": "success",
#             "message": f"Node and {edges_deleted} associated edges deleted successfully",
#             "deletedNode": removed_node,
#             "edgesDeleted": edges_deleted
#         })
        
#     except Exception as e:
#         print(f"Error deleting specific node: {e}")
#         return jsonify({"error": "Internal server error"}), 500

@app.route('/api/workflow', methods=['GET'])
def get_workflow():
    """Get complete workflow JSON"""
    try:
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
            
        return jsonify(workflow_data)
        
    except Exception as e:
        print(f"Error getting workflow: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Flask backend is running"})



@app.route('/api/edges', methods=['POST'])
def upsert_edge():
    """Upsert an edge - update if from+to exists, insert if not"""
    try:
        # Get the ready edge object from frontend
        edge_data = request.get_json()
        
        if not edge_data:
            return jsonify({"error": "No edge data provided"}), 400
        
        # Basic validation - check if from and to exist
        if not edge_data.get("from") or not edge_data.get("to"):
            return jsonify({"error": "Edge must have 'from' and 'to' fields"}), 400
        
        # Load current workflow data
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
        
        # Find existing edge by from+to combination
        edge_from = edge_data.get("from")
        edge_to = edge_data.get("to")
        existing_edge_index = None
        
        for i, edge in enumerate(workflow_data["edges"]):
            if edge.get("from") == edge_from and edge.get("to") == edge_to:
                existing_edge_index = i
                break
        
        operation = ""
        if existing_edge_index is not None:
            # Update existing edge - replace entire object
            workflow_data["edges"][existing_edge_index] = edge_data
            operation = "updated"
            print(f"Edge '{edge_from}' -> '{edge_to}' updated:")
        else:
            # Insert new edge
            workflow_data["edges"].append(edge_data)
            operation = "created"
            print(f"Edge '{edge_from}' -> '{edge_to}' created:")
        
        # Save updated workflow data
        if not save_workflow_data(workflow_data):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(json.dumps(edge_data, indent=2))
        print(f"Total edges now: {len(workflow_data['edges'])}")
        
        return jsonify({
            "status": "success",
            "message": f"Edge {operation} successfully",
            "operation": operation,
            "edge": edge_data
        }), 200 if operation == "updated" else 201
        
    except Exception as e:
        print(f"Error upserting edge: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/edges', methods=['GET'])
def get_all_edges():
    """Get all edges"""
    try:
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
            
        return jsonify({
            "status": "success",
            "edges": workflow_data["edges"],
            "count": len(workflow_data["edges"])
        })
        
    except Exception as e:
        print(f"Error getting edges: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/edges/delete', methods=['POST'])
def delete_specific_edge():
    """Delete a specific edge - frontend sends exact edge object"""
    try:
        # Get the edge object to delete from frontend
        edge_to_delete = request.get_json()
        
        if not edge_to_delete:
            return jsonify({"error": "No edge data provided"}), 400
        
        # Load current workflow data
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
        
        # Find and remove the exact edge
        edge_found = False
        for i, edge in enumerate(workflow_data["edges"]):
            if edge == edge_to_delete:  # Exact match
                removed_edge = workflow_data["edges"].pop(i)
                edge_found = True
                break
        
        if not edge_found:
            return jsonify({"error": "Exact edge not found"}), 404
        
        # Save updated workflow data
        if not save_workflow_data(workflow_data):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(f"Specific edge deleted:")
        print(json.dumps(removed_edge, indent=2))
        print(f"Total edges now: {len(workflow_data['edges'])}")
        
        return jsonify({
            "status": "success",
            "message": "Edge deleted successfully",
            "deletedEdge": removed_edge
        })
        
    except Exception as e:
        print(f"Error deleting specific edge: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
def delete_all_edges_for_node(node_name):
    """
    Helper to delete all edges where 'from' or 'to' matches the given node name.
    Returns a dict with deletedEdges and deletedCount.
    Raises exceptions on failure.
    """
    # Load current workflow data
    workflow_data = load_workflow_data()
    if workflow_data is None:
        raise Exception("Failed to load workflow data")

    # Separate edges to delete and keep
    edges_to_delete = []
    remaining_edges = []

    for edge in workflow_data["edges"]:
        if edge.get("from") == node_name or edge.get("to") == node_name:
            edges_to_delete.append(edge)
        else:
            remaining_edges.append(edge)

    # Update and save
    workflow_data["edges"] = remaining_edges
    if not save_workflow_data(workflow_data):
        raise Exception("Failed to save workflow data")

    # Log (optional)
    print(f"Deleted {len(edges_to_delete)} edges for node '{node_name}':")
    for edge in edges_to_delete:
        print(json.dumps(edge, indent=2))
    print(f"Total edges now: {len(workflow_data['edges'])}")

    return {
        "deletedEdges": edges_to_delete,
        "deletedCount": len(edges_to_delete)
    }

 
@app.route('/api/workflow/upload', methods=['POST'])
def upload_workflow_to_vapi():
    """Upload the workflow.json to Vapi API using API key from .env"""
    try:
        # Get API key from environment variable
        api_key = os.getenv('VAPI_API_KEY')
        
        if not api_key:
            return jsonify({"error": "VAPI_API_KEY not found in environment variables"}), 400
        
        # Call the upload function
        result = create_vapi_workflow(api_key)
        
        if "error" in result:
            return jsonify({
                "status": "error",
                "message": "Failed to upload workflow to Vapi",
                "error": result["error"]
            }), 500
        
        print("Workflow successfully uploaded to Vapi API")
        print(json.dumps(result, indent=2))
        
        return jsonify({
            "status": "success",
            "message": "Workflow uploaded to Vapi successfully",
            "vapi_response": result
        }), 200
        
    except Exception as e:
        print(f"Error uploading workflow: {e}")
        return jsonify({"error": "Internal server error"}), 500

def create_vapi_workflow(api_key: str):
    """
    Builds the workflow JSON and sends it to the Vapi API
    to create a new workflow.
    """
    vapi_api_url = "https://api.vapi.ai/workflow"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Print the API key to verify it is being read correctly (mask for security)
    masked_key = api_key[:8] + "..." + api_key[-4:] if len(api_key) > 12 else "***"
    print(f"Using API Key: {masked_key}")

    # Open and load the JSON file
    try:
        with open('workflow.json', 'r') as f:
            workflow_data = json.load(f)
    except FileNotFoundError:
        return {"error": "workflow.json file not found"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in workflow.json"}

    try:
        response = requests.post(vapi_api_url, headers=headers, json=workflow_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating Vapi workflow: {e}")
        return {"error": str(e)}

# app.py or routes.py



@app.route('/api/make-call', methods=['POST'])
def make_call_endpoint():
    data = request.get_json()
    phone_number = data.get('phone_number')
    name = data.get('name')
    workflow_id = data.get('workflow_id')  # Optional
    assistant_id = data.get('assistant_id')  # Optional

    if not phone_number or not name:
        return jsonify({"error": "phone_number and name are required"}), 400

    result = make_call(phone_number, name, workflow_id, assistant_id)

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)


# @app.route('/api/edges/deleteAll/<node_name>', methods=['DELETE'])
# def delete_all_edges_for_node(node_name):
#     """Delete all edges that have from or to equal to node_name"""
#     try:
#         # Load current workflow data
#         workflow_data = load_workflow_data()
#         if workflow_data is None:
#             return jsonify({"error": "Failed to load workflow data"}), 500
        
#         # Find all edges to delete
#         edges_to_delete = []
#         remaining_edges = []
        
#         for edge in workflow_data["edges"]:
#             if edge.get("from") == node_name or edge.get("to") == node_name:
#                 edges_to_delete.append(edge)
#             else:
#                 remaining_edges.append(edge)
        
#         # Update edges array
#         workflow_data["edges"] = remaining_edges
        
#         # Save updated workflow data
#         if not save_workflow_data(workflow_data):
#             return jsonify({"error": "Failed to save workflow data"}), 500
        
#         print(f"Deleted {len(edges_to_delete)} edges for node '{node_name}':")
#         for edge in edges_to_delete:
#             print(json.dumps(edge, indent=2))
#         print(f"Total edges now: {len(workflow_data['edges'])}")
        
#         return jsonify({
#             "status": "success",
#             "message": f"Deleted {len(edges_to_delete)} edges for node '{node_name}'",
#             "deletedEdges": edges_to_delete,
#             "deletedCount": len(edges_to_delete)
#         })
        
#     except Exception as e:
#         print(f"Error deleting edges for node: {e}")
#         return jsonify({"error": "Internal server error"}), 500

# @app.route('/api/workflow', methods=['GET'])
# def get_workflow():
#     """Get complete workflow JSON"""
#     try:
#         workflow_data = load_workflow_data()
#         if workflow_data is None:
#             return jsonify({"error": "Failed to load workflow data"}), 500
            
#         return jsonify(workflow_data)
        
#     except Exception as e:
#         print(f"Error getting workflow: {e}")
#         return jsonify({"error": "Internal server error"}), 500

# @app.route('/api/health', methods=['GET'])
# def health_check():
#     """Health check endpoint"""
#     return jsonify({"status": "healthy", "message": "Flask edges backend is running"})

if __name__ == '__main__':
    # Initialize JSON file on startup
    initialize_json_file()
    
    print("Starting Flask backend...")
    print("Available endpoints:")
    print("POST /api/nodes - Upsert node (create/update ready object in JSON)")
    print("GET /api/nodes - Get all nodes")
    print("GET /api/workflow - Get complete workflow")
    print("GET /api/health - Health check")
    print("Starting Flask edges backend...")
    print("Available endpoints:")
    print("POST /api/edges - Upsert edge (create/update ready object in JSON)")
    print("GET /api/edges - Get all edges")
    print("DELETE /api/edges/<from>/<to> - Delete edge by from+to combination")
    print("GET /api/workflow - Get complete workflow")
    print("GET /api/health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)