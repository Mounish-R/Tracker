'use client';
import { useState } from 'react';

export default function TaskInput({ onAdd }) {
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title || !deadline) return;

        if (new Date(deadline) <= new Date()) {
            setError("Deadline must be in the future!");
            return;
        }

        setLoading(true);

        // Create a timeout promise to prevent hanging indefinitely
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timed out. Please check your internet connection.")), 10000);
        });

        try {
            // Race between the actual add and the timeout
            await Promise.race([onAdd(title, deadline), timeout]);

            setTitle('');
            setDeadline('');
        } catch (error) {
            console.error("Error adding task: ", error);
            setError("Failed: " + error.message);
        } finally {
            // Ensure loading is ALWAYS turned off
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-container p-6 mb-8 animate-in fade-in zoom-in duration-500">
            <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)]">New Mission</h3>
            {error && (
                <div className="mb-4 p-3 rounded bg-[var(--error)]/10 border border-[var(--error)] text-[var(--error)] text-sm">
                    {error}
                </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 w-full">
                <input
                    type="text"
                    placeholder="Enter task name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full md:flex-1 min-w-[200px] bg-white/5 border border-white/10 text-white placeholder-gray-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg"
                    required
                    disabled={loading}
                    style={{ minHeight: '3.5rem' }}
                />
                <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full md:w-auto min-w-[220px] bg-white/5 border border-white/10 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    required
                    disabled={loading}
                    style={{ minHeight: '3.5rem' }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                    {loading ? 'Adding...' : 'Start Countdown'}
                </button>
            </div>
        </form>
    );
}
