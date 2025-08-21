import { useState } from 'react'

function GlassInventory({ items, onAddItem, onUpdateItem, onDeleteItem, onBack }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [formData, setFormData] = useState({
    name: '',
    width: '',
    height: '',
    type: '',
    color: '',
    quantity: '',
    supplier: '',
    cost: '',
    notes: ''
  })

  const glassTypes = ['Tempered', 'Laminated', 'Insulated', 'Low-E', 'Tinted', 'Clear', 'Frosted', 'Mirror']
  const glassColors = ['Clear', 'Bronze', 'Gray', 'Blue', 'Green', 'Black', 'White', 'Frosted']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim() && formData.width && formData.height && formData.quantity) {
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
      setFormData({ name: '', width: '', height: '', type: '', color: '', quantity: '', supplier: '', cost: '', notes: '' })
      setShowAddForm(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      width: item.width || '',
      height: item.height || '',
      type: item.type || '',
      color: item.color || '',
      quantity: item.quantity || '',
      supplier: item.supplier || '',
      cost: item.cost || '',
      notes: item.notes || ''
    })
    setEditingItem(item)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setFormData({ name: '', width: '', height: '', type: '', color: '', quantity: '', supplier: '', cost: '', notes: '' })
    setEditingItem(null)
    setShowAddForm(false)
  }

  const filteredAndSortedItems = items
    .filter(item => {
      const searchLower = searchTerm.toLowerCase()
      return (
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
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
      
      // Handle numeric sorting for width, height, quantity, cost
      if (['width', 'height', 'quantity', 'cost'].includes(sortBy)) {
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
          placeholder="Search by name, dimensions, type, color, supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="width">Sort by Width</option>
          <option value="height">Sort by Height</option>
          <option value="type">Sort by Type</option>
          <option value="color">Sort by Color</option>
          <option value="quantity">Sort by Quantity</option>
          <option value="cost">Sort by Cost</option>
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
                <label className="form-label">Glass Name/Description *</label>
                <input
                  type="text"
                  placeholder="Glass name/description"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
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
              <div className="form-group">
                <label className="form-label">Cost per sq ft</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Cost"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
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
              <span>Name</span>
              <span>Dimensions</span>
              <span>Type</span>
              <span>Color</span>
              <span>Qty</span>
              <span>Area (sq ft)</span>
              <span>Cost</span>
              <span>Supplier</span>
              <span>Actions</span>
            </div>
            {filteredAndSortedItems.map(item => (
              <div 
                key={item.id} 
                className={`glass-table-row ${parseInt(item.quantity) < 5 ? 'low-stock' : ''}`}
              >
                <span className="item-name">
                  {item.name || 'Unnamed Glass'}
                  {item.notes && <small className="item-notes">{item.notes}</small>}
                </span>
                <span className="dimensions">
                  {item.dimensions || `${item.width || 0}" × ${item.height || 0}"`}
                </span>
                <span>{item.type || '-'}</span>
                <span>{item.color || '-'}</span>
                <span className="quantity">{item.quantity || 0}</span>
                <span>{item.area || '0.00'} sq ft</span>
                <span>{item.cost ? `$${item.cost}` : '-'}</span>
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
            ))}
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
