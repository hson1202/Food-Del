import RestaurantInfo from "../models/restaurantInfoModel.js"

// Get restaurant information (public)
const getRestaurantInfo = async (req, res) => {
  try {
    const info = await RestaurantInfo.getSingleton()
    return res.json({ success: true, data: info })
  } catch (error) {
    console.error("Error fetching restaurant info:", error)
    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin nhà hàng"
    })
  }
}

// Update restaurant information (admin only)
const updateRestaurantInfo = async (req, res) => {
  try {
    const {
      restaurantName,
      logoUrl,
      faviconUrl,
      tagline,
      heroHeadline,
      heroSubtext,
      foundingYear,
      phone,
      email,
      address,
      openingHours,
      socialMedia,
      googleMapsUrl,
      copyrightText,
      translations,
      isActive
    } = req.body || {}

    const updates = {}
    if (restaurantName !== undefined) updates.restaurantName = restaurantName
    if (logoUrl !== undefined) updates.logoUrl = logoUrl
    if (faviconUrl !== undefined) updates.faviconUrl = faviconUrl
    if (tagline !== undefined) updates.tagline = tagline
    if (heroHeadline !== undefined) updates.heroHeadline = heroHeadline
    if (heroSubtext !== undefined) updates.heroSubtext = heroSubtext
    if (foundingYear !== undefined) updates.foundingYear = foundingYear
    if (phone !== undefined) updates.phone = phone
    if (email !== undefined) updates.email = email
    if (address !== undefined) updates.address = address
    if (openingHours !== undefined) updates.openingHours = openingHours
    if (socialMedia !== undefined) updates.socialMedia = socialMedia
    if (googleMapsUrl !== undefined) updates.googleMapsUrl = googleMapsUrl
    if (copyrightText !== undefined) updates.copyrightText = copyrightText
    if (translations !== undefined) updates.translations = translations
    if (isActive !== undefined) updates.isActive = isActive

    const info = await RestaurantInfo.getSingleton()
    Object.assign(info, updates)
    await info.save()

    return res.json({
      success: true,
      message: "Cập nhật thông tin nhà hàng thành công",
      data: info
    })
  } catch (error) {
    console.error("Error updating restaurant info:", error)
    return res.status(500).json({
      success: false,
      message: error?.message || "Không thể cập nhật thông tin nhà hàng"
    })
  }
}

// Reset to defaults (admin only)
const resetToDefaults = async (req, res) => {
  try {
    const info = await RestaurantInfo.getSingleton()

    info.restaurantName = ""
    info.logoUrl = ""
    info.faviconUrl = ""
    info.tagline = ""
    info.heroHeadline = ""
    info.heroSubtext = ""
    info.foundingYear = ""
    info.phone = ""
    info.email = ""
    info.address = ""
    info.openingHours = { weekdays: "", sunday: "" }
    info.socialMedia = { facebook: "", twitter: "", linkedin: "", instagram: "" }
    info.googleMapsUrl = ""
    info.translations = {
      vi: {
        restaurantName: "", address: "", tagline: "", heroHeadline: "", heroSubtext: "",
        openingHours: { weekdays: "", sunday: "" }
      },
      en: {
        restaurantName: "", address: "", tagline: "", heroHeadline: "", heroSubtext: "",
        openingHours: { weekdays: "", sunday: "" }
      },
      sk: {
        restaurantName: "", address: "", tagline: "", heroHeadline: "", heroSubtext: "",
        openingHours: { weekdays: "", sunday: "" }
      }
    }
    info.copyrightText = ""
    info.isActive = true

    await info.save()

    return res.json({
      success: true,
      message: "Đã reset về giá trị mặc định",
      data: info
    })
  } catch (error) {
    console.error("Error resetting restaurant info:", error)
    return res.status(500).json({
      success: false,
      message: "Không thể reset thông tin nhà hàng"
    })
  }
}

// Upload logo image (admin only) — returns the Cloudinary URL
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }
    const url = req.file.path || req.file.secure_url || req.file.url
    return res.json({ success: true, url })
  } catch (error) {
    console.error("Error uploading logo:", error)
    return res.status(500).json({ success: false, message: "Upload failed" })
  }
}

export { getRestaurantInfo, updateRestaurantInfo, resetToDefaults, uploadLogo }

