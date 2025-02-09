import pandas as pd

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
    print(f"Filtering songs with BPM between {min_bpm} and {max_bpm}")
    filtered_songs = df[(df['tempo'] >= min_bpm) & (df['tempo'] <= max_bpm)]
    
    if filtered_songs.empty:
        print("No songs found in this BPM range.")
        return []  # Return empty list if no songs match
    
    print(f"Found {len(filtered_songs)} songs.")
    return filtered_songs[['artist_name', 'track_name', 'tempo']].to_dict(orient='records')

# Function to generate all BPM ranges
def generate_bpm_ranges(min_bpm, max_bpm, step=10):
    # Generates a list of BPM ranges from min_bpm to max_bpm with a given step size
    ranges = []
    for bpm in range(min_bpm, max_bpm, step):
        ranges.append((bpm, bpm + step - 1))  # Create ranges of size 'step'
    return ranges

# Example: generate BPM ranges from 50 to 200, with a step size of 10
bpm_ranges = generate_bpm_ranges(50, 200, step=10)

# Check if dataset is loaded, then process each BPM range
if df is not None:
    all_songs = []
    
    for bpm_range in bpm_ranges:
        song_list = get_songs_by_bpm(bpm_range)
        if song_list:
            all_songs.append({
                "bpm_range": bpm_range,
                "songs": song_list
            })
    
    if all_songs:
        print("Filtered Songs by BPM Range:")
        for bpm_range_info in all_songs:
            print(f"BPM Range: {bpm_range_info['bpm_range']}")
            for song in bpm_range_info['songs']:
                print(song)
    else:
        print("No songs found for any BPM range.")

