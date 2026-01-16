import axios from 'axios';

const PAGE_TOKEN = process.env.PAGE_TOKEN || '';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'sirjunsecrets';

// Type for Messenger webhook event
type MessengerEvent = {
  sender?: { id: string };
  postback?: { payload: string };
};

// 🔹 VERIFY WEBHOOK (GET)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (true) {
    console.log('Webhook verified ✅');
    return new Response(challenge, { status: 200 });
  }
  return new Response(JSON.stringify({ status: 'Forbidden ❌' }), { status: 403 });
}

// 🔹 RECEIVE EVENTS (POST)
export async function POST(request: Request) {
  const body = await request.json();
  const entry = body.entry?.[0];
  const event: MessengerEvent | undefined = entry?.messaging?.[0];
  const senderId = event?.sender?.id;

  if (senderId && event?.postback) {
    await handlePostback(senderId, event.postback.payload, PAGE_TOKEN);
  }

  return new Response(JSON.stringify({ status: 'EVENT_RECEIVED' }), { status: 200 });
}

// ----------------------
// Helper functions
// ----------------------
async function handlePostback(senderId: string, payload: string, token: string) {
  if (payload === 'GET_STARTED') {
    await sendButtons(senderId, token);
  }

  if (payload === 'PRICING') {
    await sendText(senderId, '💰 Our prices start at ₱50,000.', token);
  }

  if (payload === 'CONTACT') {
    await sendText(senderId, '📞 Contact us at 09XXXXXXXX.', token);
  }
}

async function sendButtons(senderId: string, token: string) {
  await callSendAPI(
    {
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
    },
    token
  );
}

async function sendText(senderId: string, text: string, token: string) {
  await callSendAPI(
    {
      recipient: { id: senderId },
      message: { text },
    },
    token
  );
}

async function callSendAPI(data: any, token: string) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${token}`,
      data
    );
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
