import { http } from '@/helpers/api/client';
import { ENDPOINTS } from '@/helpers/api/endpoints';
import type { ActivityPage } from '@/types/models/activity';

export const getActivity = (cursor: string | null) =>
  http.get<ActivityPage>(ENDPOINTS.ACTIVITY, { query: { limit: 20, cursor } });
