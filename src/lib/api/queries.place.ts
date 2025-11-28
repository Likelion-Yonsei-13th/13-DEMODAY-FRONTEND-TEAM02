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
  is_liked?: boolean; // 클라이언트에서 관리
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
export type Wishlist = { 
  id: number; 
  title: string; 
  description?: string; 
  is_public: boolean; 
  created_at: string;
  items?: WishlistItem[];
};

export type WishlistItem = {
  id: number;
  travel_spot: number;
  trend: number | null;
  created_at: string;
  travel_spot_detail?: TravelPlace;
};

export function useMyWishlists(enabled = true) {
  return useQuery<Wishlist[]>({
    enabled,
    queryKey: ["wishlists", "mine"],
    queryFn: async () => {
      const { data } = await api.get("/place/wishlists/");
      return data?.results ?? data;
    },
  });
}

export function useWishlistDetail(id?: number) {
  return useQuery<Wishlist | undefined>({
    enabled: !!id,
    queryKey: ["wishlist", id],
    queryFn: async () => {
      if (!id) return undefined;
      const { data } = await api.get(endpoints.wishlist.detail(id));
      return data;
    },
  });
}

export function useWishlistItems(wishlistId?: number) {
  return useQuery<WishlistItem[]>({
    enabled: !!wishlistId,
    queryKey: ["wishlist", wishlistId, "items"],
    queryFn: async () => {
      if (!wishlistId) return [];
      const { data } = await api.get(endpoints.wishlist.items(wishlistId));
      return data?.results ?? data;
    },
  });
}

export function useCreateWishlist() {
  const qc = useQueryClient();
  return useMutation<{ id: number }, any, { title: string; description?: string }>({
    mutationFn: async (body) => {
      const { data } = await api.post("/place/wishlists/", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlists", "mine"] });
    },
  });
}

export function useDeleteWishlist() {
  const qc = useQueryClient();
  return useMutation<void, any, number>({
    mutationFn: async (id) => {
      await api.delete(endpoints.wishlist.detail(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlists", "mine"] });
    },
  });
}

export function useUpdateWishlist() {
  const qc = useQueryClient();
  return useMutation<Wishlist, any, { id: number; title?: string; description?: string; is_public?: boolean }>({
    mutationFn: async ({ id, ...body }) => {
      const { data } = await api.patch(endpoints.wishlist.detail(id), body);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["wishlists", "mine"] });
      qc.invalidateQueries({ queryKey: ["wishlist", data.id] });
    },
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation<any, any, { wishlistId: number; placeId: number }>({
    mutationFn: async ({ wishlistId, placeId }) => {
      console.log("[useAddToWishlist] wishlistId:", wishlistId, "placeId:", placeId);
      const payload = { travel_spot: placeId };
      console.log("[useAddToWishlist] payload:", payload);
      const { data } = await api.post(`/place/wishlists/${wishlistId}/items/`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["wishlists", "mine"] });
      qc.invalidateQueries({ queryKey: ["wishlist", variables.wishlistId] });
      qc.invalidateQueries({ queryKey: ["wishlist", variables.wishlistId, "items"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation<void, any, { itemId: number; wishlistId: number }>({
    mutationFn: async ({ itemId }) => {
      await api.delete(endpoints.wishlist.itemDetail(itemId));
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["wishlists", "mine"] });
      qc.invalidateQueries({ queryKey: ["wishlist", variables.wishlistId] });
      qc.invalidateQueries({ queryKey: ["wishlist", variables.wishlistId, "items"] });
    },
  });
}

// ---- Place Like Toggle ----
export function useLikedPlaces() {
  return useQuery<TravelPlace[]>({
    queryKey: ["liked-places"],
    queryFn: async () => {
      const { data } = await api.get(endpoints.place.likes);
      return data?.results ?? data;
    },
  });
}

export function usePlaceLike() {
  const qc = useQueryClient();
  return useMutation<{ liked: boolean; likes_count: number }, any, number>({
    mutationFn: async (placeId) => {
      const { data } = await api.post(endpoints.place.like(placeId));
      return data;
    },
    onSuccess: (data, placeId) => {
      qc.invalidateQueries({ queryKey: ["place", placeId] });
      qc.invalidateQueries({ queryKey: ["liked-places"] });
    },
  });
}

export function usePlaceUnlike() {
  const qc = useQueryClient();
  return useMutation<{ liked: boolean; likes_count: number }, any, number>({
    mutationFn: async (placeId) => {
      const { data } = await api.delete(endpoints.place.like(placeId));
      return data;
    },
    onSuccess: (data, placeId) => {
      qc.invalidateQueries({ queryKey: ["place", placeId] });
      qc.invalidateQueries({ queryKey: ["liked-places"] });
    },
  });
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
