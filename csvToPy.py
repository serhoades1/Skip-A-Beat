import csv
import json
import os
import kaggle

# Function to download the dataset and convert it to JSON                                                                             
def download_and_convert():
    dataset = "amitanshjoshi/spotify-1million-tracks"
    download_path = "data"  # Change this if you want a different location                                                            

    print(f"Downloading dataset: {dataset}")

    kaggle.api.dataset_download_files(dataset, path=download_path, unzip=True)

    # Verify the downloaded files                                                                                                     
    if not os.path.exists(download_path):
        print("Download failed or incorrect path!")
        return

    print(f"Dataset downloaded to: {download_path}")

    # Find the CSV file (assuming it's the only one in the directory)                                                                 
    csv_files = [f for f in os.listdir(download_path) if f.endswith(".csv")]
    if not csv_files:
        print("No CSV file found in the dataset directory!")
        return

    csv_file = os.path.join(download_path, csv_files[0])
    json_file = os.path.join(download_path, "spotify_data.json")  # Define the JSON file path

    print(f"CSV file found: {csv_file}")
    
    # Convert CSV to JSON
    csv_to_json(csv_file, json_file)

    print(f"CSV successfully converted to JSON: {json_file}")

# Function to convert CSV to JSON                                                                                                     
def csv_to_json(csv_file, json_file):
    try:
        # Open the CSV file                                                                                                           
        with open(csv_file, mode='r', encoding='utf-8') as csvf:
            # Create a CSV reader object                                                                                              
            csv_reader = csv.DictReader(csvf)

            # Open the JSON file for writing                                                                                          
            with open(json_file, mode='w', encoding='utf-8') as jsonf:
                # Convert the CSV data to JSON format                                                                                 
                json.dump(list(csv_reader), jsonf, indent=4)

    except FileNotFoundError:
        print(f"Error: {csv_file} not found.")
    except Exception as e:
        print(f"Error occurred: {e}")

# Run the process                                                                                                                     
download_and_convert()
