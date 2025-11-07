import { useQuery } from '@tanstack/react-query';
import api from './axios-instance';
import { endpoints } from './endpoints';

type HealthResponse = { ok: boolean; message: string };

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>(endpoints.health);
      return data;
    },
  });
}
