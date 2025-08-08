import React from 'react';

import { MessageCircle } from 'lucide-react';

export const WhatsAppButton = () => {
    return (
    <a
    href="https://wa.me/558699461236" // substitua pelo seu número com DDI e DDD, sem + ou traços
    className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-colors"
    target="_blank"
    rel="noopener noreferrer"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
);
}