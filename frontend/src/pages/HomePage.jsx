import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LandingPage from './LandingPage';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
