# Katena Database Schema Design

## Core Data Models

### 1. Projects
```sql
projects (
  id: UUID PRIMARY KEY,
  name: VARCHAR(255) NOT NULL,
  description: TEXT,
  status: ENUM('upcoming', 'current', 'finished'),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

### 2. Project Steps
```sql
project_steps (
  id: UUID PRIMARY KEY,
  project_id: UUID FOREIGN KEY REFERENCES projects(id),
  step_number: INTEGER,
  name: VARCHAR(100) NOT NULL,
  completed: BOOLEAN DEFAULT FALSE,
  completed_at: TIMESTAMP,
  created_at: TIMESTAMP
)
```

### 3. Project Files
```sql
project_files (
  id: UUID PRIMARY KEY,
  project_id: UUID FOREIGN KEY REFERENCES projects(id),
  step_id: UUID FOREIGN KEY REFERENCES project_steps(id),
  filename: VARCHAR(255) NOT NULL,
  file_path: VARCHAR(500),
  file_size: BIGINT,
  mime_type: VARCHAR(100),
  onedrive_url: VARCHAR(500),
  uploaded_at: TIMESTAMP
)
```

### 4. Inventory Categories
```sql
inventory_categories (
  id: UUID PRIMARY KEY,
  name: VARCHAR(100) NOT NULL, -- 'glass', 'hardware'
  icon: VARCHAR(50),
  description: TEXT
)
```

### 5. Inventory Items
```sql
inventory_items (
  id: UUID PRIMARY KEY,
  category_id: UUID FOREIGN KEY REFERENCES inventory_categories(id),
  name: VARCHAR(255) NOT NULL,
  quantity: INTEGER NOT NULL DEFAULT 0,
  allocated_quantity: INTEGER DEFAULT 0,
  
  -- Glass specific fields
  width: DECIMAL(8,3),
  height: DECIMAL(8,3),
  glass_type: VARCHAR(50),
  color: VARCHAR(50),
  area_sqft: DECIMAL(10,2),
  
  -- Hardware specific fields
  item_type: VARCHAR(100),
  
  -- Common fields
  supplier: VARCHAR(255),
  cost_per_unit: DECIMAL(10,2),
  notes: TEXT,
  low_stock_threshold: INTEGER DEFAULT 5,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

### 6. Project Requirements
```sql
project_requirements (
  id: UUID PRIMARY KEY,
  project_id: UUID FOREIGN KEY REFERENCES projects(id),
  step_id: UUID FOREIGN KEY REFERENCES project_steps(id),
  inventory_item_id: UUID FOREIGN KEY REFERENCES inventory_items(id),
  quantity_needed: INTEGER NOT NULL,
  quantity_allocated: INTEGER DEFAULT 0,
  status: ENUM('pending', 'allocated', 'ordered', 'fulfilled'),
  created_at: TIMESTAMP
)
```

### 7. Orders
```sql
orders (
  id: UUID PRIMARY KEY,
  project_id: UUID FOREIGN KEY REFERENCES projects(id),
  requirement_id: UUID FOREIGN KEY REFERENCES project_requirements(id),
  inventory_item_id: UUID FOREIGN KEY REFERENCES inventory_items(id),
  quantity: INTEGER NOT NULL,
  status: ENUM('backlog', 'pending', 'ordered', 'delivered'),
  order_date: TIMESTAMP,
  expected_delivery: DATE,
  actual_delivery: TIMESTAMP,
  supplier: VARCHAR(255),
  cost: DECIMAL(10,2),
  notes: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
)
```

### 8. Inventory Allocations (for tracking reserved items)
```sql
inventory_allocations (
  id: UUID PRIMARY KEY,
  inventory_item_id: UUID FOREIGN KEY REFERENCES inventory_items(id),
  project_id: UUID FOREIGN KEY REFERENCES projects(id),
  requirement_id: UUID FOREIGN KEY REFERENCES project_requirements(id),
  quantity_allocated: INTEGER NOT NULL,
  allocated_at: TIMESTAMP,
  released_at: TIMESTAMP
)
```

## Relationships
- Projects → Project Steps (1:many)
- Project Steps → Files (1:many)
- Projects → Requirements (1:many)
- Requirements → Inventory Items (many:1)
- Requirements → Orders (1:many)
- Inventory Items → Allocations (1:many)
- Projects → Allocations (1:many)
