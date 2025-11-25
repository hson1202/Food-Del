import parentCategoryModel from "../models/parentCategoryModel.js";
import categoryModel from "../models/categoryModel.js";
import fs from 'fs';

// Get all parent categories (public - active only)
const getAllParentCategories = async (req, res) => {
    try {
        const parentCategories = await parentCategoryModel.find({ isActive: true })
            .sort({ sortOrder: 1, name: 1 })
            .populate({
                path: 'categories',
                match: { isActive: true },
                select: 'name description image sortOrder',
                options: { sort: { sortOrder: 1, name: 1 } }
            });
        
        res.json({ success: true, data: parentCategories });
    } catch (error) {
        console.error('Error fetching parent categories:', error);
        res.status(500).json({ success: false, message: "Error fetching parent categories" });
    }
};

// Get all parent categories (admin - including inactive)
const getAllParentCategoriesAdmin = async (req, res) => {
    try {
        const parentCategories = await parentCategoryModel.find()
            .sort({ sortOrder: 1, name: 1 })
            .populate({
                path: 'categories',
                select: 'name description image sortOrder isActive parentCategory',
                options: { sort: { sortOrder: 1, name: 1 } }
            });
        
        res.json({ success: true, data: parentCategories });
    } catch (error) {
        console.error('Error fetching parent categories:', error);
        res.status(500).json({ success: false, message: "Error fetching parent categories" });
    }
};

// Get single parent category by ID
const getParentCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const parentCategory = await parentCategoryModel.findById(id)
            .populate({
                path: 'categories',
                select: 'name description image sortOrder isActive',
                options: { sort: { sortOrder: 1, name: 1 } }
            });
        
        if (!parentCategory) {
            return res.status(404).json({ success: false, message: "Parent category not found" });
        }
        
        res.json({ success: true, data: parentCategory });
    } catch (error) {
        console.error('Error fetching parent category:', error);
        res.status(500).json({ success: false, message: "Error fetching parent category" });
    }
};

// Add new parent category
const addParentCategory = async (req, res) => {
    try {
        const { name, nameVI, nameEN, nameSK, description, sortOrder, language, icon } = req.body;
        
        // Use Cloudinary URL or local filename
        let image_url = '';
        if (req.file) {
            image_url = req.file.path || req.file.filename;
        }
        
        console.log('=== ADD PARENT CATEGORY DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Image URL:', image_url);

        const parentCategoryData = {
            name,
            nameVI: nameVI || name,
            nameEN: nameEN || name,
            nameSK: nameSK || name,
            description: description || '',
            image: image_url,
            icon: icon || '',
            sortOrder: sortOrder || 0,
            ...(language ? { language } : {})
        };

        const parentCategory = new parentCategoryModel(parentCategoryData);
        await parentCategory.save();
        
        res.json({ 
            success: true, 
            message: "Parent category added successfully",
            data: parentCategory
        });
    } catch (error) {
        console.error('Error adding parent category:', error);
        if (error.code === 11000) {
            res.status(400).json({ 
                success: false, 
                message: "Parent category already exists for this language" 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: "Error adding parent category", 
                error: error.message 
            });
        }
    }
};

// Update parent category
const updateParentCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, nameVI, nameEN, nameSK, description, sortOrder, isActive, icon } = req.body;
        let image_url = '';
        
        if (req.file) {
            image_url = req.file.path || req.file.filename;
        }

        const updateData = {
            ...(name && { name }),
            ...(nameVI !== undefined && { nameVI }),
            ...(nameEN !== undefined && { nameEN }),
            ...(nameSK !== undefined && { nameSK }),
            ...(description !== undefined && { description }),
            ...(sortOrder !== undefined && { sortOrder }),
            ...(icon !== undefined && { icon }),
            ...(isActive !== undefined && { isActive })
        };

        if (image_url) {
            updateData.image = image_url;
        }

        const parentCategory = await parentCategoryModel.findByIdAndUpdate(
            id, 
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!parentCategory) {
            return res.status(404).json({ 
                success: false, 
                message: "Parent category not found" 
            });
        }
        
        res.json({ 
            success: true, 
            message: "Parent category updated successfully",
            data: parentCategory
        });
    } catch (error) {
        console.error('Error updating parent category:', error);
        if (error.code === 11000) {
            res.status(400).json({ 
                success: false, 
                message: "Parent category name already exists" 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: "Error updating parent category",
                error: error.message 
            });
        }
    }
};

// Delete parent category
const deleteParentCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const parentCategory = await parentCategoryModel.findById(id);
        
        if (!parentCategory) {
            return res.status(404).json({ 
                success: false, 
                message: "Parent category not found" 
            });
        }
        
        // Check if there are categories assigned to this parent
        const categoriesCount = await categoryModel.countDocuments({ parentCategory: id });
        if (categoriesCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete parent category. There are ${categoriesCount} categories assigned to it. Please reassign or delete those categories first.` 
            });
        }
        
        // Only delete local files (not Cloudinary URLs)
        if (parentCategory.image && !/^https?:\/\//i.test(parentCategory.image)) {
            try {
                fs.unlink(`uploads/${parentCategory.image}`, () => { });
                console.log(`Local file deleted: ${parentCategory.image}`);
            } catch (fileError) {
                console.log(`Could not delete local file: ${parentCategory.image}`);
            }
        }

        await parentCategoryModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Parent category deleted successfully" });
    } catch (error) {
        console.error('Error deleting parent category:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting parent category",
            error: error.message 
        });
    }
};

// Toggle parent category status
const toggleParentCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const parentCategory = await parentCategoryModel.findById(id);
        
        if (!parentCategory) {
            return res.status(404).json({ 
                success: false, 
                message: "Parent category not found" 
            });
        }

        parentCategory.isActive = !parentCategory.isActive;
        await parentCategory.save();
        
        res.json({ 
            success: true, 
            message: `Parent category ${parentCategory.isActive ? 'activated' : 'deactivated'} successfully`,
            data: parentCategory
        });
    } catch (error) {
        console.error('Error toggling parent category status:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating parent category status",
            error: error.message 
        });
    }
};

export {
    getAllParentCategories,
    getAllParentCategoriesAdmin,
    getParentCategoryById,
    addParentCategory,
    updateParentCategory,
    deleteParentCategory,
    toggleParentCategoryStatus
};

