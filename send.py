import socket
import requests

def get_local_ip():
    try:
        # Create a socket and connect to an external server
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception as e:
        print("Error getting local IP:", e)
        return None

def send_ip_to_api(local_ip):
    url = "https://dynamic-ip.vercel.app/register"
    payload = {"serviceName": "api", "localAddress": local_ip}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print("Response from server:", response.json())
    except Exception as e:
        print("Error sending request:", e)

if __name__ == "__main__":
    local_ip = get_local_ip()
    if local_ip:
        print("Local IPv4 Address:", local_ip)
        send_ip_to_api(local_ip)
