from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from app.services.workflow_service import WorkflowService
from datetime import datetime
import json

workflow_bp = Blueprint('workflow', __name__)

# Middleware-like function to extract user from request
def get_current_user():
    """
    Extract user_id from request
    Adjust this based on your actual auth implementation
    Assuming user info is in request object after auth middleware
    """
    # Try to get from request object (set by your auth middleware)
    if hasattr(request, '_id'):
        return str(request._id)
    
    # Fallback to checking g object
    if hasattr(g, 'user_id'):
        return str(g.user_id)
    
    return None

# Middleware-like function to validate and extract common parameters
def validate_workflow_access(workspace_id, workflow_id, user_id, permission_type="edit"):
    """
    Validate workspace and workflow IDs, check user permissions
    Returns (workflow, error_response) tuple
    If error_response is not None, return it immediately
    """
    # Validate ObjectId format
    try:
        ObjectId(workspace_id)
        ObjectId(workflow_id)
    except Exception:
        return None, (jsonify({"error": "Invalid workspace_id or workflow_id format"}), 400)
    
    # Check workspace access based on role
    if not WorkflowService.check_workspace_access(workspace_id, user_id, permission_type):
        user_role = WorkflowService.get_user_role_in_workspace(workspace_id, user_id)
        if user_role == "viewer" and permission_type == "edit":
            return None, (jsonify({"error": "Viewers do not have edit permission"}), 403)
        return None, (jsonify({"error": "Access denied to workspace"}), 403)
    
    # Get workflow
    workflow = WorkflowService.get_workflow(workspace_id, workflow_id)
    if not workflow:
        return None, (jsonify({"error": "Workflow not found"}), 404)
    
    return workflow, None


# ==================== WORKFLOW CRUD ENDPOINTS ====================

@workflow_bp.route('/api/workspaces/<workspace_id>/workflows', methods=['POST'])
def create_workflow(workspace_id):
    """Create a new workflow in a workspace"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate ObjectId format
        try:
            ObjectId(workspace_id)
        except Exception:
            return jsonify({"error": "Invalid workspace_id format"}), 400
        
        # Check if user has edit access to workspace (can create workflows)
        if not WorkflowService.check_workspace_access(workspace_id, user_id, "edit"):
            return jsonify({"error": "You don't have permission to create workflows in this workspace"}), 403
        
        # Get workflow name from request body. Accept JSON or form data.
        request_data = request.get_json(silent=True)
        if request_data is None:
            # fallback to form-encoded body
            request_data = request.form.to_dict()

        if not request_data or not request_data.get('name'):
            # Provide a helpful error if client forgot Content-Type
            ct = request.headers.get('Content-Type', '')
            return jsonify({
                "error": "Workflow name is required",
                "hint": "Send JSON with header 'Content-Type: application/json' or use form data",
                "content_type_received": ct
            }), 400

        workflow_name = request_data.get('name')
        
        # Create workflow
        workflow = WorkflowService.create_workflow(workspace_id, workflow_name, user_id)
        if not workflow:
            return jsonify({"error": "Failed to create workflow"}), 500
        
        # Convert ObjectIds to strings for JSON response
        workflow["_id"] = str(workflow["_id"])
        workflow["workspace_id"] = str(workflow["workspace_id"])
        workflow["created_by"] = str(workflow["created_by"])
        
        return jsonify({
            "status": "success",
            "message": "Workflow created successfully",
            "workflow": workflow
        }), 201
        
    except Exception as e:
        print(f"Error creating workflow: {e}")
        return jsonify({"error": "Internal server error"}), 500


@workflow_bp.route('/api/workspaces/<workspace_id>/workflows', methods=['GET'])
def get_all_workflows(workspace_id):
    """Get all workflows in a workspace"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate ObjectId format
        try:
            ObjectId(workspace_id)
        except Exception:
            return jsonify({"error": "Invalid workspace_id format"}), 400
        
        # Check workspace access (read permission)
        if not WorkflowService.check_workspace_access(workspace_id, user_id, "read"):
            return jsonify({"error": "Access denied to workspace"}), 403
        
        # Get all workflows
        workflows = WorkflowService.get_all_workflows_in_workspace(workspace_id)
        
        # Convert ObjectIds to strings
        for workflow in workflows:
            workflow["_id"] = str(workflow["_id"])
            workflow["workspace_id"] = str(workflow["workspace_id"])
            workflow["created_by"] = str(workflow["created_by"])
        
        return jsonify({
            "status": "success",
            "workflows": workflows,
            "count": len(workflows)
        })
        
    except Exception as e:
        print(f"Error getting workflows: {e}")
        return jsonify({"error": "Internal server error"}), 500


@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>', methods=['GET'])
def get_workflow(workspace_id, workflow_id):
    """Get complete workflow including body_json"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (read permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "read")
        if error:
            return error
        
        # Convert ObjectIds to strings for JSON serialization
        workflow["_id"] = str(workflow["_id"])
        workflow["workspace_id"] = str(workflow["workspace_id"])
        workflow["created_by"] = str(workflow["created_by"])
        
        return jsonify({
            "status": "success",
            "workflow": workflow
        })
        
    except Exception as e:
        print(f"Error getting workflow: {e}")
        return jsonify({"error": "Internal server error"}), 500


@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>/name', methods=['PUT'])
def update_workflow_name(workspace_id, workflow_id):
    """Update workflow name"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (edit permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "edit")
        if error:
            return error
        
        # Get name from request. Accept JSON or form data.
        request_data = request.get_json(silent=True)
        if request_data is None:
            request_data = request.form.to_dict()

        if not request_data or not request_data.get('name'):
            ct = request.headers.get('Content-Type', '')
            return jsonify({
                "error": "Workflow name is required",
                "hint": "Send JSON with header 'Content-Type: application/json' or use form data",
                "content_type_received": ct
            }), 400

        workflow_name = request_data.get('name')
        
        # Update workflow name
        if not WorkflowService.update_workflow_name(workspace_id, workflow_id, workflow_name):
            return jsonify({"error": "Failed to update workflow name"}), 500
        
        print(f"Workflow name updated to: '{workflow_name}'")
        
        return jsonify({
            "status": "success",
            "message": "Workflow name updated successfully",
            "name": workflow_name
        }), 200
        
    except Exception as e:
        print(f"Error updating workflow name: {e}")
        return jsonify({"error": "Internal server error"}), 500


@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>', methods=['DELETE'])
def delete_workflow(workspace_id, workflow_id):
    """Delete a workflow"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (edit permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "edit")
        if error:
            return error
        
        # Delete workflow
        if not WorkflowService.delete_workflow(workspace_id, workflow_id):
            return jsonify({"error": "Failed to delete workflow"}), 500
        
        print(f"Workflow {workflow_id} deleted from workspace {workspace_id}")
        
        return jsonify({
            "status": "success",
            "message": "Workflow deleted successfully"
        }), 200
        
    except Exception as e:
        print(f"Error deleting workflow: {e}")
        return jsonify({"error": "Internal server error"}), 500


# ==================== NODE ENDPOINTS ====================

@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>/nodes', methods=['POST'])
def upsert_node(workspace_id, workflow_id):
    """Upsert a node - update if name exists, insert if not"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (edit permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "edit")
        if error:
            return error
        
        # Get node data from request (accept JSON or form data)
        node_data = request.get_json(silent=True)
        if node_data is None:
            node_data = request.form.to_dict()

        if not node_data:
            ct = request.headers.get('Content-Type', '')
            return jsonify({
                "error": "No node data provided",
                "hint": "Send JSON with header 'Content-Type: application/json' or use form data",
                "content_type_received": ct
            }), 400

        if not node_data.get("name"):
            return jsonify({"error": "Node must have a name"}), 400
        
        # Get current body_json from MongoDB
        body_json = workflow.get("body_json", {"name": "", "nodes": [], "edges": [], "globalPrompt": ""})
        
        # Find existing node by name
        node_name = node_data.get("name")
        existing_node_index = None
        
        for i, node in enumerate(body_json["nodes"]):
            if node.get("name") == node_name:
                existing_node_index = i
                break
        
        operation = ""
        if existing_node_index is not None:
            # Update existing node
            body_json["nodes"][existing_node_index] = node_data
            operation = "updated"
            print(f"Node '{node_name}' updated in workflow {workflow_id}")
        else:
            # Insert new node
            body_json["nodes"].append(node_data)
            operation = "created"
            print(f"Node '{node_name}' created in workflow {workflow_id}")
        
        # Save updated body_json back to MongoDB
        if not WorkflowService.update_workflow_body(workspace_id, workflow_id, body_json):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(json.dumps(node_data, indent=2))
        print(f"Total nodes now: {len(body_json['nodes'])}")
        
        return jsonify({
            "status": "success",
            "message": f"Node {operation} successfully",
            "operation": operation,
            "node": node_data
        }), 200 if operation == "updated" else 201
        
    except Exception as e:
        print(f"Error upserting node: {e}")
        return jsonify({"error": "Internal server error"}), 500


@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>/nodes', methods=['GET'])
def get_all_nodes(workspace_id, workflow_id):
    """Get all nodes"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (read permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "read")
        if error:
            return error
        
        # Get nodes from body_json
        body_json = workflow.get("body_json", {"nodes": []})
        nodes = body_json.get("nodes", [])
        
        return jsonify({
            "status": "success",
            "nodes": nodes,
            "count": len(nodes)
        })
        
    except Exception as e:
        print(f"Error getting nodes: {e}")
        return jsonify({"error": "Internal server error"}), 500


@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>/nodes/delete', methods=['POST'])
def delete_specific_node(workspace_id, workflow_id):
    """Delete a specific node and all its edges"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (edit permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "edit")
        if error:
            return error
        
        # Get node to delete (accept JSON or form data)
        node_to_delete = request.get_json(silent=True)
        if node_to_delete is None:
            node_to_delete = request.form.to_dict()

        if not node_to_delete:
            ct = request.headers.get('Content-Type', '')
            return jsonify({
                "error": "No node data provided",
                "hint": "Send JSON with header 'Content-Type: application/json' or use form data",
                "content_type_received": ct
            }), 400

        node_name = node_to_delete.get("name")
        if not node_name:
            return jsonify({"error": "Node must have a name"}), 400
        
        # Get current body_json from MongoDB
        body_json = workflow.get("body_json", {"nodes": [], "edges": []})
        
        # Find and remove the node
        node_found = False
        removed_node = None
        for i, node in enumerate(body_json["nodes"]):
            if node == node_to_delete:
                removed_node = body_json["nodes"].pop(i)
                node_found = True
                break
        
        if not node_found:
            return jsonify({"error": "Exact node not found"}), 404
        
        # Delete all edges connected to this node
        edges_before = len(body_json["edges"])
        body_json["edges"] = [
            edge for edge in body_json["edges"]
            if edge.get("from") != node_name and edge.get("to") != node_name
        ]
        edges_deleted = edges_before - len(body_json["edges"])
        
        # Save updated body_json back to MongoDB
        if not WorkflowService.update_workflow_body(workspace_id, workflow_id, body_json):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(f"Node '{node_name}' deleted from workflow {workflow_id}")
        print(f"Associated {edges_deleted} edges also deleted")
        print(f"Total nodes now: {len(body_json['nodes'])}")
        
        return jsonify({
            "status": "success",
            "message": f"Node and {edges_deleted} associated edges deleted successfully",
            "deletedNode": removed_node,
            "edgesDeleted": edges_deleted
        })
        
    except Exception as e:
        print(f"Error deleting node: {e}")
        return jsonify({"error": "Internal server error"}), 500


# ==================== EDGE ENDPOINTS ====================

@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>/edges', methods=['POST'])
def upsert_edge(workspace_id, workflow_id):
    """Upsert an edge - update if from+to exists, insert if not"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (edit permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "edit")
        if error:
            return error
        
        # Get edge data (accept JSON or form data)
        edge_data = request.get_json(silent=True)
        if edge_data is None:
            edge_data = request.form.to_dict()

        if not edge_data:
            ct = request.headers.get('Content-Type', '')
            return jsonify({
                "error": "No edge data provided",
                "hint": "Send JSON with header 'Content-Type: application/json' or use form data",
                "content_type_received": ct
            }), 400

        if not edge_data.get("from") or not edge_data.get("to"):
            return jsonify({"error": "Edge must have 'from' and 'to' fields"}), 400
        
        # Get current body_json from MongoDB
        body_json = workflow.get("body_json", {"nodes": [], "edges": []})
        
        # Find existing edge by from+to combination
        edge_from = edge_data.get("from")
        edge_to = edge_data.get("to")
        existing_edge_index = None
        
        for i, edge in enumerate(body_json["edges"]):
            if edge.get("from") == edge_from and edge.get("to") == edge_to:
                existing_edge_index = i
                break
        
        operation = ""
        if existing_edge_index is not None:
            # Update existing edge
            body_json["edges"][existing_edge_index] = edge_data
            operation = "updated"
            print(f"Edge '{edge_from}' -> '{edge_to}' updated in workflow {workflow_id}")
        else:
            # Insert new edge
            body_json["edges"].append(edge_data)
            operation = "created"
            print(f"Edge '{edge_from}' -> '{edge_to}' created in workflow {workflow_id}")
        
        # Save updated body_json back to MongoDB
        if not WorkflowService.update_workflow_body(workspace_id, workflow_id, body_json):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(json.dumps(edge_data, indent=2))
        print(f"Total edges now: {len(body_json['edges'])}")
        
        return jsonify({
            "status": "success",
            "message": f"Edge {operation} successfully",
            "operation": operation,
            "edge": edge_data
        }), 200 if operation == "updated" else 201
        
    except Exception as e:
        print(f"Error upserting edge: {e}")
        return jsonify({"error": "Internal server error"}), 500


@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>/edges', methods=['GET'])
def get_all_edges(workspace_id, workflow_id):
    """Get all edges"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (read permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "read")
        if error:
            return error
        
        # Get edges from body_json
        body_json = workflow.get("body_json", {"edges": []})
        edges = body_json.get("edges", [])
        
        return jsonify({
            "status": "success",
            "edges": edges,
            "count": len(edges)
        })
        
    except Exception as e:
        print(f"Error getting edges: {e}")
        return jsonify({"error": "Internal server error"}), 500


@workflow_bp.route('/api/workspaces/<workspace_id>/workflows/<workflow_id>/edges/delete', methods=['POST'])
def delete_specific_edge(workspace_id, workflow_id):
    """Delete a specific edge"""
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        
        # Validate access (edit permission)
        workflow, error = validate_workflow_access(workspace_id, workflow_id, user_id, "edit")
        if error:
            return error
        
        # Get edge to delete (accept JSON or form data)
        edge_to_delete = request.get_json(silent=True)
        if edge_to_delete is None:
            edge_to_delete = request.form.to_dict()

        if not edge_to_delete:
            ct = request.headers.get('Content-Type', '')
            return jsonify({
                "error": "No edge data provided",
                "hint": "Send JSON with header 'Content-Type: application/json' or use form data",
                "content_type_received": ct
            }), 400
        
        # Get current body_json from MongoDB
        body_json = workflow.get("body_json", {"edges": []})
        
        # Find and remove the edge
        edge_found = False
        removed_edge = None
        for i, edge in enumerate(body_json["edges"]):
            if edge == edge_to_delete:
                removed_edge = body_json["edges"].pop(i)
                edge_found = True
                break
        
        if not edge_found:
            return jsonify({"error": "Exact edge not found"}), 404
        
        # Save updated body_json back to MongoDB
        if not WorkflowService.update_workflow_body(workspace_id, workflow_id, body_json):
            return jsonify({"error": "Failed to save workflow data"}), 500
        
        print(f"Edge deleted from workflow {workflow_id}")
        print(json.dumps(removed_edge, indent=2))
        print(f"Total edges now: {len(body_json['edges'])}")
        
        return jsonify({
            "status": "success",
            "message": "Edge deleted successfully",
            "deletedEdge": removed_edge
        })
        
    except Exception as e:
        print(f"Error deleting edge: {e}")
        return jsonify({"error": "Internal server error"}), 500