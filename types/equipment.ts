import { Character } from '@/store/userStore'

export type EquipmentSlot = 'helm' | 'top' | 'bottom' | 'secondary' | 'weapon' | 'gloves' | 'shoes' | 'pendant' | 'consumable'

export type EquipmentStats = {
  strength?: number
  intelligence?: number
  dexterity?: number
  wisdom?: number
  constitution?: number
  charisma?: number
  damage?: number
  defense?: number
  magicDefense?: number
  criticalChance?: number
  dodgeChance?: number
}

export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type Equipment = {
  id: string
  name: string
  type: EquipmentSlot
  rarity: EquipmentRarity
  level: number
  stats: EquipmentStats
  description: string
  image: string
  set?: string // Name of the set this piece belongs to
  price: number // Price in gold
}

export type ArmorSet = {
  name: string
  pieces: string[] // Equipment IDs that belong to this set
  bonuses: {
    [key: number]: EquipmentStats // Number represents how many pieces are needed for the bonus
  }
  description: string
}

// Example armor sets
export const ARMOR_SETS: ArmorSet[] = [
  {
    name: "Dragon Knight's Regalia",
    pieces: ["dragon-helmet", "dragon-chest", "dragon-gauntlets", "dragon-boots"],
    bonuses: {
      2: {
        strength: 5,
        constitution: 5
      },
      4: {
        damage: 10,
        defense: 15,
        criticalChance: 5
      }
    },
    description: "Forged from the scales of ancient dragons, this set provides immense power and protection."
  },
  {
    name: "Mystic Sage's Attire",
    pieces: ["sage-hat", "sage-robe", "sage-gloves", "sage-shoes"],
    bonuses: {
      2: {
        intelligence: 5,
        wisdom: 5
      },
      4: {
        magicDefense: 15,
        dodgeChance: 5
      }
    },
    description: "Woven with enchanted threads, this set enhances magical abilities and provides mystical protection."
  },
  {
    name: "Shadow Assassin's Garb",
    pieces: ["assassin-hood", "assassin-armor", "assassin-gloves", "assassin-boots"],
    bonuses: {
      2: {
        dexterity: 5,
        dodgeChance: 3
      },
      4: {
        criticalChance: 10,
        damage: 8
      }
    },
    description: "Designed for stealth and precision, this set enhances agility and critical strikes."
  }
]

// Helper function to calculate total stats from equipment
export const calculateEquipmentStats = (equipment: Equipment[]): EquipmentStats => {
  return equipment.reduce((total, item) => {
    Object.entries(item.stats).forEach(([stat, value]) => {
      if (value) {
        total[stat as keyof EquipmentStats] = (total[stat as keyof EquipmentStats] || 0) + value
      }
    })
    return total
  }, {} as EquipmentStats)
}

// Helper function to calculate set bonuses
export const calculateSetBonuses = (equipment: Equipment[]): EquipmentStats => {
  const setBonuses: EquipmentStats = {}
  
  // Group equipment by set
  const equipmentBySet = equipment.reduce((acc, item) => {
    if (item.set) {
      acc[item.set] = (acc[item.set] || []).concat(item)
    }
    return acc
  }, {} as { [key: string]: Equipment[] })

  // Calculate bonuses for each set
  Object.entries(equipmentBySet).forEach(([setName, pieces]) => {
    const set = ARMOR_SETS.find(s => s.name === setName)
    if (set) {
      Object.entries(set.bonuses).forEach(([pieceCount, bonus]) => {
        if (pieces.length >= parseInt(pieceCount)) {
          Object.entries(bonus).forEach(([stat, value]) => {
            if (value) {
              setBonuses[stat as keyof EquipmentStats] = (setBonuses[stat as keyof EquipmentStats] || 0) + value
            }
          })
        }
      })
    }
  })

  return setBonuses
}

export const ALL_EQUIPMENT: Equipment[] = [
  {
    id: 'mystic-blade',
    name: 'Mystic Blade',
    type: 'weapon',
    rarity: 'rare',
    level: 10,
    stats: {
      strength: 5,
      intelligence: 3,
      damage: 8
    },
    description: 'A sword imbued with ancient magic. Increases strength and intelligence.',
    image: '/images/fire-emblem/weapon-1.png',
    price: 500
  },
  {
    id: 'flame-sword',
    name: 'Flame Sword',
    type: 'weapon',
    rarity: 'epic',
    level: 15,
    stats: {
      strength: 6,
      damage: 12,
      criticalChance: 3
    },
    description: 'A sword wreathed in eternal flames. Deals additional fire damage.',
    image: '/images/fire-emblem/weapon-2.png',
    price: 1000
  },
  {
    id: 'storm-bow',
    name: 'Storm Bow',
    type: 'secondary',
    rarity: 'rare',
    level: 12,
    stats: {
      dexterity: 7,
      damage: 9,
      dodgeChance: 2
    },
    description: 'A bow that harnesses the power of storms. Increases accuracy and critical chance.',
    image: '/images/fire-emblem/weapon-3.png',
    price: 750
  },
  {
    id: 'arcane-staff',
    name: 'Arcane Staff',
    type: 'weapon',
    rarity: 'epic',
    level: 15,
    stats: {
      intelligence: 8,
      wisdom: 5,
      damage: 10
    },
    description: 'A staff imbued with powerful arcane magic. Enhances spell damage.',
    image: '/images/fire-emblem/weapon-4.png',
    price: 1200
  },
  {
    id: 'dragon-helmet',
    name: "Dragon Knight's Helmet",
    type: 'helm',
    rarity: 'epic',
    level: 15,
    stats: {
      constitution: 4,
      defense: 6
    },
    description: "Part of the Dragon Knight's Regalia set. Provides excellent protection.",
    image: '/images/fire-emblem/armor-1.png',
    set: "Dragon Knight's Regalia",
    price: 800
  },
  {
    id: 'dragon-chest',
    name: "Dragon Knight's Chestplate",
    type: 'top',
    rarity: 'epic',
    level: 15,
    stats: {
      strength: 3,
      constitution: 5,
      defense: 8
    },
    description: "Part of the Dragon Knight's Regalia set. Provides excellent protection.",
    image: '/images/fire-emblem/armor-2.png',
    set: "Dragon Knight's Regalia",
    price: 1000
  },
  {
    id: 'sage-hat',
    name: "Mystic Sage's Hat",
    type: 'helm',
    rarity: 'epic',
    level: 15,
    stats: {
      intelligence: 4,
      wisdom: 3,
      magicDefense: 5
    },
    description: "Part of the Mystic Sage's Attire set. Enhances magical abilities.",
    image: '/images/fire-emblem/armor-3.png',
    set: "Mystic Sage's Attire",
    price: 800
  },
  {
    id: 'assassin-hood',
    name: "Shadow Assassin's Hood",
    type: 'helm',
    rarity: 'epic',
    level: 15,
    stats: {
      dexterity: 4,
      dodgeChance: 3,
      criticalChance: 2
    },
    description: "Part of the Shadow Assassin's Garb set. Enhances stealth and critical strikes.",
    image: '/images/fire-emblem/armor-4.png',
    set: "Shadow Assassin's Garb",
    price: 800
  },
  {
    id: 'wisdom-amulet',
    name: 'Wisdom Amulet',
    type: 'pendant',
    rarity: 'rare',
    level: 10,
    stats: {
      wisdom: 5,
      intelligence: 3,
      magicDefense: 4
    },
    description: 'An amulet that enhances your magical abilities.',
    image: '/images/fire-emblem/accessory-1.png',
    price: 600
  },
  {
    id: 'berserker-ring',
    name: 'Berserker Ring',
    type: 'accessory',
    rarity: 'epic',
    level: 15,
    stats: {
      strength: 6,
      damage: 5,
      criticalChance: 4
    },
    description: 'A ring that channels the fury of ancient warriors. Increases physical damage.',
    image: '/images/fire-emblem/accessory-2.png',
    price: 900
  },
  {
    id: 'shadow-cloak',
    name: 'Shadow Cloak',
    type: 'top',
    rarity: 'rare',
    level: 12,
    stats: {
      dexterity: 5,
      dodgeChance: 4,
      criticalChance: 3
    },
    description: 'A cloak woven with shadows. Enhances stealth and evasion.',
    image: '/images/fire-emblem/accessory-3.png',
    price: 700
  },
  {
    id: 'healing-pendant',
    name: 'Healing Pendant',
    type: 'pendant',
    rarity: 'uncommon',
    level: 8,
    stats: {
      constitution: 4,
      wisdom: 3
    },
    description: 'A pendant that enhances natural healing abilities.',
    image: '/images/fire-emblem/accessory-4.png',
    price: 400
  },
  {
    id: 'health-potion',
    name: 'Health Potion',
    type: 'consumable',
    rarity: 'common',
    level: 1,
    stats: {
      constitution: 10
    },
    description: 'Restores 50 HP when consumed.',
    image: '/images/fire-emblem/potion-1.png',
    price: 50
  },
  {
    id: 'mana-potion',
    name: 'Mana Potion',
    type: 'consumable',
    rarity: 'common',
    level: 1,
    stats: {
      intelligence: 10
    },
    description: 'Restores 30 MP when consumed.',
    image: '/images/fire-emblem/potion-2.png',
    price: 50
  },
  {
    id: 'strength-elixir',
    name: 'Strength Elixir',
    type: 'consumable',
    rarity: 'uncommon',
    level: 5,
    stats: {
      strength: 5
    },
    description: 'Temporarily increases strength by 5 for 1 hour.',
    image: '/images/fire-emblem/potion-3.png',
    price: 150
  },
  {
    id: 'magic-scroll',
    name: 'Magic Scroll',
    type: 'consumable',
    rarity: 'rare',
    level: 10,
    stats: {
      intelligence: 8,
      wisdom: 5
    },
    description: 'Teaches a new spell when used.',
    image: '/images/fire-emblem/scroll-1.png',
    price: 300
  }
]; 