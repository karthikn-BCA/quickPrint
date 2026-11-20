import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-cp-sidebar-bg text-cp-sidebar-text border-t border-cp-sidebar-border mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sage dark:bg-aquamarine flex items-center justify-center text-white shadow-md">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase">
                Campus<span className="text-sage-pale dark:text-copper">Print</span>
              </span>
            </div>
            <p className="text-sm text-cp-sidebar-muted leading-relaxed">
              Smart College Xerox & Digital Printing Management. Upload your assignments, pay online, and skip the shop queue completely.
            </p>
            <div className="flex items-center gap-2 text-xs text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
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
                <Link to="/upload" className="text-cp-sidebar-muted hover:text-white transition-colors">
                  Upload Documents
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-cp-sidebar-muted hover:text-white transition-colors">
                  View Transparent Pricing
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-cp-sidebar-muted hover:text-white transition-colors">
                  Track Print Order
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-cp-sidebar-muted hover:text-white transition-colors">
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
            <ul className="space-y-3 text-sm text-cp-sidebar-muted">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sage-pale dark:text-copper mt-0.5 shrink-0" />
                <span>
                  <strong className="text-white">Mon - Sat:</strong> 8:30 AM - 7:00 PM<br />
                  <span className="text-xs text-cp-sidebar-muted opacity-80">Sunday Closed</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sage-pale dark:text-copper shrink-0" />
                <span>Single & Double-Sided A4 Printing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sage-pale dark:text-copper shrink-0" />
                <span>Black & White & Vivid Colour</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Campus Shop Location
            </h3>
            <ul className="space-y-3 text-sm text-cp-sidebar-muted">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sage-pale dark:text-copper mt-0.5 shrink-0" />
                <span>St Claret College Annex Block</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sage-pale dark:text-copper shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sage-pale dark:text-copper shrink-0" />
                <span>xerox@campusprint.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cp-sidebar-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cp-sidebar-muted gap-4">
          <p>© {new Date().getFullYear()} CampusPrint SAC Xerox Center. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-terracotta fill-terracotta inline" /> for college students & campus printers.
          </p>
        </div>
      </div>
    </footer>
  );
}
