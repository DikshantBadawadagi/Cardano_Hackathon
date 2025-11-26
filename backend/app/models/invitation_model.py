from datetime import datetime
import uuid

class InvitationModel:
    collection_name = "invitations"

    def __init__(self, workspace_id, email, invited_by):
        self.workspace_id = workspace_id
        self.email = email.lower()
        self.token = str(uuid.uuid4())
        self.invited_by = invited_by
        self.status = "PENDING"
        self.invited_at = datetime.utcnow()
        self.expires_at = datetime.utcnow()  # you can add +7 days

    def to_dict(self):
        return {
            "workspace_id": self.workspace_id,
            "email": self.email,
            "token": self.token,
            "invited_by": self.invited_by,
            "status": self.status,
            "invited_at": self.invited_at,
            "expires_at": self.expires_at
        }
