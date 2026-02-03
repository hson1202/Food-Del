import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import { response } from "express";


//login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("Email received:", email)
        const user = await userModel.findOne({ email });
        console.log("User found:", user)
        if (!user) {
            return res.json({ success: false, message: "User Doesn't exists" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        console.log("Password match:", isMatch)

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }
        const token = createToken(user._id);
        res.json({ success: true, token })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" })
    }
}
const createToken = (id) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not configured. Please set JWT_SECRET in environment variables.');
    }

    return jwt.sign({ id }, secret, { expiresIn: '7d' })
}

//register user
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        //checking use exits or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }
        // validateing email and password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please Enter a valid E-mail" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({ success: true, token })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" })
    }
}

//verify token
const verifyToken = async (req, res) => {
    try {
        // Token được lấy từ authMiddleware (đã verify và decode)
        const userId = req.body.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        // Lấy thông tin user từ database
        const user = await userModel.findById(userId).select('-password -cartData');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Kiểm tra user có active không
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        // Trả về thông tin user (không bao gồm password)
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatarUrl: user.avatarUrl || null,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error("Verify token error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.body.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await userModel.findById(userId).select('-password -cartData');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatarUrl: user.avatarUrl || null,
                defaultAddressId: user.defaultAddressId || null,
                role: user.role || 'user',
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user profile",
            error: error.message
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        console.log("=== UPDATE PROFILE REQUEST ===");
        console.log("Method:", req.method);
        console.log("Path:", req.path);
        console.log("Body:", req.body);
        console.log("Headers token:", req.headers.token ? "Present" : "Missing");

        const userId = req.body.userId;
        const { name, phone, avatarUrl, email } = req.body;

        if (!userId) {
            console.error("❌ User ID missing in request body");
            return res.status(401).json({
                success: false,
                message: "User ID is required"
            });
        }

        console.log("✅ User ID found:", userId);

        // Validate that at least one field is provided
        if (!name && phone === undefined && avatarUrl === undefined && email === undefined) {
            return res.status(400).json({
                success: false,
                message: "At least one field (name, phone, avatarUrl, email) must be provided"
            });
        }

        // Build update object
        const updateData = {};
        if (name !== undefined) {
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot be empty"
                });
            }
            updateData.name = name.trim();
        }
        if (phone !== undefined) {
            updateData.phone = phone ? phone.trim() : '';
        }
        if (avatarUrl !== undefined) {
            // Validate URL format if provided
            if (avatarUrl && avatarUrl.trim() !== '') {
                if (!validator.isURL(avatarUrl.trim())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid avatar URL format"
                    });
                }
                updateData.avatarUrl = avatarUrl.trim();
            } else {
                updateData.avatarUrl = null;
            }
        }
        if (email !== undefined) {
            // Validate email format
            if (!email || email.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email cannot be empty"
                });
            }

            const trimmedEmail = email.trim().toLowerCase();

            if (!validator.isEmail(trimmedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address"
                });
            }

            // Check if email is already taken by another user
            const existingUser = await userModel.findOne({ email: trimmedEmail });
            if (existingUser && existingUser._id.toString() !== userId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }

            updateData.email = trimmedEmail;
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -cartData');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatarUrl: user.avatarUrl || null,
                defaultAddressId: user.defaultAddressId || null,
                role: user.role || 'user',
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);

        // Handle MongoDB duplicate key error (unique constraint violation)
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({
                success: false,
                message: "Email already in use"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long"
            });
        }

        // Get user with password
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Check if new password is different from current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Error changing password",
            error: error.message
        });
    }
};

// Get user addresses
const getAddresses = async (req, res) => {
    try {
        const userId = req.body.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await userModel.findById(userId).select('addresses defaultAddressId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: user.addresses || [],
            defaultAddressId: user.defaultAddressId || null
        });
    } catch (error) {
        console.error("Get addresses error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching addresses",
            error: error.message
        });
    }
};

// Add new address
const addAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { label, fullName, phone, street, houseNumber, city, state, zipcode, country, coordinates, isDefault } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Validate required fields
        if (!label || !fullName || !phone || !street || !city || !state || !country) {
            return res.status(400).json({
                success: false,
                message: "Required fields: label, fullName, phone, street, city, state, country"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Create new address object
        const newAddress = {
            label: label.trim(),
            fullName: fullName.trim(),
            phone: phone.trim(),
            street: street.trim(),
            houseNumber: houseNumber ? houseNumber.trim() : '',
            city: city.trim(),
            state: state.trim(),
            zipcode: zipcode ? zipcode.trim() : '',
            country: country.trim(),
            coordinates: coordinates || null,
            isDefault: isDefault === true
        };

        // If setting as default, unset other defaults
        if (isDefault === true) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // Add address to array
        user.addresses.push(newAddress);

        // Save user (pre-save middleware will handle defaultAddressId)
        await user.save();

        // Get the newly added address (last in array)
        const addedAddress = user.addresses[user.addresses.length - 1];

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            data: addedAddress
        });
    } catch (error) {
        console.error("Add address error:", error);
        res.status(500).json({
            success: false,
            message: "Error adding address",
            error: error.message
        });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const addressId = req.params.id;
        const { label, fullName, phone, street, houseNumber, city, state, zipcode, country, coordinates, isDefault } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address ID is required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find address in user's addresses array
        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Update address fields
        if (label !== undefined) address.label = label.trim();
        if (fullName !== undefined) address.fullName = fullName.trim();
        if (phone !== undefined) address.phone = phone.trim();
        if (street !== undefined) address.street = street.trim();
        if (houseNumber !== undefined) address.houseNumber = houseNumber ? houseNumber.trim() : '';
        if (city !== undefined) address.city = city.trim();
        if (state !== undefined) address.state = state.trim();
        if (zipcode !== undefined) address.zipcode = zipcode ? zipcode.trim() : '';
        if (country !== undefined) address.country = country.trim();
        if (coordinates !== undefined) address.coordinates = coordinates || null;

        // Handle isDefault flag
        if (isDefault === true) {
            // Unset other defaults
            user.addresses.forEach(addr => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
            address.isDefault = true;
        } else if (isDefault === false) {
            address.isDefault = false;
        }

        // Save user (pre-save middleware will handle defaultAddressId)
        await user.save();

        res.json({
            success: true,
            message: "Address updated successfully",
            data: address
        });
    } catch (error) {
        console.error("Update address error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating address",
            error: error.message
        });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const addressId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address ID is required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find address in user's addresses array
        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Check if it's the default address
        const isDefault = address.isDefault === true;

        // Remove address from array
        user.addresses.pull(addressId);

        // If it was the default, set the first remaining address as default (if any)
        if (isDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        // Save user (pre-save middleware will handle defaultAddressId)
        await user.save();

        res.json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Delete address error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting address",
            error: error.message
        });
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.body.userId;
        const addressId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address ID is required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find address in user's addresses array
        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Unset all other defaults
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });

        // Set this address as default
        address.isDefault = true;

        // Save user (pre-save middleware will handle defaultAddressId)
        await user.save();

        res.json({
            success: true,
            message: "Default address updated successfully",
            data: address
        });
    } catch (error) {
        console.error("Set default address error:", error);
        res.status(500).json({
            success: false,
            message: "Error setting default address",
            error: error.message
        });
    }
};

export {
    loginUser,
    registerUser,
    verifyToken,
    getProfile,
    updateProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};