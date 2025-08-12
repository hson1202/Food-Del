import React, { useState } from 'react';
import axios from 'axios';
import './OrderProcessor.css';

const OrderProcessor = ({ url, onOrderProcessed }) => {
  const [orderItems, setOrderItems] = useState([
    { foodId: '', quantity: 1 }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const addOrderItem = () => {
    setOrderItems([...orderItems, { foodId: '', quantity: 1 }]);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const processOrder = async () => {
    // Validate order items
    const validItems = orderItems.filter(item => item.foodId && item.quantity > 0);
    
    if (validItems.length === 0) {
      setError('Please add at least one valid order item');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${url}/api/food/process-order`, {
        orderItems: validItems
      });

      if (response.data.success) {
        setResult(response.data);
        if (onOrderProcessed) {
          onOrderProcessed();
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setError(error.response?.data?.message || 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setOrderItems([{ foodId: '', quantity: 1 }]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="order-processor">
      <div className="order-processor-header">
        <h3>🛒 Process Order & Update Inventory</h3>
        <p>This will automatically update quantity and soldCount for each food item</p>
      </div>

      <div className="order-items">
        <div className="order-items-header">
          <h4>Order Items</h4>
          <button 
            type="button" 
            onClick={addOrderItem}
            className="btn-add-item"
          >
            + Add Item
          </button>
        </div>

        {orderItems.map((item, index) => (
          <div key={index} className="order-item">
            <div className="order-item-inputs">
              <input
                type="text"
                placeholder="Food ID (MongoDB ObjectId)"
                value={item.foodId}
                onChange={(e) => updateOrderItem(index, 'foodId', e.target.value)}
                className="food-id-input"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                min="1"
                className="quantity-input"
              />
              <button
                type="button"
                onClick={() => removeOrderItem(index)}
                className="btn-remove-item"
                disabled={orderItems.length === 1}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="order-actions">
        <button
          type="button"
          onClick={processOrder}
          disabled={isProcessing || orderItems.filter(item => item.foodId && item.quantity > 0).length === 0}
          className="btn-process-order"
        >
          {isProcessing ? 'Processing...' : 'Process Order'}
        </button>
        
        <button
          type="button"
          onClick={resetForm}
          className="btn-reset"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="error-message">
          <h4>❌ Error</h4>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="success-message">
          <h4>✅ Order Processed Successfully</h4>
          <div className="order-results">
            {result.data.map((item, index) => (
              <div key={index} className="order-result-item">
                <strong>{item.name}</strong>
                <div className="result-details">
                  <span>Quantity: {item.quantity}</span>
                  <span>New Stock: {item.newStock}</span>
                  <span>Total Sold: {item.totalSold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="order-processor-info">
        <h4>ℹ️ How it works:</h4>
        <ul>
          <li>Enter the MongoDB ObjectId of the food item</li>
          <li>Specify the quantity to order</li>
          <li>The system will automatically:</li>
          <li>• Check if there's enough stock</li>
          <li>• Decrease the quantity (inventory)</li>
          <li>• Increase the soldCount</li>
          <li>• Return updated inventory status</li>
        </ul>
      </div>
    </div>
  );
};

export default OrderProcessor;
