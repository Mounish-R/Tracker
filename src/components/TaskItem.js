'use client';
import { useState, useEffect, useRef, memo } from 'react';

const TaskItem = memo(function TaskItem({ task, onComplete, onFail, onEdit }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDeadline, setEditDeadline] = useState(task.deadline);
    const dateInputRef = useRef(null);

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

    const handleSave = () => {
        if (!editTitle.trim() || !editDeadline) return;
        onEdit(task.id, editTitle, editDeadline);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(task.title);
        setEditDeadline(task.deadline);
        setIsEditing(false);
    };

    const statusColors = {
        active: 'border-[var(--card-border)]',
        completed: 'border-[var(--success)] shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        failed: 'border-[var(--error)] shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    };

    const currentStatus = (task.status === 'active' && isExpired) ? 'failed' : task.status;

    return (
        <div className={`glass-container p-6 mb-4 transition-all duration-300 ${statusColors[currentStatus] || ''}`}>
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    {isEditing ? (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-lg font-semibold text-[var(--foreground)] focus:border-[var(--primary)] outline-none"
                                placeholder="Task Title"
                            />
                            <div className="relative">
                                <input
                                    ref={dateInputRef}
                                    type="datetime-local"
                                    value={editDeadline ? new Date(editDeadline).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setEditDeadline(e.target.value)}
                                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] focus:border-[var(--primary)] outline-none [&::-webkit-calendar-picker-indicator]:invert-[.5]"
                                    onClick={() => dateInputRef.current?.showPicker()}
                                />
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button onClick={handleSave} className="text-xs bg-[var(--primary)] text-white px-3 py-1.5 rounded hover:opacity-90">Save</button>
                                <button onClick={handleCancel} className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:opacity-90">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h4 className={`text-lg font-semibold ${task.status === 'completed' ? 'text-[var(--success)]' : (task.status === 'failed' || isExpired) ? 'text-[var(--error)]' : ''}`}>
                                {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-[var(--text-muted)]">
                                    Deadline: {new Date(task.deadline).toLocaleString()}
                                </p>
                                {task.status === 'active' && !isExpired && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-[10px] text-[var(--text-muted)] hover:text-[var(--primary)] underline opacity-50 hover:opacity-100 transition-all uppercase tracking-wider"
                                    >
                                        Quick Edit
                                    </button>
                                )}
                            </div>
                            {task.failureReason && (
                                <p className="text-sm text-[var(--error)] mt-2 italic">
                                    &quot;{task.failureReason}&quot;
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="text-right">
                    {task.status === 'active' && !isEditing && (
                        <div className={`text-2xl font-mono font-bold mb-3 ${isExpired ? 'text-[var(--error)]' : 'text-[var(--primary)]'}`}>
                            {timeLeft || 'Calculating...'}
                        </div>
                    )}

                    {task.status === 'active' && !isEditing && (
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
});

export default TaskItem;
