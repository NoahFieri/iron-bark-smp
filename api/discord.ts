import type { VercelRequest, VercelResponse } from '@vercel/node';

// SECURITY NOTE: We read the full URL from the environment variable.
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; 
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// CRITICAL: Disable the default body parser.
// This allows us to handle 'multipart/form-data' (file uploads) as a raw stream.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if the environment variable is set
  if (!WEBHOOK_URL) {
    console.error('Missing DISCORD_WEBHOOK_URL environment variable');
    return res.status(500).json({ error: 'Server Configuration Error: DISCORD_WEBHOOK_URL is missing in Vercel Settings' });
  }

  try {
    // 2. Forward the request stream directly to Discord
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        // We MUST forward the Content-Type header (contains the 'boundary' for files)
        'Content-Type': req.headers['content-type'] as string,
      },
      // @ts-ignore: Node's fetch supports passing an IncomingMessage (req) as the body stream
      body: req,
      // IMPORTANT: 'duplex: half' is REQUIRED when streaming the body in Node.js 18+ (Vercel)
      // @ts-ignore: Type definition might not have duplex yet
      duplex: 'half',
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Discord Webhook Error:', errorText);
      return res.status(webhookResponse.status).json({ error: 'Failed to send to Discord', details: errorText });
    }

    // 3. Get the Message ID to add reactions
    let message;
    try {
        message = await webhookResponse.json();
    } catch (e) {
        // Webhooks sometimes return 204 No Content (empty body)
    }

    // 4. Optional: Add Reactions (Only works if BOT_TOKEN is set)
    if (BOT_TOKEN && message && message.id && message.channel_id) {
       addReactions(message.channel_id, message.id, BOT_TOKEN).catch(console.error);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server Error:', error);
    // Return the actual error message for debugging
    return res.status(500).json({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Helper to add reactions (Fire and Forget)
async function addReactions(channelId: string, messageId: string, token: string) {
    // Wait 1s for message to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const upArrow = encodeURIComponent('⬆️');
    const downArrow = encodeURIComponent('⬇️');
    const baseUrl = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions`;

    await fetch(`${baseUrl}/${upArrow}/@me`, { method: 'PUT', headers: { Authorization: `Bot ${token}` } });
    await fetch(`${baseUrl}/${downArrow}/@me`, { method: 'PUT', headers: { Authorization: `Bot ${token}` } });
}
