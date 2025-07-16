# model.py - handles AI-powered diagnosis from X-ray images

import os
import base64
import requests
from dotenv import load_dotenv
from io import BytesIO

load_dotenv()

HF_API_KEY = os.getenv("ACE_DIAGNOSTIC_API")
HF_API_URL = "https://api-inference.huggingface.co/models/adibvafa/BLIP-MIMIC-CXR"
HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}


def run_diagnosis_engine(data):
    """
    Uses the Hugging Face BLIP-MIMIC-CXR model to generate a radiology report
    from a base64-encoded image and prompt.
    """
    b64_img = data.get("report_scan_b64")
    prompt = data.get("notes", "examination: chest x-ray\nindication: rule out pneumonia.")

    if not b64_img:
        return {"error": "No scan image provided."}

    try:
        image_bytes = base64.b64decode(b64_img)
        files = {
            "image": BytesIO(image_bytes)
        }
        payload = {
            "inputs": prompt
        }

        response = requests.post(HF_API_URL, headers=HEADERS, files=files, data=payload)

        if response.status_code == 200:
            result = response.json()
            return {
                "summary": "Radiology report generated successfully.",
                "result": result.get("generated_text", result),
                "confidence": "⚠️ Confidence scores not included. Clinical review required."
            }
        else:
            return {"error": f"HuggingFace API error: {response.text}"}

    except Exception as e:
        return {"error": str(e)}
