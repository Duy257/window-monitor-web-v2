import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { SystemMonitor } from './pages/SystemMonitor';
import { Files } from './pages/Files';
import { Terminal } from './pages/Terminal';
import { Processes } from './pages/Processes';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Alerts } from './pages/Alerts';
import { Jobs } from './pages/Jobs';
import { useSocket } from './hooks/useSocket';

export type Tab = 'Dashboard' | 'System' | 'Processes' | 'Projects' | 'Files' | 'Terminal' | 'Alerts' | 'Jobs';

/** Layout wrapper với Sidebar */
function AppLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const { isConnected } = useSocket();

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':   return <Dashboard />;
      case 'System':      return <SystemMonitor />;
      case 'Processes':   return <Processes />;
      case 'Projects':    return <Projects />;
      case 'Files':       return <Files />;
      case 'Terminal':    return <Terminal />;
      case 'Alerts':      return <Alerts />;
      case 'Jobs':        return <Jobs />;
      default:            return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-bg-main overflow-hidden text-text-primary">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Thanh trạng thái kết nối WebSocket */}
        {!isConnected && (
          <div className="flex items-center justify-center gap-2 py-1.5 bg-yellow-900/40 border-b border-yellow-700/40 text-yellow-400 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            WebSocket chưa kết nối — dữ liệu vẫn cập nhật qua polling
          </div>
        )}
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route path="/projects" element={<AppLayout />} />
        <Route path="/projects/:projectName" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
