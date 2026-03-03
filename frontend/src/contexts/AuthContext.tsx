import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUserToken, signOut as cognitoSignOut } from '../services/cognito';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    isLoading: boolean;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    token: null,
    isLoading: true,
    logout: () => { },
    checkAuth: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const jwtToken = await getCurrentUserToken();
            if (jwtToken) {
                setToken(jwtToken);
                setIsAuthenticated(true);
            } else {
                setToken(null);
                setIsAuthenticated(false);
            }
        } catch (err) {
            setToken(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = () => {
        cognitoSignOut();
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, isLoading, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
