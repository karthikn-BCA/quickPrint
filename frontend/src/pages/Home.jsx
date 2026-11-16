import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer,
  UploadCloud,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  ChevronDown,
  FileCheck,
  Zap,
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
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Official Campus Printing Portal
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Your Documents. <br />
            Our Printer. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Zero Waiting.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate morning Xerox queues. Upload assignments, lab records, and notes from your phone or hostel, pay online, and collect your printed pages instantly from the SAC counter.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Upload Documents Now</span>
            </Link>

            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm transition-all"
            >
              <span>View Pricing</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 shadow-soft">
            <div className="text-center p-2">
              <span className="block text-2xl font-black text-indigo-600">0 Mins</span>
              <span className="text-xs font-medium text-slate-500">Queue Time</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl font-black text-indigo-600">₹{pricing.bwSingle}</span>
              <span className="text-xs font-medium text-slate-500">B&W Per Sheet</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl font-black text-indigo-600">100%</span>
              <span className="text-xs font-medium text-slate-500">Auto Print Agent</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl font-black text-indigo-600">UPI / QR</span>
              <span className="text-xs font-medium text-slate-500">Instant Online Pay</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            How CampusPrint Works
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            No more waiting behind 30 students to print 2 pages before class.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              1
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Upload Files</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drag and drop your assignment PDFs, notes, or lab sheets directly from your phone or laptop.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              2
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Configure Print</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select B&W or Vivid Colour, single or double-sided, number of copies, or custom page subsets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              3
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Pay Online</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pay securely via UPI, Google Pay, PhonePe, or cards through Razorpay in seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-black text-lg flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              4
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Collect & Go</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our automated print spooler outputs your sheets. Walk into the SAC shop and grab your printout!
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Table */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
            Official Campus Rates
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Transparent Pricing
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Configured in real-time by the campus Xerox shop administration. No hidden surcharges.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Standard B&W
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-4">Single-Sided</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-slate-900">₹{pricing.bwSingle}</span>
              <span className="text-xs text-slate-500 ml-1.5 font-medium">/ physical sheet</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Standard 75 GSM A4 paper. Ideal for regular homework and assignments.
            </p>
          </div>

          {/* Card 2 - Most Popular */}
          <div className="bg-white p-6 rounded-2xl border-2 border-indigo-600 shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider">
              Eco Friendly
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              Economy B&W
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-4">Double-Sided</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-indigo-600">₹{pricing.bwDouble}</span>
              <span className="text-xs text-slate-500 ml-1.5 font-medium">/ physical sheet</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              2 document pages per physical sheet. Half the paper, maximum savings!
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">
              High Resolution
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-4">Colour Single-Sided</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-slate-900">₹{pricing.colSingle}</span>
              <span className="text-xs text-slate-500 ml-1.5 font-medium">/ physical sheet</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Vivid colour laser prints. Perfect for diagrams, charts, and cover pages.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
              Presentation
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-4">Colour Double-Sided</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black text-slate-900">₹{pricing.colDouble}</span>
              <span className="text-xs text-slate-500 ml-1.5 font-medium">/ physical sheet</span>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Full colour back-to-back laser printing for project reports and portfolios.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-slate-800 text-sm hover:bg-slate-50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    faqOpen === idx ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Ready To Print Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 sm:p-14 text-white text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to print without standing in line?
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base">
              Upload your documents right now, pay in seconds, and collect your finished prints from the SAC Xerox shop.
            </p>
            <div className="pt-4">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow hover:bg-indigo-50 transition-colors"
              >
                <span>Start Printing Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
