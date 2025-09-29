import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    Controls,
    Panel
} from '@xyflow/react';
import CustomNode from './mindmap/CustomNode';
import { initialNodes, initialEdges } from './mindmap/kpi_data';
import { X, Target, Shield, AlertCircle, Info, BarChart3 } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import '../styles/KpiMindmap.css';
import DescriptionCard from './mindmap/DescriptionCard';

import { useState, useMemo, useCallback } from 'react';

/**
 * A custom hook to manage node selection and highlighting in React Flow.
 * It highlights the selected node and its immediate neighbors, dimming all others.
 *
 * @param {Array} initialNodes - The initial array of nodes.
 * @param {Array} initialEdges - The initial array of edges.
 * @returns {Object} Contains styled nodes, styled edges, and the node click handler.
 */
export const useNodeHighlighter = (nodes, edges) => {
    const [selectedNodeId, setSelectedNodeId] = useState(null);

    const handleNodeClick = useCallback((_, node) => {
        node.type !== 'group' && setSelectedNodeId(prevId => (prevId === node.id ? null : node.id));
    }, []);

    // Memoize the calculation of connected nodes and edges to avoid re-running on every render
    const { connectedNodeIds, connectedEdgeIds } = useMemo(() => {
        if (!selectedNodeId) {
            return { connectedNodeIds: new Set(), connectedEdgeIds: new Set() };
        }

        const nodeIds = new Set([selectedNodeId]);
        const edgeIds = new Set();

        edges.forEach(edge => {
            if (edge.source === selectedNodeId) {
                nodeIds.add(edge.target);
                edgeIds.add(edge.id);
            } else if (edge.target === selectedNodeId) {
                nodeIds.add(edge.source);
                edgeIds.add(edge.id);
            }
        });

        return { connectedNodeIds: nodeIds, connectedEdgeIds: edgeIds };
    }, [selectedNodeId, edges]);

    // Apply CSS classes instead of inline styles for better performance
    const styledNodes = useMemo(() => {
        if (!selectedNodeId) return nodes; // No selection, return original nodes

        return nodes.map(node => ({
            ...node,
            className: connectedNodeIds.has(node.id) ? 'highlight' : 'dimmed',
        }));
    }, [nodes, connectedNodeIds, selectedNodeId]);

    const styledEdges = useMemo(() => {
        if (!selectedNodeId) return edges; // No selection, return original edges

        return edges.map(edge => ({
            ...edge,
            className: connectedEdgeIds.has(edge.id) ? 'highlight' : 'dimmed',
            animated: connectedEdgeIds.has(edge.id),
        }));
    }, [edges, connectedEdgeIds, selectedNodeId]);

    return { styledNodes, styledEdges, handleNodeClick };
};

/**
 * Calculates and assigns positions to nodes within their parent group containers.
 * It arranges nodes in a grid-like pattern to prevent overlap.
 *
 * @param {Array} nodes - The initial array of nodes.
 * @returns {Array} A new array of nodes with calculated positions.
 */
export const distributeNodesInGroups = (nodes) => {
    const nodesByParent = new Map();
    const groups = new Map();
    // First, map out all groups and children
    nodes.forEach(node => {
        if (node.type === 'group') {
            groups.set(node.id, node);
        } else if (node.parentId) {
            if (!nodesByParent.has(node.parentId)) {
                nodesByParent.set(node.parentId, []);
            }
            nodesByParent.get(node.parentId).push(node);
        }
    });

    return nodes.map((node) => {
        // We only need to calculate positions for nodes within a group
        if (node.type === 'group' || !node.parentId) {
            return node;
        }

        const parentGroup = groups.get(node.parentId);
        const siblings = nodesByParent.get(node.parentId) || [];
        if (!parentGroup || siblings.length === 0) {
            return node;
        }

        // --- Grid Layout Calculation ---
        const nodeIndex = siblings.findIndex(n => n.id === node.id);
        const totalNodes = siblings.length;

        // Define padding and node dimensions for spacing
        const padding = 20;
        const nodeWidth = 150;
        const nodeHeight = 40;

        const groupWidth = parentGroup.style?.width ?? 600;
        const groupHeight = parentGroup.style?.height ?? 400;

        const columns = Math.floor(groupWidth / (nodeWidth + 4 * padding));

        // Calculate the cell dimensions based on group size
        const cellWidth = (groupWidth - padding * 2) / columns;
        const cellHeight = (groupHeight - padding * 2) / (Math.ceil(totalNodes / columns));

        const col = nodeIndex % columns;
        const row = Math.floor(nodeIndex / columns);

        // Center the node within its calculated grid cell
        const x = (row % 2 === 0) ? (col * cellWidth + (cellWidth - nodeWidth) / 2) + padding : (col * cellWidth + (cellWidth - nodeWidth) / 2) + 0;
        const y = (col % 2 === 0) ? (row * cellHeight + (cellHeight - nodeHeight) / 2) + padding : (row * cellHeight + (cellHeight - nodeHeight) / 2) + 0;

        return {
            ...node,
            position: { x, y },
        };
    });
};

// Calculate node positions just once
const laidOutInitialNodes = distributeNodesInGroups(initialNodes);

const KpiMindmap = () => {
    // Standard React Flow state management
    const [nodes, setNodes, onNodesChange] = useNodesState(laidOutInitialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const handleNodeInfoClick = (nodeData) => {
        setSelectedNode(nodeData);
    };
    const handleCloseCard = () => {
        setSelectedNode(null);
    };
    // Use our custom hook to get styled elements and the click handler
    const { styledNodes, styledEdges, handleNodeClick } = useNodeHighlighter(nodes, edges);

    const memoizedCustomNode = (props) => (
        <CustomNode {...props} onInfoClick={handleNodeInfoClick} />
    );
    
    const nodeTypes = {
        kpiNode: memoizedCustomNode, // register our custom type
    };
    
    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={styledNodes}
                edges={styledEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                className="kpi-mindmap"
                attributionPosition="none"
                connectable='false'
                connectionLineStyle={{ display: 'none' }}
                nodesConnectable={false}
                nodeTypes={nodeTypes}
            >
                <Controls />
                <Background gap={16} />
                {/* Legend Panel */}
                <Panel position="top-left" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 m-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            KPI Hierarchy Legend
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                                <span>Strategic Level</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <span>Managerial Level</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                                <span>Operational Level</span>
                            </div>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>
            {selectedNode && (
                <DescriptionCard nodeData={selectedNode} onClose={handleCloseCard} />
            )}
        </div>
    );
};

export default KpiMindmap;