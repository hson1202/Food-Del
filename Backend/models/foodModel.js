import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  nameVI: { type: String, trim: true },
  nameEN: { type: String, trim: true },
  nameSK: { type: String, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, default: "No description provided" },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  category: { type: String, required: true, trim: true },
  isPromotion: { type: Boolean, default: false },
  originalPrice: { type: Number },
  promotionPrice: { type: Number },
  soldCount: { type: Number, default: 0, min: 0 },
  likes: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  language: { type: String, enum: ["vi", "en", "sk"], default: "vi", required: true }
}, { timestamps: true });

// ---- helpers ----
const stripEdges = (s) => s.replace(/^-+|-+$/g, "");

const normalize = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const createSlug = (name) => stripEdges(normalize(name));
const cleanSlug  = (slug) => stripEdges(normalize(slug));

async function makeUniqueSlug(Model, base, currentId) {
  // Đếm số slug đã có dạng base hoặc base-<số>, loại trừ chính doc đang sửa
  const regex = new RegExp(`^${base}(?:-(\\d+))?$`, "i");
  const existing = await Model.find({ slug: regex, _id: { $ne: currentId } })
                              .select("slug").lean();
  if (existing.length === 0) return base;

  // Tìm số lớn nhất để +1 (tránh vòng while dài)
  let maxN = 1;
  for (const { slug } of existing) {
    const m = slug.match(/-(\d+)$/);
    if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
    if (slug.toLowerCase() === base.toLowerCase()) maxN = Math.max(maxN, 1);
  }
  return `${base}-${maxN + 1}`;
}

// Tạo/validate slug & đảm bảo unique (một bản duy nhất, không theo language)
foodSchema.pre("validate", async function (next) {
  try {
    if (this.isModified("slug") && this.slug) this.slug = cleanSlug(this.slug);
    if (!this.slug || this.isModified("name")) this.slug = createSlug(this.name);
    this.slug = await makeUniqueSlug(this.constructor, this.slug, this._id);
    next();
  } catch (e) { next(e); }
});

foodSchema.index({ name: "text", description: "text" }, { default_language: "english" });

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

// Đảm bảo index được tạo khi khởi động
foodModel.init().then(() => console.log("✅ Food indexes ensured")).catch(console.error);

export default foodModel;