import foodModel from "../models/foodModel.js";
import fs from "fs";

const addFood = async (req, res) => {
  try {
            const {
            sku, name, description, price, category,
            nameVI, nameEN, nameSK,
            isPromotion, promotionPrice,
            soldCount, quantity, slug
            // slug có thể để trống để model tự tạo
        } = req.body;

    if (!sku?.trim()) return res.status(400).json({ success:false, message:"SKU is required" });
    if (!name?.trim()) return res.status(400).json({ success:false, message:"Name is required" });
    if (price === undefined || price === null || isNaN(Number(price)))
      return res.status(400).json({ success:false, message:"Valid price is required" });
    if (!category?.trim())
      return res.status(400).json({ success:false, message:"Category is required" });
    if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) < 0)
      return res.status(400).json({ success:false, message:"Valid quantity is required (must be >= 0)" });

    const image_filename = req.file ? `${req.file.filename}` : "";

    const isPromotionBool =
      isPromotion === true || isPromotion === "true" || isPromotion === 1 || isPromotion === "1";

    const doc = new foodModel({
      sku: sku.trim(),
      name: name.trim(),
      nameVI: nameVI?.trim(),
      nameEN: nameEN?.trim(),
      nameSK: nameSK?.trim(),
      // Only set slug if provided, otherwise let model generate it
      ...(slug?.trim() && { slug: slug.trim() }),
      description: description?.trim() || "No description provided",
      price: Number(price),
      category: category.trim(),
      image: image_filename,
      quantity: Number(quantity),
      isPromotion: isPromotionBool,
      // originalPrice removed - using regular price as base
      promotionPrice: isPromotionBool ? Number(promotionPrice) : undefined,
      soldCount: Number.isFinite(Number(soldCount)) ? Number(soldCount) : 0,
      status: "active"
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
      const { status = 'all', search, category, forUser = false } = req.query
      const filter = {}
  
      // Nếu là request từ user (frontend), chỉ trả về sản phẩm active
      if (forUser === 'true' || forUser === true) {
        filter.status = 'active'
      } else if (status !== 'all') {
        filter.status = status
      }
      
      if (category) filter.category = category
      if (search) {
        const rx = new RegExp(search, 'i')
        filter.$or = [
          { name: rx }, { nameVI: rx }, { nameEN: rx }, { nameSK: rx },
          { category: rx }, { sku: rx }
        ]
      }
  
      const foods = await foodModel.find(filter).sort({ createdAt: -1 })
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
            sku, name, description, price, category,
            nameVI, nameEN, nameSK,
            isPromotion, promotionPrice,
            soldCount, quantity, slug
        } = req.body

        // Validate required fields
        if (!sku?.trim()) return res.status(400).json({ success: false, message: "SKU is required" })
        if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" })
        if (price === undefined || price === null || isNaN(Number(price)))
            return res.status(400).json({ success: false, message: "Valid price is required" })
        if (!category?.trim())
            return res.status(400).json({ success: false, message: "Category is required" })
        if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) < 0)
            return res.status(400).json({ success: false, message: "Valid quantity is required (must be >= 0)" })

        // Handle image update
        let updateData = {
            sku: sku.trim(),
            name: name.trim(),
            nameVI: nameVI?.trim(),
            nameEN: nameEN?.trim(),
            nameSK: nameSK?.trim(),
            // Don't update slug if it's empty - keep existing one
            ...(slug?.trim() && { slug: slug.trim() }),
            description: description?.trim() || "No description provided",
            price: Number(price),
            category: category.trim(),
            quantity: Number(quantity),
            isPromotion: isPromotion === true || isPromotion === "true" || isPromotion === 1 || isPromotion === "1",
            // originalPrice removed - using regular price as base
            promotionPrice: isPromotion ? Number(promotionPrice) : undefined,
            soldCount: Number.isFinite(Number(soldCount)) ? Number(soldCount) : 0
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

//update food quantity (for inventory management)
const updateFoodQuantity = async (req, res) => {
    try {
        const { id, quantity } = req.body
        
        if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) < 0) {
            return res.status(400).json({ success: false, message: "Valid quantity is required (must be >= 0)" })
        }

        const updatedFood = await foodModel.findByIdAndUpdate(
            id,
            { quantity: Number(quantity) },
            { new: true, runValidators: true }
        )

        if (!updatedFood) {
            return res.status(404).json({ success: false, message: "Food not found" })
        }

        res.json({ success: true, message: "Quantity updated successfully", data: updatedFood })

    } catch (error) {
        console.error('UPDATE FOOD QUANTITY ERROR:', error)
        if (error.name === "ValidationError") {
            const details = Object.values(error.errors).map(e => e.message)
            return res.status(400).json({ success: false, message: "Validation error", details })
        }
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

//process order and update inventory
const processOrder = async (req, res) => {
    try {
        const { orderItems } = req.body; // Array of { foodId, quantity }
        
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Order items are required" 
            });
        }

        const results = [];
        const errors = [];

        for (const item of orderItems) {
            const { foodId, quantity } = item;
            
            if (!foodId || !quantity || quantity <= 0) {
                errors.push(`Invalid item: foodId=${foodId}, quantity=${quantity}`);
                continue;
            }

            try {
                const food = await foodModel.findById(foodId);
                if (!food) {
                    errors.push(`Food not found: ${foodId}`);
                    continue;
                }

                if (food.quantity < quantity) {
                    errors.push(`Insufficient stock for ${food.name}: available=${food.quantity}, requested=${quantity}`);
                    continue;
                }

                // Update quantity and soldCount
                const updatedFood = await foodModel.findByIdAndUpdate(
                    foodId,
                    {
                        $inc: { 
                            quantity: -quantity,  // Decrease quantity
                            soldCount: quantity  // Increase soldCount
                        }
                    },
                    { new: true, runValidators: true }
                );

                results.push({
                    foodId,
                    name: food.name,
                    quantity: quantity,
                    newStock: updatedFood.quantity,
                    totalSold: updatedFood.soldCount
                });

            } catch (error) {
                errors.push(`Error processing ${foodId}: ${error.message}`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some items could not be processed",
                errors,
                results
            });
        }

        res.json({
            success: true,
            message: "Order processed successfully",
            data: results
        });

    } catch (error) {
        console.error('PROCESS ORDER ERROR:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
}

export { addFood, listFood, removeFood, updateFoodStatus, updateFood, updateFoodQuantity, processOrder }