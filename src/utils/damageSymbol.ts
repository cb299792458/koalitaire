import { damageSuitIconHtml, manaDiamondSuitIconHtml } from './suitUiSymbols';

/**
 * Replaces "damage" with a club suit icon, "block" with a gray shield icon (optional), and mana diamond phrases with a diamond suit icon.
 * Returns HTML string; use with v-html. Escapes existing HTML in the text.
 */
function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const DAMAGE_SYMBOL = damageSuitIconHtml;
const MANA_DIAMOND_SYMBOL = manaDiamondSuitIconHtml;

/** Same geometry as `public/icons/shield-minimalistic-svgrepo-com.svg`; color from `.suit-symbol--block` (currentColor). */
const SHIELD_PATH_D =
    'M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 17.6294 16.761 20.3655 14.1014 21.5273C13.38 21.8424 13.0193 22 12 22C10.9807 22 10.62 21.8424 9.89856 21.5273C7.23896 20.3655 3 17.6294 3 11.9914C3 11.4234 3 10.8996 3 10.4167Z';

/** Shield path only (wrap with `.suit-symbol.suit-symbol--block` when using outside {@link BLOCK_STAT_SYMBOL_HTML}). */
export const BLOCK_SHIELD_SVG_INNER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="${SHIELD_PATH_D}" fill="currentColor"/></svg>`;

/** Inline shield for block stat / word “block” in formatted text (same visual size as other suit-symbol glyphs). */
export const BLOCK_STAT_SYMBOL_HTML = `<span class="suit-symbol suit-symbol--block" title="Block">${BLOCK_SHIELD_SVG_INNER}</span>`;

const BLOCK_SYMBOL = BLOCK_STAT_SYMBOL_HTML;

export interface FormatStatSymbolsOptions {
    /** When false, the word "block" is left as text (e.g. spell card titles). Default true. */
    replaceBlock?: boolean;
}

/** Replaces "damage" / "mana diamond(s)" with suit SVGs; "block" with shield (unless disabled). Use with v-html. */
export function formatStatSymbols(text: string, options?: FormatStatSymbolsOptions): string {
    const replaceBlock = options?.replaceBlock !== false;
    const escaped = escapeHtml(text);
    let out = escaped.replace(/\bdamage\b/gi, DAMAGE_SYMBOL);
    if (replaceBlock) {
        out = out.replace(/\bblock\b/gi, BLOCK_SYMBOL);
    }
    return out
        .replace(/\bmana diamonds\b/gi, MANA_DIAMOND_SYMBOL)
        .replace(/\bmana diamond\b/gi, MANA_DIAMOND_SYMBOL);
}
