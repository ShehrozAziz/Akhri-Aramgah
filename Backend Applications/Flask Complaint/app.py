from flask import Flask, request, jsonify
from flask_cors import CORS  
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

app = Flask(__name__)
CORS(app) 


tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
model = DistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)


model.load_state_dict(torch.load("Model.pt", map_location=torch.device("cpu")))
model.eval() 


@app.route('/checkcomplaint', methods=['POST'])
def check_complaint():
    try:
        data = request.get_json()
        if "text" not in data:
            return jsonify({"error": "Missing 'text' field"}), 400
        
        text = data["text"]
        inputs = tokenizer(text, truncation=True, padding=True, max_length=512, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
        
        prediction = torch.argmax(outputs.logits, dim=1).item()
        label = "Critical" if prediction == 1 else "Non-Critical"

        return jsonify({"prediction": label})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5010, debug=True)
