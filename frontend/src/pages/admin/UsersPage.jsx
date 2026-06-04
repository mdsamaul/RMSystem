import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { userAPI } from '../../services/api'

const STAFF_PERMISSIONS = [
  { key: 'MENU_CREATE', label: 'Create menu' },
  { key: 'MENU_UPDATE', label: 'Update/menu price' },
  { key: 'MENU_AVAILABILITY', label: 'Availability' },
  { key: 'MENU_DELETE', label: 'Delete menu' },
]

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  isActive: true,
  permissions: [],
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = () => {
    setLoading(true)
    userAPI.getAll()
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openStaffDialog = (user) => {
    setEditingUser(user)
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      isActive: Boolean(user.isActive),
      permissions: [...(user.permissions || [])],
    })
  }

  const closeDialog = () => {
    if (saving) return
    setEditingUser(null)
    setForm(emptyForm)
  }

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const updatePermission = (permission, checked) => {
    setForm(prev => {
      const permissions = new Set(prev.permissions)
      if (checked) permissions.add(permission)
      else permissions.delete(permission)
      return { ...prev, permissions: Array.from(permissions) }
    })
  }

  const saveStaff = async (event) => {
    event.preventDefault()
    if (!editingUser) return

    setSaving(true)
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        isActive: form.isActive,
        permissions: form.permissions,
      }
      if (form.password.trim()) payload.password = form.password.trim()

      const res = await userAPI.updateStaff(editingUser.id, payload)
      setUsers(prev => prev.map(user => user.id === editingUser.id ? res.data.data : user))
      toast.success('Staff updated')
      closeDialog()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Staff update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="page-content"><div className="loading-page"><div className="spinner" /></div></div>
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage all registered users</p>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isStaff = user.role === 'STAFF'

                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div className="avatar" style={{background:user.role==='ADMIN'?'#ef4444':isStaff?'#f59e0b':'#10b981',color:'#fff',fontSize:'13px'}}>
                          {user.fullName?.[0]?.toUpperCase()}
                        </div>
                        <span style={{fontWeight:600}}>{user.fullName}</span>
                      </div>
                    </td>
                    <td style={{color:'var(--text-muted)'}}>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td><span className={`role-chip role-${user.role?.toLowerCase()}`}>{user.role}</span></td>
                    <td>
                      {isStaff ? (
                        <span style={{fontSize:'12px',color:'var(--text-muted)'}}>
                          {(user.permissions || []).length ? `${user.permissions.length} permissions` : 'No permissions'}
                        </span>
                      ) : (
                        <span style={{fontSize:'12px',color:'var(--text-muted)'}}>
                          {user.role === 'ADMIN' ? 'Full access' : 'No staff permissions'}
                        </span>
                      )}
                    </td>
                    <td><span className={`badge ${user.isActive?'badge-success':'badge-danger'}`}>{user.isActive?'Active':'Inactive'}</span></td>
                    <td style={{fontSize:'12px',color:'var(--text-muted)'}}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      {isStaff ? (
                        <button className="btn btn-sm btn-secondary" onClick={() => openStaffDialog(user)}>
                          Edit
                        </button>
                      ) : (
                        <span style={{fontSize:'12px',color:'var(--text-light)'}}>Admin only</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay" onMouseDown={closeDialog}>
          <form className="modal" onSubmit={saveStaff} onMouseDown={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Staff</h3>
              <button type="button" className="btn btn-icon btn-secondary" onClick={closeDialog} aria-label="Close">
                x
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input
                    className="form-input"
                    value={form.fullName}
                    onChange={event => updateField('fullName', event.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={event => updateField('email', event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={form.phone}
                    onChange={event => updateField('phone', event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={form.password}
                    onChange={event => updateField('password', event.target.value)}
                    minLength={6}
                    placeholder="Leave blank to keep old password"
                  />
                </div>
              </div>

              <label style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'18px',fontSize:'13px',fontWeight:600}}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={event => updateField('isActive', event.target.checked)}
                />
                Active staff account
              </label>

              <div className="divider" />

              <div className="form-group">
                <label className="form-label">Staff permissions</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2, minmax(180px, 1fr))',gap:'10px'}}>
                  {STAFF_PERMISSIONS.map(permission => (
                    <label key={permission.key} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',cursor:'pointer'}}>
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(permission.key)}
                        onChange={event => updatePermission(permission.key, event.target.checked)}
                      />
                      <span>{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeDialog} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save staff'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
