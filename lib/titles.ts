export type TitleBonus = {
  name: string
  description: string
  statBonus: {
    strength?: number
    intelligence?: number
    dexterity?: number
    wisdom?: number
    constitution?: number
    charisma?: number
  }
  xpBonus?: number
}

export const TITLE_BONUSES: Record<string, TitleBonus> = {
  "Novice Adventurer": {
    name: "Novice Adventurer",
    description: "Your first step into the world of adventure",
    statBonus: {
      strength: 1,
      intelligence: 1,
      dexterity: 1
    },
    xpBonus: 5
  },
  "Master of the Blade": {
    name: "Master of the Blade",
    description: "Awarded for reaching level 10 in any combat skill",
    statBonus: {
      strength: 3,
      dexterity: 2
    },
    xpBonus: 10
  },
  "Arcane Scholar": {
    name: "Arcane Scholar",
    description: "Awarded for mastering three magic skills",
    statBonus: {
      intelligence: 3,
      wisdom: 2
    },
    xpBonus: 10
  },
  "Guild Leader": {
    name: "Guild Leader",
    description: "Awarded for leading a successful party",
    statBonus: {
      charisma: 3,
      wisdom: 2
    },
    xpBonus: 15
  },
  "Legendary Hero": {
    name: "Legendary Hero",
    description: "The highest honor for completing all major quests",
    statBonus: {
      strength: 2,
      intelligence: 2,
      dexterity: 2,
      wisdom: 2,
      constitution: 2,
      charisma: 2
    },
    xpBonus: 20
  }
} 