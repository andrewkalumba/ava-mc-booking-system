'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password reset email sending
    console.log('Sending reset email to:', email);
    router.push('/auth/email-sent');
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-[45%] bg-[#0f1f2e] text-white p-8 lg:p-16 flex-col justify-between">
        <div>
          <h1 className="text-[#FF6B2C] text-4xl font-bold mb-4">BikeMeNow</h1>
          <p className="text-slate-300 text-lg mb-12">Dealership Intelligence Platform</p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔐</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Secure Reset</h3>
                <p className="text-slate-400">Industry-standard password recovery</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">📧</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Email Verification</h3>
                <p className="text-slate-400">Reset link sent to your registered email</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">⏱️</div>
              <div>
                <h3 className="text-xl font-bold mb-2">15-Minute Expiry</h3>
                <p className="text-slate-400">Link expires for security</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🛡️</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Protected Access</h3>
                <p className="text-slate-400">No unauthorized password changes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          <p>© 2026 BikeMeNow.com. All rights reserved.</p>
          <p>256-bit encrypted • GDPR compliant • Swedish hosting</p>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 bg-[#f5f7fa] flex items-center justify-center p-6 md:p-12 relative">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <LanguageSwitcher variant="compact" />
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden absolute top-4 left-4">
          <h1 className="text-[#FF6B2C] text-xl font-bold">BikeMeNow</h1>
        </div>

        <div className="w-full max-w-md mt-12 md:mt-0">
          <div className="text-center mb-6 md:mb-8">
            <div className="text-4xl md:text-5xl mb-4">🔑</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
            <p className="text-sm md:text-base text-slate-600">
              No worries! Enter your email address and we'll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="namn@aterforsaljare.se"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF6B2C] text-white py-3 rounded-lg font-semibold hover:bg-[#e55a1f] transition-colors"
            >
              Send Reset Link
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1"
            >
              <span>←</span> Back to Sign In
            </Link>
          </div>

          <p className="text-center text-sm text-slate-600 mt-8">
            🔒 256-bit SSL encrypted • GDPR compliant
          </p>
        </div>
      </div>
    </div>
  );
}
