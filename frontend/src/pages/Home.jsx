import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';

export default function Home() {
  const [pricing, setPricing] = useState({
    bwSingle: 2.0,
    bwDouble: 2.0,
    colSingle: 10.0,
    colDouble: 10.0,
  });

  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    api.getPricing()
      .then((res) => {
        if (res.success && res.pricing) {
          setPricing(res.pricing);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does CampusPrint eliminate queues at the campus Xerox center?',
      a: 'Instead of standing in line waiting to transfer files via pendrive or WhatsApp, you upload your PDFs from your mobile or hostel laptop, configure single/double sided, pay online, and our automated printer spooler immediately prints your documents. You just walk in and pick up your ready printout.',
    },
    {
      q: 'How is double-sided printing calculated?',
      a: 'Double-sided printing combines 2 document pages onto 1 physical A4 sheet. For example, a 10-page document printed double-sided takes exactly 5 physical sheets. An 11-page document takes 6 sheets. You are charged per physical sheet according to college Xerox rates.',
    },
    {
      q: 'Can I print only specific pages from my PDF or assignment?',
      a: 'Yes! Select "Custom Range" for any document and specify page numbers like 1-5, 8, 10-12. Our system extracts and prints only the exact selected pages.',
    },
    {
      q: 'How do I know when my documents are ready to collect?',
      a: 'You receive real-time order tracking updates on your phone. As soon as the local Windows Print Agent finishes printing your job, the status turns green to "Ready for Collection" at the SAC Xerox counter.',
    },
    {
      q: 'What formats are supported?',
      a: 'We accept PDF documents as well as high-resolution image files (JPG, JPEG, PNG) up to 25 MB per file.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-cp-surface-alt/70 via-cp-bg to-cp-bg transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cp-surface-alt text-sage dark:text-copper text-xs font-black tracking-wider uppercase mb-6 shadow-sm border border-cp-border">
            <Sparkles className="w-3.5 h-3.5 text-sage dark:text-copper" />
            Official Campus Printing Portal
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-cp-text tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Your Documents. <br />
            Our Printer. <br />
            <span className="text-sage dark:text-copper">
              Zero Waiting.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-cp-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
            Eliminate morning Xerox queues. Upload assignments, lab records, and notes from your phone or hostel, pay online, and collect your printed pages instantly from the SAC counter.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-sage hover:bg-sage-hover dark:bg-aquamarine dark:hover:bg-aquamarine-hover text-white font-black text-base shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <UploadCloud className="w-5 h-5 text-white" />
              <span>Upload Documents Now</span>
            </Link>

            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-aquamarine-surface dark:hover:bg-aquamarine text-cp-text font-bold text-base border border-cp-border shadow-sm transition-all"
            >
              <span>View Pricing</span>
              <ArrowRight className="w-4 h-4 text-sage dark:text-copper" />
            </a>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-cp-surface border border-cp-border shadow-soft">
            <div className="text-center p-2">
              <span className="block text-2xl font-black text-sage dark:text-copper">0 Mins</span>
              <span className="text-xs font-bold text-cp-text-secondary">Queue Time</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl font-black text-sage dark:text-copper">₹{pricing.bwSingle}</span>
              <span className="text-xs font-bold text-cp-text-secondary">B&W Per Sheet</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl font-black text-sage dark:text-copper">100%</span>
              <span className="text-xs font-bold text-cp-text-secondary">Auto Print Agent</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl font-black text-sage dark:text-copper">UPI / QR</span>
              <span className="text-xs font-bold text-cp-text-secondary">Instant Online Pay</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black text-sage dark:text-copper tracking-wider uppercase">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-black text-cp-text tracking-tight mt-1">
            How CampusPrint Works
          </h2>
          <p className="text-cp-text-secondary mt-2 text-sm sm:text-base">
            No more waiting behind 30 students to print 2 pages before class.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-cp-surface p-6 rounded-2xl border border-cp-border shadow-soft relative group hover:border-sage dark:hover:border-aquamarine transition-all">
            <div className="w-12 h-12 rounded-xl bg-cp-surface-alt text-sage dark:text-copper font-black text-lg flex items-center justify-center mb-5 group-hover:bg-sage dark:group-hover:bg-aquamarine group-hover:text-white transition-colors border border-cp-border">
              1
            </div>
            <h3 className="text-base font-bold text-cp-text mb-2">Upload Files</h3>
            <p className="text-xs text-cp-text-secondary leading-relaxed">
              Drag and drop your assignment PDFs, notes, or lab sheets directly from your phone or laptop.
            </p>
          </div>

          <div className="bg-cp-surface p-6 rounded-2xl border border-cp-border shadow-soft relative group hover:border-sage dark:hover:border-aquamarine transition-all">
            <div className="w-12 h-12 rounded-xl bg-cp-surface-alt text-sage dark:text-copper font-black text-lg flex items-center justify-center mb-5 group-hover:bg-sage dark:group-hover:bg-aquamarine group-hover:text-white transition-colors border border-cp-border">
              2
            </div>
            <h3 className="text-base font-bold text-cp-text mb-2">Configure Print</h3>
            <p className="text-xs text-cp-text-secondary leading-relaxed">
              Select B&W or Vivid Colour, single or double-sided, number of copies, or custom page subsets.
            </p>
          </div>

          <div className="bg-cp-surface p-6 rounded-2xl border border-cp-border shadow-soft relative group hover:border-sage dark:hover:border-aquamarine transition-all">
            <div className="w-12 h-12 rounded-xl bg-cp-surface-alt text-sage dark:text-copper font-black text-lg flex items-center justify-center mb-5 group-hover:bg-sage dark:group-hover:bg-aquamarine group-hover:text-white transition-colors border border-cp-border">
              3
            </div>
            <h3 className="text-base font-bold text-cp-text mb-2">Pay Online</h3>
            <p className="text-xs text-cp-text-secondary leading-relaxed">
              Pay securely via UPI, Google Pay, PhonePe, or cards through Razorpay in seconds.
            </p>
          </div>

          <div className="bg-cp-surface p-6 rounded-2xl border border-cp-border shadow-soft relative group hover:border-sage dark:hover:border-aquamarine transition-all">
            <div className="w-12 h-12 rounded-xl bg-cp-surface-alt text-sage dark:text-copper font-black text-lg flex items-center justify-center mb-5 group-hover:bg-sage dark:group-hover:bg-aquamarine group-hover:text-white transition-colors border border-cp-border">
              4
            </div>
            <h3 className="text-base font-bold text-cp-text mb-2">Collect & Go</h3>
            <p className="text-xs text-cp-text-secondary leading-relaxed">
              Our automated print spooler outputs your sheets. Walk into the SAC shop and grab your printout!
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Table */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-sage dark:text-copper tracking-wider uppercase">
            Official Campus Rates
          </span>
          <h2 className="text-3xl font-black text-cp-text tracking-tight mt-1">
            Transparent Pricing
          </h2>
          <p className="text-cp-text-secondary mt-2 text-sm sm:text-base">
            Configured in real-time by the campus Xerox shop administration. No hidden surcharges.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="bg-cp-surface p-6 rounded-2xl border border-cp-border shadow-soft hover:shadow-card transition-shadow">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cp-surface-alt text-sage dark:text-copper border border-cp-border">
              Standard B&W
            </span>
            <h3 className="text-base font-bold text-cp-text mt-4">Single-Sided</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-cp-text">₹{pricing.bwSingle}</span>
              <span className="text-xs text-cp-text-muted ml-1.5 font-bold">/ physical sheet</span>
            </div>
            <p className="text-xs text-cp-text-secondary mt-3 leading-relaxed">
              Standard 75 GSM A4 paper. Ideal for regular homework and assignments.
            </p>
          </div>

          {/* Card 2 - Most Popular */}
          <div className="bg-cp-surface p-6 rounded-2xl border-2 border-sage dark:border-aquamarine shadow-card relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sage dark:bg-aquamarine text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              Eco Friendly
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cp-surface-alt text-sage dark:text-copper border border-cp-border">
              Economy B&W
            </span>
            <h3 className="text-base font-bold text-cp-text mt-4">Double-Sided</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-sage dark:text-copper">₹{pricing.bwDouble}</span>
              <span className="text-xs text-cp-text-muted ml-1.5 font-bold">/ physical sheet</span>
            </div>
            <p className="text-xs text-cp-text-secondary mt-3 leading-relaxed">
              2 document pages per physical sheet. Half the paper, maximum savings!
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-cp-surface p-6 rounded-2xl border border-cp-border shadow-soft hover:shadow-card transition-shadow">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cp-surface-alt text-burntOrange border border-cp-border">
              High Resolution
            </span>
            <h3 className="text-base font-bold text-cp-text mt-4">Colour Single-Sided</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-cp-text">₹{pricing.colSingle}</span>
              <span className="text-xs text-cp-text-muted ml-1.5 font-bold">/ physical sheet</span>
            </div>
            <p className="text-xs text-cp-text-secondary mt-3 leading-relaxed">
              Vivid colour laser prints. Perfect for diagrams, charts, and cover pages.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-cp-surface p-6 rounded-2xl border border-cp-border shadow-soft hover:shadow-card transition-shadow">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cp-surface-alt text-mutedTeal dark:text-copper border border-cp-border">
              Presentation
            </span>
            <h3 className="text-base font-bold text-cp-text mt-4">Colour Double-Sided</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-cp-text">₹{pricing.colDouble}</span>
              <span className="text-xs text-cp-text-muted ml-1.5 font-bold">/ physical sheet</span>
            </div>
            <p className="text-xs text-cp-text-secondary mt-3 leading-relaxed">
              Full colour back-to-back laser printing for project reports and portfolios.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-black text-sage dark:text-copper tracking-wider uppercase">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-cp-text tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-cp-surface border border-cp-border rounded-xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-cp-text text-sm hover:bg-cp-surface-alt/50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-sage dark:text-copper shrink-0 transition-transform ${
                    faqOpen === idx ? 'rotate-180 text-sage dark:text-copper' : ''
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-5 pt-1 text-cp-text-secondary text-xs sm:text-sm leading-relaxed border-t border-cp-border bg-cp-surface-alt/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Ready To Print Banner (Bottom CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-sage dark:bg-aquamarine-surface rounded-3xl p-8 sm:p-14 text-white text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Ready to print without standing in line?
            </h2>
            <p className="text-white/90 text-sm sm:text-base font-medium">
              Upload your documents right now, pay in seconds, and collect your finished prints from the SAC Xerox shop.
            </p>
            <div className="pt-4">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#243021] dark:text-[#162429] font-black text-sm shadow-md transition-all transform hover:scale-105"
              >
                <span>Start Printing Now</span>
                <ArrowRight className="w-4 h-4 text-[#243021] dark:text-[#162429]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
