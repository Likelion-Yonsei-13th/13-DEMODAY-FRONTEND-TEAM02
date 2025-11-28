import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios-instance";
import { endpoints } from "./endpoints";

// ---- Types ----
export type ThemeTag = {
  id: number;
  name: string;
  level: number;
  parent: number | null;
};

export type TravelPlace = {
  id: number;
  name: string;
  country: string;
  state: string;
  city: string;
  district: string;
};

export type Request = {
  id: number;
  user: {
    uuid: string;
    display_name: string;
    photo_url: string;
  };
  place: TravelPlace;
  title?: string;
  date: string;
  end_date?: string;
  number_of_people: number;
  guidance: boolean;
  travel_type: ThemeTag[];
  experience?: string;
  is_public_profile: boolean;
  created_at: string;
};

export type RequestCreateInput = {
  place_id: number;
  title?: string;
  date: string;
  end_date?: string;
  number_of_people: number;
  guidance?: boolean;
  travel_type_ids?: number[];
  experience?: string;
  is_public_profile?: boolean;
};

export type RequestUpdateInput = {
  place?: number;
  date?: string;
  number_of_people?: number;
  guidance?: boolean;
  travel_type_ids?: number[];
  experience?: string;
  is_public_profile?: boolean;
};

export type Root = {
  id: number;
  founder: {
    uuid: string;
    display_name: string;
    photo_url: string;
  };
  place: TravelPlace | number;
  title?: string;
  photo?: string;
  schedule?: any;
  number_of_people: number;
  guidance: boolean;
  travel_type: ThemeTag[];
  experience?: string;
  created_at: string;
  modified_at: string;
};

export type RootCreateInput = {
  place_id: number;
  title?: string;
  photo?: string;
  schedule?: any;
  number_of_people: number;
  guidance?: boolean;
  travel_type_ids?: number[];
  experience?: string;
};

export type RootUpdateInput = {
  place?: number;
  title?: string;
  number_of_people?: number;
  guidance?: boolean;
  travel_type_ids?: number[];
  experience?: string;
};

// ---- Theme Tags ----
export function useThemeTags(params?: { level?: number; parent?: number }) {
  return useQuery<ThemeTag[]>({
    queryKey: ["theme-tags", params],
    queryFn: async () => {
      const { data } = await api.get("/document/theme-tags/", { params });
      return data?.results ?? data;
    },
  });
}

// ---- Requests (여행자가 작성하는 요청서) ----
export function useRequests(params?: {
  place?: number;
  date?: string;
  user?: string;
}) {
  return useQuery<Request[]>({
    queryKey: ["requests", params],
    queryFn: async () => {
      const { data } = await api.get(endpoints.document.requests, { params });
      return data?.results ?? data;
    },
  });
}

export function useRequestDetail(id?: number) {
  return useQuery<Request | undefined>({
    enabled: !!id,
    queryKey: ["request", id],
    queryFn: async () => {
      if (!id) return undefined;
      const { data } = await api.get(endpoints.document.requestDetail(id));
      return data;
    },
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation<Request, any, RequestCreateInput>({
    mutationFn: async (input) => {
      const { data } = await api.post(endpoints.document.requests, input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useUpdateRequest() {
  const qc = useQueryClient();
  return useMutation<Request, any, { id: number } & RequestUpdateInput>({
    mutationFn: async ({ id, ...input }) => {
      const { data } = await api.patch(endpoints.document.requestDetail(id), input);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      qc.invalidateQueries({ queryKey: ["request", data.id] });
    },
  });
}

export function useDeleteRequest() {
  const qc = useQueryClient();
  return useMutation<void, any, number>({
    mutationFn: async (id) => {
      await api.delete(endpoints.document.requestDetail(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

// ---- Roots (로컬이 작성하는 제안서) ----
export function useRoots(params?: { place?: number; founder?: string }) {
  return useQuery<Root[]>({
    queryKey: ["roots", params],
    queryFn: async () => {
      const { data } = await api.get(endpoints.document.roots, { params });
      return data?.results ?? data;
    },
  });
}

export function useRootDetail(id?: number) {
  return useQuery<Root | undefined>({
    enabled: !!id,
    queryKey: ["root", id],
    queryFn: async () => {
      if (!id) return undefined;
      const { data } = await api.get(endpoints.document.rootDetail(id));
      return data;
    },
  });
}

export function useCreateRoot() {
  const qc = useQueryClient();
  return useMutation<Root, any, RootCreateInput>({
    mutationFn: async (input) => {
      const { data } = await api.post(endpoints.document.roots, input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roots"] });
    },
  });
}

export function useUpdateRoot() {
  const qc = useQueryClient();
  return useMutation<Root, any, { id: number } & RootUpdateInput>({
    mutationFn: async ({ id, ...input }) => {
      const { data } = await api.patch(endpoints.document.rootDetail(id), input);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["roots"] });
      qc.invalidateQueries({ queryKey: ["root", data.id] });
    },
  });
}

export function useDeleteRoot() {
  const qc = useQueryClient();
  return useMutation<void, any, number>({
    mutationFn: async (id) => {
      await api.delete(endpoints.document.rootDetail(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roots"] });
    },
  });
}

// ---- Image Upload for Root ----
export function useUploadRootImage() {
  return useMutation<{ url: string; filename: string }, any, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/document/upload-image/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
  });
}

// ---- Purchase Functionality (여행자가 제안서 구매) ----
export function usePurchaseRoot() {
  const qc = useQueryClient();
  return useMutation<any, any, number>({
    mutationFn: async (rootId) => {
      // TODO: 백엔드 API 말 구현 대기 중
      // const { data } = await api.post(`/document/roots/${rootId}/purchase/`);
      // 실제 계약서 구매 로직 처리는 다른 API로 처리될 수 있음
      console.warn("usePurchaseRoot: 백엔드 API가 아직 구현되지 않았습니다.");
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roots"] });
    },
  });
}

export function useCheckRootPurchased(rootId?: number) {
  return useQuery<boolean>({
    enabled: !!rootId,
    queryKey: ["root-purchased", rootId],
    queryFn: async () => {
      if (!rootId) return false;
      // TODO: 백엔드 API 말 구현 대기 중
      // const { data } = await api.get(`/document/roots/${rootId}/is-purchased/`);
      // return data.is_purchased;
      console.warn("useCheckRootPurchased: 백엔드 API가 아직 구현되지 않았습니다.");
      return false;
    },
  });
}
