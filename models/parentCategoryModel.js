import mongoose from "mongoose";

const parentCategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    nameVI: { 
        type: String, 
        default: "" 
    },
    nameEN: { 
        type: String, 
        default: "" 
    },
    nameSK: { 
        type: String, 
        default: "" 
    },
    description: { 
        type: String, 
        default: "" 
    },
    image: { 
        type: String, 
        default: "" 
    },
    icon: { 
        type: String, 
        default: "" 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    sortOrder: { 
        type: Number, 
        default: 0 
    },
    language: { 
        type: String, 
        enum: ['vi', 'en', 'sk'], 
        default: 'vi',
        required: true 
    }
}, {
    timestamps: true
});

// Virtual populate for child categories
parentCategorySchema.virtual('categories', {
    ref: 'category',
    localField: '_id',
    foreignField: 'parentCategory'
});

// Ensure virtuals are included in JSON output
parentCategorySchema.set('toJSON', { virtuals: true });
parentCategorySchema.set('toObject', { virtuals: true });

// Ensure uniqueness per language, not globally by name
parentCategorySchema.index({ name: 1, language: 1 }, { unique: true });

const parentCategoryModel = mongoose.models.parentCategory || mongoose.model("parentCategory", parentCategorySchema);

export default parentCategoryModel;

