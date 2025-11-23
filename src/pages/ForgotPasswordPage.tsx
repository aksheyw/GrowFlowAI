import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { resetPassword } = useAuth();
    const { addToast } = useToast();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!email) {
            addToast('Please enter your email address', 'error');
            return;
        }

        setLoading(true);
        try {
            const { error } = await resetPassword(email);
            if (error) throw error;
            setSubmitted(true);
            addToast('Password reset email sent!', 'success');
        } catch (error: unknown) {
            console.error('Error sending reset email:', error);
            const message = error instanceof Error ? error.message : (error as { message?: string })?.message || 'Failed to send reset email';
            addToast(message, 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left side - Illustration */}
            <div className="hidden lg:flex lg:w-[55%] bg-[#F2F5F1] items-center justify-center p-16 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#D4E8C9] rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#E8F3E0] rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#F0F7EB] rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-12"
                    >
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl mb-8 rotate-3 hover:rotate-6 transition-transform duration-500 ease-out">
                            🌱
                        </div>
                        <h2 className="text-5xl font-bold text-[#1A2F16] mb-6 tracking-tight leading-[1.1]">
                            Recover your<br />
                            <span className="text-[#5A8E3D]">flow.</span>
                        </h2>
                        <p className="text-xl text-[#5A6B54] leading-relaxed max-w-md">
                            Don't worry, it happens to the best of us. We'll help you get back on track.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-[400px]"
                >
                    <div className="text-center mb-10 lg:text-left">
                        <div className="lg:hidden w-16 h-16 bg-[#F2F5F1] rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto">
                            🌱
                        </div>
                        <h1 className="text-3xl font-bold text-[#1A2F16] mb-3 tracking-tight">
                            Forgot Password?
                        </h1>
                        <p className="text-[#5A6B54] text-[15px]">
                            {submitted
                                ? "Check your email for the reset link."
                                : "Enter your email to receive a reset link."}
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <AuthInput
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" "
                                required
                            />

                            <AuthButton loading={loading} loadingText="Sending..." className="mt-2">
                                Send Reset Link
                            </AuthButton>
                        </form>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                            <p className="text-green-800 font-medium mb-2">Email Sent!</p>
                            <p className="text-green-600 text-sm">
                                We've sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-green-700 text-sm font-semibold mt-4 hover:underline"
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    <p className="text-center text-[14px] text-[#5A6B54] mt-8">
                        Remember your password?
                        <Link
                            to="/login"
                            className="ml-1.5 text-[#5A8E3D] hover:text-[#3D6821] font-semibold transition-colors"
                        >
                            Back to Login
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
