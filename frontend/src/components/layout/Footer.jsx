import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-card-background mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <p className="text-text-secondary">© 2025 CybrSens. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-text-secondary hover:text-link">Privacy Policy</a>
            <a href="#" className="text-text-secondary hover:text-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
