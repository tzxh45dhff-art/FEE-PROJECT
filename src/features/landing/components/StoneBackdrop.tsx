import { useEffect, useRef } from 'react'

/**
 * Black slate, lit from one side.
 *
 * A dark page needs something under it or the eye reads it as a switched-off
 * screen. This is a rock face: broad slabs catching a little light, a grain
 * over the whole of it, and a few fissures where the stone has split. Almost
 * all of it sits within a few percent of black — the texture is only ever
 * implied, because anything legible here would compete with the words.
 *
 * Drawn rather than photographed. A stone texture is the single most
 * compressible thing there is and still costs a few hundred kilobytes as a
 * JPEG, tiles visibly at full-screen sizes, and comes with a licence; this is
 * a few hundred bytes of arithmetic that fits any viewport exactly and has no
 * seam to hide.
 *
 * Painted once, not animated. Rock does not move, so there is no loop here at
 * all — which is why this carries none of the visibility and reduced-motion
 * machinery the drifting backdrops needed, and cannot lose its context to a
 * tab switch. It redraws on resize and at no other time.
 */

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const FRAGMENT = `
precision highp float;

uniform vec2 resolution;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

/* Value noise. Smoothstepped rather than linear, so the octaves stack into
   something that looks eroded instead of faceted. */
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    sum += amp * noise(p);
    /* Not exactly two: an integer ratio lines the octaves up on the same grid
       and the repeat becomes visible as a plaid. */
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

/*
 * Fissures.
 *
 * Ridged noise — folding the field at its midpoint turns the smooth zero
 * crossings into creases, which is what a crack is. Squaring sharpens them
 * from valleys into lines.
 */
float fissures(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    float n = noise(p);
    n = 1.0 - abs(n * 2.0 - 1.0);
    sum += amp * n * n;
    p *= 2.11;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  /* Measured against height on both axes, so the stone keeps its proportions
     instead of stretching into streaks on a wide window. */
  vec2 p = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;

  /*
   * Domain warp: noise displaced by more noise.
   *
   * Straight fbm gives an even, cloud-like field that reads as fog. Bending
   * the sample point first is what produces the uneven, torn structure of a
   * broken surface, where detail bunches along some edges and stretches out
   * across others.
   */
  vec2 warp = vec2(fbm(p * 2.0 + 11.3), fbm(p * 2.0 + 23.7)) - 0.5;
  vec2 q = p + warp * 0.45;

  /*
   * Every band is stretched away from its midpoint before it is used.
   *
   * Summed octaves pile up around their own mean the way any sum of random
   * terms does, so six of them land almost everything within a couple of
   * percent of 0.5. Used raw that paints a field which measures as texture —
   * the variation is genuinely there — and reads as flat black, because a few
   * levels out of 255 is below what the eye picks up across a large area.
   * Expanding about the centre is what turns it into contrast you can see.
   */
  float slabs = (fbm(q * 2.3) - 0.5) * 2.5;
  float rough = (fbm(q * 7.5) - 0.5) * 2.3;

  /* Two grains off the pixel grid rather than one, so the surface has both a
     clustered tooth and a fine sand over it instead of a single even hiss.
     Pixel-based, so they stay the same size on screen whatever the viewport
     does, exactly as the tooth of a real surface would. */
  float tooth = (noise(gl_FragCoord.xy * 0.42) - 0.5) * 2.0;
  float sand = (noise(gl_FragCoord.xy * 1.15) - 0.5) * 2.0;

  float lum = 0.105
    + slabs * 0.135
    + rough * 0.072
    + tooth * 0.030
    + sand * 0.020;

  /* Cracks are the absence of a lit surface, so they subtract. */
  lum -= smoothstep(0.42, 0.92, fissures(q * 3.1)) * 0.075;

  /* One broad soft source up and to the left, falling away across the face.
     Without it the texture is uniform and reads as noise rather than as a
     surface with a direction to it. */
  float lit = 1.0 - smoothstep(0.0, 1.45, length(p - vec2(-0.3, 0.32)));
  lum += lit * 0.055;

  /* Corners well down, so the page's content always sits on the darkest part
     and nothing at the edge pulls the eye outward. */
  float vignette = smoothstep(1.35, 0.2, length(vec2(p.x * 0.8, p.y)));
  lum *= mix(0.28, 1.0, vignette);

  lum = clamp(lum, 0.004, 0.5);

  /* A touch warm. Neutral grey over a whole screen goes slightly blue by
     contrast with the warm accents on top of it. */
  vec3 col = vec3(lum) * vec3(1.035, 1.0, 0.985);

  /*
   * Dither.
   *
   * Eight bits per channel across a gradient this dark quantises into visible
   * bands — the shallower the ramp, the wider each band. A sub-LSB of noise
   * breaks them up, and is itself invisible.
   */
  gl_FragColor = vec4(col + (hash(gl_FragCoord.xy) - 0.5) / 255.0, 1.0);
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
      console.error('[StoneBackdrop] shader failed to compile:\n' + gl.getShaderInfoLog(shader))
    }
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * Rendered at CSS-pixel resolution.
 *
 * The earlier drifting backdrops ran at half and upscaled, which cost nothing
 * because nothing in them had an edge. Grain does: at half resolution it
 * smears into a wash and the surface stops reading as stone. One full-size
 * draw is affordable precisely because it happens once.
 */
const SCALE = 1

export function StoneBackdrop({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)

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

    /*
     * The resolution uniform is pushed on every draw, not only when the
     * drawing buffer was actually reallocated.
     *
     * Uniforms belong to the program rather than to the canvas, so a program
     * built while the canvas already happened to be the right size would
     * otherwise never receive one: it would stay at its default of zero, the
     * shader would divide by it, and the result is a flat black rectangle with
     * no error reported anywhere. StrictMode's second mount reproduces that
     * exactly, and so does any remount in production.
     */
    const draw = () => {
      const width = Math.max(1, Math.round(element.clientWidth * SCALE))
      const height = Math.max(1, Math.round(element.clientHeight * SCALE))

      if (element.width !== width || element.height !== height) {
        element.width = width
        element.height = height
      }

      gl.viewport(0, 0, element.width, element.height)
      gl.uniform2f(uResolution, element.width, element.height)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    draw()

    /*
     * Coalesced onto a frame.
     *
     * A drag-resize fires continuously, and each one here reallocates the
     * drawing buffer and repaints every pixel. Doing that per event is what
     * makes a window drag stutter; doing it once per frame is free.
     */
    let queued: number | null = null
    const onResize = () => {
      if (queued !== null) return
      queued = requestAnimationFrame(() => {
        queued = null
        draw()
      })
    }
    window.addEventListener('resize', onResize)

    return () => {
      if (queued !== null) cancelAnimationFrame(queued)
      window.removeEventListener('resize', onResize)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      gl.deleteBuffer(buffer)
      /*
       * The context itself is deliberately left alone.
       *
       * Forcing it down with WEBGL_lose_context looks like good manners and is
       * a trap: a canvas hands out one context for its lifetime, and
       * getContext keeps returning that same object after it has been lost.
       * StrictMode mounts every effect twice in development — setup, cleanup,
       * setup — so the second run would inherit a dead context and never draw
       * a single frame.
       *
       * Releasing the GPU resources above is the part that actually matters;
       * the context is one per page and goes when the page does.
       */
    }
  }, [])

  return (
    <div aria-hidden className={className}>
      {/* Painted underneath, so there is something there before the first
          frame and something left if WebGL is unavailable entirely. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_22%_14%,#131315,#000_72%)]" />
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  )
}
