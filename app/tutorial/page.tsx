'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

type TutorialStep = {
  title: string;
  content: string;
  image: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to RL Hero",
    content: "Transform your real-life activities into a fantasy adventure. Complete daily tasks to level up, earn items, and unlock achievements in this productivity game.",
    image: "/images/tutorial/welcome.png"
  },
  {
    title: "Daily Quests",
    content: "Add your daily tasks as quests. Each completed quest earns you XP and helps improve your character's stats and skills.",
    image: "/images/tutorial/quests.png"
  },
  {
    title: "Skill Development",
    content: "Real-life activities are mapped to in-game skills. Study to increase Intelligence, exercise to boost Strength, socialize to improve Charisma, and more!",
    image: "/images/tutorial/skills.png"
  },
  {
    title: "Achievements & Titles",
    content: "Earn achievements by maintaining streaks or reaching milestones. Special titles are unlocked as you progress in different skill areas.",
    image: "/images/tutorial/achievements.png"
  },
  {
    title: "Solo or Competitive",
    content: "Play solo to focus on your personal growth, or join competitive mode to team up with friends and challenge others on leaderboards.",
    image: "/images/tutorial/party.png"
  }
]

export default function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0)
  
  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const step = TUTORIAL_STEPS[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-dark flex items-center justify-center p-4">
      <motion.div 
        key={currentStep}
        className="w-full max-w-4xl bg-dark/70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-6 md:p-8">
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8 px-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <div 
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-accent-500 w-full' : 'bg-gray-700 w-full'
                }`}
              />
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Tutorial Image (placeholder) */}
            <div className="w-full md:w-1/2 h-64 md:h-80 bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-sm">Image placeholder: {step.image}</p>
            </div>
            
            {/* Tutorial Content */}
            <div className="w-full md:w-1/2 flex flex-col">
              <h2 className="text-2xl md:text-3xl font-display text-white mb-4">{step.title}</h2>
              <p className="text-gray-300 mb-6 flex-grow">{step.content}</p>
              
              <div className="flex justify-between mt-8">
                <button 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`btn px-6 ${
                    currentStep === 0 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>
                
                {currentStep < TUTORIAL_STEPS.length - 1 ? (
                  <button 
                    onClick={nextStep}
                    className="btn btn-primary px-6"
                  >
                    Next
                  </button>
                ) : (
                  <Link href="/dashboard" className="btn btn-accent px-6">
                    Start Your Journey
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 