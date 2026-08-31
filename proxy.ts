export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*", "/account/:path*"],
};
