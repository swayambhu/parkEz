import requests
import os
import sys

url = "http://localhost:8000/lot/upload-image/"  # this endpoint hasn't been made yet
# url = "https://devapi.gruevy.com/lot/upload-image/"  # this endpoint hasn't been made yet

def upload_jpg(filename):
    try:
        files = {
            "image": open(filename, "rb")
        }
        full_url = f"{url}?passcode=tokensecurity"
        response = requests.post(full_url, files=files)

        print(f"Uploading {filename}...")
        print("Response status code:", response.status_code)
        print("Response content:", response.json())

    except IndexError:
        print("Please provide the image filename as a command line argument.")

def main():
    if len(sys.argv) != 2:
        print("Usage: python upload_jpgs.py folder_name")
        return
    
    folder_name = sys.argv[1]
    
    # Check if the provided folder name is indeed a directory
    if not os.path.isdir(folder_name):
        print(f"'{folder_name}' is not a directory.")
        return
    
    # List all files in the directory
    all_files = os.listdir(folder_name)
    
    # Filter out only .jpg files
    jpg_files = [f for f in all_files if f.lower().endswith('.jpg')]
    
    # Upload each .jpg file
    for jpg_file in jpg_files:
        full_path = os.path.join(folder_name, jpg_file)
        upload_jpg(full_path)

if __name__ == "__main__":
    main()
