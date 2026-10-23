import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { appleSongs, lastfmSongs } from '../src/services/songMetadata.service.js'
import { freshSongPool, matchesRecording, parseVideoDuration } from '../src/services/songQuizCatalog.service.js'
import type { SongIdentity } from '../src/services/songQuizPacks.js'

const song: SongIdentity = { title: 'Born to Shine', artist: 'Diljit Dosanjh', duration: 213, year: 2020, category: 'punjabi' }

describe('song catalogue quality', () => {
  it('reads only individual songs by the requested artist, with clean canonical titles', () => {
    const rows = appleSongs([
      { kind: 'song', trackName: 'Lover (From "Movie")', artistName: 'Diljit Dosanjh & Other Artist', trackTimeMillis: 190000, releaseDate: '2021-01-01' },
      { kind: 'album', trackName: 'Best of Diljit Dosanjh', artistName: 'Diljit Dosanjh' },
      { kind: 'song', trackName: 'Something Else', artistName: 'Someone Else', trackTimeMillis: 180000 },
      { kind: 'song', trackName: 'Greatest Hits', artistName: 'Diljit Dosanjh', trackTimeMillis: 3600000 },
      { kind: 'song', trackName: 'Lover (Slowed + Reverb)', artistName: 'Diljit Dosanjh', trackTimeMillis: 240000 },
    ], 'Diljit Dosanjh', 'punjabi')
    assert.deepEqual(rows.map((row) => row.title), ['Lover'])
    assert.equal(rows[0]!.duration, 190)
  })

  it('uses Last.fm popular track identities without mistaking them for upload names', () => {
    const rows = lastfmSongs([
      { name: 'Born to Shine', artist: { name: 'Diljit Dosanjh' }, duration: '213' },
      { name: 'A Cover', artist: { name: 'Wrong Artist' } },
    ], 'Diljit Dosanjh', 'punjabi')
    assert.deepEqual(rows, [ { ...song, year: null, rank: 1 } ])
  })

  it('excludes current releases from the 90s and 2000s pack', () => {
    const tracks = [1999, 2024].map((year) => ({ kind: 'song', trackName: `Song ${year}`, artistName: 'Britney Spears', trackTimeMillis: 200000, releaseDate: `${year}-01-01` }))
    assert.deepEqual(appleSongs(tracks, 'Britney Spears', 'throwbacks').map((track) => track.year), [1999])
  })

  it('does not treat every song by a Hindi playback singer as Bollywood', () => {
    const rows = appleSongs([
      { kind: 'song', trackName: 'Pal', artistName: 'Shreya Ghoshal', primaryGenreName: 'Bollywood', trackTimeMillis: 240000 },
      { kind: 'song', trackName: 'Amar Gaane Bhorbela', artistName: 'Shreya Ghoshal', primaryGenreName: 'Regional Indian', trackTimeMillis: 207000 },
    ], 'Shreya Ghoshal', 'bollywood')
    assert.deepEqual(rows.map((row) => row.title), ['Pal'])
  })

  it('rejects compilations, covers, wrong artists and wrong titles before ranking', () => {
    const result = { id: 'video', title: 'Born to Shine (Official Audio) Diljit Dosanjh', channel: 'Diljit Dosanjh', thumbnail: '' }
    assert.ok(matchesRecording(result, song))
    for (const title of ['90s Greatest Hits Album Diljit Dosanjh Born to Shine', 'Born to Shine Diljit Dosanjh Cover', 'Lover Diljit Dosanjh Official Audio', 'Born to Shine Other Artist Official Audio']) {
      assert.equal(matchesRecording({ ...result, title, channel: 'Other Artist' }, song), false, title)
    }
    assert.equal(parseVideoDuration('PT1H20M5S'), 4805)
  })

  it('rejects long or unembeddable uploads even if their title is an exact match', async () => {
    const pool = await freshSongPool(['punjabi'], {
      discover: async () => [song],
      search: async () => ['long', 'blocked', 'good'].map((id) => ({ id, title: 'Born to Shine Diljit Dosanjh Official Audio', channel: 'Diljit Dosanjh - Topic', thumbnail: '' })),
      inspect: async () => new Map([
        ['long', { duration: 3600, embeddable: true }],
        ['blocked', { duration: 213, embeddable: false }],
        ['good', { duration: 220, embeddable: true }],
      ]),
    })
    assert.equal(pool.length, 1)
    assert.equal(pool[0]!.ref, 'good')
    assert.equal(pool[0]!.title, 'Born to Shine')
  })

  it('never falls back to raw uploads when the metadata provider is down', async () => {
    let searched = false
    const pool = await freshSongPool(['punjabi'], {
      discover: async () => { throw new Error('provider unavailable') },
      search: async () => { searched = true; return [] },
    })
    assert.deepEqual(pool, [])
    assert.equal(searched, false)
  })
})
