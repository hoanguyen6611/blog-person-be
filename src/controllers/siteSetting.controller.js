import SiteSetting from "../models/siteSetting.model.js";

const SECTIONS = ["banner", "site", "social", "seo"];
const SUPPORTED_LOCALES = ["vi", "en"];

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
  if (!isPlainObject(source)) return source;
  const result = { ...(isPlainObject(target) ? target : {}) };
  for (const key of Object.keys(source)) {
    result[key] = isPlainObject(source[key])
      ? deepMerge(result[key], source[key])
      : source[key];
  }
  return result;
}

function isLocalizedField(value) {
  return isPlainObject(value) && ("vi" in value || "en" in value);
}

function resolveLocale(section, locale) {
  if (!isPlainObject(section)) return section;
  const resolved = {};
  for (const [key, value] of Object.entries(section)) {
    resolved[key] = isLocalizedField(value)
      ? value[locale] || value.vi || value.en || ""
      : value;
  }
  return resolved;
}

async function getOrCreateSettings() {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create({});
  }
  return settings;
}

export const getSiteSettings = async (req, res) => {
  const settings = await getOrCreateSettings();
  const locale = req.query.locale;

  if (locale && SUPPORTED_LOCALES.includes(locale)) {
    const obj = settings.toObject();
    return res.status(200).json({
      banner: resolveLocale(obj.banner, locale),
      site: resolveLocale(obj.site, locale),
      social: obj.social,
      seo: resolveLocale(obj.seo, locale),
      updatedAt: obj.updatedAt,
    });
  }

  res.status(200).json(settings);
};

export const updateSiteSettings = async (req, res) => {
  const settings = await getOrCreateSettings();

  SECTIONS.forEach((section) => {
    if (isPlainObject(req.body[section])) {
      const current = settings[section]?.toObject
        ? settings[section].toObject()
        : settings[section] || {};
      settings[section] = deepMerge(current, req.body[section]);
    }
  });

  await settings.save();
  res.status(200).json(settings);
};
