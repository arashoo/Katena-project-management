import { useState } from 'react'

function GlassInventory({ items, onAddItem, onUpdateItem, onDeleteItem, onBack, allProjects }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('width')
  const [sortOrder, setSortOrder] = useState('asc')
  const [formData, setFormData] = useState({
    width: '',
    height: '',
    type: '',
    color: '',
    quantity: '',
    supplier: '',
    notes: ''
  })

  const glassTypes = ['Tempered', 'Laminated', 'Insulated', 'Low-E', 'Tinted', 'Clear', 'Frosted', 'Mirror']
  const glassColors = ['Clear', 'Bronze', 'Gray', 'Blue', 'Green', 'Black', 'White', 'Frosted']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.width && formData.height && formData.quantity) {
      const width = parseFloat(formData.width) || 0
      const height = parseFloat(formData.height) || 0
      const area = width > 0 && height > 0 ? (width * height / 144).toFixed(2) : '0.00'
      
      const itemData = {
        ...formData,
        width: width.toString(),
        height: height.toString(),
        dimensions: `${width}" × ${height}"`,
        area: area
      }
      
      if (editingItem) {
        onUpdateItem(editingItem.id, itemData)
        setEditingItem(null)
      } else {
        onAddItem(itemData)
      }
      setFormData({ width: '', height: '', type: '', color: '', quantity: '', supplier: '', notes: '' })
      setShowAddForm(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      width: item.width || '',
      height: item.height || '',
      type: item.type || '',
      color: item.color || '',
      quantity: item.quantity || '',
      supplier: item.supplier || '',
      notes: item.notes || ''
    })
    setEditingItem(item)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setFormData({ width: '', height: '', type: '', color: '', quantity: '', supplier: '', notes: '' })
    setEditingItem(null)
    setShowAddForm(false)
  }

  const filteredAndSortedItems = items
    .filter(item => {
      const searchLower = searchTerm.toLowerCase()
      return (
        (item.width && item.width.toString().includes(searchLower)) ||
        (item.height && item.height.toString().includes(searchLower)) ||
        (item.type && item.type.toLowerCase().includes(searchLower)) ||
        (item.color && item.color.toLowerCase().includes(searchLower)) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchLower))
      )
    })
    .sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      // Handle numeric sorting for width, height, quantity
      if (['width', 'height', 'quantity'].includes(sortBy)) {
        aVal = parseFloat(aVal) || 0
        bVal = parseFloat(bVal) || 0
      } else {
        aVal = (aVal || '').toString().toLowerCase()
        bVal = (bVal || '').toString().toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  const getLowStockItems = () => {
    return items.filter(item => parseInt(item.quantity) < 5)
  }

  const getAllocatedProjects = (glassItem) => {
    if (!allProjects) return []
    
    const allocations = []
    
    allProjects.forEach(project => {
      const reqStep = project.steps.find(s => s.name === 'Requirements')
      if (!reqStep || !reqStep.requirements) return
      
      reqStep.requirements.forEach(req => {
        if (req.category === 'glass' && 
            req.width === glassItem.width && 
            req.height === glassItem.height &&
            (!req.color || req.color === glassItem.color)) {
          allocations.push({
            projectName: project.name,
            quantity: parseInt(req.quantity) || 0
          })
        }
      })
    })
    
    return allocations
  }

  return (
    <div>
      <button className="btn btn-secondary mb-4" onClick={onBack}>
        ← Back to Inventory
      </button>
      
      <div className="card-header">
        <h3 className="card-title">🪟 Glass Inventory</h3>
        <button 
          className="btn btn-success"
          onClick={() => setShowAddForm(true)}
        >
          <span>+</span> Add Glass
        </button>
      </div>

      {getLowStockItems().length > 0 && (
        <div className="low-stock-warning">
          ⚠️ {getLowStockItems().length} glass item(s) running low on stock (less than 5 pieces)!
        </div>
      )}

      {/* Search and Sort Controls */}
      <div className="search-sort-controls">
        <input
          type="text"
          placeholder="Search by dimensions, type, color, supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="width">Sort by Width</option>
          <option value="height">Sort by Height</option>
          <option value="type">Sort by Type</option>
          <option value="color">Sort by Color</option>
          <option value="quantity">Sort by Quantity</option>
        </select>
        <button 
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="sort-order-btn"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-item-form">
          <h4>{editingItem ? 'Edit Glass Item' : 'Add New Glass Item'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Width (inches) *</label>
                <input
                  type="number"
                  step="0.125"
                  placeholder="Width"
                  value={formData.width}
                  onChange={(e) => setFormData({...formData, width: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (inches) *</label>
                <input
                  type="number"
                  step="0.125"
                  placeholder="Height"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Glass Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="form-select"
                >
                  <option value="">Select Type</option>
                  {glassTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="form-select"
                >
                  <option value="">Select Color</option>
                  {glassColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input
                  type="text"
                  placeholder="Supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="form-textarea"
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingItem ? 'Update Glass' : 'Add Glass'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        {filteredAndSortedItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🪟</div>
            <h3 className="empty-state-title">No glass items found</h3>
            <p className="empty-state-description">
              {searchTerm ? `No glass items match "${searchTerm}"` : 'Add your first glass item to get started!'}
            </p>
          </div>
        ) : (
          <div className="glass-inventory-table">
            <div className="glass-table-header">
              <span>Dimensions</span>
              <span>Type</span>
              <span>Color</span>
              <span>Qty</span>
              <span>Area (sq ft)</span>
              <span>Allocated Projects</span>
              <span>Supplier</span>
              <span>Actions</span>
            </div>
            {filteredAndSortedItems.map(item => {
              const allocatedProjects = getAllocatedProjects(item)
              const totalAllocated = allocatedProjects.reduce((sum, alloc) => sum + alloc.quantity, 0)
              
              return (
                <div 
                  key={item.id} 
                  className={`glass-table-row ${parseInt(item.quantity) < 5 ? 'low-stock' : ''}`}
                >
                  <span className="dimensions">
                    {item.dimensions || `${item.width || 0}" × ${item.height || 0}"`}
                    {item.notes && <small className="item-notes">{item.notes}</small>}
                  </span>
                  <span>{item.type || '-'}</span>
                  <span>{item.color || '-'}</span>
                  <span className="quantity">{item.quantity || 0}</span>
                  <span>{item.area || '0.00'} sq ft</span>
                  <span className="allocated-projects">
                    {allocatedProjects.length > 0 ? (
                      <div className="allocation-list">
                        {allocatedProjects.map((alloc, index) => (
                          <div key={`${item.id}-alloc-${index}`} className="allocation-item">
                            <strong>{alloc.projectName}:</strong> {alloc.quantity}
                          </div>
                        ))}
                        <div className="total-allocated">
                          Total: {totalAllocated}
                        </div>
                      </div>
                    ) : (
                      <span className="no-allocation">Not allocated</span>
                    )}
                  </span>
                  <span>{item.supplier || '-'}</span>
                  <span className="item-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(item)}
                      title="Edit glass"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => onDeleteItem(item.id)}
                      title="Delete glass"
                    >
                      🗑️
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="inventory-summary">
        <p>Showing {filteredAndSortedItems.length} of {items.length} glass items</p>
      </div>
    </div>
  )
}

export default GlassInventory
