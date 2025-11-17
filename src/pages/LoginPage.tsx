import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PlantIcon from '../components/PlantIcon';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          addToast('Password reset email sent! Check your inbox.', 'success');
          setIsForgotPassword(false);
          setEmail('');
        }
      } else if (isSignUp) {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          addToast('Account created successfully! Please sign in to continue.', 'success');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setFullName('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-frosted rounded-3xl shadow-2xl border border-gray-200/50 p-8 sm:p-10 smooth-transition">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6">
              <PlantIcon className="w-16 h-16" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">GrowFlow</h1>
            <p className="text-gray-600 mt-2 text-center">Cultivate your productivity</p>
          </div>

          {!isForgotPassword && (
            <div className="flex gap-0 mb-8 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium smooth-transition button-press text-sm ${
                  !isSignUp
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium smooth-transition button-press text-sm ${
                  isSignUp
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {isForgotPassword && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                }}
                className="text-sm text-green-700 hover:text-green-800 font-medium smooth-transition flex items-center gap-1"
              >
                <span>←</span> Back to Login
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isForgotPassword ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition bg-white text-base"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {isSignUp && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition bg-white text-base"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition bg-white text-base"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none smooth-transition bg-white text-base"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm animate-slideDown">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold py-3.5 px-4 rounded-xl smooth-transition button-press disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Please wait...
                </span>
              ) : (
                isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {!isForgotPassword && !isSignUp && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                }}
                className="text-sm text-green-700 hover:text-green-800 font-medium smooth-transition"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
