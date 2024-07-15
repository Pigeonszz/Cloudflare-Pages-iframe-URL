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
      const response = await fetch('/functions/custom');
      const data = await response.json();
  
      // 确保 logLevel 在这里定义
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
      // 确保 logLevel 在这里定义
      const logLevel = getLogLevel(localStorage.getItem('LOG_LEVEL') || 'info');
      log('error', `Error fetching custom scripts: ${error}`, logLevel);
    }
  }
  
  function loadScripts(scripts, loadType, logLevel) {
    if (!scripts) return;
  
    // 创建一个临时的div元素来解析HTML字符串
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = scripts;
  
    // 获取所有的script和style元素
    const scriptElements = tempDiv.querySelectorAll('script');
    const styleElements = tempDiv.querySelectorAll('style');
  
    scriptElements.forEach(scriptElement => {
      const newScript = document.createElement('script');
      Array.from(scriptElement.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.text = scriptElement.text;
      if (loadType === 'preload') {
        document.head.appendChild(newScript);
      } else if (loadType === 'postload') {
        document.body.appendChild(newScript);
      }
    });
  
    styleElements.forEach(styleElement => {
      const newStyle = document.createElement('style');
      newStyle.textContent = styleElement.textContent;
      document.head.appendChild(newStyle);
    });
  
    log('debug', `Loaded ${loadType} scripts and styles`, logLevel);
  }
  
  document.addEventListener('DOMContentLoaded', fetchCustomScripts);