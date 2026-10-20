/** The room's pet, as the screen receives it — mirrors the server's pet.rules and pet.model. */

export type Species = 'cat' | 'pup' | 'bunny' | 'panda'
export type Food = 'cookie' | 'fish' | 'carrot' | 'bamboo' | 'icecream' | 'pizza'
export type PetAction = 'feed' | 'pet' | 'poke' | 'tickle' | 'play' | 'talk'
export type Reaction = 'yum' | 'love' | 'full' | 'purr' | 'ouch' | 'giggle' | 'grumpy' | 'play' | 'listen' | 'sulk'
export type Mood = 'hungry' | 'sad' | 'happy' | 'okay'
export type Stage = 'baby' | 'kid' | 'teen' | 'grown'

/** Every face the pet can pull. */
export type Expression =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'hungry'
  | 'ouch'
  | 'giggle'
  | 'grumpy'
  | 'purr'
  | 'yum'
  | 'love'
  | 'full'
  | 'listen'
  | 'talk'
  | 'sleepy'

export type Pet = {
  name: string
  species: Species
  bornAt: number
  hunger: number
  happiness: number
  xp: number
  stage: Stage
  progress: number
  mood: Mood
}

export type Person = { id: string; name: string }

export type PetEvent = { id: string; roomId: string; by: Person; action: PetAction; reaction: Reaction; food: Food | null; at: number }
