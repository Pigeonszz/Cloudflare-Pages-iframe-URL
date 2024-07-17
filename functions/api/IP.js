// /functions/IP.js
"use strict";

export async function onRequest(context) {
  // 检查请求路径是否为 /api/IP
  const requestPath = new URL(context.request.url).pathname;
  if (requestPath.toLowerCase() !== '/api/ip') {
    return new Response('Not Found', { status: 404 });
  }

  // 构建响应数据对象
  const data = {
    Method: context.request.method, // 请求方法
    Url: context.request.url, // 请求URL
    IP: {
      IP: context.request.headers.get('CF-Connecting-IP'), // 请求的IP地址
      Continent: context.request.cf.continent, // 大陆
      Country: context.request.cf.country, // 国家
      IsEU: context.request.cf.isEUCountry, // 是否是欧盟国家
      Region: context.request.cf.region, // 地区
      RegionCode: context.request.cf.regionCode, // 地区代码
      City: context.request.cf.city, // 城市
      Latitude: context.request.cf.latitude, // 纬度
      Longitude: context.request.cf.longitude, // 经度
      PostalCode: context.request.cf.postalCode, // 邮政编码
      MetroCode: context.request.cf.metroCode, // 地铁代码
      Colo: context.request.cf.colo, // 数据中心
      ASN: context.request.cf.asn, // 自治系统号
      ASOrganization: context.request.cf.asOrganization, // 自治系统组织
      Timezone: context.request.cf.timezone // 时区
    },
    UserAgent: context.request.headers.get('User-Agent') // UserAgent
  };

  const dataJson = JSON.stringify(data, null, 4); // 将响应数据对象转换为JSON字符串
  console.log(dataJson); // 输出JSON字符串到控制台

  return new Response(dataJson, {
    headers: {
      "Content-Type": "application/json;charset=UTF-8" // 设置响应头的Content-Type为application/json
    }
  });
}