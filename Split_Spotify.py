import pandas as pd

# Load the original CSV file
original_file = 'spotify_data.csv'
df = pd.read_csv(original_file)

# Select only the even-numbered songs (every second row)
even_songs_df = df.iloc[::2]  # Select rows with even indices (0, 2, 4, ...)

# Save the new CSV file with only even-numbered songs
even_songs_df.to_csv('spotify_data_even.csv', index=False)

print("CSV file with even-numbered songs saved successfully.")
