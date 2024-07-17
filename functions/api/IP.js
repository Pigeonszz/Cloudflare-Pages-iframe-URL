// /functions/IP.js
"use strict";
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path !== '/api/IP') {
      return new Response('Invalid path', {
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        status: 404
      });
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
};