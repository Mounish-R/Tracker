'use client';
import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="glass-container p-4 border border-[var(--error)] text-[var(--error)] bg-[var(--error)]/5">
                    <h3 className="font-bold mb-2">Something went wrong.</h3>
                    <p className="text-xs font-mono">{this.state.error?.message || 'Unknown error'}</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-4 px-3 py-1 text-sm bg-[var(--error)] text-white rounded hover:opacity-90"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
