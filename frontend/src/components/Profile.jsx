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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                {/* Main Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    {/* Cover/Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative">
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-20"></div>
                    </div>

                    {/* Profile Content */}
                    <div className="relative px-6 pb-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">
                                            {getInitials(user.username)}
                                        </span>
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200">
                                    <Camera size={16} />
                                </button>
                            </div>

                            <div className="mt-4 sm:mt-0 sm:pb-2">
                                <h2 className="text-2xl font-bold text-gray-100">{user.username}</h2>
                                <p className="text-gray-600">Member since {formatDate(user.created_at)}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <User className="mr-2 text-blue-600" size={20} />
                                    Personal Information
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <User className="text-gray-400 mr-3" size={18} />
                                        <div>
                                            <p className="text-sm text-gray-500">Username</p>
                                            <p className="font-medium text-gray-900">{user.username}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <Mail className="text-gray-400 mr-3" size={18} />
                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <p className="font-medium text-gray-900">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="text-gray-400 mr-3" size={18} />
                                        <div>
                                            <p className="text-sm text-gray-500">Member Since</p>
                                            <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Settings className="mr-2 text-blue-600" size={20} />
                                    Quick Actions
                                </h3>

                                <div className="space-y-3">
                                    <button className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                                        <Settings className="text-blue-600 mr-3" size={18} />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">Account Settings</p>
                                            <p className="text-sm text-gray-500">Update your preferences</p>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                                        <Shield className="text-green-600 mr-3" size={18} />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">Security</p>
                                            <p className="text-sm text-gray-500">Change password & 2FA</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setShowLogoutConfirm(true)}
                                        className="w-full flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                    >
                                        <LogOut className="text-red-600 mr-3" size={18} />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">Sign Out</p>
                                            <p className="text-sm text-gray-500">Log out of your account</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Account Status */}
                        <div className={`rounded-lg p-4 text-center ${user.is_active
                            ? 'bg-green-50'
                            : 'bg-red-50'
                            }`}>
                            <div className={`text-2xl font-bold ${user.is_active
                                ? 'text-green-600'
                                : 'text-red-600'
                                }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </div>
                            <div className="text-sm text-gray-600">Account Status</div>
                        </div>

                        {/* Email Status */}
                        <div className={`rounded-lg p-4 text-center ${user.is_verified
                            ? 'bg-green-50'
                            : 'bg-yellow-50'
                            }`}>
                            <div className={`text-2xl font-bold ${user.is_verified
                                ? 'text-green-600'
                                : 'text-yellow-600'
                                }`}>
                                {user.is_verified ? 'Verified' : 'Pending'}
                            </div>
                            <div className="text-sm text-gray-600">Email Status</div>
                        </div>

                        {/* Account Type */}
                        <div className={`rounded-lg p-4 text-center ${user.is_superuser
                            ? 'bg-purple-50'
                            : 'bg-blue-50'
                            }`}>
                            <div className={`text-2xl font-bold ${user.is_superuser
                                ? 'text-purple-600'
                                : 'text-blue-600'
                                }`}>
                                {user.is_superuser
                                    ? 'Administrator'
                                    : 'Standard'
                                }
                            </div>
                            <div className="text-sm text-gray-600">Account Type</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to sign out of your account?</p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
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