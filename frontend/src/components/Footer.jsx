import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-dark-surface text-slate-300 dark:text-slate-400 border-t border-slate-800 dark:border-dark-border mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase">
                Campus<span className="text-brand-500">Print</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">
              Smart College Xerox & Digital Printing Management. Upload your assignments, pay online, and skip the shop queue completely.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Printer Agent Active & Online
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/upload" className="text-slate-400 hover:text-brand-400 transition-colors">
                  Upload Documents
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-400 hover:text-brand-400 transition-colors">
                  View Transparent Pricing
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-slate-400 hover:text-brand-400 transition-colors">
                  Track Print Order
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate-400 hover:text-brand-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop Hours & Services */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Shop Timings & Services
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-200">Mon - Sat:</strong> 8:30 AM - 7:00 PM<br />
                  <span className="text-xs text-slate-500">Sunday Closed</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Single & Double-Sided A4 Printing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Black & White & Vivid Colour</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Campus Shop Location
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                <span>Ground Floor, Student Activity Centre (SAC), Near Central Canteen</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <span>xerox@campusprint.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 dark:border-dark-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusPrint. All rights reserved. Built for College Campus Xerox Center.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500 inline" /> for college students & campus printers.
          </p>
        </div>
      </div>
    </footer>
  );
}
