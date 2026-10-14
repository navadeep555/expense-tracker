import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (!username.trim()) {
            setError('Please enter your username.');
            return;
        }
        if (!password.trim()) {
            setError('Please enter your password.');
            return;
        }
        // Simple static credential check — extend with real auth as needed
        if (password !== 'password') {
            setError('Invalid username or password.');
            return;
        }
        login(username.trim());
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
                        <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Spendwise</h1>
                        <p className="text-sm text-slate-500">Sign in to your account</p>
                    </div>
                </div>

                {/* Card */}
                <div className="card p-7">
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                className="input w-full"
                            />
                        </div>

                        {error && (
                            <p className="rounded-lg bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">
                                {error}
                            </p>
                        )}

                        <button type="submit" className="btn-primary w-full justify-center">
                            Sign in
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Default password: <span className="font-mono font-semibold">password</span>
                </p>
            </div>
        </div>
    );
}
