'use client';
import { useState } from 'react';

export default function FailureModal({ isOpen, onClose, onConfirm }) {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(reason);
        setReason('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-container p-8 w-full max-w-md animate-in zoom-in-95 duration-200 border-[var(--error)] shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <h3 className="text-2xl font-bold text-[var(--error)] mb-4">Mission Failed</h3>
                <p className="text-[var(--text-muted)] mb-6">
                    Acknowledgement is the first step to improvement. Why did this task fail?
                </p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        className="w-full h-32 p-4 mb-6 rounded-lg bg-black/20 border border-[var(--card-border)] focus:border-[var(--error)] focus:outline-none transition-colors resize-none"
                        placeholder="I procrastinated because..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        autoFocus
                    />

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded bg-[var(--error)] text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                        >
                            Accept Failure
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
