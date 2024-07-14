export async function onRequest(context) {
    const { env } = context;
  
    const M_POST_LOAD = env.M_POST_LOAD || "";
    const M_PRELOAD = env.M_PRELOAD || "";
    const POST_LOAD = env.POST_LOAD || "";
    const PRELOAD = env.PRELOAD || "";
  
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
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
      }
      return await response.text();
    };
  
    // 处理环境变量中的 URL 和内联内容
    const processUrls = async (input) => {
      // 使用正则表达式匹配所有 URL，排除掉 <script> 标签中的 src 属性以及内联代码片段中的 URL
      const urls = input.match(/(https?:\/\/[^\s,;:]+)(?![^<]*<\/script>)(?![^`]*\`)/g) || [];
      // 移除所有 URL，剩下的就是内联内容
      const inlineContent = input.replace(/(https?:\/\/[^\s,;:]+)(?![^<]*<\/script>)(?![^`]*\`)/g, "").trim();
      const fetchedContent = await Promise.all(
        urls.map(async (url) => {
          if (isValidUrl(url)) {
            try {
              // 如果 URL 是 GitHub URL，则转换为 jsDelivr URL
              if (isGithubUrl(url)) {
                url = convertToJsdelivrUrl(url);
              }
              return await fetchResource(url);
            } catch (error) {
              console.error(error.message);
              return "";
            }
          } else {
            console.error(`Invalid URL: ${url}`);
            return "";
          }
        })
      );
      return [inlineContent, ...fetchedContent].join("\n");
    };
  
    // 并行处理所有环境变量
    const [M_POST_LOAD_CONTENT, M_PRELOAD_CONTENT, POST_LOAD_CONTENT, PRELOAD_CONTENT] = await Promise.all([
      processUrls(M_POST_LOAD),
      processUrls(M_PRELOAD),
      processUrls(POST_LOAD),
      processUrls(PRELOAD),
    ]);
  
    // 生成 HTML 响应
    const responseBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Custom Response</title>
        <style>
          ${M_PRELOAD_CONTENT}
          ${PRELOAD_CONTENT}
        </style>
        <script>
          ${M_POST_LOAD_CONTENT}
          ${POST_LOAD_CONTENT}
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