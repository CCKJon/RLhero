# RL Hero - Level Up Your Life

A productivity app that transforms your real-life daily tasks into a fantasy RPG adventure. Complete tasks, gain experience, level up, and unlock new abilities and items in a Japanese fantasy-inspired game world.

![RL Hero](https://example.com/preview.png)

## Features

- **Character Creation**: Create and customize your in-game hero with different races, genders, and appearances
- **Daily Quests**: Track your real-life tasks as quests that earn you XP and rewards
- **Skill Development**: Map real-life activities to in-game skills and stats
- **Achievements System**: Earn titles and achievements by maintaining streaks and reaching milestones
- **Solo or Competitive Mode**: Play alone or compete with friends on leaderboards
- **Party System**: Form guilds/parties with friends to tackle challenges together
- **Limited-Time Events**: Participate in special events for bonus rewards

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rlhero.git
   cd rlhero
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
rl-hero/
├── app/                # Next.js app directory
│   ├── dashboard/      # Dashboard page
│   ├── login/          # Login page
│   ├── party/          # Party/guild system
│   ├── register/       # User registration and character creation
│   └── tutorial/       # Onboarding tutorial
├── components/         # Reusable components
├── lib/                # Utility functions and hooks
├── public/             # Static assets
└── store/              # Zustand state management
```

## Customization

You can customize the app by modifying the following:

- **Theme**: Edit the colors in `tailwind.config.js`
- **Quests**: Add more quest templates in the dashboard page
- **Skills**: Define new skills in the character system
- **Achievements**: Create custom achievements for your specific goals

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Inspiration from RPG games and productivity apps
- Icons and graphics from [source]
- Font families: Cinzel Decorative, Inter, and Noto Sans JP 