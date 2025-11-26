from typing import Optional, List, Dict
from app.db import db
from app.models.workspace_model import WorkspaceModel
from app.models.membership_model import MembershipModel
from app.models.invitation_model import InvitationModel
from app.services.user_service import UserService
from bson.objectid import ObjectId


class WorkspaceService:
    coll = db[WorkspaceModel.collection_name]
    members_coll = db[MembershipModel.collection_name]
    invites_coll = db[InvitationModel.collection_name]

    @staticmethod
    def _normalize(doc: Optional[dict]) -> Optional[dict]:
        if not doc:
            return None
        out = dict(doc)
        if '_id' in out:
            out['_id'] = str(out['_id'])
        return out

    @staticmethod
    def create_workspace(name: str, owner_user_id: str, is_editable_by_collaborators: bool = True) -> Dict:
        ws = WorkspaceModel(name=name, owner_user_id=owner_user_id, is_editable_by_collaborators=is_editable_by_collaborators)
        doc = ws.to_dict()
        result = WorkspaceService.coll.insert_one(doc)
        doc['_id'] = str(result.inserted_id)

        # create membership for owner
        membership = MembershipModel(workspace_id=doc['_id'], user_id=owner_user_id, role='owner')
        mdoc = membership.to_dict()
        mres = WorkspaceService.members_coll.insert_one(mdoc)
        mdoc['_id'] = str(mres.inserted_id)

        return {'workspace': doc, 'membership': mdoc}

    @staticmethod
    def get_workspace(workspace_id: str) -> Optional[dict]:
        try:
            oid = ObjectId(workspace_id)
        except Exception:
            # maybe id is string stored as _id string
            doc = WorkspaceService.coll.find_one({'_id': workspace_id})
            return WorkspaceService._normalize(doc)
        doc = WorkspaceService.coll.find_one({'_id': oid})
        return WorkspaceService._normalize(doc)

    @staticmethod
    def list_for_user(user_id: str) -> List[dict]:
        # list workspaces where user is a member
        rows = WorkspaceService.members_coll.find({'user_id': user_id})
        workspace_ids = [r.get('workspace_id') for r in rows]
        docs = []
        for wid in workspace_ids:
            w = WorkspaceService.coll.find_one({'_id': wid})
            if not w:
                # maybe _id stored as ObjectId
                try:
                    w = WorkspaceService.coll.find_one({'_id': ObjectId(wid)})
                except Exception:
                    w = None
            if w:
                docs.append(WorkspaceService._normalize(w))
        return docs

    @staticmethod
    def update_workspace(workspace_id: str, update: dict, actor_user_id: str) -> Optional[dict]:
        ws = WorkspaceService.get_workspace(workspace_id)
        if not ws:
            return None
        if ws.get('owner_user_id') != actor_user_id:
            raise PermissionError('Only owner can update workspace')
        # apply update
        # store fields allowed
        allowed = ['name', 'is_editable_by_collaborators']
        payload = {k: v for k, v in update.items() if k in allowed}
        if not payload:
            return ws
        # attempt update by _id being ObjectId or str
        try:
            WorkspaceService.coll.update_one({'_id': ObjectId(workspace_id)}, {'$set': payload})
        except Exception:
            WorkspaceService.coll.update_one({'_id': workspace_id}, {'$set': payload})
        return WorkspaceService.get_workspace(workspace_id)

    @staticmethod
    def delete_workspace(workspace_id: str, actor_user_id: str) -> bool:
        ws = WorkspaceService.get_workspace(workspace_id)
        if not ws:
            return False
        if ws.get('owner_user_id') != actor_user_id:
            raise PermissionError('Only owner can delete workspace')
        # delete workspace and its memberships
        try:
            WorkspaceService.coll.delete_one({'_id': ObjectId(workspace_id)})
        except Exception:
            WorkspaceService.coll.delete_one({'_id': workspace_id})
        WorkspaceService.members_coll.delete_many({'workspace_id': workspace_id})
        return True

    @staticmethod
    def add_member_by_email(workspace_id: str, email: str, role: str, actor_user_id: str) -> dict:
        # permission: only owner or admin can add
        ws = WorkspaceService.get_workspace(workspace_id)
        if not ws:
            raise ValueError('Workspace not found')
        # check actor role
        # owner id check
        if ws.get('owner_user_id') != actor_user_id:
            # check membership role admin
            membership = WorkspaceService.members_coll.find_one({'workspace_id': workspace_id, 'user_id': actor_user_id})
            if not membership or membership.get('role') not in ('admin', 'owner'):
                raise PermissionError('Not allowed to add members')

        user = UserService.find_by_email(email)
        if not user:
            raise ValueError('User with that email not found')

        user_id = user.get('_id')
        # check existing membership
        existing = WorkspaceService.members_coll.find_one({'workspace_id': workspace_id, 'user_id': user_id})
        if existing:
            raise ValueError('User already a member')

        membership = MembershipModel(workspace_id=workspace_id, user_id=user_id, role=role)
        mdoc = membership.to_dict()
        res = WorkspaceService.members_coll.insert_one(mdoc)
        mdoc['_id'] = str(res.inserted_id)
        return mdoc

    @staticmethod
    def list_members(workspace_id: str) -> List[dict]:
        rows = WorkspaceService.members_coll.find({'workspace_id': workspace_id})
        out = []
        for r in rows:
            rr = dict(r)
            if '_id' in rr:
                rr['_id'] = str(rr['_id'])
            out.append(rr)
        return out
