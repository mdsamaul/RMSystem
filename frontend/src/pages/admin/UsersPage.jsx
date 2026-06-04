import React, { useState, useEffect } from 'react'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => userAPI.getAll().then(r=>setUsers(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false))
  useEffect(()=>{ load() },[])

  const toggle = async (id) => {
    try { await userAPI.toggleStatus(id); toast.success('User status updated'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="page-header"><h1>👥 Users</h1><p>Manage all registered users</p></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
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
