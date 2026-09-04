'use client';

import { useState, useEffect } from 'react';
import { Phone, ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Popular country codes with flags (emoji) - expanded list
const countryCodes = [
  { code: '+1', country: 'US', name: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', country: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷' },
  { code: '+86', country: 'CN', name: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: '+61', country: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: '+1', country: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: '+31', country: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: '+41', country: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+39', country: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: '+90', country: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: '+971', country: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+91', country: 'IN', name: 'India', flag: '🇮🇳' },
  { code: '+7', country: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: '+7', country: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+998', country: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+992', country: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: '+996', country: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+993', country: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+65', country: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: '+852', country: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: '+64', country: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+27', country: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: '+55', country: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

type GlobalPhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  onCountryChange?: (code: string, country: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
};

export default function GlobalPhoneInput({
  value,
  onChange,
  countryCode,
  onCountryChange,
  placeholder,
  required = false,
  className = '',
  disabled = false,
}: GlobalPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(
    countryCodes.find((c) => c.code === countryCode) || countryCodes.find((c) => c.country === 'TJ') || countryCodes[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  // Auto-detect country from IP (simplified - in production use a proper IP geolocation service)
  useEffect(() => {
    // Try to detect country from browser locale or IP
    const detectCountry = async () => {
      try {
        // In production, use a service like ipapi.co or similar
        // For now, we'll use browser timezone as a fallback
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Basic timezone to country mapping
        if (timezone.includes('Dushanbe') || timezone.includes('Asia/Dushanbe')) {
          setDetectedCountry('TJ');
        } else if (timezone.includes('Europe')) {
          setDetectedCountry('GB'); // Default to UK for Europe
        } else if (timezone.includes('America')) {
          setDetectedCountry('US');
        } else if (timezone.includes('Asia')) {
          setDetectedCountry('CN'); // Default to China for Asia
        }
      } catch (error) {
        console.error('Error detecting country:', error);
      }
    };

    detectCountry();
  }, []);

  // Set detected country as default if no countryCode provided
  useEffect(() => {
    if (!countryCode && detectedCountry) {
      const country = countryCodes.find((c) => c.country === detectedCountry);
      if (country) {
        setSelectedCountry(country);
        onCountryChange?.(country.code, country.country);
      }
    }
  }, [detectedCountry, countryCode, onCountryChange]);

  const handleCountrySelect = (country: typeof countryCodes[0]) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    onCountryChange?.(country.code, country.country);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Only digits
    onChange(inputValue);
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic formatting - adjust based on selected country if needed
    return phone;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className="flex items-center space-x-1 px-3 py-3 border-2 border-gray-200 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-brand-navy"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="font-sans">{selectedCountry.code}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && !disabled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto"
              >
                {countryCodes.map((country) => (
                  <button
                    key={`${country.code}-${country.country}`}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 hover:bg-brand-gold/10 transition-colors ${
                      selectedCountry.code === country.code && selectedCountry.country === country.country
                        ? 'bg-brand-gold/20 text-brand-gold'
                        : 'text-brand-navy'
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="font-sans font-medium">{country.code}</span>
                    <span className="font-sans text-sm text-gray-600 flex-1 text-left">{country.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="tel"
            value={formatPhoneNumber(value)}
            onChange={handlePhoneChange}
            placeholder={placeholder || 'Enter phone number'}
            required={required}
            disabled={disabled}
            className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-r-md border-l-0 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all font-sans w-full disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}

