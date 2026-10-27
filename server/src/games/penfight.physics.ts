/** Dependency-free capsule physics, shared by the server and local practice.
 * Metres / seconds; fixed 480 Hz ticks. The browser only interpolates replay
 * samples, so rendering performance cannot change a network match's result.
 */

/** A pen, as the solver sees it: a capsule lying flat, free to slide and spin. */
export type Pen = {
  /** Centre of mass, on the desk plane. */
  x: number
  z: number
  /** Linear velocity, m/s. */
  vx: number
  vz: number
  /** Heading in radians — which way the barrel points. */
  angle: number
  /** Spin about the vertical axis, rad/s. */
  omega: number
  /** False once it has gone over an edge; it stops taking part. */
  onDesk: boolean
}

export type Desk = {
  /** Full width across the near edge (X). */
  width: number
  /** Full depth from near to far edge (Z). */
  depth: number
}

export const PEN_LENGTH = 0.145
export const PEN_RADIUS = 0.0052
/** Roughly a real ballpoint: ~14 g for a 14.5 cm barrel. */
export const PEN_MASS = 0.0137

export const DESK: Desk = { width: 0.48, depth: 0.72 }

/**
 * A thin rod about its own centre: I = mL²/12.
 *
 * This is what makes a hit off the tip spin a pen instead of shoving it, and
 * it is the single value most responsible for the game feeling like pens
 * rather than pucks.
 */
const INERTIA = (PEN_MASS * PEN_LENGTH * PEN_LENGTH) / 12

/** Sliding friction against the desk, as a deceleration. */
const FRICTION_A = 1.7
/** Spin dies faster than travel — a spinning pen scrubs along its whole side. */
const ANGULAR_DAMPING = 3.1
/** How bouncy a pen-on-pen hit is. Plastic on plastic is lively but not springy. */
const RESTITUTION = 0.34

export const FIXED_DT = 1 / 480
/** Below this, a pen is treated as stopped rather than crawling forever. */
const REST_SPEED = 0.012
const REST_SPIN = 0.12

export function makePen(x: number, z: number, angle: number): Pen {
  return { x, z, vx: 0, vz: 0, angle, omega: 0, onDesk: true }
}

/** The two ends of a pen's barrel, as points on the desk. */
function endpoints(pen: Pen) {
  const half = (PEN_LENGTH - PEN_RADIUS * 2) / 2
  const dx = Math.cos(pen.angle) * half
  const dz = Math.sin(pen.angle) * half
  return {
    ax: pen.x - dx,
    az: pen.z - dz,
    bx: pen.x + dx,
    bz: pen.z + dz,
  }
}

/**
 * Closest points between two segments.
 *
 * Capsules are segments with a radius, so the entire collision question is
 * "how close do the two centre-lines get, and where" — which is this, and then
 * a comparison against the summed radii.
 */
function closestPoints(
  ax: number, az: number, bx: number, bz: number,
  cx: number, cz: number, dx2: number, dz2: number,
) {
  const ux = bx - ax
  const uz = bz - az
  const vx = dx2 - cx
  const vz = dz2 - cz
  const wx = ax - cx
  const wz = az - cz

  const a = ux * ux + uz * uz
  const b = ux * vx + uz * vz
  const c = vx * vx + vz * vz
  const d = ux * wx + uz * wz
  const e = vx * wx + vz * wz

  const denom = a * c - b * b
  let s = 0
  let t = 0

  /* Parallel barrels give a zero determinant — common when two pens line up
     side by side, so it has to be handled rather than divided by. */
  if (Math.abs(denom) > 1e-12) {
    s = (b * e - c * d) / denom
    t = (a * e - b * d) / denom
  } else {
    s = 0
    t = c > 1e-12 ? e / c : 0
  }

  s = Math.max(0, Math.min(1, s))
  t = Math.max(0, Math.min(1, t))

  /* Clamping one parameter can move the true closest point on the other, so
     each is re-solved against the clamped partner. */
  t = c > 1e-12 ? Math.max(0, Math.min(1, (b * s + e) / c)) : 0
  s = a > 1e-12 ? Math.max(0, Math.min(1, (b * t - d) / a)) : 0

  return {
    p1x: ax + ux * s,
    p1z: az + uz * s,
    p2x: cx + vx * t,
    p2z: cz + vz * t,
  }
}

/** 2D cross product of two vectors — a scalar, standing in for the Y torque. */
const cross = (x1: number, z1: number, x2: number, z2: number) => x1 * z2 - z1 * x2

function collide(a: Pen, b: Pen) {
  if (!a.onDesk || !b.onDesk) return

  const ea = endpoints(a)
  const eb = endpoints(b)
  let { p1x, p1z, p2x, p2z } = closestPoints(
    ea.ax, ea.az, ea.bx, ea.bz,
    eb.ax, eb.az, eb.bx, eb.bz,
  )

  // Parallel barrels touch along a line, not at an arbitrary endpoint.
  // Use the centre of the shared contact span, avoiding artificial spin on
  // a perfectly centred side-on hit.
  const ux = Math.cos(a.angle), uz = Math.sin(a.angle)
  if (Math.abs(Math.sin(a.angle - b.angle)) < 0.015) {
    const length = PEN_LENGTH - PEN_RADIUS * 2
    const c = (eb.ax - ea.ax) * ux + (eb.az - ea.az) * uz
    const d = (eb.bx - ea.ax) * ux + (eb.bz - ea.az) * uz
    const lo = Math.max(0, Math.min(c, d)), hi = Math.min(length, Math.max(c, d))
    if (hi > lo) {
      p1x = ea.ax + ux * (lo + hi) / 2
      p1z = ea.az + uz * (lo + hi) / 2
      const vx = eb.bx - eb.ax, vz = eb.bz - eb.az
      const t = Math.max(0, Math.min(1, ((p1x - eb.ax) * vx + (p1z - eb.az) * vz) / (length * length)))
      p2x = eb.ax + vx * t; p2z = eb.az + vz * t
    }
  }

  let nx = p2x - p1x
  let nz = p2z - p1z
  let dist = Math.hypot(nx, nz)
  const minDist = PEN_RADIUS * 2

  if (dist >= minDist) return

  /* Exactly concentric — pick any axis rather than divide by zero. */
  if (dist < 1e-9) {
    const direction = Math.atan2(b.z - a.z, b.x - a.x)
    nx = Math.cos(direction)
    nz = Math.sin(direction)
    dist = 1e-9
  } else {
    nx /= dist
    nz /= dist
  }

  /* Contact sits between the two surfaces, and the lever arms are measured
     from each centre of mass to it — that is where the spin comes from. */
  const contactX = (p1x + p2x) / 2
  const contactZ = (p1z + p2z) / 2
  const r1x = contactX - a.x
  const r1z = contactZ - a.z
  const r2x = contactX - b.x
  const r2z = contactZ - b.z

  /* Velocity *at the contact point*, which includes what the spin is doing
     there: ω × r, which in 2D is ω(-r.z, r.x). */
  const v1x = a.vx - a.omega * r1z
  const v1z = a.vz + a.omega * r1x
  const v2x = b.vx - b.omega * r2z
  const v2z = b.vz + b.omega * r2x

  const relN = (v2x - v1x) * nx + (v2z - v1z) * nz
  /* Already separating: let it go rather than yanking it back together. */
  // Separate overlapping bodies even when their velocities point apart.
  const overlap = minDist - dist
  const correct = overlap / 2 + 1e-6
  a.x -= nx * correct
  a.z -= nz * correct
  b.x += nx * correct
  b.z += nz * correct
  if (relN >= 0) return

  const rn1 = cross(r1x, r1z, nx, nz)
  const rn2 = cross(r2x, r2z, nx, nz)
  const invMass = 1 / PEN_MASS

  const denom =
    invMass * 2 + (rn1 * rn1) / INERTIA + (rn2 * rn2) / INERTIA
  const j = (-(1 + RESTITUTION) * relN) / denom

  a.vx -= (j * nx) * invMass
  a.vz -= (j * nz) * invMass
  a.omega -= (rn1 * j) / INERTIA

  b.vx += (j * nx) * invMass
  b.vz += (j * nz) * invMass
  b.omega += (rn2 * j) / INERTIA

}

/** The centre of mass must stay supported by the tabletop. */
function fallenOff(pen: Pen, desk: Desk) {
  const halfW = desk.width / 2
  const halfD = desk.depth / 2
  // A rigid pen tips when its centre of mass loses support, not only once
  // its entire length has travelled into empty space.
  return Math.abs(pen.x) > halfW || Math.abs(pen.z) > halfD
}

function integrate(pen: Pen, dt: number, desk: Desk) {
  if (!pen.onDesk) return

  pen.x += pen.vx * dt
  pen.z += pen.vz * dt
  pen.angle += pen.omega * dt

  /* Coulomb friction: a constant deceleration opposing travel, not a
     proportional decay. A pen shoved hard and a pen nudged gently lose speed
     at the same rate, which is why a hard flick carries so much further. */
  const speed = Math.hypot(pen.vx, pen.vz)
  if (speed > 0) {
    const drop = FRICTION_A * dt
    const next = Math.max(0, speed - drop)
    const scale = next / speed
    pen.vx *= scale
    pen.vz *= scale
  }

  pen.omega -= pen.omega * Math.min(1, ANGULAR_DAMPING * dt)

  if (fallenOff(pen, desk)) {
    pen.onDesk = false
    pen.vx = 0
    pen.vz = 0
    pen.omega = 0
  }
}

/** Whether everything has come to rest, so the turn can be handed over. */
export function atRest(pens: Pen[]) {
  return pens.every(
    (pen) =>
      !pen.onDesk ||
      (Math.hypot(pen.vx, pen.vz) < REST_SPEED && Math.abs(pen.omega) < REST_SPIN),
  )
}

/** One exact physics tick. Rendering frame rates never enter this solver. */
export function step(pens: Pen[], desk: Desk = DESK) {
  for (const pen of pens) integrate(pen, FIXED_DT, desk)
  for (let i = 0; i < pens.length; i++) {
    for (let k = i + 1; k < pens.length; k++) collide(pens[i]!, pens[k]!)
  }
}

/** Contact is along the barrel: -1 is the tip, 0 the centre, +1 the cap. */
export type Flick = { dx: number; dz: number; power: number; contact: number }
export function flick(pen: Pen, shot: Flick) {
  const len = Math.hypot(shot.dx, shot.dz)
  if (!pen.onDesk || !Number.isFinite(len) || len < 1e-8) return
  const offset = Math.max(-1, Math.min(1, shot.contact)) * PEN_LENGTH * 0.42
  // A tip shot spends some of its energy on rotation. It must not get free
  // extra energy merely because the same pull landed away from the centre.
  const speed = Math.pow(Math.max(0, Math.min(1, shot.power)), 1.35) * 1.7 / Math.sqrt(1 + 12 * offset * offset / (PEN_LENGTH * PEN_LENGTH))
  pen.vx = shot.dx / len * speed
  pen.vz = shot.dz / len * speed
  pen.omega = cross(Math.cos(pen.angle) * offset, Math.sin(pen.angle) * offset, pen.vx * PEN_MASS, pen.vz * PEN_MASS) / INERTIA
}

export type Position = Pick<Pen, 'x' | 'z' | 'angle' | 'onDesk'>
export type Pair = [Position, Position]
export type Flight = { frames: Pair[]; duration: number }
const position = ({ x, z, angle, onDesk }: Pen): Position => ({ x, z, angle, onDesk })
export function openingPens(): Pair {
  return [position(makePen(-0.025, 0.22, 0)), position(makePen(0.025, -0.22, Math.PI))]
}

/** The server calculates a bounded trajectory once; every screen replays it. */
export function simulate(initial: Pair, seat: 0 | 1, shot: Flick): Flight {
  const pens = initial.map(p => ({ ...p, vx: 0, vz: 0, omega: 0 })) as [Pen, Pen]
  const frames: Pair[] = [[position(pens[0]), position(pens[1])]]
  flick(pens[seat], shot)
  // 30 replay samples / second, sixteen 480 Hz substeps per sample.
  for (let frame = 0; frame < 150; frame++) {
    for (let tick = 0; tick < 16; tick++) step(pens)
    frames.push([position(pens[0]), position(pens[1])])
    if (atRest(pens)) break
  }
  return { frames, duration: (frames.length - 1) * 1000 / 30 }
}

export function sampleFlight(flight: Flight, elapsed: number): Pair {
  const frame = Math.max(0, Math.min(flight.frames.length - 1, elapsed / (1000 / 30)))
  const a = flight.frames[Math.floor(frame)]!
  const b = flight.frames[Math.min(flight.frames.length - 1, Math.floor(frame) + 1)]!
  const t = frame % 1
  return a.map((p, i) => ({
    x: p.x + (b[i]!.x - p.x) * t,
    z: p.z + (b[i]!.z - p.z) * t,
    angle: p.angle + (b[i]!.angle - p.angle) * t,
    onDesk: t < 0.5 ? p.onDesk : b[i]!.onDesk,
  })) as Pair
}

/** A modest practice rival: evaluates shots with exactly the same physics. */
export function chooseBotShot(pens: Pair, seat: 0 | 1): Flick {
  const mine = pens[seat], other = pens[1 - seat]!
  const direct = Math.atan2(other.z - mine.z, other.x - mine.x)
  let best: Flick = { dx: Math.cos(direct), dz: Math.sin(direct), power: 0.6, contact: 0 }
  let bestValue = -Infinity
  for (const angle of [-0.18, -0.08, 0, 0.08, 0.18]) {
    for (const power of [0.4, 0.52, 0.64, 0.76, 0.88, 1]) {
      const shot = { dx: Math.cos(direct + angle), dz: Math.sin(direct + angle), power, contact: 0 }
      const flight = simulate(pens, seat, shot)
      const end = flight.frames.at(-1)!
      const me = end[seat], them = end[1 - seat]!
      const value = (!me.onDesk ? -100 : 0) + (!them.onDesk ? 80 : 0)
        + Math.hypot(them.x - other.x, them.z - other.z) * 10
        - Math.hypot(me.x - them.x, me.z - them.z)
      if (value > bestValue) { bestValue = value; best = shot }
    }
  }
  return best
}
