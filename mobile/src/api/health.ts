import { get } from './client';

export type HealthResponse = { status: string };

export const fetchHealth = () => get<HealthResponse>('/health');
