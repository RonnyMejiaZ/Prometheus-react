import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../services/api';
import { Alquiler, Pago } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeRentals: 0,
    collectedPayments: 0,
    overduePayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<Array<{ month: string; income: number }>>([]);
  const [paymentStatus, setPaymentStatus] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeAmount = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const sanitized = value.replace(/[^\d.-]/g, '');
      const parsed = Number.parseFloat(sanitized);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [alquileresRes, pagosRes] = await Promise.all([
        apiService.getAlquileres(0, 1000, ''),
        apiService.getPagos(0, 1000, '')
      ]);

      const alquileres: Alquiler[] = alquileresRes.data?.items || [];
      const pagos: Pago[] = pagosRes.data?.items || [];

      const activeRentalsList = alquileres.filter(a => a.activo);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const rentPaymentsThisMonth = new Map<number, number>();

      pagos.forEach((pago) => {
        if (!pago.pagoRenta) {
          return;
        }

        const paymentDate = new Date(pago.fechaPago);
        const isSameMonth = paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;

        if (isSameMonth) {
          const amount = normalizeAmount(pago.montoMensual);
          const currentAmount = rentPaymentsThisMonth.get(pago.alquilerId) ?? 0;
          rentPaymentsThisMonth.set(pago.alquilerId, currentAmount + amount);
        }
      });

      const collectedPayments = Array.from(rentPaymentsThisMonth.values()).reduce(
        (sum, amount) => sum + amount,
        0
      );

      const overduePayments = activeRentalsList.filter(alquiler => !rentPaymentsThisMonth.has(alquiler.id)).length;

      setStats({
        activeRentals: activeRentalsList.length,
        collectedPayments,
        overduePayments
      });

      const monthlyData = generateMonthlyIncome(pagos, normalizeAmount);
      setMonthlyIncome(monthlyData.length > 0 ? monthlyData : generateEmptyMonthlyData());

      const paidCount = rentPaymentsThisMonth.size;
      const overdueCount = Math.max(activeRentalsList.length - paidCount, 0);

      setPaymentStatus([
        { name: 'Pagados', value: paidCount || 0 },
        { name: 'Vencidos', value: overdueCount || 0 }
      ]);
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error('Error loading stats:', err);
      setPaymentStatus([
        { name: 'Pagados', value: 0 },
        { name: 'Vencidos', value: 0 }
      ]);
      setMonthlyIncome(generateEmptyMonthlyData());
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyIncome = (
    pagos: Pago[],
    toAmount: (value: unknown) => number
  ): Array<{ month: string; income: number }> => {
    const months: { [key: string]: number } = {};
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[date.getMonth()]}. ${date.getFullYear()}`;
      months[key] = 0;
    }

    pagos.forEach(pago => {
      if (!pago.pagoRenta) {
        return;
      }

      const date = new Date(pago.fechaPago);
      const key = `${monthNames[date.getMonth()]}. ${date.getFullYear()}`;
      if (months[key] !== undefined) {
        months[key] += toAmount(pago.montoMensual);
      }
    });

    return Object.entries(months).map(([month, income]) => ({
      month,
      income: Math.round(income / 1000)
    }));
  };

  const generateEmptyMonthlyData = (): Array<{ month: string; income: number }> => {
    const months: Array<{ month: string; income: number }> = [];
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: `${monthNames[date.getMonth()]}. ${date.getFullYear()}`,
        income: 0
      });
    }
    
    return months;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  const COLORS = ['#ffffff', '#ef4444'];

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Escritorio</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card welcome-card">
          <div className="welcome-avatar">A</div>
          <div className="welcome-content">
            <h3>Bienvenida/o {apiService.getCurrentUser()?.name || 'admin'}</h3>
            <button 
              className="logout-button"
              onClick={async () => {
                await apiService.logout();
                navigate('/login', { replace: true });
              }}
            >
              <span>Salir</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M11 11.3333L14 8M14 8L11 4.66667M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="dashboard-card metric-card">
          <h3 className="metric-title">Alquileres activos</h3>
          <p className="metric-value">{stats.activeRentals}</p>
          <div className="metric-footer">
            <span className="metric-description">Contratos activos ahora</span>
            <div className="metric-trend positive">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
              </svg>
              <div className="trend-line positive"></div>
            </div>
          </div>
        </div>

        <div className="dashboard-card metric-card">
          <h3 className="metric-title">Pagos cobrados (mes)</h3>
          <p className="metric-value">{formatCurrency(stats.collectedPayments)}</p>
          <div className="metric-footer">
            <span className="metric-description">Pagos marcados como pagados</span>
            <div className="metric-trend positive">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L10 6H7V10H5V6H2L6 2Z" fill="currentColor"/>
              </svg>
              <div className="trend-line positive"></div>
            </div>
          </div>
        </div>

        <div className="dashboard-card metric-card">
          <h3 className="metric-title">Pagos vencidos de alquileres activos</h3>
          <p className="metric-value">{stats.overduePayments}</p>
          <div className="metric-footer">
            <span className="metric-description">Pago tardío del alquiler o servicios</span>
            <div className="metric-trend negative">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10L2 6H5V2H7V6H10L6 10Z" fill="currentColor"/>
              </svg>
              <div className="trend-line negative"></div>
            </div>
          </div>
        </div>

        <div className="dashboard-card chart-card">
          <h3 className="chart-title">Ingresos mensuales (últimos 12 meses)</h3>
          {monthlyIncome.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyIncome}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value: number) => `${value}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2d2d', 
                    border: '1px solid #3d3d3d',
                    color: '#ffffff'
                  }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#fbbf24" 
                  strokeWidth={2}
                  dot={{ fill: '#fbbf24', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No hay datos disponibles</div>
          )}
        </div>

        <div className="dashboard-card chart-card">
          <h3 className="chart-title">Estado de pagos (mes actual)</h3>
          {paymentStatus.length > 0 && paymentStatus.some(p => p.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2d2d', 
                    border: '1px solid #3d3d3d',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No hay datos disponibles</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
