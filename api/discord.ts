import type { VercelRequest, VercelResponse } from '@vercel/node';

// Discord webhook URL - extract ID and token
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1455015990231433237/VzoD8Y_qppt605m2bS1OaHRz3GPOGoisGxj5Hp2e_QqW2CC1Az6jioUNVe0nJ_1v5wdT';
const WEBHOOK_ID = '1455015990231433237';
const WEBHOOK_TOKEN = 'VzoD8Y_qppt605m2bS1OaHRz3GPOGoisGxj5Hp2e_QqW2CC1Az6jioUNVe0nJ_1v5wdT';

// Discord Bot Token (optional - for adding reactions)
// Set this in Vercel environment variables as DISCORD_BOT_TOKEN
// Webhooks cannot add reactions - only bots can!
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Helper function to encode emoji for Discord API
function encodeEmoji(emoji: string): string {
  // Discord API requires emojis to be URL-encoded
  // For Unicode emojis, we encode the entire string
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

    // If message was sent but we can't get the ID, still return success
    // The webhook message was delivered successfully
    if (!messageId) {
      console.warn('No message ID in response, but webhook was sent:', message);
      // Still return success since the message was sent
      return res.status(200).json({
        success: true,
        messageId: null,
        message: 'Webhook sent successfully (message ID unavailable)',
        reactionsAdded: {
          up: false,
          down: false,
        },
      });
    }

    // Add reactions using bot token (webhooks cannot add reactions)
    let upReaction, downReaction;
    
    // Try to add reactions, but don't fail the request if this doesn't work
    try {
      if (BOT_TOKEN) {
        // Wait a moment for Discord to process the message before adding reactions
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get channel ID from the message
        const channelId = message.channel_id;
        
        if (channelId) {
          // Discord requires emojis to be URL-encoded in the path
          const upArrow = encodeURIComponent('⬆️');
          const downArrow = encodeURIComponent('⬇️');

          // Add reactions using bot token via REST API
          // Format: PUT /channels/{channel.id}/messages/{message.id}/reactions/{emoji}/@me
          try {
            // Add up arrow reaction
            upReaction = await fetch(
              `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${upArrow}/@me`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bot ${BOT_TOKEN}`,
                },
              }
            );
            
            if (!upReaction.ok) {
              const upError = await upReaction.text();
              console.error('Failed to add up arrow reaction:', upError, upReaction.status);
            }

            // Add down arrow reaction
            downReaction = await fetch(
              `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${downArrow}/@me`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': `Bot ${BOT_TOKEN}`,
                },
              }
            );
            
            if (!downReaction.ok) {
              const downError = await downReaction.text();
              console.error('Failed to add down arrow reaction:', downError, downReaction.status);
            }
          } catch (reactionErr) {
            console.error('Error adding reactions:', reactionErr);
            // Don't throw - reactions are optional
          }
        } else {
          console.warn('No channel_id in webhook response - cannot add reactions');
        }
      } else {
        console.warn('DISCORD_BOT_TOKEN not set - reactions will not be added automatically. Webhooks cannot add reactions.');
      }
    } catch (reactionError) {
      console.error('Error in reaction handling:', reactionError);
      // Don't fail the request - the webhook message was sent successfully
    }

    // Return success even if reactions fail (message was sent)
    return res.status(200).json({
      success: true,
      messageId,
      reactionsAdded: {
        up: upReaction?.ok || false,
        down: downReaction?.ok || false,
      },
    });
  } catch (error) {
    console.error('Error in discord webhook handler:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

