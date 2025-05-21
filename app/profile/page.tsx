'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Skill {
  id: string;
  name: string;
  description: string;
  levelRequired: number;
  prerequisites?: string[];
}

interface Class {
  id: string;
  name: string;
  description: string;
  skillTree: Skill[];
}

const classes: Class[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'A master of combat and physical prowess',
    skillTree: [
      {
        id: 'basic_attack',
        name: 'Basic Attack',
        description: 'A simple but effective attack',
        levelRequired: 1,
      },
      {
        id: 'heavy_strike',
        name: 'Heavy Strike',
        description: 'A powerful attack that deals increased damage',
        levelRequired: 5,
        prerequisites: ['basic_attack'],
      },
      // Add more skills as needed
    ],
  },
  // Add more classes as needed
];

export default function ProfilePage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [characterLevel, setCharacterLevel] = useState(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Character Profile</h1>
      
      {/* Class Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Select Your Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classOption) => (
            <motion.div
              key={classOption.id}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg border cursor-pointer ${
                selectedClass?.id === classOption.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedClass(classOption)}
            >
              <h3 className="text-xl font-semibold">{classOption.name}</h3>
              <p className="text-gray-600">{classOption.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skill Tree Display */}
      {selectedClass && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Skill Tree</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedClass.skillTree.map((skill) => (
              <motion.div
                key={skill.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border ${
                  characterLevel >= skill.levelRequired
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <h3 className="text-lg font-semibold">{skill.name}</h3>
                <p className="text-gray-600">{skill.description}</p>
                <p className="text-sm mt-2">
                  Required Level: {skill.levelRequired}
                </p>
                {skill.prerequisites && (
                  <p className="text-sm text-gray-500">
                    Prerequisites: {skill.prerequisites.join(', ')}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 