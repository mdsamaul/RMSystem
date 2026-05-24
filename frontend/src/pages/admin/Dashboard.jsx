import React, { useState, useEffect } from 'react'
import { orderAPI, tableAPI, userAPI, reportAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#e85d04','#3b82f6','#10b981','#f59e0b','#8b5cf6']

export default function Dashboard() {
  const [stats, setStats] = useState({ orders:0, tables:0, users:0, revenue:0 })
  const [topItems, setTopItems] = useState([])
  const [occupancy, setOccupancy] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      orderAPI.getAll(),
      tableAPI.getAll(),
      userAPI.getAll(),
      reportAPI.getTopItems(),
      reportAPI.getOccupancy(),
    ]).then(([orders, tables, users, items, occ]) => {
      const allOrders = orders.data.data || []
      setStats({
        orders: allOrders.length,
        tables: (tables.data.data || []).length,
        users: (users.data.data || []).length,
        revenue: allOrders.filter(o=>o.status==='CLOSED').reduce((s,o)=>s+parseFloat(o.totalAmount||0),0)
      })
      setTopItems((items.data.data || []).slice(0,5))
      setOccupancy(occ.data.data)
      setRecentOrders(allOrders.slice(0,6))
    }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const statusBadge = s => {
    const map = { PENDING:'badge-warning', CONFIRMED:'badge-info', IN_PROGRESS:'badge-purple',
      READY:'badge-orange', SERVED:'badge-success', CLOSED:'badge-gray', CANCELLED:'badge-danger' }
    return <span className={`badge ${map[s]||'badge-gray'}`}>{s}</span>
  }

  const pieData = occupancy ? [
    { name: 'Available', value: occupancy.available },
    { name: 'Occupied', value: occupancy.occupied },
    { name: 'Reserved', value: occupancy.reserved },
  ] : []

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        {[
          { icon:'📋', label:'Total Orders', val:stats.orders, color:'#fff3eb', iconBg:'#e85d04', change:'+12% this week' },
          { icon:'🪑', label:'Total Tables', val:stats.tables, color:'#eff6ff', iconBg:'#3b82f6', change:'All configured' },
          { icon:'👥', label:'Registered Users', val:stats.users, color:'#ecfdf5', iconBg:'#10b981', change:'+3 today' },
          { icon:'💰', label:'Total Revenue', val:`৳${stats.revenue.toFixed(0)}`, color:'#fffbeb', iconBg:'#f59e0b', change:'Closed orders' },
        ].map((s,i)=>(
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{background:s.color}}>
              <span style={{fontSize:'26px'}}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <h3 style={{color:s.iconBg}}>{s.val}</h3>
              <p>{s.label}</p>
              <div className="stat-change up">↑ {s.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Top Selling Items */}
        <div className="card">
          <div className="card-header"><h2>🏆 Top Selling Items</h2></div>
          <div className="card-body" style={{padding:'16px'}}>
            {topItems.length === 0
              ? <div className="empty-state"><div className="icon">📊</div><p>No data yet</p></div>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topItems} margin={{top:5,right:10,left:-20,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="itemName" tick={{fontSize:12}} interval={0} angle={-20} textAnchor="end" height={50}/>
                    <YAxis tick={{fontSize:12}}/>
                    <Tooltip/>
                    <Bar dataKey="totalSold" fill="#e85d04" radius={[6,6,0,0]} name="Sold"/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="card">
          <div className="card-header"><h2>🪑 Table Occupancy</h2></div>
          <div className="card-body" style={{padding:'16px'}}>
            {occupancy && (
              <>
                <div style={{display:'flex',gap:'12px',marginBottom:'16px',flexWrap:'wrap'}}>
                  {[
                    {label:'Total',val:occupancy.total,color:'#6b7280'},
                    {label:'Available',val:occupancy.available,color:'#10b981'},
                    {label:'Occupied',val:occupancy.occupied,color:'#e85d04'},
                    {label:'Reserved',val:occupancy.reserved,color:'#3b82f6'},
                  ].map((t,i)=>(
                    <div key={i} style={{flex:1,minWidth:'70px',textAlign:'center',padding:'10px',borderRadius:'8px',background:'#f8f9fc'}}>
                      <div style={{fontSize:'22px',fontWeight:800,color:t.color}}>{t.val}</div>
                      <div style={{fontSize:'11px',color:'var(--text-muted)',fontWeight:600}}>{t.label}</div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                    </Pie>
                    <Tooltip/><Legend iconType="circle" iconSize={10}/>
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card mt-4">
        <div className="card-header">
          <h2>🕐 Recent Orders</h2>
          <a href="/admin/orders" className="btn btn-secondary btn-sm">View All →</a>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Table</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {recentOrders.length === 0
                ? <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-muted)',padding:'40px'}}>No orders yet</td></tr>
                : recentOrders.map(o=>(
                  <tr key={o.id}>
                    <td><strong>#ORD-{o.id}</strong></td>
                    <td>{o.customerName || 'Walk-in'}</td>
                    <td>{o.tableNumber ? `🪑 ${o.tableNumber}` : '—'}</td>
                    <td><span className="price">৳{parseFloat(o.totalAmount||0).toFixed(0)}</span></td>
                    <td>{statusBadge(o.status)}</td>
                    <td style={{color:'var(--text-muted)',fontSize:'13px'}}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—'}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
