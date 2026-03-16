'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { getDealershipId } from '@/lib/tenant'

type TestResult = 'idle' | 'testing' | 'ok' | 'error'

export default function EmailSettingsPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        smtpUser: '',
        smtpPass: '',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
    })
    const [saving,     setSaving]     = useState(false)
    const [saved,      setSaved]      = useState(false)
    const [testResult, setTestResult] = useState<TestResult>('idle')
    const [testMsg,    setTestMsg]    = useState('')
    const [showPass,   setShowPass]   = useState(false)
    const [loaded,     setLoaded]     = useState(false)

    useEffect(() => {
        const raw = localStorage.getItem('user')
        if (!raw) { router.push('/auth/login'); return }
        const u = JSON.parse(raw)
        if (u.role !== 'admin') { router.push('/settings'); return }

        async function load() {
            const id = getDealershipId()
            if (!id) return
            const { data } = await supabase
                .from('dealerships')
                .select('smtp_user, smtp_pass, smtp_host, smtp_port')
                .eq('id', id)
                .single()
            if (data) {
                setForm({
                    smtpUser: data.smtp_user ?? '',
                    smtpPass: data.smtp_pass ?? '',
                    smtpHost: data.smtp_host ?? 'smtp.gmail.com',
                    smtpPort: String(data.smtp_port ?? 587),
                })
            }
            setLoaded(true)
        }
        load()
    }, [router])

    async function handleSave() {
        setSaving(true)
        setSaved(false)
        const id = getDealershipId()
        if (!id) return
        await supabase.from('dealerships').update({
            smtp_user: form.smtpUser || null,
            smtp_pass: form.smtpPass || null,
            smtp_host: form.smtpHost || 'smtp.gmail.com',
            smtp_port: parseInt(form.smtpPort) || 587,
        }).eq('id', id)
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    async function handleTest() {
        setTestResult('testing')
        setTestMsg('')
        try {
            const res = await fetch('/api/test-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    smtpUser: form.smtpUser,
                    smtpPass: form.smtpPass,
                    smtpHost: form.smtpHost,
                    smtpPort: parseInt(form.smtpPort),
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setTestResult('ok')
                setTestMsg(`Test email sent to ${form.smtpUser}`)
            } else {
                setTestResult('error')
                setTestMsg(data.error ?? 'Connection failed')
            }
        } catch {
            setTestResult('error')
            setTestMsg('Network error — check your settings')
        }
    }

    const isGmail = form.smtpHost === 'smtp.gmail.com'

    return (
        <div className="flex min-h-screen bg-[#f5f7fa]">
            <Sidebar />
            <div className="lg:ml-64 flex-1">
                <div className="brand-top-bar" />
                <div className="p-6 max-w-2xl animate-fade-up">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                        <Link href="/settings" className="hover:text-[#FF6B2C] transition-colors">Settings</Link>
                        <span>/</span>
                        <span className="text-slate-600 font-medium">Email Sending</span>
                    </div>

                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-[#FF6B2C]/10 flex items-center justify-center text-xl">✉️</div>
                            <div>
                                <h1 className="text-xl font-black text-[#0b1524]">Email Sending Settings</h1>
                                <p className="text-xs text-slate-500">Configure your SMTP credentials so PO emails go out from your dealership email</p>
                            </div>
                        </div>
                    </div>

                    {/* Info banner */}
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
                        <span className="text-blue-500 text-lg shrink-0">ℹ️</span>
                        <div className="text-xs text-blue-700 leading-relaxed">
                            <p className="font-semibold mb-1">How it works</p>
                            <p>When you send a Purchase Order email, it goes out from your own email address instead of the platform default. Your vendor replies will land directly in your inbox.</p>
                        </div>
                    </div>

                    {!loaded ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">Loading…</div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">

                            {/* Sender Email */}
                            <div className="px-6 py-5">
                                <label className="block text-sm font-bold text-slate-800 mb-1">
                                    Sender Email Address
                                </label>
                                <p className="text-xs text-slate-400 mb-3">
                                    This is the email your POs will be sent <em>from</em>.{' '}
                                    {isGmail && <span className="text-blue-600 font-medium">Use your Gmail address.</span>}
                                </p>
                                <input
                                    type="email"
                                    placeholder="orders@yourdealership.com"
                                    value={form.smtpUser}
                                    onChange={(e) => setForm(f => ({ ...f, smtpUser: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]/20 transition"
                                />
                            </div>

                            {/* App Password */}
                            <div className="px-6 py-5">
                                <label className="block text-sm font-bold text-slate-800 mb-1">
                                    {isGmail ? 'Google App Password' : 'SMTP Password'}
                                </label>
                                {isGmail && (
                                    <p className="text-xs text-slate-400 mb-3">
                                        Not your regular Gmail password.{' '}
                                        <span className="font-medium text-slate-600">Go to myaccount.google.com → Security → App Passwords</span>{' '}
                                        to generate one. Looks like: <span className="font-mono text-slate-700">xxxx xxxx xxxx xxxx</span>
                                    </p>
                                )}
                                {!isGmail && (
                                    <p className="text-xs text-slate-400 mb-3">Your SMTP account password.</p>
                                )}
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder={isGmail ? 'xxxx xxxx xxxx xxxx' : 'SMTP password'}
                                        value={form.smtpPass}
                                        onChange={(e) => setForm(f => ({ ...f, smtpPass: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C]/20 transition pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                                    >
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {/* SMTP Host & Port */}
                            <div className="px-6 py-5">
                                <label className="block text-sm font-bold text-slate-800 mb-3">
                                    SMTP Server <span className="font-normal text-slate-400">(advanced)</span>
                                </label>

                                {/* Quick presets */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {[
                                        { label: 'Gmail',        host: 'smtp.gmail.com',     port: '587' },
                                        { label: 'Outlook / 365',host: 'smtp.office365.com', port: '587' },
                                        { label: 'Yahoo',        host: 'smtp.mail.yahoo.com', port: '587' },
                                        { label: 'Custom',       host: '',                   port: '587' },
                                    ].map(preset => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setForm(f => ({ ...f, smtpHost: preset.host, smtpPort: preset.port }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                                form.smtpHost === preset.host && preset.host !== ''
                                                    ? 'bg-[#FF6B2C] border-[#FF6B2C] text-white'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#FF6B2C]/40'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-500 mb-1">SMTP Host</label>
                                        <input
                                            type="text"
                                            placeholder="smtp.gmail.com"
                                            value={form.smtpHost}
                                            onChange={(e) => setForm(f => ({ ...f, smtpHost: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#FF6B2C] transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Port</label>
                                        <input
                                            type="number"
                                            placeholder="587"
                                            value={form.smtpPort}
                                            onChange={(e) => setForm(f => ({ ...f, smtpPort: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#FF6B2C] transition"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">
                                    Port 587 = STARTTLS (recommended) · Port 465 = SSL/TLS · Port 25 = plain (not recommended)
                                </p>
                            </div>

                            {/* Test result */}
                            {testResult !== 'idle' && testResult !== 'testing' && (
                                <div className={`mx-6 my-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                                    testResult === 'ok'
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    {testResult === 'ok' ? '✅' : '✗'} {testMsg}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="px-6 py-5 flex items-center justify-between gap-3">
                                <button
                                    onClick={handleTest}
                                    disabled={!form.smtpUser || !form.smtpPass || testResult === 'testing'}
                                    className="px-4 py-2 border border-slate-200 hover:border-[#FF6B2C]/40 bg-white text-slate-600 hover:text-[#FF6B2C] text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {testResult === 'testing' ? (
                                        <>
                                            <span className="inline-block w-3.5 h-3.5 border-2 border-slate-300 border-t-[#FF6B2C] rounded-full animate-spin" />
                                            Testing…
                                        </>
                                    ) : '📨 Send Test Email'}
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2 bg-[#FF6B2C] hover:bg-[#e55a1f] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    {saving ? (
                                        <>
                                            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving…
                                        </>
                                    ) : saved ? '✓ Saved!' : 'Save Settings'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Clear credentials note */}
                    {(form.smtpUser || form.smtpPass) && (
                        <div className="mt-4 flex items-center justify-between bg-white border border-slate-100 rounded-xl px-5 py-3">
                            <p className="text-xs text-slate-500">Want to go back to platform default email?</p>
                            <button
                                onClick={async () => {
                                    const id = getDealershipId()
                                    if (!id) return
                                    await supabase.from('dealerships').update({
                                        smtp_user: null, smtp_pass: null,
                                        smtp_host: 'smtp.gmail.com', smtp_port: 587,
                                    }).eq('id', id)
                                    setForm({ smtpUser: '', smtpPass: '', smtpHost: 'smtp.gmail.com', smtpPort: '587' })
                                    setSaved(true)
                                    setTimeout(() => setSaved(false), 2000)
                                }}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                            >
                                Clear & use platform default
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
