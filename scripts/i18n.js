// /scripts/i18n.js
"use strict";

// Function to fetch i18n messages based on user's preferred languages, ISO 639 standards, and BCP 47 language tags
// 根据用户偏好语言、ISO 639 标准以及 BCP 47 语言标签获取国际化消息的函数
async function getI18nMessages() {
    // Get the list of preferred languages from the browser
    // 获取浏览器的偏好语言列表
    const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
  
    // Iterate through the user's preferred languages and try to load the corresponding i18n resources
    // 遍历用户偏好语言列表，尝试加载对应的国际化资源
    for (const lang of userLanguages) {
      // Try the language tag directly
      // 直接尝试语言标签
      try {
        const response = await fetch(`/i18n/${lang}.yaml`);
        if (response.ok) {
          const text = await response.text();
          return jsyaml.load(text);
        }
      } catch (error) {
        console.error(`Failed to fetch i18n messages for language: ${lang}`, error);
        // 获取语言 ${lang} 的国际化资源失败
      }

      // Try the language code with ISO 3166-1 country code
      // 尝试语言代码与 ISO 3166-1 国家代码的组合
      const [language, country] = lang.split('-');
      if (country) {
        try {
          const response = await fetch(`/i18n/${language}-${country.toUpperCase()}.yaml`);
          if (response.ok) {
            const text = await response.text();
            return jsyaml.load(text);
          }
        } catch (error) {
          console.error(`Failed to fetch i18n messages for language: ${language}-${country.toUpperCase()}`, error);
          // 获取语言 ${language}-${country.toUpperCase()} 的国际化资源失败
        }
      }

      // Try ISO 639-2, ISO 639-3, ISO 639-5, and ISO 639-6 codes if available
      // 尝试 ISO 639-2、ISO 639-3、ISO 639-5 和 ISO 639-6 代码（如果可用）
      const iso639Variants = getIso639Variants(language);
      for (const variant of iso639Variants) {
        try {
          const response = await fetch(`/i18n/${variant}.yaml`);
          if (response.ok) {
            const text = await response.text();
            return jsyaml.load(text);
          }
        } catch (error) {
          console.error(`Failed to fetch i18n messages for language: ${variant}`, error);
          // 获取语言 ${variant} 的国际化资源失败
        }
      }

      // Parse the language tag according to BCP 47
      // 根据 BCP 47 解析语言标签
      const languageParts = parseBCP47(lang);
      for (const part of languageParts) {
        try {
          const response = await fetch(`/i18n/${part}.yaml`);
          if (response.ok) {
            const text = await response.text();
            return jsyaml.load(text);
          }
        } catch (error) {
          console.error(`Failed to fetch i18n messages for language: ${part}`, error);
          // 获取语言 ${part} 的国际化资源失败
        }
      }
    }
  
    // If no usable resources are found after trying all user preferred languages, fallback to 'en.yaml'
    // 如果所有用户偏好语言都尝试完毕后仍未找到可用资源，则 fallback 到 'en.yaml'
    try {
      const response = await fetch(`/i18n/en.yaml`);
      if (!response.ok) {
        throw new Error('Fallback to English failed');
        // Fallback 到英语失败
      }
      const text = await response.text();
      return jsyaml.load(text);
    } catch (error) {
      console.error('Fallback to English failed', error);
      // Fallback 到英语失败
      throw new Error('No i18n messages found for any of the user languages or fallback English');
      // 未找到任何用户语言或 fallback 英语的国际化资源
    }
  }
  
  // Function to translate the page based on the fetched messages
  // 根据获取的消息翻译页面的函数
  function translatePage(messages) {
    // Get all elements with the data-i18n attribute
    // 获取所有带有 data-i18n 属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      // Get the value of the data-i18n attribute from the element, used as the translation key
      // 获取元素的 data-i18n 属性值，作为翻译键
      const key = element.getAttribute('data-i18n');
      if (messages[key]) {
        // If the corresponding translated text is found, update the element's text content
        // 如果找到对应的翻译文本，更新元素的文本内容
        element.textContent = messages[key];
      }
    });
  }
  
  // Helper function to get ISO 639 variants
  // 获取 ISO 639 变体的辅助函数
  function getIso639Variants(language) {
    // This function should return an array of possible ISO 639 variants for the given language code
    // 此函数应返回给定语言代码的可能 ISO 639 变体数组
    // For simplicity, we'll assume a static mapping here, but in a real application, you might want to use a more comprehensive list
    // 为简单起见，我们在这里假设一个静态映射，但在实际应用中，您可能希望使用更全面的列表
    const variants = {
      'en': ['eng', 'enm'], // English variants
      'fr': ['fre', 'fra'], // French variants
      // Add more mappings as needed
      // 根据需要添加更多映射
    };
    return variants[language] || [];
  }

  // Helper function to parse BCP 47 language tags
  // 解析 BCP 47 语言标签的辅助函数
  function parseBCP47(tag) {
    // This function should return an array of possible language codes derived from the BCP 47 tag
    // 此函数应返回从 BCP 47 标签派生的可能语言代码数组
    // For simplicity, we'll assume a basic parsing here, but in a real application, you might want to use a more comprehensive parser
    // 为简单起见，我们在这里假设一个基本解析，但在实际应用中，您可能希望使用更全面的解析器
    const parts = tag.split('-');
    const variants = [];
    for (let i = 1; i <= parts.length; i++) {
      variants.push(parts.slice(0, i).join('-'));
    }
    return variants;
  }
  
  export { getI18nMessages as getMsg, translatePage as translate };