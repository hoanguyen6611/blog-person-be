// cron/newsletterJob.js
import cron from "node-cron";
import { sendDigestToSubscribers } from "../utils/newsletterDigest.js";

// Every Tuesday at 08:00 — matches the "mỗi thứ Ba" promise shown in the
// Footer/banner newsletter copy.
cron.schedule("0 8 * * 2", async () => {
  const result = await sendDigestToSubscribers();
  if (result.skipped) {
    console.log(`📭 Bỏ qua gửi bản tin: ${result.reason}`);
  } else {
    console.log(
      `📬 Đã gửi bản tin tới ${result.sent} người đăng ký (${result.failed} thất bại)`
    );
  }
});
