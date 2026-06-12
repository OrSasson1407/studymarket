// Lightweight i18n — no external deps, SSR-safe
// Extend TRANSLATIONS and add locales as the product expands.

export type Locale = 'en' | 'he' | 'ar';

export const DEFAULT_LOCALE: Locale = 'en';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'he', 'ar'];

export const RTL_LOCALES: Locale[] = ['he', 'ar'];

export function isRTL(locale: Locale) {
  return RTL_LOCALES.includes(locale);
}

// ?? Translation keys ??????????????????????????????????????????????????????????
type TranslationKey =
  | 'nav.marketplace'
  | 'nav.auth'
  | 'nav.strategic'
  | 'search.placeholder'
  | 'doc.buy'
  | 'doc.preview'
  | 'doc.purchased'
  | 'auth.login'
  | 'auth.register'
  | 'auth.email'
  | 'auth.password'
  | 'auth.name'
  | 'auth.submit_login'
  | 'auth.submit_register'
  | 'auth.no_account'
  | 'auth.have_account'
  | 'auth.invalid_email'
  | 'auth.verified'
  | 'error.generic'
  | 'error.invalid_institution';

type Translations = Record<TranslationKey, string>;

const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    'nav.marketplace':        'Marketplace',
    'nav.auth':               'Security & Trust',
    'nav.strategic':          'Strategic Briefings',
    'search.placeholder':     'Search by course, code, university…',
    'doc.buy':                'Purchase',
    'doc.preview':            'Preview',
    'doc.purchased':          'Purchased ?',
    'auth.login':             'Sign In',
    'auth.register':          'Create Account',
    'auth.email':             'Institutional Email',
    'auth.password':          'Password',
    'auth.name':              'Full Name',
    'auth.submit_login':      'Sign In',
    'auth.submit_register':   'Create Account',
    'auth.no_account':        "Don't have an account?",
    'auth.have_account':      'Already have an account?',
    'auth.invalid_email':     'Must be an institutional email (.ac.il, .edu, …)',
    'auth.verified':          'Verified Institution',
    'error.generic':          'Something went wrong. Please try again.',
    'error.invalid_institution': 'Your email domain is not in our university registry.',
  },
  he: {
    'nav.marketplace':        'שוק',
    'nav.auth':               'אבטחה ואמינות',
    'nav.strategic':          'תדריכים אסטרטגיים',
    'search.placeholder':     'חיפוש לפי קורס, קוד, אוניברסיטה…',
    'doc.buy':                'רכישה',
    'doc.preview':            'תצוגה מקדימה',
    'doc.purchased':          'נרכש ?',
    'auth.login':             'כניסה',
    'auth.register':          'יצירת חשבון',
    'auth.email':             'אימייל מוסדי',
    'auth.password':          'סיסמה',
    'auth.name':              'שם מלא',
    'auth.submit_login':      'כניסה',
    'auth.submit_register':   'יצירת חשבון',
    'auth.no_account':        'אין לך חשבון?',
    'auth.have_account':      'כבר יש לך חשבון?',
    'auth.invalid_email':     'חובה להזין אימייל מוסדי (.ac.il, .edu, …)',
    'auth.verified':          'מוסד מאומת',
    'error.generic':          'משהו השתבש. נסה שוב.',
    'error.invalid_institution': 'דומיין האימייל שלך אינו ברשומת האוניברסיטאות שלנו.',
  },
  ar: {
    'nav.marketplace':        '?????',
    'nav.auth':               '?????? ??????',
    'nav.strategic':          '???????? ????????????',
    'search.placeholder':     '???? ??????? ?? ????? ?? ???????…',
    'doc.buy':                '????',
    'doc.preview':            '??????',
    'doc.purchased':          '?? ?????? ?',
    'auth.login':             '????? ??????',
    'auth.register':          '????? ????',
    'auth.email':             '?????? ???????',
    'auth.password':          '???? ??????',
    'auth.name':              '????? ??????',
    'auth.submit_login':      '????',
    'auth.submit_register':   '????? ????',
    'auth.no_account':        '??? ???? ?????',
    'auth.have_account':      '???? ???? ???????',
    'auth.invalid_email':     '??? ?? ???? ?????? ??????? (.ac.il, .edu, …)',
    'auth.verified':          '????? ?????',
    'error.generic':          '??? ??? ??. ???? ??? ????.',
    'error.invalid_institution': '???? ????? ?????????? ??? ????? ?? ??? ????????.',
  },
};

// ?? t() — the main translate function ????????????????????????????????????????
export function t(key: TranslationKey, locale: Locale = DEFAULT_LOCALE): string {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS['en'][key] ?? key;
}

// ?? detectLocale — reads Accept-Language or browser navigator ?????????????????
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const lang = navigator.language?.slice(0, 2) as Locale;
  return SUPPORTED_LOCALES.includes(lang) ? lang : DEFAULT_LOCALE;
}
