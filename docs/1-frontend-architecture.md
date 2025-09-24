# Frontend Architecture Documentation

## Component Structure

### 1. KPI Mindmap Component
Located in: `frontend/src/components/Mapping.jsx`

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