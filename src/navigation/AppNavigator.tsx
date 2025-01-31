import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import DebtsScreen from '../screens/DebtsScreen';
import CreateDebtScreen from '../screens/NewDebtScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import PersonDetailScreen from '../screens/PersonDetailScreen';
import { Ionicons } from '@expo/vector-icons';
import DebtDetailScreen from "../screens/DebtDetailScreen";
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../types/themes';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
);

const AppTabs = () => {
    const { theme } = useTheme();
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Debts') {
                        iconName = focused ? 'cash' : 'cash-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    } else if (route.name === 'New') {
                        iconName = focused ? 'add' : 'add-outline';
                    } else if (route.name === 'Friends') {
                        iconName = focused ? 'people' : 'people-outline';
                    }
                    // @ts-ignore
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    backgroundColor: currentTheme.background,
                    borderTopWidth: 0,
                },
                tabBarActiveTintColor: currentTheme.primary,
                tabBarInactiveTintColor: currentTheme.text,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Debts" component={DebtsScreen} />
            <Tab.Screen name="New" component={CreateDebtScreen} />
            <Tab.Screen name="Friends" component={FriendsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

const RootStack = createStackNavigator();

const AppNavigator = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const currentTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

    return (
        <NavigationContainer theme={currentTheme}>
            {user ? (
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    <RootStack.Screen name="MainTabs" component={AppTabs} />
                    <RootStack.Screen
                        name="PersonDetail"
                        component={PersonDetailScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <RootStack.Screen
                        name="DebtDetail"
                        // @ts-ignore
                        component={DebtDetailScreen}
                        options={{ presentation: 'modal' }}
                    />
                </RootStack.Navigator>
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
