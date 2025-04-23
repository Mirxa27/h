import React, { createContext, useState, useEffect } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "./queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: {
    username: string;
    password: string;
    email: string;
    fullName: string;
  }) => Promise<User>;
  updateUser: (userData: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {
    throw new Error("login function not implemented");
  },
  logout: async () => {
    throw new Error("logout function not implemented");
  },
  register: async () => {
    throw new Error("register function not implemented");
  },
  updateUser: async () => {
    throw new Error("updateUser function not implemented");
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated when app loads
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        setError("Error checking authentication status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
    } catch (err) {
      setError("Logout failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    email: string;
    fullName: string;
  }): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const newUser = await response.json();
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError("Registration failed. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<User> => {
    setIsLoading(true);
    setError(null);

    if (!user) {
      setError("Not authenticated");
      setIsLoading(false);
      throw new Error("Not authenticated");
    }

    try {
      const response = await apiRequest(
        "PUT",
        `/api/users/${user.id}`,
        userData
      );

      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError("Failed to update user profile.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
