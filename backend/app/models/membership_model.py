from datetime import datetime

class MembershipModel:
    collection_name = "memberships"

    def __init__(self, workspace_id, user_id, role="viewer", permissions=None):
        self.workspace_id = workspace_id
        self.user_id = user_id
        self.role = role
        self.permissions = permissions or {}
        self.invited_at = datetime.utcnow()
        self.status = "ACTIVE"

    def to_dict(self):
        return {
            "workspace_id": self.workspace_id,
            "user_id": self.user_id,
            "role": self.role,
            "permissions": self.permissions,
            "invited_at": self.invited_at,
            "status": self.status
        }
