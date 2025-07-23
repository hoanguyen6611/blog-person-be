import Social from "../models/social.model.js";
import User from "../models/user.model.js";

export const createNewSocial = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json("Not authenticated");
  }
  const user = await User.findOne({ clerkUserId });
  const socials = await Social.findOne({
    url: req.body.url,
    name: req.body.url,
    user: user._id,
  });
  if (socials) {
    res.status(200).json({ message: "Social of user has existed" });
  } else if (!socials) {
    const socialSchema = new Social({ ...req.body, user: user._id });
    const social = await socialSchema.save();
    res.status(200).json({ social, message: "Add social succesfully" });
  }
};
