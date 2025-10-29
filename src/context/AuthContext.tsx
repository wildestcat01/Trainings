import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  user: { email: string } | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CREDENTIALS_KEY = 'training-admin-credentials';
const SESSION_KEY = 'training-admin-session';

interface StoredCredential {
  email: string;
  password: string;
  createdAt: string;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_KEY);
    if (storedSession) {
      const sessionEmail = JSON.parse(storedSession) as string;
      setUser({ email: sessionEmail });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (!stored) {
      throw new Error('No admin account found. Please sign up first.');
    }

    const credentials = JSON.parse(stored) as StoredCredential[];
    const match = credentials.find((cred) => cred.email.toLowerCase() === email.toLowerCase());

    if (!match || match.password !== password) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(match.email));
    setUser({ email: match.email });
  };

  const signUp = async (email: string, password: string) => {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    const credentials: StoredCredential[] = stored ? JSON.parse(stored) : [];

    if (credentials.some((cred) => cred.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const updated = [
      ...credentials,
      {
        email,
        password,
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
    localStorage.setItem(SESSION_KEY, JSON.stringify(email));
    setUser({ email });
  };

  const signOut = async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
