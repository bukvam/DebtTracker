import { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }: { navigation: any }) => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await signIn(email, password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login to DebtTracker</Text>

            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
            />

            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
            />

            <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />

            <Text style={styles.signUpText} onPress={() => navigation.navigate('SignUp')}>
                Don't have an account? Sign up
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        marginBottom: 40,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        paddingHorizontal: 15,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#333',
    },
    signUpText: {
        marginTop: 20,
        color: '#007bff',
        fontSize: 16,
    },
});

export default LoginScreen;
