import React, { createContext, useState, useContext, ReactNode } from 'react';
import { View, Text } from 'react-native';

export const ThemeContext = createContext({
    theme: 'light', // default theme
    toggleTheme: () => {},
});

export const useTheme = () => {
    return useContext(ThemeContext);
};

type ThemeProviderProps = {
    children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
