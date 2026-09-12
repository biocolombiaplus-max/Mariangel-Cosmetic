"use client";

// Reads a fetch Response defensively: some failures (a server crash, an
// oversized request rejected upstream) come back as an empty body or an
// HTML error page rather than JSON, which would otherwise blow up on
// res.json() with a cryptic "Unexpected end of JSON input".
export async function parseJsonResponse(res) {
  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // not JSON — fall through, we still have the raw text for the error
    }
  }
  if (!res.ok) {
    throw new Error(json?.error || (text ? text.slice(0, 200) : `Error ${res.status}`));
  }
  return json;
}
