import { http } from '@/helpers/api/client';
import { ENDPOINTS } from '@/helpers/api/endpoints';
import type { BalancesResponse } from '@/types/models/balance';

export const getBalances = () => http.get<BalancesResponse>(ENDPOINTS.BALANCES);
