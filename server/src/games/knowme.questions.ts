/**
 * How well do you know me — the questions.
 *
 * Every question is answered by the person in the hot seat *about themselves*,
 * from four options, while everyone else guesses which one they will pick. Good
 * ones have four answers that are all plausible for most people, so the guess
 * actually depends on knowing them — "my favourite colour is blue/red/green/
 * yellow" is a coin toss, "in a fight I go quiet / argue until I win / say
 * sorry first / need space" is a conversation.
 */
export type Question = { q: string; options: [string, string, string, string] }

export const QUESTIONS: Question[] = [
  { q: 'My go-to comfort food is…', options: ['Maggi', 'Biryani', 'Pizza', 'Ice cream'] },
  { q: 'On a free Sunday I would rather…', options: ['Sleep till noon', 'Go on a road trip', 'Binge a series', 'See friends'] },
  { q: 'If I won ₹1 crore, the first thing I would do is…', options: ['Travel the world', 'Buy a house', 'Invest it', 'Treat my family'] },
  { q: 'The thing that scares me most is…', options: ['Heights', 'Spiders or cockroaches', 'Being alone', 'Public speaking'] },
  { q: 'In an argument, I usually…', options: ['Go quiet', 'Argue until I win', 'Say sorry first', 'Need space'] },
  { q: 'Most of my screen time goes to…', options: ['Instagram', 'YouTube', 'WhatsApp', 'Games'] },
  { q: 'When I am late, it is usually because…', options: ['I overslept', 'I could not pick an outfit', 'I left late', 'I got distracted'] },
  { q: 'My dream holiday is…', options: ['A beach in Goa', 'Snow in the mountains', 'A Europe trip', 'A staycation'] },
  { q: 'At a party you will find me…', options: ['On the dance floor', 'Near the food', 'Deep in one conversation', 'Planning my exit'] },
  { q: 'My ideal first date is…', options: ['Coffee and a long walk', 'Dinner somewhere fancy', 'Movie and street food', 'Something adventurous'] },
  { q: 'The chore I hate most is…', options: ['Washing dishes', 'Laundry', 'Cleaning the bathroom', 'Making the bed'] },
  { q: 'I am secretly really good at…', options: ['Cooking', 'Singing', 'Giving advice', 'Lying with a straight face'] },
  { q: 'My morning drink is…', options: ['Chai', 'Coffee', 'Water, like an adult', 'Nothing — I skip it'] },
  { q: 'The film genre I always pick is…', options: ['Comedy', 'Romance', 'Thriller or horror', 'Action'] },
  { q: 'When I am stressed, I…', options: ['Eat', 'Sleep', 'Talk to someone', 'Go silent and scroll'] },
  { q: 'My biggest pet peeve is…', options: ['Loud chewing', 'People who are late', 'Being interrupted', 'Slow walkers'] },
  { q: 'If I could have one superpower, it would be…', options: ['Teleportation', 'Reading minds', 'Invisibility', 'Pausing time'] },
  { q: 'The way I show love is…', options: ['Saying it', 'Doing things for you', 'Gifts', 'Spending time together'] },
  { q: 'My most-used emoji is…', options: ['😂', '❤️', '🥲', '🙄'] },
  { q: 'On a long trip, I am the one who…', options: ['Controls the music', 'Falls asleep first', 'Plans everything', 'Asks "are we there yet?"'] },
  { q: 'I would rather give up…', options: ['Sweets', 'My phone for a week', 'Coffee or chai', 'Social media'] },
  { q: 'My sleep schedule is…', options: ['Early bird', 'Night owl', 'Chaotic', 'Whenever I can'] },
  { q: 'In a group project, I am the one who…', options: ['Does everything', 'Makes it look good', 'Keeps everyone calm', 'Disappears until the end'] },
  { q: 'My shopping style is…', options: ['Impulse buys', 'Research for days', 'Only in sales', 'I hate shopping'] },
  { q: 'The hardest thing for me to say is…', options: ['Sorry', 'No', 'I love you', 'I need help'] },
  { q: 'If I were an animal, I would be a…', options: ['Cat', 'Dog', 'Sloth', 'Owl'] },
  { q: 'I cry most at…', options: ['Sad films', 'Happy endings', 'Never — I am made of stone', 'Weddings'] },
  { q: 'My dream job, honestly, is…', options: ['Travel vlogger', 'Run my own business', 'Something creative', 'Not working at all'] },
  { q: 'When I get a compliment, I…', options: ['Say thank you', 'Deflect it', 'Compliment back immediately', 'Screenshot it'] },
  { q: 'My favourite season is…', options: ['Monsoon', 'Winter', 'Summer', 'Spring'] },
  { q: 'The street food I would pick every time is…', options: ['Golgappa', 'Momos', 'Vada pav', 'Chaat'] },
  { q: 'When I text, I…', options: ['Reply instantly', 'Leave you on read', 'Send voice notes', 'Reply in my head and forget'] },
  { q: 'My guilty pleasure is…', options: ['Reality TV', 'Junk food at midnight', 'Stalking profiles', 'Online shopping'] },
  { q: 'On a night out, my limit is…', options: ['Home by 11', 'Till the last one leaves', 'Depends on the people', 'I would rather stay in'] },
  { q: 'The decade I would live in is…', options: ['The 70s', 'The 90s', 'Right now', 'The future'] },
  { q: 'I am most likely to be found…', options: ['In bed', 'In the kitchen', 'Out with friends', 'On my laptop'] },
  { q: 'My reaction to a surprise party would be…', options: ['Love it', 'Cry', 'Be secretly annoyed', 'Pretend I knew'] },
  { q: 'If my house was on fire, I would grab…', options: ['My phone', 'Photos and memories', 'My pet or a plant', 'My wallet and documents'] },
  { q: 'I make decisions by…', options: ['Gut feeling', 'Pros and cons', 'Asking everyone', 'Putting it off'] },
  { q: 'My go-to karaoke song is a…', options: ['Bollywood classic', 'Latest Punjabi hit', 'English pop song', 'I never sing'] },
  { q: 'The thing I would spend on without thinking is…', options: ['Food', 'Travel', 'Clothes or shoes', 'Gadgets'] },
  { q: 'When I am sick, I want…', options: ['To be looked after', 'To be left alone', 'Soup and sympathy', 'To pretend I am fine'] },
  { q: 'My love language in a text is…', options: ['Memes', 'Long paragraphs', 'Good-morning messages', 'Just being there'] },
  { q: 'The quality I value most in people is…', options: ['Honesty', 'Humour', 'Loyalty', 'Kindness'] },
  { q: 'If I had a free day tomorrow, I would…', options: ['Sleep', 'Go somewhere new', 'Cook something fancy', 'Spend it with someone special'] },
  { q: 'The first thing I notice about someone is…', options: ['Their smile', 'Their eyes', 'How they talk', 'Their style'] },
  { q: 'My worst habit is…', options: ['Procrastinating', 'Overthinking', 'Being on my phone', 'Snacking'] },
  { q: 'In ten years I see myself…', options: ['Settled with a family', 'Travelling the world', 'Running my own thing', 'Honestly, no idea'] },
]
