import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/ui/AuthContext';
import { AppRoutes } from './routes';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pks_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pks_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pks_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Sonner Toast Notification */}
        <Toaster
          theme={isDarkMode ? 'dark' : 'light'}
          position="top-right"
          richColors
          closeButton
        />

        {/* Integrated Application Routes & Layout */}
        <AppRoutes isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
