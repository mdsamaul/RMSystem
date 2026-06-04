import React, { useState, useEffect } from 'react'
import { menuAPI, orderAPI, tableAPI } from '../../services/api'
import toast from 'react-hot-toast'

const itemAvatars = ['🍛','🍜','🥘','🍲','🥗','🍱','🍝','🥩','🍗','🥚']
const itemAvatar = (id = 0) => itemAvatars[id % itemAvatars.length]
const hasDealPrice = (item) => Number(item?.regularPrice) > Number(item?.price)
const discountPercent = (item) => Math.round(((Number(item.regularPrice) - Number(item.price)) / Number(item.regularPrice)) * 100)

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [tables, setTables] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [tableId, setTableId] = useState('')
  const [notes, setNotes] = useState('')
  const [isParcel, setIsParcel] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    Promise.all([menuAPI.getCategories(), menuAPI.getItems(), tableAPI.getAvailable()])
      .then(([c, i, t]) => {
        setCategories(c.data.data||[]); setItems(i.data.data||[]); setTables(t.data.data||[])
      }).catch(()=>toast.error('Failed to load menu')).finally(()=>setLoading(false))
  }, [])

  const filtered = items.filter(i =>
    (!activeCategory || i.categoryId === activeCategory) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()))
  )

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c=>c.id===item.id)
      if (ex) return prev.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c)
      return [...prev, { ...item, qty:1, specialRequest:'' }]
    })
    toast.success(`${item.name} added to cart 🛒`, { duration:1500 })
  }

  const removeFromCart = (id) => setCart(prev=>prev.filter(c=>c.id!==id))
  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return }
    setCart(prev=>prev.map(c=>c.id===id?{...c,qty}:c))
  }
  const cartTotal = cart.reduce((s,c)=>s+parseFloat(c.price)*c.qty, 0)
  const cartCount = cart.reduce((s,c)=>s+c.qty, 0)

  const placeOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty!'); return }
    setOrdering(true)
    try {
      await orderAPI.create({
        tableId: isParcel ? null : (tableId || null),
        notes,
        isParcel,
        items: cart.map(c=>({ menuItemId:c.id, quantity:c.qty, specialRequest:c.specialRequest }))
      })
      toast.success('🎉 Order placed successfully!')
      setCart([]); setShowCart(false); setNotes(''); setTableId(''); setIsParcel(false)
    } catch(e) { toast.error(e.response?.data?.message || 'Order failed')
    } finally { setOrdering(false) }
  }

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="flex-between page-header">
        <div><h1>🍽️ Our Menu</h1><p>Choose from our delicious selection</p></div>
        <button className="btn btn-primary" onClick={()=>setShowCart(true)} style={{position:'relative'}}>
          🛒 Cart
          {cartCount>0 && <span style={{position:'absolute',top:'-8px',right:'-8px',background:'var(--danger)',color:'#fff',borderRadius:'50%',width:'20px',height:'20px',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>{cartCount}</span>}
        </button>
      </div>

      <div className="search-bar" style={{width:'100%',maxWidth:'400px',marginBottom:'20px'}}>
        <span>🔍</span>
        <input placeholder="Search items..." value={search} onChange={e=>setSearch(e.target.value)}/>
        {search && <button onClick={()=>setSearch('')} style={{border:'none',background:'none',cursor:'pointer',color:'var(--text-muted)'}}>✕</button>}
      </div>

      {/* Category Filter */}
      <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'8px',marginBottom:'24px'}}>
        <button onClick={()=>setActiveCategory(null)} className={`btn btn-sm ${!activeCategory?'btn-primary':'btn-secondary'}`}>
          🍽️ All ({items.length})
        </button>
        {categories.map(c=>(
          <button key={c.id} onClick={()=>setActiveCategory(activeCategory===c.id?null:c.id)}
            className={`btn btn-sm ${activeCategory===c.id?'btn-primary':'btn-secondary'}`}
            style={{whiteSpace:'nowrap'}}>
            {c.name} ({items.filter(i=>i.categoryId===c.id).length})
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'16px'}}>
        {filtered.length===0
          ? <div className="empty-state" style={{gridColumn:'1/-1'}}><div className="icon">🍽️</div><h3>No items found</h3></div>
          : filtered.map(item=>(
            <div key={item.id} className="card" onClick={()=>setSelectedItem(item)}
              style={{overflow:'hidden',transition:'transform .2s,box-shadow .2s',cursor:'pointer'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='var(--shadow-lg)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name}
                  style={{height:'150px',width:'100%',objectFit:'cover',display:'block',background:'var(--primary-light)'}}/>
              ) : (
                <div style={{height:'140px',background:`linear-gradient(135deg, #${Math.floor(item.id*137.5%16777215).toString(16).padStart(6,'0')}22, var(--primary-light))`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'52px'}}>
                  {itemAvatar(item.id)}
                </div>
              )}
              <div style={{padding:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
                  <h3 style={{fontSize:'15px',fontWeight:700,flex:1}}>{item.name}</h3>
                  <span className="badge badge-info" style={{fontSize:'11px',marginLeft:'8px',flexShrink:0}}>{item.categoryName}</span>
                </div>
                {item.description && <p style={{fontSize:'12px',color:'var(--text-muted)',marginBottom:'12px',lineHeight:'1.5'}}>{item.description.slice(0,70)}{item.description.length>70?'...':''}</p>}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{display:'flex',alignItems:'baseline',gap:'7px',flexWrap:'wrap'}}>
                      <span style={{fontSize:'18px',fontWeight:800,color:'var(--primary)'}}>৳{parseFloat(item.price).toFixed(0)}</span>
                      {hasDealPrice(item) && <span style={{fontSize:'12px',color:'var(--text-muted)',textDecoration:'line-through'}}>৳{parseFloat(item.regularPrice).toFixed(0)}</span>}
                    </div>
                    {hasDealPrice(item) && <div style={{fontSize:'11px',color:'var(--success)',fontWeight:700,marginTop:'2px'}}>{discountPercent(item)}% off today</div>}
                    <div style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'2px'}}>⏱️ ~{item.estimatedMinutes||15} min</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={(e)=>{ e.stopPropagation(); addToCart(item) }}>+ Add</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={()=>setSelectedItem(null)}>
          <div className="modal" style={{maxWidth:'540px',overflow:'hidden',padding:0}} onClick={e=>e.stopPropagation()}>
            <div style={{position:'relative',height:'260px',background:'var(--primary-light)',overflow:'hidden'}}>
              {selectedItem.imageUrl ? (
                <img src={selectedItem.imageUrl} alt={selectedItem.name}
                  style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transform:'scale(1.01)'}}/>
              ) : (
                <div style={{width:'100%',height:'100%',background:`linear-gradient(135deg, #${Math.floor(selectedItem.id*137.5%16777215).toString(16).padStart(6,'0')}22, var(--primary-light))`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'82px'}}>
                  {itemAvatar(selectedItem.id)}
                </div>
              )}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(0,0,0,.05) 35%, rgba(0,0,0,.62) 100%)'}}/>
              <button className="btn btn-secondary btn-sm" onClick={()=>setSelectedItem(null)}
                style={{position:'absolute',top:'14px',right:'14px',background:'rgba(255,255,255,.92)',boxShadow:'var(--shadow)',border:'none'}}>
                ✕
              </button>
              <div style={{position:'absolute',left:'18px',right:'18px',bottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'14px'}}>
                <div>
                  <h3 style={{color:'#fff',fontSize:'22px',fontWeight:800,marginBottom:'8px',textShadow:'0 1px 8px rgba(0,0,0,.35)'}}>{selectedItem.name}</h3>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    <span className="badge badge-info">{selectedItem.categoryName}</span>
                    <span style={{fontSize:'12px',color:'#fff',fontWeight:700,background:'rgba(255,255,255,.22)',border:'1px solid rgba(255,255,255,.35)',borderRadius:'999px',padding:'4px 9px'}}>⏱️ ~{selectedItem.estimatedMinutes || 15} min</span>
                  </div>
                </div>
                <div style={{background:'rgba(255,255,255,.95)',color:'var(--primary)',borderRadius:'10px',padding:'8px 12px',fontSize:'22px',fontWeight:900,boxShadow:'var(--shadow)'}}>
                  <div>৳{parseFloat(selectedItem.price).toFixed(0)}</div>
                  {hasDealPrice(selectedItem) && <div style={{fontSize:'12px',color:'var(--text-muted)',textDecoration:'line-through',fontWeight:700}}>৳{parseFloat(selectedItem.regularPrice).toFixed(0)}</div>}
                </div>
              </div>
            </div>
            <div className="modal-header">
              <div>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <span className="badge badge-success">Available</span>
                  {hasDealPrice(selectedItem) && <span className="badge badge-info">{discountPercent(selectedItem)}% off</span>}
                </div>
              </div>
            </div>
            <div className="modal-body">
              <p style={{fontSize:'14px',lineHeight:'1.7',color:'var(--text-muted)',marginBottom:'18px'}}>
                {selectedItem.description || 'No description available for this item.'}
              </p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderTop:'1px solid var(--border)'}}>
                <div>
                  <div style={{fontSize:'12px',color:'var(--text-muted)',fontWeight:600}}>Price</div>
                  <div style={{display:'flex',alignItems:'baseline',gap:'10px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'26px',fontWeight:800,color:'var(--primary)'}}>৳{parseFloat(selectedItem.price).toFixed(0)}</span>
                    {hasDealPrice(selectedItem) && <span style={{fontSize:'15px',fontWeight:700,color:'var(--text-muted)',textDecoration:'line-through'}}>৳{parseFloat(selectedItem.regularPrice).toFixed(0)}</span>}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={()=>{ addToCart(selectedItem); setSelectedItem(null) }}>
                  + Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar Modal */}
      {showCart && (
        <div className="modal-overlay" onClick={()=>setShowCart(false)}>
          <div className="modal" style={{maxWidth:'480px',maxHeight:'90vh'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>🛒 Your Cart ({cartCount} items)</h3>
              <button className="btn btn-secondary btn-sm" onClick={()=>setShowCart(false)}>✕</button>
            </div>
            <div className="modal-body" style={{maxHeight:'60vh',overflowY:'auto'}}>
              {cart.length===0
                ? <div className="empty-state"><div className="icon">🛒</div><h3>Cart is empty</h3><p>Add items from the menu</p></div>
                : cart.map(item=>(
                  <div key={item.id} style={{display:'flex',gap:'12px',alignItems:'center',padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name}
                        style={{width:'44px',height:'44px',borderRadius:'8px',objectFit:'cover',border:'1px solid var(--border)',flexShrink:0}}/>
                    ) : (
                      <div style={{fontSize:'28px',width:'44px',textAlign:'center',flexShrink:0}}>{itemAvatar(item.id)}</div>
                    )}
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:'14px'}}>{item.name}</div>
                      <div style={{display:'flex',alignItems:'baseline',gap:'7px',flexWrap:'wrap'}}>
                        <span style={{fontSize:'13px',color:'var(--primary)',fontWeight:700}}>৳{parseFloat(item.price).toFixed(0)} each</span>
                        {hasDealPrice(item) && <span style={{fontSize:'11px',color:'var(--text-muted)',textDecoration:'line-through'}}>৳{parseFloat(item.regularPrice).toFixed(0)}</span>}
                      </div>
                      <input placeholder="Special request..." style={{marginTop:'4px',padding:'4px 8px',fontSize:'12px',border:'1px solid var(--border)',borderRadius:'4px',width:'100%'}}
                        value={item.specialRequest} onChange={e=>setCart(prev=>prev.map(c=>c.id===item.id?{...c,specialRequest:e.target.value}:c))}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <button className="btn btn-secondary btn-sm" style={{padding:'4px 8px'}} onClick={()=>updateQty(item.id,item.qty-1)}>−</button>
                      <span style={{fontWeight:700,minWidth:'20px',textAlign:'center'}}>{item.qty}</span>
                      <button className="btn btn-secondary btn-sm" style={{padding:'4px 8px'}} onClick={()=>updateQty(item.id,item.qty+1)}>+</button>
                      <button className="btn btn-danger btn-sm" style={{padding:'4px 8px'}} onClick={()=>removeFromCart(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))
              }
              {cart.length>0 && (
                <>
                  <div className="divider"/>
                  {/* Dine-in / Parcel toggle */}
                  <div className="form-group">
                    <label className="form-label">Order Type</label>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button onClick={()=>setIsParcel(false)}
                        style={{flex:1,padding:'10px',borderRadius:'8px',border:`2px solid ${!isParcel?'var(--primary)':'var(--border)'}`,
                          background:!isParcel?'var(--primary-light)':'#fff',cursor:'pointer',
                          fontWeight:600,fontSize:'13px',color:!isParcel?'var(--primary)':'var(--text-muted)'}}>
                        🪑 Dine In
                      </button>
                      <button onClick={()=>{ setIsParcel(true); setTableId('') }}
                        style={{flex:1,padding:'10px',borderRadius:'8px',border:`2px solid ${isParcel?'var(--primary)':'var(--border)'}`,
                          background:isParcel?'var(--primary-light)':'#fff',cursor:'pointer',
                          fontWeight:600,fontSize:'13px',color:isParcel?'var(--primary)':'var(--text-muted)'}}>
                        🛍️ Parcel / Takeaway
                      </button>
                    </div>
                  </div>
                  {!isParcel && (
                    <div className="form-group">
                      <label className="form-label">Select Table (optional)</label>
                      <select className="form-select" value={tableId} onChange={e=>setTableId(e.target.value)}>
                        <option value="">No table (walk-in)</option>
                        {tables.map(t=><option key={t.id} value={t.id}>Table {t.tableNumber} ({t.capacity} seats)</option>)}
                      </select>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Order Notes</label>
                    <textarea className="form-textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Any special instructions..."/>
                  </div>
                </>
              )}
            </div>
            {cart.length>0 && (
              <div className="modal-footer" style={{flexDirection:'column',gap:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',width:'100%',padding:'8px 0'}}>
                  <span style={{fontWeight:600}}>Total (excl. tax):</span>
                  <span style={{fontSize:'20px',fontWeight:800,color:'var(--primary)'}}>৳{cartTotal.toFixed(0)}</span>
                </div>
                <div style={{display:'flex',gap:'10px',width:'100%'}}>
                  <button className="btn btn-secondary" onClick={()=>setShowCart(false)} style={{flex:1,justifyContent:'center'}}>Cancel</button>
                  <button className="btn btn-primary" onClick={placeOrder} disabled={ordering} style={{flex:2,justifyContent:'center'}}>
                    {ordering ? '⏳ Placing...' : '✅ Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
