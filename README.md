# Katena - Professional Project & Inventory Management System

A comprehensive business management application built with React and Vite, designed for managing projects, inventory, and orders with a modern, professional interface.

## 🚀 Features

### 📋 Project Management
- **Multi-stage Project Workflow**: Contract → Measurements → Drawing → Requirements
- **File Management**: Upload and organize project files with OneDrive integration
- **Requirements System**: Link project requirements to inventory items
- **Progress Tracking**: Visual progress bars and completion status
- **Project Categories**: Upcoming, In Progress, and Completed projects

### 📊 Inventory Management
- **Dual Category System**: Separate management for Glass and Hardware
- **Advanced Glass Inventory**: Dimensions, types, colors, area calculations
- **Low Stock Alerts**: Automatic warnings for items below threshold
- **Smart Allocation**: Prevent double-booking of materials across projects
- **Search & Filter**: Advanced filtering by multiple criteria

### 📦 Order Management
- **4-Stage Pipeline**: Backlog → Pending → Ordered → Delivered
- **Dynamic Status Tracking**: Visual indicators for order progression
- **Automatic Inventory Integration**: Delivered items auto-added to inventory
- **Smart Order Prevention**: Prevents duplicate orders for same items

### 🎨 Modern UI/UX
- **Professional Design System**: Consistent colors, typography, and spacing
- **Responsive Layout**: Works perfectly on desktop and mobile
- **Interactive Elements**: Hover effects, animations, and micro-interactions
- **Accessibility**: Proper focus states and semantic HTML

## 🛠️ Technology Stack

- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.3
- **Styling**: Modern CSS with CSS Variables
- **State Management**: React useState hooks
- **File Handling**: OneDrive integration for file uploads

## 📱 Screenshots

*Modern navigation with gradient logo and interactive buttons*
*Project management with progress tracking and collapsible steps*
*Professional inventory tables with search and filtering*
*Order pipeline with status visualization*

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/katena.git
cd katena
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5174`

## 📁 Project Structure

```
src/
├── components/
│   ├── Modal/
│   ├── Projects/
│   │   ├── Projects.jsx
│   │   ├── ProjectsList.jsx
│   │   ├── ProjectDetail.jsx
│   │   └── RequirementsStep.jsx
│   ├── Inventory/
│   │   ├── Inventory.jsx
│   │   ├── GlassInventory.jsx
│   │   └── InventoryCategory.jsx
│   └── Orders/
│       └── Orders.jsx
├── App.jsx
├── App.css
└── main.jsx
```

## 🎯 Key Features in Detail

### Material Allocation System
- Tracks available vs. allocated inventory across all projects
- Prevents overselling materials
- Real-time availability checking

### Order Status Visualization
- Color-coded backgrounds based on order status
- Dynamic button states reflecting current pipeline stage
- Comprehensive status tracking from requirement to delivery

### File Management
- Drag-and-drop file uploads
- OneDrive integration for cloud storage
- File organization by project and step

## 🔧 Configuration

The application uses a modern CSS design system with customizable variables:

```css
:root {
  --primary-500: #3b82f6;
  --success-500: #22c55e;
  --warning-500: #f59e0b;
  --error-500: #ef4444;
  /* ... more design tokens */
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Arash** - *Initial work and development*

## 🙏 Acknowledgments

- Built with modern React best practices
- Inspired by professional project management workflows
- Designed for real-world business applications

---

**Katena** - Streamlining project and inventory management with modern technology.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
