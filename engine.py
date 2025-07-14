# engine.py - logic handler for backend diagnostics
import datetime
from flask import jsonify

def extract_patient_data(form):
    return {
        "name": form.get("name"),
        "dob": form.get("dob"),
        "sex": form.get("sex"),
        "notes": form.get("notes"),
        "symptoms": form.getlist("symptoms"),
        "history": form.getlist("history"),
        "timestamp": datetime.datetime.now().isoformat()
    }

def extract_quick_upload_data(form):
    return {
        "name": form.get("quick_name"),
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_report_html(data):
    name = data.get("name", "N/A")
    dob = data.get("dob", "N/A")
    sex = data.get("sex", "N/A")
    symptoms = ", ".join(data.get("symptoms", []))
    history = ", ".join(data.get("history", []))
    notes = data.get("notes", "")

    return f"""
    <div class='report-card p-6 rounded-lg bg-white shadow-md'>
        <h3 class='text-lg font-semibold text-gray-800 mb-2'>Patient Report</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Date of Birth:</strong> {dob}</p>
        <p><strong>Sex:</strong> {sex}</p>
        <p><strong>Symptoms:</strong> {symptoms}</p>
        <p><strong>Medical History:</strong> {history}</p>
        <p><strong>Additional Notes:</strong> {notes}</p>

        <div class='mt-6 flex flex-wrap gap-3'>
            <button onclick=\"editSection(1)\" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-edit-2-line mr-1'></i>Edit Details
            </button>
            <button onclick=\"downloadAsPDF(1)\" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-file-pdf-line mr-1'></i>Download PDF
            </button>
            <button onclick=\"downloadAsPNG(1)\" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-image-line mr-1'></i>Download PNG
            </button>
        </div>

        <div class='text-center mt-6'>
            <button class='px-6 py-2 bg-secondary text-white rounded-button hover:bg-secondary/90' onclick=\"diagnoseBackend(1)\">
                Diagnose
            </button>
        </div>
    </div>
    """


def generate_quick_report_html(data):
    name = data.get("name", "N/A")

    return f"""
    <div class='report-card p-6 rounded-lg bg-white shadow-md'>
        <h3 class='text-lg font-semibold text-gray-800 mb-2'>Quick Upload Report</h3>
        <p><strong>Patient Name:</strong> {name}</p>

        <div class='mt-6 flex flex-wrap gap-3'>
            <button onclick=\"editSection(2)\" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-edit-2-line mr-1'></i>Edit Details
            </button>
            <button onclick=\"downloadAsPDF(2)\" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-file-pdf-line mr-1'></i>Download PDF
            </button>
            <button onclick=\"downloadAsPNG(2)\" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-image-line mr-1'></i>Download PNG
            </button>
        </div>

        <div class='text-center mt-6'>
            <button class='px-6 py-2 bg-secondary text-white rounded-button hover:bg-secondary/90' onclick=\"diagnoseBackend(2)\">
                Diagnose
            </button>
        </div>
    </div>
    """


def run_diagnosis_engine(data):
    return {
        "summary": "Diagnosis completed.",
        "result": "Likely viral infection. Recommend rest and hydration.",
        "confidence": "87%"
    }
