from flask import Blueprint, jsonify, Response
import json
import os

docs_bp = Blueprint("docs_bp", __name__, url_prefix="/api")


@docs_bp.route("/openapi.json", methods=["GET"])
def openapi_json():
    base = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    spec_path = os.path.join(base, "openapi.json")
    if not os.path.exists(spec_path):
        return jsonify({"error": "OpenAPI spec not found"}), 404
    with open(spec_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return jsonify(data)


@docs_bp.route("/docs", methods=["GET"])
def swagger_ui():
    # Serve a minimal Swagger UI that points to /api/openapi.json
    html = """
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: '/api/openapi.json',
          dom_id: '#swagger-ui',
        })
      }
    </script>
  </body>
</html>
"""
    return Response(html, mimetype="text/html")
