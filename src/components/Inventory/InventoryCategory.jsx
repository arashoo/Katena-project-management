import { useState } from 'react'

function InventoryCategory({ category, items, onBack, onAddItem, onUpdateItem, onDeleteItem }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    supplier: '',
    cost: '',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim() && formData.quantity.trim()) {
      if (editingItem) {
        onUpdateItem(editingItem.id, formData)
        setEditingItem(null)
      } else {
        onAddItem(formData)
      }
      setFormData({ name: '', quantity: '', unit: '', supplier: '', cost: '', notes: '' })
      setShowAddForm(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || '',
      supplier: item.supplier || '',
      cost: item.cost || '',
      notes: item.notes || ''
    })
    setEditingItem(item)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setFormData({ name: '', quantity: '', unit: '', supplier: '', cost: '', notes: '' })
    setEditingItem(null)
    setShowAddForm(false)
  }

  const getLowStockItems = () => {
    return items.filter(item => parseInt(item.quantity) < 10)
  }

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        ← Back to Inventory
      </button>
      
      <div className="inventory-header">
        <h3>{category.icon} {category.name} Inventory</h3>
        <button 
          className="add-item-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Item
        </button>
      </div>

      {getLowStockItems().length > 0 && (
        <div className="low-stock-warning">
          ⚠️ {getLowStockItems().length} item(s) running low on stock!
        </div>
      )}

      {showAddForm && (
        <div className="add-item-form">
          <h4>{editingItem ? 'Edit Item' : 'Add New Item'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Item name *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Quantity *"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Unit (pcs, kg, m, etc.)"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Cost per unit"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
              />
            </div>
            <textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="2"
            />
            <div className="form-actions">
              <button type="submit">{editingItem ? 'Update' : 'Add'} Item</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-list">
        {items.length === 0 ? (
          <p>No items in {category.name.toLowerCase()} inventory yet.</p>
        ) : (
          <div className="inventory-table">
            <div className="table-header">
              <span>Name</span>
              <span>Quantity</span>
              <span>Supplier</span>
              <span>Cost</span>
              <span>Actions</span>
            </div>
            {items.map(item => (
              <div 
                key={item.id} 
                className={`table-row ${parseInt(item.quantity) < 10 ? 'low-stock' : ''}`}
              >
                <span className="item-name">
                  {item.name}
                  {item.notes && <small className="item-notes">{item.notes}</small>}
                </span>
                <span className="item-quantity">
                  {item.quantity} {item.unit}
                </span>
                <span>{item.supplier || '-'}</span>
                <span>{item.cost ? `$${item.cost}` : '-'}</span>
                <span className="item-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(item)}
                    title="Edit item"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => onDeleteItem(item.id)}
                    title="Delete item"
                  >
                    🗑️
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryCategory
