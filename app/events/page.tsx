'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGift, FaScroll, FaStore, FaClock } from 'react-icons/fa';
import EventModal from '@/components/EventModal';

interface Event {
  id: string;
  title: string;
  description: string;
  endDate: string;
  type: 'event' | 'item' | 'quest' | 'reward';
  imageUrl: string;
  accepted?: boolean;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Festival',
    description: 'Join the summer celebration with special quests and rewards!',
    endDate: '2024-08-31',
    type: 'event',
    imageUrl: '/events/summer-festival.jpg',
    accepted: false
  },
  {
    id: '2',
    title: 'Legendary Sword',
    description: 'Limited time legendary weapon with unique abilities',
    endDate: '2024-07-15',
    type: 'item',
    imageUrl: '/events/legendary-sword.jpg',
    accepted: false
  },
  {
    id: '3',
    title: 'Dragon Hunt',
    description: 'Special quest to defeat the ancient dragon',
    endDate: '2024-07-20',
    type: 'quest',
    imageUrl: '/events/dragon-hunt.jpg',
    accepted: false
  },
  {
    id: '4',
    title: 'VIP Rewards',
    description: 'Exclusive rewards for VIP members',
    endDate: '2024-08-01',
    type: 'reward',
    imageUrl: '/events/vip-rewards.jpg',
    accepted: false
  }
];

const EventCard = ({ event, onViewDetails }: { event: Event; onViewDetails: (event: Event) => void }) => {
  const getIcon = (type: Event['type']) => {
    switch (type) {
      case 'event':
        return <FaClock className="text-primary-400" />;
      case 'item':
        return <FaStore className="text-accent-400" />;
      case 'quest':
        return <FaScroll className="text-secondary-400" />;
      case 'reward':
        return <FaGift className="text-accent-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors min-h-[300px] h-full flex flex-col"
    >
      <div className="relative h-48">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark/80" />
        <div className="absolute top-4 right-4">
          {getIcon(event.type)}
        </div>
      </div>
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-display text-white mb-2">{event.title}</h3>
        <p className="text-gray-400 mb-4">{event.description}</p>
        <div className="mt-auto grid grid-cols-[1fr,auto] gap-4 items-center">
          <span className="text-sm text-gray-500">
            Ends: {new Date(event.endDate).toLocaleDateString()}
          </span>
          <button 
            className="btn btn-primary text-sm whitespace-nowrap"
            onClick={() => onViewDetails(event)}
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState<Event['type'] | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'accepted'>('available');
  const [events, setEvents] = useState<Event[]>(mockEvents);

  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter(event => event.type === activeFilter);

  const availableEvents = filteredEvents.filter(event => !event.accepted);
  const acceptedEvents = filteredEvents.filter(event => event.accepted);

  const handleAcceptEvent = (eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, accepted: true } : event
      )
    );
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-white">Limited Time Events</h1>
          <p className="text-gray-400">Discover special events, items, quests, and rewards</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'available' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('available')}
          >
            Available Events
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'accepted' 
                ? 'text-accent-400 border-b-2 border-accent-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('accepted')}
          >
            Accepted Events
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeFilter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('event')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeFilter === 'event' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveFilter('item')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeFilter === 'item' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveFilter('quest')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeFilter === 'quest' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Quests
          </button>
          <button
            onClick={() => setActiveFilter('reward')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeFilter === 'reward' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Rewards
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {(activeTab === 'available' ? availableEvents : acceptedEvents).map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onViewDetails={setSelectedEvent}
            />
          ))}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onAccept={handleAcceptEvent}
        isAccepted={selectedEvent?.accepted}
      />
    </div>
  );
} 