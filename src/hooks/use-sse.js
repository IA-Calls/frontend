import { useEffect, useRef, useState, useCallback } from 'react';

export const useSSE = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  
  const {
    maxReconnectAttempts = 5,
    reconnectDelay = 3000,
    onMessage,
    onStatusUpdate,
    onBatchCompleted,
    onError,
    onConnect,
    onDisconnect
  } = options;

  const connect = useCallback(() => {
    if (!url) return;

    try {
      // Cerrar conexión existente si hay una
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Crear nueva conexión SSE
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // Evento de conexión abierta
      eventSource.onopen = () => {
        console.log('SSE conectado:', url);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      // Evento de error
      eventSource.onerror = (event) => {
        console.error('SSE error:', event);
        setIsConnected(false);
        setError('Error de conexión SSE');
        onError?.(event);
        
        // Intentar reconectar automáticamente
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconectando SSE (intento ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error('Máximo número de intentos de reconexión alcanzado');
          setError('No se pudo reconectar después de múltiples intentos');
        }
      };

      // Evento de mensaje general
      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
          onMessage?.(parsedData);
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      // Evento de actualización de estado
      eventSource.addEventListener('status-update', (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          console.log('SSE Status Update:', parsedData);
          setData(parsedData);
          onStatusUpdate?.(parsedData);
        } catch (err) {
          console.error('Error parsing status-update:', err);
        }
      });

      // Evento de finalización de batch
      eventSource.addEventListener('batch-completed', (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          console.log('SSE Batch Completed:', parsedData);
          setData(parsedData);
          onBatchCompleted?.(parsedData);
          
          // Cerrar conexión cuando se complete el batch
          setTimeout(() => {
            disconnect();
          }, 1000);
        } catch (err) {
          console.error('Error parsing batch-completed:', err);
        }
      });

      // Evento de conexión cerrada
      eventSource.addEventListener('close', () => {
        console.log('SSE conexión cerrada');
        setIsConnected(false);
        onDisconnect?.();
      });

    } catch (err) {
      console.error('Error creating SSE connection:', err);
      setError(err.message);
      onError?.(err);
    }
  }, [url, maxReconnectAttempts, reconnectDelay, onMessage, onStatusUpdate, onBatchCompleted, onError, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
    onDisconnect?.();
  }, [onDisconnect]);

  // Conectar automáticamente cuando cambie la URL
  useEffect(() => {
    if (url) {
      connect();
    }

    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return {
    isConnected,
    error,
    data,
    connect,
    disconnect
  };
};
