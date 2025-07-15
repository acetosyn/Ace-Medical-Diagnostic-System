# engine.py - logic handler for backend diagnostics
import datetime
import base64

def extract_patient_data(form, files):
    data = {
        "name": form.get("name", "N/A"),
        "dob": form.get("dob", "N/A"),
        "sex": form.get("sex", "N/A"),
        "notes": form.get("notes", ""),
        "symptoms": form.getlist("symptoms"),
        "history": form.getlist("history"),
    }

    passport = files.get("passport")
    if passport:
        encoded = base64.b64encode(passport.read()).decode("utf-8")
        data["passport_b64"] = encoded
    else:
        data["passport_b64"] = ""

    return data


def extract_quick_upload_data(form, files):
    data = {
        "name": form.get("quick_name", "N/A"),
        "timestamp": datetime.datetime.now().isoformat(),
    }

    lab_scan = files.get("lab_scan")
    if lab_scan:
        encoded = base64.b64encode(lab_scan.read()).decode("utf-8")
        data["lab_b64"] = encoded
    else:
        data["lab_b64"] = ""

    return data


def generate_report_html(data):
    name = data.get("name", "N/A")
    dob = data.get("dob", "N/A")
    sex = data.get("sex", "N/A")
    symptoms = ", ".join(data.get("symptoms", []))
    history = ", ".join(data.get("history", []))
    notes = data.get("notes", "")
    passport_b64 = data.get("passport_b64", "")

    passport_img_html = ""
    if passport_b64:
        passport_img_html = f"""
        <div class='mt-4'>
            <p class='text-sm text-gray-500 mb-1'>Passport Photograph:</p>
            <img src="data:image/jpeg;base64,{passport_b64}" alt="Passport" class="w-32 h-32 object-cover rounded shadow" />
        </div>
        """

    return f"""
    <div class='report-card p-6 rounded-lg bg-white shadow-md'>
        <h3 class='text-lg font-semibold text-gray-800 mb-2'>Patient Report</h3>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Date of Birth:</strong> {dob}</p>
        <p><strong>Sex:</strong> {sex}</p>
        <p><strong>Symptoms:</strong> {symptoms}</p>
        <p><strong>Medical History:</strong> {history}</p>
        <p><strong>Additional Notes:</strong> {notes}</p>
        {passport_img_html}

        <div class='mt-6 flex flex-wrap gap-3'>
            <button onclick="editSection(1)" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-edit-2-line mr-1'></i>Edit Details
            </button>
            <button onclick="downloadAsPDF(1)" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-file-pdf-line mr-1'></i>Download PDF
            </button>
            <button onclick="downloadAsPNG(1)" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-image-line mr-1'></i>Download PNG
            </button>
        </div>

        <div class='text-center mt-6'>
            <button class='px-6 py-2 bg-secondary text-white rounded-button hover:bg-secondary/90' onclick="diagnoseBackend(1)">
                Diagnose
            </button>
        </div>
    </div>
    """


def generate_quick_report_html(data):
    name = data.get("name", "N/A")
    lab_b64 = data.get("lab_b64", "")

    lab_image_html = ""
    if lab_b64:
        lab_image_html = f"""
        <div class='mt-4'>
            <p class='text-sm text-gray-500 mb-1'>Lab Scan:</p>
            <img src="data:image/jpeg;base64,{lab_b64}" alt="Lab Scan" class="w-40 h-auto rounded shadow" />
        </div>
        """

    return f"""
    <div class='report-card p-6 rounded-lg bg-white shadow-md'>
        <h3 class='text-lg font-semibold text-gray-800 mb-2'>Quick Upload Report</h3>
        <p><strong>Patient Name:</strong> {name}</p>
        {lab_image_html}

        <div class='mt-6 flex flex-wrap gap-3'>
            <button onclick="editSection(2)" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-edit-2-line mr-1'></i>Edit Details
            </button>
            <button onclick="downloadAsPDF(2)" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-file-pdf-line mr-1'></i>Download PDF
            </button>
            <button onclick="downloadAsPNG(2)" class='px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200'>
                <i class='ri-image-line mr-1'></i>Download PNG
            </button>
        </div>

        <div class='text-center mt-6'>
            <button class='px-6 py-2 bg-secondary text-white rounded-button hover:bg-secondary/90' onclick="diagnoseBackend(2)">
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
