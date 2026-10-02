import { en } from './en';
import { bn } from './bn';
import { hi } from './hi';
import { te } from './te';
import { mr } from './mr';
import { ta } from './ta';
import type { Language, LanguageOption, TranslationSchema } from '../types';

export const translations: Record<Language, TranslationSchema> = {
  en,
  bn,
  hi,
  te,
  mr,
  ta,
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

export const DEFAULT_LANGUAGE: Language = 'en';
