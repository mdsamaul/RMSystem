import React, { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ChatBox({ orderId, onClose }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const endRef = useRef(null)
  const pollRef = useRef(null)

  const load = async () => {
    try {
      const r = await chatAPI.getMessages(orderId)
      setMessages(r.data.data || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    // Poll every 3 seconds for new messages
    pollRef.current = setInterval(load, 3000)
    return () => clearInterval(pollRef.current)
  }, [orderId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await chatAPI.sendMessage(orderId, text.trim())
      setText('')
      await load()
    } catch { toast.error('Failed to send message') }
    finally { setSending(false) }
  }

  const isMe = (msg) => msg.senderId === user?.id

  return (
    <div style={{
      position:'fixed', bottom:'24px', right:'24px', width:'340px', height:'460px',
      background:'#fff', borderRadius:'16px', boxShadow:'0 8px 32px rgba(0,0,0,.18)',
      display:'flex', flexDirection:'column', zIndex:2000, border:'1px solid var(--border)',
      overflow:'hidden', animation:'modalIn .2s ease'
    }}>
      {/* Header */}
      <div style={{background:'var(--secondary)',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>💬</div>
          <div>
            <div style={{color:'#fff',fontWeight:700,fontSize:'14px'}}>Order #{orderId} — Staff Chat</div>
            <div style={{color:'#9ca3af',fontSize:'11px'}}>We usually reply within minutes</div>
          </div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'20px',lineHeight:1}}>×</button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px',background:'#f8f9fc'}}>
        {loading
          ? <div style={{textAlign:'center',color:'var(--text-muted)',marginTop:'80px'}}>Loading...</div>
          : messages.length === 0
            ? <div style={{textAlign:'center',color:'var(--text-muted)',marginTop:'80px'}}>
                <div style={{fontSize:'36px',marginBottom:'10px'}}>💬</div>
                <div style={{fontSize:'14px',fontWeight:600}}>No messages yet</div>
                <div style={{fontSize:'12px',marginTop:'4px'}}>Ask us anything about your order!</div>
              </div>
            : messages.map(msg => (
              <div key={msg.id} style={{display:'flex',flexDirection:'column',alignItems:isMe(msg)?'flex-end':'flex-start'}}>
                {!isMe(msg) && (
                  <div style={{fontSize:'11px',color:'var(--text-muted)',marginBottom:'2px',paddingLeft:'4px'}}>
                    {msg.senderName} · {msg.senderRole === 'STAFF' ? '👨‍🍳 Staff' : '👔 Admin'}
                  </div>
                )}
                <div style={{
                  maxWidth:'78%', padding:'9px 13px', borderRadius:isMe(msg)?'14px 14px 4px 14px':'14px 14px 14px 4px',
                  background:isMe(msg)?'var(--primary)':'#fff',
                  color:isMe(msg)?'#fff':'var(--text)',
                  fontSize:'13px', lineHeight:'1.45',
                  boxShadow:'0 1px 3px rgba(0,0,0,.08)'
                }}>
                  {msg.message}
                </div>
                <div style={{fontSize:'10px',color:'var(--text-light)',marginTop:'2px',paddingRight:'2px'}}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                  {isMe(msg) && <span style={{marginLeft:'4px'}}>{msg.isRead ? ' ✓✓' : ' ✓'}</span>}
                </div>
              </div>
            ))
        }
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <form onSubmit={send} style={{padding:'12px',borderTop:'1px solid var(--border)',display:'flex',gap:'8px',background:'#fff'}}>
        <input
          value={text} onChange={e=>setText(e.target.value)}
          placeholder="Type a message..."
          style={{flex:1,padding:'9px 14px',border:'1.5px solid var(--border)',borderRadius:'20px',fontSize:'13px',outline:'none',fontFamily:'inherit'}}
          onFocus={e=>e.target.style.borderColor='var(--primary)'}
          onBlur={e=>e.target.style.borderColor='var(--border)'}
          disabled={sending}
        />
        <button type="submit" disabled={!text.trim()||sending}
          style={{
            width:'38px',height:'38px',borderRadius:'50%',border:'none',
            background:text.trim()?'var(--primary)':'var(--border)',
            color:'#fff',cursor:text.trim()?'pointer':'not-allowed',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',
            transition:'background .2s', flexShrink:0
          }}>
          {sending ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  )
}
