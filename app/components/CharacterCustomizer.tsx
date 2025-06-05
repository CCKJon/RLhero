import { useState } from 'react';
import { useSpriteRecolor } from '../utils/spriteRecolor';

interface CharacterCustomizerProps {
  baseImageUrl: string;
  onColorChange?: (colorMappings: {
    skinTone: Array<{ original: string; replacement: string }>;
    hairColor: Array<{ original: string; replacement: string }>;
    eyeColor: Array<{ original: string; replacement: string }>;
  }) => void;
}

// Predefined color mappings
const SKIN_TONE_MAPPINGS = {
  light: [
    { original: '#FFD3B6', replacement: '#FFD3B6' }, // Original light skin tone
    { original: '#FFBEA3', replacement: '#FFBEA3' }, // Light skin shadow
  ],
  medium: [
    { original: '#FFD3B6', replacement: '#E6B8A2' }, // Medium skin tone
    { original: '#FFBEA3', replacement: '#D4A08C' }, // Medium skin shadow
  ],
  tan: [
    { original: '#FFD3B6', replacement: '#D4A08C' }, // Tan skin tone
    { original: '#FFBEA3', replacement: '#B88A76' }, // Tan skin shadow
  ],
  dark: [
    { original: '#FFD3B6', replacement: '#B88A76' }, // Dark skin tone
    { original: '#FFBEA3', replacement: '#8B6B5D' }, // Dark skin shadow
  ],
};

const HAIR_COLOR_MAPPINGS = {
  black: [
    { original: '#8B4513', replacement: '#000000' }, // Base hair color
    { original: '#6B3410', replacement: '#1A1A1A' }, // Hair shadow
  ],
  brown: [
    { original: '#8B4513', replacement: '#8B4513' }, // Base hair color
    { original: '#6B3410', replacement: '#6B3410' }, // Hair shadow
  ],
  blonde: [
    { original: '#8B4513', replacement: '#FFD700' }, // Base hair color
    { original: '#6B3410', replacement: '#DAA520' }, // Hair shadow
  ],
  red: [
    { original: '#8B4513', replacement: '#A52A2A' }, // Base hair color
    { original: '#6B3410', replacement: '#8B0000' }, // Hair shadow
  ],
  white: [
    { original: '#8B4513', replacement: '#FFFFFF' }, // Base hair color
    { original: '#6B3410', replacement: '#E0E0E0' }, // Hair shadow
  ],
};

const EYE_COLOR_MAPPINGS = {
  brown: [
    { original: '#4A4A4A', replacement: '#8B4513' }, // Base eye color
    { original: '#2A2A2A', replacement: '#6B3410' }, // Eye shadow
  ],
  blue: [
    { original: '#4A4A4A', replacement: '#4169E1' }, // Base eye color
    { original: '#2A2A2A', replacement: '#0000CD' }, // Eye shadow
  ],
  green: [
    { original: '#4A4A4A', replacement: '#228B22' }, // Base eye color
    { original: '#2A2A2A', replacement: '#006400' }, // Eye shadow
  ],
  hazel: [
    { original: '#4A4A4A', replacement: '#B8860B' }, // Base eye color
    { original: '#2A2A2A', replacement: '#8B4513' }, // Eye shadow
  ],
  purple: [
    { original: '#4A4A4A', replacement: '#800080' }, // Base eye color
    { original: '#2A2A2A', replacement: '#4B0082' }, // Eye shadow
  ],
};

export default function CharacterCustomizer({ baseImageUrl, onColorChange }: CharacterCustomizerProps) {
  const [selectedTone, setSelectedTone] = useState<keyof typeof SKIN_TONE_MAPPINGS>('light');
  const [selectedHair, setSelectedHair] = useState<keyof typeof HAIR_COLOR_MAPPINGS>('brown');
  const [selectedEyes, setSelectedEyes] = useState<keyof typeof EYE_COLOR_MAPPINGS>('brown');
  
  // Combine all color mappings
  const colorMappings = [
    ...SKIN_TONE_MAPPINGS[selectedTone],
    ...HAIR_COLOR_MAPPINGS[selectedHair],
    ...EYE_COLOR_MAPPINGS[selectedEyes],
  ];
  
  // Use the sprite recolor hook
  const recoloredImage = useSpriteRecolor(baseImageUrl, {
    colorMappings,
    tolerance: 5, // Add some tolerance for smoother color transitions
  });

  const handleToneChange = (tone: keyof typeof SKIN_TONE_MAPPINGS) => {
    setSelectedTone(tone);
    updateColorMappings(tone, selectedHair, selectedEyes);
  };

  const handleHairChange = (color: keyof typeof HAIR_COLOR_MAPPINGS) => {
    setSelectedHair(color);
    updateColorMappings(selectedTone, color, selectedEyes);
  };

  const handleEyeChange = (color: keyof typeof EYE_COLOR_MAPPINGS) => {
    setSelectedEyes(color);
    updateColorMappings(selectedTone, selectedHair, color);
  };

  const updateColorMappings = (
    tone: keyof typeof SKIN_TONE_MAPPINGS,
    hair: keyof typeof HAIR_COLOR_MAPPINGS,
    eyes: keyof typeof EYE_COLOR_MAPPINGS
  ) => {
    onColorChange?.({
      skinTone: SKIN_TONE_MAPPINGS[tone],
      hairColor: HAIR_COLOR_MAPPINGS[hair],
      eyeColor: EYE_COLOR_MAPPINGS[eyes],
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Character Preview */}
      <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-primary-500">
        {recoloredImage ? (
          <img
            src={recoloredImage}
            alt="Character Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        )}
      </div>

      {/* Color Selectors */}
      <div className="space-y-6 w-full">
        {/* Skin Tone Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skin Tone
          </label>
          <div className="flex gap-4">
            {Object.keys(SKIN_TONE_MAPPINGS).map((tone) => (
              <button
                key={tone}
                onClick={() => handleToneChange(tone as keyof typeof SKIN_TONE_MAPPINGS)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedTone === tone
                    ? 'border-primary-500 scale-110'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                style={{
                  backgroundColor: SKIN_TONE_MAPPINGS[tone as keyof typeof SKIN_TONE_MAPPINGS][0].replacement,
                }}
                title={`${tone.charAt(0).toUpperCase() + tone.slice(1)} skin tone`}
              />
            ))}
          </div>
        </div>

        {/* Hair Color Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hair Color
          </label>
          <div className="flex gap-4">
            {Object.keys(HAIR_COLOR_MAPPINGS).map((color) => (
              <button
                key={color}
                onClick={() => handleHairChange(color as keyof typeof HAIR_COLOR_MAPPINGS)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedHair === color
                    ? 'border-primary-500 scale-110'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                style={{
                  backgroundColor: HAIR_COLOR_MAPPINGS[color as keyof typeof HAIR_COLOR_MAPPINGS][0].replacement,
                }}
                title={`${color.charAt(0).toUpperCase() + color.slice(1)} hair`}
              />
            ))}
          </div>
        </div>

        {/* Eye Color Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Eye Color
          </label>
          <div className="flex gap-4">
            {Object.keys(EYE_COLOR_MAPPINGS).map((color) => (
              <button
                key={color}
                onClick={() => handleEyeChange(color as keyof typeof EYE_COLOR_MAPPINGS)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedEyes === color
                    ? 'border-primary-500 scale-110'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                style={{
                  backgroundColor: EYE_COLOR_MAPPINGS[color as keyof typeof EYE_COLOR_MAPPINGS][0].replacement,
                }}
                title={`${color.charAt(0).toUpperCase() + color.slice(1)} eyes`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 