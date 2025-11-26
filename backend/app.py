# This is your main Flask application file.
# It will have a route to serve the React app and another to generate the workflow JSON.
import os
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from dotenv import load_dotenv
from vapi_manager import create_vapi_workflow
from workflow import build_demo_workflow
from app.routes.auth_routes import auth_bp
from app.routes.workspace_routes import ws_bp
from app.routes.docs_routes import docs_bp
# db client is initialized lazily in app.db when needed

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__, static_folder='../frontend/dist')
CORS(app) # Enable CORS for your React frontend
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(ws_bp, url_prefix='/api/workspaces')
app.register_blueprint(docs_bp, url_prefix='/api')

# Serve the React frontend on the root URL
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API endpoint to generate and retrieve the workflow JSON
@app.route('/api/get-workflow', methods=['GET'])
def get_workflow():
    # Call the builder function to generate the JSON
    workflow_data = build_demo_workflow()
    return jsonify(workflow_data)

# API endpoint to create the workflow on Vapi
@app.route('/api/create-workflow', methods=['POST'])
def create_workflow():
    # Get the Vapi API key from environment variables
    api_key = os.getenv("VAPI_API_KEY")

    if not api_key:
        return jsonify({"error": "VAPI_API_KEY environment variable not set"}), 400

    response = create_vapi_workflow(api_key)
    if "error" in response:
        return jsonify(response), 500
    
    return jsonify(response)

# API endpoint to make a therapy call
@app.route('/api/make-therapy-call', methods=['POST'])
def make_therapy_call_endpoint():
    data = request.get_json()
    phone_number = data.get('phone_number')
    name = data.get('name')
    workflow_id = data.get('workflow_id')  # Optional

    if not phone_number or not name:
        return jsonify({"error": "phone_number and name are required"}), 400

    from vapi_manager import make_call
    result = make_call(phone_number, name, workflow_id)
    
    if "error" in result:
        return jsonify(result), 500
    
    return jsonify(result)

if __name__ == '__main__':
    # For local development, you might want to run the Flask server on a different port
    app.run(debug=True, port=5000)
