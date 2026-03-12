import requests

session = requests.Session()
login_res = session.post('http://127.0.0.1:5000/api/auth/login', json={'username': 'student', 'password': 'student'})
print("Login Status:", login_res.status_code)
print("Login Response:", login_res.json())

if login_res.status_code == 200:
    hw_res = session.get('http://127.0.0.1:5000/api/student/homeworks')
    print("Homework Status:", hw_res.status_code)
    try:
        print("Homework Data:", hw_res.json())
    except:
        print("Homework Data (text):", hw_res.text)
