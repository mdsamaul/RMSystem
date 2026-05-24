import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { orderAPI, chatAPI } from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function useNotifications() {
  return useContext(NotificationContext)
}

const STATUS_LABELS = {
  PENDING:      { label: 'Order Received',   icon: '📋', color: '#f59e0b' },
  CONFIRMED:    { label: 'Order Confirmed',   icon: '✅', color: '#3b82f6' },
  IN_PROGRESS:  { label: 'Kitchen Cooking',  icon: '👨‍🍳', color: '#7c3aed' },
  READY:        { label: 'Order Ready! 🔔',  icon: '🔔', color: '#ea580c' },
  SERVED:       { label: 'Order Served',      icon: '🍽️', color: '#10b981' },
  CLOSED:       { label: 'Order Closed',      icon: '💰', color: '#6b7280' },
  CANCELLED:    { label: 'Order Cancelled',   icon: '❌', color: '#ef4444' },
}

let browserPermission = 'default'

function requestBrowserPermission() {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') { browserPermission = 'granted'; return }
  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { browserPermission = p })
  }
}

function sendBrowserNotification(title, body, icon = '🍽️') {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/favicon.ico', silent: false })
    } catch(e) {}
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [toasts, setToasts] = useState([])           // in-app popup toasts
  const [totalUnreadChat, setTotalUnreadChat] = useState(0)
  const [totalUnreadOrders, setTotalUnreadOrders] = useState(0)

  // Track previous state to detect changes
  const prevOrderStatuses = useRef({})   // { orderId: status }
  const prevChatCounts    = useRef({})   // { orderId: count }
  const pollInterval      = useRef(null)
  const isFirstPoll       = useRef(true)

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-3), { ...toast, id }])  // max 4 toasts
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 6000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const poll = useCallback(async () => {
    if (!user || user.role !== 'CUSTOMER') return
    try {
      const r = await orderAPI.getMy()
      const orders = r.data.data || []
      const activeOrders = orders.filter(o => !['CLOSED', 'CANCELLED'].includes(o.status))

      let chatUnreadTotal = 0
      let orderUnreadTotal = 0

      for (const order of orders) {
        const prevStatus = prevOrderStatuses.current[order.id]

        // ── Order status change notification ──────────────────────────────
        if (prevStatus && prevStatus !== order.status) {
          const info = STATUS_LABELS[order.status] || { label: order.status, icon: '📋', color: '#6b7280' }
          const title = `Order #ORD-${order.id} Update`
          const body  = `${info.icon} ${info.label}`

          addToast({ type: 'order', title, body, color: info.color, icon: info.icon, orderId: order.id })
          sendBrowserNotification(title, body)

          // READY is most important — play a sound attempt
          if (order.status === 'READY') {
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)()
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain); gain.connect(ctx.destination)
              osc.frequency.setValueAtTime(880, ctx.currentTime)
              osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
              gain.gain.setValueAtTime(0.3, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
              osc.start(); osc.stop(ctx.currentTime + 0.4)
            } catch(e) {}
          }
        }
        prevOrderStatuses.current[order.id] = order.status

        // Count pending statuses for sidebar badge
        if (!['CLOSED','CANCELLED','SERVED'].includes(order.status)) orderUnreadTotal++
      }

      // ── Chat unread notifications ─────────────────────────────────────
      for (const order of activeOrders) {
        try {
          const cr = await chatAPI.getUnread(order.id)
          const count = cr.data.data || 0
          const prevCount = prevChatCounts.current[order.id] || 0

          if (!isFirstPoll.current && count > prevCount) {
            const newMsgs = count - prevCount
            const title = `New message on Order #ORD-${order.id}`
            const body  = `💬 You have ${newMsgs} new message${newMsgs > 1 ? 's' : ''} from staff`
            addToast({ type: 'chat', title, body, color: '#3b82f6', icon: '💬', orderId: order.id })
            sendBrowserNotification(title, body)
          }
          prevChatCounts.current[order.id] = count
          chatUnreadTotal += count
        } catch(e) {}
      }

      setTotalUnreadChat(chatUnreadTotal)
      setTotalUnreadOrders(orderUnreadTotal)
      isFirstPoll.current = false

    } catch(e) { /* network error, skip */ }
  }, [user, addToast])

  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') return
    requestBrowserPermission()
    isFirstPoll.current = true
    poll()
    pollInterval.current = setInterval(poll, 5000)
    return () => clearInterval(pollInterval.current)
  }, [user, poll])

  // Reset on logout
  useEffect(() => {
    if (!user) {
      prevOrderStatuses.current = {}
      prevChatCounts.current = {}
      isFirstPoll.current = true
      setTotalUnreadChat(0)
      setTotalUnreadOrders(0)
      setToasts([])
    }
  }, [user])

  return (
    <NotificationContext.Provider value={{ totalUnreadChat, totalUnreadOrders, addToast }}>
      {children}

      {/* In-App Toast Notifications */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '24px',
        display: 'flex', flexDirection: 'column-reverse', gap: '10px',
        zIndex: 9999, pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: '#fff', borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,.15)',
            border: `2px solid ${toast.color}22`,
            padding: '14px 18px', minWidth: '280px', maxWidth: '340px',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            animation: 'slideInToast .3s ease',
            pointerEvents: 'all',
            borderLeft: `4px solid ${toast.color}`
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: toast.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>
              {toast.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827', marginBottom: '2px' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4 }}>
                {toast.body}
              </div>
            </div>
            <button onClick={() => dismissToast(toast.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', fontSize: '16px', lineHeight: 1, padding: '0 0 0 4px',
              flexShrink: 0, alignSelf: 'flex-start'
            }}>×</button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </NotificationContext.Provider>
  )
}
