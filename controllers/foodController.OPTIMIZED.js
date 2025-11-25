// OPTIMIZED Food Controller với Pagination
// Thêm code này vào foodController.js hiện tại

/**
 * Get list food with pagination and filters
 * OPTIMIZED VERSION - Supports pagination, filtering, sorting
 */
const listFood = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            category, 
            status,
            noPagination = false,
            forUser = false,
            search = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = {};
        
        // Status filter
        if (forUser) {
            query.status = 'active';
        } else if (status) {
            query.status = status;
        }
        
        // Category filter
        if (category && category !== 'All') {
            query.category = category;
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { nameVI: { $regex: search, $options: 'i' } },
                { nameEN: { $regex: search, $options: 'i' } },
                { nameSK: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // No pagination - return all (useful for client-side filtering)
        if (noPagination === 'true') {
            const foods = await foodModel.find(query)
                .sort(sort)
                .lean() // Use lean() for better performance (returns plain JS objects)
                .exec();
            
            return res.json({ 
                success: true, 
                data: foods,
                count: foods.length
            });
        }

        // With pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute queries in parallel for better performance
        const [foods, totalCount] = await Promise.all([
            foodModel.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean()
                .exec(),
            foodModel.countDocuments(query).exec()
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({ 
            success: true, 
            data: foods,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages,
                totalCount,
                hasMore: pageNum < totalPages,
                nextPage: pageNum < totalPages ? pageNum + 1 : null
            }
        });
    } catch (error) {
        console.error('Error fetching food list:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching food list",
            error: error.message 
        });
    }
};

/**
 * Get featured/trending foods (for homepage)
 * Optimized with limit and sorting
 */
const getFeaturedFoods = async (req, res) => {
    try {
        const { limit = 8 } = req.query;

        const foods = await foodModel.find({ 
            status: 'active',
            $or: [
                { isPromotion: true },
                { soldCount: { $gte: 50 } }, // Best sellers
                { likes: { $gte: 10 } } // Most liked
            ]
        })
        .sort({ soldCount: -1, likes: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .lean()
        .exec();

        res.json({ 
            success: true, 
            data: foods
        });
    } catch (error) {
        console.error('Error fetching featured foods:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching featured foods" 
        });
    }
};

/**
 * Get related products by category
 */
const getRelatedFoods = async (req, res) => {
    try {
        const { id, limit = 4 } = req.query;

        // Get current product to find its category
        const currentProduct = await foodModel.findById(id).lean();
        if (!currentProduct) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        // Find related products
        const relatedFoods = await foodModel.find({
            _id: { $ne: id }, // Exclude current product
            category: currentProduct.category,
            status: 'active'
        })
        .sort({ soldCount: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .lean()
        .exec();

        res.json({ 
            success: true, 
            data: relatedFoods
        });
    } catch (error) {
        console.error('Error fetching related foods:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching related foods" 
        });
    }
};

// Export functions
export {
    listFood,
    getFeaturedFoods,
    getRelatedFoods,
    // ... other existing exports
};

