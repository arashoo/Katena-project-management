import { useState } from 'react'

function RequirementsStep({ project, stepId, inventory, onUpdateRequirements, allProjects, onCreateOrder, orders, onUpdateInventory }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    category: 'glass',
    itemType: '',
    width: '',
    height: '',
    color: '',
    quantity: '',
    supplier: '',
    notes: ''
  })

  const step = project.steps.find(s => s.id === stepId)
  const requirements = step.requirements || []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.quantity && formData.supplier && 
        ((formData.category === 'glass' && formData.width && formData.height) || 
         (formData.category === 'hardware' && formData.itemType))) {
      const newRequirement = {
        id: Date.now(),
        ...formData,
        itemName: formData.category === 'glass' 
          ? `${formData.width}" × ${formData.height}"${formData.color ? ` ${formData.color}` : ''} Glass`
          : formData.itemType,
        dimensions: formData.width && formData.height ? `${formData.width}" × ${formData.height}"` : null,
        dateAdded: new Date().toLocaleDateString()
      }
      
      const updatedRequirements = [...requirements, newRequirement]
      onUpdateRequirements(project.id, stepId, updatedRequirements)
      
      setFormData({
        category: 'glass',
        itemType: '',
        width: '',
        height: '',
        color: '',
        quantity: '',
        supplier: '',
        notes: ''
      })
      setShowAddForm(false)
    }
  }

  const handleDelete = (requirementId) => {
    if (confirm('Are you sure you want to delete this requirement?')) {
      const updatedRequirements = requirements.filter(req => req.id !== requirementId)
      onUpdateRequirements(project.id, stepId, updatedRequirements)
    }
  }

  const handleCreateOrder = (requirement, shortage) => {
    const orderData = {
      id: Date.now(),
      projectId: project.id,
      projectName: project.name,
      category: requirement.category,
      quantity: shortage,
      status: 'pending',
      dateCreated: new Date().toLocaleDateString(),
      urgency: 'normal'
    }

    if (requirement.category === 'glass') {
      orderData.width = requirement.width
      orderData.height = requirement.height
      orderData.color = requirement.color || 'Clear'
      orderData.dimensions = requirement.dimensions
      orderData.itemName = `${requirement.width}" × ${requirement.height}"${requirement.color ? ` ${requirement.color}` : ''} Glass`
      orderData.supplier = requirement.supplier
      orderData.type = requirement.type || ''
    } else {
      orderData.itemType = requirement.itemType
      orderData.itemName = requirement.itemType
      orderData.supplier = requirement.supplier
    }

    if (onCreateOrder) {
      onCreateOrder(orderData)
    }
  }

  const getOrderStatus = (requirement) => {
    if (!orders) return { status: null, orderItem: null }
    
    // Check each order category in priority order
    const orderCategories = [
      { name: 'backlog', array: orders.backlog || [] },
      { name: 'pending', array: orders.pending || [] },
      { name: 'ordered', array: orders.ordered || [] },
      { name: 'delivered', array: orders.delivered || [] }
    ]
    
    for (const category of orderCategories) {
      const orderItem = category.array.find(item => {
        if (item.projectId !== project.id) return false
        
        if (requirement.category === 'glass') {
          return item.category === 'glass' &&
                 item.width === requirement.width &&
                 item.height === requirement.height &&
                 item.color === (requirement.color || 'Clear')
        } else {
          return item.category === 'hardware' &&
                 item.itemType === requirement.itemType
        }
      })
      
      if (orderItem) {
        return { status: category.name, orderItem }
      }
    }
    
    return { status: null, orderItem: null }
  }

  const getStatusButton = (requirement, orderStatus) => {
    const { status, orderItem } = orderStatus
    
    if (!status) {
      return {
        text: '📋 Add to Order Backlog',
        className: 'order-btn',
        disabled: false,
        action: () => handleCreateOrder(requirement, checkInventoryAvailability(requirement).shortage)
      }
    }
    
    const statusConfig = {
      backlog: {
        text: '📋 In Backlog',
        className: 'order-btn status-backlog',
        disabled: true
      },
      pending: {
        text: '⏳ Order Pending',
        className: 'order-btn status-pending',
        disabled: true
      },
      ordered: {
        text: '📦 Order Submitted',
        className: 'order-btn status-ordered',
        disabled: true
      },
      delivered: {
        text: '✅ Delivered',
        className: 'order-btn status-delivered',
        disabled: true
      }
    }
    
    return statusConfig[status] || statusConfig.backlog
  }

  const checkInventoryAvailability = (requirement) => {
    const getAllocatedQuantity = (materialSpec) => {
      let totalAllocated = 0
      
      allProjects.forEach(proj => {
        if (proj.id === project.id) return
        
        const reqStep = proj.steps.find(s => s.name === 'Requirements')
        if (!reqStep || !reqStep.requirements) return
        
        reqStep.requirements.forEach(req => {
          if (materialSpec.category === 'glass') {
            if (req.category === 'glass' && 
                req.width === materialSpec.width && 
                req.height === materialSpec.height &&
                (!materialSpec.color || req.color === materialSpec.color)) {
              totalAllocated += parseInt(req.quantity) || 0
            }
          } else if (materialSpec.category === 'hardware') {
            if (req.category === 'hardware' &&
                req.itemType.toLowerCase().includes(materialSpec.itemType.toLowerCase())) {
              totalAllocated += parseInt(req.quantity) || 0
            }
          }
        })
      })
      
      return totalAllocated
    }

    if (requirement.category === 'glass' && requirement.width && requirement.height) {
      const glassInventory = inventory.glass || []
      const availableItems = glassInventory.filter(item => {
        const matchesDimensions = item.width === requirement.width && item.height === requirement.height
        const matchesColor = !requirement.color || item.color === requirement.color
        return matchesDimensions && matchesColor
      })
      
      const totalInStock = availableItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)
      const totalAllocated = getAllocatedQuantity({
        category: 'glass',
        width: requirement.width,
        height: requirement.height,
        color: requirement.color
      })
      
      const availableAfterAllocations = totalInStock - totalAllocated
      const needed = parseInt(requirement.quantity)
      
      return {
        inStock: totalInStock,
        allocated: totalAllocated,
        available: Math.max(0, availableAfterAllocations),
        needed: needed,
        sufficient: availableAfterAllocations >= needed,
        shortage: Math.max(0, needed - availableAfterAllocations),
        canAllocate: availableAfterAllocations > 0 && needed > 0,
        inventoryItems: availableItems
      }
    } else if (requirement.category === 'hardware') {
      const hardwareInventory = inventory.hardware || []
      const availableItems = hardwareInventory.filter(item => 
        item.name.toLowerCase().includes(requirement.itemType.toLowerCase())
      )
      
      const totalInStock = availableItems.reduce((sum, item) => sum + parseInt(item.quantity), 0)
      const totalAllocated = getAllocatedQuantity({
        category: 'hardware',
        itemType: requirement.itemType
      })
      
      const availableAfterAllocations = totalInStock - totalAllocated
      const needed = parseInt(requirement.quantity)
      
      return {
        inStock: totalInStock,
        allocated: totalAllocated,
        available: Math.max(0, availableAfterAllocations),
        needed: needed,
        sufficient: availableAfterAllocations >= needed,
        shortage: Math.max(0, needed - availableAfterAllocations),
        canAllocate: availableAfterAllocations > 0 && needed > 0,
        inventoryItems: availableItems
      }
    }
    
    return { 
      inStock: 0, 
      allocated: 0,
      available: 0,
      needed: parseInt(requirement.quantity), 
      sufficient: false, 
      shortage: parseInt(requirement.quantity),
      canAllocate: false,
      inventoryItems: []
    }
  }

  const handleAllocateInventory = (requirement) => {
    const availability = checkInventoryAvailability(requirement)
    
    if (!availability.canAllocate) {
      alert('No inventory available to allocate')
      return
    }

    const maxCanAllocate = Math.min(availability.available, availability.needed)
    const quantityToAllocate = prompt(
      `How many items would you like to allocate to "${project.name}"?\n\n` +
      `Available: ${availability.available}\n` +
      `Needed: ${availability.needed}\n` +
      `Maximum you can allocate: ${maxCanAllocate}`,
      maxCanAllocate.toString()
    )

    if (quantityToAllocate === null) return // User cancelled

    const allocateQty = parseInt(quantityToAllocate)
    if (isNaN(allocateQty) || allocateQty <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    if (allocateQty > maxCanAllocate) {
      alert(`You can only allocate up to ${maxCanAllocate} items`)
      return
    }

    // Update inventory to reflect the allocation
    if (onUpdateInventory && availability.inventoryItems.length > 0) {
      // For now, we'll just add the allocation to the requirement
      // The actual inventory update will be handled by the allocation tracking system
      const updatedRequirement = {
        ...requirement,
        allocatedQuantity: allocateQty,
        allocationDate: new Date().toLocaleDateString()
      }

      const updatedRequirements = requirements.map(req => 
        req.id === requirement.id ? updatedRequirement : req
      )
      
      onUpdateRequirements(project.id, stepId, updatedRequirements)
      
      alert(`Successfully allocated ${allocateQty} items to ${project.name}`)
    }
  }

  const glassTypes = ['Tempered', 'Laminated', 'Insulated', 'Low-E', 'Tinted', 'Clear', 'Frosted', 'Mirror']
  const glassColors = ['Clear', 'Bronze', 'Gray', 'Blue', 'Green', 'Black', 'White', 'Frosted']

  return (
    <div className="requirements-container">
      <div className="requirements-header">
        <h4>📦 Project Requirements</h4>
        <button 
          className="add-requirement-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Requirement
        </button>
      </div>

      {showAddForm && (
        <div className="requirement-form">
          <h5>Add Material Requirement</h5>
          <form onSubmit={handleSubmit}>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="glass">Glass</option>
              <option value="hardware">Hardware</option>
            </select>
            
            {formData.category === 'glass' ? (
              <>
                <input
                  type="number"
                  step="0.125"
                  placeholder="Width (inches) *"
                  value={formData.width}
                  onChange={(e) => setFormData({...formData, width: e.target.value})}
                  required
                />
                <input
                  type="number"
                  step="0.125"
                  placeholder="Height (inches) *"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  required
                />
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                >
                  <option value="">Any Color</option>
                  {glassColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Glass supplier *"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  required
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Hardware item name *"
                  value={formData.itemType}
                  onChange={(e) => setFormData({...formData, itemType: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Hardware supplier *"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  required
                />
              </>
            )}
            
            <input
              type="number"
              placeholder="Quantity needed *"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required
            />
            
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="2"
              style={{ gridColumn: '1 / -1' }}
            />
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">Add Requirement</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="requirements-list">
        {requirements.length === 0 ? (
          <p className="empty-requirements">No requirements added yet. Click "Add Requirement" to get started.</p>
        ) : (
          requirements.map(requirement => {
            const availability = checkInventoryAvailability(requirement)
            const orderStatus = getOrderStatus(requirement)
            const buttonConfig = getStatusButton(requirement, orderStatus)
            
            // Determine background class based on availability and order status
            let statusClass = 'requirement-item'
            if (availability.sufficient) {
              statusClass += ' req-available'
            } else if (orderStatus.status) {
              statusClass += ` req-${orderStatus.status}`
            } else {
              statusClass += ' req-insufficient'
            }
            
            return (
              <div key={requirement.id} className={statusClass}>
                <div className="requirement-info">
                  <div className="requirement-main">
                    <span className="requirement-category">
                      {requirement.category === 'glass' ? '🪟' : '🔧'} {requirement.category}
                    </span>
                    <div className="requirement-details">
                      <div className="item-name">
                        <strong>{requirement.category === 'glass' 
                          ? `${requirement.dimensions}${requirement.color ? ` ${requirement.color}` : ''} Glass`
                          : requirement.itemType}</strong>
                      </div>
                      {requirement.category === 'glass' && (
                        <div className="item-specs">
                          📐 {requirement.dimensions} {requirement.color && `• 🎨 ${requirement.color}`}
                        </div>
                      )}
                      {requirement.supplier && (
                        <div className="item-supplier">
                          🏢 Supplier: {requirement.supplier}
                        </div>
                      )}
                    </div>
                    <span className="requirement-quantity">
                      Qty: {requirement.quantity}
                    </span>
                  </div>
                  
                  <div className={`availability-status ${availability.sufficient ? 'sufficient' : 'insufficient'}`}>
                    {availability.sufficient ? (
                      <div className="status-good-container">
                        <span className="status-good">
                          ✅ Available
                        </span>
                        {requirement.allocatedQuantity && (
                          <div className="allocation-info">
                            🔒 Allocated: {requirement.allocatedQuantity} on {requirement.allocationDate}
                          </div>
                        )}
                        {availability.canAllocate && !requirement.allocatedQuantity && (
                          <button 
                            className="allocate-btn"
                            onClick={() => handleAllocateInventory(requirement)}
                            title="Allocate inventory to this project"
                          >
                            🔒 Allocate to Project
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="status-shortage">
                        <span className="status-short">
                          ⚠️ Need to order {availability.shortage} more
                        </span>
                        {availability.canAllocate && (
                          <button 
                            className="allocate-btn"
                            onClick={() => handleAllocateInventory(requirement)}
                            title="Allocate available inventory to this project"
                          >
                            🔒 Allocate Available ({availability.available})
                          </button>
                        )}
                        {requirement.allocatedQuantity && (
                          <div className="allocation-info">
                            🔒 Allocated: {requirement.allocatedQuantity} on {requirement.allocationDate}
                          </div>
                        )}
                        <button 
                          className={buttonConfig.className}
                          disabled={buttonConfig.disabled}
                          onClick={buttonConfig.action}
                          title={`Status: ${orderStatus.status || 'Not ordered'}`}
                        >
                          {buttonConfig.text}
                        </button>
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      In Stock: {availability.inStock} | 
                      Allocated: {availability.allocated + (requirement.allocatedQuantity || 0)} | 
                      Available: {availability.available - (requirement.allocatedQuantity || 0)}
                    </div>
                  </div>
                  
                  {requirement.notes && (
                    <div className="requirement-notes">
                      📝 {requirement.notes}
                    </div>
                  )}
                </div>
                
                <button 
                  className="delete-requirement-btn"
                  onClick={() => handleDelete(requirement.id)}
                  title="Delete requirement"
                >
                  🗑️
                </button>
              </div>
            )
          })
        )}
      </div>
      
      {requirements.length > 0 && (
        <div className="requirements-summary">
          <div className="summary-stats">
            <span>Total Requirements: {requirements.length}</span>
            <span>Available: {requirements.filter(req => checkInventoryAvailability(req).sufficient).length}</span>
            <span>Need to Order: {requirements.filter(req => !checkInventoryAvailability(req).sufficient).length}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequirementsStep
