// /functions/IP.js
"use strict";
export async function onRequest(context) {
  // 检查请求路径是否为 /api/IP
  const requestPath = new URL(context.request.url).pathname;
  if (requestPath !== '/api/IP') {
    return new Response('Not Found', { status: 404 });
  }


  const data = `Method: ${request.method}
Url: ${request.url}
IP: ${request.headers.get('CF-Connecting-IP')}
Continent: ${request.cf.continent}
Country: ${request.cf.country}
Region: ${request.cf.region}
RegionCode: ${request.cf.regionCode}
City: ${request.cf.city}
Latitude: ${request.cf.latitude}
Longitude: ${request.cf.longitude}
Colo: ${request.cf.colo}
ASN: ${request.cf.asn}
ASOrganization: ${request.cf.asOrganization}
Timezone: ${request.cf.timezone}`;

  return new Response(data, {
    headers: { "Content-Type": "text/plain;charset=UTF-8" }
  });
}