// /scripts/i18n.ts

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface Translation {
    [key: string]: string;
}

interface Translations {
    [locale: string]: Translation;
}

const i18nDirectory = path.join(__dirname, '../i18n');

function loadTranslations(): Translations {
    const translations: Translations = {};

    if (fs.existsSync(i18nDirectory)) {
        const files = fs.readdirSync(i18nDirectory);

        files.forEach(file => {
            const filePath = path.join(i18nDirectory, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const locale = path.basename(file, path.extname(file));

            try {
                translations[locale] = yaml.load(fileContent) as Translation;
            } catch (error) {
                console.error(`Error parsing translation file ${file}:`, error);
            }
        });
    } else {
        console.error(`Directory ${i18nDirectory} does not exist.`);
    }

    return translations;
}

const translations = loadTranslations();

export function translate(key: string, locale: string = 'en-us'): string {
    const translation = translations[locale];
    if (translation && translation[key]) {
        return translation[key];
    }
    return key;
}