import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
    Home: undefined;
    Debts: undefined;
    Settings: undefined;
    New: undefined;
    Friends: undefined;
    PersonDetail: { personId: string };
    CreateDebt: undefined;
    DebtDetail: { debtId: string };
};

export type CreateDebtScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'CreateDebt'
>;

export type FriendsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Friends'
>;
