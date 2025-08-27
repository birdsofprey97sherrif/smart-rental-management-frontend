import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <select className="form-select form-select-sm w-auto" value={language} onChange={handleChange}>
      <option value="en">🌍 English</option>
      <option value="sw">🇰🇪 Swahili</option>
      <option value="fr">🇫🇷 French</option>
    </select>
  );
}
