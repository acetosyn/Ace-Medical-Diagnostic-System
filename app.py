from flask import Flask, render_template, request, jsonify
import engine

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
    form_data= engine.extract_patient_data(request.form)
    html=engine.generate_report_html(form_data)
    return html

@app.route("/generate_quick_report", methods= ["POST"])
def generate_quick_report():
    form_data=engine.extract_quick_upload_data(request.form)
    html=engine.generate_quick_report_html(form_data)
    return html

# @app.route("/generate_report", methods=["POST"])
# def generate_report():
#     form_data = engine.extract_patient_data(request.form)
#     html = engine.generate_report_html(form_data)
#     return html

# @app.route("/generate_quick_report", methods=["POST"])
# def generate_quick_report():
#     form_data = engine.extract_quick_upload_data(request.form)
#     html = engine.generate_quick_report_html(form_data)
#     return html


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
