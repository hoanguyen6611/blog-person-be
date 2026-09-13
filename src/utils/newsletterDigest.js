import Post from "../models/post.model.js";
import Subscriber from "../models/subscriber.model.js";
import { getResendClient } from "../lib/resendClient.js";

const DIGEST_POST_LIMIT = 3;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Same "trending" definition as GET /posts?sort=trending — published in the
// last 7 days, most-viewed first — so "3 bài đáng đọc nhất tuần này" means
// the same thing here as it does everywhere else in the app.
export async function getTrendingPosts(limit = DIGEST_POST_LIMIT) {
  return Post.find({
    isPublished: true,
    createdAt: { $gte: new Date(Date.now() - SEVEN_DAYS_MS) },
  })
    .sort({ visit: -1 })
    .limit(limit)
    .select("title desc slug createdAt");
}

const clientUrl = () => (process.env.CLIENT_URL || "").replace(/\/+$/, "");

function buildDigestHtml(posts, subscriberId) {
  const postRows = posts
    .map(
      (post) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e2e2e4;">
            <a href="${clientUrl()}/posts/${post.slug}" style="font-size:16px;font-weight:700;color:#1c2024;text-decoration:none;">
              ${post.title}
            </a>
            ${
              post.desc
                ? `<p style="margin:6px 0 0;font-size:14px;color:#6f6f77;line-height:1.5;">${post.desc}</p>`
                : ""
            }
          </td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h1 style="font-size:20px;color:#1c2024;margin:0 0 4px;">Ba bài đáng đọc nhất tuần này</h1>
      <p style="font-size:13px;color:#8b8d98;margin:0 0 20px;">Chọn ra từ những bài viết nhiều lượt xem nhất 7 ngày qua.</p>
      <table style="width:100%;border-collapse:collapse;">${postRows}</table>
      <p style="margin-top:24px;font-size:12px;color:#b9bbc6;">
        Bạn nhận được email này vì đã đăng ký bản tin trên Tech News.
        <a href="${clientUrl()}/newsletter/unsubscribe?id=${subscriberId}" style="color:#8b8d98;">Huỷ đăng ký</a>
      </p>
    </div>`;
}

// Returns a summary instead of throwing on partial failure — a bad address
// among hundreds of subscribers shouldn't sink the whole send.
export async function sendDigestToSubscribers() {
  const resend = getResendClient();
  if (!resend) {
    return {
      sent: 0,
      failed: 0,
      skipped: true,
      reason: "RESEND_API_KEY chưa được cấu hình",
    };
  }

  const posts = await getTrendingPosts();
  if (posts.length === 0) {
    return { sent: 0, failed: 0, skipped: true, reason: "Không có bài viết nào trong 7 ngày qua" };
  }

  const subscribers = await Subscriber.find({ isActive: true });
  const from = process.env.NEWSLETTER_FROM_EMAIL || "Tech News <onboarding@resend.dev>";

  let sent = 0;
  let failed = 0;
  for (const subscriber of subscribers) {
    try {
      // resend.emails.send() không throw khi API trả lỗi (vd. key sai, domain
      // chưa xác thực...) - nó resolve với { data: null, error }. Phải tự
      // kiểm tra field error, nếu không mọi lỗi API sẽ bị đếm nhầm là "sent".
      const { error } = await resend.emails.send({
        from,
        to: subscriber.email,
        subject: "Ba bài đáng đọc nhất tuần này",
        html: buildDigestHtml(posts, subscriber._id),
      });
      if (error) throw new Error(error.message || "Resend API error");
      sent += 1;
    } catch (err) {
      failed += 1;
      console.error(`Gửi bản tin thất bại cho ${subscriber.email}:`, err.message);
    }
  }

  return { sent, failed, skipped: false, postCount: posts.length };
}
