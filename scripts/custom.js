// scripts/custom.js

// 获取响应并更新页面内容
async function fetchAndUpdateContent() {
  try {
      const response = await fetch('/custom'); // 发起请求获取自定义响应
      if (!response.ok) {
          throw new Error('Failed to fetch custom content');
      }

      const data = await response.json(); // 解析 JSON 响应数据

      // 更新页面内容
      updateContent('M_POST_LOAD', data.M_POST_LOAD);
      updateContent('M_PRELOAD', data.M_PRELOAD);
      updateContent('POST_LOAD', data.POST_LOAD);
      updateContent('PRELOAD', data.PRELOAD);
  } catch (error) {
      console.error('Error fetching or updating content:', error);
      // 处理错误，例如显示错误信息或者重试逻辑
  }
}

// 更新特定部分的内容
function updateContent(sectionId, content) {
  try {
      const jsContainer = document.getElementById(`${sectionId}_js`);
      const cssContainer = document.getElementById(`${sectionId}_css`);

      // 清空现有内容
      jsContainer.innerHTML = '';
      cssContainer.innerHTML = '';

      // 更新 JS 内容
      content.js.forEach(jsCode => {
          const script = document.createElement('script');
          script.textContent = jsCode;
          jsContainer.appendChild(script);
      });

      // 更新 CSS 内容
      content.css.forEach(cssCode => {
          const style = document.createElement('style');
          style.textContent = cssCode;
          cssContainer.appendChild(style);
      });

      // 可选：更新其他内容
      // const otherContainer = document.getElementById(`${sectionId}_other`);
      // otherContainer.innerHTML = '';
      // content.other.forEach(otherContent => {
      //     otherContainer.innerHTML += otherContent;
      // });
  } catch (error) {
      console.error('Error updating content:', error);
  }
}

// 初始化页面加载时获取并更新内容
document.addEventListener('DOMContentLoaded', () => {
  fetchAndUpdateContent(); // 页面加载完成后获取并更新内容
});
