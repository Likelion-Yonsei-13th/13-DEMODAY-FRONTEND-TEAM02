import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios-instance";
import { endpoints } from "./endpoints";

// ---- Types ----
export type TravelPlace = {
  id: number;
  name: string;
  photo: string;
  country: string;
  state: string;
  city: string;
  district: string;
  likes_count: number;
  view_count: number;
};

export type StoryListItem = {
  id: number;
  author: number;
  author_name: string;
  country: string;
  state: string;
  city: string;
  district: string;
  title: string;
  preview?: string;
  content?: string;
  photo_url: string;
  liked_count: number;
  view_count: number;
  created_at: string;
};

// Absolute URL helper for media paths
export function absUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;
  return path;
}

// ---- Single place detail ----
export function usePlaceDetail(id?: number) {
  return useQuery<TravelPlace | undefined>({
    enabled: !!id,
    queryKey: ["place", id],
    queryFn: async () => {
      if (!id) return undefined;
      const { data } = await api.get(endpoints.place.detail(id));
      return data;
    },
  });
}

// ---- Wishlists ----
export type Wishlist = { id: number; title: string; description?: string; is_public: boolean; created_at: string };
export function useMyWishlists(enabled = true) {
  return useQuery<Wishlist[]>({
    enabled,
    queryKey: ["wishlists", "mine"],
    queryFn: async () => {
      const { data } = await api.get(endpoints.place.wishlist.list);
      return data?.results ?? data;
    },
  });
}
export function useCreateWishlist() {
  return useMutation<{ id: number }, any, { title: string; description?: string }>(async (body) => {
    const { data } = await api.post(endpoints.place.wishlist.list, body);
    return data;
  });
}
export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation<any, any, { wishlistId: number; placeId: number }>(async ({ wishlistId, placeId }) => {
    const { data } = await api.post(endpoints.place.wishlist.items(wishlistId), { travel_spot: placeId });
    return data;
  }, { onSuccess: () => { qc.invalidateQueries({ queryKey: ["wishlists", "mine"] }); } });
}

// ---- Place search (SearchFilter uses query param 'search') ----
export function useSearchPlaces(params: {
  search?: string;
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params ?? {};
  return useQuery<TravelPlace[]>({
    queryKey: ["places", "search", rest],
    enabled,
    queryFn: async () => {
      const { data } = await api.get(endpoints.place.list, { params: rest });
      return data?.results ?? data;
    },
  });
}

// ---- Places by region ----
export function usePlacesByRegion(params: {
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  order?: "likes" | "views" | "name";
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params ?? {};
  return useQuery<TravelPlace[]>({
    queryKey: ["places", "by-region", rest],
    enabled,
    queryFn: async () => {
      const { data } = await api.get(endpoints.place.byRegion, { params: rest });
      return data?.results ?? data;
    },
  });
}

// ---- Stories by region ----
export function useStoriesByRegion(params: {
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  q?: string;
  sort?: "latest" | "hot_week" | "hot_month";
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params ?? {};
  return useQuery<StoryListItem[]>({
    queryKey: ["stories", "region", rest],
    enabled,
    queryFn: async () => {
      const { data } = await api.get(endpoints.story.list, { params: rest });
      return data?.results ?? data;
    },
  });
}
