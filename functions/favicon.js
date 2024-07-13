export async function onRequest(context) {
  const IFRAME_URL = context.env.IFRAME_URL;
  const FAVICON_URL = context.env.FAVICON_URL;
  const TURNSTILE_ENABLED = context.env.TURNSTILE_ENABLED === 'true';
  const TURNSTILE_SECRET_KEY = context.env.TURNSTILE_SECRET_KEY;
  const turnstileToken = context.request.headers.get('Authorization')?.split(' ')[1];

  if (TURNSTILE_ENABLED) {
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Token missing.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
    });

    const verificationResult = await verificationResponse.json();

    if (!verificationResult.success) {
      return new Response(JSON.stringify({ error: 'Verification failed.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
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
        let faviconUrl = faviconObj.faviconUrl;
        if (isGithubUrl(faviconUrl)) {
          faviconUrl = convertToJsdelivrUrl(faviconUrl);
        }
        try {
          const response = await fetch(faviconUrl);
          if (!response.ok) throw new Error('Failed to fetch favicon');
          const blob = await response.blob();
          const base64 = await blobToBase64(blob);
          const contentType = response.headers.get('content-type');
          return {
            service: urlObj.service,
            base64: base64,
            contentType: contentType
          };
        } catch (error) {
          console.error(`Failed to fetch favicon for service ${urlObj.service}:`, error);
          return {
            service: urlObj.service,
            base64: '',
            contentType: 'image/svg+xml'
          };
        }
      } else {
        return {
          service: urlObj.service,
          base64: '',
          contentType: 'image/svg+xml'
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

function isGithubUrl(url) {
  const githubRegex = /^https?:\/\/(?:www\.)?(?:github\.com|gist\.github\.com|raw\.githubusercontent\.com)\/.*\/.*\/(?:raw|blob)\/.*\/.*$/;
  return githubRegex.test(url);
}

function convertToJsdelivrUrl(githubUrl) {
  const jsdelivrUrl = githubUrl.replace(
    /^https?:\/\/(?:www\.)?(?:github\.com|gist\.github\.com|raw\.githubusercontent\.com)\/(.*?)\/(.*?)\/(?:raw|blob)\/(.*)$/,
    'https://cdn.jsdelivr.net/gh/$1/$2@$3'
  );
  return jsdelivrUrl;
}