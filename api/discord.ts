import type { VercelRequest, VercelResponse } from '@vercel/node';

// Discord webhook URL - extract ID and token
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1455015990231433237/VzoD8Y_qppt605m2bS1OaHRz3GPOGoisGxj5Hp2e_QqW2CC1Az6jioUNVe0nJ_1v5wdT';
const WEBHOOK_ID = '1455015990231433237';
const WEBHOOK_TOKEN = 'VzoD8Y_qppt605m2bS1OaHRz3GPOGoisGxj5Hp2e_QqW2CC1Az6jioUNVe0nJ_1v5wdT';

// Helper function to encode emoji for URL
function encodeEmoji(emoji: string): string {
  // For Unicode emojis like ⬆️ and ⬇️, Discord expects them URL-encoded
  // But we need to handle the emoji properly - use the Unicode name or encode it
  return encodeURIComponent(emoji);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Send the webhook message
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook error:', errorText);
      return res.status(webhookResponse.status).json({ error: 'Failed to send webhook' });
    }

    // Get the message ID from the response
    const message = await webhookResponse.json();
    const messageId = message.id;

    if (!messageId) {
      console.error('No message ID in response:', message);
      return res.status(500).json({ error: 'Failed to get message ID' });
    }

    // Add reactions using the webhook token
    const upArrow = encodeEmoji('⬆️');
    const downArrow = encodeEmoji('⬇️');

    // Add up arrow reaction
    const upReaction = await fetch(
      `https://discord.com/api/webhooks/${WEBHOOK_ID}/${WEBHOOK_TOKEN}/messages/${messageId}/reactions/${upArrow}/@me`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Add down arrow reaction
    const downReaction = await fetch(
      `https://discord.com/api/webhooks/${WEBHOOK_ID}/${WEBHOOK_TOKEN}/messages/${messageId}/reactions/${downArrow}/@me`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Return success even if reactions fail (message was sent)
    return res.status(200).json({
      success: true,
      messageId,
      reactionsAdded: {
        up: upReaction.ok,
        down: downReaction.ok,
      },
    });
  } catch (error) {
    console.error('Error in discord webhook handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

