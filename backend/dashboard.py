import os
import requests
from flask import Blueprint, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Blueprint for VAPI routes
vapi_bpt = Blueprint("vapi", __name__)

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_BASE_URL = "https://api.vapi.ai"

# Example route for /call
@vapi_bpt.route("/vapi/call", methods=["GET"])
def get_vapi_call():
    try:
        headers = {
            "Authorization": f"Bearer {VAPI_API_KEY}"
        }
        url = f"{VAPI_BASE_URL}/call"   # append endpoint
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return jsonify({
                "error": "Failed to fetch from VAPI",
                "status_code": response.status_code,
                "details": response.text
            }), response.status_code

        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@vapi_bpt.route("/transcript", methods=["GET"])
def get_transcripts():
    try:
        headers = {
            "Authorization": f"Bearer {VAPI_API_KEY}"
        }
        url = f"{VAPI_BASE_URL}/call"
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return jsonify({
                "error": "Failed to fetch from VAPI",
                "status_code": response.status_code,
                "details": response.text
            }), response.status_code

        data = response.json()

        # Assuming the API returns a list of objects
        transcripts = []
        for obj in data:
            if "id" in obj and "transcript" in obj:
                transcripts.append({
                    "id": obj["id"],
                    "transcript": obj["transcript"]
                })

        return jsonify(transcripts)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@vapi_bpt.route("/phoneNumber", methods=["GET"])
def get_phone_numbers():
    try:
        headers = {
            "Authorization": f"Bearer {VAPI_API_KEY}"
        }
        url = f"{VAPI_BASE_URL}/call"
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return jsonify({
                "error": "Failed to fetch from VAPI",
                "status_code": response.status_code,
                "details": response.text
            }), response.status_code

        data = response.json()

        phone_map = {}
        for obj in data:
            phone_info = obj.get("phoneNumber", {})
            twilio_num = phone_info.get("twilioPhoneNumber")

            if twilio_num:
                if twilio_num not in phone_map:
                    phone_map[twilio_num] = {
                        "twilioPhoneNumber": twilio_num,
                        "count": 1,
                        "ids": [obj.get("id")]
                    }
                else:
                    phone_map[twilio_num]["count"] += 1
                    phone_map[twilio_num]["ids"].append(obj.get("id"))

        return jsonify(list(phone_map.values()))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

from datetime import datetime, timedelta

@vapi_bpt.route("/timeDate", methods=["GET"])
def get_time_date():
    try:
        headers = {
            "Authorization": f"Bearer {VAPI_API_KEY}"
        }
        url = f"{VAPI_BASE_URL}/call"
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return jsonify({
                "error": "Failed to fetch from VAPI",
                "status_code": response.status_code,
                "details": response.text
            }), response.status_code

        data = response.json()

        total_seconds = 0
        date_counts = {}

        for obj in data:
            started_at = obj.get("startedAt")
            ended_at = obj.get("endedAt")

            if started_at and ended_at:
                try:
                    start_dt = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
                    end_dt = datetime.fromisoformat(ended_at.replace("Z", "+00:00"))
                    total_seconds += (end_dt - start_dt).total_seconds()
                except Exception:
                    continue

            # Count calls per date
            if started_at:
                date_str = started_at.split("T")[0]  # YYYY-MM-DD
                date_counts[date_str] = date_counts.get(date_str, 0) + 1

        # Format total time as HH:MM:SS
        total_time_str = str(timedelta(seconds=int(total_seconds)))

        dates_array = [{"date": d, "totalCalls": c} for d, c in date_counts.items()]

        return jsonify({
            "totalTime": total_time_str,
            "dates": dates_array
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@vapi_bpt.route("/sessionLogs", methods=["GET"])
def get_session_logs():
    try:
        headers = {
            "Authorization": f"Bearer {VAPI_API_KEY}"
        }
        url = f"{VAPI_BASE_URL}/call"
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return jsonify({
                "error": "Failed to fetch from VAPI",
                "status_code": response.status_code,
                "details": response.text
            }), response.status_code

        data = response.json()

        session_logs = []
        for obj in data:
            # Extract only role and message from messages array
            messages = []
            for m in obj.get("messages", []):
                if "role" in m and "message" in m:
                    messages.append({
                        "role": m["role"],
                        "message": m["message"]
                    })

            session_logs.append({
                "id": obj.get("id"),
                "messages": messages,
                "summary": obj.get("summary", {}),
                "customer": obj.get("customer", {})
            })

        return jsonify(session_logs)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



