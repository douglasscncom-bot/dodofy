import type { PokemonType } from '../types';

// Multipliers: 1.6 = super effective, 0.625 = not effective, 0.390625 = immune (0.625^2 in GO)
// Matrix: ATTACKING[type] deals X damage to DEFENDING[type]
export const TYPE_CHART: Record<PokemonType, Record<PokemonType, number>> = {
  Normal:   { Normal:1,     Fire:1,     Water:1,     Electric:1,     Grass:1,     Ice:1,     Fighting:1,     Poison:1,     Ground:1,     Flying:1,     Psychic:1,     Bug:1,     Rock:0.625, Ghost:0.390625, Dragon:1,     Dark:1,     Steel:0.625, Fairy:1     },
  Fire:     { Normal:1,     Fire:0.625, Water:0.625, Electric:1,     Grass:1.6,   Ice:1.6,   Fighting:1,     Poison:1,     Ground:1,     Flying:1,     Psychic:1,     Bug:1.6,   Rock:0.625, Ghost:1,       Dragon:0.625, Dark:1,     Steel:1.6,   Fairy:1     },
  Water:    { Normal:1,     Fire:1.6,   Water:0.625, Electric:1,     Grass:0.625, Ice:1,     Fighting:1,     Poison:1,     Ground:1.6,   Flying:1,     Psychic:1,     Bug:1,     Rock:1.6,   Ghost:1,       Dragon:0.625, Dark:1,     Steel:1,     Fairy:1     },
  Electric: { Normal:1,     Fire:1,     Water:1.6,   Electric:0.625, Grass:0.625, Ice:1,     Fighting:1,     Poison:1,     Ground:0.390625, Flying:1.6, Psychic:1,    Bug:1,     Rock:1,     Ghost:1,       Dragon:0.625, Dark:1,     Steel:1,     Fairy:1     },
  Grass:    { Normal:1,     Fire:0.625, Water:1.6,   Electric:1,     Grass:0.625, Ice:1,     Fighting:1,     Poison:0.625, Ground:1.6,   Flying:0.625, Psychic:1,     Bug:0.625, Rock:1.6,   Ghost:1,       Dragon:0.625, Dark:1,     Steel:0.625, Fairy:1     },
  Ice:      { Normal:1,     Fire:0.625, Water:0.625, Electric:1,     Grass:1.6,   Ice:0.625, Fighting:1,     Poison:1,     Ground:1.6,   Flying:1.6,   Psychic:1,     Bug:1,     Rock:1,     Ghost:1,       Dragon:1.6,   Dark:1,     Steel:0.625, Fairy:1     },
  Fighting: { Normal:1.6,   Fire:1,     Water:1,     Electric:1,     Grass:1,     Ice:1.6,   Fighting:1,     Poison:0.625, Ground:1,     Flying:0.625, Psychic:0.625, Bug:0.625, Rock:1.6,   Ghost:0.390625, Dragon:1,    Dark:1.6,   Steel:1.6,   Fairy:0.625 },
  Poison:   { Normal:1,     Fire:1,     Water:1,     Electric:1,     Grass:1.6,   Ice:1,     Fighting:1,     Poison:0.625, Ground:0.625, Flying:1,     Psychic:1,     Bug:1,     Rock:0.625, Ghost:0.625,   Dragon:1,     Dark:1,     Steel:0.390625, Fairy:1.6 },
  Ground:   { Normal:1,     Fire:1.6,   Water:1,     Electric:1.6,   Grass:0.625, Ice:1,     Fighting:1,     Poison:1.6,   Ground:1,     Flying:0.390625, Psychic:1,  Bug:0.625, Rock:1.6,   Ghost:1,       Dragon:1,     Dark:1,     Steel:1.6,   Fairy:1     },
  Flying:   { Normal:1,     Fire:1,     Water:1,     Electric:0.625, Grass:1.6,   Ice:1,     Fighting:1.6,   Poison:1,     Ground:1,     Flying:1,     Psychic:1,     Bug:1.6,   Rock:0.625, Ghost:1,       Dragon:1,     Dark:1,     Steel:0.625, Fairy:1     },
  Psychic:  { Normal:1,     Fire:1,     Water:1,     Electric:1,     Grass:1,     Ice:1,     Fighting:1.6,   Poison:1.6,   Ground:1,     Flying:1,     Psychic:0.625, Bug:1,     Rock:1,     Ghost:1,       Dragon:1,     Dark:0.390625, Steel:0.625, Fairy:1  },
  Bug:      { Normal:1,     Fire:0.625, Water:1,     Electric:1,     Grass:1.6,   Ice:1,     Fighting:0.625, Poison:0.625, Ground:1,     Flying:0.625, Psychic:1.6,   Bug:1,     Rock:1,     Ghost:0.625,   Dragon:1,     Dark:1.6,   Steel:0.625, Fairy:0.625 },
  Rock:     { Normal:1,     Fire:1.6,   Water:1,     Electric:1,     Grass:1,     Ice:1.6,   Fighting:0.625, Poison:1,     Ground:0.625, Flying:1.6,   Psychic:1,     Bug:1.6,   Rock:1,     Ghost:1,       Dragon:1,     Dark:1,     Steel:0.625, Fairy:1     },
  Ghost:    { Normal:0.390625, Fire:1,  Water:1,     Electric:1,     Grass:1,     Ice:1,     Fighting:0.390625, Poison:1,  Ground:1,     Flying:1,     Psychic:1.6,   Bug:1,     Rock:1,     Ghost:1.6,     Dragon:1,     Dark:0.625, Steel:1,     Fairy:1     },
  Dragon:   { Normal:1,     Fire:1,     Water:1,     Electric:1,     Grass:1,     Ice:1,     Fighting:1,     Poison:1,     Ground:1,     Flying:1,     Psychic:1,     Bug:1,     Rock:1,     Ghost:1,       Dragon:1.6,   Dark:1,     Steel:0.625, Fairy:0.390625 },
  Dark:     { Normal:1,     Fire:1,     Water:1,     Electric:1,     Grass:1,     Ice:1,     Fighting:0.625, Poison:1,     Ground:1,     Flying:1,     Psychic:1.6,   Bug:1,     Rock:1,     Ghost:1.6,     Dragon:1,     Dark:0.625, Steel:1,     Fairy:0.625 },
  Steel:    { Normal:1,     Fire:0.625, Water:0.625, Electric:0.625, Grass:1,     Ice:1.6,   Fighting:1,     Poison:1,     Ground:1,     Flying:1,     Psychic:1,     Bug:1,     Rock:1.6,   Ghost:1,       Dragon:1,     Dark:1,     Steel:0.625, Fairy:1.6   },
  Fairy:    { Normal:1,     Fire:0.625, Water:1,     Electric:1,     Grass:1,     Ice:1,     Fighting:1.6,   Poison:0.625, Ground:1,     Flying:1,     Psychic:1,     Bug:1,     Rock:1,     Ghost:1,       Dragon:1.6,   Dark:1.6,   Steel:0.625, Fairy:1     },
};

export function getDefensiveMultiplier(
  attackType: PokemonType,
  defType1: PokemonType,
  defType2?: PokemonType | null,
): number {
  const m1 = TYPE_CHART[attackType][defType1];
  const m2 = defType2 ? TYPE_CHART[attackType][defType2] : 1;
  return m1 * m2;
}

export function getTeamTypeVulnerabilities(
  pokemon: Array<{ type1: PokemonType; type2?: PokemonType | null }>,
): Record<PokemonType, number[]> {
  const result: Record<string, number[]> = {};
  const allTypes: PokemonType[] = [
    'Normal','Fire','Water','Electric','Grass','Ice',
    'Fighting','Poison','Ground','Flying','Psychic','Bug',
    'Rock','Ghost','Dragon','Dark','Steel','Fairy',
  ];
  for (const t of allTypes) {
    result[t] = pokemon.map(p => getDefensiveMultiplier(t, p.type1, p.type2));
  }
  return result as Record<PokemonType, number[]>;
}
