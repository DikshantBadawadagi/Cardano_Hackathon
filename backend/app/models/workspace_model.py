from datetime import datetime

class WorkspaceModel:
    collection_name = "workspaces"

    def __init__(self, name, owner_user_id, is_editable_by_collaborators=True):
        self.name = name
        self.owner_user_id = owner_user_id
        self.is_editable_by_collaborators = is_editable_by_collaborators
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "name": self.name,
            "owner_user_id": self.owner_user_id,
            "is_editable_by_collaborators": self.is_editable_by_collaborators,
            "created_at": self.created_at
        }
