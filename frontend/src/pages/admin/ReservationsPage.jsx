import React, { useState, useEffect } from 'react'
import { reservationAPI } from '../../services/api'
import toast from 'react-hot-toast'

const SC = { PENDING:'badge-warning', CONFIRMED:'badge-info', SEATED:'badge-purple', COMPLETED:'badge-success', CANCELLED:'badge-danger' }

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => reservationAPI.getAll().then(r=>setReservations(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false))
  useEffect(()=>{ load() },[])

  const updateStatus = async (id, status) => {
    try { await reservationAPI.updateStatus(id,status); toast.success(`Status → ${status}`); load() }
    catch { toast.error('Update failed') }
  }

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="flex-between page-header">
        <div><h1>📅 Reservations</h1><p>Manage table reservations</p></div>
        <button className="btn btn-secondary" onClick={load}>🔄 Refresh</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Customer</th><th>Table</th><th>Party</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {reservations.length===0
                ? <tr><td colSpan={7}><div className="empty-state"><div className="icon">📅</div><p>No reservations</p></div></td></tr>
                : reservations.map(r=>(
                  <tr key={r.id}>
                    <td><strong style={{color:'var(--primary)'}}>#RES-{r.id}</strong></td>
                    <td><div style={{fontWeight:600}}>{r.customerName}</div><div style={{fontSize:'12px',color:'var(--text-muted)'}}>{r.notes}</div></td>
                    <td>🪑 {r.tableNumber}</td>
                    <td><span className="badge badge-gray">👥 {r.partySize}</span></td>
                    <td style={{fontSize:'13px'}}>{r.reservedAt ? new Date(r.reservedAt).toLocaleString() : '—'}</td>
                    <td><span className={`badge ${SC[r.status]}`}>{r.status}</span></td>
                    <td>
                      <select onChange={e=>updateStatus(r.id,e.target.value)} value={r.status}
                        style={{padding:'5px 8px',borderRadius:'6px',border:'1px solid var(--border)',fontSize:'12px'}}>
                        {['PENDING','CONFIRMED','SEATED','COMPLETED','CANCELLED'].map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
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
