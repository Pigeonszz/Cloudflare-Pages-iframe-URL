// /scripts/i18n.js
'use strict';

import * as jsYaml from 'https://cdn.jsdelivr.net/npm/js-yaml@latest/dist/js-yaml.min.js';

async function loadTranslations(language) {
    try {
        const lowerCaseLanguage = language.toLowerCase(); // 将语言代码转换为小写
        const response = await fetch(`/i18n/${lowerCaseLanguage}.yaml`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return jsYaml.load(text); // 使用 js-yaml 解析 YAML 文件
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

export function getTranslation(translations, key, defaultValue = '') {
    if (translations && translations[key] !== undefined) {
        return translations[key];
    } else {
        console.warn(`Translation key ${key} not found.`);
        return defaultValue;
    }
}

function updateUI(translations) {
    document.title = translations.title; // 更新文档标题
    const selectOption = document.querySelector('#siteSelection option');
    if (selectOption) {
        selectOption.textContent = translations.select_option; // 更新选择框选项文本
    }
}

async function initI18n() {
    const languages = navigator.languages || [navigator.language || 'en']; // 获取用户首选语言，默认语言为 'en'
    let translations = null;

    for (const lang of languages) {
        translations = await loadTranslations(lang); // 尝试加载每种语言的翻译文件
        if (translations) {
            break; // 如果成功加载翻译文件，则停止循环
        }
    }

    if (translations) {
        updateUI(translations); // 更新用户界面
    } else {
        console.error('No translations found for any preferred language.');
    }
}

document.addEventListener('DOMContentLoaded', initI18n); // 在 DOM 加载完成后初始化国际化功能