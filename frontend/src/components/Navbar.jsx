import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Printer, ShoppingBag, Search, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md text-charcoal dark:text-dark-text shadow-sm border-b border-brand-100 dark:border-dark-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-600 transition-colors">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-charcoal dark:text-white uppercase">
              Campus<span className="text-brand-500 dark:text-brand-300">Print</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/50 tracking-wider">
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
                ? 'text-white bg-brand-500 shadow-sm'
                : 'text-charcoal-muted dark:text-dark-muted hover:text-charcoal dark:hover:text-white hover:bg-brand-50 dark:hover:bg-dark-surface'
            }`}
          >
            Home
          </Link>
          <Link
            to="/upload"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/upload')
                ? 'text-white bg-brand-500 shadow-sm'
                : 'text-charcoal-muted dark:text-dark-muted hover:text-charcoal dark:hover:text-white hover:bg-brand-50 dark:hover:bg-dark-surface'
            }`}
          >
            Upload
          </Link>
          <Link
            to="/pricing"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/pricing')
                ? 'text-white bg-brand-500 shadow-sm'
                : 'text-charcoal-muted dark:text-dark-muted hover:text-charcoal dark:hover:text-white hover:bg-brand-50 dark:hover:bg-dark-surface'
            }`}
          >
            Pricing
          </Link>
          <Link
            to="/track"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/track')
                ? 'text-white bg-brand-500 shadow-sm'
                : 'text-charcoal-muted dark:text-dark-muted hover:text-charcoal dark:hover:text-white hover:bg-brand-50 dark:hover:bg-dark-surface'
            }`}
          >
            Track Order
          </Link>
        </nav>

        {/* Action Controls & Dark/Light Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/track"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal dark:text-dark-text hover:text-brand-500 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-dark-surface hover:bg-brand-100 dark:hover:bg-dark-border border border-brand-100 dark:border-dark-border transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-brand-500" />
            Track ID
          </Link>

          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-brand-50 dark:bg-dark-surface hover:bg-brand-100 dark:hover:bg-dark-border text-charcoal dark:text-brand-300 border border-brand-100 dark:border-dark-border transition-all transform active:scale-95 shadow-sm"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-brand-300 rotate-0 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-charcoal rotate-0 transition-transform duration-300" />
            )}
          </button>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-brand-700 text-xs font-black animate-pulse shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
