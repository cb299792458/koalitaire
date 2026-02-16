export const DamageType = {
    Ranged: 'ranged',
    Magic: 'magic',
    Backstab: 'backstab',
    Aoe: 'aoe',
    Piercing: 'piercing',
} as const;

export type DamageType = (typeof DamageType)[keyof typeof DamageType];
