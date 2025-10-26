interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  loading?: boolean;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  icon,
  loading = false,
  subtitle,
  trend,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border" style={{ borderColor: '#E5E7EB', fontFamily: 'Poppins, sans-serif' }}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 rounded w-24" style={{ backgroundColor: '#F3F4F6' }}></div>
            <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#F3F4F6' }}></div>
          </div>
          <div className="h-8 rounded w-32 mb-2" style={{ backgroundColor: '#F3F4F6' }}></div>
          <div className="h-3 rounded w-20" style={{ backgroundColor: '#F3F4F6' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-all duration-200"
      style={{ borderColor: '#E5E7EB', fontFamily: 'Poppins, sans-serif' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#E11D48';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{title}</p>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="mb-2">
        <h3 className="text-3xl font-bold" style={{ color: '#0E1214' }}>{value}</h3>
      </div>
      {subtitle && (
        <p className="text-sm" style={{ color: '#9CA3AF' }}>{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className="text-sm font-medium"
            style={{ color: trend.isPositive ? '#16A34A' : '#DC2626' }}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>vs last month</span>
        </div>
      )}
    </div>
  );
}



