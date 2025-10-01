import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Info } from 'lucide-react';

const CustomNode = ({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom, onInfoClick }) => {

  // Determine node type and apply appropriate styling
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '8px',
      maxWidth: '200px',
      fontSize: '12px',
      color: 'var(--text-color)',
      textAlign: 'center',
      boxShadow: '0 2px 5px var(--text-color-light)',
      background: 'var(--card-background-color)',
      border: '2px solid transparent',
      transition: 'all 0.2s ease'
    };

    return baseStyle;

  };

  // Get handle style based on position
  const getHandleStyle = (position) => ({
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--brand-color)',
    border: '2px solid var(--background-color)',
    borderRadius: '50%'
  });

  const handleInfoClick = (event) => {
    // Stop the event from propagating to the node itself,
    // which might trigger node drag or other events.
    event.stopPropagation();
    if (onInfoClick) {
      onInfoClick(data);
    }
  };

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
      <Info className="absolute top-0 left-1 text-brand-light hover:text-brand cursor-pointer w-4" onClick={handleInfoClick} />
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