import React, { useState, useEffect } from 'react'
import { tableAPI } from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = { AVAILABLE:'badge-success', OCCUPIED:'badge-danger', RESERVED:'badge-info', MAINTENANCE:'badge-warning' }
const STATUS_ICONS  = { AVAILABLE:'🟢', OCCUPIED:'🔴', RESERVED:'🔵', MAINTENANCE:'🟡' }

export default function TablesPage() {
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTable, setEditTable] = useState(null)
  const [form, setForm] = useState({ tableNumber:'', capacity:4, section:'' })
  const [loading, setLoading] = useState(true)

  const load = () => tableAPI.getAll().then(r=>setTables(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false))
  useEffect(()=>{ load() },[])

  const openNew = () => { setEditTable(null); setForm({ tableNumber:'', capacity:4, section:'' }); setShowModal(true) }
  const openEdit = (t) => { setEditTable(t); setForm({ tableNumber:t.tableNumber, capacity:t.capacity, section:t.section||'' }); setShowModal(true) }

  const save = async () => {
    try {
      if (editTable) await tableAPI.update(editTable.id, form)
      else await tableAPI.create(form)
      toast.success(editTable?'Updated!':'Table created!'); setShowModal(false); load()
    } catch(e) { toast.error(e.response?.data?.message||'Error') }
  }

  const updateStatus = async (id, status) => {
    try { await tableAPI.updateStatus(id, status); toast.success(`Status → ${status}`); load() }
    catch { toast.error('Update failed') }
  }

  const deleteTable = async (id) => {
    if (!confirm('Delete this table?')) return
    try { await tableAPI.delete(id); toast.success('Deleted!'); load() }
    catch { toast.error('Delete failed') }
  }

  const summary = ['AVAILABLE','OCCUPIED','RESERVED','MAINTENANCE'].map(s=>({
    status:s, count:tables.filter(t=>t.status===s).length
  }))

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="flex-between page-header">
        <div><h1>🪑 Tables</h1><p>Manage restaurant table layout and status</p></div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Table</button>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:'24px'}}>
        {summary.map(s=>(
          <div className="stat-card" key={s.status} style={{padding:'16px',gap:'12px'}}>
            <div style={{fontSize:'28px'}}>{STATUS_ICONS[s.status]}</div>
            <div><div style={{fontSize:'22px',fontWeight:800}}>{s.count}</div><div style={{fontSize:'12px',color:'var(--text-muted)',fontWeight:600}}>{s.status}</div></div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'16px'}}>
        {tables.length === 0
          ? <div className="empty-state" style={{gridColumn:'1/-1'}}><div className="icon">🪑</div><h3>No tables yet</h3><p>Add your first table</p></div>
          : tables.map(t=>(
            <div key={t.id} className="card" style={{padding:'20px',position:'relative',borderTop:`4px solid ${t.status==='AVAILABLE'?'#10b981':t.status==='OCCUPIED'?'#ef4444':t.status==='RESERVED'?'#3b82f6':'#f59e0b'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                <div>
                  <div style={{fontSize:'20px',fontWeight:800}}>Table {t.tableNumber}</div>
                  <div style={{fontSize:'13px',color:'var(--text-muted)'}}>{t.section||'No section'}</div>
                </div>
                <span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span>
              </div>
              <div style={{fontSize:'14px',marginBottom:'14px'}}>
                <span style={{background:'var(--bg)',padding:'4px 10px',borderRadius:'6px',fontWeight:600}}>
                  👥 {t.capacity} seats
                </span>
              </div>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                <select onChange={e=>updateStatus(t.id,e.target.value)} value={t.status}
                  style={{flex:1,padding:'5px 8px',borderRadius:'6px',border:'1px solid var(--border)',fontSize:'12px',background:'var(--bg)'}}>
                  {['AVAILABLE','OCCUPIED','RESERVED','MAINTENANCE'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(t)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={()=>deleteTable(t.id)}>🗑️</button>
              </div>
            </div>
          ))
        }
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" style={{maxWidth:'400px'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editTable?'✏️ Edit Table':'➕ Add Table'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Table Number *</label>
                <input className="form-input" value={form.tableNumber} onChange={e=>setForm({...form,tableNumber:e.target.value})} placeholder="e.g. T-01"/>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input className="form-input" type="number" min="1" max="50" value={form.capacity} onChange={e=>setForm({...form,capacity:parseInt(e.target.value)||1})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input className="form-input" value={form.section} onChange={e=>setForm({...form,section:e.target.value})} placeholder="e.g. Ground Floor"/>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
