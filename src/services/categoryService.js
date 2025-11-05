import { supabase } from '../config/supabase';

export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')  // Make sure this matches your Supabase table name
      .select('*')
      .order('categoryname', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchCategoryById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};
