import webpush, { ensureWebPushConfigured } from "../lib/webpush.js";
import PushSubscription from "../models/pushSubscription.model.js";

// payload: { title, body, url } - khớp với parser trong public/sw.js phía FE
export async function sendPushToUser(userId, payload) {
  if (!ensureWebPushConfigured()) {
    console.error(
      "Web push chưa được cấu hình (thiếu VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY trong .env)"
    );
    return;
  }

  const subscriptions = await PushSubscription.find({ user: userId });
  if (!subscriptions.length) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          body
        );
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription hết hạn hoặc bị trình duyệt/user thu hồi -> dọn khỏi DB
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error("Push notification error:", err.message);
        }
      }
    })
  );
}
