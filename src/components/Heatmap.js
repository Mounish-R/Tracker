'use client';
import { useMemo } from 'react';

export default function Heatmap({ tasks }) {
    const heatmapData = useMemo(() => {
        // Generate last 35 days (5 weeks) for a nice grid
        const days = [];
        const today = new Date();

        // Start from 34 days ago
        for (let i = 34; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            days.push({
                date: d,
                iso: d.toISOString().split('T')[0],
                success: 0,
                failed: 0,
            });
        }

        // Populate data
        tasks.forEach(task => {
            if (!task.completedAt) return;
            // Handle Firestore Timestamp or JS Date
            const dateStr = task.completedAt.toDate ? task.completedAt.toDate().toISOString().split('T')[0] : new Date(task.completedAt).toISOString().split('T')[0];

            const day = days.find(d => d.iso === dateStr);
            if (day) {
                if (task.status === 'completed') day.success++;
                if (task.status === 'failed') day.failed++;
            }
        });

        return days;
    }, [tasks]);

    const getColor = (day) => {
        const total = day.success + day.failed;
        if (total === 0) return 'bg-[var(--card-border)]/30';

        // Prioritize failure alert, but could blend if needed
        if (day.failed > 0) return 'bg-[var(--error)] shadow-[0_0_12px_rgba(244,63,94,0.4)]';
        if (day.success > 0) return 'bg-[var(--success)] shadow-[0_0_12px_rgba(16,185,129,0.4)]';

        return 'bg-[var(--card-border)]/30';
    };

    return (
        <div className="glass-container p-4 md:p-8 sticky top-8 animate-in fade-in slide-in-from-right duration-700">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-xl font-bold">Performance</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Activity over last 35 days</p>
                </div>
                <div className="text-right">
                    {/* Simple stats could go here */}
                </div>
            </div>

            <div className="grid grid-cols-7 gap-3">
                {heatmapData.map((day) => (
                    <div
                        key={day.iso}
                        className="group relative"
                    >
                        <div
                            className={`w-full aspect-square rounded-xl ${getColor(day)} transition-all duration-300 hover:scale-110 cursor-default`}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-[#18181b] text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-20 border border-[var(--card-border)] shadow-xl transition-opacity duration-200">
                            <div className="font-semibold mb-1 border-b border-[var(--card-border)] pb-1">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                            <div className="text-[var(--success)]">Success: {day.success}</div>
                            <div className="text-[var(--error)]">Failed: {day.failed}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex gap-6 text-xs font-medium text-[var(--text-muted)] justify-center border-t border-[var(--card-border)] pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--success)] shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div> Success
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--error)] shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div> Failure
                </div>
            </div>
        </div>
    );
}
