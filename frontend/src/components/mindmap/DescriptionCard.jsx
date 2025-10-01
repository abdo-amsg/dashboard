import { X } from 'lucide-react';

const DescriptionCard = ({ nodeData, onClose }) => {
  if (!nodeData) return null;

  // This function handles clicks on the backdrop.
  // It checks if the click was on the backdrop itself and not on the card content.
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Backdrop: covers the entire screen, blurs the background, and handles outside clicks
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure it's on top of everything
      }}
    >
      {/* Card: The content container */}
      <div
        style={{
          position: 'relative',
          background: 'var(--card-background-color)',
          borderRadius: '8px',
          padding: '2rem',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X className="text-text-secondary hover:text-text-primary" />
        </button>

        {/* Card Content */}
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', color: 'var(--text-color)' }}>
          {nodeData.label}
        </h3>
        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-color-light)' }}>
          {nodeData.description || 'No description available.'}
        </p>
      </div>
    </div>
  );
};

export default DescriptionCard;