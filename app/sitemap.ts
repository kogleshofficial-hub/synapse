import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://synapse-nine.vercel.app/", lastModified: new Date() }];
}
