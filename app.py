from flask import Flask, render_template

app = Flask(__name__, template_folder= 'templates')

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login")
def login():
    return "<h1>Login page coming soon...</h1>", 200


@app.route("/register")
def register():
    return "<h1> Register page coming soon...</h1>", 200


if __name__=="__main__":
    app.run(host="0.0.0.0", port=5000, debug= True)

