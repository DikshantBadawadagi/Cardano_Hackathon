from datetime import datetime

class WorkflowModel:
    collection_name = "workflows"

    def __init__(self, name, workspace_id, created_by, body_json):
        self.name = name
        self.workspace_id = workspace_id
        self.created_by = created_by
        self.body_json = body_json
        self.version = 1
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.permissions = {
            "read": [],
            "edit": []
        }

    def to_dict(self):
        return {
            "name": self.name,
            "workspace_id": self.workspace_id,
            "created_by": self.created_by,
            "body_json": self.body_json,
            "version": self.version,
            "permissions": self.permissions,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
