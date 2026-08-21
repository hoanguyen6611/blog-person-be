import Social from "../models/social.model.js";

export const createNewSocial = async (req, res) => {
  const user = req.dbUser;
  const socials = await Social.findOne({
    url: req.body.url,
    name: req.body.url,
    user: user._id,
  });
  if (socials) {
    return res.status(200).json({ message: "Social of user has existed" });
  }
  const socialSchema = new Social({ ...req.body, user: user._id });
  const social = await socialSchema.save();
  res.status(200).json({ social, message: "Add social succesfully" });
};
