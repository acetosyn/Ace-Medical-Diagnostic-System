from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user
from datetime import datetime

client = None
db = None
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.login_message_category = "info"

def init_app(app):
    """Initialize MongoDB connection and login manager."""
    global client, db
    mongo_uri = app.config["MONGO_URI"]  # e.g., mongodb+srv://user:pass@cluster.mongodb.net/mydb
    client = MongoClient(mongo_uri)
    db_name = mongo_uri.rsplit("/", 1)[-1].split("?")[0]
    db = client[db_name]
    
    bcrypt.init_app(app)
    login_manager.init_app(app)

# --------------------------
# 👤 USER MODEL (MONGODB)
# --------------------------
class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.first_name = user_data.get('first_name')
        self.middle_name = user_data.get('middle_name')
        self.last_name = user_data.get('last_name')
        self.username = user_data['username']
        self.email = user_data['email']
        self.password = user_data['password']
        self.role = user_data.get('role', 'customer')
        self.created_at = user_data.get('created_at')

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login session management."""
    user_data = db.users.find_one({"_id": ObjectId(user_id)})
    return User(user_data) if user_data else None

# --------------------------
# 🔐 USER AUTHENTICATION HELPERS
# --------------------------
def register_user(first_name, middle_name, last_name, username, email, password, role="customer"):
    """Register a new user with bcrypt password hashing."""
    if db.users.find_one({"username": username}) or db.users.find_one({"email": email}):
        return False, "Username or Email already exists.", None

    try:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = {
            "first_name": first_name,
            "middle_name": middle_name,
            "last_name": last_name,
            "username": username,
            "email": email,
            "password": hashed_password,
            "role": role,
            "created_at": datetime.utcnow()
        }
        result = db.users.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return True, "Registration successful. Please log in.", User(new_user)
    except Exception as e:
        return False, f"An error occurred: {str(e)}", None

def login_user_helper(username, password):
    """Authenticate user by checking hashed password."""
    user_data = db.users.find_one({"username": username})
    if user_data:
        user = User(user_data)
        if user.check_password(password):
            login_user(user)
            return True, "Login successful.", user
    return False, "Invalid credentials.", None

def logout_user_helper():
    """Log out the current user."""
    logout_user()
    return True, "Logged out successfully."
