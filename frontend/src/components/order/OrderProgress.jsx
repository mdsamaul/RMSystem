import React from 'react'

const STEPS = [
  { status: 'PENDING',     label: 'Order Placed',   icon: '📋', desc: 'Your order has been received' },
  { status: 'CONFIRMED',   label: 'Confirmed',       icon: '✅', desc: 'Order confirmed by staff' },
  { status: 'IN_PROGRESS', label: 'Preparing',       icon: '👨‍🍳', desc: 'Kitchen is cooking your food' },
  { status: 'READY',       label: 'Ready',           icon: '🔔', desc: 'Your order is ready!' },
  { status: 'SERVED',      label: 'Served',          icon: '🍽️', desc: 'Enjoy your meal!' },
]

const ORDER_INDEX = {
  PENDING: 0, CONFIRMED: 1, IN_PROGRESS: 2, READY: 3, SERVED: 4, CLOSED: 4, CANCELLED: -1
}

export default function OrderProgress({ order }) {
  if (!order) return null
  const currentIdx = ORDER_INDEX[order.status] ?? 0
  const isCancelled = order.status === 'CANCELLED'

  // Compute elapsed time
  const createdMs = order.createdAt ? new Date(order.createdAt).getTime() : Date.now()
  const elapsedMin = Math.floor((Date.now() - createdMs) / 60000)
  const remaining = Math.max(0, (order.estimatedMinutes || 15) - elapsedMin)

  return (
    <div style={{
      background:'linear-gradient(135deg,#fff7ed,#fff)',
      border:'1px solid #fed7aa', borderRadius:'12px', padding:'20px',
      marginTop:'16px'
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px',flexWrap:'wrap',gap:'8px'}}>
        <div>
          <div style={{fontWeight:700,fontSize:'15px',marginBottom:'2px'}}>📦 Order Progress</div>
          <div style={{fontSize:'12px',color:'var(--text-muted)'}}>
            {order.isParcel ? '🛍️ Parcel / Takeaway' : order.tableNumber ? `🪑 Table ${order.tableNumber}` : '🛍️ Takeaway'}
          </div>
        </div>
        {!isCancelled && order.status !== 'SERVED' && order.status !== 'CLOSED' && (
          <div style={{
            background:'var(--primary)', color:'#fff', borderRadius:'20px',
            padding:'6px 14px', fontSize:'12px', fontWeight:700,
            display:'flex', alignItems:'center', gap:'6px'
          }}>
            ⏱️ {remaining <= 0 ? 'Almost ready!' : `~${remaining} min left`}
          </div>
        )}
        {(order.status === 'SERVED' || order.status === 'CLOSED') && (
          <div style={{background:'#ecfdf5',color:'#059669',borderRadius:'20px',padding:'6px 14px',fontSize:'12px',fontWeight:700}}>
            ✅ Completed
          </div>
        )}
      </div>

      {isCancelled ? (
        <div style={{textAlign:'center',padding:'16px',color:'var(--danger)',fontWeight:700,fontSize:'14px'}}>
          ❌ This order was cancelled
        </div>
      ) : (
        <div style={{position:'relative'}}>
          {/* Progress line */}
          <div style={{
            position:'absolute', top:'20px', left:'20px', right:'20px', height:'2px',
            background:'#e5e7eb', zIndex:0
          }}>
            <div style={{
              height:'100%',
              background:'linear-gradient(90deg,var(--primary),#f97316)',
              width: currentIdx === 0 ? '0%' : `${(currentIdx / (STEPS.length-1)) * 100}%`,
              transition:'width .6s ease', borderRadius:'2px'
            }}/>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',position:'relative',zIndex:1}}>
            {STEPS.map((step, idx) => {
              const done = idx <= currentIdx
              const active = idx === currentIdx
              return (
                <div key={step.status} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}>
                  <div style={{
                    width:'40px', height:'40px', borderRadius:'50%',
                    background: done ? 'var(--primary)' : '#fff',
                    border: done ? '2px solid var(--primary)' : '2px solid #e5e7eb',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize: active ? '20px' : '16px',
                    boxShadow: active ? '0 0 0 4px rgba(232,93,4,.2)' : 'none',
                    transition:'all .3s',
                    filter: done ? 'none' : 'grayscale(1) opacity(.4)'
                  }}>
                    {step.icon}
                  </div>
                  <div style={{
                    marginTop:'8px', fontSize:'11px', fontWeight: active ? 700 : 500,
                    color: active ? 'var(--primary)' : done ? 'var(--text)' : 'var(--text-muted)',
                    textAlign:'center', lineHeight:1.3
                  }}>
                    {step.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current step description */}
          <div style={{
            marginTop:'18px', padding:'10px 14px', borderRadius:'8px',
            background:'rgba(232,93,4,.07)', border:'1px solid rgba(232,93,4,.15)',
            fontSize:'13px', color:'var(--text)', textAlign:'center'
          }}>
            {STEPS[currentIdx]?.desc || 'Processing your order...'}
          </div>
        </div>
      )}
    </div>
  )
}
