interface AutoReplyRule {
  keywords: RegExp[];
  reply: string;
  context?: string;
}

// ─── Warm welcome replies for first messages ──────────────────────
const welcomeReplies = [
  "Hi there! 👋 Welcome to MY SHOP! I'm your virtual assistant, and I'm here to help you with anything you need. Feel free to ask me about our products, promotions, shipping, or anything else! 😊",
  "Hello! 🎉 Welcome to MY SHOP! It's a pleasure to have you here. I can help you find the perfect products, check on your orders, or answer any questions you might have. How can I make your day better? 💫",
  "Hey there! 👋 Thanks for reaching out! I'm thrilled to assist you today. Whether you're looking for gift ideas, need help with an order, or just want to browse — I've got you covered! How can I help? 🌟",
];

let welcomeIndex = 0;

function getWelcomeReply(): string {
  const reply = welcomeReplies[welcomeIndex % welcomeReplies.length];
  welcomeIndex++;
  return reply;
}

const rules: AutoReplyRule[] = [
  {
    keywords: [/^(hi|hello|hey|heyo|howdy|good morning|good afternoon|good evening|greetings)\b/i],
    reply: 'Hello there! 👋 It\'s so nice to meet you! How can I brighten your day today? 😊',
  },
  {
    keywords: [/\b(how are you|how's it going|how do you do|what's up|sup)\b/i],
    reply: "I'm absolutely wonderful, thank you for asking! 😄 I'm here, I'm powered up, and I'm ready to help you with anything you need. What's on your mind today?",
  },
  {
    keywords: [/\b(shipping|delivery|ship|deliver|track|arrive|arrival|when will i get)\b/i],
    reply: '📦 Great news — we offer FREE shipping on ALL orders! 🎉 Delivery typically takes 3-7 business days, and you can track your order anytime from your order history page. Need something faster? Let me know!',
  },
  {
    keywords: [/\b(return|refund|exchange|money back|not happy|not satisfied|wrong item)\b/i],
    reply: '🔄 We completely understand! We offer a hassle-free 30-day return policy. If something isn\'t quite right, just reach out to us with your order number and we\'ll make it right — whether that\'s a refund, exchange, or store credit. Your satisfaction is our top priority! 💯',
  },
  {
    keywords: [/\b(payment|pay|credit card|payway|aba|bakong|khqr|scan)\b/i],
    reply: '💳 We\'ve made paying super easy! You can choose from: \n💚 ABA PayWay — Quick card payment\n📱 KHQR (Bakong) — Scan with any banking app\n💵 Cash on Delivery — Pay when your order arrives\nAll payments are 100% secure and encrypted! 🛡️',
  },
  {
    keywords: [/\b(stock|available|in stock|restock|sold out|when back)\b/i],
    reply: '📋 You can check real-time availability right on each product page! If something is out of stock, don\'t worry — our team works hard to restock popular items quickly. Want me to notify you when it\'s back? Just ask! 😊',
  },
  {
    keywords: [/\b(discount|coupon|promo|sale|offer|deal|cheaper|save)\b/i],
    reply: '🏷️ Great timing! We have some awesome promotions running right now! 🎉 Head over to our Promotions page to see all current deals and discounts. Trust me, you don\'t want to miss these! Want me to tell you about our best deals? 😍',
  },
  {
    keywords: [/\b(size|fit|measurement|dimension|how big|how small|weight)\b/i],
    reply: '📏 Product specs including dimensions, weight, and sizing info are available on each product\'s detail page. If there\'s something specific you need to know, just tell me which product and I\'ll do my best to help! 📐',
  },
  {
    keywords: [/\b(hours|open|business hours|when are you|available|support)\b/i],
    reply: '🕐 Our team is here for you Monday to Friday, 9:00 AM - 6:00 PM. But don\'t worry — I\'m your 24/7 virtual assistant, so you can always reach me anytime, day or night! 🌙✨ How can I help?',
  },
  {
    keywords: [/\b(order|cancel|change order|modify|update order|where is my)\b/i],
    reply: '📝 You can view all your orders from your order history page (just log in to your account). Need to cancel or change something? Please share your order number and I\'ll help you out right away! ⚡',
  },
  {
    keywords: [/\b(thank|thanks|appreciate|grateful|awesome|amazing)\b/i],
    reply: 'You\'re absolutely welcome! 🙏💖 It\'s truly my pleasure to help you! Is there anything else I can do to make your experience even better today?',
  },
  {
    keywords: [/\b(bye|goodbye|talk later|see you|see ya|have a good|take care)\b/i],
    reply: 'Goodbye! 👋 It was such a pleasure chatting with you! 🎉 Thank you for visiting MY SHOP. If you ever need anything — anything at all — I\'m just a message away. Have a fantastic day! 🌟💫',
  },
  {
    keywords: [/\b(price|cost|how much|cheap|expensive|affordable)\b/i],
    reply: '💰 Our prices are competitive and we regularly run promotions! You can see the exact price on each product page. Don\'t forget to check the Promotions section for extra discounts! Want me to find something in your budget? 😊',
  },
  {
    keywords: [/\b(recommend|suggest|best|popular|top|favorite|which one)\b/i],
    reply: '🎯 Great question! We have so many amazing products to choose from! Our best-selling items are usually a safe bet. Check out the \"Featured\" section on our homepage for our top picks. If you tell me what you\'re looking for, I can point you in the right direction! 😄',
  },
  {
    keywords: [/\b(help|support|assist|problem|issue|question)\b/i],
    reply: '🤗 I\'m here for you! Tell me what\'s going on and I\'ll do my absolute best to help. Whether it\'s about a product, an order, or just general info — I\'ve got your back! 💪😊',
  },
];

// ─── Warm fallback replies for anything we don't have a rule for ──
const fallbackReplies = [
  "Thank you for your message! 😊 I want to make sure you get the best help possible. Let me connect you with one of our team members who can assist you further. In the meantime, feel free to browse our store! 🌟",
  "I appreciate you reaching out! 🙏 While I'll do my best, let me have one of our team experts take a closer look at this for you. They'll be with you shortly! Is there anything else I can help with in the meantime? 💫",
  "Thanks for your patience! 🤗 Your message is important to us. A team member will be right with you to provide the personalized assistance you deserve. Is there anything else you'd like to know while you wait? 🎉",
  "Great question! 🤔 I want to make sure you get the most accurate information, so I'll pass this along to our specialist team. They'll be happy to help you out! In the meantime, is there anything quick I can assist with? 😊",
];

let fallbackIndex = 0;

export function getAutoReply(message: string): string | null {
  const cleanMsg = message.trim();
  if (!cleanMsg) return null;

  for (const rule of rules) {
    const match = rule.keywords.some((re) => re.test(cleanMsg));
    if (match) {
      return rule.reply;
    }
  }

  // Always reply warmly — never leave a message unanswered
  const reply = fallbackReplies[fallbackIndex % fallbackReplies.length];
  fallbackIndex++;
  return reply;
}

export function getWelcomeMessage(): string {
  return getWelcomeReply();
}
