'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export function useTasks(user) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
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

    const addTask = async (title, deadline) => {
        console.log("Adding task...", { title, deadline });
        if (!user) {
            console.error("Add failed: User not authenticated");
            throw new Error("User not authenticated");
        }

        if (!title.trim()) throw new Error("Title is required");
        if (!deadline) throw new Error("Deadline is required");

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
            throw e;
        }
    };

    const completeTask = async (taskId) => {
        if (!user) return;
        await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
            status: 'completed',
            completedAt: serverTimestamp(),
        });
    };

    const failTask = async (taskId, reason) => {
        if (!user) return;
        await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
            status: 'failed',
            failureReason: reason,
            completedAt: serverTimestamp(),
        });
    };

    return { tasks, loading, error, addTask, completeTask, failTask };
}
