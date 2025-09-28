from flask import Flask, request, jsonify
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
JSON_FILE_PATH = 'workflow_data.json'

class WorkflowManager:
    def __init__(self):
        self.workflow_data = self._load_workflow()
    
    def _load_workflow(self) -> Dict[str, Any]:
        """Load workflow from file or create default structure"""
        if os.path.exists(JSON_FILE_PATH):
            try:
                with open(JSON_FILE_PATH, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading workflow: {e}")
                return self._create_default_workflow()
        else:
            return self._create_default_workflow()
    
    def _create_default_workflow(self) -> Dict[str, Any]:
        """Create default workflow structure"""
        return {
            "name": "",
            "nodes": [],
            "edges": [],
            "globalPrompt": ""
        }
    
    def _save_workflow(self) -> bool:
        """Save workflow to file"""
        try:
            with open(JSON_FILE_PATH, 'w') as f:
                json.dump(self.workflow_data, f, indent=2)
            return True
        except IOError as e:
            print(f"Error saving workflow: {e}")
            return False
    
    def _find_node_index(self, name: str, node_type: str) -> Optional[int]:
        """Find node index by name and type"""
        for i, node in enumerate(self.workflow_data['nodes']):
            if node['name'] == name and node['type'] == node_type:
                return i
        return None
    
    def _find_edge_index(self, from_node: str, to_node: str) -> Optional[int]:
        """Find edge index by from and to nodes"""
        for i, edge in enumerate(self.workflow_data['edges']):
            if edge['from'] == from_node and edge['to'] == to_node:
                return i
        return None
    
    def _validate_node_data(self, node_data: Dict[str, Any]) -> tuple[bool, str]:
        """Validate node data structure"""
        required_fields = ['name', 'type']
        
        for field in required_fields:
            if field not in node_data:
                return False, f"Missing required field: {field}"
        
        valid_types = ['conversation', 'conversational', 'tool']
        if node_data['type'] not in valid_types:
            return False, f"Invalid node type. Must be one of: {valid_types}"
        
        # Check for duplicate node (name + type combination)
        if self._find_node_index(node_data['name'], node_data['type']) is not None:
            return False, f"Node with name '{node_data['name']}' and type '{node_data['type']}' already exists"
        
        return True, ""
    
    def _validate_edge_data(self, edge_data: Dict[str, Any]) -> tuple[bool, str]:
        """Validate edge data structure"""
        required_fields = ['from', 'to']
        
        for field in required_fields:
            if field not in edge_data:
                return False, f"Missing required field: {field}"
        
        # Check if from and to nodes exist
        from_exists = any(node['name'] == edge_data['from'] for node in self.workflow_data['nodes'])
        to_exists = any(node['name'] == edge_data['to'] for node in self.workflow_data['nodes'])
        
        if not from_exists:
            return False, f"Source node '{edge_data['from']}' does not exist"
        
        if not to_exists:
            return False, f"Target node '{edge_data['to']}' does not exist"
        
        # Check for duplicate edge
        if self._find_edge_index(edge_data['from'], edge_data['to']) is not None:
            return False, f"Edge from '{edge_data['from']}' to '{edge_data['to']}' already exists"
        
        return True, ""
    
    # Node operations
    def create_node(self, node_data: Dict[str, Any]) -> tuple[bool, str, Optional[Dict[str, Any]]]:
        """Create a new node"""
        is_valid, error_msg = self._validate_node_data(node_data)
        if not is_valid:
            return False, error_msg, None
        
        # Set default values for optional fields
        node = {
            "name": node_data['name'],
            "type": node_data['type'],
            "metadata": node_data.get('metadata', {"position": {"x": 0, "y": 0}}),
        }
        
        # Add type-specific fields
        if node_data['type'] in ['conversation', 'conversational']:
            node.update({
                "isStart": node_data.get('isStart', False),
                "prompt": node_data.get('prompt', ''),
                "messagePlan": node_data.get('messagePlan', {"firstMessage": ""}),
                "toolIds": node_data.get('toolIds', [])
            })
            
            if 'variableExtractionPlan' in node_data:
                node['variableExtractionPlan'] = node_data['variableExtractionPlan']
        
        elif node_data['type'] == 'tool':
            node['tool'] = node_data.get('tool', {})
        
        self.workflow_data['nodes'].append(node)
        
        if self._save_workflow():
            return True, "Node created successfully", node
        else:
            # Rollback
            self.workflow_data['nodes'].pop()
            return False, "Failed to save workflow", None
    
    def update_node(self, name: str, node_type: str, update_data: Dict[str, Any]) -> tuple[bool, str, Optional[Dict[str, Any]]]:
        """Update an existing node"""
        node_index = self._find_node_index(name, node_type)
        if node_index is None:
            return False, f"Node with name '{name}' and type '{node_type}' not found", None
        
        # Store original node for rollback
        original_node = self.workflow_data['nodes'][node_index].copy()
        
        # Update node fields (excluding name and type)
        allowed_updates = ['metadata', 'isStart', 'prompt', 'messagePlan', 'toolIds', 'variableExtractionPlan', 'tool']
        
        for field, value in update_data.items():
            if field in allowed_updates:
                self.workflow_data['nodes'][node_index][field] = value
        
        if self._save_workflow():
            return True, "Node updated successfully", self.workflow_data['nodes'][node_index]
        else:
            # Rollback
            self.workflow_data['nodes'][node_index] = original_node
            return False, "Failed to save workflow", None
    
    def delete_node(self, name: str, node_type: str) -> tuple[bool, str]:
        """Delete a node and all its connected edges"""
        node_index = self._find_node_index(name, node_type)
        if node_index is None:
            return False, f"Node with name '{name}' and type '{node_type}' not found"
        
        # Store original data for rollback
        original_node = self.workflow_data['nodes'][node_index]
        original_edges = self.workflow_data['edges'].copy()
        
        # Remove the node
        self.workflow_data['nodes'].pop(node_index)
        
        # Remove all edges connected to this node
        self.workflow_data['edges'] = [
            edge for edge in self.workflow_data['edges']
            if edge['from'] != name and edge['to'] != name
        ]
        
        if self._save_workflow():
            return True, f"Node '{name}' and its connected edges deleted successfully"
        else:
            # Rollback
            self.workflow_data['nodes'].insert(node_index, original_node)
            self.workflow_data['edges'] = original_edges
            return False, "Failed to save workflow"
    
    # Edge operations
    def create_edge(self, edge_data: Dict[str, Any]) -> tuple[bool, str, Optional[Dict[str, Any]]]:
        """Create a new edge"""
        is_valid, error_msg = self._validate_edge_data(edge_data)
        if not is_valid:
            return False, error_msg, None
        
        edge = {
            "from": edge_data['from'],
            "to": edge_data['to'],
            "condition": edge_data.get('condition', {"type": "ai", "prompt": ""})
        }
        
        self.workflow_data['edges'].append(edge)
        
        if self._save_workflow():
            return True, "Edge created successfully", edge
        else:
            # Rollback
            self.workflow_data['edges'].pop()
            return False, "Failed to save workflow", None
    
    def update_edge(self, from_node: str, to_node: str, update_data: Dict[str, Any]) -> tuple[bool, str, Optional[Dict[str, Any]]]:
        """Update an existing edge"""
        edge_index = self._find_edge_index(from_node, to_node)
        if edge_index is None:
            return False, f"Edge from '{from_node}' to '{to_node}' not found", None
        
        # Store original edge for rollback
        original_edge = self.workflow_data['edges'][edge_index].copy()
        
        # Update edge condition
        if 'condition' in update_data:
            self.workflow_data['edges'][edge_index]['condition'] = update_data['condition']
        
        if self._save_workflow():
            return True, "Edge updated successfully", self.workflow_data['edges'][edge_index]
        else:
            # Rollback
            self.workflow_data['edges'][edge_index] = original_edge
            return False, "Failed to save workflow", None
    
    def delete_edge(self, from_node: str, to_node: str) -> tuple[bool, str]:
        """Delete an edge"""
        edge_index = self._find_edge_index(from_node, to_node)
        if edge_index is None:
            return False, f"Edge from '{from_node}' to '{to_node}' not found"
        
        # Store original edge for rollback
        original_edge = self.workflow_data['edges'][edge_index]
        
        # Remove the edge
        self.workflow_data['edges'].pop(edge_index)
        
        if self._save_workflow():
            return True, f"Edge from '{from_node}' to '{to_node}' deleted successfully"
        else:
            # Rollback
            self.workflow_data['edges'].insert(edge_index, original_edge)
            return False, "Failed to save workflow"
    
    # Workflow operations
    def get_workflow(self) -> Dict[str, Any]:
        """Get the complete workflow"""
        return self.workflow_data
    
    def update_workflow_name(self, name: str) -> tuple[bool, str]:
        """Update workflow name"""
        original_name = self.workflow_data['name']
        self.workflow_data['name'] = name
        
        if self._save_workflow():
            return True, "Workflow name updated successfully"
        else:
            # Rollback
            self.workflow_data['name'] = original_name
            return False, "Failed to save workflow"

# Initialize workflow manager
workflow_manager = WorkflowManager()

# API Routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/workflow', methods=['GET'])
def get_workflow():
    """Get the complete workflow"""
    return jsonify(workflow_manager.get_workflow())

@app.route('/workflow/name', methods=['PUT'])
def update_workflow_name():
    """Update workflow name"""
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Missing 'name' field"}), 400
    
    success, message = workflow_manager.update_workflow_name(data['name'])
    if success:
        return jsonify({"message": message, "workflow": workflow_manager.get_workflow()})
    else:
        return jsonify({"error": message}), 500

@app.route('/nodes', methods=['POST'])
def create_node():
    """Create a new node"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    success, message, node = workflow_manager.create_node(data)
    if success:
        return jsonify({"message": message, "node": node, "workflow": workflow_manager.get_workflow()}), 201
    else:
        return jsonify({"error": message}), 400

@app.route('/nodes/<node_name>/<node_type>', methods=['PUT'])
def update_node(node_name, node_type):
    """Update an existing node"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    success, message, node = workflow_manager.update_node(node_name, node_type, data)
    if success:
        return jsonify({"message": message, "node": node, "workflow": workflow_manager.get_workflow()})
    else:
        return jsonify({"error": message}), 404 if "not found" in message else 400

@app.route('/nodes/<node_name>/<node_type>', methods=['DELETE'])
def delete_node(node_name, node_type):
    """Delete a node"""
    success, message = workflow_manager.delete_node(node_name, node_type)
    if success:
        return jsonify({"message": message, "workflow": workflow_manager.get_workflow()})
    else:
        return jsonify({"error": message}), 404

@app.route('/edges', methods=['POST'])
def create_edge():
    """Create a new edge"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    success, message, edge = workflow_manager.create_edge(data)
    if success:
        return jsonify({"message": message, "edge": edge, "workflow": workflow_manager.get_workflow()}), 201
    else:
        return jsonify({"error": message}), 400

@app.route('/edges/<from_node>/<to_node>', methods=['PUT'])
def update_edge(from_node, to_node):
    """Update an existing edge"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    success, message, edge = workflow_manager.update_edge(from_node, to_node, data)
    if success:
        return jsonify({"message": message, "edge": edge, "workflow": workflow_manager.get_workflow()})
    else:
        return jsonify({"error": message}), 404

@app.route('/edges/<from_node>/<to_node>', methods=['DELETE'])
def delete_edge(from_node, to_node):
    """Delete an edge"""
    success, message = workflow_manager.delete_edge(from_node, to_node)
    if success:
        return jsonify({"message": message, "workflow": workflow_manager.get_workflow()})
    else:
        return jsonify({"error": message}), 404

@app.route('/nodes', methods=['GET'])
def get_nodes():
    """Get all nodes"""
    workflow = workflow_manager.get_workflow()
    return jsonify({"nodes": workflow['nodes']})

@app.route('/edges', methods=['GET'])
def get_edges():
    """Get all edges"""
    workflow = workflow_manager.get_workflow()
    return jsonify({"edges": workflow['edges']})

@app.route('/test', methods=['POST'])
def workflow():
    data = request.get_json()
    print("Received data:", data)  # Print everything sent in the body
    return jsonify({"application_status": "done"}), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)