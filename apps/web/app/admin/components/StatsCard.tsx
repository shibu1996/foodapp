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
      <div className="rounded-xl shadow-sm p-6 border" style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 rounded w-24" style={{ backgroundColor: '#E5E7EB' }}></div>
            <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}></div>
          </div>
          <div className="h-8 rounded w-32 mb-2" style={{ backgroundColor: '#E5E7EB' }}></div>
          <div className="h-3 rounded w-20" style={{ backgroundColor: '#E5E7EB' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-sm p-6 border transition-all duration-200"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        fontFamily: 'Poppins, sans-serif'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#E11D48';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-medium" style={{ color: '#6B7280', fontSize: '0.75rem' }}>{title}</p>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
          style={{ backgroundColor: '#FEF2F2' }}>
          <i className={`${icon}`} style={{ color: '#E11D48', fontSize: '1.5rem' }}></i>
        </div>
      </div>
      <div className="mb-2">
        <h3 className="font-bold" style={{ color: '#0E1214', fontSize: '1.875rem' }}>{value}</h3>
      </div>
      {subtitle && (
        <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className="font-medium"
            style={{ color: trend.isPositive ? '#10B981' : '#EF4444', fontSize: '0.875rem' }}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>vs last month</span>
        </div>
      )}
    </div>
  );
}




