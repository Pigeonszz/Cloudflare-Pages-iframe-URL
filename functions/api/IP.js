// /functions/IP.js
"use strict";

export default {
  async fetch(request) {
    // 构建响应数据对象
    const data = {
      Method: request.method, // 请求方法
      Url: request.url, // 请求URL
      IP: {
        IP: request.headers.get('CF-Connecting-IP'), // 请求的IP地址
        Continent: request.cf.continent, // 大陆
        Country: request.cf.country, // 国家
        IsEU: request.cf.isEUCountry, // 是否是欧盟国家
        Region: request.cf.region, // 地区
        RegionCode: request.cf.regionCode, // 地区代码
        City: request.cf.city, // 城市
        Latitude: request.cf.latitude, // 纬度
        Longitude: request.cf.longitude, // 经度
        PostalCode: request.cf.postalCode, // 邮政编码
        MetroCode: request.cf.metroCode, // 地铁代码
        Colo: request.cf.colo, // 数据中心
        ASN: request.cf.asn, // 自治系统号
        ASOrganization: request.cf.asOrganization, // 自治系统组织
        Timezone: request.cf.timezone // 时区
      },
      UserAgent: request.headers.get('User-Agent') // UserAgent
    };

    var dataJson = JSON.stringify(data, null, 4); // 将响应数据对象转换为JSON字符串
    console.log(dataJson); // 输出JSON字符串到控制台

    return new Response(dataJson, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8" // 设置响应头的Content-Type为application/json
      }
    });
  }
};