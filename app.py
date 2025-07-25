from flask import Flask, render_template, request, jsonify, Response, stream_with_context
from report_llm import stream_response as report_stream_response
from chat_llm import stream_response as chat_stream_response

import engine
import model #this uses run_diagnosis_engine(data)
app = Flask(__name__)

# Serve the main index layout
@app.route("/")
def home():
    return render_template("index.html")

# Serve inner pages as partials for AJAX/dynamic injection
@app.route("/home.html")

def home_partial():
    return render_template("home.html")

@app.route("/chat.html")
def chat_partial():
    return render_template("chat.html")

@app.route("/clinic.html")
def clinic_partial():
    return render_template("clinic.html")

@app.route("/how.html")
def how_partial():
    return render_template("how.html")

@app.route("/about.html")
def about_partial():
    return render_template("about.html")

# Optional: fallback routes for direct navigation (in case JS fails)
@app.route("/chat")
def chat_redirect():
    return render_template("index.html")

@app.route("/about")
def about_redirect():
    return render_template("index.html")

@app.route("/clinic")
def clinic_redirect():
    return render_template("index.html")

@app.route("/how")
def how_redirect():
    return render_template("index.html")

@app.route("/login")
def login():
    return "<h1>Login page coming soon...</h1>", 200

@app.route("/register")
def register():
    return "<h1>Register page coming soon...</h1>", 200

@app.route("/generate_report", methods=["POST"])
def generate_report():
    form_data = engine.extract_patient_data(request.form, request.files)
    return jsonify(form_data)  # ❗️Return just the data dictionary, not wrapped in { "data": ..., "section": ... }

@app.route("/generate_quick_report", methods=["POST"])
def generate_quick_report():
    form_data = engine.extract_quick_upload_data(request.form, request.files)
    return jsonify(form_data)


@app.route("/run_diagnosis", methods=["POST"])
def run_diagnosis():
    try:
        data = request.get_json()
        if not data:
            return {"error": "No JSON received"}, 400

        result = model.run_diagnosis_engine(data)
        return result
    except Exception as e:
        return {"error": str(e)}, 500
    

#LLM Chat on Clinic Report Page
@app.route("/llm_chat", methods=["POST"])
def llm_chat():
    try:
        prompt = request.json.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        return Response(
            stream_with_context(report_stream_response(prompt)),
            content_type="text/plain"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#General Chat LLM on chat Page
@app.route("/general_chat_llm", methods=["POST"])
def general_chat_llm():
    try:
        prompt = request.json.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        return Response(
            stream_with_context(chat_stream_response(prompt)),
            content_type="text/plain"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
