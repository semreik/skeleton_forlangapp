import { Platform } from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const impl = Platform.OS === 'web' ? require('./secureStore.web') : require('./secureStore.native');
export const setItemAsync = impl.setItemAsync as (k: string, v: string) => Promise<void>;
export const getItemAsync = impl.getItemAsync as (k: string) => Promise<string | null>;
export const deleteItemAsync = impl.deleteItemAsync as (k: string) => Promise<void>;


