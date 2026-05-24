import React, { useState, useEffect } from 'react'
import { reservationAPI, tableAPI } from '../../services/api'
import toast from 'react-hot-toast'

const SC = { PENDING:'badge-warning',CONFIRMED:'badge-info',SEATED:'badge-purple',COMPLETED:'badge-success',CANCELLED:'badge-danger' }

export default function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ tableId:'', partySize:2, reservedAt:'', notes:'' })
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([reservationAPI.getMy(), tableAPI.getAvailable()])
      .then(([r,t])=>{ setReservations(r.data.data||[]); setTables(t.data.data||[]) })
      .catch(()=>toast.error('Failed')).finally(()=>setLoading(false))
  }
  useEffect(()=>{ load() },[])

  const create = async () => {
    if (!form.tableId||!form.reservedAt) { toast.error('Please fill required fields'); return }
    try {
      await reservationAPI.create({ ...form, tableId:parseInt(form.tableId), partySize:parseInt(form.partySize) })
      toast.success('Reservation created! 🎉'); setShowModal(false); load()
      setForm({ tableId:'', partySize:2, reservedAt:'', notes:'' })
    } catch(e) { toast.error(e.response?.data?.message||'Reservation failed') }
  }

  const cancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return
    try { await reservationAPI.cancel(id); toast.success('Cancelled'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="flex-between page-header">
        <div><h1>📅 My Reservations</h1><p>Manage your table bookings</p></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ New Reservation</button>
      </div>

      {reservations.length===0
        ? <div className="card"><div className="empty-state"><div className="icon">📅</div><h3>No reservations</h3><p>Book a table for your next visit!</p></div></div>
        : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px'}}>
            {reservations.map(r=>(
              <div key={r.id} className="card" style={{padding:'20px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div style={{fontWeight:700,fontSize:'16px'}}>🪑 Table {r.tableNumber}</div>
                  <span className={`badge ${SC[r.status]}`}>{r.status}</span>
                </div>
                <div style={{fontSize:'14px',display:'flex',flexDirection:'column',gap:'6px',color:'var(--text-muted)'}}>
                  <div>👥 Party of {r.partySize}</div>
                  <div>📅 {r.reservedAt?new Date(r.reservedAt).toLocaleString():'—'}</div>
                  {r.notes && <div>📝 {r.notes}</div>}
                </div>
                {(r.status==='PENDING'||r.status==='CONFIRMED') && (
                  <button className="btn btn-danger btn-sm" style={{marginTop:'14px'}} onClick={()=>cancel(r.id)}>
                    ❌ Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
      }

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" style={{maxWidth:'420px'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 New Reservation</h3>
              <button className="btn btn-secondary btn-sm" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Table *</label>
                <select className="form-select" value={form.tableId} onChange={e=>setForm({...form,tableId:e.target.value})}>
                  <option value="">Choose a table...</option>
                  {tables.map(t=><option key={t.id} value={t.id}>Table {t.tableNumber} — {t.capacity} seats ({t.section||'No section'})</option>)}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Party Size *</label>
                  <input className="form-input" type="number" min="1" max="50" value={form.partySize} onChange={e=>setForm({...form,partySize:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input className="form-input" type="datetime-local" value={form.reservedAt} onChange={e=>setForm({...form,reservedAt:e.target.value})}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Birthday, anniversary, special requests..."/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={create}>✅ Confirm Reservation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
