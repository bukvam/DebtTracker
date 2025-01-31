import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchDebts } from '../supabase';
import { useCurrency } from '../context/CurrencyContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../types/themes';

const HomeScreen = ({ navigation }: { navigation: any }) => {
    const { user } = useAuth();
    const { currencySymbol } = useCurrency();
    const { theme } = useTheme();
    const [totalOwed, setTotalOwed] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            const loadDebts = async () => {
                try {
                    const debts = await fetchDebts(user?.id || '');
                    const total = debts.reduce((sum, debt) => sum + (debt.paid ? 0 : debt.amount), 0);
                    setTotalOwed(total);
                } catch (error) {
                    console.error(error);
                }
            };

            if (user?.id) {
                loadDebts();
            }
        }, [user])
    );

    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <View style={styles.headerContainer}>
                <Text style={[styles.amountText, { color: currentTheme.text }]}>You’re still waiting to receive:</Text>
                <Text style={[styles.totalOwed, totalOwed === 0 && styles.green]}>
                    {totalOwed === 0 ? `0 ${currencySymbol}` : `${Math.round(totalOwed)} ${currencySymbol}`}
                </Text>
            </View>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.primary }]} onPress={() => navigation.navigate('New')}>
                    <Text style={styles.buttonText}>Add Debt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.primary }]} onPress={() => navigation.navigate('Debts')}>
                    <Text style={styles.buttonText}>Mark as Paid</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    amountText: {
        fontSize: 25,
        fontWeight: 600,
        marginBottom: 8,
        fontFamily: 'HelveticaNeue',
    },
    totalOwed: {
        fontSize: 50,
        fontWeight: 'bold',
        fontFamily: 'HelveticaNeue',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        color: '#f00',
    },
    green: {
        color: '#4CAF50',
    },
    buttonsContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    button: {
        paddingVertical: 15,
        marginBottom: 20,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 4 },
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default HomeScreen;
