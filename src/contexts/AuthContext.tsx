import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface Session {
  token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    const storedUser = localStorage.getItem("user");

    if (storedSession && storedUser) {
      setSession(JSON.parse(storedSession));
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch(`/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (data.error) return { error: data.error };

      // The Flask backend sends a verification email, user isn’t logged in yet
      return {};
    } catch (err) {
      return { error: "Failed to sign up" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.error) return { error: data.error };

      const userObj: User = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
      };
      const sessionObj: Session = { token: data.token };

      setUser(userObj);
      setSession(sessionObj);

      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("session", JSON.stringify(sessionObj));

      return {};
    } catch (err) {
      return { error: "Failed to sign in" };
    }
  };

  const signOut = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem("user");
    localStorage.removeItem("session");
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
