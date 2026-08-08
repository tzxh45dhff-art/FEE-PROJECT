import { Suspense, lazy } from 'react'
import { Check } from 'lucide-react'

import { ModelBoundary } from '@/components/background/ModelBoundary'
import { groundFor, type HubPreferences } from '@/features/dashboard/hub/usePreferences'
import { ROSTER, type Character } from '@/lib/characters'
import { SCENES, type Scene } from '@/lib/scenes'
import { cn } from '@/lib/utils'

function Empty({ what, folder, naming }: { what: string; folder: string; naming: string }) {
  return (
    <div className="rounded-card border border-dashed border-white/15 bg-white/[0.02] px-5 py-7">
      <p className="font-display text-[0.95rem] font-semibold text-chalk">No {what} yet</p>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-mist">
        Drop files into <code className="font-mono text-[0.78rem] text-chalk">{folder}</code> and
        they show up here on the next reload — nothing to register.
      </p>
      <p className="mt-2 text-[0.78rem] leading-relaxed text-dusk">{naming}</p>
    </div>
  )
}

function Tile({
  selected,
  onClick,
  label,
  badge,
  children,
}: {
  selected: boolean
  onClick: () => void
  label: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group/tile relative overflow-hidden rounded-card border text-left outline-none',
        'transition-[border-color,transform] duration-400 ease-glass',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
        selected
          ? 'border-signal/60'
          : 'border-white/[0.1] hover:-translate-y-0.5 hover:border-white/30',
      )}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-deep">
        {children}
      </span>

      {selected && (
        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-signal text-white">
          <Check aria-hidden className="size-3.5" />
        </span>
      )}

      <span className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="truncate text-[0.8rem] font-medium text-chalk">{label}</span>
        {badge && (
          <span className="shrink-0 rounded-full border border-white/[0.12] px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-dusk">
            {badge}
          </span>
        )}
      </span>
    </button>
  )
}

function ScenePreview({ scene }: { scene: Scene }) {
  if (scene.layers.length === 0) {
    return (
      <span className="grid size-full place-items-center bg-[radial-gradient(120%_90%_at_50%_120%,var(--color-grade-blue),var(--color-void))]">
        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-dusk">video</span>
      </span>
    )
  }

  /* Every plane stacked, so the tile previews the composite you'll actually
     see rather than just the sky. */
  return (
    <>
      {scene.layers.map((layer) => (
        <span
          key={layer.name}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${layer.url})` }}
        />
      ))}
    </>
  )
}

const CharacterPreviewCanvas = lazy(
  () => import('@/features/dashboard/hub/CharacterPreviewCanvas'),
)

/** A stand-in with the right silhouette, shown while the model streams in. */
function Waiting() {
  return (
    <span className="grid size-full place-items-end justify-center pb-2">
      <span className="glass h-[72%] w-[26%] animate-pulse rounded-t-full ring-1 ring-inset ring-white/20" />
    </span>
  )
}

function CharacterPreview({ character, live }: { character: Character; live: boolean }) {
  /*
   * A rigged character gets a real turntable of itself. Rendering every tile at
   * once would be one WebGL context each — browsers cap those around sixteen —
   * so only the selected tile goes live and the rest keep the cutout or the
   * silhouette.
   */
  if (character.glb && live) {
    return (
      <span className="absolute inset-0">
        <ModelBoundary fallback={<Waiting />}>
          <Suspense fallback={<Waiting />}>
            <CharacterPreviewCanvas url={character.glb} />
          </Suspense>
        </ModelBoundary>
      </span>
    )
  }

  if (character.png) {
    return (
      <span
        className="absolute inset-0 bg-contain bg-bottom bg-no-repeat"
        style={{ backgroundImage: `url(${character.png})` }}
      />
    )
  }

  return <Waiting />
}

/**
 * How this user dresses their hub.
 *
 * Backdrop and character are the only two settings here because they are the
 * only two that currently change anything real. Room-level settings belong to a
 * room, not to you, so they are not in this panel.
 */
export function HubSettings({
  preferences,
  onChange,
  activeCharacterId,
}: {
  preferences: HubPreferences
  onChange: (patch: Partial<HubPreferences>) => void
  /**
   * Who is *actually* standing in the hub. Not the same as the stored
   * preference — with nothing chosen yet the hub picks one from your user id,
   * and the picker has to agree with what you can see behind it.
   */
  activeCharacterId?: string
}) {
  const activeScene = preferences.sceneId ?? SCENES[0]?.id

  return (
    <div className="flex flex-col gap-9">
      <section>
        <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-chalk">
          Backdrop
        </h3>
        <p className="mt-1.5 text-[0.82rem] leading-relaxed text-mist">
          Where you stand. Scenes with separate depth planes get real parallax.
        </p>

        <div className="mt-4">
          {SCENES.length === 0 ? (
            <Empty
              what="scenes"
              folder="src/assets/scenes/"
              naming="Name them lake-far.png, lake-mid.png, lake-near.png to get three depth planes — or just lake.png for one."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {SCENES.map((scene) => (
                <Tile
                  key={scene.id}
                  label={scene.label}
                  badge={
                    scene.video
                      ? 'video'
                      : scene.layers.length > 1
                        ? `${scene.layers.length} planes`
                        : undefined
                  }
                  selected={scene.id === activeScene}
                  onClick={() => onChange({ sceneId: scene.id })}
                >
                  <ScenePreview scene={scene} />
                </Tile>
              ))}
            </div>
          )}
        </div>

        {activeScene && (
          <label className="mt-5 block">
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-[0.85rem] font-medium text-chalk">Ground line</span>
              <span className="font-mono text-[0.75rem] text-dusk">
                {Math.round(groundFor(preferences, activeScene) * 100)}%
              </span>
            </span>
            <span className="mt-1 block text-[0.78rem] leading-relaxed text-mist">
              Where the floor is in this photo. Slide until your character's feet land on it.
            </span>
            <input
              type="range"
              min={50}
              max={95}
              step={1}
              value={Math.round(groundFor(preferences, activeScene) * 100)}
              onChange={(event) =>
                onChange({
                  ground: {
                    ...preferences.ground,
                    [activeScene]: Number(event.target.value) / 100,
                  },
                })
              }
              className="mt-3 w-full accent-signal"
            />
          </label>
        )}
      </section>

      <section>
        <h3 className="font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-chalk">
          Your character
        </h3>
        <p className="mt-1.5 text-[0.82rem] leading-relaxed text-mist">
          Who stands in the middle. Rigged characters breathe and turn toward you.
        </p>

        <div className="mt-4">
          {ROSTER.length === 0 ? (
            <Empty
              what="characters"
              folder="src/assets/characters/"
              naming="arjun.glb for a rigged character, arjun.png for a flat cutout. Both together means the cutout covers the moment before the model loads."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {ROSTER.map((character) => (
                <Tile
                  key={character.id}
                  label={character.label}
                  badge={character.glb ? '3D' : undefined}
                  selected={character.id === activeCharacterId}
                  onClick={() => onChange({ characterId: character.id })}
                >
                  <CharacterPreview
                    character={character}
                    live={character.id === activeCharacterId}
                  />
                </Tile>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
