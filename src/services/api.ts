import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject token from sessionStorage / localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edusaas_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('edusaas_token');
      localStorage.removeItem('edusaas_user');
      localStorage.removeItem('edusaas_school');
    }
    return Promise.reject(error);
  }
);

// =================== AUTH SERVICES ===================
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('edusaas_token', res.data.token);
      localStorage.setItem('edusaas_user', JSON.stringify(res.data.user));
      if (res.data.school) {
        localStorage.setItem('edusaas_school', JSON.stringify(res.data.school));
      }
    }
    return res.data;
  },

  registerSchool: async (schoolData: any) => {
    const res = await apiClient.post('/auth/register-school', schoolData);
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('edusaas_token');
    localStorage.removeItem('edusaas_user');
    localStorage.removeItem('edusaas_school');
  }
};

// =================== SUPER ADMIN SERVICES ===================
export const superAdminService = {
  getSchools: async (params?: { status?: string; search?: string }) => {
    const res = await apiClient.get('/super-admin/schools', { params });
    return res.data;
  },

  updateSchoolStatus: async (schoolId: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED') => {
    const res = await apiClient.patch(`/super-admin/schools/${schoolId}/status`, { status });
    return res.data;
  },

  deleteSchool: async (schoolId: string) => {
    const res = await apiClient.delete(`/super-admin/schools/${schoolId}`);
    return res.data;
  },

  getGlobalStats: async () => {
    const res = await apiClient.get('/super-admin/stats');
    return res.data;
  }
};

// =================== SCHOOL PROFILE ===================
export const schoolService = {
  getProfile: async () => {
    const res = await apiClient.get('/school/profile');
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await apiClient.put('/school/profile', data);
    return res.data;
  }
};

// =================== STUDENTS SERVICES ===================
export const studentService = {
  getStudents: async (params?: { classId?: string; status?: string; search?: string; academicYear?: string }) => {
    const res = await apiClient.get('/students', { params });
    return res.data;
  },

  createStudent: async (studentData: any) => {
    const res = await apiClient.post('/students', studentData);
    return res.data;
  },

  updateStudent: async (id: string, studentData: any) => {
    const res = await apiClient.put(`/students/${id}`, studentData);
    return res.data;
  },

  deleteStudent: async (id: string) => {
    const res = await apiClient.delete(`/students/${id}`);
    return res.data;
  }
};

// =================== ACADEMIC SERVICES ===================
export const academicService = {
  getClasses: async (academicYear?: string) => {
    const res = await apiClient.get('/academics/classes', { params: { academicYear } });
    return res.data;
  },
  createClass: async (data: any) => {
    const res = await apiClient.post('/academics/classes', data);
    return res.data;
  },
  deleteClass: async (id: string) => {
    const res = await apiClient.delete(`/academics/classes/${id}`);
    return res.data;
  },

  getSubjects: async () => {
    const res = await apiClient.get('/academics/subjects');
    return res.data;
  },
  createSubject: async (data: any) => {
    const res = await apiClient.post('/academics/subjects', data);
    return res.data;
  },
  deleteSubject: async (id: string) => {
    const res = await apiClient.delete(`/academics/subjects/${id}`);
    return res.data;
  },

  getRooms: async () => {
    const res = await apiClient.get('/academics/rooms');
    return res.data;
  },
  createRoom: async (data: any) => {
    const res = await apiClient.post('/academics/rooms', data);
    return res.data;
  },
  deleteRoom: async (id: string) => {
    const res = await apiClient.delete(`/academics/rooms/${id}`);
    return res.data;
  },

  getTeachers: async () => {
    const res = await apiClient.get('/academics/teachers');
    return res.data;
  },
  createTeacher: async (data: any) => {
    const res = await apiClient.post('/academics/teachers', data);
    return res.data;
  }
};

// =================== SCHEDULE SERVICES ===================
export const scheduleService = {
  getSchedule: async (params?: { classId?: string; teacherId?: string; academicYear?: string }) => {
    const res = await apiClient.get('/schedule', { params });
    return res.data;
  },
  createSlot: async (data: any) => {
    const res = await apiClient.post('/schedule', data);
    return res.data;
  },
  deleteSlot: async (id: string) => {
    const res = await apiClient.delete(`/schedule/${id}`);
    return res.data;
  }
};

// =================== GRADES SERVICES ===================
export const gradeService = {
  getGrades: async (params?: { studentId?: string; classId?: string; subjectId?: string; term?: string; academicYear?: string }) => {
    const res = await apiClient.get('/grades', { params });
    return res.data;
  },
  createGrade: async (data: any) => {
    const res = await apiClient.post('/grades', data);
    return res.data;
  },
  deleteGrade: async (id: string) => {
    const res = await apiClient.delete(`/grades/${id}`);
    return res.data;
  },
  getStudentAverages: async (studentId: string, term?: string, academicYear?: string) => {
    const res = await apiClient.get(`/grades/student/${studentId}/averages`, { params: { term, academicYear } });
    return res.data;
  }
};

// =================== FINANCE SERVICES ===================
export const financeService = {
  getPayments: async (params?: { academicYear?: string; studentId?: string; search?: string }) => {
    const res = await apiClient.get('/finances/payments', { params });
    return res.data;
  },
  recordPayment: async (data: any) => {
    const res = await apiClient.post('/finances/payments', data);
    return res.data;
  },
  getFeePlan: async (academicYear?: string) => {
    const res = await apiClient.get('/finances/fee-plan', { params: { academicYear } });
    return res.data;
  }
};

// =================== HOMEWORK SERVICES ===================
export const homeworkService = {
  getHomeworks: async (params?: { classId?: string; academicYear?: string }) => {
    const res = await apiClient.get('/homework', { params });
    return res.data;
  },
  createHomework: async (data: any) => {
    const res = await apiClient.post('/homework', data);
    return res.data;
  },
  submitHomework: async (homeworkId: string, data: any) => {
    const res = await apiClient.post(`/homework/${homeworkId}/submit`, data);
    return res.data;
  },
  gradeSubmission: async (submissionId: string, score: number, feedback: string) => {
    const res = await apiClient.post(`/homework/submissions/${submissionId}/grade`, { score, feedback });
    return res.data;
  },
  acknowledgeByParent: async (submissionId: string) => {
    const res = await apiClient.post(`/homework/submissions/${submissionId}/acknowledge`);
    return res.data;
  }
};

// =================== MESSAGING & AUDIT ===================
export const messageService = {
  getMessages: async (folder: 'inbox' | 'sent' | 'drafts' = 'inbox') => {
    const res = await apiClient.get('/messages', { params: { folder } });
    return res.data;
  },
  sendMessage: async (data: any) => {
    const res = await apiClient.post('/messages', data);
    return res.data;
  },
  hideMessage: async (id: string) => {
    const res = await apiClient.patch(`/messages/${id}/hide`);
    return res.data;
  },
  getAnnouncements: async () => {
    const res = await apiClient.get('/announcements');
    return res.data;
  },
  createAnnouncement: async (data: any) => {
    const res = await apiClient.post('/announcements', data);
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await apiClient.get('/audit');
    return res.data;
  }
};

// =================== ABSENCES SERVICES ===================
export const absenceService = {
  getAbsences: async (params?: { studentId?: string; academicYear?: string }) => {
    const res = await apiClient.get('/absences', { params });
    return res.data;
  },
  createAbsence: async (data: any) => {
    const res = await apiClient.post('/absences', data);
    return res.data;
  },
  justifyAbsence: async (id: string, reason: string) => {
    const res = await apiClient.patch(`/absences/${id}/justify`, { reason });
    return res.data;
  },
  validateAbsence: async (id: string, justified: boolean) => {
    const res = await apiClient.patch(`/absences/${id}/validate`, { justified });
    return res.data;
  },
  deleteAbsence: async (id: string) => {
    const res = await apiClient.delete(`/absences/${id}`);
    return res.data;
  }
};

