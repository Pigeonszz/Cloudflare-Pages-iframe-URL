// /scripts/custom.js

// 检测设备类型的函数
function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
  }
  return 'desktop';
}

// 注入CSS的函数
function injectCSS(cssCode, position) {
  const style = document.createElement('style');
  style.innerHTML = cssCode;
  if (position === 'head') {
      document.head.appendChild(style);
  } else {
      document.body.appendChild(style);
  }
}

// 注入JS的函数
function injectJS(jsCode, position, isAsync = false) {
  const script = document.createElement('script');
  script.textContent = jsCode;
  script.async = isAsync;
  if (position === 'head') {
      document.head.appendChild(script);
  } else {
      document.body.appendChild(script);
  }
}

(async () => {
  try {
      const response = await fetch('/custom');
      if (!response.ok) {
          throw new Error('网络响应不正常 ' + response.statusText);
      }

      const data = await response.json();
      const deviceType = detectDeviceType();

      // 预加载的CSS和JS（立即注入页头）
      if (deviceType === 'mobile') {
          if (data.M_PRELOAD.css) injectCSS(data.M_PRELOAD.css, 'head');
          if (data.M_PRELOAD.js) injectJS(data.M_PRELOAD.js, 'head', true);
      } else {
          if (data.PRELOAD.css) injectCSS(data.PRELOAD.css, 'head');
          if (data.PRELOAD.js) injectJS(data.PRELOAD.js, 'head', true);
      }

      // 在页面加载完之后注入后加载的CSS和JS（注入页脚）
      document.addEventListener('DOMContentLoaded', () => {
          if (deviceType === 'mobile') {
              if (data.M_POST_LOAD.css) injectCSS(data.M_POST_LOAD.css, 'body');
              if (data.M_POST_LOAD.js) injectJS(data.M_POST_LOAD.js, 'body');
          } else {
              if (data.POST_LOAD.css) injectCSS(data.POST_LOAD.css, 'body');
              if (data.POST_LOAD.js) injectJS(data.POST_LOAD.js, 'body');
          }
      });

  } catch (error) {
      console.error('获取和注入自定义资源失败:', error);
  }
})();
