from flask import Blueprint, request, jsonify, g
from app.services.workspace_service import WorkspaceService
from app.routes.auth_routes import auth_required

ws_bp = Blueprint('workspaces', __name__)


@ws_bp.route('', methods=['POST'])
@auth_required
def create_workspace():
    data = request.get_json(silent=True) or request.form.to_dict()
    name = data.get('name')
    editable = data.get('is_editable_by_collaborators', True)
    if isinstance(editable, str):
        editable = editable.lower() in ('1', 'true', 'yes')

    if not name:
        return jsonify({'error': 'name required'}), 400

    actor = g.current_user
    res = WorkspaceService.create_workspace(name=name, owner_user_id=str(actor.get('_id')), is_editable_by_collaborators=editable)
    return jsonify(res), 201


@ws_bp.route('', methods=['GET'])
@auth_required
def list_workspaces():
    actor = g.current_user
    rows = WorkspaceService.list_for_user(str(actor.get('_id')))
    return jsonify({'workspaces': rows})


@ws_bp.route('/<workspace_id>', methods=['GET'])
@auth_required
def get_workspace(workspace_id):
    ws = WorkspaceService.get_workspace(workspace_id)
    if not ws:
        return jsonify({'error': 'not found'}), 404
    members = WorkspaceService.list_members(workspace_id)
    return jsonify({'workspace': ws, 'members': members})


@ws_bp.route('/<workspace_id>', methods=['PUT', 'PATCH'])
@auth_required
def update_workspace(workspace_id):
    data = request.get_json(silent=True) or request.form.to_dict()
    actor = g.current_user
    try:
        ws = WorkspaceService.update_workspace(workspace_id, data, str(actor.get('_id')))
        return jsonify({'workspace': ws})
    except PermissionError:
        return jsonify({'error': 'forbidden'}), 403


@ws_bp.route('/<workspace_id>', methods=['DELETE'])
@auth_required
def delete_workspace(workspace_id):
    actor = g.current_user
    try:
        ok = WorkspaceService.delete_workspace(workspace_id, str(actor.get('_id')))
        if not ok:
            return jsonify({'error': 'not found'}), 404
        return jsonify({'message': 'deleted'})
    except PermissionError:
        return jsonify({'error': 'forbidden'}), 403


@ws_bp.route('/<workspace_id>/members', methods=['POST'])
@auth_required
def add_member(workspace_id):
    # add by email
    data = request.get_json(silent=True) or request.form.to_dict()
    email = data.get('email')
    role = data.get('role', 'viewer')
    if not email:
        return jsonify({'error': 'email required'}), 400
    actor = g.current_user
    try:
        m = WorkspaceService.add_member_by_email(workspace_id, email, role, str(actor.get('_id')))
        return jsonify({'membership': m}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except PermissionError:
        return jsonify({'error': 'forbidden'}), 403


@ws_bp.route('/<workspace_id>/members', methods=['GET'])
@auth_required
def list_members(workspace_id):
    rows = WorkspaceService.list_members(workspace_id)
    return jsonify({'members': rows})
