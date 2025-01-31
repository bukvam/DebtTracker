import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

const App = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <CurrencyProvider>
                    <AppNavigator/>
                </CurrencyProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;