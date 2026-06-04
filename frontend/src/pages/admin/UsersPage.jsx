import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { userAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STAFF_PERMISSIONS = [
  { group: 'Menu', key: 'MENU_CREATE', label: 'Create menu' },
  { group: 'Menu', key: 'MENU_UPDATE', label: 'Update/menu price' },
  { group: 'Menu', key: 'MENU_AVAILABILITY', label: 'Availability' },
  { group: 'Menu', key: 'MENU_DELETE', label: 'Delete menu' },
  { group: 'Tables', key: 'TABLE_CREATE', label: 'Create table' },
  { group: 'Tables', key: 'TABLE_UPDATE', label: 'Update table' },
  { group: 'Tables', key: 'TABLE_STATUS', label: 'Update table status' },
  { group: 'Tables', key: 'TABLE_DELETE', label: 'Delete table' },
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
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [dialogMode, setDialogMode] = useState(null)
  const [accountType, setAccountType] = useState('STAFF')
  const [form, setForm] = useState(emptyForm)

  const isCreateMode = dialogMode === 'create'
  const isStaffDialog = accountType === 'STAFF'
  const isCustomerDialog = accountType === 'CUSTOMER'

  const load = () => {
    setLoading(true)
    userAPI.getAll()
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreateDialog = (role) => {
    if (!isAdmin) return
    setDialogMode('create')
    setAccountType(role)
    setEditingUser(null)
    setForm(emptyForm)
  }

  const openEditDialog = (user) => {
    if (!isAdmin || user.role === 'ADMIN') return
    setDialogMode('edit')
    setAccountType(user.role)
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

  const closeDialog = (force = false) => {
    if (saving && !force) return
    setEditingUser(null)
    setDialogMode(null)
    setAccountType('STAFF')
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

  const payload = () => {
    const data = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      isActive: form.isActive,
    }
    if (form.password.trim()) data.password = form.password.trim()
    if (isStaffDialog) data.permissions = form.permissions
    return data
  }

  const saveUser = async (event) => {
    event.preventDefault()
    if (!isAdmin) return
    if (!isCreateMode && !editingUser) return

    setSaving(true)
    try {
      const data = payload()
      if (isCreateMode && !data.password) data.password = form.password.trim()

      let res
      if (isCreateMode && isStaffDialog) res = await userAPI.createStaff(data)
      if (isCreateMode && isCustomerDialog) res = await userAPI.createCustomer(data)
      if (!isCreateMode && isStaffDialog) res = await userAPI.updateStaff(editingUser.id, data)
      if (!isCreateMode && isCustomerDialog) res = await userAPI.updateCustomer(editingUser.id, data)

      setUsers(prev => {
        if (isCreateMode) return [...prev, res.data.data]
        return prev.map(user => user.id === editingUser.id ? res.data.data : user)
      })
      toast.success(`${isStaffDialog ? 'Staff' : 'Customer'} ${isCreateMode ? 'created' : 'updated'}`)
      closeDialog(true)
    } catch (e) {
      toast.error(e.response?.data?.message || 'User save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (user) => {
    if (!isAdmin || user.role === 'ADMIN') return
    try {
      await userAPI.toggleStatus(user.id)
      setUsers(prev => prev.map(item => item.id === user.id ? { ...item, isActive: !item.isActive } : item))
      toast.success(user.isActive ? 'User inactive now' : 'User active now')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Status update failed')
    }
  }

  if (loading) {
    return <div className="page-content"><div className="loading-page"><div className="spinner" /></div></div>
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Users</h1>
            <p>Manage all registered users</p>
          </div>
          {isAdmin && (
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
              <button className="btn btn-secondary" onClick={() => openCreateDialog('CUSTOMER')}>
                Customer Account
              </button>
              <button className="btn btn-primary" onClick={() => openCreateDialog('STAFF')}>
                Staff Account
              </button>
            </div>
          )}
        </div>
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
                const isCustomer = user.role === 'CUSTOMER'
                const canEdit = isAdmin && (isStaff || isCustomer)

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
                          {user.role === 'ADMIN' ? 'Full access' : 'Customer account'}
                        </span>
                      )}
                    </td>
                    <td><span className={`badge ${user.isActive?'badge-success':'badge-danger'}`}>{user.isActive?'Active':'Inactive'}</span></td>
                    <td style={{fontSize:'12px',color:'var(--text-muted)'}}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      {canEdit ? (
                        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                          <button className="btn btn-sm btn-secondary" onClick={() => openEditDialog(user)}>
                            Edit
                          </button>
                          <button className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleStatus(user)}>
                            {user.isActive ? 'Inactive' : 'Active'}
                          </button>
                        </div>
                      ) : (
                        <span style={{fontSize:'12px',color:'var(--text-light)'}}>Protected</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dialogMode && (
        <div className="modal-overlay" onMouseDown={() => closeDialog()}>
          <form className="modal" onSubmit={saveUser} onMouseDown={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{isCreateMode ? 'Create' : 'Edit'} {isStaffDialog ? 'Staff' : 'Customer'} Account</h3>
              <button type="button" className="btn btn-icon btn-secondary" onClick={() => closeDialog()} aria-label="Close">
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
                  <label className="form-label">{isCreateMode ? 'Password' : 'New password'}</label>
                  <input
                    className="form-input"
                    type="password"
                    value={form.password}
                    onChange={event => updateField('password', event.target.value)}
                    minLength={6}
                    required={isCreateMode}
                    placeholder={isCreateMode ? 'Minimum 6 characters' : 'Leave blank to keep old password'}
                  />
                </div>
              </div>

              <label style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:isStaffDialog?'18px':'0',fontSize:'13px',fontWeight:600}}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={event => updateField('isActive', event.target.checked)}
                />
                Active {isStaffDialog ? 'staff' : 'customer'} account
              </label>

              {isStaffDialog && (
                <>
                  <div className="divider" />
                  <div className="form-group">
                    <label className="form-label">Staff permissions</label>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2, minmax(180px, 1fr))',gap:'16px'}}>
                      {['Menu', 'Tables'].map(group => (
                        <div key={group} style={{display:'grid',gap:'10px'}}>
                          <div style={{fontSize:'12px',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.5px'}}>
                            {group}
                          </div>
                          {STAFF_PERMISSIONS.filter(permission => permission.group === group).map(permission => (
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
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => closeDialog()} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isCreateMode ? 'Create account' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
