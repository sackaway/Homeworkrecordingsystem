import os
from dotenv import load_dotenv

load_dotenv()

# PythonAnywhere MySQL naming convention: yourusername$dbname
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '1234')
DB_NAME = os.getenv('DB_NAME', 'homework_tracker')
SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')

# SQLALCHEMY_DATABASE_URI can be provided directly or built from components
# On PythonAnywhere, usually 'mysql://yourusername:yourpassword@yourusername.mysql.pythonanywhere-services.com/yourusername$dbname'
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
if not SQLALCHEMY_DATABASE_URI:
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
