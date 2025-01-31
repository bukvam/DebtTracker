import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import currenciesData from '../../assets/currencies.json';
import { useTheme } from '../context/ThemeContext';

type CurrencyItem = {
    label: string;
    value: string;
};

const formatCurrencyData = (currencies: any): CurrencyItem[] => {
    return Object.keys(currencies).map(key => ({
        label: `${currencies[key].name} (${currencies[key].symbol})`,
        value: currencies[key].symbol,
    }));
};

const SettingsScreen = () => {
    const { user } = useAuth();
    const { currencySymbol, setCurrencySymbol } = useCurrency();
    const { theme, toggleTheme } = useTheme();
    const { signOut } = useAuth();
    const [selectedCurrency, setSelectedCurrency] = useState(currencySymbol);
    const [open, setOpen] = useState(false);

    const currencyItems = formatCurrencyData(currenciesData);

    useEffect(() => {
        const loadCurrency = async () => {
            if (user?.id) {
                try {
                    const { data, error } = await supabase.auth.getUser();

                    if (error) {
                        console.error('Error fetching user:', error);
                        return;
                    }

                    if (data?.user?.user_metadata?.currency_symbol) {
                        setSelectedCurrency(data.user.user_metadata.currency_symbol);
                        setCurrencySymbol(data.user.user_metadata.currency_symbol);
                    }
                } catch (error) {
                    console.error('Error loading user metadata:', error);
                }
            }
        };

        loadCurrency();
    }, [user, setCurrencySymbol]);

    const handleChangeCurrency = async () => {
        if (user?.id && selectedCurrency) {
            try {
                const { error } = await supabase.auth.updateUser({
                    data: { currency_symbol: selectedCurrency },
                });

                if (error) {
                    console.error('Error updating currency:', error);
                    return;
                }

                setCurrencySymbol(selectedCurrency);
            } catch (error) {
                console.error('Error saving currency:', error);
            }
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#333' }]}>Settings</Text>
            <View style={[styles.switchContainer, { justifyContent: 'space-between' }]}>
                <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#333' }]}>Dark Mode</Text>
                <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
            </View>
            <View style={styles.currencyContainer}>
                <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#333' }]}>Currency:</Text>
                <DropDownPicker
                    open={open}
                    value={selectedCurrency}
                    items={currencyItems}
                    setOpen={setOpen}
                    setValue={setSelectedCurrency}
                    setItems={() => {}}
                    containerStyle={styles.dropdownContainer}
                    style={[styles.dropdown, { backgroundColor: theme === 'dark' ? '#555' : '#f1f1f1' }]}
                    labelStyle={[styles.dropdownLabel, { color: theme === 'dark' ? '#fff' : '#333' }]}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleChangeCurrency}>
                <Text style={styles.buttonText}>Save Currency</Text>
            </TouchableOpacity>
            <Text style={[styles.selectedCurrencyText, { color: theme === 'dark' ? '#fff' : '#333' }]}>
                Current Selected Currency: {currencySymbol}
            </Text>
            <TouchableOpacity onPress={handleSignOut} style={[styles.button, styles.signOutButton]}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 20,
    },
    currencyContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    dropdownContainer: {
        width: '100%',
        height: 50,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    dropdownLabel: {
        fontSize: 18,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    selectedCurrencyText: {
        marginTop: 20,
        fontSize: 16,
    },
    switchContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 5,
    },
    signOutButton: {
        backgroundColor: '#FF3B30',
        marginTop: 20,
    },
});

export default SettingsScreen;
