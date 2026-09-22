import { Platform } from 'react-native';
import Config from 'react-native-config';

const fallback =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api/v1' // emulator → host loopback
    : 'http://localhost:8080/api/v1';

export const API_BASE_URL = Config.API_BASE_URL ?? fallback;
