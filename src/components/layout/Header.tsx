import { format } from 'date-fns';
import { Tab } from '../../App';

interface HeaderProps {
  activeTab: Tab;
}

export function Header({ activeTab }: HeaderProps) {
  const currentDate = new Date();
  
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-main">
      <h2 className="text-2xl font-semibold text-white">{activeTab}</h2>
      <div className="text-sm text-text-secondary">
        {format(currentDate, 'MMM dd, yyyy · hh:mm a')}
      </div>
    </header>
  );
}
