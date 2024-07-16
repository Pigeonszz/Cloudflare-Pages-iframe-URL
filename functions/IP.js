// /functions/IP.js

export async function onRequest(context) {
    const clientIP = context.request.headers.get('CF-Connecting-IP');
    return new Response(clientIP, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }