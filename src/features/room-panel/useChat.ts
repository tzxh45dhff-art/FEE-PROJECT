import { useCallback, useEffect, useRef, useState } from 'react'

import { getSocket } from '@/lib/socket'

export type ChatMessage = {
  id: string
  body: string
  createdAt: string
  author: { id: string; name: string }
}

/** How long to wait after the last keystroke before saying you stopped. */
const TYPING_IDLE_MS = 2200

export function useChat(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState<string[]>([])
  const [unread, setUnread] = useState(0)

  /* Whether the panel is on screen. Messages that arrive while it is closed
     count as unread; the ref keeps the socket handler from being rebound
     every time the panel opens. */
  const watching = useRef(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSent = useRef(false)

  useEffect(() => {
    setMessages([])
    setTyping([])
    setUnread(0)
    if (!roomId) return

    const socket = getSocket()

    const onHistory = ({ roomId: id, messages: list }: { roomId: string; messages: ChatMessage[] }) => {
      if (id === roomId) setMessages(list)
    }

    const onMessage = ({ roomId: id, message }: { roomId: string; message: ChatMessage }) => {
      if (id !== roomId) return
      /* Guard against a double-delivery leaving two identical bubbles. */
      setMessages((current) =>
        current.some((entry) => entry.id === message.id) ? current : [...current, message],
      )
      if (!watching.current) setUnread((count) => count + 1)
    }

    const onTyping = ({
      roomId: id,
      user,
      typing: isTyping,
    }: {
      roomId: string
      user: { id: string; name: string }
      typing: boolean
    }) => {
      if (id !== roomId) return
      setTyping((current) => {
        const without = current.filter((name) => name !== user.name)
        return isTyping ? [...without, user.name] : without
      })
    }

    const onDeleted = ({ roomId: id, id: messageId }: { roomId: string; id: string }) => {
      if (id === roomId) setMessages((current) => current.filter((entry) => entry.id !== messageId))
    }
    const onCleared = ({ roomId: id }: { roomId: string }) => {
      if (id === roomId) setMessages([])
    }

    const request = () => socket.emit('chat:history', { roomId })

    socket.on('chat:history', onHistory)
    socket.on('chat:message', onMessage)
    socket.on('chat:typing', onTyping)
    socket.on('chat:deleted', onDeleted)
    socket.on('chat:cleared', onCleared)
    socket.on('connect', request)
    request()

    return () => {
      socket.off('chat:history', onHistory)
      socket.off('chat:message', onMessage)
      socket.off('chat:typing', onTyping)
      socket.off('chat:deleted', onDeleted)
      socket.off('chat:cleared', onCleared)
      socket.off('connect', request)
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [roomId])

  const send = useCallback(
    (body: string) => {
      const text = body.trim()
      if (!roomId || !text) return
      getSocket().emit('chat:send', { roomId, body: text })
      lastSent.current = false
      if (typingTimer.current) clearTimeout(typingTimer.current)
    },
    [roomId],
  )

  /** Debounced both ways: one "started" per burst, one "stopped" when it ends. */
  const noteTyping = useCallback(() => {
    if (!roomId) return
    const socket = getSocket()

    if (!lastSent.current) {
      socket.emit('chat:typing', { roomId, typing: true })
      lastSent.current = true
    }

    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket.emit('chat:typing', { roomId, typing: false })
      lastSent.current = false
    }, TYPING_IDLE_MS)
  }, [roomId])

  /** Take back one message — yours, or any if the room is yours. */
  const remove = useCallback(
    (id: string) =>
      new Promise<string | null>((resolve) => {
        if (!roomId) return resolve(null)
        getSocket()
          .timeout(8_000)
          .emit('chat:delete', { roomId, id }, (err: Error | null, reply?: { error?: string }) => resolve(err ? 'Couldn’t reach the server — try again' : (reply?.error ?? null)))
      }),
    [roomId],
  )

  /** Clear the whole conversation for everyone (the room's owner only). */
  const clear = useCallback(
    () =>
      new Promise<string | null>((resolve) => {
        if (!roomId) return resolve(null)
        getSocket()
          .timeout(8_000)
          .emit('chat:clear', { roomId }, (err: Error | null, reply?: { error?: string }) => resolve(err ? 'Couldn’t reach the server — try again' : (reply?.error ?? null)))
      }),
    [roomId],
  )

  const setWatching = useCallback((value: boolean) => {
    watching.current = value
    if (value) setUnread(0)
  }, [])

  return { messages, typing, unread, send, noteTyping, setWatching, remove, clear }
}
