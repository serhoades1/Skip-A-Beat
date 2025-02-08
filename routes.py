from flask import Blueprint, request, jsonify

api_routes = Blueprint('api_routes', __name__)  # Create a Blueprint for routes

# Function to determine BPM range based on heart rate
def get_bpm_range(heart_rate):
    if heart_rate < 60:
        return (50, 80)  # Resting BPM range
    elif 60 <= heart_rate < 100:
        return (80, 120)  # Light workout BPM
    elif 100 <= heart_rate < 140:
        return (120, 150)  # Cardio BPM
    else:
        return (150, 180)  # Intense workout BPM

# Route to receive heart rate and return BPM range
@api_routes.route('/api/heart_rate', methods=['POST'])
def receive_heart_rate():
    data = request.get_json()  # Get the data from the request
    
    if not data or 'heart_rate' not in data:
        return jsonify({"error": "No heart rate data received"}), 400  # Error handling if data is missing

    heart_rate = data['heart_rate']  # Get the heart rate value
    bpm_range = get_bpm_range(heart_rate)  # Determine matching BPM range

    print(f"Received heart rate: {heart_rate} bpm → Matching BPM: {bpm_range}")  # Log the heart rate and BPM range

    return jsonify({
        "message": "Heart rate received",
        "heart_rate": heart_rate,
        "bpm_range": bpm_range
    }), 200  # Respond with the heart rate and calculated BPM range


