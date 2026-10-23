/** Artists define the pack; upload titles never define what counts as a song. */
export const SONG_CATEGORIES = {
  bollywood: { label: 'Bollywood hits', country: 'IN', artists: ['Arijit Singh', 'Shreya Ghoshal', 'Sonu Nigam', 'KK', 'Atif Aslam', 'Mohit Chauhan', 'A.R. Rahman', 'Shaan', 'Sunidhi Chauhan', 'Vishal Mishra', 'Udit Narayan', 'Jubin Nautiyal'] },
  punjabi: { label: 'Punjabi bangers', country: 'IN', artists: ['Diljit Dosanjh', 'Karan Aujla', 'AP Dhillon', 'Sidhu Moose Wala', 'Shubh', 'Amrinder Gill', 'Gippy Grewal', 'Jazzy B', 'Jassi Gill', 'Harrdy Sandhu', 'Guru Randhawa', 'Nimrat Khaira'] },
  global: { label: 'English hits', country: 'US', artists: ['Taylor Swift', 'The Weeknd', 'Dua Lipa', 'Ed Sheeran', 'Bruno Mars', 'Ariana Grande', 'Rihanna', 'Adele', 'Justin Bieber', 'Billie Eilish', 'Lady Gaga', 'Coldplay'] },
  desiHipHop: { label: 'Desi hip-hop', country: 'IN', artists: ['DIVINE', 'Seedhe Maut', 'KR$NA', 'Raftaar', 'Karma', 'Talha Anjum', 'Young Stunners', 'Emiway Bantai', 'Ikka', 'Badshah', 'MC Stan', 'Hanumankind'] },
  throwbacks: { label: '90s & 2000s', country: 'US', artists: ['Backstreet Boys', 'Britney Spears', 'Michael Jackson', 'Linkin Park', 'Shakira', 'Eminem', 'Usher', 'Avril Lavigne', 'Green Day', 'Nelly Furtado', 'Oasis', 'NSYNC'] },
  indie: { label: 'Indie & alt', country: 'IN', artists: ['Anuv Jain', 'Prateek Kuhad', 'The Local Train', 'When Chai Met Toast', 'Ritviz', 'Arctic Monkeys', 'Tame Impala', 'The 1975', 'Cigarettes After Sex', 'The Strokes', 'boy pablo', 'Clairo'] },
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
  if (category === 'indie') return ['Anuv Jain', 'Prateek Kuhad', 'The Local Train', 'Ritviz'].includes(artist ?? '') ? 'hi' : 'en'
  return 'hi'
}

export const normaliseSongText = (value: string) => value.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/&amp;|&quot;|&#39;/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

export function songTitle(value: string) {
  return value.replace(/\s*\(?from\s+["“].*$/i, '').replace(/\s*\((?:original motion picture soundtrack|remastered(?:\s+\d+)?)\)\s*/gi, '').trim()
}

export function isQuizSong(song: SongIdentity) {
  if (!song.title || song.title.length > 100 || !song.artist) return false
  if (/\b(jukebox|non[ -]?stop|medley|mashup|karaoke|instrumental|playlist|collection|greatest hits|slowed|reverb|sped up|remix|live)\b/i.test(song.title)) return false
  if (song.duration !== null && (song.duration < 90 || song.duration > 540)) return false
  return song.category !== 'throwbacks' || (song.year !== null && song.year >= 1990 && song.year <= 2009)
}
