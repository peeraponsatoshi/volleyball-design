import { createI18n } from 'vue-i18n';
import { LANG } from '@/configs/key'
import { getLocal, setLocal } from '@/utils/local';
import type { App } from 'vue';
import type { I18n, I18nOptions } from 'vue-i18n';

export let i18n: I18n | undefined;

const LANG_USER_SET = 'LANG_USER_SET'
const SUPPORTED = ['th', 'en', 'zh'] as const

const getLocalLang = () => {
  const userSet = getLocal(LANG_USER_SET)
  let localLang = getLocal(LANG)

  // Product default: Thai (unless user explicitly picked a language)
  if (!userSet || !localLang || !SUPPORTED.includes(localLang as any)) {
    localLang = 'th'
    setLocal(LANG, 'th')
  }
  return localLang
}

const createI18nOptions = (): I18nOptions => {
  const locale = getLocalLang();
  const modules: Record<string, any> = import.meta.glob('./lang/*', { eager: true })
  const messages: Record<string, any> = {}
  Object.keys(modules).forEach((i: any) => {
    const key = i.replace('./lang/', '').split('.')[0]
    messages[key] = modules[i].default
  })
  return {
    legacy: false,
    locale,
    fallbackLocale: 'th',
    messages,
    allowComposition: true,
    globalInjection: true,
    silentTranslationWarn: true,
    missingWarn: false,
    silentFallbackWarn: true,
  };
}

const setI18nLanguage = (locale: string) => {
  if (i18n?.mode === 'legacy') {
    i18n.global.locale = locale;
  } else {
    (i18n?.global.locale as any).value = locale;
  }
  setLocal(LANG, locale);
  setLocal(LANG_USER_SET, '1');
  document.querySelector('html')?.setAttribute('lang', locale)
}

export const changeLocale = async (locale: string) => {
  const globalI18n = i18n?.global;
  if (!globalI18n) return
  const currentLocale = (globalI18n.locale as any).value ?? globalI18n.locale;
  if (currentLocale === locale) return;
  setI18nLanguage(locale);
  // Reload so Element Plus + hard-bound labels pick up fully
  window.location.reload()
  return locale;
}

export const setupI18n = async (app: App) => {
  const options = createI18nOptions();
  i18n = createI18n(options) as I18n;
  app.use(i18n);
  document.querySelector('html')?.setAttribute('lang', String(options.locale || 'th'))
}

export const i18nObj = () => {
  const localeData = createI18nOptions()
  return createI18n(localeData)
}
