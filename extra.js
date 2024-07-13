// /functions/extra.js

// 获取环境变量
const getEnvVar = (name) => process.env[name] || '';

// 检查 URL 是否是 GitHub 的 URL
function isGithubUrl(url) {
  const githubRegex = /^https?:\/\/(?:www\.)?(?:github\.com|gist\.github\.com|raw\.githubusercontent\.com)\/.*\/.*\/(?:raw|blob)\/.*\/.*$/;
  return githubRegex.test(url);
}

// 将 GitHub URL 转换为 jsDelivr URL
function convertToJsdelivrUrl(githubUrl) {
  const jsdelivrUrl = githubUrl.replace(
    /^https?:\/\/(?:www\.)?(?:github\.com|gist\.github\.com|raw\.githubusercontent\.com)\/(.*?)\/(.*?)\/(?:raw|blob)\/(.*)$/,
    'https://cdn.jsdelivr.net/gh/$1/$2@$3'
  );
  return jsdelivrUrl;
}

// 从URL加载CSS并注入
async function injectCustomCSS(url) {
  try {
    let finalUrl = url;
    if (isGithubUrl(url)) {
      finalUrl = convertToJsdelivrUrl(url);
    }// /functions/extra.js

// 获取环境变量
const getEnvVar = (name) => process.env[name] || '';

// 检查 URL 是否是 GitHub 的 URL
function isGithubUrl(url) {
  const githubRegex = /^https?:\/\/(?:www\.)?(?:github\.com|gist\.github\.com|raw\.githubusercontent\.com)\/.*\/.*\/(?:raw|blob)\/.*\/.*$/;
  return githubRegex.test(url);
}

// 将 GitHub URL 转换为 jsDelivr URL
function convertToJsdelivrUrl(githubUrl) {
  const jsdelivrUrl = githubUrl.replace(
    /^https?:\/\/(?:www\.)?(?:github\.com|gist\.github\.com|raw\.githubusercontent\.com)\/(.*?)\/(.*?)\/(?:raw|blob)\/(.*)$/,
    'https://cdn.jsdelivr.net/gh/$1/$2@$3'
  );
  return jsdelivrUrl;
}

// 从URL加载CSS并注入
async function injectCustomCSS(url) {
  try {
    let finalUrl = url;
    if (isGithubUrl(url)) {
      finalUrl = convertToJsdelivrUrl(url);
    }
    const response = await fetch(finalUrl);
    const css = await response.text();
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  } catch (error) {
    console.error('Failed to load CSS from URL:', url, error);
  }
}

// 从URL加载JS并注入
async function injectCustomJS(url) {
  try {
    let finalUrl = url;
    if (isGithubUrl(url)) {
      finalUrl = convertToJsdelivrUrl(url);
    }
    const response = await fetch(finalUrl);
    const js = await response.text();
    const script = document.createElement('script');
    script.text = js;
    document.head.appendChild(script);
  } catch (error) {
    console.error('Failed to load JS from URL:', url, error);
  }
}

// 处理用户输入的代码片段和URL
function processUserInput(input) {
  const items = input.split(/[\n,;]+/).map(item => item.trim()).filter(item => item.length > 0);
  const result = [];

  for (const item of items) {
    if (isGithubUrl(item)) {
      result.push(convertToJsdelivrUrl(item));
    } else {
      result.push(item);
    }
  }

  return result.join('|||');
}

// 检查并注入自定义 CSS 和 JS
async function injectCustomCode() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // 获取不同环境变量的值
  let mPreload = getEnvVar(isMobile ? 'M_PRELOAD' : 'PRELOAD');
  let mPostLoad = getEnvVar(isMobile ? 'M_POST_LOAD' : 'POST_LOAD');

  // 处理用户输入
  mPreload = processUserInput(mPreload);
  mPostLoad = processUserInput(mPostLoad);

  // 处理预加载和后加载
  async function processLoad(loadStr) {
    if (loadStr) {
      const items = loadStr.split('|||');
      for (const item of items) {
        const [css, js] = item.split('|').map(str => str.trim());
        if (css) await injectCustomCSS(css);
        if (js) await injectCustomJS(js);
      }
    }
  }

  // 执行预加载和后加载
  await processLoad(mPreload);
  await processLoad(mPostLoad);
}

// 调用注入函数
injectCustomCode();
    const response = await fetch(finalUrl);
    const css = await response.text();
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  } catch (error) {
    console.error('Failed to load CSS from URL:', url, error);
  }
}

// 从URL加载JS并注入
async function injectCustomJS(url) {
  try {
    let finalUrl = url;
    if (isGithubUrl(url)) {
      finalUrl = convertToJsdelivrUrl(url);
    }
    const response = await fetch(finalUrl);
    const js = await response.text();
    const script = document.createElement('script');
    script.text = js;
    document.head.appendChild(script);
  } catch (error) {
    console.error('Failed to load JS from URL:', url, error);
  }
}

// 处理用户输入的代码片段或URL
function processUserInput(input) {
  const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const result = [];

  for (const line of lines) {
    if (isGithubUrl(line)) {
      result.push(convertToJsdelivrUrl(line));
    } else {
      result.push(line);
    }
  }

  return result.join('|||');
}

// 检查并注入自定义 CSS 和 JS
async function injectCustomCode() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // 获取不同环境变量的值
  let mPreload = getEnvVar(isMobile ? 'M_PRELOAD' : 'PRELOAD');
  let mPostLoad = getEnvVar(isMobile ? 'M_POST_LOAD' : 'POST_LOAD');

  // 处理用户输入
  const userInputPreload = getEnvVar('USER_INPUT_PRELOAD');
  const userInputPostLoad = getEnvVar('USER_INPUT_POSTLOAD');

  if (userInputPreload) {
    mPreload += '|||' + processUserInput(userInputPreload);
  }

  if (userInputPostLoad) {
    mPostLoad += '|||' + processUserInput(userInputPostLoad);
  }

  // 处理预加载和后加载
  async function processLoad(loadStr) {
    if (loadStr) {
      const items = loadStr.split('|||');
      for (const item of items) {
        const [css, js] = item.split('|').map(str => str.trim());
        if (css) await injectCustomCSS(css);
        if (js) await injectCustomJS(js);
      }
    }
  }

  // 执行预加载和后加载
  await processLoad(mPreload);
  await processLoad(mPostLoad);
}

// 调用注入函数
injectCustomCode();