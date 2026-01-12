'use client';
import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import TaskInput from '@/components/TaskInput';
import TaskItem from '@/components/TaskItem';
import FailureModal from '@/components/FailureModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useTasks } from '@/hooks/useTasks';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Mission Log State
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const logDateRef = useRef(null);

  // Theme State
  const [theme, setTheme] = useState('dark');

  // Load Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Failure Modal State
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [selectedTaskForFailure, setSelectedTaskForFailure] = useState(null);

  // Helper to compare dates
  const isSameDay = (date1, date2Str) => {
    if (!date1) return false;
    const d1 = date1.toDate ? date1.toDate() : new Date(date1);
    const d2 = new Date(date2Str);
    // Reset times to compare just dates
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() === d2.getTime();
  };

  // Auth Listener
  useEffect(() => {
    // Safety timeout in case Firebase hangs
    const safetyTimeout = setTimeout(() => {
      setLoadingUser(false);
    }, 4000);

    // Force Unregister any Service Workers (Fix for caching issues)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister();
          console.log("Unregistered old Service Worker");
        }
      });
    }

    if (!auth) {
      setLoadingUser(false);
      clearTimeout(safetyTimeout);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
      clearTimeout(safetyTimeout);
    });
    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Task Data Hook
  const { tasks, loading: loadingTasks, addTask, completeTask, failTask, editTask } = useTasks(user);

  // Calculate Streak
  const streak = tasks.reduce((acc, task) => {
    if (acc.broken) return acc;

    // Check if active task is expired
    const isExpired = task.status === 'active' && new Date(task.deadline) < new Date();

    if (task.status === 'failed' || isExpired) return { count: acc.count, broken: true };
    if (task.status === 'completed') return { count: acc.count + 1, broken: false };
    return acc;
  }, { count: 0, broken: false }).count;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Login failed", e);
      alert("Login failed: " + e.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleFailClick = (task) => {
    setSelectedTaskForFailure(task);
    setIsFailureModalOpen(true);
  };

  const handleFailureConfirm = async (reason) => {
    if (!selectedTaskForFailure) return;
    try {
      await failTask(selectedTaskForFailure.id, reason);
      setIsFailureModalOpen(false);
      setSelectedTaskForFailure(null);
    } catch (error) {
      console.error("Failed to mark task as failed", error);
      alert("Could not update task. Please try again.");
    }
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="animate-pulse font-bold text-xl tracking-widest uppercase">Loading Tracker...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-[var(--background)]">
        <div className="animated-bg"></div> {/* Background */}

        <h1 className="text-6xl md:text-8xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--text-muted)] tracking-tighter" style={{ textShadow: '0 0 40px rgba(99, 102, 241, 0.3)' }}>
          Tracker
        </h1>
        <div className="glass-container p-10 text-center max-w-md w-full z-10 border border-[var(--card-border)]">
          <h2 className="text-2xl font-bold mb-3 text-[var(--foreground)]">Welcome Back</h2>
          <p className="mb-10 text-[var(--text-muted)] text-sm leading-relaxed">
            Master your day. Track your consistency. <br />Log your wins and learn from your losses.
          </p>
          <button onClick={handleLogin} className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg hover:scale-[1.02] active:scale-[0.98]">
            {/* Google Icon SVG */}
            <svg enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="fill-white"><path d="m23.745 12.27c0-.743-.067-1.467-.189-2.157h-11.556v4.095h6.632c-.297 1.474-1.157 2.704-2.42 3.567v2.923h3.917c2.28-2.103 3.593-5.211 3.593-8.421z" fill="#4285f4" /><path d="m12 24c3.24 0 5.957-1.074 7.942-2.906l-3.916-2.922c-1.075.728-2.454 1.157-4.026 1.157-3.125 0-5.771-2.112-6.723-4.943h-4.045v3.138c1.986 3.935 6.045 6.476 10.768 6.476z" fill="#34a853" /><path d="m5.277 14.286c-.244-.741-.383-1.53-.383-2.333s.139-1.592.383-2.333v-3.138h-4.045c-.818 1.631-1.282 3.447-1.282 5.394s.464 3.763 1.282 5.394z" fill="#fbbc05" /><path d="m12 4.773c1.762 0 3.352.607 4.606 1.795l3.434-3.468c-2.083-1.944-4.801-3.1-7.962-3.1-4.723 0-8.782 2.541-10.768 6.476l4.045 3.138c.952-2.831 3.6-4.943 6.723-4.943z" fill="#ea4335" /></svg>
            <span className="font-bold">Continue with Google</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto relative z-10 transition-colors duration-300">
      <div className="animated-bg"></div> {/* Background */}

      <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[var(--foreground)] to-[var(--text-muted)]">
            Tracker
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-border)] transition-all shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              // Moon Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            ) : (
              // Sun Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41-1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
            )}
          </button>

          {/* Streak Display */}
          <div className="flex items-center gap-3 bg-[var(--card-bg)] backdrop-blur-md px-5 py-3 rounded-full border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)] group hover:border-orange-500/50 transition-colors cursor-default">
            <span className="text-2xl animate-pulse drop-shadow-[0_0_10px_rgba(255,100,0,0.8)]">🔥</span>
            <div className="flex flex-col leading-none">
              <span className="font-black text-xl text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.4)]">{streak}</span>
              <span className="text-[10px] uppercase font-bold text-orange-500/60 tracking-widest group-hover:text-orange-500/80 transition-colors">Streak</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-0 md:gap-4 w-auto h-auto bg-transparent md:bg-[var(--card-bg)] p-0 md:p-2 md:pr-4 rounded-full border-0 md:border border-[var(--card-border)] backdrop-blur-none md:backdrop-blur-sm shadow-none md:shadow-sm transition-all duration-300">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-[var(--card-border)] shadow-sm shrink-0 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--card-bg)] shrink-0"></div>
            )}
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-[var(--foreground)]">{user.displayName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 transition-colors uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>

      </header>

      {/* Dashboard */}
      <div className="space-y-8">
        <ErrorBoundary>
          <TaskInput onAdd={addTask} />
        </ErrorBoundary>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4 text-[var(--foreground)] flex items-center gap-2">
            Active Missions
            <span className="text-sm bg-[var(--card-bg)] px-2 py-1 rounded-full text-[var(--text-muted)]">
              {tasks.filter(t => t.status === 'active').length}
            </span>
          </h3>

          {loadingTasks ? (
            <div className="text-center py-10 text-[var(--text-muted)]">Loading missions...</div>
          ) : tasks.filter(t => t.status === 'active').length === 0 ? (
            <div className="glass-container p-8 text-center border-dashed border-2 border-[var(--card-border)] bg-transparent opacity-50">
              <p>No active missions. Start one above.</p>
            </div>
          ) : (
            tasks.filter(t => t.status === 'active').map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={completeTask}
                onFail={handleFailClick}
                onEdit={editTask}
              />
            ))
          )}
        </div>

        <div className="mt-12 space-y-4 opacity-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[var(--text-muted)]">Mission Log</h3>

            {/* Date Picker Trigger */}
            <div className="relative group cursor-pointer" onClick={() => logDateRef.current?.showPicker()}>
              <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                <span className="text-sm font-medium text-gray-300">
                  {new Date(logDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
              </div>

              {/* Hidden Input */}
              <input
                ref={logDateRef}
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
              />
            </div>
          </div>

          {tasks.filter(t => t.status !== 'active' && isSameDay(t.completedAt, logDate)).length === 0 ? (
            <div className="text-center py-8 border border-white/5 rounded-2xl bg-white/5">
              <p className="text-[var(--text-muted)] text-sm">No missions logged for this date.</p>
            </div>
          ) : (
            tasks.filter(t => t.status !== 'active' && isSameDay(t.completedAt, logDate)).map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={completeTask}
                onFail={handleFailClick}
                onEdit={editTask}
              />
            ))
          )}
        </div>
      </div>


      <FailureModal
        isOpen={isFailureModalOpen}
        onClose={() => setIsFailureModalOpen(false)}
        onConfirm={handleFailureConfirm}
      />
    </main >
  );
}
