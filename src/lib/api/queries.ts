import { useQuery } from '@tanstack/react-query';
import api from './axios-instance';
import { endpoints } from './endpoints';

type HealthResponse = { ok: boolean; message: string };

export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.health);
      return data;
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });
}
