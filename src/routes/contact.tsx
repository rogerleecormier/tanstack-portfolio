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
    <div className='mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-2'>
      {/* Info Column */}
      <div className='space-y-8'>
        <div className='space-y-4'>
          <h1 className='text-3xl font-extrabold tracking-tight text-white'>
            Get in Touch
          </h1>
          <p className='text-sm leading-relaxed text-slate-400'>
            If you are looking to collaborate, discuss SaaS integrations, or
            talk PMO delivery frameworks, reach out directly.
          </p>
        </div>

        <div className='space-y-6 text-xs text-slate-300'>
          <div className='flex items-center gap-4'>
            <span className='flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400'>
              <Mail className='h-5 w-5' />
            </span>
            <div>
              <p className='font-semibold text-slate-500'>Email</p>
              <a
                href='mailto:rogerleecormier@gmail.com'
                className='font-bold transition-colors hover:text-indigo-400'
              >
                rogerleecormier@gmail.com
              </a>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <span className='flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400'>
              <Phone className='h-5 w-5' />
            </span>
            <div>
              <p className='font-semibold text-slate-500'>Phone</p>
              <a
                href='tel:5858086213'
                className='font-bold transition-colors hover:text-indigo-400'
              >
                (585) 808-6213
              </a>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <span className='flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400'>
              <MapPin className='h-5 w-5' />
            </span>
            <div>
              <p className='font-semibold text-slate-500'>Location</p>
              <p className='font-bold'>Davenport, Florida</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className='rounded-xl border border-slate-800 bg-slate-900/30 p-8'>
        {submitted ? (
          <div className='flex h-full flex-col items-center justify-center space-y-3 py-16 text-center'>
            <span className='text-4xl'>🎉</span>
            <h2 className='text-lg font-bold text-white'>Thank you!</h2>
            <p className='text-xs text-slate-400'>
              Your message has been sent successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-1.5'>
              <label className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                Name
              </label>
              <input
                type='text'
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className='w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-white placeholder-slate-600 transition-colors focus:border-indigo-500 focus:outline-none'
                placeholder='Your Name'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                Email
              </label>
              <input
                type='email'
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className='w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-white placeholder-slate-600 transition-colors focus:border-indigo-500 focus:outline-none'
                placeholder='you@example.com'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-xs font-bold uppercase tracking-wide text-slate-400'>
                Message
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className='w-full resize-none rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-white placeholder-slate-600 transition-colors focus:border-indigo-500 focus:outline-none'
                placeholder='Your message details...'
              />
            </div>
            <button
              type='submit'
              className='flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-500'
            >
              Send Message <Send className='h-3.5 w-3.5' />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
