"use client"

import { useCallback, useRef } from "react"

interface WebSocketCallbacks {
  onStatusUpdate: (data: { sid: string; status: string; number: string }) => void
  onError: (phone: string, error: Event) => void
  onDisconnect: (phone: string) => void
}

interface UseWebSocketManagerReturn {
  connectToPhone: (phone: string) => void
  disconnectFromPhone: (phone: string) => void
  disconnectAll: () => void
}

export function useWebSocketManager(callbacks: WebSocketCallbacks): UseWebSocketManagerReturn {
  const websockets = useRef<Map<string, WebSocket>>(new Map())
  const reconnectTimeouts = useRef<Map<string, number>>(new Map())

  const connectToPhone = useCallback(
    (phone: string) => {
      // Si ya existe una conexión para este teléfono, no crear otra
      if (websockets.current.has(phone)) {
        console.log(`[WebSocket] Already connected to ${phone}`)
        return
      }

      try {
        // Limpiar timeout de reconexión si existe
        const existingTimeout = reconnectTimeouts.current.get(phone)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          reconnectTimeouts.current.delete(phone)
        }

        const wsUrl = `ws://localhost:8080/ws/${(phone)}`
        console.log(`[WebSocket] Connecting to ${wsUrl}`)

        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log(`[WebSocket] Connected to ${phone}`)
          websockets.current.set(phone, ws)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log(`[WebSocket] Message received for ${phone}:`, data)
            callbacks.onStatusUpdate(data)
          } catch (error) {
            console.error(`[WebSocket] Error parsing message for ${phone}:`, error)
          }
        }

        ws.onerror = (error) => {
          console.error(`[WebSocket] Error for ${phone}:`, error)
          callbacks.onError(phone, error)
        }

        ws.onclose = (event) => {
            console.log(`[WebSocket] Disconnected from ${phone}. Code: ${event.code}, Reason: ${event.reason}`);
            websockets.current.delete(phone);
            callbacks.onDisconnect(phone);

            if (event.code !== 1000 && event.code !== 1001 && event.code !== 4001) {
                console.log(`[WebSocket] Attempting to reconnect to ${phone} in 3 seconds...`);
                const timeout = setTimeout(() => {
                connectToPhone(phone);
                }, 3000);
                reconnectTimeouts.current.set(phone, timeout);
            }
        };
      } catch (error) {
        console.error(`[WebSocket] Failed to create connection for ${phone}:`, error)
        callbacks.onError(phone, error as Event)
      }
    },
    [callbacks],
  )

  const disconnectFromPhone = useCallback((phone: string) => {
    const ws = websockets.current.get(phone)
    if (ws) {
      console.log(`[WebSocket] Manually disconnecting from ${phone}`)
      ws.close(1000, "Manual disconnect")
      websockets.current.delete(phone)
    }

    const timeout = reconnectTimeouts.current.get(phone)
    if (timeout) {
      clearTimeout(timeout)
      reconnectTimeouts.current.delete(phone)
    }
  }, [])

  const disconnectAll = useCallback(() => {
    console.log("[WebSocket] Disconnecting all connections")

    websockets.current.forEach((ws, phone) => {
      console.log(`[WebSocket] Closing connection to ${phone}`)
      ws.close(1000, "Disconnect all")
    })
    websockets.current.clear()

    reconnectTimeouts.current.forEach((timeout) => {
      clearTimeout(timeout)
    })
    reconnectTimeouts.current.clear()
  }, [])

  return {
    connectToPhone,
    disconnectFromPhone,
    disconnectAll,
  }
}
