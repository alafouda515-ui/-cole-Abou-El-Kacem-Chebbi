import React, { useState } from 'react';
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
import { Student, Payment } from './types';

const MainLayout: React.FC = () => {
  const { students, payments } = useApp();
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
      <Header />

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

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
