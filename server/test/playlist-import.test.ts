/**
 * Importing a Spotify or Apple Music playlist: which links are understood, and
 * which YouTube result is taken to be the song.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parsePlaylistLink, pickMatch } from '../src/services/playlistImport.service.js'
import type { SearchResult } from '../src/services/sources.service.js'

const r = (id: string, title: string, channel: string, duration?: number): SearchResult => ({
  id,
  title,
  channel,
  thumbnail: '',
  duration,
  track: true,
})

describe('playlist links', () => {
  it('reads Spotify playlists and albums, with or without a locale or share token', () => {
    assert.deepEqual(parsePlaylistLink('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc'), {
      service: 'spotify',
      kind: 'playlist',
      id: '37i9dQZF1DXcBWIGoYBM5M',
    })
    assert.deepEqual(parsePlaylistLink('https://open.spotify.com/intl-de/album/4yP0hdKOZPNshxUOjY0cZj'), {
      service: 'spotify',
      kind: 'album',
      id: '4yP0hdKOZPNshxUOjY0cZj',
    })
  })

  it('reads Apple Music playlists and albums', () => {
    assert.deepEqual(parsePlaylistLink('https://music.apple.com/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb'), {
      service: 'apple',
      url: 'https://music.apple.com/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb',
    })
    assert.equal(parsePlaylistLink('https://music.apple.com/us/album/after-hours/1499378108')?.service, 'apple')
  })

  it('refuses single tracks and other sites', () => {
    assert.equal(parsePlaylistLink('https://open.spotify.com/track/2sFepQNyl1WjpROruP8bJ0'), null)
    assert.equal(parsePlaylistLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), null)
    assert.equal(parsePlaylistLink('not a link'), null)
  })
})

describe('matching a song on YouTube Music', () => {
  const wanted = { title: 'Blinding Lights', artist: 'The Weeknd', duration: 200 }

  it('prefers the result whose length matches', () => {
    const hit = pickMatch(
      [r('long', 'Blinding Lights (Extended Mix)', 'The Weeknd', 420), r('right', 'Blinding Lights', 'The Weeknd', 201)],
      wanted,
    )
    assert.equal(hit?.id, 'right')
  })

  it('gives up rather than take a recording of a very different length', () => {
    assert.equal(pickMatch([r('mix', 'Blinding Lights', 'The Weeknd', 3600)], wanted), null)
  })

  it('takes the top result when the service gave no length', () => {
    assert.equal(pickMatch([r('only', 'Blinding Lights', 'The Weeknd', 201)], { ...wanted, duration: null })?.id, 'only')
  })
})
