import RestaurantInfo from '../models/restaurantInfoModel.js';

// Get restaurant information (public endpoint)
const getRestaurantInfo = async (req, res) => {
  try {
    const info = await RestaurantInfo.getSingleton();
    
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Error fetching restaurant info:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin nhà hàng'
    });
  }
};

// Update restaurant information (admin only)
const updateRestaurantInfo = async (req, res) => {
  try {
    console.log('=== UPDATE RESTAURANT INFO REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const updates = req.body;
    
    // Get the singleton document
    let info = await RestaurantInfo.getSingleton();
    console.log('Current info before update:', info._id);
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        info[key] = updates[key];
      }
    });
    
    console.log('Saving updated info...');
    await info.save();
    console.log('Info saved successfully!');
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin nhà hàng thành công',
      data: info
    });
  } catch (error) {
    console.error('Error updating restaurant info:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Không thể cập nhật thông tin nhà hàng'
    });
  }
};

// Reset to defaults (admin only)
const resetToDefaults = async (req, res) => {
  try {
    const info = await RestaurantInfo.getSingleton();
    
    // Reset to default values
    info.restaurantName = 'Viet Bowls';
    info.phone = '+421 123 456 789';
    info.email = 'info@vietbowls.sk';
    info.address = 'Hlavná 33/36, 927 01 Šaľa, Slovakia';
    info.openingHours = {
      weekdays: 'Thứ 2 - Thứ 7: 11:00 - 20:00',
      sunday: 'Chủ nhật: 11:00 - 17:00'
    };
    info.socialMedia = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      instagram: ''
    };
    info.copyrightText = '© 2024 Viet Bowls. All rights reserved.';
    
    await info.save();
    
    res.json({
      success: true,
      message: 'Đã reset về giá trị mặc định',
      data: info
    });
  } catch (error) {
    console.error('Error resetting restaurant info:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể reset thông tin nhà hàng'
    });
  }
};

export {
  getRestaurantInfo,
  updateRestaurantInfo,
  resetToDefaults
};
