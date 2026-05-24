import React, { useState, useEffect, useCallback } from 'react'
import { orderAPI, chatAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ChatBox from '../../components/chat/ChatBox'
import OrderProgress from '../../components/order/OrderProgress'
import toast from 'react-hot-toast'

const SC = {
  PENDING:'badge-warning', CONFIRMED:'badge-info', IN_PROGRESS:'badge-purple',
  READY:'badge-orange', SERVED:'badge-success', CLOSED:'badge-gray', CANCELLED:'badge-danger'
}
const ICONS = {
  PENDING:'⏳', CONFIRMED:'✅', IN_PROGRESS:'👨‍🍳', READY:'🔔',
  SERVED:'🍽️', CLOSED:'💰', CANCELLED:'❌'
}

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [chatOrderId, setChatOrderId] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})

  const load = useCallback(() => {
    orderAPI.getMy().then(r => setOrders(r.data.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const activeOrders = orders.filter(o => !['CLOSED','CANCELLED','SERVED'].includes(o.status))
    if (activeOrders.length === 0) return
    const fetchUnreads = async () => {
      const counts = {}
      for (const o of activeOrders) {
        try {
          const r = await chatAPI.getUnread(o.id)
          counts[o.id] = r.data.data || 0
        } catch { counts[o.id] = 0 }
      }
      setUnreadCounts(counts)
    }
    fetchUnreads()
    const interval = setInterval(fetchUnreads, 5000)
    return () => clearInterval(interval)
  }, [orders])

  const cancel = async (id) => {
    if (!confirm('Cancel this order?')) return
    try { await orderAPI.cancel(id); toast.success('Order cancelled'); load() }
    catch(e) { toast.error(e.response?.data?.message || 'Cannot cancel') }
  }

  const activeOrders = orders.filter(o => !['CLOSED','CANCELLED'].includes(o.status))
  const pastOrders = orders.filter(o => ['CLOSED','CANCELLED'].includes(o.status))

  if (loading) return <div className="page-content"><div className="loading-page"><div className="spinner"/></div></div>

  return (
    <div className="page-content">
      <div className="flex-between page-header">
        <div><h1>📋 My Orders</h1><p>Track and manage your orders</p></div>
        <button className="btn btn-secondary" onClick={load}>🔄 Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No orders yet</h3>
            <p>Browse the menu and place your first order!</p>
          </div>
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div style={{marginBottom:'28px'}}>
              <h2 style={{fontSize:'16px',fontWeight:700,marginBottom:'14px'}}>🔥 Active Orders</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                {activeOrders.map(o => (
                  <div key={o.id} className="card" style={{padding:'20px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',cursor:'pointer'}}
                      onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                      <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                        <div style={{fontSize:'32px'}}>{ICONS[o.status]}</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:'16px',display:'flex',alignItems:'center',gap:'8px'}}>
                            Order #ORD-{o.id}
                            {o.isParcel && <span style={{background:'#eff6ff',color:'#2563eb',borderRadius:'8px',padding:'2px 8px',fontSize:'11px',fontWeight:600}}>🛍️ Parcel</span>}
                          </div>
                          <div style={{fontSize:'13px',color:'var(--text-muted)'}}>{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</div>
                          <div style={{fontSize:'13px',marginTop:'2px'}}>{(o.orderItems||[]).length} items {o.tableNumber ? `· Table ${o.tableNumber}` : ''}</div>
                        </div>
                      </div>
                      <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px'}}>
                        <span className={`badge ${SC[o.status]}`}>{ICONS[o.status]} {o.status.replace('_',' ')}</span>
                        <div style={{fontSize:'18px',fontWeight:800,color:'var(--primary)'}}>৳{parseFloat(o.totalAmount||0).toFixed(0)}</div>
                        <div style={{fontSize:'11px',color:'var(--text-muted)'}}>⏱️ Est. {o.estimatedMinutes||15} min</div>
                      </div>
                    </div>

                    {selected?.id === o.id && (
                      <div style={{marginTop:'16px'}}>
                        <OrderProgress order={o} />
                        <div style={{borderTop:'1px solid var(--border)',paddingTop:'16px',marginTop:'16px'}}>
                          {(o.orderItems||[]).map(item => (
                            <div key={item.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:'14px'}}>
                              <span>{item.menuItemName} × {item.quantity}{item.specialRequest ? <span style={{color:'var(--text-muted)',fontSize:'12px'}}> ({item.specialRequest})</span> : ''}</span>
                              <span className="price">৳{parseFloat(item.subtotal||0).toFixed(0)}</span>
                            </div>
                          ))}
                          <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:'15px',borderTop:'1px solid var(--border)',paddingTop:'8px',marginTop:'6px'}}>
                            <span>Total (incl. 5% tax)</span>
                            <span style={{color:'var(--primary)'}}>৳{parseFloat(o.totalAmount||0).toFixed(0)}</span>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:'10px',marginTop:'14px',flexWrap:'wrap'}}>
                          <button className="btn btn-secondary btn-sm" style={{position:'relative'}}
                            onClick={() => setChatOrderId(chatOrderId === o.id ? null : o.id)}>
                            💬 Chat with Staff
                            {unreadCounts[o.id] > 0 && (
                              <span style={{
                                position:'absolute',top:'-8px',right:'-8px',
                                background:'var(--danger)',color:'#fff',borderRadius:'50%',
                                width:'18px',height:'18px',fontSize:'10px',
                                display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700
                              }}>{unreadCounts[o.id]}</span>
                            )}
                          </button>
                          {(o.status === 'PENDING' || o.status === 'CONFIRMED') && (
                            <button className="btn btn-danger btn-sm"
                              onClick={e => { e.stopPropagation(); cancel(o.id) }}>
                              ❌ Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastOrders.length > 0 && (
            <div>
              <h2 style={{fontSize:'16px',fontWeight:700,marginBottom:'14px',color:'var(--text-muted)'}}>📁 Order History</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {pastOrders.map(o => (
                  <div key={o.id} className="card" style={{padding:'16px',cursor:'pointer',opacity:.85}}
                    onClick={() => setSelected(selected?.id === o.id ? null : o)}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                        <div style={{fontSize:'26px'}}>{ICONS[o.status]}</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:'14px'}}>
                            Order #ORD-{o.id}
                            {o.isParcel && <span style={{marginLeft:'6px',background:'#eff6ff',color:'#2563eb',borderRadius:'6px',padding:'1px 7px',fontSize:'10px',fontWeight:600}}>Parcel</span>}
                          </div>
                          <div style={{fontSize:'12px',color:'var(--text-muted)'}}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}</div>
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <span className={`badge ${SC[o.status]}`} style={{display:'block',marginBottom:'4px'}}>{o.status}</span>
                        <div style={{fontWeight:700,color:'var(--primary)'}}>৳{parseFloat(o.totalAmount||0).toFixed(0)}</div>
                      </div>
                    </div>
                    {selected?.id === o.id && (
                      <div style={{marginTop:'12px',borderTop:'1px solid var(--border)',paddingTop:'12px'}}>
                        {(o.orderItems||[]).map(item => (
                          <div key={item.id} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'13px'}}>
                            <span>{item.menuItemName} × {item.quantity}</span>
                            <span className="price">৳{parseFloat(item.subtotal||0).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {chatOrderId && (
        <ChatBox orderId={chatOrderId} onClose={() => setChatOrderId(null)} />
      )}
    </div>
  )
}
