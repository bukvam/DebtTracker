import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchDebts, markDebtAsPaid, markDebtAsUnpaid, fetchPersonDetail, deleteDebt } from '../supabase';
import { useCurrency } from '../context/CurrencyContext';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const DebtsScreen = ({ navigation }: { navigation: any }) => {
    const { user } = useAuth();
    const { currencySymbol } = useCurrency();
    const { theme } = useTheme();
    const [debts, setDebts] = useState<any[]>([]);

    useEffect(() => {
        const loadDebts = async () => {
            if (user?.id) {
                try {
                    const data = await fetchDebts(user.id);
                    const updatedDebts = await Promise.all(
                        data.map(async (debt) => {
                            const personName = await fetchPersonDetail(debt.person_id);
                            return { ...debt, personName };
                        })
                    );
                    setDebts(updatedDebts);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        const unsubscribe = navigation.addListener('focus', loadDebts);
        return unsubscribe;
    }, [user, navigation]);

    const togglePaidStatus = async (debtId: string, currentStatus: boolean) => {
        try {
            if (currentStatus) {
                await markDebtAsUnpaid(debtId);
            } else {
                await markDebtAsPaid(debtId);
            }
            setDebts((prevDebts) =>
                prevDebts.map((debt) =>
                    debt.id === debtId ? { ...debt, paid: !currentStatus } : debt
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleDebtPress = (debtId: string) => {
        navigation.navigate('DebtDetail', { debtId });
    };

    const handleDeleteDebt = async (debtId: string) => {
        try {
            await deleteDebt(debtId);
            setDebts((prevDebts) => prevDebts.filter((debt) => debt.id !== debtId));
        } catch (error) {
            console.error('Error deleting debt:', error);
        }
    };

    const renderDebtItem = ({ item }: { item: any }) => {
        const renderRightActions = () => (
            <TouchableOpacity
                onPress={() => handleDeleteDebt(item.id)}
                style={styles.deleteButton}
            >
                <MaterialCommunityIcons name="delete" size={24} color="white" />
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        );

        return (
            <Swipeable renderRightActions={renderRightActions}>
                <TouchableOpacity
                    onPress={() => handleDebtPress(item.id)}
                >
                    <View style={[styles.debtItem, item.paid && styles.paid]}>
                        <View style={styles.debtInfo}>
                            <Ionicons name="person-circle" size={40} color="#000" style={styles.personIcon} />
                            <View style={styles.personText}>
                                <Text style={[styles.personName, { color: theme === 'dark' ? '#333' : '#333' }]}>{item.personName}</Text>
                                <Text style={[styles.amountText, { color: theme === 'dark' ? '#333' : '#333' }]}>
                                    {item.amount} {currencySymbol}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.togglePaidButton, item.paid ? styles.unpaidButton : styles.paidButton]}
                            onPress={() => togglePaidStatus(item.id, item.paid)}
                        >
                            <Text style={styles.buttonText}>
                                {item.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <FlatList
                data={debts}
                renderItem={renderDebtItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
            />
            <TouchableOpacity style={styles.createDebtButton} onPress={() => navigation.navigate('New')}>
                <Text style={styles.buttonText}>Create Debt</Text>
            </TouchableOpacity>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    list: {
        marginBottom: 20,
    },
    debtItem: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        flexDirection: 'row',
        alignItems: 'center',
    },
    paid: {
        backgroundColor: '#e0f7e0',
    },
    debtInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    personIcon: {
        marginRight: 10,
    },
    personText: {
        flex: 1,
    },
    personName: {
        fontSize: 18,
        fontWeight: '600',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '500',
    },
    togglePaidButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    paidButton: {
        backgroundColor: '#4CAF50',
    },
    unpaidButton: {
        backgroundColor: '#FF3B30',
    },
    createDebtButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginLeft: 10,
        borderRadius: 8,
        height: 70,
        minWidth: 100,
        transform: [{ translateY: 1 }]
    },
    deleteButtonText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: '600',
    },
});

export default DebtsScreen;
