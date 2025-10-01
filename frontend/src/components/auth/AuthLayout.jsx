import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../layout/Header';

const AuthLayout = ({ children, title, linkTo, linkText, promptText }) => {
    return (
        <div className="fixed" >
            <Header home={false}/>
            <div className="h-screen w-screen flex">
                {/* Left Pane */}
                <div className="hidden lg:flex w-1/2 bg-[hsl(210,100%,30%)] flex-col items-center justify-center p-12 text-white">
                    <Link to="/" className="flex items-center mb-8">
                        <img src="/CybrSens logo.png" alt="CybrSens Logo" className="h-32 mr-4 rounded-xl border-4 border-[hsl(210,10%,10%)]" />
                    </Link>
                    <p className="text-xl text-center">
                        Unlock the power of data-driven cybersecurity insights.
                    </p>
                </div>

                {/* Right Pane */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-main-background p-8">
                    <div className="w-full max-w-md">
                        <div className="bg-card-background p-8 rounded-lg shadow-md">
                            <h1 className="text-2xl font-bold text-center text-text-primary mb-6">
                                {title}
                            </h1>
                            {children}
                            <p className="mt-4 text-center text-sm text-text-secondary">
                                {promptText}{' '}
                                <Link to={linkTo} className="font-medium text-link hover:text-link-hover">
                                    {linkText}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
