import socket
import requests
import os
import subprocess

# Get local IPv4 address
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception as e:
        print(f"Error getting local IP: {e}")
        return None

# Send local IP to the API
def register_service():
    local_ip = get_local_ip()
    if not local_ip:
        return
    
    url = "https://dynamic-ip.vercel.app/register"
    payload = {
        "serviceName": "api",
        "localAddress": local_ip
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Local IP: {local_ip}")
        print(f"Response: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending request: {e}")

# Start projects based on folder names in separate terminals on Windows
def start_projects():
    current_dir = os.getcwd()
    for folder in os.listdir(current_dir):
        folder_path = os.path.join(current_dir, folder)
        if os.path.isdir(folder_path):
            if folder.startswith("React"):
                print(f"Starting React project in {folder}...")
                subprocess.Popen(["cmd.exe", "/c", "start", "cmd.exe", "/k", "npm start"], cwd=folder_path)
            elif folder.startswith("Node"):
                print(f"Starting Node project in {folder}...")
                subprocess.Popen(["cmd.exe", "/c", "start", "cmd.exe", "/k", "node app.js"], cwd=folder_path)
            elif folder.startswith("Flask"):
                print(f"Starting Flask project in {folder}...")
                subprocess.Popen(["cmd.exe", "/c", "start", "cmd.exe", "/k", "python app.py"], cwd=folder_path)

if __name__ == "__main__":
   ##register_service()
    start_projects()