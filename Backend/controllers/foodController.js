import foodModel from "../models/foodModel.js";
import fs from "fs";

const addFood = async (req, res) => {
  try {
    const {
      sku, name, description, price, category, language,
      nameVI, nameEN, nameSK,
      isPromotion, originalPrice, promotionPrice,
      soldCount, likes
      // KHÔNG cần nhận slug từ client; nếu có cũng ok, model sẽ làm sạch + unique
    } = req.body;

    if (!sku?.trim()) return res.status(400).json({ success:false, message:"SKU is required" });
    if (!name?.trim()) return res.status(400).json({ success:false, message:"Name is required" });
    if (price === undefined || price === null || isNaN(Number(price)))
      return res.status(400).json({ success:false, message:"Valid price is required" });
    if (!category?.trim())
      return res.status(400).json({ success:false, message:"Category is required" });

    const image_filename = req.file ? `${req.file.filename}` : "";

    const isPromotionBool =
      isPromotion === true || isPromotion === "true" || isPromotion === 1 || isPromotion === "1";

    const doc = new foodModel({
      sku: sku.trim(),
      name: name.trim(),
      nameVI: nameVI?.trim(),
      nameEN: nameEN?.trim(),
      nameSK: nameSK?.trim(),
      // slug: BỎ qua ở đây để model tự tạo/unique
      description: description?.trim() || "No description provided",
      price: Number(price),
      category: category.trim(),
      image: image_filename,
      isPromotion: isPromotionBool,
      originalPrice: isPromotionBool ? Number(originalPrice ?? price) : undefined,
      promotionPrice: isPromotionBool ? Number(promotionPrice) : undefined,
      soldCount: Number.isFinite(Number(soldCount)) ? Number(soldCount) : 0,
      likes: Number.isFinite(Number(likes)) ? Number(likes) : 0,
      status: "active",
      language: (language || "vi").trim()
    });

    await doc.save();
    return res.json({ success: true, message: "Food Added", data: doc });

  } catch (error) {
    console.error("ADD FOOD ERROR:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "unique field";
      return res.status(400).json({ success:false, message:`Duplicate ${field}` });
    }
    if (error.name === "ValidationError") {
      const details = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success:false, message:"Validation error", details });
    }
    return res.status(500).json({ success:false, message:"Internal server error" });
  }
};

//list food items
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({ status: "active" })
        res.json({ success: true, data: foods })
    } catch (error) {
        console.error('Error listing foods:', error)
        res.status(500).json({ success: false, message: "Error listing foods" })
    }
}

//remove food item
const removeFood = async (req, res) => {
    try {
        const { id } = req.body
        await foodModel.findByIdAndDelete(id)
        res.json({ success: true, message: "Food removed" })
    } catch (error) {
        console.error('Error removing food:', error)
        res.status(500).json({ success: false, message: "Error removing food" })
    }
}

//update food status
const updateFoodStatus = async (req, res) => {
    try {
        const { id, status } = req.body
        await foodModel.findByIdAndUpdate(id, { status })
        res.json({ success: true, message: "Status updated" })
    } catch (error) {
        console.error('Error updating food status:', error)
        res.status(500).json({ success: false, message: "Error updating status" })
    }
}

//update food item (edit product)
const updateFood = async (req, res) => {
    try {
        const { id } = req.params
        const {
            sku, name, description, price, category, language,
            nameVI, nameEN, nameSK,
            isPromotion, originalPrice, promotionPrice,
            soldCount, likes
        } = req.body

        // Validate required fields
        if (!sku?.trim()) return res.status(400).json({ success: false, message: "SKU is required" })
        if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" })
        if (price === undefined || price === null || isNaN(Number(price)))
            return res.status(400).json({ success: false, message: "Valid price is required" })
        if (!category?.trim())
            return res.status(400).json({ success: false, message: "Category is required" })

        // Handle image update
        let updateData = {
            sku: sku.trim(),
            name: name.trim(),
            nameVI: nameVI?.trim(),
            nameEN: nameEN?.trim(),
            nameSK: nameSK?.trim(),
            description: description?.trim() || "No description provided",
            price: Number(price),
            category: category.trim(),
            isPromotion: isPromotion === true || isPromotion === "true" || isPromotion === 1 || isPromotion === "1",
            originalPrice: isPromotion ? Number(originalPrice ?? price) : undefined,
            promotionPrice: isPromotion ? Number(promotionPrice) : undefined,
            soldCount: Number.isFinite(Number(soldCount)) ? Number(soldCount) : 0,
            likes: Number.isFinite(Number(likes)) ? Number(likes) : 0,
            language: (language || "vi").trim()
        }

        // If new image uploaded, update image field
        if (req.file) {
            updateData.image = req.file.filename
        }

        const updatedFood = await foodModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedFood) {
            return res.status(404).json({ success: false, message: "Food not found" })
        }

        res.json({ success: true, message: "Food updated successfully", data: updatedFood })

    } catch (error) {
        console.error('UPDATE FOOD ERROR:', error)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "unique field"
            return res.status(400).json({ success: false, message: `Duplicate ${field}` })
        }
        if (error.name === "ValidationError") {
            const details = Object.values(error.errors).map(e => e.message)
            return res.status(400).json({ success: false, message: "Validation error", details })
        }
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export { addFood, listFood, removeFood, updateFoodStatus, updateFood }