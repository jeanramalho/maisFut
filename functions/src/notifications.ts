import * as admin from 'firebase-admin';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  fcmToken: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        notification: {
          color: '#2CFF05', // Verde neon
          icon: 'ic_notification',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

export async function sendMulticastNotification(
  fcmTokens: string[],
  payload: NotificationPayload
): Promise<void> {
  if (fcmTokens.length === 0) return;

  try {
    const message = {
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        notification: {
          color: '#2CFF05',
          icon: 'ic_notification',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Multicast notification sent: ${response.successCount} successful, ${response.failureCount} failed`);
    
    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Token ${fcmTokens[idx]} failed:`, resp.error);
          if (resp.error?.code === 'messaging/registration-token-not-registered') {
            failedTokens.push(fcmTokens[idx]);
          }
        }
      });
      
      // You might want to remove these failed tokens from user profiles
      console.log('Failed tokens to clean up:', failedTokens);
    }
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
}