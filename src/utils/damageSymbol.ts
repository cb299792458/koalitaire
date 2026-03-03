/**
 * Replaces "damage" with green club (♣) and "block" with upside-down spade (♠) in displayed text.
 * Returns HTML string; use with v-html. Escapes existing HTML in the text.
 */
function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const DAMAGE_SYMBOL = '<span class="suit-symbol suit-symbol--damage">♣</span>';
const BLOCK_SYMBOL = '<span class="suit-symbol suit-symbol--block">♠</span>';

/** Replaces "damage" with ♣ and "block" with ♠. Use with v-html. */
export function formatStatSymbols(text: string): string {
    const escaped = escapeHtml(text);
    return escaped
        .replace(/\bblock\b/gi, BLOCK_SYMBOL)
        .replace(/\bdamage\b/gi, DAMAGE_SYMBOL);
}

/** @deprecated Use formatStatSymbols for both damage and block. */
export function textWithDamageSymbol(text: string): string {
    return formatStatSymbols(text);
}
