import { AVATAR_COLORS, AVATAR_ICONS, randomAvatar } from './avatar';

describe('randomAvatar', () => {
  it('avoids icons and colors already in use when alternatives are available', () => {
    const usedIcons = AVATAR_ICONS.slice(0, -1);
    const usedColors = AVATAR_COLORS.slice(0, -1);

    const avatar = randomAvatar(usedIcons, usedColors);

    expect(usedIcons).not.toContain(avatar.icon);
    expect(usedColors).not.toContain(avatar.color);
  });

  it('cycles back through the pool once every icon/color is already used', () => {
    const avatar = randomAvatar(AVATAR_ICONS, AVATAR_COLORS);

    expect(AVATAR_ICONS).toContain(avatar.icon);
    expect(AVATAR_COLORS).toContain(avatar.color);
  });
});
