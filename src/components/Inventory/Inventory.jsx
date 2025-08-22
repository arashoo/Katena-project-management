import { useState } from 'react'
import InventoryCategory from './InventoryCategory'
import GlassInventory from './GlassInventory'

function Inventory({ inventory, setInventory, allProjects }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categories = [
    { id: 'hardware', name: 'Hardware', icon: '🔧' },
    { id: 'glass', name: 'Glass', icon: '🪟' }
  ]

  const addItem = (categoryId, itemData) => {
    const newItem = {
      id: Date.now(),
      ...itemData,
      category: categoryId,
      dateAdded: new Date().toLocaleDateString()
    }
    
    setInventory(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), newItem]
    }))
  }

  const updateItem = (categoryId, itemId, updatedData) => {
    setInventory(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(item =>
        item.id === itemId ? { ...item, ...updatedData } : item
      )
    }))
  }

  const deleteItem = (categoryId, itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventory(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].filter(item => item.id !== itemId)
      }))
    }
  }

  return (
    <div className="inventory-container">
      {!selectedCategory ? (
        <>
          <div className="inventory-header">
            <h2>Inventory Management</h2>
          </div>
          
          <div className="inventory-categories">
            {categories.map(category => (
              <div 
                key={category.id}
                className="category-card"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{(inventory[category.id] || []).length} items in stock</p>
              </div>
            ))}
          </div>
        </>
      ) : selectedCategory.id === 'glass' ? (
        <GlassInventory
          items={inventory[selectedCategory.id] || []}
          onBack={() => setSelectedCategory(null)}
          onAddItem={(itemData) => addItem(selectedCategory.id, itemData)}
          onUpdateItem={(itemId, updatedData) => updateItem(selectedCategory.id, itemId, updatedData)}
          onDeleteItem={(itemId) => deleteItem(selectedCategory.id, itemId)}
          allProjects={allProjects}
        />
      ) : (
        <InventoryCategory
          category={selectedCategory}
          items={inventory[selectedCategory.id] || []}
          onBack={() => setSelectedCategory(null)}
          onAddItem={(itemData) => addItem(selectedCategory.id, itemData)}
          onUpdateItem={(itemId, updatedData) => updateItem(selectedCategory.id, itemId, updatedData)}
          onDeleteItem={(itemId) => deleteItem(selectedCategory.id, itemId)}
          allProjects={allProjects}
        />
      )}
    </div>
  )
}

export default Inventory
