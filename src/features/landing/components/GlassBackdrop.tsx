import { useEffect, useRef } from 'react'

import { usePageVisible } from '@/hooks/usePageVisible'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Black glass, with dark spheres drifting through it.
 *
 * The material is the one the panels on top are made of, seen from outside:
 * near-black, glossy, and the only colour anywhere in it caught along the
 * edges where the light wraps — a thin oil-slick fringe that is blue on one
 * side of a curve and violet on the other. Everything is unlit except those
 * rims and one small hot highlight per sphere, which is what makes them read
 * as polished rather than merely round.
 *
 * Drawn rather than photographed: a still of this cannot move and costs a
 * megabyte, and stock art of it carries a licence. It deliberately does *not*
 * pull in three.js — the spheres are not geometry, they are circles shaded as
 * though they were, which is a dozen lines of arithmetic instead of a scene
 * graph, a camera and a renderer.
 */

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const FRAGMENT = `
precision highp float;

uniform vec2 resolution;
uniform float time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

/*
 * A sphere, without any geometry.
 *
 * Inside a circle, the height of a unit hemisphere above the plane is
 * sqrt(1 - d²) — so the surface normal can be read straight off the distance
 * from the centre. That single line is the whole trick: from it the shading
 * below is ordinary lighting maths, and it costs a square root instead of a
 * ray marcher.
 *
 * Returns premultiplied colour in rgb and coverage in a, so the caller can
 * lay one over another in order.
 */
vec4 orb(vec2 uv, vec2 c, float r, float seed, float px) {
  vec2 d = uv - c;
  float dist = length(d) / r;
  /* Antialiased edge — one pixel of falloff, in the same units as dist. */
  float cover = 1.0 - smoothstep(1.0 - px / r, 1.0, dist);
  if (cover <= 0.0) return vec4(0.0);

  vec2 n2 = d / r;
  float z = sqrt(max(0.0, 1.0 - min(dist * dist, 1.0)));
  vec3 n = vec3(n2, z);

  vec3 key = normalize(vec3(-0.42, 0.58, 0.70));
  float diff = max(dot(n, key), 0.0);

  /* The small hot spot. Tight, because a wide one reads as matte plastic. */
  float spec = pow(diff, 90.0);

  /*
   * Fresnel: grazing angles reflect, facing angles do not. On a black sphere
   * this is the only thing that describes the form at all — without it the
   * whole shape disappears into the background it is sitting on.
   */
  float fres = pow(1.0 - z, 3.2);

  /*
   * The oil-slick fringe.
   *
   * Hue rotates with the angle around the rim, so opposite sides of a sphere
   * come up different colours the way a thin film does. Offset per sphere so
   * no two are lit identically.
   */
  float ang = atan(n2.y, n2.x);
  vec3 irid = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + ang * 1.4 + seed * 7.3);

  vec3 col = vec3(0.014)
           + vec3(0.028) * diff
           + irid * fres * 0.62
           + vec3(1.0) * spec * 0.85;

  return vec4(col * cover, cover);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float aspect = resolution.x / resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  /* One pixel, in the same space p is measured in. */
  float px = 1.0 / resolution.y;

  float t = time * 0.06;

  /* The ground: not flat black, so the spheres have something to sit in. */
  float wash = smoothstep(1.15, 0.1, length(uv - vec2(0.28, 0.82)));
  vec3 colour = vec3(0.012, 0.012, 0.016) + vec3(0.020, 0.021, 0.030) * wash;

  /*
   * Nine spheres, laid out by hand rather than hashed.
   *
   * A random scatter clumps and leaves holes; these are placed to frame the
   * middle of the screen, where the content sits, and to keep the largest of
   * them off it. Each drifts on its own slow circle so the arrangement never
   * repeats exactly.
   */
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    float seed = hash(vec2(fi, 3.0));

    /* Spread across the frame, biased to the edges. */
    float bx = hash(vec2(fi, 1.0));
    float by = hash(vec2(fi, 2.0));
    vec2 home = vec2(mix(-0.12, aspect + 0.12, bx), mix(-0.1, 1.1, by));

    /* A slow ellipse, each at its own rate and phase. */
    float sp = 0.4 + seed * 0.8;
    vec2 drift = vec2(
      cos(t * sp + seed * 6.28) * 0.055,
      sin(t * sp * 0.8 + seed * 3.14) * 0.045
    );

    float r = mix(0.07, 0.26, hash(vec2(fi, 4.0)));

    vec4 o = orb(p, home + drift, r, seed, px);
    colour = colour * (1.0 - o.a) + o.rgb;
  }

  /*
   * Grain.
   *
   * Load-bearing, not decoration: gradients this dark band into visible steps
   * on an 8-bit screen, and a pixel of noise dithers the boundary away.
   */
  colour += (hash(gl_FragCoord.xy + fract(time) * 91.7) - 0.5) * 0.016;

  gl_FragColor = vec4(max(colour, 0.0), 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    /*
     * Said out loud, in development.
     *
     * A shader that fails to compile leaves a canvas that is simply black —
     * no exception, no network error, nothing in the console. The failure is
     * indistinguishable from "the design is very dark", which is exactly the
     * wrong thing for a bug to look like. The driver's log names the line.
     */
    if (import.meta.env.DEV) {
      console.error('[GlassBackdrop] shader failed to compile:\n' + gl.getShaderInfoLog(shader))
    }
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/** Half resolution. Nothing here has a hard edge, so the upscale does not show. */
const SCALE = 0.5

export function GlassBackdrop({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const visible = usePageVisible()

  /*
   * Whether the loop should be running, read by the render loop rather than
   * captured by it.
   *
   * This exists because the setup below must **not** depend on visibility. An
   * earlier version listed it as a dependency, which meant every tab switch
   * tore the whole thing down — and teardown ends by deliberately dropping the
   * WebGL context, which a canvas does not come back from on its own. Leaving
   * the tab once was enough to kill the backdrop for the rest of the session.
   *
   * So the context is built once and lives for the life of the component, and
   * visibility only decides whether frames are being asked for.
   */
  const animating = useRef(true)
  animating.current = !reduced && visible

  useEffect(() => {
    const element = canvas.current
    if (!element) return

    const gl = element.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      /* Nothing here is worth a discrete GPU spinning up on a laptop. */
      powerPreference: 'low-power',
    })
    /* No WebGL — the CSS wash behind the canvas is already the fallback, so
       there is nothing to do but leave it showing. */
    if (!gl) return

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    if (!vertex || !fragment) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    /* One triangle covering the screen, not two — it rasterises the same area
       with no seam down the diagonal. */
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uResolution = gl.getUniformLocation(program, 'resolution')
    const uTime = gl.getUniformLocation(program, 'time')

    let frame: number | null = null
    let disposed = false

    /*
     * Resizing the drawing buffer is skipped when nothing changed — it forces
     * a reallocation — but the viewport and the resolution uniform are pushed
     * every time regardless.
     *
     * That split matters. Uniforms belong to the *program*, not the canvas, so
     * a program built while the canvas already happened to be the right size
     * never received one: the early return skipped the upload, `resolution`
     * stayed at its default of zero, and the shader divided `gl_FragCoord` by
     * it and painted NaN — a flat black rectangle with no error anywhere.
     * StrictMode's second mount reproduces exactly that, and so does any
     * remount in production. Re-uploading two floats a frame costs nothing
     * next to being invisible.
     */
    const resize = () => {
      const width = Math.max(1, Math.round(element.clientWidth * SCALE))
      const height = Math.max(1, Math.round(element.clientHeight * SCALE))

      if (element.width !== width || element.height !== height) {
        element.width = width
        element.height = height
      }

      gl.viewport(0, 0, element.width, element.height)
      gl.uniform2f(uResolution, element.width, element.height)
    }

    const paint = (seconds: number) => {
      gl.uniform1f(uTime, seconds)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    /*
     * One loop for the life of the component.
     *
     * It keeps running and simply declines to draw while `animating` is false,
     * rather than being cancelled and restarted — a loop that starts and stops
     * has to be owned by whichever effect noticed the change, and that is the
     * arrangement that got the context destroyed on a tab switch. A parked
     * frame callback costs a branch.
     *
     * Time comes from an accumulator rather than the timestamp, so the folds
     * resume from where they were left instead of jumping forward by however
     * long the tab was in the background.
     */
    let elapsed = 8
    let last: number | null = null

    const loop = (now: number) => {
      if (disposed) return
      frame = requestAnimationFrame(loop)

      const delta = last === null ? 0 : (now - last) / 1000
      last = now

      if (!animating.current) return

      /* Clamped: returning to a tab after ten minutes should not advance the
         sheet by ten minutes in one step. */
      elapsed += Math.min(delta, 1 / 20)
      resize()
      paint(elapsed)
    }

    resize()
    /* A first frame immediately, so the surface is there before the loop has
       had a chance to run — and so it is there at all for a visitor whose
       motion preference means it never will. */
    paint(elapsed)
    frame = requestAnimationFrame(loop)

    const onResize = () => {
      resize()
      if (!animating.current) paint(elapsed)
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      if (frame !== null) cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      gl.deleteBuffer(buffer)
      /*
       * The context itself is deliberately left alone.
       *
       * Forcing it down with `WEBGL_lose_context` looks like good manners and
       * is a trap: a canvas hands out one context for its lifetime, and
       * `getContext` keeps returning that same object after it has been lost.
       * StrictMode mounts every effect twice in development — setup, cleanup,
       * setup — so the second run inherited a dead context and the backdrop
       * never drew a single frame. Any real remount would do the same in
       * production.
       *
       * Releasing the GPU resources above is the part that actually matters;
       * the context is one per page and goes when the page does.
       */
    }
    /*
     * Deliberately empty.
     *
     * Nothing about visibility or motion preference belongs here: they are
     * read through the ref above, per frame. Listing them would rebuild the
     * context every time the tab changed state, and teardown ends by dropping
     * that context on purpose — which a canvas does not recover from.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div aria-hidden className={className}>
      {/* Painted underneath, so there is something there before the first
          frame and something left if WebGL is unavailable entirely. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_10%,#141418,#000_70%)]" />
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  )
}
