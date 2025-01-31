import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../types/themes';
import { fetchPersonDetails, fetchPersonDebts } from '../supabase';
import { RootStackParamList } from '../types/navigation';

type PersonDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PersonDetail'>;

const PersonDetailScreen = () => {
    const { currencySymbol } = useCurrency();
    const { theme } = useTheme();
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

    const navigation = useNavigation<PersonDetailScreenNavigationProp>();
    const route = useRoute();
    const { personId } = route.params as { personId: string };

    const [personDetails, setPersonDetails] = useState<any>(null);
    const [debts, setDebts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPersonData = async () => {
            try {
                const person = await fetchPersonDetails(personId);
                setPersonDetails(person);

                const personDebts = await fetchPersonDebts(personId);
                setDebts(personDebts);
            } catch (error) {
                console.error('Error loading person data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPersonData();
    }, [personId]);

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: currentTheme.background }]}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
        );
    }

    const graphData = debts.map(debt => ({
        date: new Date(debt.created_at),
        amount: debt.amount,
    }));

    const sortedGraphData = graphData.sort((a, b) => a.date.getTime() - b.date.getTime());

    const chartData = {
        labels: sortedGraphData.map(item => new Date(item.date).toLocaleDateString()),
        datasets: [
            {
                data: sortedGraphData.map(item => item.amount),
                strokeWidth: 3,
                color: () => (theme === 'dark' ? '#64D2FF' : '#0A84FF'), // Neon cyan in dark mode, blue in light mode
            },
        ],
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={[styles.backText, { color: currentTheme.text }]}>←</Text>
                <Text style={[styles.backLabel, { color: currentTheme.text }]}>Back</Text>
            </TouchableOpacity>

            <View style={styles.profile}>
                <View style={styles.circle}>
                    <Ionicons name="person-circle" size={80} color={currentTheme.text} />
                </View>
                <Text style={[styles.name, { color: currentTheme.text }]}>{personDetails?.name}</Text>
            </View>

            <Text style={[styles.title, { color: currentTheme.text }]}>Debts</Text>
            <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 40}
                height={220}
                yAxisLabel={`${currencySymbol}`}
                chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: currentTheme.background,
                    backgroundGradientTo: currentTheme.background,
                    decimalPlaces: 2,
                    color: () => (theme === 'dark' ? '#64D2FF' : '#0A84FF'), // Vibrant line color
                    labelColor: () => (theme === 'dark' ? '#FFFFFF' : '#333333'), // High contrast labels
                    propsForDots: {
                        r: '4',
                        strokeWidth: '2',
                        stroke: theme === 'dark' ? '#64D2FF' : '#0A84FF',
                    },
                    propsForBackgroundLines: {
                        stroke: theme === 'dark' ? '#444444' : '#E0E0E0',
                    },
                    style: { borderRadius: 16 },
                }}
                bezier
                style={styles.graph}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                yAxisInterval={1}
                xLabelsOffset={-5}
            />

            <FlatList
                data={debts}
                keyExtractor={(item) => item.created_at}
                renderItem={({ item }) => (
                    <View style={[styles.debtItem, { borderBottomColor: currentTheme.border }]}>
                        <Text style={[styles.debtAmount, { color: currentTheme.text }]}>
                            {item.amount.toFixed(2)} {currencySymbol}
                        </Text>
                        <Text style={[styles.debtDescription, { color: currentTheme.subText }]}>{item.description}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backText: {
        fontSize: 30,
    },
    backLabel: {
        fontSize: 18,
        marginLeft: 10,
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    circle: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    title: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: '600',
    },
    debtItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    debtAmount: {
        fontSize: 18,
        fontWeight: '500',
    },
    debtDescription: {
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    graph: {
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
});

export default PersonDetailScreen;
