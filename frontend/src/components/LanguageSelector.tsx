import React from 'react';
import { Language } from '../types';

const LANGS: { code: Language; label: string }[] = [
  { code: 'EN', label: 'English' },
  { code: 'ZH', label: 'Chinese' },
  { code: 'KO', label: 'Korean' },
  { code: 'JA', label: 'Japanese' },
];

type Props = {
  value: Language;
  onChange: (lang: Language) => void;
};

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <select
      className="border px-2 py-1 rounded"
      value={value}
      onChange={e => onChange(e.target.value as Language)}
    >
      {LANGS.map(l => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
