/**
 * UI strings in English and Hindi. Guide content is English in V1 — medical
 * translations must be reviewed by a qualified bilingual professional before
 * release, so they are not machine-generated here. Structure supports adding
 * more languages by adding a column.
 */
export type Lang = 'en' | 'hi';

const S = {
  tagline: { en: 'Everyday wisdom. Made useful.', hi: 'रोज़ का ज्ञान, सही तरीके से।' },
  whatHappened: { en: 'What happened?', hi: 'क्या हुआ?' },
  askPlaceholder: {
    en: 'Tell me what’s happening… e.g. “haath jal gaya thoda” or “my son has a mosquito bite”',
    hi: 'बताइए क्या हो रहा है… जैसे “हाथ थोड़ा जल गया” या “गले में खराश है”',
  },
  speak: { en: 'Speak', hi: 'बोलें' },
  showMe: { en: 'Show me', hi: 'फ़ोटो दिखाएँ' },
  ask: { en: 'Get guidance', hi: 'मार्गदर्शन पाएँ' },
  listening: { en: 'Listening… tap to stop', hi: 'सुन रहे हैं… रोकने के लिए टैप करें' },
  common: { en: 'Common situations', hi: 'आम स्थितियाँ' },
  exploreWisdom: { en: 'Explore wisdom', hi: 'ज्ञान देखें' },
  navHome: { en: 'Home', hi: 'होम' },
  navExplore: { en: 'Explore', hi: 'खोजें' },
  navWisdom: { en: 'Wisdom', hi: 'ज्ञान' },
  navSaved: { en: 'Saved', hi: 'सहेजे' },
  navProfile: { en: 'Profile', hi: 'प्रोफ़ाइल' },
  yourSituation: { en: 'Your situation', hi: 'आपकी स्थिति' },
  doNow: { en: 'What you can do now', hi: 'अभी आप क्या कर सकते हैं' },
  avoid: { en: 'Avoid', hi: 'इनसे बचें' },
  tradPractice: { en: 'Traditional practice', hi: 'पारंपरिक तरीका' },
  evidenceSays: { en: 'What the evidence says', hi: 'प्रमाण क्या कहते हैं' },
  watchFor: { en: 'Watch for', hi: 'इन पर नज़र रखें' },
  getHelp: { en: 'Get professional help if', hi: 'डॉक्टर से मिलें अगर' },
  why: { en: 'Why am I seeing this?', hi: 'यह क्यों दिख रहा है?' },
  save: { en: 'Save guide', hi: 'सहेजें' },
  saved: { en: 'Saved', hi: 'सहेजा गया' },
  readAloud: { en: 'Read aloud', hi: 'सुनें' },
  stopReading: { en: 'Stop', hi: 'रोकें' },
  startOver: { en: 'Start over', hi: 'फिर से शुरू करें' },
  helpful: { en: 'Was this helpful?', hi: 'क्या यह मददगार था?' },
  yes: { en: 'Yes', hi: 'हाँ' },
  no: { en: 'No', hi: 'नहीं' },
  disclaimer: {
    en: 'GharGyaan gives general information, not a diagnosis. It does not replace a doctor.',
    hi: 'GharGyaan सामान्य जानकारी देता है, निदान नहीं। यह डॉक्टर की जगह नहीं लेता।',
  },
  contentEnglish: {
    en: '',
    hi: 'गाइड की सामग्री अभी अंग्रेज़ी में है। चिकित्सा अनुवाद की विशेषज्ञ समीक्षा के बाद हिंदी में आएगी।',
  },
  demoMode: { en: 'Demo mode', hi: 'डेमो मोड' },
  liveMode: { en: 'Live AI', hi: 'लाइव AI' },
  emergencyNumbers: { en: 'Emergency numbers', hi: 'आपातकालीन नंबर' },
  questionOf: { en: 'Question', hi: 'प्रश्न' },
  of: { en: 'of', hi: 'में से' },
} as const;

export type StringKey = keyof typeof S;

export function t(key: StringKey, lang: Lang): string {
  return S[key][lang] || S[key].en;
}
