// app/api/clients/pending/route.js
import { NextResponse } from 'next/server'


export async function GET(request) {

  // Usar variable de entorno o fallback a localhost
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'
  const url = `${backendUrl}/clients/pending?page=1&limit=5`

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Puedes añadir autenticación aquí si se requiere
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Error en proxy:', error)
    return NextResponse.json({ error: 'Error en el proxy' }, { status: 500 })
  }
}
