import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const Header = ({home=true}) => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <header className={`${home ? 'bg-card-background' : 'bg-background'} shadow-md`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href='/'}>
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
                <nav className="hidden md:flex space-x-8">
                    <Link to="/" className="text-text-secondary hover:text-link">Home</Link>
                    <Link to="/features" className="text-text-secondary hover:text-link">Features</Link>
                    <Link to="/about" className="text-text-secondary hover:text-link">About</Link>
                    <Link to="/contact" className="text-text-secondary hover:text-link">Contact</Link>
                </nav>
                <div className="flex items-center space-x-4">
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
                    <Link to="/login" className="text-text-secondary hover:text-link">Login</Link>
                    <Link to="/signup" className="bg-button text-button-text px-4 py-2 rounded-md hover:bg-button-light">
                        Sign Up
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
