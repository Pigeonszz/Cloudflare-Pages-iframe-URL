export async function onRequest(context) {
  const IFRAME_URL = context.env.IFRAME_URL;
  const FAVICON_URL = context.env.FAVICON_URL;
  const turnstileEnabled = context.env.TURNSTILE_ENABLED === 'true';
  const turnstileValidUntil = context.request.headers.get('turnstileValidUntil');
  const currentTime = new Date().getTime();

  if (turnstileEnabled && (!turnstileValidUntil || currentTime > parseInt(turnstileValidUntil))) {
    return new Response(JSON.stringify({ error: 'Verification required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (IFRAME_URL && FAVICON_URL) {
    const urls = IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';');
      return { url, service };
    });

    const favicons = FAVICON_URL.split(',').map(item => {
      const [service, faviconUrl] = item.split(';');
      return { service, faviconUrl };
    });

    const faviconUrls = await Promise.all(urls.map(async urlObj => {
      const faviconObj = favicons.find(fav => fav.service === urlObj.service);
      if (faviconObj) {
        const response = await fetch(faviconObj.faviconUrl);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        return {
          service: urlObj.service,
          base64: base64
        };
      } else {
        return {
          service: urlObj.service,
          base64: ''
        };
      }
    }));

    return new Response(JSON.stringify(faviconUrls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ error: 'Environment variables IFRAME_URL or FAVICON_URL not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function blobToBase64(blob) {
  const response = new Response(blob);
  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
  return base64;
}