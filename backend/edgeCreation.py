from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

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

@app.route('/api/edges/deleteAll/<node_name>', methods=['DELETE'])
def delete_all_edges_for_node(node_name):
    """Delete all edges that have from or to equal to node_name"""
    try:
        # Load current workflow data
        workflow_data = load_workflow_data()
        if workflow_data is None:
            return jsonify({"error": "Failed to load workflow data"}), 500
        
        # Find all edges to delete
        edges_to_delete = []
        remaining_edges = []
        
        for edge in workflow_data["edges"]:
            if edge.get("from") == node_name or edge.get("to") == node_name:
                edges_to_delete.append(edge)
            else:
                remaining_edges.append(edge)
        
        # Update edges array
        workflow_data["edges"] = remaining_edges
        
        # Save updated workflow data
        if not save_workflow_data(workflow_data):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(f"Deleted {len(edges_to_delete)} edges for node '{node_name}':")
        for edge in edges_to_delete:
            print(json.dumps(edge, indent=2))
        print(f"Total edges now: {len(workflow_data['edges'])}")
        
        return jsonify({
            "status": "success",
            "message": f"Deleted {len(edges_to_delete)} edges for node '{node_name}'",
            "deletedEdges": edges_to_delete,
            "deletedCount": len(edges_to_delete)
        })
        
    except Exception as e:
        print(f"Error deleting edges for node: {e}")
        return jsonify({"error": "Internal server error"}), 500

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
    return jsonify({"status": "healthy", "message": "Flask edges backend is running"})

if __name__ == '__main__':
    # Initialize JSON file on startup
    initialize_json_file()
    
    print("Starting Flask edges backend...")
    print("Available endpoints:")
    print("POST /api/edges - Upsert edge (create/update ready object in JSON)")
    print("GET /api/edges - Get all edges")
    print("DELETE /api/edges/<from>/<to> - Delete edge by from+to combination")
    print("GET /api/workflow - Get complete workflow")
    print("GET /api/health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)