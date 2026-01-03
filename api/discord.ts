import type { VercelRequest, VercelResponse } from '@vercel/node';

// SECURITY NOTE: Use Environment Variables in Vercel for these!
// const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1455015990231433237/VzoD8Y_qppt605m2bS1OaHRz3GPOGoisGxj5Hp2e_QqW2CC1Az6jioUNVe0nJ_1v5wdT';
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

  try {
    // 2. Forward the request stream directly to Discord
    // We pass the raw 'req' stream. This works efficiently for both JSON and large Files.
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        // We MUST forward the Content-Type header. 
        // For files, this contains the 'boundary' string which Discord needs to parse the file.
        'Content-Type': req.headers['content-type'] as string,
      },
      // @ts-ignore: Node's fetch supports passing an IncomingMessage (req) as the body stream
      body: req,
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Discord Webhook Error:', errorText);
      return res.status(webhookResponse.status).json({ error: 'Failed to send to Discord', details: errorText });
    }

    // 3. Get the Message ID to add reactions
    // Note: If we just streamed a file, waiting for the JSON response confirms Discord received it.
    const message = await webhookResponse.json();

    // 4. Optional: Add Reactions (Only works if BOT_TOKEN is set)
    if (BOT_TOKEN && message.id && message.channel_id) {
       // We don't await this to keep the response fast for the user
       addReactions(message.channel_id, message.id, BOT_TOKEN).catch(console.error);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
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
