// Monogram avatars for clients and candidates. The colour is derived from the
// name so it's stable across renders and needs no stored asset — same name
// always yields the same tint. Palette is drawn from the app's warm brand
// family plus a few complementary hues so rows stay visually distinct without
// clashing with the amber/brown theme.

export interface AvatarStyle {
  bg: string;
  fg: string;
}

const AVATAR_PALETTE: AvatarStyle[] = [
  { bg: '#f5e6cc', fg: '#7a4f00' }, // amber
  { bg: '#e2f1e8', fg: '#245c3f' }, // green
  { bg: '#e6ecf4', fg: '#29405c' }, // slate
  { bg: '#f7e2df', fg: '#a3392e' }, // clay
  { bg: '#efe6f5', fg: '#5a3a7a' }, // plum
  { bg: '#dcedf0', fg: '#1f5a63' }, // teal
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarStyle(name: string): AvatarStyle {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
