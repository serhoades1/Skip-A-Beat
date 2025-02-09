from flask import Blueprint, request, jsonify
import pandas as pd

api_routes = Blueprint('api_routes', __name__)  # Create a Blueprint for routes

# Load the dataset globally for efficiency
try:
    df = pd.read_csv('./spotify_data.csv', encoding='utf-8')
    print("Dataset loaded successfully!")
except Exception as e:
    print(f"Error loading dataset: {e}")
    df = None  # Set df to None if loading fails

# Function to filter songs by BPM range
def get_songs_by_bpm(bpm_range):
    if df is None:
        return {"error": "Dataset not loaded"}

    min_bpm, max_bpm = bpm_range
    filtered_songs = df[(df['tempo'] >= min_bpm) & (df['tempo'] <= max_bpm)]
    
    if filtered_songs.empty:
        return {"message": "No songs found in the given BPM range."}
    
    return filtered_songs[['artist_name', 'track_name', 'tempo']].to_dict(orient='records')

# Route to receive BPM range and return song recommendations
@api_routes.route('/api/song_recommendations/bpm', methods=['POST'])
def song_recommendations():
    data = request.get_json()  # Get the data from the request

    if not data or 'bpm_range' not in data:
        return jsonify({"error": "No BPM range provided"}), 400  # Error handling if data is missing
    
    bpm_range = data['bpm_range']  # Get the BPM range value
    song_list = get_songs_by_bpm(bpm_range)  # Get the filtered songs

    return jsonify({
        "message": "Song recommendations",
        "bpm_range": bpm_range,
        "songs": song_list
    }), 200  # Respond with song recommendations in JSON format
