/**
 * Inline suit icons (same paths as `public/icons/{heart,club,diamond}-svgrepo-com.svg`), tinted via `.suit-symbol--*` currentColor.
 * `public/icons/spade-svgrepo-com.svg` is available if we add a spade stat later.
 */

function escapeAttr(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

const HEART_D =
    'M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z';

const CLUB_D =
    'M12 4C12 4.25656 11.9758 4.50748 11.9297 4.75061C11.9531 4.75021 11.9765 4.75 12 4.75C14.2091 4.75 16 6.54086 16 8.75C16 10.9591 14.2091 12.75 12 12.75C10.7347 12.75 9.60658 12.1625 8.87361 11.2454L10 15V16H6V15L7.12639 11.2454C6.39342 12.1625 5.26532 12.75 4 12.75C1.79086 12.75 0 10.9591 0 8.75C0 6.54086 1.79086 4.75 4 4.75C4.02349 4.75 4.04692 4.7502 4.07031 4.75061C4.02415 4.50748 4 4.25656 4 4C4 1.79086 5.79086 0 8 0C10.2091 0 12 1.79086 12 4Z';

const DIAMOND_D = 'M1 8L7 0H9L15 8L9 16H7L1 8Z';

function suitSvgInner(pathD: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d="${pathD}" fill="currentColor"/></svg>`;
}

export const heartSuitSvgInner = suitSvgInner(HEART_D);
export const clubSuitSvgInner = suitSvgInner(CLUB_D);
export const diamondSuitSvgInner = suitSvgInner(DIAMOND_D);

export type SuitStatModifier = 'damage' | 'health' | 'mana-diamonds';

export function wrapSuitStat(
    modifier: SuitStatModifier,
    title: string | undefined,
    innerSvg: string
): string {
    const t = title ? ` title="${escapeAttr(title)}"` : '';
    return `<span class="suit-symbol suit-symbol--${modifier}"${t}>${innerSvg}</span>`;
}

/** For {@link import("./damageSymbol").formatStatSymbols} and other v-html. */
export const damageSuitIconHtml = wrapSuitStat('damage', 'Damage', clubSuitSvgInner);

export const manaDiamondSuitIconHtml = wrapSuitStat('mana-diamonds', 'Mana Diamonds', diamondSuitSvgInner);

export const healthSuitIconHtml = wrapSuitStat('health', 'Health', heartSuitSvgInner);
