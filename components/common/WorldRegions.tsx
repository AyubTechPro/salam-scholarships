'use client';

// World regions for global consultation goals
export const worldRegions = [
  {
    value: 'north_america',
    label: {
      en: 'North America',
      ru: 'Северная Америка',
      tj: 'Амрикои Шимолӣ',
    },
    countries: ['United States', 'Canada', 'Mexico'],
  },
  {
    value: 'europe',
    label: {
      en: 'Europe',
      ru: 'Европа',
      tj: 'Аврупо',
    },
    countries: ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden', 'Switzerland', 'Italy', 'Spain'],
  },
  {
    value: 'asia_pacific',
    label: {
      en: 'Asia Pacific',
      ru: 'Азиатско-Тихоокеанский регион',
      tj: 'Осиё ва Уқёнусия',
    },
    countries: ['China', 'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'Australia', 'New Zealand'],
  },
  {
    value: 'middle_east',
    label: {
      en: 'Middle East',
      ru: 'Ближний Восток',
      tj: 'Ховари Миёна',
    },
    countries: ['UAE', 'Saudi Arabia', 'Turkey'],
  },
  {
    value: 'central_asia',
    label: {
      en: 'Central Asia',
      ru: 'Центральная Азия',
      tj: 'Осиёи Марказӣ',
    },
    countries: ['Kazakhstan', 'Uzbekistan', 'Tajikistan', 'Kyrgyzstan', 'Turkmenistan'],
  },
  {
    value: 'south_asia',
    label: {
      en: 'South Asia',
      ru: 'Южная Азия',
      tj: 'Осиёи Ҷанубӣ',
    },
    countries: ['India', 'Pakistan', 'Bangladesh'],
  },
  {
    value: 'other',
    label: {
      en: 'Other',
      ru: 'Другое',
      tj: 'Дигар',
    },
    countries: [],
  },
];

// Expanded country list with regions
export const globalCountries = [
  // North America
  { value: 'United States', region: 'north_america', flag: '🇺🇸' },
  { value: 'Canada', region: 'north_america', flag: '🇨🇦' },
  { value: 'Mexico', region: 'north_america', flag: '🇲🇽' },
  
  // Europe
  { value: 'United Kingdom', region: 'europe', flag: '🇬🇧' },
  { value: 'Germany', region: 'europe', flag: '🇩🇪' },
  { value: 'France', region: 'europe', flag: '🇫🇷' },
  { value: 'Netherlands', region: 'europe', flag: '🇳🇱' },
  { value: 'Sweden', region: 'europe', flag: '🇸🇪' },
  { value: 'Switzerland', region: 'europe', flag: '🇨🇭' },
  { value: 'Italy', region: 'europe', flag: '🇮🇹' },
  { value: 'Spain', region: 'europe', flag: '🇪🇸' },
  { value: 'Norway', region: 'europe', flag: '🇳🇴' },
  { value: 'Denmark', region: 'europe', flag: '🇩🇰' },
  { value: 'Finland', region: 'europe', flag: '🇫🇮' },
  { value: 'Belgium', region: 'europe', flag: '🇧🇪' },
  { value: 'Austria', region: 'europe', flag: '🇦🇹' },
  { value: 'Poland', region: 'europe', flag: '🇵🇱' },
  { value: 'Ireland', region: 'europe', flag: '🇮🇪' },
  
  // Asia Pacific
  { value: 'China', region: 'asia_pacific', flag: '🇨🇳' },
  { value: 'Japan', region: 'asia_pacific', flag: '🇯🇵' },
  { value: 'South Korea', region: 'asia_pacific', flag: '🇰🇷' },
  { value: 'Singapore', region: 'asia_pacific', flag: '🇸🇬' },
  { value: 'Hong Kong', region: 'asia_pacific', flag: '🇭🇰' },
  { value: 'Australia', region: 'asia_pacific', flag: '🇦🇺' },
  { value: 'New Zealand', region: 'asia_pacific', flag: '🇳🇿' },
  { value: 'Malaysia', region: 'asia_pacific', flag: '🇲🇾' },
  { value: 'Thailand', region: 'asia_pacific', flag: '🇹🇭' },
  
  // Middle East
  { value: 'UAE', region: 'middle_east', flag: '🇦🇪' },
  { value: 'Saudi Arabia', region: 'middle_east', flag: '🇸🇦' },
  { value: 'Turkey', region: 'middle_east', flag: '🇹🇷' },
  { value: 'Qatar', region: 'middle_east', flag: '🇶🇦' },
  { value: 'Israel', region: 'middle_east', flag: '🇮🇱' },
  
  // Central Asia
  { value: 'Kazakhstan', region: 'central_asia', flag: '🇰🇿' },
  { value: 'Uzbekistan', region: 'central_asia', flag: '🇺🇿' },
  { value: 'Tajikistan', region: 'central_asia', flag: '🇹🇯' },
  { value: 'Kyrgyzstan', region: 'central_asia', flag: '🇰🇬' },
  { value: 'Turkmenistan', region: 'central_asia', flag: '🇹🇲' },
  { value: 'Russia', region: 'central_asia', flag: '🇷🇺' },
  
  // South Asia
  { value: 'India', region: 'south_asia', flag: '🇮🇳' },
  { value: 'Pakistan', region: 'south_asia', flag: '🇵🇰' },
  { value: 'Bangladesh', region: 'south_asia', flag: '🇧🇩' },
  
  // Other
  { value: 'South Africa', region: 'other', flag: '🇿🇦' },
  { value: 'Brazil', region: 'other', flag: '🇧🇷' },
  { value: 'Argentina', region: 'other', flag: '🇦🇷' },
  { value: 'Other', region: 'other', flag: '🌍' },
];

