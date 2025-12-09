export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/",
    "/search",
    "/playlists/:path*",
    "/friends/:path*",
    "/chat/:path*",
    "/settings/:path*",
  ],
};
