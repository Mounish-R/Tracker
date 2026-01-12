'use client';
import { useState, useRef } from 'react';

export default function TaskInput({ onAdd }) {
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dateInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title || !deadline) return;

        if (new Date(deadline) <= new Date()) {
            setError("Deadline must be in the future!");
            return;
        }

        setLoading(true);

        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timed out. Please check your internet connection.")), 10000);
        });

        try {
            await Promise.race([onAdd(title, deadline), timeout]);
            setTitle('');
            setDeadline('');
        } catch (error) {
            console.error("Error adding task: ", error);
            setError("Failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-container p-8 mb-10 animate-in fade-in zoom-in duration-500 relative overflow-hidden group">
            {/* Subtle Gradient Glow in background */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)] opacity-10 blur-[80px] rounded-full pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>

            <h3 className="text-xl font-bold mb-6 text-[var(--foreground)] flex items-center gap-2">
                <span className="text-[var(--primary)]">✦</span> New Mission
            </h3>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Mission Name</label>
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[var(--card-bg)] border-[var(--card-border)] focus:border-[var(--primary)] focus:bg-[var(--card-bg)] transition-all font-medium text-lg placeholder-[var(--text-muted)] text-[var(--foreground)]"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">Deadline</label>
                        <div className="relative">
                            <input
                                ref={dateInputRef}
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full bg-[var(--card-bg)] border-[var(--card-border)] focus:border-[var(--primary)] focus:bg-[var(--card-bg)] transition-all font-medium text-lg text-[var(--foreground)] pr-12 [&::-webkit-calendar-picker-indicator]:opacity-0"
                                required
                                disabled={loading}
                                onClick={() => dateInputRef.current?.showPicker()}
                            />
                            <div
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full md:w-auto px-10 py-4 text-lg shadow-[0_4px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)]"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                INITIATE MISSION
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
