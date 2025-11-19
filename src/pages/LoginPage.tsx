import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error signing in:', error);
      addToast(error.message || 'Failed to sign in', 'error');
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
              Stay in flow,<br />
              <span className="text-[#5A8E3D]">watch your tasks grow.</span>
            </h2>
            <p className="text-xl text-[#5A6B54] leading-relaxed max-w-md">
              Transform your daily chaos into a thriving garden of productivity with AI-powered task management.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-[#1A2F16]">2,000+ Users</span>
              <span className="text-xs text-[#5A6B54]">growing every day</span>
            </div>
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
              Welcome back
            </h1>
            <p className="text-[#5A6B54] text-[15px]">
              Enter your details to access your garden.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              <div className="flex justify-end mt-2">
                <Link
                  to="/reset-password"
                  className="text-[13px] text-[#5A8E3D] hover:text-[#3D6821] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <AuthButton loading={loading} loadingText="Signing in..." className="mt-2">
              Sign In
            </AuthButton>
          </form>

          <p className="text-center text-[14px] text-[#5A6B54] mt-8">
            Don't have an account?
            <Link
              to="/signup"
              className="ml-1.5 text-[#5A8E3D] hover:text-[#3D6821] font-semibold transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
