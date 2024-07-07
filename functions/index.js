/**
 * Cloudflare Worker to handle various endpoint requests.
 * Handles Turnstile status, fetching site title, iframe URL, and Turnstile keys.
 */

// Main entry point to handle incoming requests
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Route requests based on path
  if (path === '/Turnstile') {
    return handleTurnstile(context);
  } else if (path === '/getSiteTitle') {
    return handleGetSiteTitle(context);
  } else if (path === '/iframe-url') {
    return handleIframeUrl(context);
  } else if (path === '/turnstile-keys') {
    return handleTurnstileKeys(context);
  } else {
    // Handle undefined routes with a 404 response
    return new Response('Not Found', { status: 404 });
  }
}

// Handler for /Turnstile endpoint to return Turnstile status
async function handleTurnstile(context) {
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED || 'false';

  // Return JSON response with TURNSTILE_ENABLED status
  return new Response(
    JSON.stringify({ TURNSTILE_ENABLED }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Handler for /getSiteTitle endpoint to fetch and return SITE_TITLE
async function handleGetSiteTitle(context) {
  // Fetch SITE_TITLE from environment variables
  const siteTitle = context.env.SITE_TITLE;

  // Return plain text response with SITE_TITLE
  return new Response(siteTitle, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Handler for /iframe-url endpoint to fetch and return IFRAME_URL
async function handleIframeUrl(context) {
  // Fetch IFRAME_URL from environment variables
  const iframeUrl = context.env.IFRAME_URL;

  // Return plain text response with IFRAME_URL
  return new Response(iframeUrl, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Handler for /turnstile-keys endpoint to fetch and return Turnstile keys
async function handleTurnstileKeys(context) {
  // Fetch TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY from environment variables
  const keys = {
    siteKey: context.env.TURNSTILE_SITE_KEY,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
  };

  // Return JSON response with Turnstile keys
  return new Response(JSON.stringify(keys), {
    headers: { 'Content-Type': 'application/json' },
  });
}
