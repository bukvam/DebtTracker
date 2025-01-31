import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { useAuth } from "./AuthContext";

type CurrencyContextType = {
    currencySymbol: string;
    setCurrencySymbol: (symbol: string) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [currencySymbol, setCurrencySymbol] = useState<string>('€');

    useEffect(() => {
        const loadCurrency = async () => {
            if (user?.id) {
                try {
                    const { data, error } = await supabase.auth.getUser();
                    if (error) {
                        console.error('Error fetching user:', error);
                        return;
                    }

                    const userCurrencySymbol = data?.user?.user_metadata?.currency_symbol || '€';
                    setCurrencySymbol(userCurrencySymbol);
                } catch (error) {
                    console.error('Error loading user metadata:', error);
                }
            }
        };

        loadCurrency();
    }, [user]);

    return (
        <CurrencyContext.Provider value={{ currencySymbol, setCurrencySymbol }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
