import React, { useEffect, useRef, useState } from 'react'

export default function StatusWs() {
    const [ok, setOk] = useState(false)
    const [time, setTime] = useState(null)

    const wsRef = useRef(null)
    const startedRef = useRef(false)
    const manualCloseRef = useRef(false)
    const reconnectTimerRef = useRef(null)

    const apiBase = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/+$/, '')
    const wsBase = apiBase.replace(/^http(s?):/, 'ws$1:')
    const url = `${wsBase}/ws/status`

    useEffect(() => {
        if (startedRef.current) return
        startedRef.current = true

        const connect = () => {
            const ws = new WebSocket(url)
            wsRef.current = ws

            ws.onopen = () => {
                setOk(true)
                if (reconnectTimerRef.current) {
                    clearTimeout(reconnectTimerRef.current)
                    reconnectTimerRef.current = null
                }
            }

            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data)
                    setOk(msg.status === 'ok')
                    setTime(msg.datetime_utc ?? null)
                } catch {
                    setOk(false)
                }
            }

            ws.onerror = () => {
                setOk(false)
            }

            ws.onclose = () => {
                setOk(false)
                if (!manualCloseRef.current) {
                    reconnectTimerRef.current = setTimeout(connect, 2000) // reconnect 2s
                }
            }
        }

        connect()

        return () => {
            manualCloseRef.current = true
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close(1000, 'component unmount')
            }
            wsRef.current = null
        }
    }, [url])

    return (
        <span className={`badge ${ok ? 'bg-success' : 'bg-secondary'}`} title={time || ''}>
      {ok ? 'Online' : 'Offline'}
    </span>
    )
}