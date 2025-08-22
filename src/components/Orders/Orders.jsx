import { useState } from 'react'

function Orders({ orders, setOrders, inventory, setInventory }) {
  const [activeTab, setActiveTab] = useState('backlog')

  const addToInventory = (orderItem) => {
    setInventory(prev => {
      const categoryInventory = prev[orderItem.category] || []
      
      if (orderItem.category === 'glass') {
        // Check if glass with same dimensions, type, and color exists
        const existingGlassIndex = categoryInventory.findIndex(item => 
          item.width === orderItem.width &&
          item.height === orderItem.height &&
          item.type === (orderItem.type || '') &&
          item.color === (orderItem.color || '')
        )
        
        if (existingGlassIndex !== -1) {
          // Add to existing glass quantity
          const updatedInventory = [...categoryInventory]
          updatedInventory[existingGlassIndex] = {
            ...updatedInventory[existingGlassIndex],
            quantity: (parseInt(updatedInventory[existingGlassIndex].quantity) + parseInt(orderItem.quantity)).toString()
          }
          
          return {
            ...prev,
            [orderItem.category]: updatedInventory
          }
        }
      } else if (orderItem.category === 'hardware') {
        // Check if hardware with same type exists
        const existingHardwareIndex = categoryInventory.findIndex(item =>
          item.itemType === (orderItem.itemType || 'Hardware Item')
        )
        
        if (existingHardwareIndex !== -1) {
          // Add to existing hardware quantity
          const updatedInventory = [...categoryInventory]
          updatedInventory[existingHardwareIndex] = {
            ...updatedInventory[existingHardwareIndex],
            quantity: (parseInt(updatedInventory[existingHardwareIndex].quantity) + parseInt(orderItem.quantity)).toString()
          }
          
          return {
            ...prev,
            [orderItem.category]: updatedInventory
          }
        }
      }
      
      // Create new inventory item if no match found
      const inventoryItem = {
        id: Date.now(),
        category: orderItem.category,
        dateAdded: new Date().toLocaleDateString(),
        quantity: parseInt(orderItem.quantity),
        // Glass specific properties
        ...(orderItem.category === 'glass' && {
          width: orderItem.width,
          height: orderItem.height,
          dimensions: `${orderItem.width}" × ${orderItem.height}"`,
          color: orderItem.color || '',
          type: orderItem.type || '',
          supplier: orderItem.supplier || '',
          area: orderItem.width && orderItem.height 
            ? (parseFloat(orderItem.width) * parseFloat(orderItem.height) / 144).toFixed(2) 
            : '0.00'
        }),
        // Hardware specific properties
        ...(orderItem.category === 'hardware' && {
          itemType: orderItem.itemType || 'Hardware Item',
          supplier: orderItem.supplier || ''
        })
      }

      return {
        ...prev,
        [orderItem.category]: [...categoryInventory, inventoryItem]
      }
    })
  }

  const categorizeOrders = () => {
    return {
      backlog: orders.backlog || [],
      pending: orders.pending || [],
      ordered: orders.ordered || [],
      delivered: orders.delivered || []
    }
  }

  const categorizedOrders = categorizeOrders()
  const currentOrders = categorizedOrders[activeTab]

  const moveToOrders = (backlogItemId) => {
    const backlogItem = orders.backlog.find(item => item.id === backlogItemId)
    if (backlogItem) {
      setOrders(prevOrders => ({
        ...prevOrders,
        backlog: prevOrders.backlog.filter(item => item.id !== backlogItemId),
        pending: [...prevOrders.pending, { ...backlogItem, status: 'pending' }]
      }))
    }
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => {
      const newOrders = { ...prevOrders }
      
      // Find which category the order is currently in
      let currentCategory = null
      let orderItem = null
      
      for (const [category, items] of Object.entries(newOrders)) {
        const foundItem = items.find(order => order.id === orderId)
        if (foundItem) {
          currentCategory = category
          orderItem = foundItem
          break
        }
      }
      
      if (currentCategory && orderItem) {
        // Remove from current category
        newOrders[currentCategory] = newOrders[currentCategory].filter(order => order.id !== orderId)
        // Add to new category
        newOrders[newStatus] = [...newOrders[newStatus], { ...orderItem, status: newStatus }]
        
        // If moving to delivered, add to inventory
        if (newStatus === 'delivered') {
          addToInventory(orderItem)
        }
      }
      
      return newOrders
    })
  }

  const deleteOrder = (orderId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setOrders(prevOrders => {
        const newOrders = { ...prevOrders }
        
        // Find and remove from whichever category it's in
        for (const category of Object.keys(newOrders)) {
          newOrders[category] = newOrders[category].filter(order => order.id !== orderId)
        }
        
        return newOrders
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'backlog': return '#9c27b0'
      case 'pending': return '#ff9800'
      case 'ordered': return '#2196f3'
      case 'delivered': return '#4caf50'
      default: return '#666'
    }
  }

  return (
    <div className="orders-container">
      <h2>📦 Orders Management</h2>
      <p className="orders-description">
        {activeTab === 'backlog' && "Review items that need ordering. Click 'Order This Item' when ready to place the order."}
        {activeTab === 'pending' && "Orders that have been moved from backlog and are ready to be placed with suppliers."}
        {activeTab === 'ordered' && "Orders that have been submitted to suppliers and are awaiting delivery."}
        {activeTab === 'delivered' && "Completed orders that have been received and automatically added to inventory."}
      </p>
      
      <div className="orders-tabs">
        <button 
          className={`tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
          onClick={() => setActiveTab('backlog')}
        >
          📋 Backlog ({categorizedOrders.backlog.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending ({categorizedOrders.pending.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ordered' ? 'active' : ''}`}
          onClick={() => setActiveTab('ordered')}
        >
          📦 Ordered ({categorizedOrders.ordered.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          ✅ Delivered ({categorizedOrders.delivered.length})
        </button>
      </div>

      <div className="orders-list">
        {currentOrders.length === 0 ? (
          <div className="empty-orders">
            <p>No {activeTab} orders found.</p>
            {activeTab === 'backlog' && (
              <p>Items will appear here when you click "Add to Order Backlog" from project requirements.</p>
            )}
            {activeTab === 'pending' && (
              <p>Move items from backlog to pending when you're ready to order them.</p>
            )}
          </div>
        ) : (
          currentOrders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <div className="order-info">
                  <h4>{order.itemName}</h4>
                  <p className="order-project">Project: {order.projectName}</p>
                </div>
                <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                  {order.status.toUpperCase()}
                </div>
              </div>
              
              <div className="order-details">
                <div className="order-specs">
                  <span className="order-category">
                    {order.category === 'glass' ? '🪟' : '🔧'} {order.category}
                  </span>
                  <span className="order-quantity">Qty: {order.quantity}</span>
                  {order.category === 'glass' && (
                    <span className="order-dimensions">
                      {order.width}" × {order.height}" {order.color && `(${order.color})`}
                    </span>
                  )}
                  <span className="order-date">Created: {order.dateCreated}</span>
                </div>
                
                <div className="order-actions">
                  {order.status === 'backlog' && (
                    <button 
                      className="status-btn order-now-btn"
                      onClick={() => moveToOrders(order.id)}
                    >
                      📦 Order This Item
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button 
                      className="status-btn ordered-btn"
                      onClick={() => updateOrderStatus(order.id, 'ordered')}
                    >
                      Mark as Ordered
                    </button>
                  )}
                  {order.status === 'ordered' && (
                    <button 
                      className="status-btn delivered-btn"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      Mark as Delivered
                    </button>
                  )}
                  <button 
                    className="delete-order-btn"
                    onClick={() => deleteOrder(order.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders
