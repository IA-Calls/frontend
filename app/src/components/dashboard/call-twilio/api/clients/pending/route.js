// app/api/clients/pending/route.js
import { NextResponse } from 'next/server'

const EXTERNAL_CLIENTS_API_URL = 'https://calls-service-754698887417.us-central1.run.app'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '5'

  const url = `http://localhost:5000/clients/pending?page=1&limit=5`

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
