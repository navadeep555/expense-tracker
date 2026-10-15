import { createContext, useCallback, useContext, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = 'spendwise_auth';

function loadAuth() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadAuth);

    const login = useCallback((username) => {
        const u = { username };
        localStorage.setItem(AUTH_KEY, JSON.stringify(u));
        setUser(u);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
