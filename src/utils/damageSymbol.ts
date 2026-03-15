/**
 * Replaces "damage" with green club (♣) in displayed text. "block" is left as the word.
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
const MANA_DIAMOND_SYMBOL = '<span class="suit-symbol suit-symbol--mana-diamonds" title="♦ Mana Diamonds">♦</span>';

/** Replaces "damage" with ♣, "mana diamonds" / "mana diamond" with ♦. Use with v-html. */
export function formatStatSymbols(text: string): string {
    const escaped = escapeHtml(text);
    return escaped
        .replace(/\bdamage\b/gi, DAMAGE_SYMBOL)
        .replace(/\bmana diamonds\b/gi, MANA_DIAMOND_SYMBOL)
        .replace(/\bmana diamond\b/gi, MANA_DIAMOND_SYMBOL);
}
