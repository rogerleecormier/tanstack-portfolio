import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const Route = createFileRoute('/contact')({
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Info Column */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Get in Touch</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            If you are looking to collaborate, discuss SaaS integrations, or talk PMO delivery frameworks, reach out directly.
          </p>
        </div>

        <div className="space-y-6 text-xs text-slate-300">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Mail className="w-5 h-5" />
            </span>
            <div>
              <p className="text-slate-500 font-semibold">Email</p>
              <a href="mailto:rogerleecormier@gmail.com" className="hover:text-indigo-400 transition-colors font-bold">
                rogerleecormier@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Phone className="w-5 h-5" />
            </span>
            <div>
              <p className="text-slate-500 font-semibold">Phone</p>
              <a href="tel:5858086213" className="hover:text-indigo-400 transition-colors font-bold">
                (585) 808-6213
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <p className="text-slate-500 font-semibold">Location</p>
              <p className="font-bold">Davenport, Florida</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-8">
        {submitted ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
            <span className="text-4xl">🎉</span>
            <h2 className="text-lg font-bold text-white">Thank you!</h2>
            <p className="text-xs text-slate-400">Your message has been sent successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Your Name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Message</label>
              <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="Your message details..." />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors">
              Send Message <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
