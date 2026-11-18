import { ACCENTS, settingsStore, useSettings, type AccentName } from '@/state/settings';

export function ThemeButton() {
  const { theme } = useSettings();
  return <button className="theme-btn" onClick={settingsStore.toggleTheme}>{theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}</button>;
}

export function AccentSwatches() {
  const { accent } = useSettings();
  return (
    <div className="swatches" role="radiogroup" aria-label="Accent colour">
      {(Object.keys(ACCENTS) as AccentName[]).map((k) => (
        <button key={k} className="swatch" role="radio" aria-checked={accent === k} aria-label={ACCENTS[k][0]} title={ACCENTS[k][0]}
          style={{ ['--sw' as string]: ACCENTS[k][1] }} onClick={() => settingsStore.setAccent(k)} />
      ))}
    </div>
  );
}
