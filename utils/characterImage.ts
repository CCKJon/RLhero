import { Race, Gender } from '@/store/userStore'

/**
 * Determines the appropriate character image path based on race and gender
 * For non-binary users, uses 50/50 RNG to select between male and female
 */
export function getCharacterImagePath(race: Race, gender: Gender): string {
  let effectiveGender = gender
  
  // For non-binary users, randomly select male or female
  if (gender === 'non-binary') {
    effectiveGender = Math.random() < 0.5 ? 'male' : 'female'
  }
  
  return `/images/fire-emblem/character-${race}-${effectiveGender}.png`
}

/**
 * Gets a deterministic character image path for non-binary users
 * Uses a seed (like user ID) to ensure consistent results
 */
export function getCharacterImagePathWithSeed(race: Race, gender: Gender, seed?: string): string {
  let effectiveGender = gender
  
  // For non-binary users, use seed to determine gender consistently
  if (gender === 'non-binary') {
    if (seed) {
      // Simple hash function to convert seed to number
      let hash = 0
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      effectiveGender = Math.abs(hash) % 2 === 0 ? 'male' : 'female'
    } else {
      // Fallback to random if no seed provided
      effectiveGender = Math.random() < 0.5 ? 'male' : 'female'
    }
  }
  
  return `/images/fire-emblem/character-${race}-${effectiveGender}.png`
} 