// Public visitors can browse photos; only authorized admins can publish them.
export async function POST() {
  return Response.json({ error: "Public photo uploads are no longer available." }, {
    status: 410, headers: { "Cache-Control": "no-store" },
  });
}
