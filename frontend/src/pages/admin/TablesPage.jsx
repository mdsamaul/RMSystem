import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { tableAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']
const STATUS_COLORS = {
  AVAILABLE: 'badge-success',
  OCCUPIED: 'badge-danger',
  RESERVED: 'badge-info',
  MAINTENANCE: 'badge-warning',
}
const STATUS_ICONS = {
  AVAILABLE: '🟢',
  OCCUPIED: '🔴',
  RESERVED: '🔵',
  MAINTENANCE: '🟡',
}

export default function TablesPage() {
  const { isAdmin, hasPermission } = useAuth()
  const [tables, setTables] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTable, setEditTable] = useState(null)
  const [form, setForm] = useState({ tableNumber: '', capacity: 4, section: '' })
  const [loading, setLoading] = useState(true)

  const canCreateTable = isAdmin || hasPermission('TABLE_CREATE')
  const canUpdateTable = isAdmin || hasPermission('TABLE_UPDATE')
  const canUpdateTableStatus = isAdmin || hasPermission('TABLE_STATUS')
  const canDeleteTable = isAdmin || hasPermission('TABLE_DELETE')
  const canManageTables = canUpdateTable || canUpdateTableStatus || canDeleteTable

  const load = () => {
    tableAPI.getAll()
      .then(r => setTables(r.data.data || []))
      .catch(() => toast.error('Failed to load tables'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    if (!canCreateTable) return
    setEditTable(null)
    setForm({ tableNumber: '', capacity: 4, section: '' })
    setShowModal(true)
  }

  const openEdit = (table) => {
    if (!canUpdateTable) return
    setEditTable(table)
    setForm({ tableNumber: table.tableNumber, capacity: table.capacity, section: table.section || '' })
    setShowModal(true)
  }

  const save = async () => {
    if (editTable && !canUpdateTable) return
    if (!editTable && !canCreateTable) return

    try {
      if (editTable) await tableAPI.update(editTable.id, form)
      else await tableAPI.create(form)
      toast.success(editTable ? 'Table updated' : 'Table created')
      setShowModal(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving table')
    }
  }

  const updateStatus = async (id, status) => {
    if (!canUpdateTableStatus) return
    try {
      await tableAPI.updateStatus(id, status)
      toast.success(`Status updated to ${status}`)
      load()
    } catch {
      toast.error('Update failed')
    }
  }

  const deleteTable = async (id) => {
    if (!canDeleteTable) return
    if (!confirm('Delete this table?')) return

    try {
      await tableAPI.delete(id)
      toast.success('Table deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const summary = STATUSES.map(status => ({
    status,
    count: tables.filter(table => table.status === status).length,
  }))

  if (loading) {
    return <div className="page-content"><div className="loading-page"><div className="spinner" /></div></div>
  }

  return (
    <div className="page-content">
      <div className="flex-between page-header">
        <div>
          <h1>🪑 Tables</h1>
          <p>Manage restaurant table layout and status</p>
        </div>
        {canCreateTable && (
          <button className="btn btn-primary" onClick={openNew}>+ Add Table</button>
        )}
      </div>

      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:'24px'}}>
        {summary.map(item => (
          <div className="stat-card" key={item.status} style={{padding:'16px',gap:'12px'}}>
            <div style={{fontSize:'28px'}}>{STATUS_ICONS[item.status]}</div>
            <div>
              <div style={{fontSize:'22px',fontWeight:800}}>{item.count}</div>
              <div style={{fontSize:'12px',color:'var(--text-muted)',fontWeight:600}}>{item.status}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'16px'}}>
        {tables.length === 0 ? (
          <div className="empty-state" style={{gridColumn:'1/-1'}}>
            <div className="icon">🪑</div>
            <h3>No tables yet</h3>
            <p>{canCreateTable ? 'Add your first table' : 'No tables configured'}</p>
          </div>
        ) : tables.map(table => (
          <div key={table.id} className="card" style={{padding:'20px',position:'relative',borderTop:`4px solid ${table.status==='AVAILABLE'?'#10b981':table.status==='OCCUPIED'?'#ef4444':table.status==='RESERVED'?'#3b82f6':'#f59e0b'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
              <div>
                <div style={{fontSize:'20px',fontWeight:800}}>Table {table.tableNumber}</div>
                <div style={{fontSize:'13px',color:'var(--text-muted)'}}>{table.section || 'No section'}</div>
              </div>
              <span className={`badge ${STATUS_COLORS[table.status]}`}>{table.status}</span>
            </div>

            <div style={{fontSize:'14px',marginBottom:'14px'}}>
              <span style={{background:'var(--bg)',padding:'4px 10px',borderRadius:'6px',fontWeight:600}}>
                👥 {table.capacity} seats
              </span>
            </div>

            {canManageTables && (
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {canUpdateTableStatus && (
                  <select
                    onChange={event => updateStatus(table.id, event.target.value)}
                    value={table.status}
                    style={{flex:1,padding:'5px 8px',borderRadius:'6px',border:'1px solid var(--border)',fontSize:'12px',background:'var(--bg)'}}
                  >
                    {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                )}
                {canUpdateTable && (
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(table)} title="Edit table">
                    ✏️
                  </button>
                )}
                {canDeleteTable && (
                  <button className="btn btn-danger btn-sm" onClick={() => deleteTable(table.id)} title="Delete table">
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{maxWidth:'400px'}} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{editTable ? 'Edit Table' : 'Add Table'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>x</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Table Number *</label>
                <input
                  className="form-input"
                  value={form.tableNumber}
                  onChange={event => setForm({...form, tableNumber: event.target.value})}
                  placeholder="e.g. T-01"
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="50"
                    value={form.capacity}
                    onChange={event => setForm({...form, capacity: parseInt(event.target.value) || 1})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    className="form-input"
                    value={form.section}
                    onChange={event => setForm({...form, section: event.target.value})}
                    placeholder="e.g. Ground Floor"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
