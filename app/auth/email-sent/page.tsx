'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function EmailSentPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-[45%] bg-[#0f1f2e] text-white p-8 lg:p-16 flex-col justify-between">
        <div>
          <h1 className="text-[#FF6B2C] text-4xl font-bold mb-4">MOTOOS</h1>
          <p className="text-slate-300 text-lg mb-12">Dealership Intelligence Platform</p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📬</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Check Your Inbox</h3>
                <p className="text-slate-400">Reset link sent to your email</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🕐</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Valid for 15 Minutes</h3>
                <p className="text-slate-400">Click the link within 15 minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">📁</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Check Spam Folder</h3>
                <p className="text-slate-400">Email might be in spam/junk</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🔄</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Didn't Receive It?</h3>
                <p className="text-slate-400">Request a new link after a few minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          <p>© 2026 MotoOS — AVA MC. All rights reserved.</p>
          <p>256-bit encrypted • GDPR compliant • Swedish hosting</p>
        </div>
      </div>

      {/* Right Side - Confirmation */}
      <div className="flex-1 bg-[#f5f7fa] flex items-center justify-center p-6 md:p-12 relative">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <LanguageSwitcher variant="compact" />
        </div>

        {/* Mobile Logo */}
        <div className="md:hidden absolute top-4 left-4">
          <h1 className="text-[#FF6B2C] text-xl font-bold">MOTOOS</h1>
        </div>

        <div className="w-full max-w-md text-center mt-12 md:mt-0">
          <div className="text-5xl md:text-7xl mb-4 md:mb-6">📧</div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Check Your Email</h2>
          <p className="text-slate-600 mb-8">
            We've sent a password reset link to your email address. Click the link in the email to create a new password.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>⏱️ Link expires in 15 minutes</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              For security reasons, the reset link will expire after 15 minutes
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Didn't receive the email?
            </p>
            <Link
              href="/auth/forgot-password"
              className="block w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Resend Email
            </Link>
          </div>

          <div className="text-center mt-8">
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
