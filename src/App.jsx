import { useState } from 'react'
import './App.css'
import Modal from './components/Modal'
import Projects from './components/Projects/Projects'
import Inventory from './components/Inventory/Inventory'
import Orders from './components/Orders/Orders'

function App() {
  const [activeModal, setActiveModal] = useState(null)
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Sample Project',
      steps: [
        { id: 1, name: 'Contract', completed: false, files: [] },
        { id: 2, name: 'Measurements', completed: false, files: [] },
        { id: 3, name: 'Drawing', completed: false, files: [] },
        { id: 4, name: 'Requirements', completed: false, files: [], requirements: [
          {
            id: 1,
            category: 'glass',
            width: '36',
            height: '48',
            color: 'Clear',
            quantity: '10',
            dimensions: '36" × 48"',
            notes: 'Front windows'
          }
        ]}
      ]
    }
  ])
  const [orders, setOrders] = useState({
    backlog: [],
    pending: [],
    ordered: [],
    delivered: []
  })
  const [inventory, setInventory] = useState({
    hardware: [
      { id: 1, name: 'Door Handle', quantity: 15, category: 'hardware' },
      { id: 2, name: 'Window Lock', quantity: 8, category: 'hardware' }
    ],
    glass: [
      { id: 1, width: '36', height: '48', type: 'Tempered', color: 'Clear', quantity: 5 },
      { id: 2, width: '24', height: '36', type: 'Laminated', color: 'Bronze', quantity: 12 }
    ]
  })

  const createOrder = (orderData) => {
    setOrders(prevOrders => ({
      ...prevOrders,
      backlog: [...prevOrders.backlog, { ...orderData, status: 'backlog' }]
    }))
    // Optionally switch to orders modal to show the new backlog item
    setActiveModal('orders')
  }

  const openModal = (modalName) => {
    setActiveModal(modalName)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-logo">
            <div className="app-logo-icon">K</div>
            <h1>Katena</h1>
          </div>
          <nav className="app-nav">
            <button 
              className={`nav-button ${activeModal === 'projects' ? 'active' : ''}`}
              onClick={() => openModal('projects')}
            >
              <span className="nav-button-icon">📋</span>
              Projects
            </button>
            <button 
              className={`nav-button ${activeModal === 'orders' ? 'active' : ''}`}
              onClick={() => openModal('orders')}
            >
              <span className="nav-button-icon">📦</span>
              Orders
            </button>
            <button 
              className={`nav-button ${activeModal === 'delivery' ? 'active' : ''}`}
              onClick={() => openModal('delivery')}
            >
              <span className="nav-button-icon">�</span>
              Delivery
            </button>
            <button 
              className={`nav-button ${activeModal === 'inventory' ? 'active' : ''}`}
              onClick={() => openModal('inventory')}
            >
              <span className="nav-button-icon">�</span>
              Inventory
            </button>
          </nav>
        </div>
      </header>

      <Modal isOpen={activeModal === 'projects'} onClose={closeModal} title="📋 Project Management">
        <Projects projects={projects} setProjects={setProjects} inventory={inventory} onCreateOrder={createOrder} orders={orders} />
      </Modal>

      <Modal isOpen={activeModal === 'orders'} onClose={closeModal} title="📦 Orders Management">
        <Orders orders={orders} setOrders={setOrders} inventory={inventory} setInventory={setInventory} />
      </Modal>

      <Modal isOpen={activeModal === 'delivery'} onClose={closeModal} title="🚚 Delivery Tracking">
        <div className="empty-state">
          <div className="empty-state-icon">🚚</div>
          <h3 className="empty-state-title">Delivery Tracking</h3>
          <p className="empty-state-description">Advanced delivery tracking system coming soon...</p>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'inventory'} onClose={closeModal} title="📊 Inventory Management">
        <Inventory inventory={inventory} setInventory={setInventory} />
      </Modal>
    </div>
  )
}

export default App
