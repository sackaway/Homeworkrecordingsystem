const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function apiRequest(method, path, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send session cookies
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || 'API Error');
    }
    return data;
}

// Auth
export const authLogin = (username, password) => apiRequest('POST', '/auth/login', { username, password });
export const authRegister = (userData) => apiRequest('POST', '/auth/register', userData);
export const authMe = () => apiRequest('GET', '/auth/me');
export const authLogout = () => apiRequest('POST', '/auth/logout');

// Instructor
export const getInstructorStats = () => apiRequest('GET', '/instructor/stats');
export const getInstructorCourses = () => apiRequest('GET', '/instructor/courses');
export const createCourse = (data) => apiRequest('POST', '/instructor/courses', data);
export const deleteCourse = (id) => apiRequest('DELETE', `/instructor/courses/${id}`);
export const getCourseStudents = (courseId) => apiRequest('GET', `/instructor/courses/${courseId}/students`);
export const addStudentsToCourse = (courseId, studentIds) => apiRequest('POST', `/instructor/courses/${courseId}/students`, { student_ids: studentIds });
export const removeStudentFromCourse = (courseId, studentId) => apiRequest('DELETE', `/instructor/courses/${courseId}/students/${studentId}`);
export const getAllStudents = () => apiRequest('GET', '/instructor/students');
export const getInstructorHomeworks = () => apiRequest('GET', '/instructor/homeworks');
export const getCourseHomeworks = (courseId) => apiRequest('GET', `/instructor/courses/${courseId}/homeworks`);
export const createHomework = (data) => apiRequest('POST', '/instructor/homeworks', data);
export const updateHomework = (id, data) => apiRequest('PUT', `/instructor/homeworks/${id}`, data);
export const deleteHomework = (id) => apiRequest('DELETE', `/instructor/homeworks/${id}`);
export const getSubmissions = (homeworkId) => apiRequest('GET', `/instructor/homeworks/${homeworkId}/submissions`);
export const gradeSubmission = (subId, data) => apiRequest('PUT', `/instructor/submissions/${subId}/grade`, data);

// Student
export const getStudentStats = () => apiRequest('GET', '/student/stats');
export const getStudentCourses = () => apiRequest('GET', '/student/courses');
export const joinCourse = (inviteCode) => apiRequest('POST', '/student/courses/join', { invite_code: inviteCode });
export const leaveCourse = (courseId) => apiRequest('DELETE', `/student/courses/${courseId}/leave`);
export const getStudentHomeworks = () => apiRequest('GET', '/student/homeworks');
export const submitHomework = (hwId, files) => {
    const formData = new FormData();
    if (files && files.length > 0) {
        for (const file of files) {
            formData.append('images', file);
        }
    }
    return fetch(`${API_BASE}/student/homeworks/${hwId}/submit`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    }).then(res => res.json().then(data => {
        if (!res.ok) throw new Error(data.error || 'API Error');
        return data;
    }));
};

export const getStudentCourseClassmates = (courseId) => apiRequest('GET', `/student/courses/${courseId}/classmates`);
export const getStudentCourseHomeworks = (courseId) => apiRequest('GET', `/student/courses/${courseId}/homeworks`);
