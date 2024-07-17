// /scripts/i18n.js
'use strict';

let translations = {};
let currentLang = 'en'; // 默认语言

async function fetchTranslations(lang) {
  try {
    const response = await fetch(`/i18n/${lang}.yaml`);
    if (!response.ok) {
      throw new Error(`Failed to fetch translations for language: ${lang}`);
    }
    const yamlText = await response.text();
    translations[lang] = parseYaml(yamlText);
  } catch (error) {
    console.error('Error fetching translations:', error);
  }
}

async function parseYaml(yamlText) {
    // 使用jsDelivr导入js-yaml库
    const yaml = await import('https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js');
    
    // 确认 yaml 对象包含 load 方法
    if (typeof yaml.load !== 'function') {
      console.error('yaml.load is not a function');
      return null;
    }
    
    return yaml.load(yamlText);
  }

export async function setLanguage(lang) {
  currentLang = lang;
  if (!translations[lang]) {
    await fetchTranslations(lang);
  }
}

export function translate(key) {
  return translations[currentLang] && translations[currentLang][key] || key;
}

// 初始化默认语言的翻译
fetchTranslations(currentLang);