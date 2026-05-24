import React, { useState, useEffect } from 'react'
import { menuAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function MenuManagement() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [activeTab, setActiveTab] = useState('items')
  const [showItemModal, setShowItemModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editCat, setEditCat] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [loading, setLoading] = useState(true)
  const [itemForm, setItemForm] = useState({ categoryId:'', name:'', description:'', price:'', imageUrl:'', isAvailable:true, estimatedMinutes:15 })
  const [catForm, setCatForm] = useState({ name:'', description:'', sortOrder:0 })

  const load = () => {
    Promise.all([menuAPI.getCategories(), menuAPI.getItems()])
      .then(([c,i]) => { setCategories(c.data.data||[]); setItems(i.data.data||[]) })
      .catch(()=>toast.error('Failed to load menu'))
      .finally(()=>setLoading(false))
  }
  useEffect(()=>{ load() },[])

  const filteredItems = items.filter(i =>
    (!search || i.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || String(i.categoryId) === String(filterCat))
  )

  const openEditItem = (item) => {
    setEditItem(item)
    setItemForm({ categoryId:item.categoryId, name:item.name, description:item.description||'', price:item.price, imageUrl:item.imageUrl||'', isAvailable:item.isAvailable, estimatedMinutes:item.estimatedMinutes||15 })
    setShowItemModal(true)
  }
  const openNewItem = () => { setEditItem(null); setItemForm({ categoryId:'', name:'', description:'', price:'', imageUrl:'', isAvailable:true, estimatedMinutes:15 }); setShowItemModal(true) }
  const openEditCat = (cat) => { setEditCat(cat); setCatForm({ name:cat.name, description:cat.description||'', sortOrder:cat.sortOrder||0 }); setShowCatModal(true) }
  const openNewCat = () => { setEditCat(null); setCatForm({ name:'', description:'', sortOrder:0 }); setShowCatModal(true) }

  const saveItem = async () => {
    try {
      if (editItem) await menuAPI.updateItem(editItem.id, itemForm)
      else await menuAPI.createItem(itemForm)
      toast.success(editItem ? 'Item updated!' : 'Item created!'); setShowItemModal(false); load()
    } catch(e) { toast.error(e.response?.data?.message || 'Error saving item') }
  }

  const saveCat = async () => {
    try {
      if (editCat) await menuAPI.updateCategory(editCat.id, catForm)
      else await menuAPI.createCategory(catForm)
      toast.success(editCat ? 'Category updated!' : 'Category created!'); setShowCatModal(false); load()
    } catch(e) { toast.error(e.response?.data?.message || 'Error saving category') }
  }

  const toggleAvail = async (id) => {
    try { await menuAPI.toggleAvailability(id); load(); toast.success('Availability toggled') }
    catch { toast.error('Failed') }
  }

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return
    try { await menuAPI.deleteItem(id); toast.success('Item deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="flex-between page-header">
        <div><h1>🍽️ Menu Management</h1><p>Manage your menu categories and items</p></div>
        <div style={{display:'flex',gap:'10px'}}>
          <button className="btn btn-secondary" onClick={openNewCat}>+ Category</button>
          <button className="btn btn-primary" onClick={openNewItem}>+ Add Item</button>
        </div>
      </div>

      <div style={{display:'flex',gap:'4px',marginBottom:'20px',background:'var(--bg)',padding:'4px',borderRadius:'8px',width:'fit-content'}}>
        {['items','categories'].map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            style={{padding:'8px 20px',borderRadius:'6px',border:'none',fontWeight:600,fontSize:'14px',cursor:'pointer',
              background:activeTab===t?'#fff':'transparent',color:activeTab===t?'var(--primary)':'var(--text-muted)',
              boxShadow:activeTab===t?'var(--shadow)':'none',transition:'all .2s'}}>
            {t==='items'?`🥘 Items (${items.length})`:`📂 Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'items' && (
        <>
          <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
            <div className="search-bar" style={{flex:1,minWidth:'200px'}}>
              <span>🔍</span>
              <input placeholder="Search items..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="form-select" style={{width:'180px'}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Prep Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredItems.length === 0
                    ? <tr><td colSpan={5}><div className="empty-state"><div className="icon">🍽️</div><p>No items found</p></div></td></tr>
                    : filteredItems.map(item=>(
                      <tr key={item.id}>
                        <td>
                          <div style={{fontWeight:600}}>{item.name}</div>
                          <div style={{fontSize:'12px',color:'var(--text-muted)',marginTop:'2px'}}>{item.description?.slice(0,50)}{item.description?.length>50?'...':''}</div>
                        </td>
                        <td><span className="badge badge-info">{item.categoryName}</span></td>
                        <td><span className="price">৳{parseFloat(item.price).toFixed(0)}</span></td>
                        <td><span style={{fontSize:'12px',color:'var(--text-muted)'}}>⏱️ {item.estimatedMinutes||15} min</span></td>
                        <td>
                          <button onClick={()=>toggleAvail(item.id)}
                            className={`badge ${item.isAvailable?'badge-success':'badge-danger'}`}
                            style={{cursor:'pointer',border:'none'}}>
                            {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                          </button>
                        </td>
                        <td>
                          <div style={{display:'flex',gap:'6px'}}>
                            <button className="btn btn-secondary btn-sm" onClick={()=>openEditItem(item)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={()=>deleteItem(item.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Category</th><th>Description</th><th>Sort Order</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.length === 0
                  ? <tr><td colSpan={5}><div className="empty-state"><div className="icon">📂</div><p>No categories</p></div></td></tr>
                  : categories.map(c=>(
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td style={{color:'var(--text-muted)'}}>{c.description || '—'}</td>
                      <td>{c.sortOrder}</td>
                      <td><span className={`badge ${c.isActive?'badge-success':'badge-danger'}`}>{c.isActive?'Active':'Inactive'}</span></td>
                      <td><button className="btn btn-secondary btn-sm" onClick={()=>openEditCat(c)}>✏️ Edit</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="modal-overlay" onClick={()=>setShowItemModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Item' : '➕ New Menu Item'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={()=>setShowItemModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={itemForm.categoryId} onChange={e=>setItemForm({...itemForm,categoryId:e.target.value})}>
                  <option value="">Select category</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input className="form-input" value={itemForm.name} onChange={e=>setItemForm({...itemForm,name:e.target.value})} placeholder="e.g. Chicken Biryani"/>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={itemForm.description} onChange={e=>setItemForm({...itemForm,description:e.target.value})} placeholder="Item description..."/>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Price (৳) *</label>
                  <input className="form-input" type="number" step="0.01" value={itemForm.price} onChange={e=>setItemForm({...itemForm,price:e.target.value})} placeholder="0.00"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Available</label>
                  <select className="form-select" value={itemForm.isAvailable} onChange={e=>setItemForm({...itemForm,isAvailable:e.target.value==='true'})}>
                    <option value="true">✅ Yes</option>
                    <option value="false">❌ No</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">⏱️ Estimated Prep Time (minutes)</label>
                <input className="form-input" type="number" min="1" max="120" value={itemForm.estimatedMinutes}
                  onChange={e=>setItemForm({...itemForm,estimatedMinutes:parseInt(e.target.value)||15})}
                  placeholder="15"/>
                <div style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'4px'}}>Customers will see this as estimated wait time</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowItemModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveItem}>💾 Save Item</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={()=>setShowCatModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editCat ? '✏️ Edit Category' : '➕ New Category'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={()=>setShowCatModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} placeholder="e.g. Biryani"/>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={catForm.description} onChange={e=>setCatForm({...catForm,description:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input className="form-input" type="number" value={catForm.sortOrder} onChange={e=>setCatForm({...catForm,sortOrder:parseInt(e.target.value)||0})}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setShowCatModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveCat}>💾 Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
