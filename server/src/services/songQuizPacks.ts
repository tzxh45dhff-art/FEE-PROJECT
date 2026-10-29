/** Artists define the pack; upload titles never define what counts as a song. */
export const SONG_CATEGORIES = {
  bollywood: { label: 'Bollywood hits', country: 'IN', artists: ['Arijit Singh', 'Shreya Ghoshal', 'Sonu Nigam', 'KK', 'Atif Aslam', 'Mohit Chauhan', 'A.R. Rahman', 'Shaan', 'Sunidhi Chauhan', 'Vishal Mishra', 'Udit Narayan', 'Jubin Nautiyal', 'Alka Yagnik', 'Kumar Sanu', 'Lata Mangeshkar', 'Kishore Kumar', 'Mohammed Rafi', 'Asha Bhosle', 'Mukesh', 'Sukhwinder Singh', 'Kailash Kher', 'Shankar Mahadevan', 'Neeraj Shridhar', 'Benny Dayal', 'Javed Ali', 'Shilpa Rao', 'Rekha Bhardwaj', 'Sadhana Sargam', 'Anuradha Paudwal', 'Hariharan', 'Lucky Ali', 'Papon', 'Amit Trivedi', 'Vishal Dadlani', 'Salim Merchant', 'Armaan Malik'] },
  punjabi: { label: 'Punjabi bangers', country: 'IN', artists: ['Diljit Dosanjh', 'Karan Aujla', 'AP Dhillon', 'Sidhu Moose Wala', 'Shubh', 'Amrinder Gill', 'Gippy Grewal', 'Jazzy B', 'Jassi Gill', 'Harrdy Sandhu', 'Guru Randhawa', 'Nimrat Khaira', 'Gurdas Maan', 'Babbu Maan', 'Satinder Sartaaj', 'Surjit Bindrakhia', 'Kuldeep Manak', 'Chamkila', 'Jasmine Sandlas', 'Sunanda Sharma', 'Afsana Khan', 'Ranjit Bawa', 'Mankirt Aulakh', 'B Praak', 'Garry Sandhu', 'Ammy Virk', 'Jordan Sandhu', 'Ninja', 'Kulwinder Billa', 'Navaan Sandhu', 'Prem Dhillon', 'Arjan Dhillon', 'Tarsem Jassar', 'Nirvair Pannu', 'Prabh Gill', 'Sukshinder Shinda'] },
  global: { label: 'English hits', country: 'US', artists: ['Taylor Swift', 'The Weeknd', 'Dua Lipa', 'Ed Sheeran', 'Bruno Mars', 'Ariana Grande', 'Rihanna', 'Adele', 'Justin Bieber', 'Billie Eilish', 'Lady Gaga', 'Coldplay', 'Beyoncé', 'Katy Perry', 'Maroon 5', 'OneRepublic', 'Imagine Dragons', 'Harry Styles', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Sia', 'Shawn Mendes', 'Sam Smith', 'Post Malone', 'Lana Del Rey', 'Miley Cyrus', 'Selena Gomez', 'Demi Lovato', 'Charlie Puth', 'The Chainsmokers', 'Hozier', 'Lewis Capaldi', 'One Direction', 'Lorde', 'Khalid', 'Justin Timberlake'] },
  desiHipHop: { label: 'Desi hip-hop', country: 'IN', artists: ['DIVINE', 'Seedhe Maut', 'KR$NA', 'Raftaar', 'Karma', 'Talha Anjum', 'Young Stunners', 'Emiway Bantai', 'Ikka', 'Badshah', 'MC Stan', 'Hanumankind', 'Naezy', 'Brodha V', 'Prabh Deep', 'Raga', 'Rawal', 'Fotty Seven', 'Dino James', 'King', 'EPR', 'Sikander Kahlon', 'MC Altaf', 'Dhanji', 'MC Square', 'Paradox', 'Yashraj', 'Faris Shafi', 'Talhah Yunus', 'J Trix', 'SMOKE', 'Chaar Diwaari', 'Sambata', 'Sez on the Beat', 'Gravity', 'Dee MC'] },
  throwbacks: { label: '90s & 2000s', country: 'US', artists: ['Backstreet Boys', 'Britney Spears', 'Michael Jackson', 'Linkin Park', 'Shakira', 'Eminem', 'Usher', 'Avril Lavigne', 'Green Day', 'Nelly Furtado', 'Oasis', 'NSYNC', 'Westlife', 'Spice Girls', 'Destiny\'s Child', 'Christina Aguilera', 'Jennifer Lopez', 'Alicia Keys', 'Whitney Houston', 'Celine Dion', 'Mariah Carey', 'TLC', 'Boyz II Men', 'Black Eyed Peas', 'Gwen Stefani', 'Kelly Clarkson', 'P!nk', 'Paramore', 'The Killers', 'Sum 41', 'Blink-182', 'Nirvana', 'Radiohead', 'Red Hot Chili Peppers', 'Bon Jovi', 'Robbie Williams'] },
  indie: { label: 'Indie & alt', country: 'IN', artists: ['Anuv Jain', 'Prateek Kuhad', 'The Local Train', 'When Chai Met Toast', 'Ritviz', 'Arctic Monkeys', 'Tame Impala', 'The 1975', 'Cigarettes After Sex', 'The Strokes', 'boy pablo', 'Clairo', 'Ankur Tewari', 'Osho Jain', 'Bharat Chauhan', 'The Yellow Diary', 'Aditya Rikhari', 'Suzonn', 'Vayu', 'Dream Note', 'Twin Strings', 'Lifafa', 'Last Dinosaurs', 'The Neighbourhood', 'Two Door Cinema Club', 'Vampire Weekend', 'Florence + The Machine', 'The Lumineers', 'Of Monsters and Men', 'alt-J', 'Glass Animals', 'Rex Orange County', 'Wallows', 'beabadoobee', 'Phoebe Bridgers', 'Men I Trust'] },
} as const

export type SongCategory = keyof typeof SONG_CATEGORIES

export type SongIdentity = {
  title: string
  artist: string
  duration: number | null
  year: number | null
  category: SongCategory
  /** Popularity within this artist's catalogue, not YouTube upload views. */
  rank?: number
}

export function songLanguage(category: SongCategory, artist: string | null) {
  if (category === 'global' || category === 'throwbacks') return 'en'
  if (category === 'punjabi') return 'pa'
  if (category === 'indie') return ['Anuv Jain', 'Prateek Kuhad', 'The Local Train', 'Ritviz', 'Ankur Tewari', 'Osho Jain', 'Bharat Chauhan', 'The Yellow Diary', 'Aditya Rikhari', 'Suzonn', 'Vayu', 'Dream Note', 'Twin Strings', 'Lifafa'].includes(artist ?? '') ? 'hi' : 'en'
  return 'hi'
}

export const normaliseSongText = (value: string) => value.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/&amp;|&quot;|&#39;/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

/** The same recording stays heard if YouTube replaces its upload or it appears in another pack. */
export const songIdentityKey = (song: { artist: string | null; title: string }) =>
  `song:${normaliseSongText(song.artist ?? '')}:${normaliseSongText(song.title)}`
export const heardSong = (song: { artist: string | null; title: string; ref: string }, seen?: ReadonlySet<string>) =>
  !!seen && (seen.has(song.ref) || seen.has(songIdentityKey(song)))

export function songTitle(value: string) {
  return value.replace(/\s*\(?from\s+["“].*$/i, '').replace(/\s*\((?:original motion picture soundtrack|remastered(?:\s+\d+)?)\)\s*/gi, '').trim()
}

export function isQuizSong(song: SongIdentity) {
  if (!song.title || song.title.length > 100 || !song.artist) return false
  if (/\b(jukebox|non[ -]?stop|medley|mashup|karaoke|instrumental|playlist|collection|greatest hits|slowed|reverb|sped up|remix|live)\b/i.test(song.title)) return false
  if (song.duration !== null && (song.duration < 90 || song.duration > 540)) return false
  return song.category !== 'throwbacks' || (song.year !== null && song.year >= 1990 && song.year <= 2009)
}
