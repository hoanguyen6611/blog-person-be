import User from "../models/user.model.js";
import { Webhook } from "svix";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.log("Error");
    throw new Error("Webhook secret needed!");
  }
  const payload = req.body;
  const headers = req.headers;
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    res.status(400).json({
      message: "Webhook verification failed",
    });
  }
  console.log(evt);
  if (evt.type === "user.created") {
    console.log(evt);
    const newUser = new User({
      clerkUserId: evt.data.id,
      username: evt.data.username || evt.data.email_addresses[0].email_address,
      email: evt.data.email_addresses[0].email_address,
      img: evt.data.profile_image_url,
      fullname,
    });
    console.log(newUser);
    await newUser.save();
  }
  return res.status(200).json({
    message: "Webhook received",
  });
};
