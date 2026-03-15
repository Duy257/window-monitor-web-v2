import { LayoutDashboard, Monitor, Activity, FolderKanban, FolderOpen, Terminal as TerminalIcon, Bell, ListTodo, Settings, LogOut } from 'lucide-react';
import { Tab } from '../../App';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'System', icon: Monitor, label: 'System' },
  { id: 'Processes', icon: Activity, label: 'Processes' },
  { id: 'Projects', icon: FolderKanban, label: 'Projects' },
  { id: 'Files', icon: FolderOpen, label: 'Files' },
  { id: 'Terminal', icon: TerminalIcon, label: 'Terminal' },
  { id: 'Alerts', icon: Bell, label: 'Alerts' },
  { id: 'Jobs', icon: ListTodo, label: 'Jobs' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-bg-sidebar border-r border-border-subtle flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
          <Monitor className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-lg leading-tight text-white">WinMonitor</h1>
          <p className="text-xs text-text-secondary">System Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border-subtle space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
