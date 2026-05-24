import React, { useState, useEffect } from 'react'
import { reportAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#e85d04','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899']

export default function ReportsPage() {
  const [revenue, setRevenue] = useState(null)
  const [topItems, setTopItems] = useState([])
  const [occupancy, setOccupancy] = useState(null)
  const [start, setStart] = useState(new Date(Date.now()-30*86400000).toISOString().slice(0,16))
  const [end, setEnd] = useState(new Date().toISOString().slice(0,16))
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [r, t, o] = await Promise.all([
        reportAPI.getRevenue(start, end),
        reportAPI.getTopItems(),
        reportAPI.getOccupancy()
      ])
      setRevenue(r.data.data); setTopItems(t.data.data||[]); setOccupancy(o.data.data)
    } catch { toast.error('Failed to load reports') } finally { setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  const pieData = occupancy ? [
    { name:'Available', value:occupancy.available },
    { name:'Occupied', value:occupancy.occupied },
    { name:'Reserved', value:occupancy.reserved },
  ].filter(d=>d.value>0) : []

  return (
    <div className="page-content">
      <div className="flex-between page-header">
        <div><h1>📈 Reports & Analytics</h1><p>Track revenue and performance</p></div>
      </div>

      <div className="card" style={{marginBottom:'24px',padding:'20px'}}>
        <div style={{display:'flex',gap:'12px',alignItems:'flex-end',flexWrap:'wrap'}}>
          <div className="form-group" style={{margin:0}}>
            <label className="form-label">Start Date</label>
            <input className="form-input" type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} style={{width:'200px'}}/>
          </div>
          <div className="form-group" style={{margin:0}}>
            <label className="form-label">End Date</label>
            <input className="form-input" type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} style={{width:'200px'}}/>
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading}>🔍 Generate Report</button>
        </div>
      </div>

      {loading ? <div className="loading-page"><div className="spinner"/></div> : (
        <>
          {/* Revenue KPI */}
          <div className="stats-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',marginBottom:'24px'}}>
            <div className="stat-card">
              <div className="stat-icon" style={{background:'#fff3eb'}}><span style={{fontSize:'28px'}}>💰</span></div>
              <div className="stat-info">
                <h3 style={{color:'var(--primary)'}}>৳{parseFloat(revenue?.totalRevenue||0).toFixed(0)}</h3>
                <p>Total Revenue</p>
                <div className="stat-change up">Closed orders only</div>
              </div>
            </div>
            {occupancy && <>
              <div className="stat-card">
                <div className="stat-icon" style={{background:'#ecfdf5'}}><span style={{fontSize:'28px'}}>✅</span></div>
                <div className="stat-info"><h3 style={{color:'#10b981'}}>{occupancy.available}</h3><p>Available Tables</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background:'#fef2f2'}}><span style={{fontSize:'28px'}}>🔴</span></div>
                <div className="stat-info"><h3 style={{color:'#ef4444'}}>{occupancy.occupied}</h3><p>Occupied Tables</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background:'#eff6ff'}}><span style={{fontSize:'28px'}}>📊</span></div>
                <div className="stat-info"><h3 style={{color:'#3b82f6'}}>{occupancy.occupancyRate}</h3><p>Occupancy Rate</p></div>
              </div>
            </>}
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header"><h2>🏆 Top Selling Items</h2></div>
              <div className="card-body" style={{padding:'16px'}}>
                {topItems.length===0
                  ? <div className="empty-state"><div className="icon">📊</div><p>No sales data</p></div>
                  : <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={topItems} layout="vertical" margin={{left:80,right:20}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis type="number" tick={{fontSize:12}}/>
                        <YAxis type="category" dataKey="itemName" tick={{fontSize:12}} width={80}/>
                        <Tooltip/>
                        <Bar dataKey="totalSold" fill="#e85d04" radius={[0,6,6,0]} name="Sold"/>
                      </BarChart>
                    </ResponsiveContainer>
                }
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h2>🪑 Table Occupancy</h2></div>
              <div className="card-body" style={{padding:'16px'}}>
                {pieData.length===0
                  ? <div className="empty-state"><div className="icon">🪑</div><p>No table data</p></div>
                  : <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value">
                          {pieData.map((_,i)=><Cell key={i} fill={['#10b981','#ef4444','#3b82f6'][i]}/>)}
                        </Pie>
                        <Tooltip/><Legend iconType="circle"/>
                      </PieChart>
                    </ResponsiveContainer>
                }
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
