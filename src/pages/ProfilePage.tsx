import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,
    Plus,
    Trash2,
    Mail,
    Sprout,
    Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getInitials } from '../utils/premiumHelpers';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile?.allowed_ingest_emails) {
            setAllowedEmails(profile.allowed_ingest_emails);
        }
    }, [profile]);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
            toast.success('See you soon!');
        } catch (error) {
            toast.error('Failed to sign out');
        }
    };

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleAddEmail = async () => {
        if (!newEmail) return;

        const emailToAdd = newEmail.trim().toLowerCase();

        if (!validateEmail(emailToAdd)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (allowedEmails.includes(emailToAdd)) {
            toast.error('This email is already added');
            return;
        }

        setLoading(true);
        try {
            // Fetch latest profile data to minimize race conditions
            const { data: latestProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('allowed_ingest_emails')
                .eq('id', user?.id)
                .single();

            if (fetchError) throw fetchError;

            const currentEmails = latestProfile?.allowed_ingest_emails || [];
            if (currentEmails.includes(emailToAdd)) {
                toast.error('This email is already added');
                setAllowedEmails(currentEmails); // Sync local state
                return;
            }

            const updatedEmails = [...currentEmails, emailToAdd];

            const { error } = await supabase
                .from('profiles')
                .update({ allowed_ingest_emails: updatedEmails })
                .eq('id', user?.id);

            if (error) throw error;

            setAllowedEmails(updatedEmails);
            setNewEmail('');
            toast.success('Email added to root system 🌱');
        } catch (error) {
            console.error('Error adding email:', error);
            toast.error('Failed to add email');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveEmail = async (emailToRemove: string) => {
        setLoading(true);
        try {
            // Fetch latest profile data to minimize race conditions
            const { data: latestProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('allowed_ingest_emails')
                .eq('id', user?.id)
                .single();

            if (fetchError) throw fetchError;

            const currentEmails = latestProfile?.allowed_ingest_emails || [];
            const updatedEmails = currentEmails.filter((email: string) => email !== emailToRemove);

            const { error } = await supabase
                .from('profiles')
                .update({ allowed_ingest_emails: updatedEmails })
                .eq('id', user?.id);

            if (error) throw error;

            setAllowedEmails(updatedEmails);
            toast.success('Email removed');
        } catch (error) {
            console.error('Error removing email:', error);
            toast.error('Failed to remove email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-12 font-sans">
            <Toaster position="top-center" />

            <div className="max-w-2xl mx-auto px-6 py-8">

                {/* Header Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6FA84C] to-[#2D5016] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                            {getInitials(profile?.full_name || user?.email || 'User')}
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile?.full_name || 'Gardener'}</h1>
                    <p className="text-gray-500 font-medium mb-6">{user?.email}</p>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-full text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                {/* Roots & Inputs Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#2D5016]">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Email Integration</h2>
                        </div>

                        <p className="text-gray-500 leading-relaxed mb-8 pl-[52px]">
                            Forward emails to <span className="font-semibold text-gray-900">growflowai@gmail.com</span> to instantly turn them into tasks. Add your personal email addresses below so we recognize you.
                        </p>

                        <div className="space-y-6 pl-[52px]">
                            {/* Input Area */}
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Add Allowed Email Address"
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6FA84C]/20 focus:border-[#6FA84C] transition-all placeholder:text-gray-400"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                                />
                                <button
                                    onClick={handleAddEmail}
                                    disabled={loading || !newEmail}
                                    aria-label="Add email address"
                                    className="w-12 h-[46px] bg-[#2D5016] text-white rounded-xl flex items-center justify-center hover:bg-[#1a300d] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#2D5016]/20"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Plus className="w-6 h-6" />
                                    )}
                                </button>
                            </div>

                            {/* List Area */}
                            <div className="space-y-3">
                                {allowedEmails.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Sprout className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">No personal emails added yet</p>
                                    </div>
                                ) : (
                                    allowedEmails.map((email, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-gray-200 transition-colors"
                                        >
                                            <span className="text-gray-700 font-medium">{email}</span>
                                            <button
                                                onClick={() => handleRemoveEmail(email)}
                                                disabled={loading}
                                                aria-label={`Remove ${email}`}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-xs text-gray-300 font-medium tracking-wide uppercase">GrowFlow AI • v1.0.2</p>
                </div>
            </div>
        </div>
    );
}
