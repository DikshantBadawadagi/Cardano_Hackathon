from flask import Blueprint, request, jsonify
from app.services.workflow_service import WorkflowService
from vapi_manager import create_vapi_workflow_from_object
import os
from bson import ObjectId

vapi_bp = Blueprint('vapi_upload', __name__)


@vapi_bp.route('/upload-workflow', methods=['POST'])
def upload_workflow_from_db():
    """
    Expects JSON body: { "workspace_id": "...", "workflow_id": "..." }
    Fetches the workflow JSON from MongoDB and forwards it to Vapi.
    """
    try:
        data = request.get_json(silent=True)
        if data is None:
            data = request.form.to_dict()

        workspace_id = data.get('workspace_id')
        workflow_id = data.get('workflow_id')

        if not workspace_id or not workflow_id:
            return jsonify({"error": "workspace_id and workflow_id are required"}), 400

        # basic ObjectId validation
        try:
            ObjectId(workspace_id)
            ObjectId(workflow_id)
        except Exception:
            return jsonify({"error": "Invalid workspace_id or workflow_id format"}), 400

        # Retrieve workflow from DB
        workflow = WorkflowService.get_workflow(workspace_id, workflow_id)
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404

        # Prefer the stored `body_json` which contains the actual workflow structure
        workflow_payload = workflow.get('body_json', workflow)

        # Get API key
        api_key = os.getenv('VAPI_API_KEY')
        if not api_key:
            return jsonify({"error": "VAPI_API_KEY not found in environment variables"}), 400

        # Send to Vapi
        result = create_vapi_workflow_from_object(api_key, workflow_payload)

        if "error" in result:
            return jsonify({"status": "error", "message": "Failed to upload workflow to Vapi", "error": result.get('error')}), 500

        return jsonify({"status": "success", "message": "Workflow uploaded to Vapi successfully", "vapi_response": result}), 200

    except Exception as e:
        print(f"Error in upload_workflow_from_db: {e}")
        return jsonify({"error": "Internal server error"}), 500
