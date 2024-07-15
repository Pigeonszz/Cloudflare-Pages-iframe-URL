// /scripts/custom.js

document.addEventListener('DOMContentLoaded', async () => {
  try {
      const response = await fetch('/custom');
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const deviceType = detectDeviceType();
      const preload = data[`M_PRELOAD`] || {};
      const postload = data[`M_POST_LOAD`] || {};

      // Preload: Inject immediately into the head
      preload.js.forEach(script => injectScript(script, 'head'));
      preload.css.forEach(style => injectStyle(style, 'head'));

      // Postload: Inject after the page has loaded into the footer
      window.addEventListener('load', () => {
          postload.js.forEach(script => injectScript(script, 'body'));
          postload.css.forEach(style => injectStyle(style, 'body'));
      });
  } catch (error) {
      console.error('Error fetching /custom:', error);
  }
});

// 检测设备类型的函数
function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
  }
  return 'desktop';
}

function injectScript(scriptContent, target) {
  const script = document.createElement('script');
  script.text = scriptContent.replace(/;/g, ''); // Remove extra semicolons
  document[target].appendChild(script);
}

function injectStyle(styleContent, target) {
  const style = document.createElement('style');
  style.textContent = styleContent.replace(/;/g, ''); // Remove extra semicolons
  document[target].appendChild(style);
}