from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torchvision.transforms as transforms
from PIL import Image
import os
import torch.nn.functional as F
import pickle
import io
import sqlite3
import base64
import numpy as np
import cv2
from torch import nn
from facenet_pytorch import InceptionResnetV1
from ultralytics import YOLO
from tqdm import tqdm
import uuid

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# --- Custom Unpickler for CPU ---
class CPU_Unpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == 'torch.storage' and name == '_load_from_bytes':
            return lambda b: torch.load(io.BytesIO(b), map_location='cpu')
        else:
            return super().find_class(module, name)

# --- Define SiameseArcFace Class ---
class SiameseArcFace(nn.Module):
    def __init__(self):
        super(SiameseArcFace, self).__init__()
        self.arcface = InceptionResnetV1(pretrained='vggface2').eval()
        self.dropout = nn.Dropout(p=0.3)
        self.fc = nn.Linear(512, 1)

    def forward(self, img1, img2):
        emb1 = self.arcface(img1)
        emb2 = self.arcface(img2)
        distance = torch.abs(emb1 - emb2)
        distance = self.dropout(distance)
        output = self.fc(distance)
        return output

# Load Model from Pickle
with open("siamese_model.pkl", "rb") as f:
    model = CPU_Unpickler(f).load()

model.to("cpu")
model.eval()

# Load YOLO face detection model
yolo_model = YOLO("yolov8n-face.pt")

# --- Image Preprocessing ---
transform = transforms.Compose([
    transforms.Resize((112, 112)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# Database setup with modified schema
def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("PRAGMA table_info(bodies)")
    columns = cursor.fetchall()
    
    if not columns:
        # Create table with new schema
        cursor.execute('''CREATE TABLE bodies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            morgue_name TEXT,
            morgue_id TEXT,
            body_id TEXT,
            path TEXT,
            embedding BLOB,
            image_base64 TEXT
        )''')
 
    
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def hello_world():
    return jsonify({"message": "Hello, World!"})

@app.route('/upload', methods=['POST'])
def upload_image():
    data = request.json
    morgue_name = data.get("morgueName")
    morgue_id = data.get("morgueID")  # New field to store morgueID
    image_data = data.get("image")
    
    if not morgue_name or not image_data or not morgue_id:
        return jsonify({
            "success": False,
            "message": "Missing morgue name, morgue ID, or image data"
        }), 400  # Failure response
    
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_cv = np.array(image)
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_RGB2BGR)

    # Detect face using YOLO
    results = yolo_model(img_cv)
    if not results or len(results[0].boxes) == 0:
        return jsonify({
            "success": False,
            "message": "No Face Detected"
        }), 200  # Failure response

    box = results[0].boxes[0].xyxy[0].cpu().numpy()
    x1, y1, x2, y2 = map(int, box)
    face_crop = img_cv[y1:y2, x1:x2]
    face_crop = cv2.resize(face_crop, (112, 112))
    face_crop = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
    face_pil = Image.fromarray(face_crop)
    input_tensor = transform(face_pil).unsqueeze(0)

    # Compute embedding
    with torch.no_grad():
        input_embedding = model.arcface(input_tensor).numpy().tobytes()

    # Generate Body ID
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    
    # Store image as base64
    image_base64 = image_data  # Already in base64 format from the request
    
    cursor.execute("INSERT INTO bodies (morgue_name, morgue_id, path, embedding, image_base64) VALUES (?, ?, ?, ?, ?)",
                   (morgue_name, morgue_id, "", input_embedding, image_base64))
    
    body_id = cursor.lastrowid
    image_path = f"uploads/{morgue_name}_{body_id}.jpg"
    cursor.execute("UPDATE bodies SET path = ? WHERE id = ?", (image_path, body_id))
    conn.commit()
    conn.close()

    os.makedirs("uploads", exist_ok=True)
    image.save(image_path)

    return jsonify({
        "success": True,
        "message": "Image uploaded successfully",
        "body_id": body_id
    }), 200  # Success response

@app.route('/images', methods=['GET'])
def get_images_by_morgue_id():
    morgue_id = request.args.get('morgueID')
    
    if not morgue_id:
        return jsonify({
            "success": False,
            "message": "Missing morgue ID parameter"
        }), 400
    
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, image_base64 FROM bodies WHERE morgue_id = ?", (morgue_id,))
    results = cursor.fetchall()
    conn.close()
    
    if not results:
        return jsonify({
            "success": False,
            "message": "No images found"
        }), 200
    
    images = []
    for body_id, image_base64 in results:
        images.append({
            "body_id": body_id,
            "image_base64": image_base64
        })
    
    return jsonify({
        "success": True,
        "images": images
    }), 200

@app.route('/search', methods=['POST'])
def search_similar_faces():
    data = request.json
    image_data = data.get("image")

    if not image_data:
        return jsonify({"success": False, "message": "Missing image data"}), 400

    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_cv = np.array(image)
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_RGB2BGR)

    # Detect face using YOLO
    results = yolo_model(img_cv)
    if not results or len(results[0].boxes) == 0:
        return jsonify({
            "success": False,
            "message": "No Face Detected"
        }), 200

    box = results[0].boxes[0].xyxy[0].cpu().numpy()
    x1, y1, x2, y2 = map(int, box)
    face_crop = img_cv[y1:y2, x1:x2]
    face_crop = cv2.resize(face_crop, (112, 112))
    face_crop = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
    face_pil = Image.fromarray(face_crop)
    input_tensor = transform(face_pil).unsqueeze(0)

    # Compute embedding for input image
    with torch.no_grad():
        input_embedding = model.arcface(input_tensor)

    # Search for similar faces in database
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    # Update the query to also select morgue_name
    cursor.execute("SELECT id, path, embedding, morgue_name FROM bodies")
    stored_data = cursor.fetchall()
    conn.close()

    matching_images = []
    for row in tqdm(stored_data, desc="Comparing Faces"):
        body_id, image_path, stored_embedding_blob, morgue_name = row
        stored_embedding = torch.tensor(np.frombuffer(stored_embedding_blob, dtype=np.float32)).unsqueeze(0)

        # Compute similarity
        with torch.no_grad():
            similarity = F.cosine_similarity(input_embedding, stored_embedding).item()
        print(similarity)
        if similarity >= 0.65:  # 50% threshold
            with open(image_path, "rb") as img_file:
                base64_image = base64.b64encode(img_file.read()).decode('utf-8')

            matching_images.append({
                "file_name": os.path.basename(image_path),
                "image_base64": base64_image,
                "similarity": similarity,
                "body_id": body_id,
                "morgue_name": morgue_name  # Added morgue_name to the response
            })

    return jsonify({"matches": matching_images}), 200

@app.route('/delete', methods=['POST'])
def delete_image():
    data = request.json
    body_id = data.get("bodyID")  # Changed from deletion_code to bodyID
    
    if not body_id:
        return jsonify({
            "success": False,
            "message": "Missing body ID"
        }), 400
    
    # Find image in database
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT path FROM bodies WHERE id = ?", (body_id,))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Invalid body ID or image already deleted"
        }), 200
    
    image_path = result[0]
    
    # Delete from database
    cursor.execute("DELETE FROM bodies WHERE id = ?", (body_id,))
    conn.commit()
    conn.close()
    
    # Delete file from uploads folder if it exists
    if os.path.exists(image_path):
        try:
            os.remove(image_path)
        except OSError as e:
            return jsonify({
                "success": False,
                "message": f"Database record deleted but error deleting file: {str(e)}"
            }), 500
    
    return jsonify({
        "success": True,
        "message": "Image and record successfully deleted"
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True, port=5011)
