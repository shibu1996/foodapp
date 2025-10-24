'use client';

interface QuickAction {
  icon: string;
  label: string;
  onClick: () => void;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    { icon: '🛒', label: 'Order Now', onClick: () => window.scrollTo({ top: 600, behavior: 'smooth' }) },
    { icon: '📋', label: 'My Subscriptions', onClick: () => {} },
    { icon: '📦', label: 'Track Order', onClick: () => {} },
    { icon: '🔁', label: 'Repeat Last Order', onClick: () => {} },
    { icon: '📖', label: 'View Menu', onClick: () => window.scrollTo({ top: 600, behavior: 'smooth' }) },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="flex flex-col items-center gap-2 p-4 min-w-[100px] rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary transition group"
        >
          <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
          <span className="text-sm font-medium text-gray-700 text-center whitespace-nowrap">{action.label}</span>
        </button>
      ))}
    </div>
  );
}


