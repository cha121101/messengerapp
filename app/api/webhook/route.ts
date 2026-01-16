import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const PAGE_TOKEN = process.env.PAGE_TOKEN as string
const VERIFY_TOKEN = process.env.VERIFY_TOKEN as string

// 🔹 VERIFY WEBHOOK (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
    // /mode === 'subscribe' && token === VERIFY_TOKEN
  if (true) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// 🔹 RECEIVE EVENTS (POST)
export async function POST(req: NextRequest) {
  const body = await req.json()

  const entry = body.entry?.[0]
  const event = entry?.messaging?.[0]
  const senderId = event?.sender?.id as string | undefined

  if (!senderId) {
    return NextResponse.json({ status: 'no sender' })
  }

  if (event.postback) {
    await handlePostback(senderId, event.postback.payload)
  }

  return NextResponse.json({ status: 'EVENT_RECEIVED' })
}


async function handlePostback(senderId: string, payload: string) {
  if (payload === 'GET_STARTED') {
    await sendButtons(senderId)
  }

  if (payload === 'PRICING') {
    await sendText(senderId, '💰 Our prices start at ₱50,000.')
  }

  if (payload === 'CONTACT') {
    await sendText(senderId, '📞 Contact us at 09XXXXXXXX.')
  }
}
async function sendButtons(senderId: string) {
  await callSendAPI({
    recipient: { id: senderId },
    message: {
      text: 'How can we help you?',
      quick_replies: [
        {
          content_type: 'text',
          title: '💰 Pricing',
          payload: 'PRICING',
        },
        {
          content_type: 'text',
          title: '📞 Contact',
          payload: 'CONTACT',
        },
      ],
    },
  })
}

async function sendText(senderId: string, text: string) {
  await callSendAPI({
    recipient: { id: senderId },
    message: { text },
  })
}

async function callSendAPI(data: any) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_TOKEN}`,
    data
  )
}
