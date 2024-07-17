// /scripts/custom.js

// 定义日志级别映射
const LOG_LEVEL_MAP = {
  'off': 0,
  'fatal': 1,
  'error': 2,
  'warn': 3,
  'info': 4,
  'debug': 5,
  'trace': 6
};

// 获取日志级别
function getLogLevel(logLevel) {
  return LOG_LEVEL_MAP[logLevel] || LOG_LEVEL_MAP['info'];
}

// 日志记录函数
function log(level, message, logLevel) {
  if (LOG_LEVEL_MAP[level] <= logLevel) {
      console[level](message);
  }
}

async function fetchCustomScripts() {
  try {
      const response = await fetch('/custom', {
          headers: {
              'Accept': 'application/json;charset=UTF-8'
          }
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const logLevel = getLogLevel(data.LOG_LEVEL);

      log('info', 'Fetching custom scripts', logLevel);

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
          loadScripts(data.M_PRELOAD, 'preload', logLevel);
          loadScripts(data.M_POST_LOAD, 'postload', logLevel);
      } else {
          loadScripts(data.PRELOAD, 'preload', logLevel);
          loadScripts(data.POST_LOAD, 'postload', logLevel);
      }
  } catch (error) {
      const logLevel = getLogLevel(localStorage.getItem('LOG_LEVEL') || 'info');
      log('error', `Error fetching custom scripts: ${error}`, logLevel);
  }
}

function loadScripts(scripts, loadType, logLevel) {
  if (!scripts) return;

  // 解析环境变量中的URL和内联代码片段
  const scriptUrls = [];
  const inlineScripts = [];
  const styleUrls = [];
  const inlineStyles = [];

  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const urlRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>|<link[^>]*href=["']([^"']+)["'][^>]*>/gi;

  let match;

  // 提取内联脚本和样式
  while ((match = scriptRegex.exec(scripts)) !== null) {
      inlineScripts.push(match[1]);
  }
  while ((match = styleRegex.exec(scripts)) !== null) {
      inlineStyles.push(match[1]);
  }

  // 提取URL
  while ((match = urlRegex.exec(scripts)) !== null) {
      if (match[1]) {
          scriptUrls.push(match[1]);
      } else if (match[2]) {
          styleUrls.push(match[2]);
      }
  }

  // 加载内联脚本和样式
  inlineScripts.forEach(scriptContent => {
      const newScript = document.createElement('script');
      newScript.text = scriptContent;
      if (loadType === 'preload') {
          document.head.appendChild(newScript);
      } else if (loadType === 'postload') {
          document.body.appendChild(newScript);
      }
  });

  inlineStyles.forEach(styleContent => {
      const newStyle = document.createElement('style');
      newStyle.textContent = styleContent;
      document.head.appendChild(newStyle);
  });

  // 加载URL指向的脚本和样式
  scriptUrls.forEach(url => {
      const newScript = document.createElement('script');
      newScript.src = url;
      if (loadType === 'preload') {
          newScript.async = true;
      }
      document.head.appendChild(newScript);
  });

  styleUrls.forEach(url => {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = url;
      document.head.appendChild(newLink);
  });

  log('debug', `Loaded ${loadType} scripts and styles`, logLevel);
}

document.addEventListener('DOMContentLoaded', fetchCustomScripts);