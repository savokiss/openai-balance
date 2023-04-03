import { NextApiRequest } from "next";

const OPENAI_URL = "proxy.detools.dev";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextApiRequest) {
  const apiKey = req.headers.token;
  const openaiPath = req.headers.path;

  console.log("[Proxy] ", openaiPath, req);

  return fetch(`${PROTOCOL}://${BASE_URL}/${openaiPath}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: req.method,
    // body: req.body,
  });
}
