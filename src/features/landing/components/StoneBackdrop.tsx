/**
 * The wall the landing page is printed on.
 *
 * An image, not a shader. This began as generated WebGL and went through
 * several rounds of being technically present and visually absent: the noise
 * measured as texture and still read as flat black, because a few levels of
 * variation spread over a whole screen is below what the eye picks up. A photo
 * of stone has its contrast at the scale of a fleck, and the honest way to get
 * that is to ship the fleck rather than to keep re-deriving it.
 *
 * It also removes a WebGL context, an animation loop, and the whole class of
 * bugs where a lost context leaves the page blank — for a surface that never
 * needed to move in the first place.
 *
 * Swapping the texture: replace `src/assets/landing/stone.png`. It is picked
 * up by name, so nothing here needs editing, and it should be square and
 * tileable — the file shipped with the project is synthesised in the frequency
 * domain, which is what makes it repeat without a seam.
 */

const STONE = Object.values(
  import.meta.glob('../../../assets/landing/stone.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>,
)[0]

export function StoneBackdrop({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      {/* Under everything, so the tile is never asked to be opaque on its own
          and a missing file degrades to the page's own dark rather than white. */}
      <div className="absolute inset-0 bg-void" />

      {STONE && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${STONE})`,
            backgroundRepeat: 'repeat',
            /*
             * The tile is 512px and is shown near enough to that size.
             * Stretching it would smooth away the tooth that is the whole
             * point; shrinking it turns the flecks into noise.
             */
            backgroundSize: '520px 520px',
            opacity: 0.9,
          }}
        />
      )}

      {/*
        Corners eased down, so the page's text always sits over the quieter
        part of the wall and no bright fleck lands under a headline.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 30% 20%, transparent 0%, transparent 42%, rgb(0 0 0 / 0.55) 100%)',
        }}
      />
    </div>
  )
}
