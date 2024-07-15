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
  try {
      const script = document.createElement('script');
      script.textContent = scriptContent.replace(/;\s*$/, ''); // Remove trailing semicolon
      document[target].appendChild(script);
  } catch (error) {
      console.error('Error injecting script:', error);
  }
}

function injectStyle(styleContent, target) {
  try {
      const style = document.createElement('style');
      style.textContent = styleContent.replace(/;\s*$/, ''); // Remove trailing semicolon
      document[target].appendChild(style);
  } catch (error) {
      console.error('Error injecting style:', error);
  }
}
