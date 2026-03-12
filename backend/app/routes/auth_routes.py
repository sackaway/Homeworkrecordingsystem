from flask import Blueprint, jsonify, request, session

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    from app.models import User
    data = request.json
    username = data.get('username', '')
    password = data.get('password', '')

    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({"error": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"}), 401

    session['user_id'] = user.id
    return jsonify({"message": "Login successful", "user": user.to_dict()})

@auth_bp.route('/register', methods=['POST'])
def register():
    from app.models import db, User
    data = request.json

    # Check duplicates
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"error": "ชื่อผู้ใช้นี้มีอยู่แล้ว"}), 400
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "อีเมลนี้มีอยู่แล้ว"}), 400

    try:
        user = User(
            username=data['username'],
            password=data['password'],  # Plaintext
            email=data['email'],
            role=data.get('role', 'student'),
            name=data['name'],
            student_id=data.get('student_id')
        )
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        return jsonify({"message": "Register successful", "user": user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/me', methods=['GET'])
def get_me():
    from app.models import User
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out"})

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    from app.models import db, User
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    try:
        if 'name' in data and data['name']:
            user.name = data['name']
        if 'email' in data and data['email']:
            existing = User.query.filter(User.email == data['email'], User.id != user.id).first()
            if existing:
                return jsonify({"error": "อีเมลนี้มีผู้ใช้งานแล้ว"}), 400
            user.email = data['email']
        if 'student_id' in data and user.role == 'student':
            if data['student_id']:
                existing = User.query.filter(User.student_id == data['student_id'], User.id != user.id).first()
                if existing:
                    return jsonify({"error": "รหัสนักเรียนนี้มีผู้ใช้งานแล้ว"}), 400
            user.student_id = data['student_id'] or None
        db.session.commit()
        return jsonify({"message": "Profile updated", "user": user.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/change-password', methods=['PUT'])
def change_password():
    from app.models import db, User
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    if user.password != data.get('current_password', ''):
        return jsonify({"error": "รหัสผ่านปัจจุบันไม่ถูกต้อง"}), 400

    user.password = data['new_password']  # Plaintext
    db.session.commit()
    return jsonify({"message": "Password changed"})

