import mongoose from "mongoose";

// Text đa ngôn ngữ: mỗi field dịch có 2 giá trị riêng theo locale.
const localizedText = {
  vi: { type: String, default: "" },
  en: { type: String, default: "" },
};

const siteSettingSchema = new mongoose.Schema(
  {
    banner: {
      eyebrow: localizedText, // vd. "TECH NEWS"
      title: localizedText, // vd. "Transform ideas into impact."
      subtitle: localizedText,
      primaryButtonText: localizedText,
      primaryButtonLink: localizedText,
      secondaryButtonText: localizedText,
      secondaryButtonLink: localizedText,
      image: { type: String, default: "" }, // ảnh dùng chung, không theo locale
    },
    site: {
      name: localizedText,
      description: localizedText,
      footerText: localizedText,
      logo: { type: String, default: "" },
      favicon: { type: String, default: "" },
      contactEmail: { type: String, default: "" },
    },
    social: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    seo: {
      metaTitle: localizedText,
      metaDescription: localizedText,
      ogImage: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSetting", siteSettingSchema);
