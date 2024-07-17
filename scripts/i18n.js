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
        return jsYaml.load(text);
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

export function getTranslation(translations, key) {
    if (translations && translations[key]) {
        return translations[key];
    } else {
        throw new Error(`Translation key ${key} not found.`);
    }
}

function updateUI(translations) {
    document.title = translations.title;
    const selectOption = document.querySelector('#siteSelection option');
    if (selectOption) {
        selectOption.textContent = translations.select_option;
    }
}

async function initI18n() {
    const languages = navigator.languages || [navigator.language || 'en']; // 默认语言为 'en'
    let translations = null;

    for (const lang of languages) {
        translations = await loadTranslations(lang);
        if (translations) {
            break;
        }
    }

    if (translations) {
        updateUI(translations);
    } else {
        console.error('No translations found for any preferred language.');
    }
}

document.addEventListener('DOMContentLoaded', initI18n);