import { User, Mail, Calendar, LogOut, Settings, Shield, Camera } from 'lucide-react';
import { useState } from 'react';

const Profile = ({ user, logout }) => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    };

    const handleLogout = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-main-background to-background p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-background rounded-xl shadow-sm p-6 mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Profile</h1>
                    <p className="text-text-secondary">Manage your account settings and preferences</p>
                </div>

                {/* Main Profile Card */}
                <div className="bg-background rounded-2xl shadow-lg overflow-hidden mb-6">
                    {/* Cover/Header Section */}
                    <div className="bg-gradient-to-r from-brand to-brand-light h-32 relative">
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-20"></div>
                    </div>

                    {/* Profile Content */}
                    <div className="relative px-6 pb-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-main-background rounded-full border-4 border-main-background shadow-lg flex items-center justify-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-brand to-brand-light rounded-full flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">
                                            {getInitials(user.username)}
                                        </span>
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-0 bg-brand hover:bg-brand-light text-white p-2 rounded-full shadow-lg transition-colors ">
                                    <Camera size={16} />
                                </button>
                            </div>

                            <div className="mt-4 sm:mt-0 sm:pb-2">
                                <h2 className="text-2xl font-bold text-gray-100">{user.username}</h2>
                                <p className="text-text-secondary">Member since {formatDate(user.created_at)}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                                    <User className="mr-2 text-brand" size={20} />
                                    Personal Information
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-status-bg rounded-lg">
                                        <User className="text-text-primary mr-3" size={18} />
                                        <div>
                                            <p className="text-sm text-text-primary font-bold">Username</p>
                                            <p className="font-medium text-text-primary">{user.username}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-3 bg-status-bg rounded-lg">
                                        <Mail className="text-text-primary mr-3" size={18} />
                                        <div>
                                            <p className="text-sm text-text-primary font-bold">Email Address</p>
                                            <p className="font-medium text-text-primary">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-3 bg-status-bg rounded-lg">
                                        <Calendar className="text-text-primary mr-3" size={18} />
                                        <div>
                                            <p className="text-sm text-text-primary font-bold">Member Since</p>
                                            <p className="font-medium text-text-primary">{formatDate(user.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-text-primary flex items-center">
                                    <Settings className="mr-2 text-brand" size={20} />
                                    Quick Actions
                                </h3>

                                <div className="space-y-3">
                                    <button className="w-full flex items-center p-3 bg-highlight hover:bg-border-light rounded-lg transition-colors ">
                                        <Settings className="text-brand mr-3" size={18} />
                                        <div className="text-left">
                                            <p className="font-medium text-text-primary">Account Settings</p>
                                            <p className="text-sm text-text-secondary">Update your preferences</p>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center p-3 bg-[var(--stat-card-background2)] hover:bg-[var(--stat-card-background22)] rounded-lg transition-colors ">
                                        <Shield className="text-[var(--stat-card-color2)] mr-3" size={18} />
                                        <div className="text-left">
                                            <p className="font-medium text-text-primary">Security</p>
                                            <p className="text-sm text-text-secondary">Change password & 2FA</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setShowLogoutConfirm(true)}
                                        className="w-full flex items-center p-3 bg-danger-light hover:bg-[var(--stat-card-background4)] rounded-lg transition-colors "
                                    >
                                        <LogOut className="text-danger mr-3" size={18} />
                                        <div className="text-left">
                                            <p className="font-medium text-text-primary">Sign Out</p>
                                            <p className="text-sm text-text-secondary">Log out of your account</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats Card */}
                <div className="bg-background rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Account Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Account Status */}
                        <div className={`rounded-lg p-4 text-center ${user.is_active
                            ? 'bg-[var(--stat-card-background2)]'
                            : 'bg-danger-light'
                            }`}>
                            <div className={`text-2xl font-bold ${user.is_active
                                ? 'text-[var(--stat-card-color2)]'
                                : 'text-danger'
                                }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </div>
                            <div className="text-sm text-text-primary">Account Status</div>
                        </div>

                        {/* Email Status */}
                        <div className={`rounded-lg p-4 text-center ${user.is_verified
                            ? 'bg-[var(--stat-card-background2)]'
                            : 'bg-[var(--stat-card-background4)]'
                            }`}>
                            <div className={`text-2xl font-bold ${user.is_verified
                                ? 'text-[var(--stat-card-color2)]'
                                : 'text-[var(--stat-card-color4)]'
                                }`}>
                                {user.is_verified ? 'Verified' : 'Pending'}
                            </div>
                            <div className="text-sm text-text-primary">Email Status</div>
                        </div>

                        {/* Account Type */}
                        <div className={`rounded-lg p-4 text-center ${user.is_superuser
                            ? 'bg-[var(--stat-card-background3)]'
                            : 'bg-[var(--stat-card-background1)]'
                            }`}>
                            <div className={`text-2xl font-bold ${user.is_superuser
                                ? 'text-[var(--stat-card-color3)]'
                                : 'text-brand'
                                }`}>
                                {user.is_superuser
                                    ? 'Administrator'
                                    : 'Standard'
                                }
                            </div>
                            <div className="text-sm text-text-primary">Account Type</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-main-background rounded-2xl p-6 max-w-sm w-full">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-danger-light rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="text-danger" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Sign Out</h3>
                            <p className="text-text-secondary mb-6">Are you sure you want to sign out of your account?</p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors "
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors "
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;