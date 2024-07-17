// i18n.js
'use strict';

let translations = {};
let currentLanguage = 'en'; // 默认语言

async function fetchTranslations(language) {
    try {
        const response = await fetch(`/i18n/${language}.yaml`);
        if (!response.ok) {
            throw new Error(`Failed to fetch translations for language: ${language}`);
        }
        const yamlText = await response.text();
        translations[language] = jsyaml.load(yamlText);
    } catch (error) {
        console.error('Error fetching translations:', error);
    }
}

export async function setLanguage(language) {
    currentLanguage = language;
    if (!translations[language]) {
        await fetchTranslations(language);
    }
}

export function translate(key) {
    return translations[currentLanguage] && translations[currentLanguage][key] || key;
}

// 初始化默认语言的翻译
fetchTranslations(currentLanguage);