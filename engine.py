# engine.py - logic handler for backend diagnostics
import datetime
import base64

def extract_patient_data(form, files):
    symptoms = form.getlist("symptoms")
    history = form.getlist("history")

    data = {
        "name": form.get("name", "N/A"),
        "dob": form.get("dob", "N/A"),
        "sex": form.get("sex", "N/A"),
        "notes": form.get("notes", ""),
        "symptoms": symptoms,
        "history": history,
    }

    passport = files.get("passport")
    if passport:
        encoded = base64.b64encode(passport.read()).decode("utf-8")
        data["passport_b64"] = encoded
    else:
        data["passport_b64"] = ""

    scanned_report = files.get("report_scan")
    if scanned_report:
        encoded = base64.b64encode(scanned_report.read()).decode("utf-8")
        data["report_scan_b64"] = encoded
    else:
        data["report_scan_b64"] = ""

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
