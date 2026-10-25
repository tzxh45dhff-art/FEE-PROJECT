import { useEffect, useRef, useState } from 'react'

type Recognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  abort: () => void
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
}
type RecognitionClass = new () => Recognition

const Recognizer: RecognitionClass | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as { SpeechRecognition?: RecognitionClass }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: RecognitionClass }).webkitSpeechRecognition)

export const canHear = !!Recognizer

/**
 * "Let the AIs hear me": the browser's own speech-to-text, on this device.
 *
 * Only while `active` — by day, alive, and not muted — and only finished
 * sentences leave the page, as text. The recogniser stops itself every so
 * often; while active it is simply started again.
 */
export function useHearing(active: boolean, onHeard: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [denied, setDenied] = useState(false)
  const heard = useRef(onHeard)
  useEffect(() => {
    heard.current = onHeard
  }, [onHeard])

  useEffect(() => {
    if (!active || !Recognizer || denied) return
    let on = true
    const rec = new Recognizer()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-IN'
    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]!
        const text = result[0]?.transcript.trim()
        if (result.isFinal && text && text.length > 2) heard.current(text.slice(0, 240))
      }
    }
    rec.onend = () => {
      if (!on) return setListening(false)
      try {
        rec.start()
      } catch {
        setListening(false)
      }
    }
    rec.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        on = false
        setDenied(true)
        setListening(false)
      }
    }
    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
    return () => {
      on = false
      rec.onend = null
      rec.abort()
      setListening(false)
    }
  }, [active, denied])

  return { listening, denied }
}
