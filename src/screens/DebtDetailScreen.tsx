import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { fetchDebtById } from '../supabase';
import { fetchPersonDetail } from '../supabase';
import { useCurrency } from '../context/CurrencyContext';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';

type DebtDetailScreenRouteProp = RouteProp<RootStackParamList, 'DebtDetail'>;

const DebtDetailScreen = ({ route }: { route: DebtDetailScreenRouteProp }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { debtId } = route.params;
    const { currencySymbol } = useCurrency();

    const [debtDetails, setDebtDetails] = useState<any>(null);
    const [personName, setPersonName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (debtId) {
            loadDebtDetails(debtId);
        }
    }, [debtId]);

    const loadDebtDetails = async (debtId: string) => {
        try {
            const debtData = await fetchDebtById(debtId);
            setDebtDetails(debtData);

            if (debtData.person_id) {
                const personName = await fetchPersonDetail(debtData.person_id);
                setPersonName(personName);
            }
        } catch (error) {
            console.error('Error fetching debt details:', error);
        } finally {
            setLoading(false);
        }
    };

    const shareDebt = async () => {
        if (debtDetails && personName) {
            const message = `Hey, you still owe me ${debtDetails.amount} ${currencySymbol} from ${formatDate(debtDetails.created_at)} for ${debtDetails.description}. Could you pay me back? Thanks!`;

            try {
                await Share.share({
                    message,
                });
            } catch (error) {
                console.error('Error sharing the debt:', error);
            }
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-GB');
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff' }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={30} color={theme === 'dark' ? '#fff' : '#000'} />
                <Text style={[styles.backText, { color: theme === 'dark' ? '#fff' : '#000' }]}>Back</Text>
            </TouchableOpacity>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#000' }]}>Debt Details</Text>
                <View style={styles.debtDetailContainer}>
                    <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#333' }]}>Amount:</Text>
                    <Text style={[styles.value, { color: theme === 'dark' ? '#fff' : '#007AFF' }]}>
                        {debtDetails.amount} {currencySymbol}
                    </Text>
                </View>
                <View style={styles.debtDetailContainer}>
                    <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#333' }]}>Person:</Text>
                    <Text style={[styles.value, { color: theme === 'dark' ? '#fff' : '#007AFF' }]}>{personName}</Text>
                </View>
                <View style={styles.debtDetailContainer}>
                    <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#333' }]}>Created At:</Text>
                    <Text style={[styles.value, { color: theme === 'dark' ? '#fff' : '#007AFF' }]}>
                        {formatDate(debtDetails.created_at)}
                    </Text>
                </View>
                <TouchableOpacity onPress={shareDebt} style={styles.shareButton}>
                    <Ionicons name="share-outline" size={30} color={theme === 'dark' ? '#fff' : '#007AFF'} />
                    <Text style={[styles.shareText, { color: theme === 'dark' ? '#fff' : '#007AFF' }]}>Share Debt</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    backText: {
        fontSize: 18,
        marginLeft: 10,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 30,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    debtDetailContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 21,
        fontWeight: '500',
    },
    value: {
        fontSize: 23,
        fontWeight: '400',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        alignSelf: 'center',
    },
    shareText: {
        fontSize: 25,
        marginLeft: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DebtDetailScreen;
