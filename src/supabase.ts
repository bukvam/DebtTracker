import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ljhxmxbdzoxxtbfpfsqp.supabase.co';
const SUPABASE_ANON_KEY = 'REDACTED';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchDebts = async (userId: string) => {
    const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const fetchPeople = async (userId: string) => {
    const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
};

export const addDebt = async (
    userId: string,
    personId: string,
    amount: number,
    description?: string
) => {
    const { data: personData, error: personError } = await supabase
        .from('people')
        .select('total_owed')
        .eq('id', personId)
        .single();

    if (personError) throw personError;

    const newTotalOwed = personData.total_owed + amount;

    const { data: debtData, error: debtError } = await supabase
        .from('debts')
        .insert([{ user_id: userId, person_id: personId, amount, description }])
        .select()
        .single();

    if (debtError) throw debtError;

    const { error: updateError } = await supabase
        .from('people')
        .update({ total_owed: newTotalOwed })
        .eq('id', personId);

    if (updateError) throw updateError;

    return debtData;
};


export const markDebtAsPaid = async (debtId: string) => {
    const { data, error } = await supabase
        .from('debts')
        .update({ paid: true })
        .eq('id', debtId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const addPerson = async (userId: string, name: string) => {
    const { data, error } = await supabase
        .from('people')
        .insert([{ user_id: userId, name }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const fetchPersonDetail = async (personId: string) => {
    const { data, error } = await supabase
        .from('people')
        .select('name')
        .eq('id', personId)
        .single();

    if (error) {
        console.error(error);
        return '';
    }
    return data?.name || '';
};

export const fetchPersonDetails = async (personId: string) => {
    const { data, error } = await supabase
        .from('people')
        .select('id, name, total_owed, total_paid')
        .eq('id', personId)
        .single();

    if (error) throw error;
    return data;
};

export const fetchPersonDebts = async (personId: string) => {
    const { data, error } = await supabase
        .from('debts')
        .select('amount, description, paid, created_at')
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const markDebtAsUnpaid = async (debtId: string) => {
    const { error } = await supabase
        .from('debts')
        .update({ paid: false })
        .eq('id', debtId);

    if (error) throw error;
};

export const deleteDebt = async (debtId: string): Promise<void> => {
    try {
        const { data: debt, error: fetchError } = await supabase
            .from('debts')
            .select('person_id, amount')
            .eq('id', debtId)
            .single();

        if (fetchError) {
            throw new Error(fetchError.message);
        }

        if (!debt) {
            throw new Error('Debt not found');
        }

        const { person_id, amount } = debt;

        const { data: person, error: fetchPersonError } = await supabase
            .from('people')
            .select('total_owed')
            .eq('id', person_id)
            .single();

        if (fetchPersonError) {
            throw new Error(fetchPersonError.message);
        }

        if (!person) {
            throw new Error('Person not found');
        }

        const newTotalOwed = person.total_owed - amount;

        const { error: updateError } = await supabase
            .from('people')
            .update({ total_owed: newTotalOwed })
            .eq('id', person_id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        const { error: deleteError } = await supabase
            .from('debts')
            .delete()
            .eq('id', debtId);

        if (deleteError) {
            throw new Error(deleteError.message);
        }
    } catch (error) {
        console.error("Error deleting debt: ", error);
        throw new Error('Failed to delete debt and update person\'s total_owed');
    }
};

export const fetchDebtById = async (debtId: string) => {
    const { data, error } = await supabase
        .from('debts')
        .select('amount, description, created_at, person_id')
        .eq('id', debtId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export default supabase;