import type { Persona } from './mafia.bots.js'

/**
 * The worlds a game of Mafia can be set in.
 *
 * The rules never change — a Family, a town, a night and a day — but each
 * story brings its own city, its own room full of suspects, its own morning
 * paper, its own regulars for the AI chairs and its own narrator. Screens
 * pick up the look from the id (see `src/features/party/mafia/arcs.ts`).
 *
 * A new game picks a story the room hasn't played lately, unless the host
 * chose one.
 */

export const ARC_IDS = ['bombay', 'shimla', 'goa', 'neo', 'jaisalmer'] as const
export type ArcId = (typeof ARC_IDS)[number]
export type ArcChoice = ArcId | 'surprise'

export type Arc = {
  id: ArcId
  /** For the AIs and the narrator: "Bombay, 1956 film noir". */
  tone: string
  /** Where the table sits tonight, as the AIs are told it. */
  venue: string
  /** The narrator's world and voice, for the moments written fresh. */
  world: string
  paper: string
  citizen: string
  /** The opening story's first two pages, and the line that ends the last. */
  city: string
  cast: (n: number) => string
  theirs: string
  intro: string
  rematch: string
  nightfall: string[]
  spared: string[]
  /** The morning paper when nobody wrote one in time. */
  found: (name: string) => string
  saved: string
  quiet: string
  headline: { dead: (name: string) => string; saved: string; quiet: string }
  epilogue: { town: string; family: string; jester: string; none: string }
  /** Who the people at the table are in the story; the AIs bring their own. */
  covers: string[]
  personas: Persona[]
}

const bombay: Arc = {
  id: 'bombay',
  tone: 'Bombay, 1956 film noir',
  venue: 'the Irani café on the corner',
  world:
    'set in Bombay, 1956 — film noir, monsoon rain, jazz clubs in Colaba, the docks, Crawford Market, Marine Drive, Irani cafés, Malabar Hill. You are a deep-voiced 1950s film narrator: cinematic, wry, a little menacing, never gory.',
  paper: 'the Bombay Herald',
  citizen: 'Citizen of Bombay',
  city: 'Bombay, nineteen fifty-six. The monsoon has not stopped for a week. Every night this month somebody in the neighbourhood has gone missing, and every morning another body turns up at the docks. The police shrug. Everyone whispers the same name — the Family.',
  cast: (n) => `Tonight, ${n} regulars have locked themselves inside the Irani café on the corner, with sweet chai and one flickering lamp. Look around the table. These are your neighbours — and your suspects.`,
  theirs: 'Bombay is theirs.',
  intro: 'Bombay, nineteen fifty-six. The monsoon has not stopped for a week, and neither have the killings. Among you sits the Family. Look at your card. Tell no one.',
  rematch: 'Another hand, another night in Bombay. New cards. Trust nobody.',
  nightfall: [
    'Night falls on Bombay. The rain comes down on Marine Drive, the jazz dies in the clubs of Colaba — and somewhere in the dark, the Family wakes. Close your eyes, citizens.',
    'The street lamps flicker. The last tram rattles home. Lock your doors, Bombay — the Family is out tonight.',
    'Another night. Another storm off the Arabian Sea. Somebody in this town will not see the morning.',
    'Midnight. The docks are quiet, the Irani cafés are shut, and the Family is choosing. Sleep, if you can.',
  ],
  spared: [
    'No one stands accused. The town argues itself hoarse, and somewhere in the rain, a killer smiles.',
    'The town cannot agree on a name. Everyone goes home. Not everyone will wake up.',
  ],
  found: (name) => `${name} is dead. They found the body at Dock 9 before sunrise, and the Family left no fingerprints.`,
  saved: 'Nobody died. Somebody came for a soul last night — and somebody else got there first.',
  quiet: 'Nobody died. A strange, quiet night. The Family is patient.',
  headline: { dead: (name) => `${name} FOUND DEAD AT DOCK 9`, saved: 'MIRACLE ON MALABAR HILL', quiet: 'A NIGHT WITHOUT BLOOD' },
  epilogue: {
    town: 'The Family is finished. The rain eases over Bombay, and for one night, the city sleeps without fear.',
    family: 'By morning the city belongs to the Family. Nobody saw anything. Nobody ever does.',
    jester: 'They hanged a fool, and the fool won. Bombay will be laughing about this one for years.',
    none: 'The case is closed before it is solved. Some files stay open forever.',
  },
  covers: [
    'a young lawyer from the High Court',
    'a schoolteacher from Girgaum',
    'a stranger just off the Frontier Mail',
    'a clerk at the Port Trust',
    'a nurse at J.J. Hospital',
    'a sailor on shore leave',
    'a typist at the Times of India',
    'a college student mad about cricket',
    'a music teacher from Dadar',
    'a photographer for the film magazines',
    'a bank cashier from Fort',
    'a young doctor’s assistant from Byculla',
  ],
  personas: [
    { name: 'Rosie D’Souza', blurb: 'jazz singer at a Colaba club', manner: 'warm and teasing; watches who looks away', personality: 'charmer' },
    { name: 'Farokh Irani', blurb: 'runs the Irani café on the corner', manner: 'chatty and fatherly; loves a good rumour', personality: 'gossip' },
    { name: 'Shankar Patil', blurb: 'foreman at the docks', manner: 'blunt, few words; distrusts smooth talkers', personality: 'quiet' },
    { name: 'Mrs Lobo', blurb: 'landlady who knows every tenant', manner: 'sharp and gossipy; remembers exactly who said what', personality: 'sceptic' },
    { name: 'Vicky Khanna', blurb: 'fixer for a film studio', manner: 'smooth and charming; always making a deal', personality: 'gambler' },
    { name: 'Abdul Karim', blurb: 'taxi driver who hears everything', manner: 'street-smart and jokey; quick to point a finger', personality: 'joker' },
    { name: 'Meenakshi Rao', blurb: 'crime reporter at the Herald', manner: 'logical; asks pointed questions', personality: 'analyst' },
    { name: 'Father Pereira', blurb: 'parish priest from Bandra', manner: 'gentle; pleads for mercy, hard to read', personality: 'mediator' },
    { name: 'Gopal Mistry', blurb: 'tailor on Abdul Rehman Street', manner: 'nervous and precise; notices small details', personality: 'worrier' },
    { name: 'Lily Fernandes', blurb: 'telephone operator at the exchange', manner: 'quick and nosy; claims to have overheard things', personality: 'firebrand' },
    { name: 'Bashir Khan', blurb: 'retired boxer', manner: 'loud and loyal; trusts his gut', personality: 'loyalist' },
  ],
}

const shimla: Arc = {
  id: 'shimla',
  tone: 'Simla, 1922 — a snowed-in hotel mystery',
  venue: 'the lounge of the Grand Cedar Hotel, snowed in',
  world:
    'set in Simla, 1922 — a grand hill-station hotel cut off by a blizzard, the telegraph line dead, a log fire in the lounge, the billiard room, the ballroom, creaking corridors, the ridge and the deodar forest under snow. You are the deep, measured narrator of a classic country-house mystery: elegant, dry, a little chilling, never gory.',
  paper: 'the Cedar Bulletin',
  citizen: 'Guest of the Grand Cedar',
  city: 'Simla, nineteen twenty-two. The worst snow in forty winters has buried the road down the hill, and the telegraph line went dead on Tuesday. Nobody can leave the Grand Cedar Hotel. On Wednesday a guest was found cold in the billiard room, and now every guest whispers the same name — the Family.',
  cast: (n) => `Tonight, ${n} guests have gathered by the fire in the hotel lounge, under the stag’s head and the ticking clock. Look around the room. These are your fellow guests — and your suspects.`,
  theirs: 'the hotel is theirs.',
  intro: 'Simla, nineteen twenty-two. The snow has buried the road, and a killer has checked in. Among you sits the Family. Look at your card. Tell no one.',
  rematch: 'Another night snowed in at the Grand Cedar. New cards. Trust nobody.',
  nightfall: [
    'The fire burns low in the lounge. The wind howls along the ridge, the lamps go out one by one — and somewhere in the hotel, the Family wakes. Close your eyes, guests.',
    'The clock in the hall strikes midnight. Lock your door, and do not open it for anyone.',
    'Snow against the windows. Footsteps in the corridor that stop outside a door. Somebody will not come down to breakfast.',
    'The last candle gutters out on the second floor. The Family are walking the halls. Sleep, if you can.',
  ],
  spared: [
    'No one stands accused. The guests retire upstairs, and somebody locks their door a little too quickly.',
    'The lounge cannot agree on a name. Everyone goes to bed. Not everyone will wake up.',
  ],
  found: (name) => `${name} is dead. The night porter found them in the snow by the east terrace, and the drifts had already covered every footprint.`,
  saved: 'Nobody died. Somebody crept down the corridor last night — and somebody else was waiting behind the door.',
  quiet: 'Nobody died. Only the wind, all night long. The Family is patient.',
  headline: { dead: (name) => `${name} FOUND IN THE SNOW`, saved: 'A GUEST SPARED BY A WHISKER', quiet: 'A SILENT NIGHT ON THE RIDGE' },
  epilogue: {
    town: 'The Family is finished. By morning the snow stops, the road crews reach the hotel, and the guests step out into the sunlight.',
    family: 'When the road crews finally dig through, the hotel is quiet. The Family signs the register and walks down the hill.',
    jester: 'They hanged a fool, and the fool won. The Grand Cedar will be telling this story for a hundred winters.',
    none: 'The case is closed before it is solved. Some rooms are never opened again.',
  },
  covers: [
    'a schoolteacher on winter holiday',
    'a young civil servant from Delhi',
    'a novelist hunting for a plot',
    'a honeymooner who chose the wrong week',
    'a tea planter down from Darjeeling',
    'the pianist hired for the ballroom',
    'a nurse from the hill sanatorium',
    'a photographer of mountain views',
    'a law student on winter break',
    'a botanist collecting rhododendrons',
    'a travelling watchmaker',
    'a cricket coach from the boys’ school',
  ],
  personas: [
    { name: 'Colonel Bhandari', blurb: 'retired army colonel', manner: 'pompous and loud; demands order in the room', personality: 'firebrand' },
    { name: 'Miss Crane', blurb: 'governess travelling alone', manner: 'prim and watchful; notes every slip of the tongue', personality: 'analyst' },
    { name: 'Raghav Sood', blurb: 'the hotel’s night manager', manner: 'polite and anxious; knows every room key', personality: 'worrier' },
    { name: 'Begum Noor', blurb: 'widow from Lucknow with eleven trunks', manner: 'regal and cutting; trusts nobody', personality: 'sceptic' },
    { name: 'Tenzing Dorje', blurb: 'mountain guide stuck by the storm', manner: 'calm and quiet; reads people like weather', personality: 'quiet' },
    { name: 'Dr Mehra', blurb: 'the hotel’s visiting physician', manner: 'dry and clinical; wants evidence', personality: 'loyalist' },
    { name: 'Lucy Mascarenhas', blurb: 'jazz pianist in the ballroom', manner: 'cheeky and quick; teases everyone', personality: 'joker' },
    { name: 'Harbans Lal', blurb: 'the head cook', manner: 'gruff; suspicious of anyone who skipped dinner', personality: 'gambler' },
    { name: 'Mr Ashworth', blurb: 'insurance clerk on his first holiday', manner: 'jittery; over-explains everything', personality: 'gossip' },
    { name: 'Kamala Devi', blurb: 'famous stage actress', manner: 'dramatic; accuses with flair', personality: 'charmer' },
    { name: 'Pema Lhamo', blurb: 'chambermaid who cleans every room', manner: 'shy, but has seen things', personality: 'mediator' },
  ],
}

const goa: Arc = {
  id: 'goa',
  tone: 'Goa, 1984 — a carnival-week mystery',
  venue: 'a beach shack in Calangute strung with coloured bulbs',
  world:
    'set in Goa, 1984, during carnival week — brass bands, King Momo’s parade, masks and confetti, beach shacks strung with coloured bulbs, cassette players, whitewashed churches, the painted houses of old Panjim, fishing boats at dawn. You are a warm, wry late-night radio storyteller spinning a mystery: playful, a little spooky, never gory.',
  paper: 'the Panjim Tide',
  citizen: 'Carnival-goer',
  city: 'Goa, nineteen eighty-four. Carnival week. King Momo has taken the streets of Panjim, the bands play till dawn, and the beaches are full of dancers. But every night of the festival somebody has vanished from the party, and every morning another is found under the coconut palms. Everyone whispers the same name — the Family.',
  cast: (n) => `Tonight, ${n} friends have taken over a beach shack in Calangute, with cold drinks, a crackling cassette player and a string of coloured bulbs. Look around the table. These are your friends — and your suspects.`,
  theirs: 'the carnival is theirs.',
  intro: 'Goa, nineteen eighty-four. Carnival week, and the party has a killer in it. Among you sits the Family. Look at your card. Tell no one.',
  rematch: 'Another night of carnival. New cards, new masks. Trust nobody.',
  nightfall: [
    'The sun drops into the Arabian Sea. The brass bands strike up, the masks come out — and somewhere in the crowd, the Family is dancing too. Close your eyes, revellers.',
    'The fireworks are over. The last bus to Panjim has gone. Lock your door — the Family is out tonight.',
    'Midnight on the beach. The music is loud enough to hide anything. Somebody will not make it to the morning.',
    'The coloured bulbs flicker along the shack. Out on the dark sand, the Family is choosing.',
  ],
  spared: [
    'No one stands accused. The music starts up again, and somewhere under a mask, a killer smiles.',
    'The shack cannot agree on a name. Everyone heads back to the party. Not everyone will come home.',
  ],
  found: (name) => `${name} is dead. The fishermen found them on the sand at first light, a carnival mask still in their hand.`,
  saved: 'Nobody died. Somebody slipped away from the party for a victim last night — and somebody else followed them.',
  quiet: 'Nobody died. Just music and waves till sunrise. The Family is patient.',
  headline: { dead: (name) => `${name} FOUND ON CALANGUTE BEACH`, saved: 'CARNIVAL MIRACLE IN PANJIM', quiet: 'THE PARTY GOES ON — ALL SAFE' },
  epilogue: {
    town: 'The Family is finished. On the last night of carnival the whole beach dances till sunrise — and this time, everyone makes it home.',
    family: 'When carnival ends, the masks come off — and the Family is running every shack on the beach.',
    jester: 'They hanged a fool, and the fool won. The whole of Goa is singing songs about it.',
    none: 'The carnival packs up before the case is solved. Some masks never come off.',
  },
  covers: [
    'a DJ with a crate of cassettes',
    'a backpacker down from Bombay',
    'a college student on holiday',
    'a waiter at the beach shack',
    'a guitarist in a cover band',
    'a photographer for a travel magazine',
    'a nurse on a week off',
    'a bus conductor from Mapusa',
    'a painter of carnival floats',
    'a lifeguard on Calangute beach',
    'an apprentice at the village bakery',
    'a hotel receptionist on the night shift',
  ],
  personas: [
    { name: 'Uncle Joaquim', blurb: 'runs the village bakery', manner: 'jolly; feeds everyone and gossips nonstop', personality: 'gossip' },
    { name: 'Rita Pinto', blurb: 'singer in the carnival band', manner: 'flirty and fearless; says what she thinks', personality: 'charmer' },
    { name: 'Savio Fernandes', blurb: 'fisherman who owns two boats', manner: 'laid-back; slow to accuse, hard to shake', personality: 'quiet' },
    { name: 'Aunty Philomena', blurb: 'leads the church choir', manner: 'pious and judgemental; sees sin everywhere', personality: 'sceptic' },
    { name: 'DJ Rocky', blurb: 'spins records at the beach party', manner: 'loud and hyper; makes everything a joke', personality: 'joker' },
    { name: 'Marcus D’Costa', blurb: 'sells cashews to tourists', manner: 'shrewd; sly jokes and sideways glances', personality: 'gambler' },
    { name: 'Neha Kamat', blurb: 'travel writer from Bombay', manner: 'curious; asks too many questions', personality: 'analyst' },
    { name: 'Bosco Rodrigues', blurb: 'makes the carnival masks', manner: 'quiet and artistic; notices faces', personality: 'worrier' },
    { name: 'Lenny Gomes', blurb: 'drives the Panjim bus', manner: 'impatient and blunt; wants it over with', personality: 'firebrand' },
    { name: 'Sunita Gaonkar', blurb: 'owns the beach shack', manner: 'practical; counts every rupee and every lie', personality: 'mediator' },
    { name: 'Freddy Menezes', blurb: 'ageing rock guitarist', manner: 'nostalgic; tells long stories, misses nothing', personality: 'loyalist' },
  ],
}

const neo: Arc = {
  id: 'neo',
  tone: 'Neo-Bombay, 2089 — cyberpunk neon noir',
  venue: 'a noodle bar on Level Nine under a buzzing neon sign',
  world:
    'set in Neo-Bombay, 2089 — a cyberpunk megacity behind a sea wall, sky-trains, neon advertising, rain that glows pink, delivery drones, noodle bars, levels stacked into the sky, a police AI that never helps. You are the deep-voiced narrator of a neon-noir science-fiction film: cool, clipped, a little menacing, never gory.',
  paper: 'the Neo-Bombay Feed',
  citizen: 'Citizen of Neo-Bombay',
  city: 'Neo-Bombay, twenty eighty-nine. The sea wall holds back the ocean, the sky-trains never stop, and the rain glows pink under the advertising. Every night this month somebody’s signal has gone dark, and every morning the drones find another one in the lower levels. The police AI calls it a glitch. Everyone whispers the same name — the Family.',
  cast: (n) => `Tonight, ${n} strangers are hiding out in a noodle bar on Level Nine, under a buzzing neon sign and a cracked news screen. Look around the counter. These are your neighbours — and your suspects.`,
  theirs: 'the city’s grid is theirs.',
  intro: 'Neo-Bombay, twenty eighty-nine. The city never sleeps, and neither do the killers. Among you sits the Family. Look at your card. Tell no one.',
  rematch: 'Another night on Level Nine. New cards. Trust nobody.',
  nightfall: [
    'Curfew. The sky-trains go quiet, the billboards dim to blue — and somewhere in the grid, the Family logs on. Close your eyes, citizens.',
    'The neon flickers. The drones fly lower. Lock your door, Level Nine — the Family is out tonight.',
    'Another night of pink rain. The cameras blink off one street at a time. Somebody will not see the morning.',
    'Midnight. The noodle bar’s shutters are down, and the Family is choosing. Sleep, if you can.',
  ],
  spared: [
    'No one stands accused. The bar empties into the rain, and somewhere behind a screen, a killer smiles.',
    'The counter cannot agree on a name. Everyone logs off. Not everyone will log back on.',
  ],
  found: (name) => `${name} is dead. The drones found them on Level Three before sunrise, and every camera on that street had been switched off.`,
  saved: 'Nobody died. Somebody hacked a door last night — and somebody else had already changed the lock.',
  quiet: 'Nobody died. Zero incidents, says the police AI. The Family is patient.',
  headline: { dead: (name) => `${name}: SIGNAL LOST ON LEVEL 3`, saved: 'CLOSE CALL IN THE LOWER LEVELS', quiet: 'ZERO INCIDENTS OVERNIGHT' },
  epilogue: {
    town: 'The Family is finished. The rain stops, the billboards switch to sunrise, and for one night the whole grid runs clean.',
    family: 'By morning the Family runs the grid. The cameras saw nothing. They never do.',
    jester: 'They hanged a fool, and the fool won. The clip is already trending on every screen in the city.',
    none: 'The case is closed before it is solved. Some files stay encrypted forever.',
  },
  covers: [
    'a courier who rides the sky-train',
    'a hacker who fixes phones for cash',
    'a noodle cook on the night shift',
    'a nurse at the Level Six clinic',
    'a drone mechanic',
    'a student at the Sea Wall Academy',
    'a street-food vlogger',
    'a security guard at a data tower',
    'a tattoo artist with glowing ink',
    'a repairer of old robots',
    'an air-taxi pilot',
    'a junior lawyer for a megacorp',
  ],
  personas: [
    { name: 'KIRA-7', blurb: 'delivery android with a cracked visor', manner: 'polite and literal; takes everything at face value', personality: 'mediator' },
    { name: 'Zoya Vance', blurb: 'data broker', manner: 'cool and calculating; trades in secrets', personality: 'gambler' },
    { name: 'Desai Uncle', blurb: 'runs the noodle bar', manner: 'grumpy and wise; has seen every trick', personality: 'loyalist' },
    { name: 'Rex Mahale', blurb: 'ex-cop turned bounty hunter', manner: 'gruff; only trusts evidence', personality: 'sceptic' },
    { name: 'Pixel', blurb: 'teenage hacker', manner: 'cheeky and fast-talking; brags about what they know', personality: 'joker' },
    { name: 'Dr Sen', blurb: 'back-alley cyber-surgeon', manner: 'clinical and blunt', personality: 'analyst' },
    { name: 'Jojo Fernandes', blurb: 'sky-train conductor', manner: 'chatty and friendly; knows everyone’s route', personality: 'gossip' },
    { name: 'Madame Lux', blurb: 'owns the nightclub upstairs', manner: 'glamorous and secretive; answers questions with questions', personality: 'charmer' },
    { name: 'Ishaan Rao', blurb: 'megacorp intern', manner: 'nervous; over-explains everything', personality: 'worrier' },
    { name: 'Ghost', blurb: 'courier nobody has seen unmasked', manner: 'few words; cryptic', personality: 'quiet' },
    { name: 'Aunty Mehrunissa', blurb: 'sells fried snacks from a hover-cart', manner: 'warm and nosy; hears everything', personality: 'firebrand' },
  ],
}

const jaisalmer: Arc = {
  id: 'jaisalmer',
  tone: 'Jaisalmer, 1890 — royal court intrigue in a desert fort',
  venue: 'the Hall of Mirrors in the Golden Fort',
  world:
    'set in Jaisalmer, 1890 — the Golden Fort of yellow sandstone, a sandstorm sealing the caravan roads, the Hall of Mirrors, carved jharokha windows, step-wells, camel stables, oil lamps, folk singers, whispers at court. You are a deep-voiced royal storyteller of old Rajasthan: grand, unhurried, a little ominous, never gory.',
  paper: 'the Court Proclamation',
  citizen: 'Loyal courtier',
  city: 'Jaisalmer, eighteen ninety. A sandstorm has closed the caravan roads, and the Golden Fort has barred its gates. Every night this week somebody in the palace has gone missing, and every morning another is found by the old step-well. The guards look the other way. Everyone whispers the same name — the Family.',
  cast: (n) => `Tonight, ${n} courtiers have been summoned to the Hall of Mirrors, lit by oil lamps, while the wind howls over the walls. Look around the hall. These are your fellow courtiers — and your suspects.`,
  theirs: 'the throne is theirs.',
  intro: 'Jaisalmer, eighteen ninety. The sandstorm has sealed the fort, and a killer sits at court. Among you sits the Family. Look at your card. Tell no one.',
  rematch: 'Another night inside the Golden Fort. New cards. Trust nobody.',
  nightfall: [
    'The sun sinks behind the dunes and the fort turns from gold to grey. The lamps go out in the Hall of Mirrors — and somewhere in the palace, the Family wakes. Close your eyes, courtiers.',
    'The gates are barred. The wind sings over the walls. Lock your doors — the Family walks the palace tonight.',
    'Another night of sand and stars. Somebody at this court will not see the sunrise.',
    'Midnight. The camels are restless in the stables, and the Family is choosing. Sleep, if you can.',
  ],
  spared: [
    'No one stands accused. The court is dismissed, and somewhere behind a carved screen, a killer smiles.',
    'The court cannot agree on a name. Everyone returns to their chambers. Not everyone will wake up.',
  ],
  found: (name) => `${name} is dead. The water-carriers found them by the old step-well before sunrise, and the sand had already swept away every footprint.`,
  saved: 'Nobody died. A shadow crossed the courtyard last night — and another shadow stepped into its path.',
  quiet: 'Nobody died. Only the wind over the walls. The Family is patient.',
  headline: { dead: (name) => `${name} FOUND BY THE STEP-WELL`, saved: 'A LIFE SPARED WITHIN THE FORT', quiet: 'A NIGHT WITHOUT BLOOD AT COURT' },
  epilogue: {
    town: 'The Family is finished. The storm passes, the caravans return, and the fort glows gold in the morning sun.',
    family: 'By morning the Family sits on the throne. The court bows. Nobody dares ask questions.',
    jester: 'They hanged a fool, and the fool won. The folk singers will sing about this for a hundred years.',
    none: 'The court is dismissed before the case is solved. Some secrets stay buried in the sand.',
  },
  covers: [
    'a royal scribe',
    'a spice merchant whose caravan is stranded',
    'a palace musician',
    'the astrologer’s apprentice',
    'the keeper of the royal library',
    'a camel trader from Bikaner',
    'a painter of miniatures',
    'a cook from the palace kitchens',
    'a visiting poet',
    'the keeper of the stables',
    'a jeweller from the bazaar',
    'a young messenger of the court',
  ],
  personas: [
    { name: 'Thakur Bhairon Singh', blurb: 'proud old nobleman', manner: 'stern and proud; quick to take offence', personality: 'firebrand' },
    { name: 'Gulabo', blurb: 'court dancer', manner: 'playful and sharp-eyed; misses nothing', personality: 'charmer' },
    { name: 'Pandit Shastri', blurb: 'royal astrologer', manner: 'mysterious; speaks in omens', personality: 'gambler' },
    { name: 'Mirza Baig', blurb: 'royal treasurer', manner: 'precise; keeps score of everything', personality: 'analyst' },
    { name: 'Kesar Bai', blurb: 'keeper of the royal jewels', manner: 'cool and calculating', personality: 'sceptic' },
    { name: 'Ustad Fakir Khan', blurb: 'folk singer at court', manner: 'warm; answers with a story', personality: 'gossip' },
    { name: 'Rawal Pratap', blurb: 'captain of the guard', manner: 'blunt and suspicious of everyone', personality: 'loyalist' },
    { name: 'Chandni', blurb: 'young maid of the palace', manner: 'timid, but notices things', personality: 'worrier' },
    { name: 'Seth Gopaldas', blurb: 'rich trader stuck by the storm', manner: 'smooth; always making a deal', personality: 'joker' },
    { name: 'Hakim Saheb', blurb: 'palace physician', manner: 'gentle; pleads for calm and mercy', personality: 'mediator' },
    { name: 'Bhola', blurb: 'keeper of the royal elephant', manner: 'simple and loyal; trusts his gut', personality: 'quiet' },
  ],
}

export const ARCS: Record<ArcId, Arc> = { bombay, shimla, goa, neo, jaisalmer }

export const isArc = (raw: unknown): raw is ArcId => typeof raw === 'string' && (ARC_IDS as readonly string[]).includes(raw)
export const arcKey = (id: ArcId) => `arc:${id}`

/**
 * The story for a new game: the host's pick, or one the room hasn't played —
 * and once they've had them all, the one they played longest ago. The room's
 * memory lists keys oldest first, and a replayed story moves to the end.
 */
export function pickArc(choice: ArcChoice, seen: Iterable<string> | undefined, random: (max: number) => number): ArcId {
  if (choice !== 'surprise') return choice
  const played = [...(seen ?? [])].filter((key) => key.startsWith('arc:')).map((key) => key.slice(4)).filter(isArc)
  const fresh = ARC_IDS.filter((id) => !played.includes(id))
  if (fresh.length) return fresh[random(fresh.length)]!
  return played[0]!
}
