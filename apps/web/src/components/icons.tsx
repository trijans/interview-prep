const PATHS: Record<string, string> = {
  logo: '<path d="M4 6h7M4 12h10M4 18h6"/><circle cx="18" cy="7" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M18 9.5v5"/>',
  home: '<path d="M3.5 11 12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  ds: '<path d="M12 3.5 21 8.5l-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  algo: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5v3a4 4 0 0 0 4 4h5.5"/>',
  problems: '<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><path d="m8 12.2 2.8 2.8L16 9.3"/>',
  system: '<rect x="9" y="3" width="6" height="5" rx="1.2"/><rect x="3" y="16" width="6" height="5" rx="1.2"/><rect x="15" y="16" width="6" height="5" rx="1.2"/><path d="M12 8v4M6 16v-2.5h12V16"/>',
  behavioral: '<path d="M4 5.5h16v10.5H10l-5 4v-4H4z"/><path d="M8 10h8"/>',
  technical: '<rect x="3" y="6.5" width="13.5" height="14" rx="2"/><path d="M7.5 3.5H19a2 2 0 0 1 2 2V17"/>',
  ai: '<path d="M11 3.5l1.9 4.9 4.9 1.9-4.9 1.9L11 17.1l-1.9-4.9-4.9-1.9 4.9-1.9z"/><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
};

export function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }}
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? '' }} />
  );
}
