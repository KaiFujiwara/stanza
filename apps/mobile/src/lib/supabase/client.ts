import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] 環境変数が設定されていません:', {
    url: supabaseUrl || 'undefined',
    key: supabaseAnonKey ? '***設定済み***' : 'undefined',
  });
  throw new Error(
    `Supabase URL and Anon Key must be provided.\nURL: ${supabaseUrl}\nKey: ${supabaseAnonKey ? 'set' : 'undefined'}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
