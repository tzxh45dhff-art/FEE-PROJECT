import { useCallback, useEffect, useRef, useState } from 'react'

import { getSocket } from '@/lib/socket'

/**
 * A full-mesh WebRTC call.
 *
 * Every participant holds a peer connection to every other one, and media goes
 * browser to browser — the server only introduces people and relays SDP/ICE.
 * That keeps the infrastructure at zero, at the cost of scaling: n participants
 * means n−1 uploads each, which is fine for the handful of people a room is for
 * and would not be for forty.
 *
 * Negotiation follows the "perfect negotiation" pattern. Both sides add their
 * tracks as soon as they know about each other, so both try to offer at once;
 * rather than trying to elect an initiator, one side is designated polite and
 * rolls back when it collides. Comparing socket ids gives both ends the same
 * answer without another round trip.
 */

/**
 * STUN discovers your public address. That is enough only when both ends can
 * be reached directly, which on real networks is often false: symmetric NATs,
 * mobile carriers doing CGNAT, and most corporate firewalls all refuse the
 * direct path. Those calls need a TURN relay to forward the media, and without
 * one they negotiate perfectly and then never connect — the exact "it does
 * nothing" failure.
 *
 * The defaults below are Open Relay's free public TURN, which needs no signup
 * and is intended for exactly this. It is shared and rate-limited, so point
 * `VITE_TURN_URL` at your own before anyone relies on it.
 */
const STUN: RTCIceServer = {
  urls: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:global.stun.twilio.com:3478',
  ],
}

function turnServers(): RTCIceServer[] {
  const env = import.meta.env as Record<string, string | undefined>
  const custom = env.VITE_TURN_URL?.trim()

  if (custom) {
    return [
      {
        urls: custom.split(',').map((entry) => entry.trim()).filter(Boolean),
        username: env.VITE_TURN_USERNAME ?? '',
        credential: env.VITE_TURN_CREDENTIAL ?? '',
      },
    ]
  }

  return [
    {
      /* UDP first, then TCP, then TLS on 443 — the last one is what gets
         through firewalls that only allow what looks like HTTPS. */
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turns:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ]
}

const ICE_SERVERS: RTCIceServer[] = [STUN, ...turnServers()]

export type CallPeer = {
  socketId: string
  userId: string
  name: string
  muted: boolean
  cameraOff: boolean
}

export type RemotePeer = CallPeer & {
  stream: MediaStream | null
  /** Connection lost or never established — usually a NAT needing TURN. */
  failed: boolean
}

export type CallStatus = 'idle' | 'requesting' | 'live' | 'denied' | 'unsupported' | 'full'

type Connection = {
  pc: RTCPeerConnection
  polite: boolean
  makingOffer: boolean
  ignoreOffer: boolean
  /**
   * ICE candidates that arrived before the remote description did.
   *
   * `addIceCandidate` throws if there is no remote description yet, and the
   * candidate is then gone for good. Since candidates routinely overtake the
   * offer they belong to, dropping them is a reliable way to produce a call
   * that negotiates fine and then never connects.
   */
  pending: RTCIceCandidateInit[]
  /** Guards the one automatic ICE restart, so it cannot loop. */
  restarted: boolean
}

export function useMeshCall(roomId: string | null) {
  const [status, setStatus] = useState<CallStatus>('idle')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<Record<string, RemotePeer>>({})
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** People on the call you have not joined, for the panel's badge. */
  const [othersOnCall, setOthersOnCall] = useState(0)
  /** Somebody just started one — prompts the rest of the room to come in. */
  const [invite, setInvite] = useState<{ name: string } | null>(null)

  const connections = useRef(new Map<string, Connection>())
  const stream = useRef<MediaStream | null>(null)
  const active = useRef(false)

  const signal = useCallback(
    (to: string, data: unknown) => {
      if (!roomId) return
      getSocket().emit('call:signal', { roomId, to, data })
    },
    [roomId],
  )

  /** Build (or fetch) the connection to one peer and wire its events. */
  const connectionFor = useCallback(
    (peerId: string) => {
      const existing = connections.current.get(peerId)
      if (existing) return existing

      const socket = getSocket()
      /* Gathering a few candidates up front shaves a noticeable pause off the
         first connection, especially when a relay is involved. */
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, iceCandidatePoolSize: 4 })
      /* Deterministic and symmetric: whoever has the smaller socket id is the
         polite one, and both ends compute the same answer independently. */
      const polite = (socket.id ?? '') < peerId

      const entry: Connection = {
        pc,
        polite,
        makingOffer: false,
        ignoreOffer: false,
        pending: [],
        restarted: false,
      }
      connections.current.set(peerId, entry)

      const local = stream.current
      if (local) {
        for (const track of local.getTracks()) pc.addTrack(track, local)
      }

      pc.onnegotiationneeded = async () => {
        try {
          entry.makingOffer = true
          await pc.setLocalDescription()
          signal(peerId, { description: pc.localDescription })
        } catch {
          /* A negotiation that fails here is retried by the next event. */
        } finally {
          entry.makingOffer = false
        }
      }

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) signal(peerId, { candidate })
      }

      pc.ontrack = ({ streams }) => {
        const [remote] = streams
        if (!remote) return
        /*
         * Create the entry if it isn't there yet rather than dropping the
         * stream. `ontrack` fires once; if it lands before the roster event
         * that introduces this peer, discarding it means a permanently black
         * tile for someone who is actually connected.
         */
        setPeers((current) => ({
          ...current,
          [peerId]: {
            socketId: peerId,
            userId: current[peerId]?.userId ?? '',
            name: current[peerId]?.name ?? 'Someone',
            muted: current[peerId]?.muted ?? false,
            cameraOff: current[peerId]?.cameraOff ?? false,
            stream: remote,
            failed: false,
          },
        }))
      }

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState
        const dead = state === 'failed'

        setPeers((current) => {
          const peer = current[peerId]
          if (!peer) return current
          /* Recovered — clear the warning rather than leaving it stuck on. */
          return { ...current, [peerId]: { ...peer, failed: dead } }
        })

        /*
         * One automatic retry on failure.
         *
         * `failed` often means the candidates that were gathered went stale —
         * a network switched from wifi to cellular, or a relay expired. An ICE
         * restart re-gathers and re-offers, which recovers the call without
         * anyone having to hang up. Only the impolite side restarts, so the
         * two ends don't both do it and collide.
         */
        if (dead && !entry.polite && !entry.restarted) {
          entry.restarted = true
          try {
            pc.restartIce()
          } catch {
            /* Older browsers lack restartIce; the tile already says failed. */
          }
        }
      }

      return entry
    },
    [signal],
  )

  const teardownPeer = useCallback((peerId: string) => {
    const entry = connections.current.get(peerId)
    entry?.pc.close()
    connections.current.delete(peerId)
    setPeers((current) => {
      const next = { ...current }
      delete next[peerId]
      return next
    })
  }, [])

  const leave = useCallback(() => {
    active.current = false
    if (roomId) getSocket().emit('call:leave', { roomId })

    for (const [peerId] of connections.current) {
      connections.current.get(peerId)?.pc.close()
    }
    connections.current.clear()

    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null

    setPeers({})
    setLocalStream(null)
    setStatus('idle')
    setMuted(false)
    setCameraOff(false)
  }, [roomId])

  const join = useCallback(async () => {
    if (!roomId || active.current) return

    /*
     * Camera and microphone need a secure context.
     *
     * Browsers only expose `mediaDevices` on HTTPS or on localhost — so the
     * moment a second person opens the app over the LAN at
     * `http://192.168.x.x:5173`, it is simply not there. That is a browser rule
     * with no way around it in code, and reporting it as "this browser cannot
     * make calls" sends people off debugging the wrong thing entirely.
     */
    if (!window.isSecureContext) {
      setStatus('unsupported')
      setError(
        'Camera and mic are blocked on an insecure connection. Browsers only allow them on HTTPS or localhost — open the app over HTTPS (a tunnel works) to call from another machine.',
      )
      return
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === 'undefined') {
      setStatus('unsupported')
      setError('This browser cannot make calls.')
      return
    }

    setStatus('requesting')
    setError(null)

    let media: MediaStream
    try {
      media = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
    } catch {
      /* No camera, or camera in use elsewhere — audio alone is still a call. */
      try {
        media = await navigator.mediaDevices.getUserMedia({ audio: true })
        setCameraOff(true)
      } catch {
        setStatus('denied')
        setError('Camera and microphone are blocked. Allow them and try again.')
        return
      }
    }

    stream.current = media
    active.current = true
    setInvite(null)
    setLocalStream(media)
    setStatus('live')
    getSocket().emit('call:join', { roomId })
  }, [roomId])

  /* Socket wiring. Kept separate from `join` so a peer arriving before we
     finished getting media is still handled. */
  useEffect(() => {
    if (!roomId) return
    const socket = getSocket()

    const addPeer = (peer: CallPeer) =>
      setPeers((current) => ({
        ...current,
        [peer.socketId]: { ...peer, stream: current[peer.socketId]?.stream ?? null, failed: false },
      }))

    const onPeers = ({ peers: list }: { peers: CallPeer[] }) => {
      for (const peer of list) {
        addPeer(peer)
        connectionFor(peer.socketId)
      }
    }

    const onPeerJoined = ({ peer }: { peer: CallPeer }) => {
      if (!active.current || peer.socketId === socket.id) return
      addPeer(peer)
      connectionFor(peer.socketId)
    }

    const onPeerLeft = ({ socketId }: { socketId: string }) => teardownPeer(socketId)

    const onRoster = ({ peers: list }: { peers: CallPeer[] }) => {
      setPeers((current) => {
        const next: Record<string, RemotePeer> = {}
        for (const peer of list) {
          if (peer.socketId === socket.id) continue
          next[peer.socketId] = {
            ...peer,
            stream: current[peer.socketId]?.stream ?? null,
            failed: current[peer.socketId]?.failed ?? false,
          }
        }
        return next
      })
    }

    const onCount = ({ count }: { count: number }) => {
      setOthersOnCall(count)
      /* Nobody left on the call means the prompt is stale — drop it rather
         than invite someone into an empty room. */
      if (count === 0) setInvite(null)
    }

    const onStarted = ({ by }: { by: { name: string } }) => {
      if (!active.current) setInvite({ name: by.name })
    }

    const onFull = () => {
      setStatus('full')
      setError('This call is full.')
      leave()
    }

    const onSignal = async ({ from, data }: { from: string; data: unknown }) => {
      if (!active.current) return
      const entry = connectionFor(from)
      const { pc } = entry
      const payload = data as { description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }

      try {
        if (payload.description) {
          /* Glare: both sides offered at once. The impolite peer ignores the
             incoming offer and keeps its own; the polite one rolls back. */
          const collision =
            payload.description.type === 'offer' && (entry.makingOffer || pc.signalingState !== 'stable')

          entry.ignoreOffer = !entry.polite && collision
          if (entry.ignoreOffer) return

          await pc.setRemoteDescription(payload.description)

          /* Anything that overtook the description can be applied now. */
          for (const candidate of entry.pending.splice(0)) {
            await pc.addIceCandidate(candidate).catch(() => undefined)
          }

          if (payload.description.type === 'offer') {
            await pc.setLocalDescription()
            signal(from, { description: pc.localDescription })
          }
        } else if (payload.candidate) {
          if (!pc.remoteDescription) {
            entry.pending.push(payload.candidate)
            return
          }
          await pc.addIceCandidate(payload.candidate).catch(() => undefined)
        }
      } catch {
        /* A failed exchange shows up as a failed connection state, which the
           tile already reports — nothing useful to do here. */
      }
    }

    socket.on('call:peers', onPeers)
    socket.on('call:peer-joined', onPeerJoined)
    socket.on('call:peer-left', onPeerLeft)
    socket.on('call:roster', onRoster)
    socket.on('call:count', onCount)
    socket.on('call:started', onStarted)
    socket.on('call:full', onFull)
    socket.on('call:signal', onSignal)

    return () => {
      socket.off('call:peers', onPeers)
      socket.off('call:peer-joined', onPeerJoined)
      socket.off('call:peer-left', onPeerLeft)
      socket.off('call:roster', onRoster)
      socket.off('call:count', onCount)
      socket.off('call:started', onStarted)
      socket.off('call:full', onFull)
      socket.off('call:signal', onSignal)
    }
  }, [roomId, connectionFor, teardownPeer, signal, leave])

  /* Leaving the room ends the call — a call outliving the room it belongs to
     would keep the camera light on with nothing on screen to explain it. */
  useEffect(() => {
    return () => {
      if (active.current) leave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const publishState = useCallback(
    (nextMuted: boolean, nextCameraOff: boolean) => {
      if (roomId) getSocket().emit('call:state', { roomId, muted: nextMuted, cameraOff: nextCameraOff })
    },
    [roomId],
  )

  /* Tracks are disabled rather than removed: renegotiating the connection every
     time somebody taps mute would be slow and drop audio for a beat. */
  const toggleMute = useCallback(() => {
    const next = !muted
    stream.current?.getAudioTracks().forEach((track) => {
      track.enabled = !next
    })
    setMuted(next)
    publishState(next, cameraOff)
  }, [muted, cameraOff, publishState])

  const toggleCamera = useCallback(() => {
    const next = !cameraOff
    stream.current?.getVideoTracks().forEach((track) => {
      track.enabled = !next
    })
    setCameraOff(next)
    publishState(muted, next)
  }, [muted, cameraOff, publishState])

  const hasCamera = (localStream?.getVideoTracks().length ?? 0) > 0

  return {
    status,
    error,
    localStream,
    peers: Object.values(peers),
    othersOnCall,
    invite,
    dismissInvite: () => setInvite(null),
    muted,
    cameraOff,
    hasCamera,
    join,
    leave,
    toggleMute,
    toggleCamera,
  }
}
