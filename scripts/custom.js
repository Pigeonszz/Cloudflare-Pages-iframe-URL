// /scripts/custom.js

// 检测设备类型的函数
function detectDeviceType() {
  const ua = navigator.userAgent;
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
  }
  return 'desktop';
}

// 注入多个CSS的函数
function injectMultipleCSS(cssArray, position) {
  cssArray.forEach(cssCode => {
      const style = document.createElement('style');
      style.innerHTML = cssCode;
      if (position === 'head') {
          document.head.appendChild(style);
      } else {
          document.body.appendChild(style);
      }
  });
}

// 注入多个JS的函数
function injectMultipleJS(jsArray, position) {
  jsArray.forEach(jsCode => {
      const script = document.createElement('script');
      script.innerHTML = jsCode;
      if (position === 'head') {
          document.head.appendChild(script);
      } else {
          document.body.appendChild(script);
      }
  });
}

// 异步加载外部脚本的函数
function injectExternalJS(jsArray, position) {
  jsArray.forEach(jsUrl => {
      const script = document.createElement('script');
      script.src = jsUrl;
      script.async = true;
      if (position === 'head') {
          document.head.appendChild(script);
      } else {
          document.body.appendChild(script);
      }
  });
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
          if (data.M_PRELOAD.css) injectMultipleCSS(data.M_PRELOAD.css, 'head');
          if (data.M_PRELOAD.js) injectExternalJS(data.M_PRELOAD.js, 'head');
      } else {
          if (data.PRELOAD.css) injectMultipleCSS(data.PRELOAD.css, 'head');
          if (data.PRELOAD.js) injectExternalJS(data.PRELOAD.js, 'head');
      }

      // 在页面加载完之后注入后加载的CSS和JS（注入页脚）
      document.addEventListener('DOMContentLoaded', () => {
          if (deviceType === 'mobile') {
              if (data.M_POST_LOAD.css) injectMultipleCSS(data.M_POST_LOAD.css, 'body');
              if (data.M_POST_LOAD.js) injectMultipleJS(data.M_POST_LOAD.js, 'body');
          } else {
              if (data.POST_LOAD.css) injectMultipleCSS(data.POST_LOAD.css, 'body');
              if (data.POST_LOAD.js) injectMultipleJS(data.POST_LOAD.js, 'body');
          }
      });

  } catch (error) {
      console.error('获取和注入自定义资源失败:', error);
  }
})();
