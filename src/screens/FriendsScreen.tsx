import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchPeople, addPerson } from '../supabase';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../context/CurrencyContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../types/themes';

const FriendsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const { currencySymbol } = useCurrency();
    const { theme } = useTheme();
    const [people, setPeople] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [personName, setPersonName] = useState('');
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const loadPeople = async () => {
                try {
                    const data = await fetchPeople(user?.id || '');
                    setPeople(data);
                } catch (error) {
                    console.error(error);
                }
            };

            if (user?.id) {
                loadPeople();
            }
        }, [user?.id])
    );

    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

    const openPersonDetail = (personId: string) => {
        // @ts-ignore
        navigation.navigate('PersonDetail', { personId });
    };

    const handleAddPerson = async () => {
        if (!personName.trim()) {
            Alert.alert('Error', 'Please enter a valid name.');
            return;
        }
        try {
            setLoading(true);
            await addPerson(user?.id || '', personName);
            setPersonName('');
            setModalVisible(false);
            const updatedPeople = await fetchPeople(user?.id || '');
            setPeople(updatedPeople);
        } catch (error) {
            Alert.alert('Error', 'Failed to add person. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <Text style={[styles.title, { color: currentTheme.text }]}>Friends</Text>

            <FlatList
                data={people}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => openPersonDetail(item.id)}
                        style={[styles.friendItem, { borderBottomColor: currentTheme.border }]}
                    >
                        <Ionicons name="person-circle" size={40} color={currentTheme.text} />
                        <View style={styles.friendInfo}>
                            <Text style={[styles.friendName, { color: currentTheme.text }]}>{item.name}</Text>
                            <Text style={[styles.friendOwed, { color: currentTheme.subText }]}>
                                Total Owed: {item.total_owed.toFixed(2)} {currencySymbol}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                style={[styles.button, { backgroundColor: currentTheme.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.buttonText}>+ Add a friend</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.modal }]}>
                        <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Add New Person</Text>

                        <TextInput
                            style={[styles.input, { backgroundColor: currentTheme.inputBackground, color: currentTheme.text }]}
                            placeholder="Enter person's name"
                            placeholderTextColor={currentTheme.subText}
                            value={personName}
                            onChangeText={setPersonName}
                        />

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: currentTheme.primary }]}
                            onPress={handleAddPerson}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Add Friend</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: currentTheme.cancelButton }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    friendInfo: {
        marginLeft: 15,
    },
    friendName: {
        fontSize: 18,
        fontWeight: '500',
    },
    friendOwed: {
        fontSize: 14,
        marginTop: 5,
    },
    button: {
        marginTop: 20,
        paddingVertical: 15,
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        padding: 25,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
    },
    input: {
        width: '90%',
        padding: 14,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButton: {
        width: '90%',
        paddingVertical: 14,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
});

export default FriendsScreen;
