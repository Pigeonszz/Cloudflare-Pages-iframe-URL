(function() {
    // 检测设备类型的函数
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(navigator.userAgent);
      }
  
    // 加载自定义脚本的函数
    function loadCustomScripts(path, type) {
      fetch(path)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const scripts = doc.querySelectorAll('a[href$=".js"]');
          scripts.forEach(script => {
            const scriptName = script.href.split('/').pop();
            const scriptElement = document.createElement('script');
            scriptElement.src = path + scriptName;
            if (type === 'preload') {
              document.head.appendChild(scriptElement);
            } else if (type === 'postload') {
              document.body.appendChild(scriptElement);
            }
          });
        })
        .catch(error => console.error(`加载自定义${type}脚本时出错:`, error));
    }
  
    // 加载自定义CSS的函数
    function loadCustomCSS(path, type) {
      fetch(path)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const links = doc.querySelectorAll('a[href$=".css"]');
          links.forEach(link => {
            const cssName = link.href.split('/').pop();
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = path + cssName;
            if (type === 'preload') {
              document.head.appendChild(linkElement);
            } else if (type === 'postload') {
              document.body.appendChild(linkElement);
            }
          });
        })
        .catch(error => console.error(`加载自定义${type}CSS时出错:`, error));
    }
  
    // 确定设备类型并加载相应的脚本和CSS
    const isMobile = isMobileDevice();
    const preloadPath = isMobile ? 'scripts/custom/M_Preload/' : 'scripts/custom/Preload/';
    const postloadPath = isMobile ? 'scripts/custom/M_Postload/' : 'scripts/custom/Postload/';
    const cssPreloadPath = isMobile ? 'CSS/custom/M_Preload/' : 'CSS/custom/Preload/';
    const cssPostloadPath = isMobile ? 'CSS/custom/M_Postload/' : 'CSS/custom/Postload/';
  
    // 加载预加载脚本和CSS
    loadCustomScripts(preloadPath, 'preload');
    loadCustomCSS(cssPreloadPath, 'preload');
  
    // 加载后加载脚本和CSS
    loadCustomScripts(postloadPath, 'postload');
    loadCustomCSS(cssPostloadPath, 'postload');
  })();