import categoryModel from "../models/categoryModel.js";
import parentCategoryModel from "../models/parentCategoryModel.js";
import fs from 'fs';

const normalizeParentCategoryValue = (value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
            return null;
        }
        return trimmed;
    }
    return value;
};

// Get all categories (grouped by parent category)
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({ isActive: true })
            .populate('parentCategory', 'name nameVI nameEN nameSK icon image')
            .sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: "Error fetching categories" });
    }
};

// Get all categories (including inactive for admin)
const getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await categoryModel.find()
            .populate('parentCategory', 'name nameVI nameEN nameSK icon image')
            .sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: "Error fetching categories" });
    }
};

// Add new category
const addCategory = async (req, res) => {
    try {
        const { name, description, sortOrder, language, parentCategory } = req.body;
        // Use Cloudinary URL or local filename
        let image_url = '';
        
        if (req.file) {
            // If using Cloudinary, req.file.path contains the full URL
            image_url = req.file.path || req.file.filename;
        }
        
        console.log('=== ADD CATEGORY DEBUG ===')
        console.log('Request body:', req.body)
        console.log('Request file:', req.file)
        console.log('Image URL:', image_url)

        const categoryData = {
            name,
            description: description || '',
            image: image_url,
            sortOrder: Number(sortOrder) || 0,
            // allow explicit language, fallback to model default
            ...(language ? { language } : {})
        };

        const normalizedParent = normalizeParentCategoryValue(parentCategory);
        if (normalizedParent !== undefined) {
            if (normalizedParent) {
                const parentExists = await parentCategoryModel.exists({ _id: normalizedParent });
                if (!parentExists) {
                    return res.status(400).json({ success: false, message: "Parent category not found" });
                }
            }
            categoryData.parentCategory = normalizedParent;
        }

        const category = new categoryModel(categoryData);
        await category.save();
        
        res.json({ success: true, message: "Category added successfully" });
    } catch (error) {
        console.error('Error adding category:', error);
        if (error.code === 11000) {
            res.json({ success: false, message: "Category already exists for this language" });
        } else {
            res.json({ success: false, message: "Error adding category", error: error.message });
        }
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, sortOrder, isActive, parentCategory } = req.body;
        let image_url = '';
        
        if (req.file) {
            // If using Cloudinary, req.file.path contains the full URL
            image_url = req.file.path || req.file.filename;
        }

        const updateData = {
            name,
            description: description || '',
            sortOrder: Number(sortOrder) || 0,
            isActive: isActive !== undefined ? isActive : true
        };

        // Handle parentCategory assignment (can be null to unassign)
        const normalizedParent = normalizeParentCategoryValue(parentCategory);
        if (normalizedParent !== undefined) {
            if (normalizedParent) {
                const parentExists = await parentCategoryModel.exists({ _id: normalizedParent });
                if (!parentExists) {
                    return res.status(400).json({ success: false, message: "Parent category not found" });
                }
            }
            updateData.parentCategory = normalizedParent;
        }

        if (image_url) {
            updateData.image = image_url;
        }

        const updatedCategory = await categoryModel.findByIdAndUpdate(
            id, 
            updateData,
            { new: true, runValidators: true }
        );
        
        res.json({ 
            success: true, 
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 11000) {
            res.json({ success: false, message: "Category name already exists" });
        } else {
            res.json({ success: false, message: "Error updating category", error: error.message });
        }
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        
        // Only delete local files (not Cloudinary URLs)
        // Cloudinary files should be managed through Cloudinary admin or auto-cleanup
        if (category && category.image && !/^https?:\/\//i.test(category.image)) {
            try {
                fs.unlink(`uploads/${category.image}`, () => { });
                console.log(`Local file deleted: ${category.image}`);
            } catch (fileError) {
                console.log(`Could not delete local file: ${category.image}`);
            }
        }

        await categoryModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.json({ success: false, message: "Error deleting category" });
    }
};

// Toggle category status
const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        
        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }

        category.isActive = !category.isActive;
        await category.save();
        
        res.json({ 
            success: true, 
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully` 
        });
    } catch (error) {
        console.error('Error toggling category status:', error);
        res.json({ success: false, message: "Error updating category status" });
    }
};

// Bulk reset categories (admin): delete all and insert procdded list
const resetCategories = async (req, res) => {
    try {
        // Accept either an object { categories: [...] } or a raw array [...]
        const payload = Array.isArray(req.body) ? req.body : req.body?.categories;

        if (!Array.isArray(payload) || payload.length === 0) {
            return res.status(400).json({ success: false, message: "'categories' must be a non-empty array" });
        }

        // Remove all existing
        await categoryModel.deleteMany({});

        // Insert new
        const docs = await categoryModel.insertMany(payload.map(c => ({
            name: c.name,
            description: c.description || '',
            image: c.image || '',
            sortOrder: Number(c.sortOrder) || 0,
            language: c.language || 'en'
        })));

        res.json({ success: true, message: `Inserted ${docs.length} categories`, data: docs });
    } catch (error) {
        console.error('Error resetting categories:', error);
        res.status(500).json({ success: false, message: 'Error resetting categories', error: error.message });
    }
};

// Delete ALL categories (admin only usage)
const clearAllCategories = async (_req, res) => {
    try {
        const result = await categoryModel.deleteMany({});
        res.json({ success: true, message: `Deleted ${result.deletedCount} categories` });
    } catch (error) {
        console.error('Error clearing categories:', error);
        res.status(500).json({ success: false, message: 'Error clearing categories', error: error.message });
    }
};

// Get menu structure: ParentCategories with their Categories and Products
const getMenuStructure = async (req, res) => {
    try {
        const { language } = req.query;
        
        // Get all active parent categories
        const parentCategories = await parentCategoryModel.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 });
        
        // Get all active categories with their parent
        const categories = await categoryModel.find({ isActive: true })
            .populate('parentCategory', 'name nameVI nameEN nameSK icon image _id')
            .sort({ sortOrder: 1, name: 1 });
        
        // Group categories by parent
        const menuStructure = parentCategories.map(parent => {
            const childCategories = categories.filter(
                cat => cat.parentCategory && cat.parentCategory._id.toString() === parent._id.toString()
            );
            
            return {
                ...parent.toObject(),
                categories: childCategories
            };
        });
        
        // Also include categories without parent (top-level)
        const topLevelCategories = categories.filter(cat => !cat.parentCategory);
        if (topLevelCategories.length > 0) {
            menuStructure.push({
                _id: null,
                name: 'Other',
                nameVI: 'Khác',
                nameEN: 'Other',
                nameSK: 'Iné',
                icon: '🍽️',
                categories: topLevelCategories
            });
        }
        
        res.json({ success: true, data: menuStructure });
    } catch (error) {
        console.error('Error fetching menu structure:', error);
        res.status(500).json({ success: false, message: "Error fetching menu structure" });
    }
};

export {
    getAllCategories,
    getAllCategoriesAdmin,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    resetCategories,
    clearAllCategories,
    getMenuStructure
}; 