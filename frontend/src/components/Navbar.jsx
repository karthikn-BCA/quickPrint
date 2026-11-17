import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, ShoppingBag, Search, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { toggleTheme, isDark } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-cp-surface/95 backdrop-blur-md text-cp-text shadow-soft border-b border-cp-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover flex items-center justify-center text-white shadow-sm transition-colors">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-cp-text uppercase">
              Campus<span className="text-sage dark:text-copper">Print</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-cp-surface-alt text-sage dark:text-copper border border-cp-border tracking-wider">
              SAC XEROX
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/')
                ? 'text-white bg-sage dark:bg-aquamarine shadow-sm'
                : 'text-cp-text-secondary hover:text-cp-text hover:bg-cp-surface-alt'
            }`}
          >
            Home
          </Link>
          <Link
            to="/upload"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/upload')
                ? 'text-white bg-sage dark:bg-aquamarine shadow-sm'
                : 'text-cp-text-secondary hover:text-cp-text hover:bg-cp-surface-alt'
            }`}
          >
            Upload
          </Link>
          <Link
            to="/pricing"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/pricing')
                ? 'text-white bg-sage dark:bg-aquamarine shadow-sm'
                : 'text-cp-text-secondary hover:text-cp-text hover:bg-cp-surface-alt'
            }`}
          >
            Pricing
          </Link>
          <Link
            to="/track"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/track')
                ? 'text-white bg-sage dark:bg-aquamarine shadow-sm'
                : 'text-cp-text-secondary hover:text-cp-text hover:bg-cp-surface-alt'
            }`}
          >
            Track Order
          </Link>
        </nav>

        {/* Action Controls & Dark/Light Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/track"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cp-text hover:text-sage dark:hover:text-copper px-3 py-1.5 rounded-lg bg-cp-surface-alt hover:bg-cp-border border border-cp-border transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-sage dark:text-copper" />
            Track ID
          </Link>

          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-cp-surface-alt hover:bg-cp-border text-cp-text border border-cp-border transition-all transform active:scale-95 shadow-sm"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-copper rotate-0 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-sage rotate-0 transition-transform duration-300" />
            )}
          </button>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-copper text-forest dark:text-aquamarine-dark text-xs font-black animate-pulse shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
