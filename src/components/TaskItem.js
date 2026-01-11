'use client';
import { useState, useEffect } from 'react';

export default function TaskItem({ task, onComplete, onFail }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (task.status !== 'active') return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const deadlineDate = new Date(task.deadline).getTime();
            const distance = deadlineDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft('EXPIRED');
                setIsExpired(true);
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [task.deadline, task.status]);

    const statusColors = {
        active: 'border-[var(--card-border)]',
        completed: 'border-[var(--success)] shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        failed: 'border-[var(--error)] shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    };

    return (
        <div className={`glass-container p-6 mb-4 transition-all duration-300 ${statusColors[task.status] || ''}`}>
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h4 className={`text-lg font-semibold ${task.status === 'completed' ? 'text-[var(--success)]' : task.status === 'failed' ? 'text-[var(--error)]' : ''}`}>
                        {task.title}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Deadline: {new Date(task.deadline).toLocaleString()}
                    </p>
                    {task.failureReason && (
                        <p className="text-sm text-[var(--error)] mt-2 italic">
                            &quot;{task.failureReason}&quot;
                        </p>
                    )}
                </div>

                <div className="text-right">
                    {task.status === 'active' && (
                        <div className={`text-2xl font-mono font-bold mb-3 ${isExpired ? 'text-[var(--error)]' : 'text-[var(--primary)]'}`}>
                            {timeLeft || 'Calculating...'}
                        </div>
                    )}

                    {task.status === 'active' && (
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => onComplete(task.id)}
                                className="px-4 py-2 rounded bg-[var(--success)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                Complete
                            </button>
                            <button
                                onClick={() => onFail(task)}
                                className="px-4 py-2 rounded bg-[var(--error)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                            >
                                Failed
                            </button>
                        </div>
                    )}

                    {task.status === 'completed' && <div className="text-[var(--success)] font-bold">SUCCESS</div>}
                    {task.status === 'failed' && <div className="text-[var(--error)] font-bold">FAILED</div>}
                </div>
            </div>
        </div>
    );
}
