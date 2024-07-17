// /scripts/i18n.js
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const i18nDirectory = path.join(__dirname, 'i18n');

function loadTranslations(language) {
  const filePath = path.join(i18nDirectory, `${language}.yaml`);
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
  } else {
    throw new Error(`Translation file for language ${language} not found.`);
  }
}

function getTranslation(language, key) {
  const translations = loadTranslations(language);
  if (translations && translations[key]) {
    return translations[key];
  } else {
    throw new Error(`Translation key ${key} not found for language ${language}.`);
  }
}

module.exports = {
  loadTranslations,
  getTranslation
};