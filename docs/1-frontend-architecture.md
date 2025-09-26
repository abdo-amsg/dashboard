# Frontend Architecture Documentation

## Layout Components

### 1. DashboardLayout Component
Located in: `frontend/src/components/DashboardLayout.jsx`

Purpose: Main layout wrapper for the dashboard interface that provides consistent structure.

#### Key Features:
- Header and sidebar integration
- Content area management
- Responsive layout handling

### 2. DashboardHeader Component
Located in: `frontend/src/components/DashboardHeader.jsx`

Purpose: Top navigation bar component with user controls and global actions.

#### Features:
- User profile menu
- Navigation controls
- Notification system
- Search functionality

### 3. DashboardSidebar Component
Located in: `frontend/src/components/DashboardSidebar.jsx`

Purpose: Navigation sidebar with menu items and collapsible sections.

#### Implementation:
- Dynamic menu generation
- Active route highlighting
- Collapse/expand functionality
- Icon integration with Lucide React

## Page Components

### 1. FilesPage Component
Located in: `frontend/src/components/FilesPage.jsx`

Purpose: Handles file management and upload functionality.

#### Features:
```javascript
const FilesPage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (files) => {
        // File upload logic
    };

    const handleFileDelete = async (fileId) => {
        // File deletion logic
    };
```

#### Key Functionalities:
- Drag and drop file upload
- File type validation
- Upload progress tracking
- File listing and management
- Delete and download operations

### 2. Profile Component
Located in: `frontend/src/components/Profile.jsx`

Purpose: User profile management interface.

#### Features:
- Profile information display
- Profile editing
- Password change functionality
- User preferences management

### 3. Settings Component
Located in: `frontend/src/components/Settings.jsx`

Purpose: Application settings and configuration interface.

#### Implementation:
```javascript
const Settings = () => {
    const [settings, setSettings] = useState({
        notifications: true,
        theme: 'light',
        language: 'en',
        // Other settings
    });

    const handleSettingChange = (key, value) => {
        // Setting update logic
    };
```

#### Functionalities:
- Theme switching
- Language selection
- Notification preferences
- Display options
- System preferences

### 4. Sources Component
Located in: `frontend/src/components/Sources.jsx`

Purpose: Manages data sources and integrations.

#### Features:
- Data source configuration
- Integration setup
- Connection status monitoring
- Source type management

## Data Visualization Components

### 1. KPI Mindmap Component
Located in: `frontend/src/components/Mapping.jsx`

Purpose: Visualization and interaction with mapped data.

#### Key Features:
```javascript
const Mapping = () => {
    const [data, setData] = useState({});
    const [view, setView] = useState('default');
    
    // View management and data handling
```
#### Key Features
- Interactive node-edge visualization
- Node highlighting system
- Automatic layout calculation
- Custom node styling
- Group-based node organization

#### Core Components

##### useNodeHighlighter Hook
```javascript
export const useNodeHighlighter = (nodes, edges) => {
    const [selectedNodeId, setSelectedNodeId] = useState(null);
```
**Purpose**: Manages node selection and highlighting states
**Functionality**:
- Tracks selected node using `selectedNodeId` state
- Calculates connected nodes and edges
- Applies styling classes dynamically
- Handles node click events

**Key Methods**:
1. `handleNodeClick`: 
   - Manages node selection state
   - Prevents group node selection
   - Toggles selection on repeated clicks

2. Connected Elements Calculation:
```javascript
const { connectedNodeIds, connectedEdgeIds } = useMemo(() => {
    if (!selectedNodeId) {
        return { connectedNodeIds: new Set(), connectedEdgeIds: new Set() };
    }
    // ... connection calculation logic
});
```

3. Styling Application:
```javascript
const styledNodes = useMemo(() => {
    if (!selectedNodeId) return nodes;
    return nodes.map(node => ({
        ...node,
        className: connectedNodeIds.has(node.id) ? 'highlight' : 'dimmed',
    }));
});
```

##### distributeNodesInGroups Function
```javascript
export const distributeNodesInGroups = (nodes) => {
```
**Purpose**: Calculates optimal node positions within group containers

**Algorithm**:
1. Group Mapping:
   - Creates maps for nodes and their parent groups
   - Organizes nodes by parent relationships

2. Position Calculation:
   - Uses grid-based layout algorithm
   - Maintains proper spacing and alignment
   - Handles dynamic group sizes

**Parameters**:
- Node dimensions: Width (150px), Height (40px)
- Padding: 20px
- Grid calculation: Based on group width and node count

### 2. Custom Node Component
Located in: `frontend/src/components/mindmap/CustomNode.jsx`

#### Features
- Custom styling and appearance
- Connection handles (input/output)
- Interactive hover effects
- Z-index management

#### Implementation Details
```javascript
const CustomNode = ({ data, isConnectable, targetPosition, sourcePosition }) => {
```

**Styling System**:
1. Base Style:
```javascript
const baseStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    maxWidth: '200px',
    // ... other styles
};
```

2. Handle Configuration:
```javascript
const getHandleStyle = (position) => ({
    width: '8px',
    height: '8px',
    backgroundColor: '#9CA3AF',
    // ... other styles
});
```

### 3. CSS Styling System
Located in: `frontend/src/components/KpiMindmap.css`

#### Key Classes

1. Node States:
```css
.react-flow .react-flow__node.dimmed {
    opacity: 0.2;
    transition: opacity 0.3s ease-in-out;
}

.react-flow .react-flow__node.highlight {
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
}
```

2. Edge Styling:
```css
.react-flow .react-flow__edge.highlight .react-flow__edge-path {
    stroke: #007bff;
    stroke-width: 3px;
}
```

3. Group Node Styling:
```css
.react-flow__node-group {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}
```

### 4. Event Handling System

#### Click Events
- Node selection/deselection
- Group interaction prevention
- Connection state management

#### Hover Events
```javascript
onMouseEnter={() => {
    document.body.style.cursor = 'pointer';
}}
onMouseLeave={() => {
    document.body.style.cursor = 'default';
}}
```

### 5. Performance Optimizations

1. Memoization:
- Node styling calculations
- Edge styling calculations
- Connected nodes/edges computation

2. Event Handler Optimization:
```javascript
const handleNodeClick = useCallback((_, node) => {
    // ... handler logic
}, []);
```

3. Layout Calculation:
- One-time initial layout calculation
- Efficient group-based positioning
- Optimized re-rendering strategy

### 6. State Management

1. Node State:
```javascript
const [nodes, setNodes, onNodesChange] = useNodesState(laidOutInitialNodes);
```

2. Edge State:
```javascript
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
```

3. Selection State:
```javascript
const [selectedNodeId, setSelectedNodeId] = useState(null);
```

#### Implementation Details:
- Interactive data mapping
- Visualization controls

## Context Management

### 1. Authentication Context
```javascript
export const AuthContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
    updateUser: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Authentication state management
```

### 2. Theme Context
```javascript
export const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    
    // Theme management logic
```

## Services Integration

### 1. API Service
Located in: `frontend/src/services/api.js`

```javascript
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
        }
        return Promise.reject(error);
    }
);
```

#### Key Features:
- Axios instance configuration
- Authentication token management
- Error handling
- Request/response interceptors

### 2. File Service
Located in: `frontend/src/services/fileService.js`

```javascript
export const fileService = {
    async upload(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        
        return api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress?.(percentCompleted);
            },
        });
    },
    
    async delete(fileId) {
        return api.delete(`/files/${fileId}`);
    },
    
    async download(fileId) {
        return api.get(`/files/${fileId}/download`, {
            responseType: 'blob',
        });
    },
};
```

## Shared Components

### 1. Error Boundary
Located in: `frontend/src/ErrorBoundary.jsx`

```javascript
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to error tracking service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}
```

Purpose: Catches and handles React component errors gracefully.

### 2. Loading States
```javascript
export const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
);

export const LoadingOverlay = ({ message }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <LoadingSpinner />
            {message && <p className="mt-2 text-gray-600">{message}</p>}
        </div>
    </div>
);
```

## Styling System

### 1. Tailwind Configuration
Located in: `frontend/tailwind.config.js`

```javascript
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    // ... color scale
                    900: '#0c4a6e',
                },
                // ... other custom colors
            },
            spacing: {
                // Custom spacing values
            },
            animation: {
                // Custom animations
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        // Other plugins
    ],
};
```

### 2. Global Styles
Located in: `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
    .btn-primary {
        @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
               transition-colors duration-200;
    }
    
    .input-field {
        @apply px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
               focus:ring-primary-500 focus:border-transparent;
    }
    
    // Other custom component classes
}
```