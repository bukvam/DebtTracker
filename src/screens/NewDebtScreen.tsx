import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { fetchPeople, addDebt } from '../supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from '../context/ThemeContext';

const CreateDebtScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { currencySymbol } = useCurrency();
    const { theme } = useTheme();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [people, setPeople] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            if (user?.id) {
                loadPeople(user.id);
            }
        }, [user?.id])
    );

    const loadPeople = async (userId: string) => {
        try {
            const data = await fetchPeople(userId);
            setPeople(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectPerson = (person: any) => {
        setSelectedPerson(person);
        setModalVisible(false);
    };

    const handleCreateDebt = async () => {
        if (!selectedPerson?.id || !amount) return;

        try {
            await addDebt(
                user!.id,
                selectedPerson.id,
                parseFloat(amount),
                description
            );
            setAmount('');
            setDescription('');
            setSelectedPerson(null);
            setSearchQuery('');
        } catch (error) {
            console.error('Error adding debt:', error);
        }
        // @ts-ignore
        navigation.navigate('Debts');
    };

    const filteredPeople = people.filter(person =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const colors = theme === 'dark'
        ? {
            backgroundColor: '#1c1c1e',
            textColor: '#ffffff',
            textColorInverted: '#000000',
            inputBackgroundColor: '#555555',
            iconColor: '#ffffff',
            iconColorInverted: '#000000',
            modalBackgroundColor: '#222222',
            buttonBackgroundColor: '#007AFF',
            disabledButtonColor: '#555555',
        }
        : {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            inputBackgroundColor: '#f0f0f0',
            iconColor: '#000000',
            modalBackgroundColor: '#ffffff',
            buttonBackgroundColor: '#007AFF',
            disabledButtonColor: '#cccccc',
        };

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <Text style={[styles.title, { color: colors.textColor }]}>Create Debt</Text>

            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textColor }]}>Amount</Text>
                <View style={[styles.inputBackground, { backgroundColor: colors.inputBackgroundColor }]}>
                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        style={[styles.amountInput, { color: colors.textColor }]}
                    />
                    <Text style={[styles.currency, { color: colors.textColor }]}>{currencySymbol}</Text>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.textColor }]}>Description</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    style={[styles.inputBackground, { backgroundColor: colors.inputBackgroundColor, color: colors.textColor }]}
                />
            </View>

            {selectedPerson ? (
                <View style={styles.selectedPersonContainer}>
                    <Ionicons name="person-circle" size={40} color={colors.iconColorInverted} />
                    <Text style={[styles.personNameSelected, { color: colors.textColorInverted }]}>{selectedPerson.name}</Text>
                    <TouchableOpacity onPress={() => setSelectedPerson(null)}>
                        <Ionicons name="close-outline" size={30} color={colors.iconColorInverted} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.selectButtonText}>Select Person</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[styles.createButton, !selectedPerson || !amount ? { backgroundColor: colors.disabledButtonColor } : { backgroundColor: colors.buttonBackgroundColor }]}
                onPress={handleCreateDebt}
                disabled={!selectedPerson || !amount}
            >
                <Text style={styles.createButtonText}>Create Debt</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide">
                <View style={[styles.modalContainer, { backgroundColor: colors.modalBackgroundColor }]}>
                    <Text style={[styles.modalTitle, { color: colors.textColor }]}>Select a Person</Text>

                    <TextInput
                        style={[styles.searchInput, { backgroundColor: colors.inputBackgroundColor, color: colors.textColor }]}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                    <FlatList
                        data={filteredPeople}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelectPerson(item)} style={styles.personItem}>
                                <Ionicons name="person-circle" size={40} color={colors.iconColor} />
                                <View style={styles.personDetails}>
                                    <Text style={[styles.personName, { color: colors.textColor }]}>{item.name}</Text>
                                    <Text style={[styles.totalOwed, { color: colors.textColor }]}>
                                        Total Owed: {item.total_owed.toFixed(2)} {currencySymbol}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Ionicons name="close-outline" size={40} color={colors.iconColor} />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    inputBackground: {
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountInput: {
        flex: 1,
        fontSize: 16,
    },
    currency: {
        fontSize: 16,
        fontWeight: '500',
        marginRight: 10,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    selectButton: {
        paddingVertical: 12,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    selectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    selectedPersonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    personName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
    },
    personNameSelected: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 10,
    },
    createButton: {
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    searchInput: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        width: '100%',
    },
    personItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    personDetails: {
        marginLeft: 15,
    },
    totalOwed: {
        fontSize: 14,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
    },
});

export default CreateDebtScreen;
