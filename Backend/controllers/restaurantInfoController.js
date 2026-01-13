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

    info.restaurantName = "Viet Bowls"
    info.phone = "+421 123 456 789"
    info.email = "info@vietbowls.sk"
    info.address = "Hlavná 33/36, 927 01 Šaľa, Slovakia"
    info.openingHours = {
      weekdays: "Thứ 2 - Thứ 7: 11:00 - 20:00",
      sunday: "Chủ nhật: 11:00 - 17:00"
    }
    info.socialMedia = {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      instagram: ""
    }
    info.googleMapsUrl =
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12630.561638352605!2d17.871616!3d48.149105!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476b6d006b93bc13%3A0x625b631240812045!2sVIET%20BOWLS!5e1!3m2!1svi!2sus!4v1754749939682!5m2!1svi!2sus"
    info.translations = {
      vi: {
        restaurantName: "Viet Bowls",
        address: "Hlavná 33/36, 927 01 Šaľa, Slovakia",
        openingHours: {
          weekdays: "Thứ 2 - Thứ 7: 11:00 - 20:00",
          sunday: "Chủ nhật: 11:00 - 17:00"
        }
      },
      en: {
        restaurantName: "Viet Bowls",
        address: "Hlavná 33/36, 927 01 Šaľa, Slovakia",
        openingHours: {
          weekdays: "Mon - Sat: 11:00 AM - 8:00 PM",
          sunday: "Sunday: 11:00 AM - 5:00 PM"
        }
      },
      sk: {
        restaurantName: "Viet Bowls",
        address: "Hlavná 33/36, 927 01 Šaľa, Slovakia",
        openingHours: {
          weekdays: "Pon - Sob: 11:00 - 20:00",
          sunday: "Nedeľa: 11:00 - 17:00"
        }
      }
    }
    info.copyrightText = "© 2024 Viet Bowls. All rights reserved."
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

export { getRestaurantInfo, updateRestaurantInfo, resetToDefaults }

