from flask import Flask, send_from_directory
from flask_cors import CORS
from app.models import db
from app.config import SQLALCHEMY_DATABASE_URI, SECRET_KEY
import os

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)  # Allow cookies/session from React

    # Load config from .env via app/config.py
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max

    # Create uploads folder if not exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    db.init_app(app)

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.instructor_routes import instructor_bp
    from app.routes.student_routes import student_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(instructor_bp, url_prefix='/api/instructor')
    app.register_blueprint(student_bp, url_prefix='/api/student')

    # Serve uploaded files
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
