import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }) => {

  // Determine node type and apply appropriate styling
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '8px',
      maxWidth: '200px',
      fontSize: '12px',
      color: '#1a1a1a',
      textAlign: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      background: 'white',
      border: '2px solid transparent',
      transition: 'all 0.2s ease'
    };

    return baseStyle;

  };

  // Get handle style based on position
  const getHandleStyle = (position) => ({
    width: '8px',
    height: '8px',
    backgroundColor: '#9CA3AF',
    border: '2px solid white',
    borderRadius: '50%'
  });

  return (
    <div
      style={getNodeStyle()}
      className="custom-node z-50"
      onMouseEnter={() => {
        // Add hover effect
        document.body.style.cursor = 'pointer';
      }}
      onMouseLeave={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* Target Handle (top) */}
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        style={getHandleStyle(targetPosition)}
      />

      {/* Node Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ fontWeight: data.type === 'main' ? '600' : '400' }}>
          {data.label}
        </span>
      </div>

      {/* Source Handle (bottom) */}
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        style={getHandleStyle(sourcePosition)}
      />
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(CustomNode);