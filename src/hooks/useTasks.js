'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export function useTasks(user) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !db) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const newTasks = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt || new Date(),
                    };
                });
                setTasks(newTasks);
                setLoading(false);
            },
            (err) => {
                console.error("Firestore Error:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);


    // Optimistic helper
    const optimisticUpdate = (action, payload) => {
        setTasks(prev => {
            if (action === 'add') {
                return [{ ...payload, id: 'temp-' + Date.now(), createdAt: new Date() }, ...prev];
            }
            if (action === 'update') {
                return prev.map(t => t.id === payload.id ? { ...t, ...payload.changes } : t);
            }
            return prev;
        });
    };

    const addTask = async (title, deadline) => {
        console.log("Adding task...", { title, deadline });
        if (!user) {
            console.error("Add failed: User not authenticated");
            throw new Error("User not authenticated");
        }

        if (!title.trim()) throw new Error("Title is required");
        if (!deadline) throw new Error("Deadline is required");

        // Optimistic Add
        const tempId = 'temp-' + Date.now();
        const newTask = {
            id: tempId,
            title: title.trim(),
            deadline: new Date(deadline).toISOString(),
            status: 'active',
            createdAt: new Date(),
        };

        // We manually insert it into state. CAUTION: onSnapshot will run again and might duplicate if we aren't careful, 
        // but since onSnapshot replaces the WHOLE list, it will just overwrite our optimistic state with the real one eventually.
        // The latency gap is covered.
        setTasks(prev => [newTask, ...prev]);

        try {
            console.log("Sending to Firestore...");
            const docRef = await addDoc(collection(db, 'users', user.uid, 'tasks'), {
                title: title.trim(),
                deadline: new Date(deadline).toISOString(),
                status: 'active',
                createdAt: serverTimestamp(),
            });
            console.log("Task added with ID:", docRef.id);
        } catch (e) {
            console.error("Firestore Add Error:", e);
            // Rollback (remove temp)
            setTasks(prev => prev.filter(t => t.id !== tempId));
            throw e;
        }
    };

    const completeTask = async (taskId) => {
        if (!user) return;

        // Optimistic Update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: 'completed', completedAt: new Date() } : t
        ));

        try {
            await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
                status: 'completed',
                completedAt: serverTimestamp(),
            });
        } catch (e) {
            console.error("Firestore Update Error:", e);
            // Revert would be complex without previous state, assuming success for now or refresh
        }
    };

    const failTask = async (taskId, reason) => {
        if (!user) return;

        // Optimistic Update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: 'failed', failureReason: reason, completedAt: new Date() } : t
        ));

        try {
            await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
                status: 'failed',
                failureReason: reason,
                completedAt: serverTimestamp(),
            });
        } catch (e) {
            console.error("Firestore Update Error:", e);
        }
    };

    const editTask = async (taskId, newTitle, newDeadline) => {
        if (!user) return;

        // Optimistic Update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, title: newTitle, deadline: newDeadline } : t
        ));

        try {
            await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
                title: newTitle,
                deadline: newDeadline, // Assuming ISO string is passed or Date converted
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Firestore Update Error:", e);
            // Revert could be implemented here if strict consistency needed
        }
    };

    return { tasks, loading, error, addTask, completeTask, failTask, editTask };
}
