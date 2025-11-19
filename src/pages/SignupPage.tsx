import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Password strength calculation
    const getPasswordStrength = (pass: string) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = getPasswordStrength(password);
    const strengthColor = ['bg-gray-200', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'][strength];
    const strengthText = ['Weak', 'Weak', 'Medium', 'Strong'][strength];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name || !email || !password) {
            addToast('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 8) {
            addToast('Password must be at least 8 characters', 'error');
            return;
        }

        try {
            setLoading(true);
            const { error } = await signUp(email, password, name);
            if (error) throw error;
            addToast('Account created successfully!', 'success');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error signing up:', error);
            addToast(error.message || 'Failed to create account', 'error');
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
                            Join the<br />
                            <span className="text-[#5A8E3D]">growth movement.</span>
                        </h2>
                        <p className="text-xl text-[#5A6B54] leading-relaxed max-w-md">
                            Start your journey towards a more organized and productive life today.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { title: "Smart Tasks", desc: "AI-powered organization" },
                            { title: "Focus Mode", desc: "Stay in the zone" },
                            { title: "Analytics", desc: "Track your growth" },
                            { title: "Reminders", desc: "Never miss a beat" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1), duration: 0.6 }}
                                className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50"
                            >
                                <h3 className="font-bold text-[#1A2F16] mb-1">{item.title}</h3>
                                <p className="text-xs text-[#5A6B54]">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
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
                            Create account
                        </h1>
                        <p className="text-[#5A6B54] text-[15px]">
                            Start growing your productivity today.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <AuthInput
                            label="Full Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder=" "
                            required
                        />

                        <AuthInput
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder=" "
                            required
                        />

                        <div className="relative">
                            <AuthInput
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                required
                            />
                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="flex items-center gap-2 mt-3 px-1">
                                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${strengthColor}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(strength / 3) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{strengthText}</span>
                                </div>
                            )}
                        </div>

                        <AuthButton loading={loading} loadingText="Creating account..." className="mt-2">
                            Create Account
                        </AuthButton>
                    </form>

                    <p className="text-center text-[14px] text-[#5A6B54] mt-8">
                        Already have an account?
                        <Link
                            to="/login"
                            className="ml-1.5 text-[#5A8E3D] hover:text-[#3D6821] font-semibold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
