/**
 * Chapter 2.3 - Response Building (Solution)
 */

export function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}

export function redirectResponse(url: string, permanent?: boolean): Response {
  return new Response(null, {
    status: permanent ? 301 : 302,
    headers: { Location: url },
  });
}

export function htmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export function noContentResponse(): Response {
  return new Response(null, { status: 204 });
}
