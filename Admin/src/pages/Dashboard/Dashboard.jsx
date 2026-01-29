import React, { useState, useEffect, useCallback } from 'react'
import './Dashboard.css'
import axios from 'axios'
import { useTranslation } from 'react-i18next';
import '../../i18n';
import config from '../../config/config';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Configure axios defaults
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const Dashboard = ({ url }) => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    totalProducts: 0
  })

  const [timeStats, setTimeStats] = useState({
    today: { orders: 0, revenue: 0 },
    week: { orders: 0, revenue: 0 },
    month: { orders: 0, revenue: 0 },
    quarter: { orders: 0, revenue: 0 },
    year: { orders: 0, revenue: 0 }
  })

  const [topProducts, setTopProducts] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [trends, setTrends] = useState({
    orders: 0,
    revenue: 0,
    users: 0,
    products: 0,
    completed: 0
  })

  // Time-based analytics (chart + comparison table)
  const [timeBasedData, setTimeBasedData] = useState([])
  const [isTimeBasedLoading, setIsTimeBasedLoading] = useState(false)
  const [timeBasedError, setTimeBasedError] = useState('')
  const [chartFilters, setChartFilters] = useState({
    days: 7,
    granularity: 'day', // 'day' | 'week' | 'month'
    metric: 'revenue',  // 'revenue' | 'totalOrders'
    chartType: 'line'   // 'line' | 'bar'
  });
  const [showComparisonTable, setShowComparisonTable] = useState(false);


  useEffect(() => {
    console.log('🚀 Dashboard component mounted')
    console.log('🔗 Backend URL:', url)
    fetchDashboardData()
  }, [])

  // Fetch time-based stats whenever filters change
  useEffect(() => {
    fetchTimeBasedStats()
  }, [chartFilters.days, chartFilters.granularity, chartFilters.metric])

  // Calculate trends based on current vs previous period
  const calculateTrends = (currentStats, previousStats) => {
    const trends = {
      orders: 0,
      revenue: 0,
      users: 0,
      products: 0,
      completed: 0,
      pending: 0
    }

    // Calculate trends for all metrics
    // Orders trend (month over month)
    if (previousStats.lastMonth && previousStats.lastMonth.orders > 0) {
      trends.orders = Math.round(((currentStats.currentMonth.orders - previousStats.lastMonth.orders) / previousStats.lastMonth.orders) * 100)
    } else if (currentStats.currentMonth && currentStats.currentMonth.orders > 0) {
      trends.orders = 100 // New data
    }

    // Revenue trend (month over month)
    if (previousStats.lastMonth && previousStats.lastMonth.revenue > 0) {
      trends.revenue = Math.round(((currentStats.currentMonth.revenue - previousStats.lastMonth.revenue) / previousStats.lastMonth.revenue) * 100)
    } else if (currentStats.currentMonth && currentStats.currentMonth.revenue > 0) {
      trends.revenue = 100 // New data
    }

    // Users trend (compare with previous month)
    if (previousStats.lastMonth && previousStats.lastMonth.users > 0) {
      trends.users = Math.round(((currentStats.totalUsers - previousStats.lastMonth.users) / previousStats.lastMonth.users) * 100)
    } else if (currentStats.totalUsers > 0) {
      trends.users = 100 // New data
    }

    // Products trend (compare with previous month)
    if (previousStats.lastMonth && previousStats.lastMonth.products > 0) {
      trends.products = Math.round(((currentStats.totalProducts - previousStats.lastMonth.products) / previousStats.lastMonth.products) * 100)
    } else if (currentStats.totalProducts > 0) {
      trends.products = 100 // New data
    }

    // Completed orders trend (month over month)
    if (previousStats.lastMonth && previousStats.lastMonth.completed > 0) {
      trends.completed = Math.round(((currentStats.completedOrders - previousStats.lastMonth.completed) / previousStats.lastMonth.completed) * 100)
    } else if (currentStats.completedOrders > 0) {
      trends.completed = 100 // New data
    }

    // Pending orders trend (month over month)
    if (previousStats.lastMonth && previousStats.lastMonth.pending > 0) {
      trends.pending = Math.round(((currentStats.pendingOrders - previousStats.lastMonth.pending) / previousStats.lastMonth.pending) * 100)
    } else if (currentStats.pendingOrders > 0) {
      trends.pending = 100 // New data
    }

    return trends
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching dashboard data from:', url)
      console.log('Full URL for stats:', `${config.BACKEND_URL}/api/admin/stats`)

      // Test basic connectivity first
      try {
        const testResponse = await axios.get(`${url}/`)
        console.log('✅ Basic connectivity test passed:', testResponse.data)
      } catch (testError) {
        console.error('❌ Basic connectivity test failed:', testError)
        throw new Error('Cannot connect to backend server')
      }

      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('❌ Admin not logged in. Please login again.');
        alert(t('dashboard.adminNotLoggedIn'));
        setIsLoading(false);
        return;
      }

      // Fetch all data in parallel for better performance
      console.log('🚀 Starting API calls...')
      const [statsResponse, timeResponse, topProductsResponse] = await Promise.allSettled([
        axios.get(`${config.BACKEND_URL}/api/admin/stats`, { headers: { 'token': adminToken } }),
        axios.get(`${config.BACKEND_URL}/api/admin/time-stats`, { headers: { 'token': adminToken } }),
        axios.get(`${config.BACKEND_URL}/api/admin/top-products?limit=3`, { headers: { 'token': adminToken } })
      ])

      console.log('📊 All API calls completed with status:', {
        stats: statsResponse.status,
        time: timeResponse.status,
        topProducts: topProductsResponse.status
      })

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data) {
        console.log('✅ Stats response:', statsResponse.value.data)
        const currentStats = statsResponse.value.data
        setStats(currentStats)

        // Calculate trends using current month vs last month data
        const calculatedTrends = calculateTrends(currentStats, currentStats)
        setTrends(calculatedTrends)
      } else {
        console.error('❌ Stats fetch failed:', statsResponse.reason)
        console.error('❌ Stats error details:', {
          status: statsResponse.status,
          reason: statsResponse.reason,
          response: statsResponse.value
        })
        // Set default stats if API fails
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalUsers: 0,
          totalProducts: 0
        })
        setTrends({
          orders: 0,
          revenue: 0,
          users: 0,
          products: 0,
          completed: 0
        })
      }

      // Handle time stats response
      if (timeResponse.status === 'fulfilled' && timeResponse.value.data) {
        console.log('✅ Time stats response:', timeResponse.value.data)
        setTimeStats(timeResponse.value.data)
      } else {
        console.error('❌ Time stats fetch failed:', timeResponse.reason)
        console.error('❌ Time stats error details:', {
          status: timeResponse.status,
          reason: timeResponse.reason,
          response: timeResponse.value
        })
        // Set default time stats if API fails
        setTimeStats({
          today: { orders: 0, revenue: 0 },
          week: { orders: 0, revenue: 0 },
          month: { orders: 0, revenue: 0 },
          quarter: { orders: 0, revenue: 0 },
          year: { orders: 0, revenue: 0 }
        })
      }

      // Handle top products response
      if (topProductsResponse.status === 'fulfilled' && topProductsResponse.value.data) {
        console.log('✅ Top products response:', topProductsResponse.value.data)
        setTopProducts(topProductsResponse.value.data.data || [])
      } else {
        console.error('❌ Top products fetch failed:', topProductsResponse.reason)
        setTopProducts([])
      }


    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error)
      console.error('💥 Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      })

      if (error.response) {
        console.error('💥 Server responded with error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        })
      } else if (error.request) {
        console.error('💥 No response received:', error.request)
      } else {
        console.error('💥 Error setting up request:', error.message)
      }

      // Set default data for demo if API fails completely
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalUsers: 0,
        totalProducts: 0
      })
      setTimeStats({
        today: { orders: 0, revenue: 0 },
        week: { orders: 0, revenue: 0 },
        month: { orders: 0, revenue: 0 },
        quarter: { orders: 0, revenue: 0 },
        year: { orders: 0, revenue: 0 }
      })

      setTrends({
        orders: 0,
        revenue: 0,
        users: 0,
        products: 0,
        completed: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTimeBasedStats = async () => {
    try {
      setIsTimeBasedLoading(true)
      setTimeBasedError('')

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.error('❌ Admin not logged in. Please login again.')
        setTimeBasedError(t('dashboard.adminNotLoggedInShort'))
        setIsTimeBasedLoading(false)
        return
      }

      const params = new URLSearchParams({
        days: String(chartFilters.days),
        granularity: chartFilters.granularity,
        metric: chartFilters.metric
      })

      const response = await axios.get(
        `${config.BACKEND_URL}/api/admin/time-based-stats?${params.toString()}`,
        { headers: { token: adminToken } }
      )

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setTimeBasedData(response.data.data)
      } else if (Array.isArray(response.data)) {
        // Fallback nếu backend trả thẳng mảng
        setTimeBasedData(response.data)
      } else {
        console.error('Unexpected time-based stats response:', response.data)
        setTimeBasedError(t('dashboard.noDataForTimeRange'))
        setTimeBasedData([])
      }
    } catch (error) {
      console.error('💥 Error fetching time-based stats:', error)
      setTimeBasedError(t('dashboard.noDataForTimeRange'))
      setTimeBasedData([])
    } finally {
      setIsTimeBasedLoading(false)
    }
  }

  const formatDate = (date) => {
    try {
      const d = new Date(date || new Date());
      const locale = i18n?.language === 'vi' ? 'vi-VN' : i18n?.language === 'sk' ? 'sk-SK' : 'en-US';
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    } catch {
      return '';
    }
  }

  const getStatusColor = (status) => {
    if (!status) return '#6B7280';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'delivered':
        return '#10B981';
      case 'pending':
      case 'order placed':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'out for delivery':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatChartLabel = (dateString, granularity) => {
    try {
      const d = new Date(dateString)
      const locale = i18n?.language === 'vi' ? 'vi-VN' : i18n?.language === 'sk' ? 'sk-SK' : 'en-US';

      if (granularity === 'month') {
        return new Intl.DateTimeFormat(locale, { month: '2-digit', year: '2-digit' }).format(d)
      }

      if (granularity === 'week') {
        // Hiển thị theo dạng tuần bắt đầu
        const weekStart = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(d)
        return `${t('dashboard.week')} ${weekStart}`
      }

      // Mặc định: ngày
      return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(d)
    } catch {
      return ''
    }
  }

  const dynamicChartData = (timeBasedData || []).map(point => ({
    label: formatChartLabel(point.date, chartFilters.granularity),
    value: point.value || 0
  }))

  const comparisonRows = dynamicChartData.map((row, index) => {
    if (index === 0) {
      return {
        ...row,
        diff: 0,
        diffPercent: 0
      }
    }
    const prev = dynamicChartData[index - 1]
    const diff = row.value - prev.value
    const diffPercent = prev.value ? Math.round((diff / prev.value) * 100) : 0
    return {
      ...row,
      diff,
      diffPercent
    }
  })

  const timeChartData = [
    {
      key: 'today',
      period: t('dashboard.today'),
      orders: timeStats.today?.orders || 0,
      revenue: timeStats.today?.revenue || 0
    },
    {
      key: 'week',
      period: t('dashboard.thisWeek'),
      orders: timeStats.week?.orders || 0,
      revenue: timeStats.week?.revenue || 0
    },
    {
      key: 'month',
      period: t('dashboard.thisMonth'),
      orders: timeStats.month?.orders || 0,
      revenue: timeStats.month?.revenue || 0
    },
    {
      key: 'quarter',
      period: t('dashboard.thisQuarter'),
      orders: timeStats.quarter?.orders || 0,
      revenue: timeStats.quarter?.revenue || 0
    },
    {
      key: 'year',
      period: t('dashboard.thisYear'),
      orders: timeStats.year?.orders || 0,
      revenue: timeStats.year?.revenue || 0
    }
  ]

  if (isLoading) {
    console.log('⏳ Dashboard is loading...')
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  console.log('🎯 Dashboard rendered with data:', { stats, timeStats })

  return (
    <div className='dashboard'>
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>{t('dashboard.title')} </h1>
            <p>{t('dashboard.subtitle')}</p>

          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => fetchDashboardData()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              {t('common.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Today Overview */}
      <div className="quick-stats-section">
        <h2>📊 {t('dashboard.todayOverview')}</h2>
        <div className="quick-stats-grid">
          <div className="quick-stat-card today-orders">
            <div className="quick-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">{timeStats.today?.orders || 0}</div>
              <div className="quick-stat-label">{t('dashboard.ordersToday')}</div>
            </div>
          </div>

          <div className="quick-stat-card today-revenue">
            <div className="quick-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">{formatCurrency(timeStats.today?.revenue || 0)}</div>
              <div className="quick-stat-label">{t('dashboard.revenueToday')}</div>
            </div>
          </div>

          <div className="quick-stat-card top-product">
            <div className="quick-stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.3.3.6.8.9 1.3z"></path>
              </svg>
            </div>
            <div className="quick-stat-content">
              {topProducts.length > 0 ? (
                <>
                  <div className="quick-stat-value top-product-name">{topProducts[0].name}</div>
                  <div className="quick-stat-label">{topProducts[0].totalSold} {t('dashboard.sold')}</div>
                  {topProducts.length > 1 && (
                    <div className="top-products-extra">
                      {topProducts.slice(1).map((p, i) => (
                        <div key={i} className="extra-product">
                          <span>{p.name}</span>
                          <span>×{p.totalSold}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="quick-stat-value">—</div>
                  <div className="quick-stat-label">{t('dashboard.topProduct')}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time-based Stats */}
      <div className="time-stats-section">
        <div className="time-stats-header">
          <div>
            <h2>{t('dashboard.timeStats')}</h2>
            <p>{t('dashboard.timeStatsDescription')}</p>
          </div>
          <div className="time-filters-row">
            <div className="time-filter-group">
              <label>{t('dashboard.timeRange')}</label>
              <select
                value={chartFilters.days}
                onChange={(e) => setChartFilters(prev => ({ ...prev, days: Number(e.target.value) }))}
              >
                <option value={7}>7 {t('dashboard.day')}</option>
                <option value={30}>30 {t('dashboard.day')}</option>
                <option value={90}>90 {t('dashboard.day')}</option>
                <option value={365}>365 {t('dashboard.day')}</option>
              </select>
            </div>
            <div className="time-filter-group">
              <label>{t('dashboard.granularity')}</label>
              <select
                value={chartFilters.granularity}
                onChange={(e) => setChartFilters(prev => ({ ...prev, granularity: e.target.value }))}
              >
                <option value="day">{t('dashboard.day')}</option>
                <option value="week">{t('dashboard.week')}</option>
                <option value="month">{t('dashboard.month')}</option>
              </select>
            </div>
            <div className="time-filter-group">
              <label>{t('dashboard.metric')}</label>
              <select
                value={chartFilters.metric}
                onChange={(e) => setChartFilters(prev => ({ ...prev, metric: e.target.value }))}
              >
                <option value="revenue">{t('dashboard.revenue')}</option>
                <option value="totalOrders">{t('dashboard.totalOrders')}</option>
              </select>
            </div>
            <div className="time-filter-group">
              <label>{t('dashboard.chartType')}</label>
              <select
                value={chartFilters.chartType}
                onChange={(e) => setChartFilters(prev => ({ ...prev, chartType: e.target.value }))}
              >
                <option value="line">{t('dashboard.lineChart')}</option>
                <option value="bar">{t('dashboard.barChart')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="time-stats-content">
          <div className="time-stats-chart-card">
            {isTimeBasedLoading ? (
              <div className="time-based-loading">
                <div className="loading-spinner"></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : timeBasedError ? (
              <div className="time-based-error">
                <p>{timeBasedError}</p>
              </div>
            ) : dynamicChartData.length === 0 ? (
              <div className="time-based-error">
                <p>{t('dashboard.noDataForTimeRange')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart
                  data={dynamicChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      chartFilters.metric === 'revenue'
                        ? `${Math.round(value / 1000)}k`
                        : value
                    }
                  />
                  <Tooltip
                    formatter={(value) => {
                      if (chartFilters.metric === 'revenue') {
                        return [formatCurrency(value), t('dashboard.revenue')]
                      }
                      return [value, t('dashboard.orders')]
                    }}
                    labelFormatter={(label) => label}
                  />
                  <Legend />
                  {chartFilters.chartType === 'bar' && (
                    <Bar
                      dataKey="value"
                      name={
                        chartFilters.metric === 'revenue'
                          ? t('dashboard.revenue')
                          : t('dashboard.totalOrders')
                      }
                      barSize={28}
                      radius={[6, 6, 0, 0]}
                      fill="#3b82f6"
                    />
                  )}
                  {chartFilters.chartType === 'line' && (
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={
                        chartFilters.metric === 'revenue'
                          ? t('dashboard.revenue')
                          : t('dashboard.totalOrders')
                      }
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {/* Comparison table: so sánh các giai đoạn liên tiếp */}
            {comparisonRows.length > 0 && (
              <div className="time-comparison-section">
                <button
                  className="toggle-comparison-btn"
                  onClick={() => setShowComparisonTable(!showComparisonTable)}
                >
                  {showComparisonTable ? t('dashboard.hideDetailedComparison') : t('dashboard.showDetailedComparison')}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: showComparisonTable ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {showComparisonTable && (
                  <div className="time-comparison-table-wrapper">
                    <table className="time-comparison-table">
                      <thead>
                        <tr>
                          <th>{t('dashboard.timeRange')}</th>
                          <th>
                            {chartFilters.metric === 'revenue'
                              ? t('dashboard.revenue')
                              : t('dashboard.totalOrders')}
                          </th>
                          <th>{t('dashboard.trendFromLastMonth')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map((row, index) => (
                          <tr key={row.label || index}>
                            <td>{row.label}</td>
                            <td>
                              {chartFilters.metric === 'revenue'
                                ? formatCurrency(row.value)
                                : (row.value || 0).toLocaleString()}
                            </td>
                            <td className={
                              row.diff > 0 ? 'trend-positive' :
                                row.diff < 0 ? 'trend-negative' : 'trend-neutral'
                            }>
                              {index === 0
                                ? t('dashboard.trendNoChange') || '—'
                                : `${row.diff > 0 ? '+' : ''}${chartFilters.metric === 'revenue'
                                  ? formatCurrency(row.diff)
                                  : row.diff.toLocaleString()
                                } (${row.diffPercent > 0 ? '+' : ''}${row.diffPercent}%)`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            <div className="time-stats-side-cards">
              <div className="time-stat-card">
                <h3>{t('dashboard.today')}</h3>
                <div className="time-stat-content">
                  <div className="stat-item">
                    <span className="stat-label">{t('dashboard.orders')}:</span>
                    <span className="stat-value">{timeStats.today?.orders || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t('dashboard.revenue')}:</span>
                    <span className="stat-value">{formatCurrency(timeStats.today?.revenue || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="time-stat-card">
                <h3>{t('dashboard.thisMonth')}</h3>
                <div className="time-stat-content">
                  <div className="stat-item">
                    <span className="stat-label">{t('dashboard.orders')}:</span>
                    <span className="stat-value">{timeStats.month?.orders || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t('dashboard.revenue')}:</span>
                    <span className="stat-value">{formatCurrency(timeStats.month?.revenue || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="time-stat-card">
                <h3>{t('dashboard.thisYear')}</h3>
                <div className="time-stat-content">
                  <div className="stat-item">
                    <span className="stat-label">{t('dashboard.orders')}:</span>
                    <span className="stat-value">{timeStats.year?.orders || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t('dashboard.revenue')}:</span>
                    <span className="stat-value">{formatCurrency(timeStats.year?.revenue || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>{t('dashboard.quickActions')}</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.location.href = '/admin/orders'}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <div>
              <strong>{t('dashboard.viewAllOrders')}</strong>
              <small>{t('dashboard.viewAllOrdersDesc')}</small>
            </div>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/admin/products'}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <div>
              <strong>{t('dashboard.manageProducts')}</strong>
              <small>{t('dashboard.manageProductsDesc')}</small>
            </div>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/admin/users'}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <strong>{t('dashboard.userManagement')}</strong>
              <small>{t('dashboard.userManagementDesc')}</small>
            </div>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/admin/categories'}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <strong>{t('dashboard.categories')}</strong>
              <small>{t('dashboard.categoriesDesc')}</small>
            </div>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/admin/blog'}>
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div>
              <strong>{t('dashboard.blogManagement')}</strong>
              <small>{t('dashboard.blogManagementDesc')}</small>
            </div>
          </button>


        </div>
      </div>
    </div>
  )
}

export default Dashboard 
