// Pilot seed data for Karnataka & Maharashtra
// All coordinates are real APMC market locations [lng, lat]
export const SEED_MANDIS = [
  {
    code: 'KA-BLR-01',
    names: {
      en: 'K.R. Market (Bengaluru)',
      kn: 'ಕೆ.ಆರ್. ಮಾರುಕಟ್ಟೆ (ಬೆಂಗಳೂರು)',
      hi: 'के.आर. मार्केट (बेंगलुरु)',
      mr: 'के.आर. मार्केट (बंगळुरू)',
    },
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    location: {
      type: 'Point',
      coordinates: [77.5753, 12.9644], // [lng, lat]
    },
    address: 'K.R. Market, Kalasipalya, Bengaluru 560002',
    phone: '+91-80-26701234',
    isActive: true,
  },
  {
    code: 'KA-BLR-02',
    names: {
      en: 'APMC Yeshwanthpur (Bengaluru)',
      kn: 'ಎಪಿಎಂಸಿ ಯಶವಂತಪುರ (ಬೆಂಗಳೂರು)',
      hi: 'एपीएमसी यशवंतपुर (बेंगलुरु)',
      mr: 'एपीएमसी यशवंतपूर (बंगळुरू)',
    },
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    location: {
      type: 'Point',
      coordinates: [77.5484, 13.0238],
    },
    address: 'APMC Yard, Yeshwanthpur, Bengaluru 560022',
    phone: '+91-80-23378901',
    isActive: true,
  },
  {
    code: 'KA-KOL-01',
    names: {
      en: 'APMC Kolar',
      kn: 'ಎಪಿಎಂಸಿ ಕೋಲಾರ',
      hi: 'एपीएमसी कोलार',
      mr: 'एपीएमसी कोलार',
    },
    state: 'Karnataka',
    district: 'Kolar',
    location: {
      type: 'Point',
      coordinates: [78.1348, 13.1367],
    },
    address: 'APMC Market Yard, Kolar, Karnataka 563101',
    phone: '+91-8152-223456',
    isActive: true,
  },
  {
    code: 'MH-PUN-01',
    names: {
      en: 'Pune APMC (Gultekdi)',
      kn: 'ಪುಣೆ ಎಪಿಎಂಸಿ (ಗುಲ್ಟೇಕಡಿ)',
      hi: 'पुणे एपीएमसी (गुलटेकड़ी)',
      mr: 'पुणे कृषी उत्पन्न बाजार समिती (गुलटेकडी)',
    },
    state: 'Maharashtra',
    district: 'Pune',
    location: {
      type: 'Point',
      coordinates: [73.8687, 18.4907],
    },
    address: 'Market Yard, Gultekdi, Pune, Maharashtra 411037',
    phone: '+91-20-24268100',
    isActive: true,
  },
  {
    code: 'MH-NSK-01',
    names: {
      en: 'Nashik APMC (Panchavati)',
      kn: 'ನಾಸಿಕ್ ಎಪಿಎಂಸಿ (ಪಂಚವಟಿ)',
      hi: 'नासिक एपीएमसी (पंचवटी)',
      mr: 'नाशिक कृषी उत्पन्न बाजार समिती (पंचवटी)',
    },
    state: 'Maharashtra',
    district: 'Nashik',
    location: {
      type: 'Point',
      coordinates: [73.8052, 20.0125],
    },
    address: 'Panchavati, Nashik, Maharashtra 422003',
    phone: '+91-253-2512345',
    isActive: true,
  },
];

export const SEED_COMMODITIES = [
  {
    code: 'tomato',
    names: {
      en: 'Tomato',
      kn: 'ಟೊಮೆಟೊ',
      hi: 'टमाटर',
      mr: 'टोमॅटो',
    },
    category: 'vegetable',
    defaultUnit: 'quintal',
    varieties: ['Local', 'Hybrid', 'Naati'],
  },
  {
    code: 'onion',
    names: {
      en: 'Onion',
      kn: 'ಈರುಳ್ಳಿ',
      hi: 'प्याज',
      mr: 'कांदा',
    },
    category: 'vegetable',
    defaultUnit: 'quintal',
    varieties: ['Red', 'White', 'Nasik Red'],
  },
  {
    code: 'potato',
    names: {
      en: 'Potato',
      kn: 'ಆಲೂಗಡ್ಡೆ',
      hi: 'आलू',
      mr: 'बटाटा',
    },
    category: 'vegetable',
    defaultUnit: 'quintal',
    varieties: ['Jyoti', 'Chandramukhi'],
  },
  {
    code: 'ragi',
    names: {
      en: 'Finger Millet (Ragi)',
      kn: 'ರಾಗಿ',
      hi: 'रागी (मडुआ)',
      mr: 'नाचणी (रागी)',
    },
    category: 'cereal',
    defaultUnit: 'quintal',
    varieties: ['Brown', 'ML-365'],
  },
  {
    code: 'rice',
    names: {
      en: 'Paddy / Rice',
      kn: 'ಭತ್ತ / ಅಕ್ಕಿ',
      hi: 'धान / चावल',
      mr: 'भात / तांदूळ',
    },
    category: 'cereal',
    defaultUnit: 'quintal',
    varieties: ['Sona Masuri', 'Basmati', 'IR-64'],
  },
];

export const SEED_TRANSPORTERS = [
  {
    name: 'Basavaraj Logistics',
    phone: '+91-9845012345',
    languages: ['Kannada', 'English', 'Hindi'],
    vehicleTypes: ['Tata Ace (1 Ton)', 'Canter (3.5 Ton)'],
    capacityKg: 3500,
    ratePerKm: 28,
    baseLocation: {
      type: 'Point',
      coordinates: [77.58, 12.97], // Near Bengaluru
    },
    serviceDistricts: ['Bengaluru Urban', 'Bengaluru Rural', 'Kolar'],
    serviceRadiusKm: 80,
    isVerified: true,
  },
  {
    name: 'Kolar Agro Transports',
    phone: '+91-9844056789',
    languages: ['Kannada', 'Telugu'],
    vehicleTypes: ['Tractor Trolley (4 Ton)', 'Bolero Pickup (1.5 Ton)'],
    capacityKg: 4000,
    ratePerKm: 24,
    baseLocation: {
      type: 'Point',
      coordinates: [78.13, 13.13], // Kolar
    },
    serviceDistricts: ['Kolar', 'Chikkaballapura', 'Bengaluru Rural'],
    serviceRadiusKm: 60,
    isVerified: true,
  },
  {
    name: 'Shree Ganesh Kisan Vahan (Pune)',
    phone: '+91-9822011223',
    languages: ['Marathi', 'Hindi'],
    vehicleTypes: ['Mahindra Bolero Maxi Truck (1.5 Ton)', 'Eicher 14 ft (6 Ton)'],
    capacityKg: 6000,
    ratePerKm: 32,
    baseLocation: {
      type: 'Point',
      coordinates: [73.86, 18.5], // Pune
    },
    serviceDistricts: ['Pune', 'Satara', 'Ahmednagar'],
    serviceRadiusKm: 100,
    isVerified: true,
  },
  {
    name: 'Nashik Kisan Express',
    phone: '+91-9890044556',
    languages: ['Marathi', 'Hindi'],
    vehicleTypes: ['Tata 407 (3 Ton)', 'Mini Truck (2 Ton)'],
    capacityKg: 3000,
    ratePerKm: 26,
    baseLocation: {
      type: 'Point',
      coordinates: [73.8, 20.0], // Nashik
    },
    serviceDistricts: ['Nashik', 'Dhule', 'Jalgaon'],
    serviceRadiusKm: 90,
    isVerified: true,
  },
];

// Helper to generate 180 days of realistic AGMARKNET historical prices
export const SEED_PRICE_HISTORY_DAYS = 180;

export function generatePriceHistory(days = SEED_PRICE_HISTORY_DAYS) {
  const prices = [];
  const basePrices = {
    tomato: { base: 2200, swing: 650, volatility: 90 },
    onion: { base: 2800, swing: 450, volatility: 60 },
    potato: { base: 1850, swing: 220, volatility: 40 },
    ragi: { base: 3450, swing: 160, volatility: 35 },
    rice: { base: 3950, swing: 280, volatility: 45 },
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For each commodity and mandi
  SEED_COMMODITIES.forEach((comm) => {
    const config = basePrices[comm.code] || { base: 2000, swing: 300, volatility: 50 };

    SEED_MANDIS.forEach((mandi, mandiIndex) => {
      // Mandi regional transportation & market yard differential
      const mandiOffset = (mandiIndex - 2) * 60;

      for (let dayOffset = days; dayOffset >= 0; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);

        // Multi-frequency wave simulating seasonal monsoon, harvest cycle, and bi-weekly market oscillations
        const primaryCycle = Math.sin((days - dayOffset) / 18) * config.swing;
        const secondaryCycle = Math.cos((days - dayOffset) / 7) * (config.swing * 0.25);
        // Mild long-term trend
        const longTermTrend = ((days - dayOffset) / days) * 120;
        // High frequency day-to-day noise
        const dayNoise = Math.sin(dayOffset * 3.7) * config.volatility;

        const modal = Math.max(
          500,
          Math.round(
            config.base +
              mandiOffset +
              primaryCycle +
              secondaryCycle +
              longTermTrend +
              dayNoise
          )
        );
        const min = Math.round(modal * 0.91);
        const max = Math.round(modal * 1.11);
        const arrivals = Math.round(
          Math.max(
            20,
            100 - (modal - config.base) * 0.05 + Math.sin(dayOffset * 1.5) * 25
          )
        );

        prices.push({
          mandiCode: mandi.code,
          commodityCode: comm.code,
          variety: comm.varieties[0] || 'Local',
          date: date.toISOString().split('T')[0],
          minPrice: min,
          maxPrice: max,
          modalPrice: modal,
          unit: 'quintal',
          arrivals,
          source: 'seed',
        });
      }
    });
  });

  return prices;
}
