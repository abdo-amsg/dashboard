import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="bg-main-background text-center py-20">
        <h1 className="text-5xl font-bold text-text-primary">Welcome to CybrSens</h1>
        <p className="text-xl text-text-secondary mt-4">Your intelligent cybersecurity dashboard.</p>
        <Link to="/signup" className="mt-8 inline-block bg-button text-button-text px-8 py-3 rounded-md text-lg font-semibold hover:bg-button-light">
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card-background p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-text-primary mb-4">XXXXXXXXXXXXXXXXXXXX</h3>
              <p className="text-text-secondary">xxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxx.</p>
            </div>
            <div className="bg-card-background p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-text-primary mb-4">XXXXXXXXXXXXXXXXXXXX</h3>
              <p className="text-text-secondary">xxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxx xxxxxxxxxx.</p>
            </div>
            <div className="bg-card-background p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-text-primary mb-4">XXXXXXXXXXXXXXXXXXXX</h3>
              <p className="text-text-secondary">xxxxxxxxxxx xxxxxxxxxxxx xxxxxxxxx xxxxxxxxxxxxxx xxxxxxxxxxxxxxxx xxxxxxxxx.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
