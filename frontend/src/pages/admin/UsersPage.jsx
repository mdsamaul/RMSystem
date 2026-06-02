import React, { useState, useEffect } from 'react'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'

const STAFF_PERMISSIONS = [
  { key: 'MENU_CREATE', label: 'Create menu' },
  { key: 'MENU_UPDATE', label: 'Update/menu price' },
  { key: 'MENU_AVAILABILITY', label: 'Availability' },
  { key: 'MENU_DELETE', label: 'Delete menu' },
]

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingPerms, setSavingPerms] = useState({})

  const load = () => userAPI.getAll().then(r=>setUsers(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false))
  useEffect(()=>{ load() },[])

  const toggle = async (id) => {
    try { await userAPI.toggleStatus(id); toast.success('User status updated'); load() }
    catch { toast.error('Failed') }
  }

  const changePermission = async (user, permission, checked) => {
    const current = new Set(user.permissions || [])
    if (checked) current.add(permission)
    else current.delete(permission)
    const permissions = Array.from(current)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, permissions } : u))
    setSavingPerms(prev => ({ ...prev, [user.id]: true }))
    try {
      await userAPI.updatePermissions(user.id, permissions)
      toast.success('Permissions updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Permission update failed')
      load()
    } finally {
      setSavingPerms(prev => ({ ...prev, [user.id]: false }))
    }
  }

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="page-header"><h1>👥 Users</h1><p>Manage all registered users</p></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Permissions</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div className="avatar" style={{background:u.role==='ADMIN'?'#ef4444':u.role==='STAFF'?'#f59e0b':'#10b981',color:'#fff',fontSize:'13px'}}>
                        {u.fullName?.[0]?.toUpperCase()}
                      </div>
                      <span style={{fontWeight:600}}>{u.fullName}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--text-muted)'}}>{u.email}</td>
                  <td>{u.phone||'—'}</td>
                  <td><span className={`role-chip role-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                  <td>
                    {u.role === 'STAFF' ? (
                      <div style={{display:'grid',gap:'6px',minWidth:'170px'}}>
                        {STAFF_PERMISSIONS.map(p => (
                          <label key={p.key} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'var(--text)',cursor:'pointer'}}>
                            <input
                              type="checkbox"
                              checked={(u.permissions || []).includes(p.key)}
                              disabled={savingPerms[u.id]}
                              onChange={e=>changePermission(u, p.key, e.target.checked)}
                            />
                            <span>{p.label}</span>
                          </label>
                        ))}
                        {savingPerms[u.id] && <span style={{fontSize:'11px',color:'var(--text-muted)'}}>Saving...</span>}
                      </div>
                    ) : (
                      <span style={{fontSize:'12px',color:'var(--text-muted)'}}>{u.role === 'ADMIN' ? 'Full access' : 'No staff permissions'}</span>
                    )}
                  </td>
                  <td><span className={`badge ${u.isActive?'badge-success':'badge-danger'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                  <td style={{fontSize:'12px',color:'var(--text-muted)'}}>{u.createdAt?new Date(u.createdAt).toLocaleDateString():'—'}</td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive?'btn-danger':'btn-success'}`} onClick={()=>toggle(u.id)}>
                      {u.isActive?'🔒 Disable':'🔓 Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
