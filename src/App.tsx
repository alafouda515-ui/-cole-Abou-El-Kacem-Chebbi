import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, TabKey } from './components/Sidebar';
import { OverviewTab } from './components/Dashboard/OverviewTab';
import { StudentsTab } from './components/Students/StudentsTab';
import { AcademicsTab } from './components/Academics/AcademicsTab';
import { ScheduleTab } from './components/Schedule/ScheduleTab';
import { GradesTab } from './components/Grades/GradesTab';
import { AbsencesTab } from './components/Absences/AbsencesTab';
import { FinancesTab } from './components/Finances/FinancesTab';
import { HomeworkTab } from './components/Homework/HomeworkTab';
import { MessagingTab } from './components/Messaging/MessagingTab';
import { AuditTab } from './components/Audit/AuditTab';
import { PrintableReportCardModal } from './components/Modals/PrintableReportCardModal';
import { PrintableReceiptModal } from './components/Modals/PrintableReceiptModal';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterSchoolPage } from './pages/Auth/RegisterSchoolPage';
import { SuperAdminDashboard } from './pages/SuperAdmin/SuperAdminDashboard';
import { Student, Payment, UserRole } from './types';
import { authService } from './services/api';

const MainLayout: React.FC<{
  onLogout: () => void;
  onBackToSuperAdmin?: () => void;
}> = ({ onLogout, onBackToSuperAdmin }) => {
  const { students } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // Modal States
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [reportCardTerm, setReportCardTerm] = useState<'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3'>('Trimestre 1');
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  const handleOpenReportCard = (
    studentId: string,
    term: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3' = 'Trimestre 1'
  ) => {
    const st = students.find((s) => s.id === studentId);
    if (st) {
      setReportCardStudent(st);
      setReportCardTerm(term);
    }
  };

  const handleOpenReceipt = (payment: Payment) => {
    setReceiptPayment(payment);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Header */}
      <Header onBackToSuperAdmin={onBackToSuperAdmin} onLogout={onLogout} />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <OverviewTab
              onNavigate={setActiveTab}
              onOpenReportCard={(id) => handleOpenReportCard(id, 'Trimestre 1')}
            />
          )}
          {activeTab === 'students' && (
            <StudentsTab onOpenReportCard={(id) => handleOpenReportCard(id, 'Trimestre 1')} />
          )}
          {activeTab === 'academics' && <AcademicsTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'grades' && (
            <GradesTab onOpenReportCard={handleOpenReportCard} />
          )}
          {activeTab === 'absences' && <AbsencesTab />}
          {activeTab === 'finances' && <FinancesTab onOpenReceipt={handleOpenReceipt} />}
          {activeTab === 'homework' && <HomeworkTab />}
          {activeTab === 'messaging' && <MessagingTab />}
          {activeTab === 'audit' && <AuditTab />}
        </main>
      </div>

      {/* Official Report Card Modal */}
      {reportCardStudent && (
        <PrintableReportCardModal
          student={reportCardStudent}
          term={reportCardTerm}
          onClose={() => setReportCardStudent(null)}
        />
      )}

      {/* Official Payment Receipt Modal */}
      {receiptPayment && (
        <PrintableReceiptModal
          payment={receiptPayment}
          onClose={() => setReceiptPayment(null)}
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, setCurrentUser, currentSchool, setCurrentSchool, reloadSchoolData } = useApp();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('edusaas_token');
  });

  // Track if Super Admin is currently inspecting a specific school
  const [superAdminActiveSchoolId, setSuperAdminActiveSchoolId] = useState<string | null>(null);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('edusaas_token');
    if (token) {
      setIsAuthenticated(true);
      // Validate session with backend
      authService
        .getMe()
        .then((res) => {
          if (res.success && res.user) {
            const normalizedRole: UserRole =
              res.user.role === 'SCHOOL_ADMIN' ? 'ADMIN' : (res.user.role as UserRole);
            setCurrentUser({
              id: res.user.id,
              name: `${res.user.first_name} ${res.user.last_name}`,
              email: res.user.email,
              role: normalizedRole,
              phone: res.user.phone,
              schoolId: res.user.school_id,
              avatar: res.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
            });
            if (res.school) {
              setCurrentSchool(res.school);
            }
          }
        })
        .catch(() => {
          // Token invalid or expired
          setIsAuthenticated(false);
          authService.logout();
        });
    }
  }, []);

  const handleLoginSuccess = (user: any, school: any) => {
    setIsAuthenticated(true);
    const normalizedRole: UserRole =
      user.role === 'SCHOOL_ADMIN' ? 'ADMIN' : (user.role as UserRole);
    setCurrentUser({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: normalizedRole,
      phone: user.phone,
      schoolId: user.school_id,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    });
    if (school) {
      setCurrentSchool(school);
    }
    setSuperAdminActiveSchoolId(null);
    reloadSchoolData();
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setSuperAdminActiveSchoolId(null);
  };

  // If unauthenticated: render Login or Register
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterSchoolPage onNavigateLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setAuthView('register')}
      />
    );
  }

  // If user is SUPER_ADMIN:
  if (currentUser.role === 'SUPER_ADMIN') {
    // If inspecting a school, render MainLayout with back button
    if (superAdminActiveSchoolId) {
      return (
        <MainLayout
          onLogout={handleLogout}
          onBackToSuperAdmin={() => setSuperAdminActiveSchoolId(null)}
        />
      );
    }
    // Otherwise render platform control dashboard
    return (
      <SuperAdminDashboard
        onLogout={handleLogout}
        onSelectSchool={(schoolId, schoolName) => {
          setSuperAdminActiveSchoolId(schoolId);
          setCurrentSchool({
            id: schoolId,
            name: schoolName,
            slug: schoolName.toLowerCase().replace(/\s+/g, '-'),
            address: 'Établissement rattaché',
            email: 'admin@ecole.com',
            phone: '',
            manager_name: 'Direction',
            status: 'ACTIVE'
          });
          reloadSchoolData();
        }}
      />
    );
  }

  // School Users (SCHOOL_ADMIN, TEACHER, STUDENT, PARENT, ACCOUNTANT)
  return <MainLayout onLogout={handleLogout} />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
