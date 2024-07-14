export async function onRequest(context) {
    const { env } = context;
  
    const M_POST_LOAD = env.M_POST_LOAD || "";
    const M_PRELOAD = env.M_PRELOAD || "";
    const POST_LOAD = env.POST_LOAD || "";
    const PRELOAD = env.PRELOAD || "";
  
    console.log("M_POST_LOAD:", M_POST_LOAD);
    console.log("M_PRELOAD:", M_PRELOAD);
    console.log("POST_LOAD:", POST_LOAD);
    console.log("PRELOAD:", PRELOAD);
  
    // 验证 URL 是否有效
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };
  
    // 获取指定 URL 的内容
    const fetchResource = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        return await response.text();
      } catch (error) {
        console.error(`Error fetching ${url}: ${error.message}`);
        return "";
      }
    };
  
    // 处理环境变量中的 URL 和内联内容
    const processUrls = async (input) => {
      console.log("Processing input:", input);
      // 使用正则表达式匹配所有 URL，排除掉 <script> 标签中的 src 属性以及内联代码片段中的 URL
      const urls = input.match(/(https?:\/\/[^\s,;:]+)(?![^<]*<\/script>)(?![^`]*\`)/g) || [];
      console.log("Extracted URLs:", urls);
      // 移除所有 URL，剩下的就是内联内容
      const inlineContent = input.replace(/(https?:\/\/[^\s,;:]+)(?![^<]*<\/script>)(?![^`]*\`)/g, "").trim();
      console.log("Inline content:", inlineContent);
      const fetchedContent = await Promise.all(
        urls.map(async (url) => {
          if (isValidUrl(url)) {
            // 如果 URL 是 GitHub URL，则转换为 jsDelivr URL
            if (isGithubUrl(url)) {
              url = convertToJsdelivrUrl(url);
            }
            return await fetchResource(url);
          } else {
            console.error(`Invalid URL: ${url}`);
            return "";
          }
        })
      );
      console.log("Fetched content:", fetchedContent);
      return [inlineContent, ...fetchedContent].join("\n");
    };
  
    // 并行处理所有环境变量
    let M_POST_LOAD_CONTENT, M_PRELOAD_CONTENT, POST_LOAD_CONTENT, PRELOAD_CONTENT;
    try {
      [M_POST_LOAD_CONTENT, M_PRELOAD_CONTENT, POST_LOAD_CONTENT, PRELOAD_CONTENT] = await Promise.all([
        processUrls(M_POST_LOAD),
        processUrls(M_PRELOAD),
        processUrls(POST_LOAD),
        processUrls(PRELOAD),
      ]);
    } catch (error) {
      console.error(`Error processing environment variables: ${error.message}`);
      M_POST_LOAD_CONTENT = M_PRELOAD_CONTENT = POST_LOAD_CONTENT = PRELOAD_CONTENT = "";
    }
  
    // 分离 CSS 和 JS 内容
    const extractCssAndJs = (content) => {
      console.log("Extracting CSS and JS from content:", content);
      const cssRegex = /<style>([\s\S]*?)<\/style>/g;
      const jsRegex = /<script>([\s\S]*?)<\/script>/g;
      const cssMatches = content.match(cssRegex) || [];
      const jsMatches = content.match(jsRegex) || [];
      const cssContent = cssMatches.map(match => match.replace(/<\/?style>/g, '')).join("\n");
      const jsContent = jsMatches.map(match => match.replace(/<\/?script>/g, '')).join("\n");
      console.log("Extracted CSS content:", cssContent);
      console.log("Extracted JS content:", jsContent);
      return { cssContent, jsContent };
    };
  
    const { cssContent: M_PRELOAD_CSS, jsContent: M_PRELOAD_JS } = extractCssAndJs(M_PRELOAD_CONTENT);
    const { cssContent: PRELOAD_CSS, jsContent: PRELOAD_JS } = extractCssAndJs(PRELOAD_CONTENT);
    const { cssContent: M_POST_LOAD_CSS, jsContent: M_POST_LOAD_JS } = extractCssAndJs(M_POST_LOAD_CONTENT);
    const { cssContent: POST_LOAD_CSS, jsContent: POST_LOAD_JS } = extractCssAndJs(POST_LOAD_CONTENT);
  
    // 生成 HTML 响应
    const responseBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Custom Response</title>
        <style>
          <!-- M_PRELOAD_CSS -->
          ${M_PRELOAD_CSS}
          <!-- /M_PRELOAD_CSS -->
          <!-- PRELOAD_CSS -->
          ${PRELOAD_CSS}
          <!-- /PRELOAD_CSS -->
          <!-- M_POST_LOAD_CSS -->
          ${M_POST_LOAD_CSS}
          <!-- /M_POST_LOAD_CSS -->
          <!-- POST_LOAD_CSS -->
          ${POST_LOAD_CSS}
          <!-- /POST_LOAD_CSS -->
        </style>
        <script>
          <!-- M_PRELOAD_JS -->
          ${M_PRELOAD_JS}
          <!-- /M_PRELOAD_JS -->
          <!-- PRELOAD_JS -->
          ${PRELOAD_JS}
          <!-- /PRELOAD_JS -->
          <!-- M_POST_LOAD_JS -->
          ${M_POST_LOAD_JS}
          <!-- /M_POST_LOAD_JS -->
          <!-- POST_LOAD_JS -->
          ${POST_LOAD_JS}
          <!-- /POST_LOAD_JS -->
        </script>
      </head>
      <body>
        <h1>Custom Response</h1>
      </body>
      </html>
    `;
  
    return new Response(responseBody, {
      headers: { "Content-Type": "text/html" },
    });
  }
  
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