export const endpoints = {
  health: "/api/health",
  
  // 인증
  auth: {
    signup: "/account/signup/",
    login: "/account/login/",
    logout: "/account/logout/",
    verifyEmail: (token: string) => `/account/verify-email/${token}/`,
    me: "/account/me/",
  },
  
  // 온보딩
  onboarding: {
    next: "/account/onboarding/next/",
    interests: "/account/interests/",
  },
  
  // 프로필
  profile: {
    local: "/account/profile/local/",
    user: "/account/profile/user/",
    switchRole: "/account/role/switch/",
  },
  
  // 인스타그램
  instagram: {
    request: "/account/instagram/request/",
    confirm: "/account/instagram/confirm/",
    status: "/account/instagram/status/",
  },
  
  // 장소
  place: {
    list: "/place/places/",
    detail: (id: number) => `/place/places/${id}/`,
    byRegion: "/place/places/by-region/",
    like: (id: number) => `/place/places/${id}/like/`,
    likes: "/place/likes/",
    hotspots: "/place/hotspots/",
    hotspotCountries: "/place/hotspots/countries/",
    hotspotCities: "/place/hotspots/cities/",
    trendspots: "/place/trendspots/",
  },
  
  // 위시리스트
  wishlist: {
    list: "/place/wishlists/",
    detail: (id: number) => `/place/wishlists/${id}/`,
    items: (wishlistId: number) => `/place/wishlists/${wishlistId}/items/`,
    itemDetail: (id: number) => `/place/wishlist-items/${id}/`,
  },
  
  // 문서 (요청서/제안서)
  document: {
    requests: "/document/requests/",
    requestDetail: (id: number) => `/document/requests/${id}/`,
    roots: "/document/roots/",
    rootDetail: (id: number) => `/document/roots/${id}/`,
  },
  
  // 스토리
  story: {
    list: "/story/stories/",
    detail: (id: number) => `/story/stories/${id}/`,
    view: (id: number) => `/story/stories/${id}/view/`,
    like: (id: number) => `/story/stories/${id}/like/`,
    comments: (storyId: number) => `/story/stories/${storyId}/comments/`,
    commentDelete: (id: number) => `/story/comments/${id}/`,
  },
  
  // 채팅
  chat: {
    rooms: "/chat/rooms/",
    roomDetail: (id: number) => `/chat/rooms/${id}/`,
    messages: (roomId: number) => `/chat/rooms/${roomId}/messages/`,
    messageDetail: (id: number) => `/chat/messages/${id}/`,
    uploadImage: (roomId: number) => `/chat/rooms/${roomId}/upload-image/`,
  },
} as const;
