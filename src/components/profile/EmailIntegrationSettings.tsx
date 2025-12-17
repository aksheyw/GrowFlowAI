import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Plus, Trash2, Loader2, Sprout } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';

interface Props {
    onBack: () => void;
}

export default function EmailIntegrationSettings({ onBack }: Props) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAllowedEmails();
        }
    }, [user]);

    const fetchAllowedEmails = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('allowed_ingest_emails')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            if (data?.allowed_ingest_emails) {
                setAllowedEmails(data.allowed_ingest_emails);
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            // Silent error or toast if needed
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
            addToast('Please enter a valid email address', 'error');
            return;
        }

        if (allowedEmails.includes(emailToAdd)) {
            addToast('This email is already added', 'error');
            return;
        }

        setLoading(true);
        try {
            // Fetch latest to avoid race conditions
            const { data: latestProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('allowed_ingest_emails')
                .eq('id', user?.id)
                .single();

            if (fetchError) throw fetchError;

            const currentEmails = latestProfile?.allowed_ingest_emails || [];
            if (currentEmails.includes(emailToAdd)) {
                addToast('This email is already added', 'error');
                setAllowedEmails(currentEmails);
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
            addToast('Email added to root system 🌱', 'success');
        } catch (error) {
            console.error('Error adding email:', error);
            addToast('Failed to add email', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveEmail = async (emailToRemove: string) => {
        setLoading(true);
        try {
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
            addToast('Email removed', 'success');
        } catch (error) {
            console.error('Error removing email:', error);
            addToast('Failed to remove email', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-ios-surface-dark rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Email Integration</h2>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-ios-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-ios-separator-dark overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-[#2D5016] dark:text-green-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Forwarding Setup</h3>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 text-sm">
                        Forward emails to <span className="font-semibold text-gray-900 dark:text-white">growflowai@gmail.com</span> to instantly turn them into tasks. Add your personal email addresses below so we recognize you.
                    </p>

                    <div className="space-y-6">
                        {/* Input Area */}
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Add Allowed Email Address"
                                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-ios-surface-dark border border-gray-200 dark:border-ios-separator-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6FA84C]/20 focus:border-[#6FA84C] transition-all placeholder:text-gray-400 text-sm text-gray-900 dark:text-white"
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
                                <div className="text-center py-8 bg-gray-50 dark:bg-ios-surface-dark rounded-xl border border-dashed border-gray-200 dark:border-ios-separator-dark">
                                    <Sprout className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No personal emails added yet</p>
                                </div>
                            ) : (
                                allowedEmails.map((email, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-ios-surface-dark rounded-xl border border-gray-100 dark:border-ios-separator-dark group hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                                    >
                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{email}</span>
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
        </div>
    );
}
