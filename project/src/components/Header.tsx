import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, Menu, Moon, Plus, Search, Sun, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';

export const Header: React.FC = () => {
  const { authState, signOut } = useAuth();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };
  
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="Readit" className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold text-orangered dark:text-white">readit</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center flex-1 mx-8">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orangered"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {authState.user ? (
            <>
              <Link
                to="/submit"
                className="flex items-center px-4 py-2 rounded-full bg-orangered text-white hover:bg-orange-600 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Create Post</span>
              </Link>
              <div className="relative group">
                <button className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {authState.user.avatar_url ? (
                      <img 
                        src={authState.user.avatar_url} 
                        alt={authState.user.username} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    to={`/user/${authState.user.username}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-full ${
                  location.pathname === '/login'
                    ? 'bg-orangered text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } transition-colors duration-200`}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className={`px-4 py-2 rounded-full ${
                  location.pathname === '/signup'
                    ? 'bg-orangered text-white'
                    : 'bg-orangered text-white hover:bg-orange-600'
                } transition-colors duration-200`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
          >
            {showMobileMenu ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-md">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orangered"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={toggleDarkMode}
              className="flex w-full items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5 mr-3" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 mr-3" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {authState.user ? (
              <>
                <Link
                  to="/submit"
                  className="flex items-center px-3 py-2 rounded-md bg-orangered text-white hover:bg-orange-600 transition-colors duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Plus className="h-5 w-5 mr-3" />
                  <span>Create Post</span>
                </Link>
                <Link
                  to={`/user/${authState.user.username}`}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="h-5 w-5 mr-3" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setShowMobileMenu(false);
                  }}
                  className="flex w-full items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <LogIn className="h-5 w-5 mr-3" />
                  <span>Log In</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center px-3 py-2 rounded-md bg-orangered text-white hover:bg-orange-600 transition-colors duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User className="h-5 w-5 mr-3" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};