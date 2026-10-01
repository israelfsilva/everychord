import { create } from 'zustand';
import { LOCALES, MESSAGES, type Locale, type Messages } from './messages';

export { LOCALES, MESSAGES, type Locale, type Messages };

export const LOCALE_STORAGE_KEY = 'everychord-locale';

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as string[]).includes(value);

/** First browser language we support ("pt-BR" → "pt"), falling back to English. */
export function detectLocale(languages: readonly string[]): Locale {
  for (const lang of languages) {
    const base = lang.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return 'en';
}

export function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Storage blocked: fall through to browser language
  }
  if (typeof navigator === 'undefined') return 'en';
  return detectLocale(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

function applyLocale(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = MESSAGES[locale].meta.htmlLang;
  document.title = MESSAGES[locale].meta.title;
}

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18n = create<I18nState>((set) => ({
  locale: getInitialLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage blocked: locale still applies for this session
    }
    applyLocale(locale);
    set({ locale });
  },
}));

applyLocale(useI18n.getState().locale);

/** Messages for the active locale. */
export const useT = (): Messages => MESSAGES[useI18n((s) => s.locale)];
