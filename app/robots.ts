import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mbjsociety.space";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/api/",
        "/account",
        "/messages",
        "/coupons",
        "/videos",
        "/photos",
        "/craft",
        "/livestreams",
        "/community",
        "/events",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
