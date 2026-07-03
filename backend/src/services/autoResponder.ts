interface AutoReplyRule {
  keywords: RegExp[];
  reply: string;
}

const rules: AutoReplyRule[] = [
  {
    keywords: [/^(hi|hello|hey|good morning|good afternoon|good evening)\b/i],
    reply: 'Hello! 👋 Welcome to our store! How can I help you today?',
  },
  {
    keywords: [/\b(how are you|how's it going)\b/i],
    reply: "I'm doing great, thanks for asking! 😊 How can I assist you today?",
  },
  {
    keywords: [/\b(shipping|delivery|ship|deliver|track)\b/i],
    reply: '📦 We offer free shipping on all orders! Delivery typically takes 3-7 business days. You can track your order from your order history page.',
  },
  {
    keywords: [/\b(return|refund|exchange|money back)\b/i],
    reply: '🔄 We have a 30-day return policy. If you\'re not satisfied with your purchase, you can return it within 30 days for a full refund. Please contact us with your order number to start the process.',
  },
  {
    keywords: [/\b(payment|pay|credit card|payway|aba)\b/i],
    reply: '💳 We accept multiple payment methods: KHQR (Bakong), ABA PayWay, and Cash on Delivery. All payments are processed securely.',
  },
  {
    keywords: [/\b(stock|available|in stock|restock)\b/i],
    reply: '📋 Product availability is shown on each product page. If a product is out of stock, you can check back later or contact us for estimated restock dates.',
  },
  {
    keywords: [/\b(discount|coupon|promo|sale|offer)\b/i],
    reply: '🏷️ Check out our Promotions page for current deals and discounts! You can find active promotions on eligible products throughout the store.',
  },
  {
    keywords: [/\b(size|fit|measurement|dimension)\b/i],
    reply: '📏 Product specifications including dimensions and sizing information are listed on each product detail page. If you need more specific measurements, our team would be happy to help!',
  },
  {
    keywords: [/\b(hours|open|business hours|when are you)\b/i],
    reply: '🕐 Our customer support team is available Monday to Friday, 9:00 AM - 6:00 PM. We\'ll get back to you as soon as possible outside these hours!',
  },
  {
    keywords: [/\b(order|cancel|change order|modify)\b/i],
    reply: '📝 You can view and manage your orders from your order history page (requires login). For cancellation or modification requests, please provide your order number and we\'ll assist you right away.',
  },
  {
    keywords: [/\b(thank|thanks|appreciate)\b/i],
    reply: 'You\'re welcome! 🙏 Is there anything else I can help you with?',
  },
  {
    keywords: [/\b(bye|goodbye|talk later|see you)\b/i],
    reply: 'Goodbye! 👋 Thank you for visiting! If you need anything else, we\'re just a message away. Have a great day! 🎉',
  },
];

export function getAutoReply(message: string): string | null {
  const cleanMsg = message.trim();
  if (!cleanMsg) return null;

  for (const rule of rules) {
    const match = rule.keywords.some((re) => re.test(cleanMsg));
    if (match) {
      return rule.reply;
    }
  }

  // Fallback: acknowledge the message if no specific rule matches
  if (cleanMsg.endsWith('?')) {
    return 'That\'s a great question! 🤔 Let me connect you with one of our team members who can help you with this. One moment please...';
  }

  return null;
}
