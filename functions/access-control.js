export async function onRequest(context) {
    const { request, env } = context;
    const authHeader = request.headers.get('Authorization');
  
    if (!authHeader) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="User Visible Realm"' }
      });
    }
  
    const [username, password] = atob(authHeader.split(' ')[1]).split(':');
    const users = env.USER_PASSWORD.split(',').map(user => user.split(';'));
    const user = users.find(u => u[0] === username && u[1] === password);
  
    if (!user) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="User Visible Realm"' }
      });
    }
  
    const access = env.ACCESS.split(',').map(access => access.split(';'));
    const userAccess = access.find(a => a[0] === username);
  
    if (!userAccess) {
      return new Response('Forbidden', { status: 403 });
    }
  
    const allowedServices = userAccess[1].split('&');
    const iframeUrls = env.IFRAME_URL.split(',').map(item => {
      const [url, service] = item.split(';');
      return { url, service };
    });
  
    const allowedUrls = iframeUrls.filter(url => allowedServices.includes(url.service) || allowedServices.includes('*'));
  
    return new Response(JSON.stringify(allowedUrls), {
      headers: { 'Content-Type': 'application/json' }
    });
  }