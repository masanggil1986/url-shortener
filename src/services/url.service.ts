import { prisma } from "../lib/prisma";

function isValidUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (e) {
    return false;
  }
}

export async function shorten(originalUrl: string) {
  if (!originalUrl) {
    throw new Error("URL is required");
  }
  if (!isValidUrl(originalUrl)) {
    throw new Error("Invalid URL");
  }

  const { nanoid } = await import("nanoid");
  const code = nanoid();

  await prisma.url.create({
    data: {
      code,
      original: originalUrl,
    },
  });

  return code;
}

export async function findByCode(code: string) {
  const url = await prisma.url.findUnique({
    where: { code },
  });
  if (!url) {
    throw new Error("URL not found");
  }
  return url.original;
}