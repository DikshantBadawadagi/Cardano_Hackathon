from bson import ObjectId
from datetime import datetime
from app.db import db

class WorkflowService:
    """Service layer for workflow database operations"""
    
    @staticmethod
    def create_workflow(workspace_id, workflow_name, user_id):
        """
        Create a new workflow with default structure
        Returns the created workflow document or None on failure
        """
        try:
            # Initialize with exact structure as specified
            initial_body_json = {
                "name": workflow_name,
                "nodes": [],
                "edges": [],
                "globalPrompt": ""
            }
            
            workflow_data = {
                "name": workflow_name,
                "workspace_id": ObjectId(workspace_id),
                "created_by": ObjectId(user_id),
                "body_json": initial_body_json,
                "version": 1,
                "permissions": {
                    "read": [],
                    "edit": []
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = db.workflows.insert_one(workflow_data)
            workflow_data["_id"] = result.inserted_id
            
            print(f"Workflow '{workflow_name}' created in workspace {workspace_id}")
            return workflow_data
            
        except Exception as e:
            print(f"Error creating workflow: {e}")
            return None
    
    @staticmethod
    def get_workflow(workspace_id, workflow_id):
        """
        Get a workflow by workspace_id and workflow_id
        Returns the workflow document or None if not found
        """
        try:
            workflow = db.workflows.find_one({
                "_id": ObjectId(workflow_id),
                "workspace_id": ObjectId(workspace_id)
            })
            return workflow
        except Exception as e:
            print(f"Error fetching workflow: {e}")
            return None
    
    @staticmethod
    def get_all_workflows_in_workspace(workspace_id):
        """
        Get all workflows in a workspace
        Returns list of workflows or empty list
        """
        try:
            workflows = list(db.workflows.find({
                "workspace_id": ObjectId(workspace_id)
            }).sort("created_at", -1))
            return workflows
        except Exception as e:
            print(f"Error fetching workflows: {e}")
            return []
    
    @staticmethod
    def update_workflow_body(workspace_id, workflow_id, updated_body_json):
        """
        Update the body_json field of a workflow and set updated_at timestamp
        Returns True if successful, False otherwise
        """
        try:
            result = db.workflows.update_one(
                {
                    "_id": ObjectId(workflow_id),
                    "workspace_id": ObjectId(workspace_id)
                },
                {
                    "$set": {
                        "body_json": updated_body_json,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0 or result.matched_count > 0
        except Exception as e:
            print(f"Error updating workflow body: {e}")
            return False
    
    @staticmethod
    def update_workflow_name(workspace_id, workflow_id, new_name):
        """
        Update workflow name in both the document and body_json
        Returns True if successful, False otherwise
        """
        try:
            # First get the workflow
            workflow = WorkflowService.get_workflow(workspace_id, workflow_id)
            if not workflow:
                return False
            
            # Update name in body_json
            body_json = workflow.get("body_json", {})
            body_json["name"] = new_name
            
            # Update both name field and body_json
            result = db.workflows.update_one(
                {
                    "_id": ObjectId(workflow_id),
                    "workspace_id": ObjectId(workspace_id)
                },
                {
                    "$set": {
                        "name": new_name,
                        "body_json": body_json,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating workflow name: {e}")
            return False
    
    @staticmethod
    def delete_workflow(workspace_id, workflow_id):
        """
        Delete a workflow
        Returns True if successful, False otherwise
        """
        try:
            result = db.workflows.delete_one({
                "_id": ObjectId(workflow_id),
                "workspace_id": ObjectId(workspace_id)
            })
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting workflow: {e}")
            return False
    
    @staticmethod
    def get_workspace(workspace_id):
        """Get workspace by ID"""
        try:
            workspace = db.workspaces.find_one({"_id": ObjectId(workspace_id)})
            return workspace
        except Exception as e:
            print(f"Error fetching workspace: {e}")
            return None
    
    @staticmethod
    def get_user_role_in_workspace(workspace_id, user_id):
        """
        Get user's role in workspace
        Returns: 'owner', 'admin', 'editor', 'viewer', or None
        """
        try:
            workspace = WorkflowService.get_workspace(workspace_id)
            if not workspace:
                return None
            
            # Check if user is owner
            if str(workspace.get("owner_user_id")) == str(user_id):
                return "owner"
            
            # Check workspace members/collaborators collection
            # Assuming you have a workspace_members collection
            member = db.workspace_members.find_one({
                "workspace_id": ObjectId(workspace_id),
                "user_id": ObjectId(user_id)
            })
            
            if member:
                return member.get("role")  # Returns 'admin', 'editor', or 'viewer'
            
            return None
            
        except Exception as e:
            print(f"Error getting user role: {e}")
            return None
    
    @staticmethod
    def check_workspace_access(workspace_id, user_id, required_permission="read"):
        """
        Check if user has required permission in workspace
        required_permission: 'read' or 'edit'
        Returns True if user has permission, False otherwise
        """
        try:
            role = WorkflowService.get_user_role_in_workspace(workspace_id, user_id)
            
            if not role:
                return False
            
            # Owner, admin, and editor can edit
            # Viewer can only read
            if required_permission == "edit":
                return role in ["owner", "admin", "editor"]
            elif required_permission == "read":
                return role in ["owner", "admin", "editor", "viewer"]
            
            return False
            
        except Exception as e:
            print(f"Error checking workspace access: {e}")
            return False