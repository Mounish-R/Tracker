'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import TaskInput from '@/components/TaskInput';
import TaskItem from '@/components/TaskItem';
import FailureModal from '@/components/FailureModal';
import Heatmap from '@/components/Heatmap';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useTasks } from '@/hooks/useTasks';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Failure Modal State
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [selectedTaskForFailure, setSelectedTaskForFailure] = useState(null);

  // Auth Listener
  useEffect(() => {
    if (!auth) {
      setLoadingUser(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  if (!auth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-[#09090b] text-white">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Setup Required</h1>
        <p className="max-w-md text-gray-400 mb-8">
          Firebase configuration is missing or invalid.
        </p>

        <div className="bg-black/40 p-6 rounded-xl border border-white/10 text-left font-mono text-sm min-w-[300px]">
          <h3 className="text-gray-200 font-semibold mb-4 border-b border-white/10 pb-2">Debug Checklist:</h3>

          <div className="space-y-2">
            <DebugItem label="API Key" value={process.env.NEXT_PUBLIC_FIREBASE_API_KEY} expected="Starts with AIza" />
            <DebugItem label="Auth Domain" value={process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN} />
            <DebugItem label="Project ID" value={process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID} />
            <DebugItem label="Storage Bucket" value={process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET} />
            <DebugItem label="Sender ID" value={process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID} />
            <DebugItem label="App ID" value={process.env.NEXT_PUBLIC_FIREBASE_APP_ID} />
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500">
            <p>Status: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Variables Detected' : 'No Variables Found'}</p>
          </div>
        </div>
      </div>
    );
  }

  function DebugItem({ label, value, expected }) {
    const isSet = !!value;
    const isValid = expected ? value?.trim().startsWith('AIza') : true;

    return (
      <div className="flex justify-between items-center gap-4">
        <span className="text-gray-400">{label}:</span>
        <span className={isSet && isValid ? "text-green-400" : "text-red-400"}>
          {isSet ? (isValid ? "OK" : "Invalid") : "MISSING"}
        </span>
      </div>
    );
  }

  // Task Data Hook
  const { tasks, loading: loadingTasks, addTask, completeTask, failTask } = useTasks(user);

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
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="animate-pulse text-[var(--primary)] font-bold text-xl">Loading Tracker...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[var(--background)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--primary)] opacity-20 blur-[100px]"></div>
        </div>

        <h1 className="text-5xl font-bold mb-8 text-center" style={{ textShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}>
          Tracker
        </h1>
        <div className="glass-container p-8 text-center max-w-sm w-full z-10">
          <h2 className="text-xl font-semibold mb-2">Welcome Back</h2>
          <p className="mb-8 text-[var(--text-muted)] text-sm">Sign in to start tracking your success and learning from failure.</p>
          <button onClick={handleLogin} className="btn-primary w-full flex items-center justify-center gap-2">
            <span>Continue with Google</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-bold tracking-tight">Tracker</h1>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
          </div>
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-[var(--card-border)]"
            />
          )}
          <button onClick={handleLogout} className="text-sm text-[var(--text-muted)] hover:text-[var(--error)] transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      {/* Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                />
              ))
            )}
          </div>

          <div className="mt-12 space-y-4 opacity-80">
            <h3 className="text-xl font-semibold mb-4 text-[var(--text-muted)]">Mission Log</h3>
            {tasks.filter(t => t.status !== 'active').slice(0, 5).map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={completeTask}
                onFail={handleFailClick}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <ErrorBoundary>
            <Heatmap tasks={tasks} />
          </ErrorBoundary>
        </div>
      </div>

      <FailureModal
        isOpen={isFailureModalOpen}
        onClose={() => setIsFailureModalOpen(false)}
        onConfirm={handleFailureConfirm}
      />
    </main>
  );
}
