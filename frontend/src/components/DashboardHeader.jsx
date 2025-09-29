import { useState, useRef, useEffect, useContext } from 'react';
import { Search, Download, Upload, Moon, Sun, ChevronDown } from 'lucide-react';
import UploadFlow from './UploadFlow';
import { ThemeContext } from '../contexts/ThemeContext';

function DashboardHeader({ setSwitch, setActiveItem, user, logout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <header className="bg-background text-text-primary px-6 py-3 border-b border-border shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br bg-brand rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-br bg-brand rounded-full"></div>
              </div>
            </div>
            <h1>
              <span className="text-2xl font-bold bg-brand bg-clip-text text-transparent">
                Cybr
              </span>
              <span className="text-2xl font-bold bg-red-600 bg-clip-text text-transparent">
                Sens
              </span>
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 border border-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm bg-input-background text-input-text"
              />
            </div>

            {/* Download Button */}
            <button
              className="p-2.5 text-text-secondary hover:text-brand hover:bg-hover rounded-xl relative group"
              title="Export Reports"
            >
              <Download className="w-5 h-5" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Export Reports
              </span>
            </button>

            {/* Upload Button with Enhanced Styling */}
            <button
              onClick={() => {setIsUploadModalOpen(true); console.log(isUploadModalOpen)}}
              className="p-2.5 text-text-secondary hover:text-brand hover:bg-hover rounded-xl relative group"
              title="Upload Security Report"
            >
              <Upload className="w-5 h-5" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Upload Report
              </span>
              <div className="absolute -top-0 -right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-text-secondary hover:text-yellow-600 hover:bg-yellow-100 rounded-xl relative group"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-profile-background hover:bg-hover transition-colors"
              >
                <img
                  src={`https://imgs.search.brave.com/uDEcwBKmk2pulTQswWm7XSMR4qrHMDyagzZBYVIMHLs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvNTAwcC8y/OC82Ni9ncmF5LXBy/b2ZpbGUtc2lsaG91/ZXR0ZS1hdmF0YXIt/dmVjdG9yLTIxNTQy/ODY2LmpwZw`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary">
                    {user.email}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {user.is_superuser ? 'Admin' : 'User'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card-background border border-card-border rounded-lg shadow-lg py-1 z-10">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveItem(4);
                      setIsDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-text-primary hover:bg-hover cursor-pointer transition-colors"
                  >
                    Profile
                  </a>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-text-primary hover:bg-hover cursor-pointer transition-colors"
                  >
                    Settings
                  </a>
                  {user?.is_superuser && (
                    <a
                      onClick={() => {
                        setSwitch(true);
                        setActiveItem(0);
                        setIsDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-hover cursor-pointer transition-colors"
                    >
                      Manage Users
                    </a>
                  )}
                  <hr className="my-2 border-border" />
                  <button
                    onClick={() => {
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-light cursor-pointer transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <UploadFlow
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        setActiveItem={setActiveItem}
      />
    </>
  );
}

export default DashboardHeader;