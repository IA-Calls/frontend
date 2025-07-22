import { NextResponse } from "next/server"

const EXTERNAL_OUTBOUND_CALL_API_URL = "https://twilio-call-754698887417.us-central1.run.app/outbound-call"

export async function POST(request) {
  console.log("--- Received request in /api/outbound-call proxy ---")
  try {
    const body = await request.json()
    const { number } = body

    if (!number) {
      console.error("Error: Missing 'number' in request body for outbound call.")
      return new NextResponse(JSON.stringify({ message: "Missing 'number' in request body" }), { status: 400 })
    }

    console.log(`Forwarding call request for number: ${number} to external API: ${EXTERNAL_OUTBOUND_CALL_API_URL}`)
    const response = await fetch(EXTERNAL_OUTBOUND_CALL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error from external outbound call API: ${response.status} - ${errorText}`)
      return new NextResponse(errorText, { status: response.status })
    }

    const data = await response.json()
    console.log("Successfully forwarded call request. External API response:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Critical Error in outbound call proxy route:", error)
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
  } finally {
    console.log("--- Finished processing /api/outbound-call proxy request ---")
  }
}
