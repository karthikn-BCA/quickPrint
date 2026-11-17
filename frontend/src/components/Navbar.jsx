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
    <header className="sticky top-0 z-40 bg-brand-500 dark:bg-dark-surface text-white dark:text-slate-100 shadow-md border-b border-brand-600/40 dark:border-dark-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-white/20 dark:bg-brand-500/20 backdrop-blur-md flex items-center justify-center text-white dark:text-brand-300 shadow-inner group-hover:scale-105 transition-transform border border-white/30 dark:border-brand-500/30">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-brand-200 transition-colors uppercase">
              Campus<span className="text-brand-200 dark:text-brand-300">Print</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 dark:bg-brand-500/20 text-white dark:text-brand-300 border border-white/30 dark:border-brand-500/30 tracking-wider">
              SAC XEROX
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              isActive('/')
                ? 'text-white bg-white/25 dark:bg-brand-500/25 shadow-sm'
                : 'text-white/85 dark:text-slate-300 hover:text-white hover:bg-white/15 dark:hover:bg-dark-card'
            }`}
          >
            Home
          </Link>
          <Link
            to="/upload"
            className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              isActive('/upload')
                ? 'text-white bg-white/25 dark:bg-brand-500/25 shadow-sm'
                : 'text-white/85 dark:text-slate-300 hover:text-white hover:bg-white/15 dark:hover:bg-dark-card'
            }`}
          >
            Upload
          </Link>
          <Link
            to="/pricing"
            className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              isActive('/pricing')
                ? 'text-white bg-white/25 dark:bg-brand-500/25 shadow-sm'
                : 'text-white/85 dark:text-slate-300 hover:text-white hover:bg-white/15 dark:hover:bg-dark-card'
            }`}
          >
            Pricing
          </Link>
          <Link
            to="/track"
            className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              isActive('/track')
                ? 'text-white bg-white/25 dark:bg-brand-500/25 shadow-sm'
                : 'text-white/85 dark:text-slate-300 hover:text-white hover:bg-white/15 dark:hover:bg-dark-card'
            }`}
          >
            Track Order
          </Link>
        </nav>

        {/* Action Controls & Dark/Light Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/track"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/90 dark:text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/10 dark:bg-dark-card hover:bg-white/20 dark:hover:bg-dark-border border border-white/20 dark:border-dark-border transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Track ID
          </Link>

          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-dark-card dark:hover:bg-dark-border text-white dark:text-brand-300 border border-white/20 dark:border-dark-border transition-all transform active:scale-95 shadow-sm"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-brand-300 rotate-0 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-white rotate-0 transition-transform duration-300" />
            )}
          </button>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-brand-600 dark:bg-brand-500 dark:text-white hover:bg-brand-50 dark:hover:bg-brand-600 text-sm font-black uppercase tracking-wider shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-brand-600 dark:text-white" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white dark:bg-white dark:text-brand-600 text-xs font-black animate-pulse shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
