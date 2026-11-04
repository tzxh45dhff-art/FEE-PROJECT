import { a as e, i as t, r as n, t as r } from "./rooms-CRfnBsqC.js";
import {
  $ as i,
  A as a,
  B as o,
  C as s,
  D as c,
  E as l,
  F as u,
  G as d,
  H as f,
  I as p,
  J as m,
  K as h,
  L as g,
  M as _,
  N as v,
  O as y,
  P as b,
  Q as ee,
  R as x,
  S,
  T as te,
  U as ne,
  V as re,
  W as ie,
  X as ae,
  Y as oe,
  Z as se,
  _ as ce,
  a as le,
  at as ue,
  b as de,
  c as fe,
  ct as pe,
  d as me,
  et as he,
  f as C,
  g as ge,
  h as _e,
  i as ve,
  it as w,
  j as ye,
  k as be,
  l as xe,
  m as Se,
  n as Ce,
  nt as we,
  o as Te,
  ot as Ee,
  p as De,
  q as Oe,
  r as ke,
  rt as Ae,
  s as je,
  st as T,
  t as Me,
  tt as Ne,
  u as Pe,
  v as Fe,
  w as Ie,
  x as E,
  y as Le,
  z as Re,
} from "./three-BbEF-ZsN.js";
var ze = `G-8K3H62CSPH`,
  Be = null;
function Ve(e) {
  let t = e.dataset;
  return t.tile
    ? `tile_${t.tile}`
    : t.char
      ? `char_${t.char}`
      : t.opp
        ? `opp_${t.opp}`
        : t.stage
          ? `stage_${t.stage}`
          : t.diff
            ? `difficulty_${t.diff}`
            : e.id
              ? e.id
              : (e.textContent ?? ``).trim().slice(0, 30) ||
                e.tagName.toLowerCase();
}
function He() {}
function D(e, t) {
  if (typeof window < `u` && Be)
    try {
      Be(`event`, e, t ?? {});
    } catch {}
}
function Ue(e) {
  D(`page_view`, {
    page_title: e,
    page_location: `${location.origin}${location.pathname}#${e}`,
  });
}
var We = (e) => Math.round((performance.now() - e) / 1e3),
  Ge = 1 / 60,
  O = 6.5,
  Ke = 0.72,
  qe = 2.6,
  Je = 0.45,
  Ye = 0.45,
  Xe = 0.07,
  Ze = 0.97,
  Qe = 1.2,
  $e = 0.3,
  et = null;
function tt() {
  if (et) return et;
  let e = document.createElement(`canvas`);
  e.width = e.height = 128;
  let t = e.getContext(`2d`),
    n = t.createRadialGradient(64, 64, 0, 64, 64, 64);
  return (
    n.addColorStop(0, `rgba(255,255,255,1)`),
    n.addColorStop(0.25, `rgba(255,255,255,0.75)`),
    n.addColorStop(0.6, `rgba(255,255,255,0.18)`),
    n.addColorStop(1, `rgba(255,255,255,0)`),
    (t.fillStyle = n),
    t.fillRect(0, 0, 128, 128),
    (et = new _e(e)),
    et
  );
}
function nt(e, t, n = 1) {
  let r = new he(
    new Ne({
      map: tt(),
      color: e,
      transparent: !0,
      opacity: n,
      blending: 2,
      depthWrite: !1,
    }),
  );
  return (r.scale.setScalar(t), r);
}
var rt = 3e3,
  it = class {
    constructor(t) {
      (e(this, `points`, void 0),
        e(this, `pos`, new Float32Array(rt * 3)),
        e(this, `col`, new Float32Array(rt * 3)),
        e(this, `size`, new Float32Array(rt)),
        e(this, `alpha`, new Float32Array(rt)),
        e(this, `vel`, new Float32Array(rt * 3)),
        e(this, `life`, new Float32Array(rt)),
        e(this, `maxLife`, new Float32Array(rt)),
        e(this, `grav`, new Float32Array(rt)),
        e(this, `drag`, new Float32Array(rt)),
        e(this, `baseSize`, new Float32Array(rt)),
        e(this, `cursor`, 0),
        e(this, `tmpColor`, new Le()));
      let n = new Se();
      (n.setAttribute(`position`, new De(this.pos, 3)),
        n.setAttribute(`color`, new De(this.col, 3)),
        n.setAttribute(`size`, new De(this.size, 1)),
        n.setAttribute(`alpha`, new De(this.alpha, 1)));
      let r = new se({
        uniforms: { map: { value: tt() } },
        vertexShader: `
        attribute float size; attribute float alpha; attribute vec3 color;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vColor = color; vAlpha = alpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (420.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
        fragmentShader: `
        uniform sampler2D map; varying vec3 vColor; varying float vAlpha;
        void main() {
          vec4 t = texture2D(map, gl_PointCoord);
          gl_FragColor = vec4(vColor * t.rgb * vAlpha * 1.6, t.a * vAlpha);
        }`,
        blending: 2,
        depthWrite: !1,
        transparent: !0,
      });
      ((this.points = new ie(n, r)),
        (this.points.frustumCulled = !1),
        t.add(this.points));
    }
    emit(e, t) {
      this.tmpColor.set(t.color);
      for (let n = 0; n < t.count; n++) {
        let n = this.cursor;
        this.cursor = (this.cursor + 1) % rt;
        let r = t.jitter ?? 0;
        ((this.pos[n * 3] = e.x + (Math.random() - 0.5) * r * 2),
          (this.pos[n * 3 + 1] = e.y + (Math.random() - 0.5) * r * 2),
          (this.pos[n * 3 + 2] = e.z + (Math.random() - 0.5) * r * 2));
        let i = Math.random() * 2 - 1,
          a = Math.random() * 2 - 1,
          o = Math.random() * 2 - 1,
          s = Math.hypot(i, a, o) || 1;
        if (((i /= s), (a /= s), (o /= s), t.dir)) {
          let e = t.spread ?? 0.5;
          ((i = t.dir.x + i * e), (a = t.dir.y + a * e), (o = t.dir.z + o * e));
        }
        let c = t.speed * (0.4 + Math.random() * 0.8);
        ((this.vel[n * 3] = i * c),
          (this.vel[n * 3 + 1] = a * c),
          (this.vel[n * 3 + 2] = o * c));
        let l = t.life * (0.6 + Math.random() * 0.6);
        ((this.life[n] = l),
          (this.maxLife[n] = l),
          (this.grav[n] = t.gravity ?? 0),
          (this.drag[n] = t.drag ?? 1.5),
          (this.baseSize[n] = t.size * (0.6 + Math.random() * 0.8)));
        let u = 0.85 + Math.random() * 0.3;
        ((this.col[n * 3] = this.tmpColor.r * u),
          (this.col[n * 3 + 1] = this.tmpColor.g * u),
          (this.col[n * 3 + 2] = this.tmpColor.b * u));
      }
    }
    update(e) {
      for (let t = 0; t < rt; t++) {
        if (this.life[t] <= 0) {
          ((this.alpha[t] = 0), (this.size[t] = 0));
          continue;
        }
        this.life[t] -= e;
        let n = Math.max(0, this.life[t] / this.maxLife[t]),
          r = Math.exp(-this.drag[t] * e);
        ((this.vel[t * 3] *= r),
          (this.vel[t * 3 + 1] = this.vel[t * 3 + 1] * r - this.grav[t] * e),
          (this.vel[t * 3 + 2] *= r),
          (this.pos[t * 3] += this.vel[t * 3] * e),
          (this.pos[t * 3 + 1] += this.vel[t * 3 + 1] * e),
          (this.pos[t * 3 + 2] += this.vel[t * 3 + 2] * e),
          (this.alpha[t] = n),
          (this.size[t] = this.baseSize[t] * (0.4 + n * 0.6)));
      }
      let t = this.points.geometry;
      ((t.attributes.position.needsUpdate = !0),
        (t.attributes.color.needsUpdate = !0),
        (t.attributes.size.needsUpdate = !0),
        (t.attributes.alpha.needsUpdate = !0));
    }
  },
  at = new T(0, 0.3, 0),
  ot = new m(0.6, 0.8, 48),
  st = class {
    constructor(t) {
      (e(this, `scene`, void 0),
        e(this, `particles`, void 0),
        e(this, `waves`, []),
        e(this, `sparkDir`, new T()),
        (this.scene = t),
        (this.particles = new it(t)));
    }
    hitSpark(e, t, n, r) {
      let i = n ? 8378111 : 16761677;
      (this.particles.emit(e, {
        count: Math.round(14 + t * 18),
        speed: 4 + t * 4,
        color: i,
        life: 0.35,
        size: 0.12 + t * 0.06,
        gravity: 6,
        drag: 3,
        dir: this.sparkDir.set(r, 0.3, 0.2),
        spread: 1.1,
      }),
        this.particles.emit(e, {
          count: 4,
          speed: 0.3,
          color: 16777215,
          life: 0.12,
          size: 0.6 + t * 0.4,
          drag: 6,
        }),
        !n && t > 0.6 && this.shockwave(e, 16765562, 0.22, 0.28 * t, !0));
    }
    dust(e, t = 1) {
      this.particles.emit(e, {
        count: Math.round(18 * t),
        speed: 2.2,
        color: 9071434,
        life: 0.8,
        size: 0.35,
        gravity: -0.5,
        drag: 3,
        dir: at,
        spread: 1.4,
      });
    }
    shockwave(e, t, n, r, i = !1) {
      let a = new p(
        ot,
        new g({
          color: t,
          transparent: !0,
          opacity: 0.9,
          blending: 2,
          depthWrite: !1,
          side: 2,
        }),
      );
      (a.position.copy(e),
        i ? (a.userData.billboard = !0) : (a.rotation.x = -Math.PI / 2),
        a.scale.setScalar(0.3),
        this.scene.add(a),
        this.waves.push({ mesh: a, life: n, max: n, grow: r }));
    }
    update(e, t) {
      this.particles.update(e);
      for (let n = this.waves.length - 1; n >= 0; n--) {
        let r = this.waves[n];
        r.life -= e;
        let i = 1 - r.life / r.max;
        (r.mesh.scale.setScalar(0.3 + i * r.grow * 3),
          (r.mesh.material.opacity = Math.max(0, 1 - i)),
          r.mesh.userData.billboard && r.mesh.quaternion.copy(t.quaternion),
          r.life <= 0 &&
            (this.scene.remove(r.mesh),
            r.mesh.material.dispose(),
            this.waves.splice(n, 1)));
      }
    }
  },
  k =
    typeof window < `u` &&
    ((window.matchMedia(`(pointer: coarse)`).matches &&
      (navigator.maxTouchPoints ?? 0) > 0) ||
      new URLSearchParams(window.location.search).get(`mobile`) === `1`),
  ct =
    typeof navigator < `u` &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === `MacIntel` &&
        (navigator.maxTouchPoints ?? 0) > 1)),
  lt =
    typeof window < `u` &&
    (window.matchMedia(`(display-mode: fullscreen)`).matches ||
      window.matchMedia(`(display-mode: standalone)`).matches ||
      navigator.standalone === !0);
function ut() {
  return window.matchMedia(`(orientation: portrait)`).matches;
}
function dt() {
  k &&
    (document.documentElement.classList.add(`touch`),
    document.addEventListener(`contextmenu`, (e) => e.preventDefault()),
    document.addEventListener(`gesturestart`, (e) => e.preventDefault()),
    document.addEventListener(`dblclick`, (e) => e.preventDefault(), {
      passive: !1,
    }),
    ft());
}
function ft() {
  if (parent !== window) return; // No browser-chrome scrolling inside the local game frame.
  if (!ct || lt) return;
  document.documentElement.classList.add(`ios-scroll`);
  let e = document.getElementById(`ios-swipe`),
    t = !1,
    n = !1,
    r = 0,
    i = () => {
      let i = !ut(),
        a = Math.min(screen.width, screen.height),
        o = window.innerHeight;
      i && window.scrollY > 20 && (r = Math.max(r, o));
      let s = o < Math.min(a, r || a) - 24,
        c = n;
      ((n = i && s && !t),
        e?.classList.toggle(`hidden`, !n),
        n && !c && window.scrollTo(0, 0));
    },
    a = () => requestAnimationFrame(i);
  (window.addEventListener(`resize`, a),
    window.addEventListener(`scroll`, a, { passive: !0 }),
    window.addEventListener(`orientationchange`, () => setTimeout(i, 300)),
    window.visualViewport?.addEventListener(`resize`, a),
    document.addEventListener(
      `touchmove`,
      (e) => {
        !n && !e.target.closest?.(`.legal-scroll`) && e.preventDefault();
      },
      { passive: !1 },
    ),
    e?.querySelector(`.swipe-skip`)?.addEventListener(`click`, () => {
      ((t = !0), i());
    }),
    i());
}
async function pt() {
  if (parent !== window) return; // Huddle owns fullscreen; keep its navigation visible.
  if (k) {
    try {
      let e = document.documentElement;
      document.fullscreenElement ||
        (e.requestFullscreen
          ? await e.requestFullscreen({ navigationUI: `hide` })
          : e.webkitRequestFullscreen && (await e.webkitRequestFullscreen()));
    } catch {}
    try {
      await screen.orientation.lock?.(`landscape`);
    } catch {}
  }
}
function mt(e) {
  if (!k) return;
  let t = window.matchMedia(`(orientation: portrait)`);
  t.addEventListener(`change`, () => e(t.matches));
}
function ht(e) {
  if (k)
    try {
      navigator.vibrate?.(e);
    } catch {}
}
var gt = (e, t = 0.85, n = 0) =>
  new x({ color: e, roughness: t, metalness: n });
function _t(e) {
  return e(1024, 1024, (e) => {
    let t = Math.random;
    ((e.fillStyle = `#4b4945`), e.fillRect(0, 0, 1024, 1024));
    for (let n = 0; n < 9e3; n++) {
      let n = 55 + t() * 50;
      ((e.fillStyle = `rgba(${n},${n - 3},${n - 8},0.5)`),
        e.fillRect(t() * 1024, t() * 1024, 2 + t() * 3, 2 + t() * 3));
    }
    for (let n = 0; n < 26; n++) {
      let n = t() * 1024,
        r = t() * 1024,
        i = 40 + t() * 140,
        a = e.createRadialGradient(n, r, 0, n, r, i);
      (a.addColorStop(
        0,
        t() < 0.5 ? `rgba(150,120,80,0.45)` : `rgba(110,90,60,0.4)`,
      ),
        a.addColorStop(1, `rgba(150,120,80,0)`),
        (e.fillStyle = a),
        e.fillRect(n - i, r - i, i * 2, i * 2));
    }
    e.fillStyle = `rgba(230,220,190,0.55)`;
    for (let n = 20; n < 1024; n += 170)
      t() > 0.25 && e.fillRect(n, 500, 100 - t() * 40, 16);
    ((e.strokeStyle = `rgba(25,24,22,0.7)`), (e.lineWidth = 2));
    for (let n = 0; n < 24; n++) {
      let n = t() * 1024,
        r = t() * 1024;
      (e.beginPath(), e.moveTo(n, r));
      for (let i = 0; i < 6; i++)
        ((n += (t() - 0.5) * 70), (r += (t() - 0.5) * 70), e.lineTo(n, r));
      e.stroke();
    }
    for (let n = 0; n < 14; n++) {
      let n = t() * 1024,
        r = t() * 1024;
      e.fillStyle = `rgba(150,25,30,0.55)`;
      for (let i = 0; i < 6; i++)
        (e.beginPath(),
          e.arc(
            n + (t() - 0.5) * 22,
            r + (t() - 0.5) * 22,
            2 + t() * 6,
            0,
            Math.PI * 2,
          ),
          e.fill());
    }
    let n = [`#e9e4d6`, `#d63a2a`, `#2f7fd4`, `#f2c230`, `#5cb85c`];
    for (let r = 0; r < 160; r++)
      ((e.fillStyle = n[r % n.length]),
        (e.globalAlpha = 0.55),
        e.save(),
        e.translate(t() * 1024, t() * 1024),
        e.rotate(t() * 3),
        e.fillRect(0, 0, 4 + t() * 9, 3 + t() * 6),
        e.restore());
    e.globalAlpha = 1;
  });
}
function vt(e, t, n, r, i, a, o, s, c = 0) {
  let l = new p(new C(t, n, r), i);
  return (l.position.set(a, o, s), (l.rotation.y = c), e.add(l), l);
}
function yt(e, t, n, r, i, a) {
  let o = new p(new E(t, t, 0.1, 14), n);
  ((o.rotation.x = Math.PI / 2), o.position.set(r, i, a), e.add(o));
}
function bt(e, t) {
  let n = new c(),
    r = gt(9067058);
  (vt(n, 1.8, 0.12, 1, r, 0, 0.75, 0),
    vt(n, 1.8, 0.18, 0.06, r, 0, 0.88, 0.47),
    vt(n, 1.8, 0.18, 0.06, r, 0, 0.88, -0.47));
  for (let e of [-0.45, 0.45]) yt(n, 0.36, gt(2829099), -0.25, 0.36, e);
  (vt(n, 0.06, 0.06, 1.1, r, -1.15, 0.8, 0),
    vt(n, 0.5, 0.05, 0.05, r, -1, 0.8, 0.5),
    vt(n, 0.5, 0.05, 0.05, r, -1, 0.8, -0.5));
  let o = gt(e, 0.6),
    s = new i(0.11, 8, 6),
    l = new a(s, o, 40),
    d = new u();
  for (let e = 0; e < 40; e++) {
    let t = Math.random() * 0.7,
      n = Math.random() * Math.PI * 2;
    (d.setPosition(
      Math.cos(n) * t * 1.1,
      0.88 + (0.7 - t) * 0.35 + Math.random() * 0.05,
      Math.sin(n) * t * 0.55,
    ),
      l.setMatrixAt(e, d));
  }
  (n.add(l), vt(n, 0.04, 1.3, 0.04, gt(6710886), 0.6, 1.45, 0));
  let f = new p(new de(1, 0.4, 8), gt(t, 0.9));
  return (f.position.set(0.6, 2.15, 0), n.add(f), n);
}
function xt() {
  let e = new c(),
    t = gt(3116858, 0.5, 0.2),
    n = gt(16040960, 0.6),
    r = gt(1907997, 0.7);
  (vt(e, 1.6, 0.55, 1.2, t, 0, 0.6, 0),
    vt(e, 0.55, 0.75, 0.9, t, 0.95, 0.75, 0));
  let i = new p(new E(0.45, 0.45, 0.9, 12, 1, !1, 0, Math.PI), t);
  return (
    (i.rotation.x = Math.PI / 2),
    (i.rotation.z = -Math.PI / 2),
    i.position.set(1.22, 0.75, 0),
    e.add(i),
    vt(e, 1.9, 0.12, 1.3, n, 0.15, 1.65, 0),
    vt(e, 1.6, 0.9, 0.06, r, -0.05, 1.15, 0.6),
    (vt(e, 1.6, 0.9, 0.06, r, -0.05, 1.15, -0.6).visible = !1),
    vt(e, 0.06, 0.95, 1.2, r, -0.75, 1.15, 0),
    vt(e, 0.05, 0.55, 0.8, gt(11065599, 0.1, 0.1), 1.25, 1.35, 0),
    yt(e, 0.28, r, 1.15, 0.28, 0),
    yt(e, 0.28, r, -0.5, 0.28, 0.6),
    yt(e, 0.28, r, -0.5, 0.28, -0.6),
    e
  );
}
function St(e, t) {
  let n = new c(),
    r = gt(e, 0.95),
    a = new p(new ge(0.17, 0.5, 4, 8), r);
  ((a.rotation.z = Math.PI / 2), (a.position.y = t ? 0.17 : 0.48), n.add(a));
  let o = new p(new i(0.15, 10, 8), r);
  (o.position.set(0.42, t ? 0.22 : 0.68, 0), n.add(o));
  let s = new p(new C(0.16, 0.09, 0.1), r);
  (s.position.set(0.56, t ? 0.19 : 0.64, 0), n.add(s));
  for (let e of [-0.07, 0.07]) {
    let r = new p(new de(0.05, 0.12, 4), gt(3811868, 0.95));
    (r.position.set(0.4, t ? 0.35 : 0.81, e), n.add(r));
  }
  let l = new p(new E(0.025, 0.04, 0.35, 5), r);
  if (
    (l.position.set(-0.45, t ? 0.2 : 0.62, 0),
    (l.rotation.z = t ? 1.4 : 0.7),
    n.add(l),
    !t)
  )
    for (let [e, t] of [
      [0.25, 0.09],
      [0.25, -0.09],
      [-0.25, 0.09],
      [-0.25, -0.09],
    ]) {
      let i = new p(new E(0.04, 0.035, 0.34, 5), r);
      (i.position.set(e, 0.17, t), n.add(i));
    }
  return n;
}
function Ct(e) {
  let t = [15902389, 16175979, 6539200, 12048746, 15899227, 14141680, 16771e3],
    n = gt(2762272, 0.6),
    r = gt(14209216, 0.9),
    i = gt(1842204, 0.6),
    o = new C(0.9, 1, 0.1),
    s = [],
    c = -34,
    l = 0;
  for (; c < 34;) {
    let n = 4 + Math.random() * 3,
      a = 2 + Math.floor(Math.random() * 3),
      o = a * 3,
      u = -17 - Math.random() * 2;
    vt(e, n, o, 6, gt(t[l % t.length], 0.95), c + n / 2, o / 2, u);
    for (let t = 0; t < a; t++) {
      vt(e, n * 0.9, 0.15, 1, r, c + n / 2, t * 3 + 2.3, u + 3.4);
      for (let e = 0; e < Math.floor(n / 1.6); e++)
        s.push(new T(c + 0.9 + e * 1.6, t * 3 + 1.6, u + 3.02));
    }
    let d = new p(new E(0.55, 0.55, 1.1, 12), i);
    (d.position.set(c + n * 0.6, o + 0.55, u), e.add(d), (c += n + 0.3), l++);
  }
  let f = new a(o, n, s.length),
    m = new u();
  (s.forEach((e, t) => f.setMatrixAt(t, m.makeTranslation(e.x, e.y, e.z))),
    e.add(f));
  let g = gt(7827560, 0.8),
    y = [-24, -12, 0, 12, 24];
  for (let t of y) vt(e, 0.18, 8, 0.18, g, t, 4, -11);
  let b = new v({ color: 1118481 });
  for (let t = 0; t < y.length - 1; t++)
    for (let n = 0; n < 4; n++) {
      let r = new T(y[t], 7.4 - n * 0.25, -11),
        i = new T(y[t + 1], 7.4 - n * 0.2, -11),
        a = r
          .clone()
          .lerp(i, 0.5)
          .add(new T(0, -0.9 - Math.random() * 0.8, 0)),
        o = new d(r, a, i).getPoints(16);
      e.add(new _(new Se().setFromPoints(o), b));
    }
  for (let [t, n, r, i, a] of [
    [-9, -8, 0.3, 16747039, 14169130],
    [7.5, -9, -0.25, 6012730, 3108820],
    [-17, -10.5, 0.1, 15088186, 15909424],
  ]) {
    let o = bt(i, a);
    (o.position.set(t, 0, n), (o.rotation.y = r), e.add(o));
  }
  for (let [t, n, r] of [
    [13, -10, -0.5],
    [-4, -12, 0.35],
    [19, -12.5, 3],
  ]) {
    let i = xt();
    (i.position.set(t, 0, n), (i.rotation.y = r), e.add(i));
  }
  for (let [t, n, r, i, a] of [
    [-6.5, -5.2, 0.5, 13146714, !0],
    [10.5, -6, -2.2, 7031342, !1],
    [3, -7.5, 2.6, 15259312, !0],
  ]) {
    let o = St(i, a);
    (o.position.set(t, 0, n), (o.rotation.y = r), e.add(o));
  }
  let ee = new a(new C(0.22, 0.02, 0.16), gt(16777215, 0.9), 120),
    S = [15328470, 14039594, 3112916, 15909424, 6076508, 16777215],
    te = new h(),
    ne = new T(1, 1, 1);
  for (let e = 0; e < 120; e++) {
    let t = new T(
      (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 20),
      0.02,
      -4 - Math.random() * 10,
    );
    (te.setFromAxisAngle(new T(0, 1, 0), Math.random() * 3),
      ee.setMatrixAt(e, m.compose(t, te, ne)),
      ee.setColorAt(e, new Le(S[e % S.length])));
  }
  e.add(ee);
  let re = new x({ color: 3815999, roughness: 0.05, metalness: 0.3 });
  for (let [t, n, r] of [
    [-11, -4.5, 1.2],
    [9, -5, 0.9],
    [-2, -9, 1.5],
  ]) {
    let i = new p(new Fe(r, 18), re);
    ((i.rotation.x = -Math.PI / 2),
      i.scale.set(1.4, 1, 1),
      i.position.set(t, 0.03, n),
      e.add(i));
  }
}
var wt = {
    sansad: { name: `SANSAD BHAVAN`, subtitle: `Parliament at sunset` },
    jantar: { name: `JANTAR MANTAR`, subtitle: `Protest ground, New Delhi` },
    road: { name: `DESI SADAK`, subtitle: `Gali, thela aur traffic` },
  },
  Tt = {
    sansad: {
      skyTop: 1780314,
      skyMid: 15232828,
      skyBottom: 16762739,
      fog: 15310950,
      fogNear: 28,
      fogFar: 75,
      ground: 9071178,
      platformSide: 9190174,
      sunColor: 16766624,
      sunIntensity: 2.6,
      sunPos: [-6, 12, 9],
      hemiSky: 16769728,
      hemiGround: 5913386,
      hemiIntensity: 1.25,
      sunDisc: [-30, 9, -80],
      sunDiscColor: 16773572,
      exposure: 1.05,
      floorRoughness: 0.62,
    },
    jantar: {
      skyTop: 3108804,
      skyMid: 9683690,
      skyBottom: 15916992,
      fog: 14207922,
      fogNear: 35,
      fogFar: 110,
      ground: 6130234,
      platformSide: 11028282,
      sunColor: 16773592,
      sunIntensity: 2.8,
      sunPos: [7, 16, 10],
      hemiSky: 14478335,
      hemiGround: 7033398,
      hemiIntensity: 1.3,
      sunDisc: [45, 38, -90],
      sunDiscColor: 16776168,
      exposure: 0.95,
      floorRoughness: 0.9,
    },
    road: {
      skyTop: 8364996,
      skyMid: 14206882,
      skyBottom: 15389606,
      fog: 13481100,
      fogNear: 22,
      fogFar: 70,
      ground: 7233873,
      platformSide: 4144442,
      sunColor: 16769712,
      sunIntensity: 2.5,
      sunPos: [-8, 14, 9],
      hemiSky: 15852228,
      hemiGround: 5917240,
      hemiIntensity: 1.3,
      sunDisc: [-40, 30, -90],
      sunDiscColor: 16773320,
      exposure: 1,
      floorRoughness: 0.95,
    },
  };
function Et(e, t, n) {
  let r = document.createElement(`canvas`);
  ((r.width = e), (r.height = t), n(r.getContext(`2d`)));
  let i = new _e(r);
  return ((i.colorSpace = oe), (i.anisotropy = 4), i);
}
function Dt(e, t, n, r, i) {
  ((e.strokeStyle = i),
    (e.lineWidth = r * 0.15),
    e.beginPath(),
    e.arc(t, n, r, 0, Math.PI * 2),
    e.stroke(),
    (e.lineWidth = Math.max(1, r * 0.05)));
  for (let i = 0; i < 24; i++) {
    let a = (i / 24) * Math.PI * 2;
    (e.beginPath(),
      e.moveTo(t, n),
      e.lineTo(t + Math.cos(a) * r, n + Math.sin(a) * r),
      e.stroke());
  }
}
function Ot(e, t, n, r) {
  for (let [i, a, o] of [
    [1, `#e85d04`, 22],
    [0.84, `#f48c06`, 20],
    [0.68, `#faa307`, 18],
    [0.52, `#ffba08`, 16],
    [0.36, `#ffd23f`, 14],
  ]) {
    let s = r * i;
    ((e.fillStyle = a),
      (e.strokeStyle = `rgba(120,40,0,0.35)`),
      (e.lineWidth = Math.max(1, r * 0.015)));
    for (let r = 0; r < o; r++) {
      let a = (r / o) * Math.PI * 2 + i * 1.3,
        c = t + Math.cos(a) * s * 0.62,
        l = n + Math.sin(a) * s * 0.62;
      (e.beginPath(),
        e.ellipse(c, l, s * 0.42, s * 0.2, a, 0, Math.PI * 2),
        e.fill(),
        e.stroke());
    }
  }
  ((e.fillStyle = `#9a6a00`),
    e.beginPath(),
    e.arc(t, n, r * 0.16, 0, Math.PI * 2),
    e.fill(),
    (e.fillStyle = `#d9a400`));
  for (let i = 0; i < 14; i++) {
    let i = Math.random() * Math.PI * 2,
      a = Math.random() * r * 0.12;
    (e.beginPath(),
      e.arc(
        t + Math.cos(i) * a,
        n + Math.sin(i) * a,
        r * 0.025,
        0,
        Math.PI * 2,
      ),
      e.fill());
  }
}
function kt(e, t, n, r) {
  let i = e.createRadialGradient(t - r * 0.3, n - r * 0.3, r * 0.1, t, n, r);
  (i.addColorStop(0, `#f3d27a`),
    i.addColorStop(1, `#a8761f`),
    (e.fillStyle = i),
    e.beginPath(),
    e.arc(t, n, r, 0, Math.PI * 2),
    e.fill(),
    (e.strokeStyle = `#6e4a12`),
    (e.lineWidth = 3));
  for (let i of [1, 0.7])
    (e.beginPath(), e.arc(t, n, r * i, 0, Math.PI * 2), e.stroke());
  ((e.fillStyle = `#6e4a12`), e.beginPath());
  for (let i = 0; i < 8; i++) {
    let a = (i / 8) * Math.PI * 2 - Math.PI / 2,
      o = i % 2 == 0 ? r * 0.5 : r * 0.2;
    e.lineTo(t + Math.cos(a) * o, n + Math.sin(a) * o);
  }
  (e.closePath(), e.fill());
}
function At() {
  return Et(1024, 1024, (e) => {
    for (let t = 0; t < 8; t++)
      for (let n = 0; n < 8; n++) {
        let r = (n + t) % 2 == 0;
        ((e.fillStyle = r ? `#e9dcc3` : `#b8805a`),
          e.fillRect(n * 128, t * 128, 128, 128));
        for (let i = 0; i < 6; i++)
          ((e.strokeStyle = r
            ? `rgba(150,130,110,0.18)`
            : `rgba(255,230,200,0.12)`),
            (e.lineWidth = 1 + Math.random() * 2),
            e.beginPath(),
            e.moveTo(n * 128 + Math.random() * 128, t * 128),
            e.bezierCurveTo(
              n * 128 + Math.random() * 128,
              t * 128 + 40,
              n * 128 + Math.random() * 128,
              t * 128 + 90,
              n * 128 + Math.random() * 128,
              t * 128 + 128,
            ),
            e.stroke());
      }
    let t = [`#ff9933`, `#ffffff`, `#138808`, `#e0218a`, `#ffd23f`, `#1a4fd6`];
    for (let n = 6; n >= 1; n--) {
      ((e.fillStyle = t[n % t.length]), e.beginPath());
      let r = 8 + n * 2;
      for (let t = 0; t <= r * 2; t++) {
        let i = (t / (r * 2)) * Math.PI * 2,
          a = n * 46 + (t % 2 == 0 ? 14 : -6),
          o = 512 + Math.cos(i) * a,
          s = 512 + Math.sin(i) * a;
        t === 0 ? e.moveTo(o, s) : e.lineTo(o, s);
      }
      e.fill();
    }
    Ot(e, 512, 512, 70);
  });
}
function jt() {
  return Et(1024, 1024, (e) => {
    let t = [`#c4614f`, `#b9584a`, `#cc6a55`, `#bf5d4b`];
    for (let n = 0; n < 8; n++)
      for (let r = 0; r < 8; r++) {
        ((e.fillStyle = t[(r * 3 + n * 5) % t.length]),
          e.fillRect(r * 128, n * 128, 128, 128));
        for (let t = 0; t < 90; t++)
          ((e.fillStyle =
            Math.random() < 0.5
              ? `rgba(90,30,20,0.18)`
              : `rgba(255,220,200,0.14)`),
            e.fillRect(
              r * 128 + Math.random() * 128,
              n * 128 + Math.random() * 128,
              2 + Math.random() * 3,
              2 + Math.random() * 3,
            ));
      }
    ((e.strokeStyle = `#efe6d6`), (e.lineWidth = 6));
    for (let t = 0; t <= 8; t++)
      (e.beginPath(),
        e.moveTo(t * 128, 0),
        e.lineTo(t * 128, 1024),
        e.moveTo(0, t * 128),
        e.lineTo(1024, t * 128),
        e.stroke());
    ((e.fillStyle = `#d8c9ad`),
      e.beginPath(),
      e.arc(512, 512, 330, 0, Math.PI * 2),
      e.fill(),
      (e.strokeStyle = `#a94a3c`));
    for (let t of [330, 300, 220, 140, 70])
      ((e.lineWidth = t === 330 ? 10 : 4),
        e.beginPath(),
        e.arc(512, 512, t, 0, Math.PI * 2),
        e.stroke());
    for (let t = 0; t < 48; t++) {
      let n = (t / 48) * Math.PI * 2;
      ((e.lineWidth = t % 4 == 0 ? 5 : 2),
        e.beginPath(),
        e.moveTo(
          512 + Math.cos(n) * (t % 4 == 0 ? 70 : 220),
          512 + Math.sin(n) * (t % 4 == 0 ? 70 : 220),
        ),
        e.lineTo(512 + Math.cos(n) * 300, 512 + Math.sin(n) * 300),
        e.stroke());
    }
    ((e.fillStyle = `#a94a3c`),
      (e.font = `bold 30px serif`),
      (e.textAlign = `center`),
      (e.textBaseline = `middle`));
    for (let t = 0; t < 12; t++) {
      let n = (t / 12) * Math.PI * 2 - Math.PI / 2;
      e.fillText(
        String(((t + 5) % 12) + 1),
        512 + Math.cos(n) * 315,
        512 + Math.sin(n) * 315 + 1,
      );
    }
    kt(e, 512, 512, 52);
  });
}
function Mt() {
  return new se({
    side: 1,
    depthWrite: !1,
    uniforms: {
      top: { value: new Le() },
      mid: { value: new Le() },
      bottom: { value: new Le() },
    },
    vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vPos;
      void main(){ float h = vPos.y; vec3 c = h > 0.12 ? mix(mid, top, smoothstep(0.12, 0.6, h)) : mix(bottom, mid, smoothstep(-0.05, 0.12, h));
      gl_FragColor = vec4(c, 1.0); }`,
  });
}
function Nt() {
  return Et(192, 128, (e) => {
    ((e.fillStyle = `#ff9933`),
      e.fillRect(0, 0, 192, 43),
      (e.fillStyle = `#ffffff`),
      e.fillRect(0, 43, 192, 42),
      (e.fillStyle = `#138808`),
      e.fillRect(0, 85, 192, 43),
      Dt(e, 96, 64, 17, `#000080`));
  });
}
function Pt(e, t, n) {
  return Et(256, 160, (r) => {
    ((r.fillStyle = t),
      r.fillRect(0, 0, 256, 160),
      (r.strokeStyle = n),
      (r.lineWidth = 8),
      r.strokeRect(6, 6, 244, 148),
      (r.fillStyle = n),
      (r.font = `bold 54px Impact, sans-serif`),
      (r.textAlign = `center`),
      (r.textBaseline = `middle`),
      r.fillText(e, 128, 84, 230));
  });
}
var Ft = [
    { pool: `neutral`, text: `VOTE!`, bg: `#ffffff`, fg: `#c0392b` },
    { pool: `neutral`, text: `JAI HIND`, bg: `#ffd23f`, fg: `#1a237e` },
    { pool: `neutral`, text: `SUNO!`, bg: `#ff9933`, fg: `#ffffff` },
    { pool: `neutral`, text: `BADLAV`, bg: `#138808`, fg: `#ffffff` },
    { pool: `modi`, text: `BHASHAN JAARI`, bg: `#ff9933`, fg: `#ffffff` },
    { pool: `modi`, text: `VAADA PAKKA`, bg: `#ffffff`, fg: `#e06a00` },
    { pool: `modi`, text: `MITRA! MITRA!`, bg: `#e06a00`, fg: `#fff3c0` },
    { pool: `rahul`, text: `CHALTE RAHO`, bg: `#1f6fe0`, fg: `#ffffff` },
    { pool: `rahul`, text: `YATRA JAARI`, bg: `#ffffff`, fg: `#1f6fe0` },
    { pool: `rahul`, text: `YATRA! YATRA!`, bg: `#0d3f8f`, fg: `#bfe3ff` },
    { pool: `didi`, text: `DHARNA HOBE`, bg: `#22b35e`, fg: `#ffffff` },
    { pool: `didi`, text: `DHARNA JAARI`, bg: `#ffffff`, fg: `#1a8a48` },
    { pool: `didi`, text: `DEEDEE! DEEDEE!`, bg: `#0f6b37`, fg: `#d8ffe6` },
    { pool: `trump`, text: `TAAU! TAAU!`, bg: `#c8102e`, fg: `#ffffff` },
    { pool: `trump`, text: `TARIFF KING`, bg: `#ffffff`, fg: `#c8102e` },
    { pool: `trump`, text: `NAMASTE TAAU`, bg: `#0a3161`, fg: `#ffffff` },
    { pool: `yogi`, text: `DOZER DADA`, bg: `#f05a00`, fg: `#ffffff` },
    { pool: `yogi`, text: `SITE CLEAR`, bg: `#ffffff`, fg: `#d84c00` },
    { pool: `yogi`, text: `DADA! DADA!`, bg: `#a83a00`, fg: `#ffe2c4` },
    { pool: `nitin`, text: `TOLL MAN`, bg: `#ff9a1f`, fg: `#ffffff` },
    { pool: `nitin`, text: `HIGHWAY MAN`, bg: `#ffffff`, fg: `#0f7a3a` },
    { pool: `nitin`, text: `TOLL! TOLL!`, bg: `#0f7a3a`, fg: `#ffffff` },
    { pool: `mbapu`, text: `SHANTI`, bg: `#ffd700`, fg: `#1a1000` },
    { pool: `mbapu`, text: `SABAR RAKHO`, bg: `#ffffff`, fg: `#b8860b` },
    { pool: `mbapu`, text: `MBAPU! MBAPU!`, bg: `#b8860b`, fg: `#ffffff` },
  ],
  It = 0.45,
  Lt = class {
    constructor(t, n) {
      (e(this, `scene`, void 0),
        e(this, `renderer`, void 0),
        e(this, `group`, new c()),
        e(this, `themeGroups`, {
          sansad: new c(),
          jantar: new c(),
          road: new c(),
        }),
        e(this, `flags`, []),
        e(this, `crowd`, void 0),
        e(this, `crowdHeads`, void 0),
        e(this, `crowdData`, []),
        e(this, `crowdHeights`, void 0),
        e(this, `placardMeshes`, []),
        e(this, `holders`, []),
        e(this, `boredFans`, []),
        e(this, `phones`, void 0),
        e(this, `samosas`, void 0),
        e(this, `flashes`, []),
        e(this, `leader`, null),
        e(this, `trailing`, null),
        e(this, `leadIntensity`, 0),
        e(this, `boredom`, 0),
        e(this, `dummy`, new Re()),
        e(this, `sky`, Mt()),
        e(this, `sunDisc`, void 0),
        e(this, `groundMat`, new x({ roughness: 1 })),
        e(this, `floorMat`, new x({ roughness: 0.45, metalness: 0.05 })),
        e(this, `platformSideMat`, new x({ roughness: 0.8 })),
        e(this, `floorTextures`, void 0),
        e(this, `sun`, void 0),
        e(this, `hemi`, void 0),
        e(this, `excitement`, 0),
        e(this, `mood`, 0),
        e(this, `stage`, `sansad`),
        (this.scene = t),
        (this.renderer = n),
        t.add(this.group),
        (t.fog = new l(16777215, 30, 80)),
        this.group.add(
          this.themeGroups.sansad,
          this.themeGroups.jantar,
          this.themeGroups.road,
        ),
        this.group.add(new p(new i(140, 32, 16), this.sky)),
        (this.sunDisc = new p(
          new Fe(4, 32),
          new g({ color: 16777215, fog: !1 }),
        )),
        this.group.add(this.sunDisc),
        (this.hemi = new y(16777215, 4473924, 1)),
        this.group.add(this.hemi),
        (this.sun = new s(16777215, 2.6)),
        (this.sun.castShadow = !0));
      let r = k ? 1024 : 2048;
      this.sun.shadow.mapSize.set(r, r);
      let o = this.sun.shadow.camera;
      ((o.left = -11),
        (o.right = 11),
        (o.top = 8),
        (o.bottom = -6),
        (o.near = 1),
        (o.far = 45),
        (this.sun.shadow.bias = -4e-4),
        (this.sun.shadow.normalBias = 0.02),
        this.group.add(this.sun));
      let u = new s(9417983, 1.1);
      (u.position.set(4, 6, -10), this.group.add(u));
      let d = new p(new Fe(130, 48), this.groundMat);
      ((d.rotation.x = -Math.PI / 2),
        (d.position.y = -0.31),
        (d.receiveShadow = !0),
        this.group.add(d),
        (this.floorTextures = { sansad: At(), jantar: jt(), road: _t(Et) }));
      for (let e of Object.values(this.floorTextures)) n?.initTexture(e);
      let m = O * 2 + 2.5,
        h = this.platformSideMat,
        _ = new p(new C(m, 0.3, 8), [h, h, this.floorMat, h, h, h]);
      ((_.position.y = -0.15), (_.receiveShadow = !0), this.group.add(_));
      let v = new a(
          new i(0.07, 8, 6),
          new x({ color: 16747546, roughness: 0.9 }),
          240,
        ),
        b = 0;
      for (let e = 0; e < 120; e++) {
        let t = -m / 2 + (e / 119) * m;
        for (let n of [4.02, -4.02])
          (this.dummy.position.set(
            t,
            -0.08 - Math.abs(Math.sin(e * 0.5)) * 0.08,
            n,
          ),
            this.dummy.updateMatrix(),
            v.setMatrixAt(b, this.dummy.matrix),
            v.setColorAt(b, new Le(e % 3 == 0 ? 16765466 : 16742928)),
            b++);
      }
      (this.group.add(v),
        this.buildSansad(this.themeGroups.sansad),
        this.buildJantarMantar(this.themeGroups.jantar),
        Ct(this.themeGroups.road),
        (this.crowd = new a(
          new ge(0.22, 0.5, 4, 8),
          new x({ roughness: 0.9 }),
          420,
        )),
        (this.crowdHeads = new a(
          new i(0.16, 10, 8),
          new x({ roughness: 0.8 }),
          420,
        )));
      let ee = [
          16750899, 16777215, 1280008, 3054591, 14688650, 16765503, 11022898,
          7031766,
        ],
        S = [9263675, 11565650, 13210736, 7226668];
      for (let e = 0; e < 420; e++) {
        let t = e % 5,
          n = Math.floor(e / 5) / 84,
          r = n < 0.5 ? -1 : 1,
          i = (n % 0.5) * 2,
          a = r * (8.5 + t * 0.9) + (Math.random() - 0.5) * 0.3,
          o = 3.5 - i * 11 + (Math.random() - 0.5) * 0.4;
        (this.crowdData.push({
          x: a,
          z: o,
          y: t * 0.45,
          phase: Math.random() * Math.PI * 2,
          rot: Math.random() * Math.PI,
        }),
          this.crowd.setColorAt(e, new Le(ee[e % ee.length])),
          this.crowdHeads.setColorAt(e, new Le(S[e % S.length])));
      }
      ((this.crowdHeights = new Float32Array(420)),
        (this.crowd.frustumCulled = !1),
        (this.crowdHeads.frustumCulled = !1),
        this.group.add(this.crowd, this.crowdHeads));
      for (let e = 0; e < 5; e++)
        for (let t of [-1, 1]) {
          let n = new p(
            new C(0.9, 0.45, 12),
            new x({ color: 8154204, roughness: 1 }),
          );
          (n.position.set(t * (8.5 + e * 0.9), e * 0.45 - 0.3, -2),
            (n.receiveShadow = !0),
            this.group.add(n));
        }
      (this.buildPlacards(this.group, 420), this.buildBoredFans(420));
      for (let e = 0; e < 14; e++) {
        let e = nt(16777215, 0.9, 0);
        ((e.visible = !1),
          this.group.add(e),
          this.flashes.push({ s: e, life: 0 }));
      }
      let te = Nt();
      for (let [e, t] of [
        [-8, -5],
        [8, -5],
        [-5, -8],
        [5, -8],
        [-10.5, 3.5],
        [10.5, 3.5],
      ]) {
        let n = new p(
          new E(0.05, 0.06, 6, 8),
          new x({ color: 14540253, metalness: 0.6, roughness: 0.3 }),
        );
        (n.position.set(e, 2.7, t), (n.castShadow = !0), this.group.add(n));
        let r = new f(1.8, 1.2, 16, 8);
        r.translate(0.9, 0, 0);
        let i = new p(r, new x({ map: te, side: 2, roughness: 0.8 }));
        (i.position.set(e + 0.05, 5, t),
          this.group.add(i),
          this.flags.push({
            mesh: i,
            base: Float32Array.from(r.attributes.position.array),
            phase: Math.random() * 6,
          }));
      }
      this.setStage(`sansad`);
    }
    setStage(e) {
      this.stage = e;
      let t = Tt[e];
      for (let t of Object.keys(this.themeGroups))
        this.themeGroups[t].visible = t === e;
      (this.sky.uniforms.top.value.set(t.skyTop),
        this.sky.uniforms.mid.value.set(t.skyMid),
        this.sky.uniforms.bottom.value.set(t.skyBottom));
      let n = this.scene.fog;
      (n.color.set(t.fog),
        (n.near = t.fogNear),
        (n.far = t.fogFar),
        this.groundMat.color.set(t.ground),
        this.platformSideMat.color.set(t.platformSide),
        (this.floorMat.map = this.floorTextures[e]),
        (this.floorMat.roughness = t.floorRoughness),
        (this.floorMat.needsUpdate = !0),
        this.sun.color.set(t.sunColor),
        this.sun.position.set(...t.sunPos),
        this.hemi.color.set(t.hemiSky),
        this.hemi.groundColor.set(t.hemiGround),
        this.sunDisc.position.set(...t.sunDisc),
        this.sunDisc.lookAt(0, 0, 0),
        this.sunDisc.material.color.set(t.sunDiscColor),
        this.renderer && (this.renderer.toneMappingExposure = t.exposure),
        this.setMood(this.mood));
    }
    buildSansad(e) {
      let t = new x({ color: 14264186, roughness: 0.85 }),
        n = new x({ color: 11763287, roughness: 0.9 }),
        r = new c();
      (r.position.set(0, -0.3, -34), e.add(r));
      let o = new p(new E(15.8, 16.2, 1.2, 64), n);
      ((o.position.y = 0.6), r.add(o));
      let s = new p(new E(13.8, 13.8, 7.5, 64), n);
      ((s.position.y = 4.4), r.add(s));
      let l = new a(new E(0.28, 0.32, 5.2, 10), t, 144),
        u = new Re();
      for (let e = 0; e < 144; e++) {
        let t = (e / 144) * Math.PI * 2;
        (u.position.set(Math.cos(t) * 15, 3.8, Math.sin(t) * 15),
          u.updateMatrix(),
          l.setMatrixAt(e, u.matrix));
      }
      r.add(l);
      let d = new p(new E(15.6, 15.6, 0.6, 64), t);
      ((d.position.y = 6.6), r.add(d));
      let f = new p(new E(13, 13.4, 2.2, 64), t);
      ((f.position.y = 8), r.add(f));
      let m = new p(new i(5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), n);
      ((m.position.y = 9.1), (m.scale.y = 0.45), r.add(m));
      let h = new p(new E(0.08, 0.08, 4, 6), t);
      ((h.position.y = 12.5), r.add(h));
      let g = new x({ color: 13208674, roughness: 0.9 }),
        _ = new c();
      (_.position.set(24, -0.3, -46), (_.rotation.y = -0.4), e.add(_));
      for (let e of [-1, 1]) {
        let t = new p(new C(3, 14, 3), g);
        (t.position.set(e * 4, 7, 0), _.add(t));
      }
      let v = new p(new C(11.5, 4, 3.2), g);
      ((v.position.y = 15.5), _.add(v));
      let y = new p(new w(2.5, 0.6, 8, 24, Math.PI), g);
      ((y.position.y = 11.5), _.add(y));
      let b = new p(new E(1.6, 2.2, 1.5, 24), g);
      ((b.position.y = 18.2), _.add(b));
      let ee = new x({ color: 15259320, roughness: 0.6 }),
        S = new x({ color: 13936192, roughness: 0.35, metalness: 0.7 });
      for (let t of [-O - 1.6, O + 1.6]) {
        let n = -3.2,
          r = new p(new E(0.28, 0.36, 6, 16), ee);
        (r.position.set(t, 3, n), (r.castShadow = !0), e.add(r));
        let a = new p(new E(0.5, 0.3, 0.6, 16), S);
        (a.position.set(t, 6.3, n), e.add(a));
        for (let r = 0; r < 4; r++) {
          let a = new p(new i(0.22, 10, 8), S),
            o = (r / 4) * Math.PI * 2;
          (a.position.set(t + Math.cos(o) * 0.25, 6.8, n + Math.sin(o) * 0.25),
            e.add(a));
        }
        let o = new ne(16756832, 6, 9, 2);
        (o.position.set(t, 6.8, -2.6), (o.userData.keepLight = !0), e.add(o));
      }
    }
    buildJantarMantar(e) {
      let t = new x({ color: 12867391, roughness: 0.85 }),
        n = new x({ color: 13658703, roughness: 0.85 }),
        r = new x({ color: 15854560, roughness: 0.7 }),
        o = new x({ color: 15392712, roughness: 0.8, side: 2 }),
        s = 4.6,
        l = Math.atan2(13, 24),
        u = new c();
      (u.position.set(0, -0.3, -26), (u.rotation.y = Math.PI / 2), e.add(u));
      let d = new ee();
      (d.moveTo(0, 0), d.lineTo(24, 0), d.lineTo(24, 13), d.lineTo(0, 0));
      let f = new te(d, { depth: s, bevelEnabled: !1 });
      f.translate(0, 0, -4.6 / 2);
      let m = new p(f, t);
      ((m.castShadow = !0), (m.receiveShadow = !0), u.add(m));
      let h = new a(new C(24 / 46, 13 / 46, 2.4), r, 46);
      for (let e = 0; e < 46; e++)
        (this.dummy.position.set(
          (e + 0.5) * (24 / 46),
          (e + 0.5) * (13 / 46) + 0.02,
          0,
        ),
          this.dummy.rotation.set(0, 0, 0),
          this.dummy.scale.set(1, 1, 1),
          this.dummy.updateMatrix(),
          h.setMatrixAt(e, this.dummy.matrix));
      u.add(h);
      let g = Math.hypot(24, 13);
      for (let e of [1, -1]) {
        let t = new p(new C(g, 0.35, 0.3), r);
        (t.position.set(12, 6.75, e * (s / 2 - 0.15)),
          (t.rotation.z = l),
          u.add(t));
      }
      let _ = new c();
      (_.position.set(22.4, 13, 0), u.add(_));
      for (let [e, t] of [
        [-1, -1.6],
        [1, -1.6],
        [-1, 1.6],
        [1, 1.6],
      ]) {
        let r = new p(new C(0.35, 2.2, 0.35), n);
        (r.position.set(e, 1.1, t), _.add(r));
      }
      let v = new p(new C(2.8, 0.35, 4), r);
      ((v.position.y = 2.3), _.add(v));
      let y = new p(new i(1.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), r);
      ((y.position.y = 2.45), _.add(y));
      let b = 6.2,
        S = new ee();
      for (let e = 0; e <= 24; e++) {
        let t = -Math.PI / 2 + (e / 24) * (Math.PI / 2),
          n = [
            Math.cos(t) * 7.1000000000000005,
            Math.sin(t) * 7.1000000000000005,
          ];
        e === 0 ? S.moveTo(n[0], n[1]) : S.lineTo(n[0], n[1]);
      }
      for (let e = 24; e >= 0; e--) {
        let t = -Math.PI / 2 + (e / 24) * (Math.PI / 2);
        S.lineTo(Math.cos(t) * b, Math.sin(t) * b);
      }
      let re = new te(S, { depth: 3.2, bevelEnabled: !1, curveSegments: 24 });
      re.translate(0, 0, -1.6);
      let ie = new T(Math.cos(l), Math.sin(l), 0),
        ae = new T(-Math.sin(l), Math.cos(l), 0);
      for (let e of [1, -1]) {
        let t = new T(24 * 0.4, 5.2, (s / 2) * e),
          i = new p(re, [n, r]),
          a = new T(0, 0, e),
          o = ie.clone().multiplyScalar(e);
        ((i.matrixAutoUpdate = !1),
          i.matrix.makeBasis(a, ae, o).setPosition(t),
          (i.castShadow = !0),
          u.add(i));
      }
      for (let i of [-1, 1]) {
        let a = new c();
        (a.position.set(i * 19, -0.3, -18), e.add(a));
        let s = 4.6,
          l = new p(new E(s, 4.8999999999999995, 0.6, 40), o);
        ((l.position.y = 0.3), a.add(l));
        for (let e = 0; e < 12; e++) {
          let n = (e / 12) * Math.PI * 2,
            r = new p(new C(0.9, 6.2, 0.9), t);
          (r.position.set(Math.cos(n) * s, 3.4, Math.sin(n) * s),
            (r.rotation.y = -n),
            (r.castShadow = !0),
            a.add(r));
        }
        for (let e of [3.2, 6.4]) {
          let t = new p(
            new E(5.1, 5.1, e > 5 ? 0.6 : 0.4, 40, 1, !0),
            e > 5 ? r : n,
          );
          ((t.material.side = 2), (t.position.y = e), a.add(t));
        }
        let u = new p(new E(0.35, 0.45, 6.4, 16), r);
        ((u.position.y = 3.5), a.add(u));
      }
      for (let n of [-1, 1]) {
        let a = new c();
        (a.position.set(n * 6.5, -0.3, -12.5), e.add(a));
        let s = new p(
          new i(2.6, 36, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
          o,
        );
        ((s.position.y = 0.9), a.add(s));
        let l = new p(new E(2.85, 2.95, 1, 40, 1, !0), t);
        ((l.material.side = 2), (l.position.y = 0.5), a.add(l));
        let u = new p(new w(2.85, 0.13, 8, 48), r);
        ((u.rotation.x = Math.PI / 2), (u.position.y = 1), a.add(u));
        for (let e of [0, Math.PI / 2]) {
          let t = new p(new E(0.025, 0.025, 5.7, 6), r);
          ((t.rotation.z = Math.PI / 2),
            (t.rotation.y = e),
            (t.position.y = 1.15),
            a.add(t));
        }
        let d = new p(new w(0.22, 0.04, 6, 16), r);
        ((d.rotation.x = Math.PI / 2), (d.position.y = 1.15), a.add(d));
      }
      let oe = new x({ color: 12081990, roughness: 0.95 }),
        se = new p(new C(90, 1.4, 0.5), oe);
      (se.position.set(0, 0.4, -52), e.add(se));
      let ce = new x({ color: 5913894, roughness: 1 }),
        le = [4160046, 4950580, 3500840].map(
          (e) => new x({ color: e, roughness: 0.95 }),
        ),
        ue = [];
      for (let e = 0; e < 22; e++) {
        let e = (Math.random() - 0.5) * 100,
          t = -30 - Math.random() * 20;
        Math.abs(e) < 9 || ue.push([e, t]);
      }
      for (let e of [-1, 1])
        for (let t of [-6, -11, 2]) ue.push([e * (27 + Math.random() * 6), t]);
      for (let [t, n] of ue) {
        let r = 2.5 + Math.random() * 2,
          a = new p(new E(0.2, 0.3, r, 8), ce);
        (a.position.set(t, r / 2 - 0.3, n), e.add(a));
        let o = le[Math.floor(Math.random() * le.length)];
        for (let a = 0; a < 3; a++) {
          let a = new p(new i(1.4 + Math.random() * 0.8, 12, 10), o);
          (a.position.set(
            t + (Math.random() - 0.5) * 1.6,
            r + Math.random() * 1.2 - 0.3,
            n + (Math.random() - 0.5) * 1.6,
          ),
            e.add(a));
        }
      }
      let de = new x({ color: 12563877, roughness: 1 });
      for (let t = 0; t < 40; t++) {
        let n = 4 + Math.random() * 8,
          r = 6 + Math.random() * 22,
          i = new p(new C(n, r, 5), de);
        (i.position.set(
          -100 + t * 5 + Math.random() * 3,
          r / 2 - 0.3,
          -80 - Math.random() * 15,
        ),
          e.add(i));
      }
      let fe = Et(512, 160, (e) => {
          ((e.fillStyle = `#7a2a1e`),
            e.fillRect(0, 0, 512, 160),
            (e.strokeStyle = `#f1ebe0`),
            (e.lineWidth = 8),
            e.strokeRect(8, 8, 496, 144),
            (e.fillStyle = `#f7efe0`),
            (e.textAlign = `center`),
            (e.textBaseline = `middle`),
            (e.font = `bold 64px Georgia, serif`),
            e.fillText(`JANTAR MANTAR`, 256, 62),
            (e.font = `36px sans-serif`),
            e.fillText(`जंतर मंतर · NEW DELHI`, 256, 120));
        }),
        pe = new p(new C(5.2, 1.6, 0.2), [
          oe,
          oe,
          oe,
          oe,
          new x({ map: fe, roughness: 0.7 }),
          oe,
        ]);
      (pe.position.set(0, 1.25, -21), e.add(pe));
      for (let t of [-1, 1]) {
        let n = new p(new C(0.15, 1, 0.15), oe);
        (n.position.set(t * 2.2, 0.2, -21), e.add(n));
      }
      for (let n of [-O - 1.6, O + 1.6]) {
        let a = -3.2,
          o = new p(new C(0.7, 5.6, 0.7), t);
        (o.position.set(n, 2.8, a), (o.castShadow = !0), e.add(o));
        let s = new p(new C(1.2, 0.3, 1.2), r);
        (s.position.set(n, 5.75, a), e.add(s));
        let c = new p(new i(0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), r);
        (c.position.set(n, 5.9, a), e.add(c));
        let l = new ne(16767392, 4, 8, 2);
        (l.position.set(n, 5.3, -2.6), (l.userData.keepLight = !0), e.add(l));
      }
    }
    buildPlacards(e, t) {
      let n = [];
      for (let e = 3; e < t; e += 6) n.push(e);
      let r = new f(0.8, 0.5);
      r.translate(0, 0.95, 0);
      for (let t of Ft) {
        let i = new a(
          r,
          new x({ map: Pt(t.text, t.bg, t.fg), side: 2, roughness: 0.8 }),
          n.length,
        );
        ((i.frustumCulled = !1), e.add(i), this.placardMeshes.push(i));
      }
      n.forEach((e, t) => {
        let n = t,
          r = this.sloganFor(`neutral`, n);
        this.holders.push({
          ci: e,
          u: Math.random(),
          slot: n,
          cur: r,
          next: r,
          delay: -1,
          flip: 0,
        });
      });
    }
    sloganFor(e, t) {
      let n = [];
      return (
        Ft.forEach((t, r) => {
          t.pool === e && n.push(r);
        }),
        n.length ? n[t % n.length] : 0
      );
    }
    buildBoredFans(e) {
      for (let t = 1; t < e; t += 4)
        t % 6 != 3 &&
          this.boredFans.push({
            ci: t,
            kind: this.boredFans.length % 2 == 0 ? `selfie` : `samosa`,
            phase: Math.random() * 6,
          });
      let t = this.boredFans.length;
      ((this.phones = new a(
        new C(0.07, 0.13, 0.015),
        new x({
          color: 1118481,
          roughness: 0.3,
          emissive: 3832789,
          emissiveIntensity: 0.4,
        }),
        t,
      )),
        (this.samosas = new a(
          new de(0.07, 0.11, 3),
          new x({ color: 14263361, roughness: 0.7 }),
          t,
        )));
      for (let e of [this.phones, this.samosas])
        ((e.frustumCulled = !1), this.group.add(e));
    }
    setLeader(e, t, n = null) {
      ((this.leader = e),
        (this.trailing = n),
        (this.leadIntensity = Math.max(0, Math.min(1, t))));
    }
    setBoredom(e) {
      this.boredom = Math.max(0, Math.min(1, e));
    }
    paparazzi(e) {
      for (let t = 0; t < e; t++) {
        let e = this.flashes.find((e) => e.life <= 0);
        if (!e) return;
        let n =
          this.crowdData[Math.floor(Math.random() * this.crowdData.length)];
        (e.s.position.set(
          n.x,
          this.crowdHeights[this.crowdData.indexOf(n)] + 0.9,
          n.z,
        ),
          (e.life = 0.08 + Math.random() * 0.25 + t * 0.03));
      }
    }
    targetSlogan(e) {
      return this.leader
        ? e.u < 0.2 + 0.7 * this.leadIntensity
          ? this.sloganFor(this.leader, e.slot)
          : e.u > 0.93 && this.trailing
            ? this.sloganFor(this.trailing, e.slot)
            : this.sloganFor(`neutral`, e.slot)
        : this.sloganFor(`neutral`, e.slot);
    }
    updatePlacards(e, t) {
      let n = this.crowdHeights,
        r = new u().makeScale(0, 0, 0);
      for (let i = 0; i < this.holders.length; i++) {
        let a = this.holders[i],
          o = this.targetSlogan(a);
        a.flip <= 0 &&
          a.cur !== o &&
          (a.delay < 0 && (a.delay = Math.random() * 1.2),
          (a.delay -= t),
          a.delay <= 0 && ((a.next = o), (a.flip = It), (a.delay = -1)));
        let s = 1;
        if (a.flip > 0) {
          a.flip -= t;
          let e = 1 - a.flip / It;
          (e >= 0.5 && a.cur !== a.next && (a.cur = a.next),
            (s = Math.max(0.02, Math.abs(Math.cos(e * Math.PI)))));
        }
        let c = this.crowdData[a.ci],
          l = Ft[a.cur].pool !== `neutral`,
          u = (l ? 0.3 : 0.12) * (1 - this.boredom * 0.8);
        (this.dummy.position.set(
          c.x,
          n[a.ci] +
            0.3 +
            (l ? Math.max(0, Math.sin(e * 7 + c.phase)) * 0.12 : 0),
          c.z,
        ),
          this.dummy.rotation.set(
            0,
            (c.x < 0 ? 1 : -1) * 0.9 + Math.sin(e * 3 + c.phase) * 0.15,
            Math.sin(e * 4 + c.phase) * u,
          ),
          this.dummy.scale.set(s, 1, 1),
          this.dummy.updateMatrix());
        for (let e = 0; e < this.placardMeshes.length; e++)
          this.placardMeshes[e].setMatrixAt(
            i,
            e === a.cur ? this.dummy.matrix : r,
          );
      }
      for (let e of this.placardMeshes) e.instanceMatrix.needsUpdate = !0;
      this.dummy.scale.set(1, 1, 1);
    }
    updateBored(e, t) {
      let n = this.boredom,
        r = new u().makeScale(0, 0, 0);
      (this.boredFans.forEach((i, a) => {
        let o = this.crowdData[i.ci],
          s = this.crowdHeights[i.ci] + 0.58,
          c = o.x < 0 ? 1 : -1;
        if (n <= 0.02)
          (this.phones.setMatrixAt(a, r), this.samosas.setMatrixAt(a, r));
        else if (i.kind === `selfie`) {
          if (
            (this.dummy.position.set(o.x - c * 0.32, s + 0.18, o.z),
            this.dummy.rotation.set(
              0.25,
              c > 0 ? -Math.PI / 2 : Math.PI / 2,
              Math.sin(e * 2 + i.phase) * 0.1,
            ),
            this.dummy.scale.setScalar(n),
            this.dummy.updateMatrix(),
            this.phones.setMatrixAt(a, this.dummy.matrix),
            this.samosas.setMatrixAt(a, r),
            n > 0.6 && Math.random() < t * 0.25)
          ) {
            let e = this.flashes.find((e) => e.life <= 0);
            e && (e.s.position.copy(this.dummy.position), (e.life = 0.12));
          }
        } else {
          let t = (Math.sin(e * 3 + i.phase) * 0.5 + 0.5) * 0.12;
          (this.dummy.position.set(
            o.x + c * (0.2 - t * 0.6),
            s - 0.12 + t * 0.5,
            o.z,
          ),
            this.dummy.rotation.set(Math.PI, 0, 0.4),
            this.dummy.scale.setScalar(n),
            this.dummy.updateMatrix(),
            this.samosas.setMatrixAt(a, this.dummy.matrix),
            this.phones.setMatrixAt(a, r));
        }
      }),
        (this.phones.instanceMatrix.needsUpdate = !0),
        (this.samosas.instanceMatrix.needsUpdate = !0),
        this.dummy.scale.set(1, 1, 1));
    }
    updateFlashes(e) {
      for (let t of this.flashes) {
        if (t.life <= 0) {
          t.s.visible = !1;
          continue;
        }
        ((t.life -= e), (t.s.visible = !0));
        let n = Math.max(0, Math.min(1, t.life / 0.1));
        ((t.s.material.opacity = n), t.s.scale.setScalar(0.5 + n * 0.6));
      }
    }
    cheer(e) {
      this.excitement = Math.min(1.5, this.excitement + e);
    }
    setMood(e) {
      this.mood = e;
      let t = Tt[this.stage];
      ((this.sun.intensity = t.sunIntensity * (1 - e * 0.75)),
        (this.hemi.intensity = t.hemiIntensity * (1 - e * 0.7)));
    }
    update(e, t) {
      this.excitement = Math.max(0, this.excitement - t * 0.6);
      let n = this.crowdHeights;
      for (let t = 0; t < this.crowdData.length; t++) {
        let r = this.crowdData[t],
          i =
            Math.max(0, Math.sin(e * (6 + this.excitement * 6) + r.phase)) *
            (0.05 + this.excitement * 0.25) *
            (1 - this.boredom * 0.85);
        ((n[t] = r.y + 0.25 + i),
          this.dummy.position.set(r.x, n[t], r.z),
          this.dummy.rotation.set(0, r.rot, Math.sin(e * 2 + r.phase) * 0.08),
          this.dummy.scale.set(1, 1, 1),
          this.dummy.updateMatrix(),
          this.crowd.setMatrixAt(t, this.dummy.matrix),
          (this.dummy.position.y += 0.58),
          this.dummy.updateMatrix(),
          this.crowdHeads.setMatrixAt(t, this.dummy.matrix));
      }
      ((this.crowd.instanceMatrix.needsUpdate = !0),
        (this.crowdHeads.instanceMatrix.needsUpdate = !0),
        this.updatePlacards(e, t),
        this.updateBored(e, t),
        this.updateFlashes(t));
      for (let t of this.flags) {
        let n = t.mesh.geometry.attributes.position,
          r = n.array;
        for (let n = 0; n < r.length; n += 3) {
          let i = t.base[n];
          ((r[n + 2] = Math.sin(i * 3 - e * 5 + t.phase) * 0.12 * i),
            (r[n + 1] = t.base[n + 1] - i * 0.05));
        }
        ((n.needsUpdate = !0), t.mesh.geometry.computeVertexNormals());
      }
    }
  },
  Rt = `/fightkaro/assets/modi-R8FpxZEb.mp3`,
  zt = `/fightkaro/assets/rahul-C7Jjp4hs.mp3`,
  Bt = `/fightkaro/assets/didi-CjTHLKgc.mp3`,
  Vt = `/fightkaro/assets/trump-Czs6_rQc.mp3`,
  Ht = `/fightkaro/assets/yogi-CJEN4Csa.mp3`,
  Ut = `/fightkaro/assets/nitin-B2ZG9HV5.mp3`,
  Wt = `/fightkaro/assets/mbapu-D85PVY1T.mp3`,
  Gt = `/fightkaro/assets/gulaam-LQ1Mylmz.mp3`,
  Kt = `/fightkaro/assets/shabash-_bo8HJhK.mp3`,
  qt = `/fightkaro/assets/mbapuintro-BI_jQwTJ.mp3`,
  Jt = `/fightkaro/assets/intro-CxITfm7k.mp3`,
  Yt = `/fightkaro/assets/background-sFl8lOjr.mp3`,
  Xt = `/fightkaro/assets/battle-CqvMijZR.mp3`,
  Zt = {
    modi: Rt,
    rahul: zt,
    didi: Bt,
    trump: Vt,
    yogi: Ht,
    nitin: Ut,
    mbapu: Wt,
  },
  Qt = qt,
  $t = Kt,
  en = Gt,
  tn = 1.43,
  nn = {
    intro: { url: Jt, level: 2.2 },
    background: { url: Yt, level: 3 },
    battle: { url: Xt, level: 1.242 },
  },
  rn = `huddle-fightkaro:bapu-v1`,
  an = `#carry=`,
  on = () => ({
    streak: 0,
    unlocked: !1,
    bestSeconds: 0,
    bestDamage: 0,
    peaceWins: 0,
  }),
  sn = () => {
    try {
      return typeof localStorage > `u` ? null : localStorage;
    } catch {
      return null;
    }
  };
function cn(e = sn()) {
  try {
    let t = JSON.parse(e?.getItem(rn) ?? `null`);
    return { ...on(), ...t };
  } catch {
    return on();
  }
}
function ln(e, t) {
  (e.unlocked || (e.unlocked = t.unlocked),
    (e.bestSeconds = Math.max(e.bestSeconds, t.bestSeconds)),
    (e.bestDamage = Math.max(e.bestDamage, t.bestDamage)),
    (e.peaceWins = Math.max(e.peaceWins, t.peaceWins)));
}
function un(e, t = sn()) {
  try {
    (ln(e, cn(t)), t?.setItem(rn, JSON.stringify(e)));
  } catch {}
}
function dn(e, t = sn()) {
  if (!e.startsWith(an)) return !1;
  try {
    let n = JSON.parse(decodeURIComponent(e.slice(7))),
      r = n[rn] ? JSON.parse(n[rn]) : null;
    if (r) {
      let e = cn(t);
      ((e.streak = Math.max(e.streak, Number(r.streak) || 0)),
        ln(e, { ...on(), ...r }),
        un(e, t));
    }
    for (let [e, r] of Object.entries(n))
      e !== rn &&
        e.startsWith(`huddle-fightkaro:`) &&
        t?.getItem(e) == null &&
        t?.setItem(e, r);
  } catch {}
  return !0;
}
var fn = (e) => !e.unlocked && e.streak >= 2;
function pn(e, t) {
  return e.unlocked || ((e.streak = t ? e.streak + 1 : 0), e.streak < 3)
    ? !1
    : ((e.unlocked = !0), !0);
}
function mn(e, t, n, r) {
  ((e.bestSeconds = Math.max(e.bestSeconds, Math.round(t))),
    (e.bestDamage = Math.max(e.bestDamage, Math.round(n))),
    r && e.peaceWins++);
}
var hn = 0.35;
function gn(e, t, n = 0.003) {
  for (let r = 0; r < e.length; r++)
    if (Math.abs(e[r]) > n) return Math.max(0, r / t - 0.01);
  return 0;
}
var _n = class t {
    constructor(t, n, r) {
      (e(this, `ctx`, void 0),
        e(this, `files`, void 0),
        e(this, `current`, `none`),
        e(this, `decoded`, new Map()),
        e(this, `pending`, new Map()),
        e(this, `raw`, new Map()),
        e(this, `playing`, null),
        e(this, `enable`, void 0),
        (this.ctx = t),
        (this.files = r),
        (this.enable = t.createGain()),
        this.enable.connect(n));
    }
    static prefetch(e) {
      return fetch(e)
        .then((e) => (e.ok ? e.arrayBuffer() : null))
        .catch(() => null);
    }
    load(e) {
      let n = this.pending.get(e);
      return (
        n ||
          ((n = (this.raw.get(e) ?? t.prefetch(this.files[e].url))
            .then((e) => (e ? this.ctx.decodeAudioData(e) : null))
            .then((t) => {
              if (!t) return null;
              let n = {
                buffer: t,
                lead: gn(t.getChannelData(0), t.sampleRate),
              };
              return (this.decoded.set(e, n), n);
            })
            .catch(() => null)),
          this.pending.set(e, n)),
        n
      );
    }
    warm() {
      for (let e of Object.keys(this.files)) this.load(e);
    }
    setEnabled(e) {
      let t = this.enable.gain,
        n = this.ctx.currentTime;
      (t.cancelScheduledValues(n), t.setTargetAtTime(+!!e, n, 0.08));
    }
    setTrack(e, t = 0, n = 1.2, r = 0.8) {
      if (e === this.current) return;
      this.current = e;
      let i = this.ctx.currentTime,
        a = this.playing;
      if (a) {
        let e = a.gain.gain;
        (e.cancelScheduledValues(i),
          e.setValueAtTime(e.value, i),
          e.linearRampToValueAtTime(0, i + r));
        for (let e of a.sources)
          try {
            e.stop(i + r + 0.05);
          } catch {}
        (window.setTimeout(() => a.gain.disconnect(), (r + 0.3) * 1e3),
          (this.playing = null));
      }
      e !== `none` &&
        this.load(e).then((r) => {
          if (!r || this.current !== e || this.playing) return;
          let a = this.ctx.createGain();
          a.connect(this.enable);
          let o = Math.max(this.ctx.currentTime, i + t) + 0.02;
          (a.gain.setValueAtTime(0, o),
            a.gain.linearRampToValueAtTime(this.files[e].level, o + n),
            (this.playing = { id: e, gain: a, sources: [], nextStart: o }),
            this.tick());
        });
    }
    tick() {
      let e = this.playing;
      if (!e) return;
      let t = this.decoded.get(e.id);
      if (!t) return;
      let n = this.ctx.currentTime;
      e.nextStart < n - 0.5 && (e.nextStart = n + 0.05);
      let r = t.buffer.duration - t.lead;
      for (; e.nextStart < n + 1;) {
        let n = e.nextStart,
          i = this.ctx.createBufferSource();
        i.buffer = t.buffer;
        let a = this.ctx.createGain();
        (a.gain.setValueAtTime(0, n),
          a.gain.linearRampToValueAtTime(1, n + hn),
          a.gain.setValueAtTime(1, n + r - hn),
          a.gain.linearRampToValueAtTime(0, n + r),
          i.connect(a).connect(e.gain),
          i.start(n, t.lead, r),
          (i.onended = () => {
            a.disconnect();
            let t = e.sources.indexOf(i);
            t >= 0 && e.sources.splice(t, 1);
          }),
          e.sources.push(i),
          (e.nextStart = n + r - hn));
      }
    }
  },
  vn = `/fightkaro/assets/aloolelo-BopBNjJr.mp3`,
  yn = `/fightkaro/assets/bed_bulldozer-BE_e8yDo.mp3`,
  bn = `/fightkaro/assets/bed_chakra-CjyFjT3l.mp3`,
  xn = `/fightkaro/assets/bed_jadu-jl3ElSBF.mp3`,
  Sn = `/fightkaro/assets/bed_tariff-CLVTzIAp.mp3`,
  Cn = `data:audio/mpeg;base64,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`,
  wn = `/fightkaro/assets/boom-Brg2wdT5.mp3`,
  Tn = `/fightkaro/assets/camera_clicks-DJHuyBDj.mp3`,
  En = `/fightkaro/assets/chai_ting-Q1sP8TcN.mp3`,
  Dn = `/fightkaro/assets/charge_chakra-1s5EOYKm.mp3`,
  On = `/fightkaro/assets/charkha-BxjP7rEd.mp3`,
  kn = `/fightkaro/assets/coins-DVYyL0Kv.mp3`,
  An = `/fightkaro/assets/cow_bell-Cj3rAWh8.mp3`,
  jn = `/fightkaro/assets/crate_crash-Cr6VTWOz.mp3`,
  Mn = `/fightkaro/assets/cup_break-BgaQYkuS.mp3`,
  Nn = `/fightkaro/assets/drumroll-BzHoJfte.mp3`,
  Pn = `/fightkaro/assets/engine_loop-D0YGxkt_.mp3`,
  Fn = `/fightkaro/assets/eye_zing-qZiVqGmG.mp3`,
  In = `data:audio/mpeg;base64,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`,
  Ln = `data:audio/mpeg;base64,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`,
  Rn = `data:audio/mpeg;base64,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`,
  zn = `data:audio/mpeg;base64,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`,
  Bn = `/fightkaro/assets/horn_long-dLtoq4Pf.mp3`,
  Vn = `data:audio/mpeg;base64,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`,
  Hn = `/fightkaro/assets/jingle_lose-gAS4mNKd.mp3`,
  Un = `/fightkaro/assets/jingle_win-DqlQ62Fq.mp3`,
  Wn = `/fightkaro/assets/kaching-wbD5pe6-.mp3`,
  Gn = `/fightkaro/assets/metal_crunch-DdbVoplE.mp3`,
  Kn = `/fightkaro/assets/moo-C_6f5G0B.mp3`,
  qn = `/fightkaro/assets/news_sting-C-mndS4t.mp3`,
  Jn = `/fightkaro/assets/pen_scribble-BM1Jp2uD.mp3`,
  Yn = `data:audio/mpeg;base64,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`,
  Xn = `/fightkaro/assets/poof-BlJFjDeg.mp3`,
  Zn = `/fightkaro/assets/release_bulldozer-CyubjB_l.mp3`,
  Qn = `/fightkaro/assets/release_chakra-BvOYn27E.mp3`,
  $n = `/fightkaro/assets/release_jadu-BVQ3aIZ7.mp3`,
  er = `/fightkaro/assets/release_tariff-DZ1JBEzs.mp3`,
  tr = `/fightkaro/assets/reverse_beeps-DaQ4ZZDr.mp3`,
  nr = `data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYzLjEuMTAyAAAAAAAAAAAAAAD/+1DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAgAAAdXADg4ODg4ODg4ODg4OFVVVVVVVVVVVVVVVXFxcXFxcXFxcXFxcXGOjo6Ojo6Ojo6Ojo6qqqqqqqqqqqqqqqqqx8fHx8fHx8fHx8fH4+Pj4+Pj4+Pj4+Pj4////////////////wAAAABMYXZjNjMuMS4AAAAAAAAAAAAAAAAkBSgAAAAAAAAHV8PpfQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAACYlW+RQRAAGSL2/3CqAC7WaABFjZEoFG8HRtXndCMpzzvITXqfISje9DuhCVPqc8hCKQinPIRvzvO///6Eap/5Gkb9D0I056v0IykY5zoEEQQE58EHf/KOOF5AUCgVCi1Wi0Wi0WgUCjUZ6gnkp3Id3kAdGO7vkwwUef2kw8H4i0/foiHDQMwVfmN8UCaFAIQmLEH9/8oYSAVAvCQaCLIP//8nFcWytzEFgQhN////lhHDwVRAj49hmOg1jAkNEhzHuch3cep5ByTP/7UsQFAAt8tWfdsoABXROruPSNWDRQ5nlM+AlTQM4rZZE6k5GHomauM1TAVgGAcEK+ZDXMHiujmd7bIqsVizXs5SszdWl0fMZaOahVFj5Y0DVg4e9rgnK31vYnQxoas/z0z/p/T9eDEVDwyHT7ICvB+iUyYqGoknR3REQorYHAmB5qnnGj8EeRbqWzGZG16VOHnnr2DwzMzekutNqVoa14Kys8WgkHRrhKFbyQhFaH3U9n77e7U1A6lBVy/bUqJJdGd2RFEiiQMhsAD1cD/NAH//tSxAkASzh9U+ewZYFPESjxhgx4QCpUw4mxLJpHKtzyXg+XN1eSlbOsxtjMO1UBi7X6jcvcKQo+5+JFQE8FSrwXaypYKJnwkmkJSrdgurVRFLf/23CupriNB3QsXez2MN1wlEgtRiKpCUblAQi8IYlFozJxTlYZRK6LG3fPYyjOcFWMz11W31CklLZ+FZQphLT+QDKjASON2HYKuU1R4wp9trg77v16515Nv7fr6n6KEubcbLXWrVXGTEnymKBLEk/L5gIReJNiyiecJKqkrUL/+1LEEAAKqDU/jDDDQVoN5vD2GGikQyEmDwXIlgeJD3CWkBPBdr4dHkXmwCZWGmqeUErT0RnQMJSQaPHmaLytbukKD3aZvX6AokPauRkVSqFQCkmrEORspCUAg2GS8PCUosYGAaAknzWubzMOMSoiqc7afEvj/7TH0oKiwdBQs8NAOZWbmEmCM2QMriYofYpiq1SY94Wej+sj33U9j/3/qjdtdJFctILoPQfHInmAUIIdiSQBSQl5bMUTOjqOxPFMkv5Ob6RbCRcogIkCYAEodf/7UsQYAAssVzeHsMGBb43msPYMMOLsNhl4caecaa0NnYDDrjyA6wsMe8+5jhTWlkOHK0yHoK/f/625Gy3ybc1m0T5lRDPFqhtzAyEo2TGaKgNiySXFtcCFuludYSEJxTggxOwLX72kRKDLFRQcByr0KlBMZFThkqYFSRRIaLSou8fMMv8kVoFGMka5hAAfSVGNR5E9OfjT9wWqbc8/7NLKoUItFfn/xUF1cSnJqlTE4/sesS4muSygg9DYDCIMoFhKCzSgOPWJCQVCYBYuGjuC//tSxBsACjRDNYewY4E/i6MVlJgo0qgkVArtaNbTrIfW4BUzQshUNRVG+4W/9FWvQAGQGuEfIRRUjBESIRsUIXJgsKPB3ei0Jc4FNzLw42IO8+8rKMDiRrRQE3A4F0E2jAtHiGtBhoHrbIV7BiqqAZJPu6QkIxlEenV/V/+xmZFqCEkwZoqXuG7b7gOBaAeEAbgRhcrgL4vJoF000I8VnNT3bJvOA/PTZNVXuum+5vu/e67ztk96w4Gz4PlRp8vHg+tamr60z0uTJrebH75m/+v/+1LEKAMLaJEWLCTFgSsHYoWHpAC1trQOlaV0rJtrWkBwqg1kA/HUGnlRShWCwaTQxjG1pLIt8tVRIgaeFQWBoClToNA0WAomBq0FQaBoqGmiIGrUzwl9YNc6HdHzy8jnTuS+d0e3w1/KnQAgEwwkpVHOoAsgeIBz4eokBhY0aFW5UKCxr4SFzOLCpkyEhd2CwqRMhJusV8UFsWFdYoLYsKs1agkKnIqKcWFcVZ/+Ki1MQU1FNC4wVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsQzA8i8FtTHmMJAAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`,
  rr = `data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYzLjEuMTAyAAAAAAAAAAAAAAD/+1DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAUAAATkAFVVVVVVVVVVVVVVVVVVVVVVVVV/f39/f39/f39/f39/f39/f39/f6qqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dX//////////////////////////wAAAABMYXZjNjMuMS4AAAAAAAAAAAAAAAAkA78AAAAAAAAE5ArY6YUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAACTCS4RQTAAGfI6u3CtAARAAIA3pGNkNkAEY934iM/u//4z/vviIchhMBplAAIkADDwGF0QIINER7u2JhYEBoPuB8LAgUOCf9EP3fyjgwXej5//5D/8o4MLG38HP4/H4/H4/A4GAY4nW4gGoXcdLUIyCRqWhmYIyBj3VTUgBeFR8d9E1WyRoaOCsgtwwIlosFo1Mggt3k00GEEYJIcbuy/s2kMOXiTJUl0ur/8pD0WdOLJNJH///LD7GJuHzgD//6lYzdu2UTAAEolf/7UsQEgArEs1P9hAAhhhSlUAekcD+1bNSCZ1/XidWWx7cpjbT0qgQcJwAo5jrlvta4Zl1Fa5VVblaWJiGtaq//mqbVovXprtu+4KeExYkn4i3sikr/I88g6RnZL1Rv3870AJxgAjNYsiuZZT/OMcMIWUNEkR+HFBgIuiIUKyNZERCMEe0AzbKhMCIEpoYIgSLmBUaZZlopQoVpX1kW/Jer8pR9+aFMNDgmIiIMipyZZgqMOjyD1p8OiasJKBU7PHv8WHrLueMBgGtM+xjMng6s//tSxAaDyrCnFgC9KYF6pGJBRhZo+pEXXY5ThdIp0xninijIlVIhUismEyT1lyp40q5p6jPaauMYSylpf7KV3nkqGQSEoqGihUVSaT1EqZuKi0S6aipMj7dV6tP+pTvdBJ0TEfgashHiZcZOqgnlo7EweNFRKJ5sUgGmb93hwbWRPPGKxY3droDyX5ef+j93c6FiFhmemLee20NXU51Jc87mkXOdSNdX2b6l6bpd0r/HBPS/NUKd+JEff/TVYAAAAHRrqOXSLoCmD0tnqXbxiPH/+1LECgHLAJsXCDBtgV2U4sBsINCEr0NUhweuWPUIlDc3ZEdtesm/HmrkOlaVo8O9CpY1z4b9yVxJwkMXA0LGhiBRRcm8BBFTGdMcwz2uQihafldBeP9H7XTMNpEmCROIwMZJoWP/cFR4qVbKy7S4PB8cIooERQRbg8xQPA2FzFNHrE2Yd1jTW3QcU6XS1axaPXF5IqdU54VUfgm4R2jHlmG2AKROhUrTVTYp3////QogQDN+UmvZaRqyyyH6/6r8AjwodOkohqeysNWal6PuXP/7UsQQAQaMSQ7AhGABKIzPSBAJyfSeWKniXI/2fhoS1na5HiVwiVs9wIDKZGRkZGeRkZdUVFT/0MUMDBAwMR///aaaVP//qqqqrppppqqqqr/6f///lVVVQSVph0VVVVW/tP//6RVVVV00001VVVV000w6TEFNRTQuMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`,
  ir = `/fightkaro/assets/stamp_slam-CAslQB_C.mp3`,
  ar = `data:audio/mpeg;base64,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7USYNc6CEVsQ06D6D5oMnBgxvyP078Z0IP/v//dfru5t/zv39n7pffx3FUaNz+YaDDVrJ/2/tmuhnGb/+1LEvYIG0A8bLRkgIT8E4QHEjAlOAAwgCAzHrfRNAZOZRXzY0oiL8tj+GZcUSXbnwd8u9WVuHyQiTU3LIaL0QcxaB2p31qvvCw4YIrmmUO07NaRW56ZqmRlKf/kv/zK+ZdMp+RzM4RdznZ9jnxxS4acTtUZDAACABTlCVicPTtu9hvPLWsu6/fGh+ua0tjrGtp9KiYT7HylgV6V2t3zLCQOmii1odhFhZXMq6K8NAkoO/9Ln+dH39/+18vVc3+Y7bzNgv8ovbr9+wzm+PxD7uf/7UsTYAgoEFQgNmEBJPhthYbMMCCPGGP6Y2HrOCS9mwDEkk5bZsYsskdSvzJrEga7kAwm0cWa2CHaO+Icbo9rPD2ocYuocadcfPmihosPiJ1zYiJ3UT0z7U0yeqmo9GDyTzRakLhF5Y00KUoh0sbUTfPW+NSs/FMOfc/PHxPJ/Z3vo5L5fn4ZDYi93XxER1Eb73v/98UxFd971NBsasRf////////Xf///////+fD1OEFjIRYzgFcapRg0FAoFM17ml3oO87TWhBQHSShfSRD4//tSxOYACqRvCs0IYAl/sGElowwpEVGIPVBTUgqwnwXoXWUt0kniXD+MCPomJyaqZbaQ0DhLhSJIYZ30lbKXGKPYmkqSI5Spa1Vqf15iTjYkiWJpkTT1JWy76/yRJUnGpONzI+SKRN1V1//81LpqXkTI+ZHzGXTAxPP+32//8yYvJ//0Ao0aKIMLkXJygvdBwGjwKgqsFToNBwRA0sFXgqdLBz+txU7BqHZU6VOwa/90s9WCvU////g1BqVOrDUGlUxBTUU0LjBVVVVVVVVVVVX/+1LE6YAL5PUHFbGAClnBYQM2sAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTMgBIFoQYZtoAA8IIaS54wAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`,
  or = `/fightkaro/assets/thunder-BRWemNyY.mp3`,
  sr = `data:audio/mpeg;base64,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rqTWgn1GpVsxOWk7TuffdUKHxSr5T922xtDndyVptjkod9qW/U0jVQBt3fZ0xMaMyiiUIv58Mzyx7mT/+1LET4MIkF8QI2jjwRyMIcG3iWAPzKx9b0mV9+986C0uuyxOnM191X/vAW76mbF/5Dd6KffIiVL9x2B4IBtSmj/WOVjDCH1IFgNbC38aXvsrM16tGz/O//f3u9et/dR9jNn/QsAGVelAriegPsUOa4yDlbmIZX518q+LaMPbMPbva7+jdu2fZ/b9n2/R9318VEAIUSXG5lHwp1l9Jvei0T8KAG+NfVl5Z7ZLIZ7O/0ffs+7206GbtC/yvQVLs6LL7TfmqgGDNf7wxgJwM2z2C//7UsRngQakXRrB4aLAtgejWDyUWA1PlgbV86+jZKP3V69ORyOT3/t2M27Nn2Iuqp9fna3/q+uAAAgQa8zIbABPAaS3rR/CbB9u8ueq5QdyUSuxL87Dvz30KPfkee+7vqfI/orh1Z2SLeJiv+DTy1VMQU1FNC4wVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQMgqzYCBRRZwkaA8DgeD4eGyg2MDYgOLpXS//tSxJQABZgvHyC9ouDKBeMcHBRYaSZRJdILCwt1C4qKioqLNULC4qsVZ/Fhb4rxZuv/txYVFRUVFBb+VFRUVFRYWFhYXFWLFRZMQU1FNC4wVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LEwgAFwDEYwL4CAOCE4WQXsFhVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTJA8ngPKbDJSTAAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`,
  cr = `/fightkaro/assets/ui_confirm-DEEar_Kj.mp3`,
  lr = `/fightkaro/assets/ui_select-DvWPzIZM.mp3`,
  ur = `data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYzLjEuMTAyAAAAAAAAAAAAAAD/+1DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAQAAAQTAGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZpmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZnMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM/////////////////////////////////wAAAABMYXZjNjMuMS4AAAAAAAAAAAAAAAAkBloAAAAAAAAEE6xvqicAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAAB6CQznQBAAkssGdDBUAARBTUY//tq+p6EIpGU56EyE1OdBbkCCChwNw/xH4Mh/DP/xGGY+AYARz8PwMjnj8HT//5vP///o+AYIjnwMjGNxBk2FmNjMEAJoExHHAN8igKQjjeaHyYPGSKjL5cPF89Z1u/6CSKiKFxqBfGZPfzR0LKoIsr/9b96CFvWVm/+63////////6jioAZoIiAA4AMF1KDM8VLYdQ7wMevA1PQDlpgMiCBu4QVEojMlVkkknqSSqdT6T0UUUUlv/7UsQZAA5hUyPcGgABe6jisB010ImLJF4vJLZJRNkHEYB1QuZJ50n9SLf6SXW3/9qaicJspjMkiXnRRR0Ufv76v/6tSDGhmaF5MxNQV//+YIGgKAgZBDdAAEoJBzzrLAp45J/mhhnyhmuMqCOvGKSvhkv/1+u3/6zo5wkgRICJAdIcJLLdkv//u3/7plwmkkTxhRhRymD737b3//9a0000DYul5Mul0uni8p//+04bBYeCqhkwYAIAru2q6OoxPH0S6H8Ag1A2x0BgqOUdQW7d//tSxA4DScktDQo8WgE/pB9A1Yooa/3e+jvRU751fNW9XksEJFxRr46fv7t///rKgEBEMtdvt/T/vznBBwFAw91Hv3foW6Y9SX+mXTIxMABKBXwChJCZx7K/h3/DnX9RW1rW/y39IrARLEH1/Tt3Q2UpfqUpSldDGf6GMa35jf5jP/RwoePKBpnLO+W5FhJYKgqnJagaDqpMQU1FNC4wqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+1LEHIPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==`,
  dr = `data:audio/mpeg;base64,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`,
  fr = `/fightkaro/assets/ko-CYX5YdIq.mp3`,
  pr = `/fightkaro/assets/fight-BTHw9nHH.mp3`,
  mr = `/fightkaro/assets/final_round-2ps4Gt_y.mp3`,
  hr = `/fightkaro/assets/ko-CYX5YdIq.mp3`,
  gr = `/fightkaro/assets/perfect-Dm5Oy3HT.mp3`,
  _r = `/fightkaro/assets/round_1-4pTCkOAK.mp3`,
  vr = `/fightkaro/assets/round_2-BIyjSuFz.mp3`,
  yr = `/fightkaro/assets/time_up-Carf_3Z9.mp3`,
  br = `/fightkaro/assets/you_lose-mLbO-eAT.mp3`,
  xr = `/fightkaro/assets/you_win-DHsvvWFw.mp3`,
  Sr = Object.assign({
    "../assets/sfx/aloolelo.mp3": vn,
    "../assets/sfx/bed_bulldozer.mp3": yn,
    "../assets/sfx/bed_chakra.mp3": bn,
    "../assets/sfx/bed_jadu.mp3": xn,
    "../assets/sfx/bed_tariff.mp3": Sn,
    "../assets/sfx/block.mp3": Cn,
    "../assets/sfx/boom.mp3": wn,
    "../assets/sfx/camera_clicks.mp3": Tn,
    "../assets/sfx/chai_ting.mp3": En,
    "../assets/sfx/charge_chakra.mp3": Dn,
    "../assets/sfx/charkha.mp3": On,
    "../assets/sfx/coins.mp3": kn,
    "../assets/sfx/cow_bell.mp3": An,
    "../assets/sfx/crate_crash.mp3": jn,
    "../assets/sfx/cup_break.mp3": Mn,
    "../assets/sfx/drumroll.mp3": Nn,
    "../assets/sfx/engine_loop.mp3": Pn,
    "../assets/sfx/eye_zing.mp3": Fn,
    "../assets/sfx/frog.mp3": In,
    "../assets/sfx/hit_1.mp3": Ln,
    "../assets/sfx/hit_2.mp3": Rn,
    "../assets/sfx/hit_3.mp3": zn,
    "../assets/sfx/horn_long.mp3": Bn,
    "../assets/sfx/horn_short.mp3": Vn,
    "../assets/sfx/jingle_lose.mp3": Hn,
    "../assets/sfx/jingle_win.mp3": Un,
    "../assets/sfx/kaching.mp3": Wn,
    "../assets/sfx/metal_crunch.mp3": Gn,
    "../assets/sfx/moo.mp3": Kn,
    "../assets/sfx/news_sting.mp3": qn,
    "../assets/sfx/pen_scribble.mp3": Jn,
    "../assets/sfx/plop.mp3": Yn,
    "../assets/sfx/poof.mp3": Xn,
    "../assets/sfx/release_bulldozer.mp3": Zn,
    "../assets/sfx/release_chakra.mp3": Qn,
    "../assets/sfx/release_jadu.mp3": $n,
    "../assets/sfx/release_tariff.mp3": er,
    "../assets/sfx/reverse_beeps.mp3": tr,
    "../assets/sfx/slap.mp3": nr,
    "../assets/sfx/snap.mp3": rr,
    "../assets/sfx/stamp_slam.mp3": ir,
    "../assets/sfx/thud.mp3": ar,
    "../assets/sfx/thunder.mp3": or,
    "../assets/sfx/ui_back.mp3": sr,
    "../assets/sfx/ui_confirm.mp3": cr,
    "../assets/sfx/ui_select.mp3": lr,
    "../assets/sfx/ui_tap.mp3": ur,
    "../assets/sfx/whoosh.mp3": dr,
  }),
  Cr = Object.assign({
    "../assets/voice/double_ko.mp3": fr,
    "../assets/voice/fight.mp3": pr,
    "../assets/voice/final_round.mp3": mr,
    "../assets/voice/ko.mp3": hr,
    "../assets/voice/perfect.mp3": gr,
    "../assets/voice/round_1.mp3": _r,
    "../assets/voice/round_2.mp3": vr,
    "../assets/voice/time_up.mp3": yr,
    "../assets/voice/you_lose.mp3": br,
    "../assets/voice/you_win.mp3": xr,
  });
function wr(e) {
  let t = new Map();
  for (let [n, r] of Object.entries(e))
    t.set(n.replace(/^.*\/(.+)\.mp3$/, `$1`), r);
  return t;
}
var Tr = wr(Sr),
  Er = wr(Cr),
  Dr = [
    `ui_tap`,
    `ui_select`,
    `ui_confirm`,
    `ui_back`,
    `jingle_win`,
    `jingle_lose`,
    `hit_1`,
    `hit_2`,
    `hit_3`,
    `block`,
    `whoosh`,
    `thud`,
    `boom`,
    `slap`,
    `moo`,
    `cow_bell`,
    `chai_ting`,
    `cup_break`,
    `camera_clicks`,
    `news_sting`,
    `aloolelo`,
    `charkha`,
  ],
  Or = {
    modi: [`charge_chakra`, `bed_chakra`, `release_chakra`],
    rahul: [
      `bed_tariff`,
      `release_tariff`,
      `eye_zing`,
      `poof`,
      `plop`,
      `horn_short`,
      `engine_loop`,
      `drumroll`,
      `kaching`,
      `coins`,
    ],
    didi: [
      `bed_jadu`,
      `release_jadu`,
      `thunder`,
      `poof`,
      `frog`,
      `snap`,
      `plop`,
    ],
    trump: [
      `bed_tariff`,
      `release_tariff`,
      `pen_scribble`,
      `kaching`,
      `coins`,
      `drumroll`,
      `crate_crash`,
      `stamp_slam`,
    ],
    nitin: [
      `release_bulldozer`,
      `thunder`,
      `snap`,
      `plop`,
      `poof`,
      `metal_crunch`,
      `horn_short`,
    ],
    yogi: [
      `bed_bulldozer`,
      `release_bulldozer`,
      `eye_zing`,
      `horn_long`,
      `horn_short`,
      `engine_loop`,
      `reverse_beeps`,
      `metal_crunch`,
    ],
    mbapu: [`whoosh`, `thud`, `boom`, `slap`],
  },
  kr = {
    charge_chakra: 8 / 1.2,
    bed_chakra: 8 / 1.2,
    bed_jadu: 6.45 / 1.2,
    bed_tariff: 5 / 1.2,
    bed_bulldozer: 4.05 / 1.2,
    drumroll: 4.2,
  },
  Ar = { engine_loop: 1.244 },
  jr = `huddle-fightkaro:muted`;
function Mr(e) {
  let t = [],
    n = 0,
    r = 0;
  for (; n < e - 0.12;) {
    let i = n / e,
      a = 0.46 - 0.31 * i ** 0.8;
    (t.push({
      t: n,
      syl: r % 2 == 0 ? `HUM` : `BA`,
      k: i,
      len: Math.min(0.34, a * 0.92),
    }),
      (n += a),
      r++);
  }
  return t;
}
var Nr = 8,
  Pr = 0.03,
  Fr = -2,
  Ir = 0.88,
  Lr = class {
    constructor() {
      (e(this, `ctx`, null),
        e(this, `master`, null),
        e(this, `musicGain`, null),
        e(this, `sfxBus`, null),
        e(this, `output`, null),
        e(this, `music`, null),
        e(this, `musicWasOn`, !0),
        e(this, `wantTrack`, { id: `none`, delay: 0 }),
        e(this, `onStateChange`, null),
        e(this, `clip`, null),
        e(this, `bufClip`, null),
        e(this, `clipBus`, null),
        e(this, `silenced`, !1),
        e(this, `routed`, new WeakSet()),
        e(this, `sfxBytes`, new Map()),
        e(this, `sfxBuffers`, new Map()),
        e(this, `decodeChain`, Promise.resolve()),
        e(this, `decoding`, new Set()),
        e(this, `voices`, []),
        e(this, `lastPlayed`, new Map()),
        e(this, `bed`, null),
        e(this, `engine`, null),
        e(this, `loop`, null),
        e(this, `musicOn`, !0),
        e(this, `muted`, zr()),
        e(this, `gamePaused`, !1),
        e(this, `clipCache`, new Map()),
        e(this, `fading`, null),
        e(this, `clipBytes`, new Map()),
        e(this, `clipBuffers`, new Map()));
    }
    preloadCommon() {
      this.preloadSfx([...Dr, ...[...Er.keys()].map((e) => `voice:${e}`)]);
    }
    unlock() {
      if (!this.ctx) {
        let e = window.AudioContext ?? window.webkitAudioContext;
        if (!e) return;
        this.ctx = new e();
        let t = this.ctx.createDynamicsCompressor();
        ((t.threshold.value = Fr),
          (t.knee.value = 0),
          (t.ratio.value = 20),
          (t.attack.value = 0.002),
          (t.release.value = 0.1),
          (this.output = this.ctx.createGain()),
          (this.output.gain.value = Ir),
          t.connect(this.output).connect(this.ctx.destination),
          (this.master = this.ctx.createGain()),
          (this.master.gain.value = this.muted ? 0 : 0.7),
          this.master.connect(t),
          (this.sfxBus = this.ctx.createGain()),
          (this.sfxBus.gain.value = +!this.muted),
          this.sfxBus.connect(t),
          (this.clipBus = this.ctx.createGain()),
          this.clipBus.connect(this.master),
          (this.musicGain = this.ctx.createGain()),
          (this.musicGain.gain.value = 0.22),
          this.musicGain.connect(this.master),
          (this.music = new _n(this.ctx, this.musicGain, {
            intro: { ...nn.intro },
            background: { ...nn.background },
            battle: { ...nn.battle },
          })),
          this.music.warm(),
          window.setInterval(() => this.tickMusic(), 250),
          this.ctx.addEventListener(`statechange`, () =>
            this.onStateChange?.(),
          ),
          document.addEventListener(`visibilitychange`, () => {
            this.ctx &&
              !this.gamePaused &&
              (document.hidden ? this.ctx.suspend() : this.ctx.resume());
          }),
          this.wantTrack.id !== `none` &&
            this.setTrack(this.wantTrack.id, this.wantTrack.delay),
          this.decodeClips());
        for (let e of this.sfxBytes.keys()) this.decodeSfx(e);
      }
      this.ctx.state !== `running` &&
        !this.gamePaused &&
        this.ctx.resume().then(() => this.onStateChange?.());
    }
    get locked() {
      return !this.ctx || this.ctx.state !== `running`;
    }
    toggleMute() {
      return (this.setMuted(!this.muted), this.muted);
    }
    setMuted(e) {
      ((this.muted = e),
        this.master && (this.master.gain.value = this.muted ? 0 : 0.7),
        this.sfxBus && (this.sfxBus.gain.value = +!this.muted),
        this.clip && (this.clip.muted = this.muted));
      try {
        localStorage.setItem(jr, e ? `1` : `0`);
      } catch {}
      this.onStateChange?.();
    }
    setTrack(e, t = 0) {
      ((this.wantTrack = { id: e, delay: t }), this.music?.setTrack(e, t));
    }
    tickMusic() {
      this.music &&
        this.ctx &&
        (this.musicOn !== this.musicWasOn &&
          ((this.musicWasOn = this.musicOn),
          this.music.setEnabled(this.musicOn)),
        this.music.tick());
    }
    preloadSfx(e) {
      for (let t of e) {
        if (this.sfxBytes.has(t)) continue;
        let e = t.startsWith(`voice:`) ? Er.get(t.slice(6)) : Tr.get(t);
        e &&
          (this.sfxBytes.set(
            t,
            fetch(e)
              .then((e) => (e.ok ? e.arrayBuffer() : null))
              .catch(() => null),
          ),
          this.decodeSfx(t));
      }
    }
    preloadFighters(e) {
      this.preloadSfx(e.flatMap((e) => Or[e] ?? []));
    }
    decodeSfx(e) {
      let t = this.ctx,
        n = this.sfxBytes.get(e);
      t &&
        n &&
        !this.sfxBuffers.has(e) &&
        !this.decoding.has(e) &&
        (this.decoding.add(e),
        (this.decodeChain = this.decodeChain.then(async () => {
          let r = await n;
          if (r)
            try {
              this.sfxBuffers.set(e, await t.decodeAudioData(r.slice(0)));
            } catch {}
        })));
    }
    play(e, t = {}) {
      let n = this.ctx,
        r = this.sfxBuffers.get(e);
      if (!n || !this.sfxBus || !r || this.muted || n.state !== `running`)
        return null;
      let i = n.currentTime;
      if (i - (this.lastPlayed.get(e) ?? -1) < Pr) return null;
      (this.lastPlayed.set(e, i),
        !t.keep &&
          this.voices.length >= Nr &&
          this.fadeOut(this.voices.shift(), 0.02));
      let a = n.createBufferSource();
      ((a.buffer = r), (a.playbackRate.value = t.rate ?? 1));
      let o = n.createGain();
      ((o.gain.value = (t.gain ?? 1) * (Ar[e] ?? 1)),
        a.connect(o).connect(this.sfxBus));
      let s = Math.min(
        Math.max(0, t.offset ?? 0),
        Math.max(0, r.duration - 0.05),
      );
      a.start(i, s);
      let c = { src: a, gain: o };
      return (
        t.dur !== void 0 &&
          this.fadeOut(c, 0.06, i + Math.max(0.02, t.dur - 0.06)),
        t.keep ||
          (this.voices.push(c),
          (a.onended = () => {
            let e = this.voices.indexOf(c);
            e >= 0 && this.voices.splice(e, 1);
          })),
        c
      );
    }
    fadeOut(e, t, n) {
      if (!this.ctx) return;
      let r = Math.max(n ?? 0, this.ctx.currentTime),
        i = e.gain.gain;
      (i.cancelScheduledValues(r),
        i.setValueAtTime(i.value, r),
        i.linearRampToValueAtTime(0, r + t));
      try {
        e.src.stop(r + t + 0.02);
      } catch {}
    }
    dipMusic(e, t) {
      if (!this.ctx || !this.musicGain) return;
      let n = this.ctx.currentTime;
      (this.musicGain.gain.setTargetAtTime(e, n, 0.03),
        this.musicGain.gain.setTargetAtTime(
          this.clipActive ? 0.04 : 0.22,
          n + t,
          0.5,
        ));
    }
    playTimed(e, t, n = !1) {
      let r = kr[e] ?? t;
      return this.play(e, { offset: r - t, keep: n });
    }
    announce(e) {
      this.play(`voice:${e}`);
    }
    uiTap() {
      this.play(`ui_tap`);
    }
    uiSelect() {
      this.play(`ui_select`);
    }
    uiConfirm() {
      this.play(`ui_confirm`);
    }
    uiBack() {
      this.play(`ui_back`);
    }
    matchJingle(e) {
      this.play(e ? `jingle_win` : `jingle_lose`) &&
        this.dipMusic(0.05, e ? 2.6 : 3);
    }
    hit(e) {
      let [t, n] =
        e < 0.62 ? [`hit_1`, 0.4] : e < 1.07 ? [`hit_2`, 0.85] : [`hit_3`, 1.3];
      this.play(t, { gain: (0.6 + e * 0.3) / (0.6 + n * 0.3), rate: Rr() });
    }
    block() {
      this.play(`block`, { rate: Rr() });
    }
    whoosh() {
      this.play(`whoosh`, { rate: Rr() });
    }
    thud() {
      this.play(`thud`, { rate: Rr() });
    }
    boom() {
      this.play(`boom`);
    }
    charge(e, t) {
      this.playTimed(`charge_${t}`, e);
    }
    moo() {
      this.play(`moo`);
    }
    cowBell() {
      this.play(`cow_bell`);
    }
    chaiTing() {
      this.play(`chai_ting`);
    }
    cupBreak() {
      this.play(`cup_break`);
    }
    cameraClicks(e) {
      this.play(`camera_clicks`, {
        gain: Math.min(1.2, Math.sqrt(e / 8)),
        rate: Rr(),
      });
    }
    newsSting() {
      this.play(`news_sting`);
    }
    startSuperBed(e, t) {
      (this.stopSuperBed(0.05), (this.bed = this.playTimed(`bed_${t}`, e, !0)));
    }
    stopSuperBed(e = 0.08) {
      this.bed && (this.fadeOut(this.bed, e), (this.bed = null));
    }
    superRelease(e) {
      (this.stopSuperBed(0.06),
        this.play(`release_${e}`, { keep: !0 }) && this.dipMusic(0, 1.2));
    }
    thunder() {
      this.play(`thunder`);
    }
    poof() {
      this.play(`poof`, { rate: Rr() });
    }
    frogCroak() {
      this.play(`frog`);
    }
    snap() {
      this.play(`snap`);
    }
    slap(e = 1) {
      this.play(`slap`, { gain: e, rate: Rr() });
    }
    plop() {
      this.play(`plop`);
    }
    penScribble(e, t = 7) {
      this.play(`pen_scribble`, { dur: e + 0.05 });
    }
    kaching(e = 1) {
      this.play(`kaching`, { gain: e });
    }
    coins(e = 16) {
      this.play(`coins`, { gain: Math.min(1, Math.sqrt(e / 16)) });
    }
    drumroll(e) {
      this.playTimed(`drumroll`, e);
    }
    crateCrash() {
      this.play(`crate_crash`, { rate: Rr() });
    }
    stampSlam() {
      this.play(`stamp_slam`);
    }
    eyeZing() {
      this.play(`eye_zing`);
    }
    horn(e = 0.55) {
      this.play(e < 0.45 ? `horn_short` : `horn_long`);
    }
    startLoop(e, t = 0.8) {
      this.stopLoop(0.05);
      let n = this.play(e, { keep: !0, gain: t });
      n && ((n.src.loop = !0), (this.loop = n));
    }
    stopLoop(e = 0.5) {
      this.loop && (this.fadeOut(this.loop, e), (this.loop = null));
    }
    startEngine() {
      this.stopEngine(0.05);
      let e = this.play(`engine_loop`, { keep: !0, gain: 1e-4 });
      e && ((e.src.loop = !0), (this.engine = e));
    }
    setEngine(e, t) {
      let n = this.engine;
      if (!n || !this.ctx) return;
      let r = this.ctx.currentTime;
      (n.gain.gain.setTargetAtTime(
        Math.max(1e-4, e * (Ar.engine_loop ?? 1)),
        r,
        0.06,
      ),
        n.src.playbackRate.setTargetAtTime(1 + t * 0.45, r, 0.1));
    }
    stopEngine(e = 0.3) {
      this.engine && (this.fadeOut(this.engine, e), (this.engine = null));
    }
    reverseBeeps(e = 4) {
      this.play(`reverse_beeps`, { dur: Math.min(4, e) * 0.42 });
    }
    metalCrunch() {
      this.play(`metal_crunch`);
    }
    preloadClips(e) {
      for (let t of e)
        this.clipBytes.has(t) ||
          this.clipBytes.set(
            t,
            fetch(t)
              .then((e) => (e.ok ? e.arrayBuffer() : null))
              .catch(() => null),
          );
      this.decodeClips();
    }
    decodeClips() {
      let e = this.ctx;
      if (e)
        for (let [t, n] of this.clipBytes)
          this.clipBuffers.has(t) ||
            n.then(async (n) => {
              if (n && !this.clipBuffers.has(t))
                try {
                  this.clipBuffers.set(t, await e.decodeAudioData(n.slice(0)));
                } catch {}
            });
    }
    clipElement(e) {
      let t = this.clipCache.get(e);
      if (!t) {
        ((t = new Audio(e)), (t.preload = `auto`), t.load());
        let n = t;
        (n.addEventListener(`ended`, () => {
          this.clip === n && ((this.clip = null), this.duckMusic(!1));
        }),
          this.clipCache.set(e, t));
      }
      return t;
    }
    get clipActive() {
      return !!this.bufClip || !!this.clip;
    }
    playClip(e, t = 1) {
      (this.stopClip(0),
        this.ctx &&
          this.ctx.state !== `running` &&
          !this.gamePaused &&
          this.ctx.resume());
      let n = this.clipBuffers.get(e);
      if (this.ctx && this.clipBus && n) {
        let e = this.ctx.createBufferSource();
        e.buffer = n;
        let r = this.ctx.createGain();
        ((r.gain.value = t), e.connect(r).connect(this.clipBus));
        let i = {
          src: e,
          gain: r,
          startedAt: this.ctx.currentTime,
          duration: n.duration,
        };
        ((e.onended = () => {
          this.bufClip === i && ((this.bufClip = null), this.duckMusic(!1));
        }),
          e.start(),
          (this.bufClip = i),
          this.duckMusic(!0));
        return;
      }
      let r = this.clipElement(e);
      (this.cancelFade(r !== this.fading?.el),
        r.pause(),
        (r.currentTime = 0),
        (r.volume = Math.min(1, t)),
        (r.muted = this.muted),
        (r.playbackRate = 1),
        this.route(r),
        (this.clip = r),
        this.duckMusic(!0),
        r.play().catch(() => void 0));
    }
    clipTime() {
      let e = this.bufClip;
      if (e && this.ctx) {
        if (this.ctx.state !== `running`) return null;
        let t = this.ctx.currentTime - e.startedAt;
        return t >= 0 && t < e.duration ? t * Qe : null;
      }
      let t = this.clip;
      return !t || t.paused || t.readyState < 2 ? null : t.currentTime * Qe;
    }
    setClipPaused(e) {
      ((this.gamePaused = e),
        this.ctx && (e ? this.ctx.suspend() : this.ctx.resume()));
      let t = this.clip;
      t && (e ? t.pause() : t.play().catch(() => void 0));
    }
    route(e) {
      if (this.ctx && this.clipBus && !this.routed.has(e))
        try {
          (this.ctx.createMediaElementSource(e).connect(this.clipBus),
            this.routed.add(e));
        } catch {}
    }
    cancelFade(e) {
      this.fading &&
        (window.clearInterval(this.fading.timer),
        e && this.fading.el.pause(),
        (this.fading = null));
    }
    stopClip(e = 800) {
      let t = this.bufClip;
      if (t && this.ctx) {
        ((this.bufClip = null), this.duckMusic(!1));
        let n = this.ctx.currentTime,
          r = n + Math.max(0.02, e / 1e3);
        (t.gain.gain.cancelScheduledValues(n),
          t.gain.gain.setValueAtTime(t.gain.gain.value, n),
          t.gain.gain.linearRampToValueAtTime(0, r));
        try {
          t.src.stop(r + 0.02);
        } catch {}
      }
      let n = this.clip;
      if (!n) return;
      if (
        ((this.clip = null), this.duckMusic(!1), this.cancelFade(!0), e <= 0)
      ) {
        n.pause();
        return;
      }
      let r = n.volume,
        i = performance.now(),
        a = window.setInterval(() => {
          let t = Math.min(1, (performance.now() - i) / e);
          ((n.volume = r * (1 - t)),
            t >= 1 && (n.pause(), this.cancelFade(!1)));
        }, 40);
      this.fading = { el: n, timer: a };
    }
    silenceMusic(e) {
      ((this.silenced = e),
        this.ctx &&
          this.musicGain &&
          this.musicGain.gain.setTargetAtTime(
            e ? 0 : 0.22,
            this.ctx.currentTime,
            e ? 0.08 : 0.3,
          ));
    }
    duckMusic(e) {
      this.ctx &&
        this.musicGain &&
        !this.silenced &&
        this.musicGain.gain.setTargetAtTime(
          e ? 0.04 : 0.22,
          this.ctx.currentTime,
          0.2,
        );
    }
  };
function Rr() {
  return 0.96 + Math.random() * 0.08;
}
function zr() {
  try {
    return localStorage.getItem(jr) === `1`;
  } catch {
    return !1;
  }
}
var Br = class {
    constructor(t) {
      (e(this, `camera`, void 0),
        e(this, `pos`, new T(0, 1.7, 6)),
        e(this, `look`, new T(0, 1.1, 0)),
        e(this, `targetPos`, new T(0, 1.7, 6)),
        e(this, `targetLook`, new T(0, 1.1, 0)),
        e(this, `rate`, 5),
        e(this, `shakeAmt`, 0),
        e(this, `shakeTime`, 0),
        e(this, `fovTarget`, 42),
        (this.camera = new re(42, t, 0.05, 400)),
        this.camera.position.copy(this.pos));
    }
    frameFight(e, t, n, r) {
      let i = (e + t) / 2,
        a = Math.abs(e - t),
        o = Math.min(8.5, Math.max(4.4, 3.4 + a * 0.85)),
        s = Math.max(n, r) * 0.35,
        c = this.camera.aspect,
        l = c < 1 ? (1 - c) * 5 : 0;
      (this.targetPos.set(i, 1.55 + a * 0.06 + s, o + l),
        this.targetLook.set(i, 1 + s * 0.8, 0),
        (this.rate = 5),
        (this.fovTarget = 42));
    }
    set(e, t, n = 4, r = 42) {
      (this.targetPos.copy(e),
        this.targetLook.copy(t),
        (this.rate = n),
        (this.fovTarget = r));
    }
    snap() {
      (this.pos.copy(this.targetPos), this.look.copy(this.targetLook));
    }
    shake(e, t) {
      ((this.shakeAmt = Math.max(this.shakeAmt, e)),
        (this.shakeTime = Math.max(this.shakeTime, t)));
    }
    resize(e) {
      ((this.camera.aspect = e), this.camera.updateProjectionMatrix());
    }
    update(e) {
      let t = 1 - Math.exp(-this.rate * e);
      if (
        (this.pos.lerp(this.targetPos, t),
        this.look.lerp(this.targetLook, t),
        this.camera.position.copy(this.pos),
        this.shakeTime > 0)
      ) {
        this.shakeTime -= e;
        let t = this.shakeAmt * Math.max(0, Math.min(1, this.shakeTime * 4));
        ((this.camera.position.x += (Math.random() - 0.5) * t),
          (this.camera.position.y += (Math.random() - 0.5) * t),
          this.shakeTime <= 0 && (this.shakeAmt = 0));
      }
      this.camera.lookAt(this.look);
      let n = 1 - Math.exp(-3 * e),
        r = this.camera.fov + (this.fovTarget - this.camera.fov) * n;
      Math.abs(r - this.camera.fov) > 0.01 &&
        ((this.camera.fov = r), this.camera.updateProjectionMatrix());
    }
  },
  A = {
    modi: {
      id: `modi`,
      name: `MITRAMAN`,
      fullName: `MitraMan`,
      party: `Team Vaada`,
      accent: `#ff9933`,
      look: {
        skin: 12748377,
        skinShade: 10907206,
        hair: 15921386,
        hairStyle: `receding`,
        beard: 16052972,
        beardStyle: `full-white`,
        brows: 15263456,
        topStyle: `kurta-jacket`,
        top: 15985362,
        jacket: 15764004,
        pants: 16184038,
        shoes: 3875862,
        glasses: !0,
        shoulders: 1.05,
        belly: 1.25,
        scale: 1,
      },
      walkFwd: 2.1,
      walkBack: 1.6,
      jumpV: 7.6,
      jumpVx: 2.4,
      damageMul: 1.08,
      moveNames: {
        special1: `DEMONETIZATION PALM!`,
        special2: `SURPRISE STRIKE!`,
        finisher: `LAMBA BHASHAN COMBO!`,
        sweep: `GST SWEEP!`,
        uppercut: `VIKAS UPPERCUT!`,
        grab: `HUGPLOMACY!`,
        roundhouse: `SUNEHRE DIN ROUNDHOUSE!`,
      },
      superName: `MITRA CHAKRA`,
      superDesc: `Rises into the sky as a spinning chakra grows from a spark, then hurls it for 30% damage.`,
      introLine: `Mitron!`,
      winLine: `Is baar, jeet hamari!`,
      facePhoto: `/fightkaro/faces/modi.png?v=20261101_smooth`,
      dance: { label: `GARBA TIME!`, colors: [16750899, 16777215, 16765503] },
    },
    rahul: {
      id: `rahul`,
      name: `YATRA BOY`,
      fullName: `Yatra Boy`,
      party: `Team Yatra`,
      accent: `#2e9bff`,
      look: {
        skin: 13802352,
        skinShade: 11894874,
        hair: 3090983,
        hairStyle: `side-part`,
        beard: 9275264,
        beardStyle: `stubble-grey`,
        brows: 2761760,
        topStyle: `tshirt`,
        top: 16777215,
        jacket: 16777215,
        pants: 6120048,
        shoes: 2960691,
        glasses: !1,
        shoulders: 1.1,
        belly: 0.9,
        scale: 1.04,
      },
      walkFwd: 2.4,
      walkBack: 1.9,
      jumpV: 8,
      jumpVx: 2.7,
      damageMul: 1,
      moveNames: {
        special1: `ROADSHOW UPPERCUT!`,
        special2: `LAMBI YATRA KICK!`,
        finisher: `FATAFAT COMBO!`,
        sweep: `YATRA SWEEP!`,
        uppercut: `JOSH UPPERCUT!`,
        grab: `AIKIDO FATAFAT!`,
        roundhouse: `PYAAR ROUNDHOUSE!`,
      },
      superName: `ALOO SE SONA`,
      superDesc: `Zaps the opponent into an aloo, feeds it to his machine — and out comes pure sona, for 30% damage.`,
      introLine: `Chalo, yatra shuru!`,
      winLine: `Yatra poori, jeet zaroori!`,
      facePhoto: `/fightkaro/faces/rahul.png?v=20261101_smooth`,
      dance: { label: `BALLE BALLE!`, colors: [3054591, 16777215, 1280008] },
    },
    didi: {
      id: `didi`,
      name: `DEEDEE`,
      fullName: `Deedee`,
      party: `Team Dharna`,
      accent: `#22b35e`,
      look: {
        skin: 12880482,
        skinShade: 11039052,
        hair: 1907224,
        hairStyle: `bun`,
        beard: 1907224,
        beardStyle: `none`,
        brows: 2761760,
        topStyle: `sari`,
        top: 16184558,
        jacket: 15239846,
        pants: 16184558,
        shoes: 15921906,
        glasses: !0,
        shoulders: 0.92,
        belly: 1.05,
        scale: 0.84,
      },
      walkFwd: 2.6,
      walkBack: 2.1,
      jumpV: 7.4,
      jumpVx: 2.6,
      damageMul: 0.95,
      moveNames: {
        special1: `CHAPPAL SLAP!`,
        special2: `PADAYATRA KICK!`,
        finisher: `NON-STOP DHARNA COMBO!`,
        sweep: `MAIDAN SWEEP!`,
        uppercut: `JOSHILA UPPERCUT!`,
        grab: `CHAPPAL CHAMATKAR!`,
        roundhouse: `DHARNA ROUNDHOUSE!`,
      },
      superName: `JADU HOBE`,
      superDesc: `Stirs a bubbling black pot to a "humba humba" chant, then turns the opponent into a frog for 30% damage.`,
      introLine: `Dharna hobe!`,
      winLine: `Dharna shesh, jeet pakki!`,
      facePhoto: `/fightkaro/faces/didi.png?v=20261101_smooth`,
      modelHeight: 0.84,
      dance: { label: `DHARNA HOBE!`, colors: [2274142, 16777215, 3054591] },
    },
    trump: {
      id: `trump`,
      name: `TARIFF TAAU`,
      fullName: `Tariff Taau`,
      party: `Team Tariff`,
      accent: `#e0262f`,
      look: {
        skin: 15245424,
        skinShade: 13141082,
        hair: 15779936,
        hairStyle: `side-part`,
        beard: 15779936,
        beardStyle: `none`,
        brows: 14200928,
        topStyle: `kurta-jacket`,
        top: 16054010,
        jacket: 1843760,
        pants: 1843760,
        shoes: 1118481,
        glasses: !1,
        shoulders: 1.15,
        belly: 1.3,
        scale: 1.03,
      },
      walkFwd: 1.95,
      walkBack: 1.5,
      jumpV: 7.3,
      jumpVx: 2.3,
      damageMul: 1.1,
      moveNames: {
        special1: `EXECUTIVE ORDER!`,
        special2: `BADA DEAL KICK!`,
        finisher: `TREMENDOUS COMBO!`,
        sweep: `DEAL SWEEP!`,
        uppercut: `MEGA TARIFF UPPERCUT!`,
        grab: `POWER HANDSHAKE!`,
        roundhouse: `DEAL OFF ROUNDHOUSE!`,
      },
      superName: `TARIFF TSUNAMI`,
      superDesc: `Signs a golden executive order, whips TARIFF crates into a vortex, then slams a giant stamp for 30% damage.`,
      introLine: `Sab pe tariff lagega!`,
      winLine: `Nobody fights better than me. Nobody!`,
      facePhoto: `/fightkaro/faces/trump.png?v=20261101_smooth`,
      modelHeight: 1.03,
      dance: { label: `TREMENDOUS!`, colors: [14689839, 16777215, 2052031] },
    },
    yogi: {
      id: `yogi`,
      name: `DOZER DADA`,
      fullName: `Dozer Dada`,
      party: `Team Dozer`,
      accent: `#f05a00`,
      look: {
        skin: 10250824,
        skinShade: 8410426,
        hair: 3812388,
        hairStyle: `receding`,
        beard: 3812388,
        beardStyle: `none`,
        brows: 2761760,
        topStyle: `kurta-jacket`,
        top: 15895100,
        jacket: 15759912,
        pants: 15895100,
        shoes: 1710618,
        glasses: !1,
        shoulders: 1.08,
        belly: 1.1,
        scale: 0.98,
      },
      walkFwd: 2.2,
      walkBack: 1.7,
      jumpV: 7.5,
      jumpVx: 2.4,
      damageMul: 1.06,
      moveNames: {
        special1: `BULLDOZER PUNCH!`,
        special2: `DEMOLITION KICK!`,
        finisher: `NON-STOP DOZER COMBO!`,
        sweep: `DOZER SWEEP!`,
        uppercut: `HARD HAT UPPERCUT!`,
        grab: `PATKI PATAKH!`,
        roundhouse: `CEMENT ROUNDHOUSE!`,
      },
      superName: `DOZER KA DHAMAKA`,
      superDesc: `Eyes glow red, a bulldozer charges in, raises its front loader bucket and slams it down 3 times on the opponent for 30% damage.`,
      introLine: `Bulldozer taiyaar hai!`,
      winLine: `Kaam chalu, bulldozer chalu!`,
      facePhoto: `/fightkaro/faces/yogi.png?v=20261101_smooth`,
      modelHeight: 0.97,
      dance: {
        label: `DOZER KA SWAG!`,
        colors: [15751680, 16777215, 16763200],
      },
    },
    nitin: {
      id: `nitin`,
      name: `TOLL MAN`,
      fullName: `Toll Man`,
      party: `Team Highway`,
      accent: `#ff9a1f`,
      look: {
        skin: 13144426,
        skinShade: 11039312,
        hair: 1841689,
        hairStyle: `side-part`,
        beard: 2761760,
        beardStyle: `none`,
        brows: 2038295,
        topStyle: `tshirt`,
        top: 16184558,
        jacket: 16184558,
        pants: 15921386,
        shoes: 3811870,
        glasses: !1,
        shoulders: 1.15,
        belly: 1.25,
        scale: 1.02,
      },
      walkFwd: 2.1,
      walkBack: 1.7,
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1.05,
      moveNames: {
        special1: `TOLL TAX UPPERCUT!`,
        special2: `FLYOVER KICK!`,
        finisher: `FULL SPEED COMBO!`,
        sweep: `SPEED BREAKER SWEEP!`,
        uppercut: `UDGHATAN UPPERCUT!`,
        grab: `TOLL TAG FLIP!`,
        roundhouse: `RING ROAD ROUNDHOUSE!`,
      },
      superName: `GADDHA BLAST`,
      superDesc: `Opens a pothole under the opponent, turns sugarcane into E20 in his machine, pours it in, flicks a matchstick and walks away from the fire, for 30% damage.`,
      introLine: `Toll bharo, aage badho!`,
      winLine: `Highway ban gaya, kaam ho gaya!`,
      facePhoto: `/fightkaro/faces/nitin.png?v=20261101_smooth`,
      dance: { label: `ZINGAAT!`, colors: [16751135, 16777215, 1280008] },
    },
    mbapu: {
      id: `mbapu`,
      name: `MBAPU`,
      fullName: `Mbapu`,
      party: `Shanti Akhada · Final Boss`,
      accent: `#ffd700`,
      look: {
        skin: 10381895,
        skinShade: 8541236,
        hair: 16777215,
        hairStyle: `receding`,
        beard: 16777215,
        beardStyle: `none`,
        brows: 4863528,
        topStyle: `tshirt`,
        top: 10381895,
        jacket: 10381895,
        pants: 16118763,
        shoes: 10381895,
        glasses: !0,
        shoulders: 0.95,
        belly: 0.9,
        scale: 1,
      },
      walkFwd: 2.3,
      walkBack: 1.8,
      jumpV: 8,
      jumpVx: 2.6,
      damageMul: 1.05,
      moveNames: {
        jab: `SHANTI JAB!`,
        cross: `SABAR CROSS!`,
        kick: `NO-FIGHT KICK!`,
        uppercut: `MBAPU UPPERCUT!`,
        roundhouse: `SHANT ROUNDHOUSE!`,
        finisher: `SHANTI TOOFAN SPIN!`,
        lowJab: `CHHOTA SABAK JAB!`,
        sweep: `ZAMEEN SWEEP!`,
        special1: `SHANTI PALM!`,
        special2: `FLYING MBAPU!`,
        grab: `GREAT PATKI!`,
      },
      superName: `MANCH CHHODO`,
      superDesc: `Rises high, spins a giant wheel of light, wraps the foe in cloth inside a glittering storm, then throws them across the stage for 40% damage.`,
      introLine: `Shant raho, phir haaro.`,
      winLine: `Shanti se bada koi mukka nahi.`,
      facePhoto: `/fightkaro/faces/mbapu.png?v=20261101_smooth`,
      dance: {
        label: `SHANTI ZINDABAD!`,
        colors: [16766720, 16777215, 1280008],
      },
    },
  },
  Vr = (e) => (e === `modi` ? `rahul` : `modi`),
  Hr = [`modi`, `rahul`, `didi`, `trump`, `yogi`, `nitin`, `mbapu`],
  Ur = () => ({
    moveX: 0,
    up: !1,
    down: !1,
    punch: !1,
    kick: !1,
    grab: !1,
    super: !1,
  }),
  Wr = {
    modi: !0,
    rahul: !0,
    didi: !0,
    trump: !0,
    yogi: !0,
    nitin: !0,
    mbapu: !0,
  },
  Gr = Hr.filter((e) => Wr[e]),
  Kr = {
    jab: {
      id: `jab`,
      startup: 5,
      active: 3,
      recovery: 10,
      damage: 5,
      height: `high`,
      reach: 1,
      hitstun: 16,
      blockstun: 10,
      knockdown: !1,
      launch: 0,
      push: 1.6,
      lunge: 0.8,
      chains: { punch: `cross`, kick: `kick` },
    },
    cross: {
      id: `cross`,
      startup: 6,
      active: 3,
      recovery: 12,
      damage: 6,
      height: `high`,
      reach: 1.05,
      hitstun: 18,
      blockstun: 11,
      knockdown: !1,
      launch: 0,
      push: 1.8,
      lunge: 1,
      chains: { punch: `uppercut`, kick: `finisher` },
    },
    kick: {
      id: `kick`,
      startup: 9,
      active: 4,
      recovery: 15,
      damage: 9,
      height: `mid`,
      reach: 1.3,
      hitstun: 22,
      blockstun: 13,
      knockdown: !1,
      launch: 0,
      push: 2,
      lunge: 0.6,
      chains: { kick: `roundhouse` },
    },
    uppercut: {
      id: `uppercut`,
      startup: 9,
      active: 4,
      recovery: 20,
      damage: 11,
      height: `mid`,
      reach: 1.05,
      hitstun: 24,
      blockstun: 15,
      knockdown: !0,
      launch: 8,
      push: 1.4,
      lunge: 0.9,
    },
    roundhouse: {
      id: `roundhouse`,
      startup: 11,
      active: 5,
      recovery: 22,
      damage: 13,
      height: `high`,
      reach: 1.45,
      hitstun: 26,
      blockstun: 16,
      knockdown: !0,
      launch: 5,
      push: 4.5,
      lunge: 0.8,
    },
    finisher: {
      id: `finisher`,
      startup: 10,
      active: 4,
      recovery: 20,
      damage: 12,
      height: `mid`,
      reach: 1.35,
      hitstun: 24,
      blockstun: 15,
      knockdown: !0,
      launch: 5.5,
      push: 3.5,
      lunge: 1.2,
    },
    lowJab: {
      id: `lowJab`,
      startup: 6,
      active: 3,
      recovery: 11,
      damage: 4,
      height: `low`,
      reach: 1,
      hitstun: 18,
      blockstun: 9,
      knockdown: !1,
      launch: 0,
      push: 1.2,
      lunge: 0.4,
      crouching: !0,
      chains: { punch: `uppercut`, kick: `sweep` },
    },
    sweep: {
      id: `sweep`,
      startup: 11,
      active: 4,
      recovery: 20,
      damage: 8,
      height: `low`,
      reach: 1.4,
      hitstun: 22,
      blockstun: 14,
      knockdown: !0,
      launch: 3.2,
      push: 1.6,
      lunge: 0.4,
      crouching: !0,
    },
    special1: {
      id: `special1`,
      startup: 13,
      active: 4,
      recovery: 19,
      damage: 13,
      height: `mid`,
      reach: 1.1,
      hitstun: 26,
      blockstun: 16,
      knockdown: !0,
      launch: 7.5,
      push: 2.2,
      lunge: 1.8,
      chains: { kick: `finisher` },
    },
    special2: {
      id: `special2`,
      startup: 15,
      active: 5,
      recovery: 20,
      damage: 14,
      height: `mid`,
      reach: 1.55,
      hitstun: 26,
      blockstun: 16,
      knockdown: !0,
      launch: 4.5,
      push: 5.2,
      lunge: 1.4,
    },
    airPunch: {
      id: `airPunch`,
      startup: 4,
      active: 10,
      recovery: 0,
      damage: 6,
      height: `mid`,
      reach: 0.95,
      hitstun: 14,
      blockstun: 11,
      knockdown: !1,
      launch: 0,
      push: 2,
      lunge: 0,
      air: !0,
    },
    grab: {
      id: `grab`,
      startup: 6,
      active: 3,
      recovery: 24,
      damage: 0,
      height: `high`,
      reach: 0.95,
      hitstun: 0,
      blockstun: 0,
      knockdown: !1,
      launch: 0,
      push: 0,
      lunge: 0.6,
      grab: !0,
    },
    airKick: {
      id: `airKick`,
      startup: 7,
      active: 12,
      recovery: 0,
      damage: 8,
      height: `mid`,
      reach: 1.05,
      hitstun: 16,
      blockstun: 12,
      knockdown: !1,
      launch: 0,
      push: 2.2,
      lunge: 0,
      air: !0,
    },
    landing: {
      id: `landing`,
      startup: 0,
      active: 0,
      recovery: 14,
      damage: 0,
      height: `mid`,
      reach: 0,
      hitstun: 0,
      blockstun: 0,
      knockdown: !1,
      launch: 0,
      push: 0,
      lunge: 0,
    },
  };
function qr(e, t, n) {
  return e === `grab`
    ? `grab`
    : t
      ? e === `punch`
        ? `lowJab`
        : `sweep`
      : n
        ? e === `punch`
          ? `special1`
          : `special2`
        : e === `punch`
          ? `jab`
          : `kick`;
}
var Jr = (e) => e.startup + e.active + e.recovery,
  Yr = 2.5,
  Xr = 2.5,
  Zr = 0.5,
  Qr = 0.65,
  $r = {
    jab: { clip: `jab`, start: 0.2, hit: 0.56, end: 0.95 },
    cross: { clip: `cross`, start: 0.1, hit: 0.37, end: 0.8 },
    uppercut: { clip: `uppercut`, start: 0.15, hit: 0.47, end: 1.2 },
    special1: { clip: `palm`, start: 1, hit: 1.4, end: 2 },
    lowJab: { clip: `lowjab`, start: 0.55, hit: 0.9, end: 1.5 },
    kick: { clip: `kick`, start: 0.25, hit: 0.63, end: 1.4 },
    roundhouse: { clip: `roundhouse`, start: 0.5, hit: 1, end: 1.9 },
    finisher: { clip: `spinback`, start: 0.3, hit: 0.9, end: 1.9 },
    special2: { clip: `flyingkick`, start: 0, hit: 0.37, end: 1.4 },
    sweep: { clip: `sweep`, start: 0.35, hit: 0.87, end: 1.6 },
    grab: { clip: `throw`, start: 0.7, hit: 1.2, end: 1.6 },
    airPunch: { clip: `cross`, start: 0.1, hit: 0.37, end: 0.8 },
    airKick: { clip: `hurricane`, start: 0.3, hit: 0.8, end: 1.8 },
  };
function ei(e, t, n) {
  if (n < t.startup) return e.start + (e.hit - e.start) * (n / t.startup);
  let r = n - t.startup - t.active;
  if (r < 0) return e.hit;
  let i = Jr(t) - t.startup - t.active;
  return e.hit + (e.end - e.hit) * Math.min(1, r / Math.max(1, i));
}
function ti(e) {
  if (e < ni) return { name: `bow`, time: 0.2 + e };
  let t = e - ni;
  return t < ri
    ? { name: `standsit`, time: (t / ri) * 1.15, fade: 0.3 }
    : { name: `lotus`, time: e, loop: !0, fade: 0.75 };
}
var ni = 1.5,
  ri = 0.8,
  ii = class {
    constructor() {
      (e(this, `seconds`, 0), e(this, `blocks`, 0));
    }
    reset(e) {
      ((this.seconds = 0), (this.blocks = 0), e && (e.peaceful = !1));
    }
    get progress() {
      return Math.min(this.seconds / 20, this.blocks / 5);
    }
    hit() {
      this.seconds = Math.max(0, this.seconds - Xr);
    }
    step(e, t) {
      return e.attack || e.wantsSuper
        ? (this.reset(t), !1)
        : (Math.abs(e.x - t.x) < 3.6 && (this.seconds += Ge),
          (t.peaceful = this.seconds > 5),
          this.progress >= 1);
    }
  };
function ai(e, t, n) {
  let r = e.stateFrames * Ge;
  switch (e.state) {
    case `walk`:
      return e.holdingBack && n
        ? { name: `block`, time: 0.45, fade: 0.08 }
        : e.moveRel < 0
          ? { name: `walk_back`, time: t, loop: !0 }
          : { name: `walk_fwd`, time: t, loop: !0 };
    case `crouch`:
      return { name: `crouch`, time: t, loop: !0 };
    case `jump`:
    case `attack`: {
      let t = e.attack && $r[e.attack.def.id];
      return e.attack && t
        ? {
            name: t.clip,
            time: ei(t, e.attack.def, e.attack.frame),
            fade: 0.06,
          }
        : { name: `jump`, time: 0.55 + Math.min(1.1, r * 1.1) };
    }
    case `hitstun`:
      return { name: `hit`, time: Math.min(0.42, r * 1.6), fade: 0.04 };
    case `blockstun`:
      return { name: e.crouching ? `crouch` : `block`, time: 0.45, fade: 0.05 };
    case `knockdown`:
    case `ko`:
      return {
        name: `knockdown`,
        time: Math.min(1.6, 0.25 + (r * 1.6 * 48) / 48),
        fade: 0.08,
      };
    case `getup`:
      return {
        name: `getup`,
        time: 2.4 + 2.5 * Math.min(1, e.stateFrames / 24),
        fade: 0.05,
      };
    case `victory`:
      return ti(r);
    case `intro`:
      return { name: `intro`, time: t, loop: !0, fade: 0.3 };
    case `idle`:
      return e.holdingBack && n
        ? { name: `block`, time: 0.45, fade: 0.08 }
        : { name: `stance`, time: t, loop: !0 };
    default:
      return { name: `stance`, time: t, loop: !0 };
  }
}
var oi = 30,
  si = new Set([`super`, `frozen`, `victory`, `intro`]),
  ci = new Set([
    `knockdown`,
    `getup`,
    `ko`,
    `super`,
    `frozen`,
    `victory`,
    `intro`,
  ]),
  li = class {
    get isBoss() {
      return this.char.id === `mbapu`;
    }
    get maxHp() {
      return this.isBoss ? 200 : 100;
    }
    constructor(t, n, r) {
      (e(this, `side`, void 0),
        e(this, `char`, void 0),
        e(this, `x`, void 0),
        e(this, `y`, 0),
        e(this, `vx`, 0),
        e(this, `vy`, 0),
        e(this, `facing`, void 0),
        e(this, `hp`, 100),
        e(this, `peaceful`, !1),
        e(this, `sinceHit`, 0),
        e(this, `meter`, 0),
        e(this, `state`, `idle`),
        e(this, `stateFrames`, 0),
        e(this, `attack`, null),
        e(this, `crouching`, !1),
        e(this, `holdingBack`, !1),
        e(this, `moveRel`, 0),
        e(this, `stun`, 0),
        e(this, `buffer`, null),
        e(this, `superBuffer`, 0),
        e(this, `comboHits`, 0),
        e(this, `lastHitHeight`, `mid`),
        e(this, `walkDistance`, 0),
        e(this, `wantsSuper`, !1),
        e(this, `airAttackUsed`, !1),
        e(this, `downFrames`, 0),
        e(this, `grounded`, !0),
        (this.side = t),
        (this.char = n),
        (this.x = r),
        (this.facing = t === 0 ? 1 : -1));
    }
    reset(e) {
      ((this.x = e),
        (this.y = 0),
        (this.vx = 0),
        (this.vy = 0),
        (this.facing = this.side === 0 ? 1 : -1),
        (this.hp = this.maxHp),
        (this.peaceful = !1),
        (this.sinceHit = 0),
        (this.meter = 0),
        (this.attack = null),
        (this.crouching = !1),
        (this.holdingBack = !1),
        (this.moveRel = 0),
        (this.stun = 0),
        (this.buffer = null),
        (this.superBuffer = 0),
        (this.comboHits = 0),
        (this.downFrames = 0),
        (this.grounded = !0),
        this.enter(`idle`));
    }
    get airborne() {
      return this.y > 0.001 || this.vy > 0;
    }
    get actionable() {
      return (
        this.state === `idle` ||
        this.state === `walk` ||
        this.state === `crouch`
      );
    }
    get invulnerable() {
      return ci.has(this.state);
    }
    get isLow() {
      return this.state === `crouch` ||
        (this.state === `blockstun` && this.crouching)
        ? !0
        : !!(this.attack && this.attack.def.crouching);
    }
    get isAttackActive() {
      let e = this.attack;
      return e
        ? e.frame > e.def.startup && e.frame <= e.def.startup + e.def.active
        : !1;
    }
    get attackPhase() {
      let e = this.attack;
      return e
        ? e.frame <= e.def.startup
          ? `startup`
          : e.frame <= e.def.startup + e.def.active
            ? `active`
            : `recovery`
        : null;
    }
    get canBlock() {
      return (
        this.state === `idle` ||
        this.state === `walk` ||
        this.state === `crouch` ||
        this.state === `blockstun`
      );
    }
    enter(e) {
      this.state !== e && ((this.state = e), (this.stateFrames = 0));
    }
    forceState(e) {
      ((this.state = e), (this.stateFrames = 0));
    }
    addMeter(e) {
      this.meter = Math.min(100, Math.max(0, this.meter + e));
    }
    consumeBuffer() {
      if (!this.buffer) return null;
      let e = this.buffer.button;
      return ((this.buffer = null), e);
    }
    startAttack(e) {
      ((this.attack = { def: Kr[e], frame: 0, hasHit: !1 }),
        this.enter(`attack`),
        (this.stateFrames = 0));
    }
    startJump(e) {
      ((this.vy = this.char.jumpV),
        (this.vx = e * this.char.jumpVx * this.facing),
        (this.crouching = !1),
        (this.airAttackUsed = !1),
        (this.attack = null),
        (this.grounded = !1),
        this.enter(`jump`));
    }
    update(e, t) {
      if (
        ((this.wantsSuper = !1),
        this.stateFrames++,
        e.grab || e.punch || e.kick
          ? (this.buffer = {
              button: e.grab ? `grab` : e.kick ? `kick` : `punch`,
              frames: 9,
            })
          : this.buffer &&
            (this.buffer.frames--,
            this.buffer.frames <= 0 && (this.buffer = null)),
        e.super
          ? (this.superBuffer = oi)
          : this.superBuffer > 0 && this.superBuffer--,
        si.has(this.state))
      )
        return;
      let n = t >= this.x ? 1 : -1;
      switch (this.state) {
        case `idle`:
        case `walk`:
        case `crouch`:
          ((this.comboHits = 0), this.updateActionable(e, n));
          break;
        case `attack`:
          if (
            this.isBoss &&
            this.attackPhase !== `active` &&
            e.moveX * this.facing < 0
          ) {
            ((this.attack = null), this.enter(`idle`));
            break;
          }
          this.updateAttack();
          break;
        case `jump`:
          if (
            !this.airAttackUsed &&
            this.buffer &&
            this.buffer.button !== `grab`
          ) {
            let e = this.consumeBuffer();
            ((this.attack = {
              def: Kr[e === `kick` ? `airKick` : `airPunch`],
              frame: 0,
              hasHit: !1,
            }),
              (this.airAttackUsed = !0));
          }
          this.attack && this.attack.frame++;
          break;
        case `hitstun`:
          (this.stun--,
            (this.vx *= 0.86),
            this.stun <= 0 && this.enter(`idle`));
          break;
        case `blockstun`:
          ((this.holdingBack = e.moveX * this.facing < 0),
            (this.crouching = e.down),
            this.stun--,
            (this.vx *= 0.82),
            this.stun <= 0 && this.enter(this.crouching ? `crouch` : `idle`));
          break;
        case `knockdown`:
          this.grounded &&
            ((this.vx *= 0.8),
            this.downFrames++,
            this.downFrames >= 48 && this.enter(`getup`));
          break;
        case `getup`:
          ((this.vx = 0),
            this.stateFrames >= 24 && ((this.facing = n), this.enter(`idle`)));
          break;
        case `ko`:
          this.grounded && ((this.vx *= 0.85), this.downFrames++);
      }
      this.integrate();
    }
    updateActionable(e, t) {
      this.facing = t;
      let n = e.moveX * this.facing;
      if (
        ((this.moveRel = n),
        (this.holdingBack = n < 0),
        this.superBuffer > 0 && this.meter >= 100)
      ) {
        ((this.superBuffer = 0), (this.wantsSuper = !0), (this.vx = 0));
        return;
      }
      if (e.up && !e.down) {
        this.startJump(n);
        return;
      }
      this.crouching = e.down;
      let r = this.consumeBuffer();
      r
        ? this.startAttack(qr(r, this.crouching, n > 0))
        : this.crouching
          ? (this.enter(`crouch`), (this.vx = 0))
          : n === 0
            ? (this.enter(`idle`), (this.vx = 0))
            : (this.enter(`walk`),
              (this.vx =
                n > 0
                  ? this.char.walkFwd * this.facing
                  : -this.char.walkBack * this.facing));
    }
    updateAttack() {
      let e = this.attack;
      if (!e) {
        this.enter(`idle`);
        return;
      }
      e.frame++;
      let t = e.def;
      if (
        (e.frame <= t.startup + t.active
          ? (this.vx = t.lunge * this.facing)
          : (this.vx *= 0.75),
        t.chains && this.buffer && e.frame >= t.startup + t.active)
      ) {
        let e = t.chains[this.buffer.button];
        if (e) {
          ((this.buffer = null), this.startAttack(e));
          return;
        }
      }
      e.frame >= Jr(t) &&
        ((this.attack = null),
        (this.crouching = !!t.crouching),
        this.enter(t.crouching ? `crouch` : `idle`));
    }
    integrate() {
      let e = this.y > 0 || this.vy !== 0;
      (e && (this.vy -= 24 * Ge),
        (this.x += this.vx * Ge),
        (this.y += this.vy * Ge),
        this.state === `walk` && (this.walkDistance += Math.abs(this.vx) * Ge),
        (this.x = Math.max(-O, Math.min(O, this.x))),
        this.y <= 0 &&
          e &&
          this.vy <= 0 &&
          ((this.y = 0), (this.vy = 0), this.onLand()));
    }
    onLand() {
      if (((this.grounded = !0), this.state === `jump`)) {
        let e = this.attack;
        ((this.attack = null),
          (this.vx = 0),
          e && (!e.hasHit || e.blocked)
            ? this.startAttack(`landing`)
            : this.enter(`idle`));
      } else this.state === `hitstun` && (this.vx *= 0.5);
    }
    applyBlock(e, t) {
      ((this.attack = null),
        this.forceState(`blockstun`),
        (this.stun = e.blockstun),
        (this.vx = t * e.push * 0.75));
    }
    applyHit(e, t, n) {
      ((this.hp = Math.max(0, this.hp - t)),
        (this.sinceHit = 0),
        (this.attack = null),
        this.comboHits++,
        (this.lastHitHeight = e.height),
        (this.crouching = !1),
        this.hp <= 0
          ? this.knockOut(n, 3.4, 6.5)
          : e.knockdown || this.airborne
            ? (this.forceState(`knockdown`),
              (this.vx = n * (e.push + 0.8)),
              (this.vy = Math.max(e.launch, 4.2)),
              (this.downFrames = 0),
              (this.grounded = !1))
            : (this.forceState(`hitstun`),
              (this.stun = this.isBoss
                ? Math.max(2, Math.round(e.hitstun * 0.6))
                : e.hitstun),
              (this.vx = n * e.push * (this.isBoss ? 0.7 : 1))));
    }
    knockOut(e, t, n) {
      ((this.hp = 0),
        (this.attack = null),
        this.forceState(`ko`),
        (this.vx = e * t),
        (this.vy = n),
        (this.grounded = !1),
        (this.downFrames = 0));
    }
    regen(e) {
      ((this.sinceHit += e),
        this.sinceHit >= 3 &&
          this.hp > 0 &&
          (this.hp = Math.min(this.maxHp, this.hp + Yr * e)));
    }
    stepPhysics() {
      this.integrate();
    }
  },
  ui = {
    godi: { name: `SHOR SHARMA`, channel: `BREAKING BAKWAS` },
    troll: { name: `TWEETY TROLLWALA`, channel: `TROLL ARMY` },
  };
function di(e, t) {
  return e === `modi` || t === `rahul`
    ? { godi: e, troll: t }
    : t === `modi` || e === `rahul`
      ? { godi: t, troll: e }
      : { godi: e, troll: t };
}
var fi = { godi: `modi`, troll: `rahul` };
function pi(e, t) {
  return ((fi = di(e, t)), fi);
}
var mi = {
    modi: `MITRAMAN`,
    rahul: `YATRA BOY`,
    didi: `DEEDEE`,
    trump: `TARIFF TAAU`,
    yogi: `DOZER DADA`,
    nitin: `TOLL MAN`,
    mbapu: `MBAPU`,
  },
  hi = {
    modi: `MitraMan ji`,
    rahul: `Yatra bhai`,
    didi: `Deedee ji`,
    trump: `Taau ji`,
    yogi: `Dada ji`,
    nitin: `Toll bhau`,
    mbapu: `Mbapu ji`,
  },
  gi = (e, t) => e[Math.min(e.length - 1, Math.floor(t() * e.length))],
  _i = (e, t) => e.replace(/\{(\w+)\}/g, (e, n) => t[n] ?? ``),
  vi = (e) => (fi.godi === e ? `godi` : `troll`),
  yi = (e) => (e === `godi` ? `troll` : `godi`),
  bi = (e) => (fi.godi === e ? fi.troll : fi.godi);
function xi(e, t, n, r, i) {
  let a = { ticker: r, priority: i };
  return ((a[e] = t), (a[yi(e)] = n), a);
}
var Si = {
    godi: [
      `MASTERSTROKE! {M} — nation is proud!`,
      `Historic! Unprecedented! {AN} ka {M}!`,
      `Experts say: best {M} of the century!`,
      `Opposition is SPEECHLESS!`,
      `Doston, josh is HIGH!`,
      `Full power! {D} cannot handle it!`,
    ],
    troll: [
      `#{M} trending No. 1 worldwide!`,
      `Yatra route se direct delivery!`,
      `{AN} ne fatafat maar diya!`,
      `Screenshot le lo, history ban rahi hai!`,
      `{D} got ratio'd in real life!`,
      `Bro just dropped a viral {M} fr fr!`,
    ],
  },
  Ci = {
    godi: [
      `International conspiracy! Foreign hand!`,
      `{DN} is only TESTING the opposition!`,
      `Deepfake! That hit never happened!`,
      `Nation wants to know — who funded this {M}?!`,
      `Strategic retreat. 4D chess hai!`,
      `Poori timeline samajhiye... this was planned!`,
    ],
    troll: [
      `Paid PR stunt! {DN} ALLOWED that.`,
      `That was a JUMLA punch, didn't even hurt!`,
      `Bot accounts are boosting that hit!`,
      `{DN} is just doing rally-style stretching!`,
      `Fake news! Fact-check pending!`,
      `Bro hit him with a WhatsApp forward 💀`,
    ],
  },
  wi = [
    `BREAKING: {A}'s {M} lands. Experts call it a masterstroke!`,
    `KURSI INDEX {DIR} {N} points after {A}'s {M}`,
    `{D} demands JPC probe into {M}`,
    `Opposition stages walkout after {M}`,
    `Twitter splits into two after {A}'s {M}`,
    `Panel of 14 experts shouting simultaneously over {M}`,
    `Fact-checkers still verifying {M}. Results by 2029.`,
  ],
  Ti = [
    `Weather: 100% chance of jumlas over Delhi`,
    `Petrol prices rise during commercial break`,
    `Cricket: India wins toss, chooses to watch the fight`,
    `Traffic jam at Raisina Hill as fans gather`,
    `Samosa prices at Sansad canteen remain subsidised`,
    `Exit polls predict both sides will claim victory`,
    `Stray cow spotted near Vijay Chowk. Fighters alerted.`,
    `Chai stall reports record sales in the stands`,
    `Breaking: Nothing happened. More details at 9 PM.`,
    `WhatsApp University announces new degree in fight analysis`,
    `Reminder: this is a satire game. None of this is real news.`,
  ];
function Ei(e) {
  let t = 35 + Math.floor(e() * 40),
    n = 35 + Math.floor(e() * 40),
    r = Math.floor(e() * 30);
  return `FAKE POLL: ${mi[fi.godi]} ${t}% · ${mi[fi.troll]} ${n}% · OTHERS ${r}% · TOTAL ${t + n + r}% · Margin of error: ±100%`;
}
function Di(e, t = Math.random) {
  switch (e.kind) {
    case `roundStart`:
      return {
        godi: e.final
          ? `FINAL ROUND! Desh dekh raha hai!`
          : `Round ${e.round}! ${hi[fi.godi]} is READY!`,
        troll: e.final
          ? `Final round, bhai. Popcorn ready!`
          : `Round ${e.round}! ${hi[fi.troll]} warming up!`,
        ticker: Ei(t),
        priority: !0,
      };
    case `hit`: {
      let n = {
          A: mi[e.attacker],
          D: mi[bi(e.attacker)],
          AN: hi[e.attacker],
          DN: hi[bi(e.attacker)],
          M: e.move.replace(/!$/, ``),
          DIR: t() < 0.5 ? `jumps` : `crashes`,
          N: String(100 + Math.floor(t() * 900)),
        },
        r = vi(e.attacker),
        i = e.knockdown || t() < 0.35 ? _i(gi(wi, t), n) : void 0;
      return xi(
        r,
        _i(gi(Si[r], t), n),
        _i(gi(Ci[yi(r)], t), n),
        i,
        e.knockdown,
      );
    }
    case `block`:
      return xi(
        vi(bi(e.attacker)),
        gi(
          [
            `BLOCKED! Iron wall defence!`,
            `Defence ministry approved block!`,
            `Not today, bro. BLOCKED.`,
          ],
          t,
        ),
        void 0,
        void 0,
        !1,
      );
    case `super`: {
      let t = vi(e.caster),
        n = Oi[e.caster];
      return xi(
        t,
        n.hype,
        n.spin,
        `BREAKING: ${e.superName} unleashed! ${n.ticker}`,
        !0,
      );
    }
    case `ko`: {
      if (e.timeUp || !e.winner)
        return {
          godi: `Time up! ${hi[fi.godi]} was just being merciful!`,
          troll: `Time up! Moral victory for ${hi[fi.troll]}!`,
          ticker: `TIME UP: Both sides claim victory, celebrations planned`,
          priority: !0,
        };
      let t = vi(e.winner);
      return xi(
        t,
        {
          godi: `K.O.! Is baar, knockout paar!`,
          troll: `K.O.! Pack it up, bots!`,
        }[t],
        {
          godi: `Scoreboard malfunction! Recount demanded!`,
          troll: `Rigged! We demand a re-match!`,
        }[yi(t)],
        `BREAKING: ${mi[e.winner]} wins by K.O. Opposition calls emergency meeting`,
        !0,
      );
    }
    case `roundWin`:
      return {
        ticker: e.perfect
          ? `PERFECT ROUND for ${mi[e.winner]}! Not a single scratch, say sources`
          : `${mi[e.winner]} takes the round. Sweets distributed outside party office`,
        priority: !0,
      };
    case `cow`:
      return {
        godi: `Cow on stage! Fight paused for safety!`,
        troll: `Bro the cow has better timing than both of them`,
        ticker: `BREAKING: Stray cow halts Sansad Showdown. Traffic police confused.`,
        priority: !0,
      };
    case `cowGone`:
      return {
        godi: `Cow has left the stage! Resume!`,
        troll: `Cow left. Fight is back on, chat!`,
        priority: !0,
      };
    case `chai`:
      return xi(
        vi(e.kicker),
        `Collateral chai! Minor loss for the nation!`,
        `${mi[e.kicker]} kicked the chai bhaiya's cup! Shame!`,
        `BREAKING: Chai cup lost in crossfire. ${mi[e.kicker]} blamed.`,
        !0,
      );
    case `bored`:
      return {
        godi: `Kuch toh karo! Viewers are switching channels!`,
        troll: `Chat is dead. Crowd is eating samosas now 💀`,
        ticker: gi(
          [
            `BREAKING: Spectators open Instagram`,
            `Samosa sales spike as fight stalls`,
            `Crowd takes 300 selfies during lull`,
          ],
          t,
        ),
        priority: !0,
      };
    case `comeback`: {
      let t = vi(e.leader);
      return xi(
        t,
        {
          godi: `Comeback! ${mi[e.leader]} wave is back!`,
          troll: `Comeback arc loading... ${hi[e.leader]} era!`,
        }[t],
        void 0,
        void 0,
        !1,
      );
    }
  }
}
var Oi = {
    modi: {
      hype: `MITRA CHAKRA! Goosebumps, mitron!`,
      spin: `Bro brought a pizza cutter to a fight 💀`,
      ticker: `Seismologists alarmed`,
    },
    rahul: {
      hype: `ALOO SE SONA! The machine actually works!`,
      spin: `Potato in, gold out?! Auditors are investigating!`,
      ticker: `Aloo prices hit all-time high`,
    },
    didi: {
      hype: `HUMBA HUMBA! Jadu hobe, full power!`,
      spin: `Jadu?! Call the referee!`,
      ticker: `Frog population of Delhi rises by one`,
    },
    trump: {
      hype: `TARIFF TSUNAMI! The best tariff, everybody says so!`,
      spin: `He just taxed a punch at 50%?!`,
      ticker: `Kursi Index crashes as crates rain on Sansad`,
    },
    yogi: {
      hype: `DOZER KA DHAMAKA! Laser eyes, full power!`,
      spin: `Bro parked a bulldozer on the opponent 💀`,
      ticker: `Bulldozer seen leaving Sansad, no number plate`,
    },
    nitin: {
      hype: `GADDHA BLAST! Ganna to E20, matchstick, cool walk!`,
      spin: `Bro walked away from the fire like a movie hero 💀`,
      ticker: `Pothole on Desi Sadak catches fire, repair tender floated`,
    },
    mbapu: {
      hype: `MANCH CHHODO! Shanti wheel spinning at lightspeed!`,
      spin: `Bro got gift-wrapped and thrown off the stage 💀`,
      ticker: `Shanti Index hits a record high across the stage`,
    },
  },
  ki = {
    modi: [
      `"Yeh sab pichhle 70 saal ki galti hai." — MitraMan camp`,
      `"Opposition ki saazish thi." — MitraMan camp`,
      `"Hum aatmanirbhar haar se seekhenge." — MitraMan camp`,
    ],
    rahul: [
      `"Scoreboard hack ho gaya tha." — Yatra Boy camp`,
      `"Introspection committee banayi jayegi." — Yatra Boy camp`,
      `"Main yatra se aur strong waapas aaunga." — Yatra Boy camp`,
    ],
    didi: [
      `"Sab referee ki chaal hai!" — Deedee camp`,
      `"Kal se dharna shuru. Ladai abhi baaki hai!" — Deedee camp`,
      `"Jadu ka recount hoga!" — Deedee camp`,
    ],
    trump: [
      `"The fight was rigged. Very unfair!" — Taau camp`,
      `"Fake news! We actually won. Hugely." — Taau camp`,
      `"Tariffs on the referee, effective immediately." — Taau camp`,
    ],
    yogi: [
      `"Bulldozer ka diesel khatam ho gaya tha." — Dozer Dada camp`,
      `"Yeh haar nahi, lunch break tha." — Dozer Dada camp`,
      `"Kal subah 5 baje se double shift." — Dozer Dada camp`,
    ],
    nitin: [
      `"Road under construction tha, isliye haare." — Toll Man camp`,
      `"Agli baar 6-lane expressway pe ladenge." — Toll Man camp`,
      `"Toll naka pe traffic tha." — Toll Man camp`,
    ],
    mbapu: [
      `"Shanti kamzori nahi, strategy hai." — Mbapu camp`,
      `"Main sirf aapka sabar dekh raha tha." — Mbapu camp`,
      `"Aaj ka sabak poora hua." — Mbapu camp`,
    ],
  };
function Ai(e, t, n, r = Math.random) {
  let i = Math.max(...n),
    a = Math.min(...n),
    o = i - a >= 2;
  return {
    masthead: gi(
      [
        `THE DAILY JUMLA`,
        `SANSAD TIMES`,
        `BREAKING BAKWAS`,
        `THE KURSI EXPRESS`,
      ],
      r,
    ),
    headline: o
      ? {
          modi: `MITRAMAN SWEEPS SANSAD!`,
          rahul: `YATRA BOY WALKS TO VICTORY!`,
          didi: `DEEDEE STORMS DELHI!`,
          trump: `TARIFF TAAU TAXES SANSAD!`,
          yogi: `DOZER DADA FLATTENS SANSAD!`,
          nitin: `TOLL MAN PAVES OVER SANSAD!`,
          mbapu: `MBAPU CALMS THE SANSAD!`,
        }[e]
      : {
          modi: `MITRAMAN SCRAPES THROUGH!`,
          rahul: `YATRA BOY WINS THRILLER!`,
          didi: `DEEDEE SITS ON VICTORY!`,
          trump: `TARIFF TAAU CLOSES THE DEAL!`,
          yogi: `DOZER DADA WINS BY A WHISKER!`,
          nitin: `TOLL MAN WINS IN THE FAST LANE!`,
          mbapu: `MBAPU WINS WITH SABAR & SHANTI!`,
        }[e],
    sub: o
      ? `LANDSLIDE ${i}–${a} · Opposition in shock`
      : `NAIL-BITER ${i}–${a} · Recount demanded`,
    excuse: gi(ki[t], r),
  };
}
var ji = {
  modi: [
    `Mitron, main intezaar kar raha hoon!`,
    `Itna time toh notebandi mein bhi nahi laga!`,
    `Aao, lamba bhashan sunte hain!`,
  ],
  rahul: [
    `Ruko mat, attack karo!`,
    `Main toh yatra pe nikal jaaunga!`,
    `Fatafat, fatafat... kab?`,
  ],
  didi: [
    `Dharna hobe! Kab ladega?`,
    `Ami tomake chharbo na!`,
    `Aao, poora maidan dekhega!`,
  ],
  trump: [
    `Very slow. Sad!`,
    `Deal off! Unless you fight.`,
    `I have the best punches. Tremendous!`,
  ],
  yogi: [
    `Bulldozer ka engine garam ho raha hai!`,
    `Hard hat pehen lo, kaam shuru!`,
    `Aao, site pe milte hain!`,
  ],
  nitin: [
    `Highway khaali hai, aao!`,
    `Itna slow? Speed breaker ho kya?`,
    `Toll bharo, phir ladna!`,
  ],
  mbapu: [
    `Shanti rakho... par defense bhi seekho!`,
    `Sabar se bada koi hathiyar nahi.`,
    `Gehri saans lo, phir haaro!`,
  ],
};
function Mi(e, t = Math.random) {
  return gi(ji[e], t);
}
var Ni = [
    `Chai! Chai!`,
    `Garam chai!`,
    `Cutting chai, ₹10!`,
    `Chai le lo, chai!`,
  ],
  Pi = [`Arre! Mera cup!`, `Oye! Chai gira di!`, `Paise kaun dega?!`];
function Fi(e, t = 0.7, n = 0) {
  return new x({ color: e, roughness: t, metalness: n });
}
function j(e, t, n, r = 0, i = 0, a = 0) {
  let o = new p(e, t);
  return (o.position.set(r, i, a), (o.castShadow = !0), n.add(o), o);
}
var Ii = null;
function Li() {
  if (Ii) return Ii;
  if (typeof document > `u`) return null;
  let e = document.createElement(`canvas`);
  ((e.width = 128), (e.height = 128));
  let t = e.getContext(`2d`);
  if (!t) return null;
  ((t.fillStyle = `#18181a`),
    t.fillRect(0, 0, 128, 128),
    (t.strokeStyle = `#e8e6e0`),
    (t.lineWidth = 2));
  for (let [e, n] of [
    [20, 22],
    [84, 20],
    [52, 60],
    [18, 98],
    [90, 92],
  ])
    (t.beginPath(),
      t.ellipse(e - 5, n, 5, 3, -0.5, 0, Math.PI * 2),
      t.ellipse(e + 5, n, 5, 3, 0.5, 0, Math.PI * 2),
      t.moveTo(e, n + 1),
      t.lineTo(e - 3, n + 9),
      t.moveTo(e, n + 1),
      t.lineTo(e + 3, n + 9),
      t.stroke());
  let n = new _e(e);
  return (
    (n.colorSpace = oe),
    (n.wrapS = n.wrapT = Oe),
    n.repeat.set(3, 3),
    (Ii = n),
    n
  );
}
function Ri(e) {
  e.traverse((e) => e.geometry?.dispose());
}
function zi(e, t, n, r) {
  let i = new c();
  return (i.position.set(t, n, r), e.add(i), i);
}
function Bi() {
  let e = new c(),
    t = new x({
      color: 15267071,
      transparent: !0,
      opacity: 0.55,
      roughness: 0.1,
    });
  return (
    j(new E(0.035, 0.026, 0.075, 14, 1, !0), t, e, 0, 0.037, 0),
    (j(new Fe(0.032, 14), Fi(10510634, 0.4), e, 0, 0.06, 0).rotation.x =
      -Math.PI / 2),
    j(new E(0.03, 0.026, 0.05, 14), Fi(12088115, 0.5), e, 0, 0.03, 0),
    e
  );
}
function Vi(e) {
  let t = Math.abs(e);
  return t <= 7.75
    ? 0
    : t < 8.05
      ? -0.075
      : Math.min(4, Math.floor((t - 8.05) / 0.9)) * 0.45 - 0.075;
}
var Hi = class {
  constructor(t, n = Math.random) {
    (e(this, `scene`, void 0),
      e(this, `rng`, void 0),
      e(this, `root`, new c()),
      e(this, `body`, void 0),
      e(this, `head`, void 0),
      e(this, `legs`, void 0),
      e(this, `arms`, void 0),
      e(this, `elbows`, void 0),
      e(this, `cupHand`, void 0),
      e(this, `cup`, void 0),
      e(this, `steam`, []),
      e(this, `flying`, []),
      e(this, `x`, -9),
      e(this, `dir`, 1),
      e(this, `stopAt`, void 0),
      e(this, `stopTimer`, 0),
      e(this, `upsetTimer`, 0),
      e(this, `newCupTimer`, 0),
      e(this, `walkPhase`, 0),
      e(this, `yaw`, Math.PI / 2),
      e(this, `z`, -2.9),
      e(this, `tmp`, new T()),
      (this.scene = t),
      (this.rng = n),
      t.add(this.root));
    let r = Fi(10709829, 0.55),
      a = Li(),
      s = new x({ color: a ? 16777215 : 1710620, map: a, roughness: 0.75 }),
      l = Fi(2764602, 0.85),
      u = Fi(920330, 0.55),
      d = Fi(11735594, 0.6);
    this.body = zi(this.root, 0, 0.82, 0);
    let f = (e) => {
      let t = zi(this.body, e * 0.09, 0, 0);
      return (
        j(new ge(0.075, 0.6, 4, 10), l, t, 0, -0.38, 0),
        j(new C(0.09, 0.05, 0.2), Fi(4860952, 0.6), t, 0, -0.79, 0.04),
        t
      );
    };
    ((this.legs = [f(1), f(-1)]),
      j(new ge(0.17, 0.42, 6, 14), s, this.body, 0, 0.32, 0));
    for (let e of [1, -1])
      j(
        new C(0.09, 0.03, 0.12),
        s,
        this.body,
        e * 0.07,
        0.66,
        0.06,
      ).rotation.set(0.5, 0, e * 0.5);
    (j(
      new w(0.075, 0.006, 4, 20, Math.PI),
      Fi(14212580, 0.2, 0.9),
      this.body,
      0,
      0.62,
      0.12,
    ).rotation.set(-0.4, 0, Math.PI),
      j(new o(0.018), Fi(14212580, 0.2, 0.9), this.body, 0, 0.535, 0.16),
      (this.head = zi(this.body, 0, 0.78, 0)),
      j(new i(0.12, 18, 14), r, this.head, 0, 0, 0),
      j(
        new i(0.14, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.6),
        u,
        this.head,
        0,
        0.04,
        -0.025,
      ).scale.set(1.1, 1.25, 1.05));
    let p = j(new C(0.17, 0.05, 0.04), u, this.head, 0.03, 0.085, 0.1);
    p.rotation.z = -0.3;
    for (let e of [1, -1]) {
      let t = j(new C(0.04, 0.2, 0.12), u, this.head, e * 0.125, -0.05, -0.04);
      t.rotation.z = e * 0.12;
      let n = j(new C(0.04, 0.07, 0.08), d, this.head, e * 0.13, -0.18, -0.03);
      n.rotation.z = e * 0.15;
    }
    j(new C(0.22, 0.18, 0.05), u, this.head, 0, -0.06, -0.12);
    let m = j(new ge(0.016, 0.085, 4, 8), u, this.head, 0, -0.04, 0.115);
    ((m.rotation.z = Math.PI / 2),
      j(new i(0.018, 8, 6), u, this.head, 0, -0.095, 0.1).scale.set(
        1,
        1.4,
        0.7,
      ));
    let h = Fi(13222576, 0.3, 0.8),
      g = new x({
        color: 15913274,
        roughness: 0.1,
        metalness: 0.1,
        transparent: !0,
        opacity: 0.75,
      });
    for (let e of [1, -1]) {
      (j(new Fe(0.048, 16), g, this.head, e * 0.047, 0.012, 0.118).scale.set(
        1.15,
        0.85,
        1,
      ),
        j(
          new w(0.049, 0.005, 4, 18),
          h,
          this.head,
          e * 0.047,
          0.012,
          0.118,
        ).scale.set(1.15, 0.85, 1));
      let t = j(new C(0.006, 0.006, 0.12), h, this.head, e * 0.11, 0.02, 0.06);
      t.rotation.y = e * 0.15;
    }
    j(new C(0.03, 0.006, 0.006), h, this.head, 0, 0.03, 0.12);
    let _ = (e) => {
        let t = zi(this.body, e * 0.21, 0.58, 0);
        (j(new ge(0.05, 0.22, 4, 8), s, t, 0, -0.13, 0),
          j(new E(0.058, 0.058, 0.05, 12), s, t, 0, -0.25, 0));
        let n = zi(t, 0, -0.28, 0);
        return (
          j(new ge(0.042, 0.2, 4, 8), r, n, 0, -0.12, 0),
          j(new i(0.045, 10, 8), r, n, 0, -0.26, 0),
          [t, n]
        );
      },
      [v, y] = _(1),
      [b, ee] = _(-1);
    ((this.arms = [v, b]), (this.elbows = [y, ee]));
    let S = zi(y, 0, -0.38, 0),
      te = Fi(13159634, 0.25, 0.85);
    (j(new E(0.075, 0.09, 0.16, 18), te, S, 0, 0, 0),
      j(new i(0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), te, S, 0, 0.08, 0));
    let ne = j(new E(0.012, 0.02, 0.14, 8), te, S, 0, 0.03, 0.1);
    ne.rotation.x = 0.9;
    let re = j(new w(0.06, 0.008, 6, 16, Math.PI), te, S, 0, 0.12, 0);
    re.rotation.y = Math.PI / 2;
    for (let e = 0; e < 3; e++) {
      let e = new he(
        new Ne({
          color: 16777215,
          transparent: !0,
          opacity: 0.25,
          depthWrite: !1,
        }),
      );
      (e.scale.setScalar(0.08), S.add(e), this.steam.push(e));
    }
    ((this.cupHand = zi(ee, 0, -0.3, 0.02)),
      (this.cup = Bi()),
      this.cupHand.add(this.cup),
      (this.stopAt = this.pickStop()),
      this.root.position.set(this.x, Vi(this.x), this.z));
  }
  pickStop() {
    return -7 + this.rng() * 14;
  }
  get hasCup() {
    return this.cup !== null && this.upsetTimer <= 0;
  }
  get posX() {
    return this.x;
  }
  headWorld(e) {
    return this.head.getWorldPosition(e);
  }
  tryKnock(e, t) {
    if (!this.hasCup || Math.abs(e - this.x) > 1.25) return !1;
    let n = this.cup;
    return (
      n.getWorldPosition(this.tmp),
      this.cupHand.remove(n),
      this.scene.add(n),
      n.position.copy(this.tmp),
      this.flying.push({
        obj: n,
        vel: new T(
          t * (2.5 + this.rng() * 1.5),
          3.2 + this.rng(),
          1.2 + this.rng(),
        ),
        spin: new T(8 + this.rng() * 6, this.rng() * 4, 6 + this.rng() * 6),
        life: 4,
        bounced: !1,
      }),
      (this.cup = null),
      (this.upsetTimer = 2.2),
      (this.newCupTimer = 3.5),
      (this.stopTimer = 0),
      !0
    );
  }
  flyingCupPos(e) {
    let t = this.flying[0];
    return !t || t.bounced ? null : e.copy(t.obj.position);
  }
  upsetLine() {
    return Pi[Math.floor(this.rng() * Pi.length)];
  }
  update(e, t) {
    let n = {},
      r = !1;
    (this.upsetTimer > 0
      ? (this.upsetTimer -= e)
      : this.stopTimer > 0
        ? (this.stopTimer -= e)
        : ((r = !0),
          (this.x += this.dir * 0.85 * e),
          ((this.dir > 0 &&
            this.x >= this.stopAt &&
            this.x - 0.85 * e < this.stopAt) ||
            (this.dir < 0 &&
              this.x <= this.stopAt &&
              this.x + 0.85 * e > this.stopAt)) &&
            ((this.stopTimer = 2.4),
            (n.shout = Ni[Math.floor(this.rng() * Ni.length)]),
            (this.stopAt = this.pickStop())),
          Math.abs(this.x) > 9.2 &&
            ((this.dir = this.x > 0 ? -1 : 1),
            (this.x = Math.sign(this.x) * 9.2))),
      this.newCupTimer > 0 &&
        ((this.newCupTimer -= e),
        this.newCupTimer <= 0 &&
          !this.cup &&
          ((this.cup = Bi()), this.cupHand.add(this.cup))));
    let i = Vi(this.x);
    ((this.root.position.x = this.x),
      (this.root.position.y +=
        (i - this.root.position.y) * Math.min(1, e * 10)),
      (this.root.position.z = this.z));
    let a = r ? (this.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : 0;
    ((this.yaw += (a - this.yaw) * Math.min(1, e * 6)),
      (this.root.rotation.y = this.yaw),
      r && (this.walkPhase += e * 7));
    let o = r ? Math.sin(this.walkPhase) : 0;
    ((this.legs[0].rotation.x = o * 0.5),
      (this.legs[1].rotation.x = -o * 0.5),
      (this.body.position.y =
        0.82 + (r ? Math.abs(Math.cos(this.walkPhase)) * 0.025 : 0)));
    let [s, c] = this.arms,
      [l, u] = this.elbows;
    if (this.upsetTimer > 0) {
      let e = Math.sin(t * 18) * 0.15;
      (s.rotation.set(-2.6 + e, 0, 0.3),
        c.rotation.set(-2.6 - e, 0, -0.3),
        (l.rotation.x = -0.4),
        (u.rotation.x = -0.4),
        this.head.rotation.set(-0.3, Math.sin(t * 10) * 0.3, 0));
    } else {
      (s.rotation.set(-o * 0.25, 0, 0.12), (l.rotation.x = -0.15));
      let e = this.stopTimer > 0;
      (c.rotation.set(e ? -1.3 : -0.7, 0, -0.1),
        (u.rotation.x = e ? -0.2 : -0.9),
        this.head.rotation.set(e ? -0.15 + Math.sin(t * 8) * 0.06 : 0, 0, 0));
    }
    this.steam.forEach((e, n) => {
      let r = (t * 0.8 + n / 3) % 1;
      (e.position.set(
        Math.sin(t * 2 + n) * 0.02,
        0.1 + r * 0.25,
        0.12 + r * 0.05,
      ),
        e.scale.setScalar(0.05 + r * 0.1),
        (e.material.opacity = 0.3 * (1 - r)));
    });
    for (let t = this.flying.length - 1; t >= 0; t--) {
      let n = this.flying[t];
      ((n.life -= e),
        (!n.bounced || n.obj.position.y > 0.02) &&
          ((n.vel.y -= 14 * e),
          n.obj.position.addScaledVector(n.vel, e),
          (n.obj.rotation.x += n.spin.x * e),
          (n.obj.rotation.y += n.spin.y * e),
          (n.obj.rotation.z += n.spin.z * e),
          n.obj.position.y <= 0.02 &&
            n.vel.y < 0 &&
            ((n.obj.position.y = 0.02),
            (n.bounced = !0),
            n.vel.set(n.vel.x * 0.3, Math.abs(n.vel.y) * 0.25, n.vel.z * 0.3),
            n.spin.multiplyScalar(0.3),
            Math.abs(n.vel.y) < 0.4 && n.vel.set(0, 0, 0))),
        n.life < 1 && n.obj.scale.setScalar(Math.max(0.001, n.life)),
        n.life <= 0 &&
          (this.scene.remove(n.obj), Ri(n.obj), this.flying.splice(t, 1)));
    }
    return n;
  }
  dispose() {
    (this.scene.remove(this.root), Ri(this.root));
    for (let e of this.flying) (this.scene.remove(e.obj), Ri(e.obj));
    this.flying.length = 0;
  }
};
function Ui(e, t = 0.8, n = 0) {
  return new x({ color: e, roughness: t, metalness: n });
}
function Wi(e, t, n, r, a, o = 0, s = 0, c = 0) {
  let l = new p(new i(1, 20, 14), r);
  return (
    l.scale.set(e, t, n),
    l.position.set(o, s, c),
    (l.castShadow = !0),
    a.add(l),
    l
  );
}
function Gi(e, t, n, r) {
  let i = new c();
  return (i.position.set(t, n, r), e.add(i), i);
}
function Ki() {
  let e = new c(),
    t = Ui(15854818, 0.85),
    n = Ui(12169638, 0.85),
    r = Ui(13212306, 0.6),
    a = Ui(2762018, 0.6),
    o = Gi(e, 0, 0, 0);
  (Wi(0.33, 0.36, 0.78, t, o, 0, 1, 0),
    Wi(0.2, 0.2, 0.22, t, o, 0, 1.33, 0.42),
    Wi(0.12, 0.22, 0.2, t, o, 0, 0.82, 0.68),
    Wi(0.2, 0.18, 0.22, n, o, 0.18, 1.08, -0.25),
    Wi(0.16, 0.14, 0.18, n, o, -0.17, 0.98, 0.18));
  let s = [];
  for (let [e, n] of [
    [0.17, 0.5],
    [-0.17, 0.5],
    [0.17, -0.52],
    [-0.17, -0.52],
  ]) {
    let r = Gi(o, e, 0.82, n),
      i = new p(new ge(0.065, 0.62, 4, 10), t);
    ((i.position.y = -0.38), (i.castShadow = !0), r.add(i));
    let c = new p(new E(0.07, 0.075, 0.08, 10), a);
    ((c.position.y = -0.76), r.add(c), s.push(r));
  }
  let l = Gi(o, 0, 1.22, 0.78),
    u = Wi(0.14, 0.15, 0.24, t, l, 0, 0, 0.12);
  u.rotation.x = 0.5;
  let d = Wi(0.11, 0.09, 0.1, r, l, 0, -0.14, 0.3);
  d.rotation.x = 0.4;
  for (let e of [1, -1])
    Wi(0.018, 0.012, 0.01, Ui(3809312), l, e * 0.04, -0.15, 0.39);
  let f = Wi(0.08, 0.035, 0.08, r, l, 0, -0.2, 0.25);
  for (let e of [1, -1]) {
    Wi(0.025, 0.03, 0.02, Ui(1118481, 0.3), l, e * 0.1, 0.05, 0.18);
    let n = Wi(0.1, 0.035, 0.05, t, l, e * 0.17, 0, 0.05);
    n.rotation.z = e * -0.6;
    let r = new p(new de(0.035, 0.22, 10), Ui(16747546, 0.5));
    (r.position.set(e * 0.1, 0.17, 0.02), (r.rotation.z = e * -0.55), l.add(r));
    let i = new p(new de(0.018, 0.08, 8), Ui(1280008, 0.5));
    (i.position.set(e * 0.165, 0.27, 0.02),
      (i.rotation.z = e * -0.55),
      l.add(i));
  }
  Wi(0.012, 0.03, 0.005, Ui(14032671, 0.5), l, 0, 0.06, 0.25);
  let m = new p(new w(0.22, 0.04, 8, 24), Ui(16751130, 0.9));
  (m.position.set(0, 1.05, 0.66), (m.rotation.x = 1.2), o.add(m));
  let h = new p(new i(0.055, 12, 10), Ui(13936192, 0.3, 0.8));
  (h.position.set(0, 0.8, 0.8), o.add(h));
  let g = Gi(o, 0, 1.15, -0.75),
    _ = new p(new E(0.012, 0.018, 0.6, 6), t);
  ((_.position.y = -0.3), g.add(_));
  let v = Wi(0.04, 0.08, 0.04, Ui(2762018), g, 0, -0.62, 0);
  return (
    (v.castShadow = !1),
    (g.rotation.x = 0.25),
    { root: e, legs: s, head: l, tail: g, jaw: f }
  );
}
var qi = class t {
  constructor(t, n, r, i = 1.25) {
    (e(this, `scene`, void 0),
      e(this, `z`, void 0),
      e(this, `root`, void 0),
      e(this, `parts`, void 0),
      e(this, `t`, 0),
      e(this, `walked`, 0),
      e(this, `x`, void 0),
      e(this, `dir`, void 0),
      e(this, `total`, void 0),
      e(this, `paused`, !1),
      e(this, `pauseLeft`, 0),
      e(this, `mooedMid`, !1),
      e(this, `stepAcc`, 0),
      e(this, `done`, !1),
      (this.scene = t),
      (this.z = i),
      (this.parts = Ki()),
      (this.root = this.parts.root),
      (this.x = n),
      (this.dir = r >= n ? 1 : -1),
      (this.total = Math.abs(r - n)),
      this.root.position.set(n, 0, i),
      (this.root.rotation.y = this.dir > 0 ? Math.PI / 2 : -Math.PI / 2),
      t.add(this.root));
  }
  get posX() {
    return this.x;
  }
  get duration() {
    return this.total / t.SPEED + t.MOO_PAUSE;
  }
  update(e) {
    let n = {};
    if (this.done) return n;
    this.t += e;
    let r = this.parts;
    if (this.paused) {
      ((this.pauseLeft -= e),
        (r.head.rotation.y +=
          ((this.dir > 0 ? -1.1 : 1.1) - r.head.rotation.y) *
          Math.min(1, e * 4)),
        (r.jaw.position.y = -0.2 - Math.abs(Math.sin(this.t * 5)) * 0.03));
      for (let e of r.legs) e.rotation.x *= 0.85;
      this.pauseLeft <= 0 && (this.paused = !1);
    } else {
      let i = t.SPEED * e;
      ((this.walked += i), (this.x += this.dir * i));
      let a = this.walked * 4.2,
        o = Math.sin(a);
      ((r.legs[0].rotation.x = o * 0.35),
        (r.legs[3].rotation.x = o * 0.35),
        (r.legs[1].rotation.x = -o * 0.35),
        (r.legs[2].rotation.x = -o * 0.35),
        (r.head.rotation.y *= 0.92),
        (r.head.rotation.x = Math.sin(a * 2) * 0.05),
        (this.root.position.y = Math.abs(Math.cos(a)) * 0.02),
        (this.stepAcc += i),
        this.stepAcc > 0.75 && ((this.stepAcc = 0), (n.step = !0)),
        !this.mooedMid &&
          this.walked >= this.total / 2 &&
          ((this.mooedMid = !0),
          (this.paused = !0),
          (this.pauseLeft = t.MOO_PAUSE),
          (n.moo = !0)),
        this.walked >= this.total && (this.done = !0));
    }
    return (
      (r.tail.rotation.z = Math.sin(this.t * 3.2) * 0.45),
      (this.root.position.x = this.x),
      (this.root.position.z = this.z),
      n
    );
  }
  dispose() {
    (this.scene.remove(this.root),
      this.root.traverse((e) => {
        let t = e;
        t.geometry && t.geometry.dispose();
      }));
  }
};
(e(qi, `SPEED`, 3), e(qi, `MOO_PAUSE`, 1));
var Ji =
  `rootY.rootZ.hipsF.hipsT.hipsS.spineF.spineT.spineS.chestF.chestT.headF.headT.headS.lShF.lShO.lShT.lEl.lHand.lWf.lWr.rShF.rShO.rShT.rEl.rHand.rWf.rWr.lThF.lThO.lKn.lAnk.rThF.rThO.rKn.rAnk`.split(
    `.`,
  );
function Yi() {
  let e = {};
  for (let t of Ji) e[t] = 0;
  return e;
}
function Xi(e) {
  return { ...e };
}
function M(e, t) {
  return { ...e, ...t };
}
function N(e, t, n, r = Yi()) {
  for (let i of Ji) r[i] = e[i] + (t[i] - e[i]) * n;
  return r;
}
var P = (e) => (e < 0 ? 0 : e > 1 ? 1 : e),
  F = (e) => 1 - (1 - P(e)) ** 3,
  I = (e) => {
    let t = P(e);
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  };
function Zi(e, t, n = 0) {
  let r = Math.max(0.05, e - Xe - n),
    i = t,
    a = Je + Ye - 1e-6,
    o = Math.min(a, Math.max(0.05, Math.hypot(r, i))),
    s = (Je * Je + Ye * Ye - o * o) / (2 * Je * Ye),
    c = Math.PI - Math.acos(Math.max(-1, Math.min(1, s))),
    l = Math.atan2(i, r),
    u = (Je * Je + o * o - Ye * Ye) / (2 * Je * o);
  return { thF: l + Math.acos(Math.max(-1, Math.min(1, u))), kn: c };
}
function L(e, t, n, r = 0, i = 0) {
  let a = Ze + e,
    o = Zi(a, t, r),
    s = Zi(a, n, i);
  return {
    lThF: o.thF,
    lKn: o.kn,
    lAnk: o.thF - o.kn,
    rThF: s.thF,
    rKn: s.kn,
    rAnk: s.thF - s.kn,
  };
}
var Qi = {
  lShF: 1.05,
  lShO: 0.18,
  lShT: 0,
  lEl: 1.85,
  lHand: 0,
  rShF: 0.75,
  rShO: 0.22,
  rShT: 0,
  rEl: 2.15,
  rHand: 0,
};
function R(e, t) {
  let n = Math.sin(e * 4.2) * 0.012,
    r = Math.sin(e * 1.3),
    i = Math.sin(e * 4.2 + 0.9),
    a = -0.07 + n,
    o = M(Yi(), {
      rootY: a,
      hipsT: -0.25 + r * 0.04,
      hipsS: r * 0.025,
      spineF: 0.1 + n * 1.5,
      spineT: -0.05 - r * 0.03,
      spineS: -r * 0.02,
      chestF: 0.04,
      headF: -0.08 - n,
      headT: 0.3 + Math.sin(e * 0.7) * 0.05,
      lThO: 0.06,
      rThO: 0.1,
      ...Qi,
      ...L(a, 0.24 + r * 0.015, -0.26 + r * 0.015),
    });
  return (
    (o.lShF += i * 0.04),
    (o.rShF -= i * 0.035),
    (o.lEl += i * 0.05),
    t === `modi`
      ? (o.spineF = 0.05 + n)
      : t === `didi`
        ? ((o.spineF = 0.02 + n),
          (o.headF = -0.14 - n),
          (o.rootY += Math.max(0, Math.sin(e * 6.3)) * 0.008))
        : t === `trump`
          ? ((o.spineF = -0.02 + n),
            (o.chestF = -0.04),
            (o.headF = -0.18 - n),
            (o.hipsS = Math.sin(e * 1.3) * 0.02))
          : t === `yogi`
            ? ((o.spineF = 0.03 + n * 0.6),
              (o.chestF = 0),
              (o.headF = -0.05 - n * 0.5),
              (o.rootY -= n * 0.4))
            : (o.rootY += Math.max(0, Math.sin(e * 4.2)) * 0.012),
    o
  );
}
function $i(e, t, n, r) {
  let i = R(e, r),
    a = (t / 0.55) * Math.PI,
    o = n >= 0 ? 1 : -1,
    s = Math.sin(a) * o,
    c = Math.cos(a),
    l = -0.07 + Math.abs(c) * 0.025;
  return M(i, {
    rootY: l,
    ...L(
      l,
      0.24 + s * 0.13,
      -0.26 - s * 0.13,
      Math.max(0, c) * 0.06,
      Math.max(0, -c) * 0.06,
    ),
    hipsT: i.hipsT + s * 0.08,
    spineT: -0.05 - s * 0.1,
    spineF: i.spineF + o * 0.05,
    spineS: c * 0.03,
    lShF: i.lShF - s * 0.08,
    rShF: i.rShF + s * 0.08,
  });
}
function ea(e, t, n) {
  let r = -0.42 + Math.sin(e * 4) * 0.008;
  return M(R(e, t), {
    rootY: r,
    spineF: 0.42,
    headF: -0.3,
    lShF: n ? 1.3 : 1,
    lEl: n ? 2.2 : 1.7,
    rShF: n ? 1.1 : 0.8,
    rEl: 2.2,
    ...L(r, 0.3, -0.18),
  });
}
function ta(e, t) {
  return M(R(e, t), {
    spineF: 0.18,
    headF: 0.2,
    lShF: 1.35,
    lShO: -0.05,
    lEl: 2.4,
    rShF: 1.25,
    rShO: -0.05,
    rEl: 2.45,
  });
}
function na(e, t) {
  let n = P(1 - Math.abs(e) / 8);
  return M(R(0, t), {
    rootY: 0,
    spineF: 0.15,
    lThF: 0.5 + n * 0.7,
    lKn: 0.6 + n * 1.2,
    lAnk: 0.3,
    rThF: 0.2 + n * 0.6,
    rKn: 0.8 + n * 1,
    rAnk: 0.3,
    lShF: 1.3,
    lEl: 1.6,
    rShF: 1,
    rEl: 1.9,
  });
}
function ra(e, t) {
  switch (e) {
    case `jab`:
      return {
        windup: { lShF: 1.2, lEl: 2.1, spineT: -0.1 },
        strike: {
          lShF: 1.58,
          lShO: -0.12,
          lShT: 0,
          lEl: 0.05,
          spineT: -0.38,
          hipsT: -0.35,
          rootZ: 0.06,
          headT: 0.4,
        },
      };
    case `cross`:
      return {
        windup: { rShF: 0.8, rEl: 2.3, spineT: -0.3 },
        strike: {
          rShF: 1.6,
          rShO: -0.3,
          rEl: 0.05,
          spineT: 0.45,
          hipsT: 0.15,
          rootZ: 0.1,
          lShF: 1,
          lEl: 2.2,
          headT: 0,
        },
      };
    case `kick`: {
      let e = -0.03;
      return {
        windup: { rThF: 1.3, rKn: 1.9, spineF: -0.05, rootY: e },
        strike: {
          rootY: e,
          rThF: 1.45,
          rKn: 0.15,
          rAnk: 0.2,
          spineF: -0.22,
          hipsT: 0.1,
          ...ia(e, 0.06),
        },
      };
    }
    case `finisher`:
    case `special2`: {
      let n = -0.02,
        r = t === `rahul` && e === `special2` ? 0.9 : 0.6;
      return {
        windup: {
          rThF: 1.1,
          rThO: 0.4,
          rKn: 2,
          hipsT: r * 0.5,
          spineT: -0.3,
          rootY: n,
        },
        strike: {
          rootY: n,
          rThF: 1.5,
          rThO: 0.75,
          rKn: 0.05,
          rAnk: 0.2,
          hipsT: r,
          spineF: -0.38,
          spineS: 0.15,
          spineT: -0.2,
          lShO: 0.6,
          lShF: 0.6,
          lEl: 1,
          rShO: 0.5,
          rEl: 1.2,
          ...ia(n, -0.02),
        },
      };
    }
    case `uppercut`: {
      let e = -0.3;
      return {
        windup: {
          rootY: e,
          ...L(e, 0.32, -0.3),
          spineF: 0.4,
          spineT: -0.25,
          lShF: 0.2,
          lShO: 0.1,
          lEl: 1.7,
        },
        strike: {
          rootY: 0.03,
          ...L(0.03, 0.16, -0.3),
          spineF: -0.28,
          spineT: -0.3,
          hipsT: -0.4,
          lShF: 2.85,
          lShO: -0.1,
          lEl: 0.45,
          rShF: 0.9,
          rEl: 2.2,
          headF: -0.35,
          rootZ: 0.05,
        },
      };
    }
    case `roundhouse`:
      return {
        windup: {
          rootY: 0,
          hipsT: -0.9,
          spineT: 0.3,
          rThF: 0.7,
          rThO: 0.3,
          rKn: 1.7,
          ...ia(0, 0.05),
        },
        strike: {
          rootY: 0,
          hipsT: 1.1,
          spineT: -0.45,
          spineF: -0.5,
          spineS: 0.25,
          rThF: 1.75,
          rThO: 1,
          rKn: 0.05,
          rAnk: 0.2,
          lShF: 0.5,
          lShO: 1,
          lEl: 0.5,
          rShF: 0.3,
          rShO: 0.9,
          rEl: 0.6,
          headT: 0.6,
          ...ia(0, 0),
        },
      };
    case `lowJab`: {
      let e = -0.42;
      return {
        windup: { lShF: 0.9, lEl: 2, rootY: e, spineF: 0.42 },
        strike: {
          rootY: e,
          spineF: 0.5,
          lShF: 1.2,
          lShO: -0.1,
          lEl: 0.08,
          spineT: -0.35,
          ...L(e, 0.3, -0.18),
        },
      };
    }
    case `sweep`: {
      let e = -0.55,
        t = Zi(Ze + e, -0.32);
      return {
        windup: {
          rootY: -0.45,
          spineF: 0.5,
          hipsT: -0.3,
          ...L(-0.45, 0.3, -0.2),
        },
        strike: {
          rootY: e,
          spineF: 0.6,
          hipsT: 0.55,
          spineT: -0.4,
          lThF: 1.12,
          lThO: 0.35,
          lKn: 0.05,
          lAnk: 0.9,
          rThF: t.thF,
          rKn: t.kn,
          rAnk: t.thF - t.kn,
          lShF: 0.6,
          lShO: 0.6,
          lEl: 0.6,
          rShF: 0.4,
          rShO: 0.3,
          rEl: 0.5,
        },
      };
    }
    case `special1`:
      return t === `modi` || t === `didi` || t === `trump` || t === `yogi`
        ? {
            windup: { rShF: 0.2, rEl: 2, rHand: 1, spineT: -0.4, rootY: -0.12 },
            strike: {
              rShF: 1.55,
              rShO: -0.2,
              rShT: -0.4,
              rEl: 0,
              rHand: 1,
              spineT: 0.5,
              spineF: 0.2,
              hipsT: 0.2,
              rootZ: 0.15,
              rootY: -0.12,
              ...L(-0.12, 0.42, -0.36),
              headT: 0.05,
            },
          }
        : {
            windup: {
              rShF: 0.3,
              rEl: 1.6,
              rootY: -0.25,
              spineF: 0.35,
              spineT: -0.3,
              ...L(-0.25, 0.3, -0.3),
            },
            strike: {
              rShF: 2.75,
              rShO: -0.15,
              rEl: 0.6,
              spineF: -0.25,
              spineT: 0.35,
              rootY: 0.02,
              rootZ: 0.08,
              ...L(0.02, 0.2, -0.3),
              headF: -0.3,
            },
          };
    case `grab`:
      return {
        windup: {
          lShF: 0.9,
          lEl: 1.4,
          rShF: 0.9,
          rEl: 1.4,
          spineF: 0.05,
          lHand: 1,
          rHand: 1,
        },
        strike: {
          lShF: 1.5,
          lShO: -0.15,
          lEl: 0.25,
          rShF: 1.5,
          rShO: -0.15,
          rEl: 0.25,
          lHand: 1,
          rHand: 1,
          spineF: 0.28,
          spineT: 0,
          hipsT: -0.1,
          rootZ: 0.1,
          headT: 0.2,
        },
      };
    case `landing`:
      return { windup: {}, strike: {} };
    case `airPunch`:
      return {
        windup: { lShF: 0.9, lEl: 2 },
        strike: {
          lShF: 1.25,
          lShO: -0.1,
          lEl: 0.05,
          spineT: -0.3,
          spineF: 0.2,
        },
      };
    case `airKick`:
      return {
        windup: { lThF: 1.4, lKn: 1.9 },
        strike: {
          lThF: 1.15,
          lKn: 0.05,
          lAnk: 0.3,
          rThF: 0.6,
          rKn: 1.7,
          spineF: -0.2,
          lShF: 0.4,
          lShO: 0.5,
          rShF: 1.2,
          rEl: 1.8,
        },
      };
  }
}
function ia(e, t) {
  let n = Zi(Ze + e, t);
  return { lThF: n.thF, lKn: n.kn, lAnk: n.thF - n.kn };
}
function aa(e, t) {
  let n = e.attack,
    r = n.def,
    i = r.air
      ? na(e.vy, e.char.id)
      : r.crouching || r.id === `landing`
        ? ea(t, e.char.id, !1)
        : R(t, e.char.id),
    a = ra(r.id, e.char.id),
    o = M(i, a.windup),
    s = M(i, a.strike);
  if (n.frame <= r.startup) {
    let e = n.frame / Math.max(1, r.startup);
    return e < 0.6 ? N(i, o, F(e / 0.6)) : N(o, s, F((e - 0.6) / 0.4));
  }
  return n.frame <= r.startup + r.active
    ? s
    : N(s, i, I((n.frame - r.startup - r.active) / Math.max(1, r.recovery)));
}
function oa(e, t) {
  let n = R(t, e.char.id),
    r = P(e.stateFrames / 4),
    i = P((e.stateFrames - 4) / Math.max(1, e.stun + e.stateFrames - 4)),
    a = Math.sin(e.stateFrames * 0.9) * Math.exp(-e.stateFrames * 0.18) * 0.25,
    o = (1 - i * 0.75) * F(r),
    s = e.lastHitHeight === `low`,
    c = e.lastHitHeight === `high`,
    l = N(
      n,
      M(n, {
        spineF: s ? 0.55 : c ? -0.5 : -0.3,
        spineT: n.spineT + (c ? 0.25 : 0.1),
        chestF: s ? 0.2 : -0.2,
        headF: s ? 0.45 : c ? -0.7 : -0.45,
        headT: n.headT + (c ? 0.35 : 0.15),
        headS: 0.25 + a,
        lShF: 0.45,
        lShO: 0.55,
        lEl: 0.75,
        rShF: 0.25,
        rShO: 0.7,
        rEl: 0.55,
        rootY: s ? -0.18 : -0.1,
        ...L(s ? -0.18 : -0.1, 0.16, -0.34),
        lHand: 1,
        rHand: 1,
      }),
      o,
    );
  return ((l.spineS += a * 0.4), l);
}
function sa(e) {
  let t = P(e.stateFrames / 20);
  return M(Yi(), {
    rootY: -0.1,
    hipsF: -0.4 - t * 1,
    spineF: -0.3,
    headF: -0.5,
    lShF: 2.2,
    lShO: 0.7,
    lEl: 0.5,
    lHand: 1,
    rShF: 2,
    rShO: 0.8,
    rEl: 0.6,
    rHand: 1,
    lThF: 0.7,
    lKn: 0.9,
    rThF: 0.4,
    rKn: 0.6,
  });
}
function ca(e, t = 0) {
  return M(Yi(), {
    rootY: -(Ze - 0.13),
    hipsF: -Math.PI / 2,
    spineF: 0.04,
    headF: -0.15 + Math.sin(e * 30) * t,
    headT: 0.5,
    lShF: 0.3,
    lShO: 1.1,
    lEl: 0.4,
    lHand: 1,
    rShF: 0.5,
    rShO: 1,
    rEl: 0.7,
    rHand: 1,
    lThF: 0.15,
    lThO: 0.15,
    lKn: 0.2,
    lAnk: 0.4,
    rThF: 0.35,
    rThO: 0.1,
    rKn: 0.7,
    rAnk: 0.4,
  });
}
function la(e, t) {
  if (!e.grounded) return sa(e);
  let n = P(e.downFrames / 8);
  return N(sa(e), ca(t), F(n));
}
function ua(e, t) {
  let n = e.stateFrames / 24,
    r = M(ea(t, e.char.id, !0), { rootY: -0.6, hipsF: -0.4, spineF: 0.8 });
  return n < 0.5
    ? N(ca(t), r, I(n / 0.5))
    : N(r, R(t, e.char.id), I((n - 0.5) / 0.5));
}
function z(e, t) {
  return M(R(e, t), {
    rootY: -0.1,
    spineF: -0.2,
    headF: -0.35,
    lShF: 0.8,
    lShO: 0.7,
    lEl: 1.3,
    lHand: 1,
    rShF: 0.9,
    rShO: 0.6,
    rEl: 1.4,
    rHand: 1,
  });
}
function da(e, t) {
  let n = R(e, t);
  if (t === `modi`) {
    let t = Math.sin(e * 2) * 0.08;
    return M(n, {
      rootY: 0,
      ...L(0, 0.1, -0.1),
      hipsT: 0,
      spineT: 0,
      spineF: -0.05,
      headT: 0.6,
      headF: -0.1,
      lShF: 0.5 + t,
      lShO: 1,
      lShT: 0.6,
      lEl: 0.5,
      lHand: 1,
      rShF: 0.5 - t,
      rShO: 1,
      rShT: 0.6,
      rEl: 0.5,
      rHand: 1,
    });
  }
  if (t === `didi`) {
    let t = Math.sin(e * 9) * 0.22;
    return M(n, {
      rootY: 0,
      ...L(0, 0.1, -0.12),
      hipsT: 0.1,
      hipsS: 0.05,
      spineT: 0.05,
      spineS: -0.05,
      headT: 0.45,
      headF: -0.18,
      headS: t * 0.25,
      rShF: 1.45,
      rShO: 0.05,
      rShT: t,
      rEl: 0.55,
      rHand: 0.35,
      lShF: -0.15,
      lShO: 0.55,
      lShT: -0.4,
      lEl: 1.75,
      lHand: 0,
    });
  }
  if (t === `trump`) {
    let t = Math.sin(e * 3.2);
    return M(n, {
      rootY: 0,
      ...L(0, 0.12, -0.12),
      hipsT: 0,
      spineT: 0.05,
      spineF: -0.06,
      chestF: -0.05,
      headT: 0.55,
      headF: -0.22 + Math.abs(t) * 0.05,
      headS: t * 0.06,
      lShF: 1.05,
      lShO: 0.25 + t * 0.22,
      lShT: 0.35,
      lEl: 1.1,
      lHand: 1,
      rShF: 1.05,
      rShO: 0.25 + t * 0.22,
      rShT: 0.35,
      rEl: 1.1,
      rHand: 1,
    });
  }
  return t === `yogi`
    ? va(e, t)
    : M(n, {
        rootY: 0,
        ...L(0, 0.12, -0.12),
        hipsT: 0,
        spineT: 0.1,
        headT: 0.6,
        rShF: 1.3,
        rShO: 0.3,
        rShT: 0,
        rEl: 1.4,
        rHand: 1,
        lShF: 0.1,
        lShO: 0.15,
        lEl: 0.2,
        lHand: 1,
      });
}
function fa(e, t) {
  let n = (e * 132) / 60,
    r = n % 4,
    i = Math.floor(n) % 2 == 0 ? 1 : -1,
    a = n % 1,
    o = -0.08 + Math.abs(Math.sin(n * Math.PI)) * 0.05,
    s = M(R(e, t), { hipsT: 0, spineT: 0, headT: 0.6, headF: -0.05 });
  if (r < 2) {
    let e = Math.sin(a * Math.PI) ** 2,
      t = i * 0.14;
    return M(s, {
      rootY: o,
      ...L(o, 0.12 + t, -0.12 + t, i > 0 ? 0 : 0.08 * e, i > 0 ? 0.08 * e : 0),
      spineS: -t * 0.8,
      headS: t * 0.6,
      spineF: 0.06,
      lShF: 1.3 + e * 1.35,
      lShO: 0.9 - e * 1.15,
      lShT: 0.2,
      lEl: 0.9 - e * 0.5,
      lHand: 1,
      rShF: 1.3 + e * 1.35,
      rShO: 0.9 - e * 1.15,
      rShT: 0.2,
      rEl: 0.9 - e * 0.5,
      rHand: 1,
    });
  }
  let c = (r - 2) / 2,
    l = I(c) * Math.PI * 2,
    u = Math.sin(n * Math.PI * 2) * 0.35;
  return M(s, {
    rootY: o - 0.03,
    ...L(o - 0.03, 0.1, -0.1, Math.max(0, Math.sin(c * Math.PI * 4)) * 0.07, 0),
    hipsT: l,
    spineS: 0.1,
    headF: -0.15,
    lShF: 2.75,
    lShO: 0.35 + u,
    lEl: 0.5,
    lHand: 1,
    rShF: 2.75,
    rShO: 0.35 - u,
    rEl: 0.5,
    rHand: 1,
  });
}
function pa(e, t) {
  let n = (e * 132) / 60,
    r = Math.floor(n) % 2 == 0 ? 1 : -1,
    i = n % 1,
    a = Math.sin(i * Math.PI),
    o = Math.abs(Math.sin(n * Math.PI * 2)) * 0.12,
    s = -0.12 + a * 0.09,
    c = a * 0.95,
    l = M(R(e, t), { hipsT: r * 0.18, spineT: -r * 0.12, headT: 0.55 }),
    u = L(s, 0.08, -0.08),
    d =
      r > 0
        ? { lThF: 0.3 + c, lKn: 0.4 + c * 1.3, lAnk: 0.4 }
        : { rThF: 0.3 + c, rKn: 0.4 + c * 1.3, rAnk: 0.4 };
  return M(l, {
    rootY: s,
    ...u,
    ...d,
    spineF: -0.12 + a * 0.06,
    spineS: r * 0.08,
    headF: -0.25 + o,
    headS: -r * 0.1,
    lShF: 2.55 + (r > 0 ? a * 0.3 : 0),
    lShO: 0.55 + o,
    lShT: 0.3,
    lEl: 0.35,
    lHand: 0,
    rShF: 2.55 + (r < 0 ? a * 0.3 : 0),
    rShO: 0.55 + o,
    rShT: 0.3,
    rEl: 0.35,
    rHand: 0,
  });
}
function ma(e, t) {
  let n = (e * 132) / 60,
    r = n % 8,
    i = Math.floor(n) % 2 == 0 ? 1 : -1,
    a = n % 1,
    o = Math.sin(n * Math.PI) * 0.16,
    s = -0.06 - Math.abs(Math.sin(n * Math.PI)) * 0.05,
    c = Math.sin(a * Math.PI),
    l = r >= 6 ? I((r - 6) / 2) * Math.PI * 2 : 0,
    u = M(R(e, t), { hipsT: 0, spineT: 0, headT: 0.6, headF: -0.1 }),
    d = i > 0 ? `r` : `l`;
  return M(u, {
    rootY: s,
    ...L(
      s,
      0.1 + o * 0.5,
      -0.1 + o * 0.5,
      i > 0 ? 0.05 * c : 0,
      i < 0 ? 0.05 * c : 0,
    ),
    hipsS: o * 0.6,
    hipsT: l,
    spineS: -o * 0.7,
    headS: o * 0.5,
    spineF: 0.04,
    rShF: d === `r` ? 2.5 + c * 0.25 : 0.7,
    rShO: d === `r` ? 0.25 : 0.5,
    rShT: c * 0.4,
    rEl: d === `r` ? 0.6 : 1.4,
    rHand: 1,
    lShF: d === `l` ? 2.5 + c * 0.25 : 0.7,
    lShO: d === `l` ? 0.25 : 0.5,
    lShT: c * 0.4,
    lEl: d === `l` ? 0.6 : 1.4,
    lHand: 1,
  });
}
function ha(e, t) {
  let n = (e * 132) / 60,
    r = n % 8,
    i = Math.sin(n * Math.PI * 0.5),
    a = -0.07 + Math.abs(Math.sin(n * Math.PI)) * 0.035,
    o = M(R(e, t), { hipsT: 0, spineT: 0, headT: 0.6, headF: -0.08 }),
    s = i * 0.12,
    c = M(o, {
      rootY: a,
      ...L(a, 0.12 + s, -0.12 + s),
      hipsS: -i * 0.05,
      spineS: i * 0.09,
      spineT: i * 0.12,
      headS: -i * 0.08,
      spineF: 0.06,
      lShF: 1.05 + i * 0.32,
      lShO: 0.2 - i * 0.12,
      lShT: 0.15,
      lEl: 1.25 - i * 0.2,
      lHand: 0,
      rShF: 1.05 - i * 0.32,
      rShO: 0.2 + i * 0.12,
      rShT: 0.15,
      rEl: 1.25 + i * 0.2,
      rHand: 0,
    });
  if (r < 6) return c;
  let l = Math.sin(((r - 6) / 2) * Math.PI);
  return N(
    c,
    M(o, {
      rootY: -0.04,
      ...L(-0.04, 0.1, -0.1),
      spineF: 0.42,
      headF: 0.3,
      ..._a,
    }),
    I(l),
  );
}
function ga(e, t) {
  let n = (e * 132) / 60,
    r = Math.sin(n * Math.PI),
    i = -0.05 - Math.abs(r) * 0.03;
  return M(M(R(e, t), { hipsT: 0, spineT: 0, headT: 0.6, headF: -0.2 }), {
    rootY: i,
    ...L(i, 0.12, -0.12),
    hipsS: r * 0.06,
    spineT: r * 0.25,
    spineS: -r * 0.05,
    headS: r * 0.08,
    lShF: 0.9 + r * 0.3,
    lShO: 0.35,
    lShT: 0.2,
    lEl: 1.9,
    lHand: 0,
    rShF: 0.9 - r * 0.3,
    rShO: 0.35,
    rShT: 0.2,
    rEl: 1.9,
    rHand: 0,
  });
}
var _a = {
  lShF: 0.45,
  lShO: 0.15,
  lShT: -0.85,
  lEl: 1.65,
  lHand: 1,
  lWf: 1.1,
  lWr: 0,
  rShF: 0.45,
  rShO: 0.15,
  rShT: -0.85,
  rEl: 1.65,
  rHand: 1,
  rWf: 1.1,
  rWr: 0,
};
function va(e, t) {
  let n = Math.max(0, Math.sin(e * 1.6)) ** 2;
  return M(R(e, t), {
    rootY: 0,
    ...L(0, 0.1, -0.1),
    hipsT: 0,
    hipsS: 0,
    spineT: 0,
    spineS: 0,
    spineF: 0.04 + n * 0.08,
    chestF: 0,
    headT: 0.45,
    headS: 0,
    headF: -0.04 + n * 0.22,
    ..._a,
  });
}
var ya = 2.6;
function ba(e, t) {
  if (t === `yogi`) return va(e, t);
  let n = M(R(e, t), {
      rootY: 0,
      ...L(0, 0.11, -0.11),
      hipsT: 0,
      hipsS: 0,
      spineT: 0,
      spineS: 0,
      spineF: 0.02,
      chestF: 0,
      headF: 0,
      headS: 0,
      headT: 0.35,
      lShF: 0.05,
      lShO: 0.12,
      lShT: 0,
      lEl: 0.25,
      lHand: 1,
      rShF: 0.05,
      rShO: 0.12,
      rShT: 0,
      rEl: 0.25,
      rHand: 1,
    }),
    r = Math.floor(e / (ya * 4)),
    i = [
      (e) => {
        let t = 0.08 * Math.sin(e * 2.4),
          i = r % 2 == 0 ? `r` : `l`,
          a = i === `r` ? `l` : `r`,
          o = { headT: 0.5, spineT: i === `r` ? 0.1 : -0.1 },
          s = (e, t, n) => (o[`${e}${t}`] = n);
        return (
          s(i, `ShF`, 1.45),
          s(i, `ShO`, -0.95 - t),
          s(i, `ShT`, 0),
          s(i, `El`, 0.08),
          s(a, `ShF`, 1.05),
          s(a, `ShO`, -0.45),
          s(a, `ShT`, -0.2),
          s(a, `El`, 1.75),
          s(a, `Hand`, 0.6),
          M(n, o)
        );
      },
      (e) => {
        let t = Math.sin(e * 1.3);
        return M(n, {
          spineS: t * 0.22,
          chestF: -0.03,
          headS: t * 0.15,
          headF: -0.1,
          lShF: 2.85,
          lShO: 0.15 - t * 0.15,
          lEl: 0.35,
          rShF: 2.85,
          rShO: 0.15 + t * 0.15,
          rEl: 0.35,
        });
      },
      (e) => {
        let t = e * 2.2;
        return M(n, {
          headS: Math.sin(t) * 0.3,
          headF: Math.cos(t) * 0.25,
          headT: 0.35 + Math.sin(t) * 0.1,
          lShF: -0.15,
          lShO: 0.55,
          lShT: -0.4,
          lEl: 1.7,
          lHand: 0.4,
          rShF: -0.15,
          rShO: 0.55,
          rShT: -0.4,
          rEl: 1.7,
          rHand: 0.4,
        });
      },
      (e) => {
        let t = -0.04 + Math.abs(Math.sin(e * 7)) * 0.03,
          r = Math.sin(e * 14) * 0.25;
        return M(n, {
          rootY: t,
          ...L(t, 0.11, -0.11),
          spineF: 0.06,
          headF: 0.05,
          hipsS: Math.sin(e * 7) * 0.03,
          lShF: 0.15 + r,
          lShO: 0.3,
          lEl: 0.3 + Math.abs(r),
          lHand: 1,
          rShF: 0.15 - r,
          rShO: 0.3,
          rEl: 0.3 + Math.abs(r),
          rHand: 1,
        });
      },
    ],
    a = e / ya,
    o = Math.floor(a) % i.length,
    s = I(P(((a % 1) - 0.75) / 0.25)),
    c = i[o](e);
  return s > 0 ? N(c, i[(o + 1) % i.length](e), s) : c;
}
function xa(e, t) {
  return t === `didi`
    ? ma(e, t)
    : t === `trump`
      ? ga(e, t)
      : t === `yogi`
        ? ha(e, t)
        : t === `modi`
          ? fa(e, t)
          : pa(e, t);
}
function Sa(e, t) {
  let n = t.time + e.side * 0.7,
    r = e.char.id;
  switch (e.state) {
    case `idle`:
      return e.holdingBack && t.threatened ? ta(n, r) : R(n, r);
    case `walk`:
      return e.holdingBack && t.threatened
        ? ta(n, r)
        : $i(n, e.walkDistance, e.moveRel, r);
    case `crouch`:
      return ea(n, r, e.holdingBack);
    case `jump`:
      return e.attack && e.attackPhase !== `recovery` ? aa(e, n) : na(e.vy, r);
    case `attack`:
      return e.attack ? aa(e, n) : R(n, r);
    case `hitstun`:
      return oa(e, n);
    case `blockstun`:
      return e.crouching ? ea(n, r, !0) : ta(n, r);
    case `knockdown`:
    case `ko`:
      return la(e, n);
    case `getup`:
      return ua(e, n);
    case `victory`:
      return xa(e.stateFrames / 60, r);
    case `intro`:
      return da(n, r);
    case `frozen`:
      return z(n, r);
    case `super`:
      return R(n, r);
  }
}
var Ca = 1.7,
  wa = 0.1,
  Ta = [
    [
      -1.005, 0.179, 0.551, -0.989, 1.234, 0.212, 0.342, 0.177, -0.391, 0.483,
      0.005, 1.047, -0.087, 0.878, 0.261, 0.96,
    ],
    [
      -0.557, 0.243, 0.564, -0.839, 1.223, 0.231, 0.392, 0.166, -0.553, 0.733,
      0.001, 0.82, -0.147, 1.017, 0.342, 0.994,
    ],
    [
      -0.05, 0.35, 0.485, -0.698, 1.201, 0.252, 0.406, 0.166, -0.693, 1.392,
      0.002, 0.372, -0.131, 1.16, 0.444, 1.028,
    ],
    [
      0.052, 0.658, 0.068, -0.611, 1.162, 0.279, 0.381, 0.163, -0.849, 1.922,
      0.004, 0.513, -0.094, 1.297, 0.635, 1.085,
    ],
    [
      -0.123, 0.705, -0.028, -0.568, 1.128, 0.313, 0.342, 0.196, -0.83, 1.865,
      0.105, 0.232, -0.057, 1.36, 1.056, 1.155,
    ],
    [
      -0.113, 0.658, -0.067, -0.496, 1.075, 0.333, 0.383, 0.217, -0.888, 1.795,
      1.014, 0.427, 0.008, 1.408, 1.279, 1.489,
    ],
    [
      0.012, 0.59, -0.056, -0.404, 1.014, 0.337, 0.471, 0.223, -0.911, 1.871,
      1.679, 0.16, 0.055, 1.463, 1.391, 1.662,
    ],
    [
      0.118, 0.564, -0.077, -0.316, 1.018, 0.335, 0.569, 0.231, -0.926, 1.652,
      1.776, 0.064, 0.159, 1.493, 1.187, 1.647,
    ],
    [
      0.266, 0.515, -0.062, -0.175, 1.085, 0.355, 0.834, 0.217, -2.952, 1.639,
      1.503, 0.197, 0.228, 1.457, 0.264, 1.349,
    ],
    [
      0.433, 0.368, -0.074, 0.01, 1.144, 0.383, 1.188, 0.235, -1.775, 1.626,
      1.233, 0.893, 0.284, 1.471, 0.396, 0.838,
    ],
    [
      0.508, 0.262, -0.085, 0.214, 1.212, 0.403, 1.447, 0.241, -0.542, 1.399,
      0.608, 1.057, -0.016, 1.471, 1.305, 0.829,
    ],
    [
      0.568, 0.066, -0.101, 0.425, 1.236, 0.435, 1.712, 0.24, -0.877, 1.411,
      0.886, 1.209, -0.381, 1.368, 1.444, 1.127,
    ],
    [
      0.58, -0.142, -0.141, 0.603, 1.155, 0.456, 2.019, 0.263, -0.977, 1.411,
      1.266, 1.751, -0.611, 0.889, 1.398, 1.002,
    ],
    [
      0.599, -0.383, -0.256, 0.7, 1.005, 0.457, 2.351, 0.222, -1.411, 1.361,
      1.423, 2.224, -0.762, 0.549, 1.5, 0.863,
    ],
    [
      0.381, -0.589, -0.143, 0.772, 0.824, 0.479, 2.812, 0.248, -2.081, 1.177,
      1.043, 2.596, -0.604, 0.595, 1.72, 0.582,
    ],
    [
      0.724, -0.756, 0.01, 0.852, 0.626, 0.568, 3.565, 0.267, -1.513, 2.013,
      0.092, 2.512, -0.326, 1.037, 1.778, 0.515,
    ],
    [
      1.305, -0.869, 0.136, 0.92, 0.382, 0.685, 4.507, 0.232, -1.254, 2.782,
      0.778, 2.109, 0.313, 1.529, 2.012, 0.526,
    ],
    [
      1.383, -1.119, 0.666, 0.981, 0.167, 0.728, 5.022, 0.262, -0.276, 2.793,
      1.025, 1.482, 0.911, 1.661, 2.147, 1.019,
    ],
    [
      1.281, -1.154, 0.7, 0.975, 0.092, 0.756, 4.647, 0.141, 0.108, 2.418,
      0.407, 1.218, 0.294, 0.603, 1.955, 1.18,
    ],
    [
      1.324, -1.153, 0.619, 0.951, 0.055, 0.742, 4.603, 0.135, 0.351, 2.603,
      0.136, 0.79, 0.511, 0.261, 1.58, 0.295,
    ],
  ];
function Ea(e) {
  return Math.atan2(Math.sin(e), Math.cos(e));
}
function Da(e) {
  return new Promise((t) => {
    new we().load(
      e,
      (e) => t(e),
      void 0,
      () => t(null),
    );
  });
}
var Oa = new T(0, 1, 0),
  ka = class {
    constructor(t) {
      (e(this, `d`, void 0),
        e(this, `t`, 0),
        e(this, `casterPose`, null),
        e(this, `targetPose`, null),
        e(this, `casterClip`, null),
        e(this, `targetClip`, null),
        e(this, `done`, !1),
        e(this, `v1`, new T()),
        e(this, `v2`, new T()),
        e(this, `v3`, new T()),
        (this.d = t));
    }
    advance(e, t) {
      this.t += e * (this.t < t ? Qe : 1);
      let n = this.d.clipTime();
      n !== null &&
        this.t < t &&
        Math.abs(n - this.t) < 1 &&
        (this.t += (n - this.t) * 0.08);
    }
    landSuperHit(e, t, n, r, i = $e) {
      let a = this.d.target;
      ((a.hp = Math.max(0, e - 100 * i)),
        a.hp <= 0
          ? a.knockOut(t, n, r)
          : ((a.attack = null),
            a.forceState(`knockdown`),
            (a.vx = t * n),
            (a.vy = r),
            (a.grounded = !1),
            (a.downFrames = 0)));
    }
    layFlat() {
      let e = this.d.target;
      ((e.vx = 0),
        (e.vy = 0),
        (e.y = 0),
        (e.grounded = !0),
        (e.stateFrames = 120),
        (e.downFrames = 8));
    }
    settleTarget(e) {
      let t = this.d.target;
      t.state === `frozen` && t.y > 0 && (t.y = Math.max(0, t.y - 5 * e));
    }
    targetChest(e) {
      return e.set(this.d.target.x, this.d.target.y + 1.25, 0);
    }
  };
function Aa() {
  let e = new c(),
    t = new c();
  e.add(t);
  let n = new x({
      color: 16765803,
      emissive: 16747024,
      emissiveIntensity: 0.75,
      metalness: 0.7,
      roughness: 0.3,
      side: 2,
    }),
    r = new x({
      color: 16773552,
      emissive: 16756784,
      emissiveIntensity: 1.15,
      metalness: 0.4,
      roughness: 0.3,
      side: 2,
    }),
    i = (e, n, r = 0, i = 0, a = 0) => {
      let o = new p(e, n);
      return (o.position.set(r, i, 0), (o.rotation.z = a), t.add(o), o);
    };
  (i(new w(1, 0.07, 10, 64), n),
    i(new w(0.82, 0.03, 8, 64), r),
    i(new w(0.42, 0.05, 8, 48), n),
    i(new Fe(0.2, 32), r));
  for (let e = 0; e < 16; e++) {
    let t = (e / 16) * Math.PI * 2;
    i(
      new C(0.04, 0.6, 0.03),
      n,
      Math.cos(t) * 0.62,
      Math.sin(t) * 0.62,
      t - Math.PI / 2,
    );
  }
  let a = new de(0.1, 0.32, 4);
  for (let e = 0; e < 32; e++) {
    let t = (e / 32) * Math.PI * 2;
    i(
      a,
      r,
      Math.cos(t) * 1.15,
      Math.sin(t) * 1.15,
      t - Math.PI / 2 - 0.5,
    ).scale.set(1, 1, 0.35);
  }
  let o = new p(
    new m(0.25, 1.3, 64),
    new g({
      color: 16756800,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
      side: 2,
    }),
  );
  e.add(o);
  let s = nt(16751136, 3.4, 0.4);
  e.add(s);
  let l = nt(16769162, 1.2, 0.55);
  e.add(l);
  let u = new ne(16752704, 0, 9, 2);
  return (
    e.add(u),
    { root: e, spinner: t, light: u, glow: s, halo: l, blur: o }
  );
}
var ja = class t extends ka {
  constructor(n) {
    (super(n),
      e(this, `GROW_START`, 0.25),
      e(this, `WIND`, 7.6),
      e(this, `IMPACT`, 8.6),
      e(this, `RETURN_END`, 9.7),
      e(this, `END`, 10.8),
      e(this, `FLOAT_H`, 1.9),
      e(this, `MAX_SCALE`, 1.4),
      e(this, `chakra`, Aa()),
      e(this, `impactDone`, !1),
      e(this, `released`, !1),
      e(this, `throwFrom`, new T()),
      e(this, `impactPoint`, new T()),
      e(this, `scale`, 0.001),
      e(this, `sparkAcc`, 0),
      e(this, `spinQuat`, new h()),
      n.scene.add(this.chakra.root),
      this.chakra.root.scale.setScalar(0.001),
      n.audio.charge(t.RELEASE / Qe, `chakra`),
      n.audio.startSuperBed(t.RELEASE / Qe, `chakra`));
  }
  floatPose(e, t = 1) {
    let n = this.d.caster.char.id,
      r = Math.sin(e * 2.2) * 0.05;
    return M(R(e, n), {
      rootY: 0,
      rootZ: 0,
      hipsT: 0,
      spineT: 0.05,
      spineF: -0.05 + r,
      spineS: 0.04,
      headF: -0.35 * t,
      headT: 0.35,
      rShF: 0.2 + 2.85 * t,
      rShO: 0.12,
      rShT: 0,
      rEl: 0.08,
      rHand: 1,
      lShF: 0.25,
      lShO: 0.55,
      lShT: 0.4,
      lEl: 0.35,
      lHand: 1,
      lThF: 0.12,
      lThO: 0.04,
      lKn: 0.3,
      lAnk: 0.7,
      rThF: 0.22,
      rThO: 0.04,
      rKn: 0.45,
      rAnk: 0.7,
    });
  }
  windPose(e) {
    return M(this.floatPose(e), {
      rShF: 2.7,
      rShO: 0.45,
      rShT: 0.5,
      rEl: 0.7,
      spineT: -0.45,
      spineF: -0.15,
      headT: 0.6,
      headF: -0.1,
    });
  }
  throwPose(e) {
    return M(this.floatPose(e, 0), {
      rShF: 1.5,
      rShO: -0.25,
      rEl: 0.05,
      rHand: 1,
      spineF: 0.35,
      spineT: 0.45,
      headF: 0.1,
      headT: 0.1,
      lShF: -0.3,
      lShO: 0.4,
    });
  }
  growScale(e) {
    if (e < this.GROW_START) return 0.001;
    let n = P((e - this.GROW_START) / (t.RELEASE - this.GROW_START));
    return 0.02 + (this.MAX_SCALE - 0.02) * n ** 1.2;
  }
  step(e) {
    let n = this.d,
      { RISE: r, RELEASE: i } = t;
    this.advance(e, i);
    let a = this.t,
      o = n.caster,
      s = o.facing;
    this.settleTarget(e);
    let c = this.IMPACT + 0.7;
    ((o.y =
      a < r
        ? this.FLOAT_H * I(a / r)
        : a < c
          ? this.FLOAT_H + Math.sin((a - r) * 2.4) * 0.06
          : Math.max(0, this.FLOAT_H * (1 - I((a - c) / 1)))),
      (this.casterPose =
        a < this.WIND
          ? this.floatPose(a)
          : a < i
            ? N(
                this.floatPose(a),
                this.windPose(a),
                F((a - this.WIND) / (i - this.WIND)),
              )
            : a < i + 0.2
              ? N(this.windPose(a), this.throwPose(a), F((a - i) / 0.2))
              : a < this.RETURN_END
                ? N(
                    this.throwPose(a),
                    this.floatPose(a),
                    I((a - this.IMPACT) / 0.8),
                  )
                : N(
                    this.floatPose(a),
                    R(a, o.char.id),
                    I((a - this.RETURN_END) / 0.9),
                  )),
      this.impactDone
        ? ((this.targetPose = null), n.target.update(Ur(), o.x))
        : (this.targetPose = M(z(a, n.target.char.id), {
            headF: -0.55 - Math.min(0.3, a * 0.05),
          })));
    let l = this.chakra,
      u = n.casterRig.handWorld(`r`, this.v1);
    a < i && (this.scale = this.growScale(a) * (1 + Math.sin(a * 9) * 0.015));
    let d = 3 + Math.min(a, i) * 3.2;
    l.spinner.rotation.z += d * e * s;
    let f = 0;
    if (a < i)
      (l.root.position.set(u.x, u.y + 0.06 + 0.1 * this.scale, u.z),
        this.throwFrom.copy(l.root.position));
    else if (a < this.IMPACT) {
      this.released ||
        ((this.released = !0),
        n.audio.superRelease(`chakra`),
        n.audio.whoosh(),
        n.cam.shake(0.12, 0.3));
      let e = I((a - i) / (this.IMPACT - i));
      (this.targetChest(this.v2),
        l.root.position.lerpVectors(this.throwFrom, this.v2, e),
        (l.root.position.y += Math.sin(e * Math.PI) * 0.5),
        (l.root.position.z += Math.sin(e * Math.PI) * 0.9),
        (f = -0.18 * s),
        n.fx.particles.emit(l.root.position, {
          count: 8,
          speed: 1.5,
          color: 16756784,
          life: 0.45,
          size: 0.55,
          drag: 2,
          jitter: 0.6,
        }));
    } else if (a < this.RETURN_END) {
      let e = I((a - this.IMPACT) / (this.RETURN_END - this.IMPACT));
      (this.v3.set(u.x, u.y + 0.2, u.z),
        l.root.position.lerpVectors(this.impactPoint, this.v3, e),
        (l.root.position.y += Math.sin(e * Math.PI) * 1.4),
        (l.root.position.z -= Math.sin(e * Math.PI) * 1.2),
        (this.scale = this.MAX_SCALE * (1 - e * 0.93)));
    } else this.scale = Math.max(0.001, this.scale - e * 0.6);
    (l.root.rotation.set(
      -Math.PI / 2 + Math.sin(a * 1.7) * 0.04,
      0,
      f + Math.cos(a * 1.3) * 0.04,
    ),
      l.root.scale.setScalar(this.scale));
    let p = Math.max(this.scale, 0.001);
    if (
      (l.glow.scale.setScalar(Math.max(0.45, 3.2 * p) / p),
      l.halo.scale.setScalar(Math.max(0.25, 1.2 * p) / p),
      (l.light.intensity = 1.5 + this.scale * 6 + Math.sin(a * 20) * 1.2),
      (l.glow.material.opacity = 0.32 + Math.sin(a * 13) * 0.1),
      (l.blur.material.opacity = P((d - 8) / 30) * 0.32),
      a > this.GROW_START && a < this.IMPACT)
    ) {
      for (
        this.sparkAcc += e * (15 + this.scale * 50),
          l.spinner.getWorldQuaternion(this.spinQuat);
        this.sparkAcc > 1;
      ) {
        --this.sparkAcc;
        let e = Math.random() * Math.PI * 2;
        (this.v2.set(Math.cos(e) * 1.15, Math.sin(e) * 1.15, 0),
          l.spinner.localToWorld(this.v2),
          this.v3
            .set(-Math.sin(e), Math.cos(e), 0)
            .applyQuaternion(this.spinQuat)
            .multiplyScalar(s),
          n.fx.particles.emit(this.v2, {
            count: 1,
            speed: 3 + this.scale * 3,
            color: 16760896,
            life: 0.35,
            size: 0.12 + this.scale * 0.08,
            drag: 2,
            dir: this.v3,
            spread: 0.25,
          }));
      }
      a < this.WIND &&
        Math.random() < 0.5 &&
        (this.v2.set(
          o.x + (Math.random() - 0.5) * 0.8,
          o.y + Math.random() * 1.6,
          (Math.random() - 0.5) * 0.6,
        ),
        n.fx.particles.emit(this.v2, {
          count: 1,
          speed: 1.2,
          color: 16747034,
          life: 0.9,
          size: 0.3,
          gravity: -2,
          dir: Oa,
          spread: 0.2,
        }));
    }
    (a > 0.6 &&
      a < r &&
      Math.random() < 0.3 &&
      n.fx.dust(this.v2.set(o.x, 0.05, 0), 0.3),
      !this.impactDone &&
        a >= this.IMPACT &&
        ((this.impactDone = !0),
        this.impactPoint.copy(l.root.position),
        this.landSuperHit(n.target.hp, s, 4.6, 8.5),
        n.fx.hitSpark(this.impactPoint, 2, !1, s),
        n.fx.particles.emit(this.impactPoint, {
          count: 160,
          speed: 11,
          color: 16756784,
          life: 0.9,
          size: 0.3,
          gravity: 4,
          drag: 1.8,
        }),
        n.fx.shockwave(this.impactPoint, 16760912, 0.6, 1.1, !0),
        n.fx.shockwave(this.v2.set(n.target.x, 0.03, 0), 16751136, 0.8, 1.6),
        n.flash(`rgba(255,210,120,0.9)`, 260),
        n.cam.shake(0.5, 0.7),
        n.audio.boom(),
        n.arena.cheer(1.5)));
    let m = l.root.position,
      h = this.v2,
      g = this.v3;
    if (a < r)
      (h.set(o.x, o.y + 1.7, 0),
        g.set(o.x + s * 2.4, 0.7 + o.y * 0.4, 4.4),
        n.cam.set(g, h, a < 0.2 ? 10 : 3, 40));
    else if (a < 5.2) {
      let e = 0.5 + (a - r) * 0.32;
      h.set(m.x, m.y - 1, 0);
      let t = 4.6 + this.scale * 1.2;
      (g.set(
        m.x + s * Math.sin(e) * t,
        m.y + 1.3 + this.scale * 0.6,
        Math.cos(e) * t,
      ),
        n.cam.set(g, h, 2.2, 42));
    } else if (a < this.WIND)
      (h.set(o.x + s * 0.8, m.y - 1.5, 0),
        g.set(o.x + s * 2, m.y + 2.6, 9),
        n.cam.set(g, h, 1.8, 44));
    else if (a < this.IMPACT + 0.4) {
      let e = (o.x + n.target.x) / 2;
      (h.set(e, 2.3, 0), g.set(e, 3.6, 10.5), n.cam.set(g, h, 3.5, 46));
    } else
      (h.set(n.target.x, 1, 0),
        g.set((n.target.x + o.x) / 2, 2.2, 7.5),
        n.cam.set(g, h, 2.5, 42));
    a >= this.END && ((o.y = 0), (this.done = !0));
  }
  dispose() {
    (this.d.audio.stopSuperBed(0.3),
      this.d.scene.remove(this.chakra.root),
      this.chakra.root.traverse((e) => {
        let t = e;
        t.geometry && t.geometry.dispose();
      }));
  }
};
(e(ja, `RISE`, 2), e(ja, `RELEASE`, 8));
var Ma,
  Na = 10112511,
  Pa = 4063098,
  B = (e, t = 0.6, n = {}) => new x({ color: e, roughness: t, ...n });
function Fa(e, t, n, r, a, o = 0, s = 0, c = 0, l = 16) {
  let u = new p(new i(1, l, Math.max(8, l * 0.75)), r);
  return (u.scale.set(e, t, n), u.position.set(o, s, c), a.add(u), u);
}
function Ia(e = 1) {
  let t = new c(),
    n = new p(new ge(0.045, 0.15, 4, 12), B(16053488, 0.8));
  ((n.rotation.x = Math.PI / 2), n.scale.set(1, 1, 0.28), t.add(n));
  let r = B(2781142, 0.5);
  for (let e of [1, -1]) {
    let n = new p(new w(0.05, 0.008, 6, 14, Math.PI), r);
    (n.position.set(e * 0.012, 0.012, 0.03),
      n.rotation.set(0, e * 0.6 + Math.PI / 2, 0),
      t.add(n));
  }
  return (t.scale.setScalar(e), t);
}
function La() {
  let e = new c(),
    t = [
      [0, 0],
      [0.15, 0.01],
      [0.25, 0.07],
      [0.31, 0.19],
      [0.3, 0.31],
      [0.23, 0.41],
      [0.17, 0.46],
      [0.185, 0.5],
      [0.2, 0.52],
      [0.18, 0.53],
    ].map(([e, t]) => new Ee(e, t)),
    n = B(1511957, 0.55, { metalness: 0.15, side: 2 });
  e.add(new p(new ye(t, 28), n));
  let r = new p(
    new w(0.305, 0.012, 6, 40),
    B(13214266, 0.4, { metalness: 0.6 }),
  );
  ((r.rotation.x = Math.PI / 2), (r.position.y = 0.25), e.add(r));
  let i = new p(
    new Fe(0.175, 24),
    B(1937210, 0.3, { emissive: Pa, emissiveIntensity: 1.1 }),
  );
  ((i.rotation.x = -Math.PI / 2), (i.position.y = 0.48), e.add(i));
  let a = nt(Pa, 1.4, 0.35);
  ((a.position.y = 0.62), e.add(a));
  let o = new ne(Pa, 0, 5, 2);
  ((o.position.y = 0.8), e.add(o));
  for (let t = 0; t < 3; t++) {
    let n = (t / 3) * Math.PI * 2 + 0.4;
    Fa(
      0.07,
      0.05,
      0.07,
      B(4867136, 0.95),
      e,
      Math.cos(n) * 0.24,
      0.02,
      Math.sin(n) * 0.24,
      8,
    );
  }
  return { root: e, liquid: i, light: o, glow: a };
}
function Ra() {
  let e = new c(),
    t = B(8014370, 0.75),
    n = new p(new E(0.014, 0.018, 1, 8), t);
  return (
    (n.position.y = -0.5),
    e.add(n),
    Fa(0.05, 0.03, 0.06, t, e, 0, -1, 0, 10),
    e
  );
}
var za = new T(0, 1, 0),
  Ba = new T(0, -1, 0),
  Va;
function Ha() {
  return (Va === void 0 && (Va = Ua()), Va);
}
function Ua() {
  if (typeof document > `u`) return null;
  let e = document.createElement(`canvas`);
  e.width = e.height = 512;
  let t = e.getContext(`2d`);
  if (!t) return null;
  (t.translate(256, 256),
    (t.strokeStyle = `#fff`),
    (t.fillStyle = `#fff`),
    (t.lineCap = `round`));
  let n = (e, n) => {
    ((t.lineWidth = n),
      t.beginPath(),
      t.arc(0, 0, e, 0, Math.PI * 2),
      t.stroke());
  };
  (n(245, 7), n(222, 3), n(150, 5), n(128, 2));
  for (let e = 0; e < 14; e++) {
    switch (
      (t.save(),
      t.rotate((e / 14) * Math.PI * 2),
      t.translate(0, -186),
      (t.lineWidth = 4),
      t.beginPath(),
      e % 4)
    ) {
      case 0:
        (t.arc(0, 0, 16, 0.4, Math.PI * 2 - 0.4),
          t.arc(7, 0, 12, Math.PI * 2 - 0.6, 0.6, !0));
        break;
      case 1:
        for (let e = 0; e < Math.PI * 4; e += 0.2)
          t.lineTo(Math.cos(e) * e * 1.4, Math.sin(e) * e * 1.4);
        break;
      case 2:
        (t.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2),
          t.moveTo(5, 0),
          t.arc(0, 0, 5, 0, Math.PI * 2));
        break;
      default:
        (t.arc(0, 4, 12, 0, Math.PI * 2),
          t.moveTo(-3, -10),
          t.arc(-7, -10, 4, 0, Math.PI * 2),
          t.moveTo(11, -10),
          t.arc(7, -10, 4, 0, Math.PI * 2));
    }
    (t.stroke(), t.restore());
  }
  ((t.lineWidth = 3), t.beginPath());
  for (let e = 0; e <= 3; e++) {
    let n = (e / 3) * Math.PI * 2 - Math.PI / 2;
    t.lineTo(Math.cos(n) * 128, Math.sin(n) * 128);
  }
  t.stroke();
  for (let e = 0; e < 3; e++) {
    let n = (e / 3) * Math.PI * 2 + Math.PI / 2;
    (t.beginPath(),
      t.arc(Math.cos(n) * 128, Math.sin(n) * 128, 10, 0, Math.PI * 2),
      t.fill());
  }
  let r = new _e(e);
  return ((r.colorSpace = oe), r);
}
function Wa(e, t = 0) {
  return new g({
    color: e,
    transparent: !0,
    opacity: t,
    blending: 2,
    depthWrite: !1,
    side: 2,
  });
}
function Ga() {
  let e = new c(),
    t = B(1312799, 0.9, {
      emissive: 2755141,
      emissiveIntensity: 0.6,
      transparent: !0,
      opacity: 0.92,
    });
  Fa(0.11, 0.13, 0.1, t, e, 0, 0, 0, 12);
  let n = new p(new de(0.07, 0.28, 8), t);
  ((n.position.y = -0.2), (n.rotation.x = Math.PI), e.add(n));
  let r = new g({ color: 16769357 });
  for (let t of [1, -1]) Fa(0.022, 0.03, 0.01, r, e, t * 0.04, 0.03, 0.095, 8);
  return e;
}
function Ka(e, t) {
  let n = new c(),
    r = new c();
  n.add(r);
  let i = B(5025594, 0.45),
    a = B(13166240, 0.6);
  (Fa(0.26, 0.19, 0.24, i, r, 0, 0.19, 0, 20),
    Fa(0.19, 0.12, 0.12, a, r, 0, 0.15, 0.13, 16));
  for (let e of [1, -1])
    (Fa(0.11, 0.08, 0.17, i, r, e * 0.21, 0.08, -0.05, 12),
      Fa(0.09, 0.025, 0.12, i, r, e * 0.25, 0.015, 0.08, 10),
      Fa(0.035, 0.09, 0.035, i, r, e * 0.13, 0.08, 0.18, 8),
      Fa(0.08, 0.08, 0.08, i, r, e * 0.12, 0.38, 0.06, 14),
      Fa(0.06, 0.06, 0.04, B(16777215, 0.3), r, e * 0.12, 0.39, 0.115, 12),
      Fa(0.028, 0.034, 0.02, B(1118481, 0.2), r, e * 0.12, 0.39, 0.15, 8));
  let o = new p(new w(0.15, 0.008, 6, 20, Math.PI * 0.8), B(1985815, 0.6));
  (o.position.set(0, 0.25, 0.165),
    o.rotation.set(0.3, 0, Math.PI * 1.1),
    r.add(o));
  let s = Fa(0.1, 0.07, 0.08, B(15265968, 0.4), r, 0, 0.13, 0.19, 14);
  if (e !== null) {
    let t = Fa(0.09, 0.07, 0.05, B(e, 0.95), r, 0, 0.12, 0.21, 12);
    t.renderOrder = 1;
  }
  if (t) {
    let e = B(13216090, 0.3, { metalness: 0.8 });
    for (let t of [1, -1]) {
      let n = new p(new w(0.06, 0.008, 6, 20), e);
      (n.position.set(t * 0.12, 0.39, 0.16), r.add(n));
    }
  }
  return { root: n, body: r, sac: s };
}
var qa = class t extends ka {
  constructor(n) {
    (super(n),
      e(this, `root`, new c()),
      e(this, `pot`, La()),
      e(this, `ladle`, Ra()),
      e(this, `circle`, void 0),
      e(this, `innerRing`, void 0),
      e(this, `circleLight`, new ne(Na, 0, 6, 2)),
      e(this, `imps`, []),
      e(this, `tosses`, []),
      e(this, `handChain`, []),
      e(this, `smokeHand`, new c()),
      e(this, `fingers`, []),
      e(this, `smokeMat`, void 0),
      e(this, `frog`, void 0),
      e(this, `bolt`, null),
      e(this, `boltLife`, 0),
      e(this, `syllables`, void 0),
      e(this, `nextSyl`, 0),
      e(this, `lastSylAt`, -10),
      e(this, `potPos`, new T()),
      e(this, `potTop`, new T()),
      e(this, `tangent`, new T()),
      e(this, `circlePos`, new T()),
      e(this, `boiled`, !1),
      e(this, `poofed`, !1),
      e(this, `unpoofed`, !1),
      e(this, `panicked`, !1),
      e(this, `croaks`, 0),
      e(this, `curve`, new d(new T(), new T(), new T())));
    let r = n.caster.facing;
    (n.scene.add(this.root),
      this.potPos.set(n.caster.x + r * 0.62, 0, 0.18),
      this.pot.root.position.copy(this.potPos),
      this.pot.root.scale.setScalar(0.001),
      this.root.add(this.pot.root, this.ladle),
      (this.ladle.visible = !1),
      this.circlePos.set(n.target.x, 0.025, 0));
    let i = Ha(),
      a = Wa(Na);
    (i && (a.map = i),
      (this.circle = new p(new Fe(1.25, 48), a)),
      (this.circle.rotation.x = -Math.PI / 2),
      this.circle.position.copy(this.circlePos),
      (this.innerRing = new p(new m(0.55, 0.64, 48), Wa(Pa))),
      (this.innerRing.rotation.x = -Math.PI / 2),
      this.innerRing.position.copy(this.circlePos).setY(0.03),
      this.circleLight.position.set(this.circlePos.x, 0.6, 0.4),
      this.root.add(this.circle, this.innerRing, this.circleLight));
    for (let e = 0; e < 5; e++) {
      let t = Ga();
      ((t.visible = !1),
        this.root.add(t),
        this.imps.push({
          g: t,
          phase: (e / 5) * Math.PI * 2,
          radius: 0.75 + (e % 2) * 0.2,
          height: 0.9 + (e % 3) * 0.35,
        }));
    }
    let o = Fa(0.07, 0.065, 0.07, B(16512742, 0.25), new c(), 0, 0, 0, 14),
      s = new p(new C(0.16, 0.005, 0.22), B(15921126, 0.9)),
      l = [
        [`CHAPPAL!`, Ia(1.4)],
        [`ROSOGOLLA!`, o],
        [`BALLOT PAPER!`, s],
      ];
    (t.TOSS_AT.forEach((e, t) => {
      let [n, r] = l[t];
      ((r.visible = !1),
        this.root.add(r),
        this.tosses.push({
          at: e,
          name: n,
          obj: r,
          from: new T(),
          landed: !1,
        }));
    }),
      (this.smokeMat = B(2755136, 0.9, {
        emissive: 8006911,
        emissiveIntensity: 0.55,
        transparent: !0,
        opacity: 0.88,
      })));
    for (let e = 0; e < 18; e++) {
      let e = Fa(1, 1, 1, this.smokeMat, this.root, 0, 0, 0, 12);
      ((e.visible = !1), this.handChain.push(e));
    }
    Fa(0.17, 0.06, 0.19, this.smokeMat, this.smokeHand, 0, 0, 0, 14);
    for (let e = 0; e < 5; e++) {
      let t = e === 4,
        n = new c();
      (n.position.set(t ? -0.16 : -0.11 + e * 0.075, 0, t ? 0.02 : 0.16),
        t && (n.rotation.y = -0.9));
      let r = new p(new ge(0.03, t ? 0.1 : 0.15, 4, 8), this.smokeMat);
      ((r.rotation.x = Math.PI / 2),
        (r.position.z = t ? 0.07 : 0.1),
        n.add(r),
        this.smokeHand.add(n),
        this.fingers.push(n));
    }
    ((this.smokeHand.visible = !1), this.root.add(this.smokeHand));
    let u = n.target.char.look;
    ((this.frog = Ka(u.beardStyle === `none` ? null : u.beard, u.glasses)),
      (this.frog.root.visible = !1),
      this.root.add(this.frog.root),
      (this.syllables = Mr(t.BOIL - t.CHANT_START)),
      n.audio.startSuperBed(t.BOIL / Qe, `jadu`),
      n.audio.whoosh());
  }
  invokePose(e) {
    let t = Math.sin(e * 14) * 0.08;
    return M(R(e, `didi`), {
      rootY: -0.02,
      ...L(-0.02, 0.16, -0.2),
      hipsT: 0,
      spineT: 0,
      spineF: -0.2,
      headF: -0.35,
      headT: 0.35,
      rShF: 2.45 + t,
      rShO: 0.45,
      rEl: 0.5,
      rHand: 1,
      lShF: 2.45 - t,
      lShO: 0.45,
      lEl: 0.5,
      lHand: 1,
    });
  }
  stirPose(e) {
    let n = e * 4 + e * e * 0.45,
      r = Math.exp(-(e - this.lastSylAt) * 9),
      i = Math.sin(e * 22),
      a = M(R(e, `didi`), {
        rootY: -0.1,
        ...L(-0.1, 0.22, -0.24),
        hipsT: 0.15,
        spineT: 0.1,
        spineF: 0.26 + r * 0.06,
        spineS: 0,
        headF: 0.12 - r * 0.25,
        headT: 0.25,
        rShF: 0.8 + 0.18 * Math.sin(n),
        rShO: 0.15 + 0.2 * Math.cos(n),
        rShT: 0.2,
        rEl: 0.55 + 0.15 * Math.sin(n),
        rHand: 0,
        lShF: 1.75 + i * 0.08,
        lShO: 0.45,
        lShT: 0.3,
        lEl: 0.7,
        lHand: 1,
      });
    for (let n of t.TOSS_AT) {
      let t = (e - (n - 0.35)) / 0.45;
      if (t > 0 && t < 1) {
        let e = Math.sin(t * Math.PI);
        ((a.lShF = Ja(a.lShF, t < 0.5 ? -0.3 : 1.9, e)),
          (a.lEl = Ja(a.lEl, 0.25, e)),
          (a.lHand = t < 0.6 ? 0 : 1));
      }
    }
    return a;
  }
  commandPose(e) {
    let t = Math.sin(e * 40) * 0.03;
    return M(R(e, `didi`), {
      rootY: -0.12,
      ...L(-0.12, 0.38, -0.32),
      hipsT: 0,
      spineT: 0,
      spineF: 0.2,
      headF: 0,
      headT: 0.2,
      rShF: 1.55 + t,
      rShO: 0.08,
      rEl: 0.1,
      rHand: 1,
      lShF: 1.55 - t,
      lShO: 0.08,
      lEl: 0.1,
      lHand: 1,
    });
  }
  laughPose(e) {
    let t = Math.sin(e * 26) * 0.05;
    return M(R(e, `didi`), {
      rootY: -0.03,
      ...L(-0.03, 0.12, -0.14),
      hipsT: 0.1,
      spineT: 0.1,
      spineF: -0.18 + t,
      headF: -0.32 + t * 1.5,
      headT: 0.3,
      lShF: -0.15,
      lShO: 0.55,
      lShT: -0.4,
      lEl: 1.75,
      lHand: 0,
      rShF: -0.15,
      rShO: 0.55,
      rShT: -0.4,
      rEl: 1.75,
      rHand: 0,
    });
  }
  snapPose(e) {
    return M(this.laughPose(e), {
      spineF: 0.02,
      headF: -0.15,
      rShF: 1.25,
      rShO: 0.4,
      rShT: 0.6,
      rEl: 1.85,
      rHand: 0.5,
    });
  }
  panicPose(e, t) {
    let n = Math.sin(e * 30) * 0.12 * t;
    return M(z(e, this.d.target.char.id), {
      spineF: -0.15 - t * 0.1,
      headF: -0.4 + n,
      headT: 0.2,
      lShF: 0.8 + t * 1.4 + n,
      lShO: 0.5,
      lEl: 1.2,
      lHand: 1,
      rShF: 0.8 + t * 1.4 - n,
      rShO: 0.5,
      rEl: 1.2,
      rHand: 1,
    });
  }
  grabbedPose(e) {
    let t = Math.sin(e * 24);
    return M(z(e, this.d.target.char.id), {
      rootY: 0,
      spineF: 0.15,
      headF: -0.3,
      lShF: 2.3 + t * 0.4,
      lShO: 0.7,
      lEl: 0.5,
      lHand: 1,
      rShF: 2.2 - t * 0.4,
      rShO: 0.7,
      rEl: 0.5,
      rHand: 1,
      lThF: 0.5 + t * 0.3,
      lKn: 0.8,
      rThF: 0.2 - t * 0.3,
      rKn: 0.6,
      lAnk: 0.3,
      rAnk: 0.3,
    });
  }
  step(e) {
    let n = this.d,
      { BOIL: r, GRAB: i, POOF: a, UNPOOF: o, END: s } = t,
      c = this.t;
    this.advance(e, r);
    let l = this.t,
      u = n.caster,
      d = n.target,
      f = u.facing,
      p = this.potTop.copy(this.potPos).setY(0.55);
    (l > 0.15 && c <= 0.15 && n.speech(`caster`, `Jadu hobe!`),
      (this.casterPose =
        l < 0.6
          ? N(R(l, `didi`), this.invokePose(l), F(l / 0.3))
          : l < r
            ? N(this.invokePose(l), this.stirPose(l), I((l - 0.6) / 0.35))
            : l < a + 0.15
              ? N(this.stirPose(l), this.commandPose(l), F((l - r) / 0.18))
              : l < o
                ? N(
                    this.commandPose(l),
                    this.laughPose(l),
                    I((l - a - 0.15) / 0.3),
                  )
                : l < o + 0.6
                  ? N(
                      this.laughPose(l),
                      this.snapPose(l),
                      F((l - o + 0.25) / 0.25),
                    )
                  : N(this.snapPose(l), R(l, `didi`), I((l - o - 0.6) / 0.5))),
      l < r
        ? ((this.targetPose = this.panicPose(l, P((l - 1) / 3))),
          this.settleTarget(e),
          !this.panicked &&
            l > 3.6 &&
            ((this.panicked = !0),
            n.speech(
              `target`,
              d.char.id === `modi`
                ? `Yeh kaun sa jadu hai?!`
                : d.char.id === `trump`
                  ? `Witch hunt! Total witch hunt!`
                  : d.char.id === `yogi`
                    ? `Yeh kaisa jadu-tona hai?!`
                    : `Bhai, yeh toh jadu hai!`,
            )))
        : l < a
          ? ((this.targetPose = this.grabbedPose(l)),
            (d.y = 0.45 * F((l - i + 0.3) / 0.3)))
          : l < o
            ? ((d.y = 0), (this.targetPose = z(l, d.char.id)))
            : ((this.targetPose = null), d.update(Ur(), u.x)),
      this.stepPot(l, c, p),
      this.stepChantText(l),
      this.stepTosses(l, p),
      this.stepCircle(l, e),
      this.stepHand(l, p),
      this.stepFrog(l, e),
      this.stepBolt(e),
      !this.boiled &&
        l >= r &&
        ((this.boiled = !0),
        n.audio.superRelease(`jadu`),
        n.audio.thunder(),
        n.flash(`rgba(140,255,170,0.85)`, 240),
        n.cam.shake(0.35, 0.6),
        n.fx.particles.emit(p, {
          count: 120,
          speed: 6,
          color: Pa,
          life: 0.9,
          size: 0.3,
          gravity: 3,
          drag: 1.5,
          dir: za,
          spread: 0.6,
        }),
        n.fx.particles.emit(p, {
          count: 60,
          speed: 3,
          color: Na,
          life: 1.4,
          size: 0.6,
          gravity: -1,
          drag: 2,
        }),
        n.fx.shockwave(this.v1.copy(this.potPos).setY(0.05), Pa, 0.6, 1.4),
        n.popup(`HUMBAAA!`, this.v1.set(this.potPos.x, 2.3, 0.3), `#3dff7a`),
        this.strikeBolt(),
        n.arena.cheer(1.2)),
      !this.poofed &&
        l >= a &&
        ((this.poofed = !0),
        (n.targetRig.root.visible = !1),
        (this.frog.root.visible = !0),
        this.frog.root.position.set(d.x, 0, 0.1),
        (this.frog.root.rotation.y = f > 0 ? -0.35 : 0.35),
        this.poofCloud(this.v1.set(d.x, 0.9, 0)),
        n.popup(`POOF!`, this.v1.set(d.x, 1.9, 0.3), `#c99bff`),
        n.arena.cheer(1.5)),
      !this.unpoofed &&
        l >= o &&
        ((this.unpoofed = !0),
        (n.targetRig.root.visible = !0),
        (this.frog.root.visible = !1),
        this.poofCloud(this.v1.set(d.x, 0.9, 0)),
        this.landSuperHit(d.hp, f, 3.2, 6.5),
        n.audio.thud(),
        n.cam.shake(0.25, 0.4),
        n.speech(`caster`, `Jadu hoye gelo!`)),
      l >= o + 0.35 && c < o + 0.35 && n.audio.snap(),
      this.stepCamera(l),
      l >= s && ((u.y = 0), (this.done = !0)));
  }
  poofCloud(e) {
    let t = this.d;
    (t.audio.poof(),
      t.fx.particles.emit(e, {
        count: 60,
        speed: 3.4,
        color: 9064408,
        life: 0.75,
        size: 0.45,
        gravity: -0.8,
        drag: 2.6,
        jitter: 0.5,
      }),
      t.fx.particles.emit(e, {
        count: 12,
        speed: 2.4,
        color: 16777215,
        life: 0.4,
        size: 0.2,
        gravity: -0.5,
        drag: 3,
        jitter: 0.4,
      }),
      t.flash(`rgba(200,150,255,0.45)`, 140));
  }
  stepPot(e, n, r) {
    let i = this.d,
      { BOIL: a, POOF: o, END: s } = t,
      c = this.pot,
      l = F(P((e - 0.25) / 0.45));
    (e > s - 0.9 && (l *= 1 - I((e - (s - 0.9)) / 0.7)),
      c.root.scale.setScalar(Math.max(0.001, l)));
    let u = P((e - 0.7) / (a - 0.7));
    if (
      ((c.root.rotation.z = Math.sin(e * 30) * 0.03 * u * (e < o ? 1 : 0.2)),
      (c.light.intensity = (0.4 + u * 0.8 + Math.sin(e * 17) * 0.15) * l),
      (c.glow.material.opacity = (0.15 + u * 0.2) * l),
      e > 0.2 &&
        n <= 0.2 &&
        (i.fx.particles.emit(this.v1.copy(this.potPos).setY(0.3), {
          count: 40,
          speed: 2,
          color: Na,
          life: 0.9,
          size: 0.5,
          gravity: -1,
          drag: 2.5,
        }),
        i.audio.poof()),
      l > 0.5 &&
        e < s - 1 &&
        Math.random() < 0.35 + u * 0.6 &&
        (this.v1.set(
          r.x + (Math.random() - 0.5) * 0.25,
          r.y,
          r.z + (Math.random() - 0.5) * 0.25,
        ),
        i.fx.particles.emit(this.v1, {
          count: 1,
          speed: 0.6 + u,
          color: Math.random() < 0.7 ? Pa : Na,
          life: 0.7,
          size: 0.12 + Math.random() * 0.12,
          gravity: -1.5,
          drag: 1.5,
          dir: za,
          spread: 0.4,
        })),
      e < a && Math.random() < 0.25)
    ) {
      let e = i.caster;
      (this.v1.set(
        e.x + (Math.random() - 0.5) * 1.2,
        0.05,
        (Math.random() - 0.5) * 0.8,
      ),
        i.fx.particles.emit(this.v1, {
          count: 1,
          speed: 0.4,
          color: 5906330,
          life: 1.6,
          size: 0.55,
          gravity: -0.6,
          drag: 1.2,
        }));
    }
    let d = e > 0.7 && e < a;
    if (((this.ladle.visible = d && l > 0.9), this.ladle.visible)) {
      let t = i.casterRig.handWorld(`r`, this.v1),
        n = e * 4 + e * e * 0.45;
      this.v2.set(
        r.x + Math.cos(n) * 0.08,
        r.y - 0.05,
        r.z + Math.sin(n) * 0.08,
      );
      let a = this.v2.sub(t),
        o = a.length();
      (this.ladle.position.copy(t),
        this.ladle.quaternion.setFromUnitVectors(Ba, a.normalize()),
        this.ladle.scale.set(1, Math.max(0.3, o), 1));
    }
  }
  stepChantText(e) {
    let n = this.d,
      { CHANT_START: r } = t;
    for (
      ;
      this.nextSyl < this.syllables.length &&
      e >= r + this.syllables[this.nextSyl].t;
    ) {
      let e = this.syllables[this.nextSyl];
      if (((this.lastSylAt = r + e.t), e.syl === `HUM`)) {
        let t = (this.nextSyl / 2) % 2 == 0 ? -1 : 1;
        (this.v1.set(
          this.potPos.x + t * (0.5 + e.k * 0.4),
          1.35 + e.k * 0.4 + Math.random() * 0.15,
          0.3,
        ),
          n.popup(
            e.k > 0.7 ? `HUMBA HUMBA!` : `HUMBA!`,
            this.v1,
            t < 0 ? `#c99bff` : `#3dff7a`,
          ));
      }
      this.nextSyl++;
    }
  }
  stepTosses(e, n) {
    let r = this.d,
      i = t.TOSS_DUR;
    for (let t of this.tosses) {
      let a = (e - t.at) / i;
      a < 0 ||
        t.landed ||
        (t.obj.visible ||
          ((t.obj.visible = !0),
          r.casterRig.handWorld(`l`, t.from),
          r.popup(t.name, this.v1.set(this.potPos.x, 1.25, 0.3), `#ffe14d`),
          r.audio.whoosh()),
        a >= 1
          ? ((t.landed = !0),
            (t.obj.visible = !1),
            r.audio.plop(),
            r.fx.particles.emit(n, {
              count: 30,
              speed: 3,
              color: Pa,
              life: 0.6,
              size: 0.18,
              gravity: 7,
              drag: 1,
              dir: za,
              spread: 0.7,
            }),
            r.fx.particles.emit(n, {
              count: 10,
              speed: 1,
              color: Na,
              life: 1,
              size: 0.4,
              gravity: -1,
              drag: 2,
            }))
          : (t.obj.position.lerpVectors(t.from, n, a),
            (t.obj.position.y += Math.sin(a * Math.PI) * 0.9),
            t.obj.rotation.set(a * 9, a * 5, a * 3)));
    }
  }
  stepCircle(e, n) {
    let r = this.d,
      { BOIL: i, POOF: a, UNPOOF: o } = t,
      s = r.target;
    this.circlePos.x = s.x;
    let c = F(P((e - 0.9) / 1.2)),
      l = e < o ? 1 : 1 - P((e - o) / 0.5),
      u = Math.exp(-(e - this.lastSylAt) * 6),
      d = P((e - 0.9) / (i - 0.9));
    ((this.circle.position.x =
      this.innerRing.position.x =
      this.circleLight.position.x =
        s.x),
      this.circle.scale.setScalar(Math.max(0.001, c * (1 + u * 0.04))),
      (this.circle.rotation.z += n * (0.4 + d * 2.5)),
      (this.innerRing.rotation.z -= n * (1 + d * 4)),
      this.innerRing.scale.setScalar(Math.max(0.001, c)),
      (this.circle.material.opacity = (0.35 + d * 0.45 + u * 0.2) * l * c),
      (this.innerRing.material.opacity = (0.25 + d * 0.5) * l * c));
    let f = P((e - 2.6) / 1.6) * +(e < i);
    if (f > 0 && Math.random() < f * 0.9) {
      let e = Math.random() * Math.PI * 2;
      (this.v1.set(s.x + Math.cos(e) * 1.1, 0.05, Math.sin(e) * 0.9),
        r.fx.particles.emit(this.v1, {
          count: 1,
          speed: 1.6 + f,
          color: Math.random() < 0.6 ? Na : Pa,
          life: 1,
          size: 0.14,
          gravity: -2.5,
          drag: 0.6,
          dir: za,
          spread: 0.1,
        }));
    }
    let p = +(e < a);
    this.circleLight.intensity = (d * 1.4 + u * 0.5) * l * c * p;
    for (let t of this.imps) {
      let n = e > 2 + t.phase * 0.1 && e < a;
      if (((t.g.visible = n), !n)) continue;
      let i = t.phase + e * (1.2 + d * 3.5);
      (t.g.position.set(
        s.x + Math.cos(i) * t.radius,
        t.height + Math.sin(e * 5 + t.phase) * 0.12,
        Math.sin(i) * t.radius * 0.8,
      ),
        (t.g.rotation.y = -i));
      let o = F(P((e - 2 - t.phase * 0.1) / 0.3));
      (t.g.scale.setScalar(Math.max(0.001, o)),
        Math.random() < 0.15 &&
          r.fx.particles.emit(t.g.position, {
            count: 1,
            speed: 0.2,
            color: 2755141,
            life: 0.5,
            size: 0.2,
            drag: 3,
          }));
    }
  }
  stepHand(e, n) {
    let r = this.d,
      { BOIL: i, GRAB: a, POOF: o } = t,
      s = e >= i && e < o + 0.5;
    this.smokeHand.visible = s;
    for (let e of this.handChain) e.visible = !1;
    if (!s) return;
    let c = r.target,
      l = F(P((e - i) / (a - i - 0.1))),
      u = P((e - o) / 0.5);
    this.smokeMat.opacity = 0.88 * (1 - u);
    let d = this.v1.set(c.x, c.y + 1.15, 0.05);
    (this.curve.v0.copy(n),
      this.curve.v1.set((n.x + d.x) / 2, 2.6, 0.4),
      this.curve.v2.copy(d));
    let f = this.handChain.length;
    for (let t = 0; t < f; t++) {
      let n = (t / f) * l,
        r = this.handChain[t];
      ((r.visible = !0), this.curve.getPoint(n, r.position));
      let i = (0.16 - (t / f) * 0.06) * (1 + Math.sin(e * 12 + t) * 0.1);
      r.scale.setScalar(i);
    }
    let p = this.curve.getPoint(l, this.v2);
    (this.smokeHand.position.copy(p),
      this.curve.getTangent(Math.max(0.01, l), this.tangent),
      this.smokeHand.lookAt(
        p.x + this.tangent.x,
        p.y + this.tangent.y,
        p.z + this.tangent.z,
      ),
      this.smokeHand.scale.setScalar(1.6));
    let m = e < a - 0.1 ? 0.15 : F(P((e - a + 0.1) / 0.12)) * 1.6;
    (this.fingers.forEach((e, t) => {
      e.rotation.x = t === 4 ? m * 0.6 : m;
    }),
      Math.random() < 0.6 &&
        r.fx.particles.emit(this.curve.getPoint(Math.random() * l, this.v3), {
          count: 1,
          speed: 0.4,
          color: Na,
          life: 0.6,
          size: 0.3,
          gravity: -0.5,
          drag: 2,
        }));
  }
  stepFrog(e, n) {
    let r = this.d,
      { POOF: i, UNPOOF: a } = t;
    if (!this.frog.root.visible) return;
    let o = e - i,
      s = o < 0.25 ? F(o / 0.25) * 1.15 : 1.15 - 0.15 * P((o - 0.25) / 0.15);
    this.frog.root.scale.setScalar(Math.max(0.001, s * 1.3));
    let c = [0.35, 0.85];
    for (let e = 0; e < c.length; e++)
      this.croaks === e &&
        o >= c[e] &&
        (this.croaks++,
        r.audio.frogCroak(),
        r.popup(
          `RIBBIT!`,
          this.v1.set(this.frog.root.position.x, 1, 0.3),
          `#7dff6a`,
        ),
        r.arena.cheer(0.6));
    let l = 1;
    for (let e of c) {
      let t = (o - e) / 0.4;
      t > 0 && t < 1 && (l = 1 + Math.sin(t * Math.PI) * 1.2);
    }
    this.frog.sac.scale.set(0.1 * l, 0.07 * l, 0.08 * l);
    let u = 0;
    for (let e of [0.6, 1.05]) {
      let t = (o - e) / 0.22;
      t > 0 && t < 1 && (u = Math.sin(t * Math.PI) * 0.22);
    }
    ((this.frog.body.position.y = u),
      this.frog.body.scale.set(1, 1 + u * 0.6, 1),
      u > 0.2 &&
        Math.random() < 0.5 &&
        r.fx.dust(this.v1.set(this.frog.root.position.x, 0.05, 0.1), 0.3),
      e > a - 0.05 && (this.frog.root.visible = !1));
  }
  strikeBolt() {
    let e = this.d.target,
      t = [],
      n = e.x + (Math.random() - 0.5) * 0.8;
    for (let e = 0; e <= 9; e++) {
      let r = 7 - (e / 9) * 6;
      (t.push(new T(n, r, -0.3 + (Math.random() - 0.5) * 0.3)),
        (n += (Math.random() - 0.5) * 0.6));
    }
    t[t.length - 1].set(e.x, 1, 0);
    let r = new ue(new ce(t, !1, `catmullrom`, 0.1), 40, 0.04, 6, !1);
    ((this.bolt = new p(r, Wa(15257855, 1))),
      this.root.add(this.bolt),
      (this.boltLife = 0.35));
  }
  stepBolt(e) {
    if (!this.bolt) return;
    this.boltLife -= e;
    let t = this.bolt.material;
    ((t.opacity =
      this.boltLife > 0
        ? (Math.random() < 0.7 ? 1 : 0.2) * Math.min(1, this.boltLife / 0.15)
        : 0),
      this.boltLife <= 0 &&
        (this.root.remove(this.bolt),
        this.bolt.geometry.dispose(),
        (this.bolt = null)));
  }
  stepCamera(e) {
    let n = this.d,
      { BOIL: r, POOF: i, UNPOOF: a } = t,
      o = n.caster,
      s = n.target,
      c = o.facing,
      l = this.v1,
      u = this.v2,
      d = (o.x + s.x) / 2;
    if (e < 0.7)
      (l.set(o.x, 1.25, 0),
        u.set(o.x + c * 1.1, 1.35, 2.5),
        n.cam.set(u, l, e < 0.15 ? 10 : 4, 38));
    else if (e < 2.4) {
      let t = (e - 0.7) / 1.7;
      (l.set(o.x + c * 0.35, 0.95, 0),
        u.set(o.x + c * (0.9 + t * 0.3), 1.45 - t * 0.15, 3.5 - t * 0.3),
        n.cam.set(u, l, 2.5, 40));
    } else
      e < 3.9
        ? (l.set(d, 0.9, 0),
          u.set(d - c * 0.4, 2.6, 6.3),
          n.cam.set(u, l, 2.2, 42))
        : e < r
          ? (l.set(o.x + c * 0.2, 1.1, 0),
            u.set(this.potPos.x - c * 0.15, 0.4, 2.3),
            n.cam.set(u, l, 3, 46))
          : e < i + 0.1
            ? (l.set(d, 1.2, 0), u.set(d, 2.1, 6.6), n.cam.set(u, l, 4, 44))
            : e < a
              ? (l.set(s.x, 0.4, 0),
                u.set(s.x + c * 0.25, 0.85, 2.7),
                n.cam.set(u, l, 4, 36))
              : (l.set((d + s.x) / 2, 0.9, 0),
                u.set(d, 1.9, 6.6),
                n.cam.set(u, l, 2.5, 42));
  }
  dispose() {
    let e = this.d;
    (e.audio.stopSuperBed(0.3),
      (e.targetRig.root.visible = !0),
      e.scene.remove(this.root),
      this.root.traverse((e) => {
        let t = e;
        t.geometry && t.geometry.dispose();
      }));
  }
};
((Ma = qa),
  e(qa, `CHANT_START`, 0.7),
  e(qa, `BOIL`, 6.45),
  e(qa, `GRAB`, Ma.BOIL + 0.55),
  e(qa, `POOF`, Ma.BOIL + 0.6),
  e(qa, `UNPOOF`, Ma.BOIL + 1.9),
  e(qa, `END`, Ma.BOIL + 3),
  e(qa, `TOSS_AT`, [1.9, 3.2, 4.5]),
  e(qa, `TOSS_DUR`, 0.55));
var Ja = (e, t, n) => e + (t - e) * n,
  Ya = new T(),
  Xa = new T(0, 1, 0),
  V = (e) => (e > 0 ? Math.PI / 2 : -Math.PI / 2);
function Za(e, t, n) {
  return [
    e * Math.cos(n) + t * Math.sin(n),
    -e * Math.sin(n) + t * Math.cos(n),
  ];
}
var Qa = class {
    constructor(t) {
      (e(this, `d`, void 0),
        e(this, `t`, 0),
        e(this, `done`, !1),
        e(this, `attPose`, null),
        e(this, `defPose`, null),
        e(this, `attClip`, null),
        e(this, `poseRate`, 18),
        e(this, `attTf`, null),
        e(this, `defTf`, null),
        e(this, `dir`, void 0),
        e(this, `ax`, void 0),
        e(this, `bx0`, void 0),
        e(this, `released`, !1),
        e(this, `v`, new T()),
        (this.d = t),
        (this.dir = t.attacker.facing),
        (this.ax = t.attacker.x),
        (this.bx0 = t.defender.x),
        (t.attacker.attack = null),
        (t.attacker.vx = 0),
        t.attacker.forceState(`super`),
        (t.defender.attack = null),
        (t.defender.vx = 0),
        (t.defender.vy = 0),
        t.defender.forceState(`frozen`));
    }
    afterVisuals() {}
    dispose() {
      this.d.attRig.wink(0);
    }
    damage(e) {
      let t = this.d.attacker,
        n = Math.round(e * t.char.damageMul),
        r = this.d.defender;
      return (
        (r.hp = Math.max(0, r.hp - n)),
        t.addMeter(Math.min(100, n * 0.9 + 2)),
        r.addMeter(n * 0.6),
        this.d.onImpact(n, !0),
        n
      );
    }
    stepDefenderPhysics() {
      this.released && this.d.defender.update(Ur(), this.d.attacker.x);
    }
  },
  $a = class extends Qa {
    constructor(...t) {
      (super(...t),
        e(this, `REACH`, 0.35),
        e(this, `SQUEEZE`, 0.75),
        e(this, `SPIN_END`, 2.15),
        e(this, `END`, 2.75),
        e(this, `SEP`, 0.5),
        e(this, `TURNS`, 2),
        e(this, `lastHalfTurn`, 0),
        e(this, `bubbled`, !1));
    }
    openArms(e) {
      return M(R(e, this.d.attacker.char.id), {
        rootY: -0.04,
        ...L(-0.04, 0.22, -0.26),
        hipsT: 0,
        spineT: 0,
        spineF: -0.05,
        headT: 0.35,
        headF: -0.1,
        lShF: 1.1,
        lShO: 1,
        lShT: 0.5,
        lEl: 0.3,
        lHand: 1,
        rShF: 1.1,
        rShO: 1,
        rShT: 0.5,
        rEl: 0.3,
        rHand: 1,
      });
    }
    hug(e, t) {
      return M(R(e, this.d.attacker.char.id), {
        rootY: -0.12,
        ...L(-0.12, 0.3, -0.32),
        hipsT: 0,
        spineT: 0,
        spineF: 0.1 - t * 0.35,
        chestF: -0.05,
        headT: 0.25,
        headF: -0.1 - t * 0.2,
        lShF: 1.35,
        lShO: -0.2,
        lShT: 0,
        lEl: 1.75,
        lHand: 1,
        rShF: 1.35,
        rShO: -0.2,
        rShT: 0,
        rEl: 1.75,
        rHand: 1,
      });
    }
    squeezed(e, t) {
      let n = Math.sin(e * 22);
      return M(z(e, this.d.defender.char.id), {
        rootY: 0,
        hipsT: 0,
        spineT: 0,
        spineF: -0.15 - t * 0.15,
        headF: -0.45,
        headT: 0.3,
        lShF: 0.3,
        lShO: 0.12,
        lEl: 0.8 + n * 0.5,
        lHand: 1,
        rShF: 0.3,
        rShO: 0.12,
        rEl: 0.8 - n * 0.5,
        rHand: 1,
        lThF: 0.15 - t * 0.7 + n * 0.25,
        lThO: 0.15 + t * 0.25,
        lKn: 0.5 + t * 0.4,
        lAnk: 0.5,
        rThF: 0.15 - t * 0.7 - n * 0.25,
        rThO: 0.15 + t * 0.25,
        rKn: 0.5 + t * 0.4,
        rAnk: 0.5,
      });
    }
    dizzy(e) {
      let t = Math.sin(e * 9);
      return M(R(e, this.d.attacker.char.id), {
        rootY: -0.06,
        spineS: t * 0.18,
        spineF: 0.1,
        headS: -t * 0.3,
        headF: 0.15,
        headT: 0.4,
        lShF: 0.4,
        lShO: 0.7 + t * 0.3,
        lEl: 0.4,
        lHand: 1,
        rShF: 0.4,
        rShO: 0.7 - t * 0.3,
        rEl: 0.4,
        rHand: 1,
      });
    }
    step(e) {
      let t = this.d;
      this.t += e;
      let n = this.t,
        r = t.attacker,
        i = t.defender,
        a = this.dir,
        o = this.ax + (a * this.SEP) / 2;
      if (n < this.SPIN_END) {
        let s = 0,
          c = 0,
          l = 0,
          u;
        if (n < this.REACH) {
          let e = F(n / this.REACH);
          ((u = this.bx0 + (this.ax + a * this.SEP - this.bx0) * e),
            (this.attPose = this.openArms(n)),
            (this.defPose = M(z(n, i.char.id), { headF: -0.3 })),
            !this.bubbled &&
              n > 0.05 &&
              ((this.bubbled = !0),
              t.speech(`attacker`, `Gale milo, mitron!`)));
        } else {
          u = this.ax + a * this.SEP;
          let r = P((n - this.REACH) / (this.SQUEEZE - this.REACH));
          c = I(P((n - this.REACH - 0.15) / 0.45));
          let i = P((n - this.SQUEEZE) / (this.SPIN_END - this.SQUEEZE));
          if (
            ((s = this.TURNS * Math.PI * 2 * I(i) * a),
            (l = Math.sin(i * Math.PI)),
            (this.attPose = N(this.openArms(n), this.hug(n, c), F(r * 2))),
            (this.defPose = this.squeezed(n, l)),
            r > 0 &&
              r < 1 &&
              Math.random() < 0.5 &&
              (this.v.set(o, 1.6 + Math.random() * 0.3, 0.2),
              t.fx.particles.emit(this.v, {
                count: 2,
                speed: 1.6,
                color: 16732067,
                life: 0.9,
                size: 0.35,
                gravity: -1.5,
                drag: 1.2,
              })),
            n - e < this.REACH + 0.05 && n >= this.REACH + 0.05)
          ) {
            for (let e = 0; e < 3; e++)
              (this.v.set(o + (e - 1) * 0.3, 2 + e * 0.1, 0.3),
                t.popup(`❤`, this.v, `#ff4fa3`));
            (t.audio.block(), t.arena.cheer(0.6));
          }
          let d = Math.floor(Math.abs(s) / Math.PI);
          (d > this.lastHalfTurn && ((this.lastHalfTurn = d), t.audio.whoosh()),
            l > 0.3 &&
              Math.random() < 0.4 &&
              t.fx.dust(this.v.set(o, 0.05, 0), 0.25));
        }
        let [d, f] = Za(this.ax - o, 0, s),
          [p, m] = Za(u - o, 0, s);
        ((this.attTf = { x: o + d, y: 0, z: f, yaw: V(a) + s, roll: 0 }),
          (this.defTf = {
            x: o + p,
            y: c * 0.38,
            z: m,
            yaw: V(-a) + s,
            roll: 0,
          }),
          (r.x = this.attTf.x),
          (i.x = this.defTf.x),
          (i.y = 0),
          this.v.set(o, 1.35, 0));
        let h = Math.sin(n * 1.4) * 0.6;
        t.cam.set(
          Ya.set(o + Math.sin(h) * 3.8, 1.75, Math.cos(h) * 3.8),
          this.v,
          3.5,
          40,
        );
        return;
      }
      (this.released ||
        ((this.released = !0),
        (r.x = this.ax),
        (i.x = this.ax + a * this.SEP),
        (i.y = 0.38),
        this.damage(16),
        i.hp <= 0
          ? i.knockOut(a, 6.5, 6)
          : (i.forceState(`knockdown`),
            (i.vx = a * 6.2),
            (i.vy = 5.5),
            (i.grounded = !1),
            (i.downFrames = 0)),
        (this.defTf = null),
        (this.defPose = null),
        t.audio.hit(1.2),
        t.cam.shake(0.25, 0.4),
        t.arena.cheer(1.2),
        this.v.set(i.x, 1.4, 0.3),
        t.fx.hitSpark(this.v, 1.3, !1, a),
        t.popup(
          r.char.moveNames.grab ?? `GRAB!`,
          this.v.set(o, 2.2, 0.3),
          r.char.accent,
        )),
        this.stepDefenderPhysics());
      let s =
        Math.sin(n * 7) *
        0.5 *
        (1 - P((n - this.SPIN_END) / (this.END - this.SPIN_END)));
      if (
        ((this.attPose = N(
          this.dizzy(n),
          R(n, r.char.id),
          I((n - this.SPIN_END - 0.35) / 0.25),
        )),
        (this.attTf = { x: this.ax, y: 0, z: 0, yaw: V(a) + s, roll: 0 }),
        Math.random() < 0.25)
      ) {
        let e = n * 8;
        (this.v.set(this.ax + Math.cos(e) * 0.25, 2.25, Math.sin(e) * 0.25),
          t.fx.particles.emit(this.v, {
            count: 1,
            speed: 0.1,
            color: 16769357,
            life: 0.4,
            size: 0.18,
            drag: 4,
          }));
      }
      let c = (r.x + i.x) / 2;
      (t.cam.set(Ya.set(c, 1.8, 6.2), this.v.set(c, 1, 0), 3, 42),
        n >= this.END && ((this.attTf = null), (this.done = !0)));
    }
  },
  eo = class extends Qa {
    constructor(...t) {
      (super(...t),
        e(this, `GRAB`, 0.3),
        e(this, `PIVOT`, 0.72),
        e(this, `THROW`, 1.3),
        e(this, `END`, 1.75),
        e(this, `clicked`, !1));
    }
    reach(e) {
      return M(R(e, this.d.attacker.char.id), {
        rootY: -0.1,
        ...L(-0.1, 0.36, -0.3),
        hipsT: -0.2,
        spineF: 0.15,
        lShF: 1.45,
        lShO: -0.05,
        lEl: 0.25,
        lHand: 1,
        rShF: 1.2,
        rShO: 0.1,
        rEl: 0.9,
        rHand: 1,
      });
    }
    pivot(e) {
      return M(R(e, this.d.attacker.char.id), {
        rootY: -0.32,
        ...L(-0.32, 0.3, -0.34),
        hipsT: 0,
        spineT: 0,
        spineF: 0.25,
        headT: 0.6,
        headF: -0.1,
        lShF: 2.5,
        lShO: -0.1,
        lEl: 1.3,
        lHand: 0,
        rShF: 2.3,
        rShO: -0.1,
        rEl: 1.5,
        rHand: 0,
      });
    }
    heave(e) {
      return M(R(e, this.d.attacker.char.id), {
        rootY: -0.38,
        ...L(-0.38, 0.34, -0.4),
        hipsT: 0,
        spineT: 0,
        spineF: 0.95,
        headT: 0.3,
        headF: 0.2,
        lShF: 0.7,
        lShO: -0.1,
        lEl: 0.5,
        lHand: 0,
        rShF: 0.6,
        rShO: -0.1,
        rEl: 0.6,
        rHand: 0,
      });
    }
    pulled(e, t) {
      return M(z(e, this.d.defender.char.id), {
        rootY: -0.02,
        hipsT: 0,
        spineT: 0,
        spineF: 0.2 + t * 0.7,
        headF: 0.3 * t,
        headT: 0.2,
        lShF: 1.5,
        lShO: -0.1,
        lEl: 0.1,
        lHand: 1,
        rShF: 0.9 + Math.sin(e * 20) * 0.3,
        rShO: 0.6,
        rEl: 0.8,
        rHand: 1,
        ...L(-0.02, 0.25 + t * 0.15, -0.2, 0, t * 0.1),
      });
    }
    airborne(e) {
      let t = Math.sin(e * 24);
      return M(z(e, this.d.defender.char.id), {
        rootY: 0,
        hipsT: 0,
        spineT: 0,
        spineF: 0.25,
        headF: -0.3,
        lShF: 2.4 + t * 0.4,
        lShO: 0.6,
        lEl: 0.4,
        lHand: 1,
        rShF: 2.2 - t * 0.4,
        rShO: 0.7,
        rEl: 0.5,
        rHand: 1,
        lThF: 0.6 + t * 0.3,
        lKn: 0.9,
        rThF: 0.3 - t * 0.3,
        rKn: 0.7,
        lAnk: 0.3,
        rAnk: 0.3,
      });
    }
    step(e) {
      let t = this.d;
      this.t += e;
      let n = this.t,
        r = t.attacker,
        i = t.defender,
        a = this.dir,
        o = this.ax,
        s = o;
      if (n < this.GRAB) {
        let e = F(n / this.GRAB);
        ((this.attPose = this.reach(n)),
          (this.defPose = this.pulled(n, e * 0.3)),
          (this.attTf = { x: o, y: 0, z: 0, yaw: V(a), roll: 0 }));
        let r = this.bx0 + (o + a * 0.72 - this.bx0) * e;
        ((this.defTf = { x: r, y: 0, z: 0, yaw: V(-a), roll: 0 }),
          !this.clicked &&
            n > 0.18 &&
            ((this.clicked = !0),
            t.audio.block(),
            t.speech(`attacker`, `Wrist lock!`)));
      } else if (n < this.PIVOT) {
        let e = I((n - this.GRAB) / (this.PIVOT - this.GRAB));
        ((this.attPose = N(this.reach(n), this.pivot(n), e)),
          (this.defPose = this.pulled(n, 0.3 + e * 0.7)),
          (this.attTf = { x: o, y: 0, z: 0, yaw: V(a) + Math.PI * e, roll: 0 }),
          (this.defTf = {
            x: o + a * (0.72 - 0.3 * e),
            y: 0,
            z: 0,
            yaw: V(-a),
            roll: 0,
          }));
      } else if (n < this.THROW) {
        let r = I((n - this.PIVOT) / (this.THROW - this.PIVOT));
        ((this.attPose = N(this.pivot(n), this.heave(n), F(r * 1.5))),
          (this.attTf = { x: o, y: 0, z: 0, yaw: V(a) + Math.PI, roll: 0 }),
          (this.defPose = this.airborne(n)));
        let s = o + a * 0.42,
          c = o + a * 0.05,
          l = o - a * 0.95,
          u = 1 - r,
          d = u * u * s + 2 * u * r * c + r * r * l,
          f = u * u * 0.95 + 2 * u * r * 2.75 + r * r * 0.16,
          p = a * 1.5 * Math.PI * r,
          m = Ze * (i.char.modelHeight ?? 1);
        ((this.defTf = {
          x: d + m * Math.sin(p),
          y: f - m * Math.cos(p),
          z: 0,
          yaw: V(-a),
          roll: p,
        }),
          Math.random() < 0.6 &&
            t.fx.particles.emit(this.v.set(d, f, 0.1), {
              count: 1,
              speed: 0.5,
              color: 10477823,
              life: 0.35,
              size: 0.25,
              drag: 3,
            }),
          n - e < this.PIVOT + 0.05 &&
            n >= this.PIVOT + 0.05 &&
            t.audio.whoosh());
      } else {
        (this.released ||
          ((this.released = !0),
          (i.x = o - a * 0.95),
          (i.y = 0),
          this.damage(15),
          (i.vx = 0),
          (i.vy = 0),
          (i.grounded = !0),
          (i.downFrames = 0),
          i.hp <= 0
            ? ((i.hp = 0), i.forceState(`ko`))
            : i.forceState(`knockdown`),
          (this.defTf = null),
          (this.defPose = ca(n)),
          (r.facing = a * -1),
          t.fx.dust(this.v.set(i.x, 0.05, 0), 2.2),
          t.fx.shockwave(this.v.set(i.x, 0.04, 0), 16769184, 0.5, 1.4),
          t.fx.hitSpark(this.v.set(i.x, 0.3, 0.3), 1.4, !1, -a),
          t.cam.shake(0.35, 0.45),
          t.audio.thud(),
          t.audio.hit(1.3),
          t.arena.cheer(1.3),
          t.arena.paparazzi(8),
          t.popup(
            r.char.moveNames.grab ?? `GRAB!`,
            this.v.set(i.x, 1.4, 0.3),
            r.char.accent,
          )),
          n > this.THROW + 0.05 && (this.defPose = null),
          this.stepDefenderPhysics());
        let e = I((n - this.THROW) / 0.45);
        ((this.attPose = N(this.heave(n), R(n, r.char.id), e)),
          (this.attTf = null));
      }
      (this.v.set(s - a * 0.2, 1.3, 0),
        t.cam.set(Ya.set(s - a * 0.3, 1.9, 5), this.v, 3.5, 44),
        n >= this.END && (this.done = !0));
    }
  },
  to = class t extends Qa {
    constructor(t) {
      (super(t),
        e(this, `chappal`, Ia(1.5)),
        e(this, `slapIdx`, 0),
        e(this, `spoke`, !1),
        e(this, `SEP`, 0.62),
        e(this, `tmpQ`, new h()),
        (this.chappal.visible = !1),
        t.scene.add(this.chappal));
    }
    hold(e) {
      return M(R(e, this.d.attacker.char.id), {
        rootY: -0.06,
        ...L(-0.06, 0.3, -0.26),
        hipsT: 0,
        spineT: 0.1,
        spineF: 0.12,
        headF: -0.05,
        headT: 0.3,
        lShF: 1.45,
        lShO: -0.05,
        lShT: 0,
        lEl: 0.55,
        lHand: 0,
      });
    }
    slapArm(e, t) {
      return M(e, {
        rShF: 1.35 + Math.abs(t) * 0.15,
        rShO: 0.9 * -t + 0.1,
        rShT: 0.5 * -t,
        rEl: 0.5 + (1 - Math.abs(t)) * 0.3,
        rHand: 0,
        spineT: 0.1 + t * 0.25,
      });
    }
    overhead(e, t) {
      return M(this.hold(e), {
        rShF: 2.9 - t * 1.7,
        rShO: 0.15,
        rEl: 0.9 - t * 0.8,
        rHand: 0,
        spineF: 0.12 + t * 0.3,
        rootY: -0.06 - t * 0.08,
      });
    }
    slapped(e, t, n) {
      return M(z(e, this.d.defender.char.id), {
        rootY: -0.04,
        hipsT: 0,
        spineT: 0,
        spineF: 0.05,
        headT: t * 0.75 * n,
        headS: t * 0.3 * n,
        headF: -0.1,
        lShF: 0.5,
        lShO: 0.6,
        lEl: 1.2,
        lHand: 1,
        rShF: 0.5,
        rShO: 0.6,
        rEl: 1.2,
        rHand: 1,
      });
    }
    step(e) {
      let n = this.d;
      this.t += e;
      let r = this.t,
        i = n.attacker,
        a = n.defender,
        o = this.dir,
        { GRAB: s, SLAPS: c, WHACK: l, END: u } = t;
      if (r < l) {
        let e = F(P(r / s)),
          t = this.bx0 + (this.ax + o * this.SEP - this.bx0) * e;
        ((this.attTf = { x: this.ax, y: 0, z: 0, yaw: V(o), roll: 0 }),
          (this.defTf = { x: t, y: 0, z: 0, yaw: V(-o), roll: 0 }),
          (a.x = t),
          !this.spoke &&
            r > 0.08 &&
            ((this.spoke = !0),
            n.speech(`attacker`, `Ei! Shono!`),
            n.audio.block()));
        let i = this.hold(r),
          u = -1,
          d = 0,
          f = 0;
        for (let e = 0; e < c.length; e++) {
          let t = c[e],
            n = e % 2 == 0 ? -1 : 1,
            i = (r - (t - 0.12)) / 0.16;
          (i >= 0 && (u = i < 1 ? n + -2 * n * I(i) : -n),
            r >= t && ((d = -n * o), (f = Math.exp(-(r - t) * 5))));
        }
        let p = this.slapArm(i, u);
        for (
          r > l - 0.3 &&
            (p = N(p, this.overhead(r, 0), F((r - l + 0.3) / 0.18))),
            this.attPose = p,
            this.defPose = this.slapped(r, d, f),
            r > s &&
              !this.chappal.visible &&
              ((this.chappal.visible = !0),
              n.fx.particles.emit(n.attRig.handWorld(`r`, this.v), {
                count: 14,
                speed: 1.2,
                color: 16777215,
                life: 0.4,
                size: 0.2,
                drag: 3,
              }),
              n.audio.whoosh());
          this.slapIdx < c.length && r >= c[this.slapIdx];
        )
          (this.slapIdx++,
            n.audio.slap(0.8 + this.slapIdx * 0.1),
            n.cam.shake(0.08, 0.15),
            (a.hp = Math.max(1, a.hp - 1)),
            n.defRig.headWorld(this.v),
            n.fx.hitSpark(this.v, 0.6, !1, o),
            n.popup(
              [`THAPPAD!`, `CHATAAK!`, `THAPPAD!`][this.slapIdx - 1],
              this.v.setY(this.v.y + 0.4),
              `#ffe14d`,
            ),
            n.arena.cheer(0.4));
      } else {
        (this.released ||
          ((this.released = !0),
          (this.attTf = null),
          (this.defTf = null),
          (this.defPose = null),
          (a.x = this.ax + o * this.SEP),
          (a.y = 0),
          this.damage(13),
          a.hp <= 0
            ? a.knockOut(o, 4.5, 4)
            : (a.forceState(`knockdown`),
              (a.vx = o * 4.2),
              (a.vy = 4.2),
              (a.grounded = !1),
              (a.downFrames = 0)),
          n.audio.slap(1.4),
          n.audio.hit(1.1),
          n.cam.shake(0.3, 0.4),
          n.arena.cheer(1.2),
          n.arena.paparazzi(6),
          this.v.set(a.x, 1.5, 0.3),
          n.fx.hitSpark(this.v, 1.3, !1, o),
          n.popup(
            i.char.moveNames.grab ?? `GRAB!`,
            this.v.set(this.ax + o * 0.3, 2, 0.3),
            i.char.accent,
          )),
          this.stepDefenderPhysics());
        let e = F(P((r - l) / 0.15));
        this.attPose = N(
          this.overhead(r, e),
          R(r, i.char.id),
          I((r - l - 0.25) / 0.3),
        );
      }
      this.chappal.visible &&
        (n.attRig.handWorld(`r`, this.v),
        this.chappal.position.copy(this.v),
        this.tmpQ.setFromAxisAngle(Xa, V(o)),
        this.chappal.quaternion.copy(this.tmpQ),
        this.chappal.rotateX(-Math.PI / 2),
        this.chappal.rotateZ(Math.sin(r * 20) * 0.2),
        r > l + 0.35 && (this.chappal.visible = !1));
      let d = this.ax + o * 0.3;
      (this.v.set(d, 1.2, 0),
        n.cam.set(Ya.set(d - o * 0.2, 1.6, 4), this.v, 3.5, 40),
        r >= u && ((this.attTf = null), (this.done = !0)));
    }
    dispose() {
      (super.dispose(), this.d.scene.remove(this.chappal));
    }
  };
(e(to, `GRAB`, 0.3),
  e(to, `SLAPS`, [0.62, 0.9, 1.18]),
  e(to, `WHACK`, 1.62),
  e(to, `END`, 2.2));
var no = class t extends Qa {
  constructor(...t) {
    (super(...t),
      e(this, `SEP`, 0.72),
      e(this, `YANK_SEP`, 0.5),
      e(this, `patIdx`, 0),
      e(this, `yanked`, !1),
      e(this, `spoke`, !1));
  }
  offer(e, t) {
    return M(R(e, this.d.attacker.char.id), {
      rootY: -0.03,
      ...L(-0.03, 0.26, -0.24),
      hipsT: 0,
      spineT: 0.05,
      spineF: 0.05,
      chestF: -0.04,
      headF: -0.12,
      headT: 0.3,
      rShF: 1.15 + t * 0.18,
      rShO: -0.05,
      rShT: 0.1,
      rEl: 0.45 + t * 0.1,
      rHand: 0.35,
      lShF: 0.3,
      lShO: 0.25,
      lEl: 0.6,
      lHand: 1,
    });
  }
  pat(e, t) {
    return M(e, {
      lShF: 1.05 + (1 - t) * 0.35,
      lShO: -0.15,
      lShT: 0.2,
      lEl: 0.75 + (1 - t) * 0.4,
      lHand: 1,
    });
  }
  yank(e, t) {
    return M(this.offer(e, 0), {
      rShF: 1.15 - t * 0.55,
      rEl: 0.45 + t * 0.9,
      spineF: 0.05 - t * 0.12,
      spineT: 0.05 - t * 0.25,
      rootY: -0.06,
    });
  }
  shove(e, t) {
    return M(R(e, this.d.attacker.char.id), {
      rootY: -0.1,
      ...L(-0.1, 0.42, -0.34),
      hipsT: 0.15,
      spineT: -0.1,
      spineF: 0.25 * t,
      headF: -0.05,
      headT: 0.2,
      lShF: 1.4 * t + 0.3,
      lShO: -0.05,
      lEl: 1.4 - t * 1.25,
      lHand: 1,
      rShF: 1.4 * t + 0.3,
      rShO: -0.05,
      rEl: 1.4 - t * 1.25,
      rHand: 1,
    });
  }
  shaken(e, t, n) {
    return M(z(e, this.d.defender.char.id), {
      rootY: -0.04 - n * 0.08,
      ...L(-0.04 - n * 0.08, 0.22, -0.2),
      hipsT: 0,
      spineT: 0,
      spineF: 0.05 + n * 0.35,
      headF: 0.1 + n * 0.25,
      headT: 0.2,
      rShF: 1.1 + t * 0.18 + n * 0.2,
      rShO: -0.05,
      rEl: 0.4,
      rHand: 0.35,
      lShF: 0.3 + n * 0.5,
      lShO: 0.45,
      lEl: 0.9,
      lHand: 1,
    });
  }
  step(e) {
    let n = this.d;
    this.t += e;
    let r = this.t,
      i = n.attacker,
      a = n.defender,
      o = this.dir,
      { GRIP: s, YANK: c, PATS: l, SHOVE: u, END: d } = t;
    if (r < u) {
      let t = F(P(r / s)),
        i = F(P((r - c) / 0.14)),
        d = this.SEP + (this.YANK_SEP - this.SEP) * i,
        f = this.bx0 + (this.ax + o * d - this.bx0) * t;
      ((this.attTf = { x: this.ax, y: 0, z: 0, yaw: V(o), roll: 0 }),
        (this.defTf = { x: f, y: 0, z: 0, yaw: V(-o), roll: 0 }),
        (a.x = f),
        !this.spoke &&
          r > 0.08 &&
          ((this.spoke = !0), n.speech(`attacker`, `Great to see you!`)));
      let p = r > s ? Math.sin((r - s) * 26) * (r > c ? 1 : 0.6) : 0,
        m =
          r < c
            ? this.offer(r, p)
            : this.yank(r, i * (1 - P((r - c - 0.2) / 0.2)));
      r > c + 0.1 && (m = M(m, { rShF: m.rShF + p * 0.15 }));
      for (let e of l) {
        let t = (r - (e - 0.09)) / 0.18;
        t > 0 && t < 1 && (m = this.pat(m, Math.sin(t * Math.PI)));
      }
      for (
        r > u - 0.25 && (m = N(m, this.shove(r, 0), F((r - u + 0.25) / 0.2))),
          this.attPose = m,
          this.defPose = this.shaken(
            r,
            r > s ? p : 0,
            i * (1 - P((r - c - 0.35) / 0.3)) + (r > l[0] ? 0.25 : 0),
          ),
          r >= s &&
            r - e < s &&
            (n.audio.block(),
            n.popup(
              `DEAL!`,
              n.attRig.handWorld(`r`, this.v).setY(this.v.y + 0.35),
              `#ffd23f`,
            )),
          !this.yanked &&
            r >= c &&
            ((this.yanked = !0),
            n.audio.whoosh(),
            n.audio.slap(0.6),
            n.cam.shake(0.1, 0.2),
            n.popup(
              `YANK!`,
              this.v.set((this.ax + a.x) / 2, 1.9, 0.3),
              `#ff4040`,
            ),
            n.speech(
              `defender`,
              {
                modi: `Arre, haath chhodo!`,
                rahul: `Bhai, haath toh chhodo!`,
                didi: `Ei! Haath chharo!`,
                trump: `Hey! My hand!`,
                mbapu: `Chhodiye, beta!`,
                yogi: `Haath chhodiye, shrimaan!`,
                nitin: `Arre bhau, haath sodo!`,
              }[a.char.id],
            ));
        this.patIdx < l.length && r >= l[this.patIdx];
      )
        (this.patIdx++,
          n.audio.slap(0.45),
          (a.hp = Math.max(1, a.hp - 1)),
          n.popup(
            `PAT!`,
            n.attRig.handWorld(`l`, this.v).setY(this.v.y + 0.3),
            `#ffffff`,
          ));
    } else {
      (this.released ||
        ((this.released = !0),
        (this.attTf = null),
        (this.defTf = null),
        (this.defPose = null),
        (a.x = this.ax + o * this.YANK_SEP),
        (a.y = 0),
        this.damage(12),
        a.hp <= 0
          ? a.knockOut(o, 5, 4)
          : (a.forceState(`knockdown`),
            (a.vx = o * 5),
            (a.vy = 3.8),
            (a.grounded = !1),
            (a.downFrames = 0)),
        n.audio.hit(1.1),
        n.audio.cameraClicks(6),
        n.cam.shake(0.25, 0.35),
        n.arena.cheer(1.1),
        n.arena.paparazzi(6),
        this.v.set(this.ax + o * 0.6, 1.4, 0.3),
        n.fx.hitSpark(this.v, 1.2, !1, o),
        n.popup(
          `DEAL OFF!`,
          this.v.set(this.ax + o * 0.4, 2.1, 0.3),
          i.char.accent,
        )),
        this.stepDefenderPhysics());
      let e = F(P((r - u) / 0.12));
      this.attPose = N(
        this.shove(r, e),
        R(r, i.char.id),
        I((r - u - 0.3) / 0.3),
      );
    }
    let f = this.ax + o * 0.35;
    (this.v.set(f, 1.25, 0),
      n.cam.set(Ya.set(f - o * 0.15, 1.55, 3.6), this.v, 3.5, 40),
      r >= d && ((this.attTf = null), (this.done = !0)));
  }
};
(e(no, `GRIP`, 0.3),
  e(no, `YANK`, 0.62),
  e(no, `PATS`, [0.85, 1.05]),
  e(no, `SHOVE`, 1.5),
  e(no, `END`, 2.15));
var ro = class t extends Qa {
  constructor(t) {
    (super(t),
      e(this, `SEP`, 0.72),
      e(this, `Z`, 0.42),
      e(this, `arm`, void 0),
      e(this, `neck`, void 0),
      e(this, `lastHalf`, 0),
      e(this, `slammed1`, !1),
      e(this, `spoke`, !1),
      (this.arm = this.dir > 0 ? `r` : `l`),
      (this.neck = 1.47 * (t.defender.char.modelHeight ?? 1)));
  }
  gripPose(e, t, n, r) {
    let i = -0.04 - n * 0.3,
      a = M(R(e, `yogi`), {
        rootY: i,
        ...L(i, 0.24 + n * 0.08, -0.3),
        hipsT: 0,
        spineT: 0,
        spineF: r,
        headT: 0.2,
        headF: -0.1 + r * 0.4,
      }),
      o = { ShF: 0.25, ShO: 0.5, ShT: -0.3, El: 1.7, Hand: 0 },
      s = { ShF: t, ShO: 0.12, ShT: 0, El: 0.12, Hand: 0 },
      [c, l] = this.arm === `r` ? [`r`, `l`] : [`l`, `r`];
    for (let [e, t] of [
      [c, s],
      [l, o],
    ])
      ((a[`${e}ShF`] = t.ShF),
        (a[`${e}ShO`] = t.ShO),
        (a[`${e}ShT`] = t.ShT),
        (a[`${e}El`] = t.El),
        (a[`${e}Hand`] = t.Hand));
    return a;
  }
  namaste(e, t) {
    return M(R(e, `yogi`), {
      rootY: -0.02,
      ...L(-0.02, 0.1, -0.1),
      hipsT: 0,
      spineT: 0,
      spineF: 0.04 + t * 0.25,
      headT: 0.4,
      headF: t * 0.3,
      ..._a,
    });
  }
  flail(e, t) {
    let n = Math.sin(e * 26);
    return M(z(e, this.d.defender.char.id), {
      rootY: 0,
      hipsT: 0,
      spineT: 0,
      spineF: 0.05,
      headF: -0.2,
      lShF: 2.6 + n * 0.4 * t,
      lShO: 0.5,
      lEl: 0.3,
      lHand: 1,
      rShF: 2.4 - n * 0.4 * t,
      rShO: 0.6,
      rEl: 0.4,
      rHand: 1,
      lThF: 0.15 + n * 0.35 * t,
      lKn: 0.25,
      rThF: 0.1 - n * 0.35 * t,
      rKn: 0.3,
      lAnk: 0.2,
      rAnk: 0.2,
    });
  }
  hang(e, t, n, r = this.Z) {
    return {
      x: e + this.neck * Math.sin(n),
      y: t - this.neck * Math.cos(n),
      z: r,
      yaw: V(-this.dir),
      roll: n,
    };
  }
  aim(e, t) {
    let n = this.ax + this.dir * 0.05;
    return Math.PI - Math.atan2((e - n) * this.dir, t - 1.48);
  }
  slamFx(e, t) {
    let n = this.d;
    (n.fx.dust(this.v.set(e, 0.05, this.Z * 0.5), t ? 2.6 : 1.6),
      n.fx.shockwave(
        this.v.set(e, 0.04, this.Z * 0.5),
        16756832,
        0.5,
        t ? 1.8 : 1.2,
      ),
      t &&
        n.fx.shockwave(this.v.set(e, 0.04, this.Z * 0.5), 16777215, 0.35, 1.1),
      n.fx.hitSpark(this.v.set(e, 0.3, this.Z), t ? 1.4 : 1, !1, this.dir),
      n.cam.shake(t ? 0.4 : 0.25, t ? 0.45 : 0.3),
      n.audio.thud(),
      n.audio.hit(t ? 1.3 : 0.9),
      t && n.audio.boom(),
      n.arena.cheer(t ? 1.3 : 0.7));
  }
  step(e) {
    let n = this.d;
    this.t += e;
    let r = this.t,
      i = n.attacker,
      a = n.defender,
      o = this.dir,
      s = this.ax,
      { GRAB: c, LIFT: l, SPIN: u, SLAM1: d, HAUL: f, SLAM2: p, END: m } = t,
      h = { x: s + o * 0.55, y: 2 },
      g = { x: s + o * 0.12, y: 2.3 },
      _ = { x: s - o * 0.5, y: 0.2 },
      v = { x: s + o * 0.55, y: 0.2 },
      y = (e, t, n) => ({ x: e.x + (t.x - e.x) * n, y: e.y + (t.y - e.y) * n });
    if (((this.attTf = { x: s, y: 0, z: 0, yaw: V(o), roll: 0 }), r < c)) {
      let t = F(r / c),
        i = this.bx0 + (s + o * this.SEP - this.bx0) * t;
      ((this.defTf = { x: i, y: 0, z: 0, yaw: V(-o), roll: 0 }),
        (a.x = i),
        (this.attPose = this.gripPose(r, 0.6 + t * 0.8, 0.1, 0.12)),
        (this.defPose = M(z(r, a.char.id), { headF: -0.3, spineF: -0.1 })),
        !this.spoke &&
          r > 0.08 &&
          ((this.spoke = !0), n.speech(`attacker`, `Dhobi pachhad!`)),
        r + e >= c && r < c && n.audio.block());
    } else if (r < l) {
      let e = I((r - c) / (l - c)),
        t = y({ x: s + o * this.SEP, y: this.neck }, h, e),
        n = Math.sin(r * 9) * 0.12 * e;
      ((this.defTf = this.hang(t.x, t.y, n * o, this.Z * e)),
        (this.attPose = this.gripPose(
          r,
          this.aim(t.x, t.y),
          0.1 - e * 0.1,
          0.12 - e * 0.2,
        )),
        (this.defPose = this.flail(r, e)),
        (a.x = t.x));
    } else if (r < p + 0.02) {
      let e,
        t,
        i = 0,
        s = -0.08;
      if (r < u) {
        let n = I((r - l) / (u - l));
        ((e = y(h, g, Math.min(1, n * 2))), (t = n * 3 * Math.PI), (s = -0.12));
      } else if (r < d) {
        let n = (r - u) / (d - u);
        ((e = y(g, _, n * n)),
          (t = (3 + 0.5 * n * n) * Math.PI),
          (i = n),
          (s = -0.12 - n * 0.3));
      } else if (r < f) {
        let n = F((r - d) / (f - d));
        ((e = y(_, g, n)),
          (t = (3.5 - 0.5 * n) * Math.PI),
          (i = 1 - n),
          (s = -0.42 + n * 0.3));
      } else {
        let n = P((r - f) / (p - f));
        ((e = y(g, v, n * n)),
          (t = (3 - 0.5 * n * n) * Math.PI),
          (i = n),
          (s = -0.12 + n * 0.62));
      }
      ((this.defTf = this.hang(e.x, e.y, t * o)),
        (this.attPose = this.gripPose(r, this.aim(e.x, e.y), i, s)),
        (this.defPose = this.flail(r, 1)),
        (a.x = this.defTf.x));
      let c = Math.floor(Math.abs(t) / Math.PI);
      (c > this.lastHalf && ((this.lastHalf = c), n.audio.whoosh()),
        Math.random() < 0.5 &&
          n.fx.particles.emit(
            this.v.set(this.defTf.x, this.defTf.y + 0.5, this.Z),
            {
              count: 1,
              speed: 0.4,
              color: 16752704,
              life: 0.3,
              size: 0.22,
              drag: 3,
            },
          ),
        !this.slammed1 &&
          r >= d &&
          ((this.slammed1 = !0),
          (a.hp = Math.max(1, a.hp - 2)),
          this.slamFx(_.x - o * this.neck * 0.5, !1),
          n.popup(`PATAK!`, this.v.set(_.x - o * 0.6, 1.2, 0.3), `#ffffff`)));
    } else {
      (this.released ||
        ((this.released = !0),
        (a.x = v.x + o * this.neck * 0.5),
        (a.y = 0),
        this.damage(14),
        (a.vx = 0),
        (a.vy = 0),
        (a.grounded = !0),
        (a.downFrames = 0),
        a.hp <= 0
          ? ((a.hp = 0), a.forceState(`ko`))
          : a.forceState(`knockdown`),
        (this.defTf = null),
        (this.defPose = ca(r)),
        n.defRig.snapTo?.(this.defPose),
        this.slamFx(a.x, !0),
        n.popup(
          i.char.moveNames.grab ?? `GRAB!`,
          this.v.set(a.x, 1.5, 0.3),
          i.char.accent,
        )),
        r > p + 0.1 && (this.defPose = null),
        this.stepDefenderPhysics());
      let e = I((r - p - 0.15) / 0.4);
      this.attPose = N(
        this.gripPose(r, this.aim(v.x, v.y), 1, 0.5),
        this.namaste(r, Math.sin(P((r - p - 0.2) / 0.5) * Math.PI)),
        e,
      );
    }
    let b = r > p ? I(P((r - p) / 0.5)) : 0;
    (this.v.set(s + o * 0.25, 1.7 - b * 0.6, 0),
      n.cam.set(
        Ya.set(s + o * 0.2, 1.9 - b * 0.2, 7.2 - b * 1.2),
        this.v,
        3.5,
        48,
      ),
      r >= m && ((this.attTf = null), (this.done = !0)));
  }
};
(e(ro, `GRAB`, 0.28),
  e(ro, `LIFT`, 0.62),
  e(ro, `SPIN`, 1.38),
  e(ro, `SLAM1`, 1.6),
  e(ro, `HAUL`, 1.92),
  e(ro, `SLAM2`, 2.12),
  e(ro, `END`, 2.85));
var io = class t extends Qa {
  constructor(...t) {
    (super(...t),
      e(this, `poseRate`, 60),
      e(this, `CLIP_REACH`, 1.7),
      e(this, `CLIP_READY`, 2),
      e(this, `CLIP_SLAM`, 3.45),
      e(this, `LET_GO`, [3.1, 3.3]),
      e(this, `R`, 1.2),
      e(this, `CLEAR_HEAD`, 0.46),
      e(this, `landed`, 0),
      e(this, `row`, []),
      e(this, `otherRow`, []),
      e(this, `grip`, 0),
      e(this, `fromHand`, new T()),
      e(this, `path`, new T()),
      e(this, `hand`, new T()),
      e(this, `chest`, new T()));
  }
  arcOf(e) {
    let n = t.THROWS;
    for (let t = 0; t < n.length; t++)
      if (e >= n[t][0] && e < n[t][1])
        return { index: t, k: (e - n[t][0]) / (n[t][1] - n[t][0]) };
    return null;
  }
  throwDir(e) {
    return e % 2 == 0 ? this.dir : -this.dir;
  }
  rowAt(e, t) {
    let n = P((e - Ca) / (wa * (Ta.length - 1))) * (Ta.length - 1),
      r = Math.min(Ta.length - 2, Math.floor(n)),
      i = Ta[r],
      a = Ta[r + 1];
    for (let e = 0; e < i.length; e++) t[e] = i[e] + (a[e] - i[e]) * (n - r);
    return t;
  }
  bodyPose(e, t) {
    return M(z(t, this.d.defender.char.id), {
      rootY: 0,
      hipsF: 0,
      hipsT: 0,
      spineF: e[7],
      spineT: 0,
      headF: -0.2,
      lShF: e[8],
      rShF: e[9],
      lEl: e[10],
      rEl: e[11],
      lShO: 0.2,
      rShO: 0.2,
      lThF: e[12],
      rThF: e[13],
      lKn: e[14],
      rKn: e[15],
    });
  }
  placePath(e, t, n, r) {
    let i = P((n - this.LET_GO[0]) / (this.CLIP_SLAM - this.LET_GO[0]));
    return r.set(this.ax - this.throwDir(t) * e[3], e[4], e[5] * (1 - i));
  }
  slam(e, n) {
    let r = this.d,
      i = e === t.THROWS.length - 1,
      a = this.v.set(n, 0.1, 0.1);
    (r.fx.dust(a, i ? 3 : 1.6),
      r.fx.shockwave(a, 16765024, 0.5, i ? 6 : 2.6),
      r.fx.particles.emit(a, {
        count: i ? 70 : 28,
        speed: i ? 7 : 4.5,
        color: 16777215,
        life: 0.8,
        size: 0.16,
        drag: 1.6,
      }),
      r.cam.shake(i ? 0.42 : 0.2, i ? 0.5 : 0.25),
      r.audio.thud(),
      r.audio.slap(1),
      i && r.audio.boom(),
      r.arena.cheer(i ? 1 : 0.5),
      i
        ? r.popup(
            `GREAT PATKI!`,
            this.v.set(n, 2.3, 0.3),
            r.attacker.char.accent,
          )
        : r.popup(
            e === 0 ? `PATKI!` : `PHIR SE!`,
            this.v.set(n, 1.7, 0.3),
            `#ffffff`,
          ));
  }
  step(e) {
    let n = this.d;
    this.t += e;
    let r = this.t,
      i = n.defender,
      { GRIP: a, THROWS: o, REST: s, END: c } = t,
      {
        CLIP_REACH: l,
        CLIP_READY: u,
        CLIP_SLAM: d,
        LET_GO: f,
        row: p,
        otherRow: m,
      } = this,
      h = this.arcOf(r);
    for (; this.landed < o.length && r >= o[this.landed][1];) {
      let e = this.landed++;
      (this.slam(e, this.ax - this.throwDir(e) * this.R),
        e < o.length - 1 && (i.hp = Math.max(1, i.hp - 4)));
    }
    if (((this.attTf = { x: this.ax, y: 0, z: 0, yaw: 0, roll: 0 }), r < a)) {
      let t = F(r / a),
        o = l + (u - l) * t;
      (this.rowAt(u, p),
        n.attRig.setMirror?.(this.dir > 0),
        (this.attClip = { name: `throw`, time: o, fade: 0.1 }),
        this.placePath(p, 0, u, this.path),
        (this.path.x = this.bx0 + (this.path.x - this.bx0) * t),
        (this.path.z *= t),
        this.fromHand.set(-this.dir * p[0], p[1], p[2]),
        (this.grip = t),
        (this.defTf = {
          x: this.path.x,
          y: 0,
          z: this.path.z,
          yaw: V(-this.dir),
          roll: this.dir * p[6] * t,
        }),
        (i.x = this.path.x),
        (this.defPose = N(
          M(z(r, i.char.id), { headF: -0.3, spineF: -0.1 }),
          this.bodyPose(p, r),
          t,
        )),
        r >= 0.08 && r - e < 0.08 && n.speech(`attacker`, `Great Patki!`));
    } else if (h) {
      let e = this.throwDir(h.index),
        t = u + (d - u) * h.k;
      (this.rowAt(t, p),
        n.attRig.setMirror?.(e > 0),
        (this.attClip = { name: `throw`, time: t, fade: 0.05 }),
        this.placePath(p, h.index, t, this.path));
      let a = F(P(h.k / 0.16)) * (1 - I(P((h.k - 0.4) / 0.3)));
      (this.fromHand.set(-e * p[0], p[1], p[2] + this.CLEAR_HEAD * a),
        (this.grip = 1 - P((t - f[0]) / (f[1] - f[0]))),
        (this.defTf = {
          x: this.path.x,
          y: 0,
          z: this.path.z,
          yaw: V(-e),
          roll: e * p[6],
        }),
        (i.x = this.path.x),
        (this.defPose = this.bodyPose(p, r)),
        h.k < 0.05 && n.audio.whoosh());
    } else if (this.landed < o.length) {
      let e = this.landed - 1,
        t = I(P((r - o[e][1] - s) / (o[this.landed][0] - o[e][1] - s))),
        a = this.throwDir(this.landed);
      (this.rowAt(d, p),
        this.rowAt(u, m),
        n.attRig.setMirror?.((t > 0 ? a : this.throwDir(e)) > 0),
        (this.attClip = { name: `throw`, time: t > 0 ? u : d, fade: 0.28 }),
        this.placePath(p, e, d, this.path),
        this.path.lerp(this.placePath(m, this.landed, u, this.chest), t),
        this.fromHand.set(-a * m[0], m[1], m[2]),
        (this.grip = t));
      let c = Ea(this.throwDir(e) * p[6]),
        l = V(-this.throwDir(e));
      ((this.defTf = {
        x: this.path.x,
        y: 0,
        z: this.path.z,
        yaw: l + (V(-a) - l) * t,
        roll: c + (a * m[6] - c) * t,
      }),
        (i.x = this.path.x),
        (this.defPose =
          t > 0
            ? N(this.bodyPose(p, r), this.bodyPose(m, r), t)
            : this.bodyPose(p, r)));
    } else
      (this.released ||
        ((this.released = !0),
        (i.x = this.ax - this.throwDir(o.length - 1) * this.R),
        (i.y = 0),
        this.damage(14),
        (i.vx = 0),
        (i.vy = 0),
        (i.grounded = !0),
        (i.downFrames = 0),
        i.hp <= 0
          ? ((i.hp = 0), i.forceState(`ko`))
          : i.forceState(`knockdown`),
        (this.defTf = null),
        (this.defPose = ca(r)),
        n.defRig.snapTo?.(this.defPose)),
        r > o[2][1] + 0.1 && (this.defPose = null),
        this.stepDefenderPhysics(),
        (this.attClip = {
          name: `throw`,
          time: d + (r - o[2][1]) * 0.8,
          fade: 0.1,
        }));
    let g = r > o[2][1] ? I(P((r - o[2][1]) / 0.5)) : 0;
    (this.v.set(this.ax, 1.35 - g * 0.3, 0),
      n.cam.set(Ya.set(this.ax, 1.6 - g * 0.2, 6.6 - g * 0.8), this.v, 3.5, 48),
      r >= c && ((this.attTf = null), (this.attClip = null), (this.done = !0)));
  }
  afterVisuals() {
    let e = this.defTf;
    if (!e || this.released) return;
    let t = this.d,
      n = this.v.copy(this.path);
    (this.grip > 0 &&
      n.lerp(t.attRig.handWorld(`r`, this.hand).add(this.fromHand), this.grip),
      (n.y = Math.max(0.14, n.y)),
      t.defRig.chestWorld(this.chest));
    let r = t.defRig.root.position;
    t.defRig.setFree(
      r.x + n.x - this.chest.x,
      r.y + n.y - this.chest.y,
      r.z + n.z - this.chest.z,
      e.yaw,
      e.roll,
    );
  }
};
(e(io, `GRIP`, 0.35),
  e(io, `THROWS`, [
    [0.35, 1.05],
    [1.45, 2.15],
    [2.55, 3.3],
  ]),
  e(io, `REST`, 0.1),
  e(io, `END`, 4.05));
function ao(e) {
  switch (e.attacker.char.id) {
    case `mbapu`:
      return new io(e);
    case `modi`:
      return new $a(e);
    case `didi`:
      return new to(e);
    case `trump`:
      return new no(e);
    case `yogi`:
      return new ro(e);
    default:
      return new eo(e);
  }
}
var oo,
  so = 14689839,
  co = 16763200,
  lo = (e, t = 0.6, n = {}) => new x({ color: e, roughness: t, ...n }),
  uo = new T(0, 1, 0),
  fo = new Map();
function po(e, t) {
  if (!fo.has(e)) {
    let n = t();
    (n && (n.userData.shared = !0), fo.set(e, n));
  }
  return fo.get(e);
}
function mo(e, t, n) {
  if (typeof document > `u`) return null;
  let r = document.createElement(`canvas`);
  ((r.width = e), (r.height = t));
  let i = r.getContext(`2d`);
  if (!i) return null;
  n(i);
  let a = new _e(r);
  return ((a.colorSpace = oe), (a.anisotropy = 4), a);
}
function ho(e, t, n, r, i) {
  ((e.strokeStyle = `#111`),
    (e.lineWidth = Math.max(3, i * 0.06)),
    (e.lineJoin = `miter`),
    e.beginPath(),
    e.moveTo(t, n + i * 0.6));
  for (let a = 1; a <= 22; a++) {
    let o = t + (a / 22) * r,
      s = a % 2 == 1,
      c = (0.55 + 0.45 * Math.sin(a * 1.7)) * i;
    e.lineTo(o, s ? n + i * 0.6 - c * 0.9 : n + i * 0.6 + c * 0.15);
  }
  (e.stroke(),
    e.beginPath(),
    e.moveTo(t - r * 0.02, n + i * 0.78),
    e.lineTo(t + r * 1.02, n + i * 0.72),
    e.stroke());
}
function go() {
  return mo(256, 256, (e) => {
    ((e.fillStyle = `#b07a3e`), e.fillRect(0, 0, 256, 256));
    for (let t = 0; t < 4; t++) {
      ((e.fillStyle = t % 2 ? `#a06b33` : `#b98545`),
        e.fillRect(0, t * 64 + 2, 256, 60));
      for (let n = 0; n < 18; n++) {
        ((e.strokeStyle = `rgba(70,40,15,0.25)`),
          (e.lineWidth = 1),
          e.beginPath());
        let n = t * 64 + 6 + Math.random() * 52;
        (e.moveTo(0, n),
          e.bezierCurveTo(
            80,
            n + Math.random() * 6 - 3,
            170,
            n + Math.random() * 6 - 3,
            256,
            n,
          ),
          e.stroke());
      }
    }
    ((e.strokeStyle = `#6e4317`),
      (e.lineWidth = 16),
      e.strokeRect(8, 8, 240, 240),
      (e.lineWidth = 12),
      e.beginPath(),
      e.moveTo(16, 240),
      e.lineTo(240, 16),
      e.stroke(),
      e.save(),
      e.translate(128, 128),
      e.rotate(-0.12),
      (e.fillStyle = `rgba(200,16,46,0.92)`),
      (e.font = `bold 54px Impact, sans-serif`),
      (e.textAlign = `center`),
      (e.textBaseline = `middle`),
      e.fillText(`TARIFF`, 0, -24),
      (e.font = `bold 64px Impact, sans-serif`),
      (e.fillStyle = `rgba(20,20,20,0.9)`),
      e.fillText(`50%`, 0, 36),
      e.restore());
  });
}
function _o(e) {
  return mo(256, 128, (t) => {
    ((t.fillStyle = `#d61f2c`),
      t.beginPath(),
      t.moveTo(52, 6),
      t.lineTo(250, 6),
      t.lineTo(250, 122),
      t.lineTo(52, 122),
      t.lineTo(6, 64),
      t.closePath(),
      t.fill(),
      (t.strokeStyle = `#fff`),
      (t.lineWidth = 6),
      t.stroke(),
      (t.fillStyle = `#fff`),
      t.beginPath(),
      t.arc(40, 64, 10, 0, Math.PI * 2),
      t.fill(),
      (t.font = `bold 66px Impact, sans-serif`),
      (t.textAlign = `center`),
      (t.textBaseline = `middle`),
      t.fillText(e, 152, 68));
  });
}
function vo() {
  return mo(512, 512, (e) => {
    e.lineWidth = 26;
    for (let t = 0; t < 24; t++)
      ((e.strokeStyle = t % 2 ? `#ffffff` : `#e0262f`),
        e.beginPath(),
        e.arc(
          256,
          256,
          228,
          (t / 24) * Math.PI * 2,
          ((t + 1) / 24) * Math.PI * 2,
        ),
        e.stroke());
    ((e.strokeStyle = `#2a56d6`),
      (e.lineWidth = 10),
      e.beginPath(),
      e.arc(256, 256, 196, 0, Math.PI * 2),
      e.stroke(),
      (e.fillStyle = `#ffffff`),
      (e.font = `bold 34px Impact, sans-serif`),
      (e.textAlign = `center`),
      (e.textBaseline = `middle`));
    let t = `TARIFF ★ 50% ★ TARIFF ★ 50% ★ `.split(``);
    (t.forEach((n, r) => {
      let i = (r / t.length) * Math.PI * 2;
      (e.save(),
        e.translate(256 + Math.cos(i) * 160, 256 + Math.sin(i) * 160),
        e.rotate(i + Math.PI / 2),
        e.fillText(n, 0, 0),
        e.restore());
    }),
      (e.strokeStyle = `rgba(255,255,255,0.85)`),
      (e.lineWidth = 6));
    for (let t of [0, Math.PI / 2, Math.PI, Math.PI * 1.5])
      (e.beginPath(),
        e.moveTo(256 + Math.cos(t) * 40, 256 + Math.sin(t) * 40),
        e.lineTo(256 + Math.cos(t) * 120, 256 + Math.sin(t) * 120),
        e.stroke());
  });
}
function yo() {
  return mo(384, 512, (e) => {
    ((e.fillStyle = `#1a1a1f`),
      e.fillRect(0, 0, 384, 512),
      (e.fillStyle = `#f6f0dc`),
      e.fillRect(20, 20, 344, 472),
      (e.fillStyle = `#1a1a1f`),
      (e.textAlign = `center`),
      (e.font = `bold 30px Georgia, serif`),
      e.fillText(`EXECUTIVE ORDER`, 192, 78),
      (e.fillStyle = `#c8102e`),
      (e.font = `bold 76px Impact, sans-serif`),
      e.fillText(`TARIFF`, 192, 176),
      (e.fillStyle = `#1a1a1f`),
      (e.font = `bold 92px Impact, sans-serif`),
      e.fillText(`50%`, 192, 272),
      (e.strokeStyle = `rgba(0,0,0,0.25)`),
      (e.lineWidth = 2));
    for (let t = 300; t < 360; t += 14)
      (e.beginPath(), e.moveTo(60, t), e.lineTo(324, t), e.stroke());
    (ho(e, 70, 370, 250, 90), (e.fillStyle = `#d4a019`), e.beginPath());
    for (let t = 0; t < 10; t++) {
      let n = (t / 10) * Math.PI * 2 - Math.PI / 2,
        r = t % 2 ? 16 : 36;
      e.lineTo(316 + Math.cos(n) * r, 450 + Math.sin(n) * r);
    }
    e.fill();
  });
}
function bo() {
  return mo(512, 256, (e) => {
    ((e.strokeStyle = `rgba(200,16,46,0.9)`),
      (e.lineWidth = 16),
      e.strokeRect(20, 20, 472, 216),
      (e.fillStyle = `rgba(200,16,46,0.9)`),
      (e.font = `bold 120px Impact, sans-serif`),
      (e.textAlign = `center`),
      (e.textBaseline = `middle`),
      e.fillText(`TARIFFED`, 256, 132),
      (e.globalCompositeOperation = `destination-out`));
    for (let t = 0; t < 260; t++)
      ((e.fillStyle = `rgba(0,0,0,${0.3 + Math.random() * 0.7})`),
        e.beginPath(),
        e.arc(
          Math.random() * 512,
          Math.random() * 256,
          1 + Math.random() * 4,
          0,
          Math.PI * 2,
        ),
        e.fill());
  });
}
function xo() {
  return mo(128, 56, (e) => {
    ((e.fillStyle = `#7fb27a`),
      e.fillRect(0, 0, 128, 56),
      (e.strokeStyle = `#2f5e2c`),
      (e.lineWidth = 4),
      e.strokeRect(4, 4, 120, 48),
      (e.fillStyle = `#2f5e2c`),
      e.beginPath(),
      e.ellipse(64, 28, 14, 18, 0, 0, Math.PI * 2),
      e.fill(),
      (e.fillStyle = `#d9ecd4`),
      (e.font = `bold 22px Georgia, serif`),
      (e.textAlign = `center`),
      (e.textBaseline = `middle`),
      e.fillText(`$`, 64, 29),
      (e.fillStyle = `#2f5e2c`),
      (e.font = `bold 16px Georgia, serif`),
      e.fillText(`100`, 20, 16),
      e.fillText(`100`, 108, 42));
  });
}
function So() {
  let e = new c(),
    t = lo(4860434, 0.45, { metalness: 0.05 }),
    n = lo(co, 0.3, { metalness: 0.85 }),
    r = new p(new C(0.66, 0.06, 1.25), t);
  ((r.position.y = 0.76), e.add(r));
  let i = new p(new C(0.58, 0.7, 1.15), t);
  ((i.position.y = 0.38), e.add(i));
  for (let t of [0.735, 0.04]) {
    let r = new p(new C(0.62, 0.03, 1.19), n);
    ((r.position.y = t), e.add(r));
  }
  let a = new p(new C(0.02, 0.46, 0.8), lo(5977368, 0.4));
  (a.position.set(0.3, 0.4, 0), e.add(a));
  let o = new ee();
  for (let e = 0; e < 10; e++) {
    let t = (e / 10) * Math.PI * 2 + Math.PI / 2,
      n = e % 2 ? 0.05 : 0.12;
    e === 0
      ? o.moveTo(Math.cos(t) * n, Math.sin(t) * n)
      : o.lineTo(Math.cos(t) * n, Math.sin(t) * n);
  }
  let s = new p(new te(o, { depth: 0.02, bevelEnabled: !1 }), n);
  ((s.rotation.y = Math.PI / 2), s.position.set(0.315, 0.42, 0), e.add(s));
  let l = new p(new w(0.16, 0.012, 8, 40), n);
  return (
    (l.rotation.y = Math.PI / 2),
    l.position.set(0.315, 0.42, 0),
    e.add(l),
    e
  );
}
function Co() {
  let e = new c(),
    t = new p(new E(0.022, 0.022, 0.26, 12), lo(co, 0.25, { metalness: 0.9 }));
  ((t.position.y = -0.05), e.add(t));
  let n = new p(new de(0.02, 0.06, 10), lo(1118481, 0.5));
  return ((n.rotation.x = Math.PI), (n.position.y = -0.21), e.add(n), e);
}
function wo() {
  let e = new c(),
    t = lo(11735583, 0.55),
    n = lo(co, 0.3, { metalness: 0.85 }),
    r = lo(7027223, 0.5),
    a = new p(new C(1.5, 0.14, 1.05), t);
  ((a.position.y = 0.07), e.add(a));
  let o = new p(new C(1.62, 0.36, 1.16), r);
  ((o.position.y = 0.32), e.add(o));
  let s = new p(new C(1.66, 0.06, 1.2), n);
  ((s.position.y = 0.46), e.add(s));
  let l = new p(new E(0.12, 0.16, 0.85, 16), r);
  ((l.position.y = 0.92), e.add(l));
  let u = new p(new i(0.3, 20, 16), n);
  ((u.position.y = 1.45), u.scale.set(1, 0.85, 1), e.add(u));
  let d = po(`stamp-label`, () =>
    mo(512, 128, (e) => {
      ((e.fillStyle = `#f6f0dc`),
        e.fillRect(0, 0, 512, 128),
        (e.fillStyle = `#c8102e`),
        (e.font = `bold 92px Impact, sans-serif`),
        (e.textAlign = `center`),
        (e.textBaseline = `middle`),
        e.fillText(`TARIFF 50%`, 256, 68));
    }),
  );
  if (d)
    for (let t of [0.585, -0.585]) {
      let n = new p(new f(1.2, 0.26), new x({ map: d, roughness: 0.6 }));
      (n.position.set(0, 0.32, t), t < 0 && (n.rotation.y = Math.PI), e.add(n));
    }
  let m = new ne(so, 0, 6, 2);
  return ((m.position.y = -0.3), e.add(m), { root: e, light: m });
}
var To = class t extends ka {
  constructor(n) {
    (super(n),
      e(this, `root`, new c()),
      e(this, `desk`, So()),
      e(this, `deskPos`, new T()),
      e(this, `paper`, void 0),
      e(this, `marker`, Co()),
      e(this, `folder`, void 0),
      e(this, `ring`, void 0),
      e(this, `ringLight`, new ne(so, 0, 5, 2)),
      e(this, `deskLight`, new ne(co, 0, 4, 2)),
      e(this, `deskGlow`, void 0),
      e(this, `keyLight`, new ne(16769720, 0, 7, 1.6)),
      e(this, `stamp`, wo()),
      e(this, `ink`, void 0),
      e(this, `crates`, []),
      e(this, `tags`, []),
      e(this, `bills`, []),
      e(this, `chantIdx`, 0),
      e(this, `nextChant`, t.SHOW_END + 0.2),
      e(this, `spawned`, 0),
      e(this, `stamped`, !1),
      e(this, `lifted`, !1));
    let r = n.caster.facing;
    (n.scene.add(this.root),
      this.deskPos.set(n.caster.x + r * 0.62, 0, 0.12),
      this.desk.position.copy(this.deskPos).setY(-0.9),
      (this.desk.rotation.y = r > 0 ? 0 : Math.PI),
      this.root.add(this.desk),
      (this.deskGlow = nt(co, 2.2, 0)),
      this.deskGlow.position.copy(this.deskPos).setY(0.9),
      this.deskLight.position.copy(this.deskPos).setY(1.4),
      this.keyLight.position.set(n.caster.x + r * 0.9, 2.3, 2),
      this.root.add(this.deskGlow, this.deskLight, this.keyLight));
    let i = po(`order`, yo),
      a = new x({
        color: i ? 16777215 : 16183516,
        map: i,
        roughness: 0.8,
        side: 2,
      });
    ((this.paper = new p(new f(0.3, 0.4), a)),
      (this.paper.rotation.x = -Math.PI / 2),
      (this.paper.rotation.z = r > 0 ? Math.PI / 2 : -Math.PI / 2),
      (this.paper.visible = !1),
      this.desk.add(this.paper),
      this.paper.position.set(-0.08, 0.795, 0),
      (this.folder = new p(new f(0.42, 0.56), a)),
      (this.folder.visible = !1),
      this.root.add(this.folder),
      (this.marker.visible = !1),
      this.root.add(this.marker));
    let o = po(`ring`, vo),
      s = new g({
        color: o ? 16777215 : so,
        map: o,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
        side: 2,
      });
    ((this.ring = new p(new Fe(1.15, 48), s)),
      (this.ring.rotation.x = -Math.PI / 2),
      this.ring.position.set(n.target.x, 0.03, 0),
      this.ringLight.position.set(n.target.x, 0.8, 0.4),
      this.root.add(this.ring, this.ringLight),
      (this.stamp.root.visible = !1),
      this.root.add(this.stamp.root));
    let l = po(`ink`, bo);
    ((this.ink = new p(
      new f(1.6, 0.8),
      new g({
        color: l ? 16777215 : so,
        map: l,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
      }),
    )),
      (this.ink.rotation.x = -Math.PI / 2),
      (this.ink.visible = !1),
      this.root.add(this.ink));
    let u = po(`crate`, go),
      d = lo(u ? 16777215 : 11565630, 0.75, { map: u }),
      m = new C(0.42, 0.42, 0.42),
      { CRATES: h, TAGS: _, SHOW_END: v, STAMP_IN: y } = t,
      b = y + 0.9 - v;
    for (let e = 0; e < h; e++) {
      let t = new p(m, d);
      ((t.visible = !1),
        (t.castShadow = !k),
        this.root.add(t),
        this.crates.push({
          m: t,
          at: v + (e / h) * b,
          phase: (e * 2.399) % (Math.PI * 2),
          r: 1 + (e % 4) * 0.26,
          h: 2 + ((e * 7) % 11) * 0.2,
          spin: new T(Math.random() * 3, Math.random() * 3, Math.random() * 3),
          vel: new T(),
          bounces: 0,
          free: !1,
        }));
    }
    let ee = new f(0.36, 0.18),
      S = [`+50%`, `+25%`, `+100%`, `TAX!`].map((e) => {
        let t = po(`tag:${e}`, () => _o(e));
        return new g({
          color: t ? 16777215 : so,
          map: t,
          transparent: !0,
          alphaTest: 0.3,
          side: 2,
        });
      });
    for (let e = 0; e < _; e++) {
      let t = new p(ee, S[e % S.length]);
      ((t.visible = !1),
        this.root.add(t),
        this.tags.push({
          m: t,
          at: v + 0.1 + (e / _) * b,
          phase: (e * 1.7) % (Math.PI * 2),
          r: 0.55 + (e % 3) * 0.3,
          h: 1.8 + (e % 5) * 0.3,
          spin: new T(0, 2 + Math.random() * 3, 0),
          vel: new T(),
          bounces: 0,
          free: !1,
        }));
    }
    let te = po(`bill`, xo),
      re = new g({ color: te ? 16777215 : 8368762, map: te, side: 2 }),
      ie = new f(0.26, 0.11);
    for (let e = 0; e < 16; e++) {
      let e = new p(ie, re);
      ((e.visible = !1),
        this.root.add(e),
        this.bills.push({
          m: e,
          at: 0,
          phase: Math.random() * Math.PI * 2,
          r: 0,
          h: 0,
          spin: new T(Math.random() * 4, Math.random() * 4, Math.random() * 4),
          vel: new T(),
          bounces: 0,
          free: !1,
        }));
    }
    (n.audio.startSuperBed(t.STAMP / Qe, `tariff`), n.audio.whoosh());
  }
  presentPose(e) {
    return M(R(e, `trump`), {
      rootY: 0,
      ...L(0, 0.12, -0.14),
      hipsT: 0,
      spineT: 0,
      spineF: -0.08,
      chestF: -0.05,
      headF: -0.2,
      headT: 0.3,
      lShF: 0.65,
      lShO: 0.95,
      lShT: 0.4,
      lEl: 0.35,
      lHand: 1,
      rShF: 0.65,
      rShO: 0.95,
      rShT: 0.4,
      rEl: 0.35,
      rHand: 1,
    });
  }
  signPose(e) {
    let t = Math.sin(e * 19),
      n = Math.cos(e * 13);
    return M(R(e, `trump`), {
      rootY: -0.06,
      ...L(-0.06, 0.2, -0.22),
      hipsT: 0,
      spineT: 0.05,
      spineF: 0.36,
      headF: 0.38,
      headT: 0.1,
      rShF: 0.95 + t * 0.07,
      rShO: 0.18 + n * 0.12,
      rShT: 0.1,
      rEl: 0.85 + t * 0.08,
      rHand: 0,
      lShF: 0.78,
      lShO: 0.3,
      lShT: -0.1,
      lEl: 0.55,
      lHand: 1,
    });
  }
  showPose(e) {
    let t = Math.sin(e * 6) * 0.04;
    return M(R(e, `trump`), {
      rootY: 0,
      ...L(0, 0.12, -0.14),
      hipsT: 0,
      spineT: 0.15,
      spineF: -0.12,
      chestF: -0.05,
      headF: -0.18,
      headT: 0.45,
      lShF: 1.75 + t,
      lShO: 0.12,
      lShT: 0.45,
      lEl: 1,
      lHand: 0.3,
      rShF: 1.75 + t,
      rShO: 0.12,
      rShT: 0.45,
      rEl: 1,
      rHand: 0.3,
    });
  }
  commandPose(e) {
    let t = Math.sin(e * 7) * 0.05;
    return M(R(e, `trump`), {
      rootY: -0.02,
      ...L(-0.02, 0.16, -0.18),
      hipsT: 0.1,
      spineT: 0.1,
      spineF: -0.14,
      chestF: -0.06,
      headF: -0.42,
      headT: 0.3,
      rShF: 2.95 + t,
      rShO: 0.15,
      rShT: 0.1,
      rEl: 0.05,
      rHand: 0.35,
      lShF: -0.15,
      lShO: 0.55,
      lShT: -0.4,
      lEl: 1.75,
      lHand: 0,
    });
  }
  chopPose(e, t) {
    return M(this.commandPose(e), {
      rShF: 2.95 - t * 1.85,
      rEl: 0.05 + t * 0.1,
      spineF: -0.14 + t * 0.3,
      headF: -0.42 + t * 0.4,
      rootY: -0.02 - t * 0.06,
    });
  }
  gloatPose(e) {
    let t = Math.sin(e * 3.4);
    return M(R(e, `trump`), {
      rootY: 0,
      ...L(0, 0.12, -0.12),
      hipsT: 0,
      spineT: 0.05,
      spineF: -0.06,
      chestF: -0.05,
      headT: 0.55,
      headF: -0.22,
      headS: t * 0.06,
      lShF: 1.05,
      lShO: 0.25 + t * 0.22,
      lShT: 0.35,
      lEl: 1.1,
      lHand: 1,
      rShF: 1.05,
      rShO: 0.25 + t * 0.22,
      rShT: 0.35,
      rEl: 1.1,
      rHand: 1,
    });
  }
  lookUpPose(e, t) {
    let n = Math.sin(e * 28) * 0.1 * t;
    return M(z(e, this.d.target.char.id), {
      spineF: -0.1 - t * 0.12,
      headF: -0.2 - t * 0.45 + n * 0.3,
      headT: 0.15,
      lShF: 0.6 + t * 1.9 + n,
      lShO: 0.45,
      lShT: 0.2,
      lEl: 1.2 + t * 0.2,
      lHand: 1,
      rShF: 0.6 + t * 1.9 - n,
      rShO: 0.45,
      rShT: 0.2,
      rEl: 1.2 + t * 0.2,
      rHand: 1,
    });
  }
  squashedPose(e) {
    return M(z(e, this.d.target.char.id), {
      rootY: -0.3,
      ...L(-0.3, 0.3, -0.3),
      spineF: 0.45,
      headF: 0.3,
      lShF: 2.2,
      lShO: 0.9,
      lEl: 0.6,
      lHand: 1,
      rShF: 2.2,
      rShO: 0.9,
      rEl: 0.6,
      rHand: 1,
    });
  }
  step(e) {
    let n = this.d,
      {
        DESK_UP: r,
        SIGN_END: i,
        SHOW_END: a,
        STAMP: o,
        STAMP_IN: s,
        LIFT: c,
        END: l,
      } = t,
      u = this.t;
    this.advance(e, o);
    let d = this.t,
      f = n.caster,
      p = n.target,
      m = f.facing,
      h = (e) => d >= e && u < e,
      g = n.clipTime() !== null;
    (!g && h(0.15) && n.speech(`caster`, `Tariff time!`),
      !g && h(a - 0.4) && n.speech(`caster`, `Beautiful, isn't it?`),
      !g && h(s + 0.2) && n.speech(`caster`, `Fifty percent. Tremendous!`),
      (this.casterPose =
        d < r
          ? N(R(d, `trump`), this.presentPose(d), F(d / 0.3))
          : d < i
            ? N(this.presentPose(d), this.signPose(d), I((d - r) / 0.3))
            : d < a
              ? N(this.signPose(d), this.showPose(d), F((d - i) / 0.25))
              : d < o - 0.35
                ? N(this.showPose(d), this.commandPose(d), I((d - a) / 0.35))
                : d < c
                  ? this.chopPose(d, F(P((d - o + 0.35) / 0.3)))
                  : N(
                      this.chopPose(d, 1),
                      this.gloatPose(d),
                      I((d - c) / 0.4),
                    )),
      d < a
        ? ((this.targetPose = z(d, p.char.id)), this.settleTarget(e))
        : d < o
          ? ((this.targetPose = this.lookUpPose(d, P((d - a) / 1.2))),
            this.settleTarget(e),
            h(s - 0.4) &&
              n.speech(
                `target`,
                {
                  modi: `Mitron... yeh kya aa raha hai?!`,
                  rahul: `Bhai, yeh tariff nahi, tsunami hai!`,
                  didi: `Ei! Eta ki tariff?!`,
                  trump: `Fake tariff!`,
                  yogi: `Tariff? Hum swadeshi hain!`,
                  nitin: `Tariff se pehle toll toh bharo!`,
                  mbapu: `Shanti apnao, tariff bhulao!`,
                }[p.char.id],
              ))
          : d < c
            ? (this.targetPose = this.squashedPose(d))
            : ((this.targetPose = null), p.update(Ur(), f.x)),
      this.stepDesk(d, u),
      this.stepRing(d, e),
      this.stepChant(d),
      this.stepCrates(d, e),
      this.stepTags(d, e),
      this.stepStamp(d, u),
      this.stepBills(d, e),
      this.stepSquash(d, e),
      this.stepInk(d),
      !this.stamped &&
        d >= o &&
        ((this.stamped = !0),
        n.audio.superRelease(`tariff`),
        n.audio.stampSlam(),
        n.audio.crateCrash(),
        n.audio.coins(16),
        n.flash(`rgba(255,235,200,0.9)`, 220),
        n.cam.shake(0.5, 0.7),
        this.v1.set(p.x, 0.06, 0),
        n.fx.shockwave(this.v1, so, 0.7, 2.2),
        n.fx.shockwave(this.v1, 16777215, 0.5, 1.4),
        n.fx.dust(this.v1, 2.5),
        n.fx.particles.emit(this.v1.set(p.x, 0.4, 0), {
          count: 90,
          speed: 6,
          color: co,
          life: 1.2,
          size: 0.12,
          gravity: 9,
          drag: 0.8,
          dir: uo,
          spread: 1.1,
        }),
        n.fx.particles.emit(this.v1, {
          count: 40,
          speed: 4,
          color: 16777215,
          life: 0.6,
          size: 0.3,
          gravity: 1,
          drag: 3,
        }),
        n.popup(`TARIFFED!`, this.v2.set(p.x, 2.4, 0.3), `#ff4040`),
        n.arena.cheer(1.5),
        this.burst(p.x)),
      !this.lifted &&
        d >= c &&
        ((this.lifted = !0),
        this.landSuperHit(p.hp, m, 3.4, 6.5),
        n.audio.thud(),
        n.audio.kaching(1),
        n.cam.shake(0.2, 0.3),
        n.popup(`-30%`, this.v1.set(p.x, 2, 0.3), `#ffd23f`),
        n.speech(`caster`, `Tremendous!`)),
      this.stepCamera(d),
      (this.keyLight.intensity =
        2.6 * F(P(d / 0.4)) * (1 - P((d - (l - 0.6)) / 0.5))),
      d >= l && ((f.y = 0), (this.done = !0)));
  }
  stepDesk(e, n) {
    let r = this.d,
      { DESK_UP: i, SIGN_END: a, SHOW_END: o, LIFT: s, END: c } = t,
      l = r.caster.facing,
      u = F(P((e - 0.1) / (i - 0.1)));
    (e > s + 0.4 && (u *= 1 - I(P((e - s - 0.4) / (c - s - 0.8)))),
      (this.desk.position.y = -0.9 * (1 - u)),
      (this.desk.visible = u > 0.01));
    let d = Math.max(0, 1 - Math.abs(e - i) / 0.5);
    ((this.deskGlow.material.opacity = d * 0.7),
      (this.deskLight.intensity = (d * 2 + (e > i && e < o ? 0.8 : 0)) * u),
      e > 0.1 &&
        n <= 0.1 &&
        (r.fx.particles.emit(this.v1.copy(this.deskPos).setY(0.1), {
          count: 50,
          speed: 2.5,
          color: co,
          life: 0.9,
          size: 0.12,
          gravity: -1,
          drag: 2,
        }),
        r.fx.dust(this.v1, 1.2),
        r.audio.thud()));
    let f = e > i && e < a;
    ((this.paper.visible = f),
      (this.marker.visible = f),
      e > i + 0.05 &&
        n <= i + 0.05 &&
        r.audio.penScribble((a - i - 0.1) / Qe, 7),
      f &&
        (r.casterRig.handWorld(`r`, this.v1),
        this.marker.position.copy(this.v1),
        this.marker.rotation.set(
          Math.sin(e * 19) * 0.25,
          0,
          l * (0.35 + Math.cos(e * 13) * 0.15),
        ),
        Math.random() < 0.3 &&
          (this.v2.copy(this.v1).setY(this.v1.y - 0.2),
          r.fx.particles.emit(this.v2, {
            count: 1,
            speed: 0.4,
            color: co,
            life: 0.4,
            size: 0.05,
            drag: 3,
          }))));
    let p = e >= a && e < o + 0.6;
    if (
      ((this.folder.visible = p),
      m(a) &&
        (r.popup(`SIGNED!`, this.v1.set(r.caster.x, 2.35, 0.3), `#ffd23f`),
        r.audio.cameraClicks(8),
        r.audio.kaching(0.8),
        r.flash(`rgba(255,255,255,0.5)`, 90),
        r.arena.cheer(0.8)),
      p)
    ) {
      let t = r.casterRig.handWorld(`l`, this.v1),
        n = r.casterRig.handWorld(`r`, this.v2);
      (this.v3.addVectors(t, n).multiplyScalar(0.5), (this.v3.y += 0.18));
      let i = P((e - o) / 0.6);
      ((this.v3.y += i * i * 4),
        this.folder.position.copy(this.v3),
        this.folder.rotation.set(0, l * 0.35, i * 6 * l),
        this.folder.scale.setScalar(1 - i * 0.6),
        e < o && Math.random() < 0.12 && r.flash(`rgba(255,255,255,0.35)`, 60));
    }
    function m(t) {
      return e >= t && n < t;
    }
  }
  stepRing(e, n) {
    let { SHOW_END: r, LIFT: i, STAMP: a } = t,
      o = this.d.target,
      s = F(P((e - r) / 0.6)),
      c = e < i ? 1 : 1 - P((e - i) / 0.5),
      l = P((e - r) / (a - r));
    ((this.ring.position.x = this.ringLight.position.x = o.x),
      this.ring.scale.setScalar(Math.max(0.001, s * (1.25 - l * 0.25))),
      (this.ring.rotation.z += n * (0.6 + l * 3)));
    let u = this.ring.material;
    ((u.opacity = (0.55 + Math.sin(e * (6 + l * 14)) * 0.2 * l) * s * c),
      (this.ringLight.intensity = (0.5 + l * 1.5) * s * c));
  }
  stepChant(e) {
    let n = this.d,
      { STAMP_IN: r, CHANT: i } = t;
    if (e < this.nextChant || e > r + 0.6) return;
    let a = i[this.chantIdx % i.length],
      o = this.chantIdx % 2 == 0 ? -1 : 1,
      s = n.target,
      c = (n.caster.x + s.x) / 2;
    (n.popup(
      a,
      this.v1.set(
        c + o * (0.8 + Math.random() * 0.5),
        2.2 + Math.random() * 0.6,
        0.3,
      ),
      o < 0 ? `#ff4040` : `#5aa0ff`,
    ),
      n.arena.cheer(0.5),
      this.chantIdx++);
    let l = P((e - t.SHOW_END) / (r - t.SHOW_END));
    ((this.nextChant = e + 0.55 - l * 0.3),
      this.chantIdx === 1 && n.audio.drumroll((t.STAMP - e) / Qe));
  }
  orbit(e, t, n, r, i) {
    let a = this.d.target,
      o = e.phase + t * n,
      s = e.r * r;
    return i.set(
      a.x + Math.cos(o) * s,
      e.h + Math.sin(t * 2 + e.phase) * 0.15,
      Math.sin(o) * s * 0.75,
    );
  }
  stepCrates(e, n) {
    let r = this.d,
      { SHOW_END: i, STAMP: a, END: o } = t,
      s = P((e - i) / (a - i)),
      c = 1.2 + s * s * 3.5,
      l = 1 - I(P((e - a + 0.5) / 0.5)) * 0.45;
    for (let t of this.crates)
      if (
        !(e < t.at) &&
        (!t.m.visible &&
          !t.free &&
          e < a &&
          ((t.m.visible = !0),
          this.spawned++,
          this.spawned % 3 == 1 ? r.audio.kaching(0.45) : r.audio.whoosh()),
        t.m.visible)
      ) {
        if (t.free) {
          this.fall(t, n, 0.21, 16, 0.38);
          let r = P((e - (o - 0.7)) / 0.6);
          (t.m.scale.setScalar(Math.max(0.001, 1 - r)),
            r >= 1 && (t.m.visible = !1));
        } else {
          let r = this.orbit(t, e, c, l, this.v1),
            i = F(P((e - t.at) / 0.55));
          (t.m.position.set(r.x, 10 + (r.y - 10) * i, r.z),
            (t.m.rotation.x += t.spin.x * n),
            (t.m.rotation.y += t.spin.y * n),
            (t.m.rotation.z += t.spin.z * n),
            t.m.scale.setScalar(Math.max(0.001, 0.4 + i * 0.6)));
        }
      }
  }
  stepTags(e, n) {
    let { SHOW_END: r, STAMP: i, END: a } = t,
      o = P((e - r) / (i - r)),
      s = -(1.6 + o * o * 4);
    for (let t of this.tags)
      if (!(e < t.at)) {
        if (t.free)
          ((t.m.position.x += t.vel.x * n),
            (t.m.position.z += t.vel.z * n),
            (t.vel.x *= 1 - 1.5 * n),
            (t.vel.z *= 1 - 1.5 * n),
            (t.m.position.y = Math.max(0.02, t.m.position.y - n * 0.9)),
            (t.m.position.x += Math.sin(e * 4 + t.phase) * n * 0.6),
            (t.m.rotation.y += t.spin.y * n),
            (t.m.rotation.x = Math.sin(e * 6 + t.phase) * 0.6),
            (t.m.visible = e < a - 0.2));
        else {
          t.m.visible = !0;
          let r = this.orbit(t, e, s, 1, this.v1),
            i = F(P((e - t.at) / 0.5));
          (t.m.position.set(r.x, 9 + (r.y - 9) * i, r.z),
            (t.m.rotation.y += t.spin.y * n),
            (t.m.rotation.z = Math.sin(e * 5 + t.phase) * 0.4));
        }
      }
  }
  stepBills(e, n) {
    let { END: r } = t;
    for (let t of this.bills)
      t.free &&
        (t.vel.multiplyScalar(1 - 2.2 * n),
        (t.vel.y -= 2.5 * n),
        (t.vel.y = Math.max(t.vel.y, -0.8)),
        t.m.position.addScaledVector(t.vel, n),
        (t.m.position.x += Math.sin(e * 5 + t.phase) * n * 0.5),
        (t.m.position.y = Math.max(0.02, t.m.position.y)),
        (t.m.rotation.x += t.spin.x * n),
        (t.m.rotation.y += t.spin.y * n),
        (t.m.visible = e < r - 0.15));
  }
  fall(e, t, n, r, i) {
    ((e.vel.y -= r * t),
      e.m.position.addScaledVector(e.vel, t),
      (e.m.rotation.x += e.spin.x * t),
      (e.m.rotation.z += e.spin.z * t),
      e.m.position.y < n &&
        ((e.m.position.y = n),
        e.vel.y < -1 && e.bounces < 2
          ? ((e.vel.y = -e.vel.y * i),
            e.bounces++,
            e.bounces === 1 && Math.random() < 0.4 && this.d.audio.thud())
          : (e.vel.y = 0),
        (e.vel.x *= 0.6),
        (e.vel.z *= 0.6),
        e.spin.multiplyScalar(0.5)));
  }
  burst(e) {
    for (let t of this.crates) {
      if (!t.m.visible) continue;
      t.free = !0;
      let n = t.m.position.x - e,
        r = t.m.position.z,
        i = Math.hypot(n, r) || 1,
        a = 3 + Math.random() * 3.5;
      (t.vel.set((n / i) * a, 2 + Math.random() * 4, (r / i) * a * 0.6),
        t.spin.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 12,
        ));
    }
    for (let e of this.tags)
      e.m.visible &&
        ((e.free = !0),
        e.vel.set((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 2));
    for (let t of this.bills) {
      ((t.free = !0),
        (t.m.visible = !0),
        t.m.position.set(
          e + (Math.random() - 0.5) * 0.5,
          0.6 + Math.random() * 0.6,
          (Math.random() - 0.5) * 0.4,
        ));
      let n = Math.random() * Math.PI * 2;
      t.vel.set(
        Math.cos(n) * (2 + Math.random() * 3),
        3 + Math.random() * 3,
        Math.sin(n) * 1.5,
      );
    }
  }
  stepStamp(e, n) {
    let r = this.d,
      { STAMP_IN: i, STAMP: a, LIFT: o, END: s } = t,
      c = this.stamp,
      l = r.target;
    if (((c.root.visible = e >= i && e < s - 0.3), !c.root.visible)) return;
    e >= i &&
      n < i &&
      (r.audio.whoosh(),
      r.popup(`TARIFF STAMP!`, this.v1.set(l.x, 3.6, 0.3), `#ffd23f`));
    let u = 0.66,
      d;
    if (e < a - 0.4)
      d = 10 + -6.8 * F(P((e - i) / 0.5)) + Math.sin(e * 9) * 0.05;
    else if (e < a) {
      let t = (e - (a - 0.4)) / 0.4;
      d =
        t < 0.5
          ? 3.2 + F(t / 0.5) * 0.5
          : 3.7 - 3.04 * ((t - 0.5) / 0.5) ** 2.2;
    } else
      d =
        e < o
          ? u +
            Math.max(0, Math.sin((e - a) * 18) * 0.05 * Math.exp(-(e - a) * 6))
          : u + I(P((e - o) / 0.6)) * 9;
    (c.root.position.set(l.x, d, 0),
      (c.root.rotation.y = Math.sin(e * 2) * 0.08),
      (c.light.intensity =
        e < a ? 1.2 + Math.sin(e * 20) * 0.3 : Math.max(0, 2.5 - (e - a) * 4)));
  }
  stepSquash(e, n) {
    let { LIFT: r } = t,
      i = this.d.targetRig.root;
    if (!this.stamped) return;
    let a;
    if (e < r) a = 0.42;
    else {
      let t = e - r;
      ((a = 1 + Math.sin(t * 22) * 0.35 * Math.exp(-t * 7)),
        t > 0.6 && (a = 1));
    }
    let o = 1 + (1 - a) * 0.6;
    i.scale.set(o, a, o);
  }
  stepInk(e) {
    let { LIFT: n, END: r } = t,
      i = this.d.target;
    if (e < n) return;
    this.ink.visible ||
      ((this.ink.visible = !0),
      this.ink.position.set(i.x, 0.035, 0.1),
      (this.ink.rotation.z = (Math.random() - 0.5) * 0.4));
    let a = P((e - n) / 0.15);
    this.ink.material.opacity = a * (1 - P((e - (r - 0.8)) / 0.7));
  }
  stepCamera(e) {
    let n = this.d,
      {
        DESK_UP: r,
        SIGN_END: i,
        SHOW_END: a,
        STAMP_IN: o,
        STAMP: s,
        LIFT: c,
      } = t,
      l = n.caster,
      u = n.target,
      d = l.facing,
      f = this.v1,
      p = this.v2,
      m = (l.x + u.x) / 2;
    if (e < r)
      (f.set(l.x + d * 0.4, 1, 0),
        p.set(l.x + d * 1.9, 1.25, 2.9),
        n.cam.set(p, f, e < 0.15 ? 10 : 3.5, 40));
    else if (e < i) {
      let t = (e - r) / (i - r);
      (f.set(l.x + d * 0.3, 1.2, 0.05),
        p.set(l.x + d * (0.55 + t * 0.15), 1.75 - t * 0.1, 2.75 - t * 0.2),
        n.cam.set(p, f, 3, 40));
    } else
      e < a
        ? (f.set(l.x + d * 0.15, 1.55, 0),
          p.set(l.x + d * 0.5, 1.6, 2.7),
          n.cam.set(p, f, 4, 38))
        : e < o
          ? (f.set(m + d * 0.35, 2, 0),
            p.set(m - d * 0.2, 1.2, 6.6),
            n.cam.set(p, f, 2, 48))
          : e < s
            ? (f.set(u.x, 2.4, 0),
              p.set(u.x - d * 1.8, 1, 5),
              n.cam.set(p, f, 3, 50))
            : e < c + 0.3
              ? (f.set(u.x - d * 0.3, 1, 0),
                p.set(m, 2, 6.4),
                n.cam.set(p, f, 5, 46))
              : (f.set((m + u.x) / 2, 0.9, 0),
                p.set(m, 1.9, 6.8),
                n.cam.set(p, f, 2.5, 42));
  }
  dispose() {
    let e = this.d;
    (e.audio.stopSuperBed(0.3),
      e.targetRig.root.scale.set(1, 1, 1),
      e.scene.remove(this.root));
    let t = new Set();
    this.root.traverse((e) => {
      let n = e;
      n.geometry && n.geometry.dispose();
      let r = n.material;
      r && (Array.isArray(r) ? r : [r]).forEach((e) => t.add(e));
    });
    for (let e of t) {
      let t = e.map;
      (t && !t.userData.shared && t.dispose(), e.dispose());
    }
  }
};
((oo = To),
  e(To, `DESK_UP`, 0.6),
  e(To, `SIGN_END`, 2),
  e(To, `SHOW_END`, 2.8),
  e(To, `STAMP`, 5),
  e(To, `STAMP_IN`, 3.5),
  e(To, `LIFT`, oo.STAMP + 0.6),
  e(To, `END`, oo.STAMP + 2.4),
  e(To, `CRATES`, 20),
  e(To, `TAGS`, 10),
  e(To, `CHANT`, [
    `TARIFF!`,
    `TARIFF!!`,
    `50%!`,
    `HUGE!`,
    `TARIFF!`,
    `TREMENDOUS!`,
  ]));
var Eo = `/fightkaro/models/${k ? `mobile/` : ``}`,
  Do = `?v=20261101_smooth`,
  Oo = {
    modi: `${Eo}modi.glb${Do}`,
    rahul: `${Eo}rahul.glb${Do}`,
    didi: `${Eo}didi.glb${Do}`,
    trump: `${Eo}trump.glb${Do}`,
    yogi: `${Eo}yogi.glb${Do}`,
    nitin: `${Eo}nitin.glb${Do}`,
    mbapu: `${Eo}mbapu.glb${Do}`,
  },
  ko = {
    modi: `/fightkaro/models/modi.glb${Do}`,
    rahul: `/fightkaro/models/rahul.glb${Do}`,
    didi: `/fightkaro/models/didi.glb${Do}`,
    trump: `/fightkaro/models/trump.glb${Do}`,
    yogi: `/fightkaro/models/yogi.glb${Do}`,
    nitin: `/fightkaro/models/nitin.glb${Do}`,
    mbapu: `/fightkaro/models/mbapu.glb${Do}`,
  },
  Ao = { bulldozer: { url: `${Eo}bull1.glb${Do}`, owner: `yogi` } },
  jo = {};
function Mo(e) {
  let t = jo[e];
  return t ? t.clone(!0) : null;
}
var No = 1.32;
function Po(e) {
  for (let t of e)
    t.tracks = t.tracks.filter((e) => !/Head(?!Top)[^.]*\.scale$/.test(e.name));
}
var Fo = b.degToRad(82),
  Io = new T(1, 0, 0),
  Lo = new T(0, 1, 0),
  Ro = new T(0, 0, 1),
  zo = [`Index`, `Middle`, `Ring`, `Pinky`],
  Bo = [1.45, 1.6, 1.05],
  Vo = [0.18, 0.22, 0.12],
  Ho = {},
  Uo = null;
function Wo(e) {
  if (!Uo) {
    let t = new xe(e);
    ((Uo = t.fromScene(new Me(), 0.04).texture), t.dispose());
  }
  return Uo;
}
async function Go(e, t) {
  let n = new ve(),
    r = new Ce();
  r.setDRACOLoader(n);
  let i = Wo(e),
    a = (t ?? Gr).filter((e) => e in Oo && !Ho[e]),
    o = [],
    s = Object.keys(Ao).filter((e) => a.includes(Ao[e].owner) && !jo[e]);
  return (
    await Promise.all([
      ...s.map(async (e) => {
        try {
          let t = await r.loadAsync(Ao[e].url);
          (Zo(t.scene),
            es(t.scene, i),
            t.scene.traverse((e) => {
              let t = e;
              if (!t.isMesh) return;
              t.geometry.userData.shared = !0;
              let n = Array.isArray(t.material) ? t.material : [t.material];
              for (let e of n) {
                e.userData.shared = !0;
                let t = e.map;
                t && (t.userData.shared = !0);
              }
            }),
            (jo[e] = t.scene));
        } catch (t) {
          console.warn(
            `[models] prop ${e} failed to load, using a stand-in`,
            t,
          );
        }
      }),
      ...a.map(async (e) => {
        try {
          let t = await r
              .loadAsync(Oo[e])
              .catch(() =>
                new Promise((e) => setTimeout(e, 600)).then(() =>
                  r.loadAsync(Oo[e]),
                ),
              )
              .catch(() => r.loadAsync(ko[e])),
            n = t.scene;
          (Po(t.animations), Zo(n), es(n, i), n.updateMatrixWorld(!0));
          let a = is(n, `LeftUpLeg`);
          ((Ho[e] = {
            scene: n,
            scale: Ze / (a ? a.getWorldPosition(new T()).y : Ze),
            dance: t.animations.find((e) => e.name === `dance`) ?? null,
            clips: e === `mbapu` ? t.animations : [],
          }),
            o.push(e));
        } catch (t) {
          console.warn(`[models] ${e} failed to load`, t);
        }
      }),
    ]),
    n.dispose(),
    o
  );
}
function Ko(e) {
  return e in Ho;
}
async function qo(e, t, n) {
  if (Ho[e]) return (n?.(100), !0);
  let r = new ve(),
    i = new Ce();
  i.setDRACOLoader(r);
  let a = Wo(t),
    o = Oo[e] || ko[e];
  try {
    let t = await fetch(o);
    if (!t.ok) throw Error(`HTTP ${t.status}`);
    let s = Number(t.headers.get(`content-length`)) || (k ? 13e5 : 22e5),
      c = 0,
      l = t.body?.getReader(),
      u = [];
    if (l)
      for (;;) {
        let { done: e, value: t } = await l.read();
        if (e) break;
        (u.push(t),
          (c += t.length),
          n?.(Math.min(92, Math.round((c / s) * 92))));
      }
    let d = new Uint8Array(c),
      f = 0;
    for (let e of u) (d.set(e, f), (f += e.length));
    let p = await new Promise((e, t) => {
        i.parse(d.buffer, ``, e, t);
      }),
      m = p.scene;
    (Po(p.animations), Zo(m), es(m, a), m.updateMatrixWorld(!0));
    let h = is(m, `LeftUpLeg`);
    Ho[e] = {
      scene: m,
      scale: Ze / (h ? h.getWorldPosition(new T()).y : Ze),
      dance: p.animations.find((e) => e.name === `dance`) ?? null,
      clips: e === `mbapu` ? p.animations : [],
    };
    let g = Object.keys(Ao).filter((t) => Ao[t].owner === e && !jo[t]);
    for (let e of g)
      try {
        let t = await i.loadAsync(Ao[e].url);
        (Zo(t.scene),
          es(t.scene, a),
          t.scene.traverse((e) => {
            if (!e.isMesh) return;
            e.geometry.userData.shared = !0;
            let t = Array.isArray(e.material) ? e.material : [e.material];
            for (let e of t)
              ((e.userData.shared = !0), e.map && (e.map.userData.shared = !0));
          }),
          (jo[e] = t.scene));
      } catch (t) {
        console.warn(`[models] prop ${e} failed to load`, t);
      }
    return (n?.(100), r.dispose(), !0);
  } catch (n) {
    return (
      console.warn(
        `[models] progress download failed for ${e}, falling back`,
        n,
      ),
      r.dispose(),
      Jo(e, t)
    );
  }
}
async function Jo(e, t) {
  return Ho[e] ? !0 : (await Go(t, [e])).includes(e);
}
function Yo(e) {
  let t = new Set(),
    n = [],
    r = Ho[e];
  r && n.push(r.scene);
  for (let [t, r] of Object.entries(Ao)) {
    let i = jo[t];
    r.owner === e && i && n.push(i);
  }
  for (let e of n)
    e.traverse((e) => {
      let n = e.material;
      if (n)
        for (let e of Array.isArray(n) ? n : [n])
          for (let n of Object.values(e)) {
            let e = n;
            e?.isTexture && !e.isRenderTargetTexture && e.image && t.add(e);
          }
    });
  return t;
}
function Xo(e, t = !1) {
  let n = Ho[e.id];
  if (!n) throw Error(`${e.id}: model not loaded`);
  return new ls(e, n, t);
}
function Zo(e, t = 1024) {
  if (!k) return;
  let n = new Set();
  e.traverse((e) => {
    let r = e.material;
    if (r)
      for (let e of Array.isArray(r) ? r : [r])
        for (let r of Object.values(e)) {
          let e = r;
          if (!e?.isTexture || n.has(e)) continue;
          n.add(e);
          let i = e.image;
          if (!i || Math.max(i.width, i.height) <= t) continue;
          let a = t / Math.max(i.width, i.height),
            o = document.createElement(`canvas`);
          ((o.width = Math.round(i.width * a)),
            (o.height = Math.round(i.height * a)),
            o.getContext(`2d`)?.drawImage(i, 0, 0, o.width, o.height),
            i.close?.(),
            (e.image = o),
            (e.needsUpdate = !0));
        }
  });
}
var Qo = [
  {
    re: /^outfit_(top|bottom)$|^didi_(sari|blouse)$|^yogi_body$|^nitin_body$/,
    mode: `all`,
  },
  { re: /^trump_body$/, mode: `blue` },
];
function $o(e, t) {
  let n = e.clone(),
    r = t === `all` ? `1.0` : `clamp((c.b - max(c.r, c.g)) * 14.0, 0.0, 1.0)`;
  return (
    (n.onBeforeCompile = (e) => {
      e.fragmentShader = e.fragmentShader.replace(
        `#include <map_fragment>`,
        `#include <map_fragment>
      {
        vec3 c = diffuseColor.rgb;
        float m = ${r};
        vec3 yiq = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312) * c;
        float h = atan(yiq.z, yiq.y) + 3.14159265;
        yiq.yz = length(yiq.yz) * vec2(cos(h), sin(h));
        vec3 r = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703) * yiq;
        // Low-saturation cloth: tint it (white → light blue, grey/navy → charcoal) so the twin is obvious.
        float sat = length(yiq.yz);
        float luma = yiq.x;
        vec3 tint = luma > 0.5 ? vec3(0.62, 0.78, 1.0) * luma * 1.05 : vec3(luma * 1.15, luma * 1.05, luma * 0.95);
        r = mix(tint, r, clamp(sat * 9.0, 0.0, 1.0));
        ${t === `blue` ? `r = vec3(0.30, 0.29, 0.27) + vec3(luma * 2.2);` : ``}
        diffuseColor.rgb = mix(c, clamp(r, 0.0, 1.0), m);
      }`,
      );
    }),
    (n.customProgramCacheKey = () => `alt-costume-${t}`),
    n
  );
}
function es(e, t) {
  e.traverse((e) => {
    let n = e;
    if (!n.isMesh) return;
    ((n.castShadow = !0), (n.receiveShadow = !0), (n.frustumCulled = !1));
    let r = Array.isArray(n.material) ? n.material : [n.material];
    for (let e of r) {
      if (!e.isMeshStandardMaterial) continue;
      ((e.envMap = t), (e.envMapIntensity = 0.55));
      let n = e.name;
      /AvatarHead|AvatarBody/.test(n)
        ? (e.roughness = 0.6)
        : /trump_head|yogi_head|nitin_head/.test(n)
          ? ((e.roughness = 0.62), (e.metalness = 0))
          : /trump_body/.test(n)
            ? ((e.roughness = 0.78),
              (e.metalness = 0),
              (e.envMapIntensity = 0.6))
            : n === `bulldozer`
              ? ((e.roughness = 0.66),
                (e.metalness = 0.05),
                (e.envMapIntensity = 0.45))
              : /outfit|didi_(sari|blouse|chappal)|yogi_body|nitin_body/.test(n)
                ? ((e.roughness = 0.88), (e.envMapIntensity = 0.35))
                : /Cornea/.test(n)
                  ? ((e.roughness = 0.05), (e.envMapIntensity = 1.2))
                  : /Eyelashes/.test(n)
                    ? e.color.setRGB(0.04, 0.03, 0.03)
                    : n === `glasses` && ts(e);
    }
  });
}
function ts(e) {
  let t = e.map?.image;
  if (!t || !t.width) return;
  let n = document.createElement(`canvas`);
  ((n.width = t.width), (n.height = t.height));
  let r = n.getContext(`2d`, { willReadFrequently: !0 });
  if (!r) return;
  r.drawImage(t, 0, 0);
  let i = r.getImageData(0, 0, n.width, n.height),
    a = i.data;
  for (let e = 0; e < a.length; e += 4) {
    let t = (a[e] + a[e + 1] + a[e + 2]) / 3 < 10 ? 70 : 255;
    a[e] = a[e + 1] = a[e + 2] = t;
  }
  r.putImageData(i, 0, 0);
  let o = new _e(n);
  ((o.flipY = e.map.flipY),
    (e.alphaMap = o),
    (e.transparent = !0),
    (e.depthWrite = !1),
    (e.roughness = 0.08),
    (e.metalness = 0.2),
    (e.envMapIntensity = 1.4),
    (e.needsUpdate = !0));
}
var ns = null;
function rs() {
  if (ns) return ns.clone();
  let e = document.createElement(`canvas`);
  e.width = e.height = 64;
  let t = e.getContext(`2d`),
    n = t.createRadialGradient(32, 32, 0, 32, 32, 32);
  return (
    n.addColorStop(0, `rgba(0,0,0,1)`),
    n.addColorStop(0.5, `rgba(0,0,0,0.55)`),
    n.addColorStop(1, `rgba(0,0,0,0)`),
    (t.fillStyle = n),
    t.fillRect(0, 0, 64, 64),
    (ns = new g({
      map: new _e(e),
      transparent: !0,
      depthWrite: !1,
      opacity: 0.55,
    })),
    ns.clone()
  );
}
function is(e, t) {
  let n = null,
    r = RegExp(`^${t}(_\\d+)?$`);
  return (
    e.traverse((e) => {
      !n && e.isBone && r.test(e.name) && (n = e);
    }),
    n
  );
}
var as = new h(),
  os = new h(),
  ss = new h(),
  cs = new Ie(),
  ls = class {
    constructor(t, n, r = !1) {
      (e(this, `def`, void 0),
        e(this, `root`, new c()),
        e(this, `current`, Yi()),
        e(this, `yaw`, 0),
        e(this, `body`, new c()),
        e(this, `model`, void 0),
        e(this, `scale`, void 0),
        e(this, `j`, {}),
        e(this, `fingers`, { l: [], r: [], lThumb: [], rThumb: [] }),
        e(this, `hipsRestPos`, new T()),
        e(this, `headCenter`, new Re()),
        e(this, `handAnchor`, void 0),
        e(this, `eyes`, []),
        e(this, `hands`, void 0),
        e(this, `handRest`, void 0),
        e(this, `eyeAnchors`, {}),
        e(this, `A0L`, new h().setFromAxisAngle(Ro, -Fo)),
        e(this, `A0R`, new h().setFromAxisAngle(Ro, Fo)),
        e(this, `A0Linv`, this.A0L.clone().invert()),
        e(this, `A0Rinv`, this.A0R.clone().invert()),
        e(this, `breathT`, Math.random() * 10),
        e(this, `blinkIn`, 2 + Math.random() * 3),
        e(this, `blink`, 0),
        e(this, `winkAmt`, 0),
        e(this, `contact`, void 0),
        e(this, `mixer`, null),
        e(this, `danceAction`, null),
        e(this, `clipActions`, new Map()),
        e(this, `activeClip`, null),
        e(this, `fading`, new Map()),
        e(this, `boneRest`, []),
        (this.def = t),
        (this.root.rotation.order = `ZYX`),
        (this.scale = n.scale),
        (this.model = ke(n.scene)),
        r &&
          this.model.traverse((e) => {
            let t = e;
            if (!t.isMesh) return;
            let n = (e) => {
              let t = Qo.find((t) => t.re.test(e.name));
              return t ? $o(e, t.mode) : e;
            };
            t.material = Array.isArray(t.material)
              ? t.material.map(n)
              : n(t.material);
          }),
        this.body.scale.setScalar(this.scale * (t.modelHeight ?? 1)),
        this.body.add(this.model),
        this.root.add(this.body),
        this.model.updateMatrixWorld(!0));
      let i = (e) => {
        let t = is(this.model, e);
        if (!t) return null;
        let n = new h();
        t.parent.getWorldQuaternion(n);
        let r = {
          bone: t,
          rest: t.quaternion.clone(),
          P: n,
          Pinv: n.clone().invert(),
        };
        return ((this.j[e] = r), r);
      };
      for (let e of [
        `Hips`,
        `Spine`,
        `Spine1`,
        `Spine2`,
        `Neck`,
        `Head`,
        `LeftArm`,
        `LeftForeArm`,
        `RightArm`,
        `RightForeArm`,
        `LeftUpLeg`,
        `LeftLeg`,
        `LeftFoot`,
        `RightUpLeg`,
        `RightLeg`,
        `RightFoot`,
      ])
        i(e);
      for (let e of [`Left`, `Right`]) {
        let t = e === `Left` ? this.fingers.l : this.fingers.r;
        for (let n of zo)
          t.push(
            [1, 2, 3].map((t) => i(`${e}Hand${n}${t}`)).filter((e) => !!e),
          );
        let n = [1, 2, 3].map((t) => i(`${e}HandThumb${t}`)).filter((e) => !!e);
        e === `Left` ? (this.fingers.lThumb = n) : (this.fingers.rThumb = n);
        let r = is(this.model, `${e}Eye`);
        r && this.eyes.push(r);
      }
      this.hipsRestPos.copy(this.j.Hips.bone.position);
      let a = t.forearmScale ?? 1;
      if (a !== 1)
        for (let e of [`LeftForeArm`, `RightForeArm`])
          this.j[e]?.bone.scale.set(a, 1, a);
      this.j.Head.bone.scale.multiplyScalar(No);
      let o = this.j.Head.bone,
        s = o.getWorldQuaternion(new h()).invert();
      (this.headCenter.position.copy(new T(0, 0.1, 0.03).applyQuaternion(s)),
        o.add(this.headCenter));
      for (let e of [`Left`, `Right`]) {
        let t = is(this.model, `${e}Eye`);
        if (!t) continue;
        let n = new Re();
        (n.position.copy(
          o.worldToLocal(t.getWorldPosition(new T()).add(new T(0, 0, 0.012))),
        ),
          o.add(n),
          (this.eyeAnchors[e === `Left` ? `l` : `r`] = n));
      }
      let l = (e) =>
        is(this.model, `${e}HandMiddle1`) ?? is(this.model, `${e}Hand`);
      if (
        ((this.handAnchor = { l: l(`Left`), r: l(`Right`) }),
        (this.hands = {
          l: is(this.model, `LeftHand`),
          r: is(this.model, `RightHand`),
        }),
        (this.handRest = {
          l: this.hands.l?.quaternion.clone() ?? new h(),
          r: this.hands.r?.quaternion.clone() ?? new h(),
        }),
        n.dance || n.clips.length)
      ) {
        (this.model.traverse((e) => {
          let t = e;
          t.isBone &&
            this.boneRest.push({
              bone: t,
              q: t.quaternion.clone(),
              p: t.position.clone(),
              s: t.scale.clone(),
            });
        }),
          (this.mixer = new me(this.model)),
          n.dance && (this.danceAction = this.mixer.clipAction(n.dance)));
        for (let e of n.clips)
          this.clipActions.set(e.name, this.mixer.clipAction(e));
      }
      ((this.contact = new p(new Fe(0.42, 32), rs())),
        (this.contact.rotation.x = -Math.PI / 2),
        (this.contact.renderOrder = -1),
        this.root.add(this.contact),
        this.applyPose(this.current));
    }
    updateContact() {
      let e = this.root.position.y;
      this.contact.position.set(0, -e + 0.012, 0);
      let t = Math.max(0, 1 - e / 1.6);
      (this.contact.scale.setScalar(0.6 + t * 0.4),
        (this.contact.material.opacity = 0.55 * t),
        (this.contact.visible = Math.abs(this.root.rotation.z) < 0.4));
    }
    set(e, t) {
      e &&
        e.bone.quaternion
          .copy(e.Pinv)
          .multiply(t)
          .multiply(e.P)
          .multiply(e.rest);
    }
    fromEuler(e, t, n, r = 1) {
      return as.setFromEuler(cs.set(e * r, t * r, n * r, `XYZ`));
    }
    applyPose(e) {
      let t = this.j,
        n = this.scale,
        r = Math.sin(this.breathT * 2.1) * 0.018;
      (t.Hips.bone.position.set(
        this.hipsRestPos.x,
        this.hipsRestPos.y + e.rootY / n,
        this.hipsRestPos.z + e.rootZ / n,
      ),
        this.set(t.Hips, this.fromEuler(e.hipsF, e.hipsT, e.hipsS)),
        this.set(t.Spine, this.fromEuler(e.spineF, e.spineT, e.spineS, 0.5)),
        this.set(t.Spine1, this.fromEuler(e.spineF, e.spineT, e.spineS, 0.5)),
        this.set(t.Spine2, this.fromEuler(e.chestF - r, e.chestT, 0)),
        this.set(t.Neck, this.fromEuler(e.headF, e.headT, e.headS, 0.4)),
        this.set(
          t.Head,
          this.fromEuler(
            e.headF + r * 0.5,
            e.headT,
            e.headS + this.winkAmt * 0.12,
            0.6,
          ),
        ),
        os
          .setFromEuler(cs.set(-e.lShF, e.lShT, e.lShO, `XYZ`))
          .multiply(this.A0L),
        this.set(t.LeftArm, os),
        ss.setFromAxisAngle(Io, -e.lEl),
        os.copy(this.A0Linv).multiply(ss).multiply(this.A0L),
        this.set(t.LeftForeArm, os),
        os
          .setFromEuler(cs.set(-e.rShF, -e.rShT, -e.rShO, `XYZ`))
          .multiply(this.A0R),
        this.set(t.RightArm, os),
        ss.setFromAxisAngle(Io, -e.rEl),
        os.copy(this.A0Rinv).multiply(ss).multiply(this.A0R),
        this.set(t.RightForeArm, os),
        this.set(t.LeftUpLeg, this.fromEuler(-e.lThF, 0, e.lThO)),
        this.set(t.LeftLeg, ss.setFromAxisAngle(Io, e.lKn)),
        this.set(t.LeftFoot, ss.setFromAxisAngle(Io, e.lAnk)),
        this.set(t.RightUpLeg, this.fromEuler(-e.rThF, 0, -e.rThO)),
        this.set(t.RightLeg, ss.setFromAxisAngle(Io, e.rKn)),
        this.set(t.RightFoot, ss.setFromAxisAngle(Io, e.rAnk)),
        this.applyHand(this.fingers.l, this.fingers.lThumb, e.lHand, -1),
        this.applyHand(this.fingers.r, this.fingers.rThumb, e.rHand, 1));
      for (let [t, n, r, i] of [
        [this.hands.l, this.handRest.l, e.lWf, e.lWr],
        [this.hands.r, this.handRest.r, -e.rWf, -e.rWr],
      ])
        t &&
          t.quaternion
            .copy(n)
            .multiply(ss.setFromAxisAngle(Ro, r))
            .multiply(os.setFromAxisAngle(Lo, i));
    }
    applyHand(e, t, n, r) {
      let i = Math.max(0, Math.min(1, n));
      for (let t = 0; t < e.length; t++) {
        let n = e[t],
          a = 0.92 + t * 0.05;
        for (let e = 0; e < n.length; e++) {
          let t = (Bo[e] * (1 - i) + Vo[e] * i) * a;
          this.set(n[e], ss.setFromAxisAngle(Ro, r * t));
        }
      }
      for (let e = 0; e < t.length; e++) {
        let n = (1 - i) * [0.55, 0.5, 0.4][e] + i * 0.05;
        (ss.setFromAxisAngle(Io, n),
          os.setFromAxisAngle(Lo, r * (1 - i) * (e === 0 ? 0.35 : 0)),
          this.set(t[e], ss.multiply(os)));
      }
    }
    blendTo(e, t, n) {
      let r = 1 - Math.exp(-t * n);
      for (let t of Ji) this.current[t] += (e[t] - this.current[t]) * r;
      (this.tickLife(n), this.applyPose(this.current));
    }
    snapTo(e) {
      (Object.assign(this.current, Xi(e)), this.applyPose(this.current));
    }
    tickLife(e) {
      ((this.breathT += e),
        (this.blinkIn -= e),
        this.blinkIn <= 0 &&
          ((this.blink = 0.14), (this.blinkIn = 2.2 + Math.random() * 3.5)));
      let t = 0;
      this.blink > 0 &&
        ((this.blink -= e),
        (t = Math.sin(Math.max(0, this.blink / 0.14) * Math.PI)));
      let n = Math.max(t, this.winkAmt);
      this.eyes.forEach((e, r) => {
        let i = r === 1 ? n : t;
        e.scale.set(1, 1 - 0.85 * i, 1);
      });
    }
    setTransform(e, t, n, r, i = 0.22) {
      this.root.position.set(e, t, 0);
      let a = n > 0 ? Math.PI / 2 - i : -Math.PI / 2 + i,
        o = r <= 0 ? 1 : 1 - Math.exp(-14 * r);
      ((this.yaw = Ea(this.yaw + Ea(a - this.yaw) * o)),
        this.root.rotation.set(0, this.yaw, 0),
        this.updateContact());
    }
    setFree(e, t, n, r, i = 0) {
      (this.root.position.set(e, t, n),
        (this.yaw = Ea(r)),
        this.root.rotation.set(0, r, i),
        this.updateContact());
    }
    wink(e) {
      this.winkAmt = Math.max(0, Math.min(1, e));
    }
    handWorld(e, t) {
      return this.handAnchor[e].getWorldPosition(t);
    }
    headWorld(e) {
      return this.headCenter.getWorldPosition(e);
    }
    eyeWorld(e, t) {
      return this.eyeAnchors[e]?.getWorldPosition(t) ?? null;
    }
    chestWorld(e) {
      return this.j.Spine2.bone.getWorldPosition(e);
    }
    setFacePhoto() {}
    dispose() {
      (this.root.removeFromParent(),
        this.mixer?.stopAllAction(),
        this.model.traverse((e) => e.skeleton?.dispose()),
        this.contact.geometry.dispose());
    }
    playClip(e, t) {
      let n = this.clipActions.get(e.name);
      if (!n || !this.mixer) return !1;
      n !== this.activeClip &&
        (this.activeClip && this.fading.set(this.activeClip, 1),
        this.fading.delete(n),
        (this.activeClip = n),
        (n.enabled = !0),
        (n.paused = !0),
        n.play());
      let r = e.fade ?? 0.14,
        i = r > 0 ? t / r : 1,
        a = 0;
      for (let [e, t] of this.fading) {
        let n = t - i;
        n <= 0
          ? (e.stop(), this.fading.delete(e))
          : (this.fading.set(e, n), e.setEffectiveWeight(n), (a += n));
      }
      n.setEffectiveWeight(Math.max(0, 1 - a));
      let o = n.getClip().duration;
      return (
        (n.time = e.loop ? e.time % o : Math.min(e.time, o)),
        this.mixer.update(0),
        !0
      );
    }
    setMirror(e) {
      this.body.scale.x = Math.abs(this.body.scale.x) * (e ? -1 : 1);
    }
    stopClip() {
      if (this.activeClip) {
        for (let e of this.fading.keys()) e.stop();
        (this.fading.clear(),
          this.activeClip.stop(),
          (this.activeClip = null),
          this.restoreBones(),
          this.applyPose(this.current));
      }
    }
    playDance(e) {
      let t = this.danceAction;
      return !t || !this.mixer
        ? !1
        : (t.isRunning() || t.reset().play(), this.mixer.update(e), !0);
    }
    stopDance() {
      let e = this.danceAction;
      e &&
        e.isRunning() &&
        (e.stop(), this.restoreBones(), this.applyPose(this.current));
    }
    restoreBones() {
      for (let e of this.boneRest)
        (e.bone.quaternion.copy(e.q),
          e.bone.position.copy(e.p),
          e.bone.scale.copy(e.s));
    }
  },
  us,
  ds = 16718362,
  fs = 16711680,
  ps = 15751680,
  ms = new T(0, 1, 0),
  hs = 0.036,
  gs = 0.108,
  _s = -0.02,
  vs = `radial-gradient(ellipse at center, rgba(255,0,0,0) 42%, rgba(150,0,0,0.6) 100%)`,
  ys = new Map();
function bs(e, t, n, r) {
  if (!ys.has(e)) {
    let i = null;
    if (typeof document < `u`) {
      let e = document.createElement(`canvas`);
      ((e.width = t), (e.height = n));
      let a = e.getContext(`2d`);
      a &&
        (r(a), (i = new _e(e)), (i.colorSpace = oe), (i.userData.shared = !0));
    }
    ys.set(e, i);
  }
  return ys.get(e);
}
var xs = () =>
    bs(`dozer-puff`, 64, 64, (e) => {
      let t = e.createRadialGradient(32, 32, 0, 32, 32, 32);
      (t.addColorStop(0, `rgba(255,255,255,0.95)`),
        t.addColorStop(0.45, `rgba(255,255,255,0.55)`),
        t.addColorStop(1, `rgba(255,255,255,0)`),
        (e.fillStyle = t),
        e.fillRect(0, 0, 64, 64));
    }),
  Ss = () => {
    let e = bs(`dozer-tread`, 128, 64, (e) => {
      ((e.fillStyle = `rgba(40,28,18,0.5)`),
        e.fillRect(0, 6, 128, 52),
        (e.fillStyle = `rgba(25,16,10,0.85)`));
      for (let t = 0; t < 4; t++) {
        let n = t * 32;
        (e.beginPath(),
          e.moveTo(n + 4, 8),
          e.lineTo(n + 16, 32),
          e.lineTo(n + 4, 56),
          e.lineTo(n + 14, 56),
          e.lineTo(n + 26, 32),
          e.lineTo(n + 14, 8),
          e.closePath(),
          e.fill());
      }
    });
    return (e && (e.wrapS = Oe), e);
  },
  Cs = () =>
    bs(`dozer-dust`, 256, 256, (e) => {
      let t = e.createRadialGradient(128, 128, 8, 128, 128, 92);
      (t.addColorStop(0, `rgba(176, 150, 112, 0.96)`),
        t.addColorStop(0.55, `rgba(196, 170, 130, 0.9)`),
        t.addColorStop(0.85, `rgba(186, 160, 122, 0.55)`),
        t.addColorStop(1, `rgba(170, 145, 110, 0)`),
        (e.fillStyle = t),
        e.beginPath(),
        e.arc(128, 128, 92, 0, Math.PI * 2),
        e.fill());
      for (let [t, n, r] of [
        [72, 96, 34],
        [182, 104, 30],
        [96, 174, 32],
        [168, 166, 28],
        [52, 136, 20],
        [204, 140, 22],
        [128, 56, 24],
        [134, 202, 22],
        [38, 88, 11],
        [218, 92, 12],
        [60, 198, 13],
        [198, 204, 10],
        [96, 40, 9],
        [166, 44, 10],
        [28, 152, 8],
        [228, 162, 9],
      ]) {
        let i = e.createRadialGradient(t, n, 1, t, n, r);
        (i.addColorStop(0, `rgba(190, 164, 124, 0.92)`),
          i.addColorStop(0.7, `rgba(176, 150, 112, 0.7)`),
          i.addColorStop(1, `rgba(170, 145, 110, 0)`),
          (e.fillStyle = i),
          e.beginPath(),
          e.arc(t, n, r, 0, Math.PI * 2),
          e.fill());
      }
    });
function ws() {
  let e = new c(),
    t = new x({ color: 15246138, roughness: 0.55, metalness: 0.2 }),
    n = new x({ color: 2236446, roughness: 0.8 }),
    r = new x({ color: 9422040, roughness: 0.15, metalness: 0.3 }),
    i = (t, n, r, i, a, o, s) => {
      let c = new p(new C(t, n, r), i);
      (c.position.set(a, o, s), e.add(c));
    };
  return (
    i(0.42, 0.62, 2.3, n, -0.6, 0.31, -0.25),
    i(0.42, 0.62, 2.3, n, 0.6, 0.31, -0.25),
    i(1.05, 0.7, 1.9, t, 0, 0.85, -0.2),
    i(0.95, 0.9, 0.85, r, 0, 1.65, -0.55),
    i(1.05, 0.08, 0.95, t, 0, 2.14, -0.55),
    i(1.64, 0.8, 0.14, t, 0, 0.45, 1.53),
    i(0.12, 0.65, 0.12, n, -0.35, 1.55, 0.35),
    e
  );
}
var Ts = class t extends ka {
  constructor(n) {
    (super(n),
      e(this, `root`, new c()),
      e(this, `dozer`, new c()),
      e(this, `tilt`, new c()),
      e(this, `loader`, void 0),
      e(this, `eyes`, []),
      e(this, `beams`, []),
      e(this, `eyeLight`, new ne(ds, 0, 3.2, 2)),
      e(this, `eyeTmp`, new T()),
      e(this, `headLight`, new ne(16769184, 0, 7, 1.6)),
      e(this, `lamps`, []),
      e(this, `treads`, []),
      e(this, `dustPools`, []),
      e(this, `puffs`, []),
      e(this, `chunks`, []),
      e(this, `puffIdx`, 0),
      e(this, `casterX0`, void 0),
      e(this, `targetX0`, void 0),
      e(this, `casterX1`, void 0),
      e(this, `targetX1`, void 0),
      e(this, `crushX`, 0),
      e(this, `dozerX`, 0),
      e(this, `prevDozerX`, 0),
      e(this, `slamCount`, 0),
      e(this, `crushed`, !1),
      e(this, `popped`, !1),
      e(this, `reversing`, !1),
      e(this, `hornCount`, 0),
      e(this, `prevReach`, null),
      e(this, `popT`, void 0),
      e(this, `clearT`, void 0));
    let r = n.caster.facing,
      { GAP: i } = t;
    (n.scene.add(this.root),
      (this.casterX0 = n.caster.x),
      (this.targetX0 = n.target.x));
    let a = O - 0.45,
      o =
        Math.abs(n.target.x - n.caster.x) < i ? n.caster.x + r * i : n.target.x;
    o = Math.max(-a, Math.min(a, o));
    let s = n.caster.x;
    ((o - s) * r < i && (s = Math.max(-a, Math.min(a, o - r * i))),
      (this.casterX1 = s),
      (this.targetX1 = o));
    for (let e = 0; e < 2; e++) {
      let e = nt(ds, 0.3, 0),
        t = nt(16730682, 0.035, 0),
        n = nt(ds, 1, 0);
      (n.scale.set(0.9, 0.05, 1),
        this.root.add(e, t, n),
        this.eyes.push({ glow: e, core: t, flare: n }));
      let r = new p(
        new E(0.03, 0.012, 1, 6, 1, !0),
        new g({
          color: fs,
          transparent: !0,
          opacity: 0,
          blending: 2,
          depthWrite: !1,
        }),
      );
      ((r.visible = !1), this.root.add(r), this.beams.push(r));
    }
    this.root.add(this.eyeLight);
    let l = Mo(`bulldozer`) ?? ws();
    ((this.loader = l.getObjectByName(`Loader`) ?? null),
      this.tilt.add(l),
      this.dozer.add(this.tilt),
      (this.dozer.rotation.y = -r * (Math.PI / 2)),
      (this.dozer.visible = !1),
      this.root.add(this.dozer));
    for (let e of [-0.36, 0.36]) {
      let t = nt(16770720, 0.32, 0);
      (t.position.set(e, 1.2, 0.55), this.tilt.add(t), this.lamps.push(t));
    }
    (this.headLight.position.set(0, 1.3, 3), this.tilt.add(this.headLight));
    let u = Cs();
    for (let e = 0; e < 3; e++) {
      let t = new g({
          color: u ? 16777215 : 12888706,
          map: u,
          transparent: !0,
          opacity: 0,
          depthWrite: !1,
        }),
        n = new p(new f(1, 1), t);
      ((n.rotation.x = -Math.PI / 2),
        (n.rotation.z = e * 1.15),
        n.position.set(
          this.targetX1 + (e - 1) * 0.14,
          0.022 + e * 0.002,
          e === 1 ? 0.08 : -0.06,
        ),
        n.scale.setScalar(0.01),
        (n.visible = !1),
        this.root.add(n),
        this.dustPools.push({ mesh: n, mat: t, maxScale: 1.25 + e * 0.55 }));
    }
    let d = Ss(),
      m = new g({
        color: d ? 16777215 : 2759698,
        map: d,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
      });
    for (let e of [-0.6, 0.6]) {
      let t = new p(new f(1, 0.42), m);
      ((t.rotation.x = -Math.PI / 2),
        t.position.set(0, 0.025, e),
        (t.visible = !1),
        this.root.add(t),
        this.treads.push(t));
    }
    let h = xs();
    for (let e = 0; e < (k ? 20 : 32); e++) {
      let e = new he(
        new Ne({
          map: h,
          color: 7829367,
          transparent: !0,
          opacity: 0,
          depthWrite: !1,
        }),
      );
      ((e.visible = !1),
        this.root.add(e),
        this.puffs.push({
          s: e,
          vel: new T(),
          life: 0,
          max: 1,
          size: 0.5,
          grow: 1,
          alpha: 0.6,
        }));
    }
    let _ = new C(0.16, 0.1, 0.12),
      v = [
        new x({ color: 10129284, roughness: 0.9 }),
        new x({ color: 10769722, roughness: 0.85 }),
      ];
    for (let e = 0; e < 14; e++) {
      let t = new p(_, v[e % 2]);
      ((t.visible = !1),
        t.scale.setScalar(0.7 + (e % 4) * 0.25),
        this.root.add(t),
        this.chunks.push({ m: t, vel: new T(), spin: new T() }));
    }
    n.audio.startSuperBed(t.CRUSH / Qe, `bulldozer`);
  }
  namaste(e, t, n = 0) {
    return M(R(e, `yogi`), {
      rootY: -0.02,
      ...L(-0.02, 0.1, -0.1),
      hipsT: -this.d.caster.facing * 0.85 * n,
      spineT: 0,
      spineF: 0.04 + t * 0.12,
      chestF: 0,
      headT: 0,
      headF: -0.06 + t * 0.34,
      ..._a,
    });
  }
  shield(e, t) {
    return M(z(e, this.d.target.char.id), {
      rootY: -0.08 * t,
      ...L(-0.08 * t, 0.18, -0.34),
      spineF: -0.18 * t,
      headF: 0.25 * t,
      headT: 0.5 * t,
      lShF: 0.8 + t * 0.85,
      lShO: 0.4 - t * 0.7,
      lEl: 1.3 + t * 0.9,
      lHand: 1,
      rShF: 0.9 + t * 0.7,
      rShO: 0.5 - t * 0.8,
      rEl: 1.4 + t * 0.9,
      rHand: 1,
    });
  }
  panic(e, t) {
    let n = Math.sin(e * 30) * 0.08 * t;
    return M(z(e, this.d.target.char.id), {
      rootY: -0.06,
      ...L(-0.06, 0.16 + n * 0.3, -0.2 - n * 0.3),
      hipsT: 0.2 * t,
      spineT: 0.5 * t,
      headT: 0.25 + t * 0.9,
      headF: -0.15,
      spineF: -0.08,
      lShF: 0.6 + t * 2.1 + n,
      lShO: 0.45,
      lShT: 0.2,
      lEl: 1.3 + t * 0.5,
      lHand: 1,
      rShF: 0.6 + t * 2.1 - n,
      rShO: 0.45,
      rShT: 0.2,
      rEl: 1.3 + t * 0.5,
      rHand: 1,
    });
  }
  pancake(e) {
    return M(ca(e), {
      headT: 0,
      headF: 0,
      spineF: 0,
      lShF: 0.25,
      lShO: 1.45,
      lEl: 0.1,
      lHand: 1,
      rShF: 0.25,
      rShO: 1.45,
      rEl: 0.1,
      rHand: 1,
      lThF: 0.05,
      lThO: 0.5,
      lKn: 0.05,
      lAnk: 0.2,
      rThF: 0.05,
      rThO: 0.5,
      rKn: 0.05,
      rAnk: 0.2,
    });
  }
  step(e) {
    let n = this.d,
      {
        IGNITE: r,
        GLARE: i,
        POINT: a,
        ARRIVE: o,
        SLAMS: s,
        CRUSH: c,
        STOP: l,
        REVERSE: u,
        END: d,
      } = t,
      f = this.t;
    this.advance(e, c);
    let p = this.t,
      m = n.caster,
      h = n.target,
      g = m.facing,
      _ = (e) => p >= e && f < e,
      v = n.clipTime() !== null,
      y = F(P((p - r - 0.15) / (i + 0.25 - r - 0.15)));
    if (
      (p < o
        ? ((m.x = this.casterX0 + (this.casterX1 - this.casterX0) * y),
          (h.x = this.targetX0 + (this.targetX1 - this.targetX0) * y),
          y > 0 &&
            y < 0.95 &&
            Math.abs(this.targetX1 - this.targetX0) > 0.05 &&
            Math.random() < 0.35 &&
            n.fx.dust(this.v1.set(h.x, 0.05, 0), 0.25))
        : this.crushX ||
          ((m.x = this.casterX1),
          (h.x = this.targetX1),
          (this.crushX = this.targetX1 + g * t.BUCKET_REACH)),
      (this.casterPose =
        p < r
          ? N(R(p, `yogi`), this.namaste(p, 1, 1), F(p / 0.25))
          : p < a
            ? this.namaste(p, 1 - F((p - r) / 0.3), 1)
            : this.namaste(
                p,
                0.25 * Math.sin(P((p - a) / 0.6) * Math.PI),
                1 - I((p - a) / 0.5),
              )),
      p < o)
    ) {
      let t = F(P((p - r - 0.1) / 0.3)) * (1 - 0.5 * P((p - i - 0.3) / 0.35));
      ((this.targetPose = this.shield(p, t)), this.settleTarget(e));
    } else
      p < s[0]
        ? ((this.targetPose = this.panic(p, F(P((p - o - 0.15) / 0.35)))),
          this.settleTarget(e))
        : this.popped
          ? ((this.targetPose = null), h.update(Ur(), m.x))
          : (this.targetPose = this.pancake(p));
    (!v && _(0.12) && n.speech(`caster`, `Shaanti…`),
      _(a) && n.speech(`caster`, `Site clear karo!`),
      _(o + 0.35) &&
        n.speech(
          `target`,
          {
            modi: `Arre, yeh bulldozer kiska hai?!`,
            rahul: `Bhai, bulldozer?! Seriously?!`,
            didi: `Ei! Bulldozer thamao!`,
            trump: `Is that a... bulldozer?!`,
            yogi: `Mera hi bulldozer?!`,
            nitin: `Bulldozer? Mere highway pe?!`,
            mbapu: `Bulldozer nahi, shanti chahiye!`,
          }[h.char.id],
        ),
      _(r) && (n.audio.eyeZing(), n.flash(vs, 650)),
      _(i) && (n.audio.whoosh(), n.flash(vs, 550), n.cam.shake(0.08, 0.28)),
      _(a) && n.flash(vs, 450),
      _(o) &&
        (n.audio.horn(0.55),
        n.audio.startEngine(),
        n.popup(
          `BULLDOZER AA GAYA!`,
          this.v1.set(this.targetX1 + g * 1.2, 2.5, 0.3),
          `#ffb020`,
        ),
        n.arena.cheer(0.8)),
      this.hornCount === 0 &&
        p >= o + 0.65 &&
        ((this.hornCount = 1), n.audio.horn(0.32)),
      this.stepEyes(p, e),
      this.stepDozer(p, e),
      this.stepPuffs(e),
      this.stepChunks(e));
    let b = [`CRUSH!`, `SQUASH!`, `BULLDOZED!`],
      ee = [`#ff4d2e`, `#ff2222`, `#ff0022`];
    for (; this.slamCount < 3 && p >= s[this.slamCount];) {
      let e = this.slamCount++,
        t = e === 2;
      (t && ((this.crushed = !0), n.audio.superRelease(`bulldozer`)),
        n.audio.metalCrunch(),
        n.audio.hit(0.9 + e * 0.25),
        n.flash(
          t ? `rgba(255,236,190,0.75)` : `rgba(240,214,160,0.48)`,
          t ? 280 : 180,
        ),
        n.cam.shake(0.32 + e * 0.14, t ? 0.75 : 0.35),
        this.v1.set(h.x, 0.05, 0),
        n.fx.shockwave(this.v1, 12888706, 0.45 + e * 0.18, 1.5 + e * 0.45),
        t && n.fx.shockwave(this.v1, ps, 0.7, 2.4),
        n.fx.dust(this.v1, 1.5 + e * 0.8),
        n.fx.particles.emit(this.v2.set(h.x, 0.22, 0), {
          count: 38 + e * 22,
          speed: 3.6 + e * 1.1,
          color: 12888706,
          life: 0.75 + e * 0.15,
          size: 0.11 + e * 0.02,
          gravity: 11,
          drag: 1.2,
          dir: ms,
          spread: 1.35,
        }),
        n.fx.particles.emit(this.v2.set(h.x, 0.14, 0), {
          count: 24 + e * 14,
          speed: 2.8 + e * 0.9,
          color: 9402970,
          life: 0.85,
          size: 0.13,
          gravity: 12,
          drag: 1.5,
          dir: ms,
          spread: 1.45,
        }));
      for (let t = 0; t < 6 + e * 2; t++) {
        let n = (t / (6 + e * 2)) * Math.PI * 2;
        this.puff(
          this.v2.set(h.x + Math.cos(n) * 0.35, 0.18, Math.sin(n) * 0.4),
          this.v3.set(
            Math.cos(n) * (1.6 + e * 0.4),
            0.4 + Math.random() * 0.6,
            Math.sin(n) * 1.2,
          ),
          0.55 + e * 0.18,
          1.7,
          1.1,
          t % 2 == 0 ? 9045004 : 11901560,
          0.72,
        );
      }
      (this.burst(h.x),
        n.popup(b[e], this.v1.set(h.x, 2.4 + e * 0.15, 0.3), ee[e]),
        n.arena.cheer(0.9 + e * 0.35));
    }
    if (
      (this.stepDust(p),
      this.stepSquash(p),
      _(l) &&
        (n.audio.thud(),
        n.popup(
          `RUK JAO!`,
          this.v1.set(this.casterX1 + g * 0.4, 2.2, 0.3),
          `#ffffff`,
        )),
      _(u) && n.audio.reverseBeeps(4),
      this.reversing &&
        (this.dozerX - h.x) * g > t.HALF_LEN + 0.55 &&
        this.clearT === void 0 &&
        (this.clearT = p),
      !this.popped &&
        this.crushed &&
        ((this.clearT !== void 0 && p >= this.clearT + 0.25) || p >= d - 0.4))
    ) {
      ((this.popped = !0),
        (h.y = 0),
        this.landSuperHit(h.hp, g, 2.2, 5.6),
        n.audio.thud(),
        n.audio.hit(1.1),
        n.cam.shake(0.18, 0.3),
        n.popup(`-30%`, this.v1.set(h.x, 2, 0.3), `#ffd23f`),
        v || n.speech(`caster`, `Kaam chalu hai!`));
      for (let e = 0; e < 5; e++)
        this.puff(
          this.v2.set(
            h.x + (Math.random() - 0.5) * 0.8,
            0.15,
            (Math.random() - 0.5) * 0.4,
          ),
          this.v3.set(0, 1.2, 0),
          0.5,
          1.6,
          0.9,
          11901560,
          0.55,
        );
    }
    (this.stepCamera(p),
      p >= d - 0.4 && f < d - 0.4 && n.audio.stopEngine(0.5),
      p >= d &&
        ((m.y = 0), n.targetRig.root.scale.set(1, 1, 1), (this.done = !0)));
  }
  eyeWorld(e, t) {
    let n = this.d.casterRig;
    if (e !== 0 && n.eyeWorld?.(e > 0 ? `l` : `r`, t)) return t;
    if (e === 0 && n.eyeWorld?.(`l`, t) && n.eyeWorld(`r`, this.eyeTmp))
      return t.lerp(this.eyeTmp, 0.5);
    n.headWorld(t);
    let r = n.current,
      i =
        (n.root?.rotation.y ??
          (this.d.caster.facing > 0 ? Math.PI / 2 : -Math.PI / 2)) +
        (r ? r.hipsT + r.spineT + r.headT : 0),
      a = this.d.caster.char.modelHeight ?? 1,
      o = e * hs * a,
      s = gs * a;
    return t.set(
      t.x + o * Math.cos(i) + s * Math.sin(i),
      t.y + _s * a,
      t.z - o * Math.sin(i) + s * Math.cos(i),
    );
  }
  stepEyes(e, n) {
    let { IGNITE: r, GLARE: i, CRUSH: a, REVERSE: o } = t,
      s = F(P((e - r) / (i - r))) * (1 - P((e - a - 0.6) / (o - a - 0.6))),
      c = 0.85 + Math.sin(e * 37) * 0.08 + Math.sin(e * 61) * 0.07,
      l =
        1 +
        0.6 * Math.max(0, 1 - Math.abs(e - i) / 0.25) +
        0.4 * Math.max(0, 1 - Math.abs(e - a) / 0.3),
      u = s * c * l,
      d = this.d.target,
      f = P((e - i + 0.12) / 0.1) * (1 - P((e - i - 1.68) / 0.2));
    for (let t = 0; t < 2; t++) {
      let n = this.eyes[t],
        r = this.eyeWorld(t === 0 ? 1 : -1, this.v1);
      (n.glow.position.copy(r),
        n.core.position.copy(r),
        n.flare.position.copy(r),
        n.glow.scale.setScalar(0.06 + 0.11 * u),
        (n.glow.material.opacity = Math.min(1, 0.95 * u)),
        (n.core.material.opacity = Math.min(1, 1.3 * u)),
        n.flare.scale.set(0.1 + 0.42 * u, 0.014 + 0.008 * u, 1),
        (n.flare.material.opacity = Math.min(1, 0.8 * u)));
      let i = this.beams[t];
      if (((i.visible = f > 0.01), i.visible)) {
        let n = this.targetChest(this.v2);
        ((n.z += (t === 0 ? -0.06 : 0.06) + Math.sin(e * 40 + t) * 0.02),
          (n.y = d.y + 1.5));
        let a = this.v3.subVectors(n, r),
          o = a.length();
        (i.position.copy(r).addScaledVector(a, 0.5),
          i.quaternion.setFromUnitVectors(ms, a.multiplyScalar(1 / o)),
          i.scale.set(
            1 + Math.sin(e * 50) * 0.3,
            o,
            1 + Math.sin(e * 50) * 0.3,
          ),
          (i.material.opacity = 0.95 * f * c),
          Math.random() < 0.5 &&
            this.d.fx.particles.emit(n, {
              count: 1,
              speed: 1.2,
              color: fs,
              life: 0.25,
              size: 0.18,
              drag: 4,
            }));
      }
    }
    let p = this.eyeWorld(0, this.v1);
    (this.eyeLight.position
      .copy(p)
      .add(this.v2.set(this.d.caster.facing * 0.45, 0.05, 0.3)),
      (this.eyeLight.intensity = 1.3 * u));
  }
  bucketLiftAt(e) {
    let { ARRIVE: n, SLAMS: r, STOP: i, REVERSE: a } = t,
      o = r[0] - 0.5;
    if (e < n) return 0;
    if (e < o) return I(P((e - (n + 0.25)) / Math.max(0.1, o - (n + 0.25))));
    for (let t = 0; t < r.length; t++) {
      let n = r[t],
        i = t === 0 ? o : r[t - 1] + 0.08;
      if (e <= n + 0.08) {
        let r = n - 0.16;
        if (e < r) {
          let n = P((e - i) / Math.max(0.05, r - i));
          return t === 0 ? 1 : F(n);
        }
        if (e < n) {
          let t = P((e - r) / 0.16);
          return 1 - t * t;
        }
        return 0;
      }
    }
    return e < i
      ? 0
      : e < a
        ? 0.25 * I(P((e - i) / (a - i)))
        : 0.25 * (1 - P((e - a) / 0.5));
  }
  dozerXAt(e) {
    let { ARRIVE: n, SLAMS: r, REVERSE: i, END: a, ENTRY: o } = t,
      s = this.d.caster.facing,
      c = r[0] - 0.35;
    if (e < c) {
      let t = F(P((e - n) / (c - n)));
      return this.crushX + s * o * (1 - t);
    }
    if (e < i) return this.crushX;
    let l = P((e - i) / (a - i));
    return this.crushX + s * (o + 1.5) * l * l;
  }
  stepDozer(e, n) {
    let r = this.d,
      { ARRIVE: i, CRUSH: a, REVERSE: o, END: s, HALF_LEN: c } = t,
      l = r.caster.facing,
      u = e >= i && e < s && !!this.crushX;
    this.dozer.visible = u;
    for (let t of this.treads) t.visible = u || e >= s;
    if (!u) return;
    ((this.prevDozerX = this.dozerX || this.dozerXAt(e)),
      (this.dozerX = this.dozerXAt(e)),
      (this.reversing = e >= o));
    let d = Math.abs(this.dozerX - this.prevDozerX) / Math.max(1e-4, n),
      f = d > 0.3;
    this.dozer.position.set(this.dozerX, 0, 0);
    let p = this.bucketLiftAt(e);
    (this.loader
      ? ((this.loader.rotation.x = -p * t.LIFT_ANGLE),
        (this.tilt.position.y = Math.abs(Math.sin(e * 31)) * 0.015),
        (this.tilt.rotation.x = Math.sin(e * 23) * 0.01 + p * 0.025))
      : ((this.tilt.position.y = Math.abs(Math.sin(e * 31)) * 0.015 + p * 0.42),
        (this.tilt.rotation.x = Math.sin(e * 23) * 0.01 - p * 0.44)),
      (this.tilt.rotation.z = Math.sin(e * 17) * 0.008));
    let m = P((e - i) / 0.3) * (0.8 + Math.sin(e * 13) * 0.1);
    for (let e of this.lamps) e.material.opacity = m * 0.7;
    this.headLight.intensity = 1.1 * m;
    let h = 1 - P(Math.abs(this.dozerX - this.targetX1) / 9);
    r.audio.setEngine(
      0.45 + h * 0.55,
      f ? Math.min(1, d / 5) : 0.35 + p * 0.65,
    );
    let g = this.tilt.localToWorld(this.v1.set(-0.3, 1.9, -0.4));
    if (
      (Math.random() < (f ? 0.5 : 0.18) &&
        this.puff(
          g,
          this.v2.set(
            l * 0.3 * Math.random(),
            1.3 + Math.random() * 0.6,
            (Math.random() - 0.5) * 0.3,
          ),
          0.25,
          1.4,
          1.1,
          2894376,
          0.55,
        ),
      f && Math.random() < 0.45)
    ) {
      let e = this.reversing ? -1 : 1,
        t = Math.random() < 0.5 ? -0.6 : 0.6;
      this.puff(
        this.v1.set(this.dozerX + l * e * (c - 0.3), 0.15, t),
        this.v2.set(l * e * 0.8, 0.5 + Math.random() * 0.4, t * 0.8),
        0.35,
        1.5,
        0.9,
        10783336,
        0.5,
      );
    }
    (f &&
      Math.random() < 0.08 &&
      r.fx.dust(this.v1.set(this.dozerX, 0.05, 0.75), 0.4),
      Math.floor(e * 5) !== Math.floor((e - n) * 5) &&
        e < a &&
        r.cam.shake(0.03 + h * 0.09, 0.25));
    let _ = this.targetX1 + l * (t.ENTRY - 1),
      v = Math.min((this.dozerX - this.casterX1) * l, this.prevReach ?? 1 / 0);
    this.prevReach = v;
    let y = this.casterX1 + l * (v - 0.9),
      b = Math.max(0.01, (_ - y) * l),
      ee = 1 - P((e - (s - 0.35)) / 0.3);
    for (let e of this.treads) {
      ((e.position.x = (_ + y) / 2), (e.scale.x = b));
      let t = e.material;
      ((t.opacity = 0.85 * ee), t.map && t.map.repeat.set(b / 0.55, 1));
    }
  }
  puff(e, t, n, r, i, a, o) {
    let s = this.puffs[this.puffIdx++ % this.puffs.length];
    (s.s.position.copy(e),
      s.vel.copy(t),
      (s.life = 0),
      (s.max = i),
      (s.size = n),
      (s.grow = r),
      (s.alpha = o),
      s.s.material.color.setHex(a),
      (s.s.material.rotation = Math.random() * Math.PI * 2),
      (s.s.visible = !0));
  }
  stepPuffs(e) {
    for (let t of this.puffs) {
      if (!t.s.visible) continue;
      t.life += e;
      let n = t.life / t.max;
      n >= 1
        ? (t.s.visible = !1)
        : (t.vel.multiplyScalar(1 - 1.8 * e),
          t.s.position.addScaledVector(t.vel, e),
          t.s.scale.setScalar(t.size * (1 + t.grow * F(n))),
          (t.s.material.opacity = t.alpha * Math.min(1, n * 6) * (1 - n)));
    }
  }
  burst(e) {
    let t = this.d.caster.facing;
    for (let n of this.chunks) {
      ((n.m.visible = !0),
        n.m.position.set(
          e + (Math.random() - 0.5) * 0.6,
          0.2 + Math.random() * 0.3,
          (Math.random() - 0.5) * 0.8,
        ));
      let r = (Math.random() - 0.5) * 2.2;
      (n.vel.set(
        -t * (1.5 + Math.random() * 3) * Math.cos(r),
        3 + Math.random() * 4,
        Math.sin(r) * 3,
      ),
        n.spin.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 16,
        ));
    }
  }
  stepChunks(e) {
    let { END: n } = t;
    for (let t of this.chunks)
      t.m.visible &&
        ((t.vel.y -= 16 * e),
        t.m.position.addScaledVector(t.vel, e),
        (t.m.rotation.x += t.spin.x * e),
        (t.m.rotation.y += t.spin.y * e),
        (t.m.rotation.z += t.spin.z * e),
        t.m.position.y < 0.05 &&
          ((t.m.position.y = 0.05),
          (t.vel.y = Math.abs(t.vel.y) > 1.5 ? -t.vel.y * 0.3 : 0),
          (t.vel.x *= 0.5),
          (t.vel.z *= 0.5),
          t.spin.multiplyScalar(0.4)),
        this.t > n - 0.5 && t.m.scale.multiplyScalar(1 - 4 * e));
  }
  stepDust(e) {
    let { SLAMS: n, END: r } = t,
      i = 1 - P((e - (r - 0.45)) / 0.4);
    for (let t = 0; t < this.dustPools.length; t++) {
      let r = this.dustPools[t],
        a = e - n[t];
      if (a < 0) {
        r.mesh.visible = !1;
        continue;
      }
      ((r.mesh.visible = !0),
        (r.mesh.position.x = this.targetX1 + (t - 1) * 0.16));
      let o = (0.25 + 0.75 * F(P(a / 0.28))) * r.maxScale;
      (r.mesh.scale.set(o * 1.25, o * 0.85, 1),
        (r.mat.opacity = 0.88 * Math.min(1, a * 10) * i));
    }
  }
  stepSquash(e) {
    let { SLAMS: n } = t;
    if (this.slamCount === 0 && e < n[0]) return;
    let r = this.d.targetRig.root,
      i = 1;
    if (this.popped) {
      let t = e - (this.popT ?? (this.popT = e));
      i = t > 0.55 ? 1 : 1 - 0.86 * Math.exp(-t * 8) * Math.cos(t * 18);
    } else {
      let t = [0.52, 0.28, 0.14];
      for (let r = 0; r < n.length; r++)
        if (e >= n[r] - 0.06) {
          let a = r === 0 ? 1 : t[r - 1],
            o = F(P((e - (n[r] - 0.04)) / 0.08)),
            s =
              r < 2 && e > n[r] + 0.12
                ? Math.sin(P((e - n[r] - 0.12) / 0.4) * Math.PI) * 0.1
                : 0;
          i = a + (t[r] - a) * o + s;
        }
    }
    let a = 1 + (1 - i) * 0.45;
    r.scale.set(a, i, a);
  }
  stepCamera(e) {
    let n = this.d,
      { IGNITE: r, POINT: i, ARRIVE: a, SLAMS: o, CRUSH: s, REVERSE: c } = t,
      l = n.caster.facing,
      u = this.v1,
      d = this.v2,
      f = this.casterX1,
      p = this.targetX1;
    if (e < i) {
      let t = n.casterRig.headWorld(u),
        a = 1.05 - I(P((e - r) / (i - r))) * 0.35;
      (d.set(t.x + l * a * 0.5, t.y + 0.03, t.z + a * 0.87),
        (u.y -= 0.02),
        n.cam.set(d, u, e < 0.1 ? 12 : 5, 30));
    } else if (e < a + 0.35)
      (u.set(p + l * 0.3, 1.2, 0),
        d.set(f - l * 0.9, 1.75, 2.5),
        n.cam.set(d, u, 4, 46));
    else if (e < o[0] - 0.25) {
      let e = (this.dozerX + p) / 2;
      (u.set(e, 1.05, 0), d.set(e - l * 0.8, 0.9, 6), n.cam.set(d, u, 3.5, 50));
    } else if (e < s + 0.45)
      (u.set(p + l * 0.35, 0.65, 0),
        d.set(p - l * 2.1, 0.52, 3.3),
        n.cam.set(d, u, 6.5, 50));
    else if (e < c + 0.3)
      (u.set(f + l * 1.3, 1.2, 0),
        d.set(f - l * 1.1, 1.35, 3.6),
        n.cam.set(d, u, 3.5, 46));
    else {
      let e = (f + p) / 2;
      (u.set(e + l * 0.6, 1, 0), d.set(e, 1.8, 7.2), n.cam.set(d, u, 2.5, 46));
    }
  }
  dispose() {
    let e = this.d;
    (e.audio.stopSuperBed(0.3),
      e.audio.stopEngine(0.3),
      e.targetRig.root.scale.set(1, 1, 1),
      (e.targetRig.root.visible = !0),
      e.scene.remove(this.root));
    let t = new Set();
    this.root.traverse((e) => {
      let n = e;
      n.geometry && !n.geometry.userData.shared && n.geometry.dispose();
      let r = n.material;
      r && (Array.isArray(r) ? r : [r]).forEach((e) => t.add(e));
    });
    for (let e of t) e.userData.shared || e.dispose();
  }
};
((us = Ts),
  e(Ts, `IGNITE`, 0.35),
  e(Ts, `GLARE`, 0.85),
  e(Ts, `POINT`, 1.2),
  e(Ts, `ARRIVE`, 1.5),
  e(Ts, `SLAMS`, [2.65, 3.35, 4.05]),
  e(Ts, `CRUSH`, us.SLAMS[2]),
  e(Ts, `STOP`, us.CRUSH + 0.55),
  e(Ts, `REVERSE`, us.CRUSH + 0.95),
  e(Ts, `END`, us.CRUSH + 2.6),
  e(Ts, `GAP`, 2.6),
  e(Ts, `HALF_LEN`, 1.6),
  e(Ts, `ENTRY`, 9.5),
  e(Ts, `BUCKET_REACH`, 1.35),
  e(Ts, `LIFT_ANGLE`, 1.2));
var Es = 16764730;
function Ds() {
  let e = new i(0.5, 36, 22),
    t = e.attributes.position,
    n = new T(),
    r = new Float32Array(t.count * 3),
    a = new Le(14464124),
    o = new Le(15519898),
    s = new Le(12094293),
    c = new Le();
  for (let e = 0; e < t.count; e++) {
    n.fromBufferAttribute(t, e);
    let i =
      1 +
      0.045 * Math.sin(n.x * 5 + 1) * Math.cos(n.z * 4) +
      0.03 * Math.sin(n.y * 6 + n.x * 2.5);
    (n.set(n.x * 1.42, n.y * 0.8, n.z * 0.92).multiplyScalar(i),
      n.y < -0.26 && (n.y = -0.26 + (n.y + 0.26) * 0.45),
      t.setXYZ(e, n.x, n.y, n.z));
    let l = 0.5 + 0.5 * Math.sin(n.x * 7 + n.z * 5) * Math.cos(n.y * 9);
    c.copy(a).lerp(o, l * 0.45);
    let u = Math.sin(e * 12.9898) * 43758.5453;
    (u - Math.floor(u) > 0.93 && c.lerp(s, 0.6),
      (r[e * 3] = c.r),
      (r[e * 3 + 1] = c.g),
      (r[e * 3 + 2] = c.b));
  }
  return (e.setAttribute(`color`, new De(r, 3)), e.computeVertexNormals(), e);
}
function Os(e) {
  let t = new c(),
    n = new p(e, new x({ vertexColors: !0, roughness: 0.85, metalness: 0 }));
  ((n.castShadow = !0), t.add(n));
  let r = e.attributes.position,
    a = e.attributes.normal,
    o = new x({ color: 11042892, roughness: 1 }),
    s = new i(0.035, 8, 6),
    l = new x({ color: 15327928, roughness: 0.8 }),
    u = new de(0.018, 0.07, 6),
    d = new T(),
    f = new T(),
    m = new T(0, 1, 0);
  return (
    [0.11, 0.27, 0.36, 0.52, 0.64, 0.78, 0.9].forEach((e, t) => {
      let i = Math.floor(e * r.count);
      if ((d.fromBufferAttribute(r, i), d.y < -0.2)) return;
      f.fromBufferAttribute(a, i);
      let c = new p(s, o);
      if (
        (c.position.copy(d).addScaledVector(f, -0.012),
        c.quaternion.setFromUnitVectors(m, f),
        c.scale.set(1, 0.3, 1),
        n.add(c),
        t === 1 || t === 4)
      ) {
        let e = new p(u, l);
        (e.position.copy(d).addScaledVector(f, 0.03),
          e.quaternion.setFromUnitVectors(m, f),
          n.add(e));
      }
    }),
    { root: t, body: n }
  );
}
function ks() {
  let e = new C(0.62, 0.22, 0.32),
    t = e.attributes.position;
  for (let e = 0; e < t.count; e++)
    t.getY(e) > 0 && t.setXYZ(e, t.getX(e) * 0.78, t.getY(e), t.getZ(e) * 0.72);
  return (e.computeVertexNormals(), e);
}
function As(e) {
  let t = new c(),
    n = new x({
      color: 16762170,
      emissive: 9067008,
      emissiveIntensity: 0.45,
      metalness: 1,
      roughness: 0.2,
    }),
    r = new x({
      color: 16764746,
      emissive: 9067008,
      emissiveIntensity: 0.5,
      metalness: 1,
      roughness: 0.3,
      flatShading: !0,
    }),
    i = ks(),
    a = new be(0.2, 0),
    o = [];
  return (
    [
      [-0.38, 0.11, 0.05, !0],
      [0, 0.11, 0.12, !0],
      [0.38, 0.11, 0, !0],
      [-0.19, 0.33, 0.07, !0],
      [0.2, 0.33, 0.06, !0],
      [-0.72, 0.16, 0.25, !1],
      [0.7, 0.16, 0.3, !1],
      [0.02, 0.5, 0.1, !1],
    ].forEach(([s, c, l, u], d) => {
      let f = new p(u ? i : a, u ? n : r);
      ((f.castShadow = !0),
        u || f.scale.set(1.4, 1.1, 1.2),
        (f.visible = !1),
        t.add(f),
        o.push({
          mesh: f,
          delay: d * 0.09,
          end: new T(e + s, c, l),
          spin: new T(
            6 + Math.random() * 6,
            4 + Math.random() * 5,
            3 + Math.random() * 4,
          ),
          rest: new Ie(0, (Math.random() - 0.5) * 0.5, 0),
        }));
    }),
    { root: t, pieces: o }
  );
}
function js() {
  if (typeof document > `u`) return null;
  let e = document.createElement(`canvas`);
  ((e.width = 512), (e.height = 160));
  let t = e.getContext(`2d`);
  if (!t) return null;
  ((t.fillStyle = `#16120a`),
    t.fillRect(0, 0, 512, 160),
    (t.strokeStyle = `#ffcf3a`),
    (t.lineWidth = 10),
    t.strokeRect(8, 8, 496, 144),
    (t.font = `bold 64px Impact, "Arial Black", sans-serif`),
    (t.textAlign = `center`),
    (t.textBaseline = `middle`),
    (t.fillStyle = `#c98a45`),
    t.fillText(`ALOO`, 130, 82),
    (t.fillStyle = `#ffffff`),
    t.fillText(`→`, 256, 78),
    (t.fillStyle = `#ffd84a`),
    t.fillText(`SONA`, 385, 82));
  let n = new _e(e);
  return ((n.colorSpace = oe), n);
}
function Ms(e, t) {
  let n = new c(),
    r = new p(new E(e, e, 0.05, 20), t);
  ((r.rotation.x = Math.PI / 2), n.add(r));
  let i = new C(0.07, 0.08, 0.05),
    a = Math.round(e * 40);
  for (let r = 0; r < a; r++) {
    let o = (r / a) * Math.PI * 2,
      s = new p(i, t);
    (s.position.set(Math.cos(o) * (e + 0.03), Math.sin(o) * (e + 0.03), 0),
      (s.rotation.z = o),
      n.add(s));
  }
  return n;
}
function Ns(e) {
  let t = new c(),
    n = new c();
  t.add(n);
  let r = new x({ color: 4608094, metalness: 0.75, roughness: 0.35 }),
    a = new x({ color: 2303790, metalness: 0.6, roughness: 0.5 }),
    o = new x({
      color: 16762938,
      emissive: 8014336,
      emissiveIntensity: 0.35,
      metalness: 0.9,
      roughness: 0.25,
    }),
    s = (e, t, r, i, a, o, s = 0) => {
      let c = new p(new C(e, t, r), i);
      return (c.position.set(a, o, s), (c.castShadow = !0), n.add(c), c);
    };
  (s(1.25, 0.18, 0.9, a, 0, 0.09),
    s(1.05, 1, 0.75, r, 0, 0.68),
    s(1.09, 0.07, 0.79, o, 0, 0.22),
    s(1.09, 0.07, 0.79, o, 0, 1.16));
  let l = new i(0.025, 6, 4);
  for (let e of [-0.46, 0.46])
    for (let t of [0.32, 0.6, 0.88, 1.06]) {
      let r = new p(l, o);
      (r.position.set(e, t, 0.38), n.add(r));
    }
  let u = new p(
    new E(0.42, 0.16, 0.42, 20, 1, !0),
    new x({ color: 6976900, metalness: 0.8, roughness: 0.3, side: 2 }),
  );
  (u.position.set(-e * 0.12, 1.42, 0), n.add(u));
  let d = new p(new w(0.42, 0.03, 8, 28), o);
  ((d.rotation.x = Math.PI / 2), d.position.set(-e * 0.12, 1.63, 0), n.add(d));
  let m = new p(new E(0.07, 0.09, 0.55, 10), a);
  (m.position.set(e * 0.36, 1.45, -0.18), n.add(m));
  let h = s(0.5, 0.08, 0.42, o, e * 0.7, 0.42);
  h.rotation.z = e * -0.45;
  let _ = new g({ color: 4063098 }),
    v = new p(new Fe(0.17, 28), _);
  (v.position.set(-0.18, 0.72, 0.38), n.add(v));
  let y = new p(new w(0.18, 0.025, 8, 28), o);
  (y.position.copy(v.position), n.add(y));
  let b = [Ms(0.16, o), Ms(0.1, a)];
  (b[0].position.set(0.22, 0.76, 0.4),
    b[1].position.set(0.37, 0.52, 0.4),
    n.add(...b));
  let ee = js(),
    S = new p(
      new f(0.9, 0.28),
      new g({ map: ee, color: ee ? 16777215 : 1446410 }),
    );
  (S.position.set(0, 0.36, 0.385), n.add(S));
  let te = [16726831, 16756736].map((e, t) => {
      let r = new g({ color: e }),
        a = new p(new i(0.05, 10, 8), r);
      return (a.position.set(t === 0 ? -0.45 : 0.45, 1.24, 0.3), n.add(a), r);
    }),
    re = new ne(8257434, 0, 5, 2);
  (re.position.set(0, 0.8, 0.8), t.add(re));
  let ie = nt(8257434, 1.4, 0);
  return (
    ie.position.copy(v.position).setZ(0.45),
    n.add(ie),
    {
      root: t,
      body: n,
      gears: b,
      window: _,
      lamps: te,
      light: re,
      glow: ie,
      hopperTop: new T(-e * 0.12, 1.7, 0),
      chimneyTop: new T(e * 0.36, 1.78, -0.18),
      chuteMouth: new T(e * 0.98, 0.3, 0),
    }
  );
}
var Ps = class t extends ka {
  constructor(t) {
    (super(t),
      e(this, `root`, new c()),
      e(this, `potato`, void 0),
      e(this, `gold`, void 0),
      e(this, `goldGlow`, void 0),
      e(this, `machine`, void 0),
      e(this, `machinePos`, new T()),
      e(this, `alooHome`, new T()),
      e(this, `tossFrom`, new T()),
      e(this, `bolt`, void 0),
      e(this, `gearSpin`, 0));
    let n = t.caster,
      r = t.target,
      i = n.facing;
    t.scene.add(this.root);
    let a = Ds();
    ((this.potato = Os(a)),
      (this.potato.root.visible = !1),
      (this.gold = As(r.x)),
      (this.goldGlow = nt(16767072, 2.6, 0)),
      this.goldGlow.position.set(r.x, 0.35, 0.2),
      (this.goldGlow.visible = !1),
      this.gold.root.add(this.goldGlow),
      this.root.add(this.potato.root, this.gold.root));
    let o = Math.abs(r.x - n.x);
    (this.machinePos.set(
      n.x + i * Math.min(1.5, Math.max(0.8, o * 0.45)),
      0,
      -0.9,
    ),
      (this.machine = Ns(i)),
      this.machine.root.position.copy(this.machinePos).setY(-2),
      (this.machine.root.visible = !1),
      this.root.add(this.machine.root),
      this.alooHome.set(r.x, 0.42, 0.1),
      (this.bolt = new p(
        new E(0.035, 0.035, 1, 6, 1, !0),
        new g({
          color: 12579071,
          transparent: !0,
          opacity: 0,
          blending: 2,
          depthWrite: !1,
        }),
      )),
      this.root.add(this.bolt),
      t.audio.whoosh());
  }
  pointPose(e) {
    return M(R(e, `rahul`), {
      spineT: -0.15,
      headT: -0.05,
      rShF: 1.55,
      rShO: 0.05,
      rEl: 0.05,
      rHand: 0,
      lShF: 0.25,
      lEl: 0.5,
    });
  }
  catchPose(e) {
    return M(R(e, `rahul`), {
      spineF: 0.08,
      rShF: 1.05,
      rShO: 0.15,
      rEl: 0.95,
      rHand: 1,
      lShF: 1,
      lShO: 0.15,
      lEl: 0.95,
      lHand: 1,
    });
  }
  windupPose(e) {
    return M(R(e, `rahul`), {
      spineT: 0.3,
      spineF: -0.12,
      headT: -0.15,
      rShF: 2.75,
      rShO: 0.35,
      rEl: 0.65,
      rHand: 1,
      lShF: 1,
      lShO: 0.2,
      lEl: 0.4,
    });
  }
  throwPose(e) {
    return M(R(e, `rahul`), {
      spineT: -0.25,
      spineF: 0.2,
      rShF: 1.35,
      rShO: 0.05,
      rEl: 0.1,
      rHand: 1,
      lShF: 0.5,
      lEl: 0.6,
    });
  }
  presentPose(e) {
    let t = Math.sin(e * 6) * 0.06;
    return M(R(e, `rahul`), {
      headF: -0.12,
      spineF: -0.05,
      rShF: 1.15 + t,
      rShO: 1.05,
      rEl: 0.3,
      rHand: 1,
      lShF: 1.15 - t,
      lShO: 1.05,
      lEl: 0.3,
      lHand: 1,
    });
  }
  step(e) {
    let n = this.d,
      r = t,
      i = this.t;
    this.advance(e, 0);
    let a = this.t,
      o = n.caster,
      s = n.target,
      c = o.facing,
      l = (e) => a >= e && i < e;
    ((this.casterPose =
      a < r.ZAP + 0.3
        ? N(R(a, `rahul`), this.pointPose(a), F(a / 0.35))
        : a < r.PICK
          ? N(
              this.pointPose(a),
              this.presentPose(a),
              I((a - r.ZAP - 0.3) / 0.4),
            )
          : a < r.WINDUP
            ? N(this.presentPose(a), this.catchPose(a), F((a - r.PICK) / 0.3))
            : a < r.TOSS
              ? N(
                  this.catchPose(a),
                  this.windupPose(a),
                  F((a - r.WINDUP) / 0.22),
                )
              : a < r.IN
                ? N(
                    this.windupPose(a),
                    this.throwPose(a),
                    F((a - r.TOSS) / 0.15),
                  )
                : a < r.END - 0.6
                  ? N(
                      this.throwPose(a),
                      this.presentPose(a),
                      I((a - r.IN) / 0.5),
                    )
                  : N(
                      this.presentPose(a),
                      R(a, `rahul`),
                      I((a - (r.END - 0.6)) / 0.5),
                    )),
      l(0.15) && n.speech(`caster`, `Ek aisi machine lagaunga...`),
      l(r.TOSS - 0.1) && n.speech(`caster`, `Is side se aloo ghusega...`),
      l(r.IN + 0.9) && n.speech(`caster`, `...us side se SONA niklega!`),
      this.stepBolt(a),
      l(r.ZAP) && (n.audio.eyeZing(), n.flash(`rgba(190,240,255,0.35)`, 120)),
      l(r.ALOO) &&
        ((n.targetRig.root.visible = !1),
        (this.targetPose = null),
        (this.potato.root.visible = !0),
        this.potato.root.position.copy(this.alooHome),
        this.puff(this.v1.set(s.x, 0.8, 0.1), 12159570),
        n.popup(`ALOO!`, this.v1.set(s.x, 1.6, 0.3), `#e0a060`),
        n.audio.plop(),
        n.arena.cheer(1.2)),
      this.stepPotato(a, i, c),
      this.stepMachine(a, i, e, c),
      this.stepGold(a, i, e),
      l(r.BACK) &&
        ((this.gold.root.visible = !1),
        this.puff(this.v1.set(s.x, 0.7, 0.1), Es, 90),
        (n.targetRig.root.visible = !0),
        this.landSuperHit(s.hp, c, 3, 6),
        this.layFlat(),
        n.audio.poof(),
        n.audio.thud(),
        n.cam.shake(0.3, 0.4),
        n.arena.cheer(1.5)),
      a >= r.BACK &&
        (this.targetPose = ca(a, Math.max(0, 0.06 - (a - r.BACK) * 0.06))),
      this.stepCamera(a),
      a >= r.END && ((o.y = 0), (this.done = !0)));
  }
  stepBolt(e) {
    let { ZAP: n, ALOO: r } = t,
      i = this.bolt.material;
    if (e < n || e > r) {
      i.opacity = 0;
      return;
    }
    let a = this.d.casterRig.handWorld(`r`, this.v1),
      o = this.targetChest(this.v2);
    (this.bolt.position.copy(a).add(o).multiplyScalar(0.5),
      this.bolt.scale.set(1, a.distanceTo(o), 1),
      this.bolt.quaternion.setFromUnitVectors(
        this.v3.set(0, 1, 0),
        o.clone().sub(a).normalize(),
      ),
      (i.opacity = Math.random() < 0.75 ? 0.95 : 0.25),
      Math.random() < 0.6 &&
        this.d.fx.particles.emit(o, {
          count: 4,
          speed: 2.2,
          color: 12579071,
          life: 0.25,
          size: 0.16,
          drag: 4,
          jitter: 0.25,
        }));
  }
  stepPotato(e, n, r) {
    let i = t,
      a = this.potato.root;
    if (!a.visible) return;
    let o = this.d;
    if (e < i.PICK) {
      let t = F(P((e - i.ALOO) / 0.25)),
        n =
          1 + Math.sin((e - i.ALOO) * 26) * Math.exp(-(e - i.ALOO) * 5) * 0.25;
      (a.scale.set(t * n, t / n, t),
        a.position.copy(this.alooHome),
        a.rotation.set(0, r > 0 ? -0.4 : 0.4, Math.sin(e * 18) * 0.08));
    } else if (e < i.TOSS) {
      let t = I(P((e - i.PICK) / 0.6)),
        n = o.casterRig.handWorld(`r`, this.v1);
      (a.position.lerpVectors(this.alooHome, n, t),
        (a.position.y += Math.sin(t * Math.PI) * 0.7),
        a.scale.setScalar(1 - t * 0.6),
        (a.rotation.y += 0.25),
        t >= 1 && this.tossFrom.copy(n),
        Math.random() < 0.3 &&
          o.fx.particles.emit(a.position, {
            count: 1,
            speed: 0.4,
            color: 16771488,
            life: 0.4,
            size: 0.12,
            drag: 2,
          }));
    } else if (e < i.IN) {
      let t = P((e - i.TOSS) / (i.IN - i.TOSS)),
        r = this.v2.copy(this.machine.hopperTop).add(this.machinePos);
      (a.position.lerpVectors(this.tossFrom, r, t),
        (a.position.y += Math.sin(t * Math.PI) * 1.1),
        (a.rotation.x += 0.35),
        (a.rotation.z += 0.2),
        a.scale.setScalar(0.4 - t * 0.12),
        e >= i.TOSS && n < i.TOSS && o.audio.whoosh());
    } else
      n < i.IN &&
        ((a.visible = !1),
        o.audio.plop(),
        o.popup(
          `GULP!`,
          this.v1.copy(this.machine.hopperTop).add(this.machinePos).setY(2.2),
          `#ffffff`,
        ));
  }
  stepMachine(e, n, r, i) {
    let a = t,
      o = this.d,
      s = this.machine,
      c = (t) => e >= t && n < t;
    if (
      (c(a.RISE) &&
        ((s.root.visible = !0),
        this.puff(this.v1.copy(this.machinePos).setY(0.3), 10132128, 70),
        o.fx.dust(this.v1.copy(this.machinePos).setY(0.05), 2),
        o.audio.horn(0.32),
        o.audio.startSuperBed(a.OUT - a.RISE, `tariff`),
        o.cam.shake(0.18, 0.35)),
      !s.root.visible)
    )
      return;
    let l =
        e < a.RISE + 0.55
          ? F((e - a.RISE) / 0.55) * 1.06 -
            Math.max(0, (e - a.RISE - 0.4) / 0.15) * 0.06
          : 1,
      u = e > a.END - 0.8 ? I((e - (a.END - 0.8)) / 0.7) : 0,
      d = e >= a.IN && e < a.OUT + 0.2,
      f = d ? P((e - a.IN) / (a.OUT - a.IN)) : 0,
      p = d ? 0.012 + f * 0.03 : 0;
    (s.root.position.set(
      this.machinePos.x + (Math.random() - 0.5) * p,
      -2 + 2 * Math.min(1, l) - u * 2.2,
      this.machinePos.z + (Math.random() - 0.5) * p,
    ),
      (s.body.rotation.z = d ? Math.sin(e * 40) * 0.015 * (0.4 + f) : 0),
      (this.gearSpin += r * (d ? 4 + f * 18 : 1.2)),
      (s.gears[0].rotation.z = this.gearSpin),
      (s.gears[1].rotation.z = -this.gearSpin * 1.6));
    let m = d ? Math.floor(e * (6 + f * 10)) % 2 : Math.floor(e * 2) % 2;
    (s.lamps[0].color.setHex(m ? 16726831 : 4198412),
      s.lamps[1].color.setHex(m ? 3811840 : 16756736),
      s.window.color.lerpColors(
        new Le(4063098),
        new Le(Es),
        e >= a.OUT ? 1 : f,
      ),
      s.light.color.copy(s.window.color),
      (s.light.intensity =
        (d
          ? 1.2 + f * 2.5 + Math.random() * 0.6
          : e >= a.OUT
            ? Math.max(0, 2.5 - (e - a.OUT) * 2)
            : 0.6) *
        (1 - u)),
      s.glow.material.color.copy(s.window.color),
      (s.glow.material.opacity = (d ? 0.35 + f * 0.5 : 0.25) * (1 - u)));
    let h = this.v1.copy(s.chimneyTop).add(s.root.position);
    if (
      (Math.random() < (d ? 0.8 : 0.2) &&
        o.fx.particles.emit(h, {
          count: d ? 3 : 1,
          speed: 0.8,
          color: 13619151,
          life: 1.1,
          size: 0.35,
          gravity: -1.4,
          drag: 1.5,
          jitter: 0.05,
        }),
      d && Math.random() < 0.25 + f * 0.4)
    ) {
      let e = this.v2.set(
        this.machinePos.x + (Math.random() - 0.5) * 1,
        1 + Math.random() * 0.3,
        this.machinePos.z + 0.4,
      );
      o.fx.particles.emit(e, {
        count: 3,
        speed: 2.6,
        color: 16756784,
        life: 0.35,
        size: 0.1,
        gravity: 6,
        drag: 1,
        jitter: 0.1,
      });
    }
    (c(a.IN) && (o.audio.startEngine(), o.audio.drumroll(a.OUT - a.IN)),
      d && o.audio.setEngine(0.5 + f * 0.5, f),
      c(a.OUT + 0.3) && o.audio.stopEngine(0.4),
      c(a.OUT - 0.5) &&
        o.popup(
          `PROCESSING...`,
          this.v1.copy(this.machinePos).setY(2.3),
          `#7dff9a`,
        ),
      c(a.END - 0.8) &&
        (this.puff(this.v1.copy(this.machinePos).setY(0.3), 10132128, 40),
        o.audio.poof()));
  }
  stepGold(e, n, r) {
    let i = t,
      a = this.d;
    if (e < i.OUT || !this.gold.root.visible) return;
    let o = this.v1.copy(this.machine.chuteMouth).add(this.machinePos);
    ((o.z = 0.1),
      n < i.OUT &&
        (a.audio.superRelease(`tariff`),
        a.audio.kaching(1),
        a.audio.coins(16),
        a.flash(`rgba(255,215,90,0.75)`, 260),
        a.cam.shake(0.35, 0.5),
        a.fx.particles.emit(o, {
          count: 70,
          speed: 4.5,
          color: Es,
          life: 0.9,
          size: 0.22,
          gravity: 7,
          drag: 1.2,
          jitter: 0.15,
        }),
        a.fx.particles.emit(o, {
          count: 25,
          speed: 2.5,
          color: 16777215,
          life: 0.5,
          size: 0.14,
          drag: 3,
        }),
        a.popup(`SONA!`, this.v2.copy(o).setY(1.9), `#ffd84a`),
        a.arena.cheer(2)));
    let s = i.LAND - i.OUT,
      c = 0;
    for (let t of this.gold.pieces) {
      let n = t.mesh,
        l = (e - i.OUT - t.delay) / s;
      if (!(l < 0)) {
        if (
          (n.visible ||
            ((n.visible = !0),
            a.fx.particles.emit(o, {
              count: 10,
              speed: 3,
              color: Es,
              life: 0.5,
              size: 0.16,
              gravity: 5,
              drag: 1.5,
            })),
          l < 1)
        )
          (n.position.lerpVectors(o, t.end, l),
            (n.position.y += Math.sin(l * Math.PI) * (1.2 + t.delay * 2)),
            (n.rotation.x += r * t.spin.x),
            (n.rotation.y += r * t.spin.y),
            (n.rotation.z += r * t.spin.z),
            Math.random() < 0.5 &&
              a.fx.particles.emit(n.position, {
                count: 1,
                speed: 0.5,
                color: Es,
                life: 0.4,
                size: 0.12,
                drag: 2,
              }));
        else {
          let e = (l - 1) * s;
          (e < r * 1.5 &&
            (a.fx.dust(this.v3.set(t.end.x, 0.05, t.end.z), 0.6),
            t.delay === 0 && a.audio.thud(),
            t.delay > 0.3 && t.delay < 0.4 && a.audio.kaching(0.6)),
            n.position.copy(t.end),
            (n.position.y +=
              Math.abs(Math.sin(e * 11)) * 0.12 * Math.exp(-e * 6)),
            n.rotation.copy(t.rest),
            c++);
        }
      }
    }
    if (
      ((this.goldGlow.visible = c > 0),
      (this.goldGlow.material.opacity =
        (0.35 + Math.sin(e * 12) * 0.12) * (c / this.gold.pieces.length)),
      c > 3 && Math.random() < 0.4)
    ) {
      let e =
        this.gold.pieces[Math.floor(Math.random() * this.gold.pieces.length)];
      a.fx.particles.emit(this.v3.copy(e.end).add(this.v2.set(0, 0.15, 0.2)), {
        count: 1,
        speed: 0.1,
        color: 16777215,
        life: 0.3,
        size: 0.2,
      });
    }
  }
  puff(e, t, n = 55) {
    let r = this.d;
    (r.fx.particles.emit(e, {
      count: n,
      speed: 3,
      color: t,
      life: 0.7,
      size: 0.45,
      gravity: -0.6,
      drag: 2.6,
      jitter: 0.4,
    }),
      r.fx.particles.emit(e, {
        count: 12,
        speed: 2.2,
        color: 16777215,
        life: 0.35,
        size: 0.2,
        gravity: -0.4,
        drag: 3,
        jitter: 0.3,
      }),
      r.audio.poof());
  }
  stepCamera(e) {
    let n = t,
      r = this.d,
      i = r.caster,
      a = r.target,
      o = i.facing,
      s = this.v1,
      c = this.v2,
      l = (i.x + a.x) / 2,
      u = this.machinePos.x;
    if (e < n.ZAP)
      (s.set(i.x + o * 0.2, 1.4, 0),
        c.set(i.x + o * 1.2, 1.5, 2.6),
        r.cam.set(c, s, e < 0.15 ? 10 : 4, 38));
    else if (e < n.RISE)
      (s.set(a.x, 0.9, 0),
        c.set(a.x - o * 0.6, 1.3, 3),
        r.cam.set(c, s, 4, 40));
    else if (e < n.PICK)
      (s.set((u + a.x) / 2, 0.9, -0.4),
        c.set(u + o * 0.3, 0.55, 4.4),
        r.cam.set(c, s, 3, 46));
    else if (e < n.IN)
      (s.set((i.x + u) / 2, 1.3, -0.3),
        c.set((i.x + u) / 2 - o * 0.5, 1.9, 4.6),
        r.cam.set(c, s, 2.6, 42));
    else if (e < n.OUT) {
      let t = (e - n.IN) / (n.OUT - n.IN),
        a = i.x * 0.4 + u * 0.6;
      (s.set(a, 1.2, this.machinePos.z * 0.5),
        c.set(a + o * 0.2, 1.55, 4.8 - t * 0.8),
        r.cam.set(c, s, 2.4, 42 - t * 3));
    } else
      e < n.BACK + 0.2
        ? (s.set((u + a.x) / 2, 0.7, 0),
          c.set((u + a.x) / 2, 1.3, 4.2),
          r.cam.set(c, s, 3, 42))
        : (s.set(l, 0.9, 0), c.set(l, 1.9, 6.6), r.cam.set(c, s, 2.5, 42));
  }
  dispose() {
    let e = this.d;
    (e.audio.stopSuperBed(0.3),
      e.audio.stopEngine(0.2),
      (e.targetRig.root.visible = !0),
      e.scene.remove(this.root),
      this.root.traverse((e) => {
        let t = e;
        t.geometry && t.geometry.dispose();
      }));
  }
};
(e(Ps, `ZAP`, 0.75),
  e(Ps, `ALOO`, 1.2),
  e(Ps, `RISE`, 1.5),
  e(Ps, `PICK`, 2.55),
  e(Ps, `WINDUP`, 3.25),
  e(Ps, `TOSS`, 3.55),
  e(Ps, `IN`, 4.1),
  e(Ps, `OUT`, 6.1),
  e(Ps, `LAND`, 6.8),
  e(Ps, `BACK`, 7.6),
  e(Ps, `END`, 8.7));
function Fs() {
  if (typeof document > `u`) return null;
  let e = document.createElement(`canvas`);
  ((e.width = 256), (e.height = 256));
  let t = e.getContext(`2d`);
  if (!t) return null;
  ((t.fillStyle = `#d81f26`),
    t.fillRect(0, 0, 256, 256),
    (t.fillStyle = `#ffd21a`),
    t.fillRect(28, 64, 200, 128),
    (t.strokeStyle = `#1a1a1a`),
    (t.lineWidth = 8),
    t.strokeRect(28, 64, 200, 128),
    (t.fillStyle = `#1a1a1a`),
    (t.font = `bold 96px Impact, "Arial Black", sans-serif`),
    (t.textAlign = `center`),
    (t.textBaseline = `middle`),
    t.fillText(`E20`, 128, 132));
  let n = new _e(e);
  return ((n.colorSpace = oe), n);
}
var Is = (e) =>
    new g({
      color: e,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
    }),
  Ls = class t extends ka {
    constructor(t) {
      (super(t),
        e(this, `root`, new c()),
        e(this, `hole`, void 0),
        e(this, `rim`, void 0),
        e(this, `machine`, void 0),
        e(this, `gears`, []),
        e(this, `tankGlow`, void 0),
        e(this, `cane`, void 0),
        e(this, `machineX`, void 0),
        e(this, `stream`, void 0),
        e(this, `match`, void 0),
        e(this, `matchFlame`, void 0),
        e(this, `flames`, []),
        e(this, `fireGlow`, void 0),
        e(this, `fireLight`, void 0),
        e(this, `holePos`, new T()),
        e(this, `flickFrom`, new T()),
        e(this, `startX`, void 0),
        e(this, `edgeX`, void 0),
        e(this, `f`, void 0));
      let n = t.caster,
        r = t.target;
      ((this.f = n.facing),
        t.scene.add(this.root),
        this.holePos.set(r.x, 0.02, 0),
        (this.startX = n.x),
        (this.edgeX = Math.max(-O, Math.min(O, r.x - this.f * 2.95))),
        (this.machineX = r.x - this.f * 1.15),
        (this.hole = new p(new Fe(0.75, 32), new g({ color: 328707 }))),
        (this.hole.rotation.x = -Math.PI / 2),
        this.hole.position.copy(this.holePos),
        this.hole.scale.setScalar(0.001));
      let a = new m(0.72, 0.95, 32, 1),
        o = a.attributes.position;
      for (let e = 0; e < o.count; e++)
        if (Math.hypot(o.getX(e), o.getY(e)) > 0.8) {
          let t = 1 + (Math.sin(e * 7.3) * 0.5 + 0.5) * 0.18;
          o.setXY(e, o.getX(e) * t, o.getY(e) * t);
        }
      ((this.rim = new p(a, new x({ color: 2827810, roughness: 1 }))),
        (this.rim.rotation.x = -Math.PI / 2),
        this.rim.position.copy(this.holePos).setY(0.025),
        this.rim.scale.setScalar(0.001),
        this.root.add(this.hole, this.rim));
      let s = this.f;
      this.machine = new c();
      let l = new x({ color: 2067004, roughness: 0.45, metalness: 0.3 }),
        u = new x({ color: 15909424, roughness: 0.5, metalness: 0.2 }),
        d = new x({ color: 9080985, roughness: 0.3, metalness: 0.8 }),
        f = (e, t, n, r, i, a, o = 0) => {
          let s = new p(new C(e, t, n), r);
          return (
            s.position.set(i, a, o),
            (s.castShadow = !0),
            this.machine.add(s),
            s
          );
        };
      f(1, 0.14, 0.8, d, 0, 0.07);
      let h = Fs();
      (f(
        0.85,
        0.85,
        0.65,
        [
          l,
          l,
          l,
          l,
          new x({ map: h, color: h ? 16777215 : 16765466, roughness: 0.5 }),
          l,
        ],
        0,
        0.56,
      ),
        f(0.89, 0.06, 0.69, u, 0, 0.22),
        f(0.89, 0.06, 0.69, u, 0, 0.98));
      let _ = new p(
        new E(0.16, 0.09, 0.3, 14, 1, !0),
        new x({ color: 6976900, metalness: 0.8, roughness: 0.3, side: 2 }),
      );
      ((_.rotation.z = Math.PI / 2),
        _.position.set(-s * 0.57, 0.78, 0),
        this.machine.add(_));
      let v = new p(new Fe(0.09, 14), new g({ color: 526344 }));
      ((v.rotation.y = (-s * Math.PI) / 2),
        v.position.set(-s * 0.426, 0.78, 0),
        this.machine.add(v),
        (this.tankGlow = new g({ color: 3811848 })));
      let y = new p(new Fe(0.11, 20), this.tankGlow);
      (y.position.set(s * 0.25, 0.75, 0.331), this.machine.add(y));
      for (let [e, t, n] of [
        [-0.25, 0.42, 0.1],
        [-0.1, 0.38, 0.07],
      ]) {
        let r = new p(new E(n, n, 0.04, 10), u);
        ((r.rotation.x = Math.PI / 2),
          r.position.set(s * e, t, 0.34),
          this.machine.add(r),
          this.gears.push(r));
      }
      let b = new p(new E(0.05, 0.05, 0.45, 10), d);
      (b.position.set(s * 0.6, 0.72, 0),
        (b.rotation.z = s * 0.9),
        this.machine.add(b),
        this.machine.position.set(this.machineX, -1.6, -0.15),
        (this.machine.visible = !1),
        this.root.add(this.machine),
        (this.cane = new c()));
      let ee = new x({ color: 10270778, roughness: 0.6 }),
        S = new x({ color: 6254114, roughness: 0.7 });
      for (let [e, t] of [
        [0, 0],
        [0.05, 0.04],
        [0.05, -0.04],
      ]) {
        let n = new p(new E(0.025, 0.028, 1.2, 8), ee);
        (n.position.set(0, e, t), this.cane.add(n));
        for (let e = -4; e <= 4; e++) {
          let t = new p(new w(0.027, 0.006, 4, 10), S);
          ((t.rotation.x = Math.PI / 2),
            t.position.set(0, e * 0.14, 0),
            n.add(t));
        }
      }
      ((this.cane.visible = !1),
        this.root.add(this.cane),
        (this.stream = new p(new E(0.012, 0.02, 1, 6, 1, !0), Is(16757818))),
        this.root.add(this.stream),
        (this.match = new c()));
      let te = new p(new E(0.009, 0.009, 0.14, 5), new x({ color: 15255696 })),
        re = new p(new i(0.012, 6, 5), new x({ color: 9048080 }));
      ((re.position.y = 0.07),
        (this.matchFlame = nt(16752672, 0.3, 0)),
        (this.matchFlame.position.y = 0.1),
        this.match.add(te, re, this.matchFlame),
        (this.match.visible = !1),
        this.root.add(this.match));
      for (let e = 0; e < 11; e++) {
        let t = new p(
          new de(0.65, 1.4, 10, 1, !0),
          Is(e % 3 == 0 ? 13138448 : e % 3 == 1 ? 11551240 : 9052160),
        );
        (t.position.copy(this.holePos),
          (t.userData = {
            ph: e * 1.7,
            dx: (Math.random() - 0.5) * 1,
            dz: (Math.random() - 0.5) * 0.7,
          }),
          this.flames.push(t),
          this.root.add(t));
      }
      ((this.fireGlow = nt(16740368, 8.5, 0)),
        this.fireGlow.position.copy(this.holePos).setY(2.6),
        this.root.add(this.fireGlow),
        (this.fireLight = new ne(16742944, 0, 12, 2)),
        this.fireLight.position.copy(this.holePos).setY(1.2),
        this.root.add(this.fireLight));
    }
    carryPose(e, t) {
      return M($i(e, t, 1, `nitin`), {
        rShF: 0.9,
        rShO: 0.15,
        rEl: 1.2,
        rHand: 0,
        lShF: 0.9,
        lShO: 0.15,
        lEl: 1.2,
        lHand: 0,
      });
    }
    feedPose(e, t) {
      return M(R(e, `nitin`), {
        spineF: 0.2 * t,
        rShF: 0.9 + 0.6 * t,
        rShO: 0.1,
        rEl: 1.2 - 0.9 * t,
        rHand: 0,
        lShF: 0.9 + 0.6 * t,
        lShO: 0.1,
        lEl: 1.2 - 0.9 * t,
        lHand: 0,
      });
    }
    watchPose(e) {
      let t = Math.sin(e * 5) * 0.05;
      return M(R(e, `nitin`), {
        headF: 0.15,
        rShF: 1.2 + t,
        rShO: 0.55,
        rEl: 0.2,
        rHand: 1,
        lShF: 0.35,
        lShO: 0.25,
        lEl: 1.9,
        lHand: 0,
      });
    }
    strikePose(e) {
      let t = Math.sin(e * 18) * 0.06;
      return M(R(e, `nitin`), {
        headF: 0.35,
        spineF: 0.08,
        rShF: 0.75 + t,
        rShO: -0.3,
        rEl: 1.55,
        rHand: 0,
        lShF: 0.7,
        lShO: -0.3,
        lEl: 1.5,
        lHand: 0,
      });
    }
    flickPose(e) {
      return M(R(e, `nitin`), {
        spineT: -0.15,
        rShF: 1.5,
        rShO: 0.1,
        rEl: 0.15,
        rHand: 1,
        lShF: 0.3,
        lEl: 0.4,
      });
    }
    step(e) {
      let n = this.d,
        r = t,
        i = this.t;
      this.advance(e, 0);
      let a = this.t,
        o = n.caster,
        s = n.target,
        c = this.f,
        l = (e) => a >= e && i < e,
        u = F(P((a - r.CRACK) / 0.35)),
        d = a > r.OUT ? I(P((a - r.OUT) / 0.5)) : 0;
      if (
        (this.hole.scale.setScalar(Math.max(0.001, u * (1 - d))),
        this.rim.scale.setScalar(Math.max(0.001, u * (1 - d))),
        l(r.CRACK) &&
          (n.audio.thunder(),
          n.cam.shake(0.25, 0.4),
          n.fx.dust(this.v1.copy(this.holePos), 2),
          n.fx.particles.emit(this.v1.copy(this.holePos).setY(0.1), {
            count: 40,
            speed: 3.5,
            color: 3814962,
            life: 0.7,
            size: 0.18,
            gravity: 9,
            drag: 0.8,
            jitter: 0.5,
          }),
          n.popup(`GADDHA!`, this.v1.copy(this.holePos).setY(1.9), `#ffb43a`)),
        a < r.CRACK)
      )
        this.targetPose = null;
      else if (a < r.SINK) {
        let e = Math.sin((a - r.CRACK) * 16);
        ((this.targetPose = M(R(a, s.char.id), {
          spineF: -0.25 - 0.08 * e,
          headF: -0.3,
          lShF: 2 + 0.7 * e,
          rShF: 2 - 0.7 * e,
          lShO: 0.6,
          rShO: 0.6,
          lEl: 0.4,
          rEl: 0.4,
        })),
          l(r.CRACK + 0.25) &&
            n.speech(`target`, `Arre arre... yeh gaddha kahan se aaya?!`));
      } else if (a < r.GONE) {
        let e = P((a - r.SINK) / (r.GONE - r.SINK));
        ((s.y = -2.6 * e * e),
          (this.targetPose = M(R(a, s.char.id), {
            lShF: 3,
            rShF: 3,
            lShO: 0.3,
            rShO: 0.3,
            lEl: 0.15,
            rEl: 0.15,
            headF: -0.5,
            spineF: -0.15,
          })),
          l(r.SINK) &&
            (n.speech(`target`, `Arey pothole!!`),
            n.popup(`AAAAAH!`, this.v1.copy(this.holePos).setY(1.6), `#ffffff`),
            n.audio.whoosh()));
      } else
        a < r.OUT &&
          (l(r.GONE) &&
            (n.audio.thud(),
            n.cam.shake(0.15, 0.3),
            n.fx.particles.emit(this.v1.copy(this.holePos).setY(0.15), {
              count: 45,
              speed: 2.2,
              color: 7035464,
              life: 1.1,
              size: 0.45,
              gravity: -1.2,
              drag: 2,
              jitter: 0.35,
            })),
          (n.targetRig.root.visible = !1));
      if (a < r.WALK) this.casterPose = R(a, `nitin`);
      else if (a < r.POUR) {
        let e = I(P((a - r.WALK) / (r.POUR - r.WALK - 0.1)));
        ((o.x = this.startX + (this.edgeX - this.startX) * e),
          (this.casterPose = this.carryPose(a, Math.abs(o.x - this.startX))));
      } else if (a < r.FLOW)
        this.casterPose = this.feedPose(
          a,
          I(P((a - r.POUR) / (r.FLOW - r.POUR - 0.1))),
        );
      else if (a < r.MATCH)
        this.casterPose = N(
          this.feedPose(a, 1),
          this.watchPose(a),
          F((a - r.FLOW) / 0.4),
        );
      else if (a < r.FLICK)
        this.casterPose = N(
          this.watchPose(a),
          this.strikePose(a),
          F((a - r.MATCH) / 0.25),
        );
      else if (a < r.TURN)
        this.casterPose = N(
          this.strikePose(a),
          this.flickPose(a),
          F((a - r.FLICK) / 0.12),
        );
      else {
        l(r.TURN) && (o.facing = -c);
        let e = Math.max(0, a - r.FIRE) * 0.55;
        ((o.x = Math.max(-O, Math.min(O, this.edgeX - c * e))),
          (this.casterPose =
            a < r.FIRE ? R(a, `nitin`) : $i(a, e, 1, `nitin`)));
      }
      (l(0.3) && n.speech(`caster`, `Gaddha-mukt Bharat... ek minute.`),
        this.stepMachine(a, i, e),
        this.stepMatch(a, i),
        this.stepFire(a, i, e),
        l(r.OUT) &&
          ((n.targetRig.root.visible = !0),
          this.landSuperHit(s.hp, c, 0, 0),
          this.layFlat(),
          n.fx.particles.emit(this.v1.copy(this.holePos).setY(0.5), {
            count: 40,
            speed: 2,
            color: 2763306,
            life: 1,
            size: 0.4,
            gravity: -1,
            drag: 2,
          }),
          n.audio.poof()),
        a >= r.OUT &&
          (this.targetPose = ca(a, Math.max(0, 0.08 - (a - r.OUT) * 0.08))),
        this.stepCamera(a),
        a >= r.END && ((o.y = 0), (this.done = !0)));
    }
    stepMachine(e, n, r) {
      let i = t,
        a = this.d,
        o = this.f,
        s = this.machine,
        c = (t) => e >= t && n < t;
      (c(i.RISE) &&
        ((s.visible = !0),
        a.fx.dust(this.v1.set(this.machineX, 0.05, -0.15), 1.6),
        a.fx.particles.emit(this.v1.set(this.machineX, 0.3, 0), {
          count: 40,
          speed: 2.6,
          color: 9077368,
          life: 0.7,
          size: 0.4,
          gravity: -0.6,
          drag: 2.4,
          jitter: 0.4,
        }),
        a.audio.horn(0.32),
        a.popup(`GANNA → E20!`, this.v1.set(this.machineX, 2, 0.3), `#3dff7a`)),
        c(i.HIDE) &&
          (a.fx.particles.emit(this.v1.set(this.machineX, 0.3, 0), {
            count: 30,
            speed: 2,
            color: 9077368,
            life: 0.6,
            size: 0.35,
            gravity: -0.6,
            drag: 2.4,
            jitter: 0.4,
          }),
          a.audio.poof()));
      let l = F(P((e - i.RISE) / 0.45)),
        u = I(P((e - i.HIDE) / 0.5)),
        d = e >= i.POUR + 0.4 && e < i.POUR_END;
      ((s.position.y =
        -1.6 + 1.6 * l - 1.7 * u + (d ? Math.sin(e * 40) * 0.01 : 0)),
        (s.position.x =
          this.machineX + (d ? (Math.random() - 0.5) * 0.015 : 0)),
        e >= i.HIDE + 0.55 && (s.visible = !1));
      for (let [e, t] of this.gears.entries())
        t.rotation.y += r * (d ? 14 : 2) * (e ? -1.5 : 1);
      let f = P((e - i.FLOW + 0.4) / 0.6) * (1 - P((e - i.POUR_END) / 0.3));
      this.tankGlow.color.setRGB(
        0.23 + 0.77 * f,
        0.16 + 0.55 * f,
        0.03 + 0.1 * f,
      );
      let p = e >= i.WALK && e < i.FLOW;
      if (((this.cane.visible = p), p)) {
        let t = a.casterRig.handWorld(`l`, this.v1),
          n = a.casterRig.handWorld(`r`, this.v2),
          c = this.v3.copy(t).add(n).multiplyScalar(0.5),
          l = new T(this.machineX - o * 0.72, s.position.y + 0.78, -0.15),
          u = e < i.POUR ? 0 : I(P((e - i.POUR) / (i.FLOW - i.POUR - 0.1))),
          d = P(u / 0.3),
          f = 1.2 * (1 - 0.92 * P((u - 0.3) / 0.7)),
          p = this.v1.copy(l).setX(l.x - (f / 2) * o);
        (this.cane.position.lerpVectors(c, p, d),
          this.cane.rotation.set(0, 0, (o * Math.PI) / 2),
          this.cane.scale.set(1, f / 1.2, 1),
          e >= i.POUR + 0.3 &&
            Math.random() < r * 30 &&
            (a.fx.particles.emit(l, {
              count: 3,
              speed: 1.4,
              color: 12113994,
              life: 0.35,
              size: 0.08,
              gravity: 4,
              drag: 2,
            }),
            Math.random() < 0.15 && a.audio.plop()));
      }
      c(i.POUR + 0.4) && a.audio.metalCrunch();
      let m = this.stream.material;
      if (!(e >= i.FLOW && e < i.POUR_END)) {
        m.opacity = 0;
        return;
      }
      c(i.FLOW) &&
        a.popup(
          `E20!`,
          this.v1.set(this.machineX + o * 0.6, 1.5, 0.3),
          `#ffd21a`,
        );
      let h = this.v2.set(this.machineX + o * 0.82, s.position.y + 0.55, -0.15),
        g = this.v3.copy(this.holePos).setY(0.02);
      ((g.x = this.holePos.x - o * 0.25),
        this.stream.position.copy(h).add(g).multiplyScalar(0.5),
        this.stream.scale.set(1.6, h.distanceTo(g), 1.6),
        this.stream.quaternion.setFromUnitVectors(
          new T(0, 1, 0),
          g.clone().sub(h).normalize(),
        ),
        (m.opacity = 0.75 + Math.random() * 0.2),
        Math.random() < r * 40 &&
          a.fx.particles.emit(g, {
            count: 2,
            speed: 0.8,
            color: 16757818,
            life: 0.3,
            size: 0.09,
            gravity: 3,
            drag: 2,
          }),
        Math.random() < r * 4 && a.audio.plop());
    }
    stepMatch(e, n) {
      let r = t,
        i = this.d,
        a = this.matchFlame.material;
      if (e < r.MATCH || e >= r.FIRE) {
        this.match.visible = !1;
        return;
      }
      this.match.visible = !0;
      let o = e >= r.MATCH + 0.25;
      if (
        (e >= r.MATCH + 0.25 &&
          n < r.MATCH + 0.25 &&
          (i.audio.snap(),
          i.fx.particles.emit(i.casterRig.handWorld(`r`, this.v1), {
            count: 10,
            speed: 1.2,
            color: 16760896,
            life: 0.25,
            size: 0.06,
            drag: 3,
          }),
          i.popup(`TSSK!`, this.v1.setY(this.v1.y + 0.4), `#ffb43a`)),
        (a.opacity = o ? 0.8 + Math.random() * 0.2 : 0),
        this.matchFlame.scale.setScalar(o ? 0.3 + Math.random() * 0.08 : 0.01),
        e < r.FLICK)
      )
        (i.casterRig.handWorld(`r`, this.v1),
          this.match.position.copy(this.v1),
          this.match.rotation.set(0, 0, 0.4),
          this.flickFrom.copy(this.v1));
      else {
        let t = P((e - r.FLICK) / (r.FIRE - r.FLICK));
        (this.match.position.lerpVectors(this.flickFrom, this.holePos, t),
          (this.match.position.y += Math.sin(t * Math.PI) * 0.6),
          (this.match.rotation.z += 0.5));
      }
    }
    stepFire(e, n, r) {
      let i = t,
        a = this.d;
      if (
        (e >= i.FIRE &&
          n < i.FIRE &&
          (a.audio.superRelease(`bulldozer`),
          a.audio.thunder(),
          a.flash(`rgba(255,160,60,0.6)`, 220),
          a.cam.shake(0.5, 0.7),
          a.fx.particles.emit(this.v1.copy(this.holePos).setY(0.4), {
            count: 160,
            speed: 8,
            color: 16747040,
            life: 1,
            size: 0.5,
            gravity: -3,
            drag: 1.4,
            jitter: 0.6,
          }),
          a.popup(`DHADAAM!`, this.v1.copy(this.holePos).setY(4.2), `#ff7a10`),
          a.arena.cheer(2)),
        Rs(e, n, i.FIRE + 0.6) &&
          a.speech(`caster`, `Quality ka koi compromise nahi!`),
        e < i.FIRE)
      )
        return;
      let o =
        F(P((e - i.FIRE) / 0.35)) *
        (e > i.OUT - 0.4 ? 1 - P((e - (i.OUT - 0.4)) / 0.5) : 1);
      (this.flames.forEach((t, n) => {
        let r = t.userData,
          i = 0.75 + Math.sin(e * (13 + n) + r.ph) * 0.2 + Math.random() * 0.15,
          a = (3 + (n % 3) * 1.1) * i * o;
        (t.scale.set(
          Math.max(0.001, o * (1.2 + (n % 2) * 0.6)),
          Math.max(0.001, a),
          Math.max(0.001, o * (1.2 + (n % 2) * 0.6)),
        ),
          t.position.set(
            this.holePos.x + r.dx * o,
            a * 0.8,
            this.holePos.z + r.dz * o,
          ),
          (t.material.opacity = 0.32 * o));
      }),
        (this.fireGlow.material.opacity =
          0.35 * o * (0.85 + Math.random() * 0.15)),
        (this.fireLight.intensity = 10 * o * (0.8 + Math.random() * 0.3)),
        o > 0.05 &&
          (Math.random() < r * 80 &&
            a.fx.particles.emit(
              this.v1.copy(this.holePos).setY(0.4 + Math.random() * 2.5),
              {
                count: 3,
                speed: 2,
                color: Math.random() < 0.5 ? 16756784 : 16734736,
                life: 0.6,
                size: 0.3,
                gravity: -4,
                drag: 1.2,
                jitter: 0.4,
              },
            ),
          Math.random() < r * 18 &&
            a.fx.particles.emit(this.v1.copy(this.holePos).setY(3.8), {
              count: 3,
              speed: 0.9,
              color: 2762276,
              life: 1.6,
              size: 0.8,
              gravity: -1.5,
              drag: 1,
              jitter: 0.5,
            })));
    }
    stepCamera(e) {
      let n = t,
        r = this.d,
        i = r.caster,
        a = this.f,
        o = this.v1,
        s = this.v2,
        c = this.holePos.x;
      if (e < n.CRACK)
        (o.set(i.x + a * 0.2, 1.45, 0),
          s.set(i.x + a * 1.2, 1.55, 2.6),
          r.cam.set(s, o, e < 0.15 ? 10 : 4, 38));
      else if (e < n.WALK)
        (o.set(c, 0.5, 0),
          s.set(c - a * 1.4, 2.5, 3.6),
          r.cam.set(s, o, 4, 44));
      else if (e < n.FLOW)
        (o.set((i.x + c) / 2, 0.8, 0),
          s.set((i.x + c) / 2 - a * 0.3, 1.7, 4.4),
          r.cam.set(s, o, 3, 42));
      else if (e < n.FLOW + 1.5) {
        let t = (e - n.FLOW) / 1.5,
          i = this.machineX;
        (o.set(i + a * 0.55, 0.55, -0.1),
          s.set(i - a * (0.35 - t * 0.3), 0.75 + t * 0.1, 2 - t * 0.35),
          r.cam.set(s, o, e < n.FLOW + 0.1 ? 12 : 2.2, 38));
      } else if (e < n.FLICK)
        (o.set(i.x + a * 0.18, 1.45, 0),
          s.set(i.x + a * 1.05, 1.55, 1.25),
          r.cam.set(s, o, e < n.FLOW + 1.6 ? 12 : 3, 36));
      else {
        let t = (i.x + c) / 2;
        (o.set(t, 1.5, 0),
          s.set(t, 2.3, 8),
          r.cam.set(s, o, e < n.FLICK + 0.1 ? 12 : 2.5, 44));
      }
    }
    dispose() {
      let e = this.d;
      (e.audio.stopSuperBed(0.3),
        (e.targetRig.root.visible = !0),
        (e.target.y = 0),
        e.scene.remove(this.root),
        this.root.traverse((e) => {
          let t = e;
          t.geometry && t.geometry.dispose();
        }));
    }
  };
(e(Ls, `CRACK`, 1.1),
  e(Ls, `SINK`, 1.9),
  e(Ls, `GONE`, 2.65),
  e(Ls, `WALK`, 2.75),
  e(Ls, `RISE`, 2.85),
  e(Ls, `POUR`, 3.55),
  e(Ls, `FLOW`, 4.2),
  e(Ls, `POUR_END`, 5.7),
  e(Ls, `HIDE`, 5.75),
  e(Ls, `MATCH`, 6.05),
  e(Ls, `FLICK`, 6.8),
  e(Ls, `TURN`, 7.05),
  e(Ls, `FIRE`, 7.2),
  e(Ls, `OUT`, 8.95),
  e(Ls, `END`, 9.45));
function Rs(e, t, n) {
  return e >= n && t < n;
}
var zs = new T(0, 0, 1),
  Bs = 260,
  Vs = 0.4;
function Hs() {
  let e = new c(),
    t = new c();
  e.add(t);
  let n = new x({
    color: 16765803,
    emissive: 16753183,
    emissiveIntensity: 1.1,
    metalness: 0.5,
    roughness: 0.3,
  });
  for (let e of [-0.14, 0.14]) {
    let r = new p(new w(2, 0.07, 10, 72), n);
    ((r.position.z = e), t.add(r));
  }
  let r = new p(new E(0.24, 0.24, 0.5, 24), n);
  ((r.rotation.x = Math.PI / 2), t.add(r));
  let i = new p(
    new m(0.3, 2.1, 72),
    new g({
      color: 16762976,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
      side: 2,
    }),
  );
  e.add(i);
  let a = nt(16756800, 6, 0.3);
  e.add(a);
  let o = new ne(16760928, 0, 14, 2);
  return (e.add(o), { root: e, wheel: t, blur: i, glow: a, light: o });
}
var Us = class t extends ka {
  constructor(t) {
    (super(t),
      e(this, `END`, 7.9),
      e(this, `FLOAT_H`, 0.75),
      e(this, `charkha`, Hs()),
      e(this, `threads`, []),
      e(
        this,
        `threadMat`,
        new g({
          color: 16769162,
          transparent: !0,
          opacity: 0,
          blending: 2,
          depthWrite: !1,
        }),
      ),
      e(this, `threadGeo`, new E(0.014, 0.014, 1, 6)),
      e(this, `cocoon`, new c()),
      e(
        this,
        `cocoonMat`,
        new x({
          color: 16774098,
          emissive: 16764784,
          emissiveIntensity: 0.55,
          roughness: 0.7,
        }),
      ),
      e(this, `cocoonGeo`, new w(0.46, 0.022, 6, 40)),
      e(this, `salt`, void 0),
      e(this, `saltGeo`, new o(0.05)),
      e(
        this,
        `saltMat`,
        new x({
          color: 16777215,
          emissive: 14676479,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.1,
        }),
      ),
      e(this, `saltSeed`, []),
      e(this, `dummy`, new Re()),
      e(this, `aura`, nt(16765024, 2.6, 0)),
      e(this, `hpBefore`, void 0),
      e(this, `tx`, void 0),
      e(this, `spin`, 0),
      e(this, `spinSpeed`, 0),
      e(this, `sparkAcc`, 0),
      e(this, `released`, !1),
      e(this, `wheelX`, 0),
      e(this, `beats`, new Set()),
      (this.hpBefore = t.target.hp),
      (this.tx = t.target.x));
    let n = this.charkha;
    (n.root.position.set(t.caster.x - t.caster.facing * 0.5, 2.5, -1.5),
      n.root.scale.setScalar(0.001),
      t.scene.add(n.root));
    for (let e = 0; e < 6; e++) {
      let e = new p(this.threadGeo, this.threadMat);
      ((e.visible = !1), t.scene.add(e), this.threads.push(e));
    }
    for (let e = 0; e < 16; e++) {
      let t = new p(this.cocoonGeo, this.cocoonMat);
      (t.rotation.set(Math.PI / 2 + (e % 2 ? 0.3 : -0.3), 0, 0),
        (t.position.y = (e - 7.5) * 0.11),
        t.scale.setScalar(0.001),
        this.cocoon.add(t));
    }
    (t.scene.add(this.cocoon),
      (this.salt = new a(this.saltGeo, this.saltMat, Bs)),
      (this.salt.frustumCulled = !1),
      (this.salt.visible = !1));
    for (let e = 0; e < Bs; e++)
      this.saltSeed.push({
        r: 0.7 + Math.random() * 1.6,
        y: Math.random() * 3.4,
        speed: 2.4 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
      });
    (t.scene.add(this.salt), t.scene.add(this.aura));
  }
  once(e, t, n) {
    this.t >= t && !this.beats.has(e) && (this.beats.add(e), n());
  }
  stepCaster(e) {
    let { WIND: n, NAMAK: r, RELEASE: i } = t,
      a = this.d.caster;
    e < r - 0.3
      ? ((a.y =
          this.FLOAT_H * I(P((e - 0.4) / 1.3)) + Math.sin(e * 2.1) * 0.03),
        (this.casterClip = { name: `sit`, time: e, loop: !0, fade: 0.25 }))
      : e < n
        ? ((a.y = Math.max(0, this.FLOAT_H * (1 - I((e - r + 0.3) / 0.6)))),
          (this.casterClip = {
            name: `pray`,
            time: 0.3 + (e - r) * 0.6,
            fade: 0.2,
          }))
        : e < i + 0.9
          ? ((a.y = 0),
            (this.casterClip = {
              name: `palm`,
              time:
                e < i
                  ? 1 + ((e - n) / (i - n)) * 0.4
                  : Math.min(2, 1.4 + (e - i) * 0.7),
              fade: 0.08,
            }))
          : (this.casterClip = {
              name: `bow`,
              time: Math.min(1.6, e - i - 0.9 + 0.6),
              fade: 0.25,
            });
  }
  placeThread(e, t, n) {
    let r = this.threads[e];
    ((r.visible = !0),
      r.position.copy(t).add(n).multiplyScalar(0.5),
      r.scale.set(1, t.distanceTo(n), 1),
      r.quaternion.setFromUnitVectors(
        this.v3.set(0, 1, 0),
        this.v2.copy(n).sub(t).normalize(),
      ));
  }
  stepWheel(e, n) {
    let { CHARKHA: r, NAMAK: i, RELEASE: a } = t,
      o = this.d,
      s = this.charkha,
      c = o.caster.facing,
      l = F(P((e - r) / 0.8));
    if (!this.released)
      (s.root.scale.setScalar(
        Math.max(0.001, l * (1 + Math.sin(e * 8) * 0.01)),
      ),
        (this.spinSpeed = e < r ? 0 : 2 + (e - r) * 3.6),
        (s.blur.material.opacity = 0.2 * P((e - i + 0.6) / 1.5)),
        (s.glow.material.opacity = 0.32 * l),
        (s.light.intensity = 14 * l));
    else {
      let t = P((e - a) / 0.45);
      ((this.wheelX += n * 15 * c),
        s.root.position.set(this.wheelX, 2.05, 0),
        (this.spinSpeed = 26));
      let r = P((e - a - 0.5) / 0.5);
      (s.root.scale.setScalar(Math.max(0.001, 1.05 * (1 - r))),
        (s.blur.material.opacity = 0.6 * (1 - r)),
        (s.light.intensity = 40 * (1 - t * 0.5) * (1 - r)));
    }
    ((this.spin -= this.spinSpeed * n * c),
      s.wheel.quaternion.setFromAxisAngle(zs, this.spin));
  }
  stepTarget(e, n) {
    let { CHARKHA: r, NAMAK: i, RELEASE: a } = t,
      o = this.d,
      s = o.target;
    if (this.released) {
      ((this.targetPose = null),
        (this.targetClip = null),
        s.update(Ur(), o.caster.x));
      return;
    }
    let c = I(P((e - r - 0.5) / 1.1)),
      l = b.clamp(o.caster.x + o.caster.facing * 2.6, -O + 0.6, O - 0.6);
    ((s.x = this.tx + (l - this.tx) * I(P((e - r - 0.4) / 1.2))),
      (s.y = c * 1.15 + Math.sin(e * 3) * 0.04 * c),
      (this.targetPose = M(z(e, s.char.id), {
        headF: -0.45,
        lShO: 0.1,
        rShO: 0.1,
        lEl: 0.1,
        rEl: 0.1,
        lThF: 0.02,
        rThF: 0.02,
        lKn: 0.05,
        rKn: 0.05,
      })));
    let u = P((e - r - 1.2) / 1.1);
    (this.cocoon.position.set(s.x, s.y + 0.95, 0),
      (this.cocoon.rotation.y += n * (2 + u * 16)),
      this.cocoon.children.forEach((e, t) =>
        e.scale.setScalar(Math.max(0.001, F(P(u * 16 - (15 - t) * 0.75)))),
      ),
      (o.targetRig.root.rotation.y += this.spinSpeed * 0.9 * n));
    let d = e > r + 0.45 && e < a;
    ((this.threadMat.opacity = d ? 0.85 : 0),
      this.threads.forEach((e, t) => {
        if (((e.visible = d), !d)) return;
        let n = this.spin + (t / this.threads.length) * Math.PI * 2,
          r = this.charkha.root.position;
        (this.v1.set(r.x + Math.cos(n) * 2, r.y + Math.sin(n) * 2, r.z),
          this.placeThread(
            t,
            this.v1.clone(),
            this.v3.set(s.x, s.y + 0.6 + t * 0.16, 0).clone(),
          ));
      }));
    let f = P((e - i) / 0.6);
    if (((this.salt.visible = f > 0), f > 0)) {
      for (let t = 0; t < Bs; t++) {
        let n = this.saltSeed[t],
          r = n.phase + e * n.speed,
          i = n.r * f * (1 - P((e - a + 0.5) / 0.5) * 0.55);
        (this.dummy.position.set(
          s.x + Math.cos(r) * i,
          0.1 + ((n.y + e * 1.6) % 3.4),
          Math.sin(r) * i,
        ),
          this.dummy.rotation.set(r, r * 0.7, 0),
          this.dummy.scale.setScalar(0.6 + (t % 5) * 0.3),
          this.dummy.updateMatrix(),
          this.salt.setMatrixAt(t, this.dummy.matrix));
      }
      this.salt.instanceMatrix.needsUpdate = !0;
    }
  }
  release() {
    let e = this.d,
      t = e.target,
      n = e.caster.facing;
    ((this.released = !0),
      (this.wheelX = this.charkha.root.position.x),
      (this.cocoon.visible = !1),
      this.threads.forEach((e) => (e.visible = !1)),
      (e.targetRig.root.rotation.y = 0),
      e.flash(`rgba(255,236,170,0.95)`, 420),
      e.cam.shake(0.5, 0.8),
      e.audio.boom(),
      e.audio.whoosh(),
      e.arena.cheer(1.2));
    let r = this.v1.set(t.x, t.y + 1, 0.2);
    (e.fx.shockwave(r, 16769162, 0.6, 7),
      e.fx.shockwave(r, 16777215, 0.4, 4, !0),
      e.fx.particles.emit(r, {
        count: 90,
        speed: 9,
        color: 16777215,
        life: 1.1,
        size: 0.2,
        drag: 1.2,
      }),
      e.fx.particles.emit(r, {
        count: 60,
        speed: 7,
        color: 16765024,
        life: 0.9,
        size: 0.26,
        drag: 1.5,
      }),
      e.popup(`MANCH CHHODO!`, this.v2.set(t.x, 2.9, 0.3), `#ffe08a`),
      this.landSuperHit(this.hpBefore, n, 10, 9.5, Vs));
  }
  step(e) {
    let n = this.d,
      { CHARKHA: r, NAMAK: i, RELEASE: a } = t;
    this.advance(e, a);
    let o = this.t,
      s = n.caster,
      c = s.facing;
    for (
      this.once(`line1`, 0.3, () => n.speech(`caster`, `Manch khaali karo!`)),
        this.once(`wheel`, r, () => {
          (n.audio.whoosh(),
            n.popup(`SHANTI CHAKKA!`, this.v1.set(s.x, 3.4, 0.3), `#ffd060`),
            n.cam.shake(0.08, 0.4));
        }),
        this.once(`namak`, i + 0.25, () => {
          (n.popup(
            `SHANTI TOOFAN!`,
            this.v1.set(n.target.x, 2.9, 0.3),
            `#ffffff`,
          ),
            n.audio.whoosh());
        }),
        this.once(`release`, a, () => this.release()),
        this.stepCaster(o),
        this.stepWheel(o, e),
        this.stepTarget(o, e),
        this.aura.position.set(s.x, s.y + 0.75, 0.05),
        this.aura.material.opacity = 0.6 * P(o / 0.8) * (1 - P((o - a) / 0.6)),
        this.sparkAcc += e * (o < a ? 40 : 0);
      this.sparkAcc > 1;
    )
      (--this.sparkAcc,
        n.fx.particles.emit(
          this.v1.set(
            s.x + (Math.random() - 0.5) * 1.2,
            s.y + 0.1,
            (Math.random() - 0.5) * 1.2,
          ),
          {
            count: 1,
            speed: 0.9,
            color: 16765024,
            life: 1.1,
            size: 0.1,
            gravity: -2,
          },
        ));
    let l = (s.x + n.target.x) / 2;
    if (o < r) {
      let e = I(o / r);
      (this.v1.set(s.x, 1 + s.y * 0.5, 0),
        this.v2.set(s.x - c * (2 - e * 0.7), 1.1, 3.8 - e * 1.1),
        n.cam.set(this.v2, this.v1, 2.6, 40));
    } else if (o < a) {
      let e = I(P((o - r) / 1.2));
      (this.v1.set(l, 1.5 + e * 0.5, -0.3),
        this.v2.set(l - c * 0.8, 1.2 + e * 0.5, 4 + e * 3.8),
        n.cam.set(this.v2, this.v1, 3, 46));
    } else
      (this.v1.set(n.target.x * 0.6 + l * 0.4, 1.2, 0),
        this.v2.set(l + c * 0.4, 1.6, 7.6),
        n.cam.set(this.v2, this.v1, 4.5, 46));
    o >= this.END && (this.done = !0);
  }
  dispose() {
    let e = this.d;
    ((e.targetRig.root.rotation.y = 0),
      e.scene.remove(
        this.charkha.root,
        this.cocoon,
        this.salt,
        this.aura,
        ...this.threads,
      ),
      this.charkha.root.traverse((e) => {
        let t = e;
        (t.geometry?.dispose(), t.material?.dispose?.());
      }),
      this.threadGeo.dispose(),
      this.threadMat.dispose(),
      this.cocoonGeo.dispose(),
      this.cocoonMat.dispose(),
      this.saltGeo.dispose(),
      this.saltMat.dispose(),
      this.salt.dispose(),
      this.aura.material.dispose(),
      this.charkha.light.dispose());
  }
};
(e(Us, `CHARKHA`, 2),
  e(Us, `NAMAK`, 4),
  e(Us, `WIND`, 5.6),
  e(Us, `RELEASE`, 6));
function Ws(e) {
  switch (e.caster.char.id) {
    case `modi`:
      return new ja(e);
    case `didi`:
      return new qa(e);
    case `trump`:
      return new To(e);
    case `nitin`:
      return new Ls(e);
    case `yogi`:
      return new Ts(e);
    case `mbapu`:
      return new Us(e);
    default:
      return new Ps(e);
  }
}
var Gs = class {
    constructor(t, n = 4) {
      (e(this, `scene`, void 0),
        e(this, `spares`, []),
        e(this, `total`, void 0),
        e(this, `found`, []),
        (this.scene = t));
      let r = 0;
      if (
        (t.traverse((e) => {
          e.isPointLight && e.userData.keepLight && r++;
        }),
        (this.total = k ? 0 : r + n),
        !k)
      )
        for (let e = 0; e < this.total; e++) {
          let e = new ne(0, 0, 0.001);
          (e.position.set(0, -100, 0),
            (e.userData.spare = !0),
            (e.visible = !1),
            t.add(e),
            this.spares.push(e));
        }
    }
    balance(...e) {
      let t = this.found;
      t.length = 0;
      let n = (e) => {
        let n = e;
        n.isPointLight &&
          !n.userData.spare &&
          (k && !n.userData.keepLight ? (n.visible = !1) : t.push(n));
      };
      this.scene.traverseVisible(n);
      for (let t of e) t.traverseVisible(n);
      if (k) return;
      if (t.length > this.total) {
        for (let e = this.total; e < t.length; e++) {
          let e = new ne(0, 0, 0.001);
          (e.position.set(0, -100, 0),
            (e.userData.spare = !0),
            this.scene.add(e),
            this.spares.push(e));
        }
        this.total = t.length;
      }
      let r = this.total - t.length;
      for (let e = 0; e < this.spares.length; e++)
        this.spares[e].visible = e < r;
    }
  },
  H = () => void 0,
  Ks = new Proxy({}, { get: (e, t) => (t === `clipTime` ? () => null : H) });
function qs() {
  let e = new c(),
    t = (e) => (t) => t.set(0, e, 0);
  return {
    root: e,
    current: Yi(),
    yaw: 0,
    applyPose: H,
    blendTo: H,
    snapTo: H,
    setTransform: H,
    setFree: H,
    wink: H,
    handWorld: (e, t) => t.set(0.4, 1.2, 0),
    headWorld: t(1.65),
    chestWorld: t(1.3),
    setFacePhoto: H,
  };
}
async function Js(e, t, n, r, i) {
  let a = new c();
  ((a.visible = !1), n.add(a));
  let o = new pe(64, 64),
    s = new Set(),
    l = () =>
      a.traverse((e) => {
        let t = e.material;
        if (t)
          for (let e of Array.isArray(t) ? t : [t]) {
            let t = e.map;
            t && s.add(t);
          }
      }),
    u = [],
    d = async () => {
      (l(),
        (u.length = 0),
        a.traverse((e) => {
          (u.push([e, e.visible, e.frustumCulled]),
            (e.visible = !e.isLight),
            (e.frustumCulled = !1));
        }),
        r.balance());
      let i = e.getRenderTarget();
      (e.setRenderTarget(o), e.render(n, t), e.setRenderTarget(i));
      for (let [e, t, n] of u) ((e.visible = t), (e.frustumCulled = n));
      ((a.visible = !1), await new Promise((e) => setTimeout(e, 0)));
    },
    f = () => {
      l();
      for (let e of [...a.children]) e.userData.keepWarm || a.remove(e);
    },
    h = new p(
      new m(0.6, 0.8, 8),
      new g({ transparent: !0, blending: 2, depthWrite: !1, side: 2 }),
    );
  ((h.userData.keepWarm = !0), a.add(h));
  let _ = a;
  for (let e of i) {
    let n = i.find((t) => t !== e) ?? (e === `modi` ? `rahul` : `modi`),
      r = { particles: { emit: H }, dust: H, shockwave: H, hitSpark: H },
      a = { set: H, shake: H, camera: t },
      o = { cheer: H, paparazzi: H, setMood: H };
    try {
      let t = new li(0, A[e], -1.5),
        i = new li(1, A[n], 1.5);
      (t.forceState(`super`), i.forceState(`frozen`));
      let s = Ws({
          scene: _,
          caster: t,
          target: i,
          casterRig: qs(),
          targetRig: qs(),
          fx: r,
          audio: Ks,
          cam: a,
          arena: o,
          flash: H,
          clipTime: () => null,
          popup: H,
          speech: H,
        }),
        c = 0,
        l = 0;
      for (; !s.done && c < 600;)
        (s.step(1 / 30), c++, c >= l && (await d(), (l += 8)));
      await d();
    } catch (t) {
      console.warn(`[prewarm] super`, e, t);
    }
    f();
    try {
      let t = ao({
          scene: _,
          attacker: new li(0, A[e], -0.4),
          defender: new li(1, A[n], 0.4),
          attRig: qs(),
          defRig: qs(),
          fx: r,
          audio: Ks,
          arena: o,
          cam: a,
          popup: H,
          speech: H,
          onImpact: H,
        }),
        i = 0;
      for (; !t.done && i < 180;)
        (t.step(1 / 30), i++, i === 20 && (await d()));
    } catch (t) {
      console.warn(`[prewarm] grapple`, e, t);
    }
    f();
  }
  try {
    (new Hi(_), new qi(_, -1, 1));
  } catch (e) {
    console.warn(`[prewarm] extras`, e);
  }
  (await d(), f(), n.remove(a), o.dispose(), r.balance());
  try {
    await e.compileAsync(n, t);
  } catch {
    e.compile(n, t);
  }
  let v = new Set();
  n.traverseVisible((e) => {
    e.isLight && v.add(e);
  });
  let y = [];
  n.traverse((e) => {
    !e.visible && !e.isLight && (y.push(e), (e.visible = !0));
  });
  let b = [];
  n.traverseVisible((e) => {
    e.isLight && !v.has(e) && b.push(e);
  });
  for (let e of b) e.visible = !1;
  r.balance();
  let ee = new pe(64, 64),
    x = e.getRenderTarget();
  (e.setRenderTarget(ee), e.render(n, t), e.setRenderTarget(x), ee.dispose());
  for (let e of b) e.visible = !0;
  for (let e of y) e.visible = !1;
  r.balance();
  for (let t of s) e.initTexture(t);
  n.traverse((t) => {
    let n = t.material;
    if (n)
      for (let t of Array.isArray(n) ? n : [n]) {
        let n = t.map;
        n && e.initTexture(n);
      }
  });
}
function Ys(e) {
  return (
    (e.moveX === -1 ? 1 : e.moveX === 1 ? 2 : 0) |
    (e.up ? 4 : 0) |
    (e.down ? 8 : 0) |
    (e.punch ? 16 : 0) |
    (e.kick ? 32 : 0) |
    (e.grab ? 64 : 0) |
    (e.super ? 128 : 0)
  );
}
function Xs(e) {
  let t = e & 3;
  return {
    moveX: t === 1 ? -1 : +(t === 2),
    up: !!(e & 4),
    down: !!(e & 8),
    punch: !!(e & 16),
    kick: !!(e & 32),
    grab: !!(e & 64),
    super: !!(e & 128),
  };
}
function Zs(e, t) {
  let n = Math.min(t.length, 8),
    r = new ArrayBuffer(6 + n),
    i = new DataView(r);
  (i.setUint8(0, 1), i.setUint32(1, e), i.setUint8(5, n));
  for (let e = 0; e < n; e++) i.setUint8(6 + e, t[t.length - n + e]);
  return r;
}
function Qs(e) {
  if (e.byteLength < 6) return null;
  let t = new DataView(e);
  if (t.getUint8(0) !== 1) return null;
  let n = t.getUint8(5);
  if (e.byteLength < 6 + n) return null;
  let r = [];
  for (let e = 0; e < n; e++) r.push(t.getUint8(6 + e));
  return { seq: t.getUint32(1), frames: r };
}
var $s = class t {
  constructor() {
    (e(this, `frames`, new Map()),
      e(this, `next`, -1),
      e(this, `newest`, -1),
      e(this, `held`, 0),
      e(this, `pendingEdges`, 0),
      e(this, `leastSpare`, 1 / 0),
      e(this, `takes`, 0));
  }
  push(e, t) {
    for (let n = 0; n < t.length; n++) {
      let r = e - (t.length - 1 - n);
      r < 0 ||
        (this.next >= 0 && r < this.next) ||
        this.frames.has(r) ||
        this.frames.set(r, t[n]);
    }
    ((this.newest = Math.max(this.newest, e)),
      this.next < 0 &&
        this.frames.size &&
        (this.next = Math.min(...this.frames.keys())));
  }
  take() {
    if (this.next < 0) return Xs(0);
    for (; this.newest - this.next > t.MAX_BACKLOG;) this.skip();
    if ((this.drain(), this.frames.has(this.next))) {
      let e = this.frames.get(this.next);
      (this.frames.delete(this.next), this.next++);
      let t = e | this.pendingEdges;
      return ((this.pendingEdges = 0), (this.held = e & -241), Xs(t));
    }
    return this.newest > this.next + 1
      ? (this.skip(), this.take())
      : Xs(this.held);
  }
  drain() {
    if (
      ((this.leastSpare = Math.min(this.leastSpare, this.newest - this.next)),
      !(++this.takes < t.DRAIN_EVERY))
    ) {
      for (let e = 0; e < this.leastSpare; e++) this.skip();
      ((this.takes = 0), (this.leastSpare = 1 / 0));
    }
  }
  defer(e) {
    this.pendingEdges |= Ys(e) & 240;
  }
  skip() {
    let e = this.frames.get(this.next);
    (e !== void 0 &&
      ((this.pendingEdges |= e & 240),
      (this.held = e & -241),
      this.frames.delete(this.next)),
      this.next++);
  }
  get backlog() {
    return this.next < 0 ? 0 : Math.max(0, this.newest - this.next + 1);
  }
  get ack() {
    return this.next - 1;
  }
};
(e($s, `MAX_BACKLOG`, 4), e($s, `DRAIN_EVERY`, 30));
function ec(e) {
  return e === null ? 3 : Math.min(6, Math.round((e / 2 + 33) * (60 / 1e3)));
}
var tc = class {
    constructor() {
      (e(this, `held`, []), e(this, `frames`, 0));
    }
    reset(e) {
      ((this.frames = e), (this.held.length = 0));
    }
    pass(e) {
      return (
        this.held.push(e),
        this.held.length > this.frames ? this.held.shift() : Ur()
      );
    }
  },
  nc = [
    `idle`,
    `walk`,
    `crouch`,
    `jump`,
    `attack`,
    `hitstun`,
    `blockstun`,
    `knockdown`,
    `getup`,
    `ko`,
    `super`,
    `frozen`,
    `victory`,
    `intro`,
  ],
  rc = (e) => Math.round(e * 1e3) / 1e3,
  ic = {
    crouching: 1,
    holdingBack: 2,
    grounded: 4,
    attackHasHit: 8,
    airAttackUsed: 16,
  },
  ac = [`punch`, `kick`, `grab`],
  oc = class t {
    constructor(t, n, r) {
      (e(this, `peer`, void 0),
        e(this, `code`, void 0),
        e(this, `ev`, void 0),
        e(this, `battle`, null),
        e(this, `ended`, !1),
        e(this, `friendAway`, !1),
        e(this, `linkDown`, !1),
        e(this, `linkTimer`, 0),
        e(this, `log`, () => void 0),
        (this.peer = t),
        (this.code = n),
        (this.ev = r));
    }
    get role() {
      return this.peer.role;
    }
    static async host(e, r, i) {
      let a = null,
        o = t.handlers(() => a, i),
        { peer: s, code: c, connected: l } = await n.host(o, r);
      return (
        (a = new t(s, c, e)),
        i && (a.log = i),
        { code: c, connected: l.then(() => a) }
      );
    }
    static async join(e, r, i) {
      let a = null,
        o = t.handlers(() => a, i),
        s = await n.join(e, o);
      return ((a = new t(s, e, r)), i && (a.log = i), a);
    }
    static handlers(e, t) {
      return {
        log: t,
        onCtrl: (t) => e()?.onCtrl(t),
        onInput: (t) => e()?.onInput(t),
        onState: (t) => e()?.onState(t),
        onLost: () => e()?.end(`The connection to your friend was lost.`),
      };
    }
    battleNet() {
      return {
        role: this.peer.role,
        send: (e) => this.peer.send(e),
        sendSnapshot: (e) => this.peer.sendInput(e),
        sendInputs: (e) => this.peer.sendInput(e),
        roundTrip: () => this.peer.latency()?.median ?? null,
      };
    }
    send(e) {
      this.peer.send(e);
    }
    setAway(e) {
      this.peer.send({ t: `away`, on: e });
    }
    latency() {
      return this.peer.latency();
    }
    linkInfo() {
      return this.peer.linkInfo();
    }
    leave() {
      this.ended ||
        (this.peer.send({ t: `bye` }),
        setTimeout(() => this.close(), 120),
        (this.ended = !0));
    }
    close() {
      ((this.ended = !0),
        clearTimeout(this.linkTimer),
        (this.battle = null),
        this.peer.close());
    }
    forceRestart() {
      return this.peer.forceRestart();
    }
    onCtrl(e) {
      switch (e.t) {
        case `ev`:
          this.battle?.applyNetEvent(e);
          break;
        case `lobby`:
          this.ev.onLobby(e);
          break;
        case `start`:
          this.ev.onStart(e);
          break;
        case `away`:
          (this.log(`friend ${e.on ? `away` : `back`}`),
            (this.friendAway = !!e.on),
            (this.peer.quietOk = this.friendAway),
            this.ev.onAway(this.friendAway || this.linkDown));
          break;
        case `bye`:
          (this.log(`friend said bye`), this.end(`Your friend left the room.`));
      }
    }
    onInput(e) {
      let t = this.battle;
      if (!t) return;
      if (typeof e == `string`) {
        try {
          let n = JSON.parse(e);
          n.t === `s` && t.applySnapshot(n);
        } catch {}
        return;
      }
      let n = Qs(e);
      n && t.pushRemoteInputs(n.seq, n.frames);
    }
    onState(e) {
      if (!this.ended) {
        if (e === `disconnected` || e === `failed`) {
          if (e === `failed` && !this.peer.canRecover) {
            this.end(`The connection to your friend was lost.`);
            return;
          }
          this.linkDown ||
            ((this.linkDown = !0),
            this.ev.onAway(!0),
            clearTimeout(this.linkTimer),
            (this.linkTimer = window.setTimeout(
              () => this.end(`The connection to your friend was lost.`),
              this.friendAway ? 12e4 : 45e3,
            )));
        } else
          e === `connected` && this.linkDown
            ? ((this.linkDown = !1),
              clearTimeout(this.linkTimer),
              this.ev.onAway(this.friendAway))
            : e === `closed` &&
              this.end(`The connection to your friend was lost.`);
      }
    }
    end(e) {
      this.ended || (this.log(`end: ${e}`), this.close(), this.ev.onEnd(e));
    }
  },
  sc = { high: 1.55, mid: 1.15, low: 0.35 };
function cc(e) {
  return e.attack ? (e.attack.def.air ? `mid` : e.attack.def.height) : null;
}
function lc(e, t) {
  let n = e.attack;
  if (!n || n.hasHit || !e.isAttackActive || t.invulnerable) return !1;
  let r = (t.x - e.x) * e.facing,
    i = n.def.id !== `grab` && e.char.id === `mbapu` ? 0.35 : 0;
  if (
    r < -0.15 ||
    r > n.def.reach + i + 0.34 ||
    (n.def.grab && (t.state === `hitstun` || t.airborne || t.y > 0.01))
  )
    return !1;
  let a = cc(e);
  return !(
    (t.y > 0.25 && a === `low`) ||
    (t.isLow && a === `high`) ||
    Math.abs(e.y - t.y) > 1.5
  );
}
function uc(e, t) {
  return !e.canBlock || !e.holdingBack || e.airborne
    ? !1
    : e.crouching
      ? t === `low`
      : t === `high` || t === `mid`;
}
function dc(e) {
  return Math.max(0.5, 0.88 ** e);
}
function fc(e, t, n) {
  let r = t.char.id === `mbapu` ? 0.8 : 1;
  return Math.max(1, Math.round(n * e.char.damageMul * dc(t.comboHits) * r));
}
function pc(e, t) {
  if (!lc(e, t)) return null;
  let n = e.attack;
  n.hasHit = !0;
  let r = cc(e),
    i = e.facing,
    a = uc(t, r),
    o = t.y + (e.attack.def.air ? 1.35 : sc[r]),
    s = t.x - i * 0.25;
  if (n.def.grab) {
    let n = !!t.attack?.def.grab && t.attackPhase !== `recovery`;
    if (t.buffer?.button === `grab` || n) {
      for (let [n, r] of [
        [e, -i],
        [t, i],
      ])
        ((n.attack = null),
          (n.buffer = null),
          n.forceState(`blockstun`),
          (n.stun = 14),
          (n.vx = r * 2.6));
      return {
        attacker: e,
        defender: t,
        moveId: `grab`,
        blocked: !0,
        grab: `break`,
        damage: 0,
        knockdown: !1,
        ko: !1,
        x: (e.x + t.x) / 2,
        y: 1.2,
      };
    }
    return {
      attacker: e,
      defender: t,
      moveId: `grab`,
      blocked: !1,
      grab: `connect`,
      damage: 0,
      knockdown: !1,
      ko: !1,
      x: s,
      y: 1.2,
    };
  }
  if (a)
    return (
      (n.blocked = !0),
      t.applyBlock(n.def, i),
      e.addMeter(2),
      t.addMeter(3),
      hc(e, t, n.def.push * 0.6),
      {
        attacker: e,
        defender: t,
        moveId: n.def.id,
        blocked: !0,
        damage: 0,
        knockdown: !1,
        ko: !1,
        x: s,
        y: o,
      }
    );
  let c = fc(e, t, n.def.damage);
  return (
    t.applyHit(n.def, c, i),
    e.addMeter(c * 0.9 + 2),
    t.addMeter(c * 0.6),
    hc(e, t, n.def.push * 0.8),
    {
      attacker: e,
      defender: t,
      moveId: n.def.id,
      blocked: !1,
      damage: c,
      knockdown: t.state === `knockdown`,
      ko: t.state === `ko`,
      x: s,
      y: o,
    }
  );
}
function mc(e, t) {
  if (!lc(e, t) || !lc(t, e)) return [pc(e, t), pc(t, e)];
  let n = !!e.attack?.def.grab;
  if (n !== !!t.attack?.def.grab) {
    let [r, i] = n ? [t, e] : [e, t],
      a = pc(r, i);
    return n ? [null, a] : [a, null];
  }
  if (n) return [pc(e, t), null];
  let r = t.attack,
    i = pc(e, t);
  t.attack = r;
  let a = pc(t, e);
  return ((t.attack = null), [i, a]);
}
function hc(e, t, n) {
  Math.abs(t.x) >= 6.45 && (e.vx = -e.facing * n);
}
function gc(e, t) {
  if (e.y > 1 || t.y > 1) return;
  let n = t.x - e.x,
    r = Math.abs(n);
  if (r >= 0.72) return;
  let i = n === 0 ? e.facing : Math.sign(n),
    a = (Ke - r) / 2;
  ((e.x -= i * a), (t.x += i * a));
  let o = (e, t) => {
    e.x < -6.5
      ? ((t.x += -O - e.x), (e.x = -O))
      : e.x > 6.5 && ((t.x -= e.x - O), (e.x = O));
  };
  (o(e, t), o(t, e));
}
var _c = {
    easy: {
      breakChance: 0.08,
      reaction: 0.42,
      blockChance: 0.18,
      punishChance: 0.2,
      aggression: 0.45,
      superChance: 0.35,
    },
    normal: {
      breakChance: 0.3,
      reaction: 0.26,
      blockChance: 0.45,
      punishChance: 0.5,
      aggression: 0.65,
      superChance: 0.7,
    },
    hard: {
      breakChance: 0.6,
      reaction: 0.14,
      blockChance: 0.75,
      punishChance: 0.85,
      aggression: 0.8,
      superChance: 1,
    },
  },
  vc = class {
    constructor(t, n = Math.random) {
      (e(this, `rng`, void 0),
        e(this, `plan`, { kind: `wait`, time: 0, buttons: [] }),
        e(this, `elapsed`, 0),
        e(this, `sinceDecision`, 99),
        e(this, `profile`, void 0),
        e(this, `read`, null),
        e(this, `readIt`, !1),
        (this.rng = n),
        (this.profile = _c[t]));
    }
    think(e, t, n) {
      return (
        (this.elapsed += n),
        (this.sinceDecision += n),
        (e.isBoss && this.readAttack(e, t)) ||
          ((this.sinceDecision >= this.profile.reaction ||
            this.elapsed >= this.plan.time) &&
            this.decide(e, t)),
        this.execute(e, t)
      );
    }
    readAttack(e, t) {
      let n = Math.abs(t.x - e.x),
        r = t.attack,
        i = !r && t.state === `jump` && t.y > 0.1;
      if (
        i
          ? n > 2.3
          : !r || t.attackPhase === `recovery` || n > r.def.reach + 0.34 + 0.55
      )
        return (!r && !i && (this.read = null), !1);
      let a = r ?? t;
      if (
        (this.read !== a && ((this.read = a), (this.readIt = this.rng() < Qr)),
        !this.readIt)
      )
        return !1;
      let o = e.state === `attack` && e.attackPhase !== `active`;
      if (!e.canBlock && !o) return !1;
      if (r?.def.grab)
        return (
          this.plan.buttons.length === 0 &&
            this.setPlan(`attack`, 0.2, [{ at: 0, button: `grab` }]),
          !0
        );
      if (i && n > 0.8 && n < 1.8 && e.actionable && this.rng() < 0.02)
        return (
          this.setPlan(`attack`, 0.4, [
            { at: 0, button: `punch`, forward: !0 },
          ]),
          !0
        );
      let s = !i && cc(t) === `low`;
      return (this.setPlan(s ? `lowBlock` : `block`, 0.12), !0);
    }
    setPlan(e, t, n = []) {
      ((this.plan = { kind: e, time: t, buttons: n }), (this.elapsed = 0));
    }
    decide(e, t) {
      this.sinceDecision = 0;
      let n = this.rng,
        r =
          e.char.id === `mbapu`
            ? {
                ...this.profile,
                aggression: 0.9,
                blockChance: 0.72,
                punishChance: 0.95,
                breakChance: 0.9,
                reaction: 0.06,
                superChance: 0.9,
              }
            : this.profile,
        i = Math.abs(t.x - e.x);
      if (
        this.plan.kind === `attack` &&
        this.elapsed < this.plan.time &&
        e.state === `attack`
      )
        return;
      if (
        !e.peaceful &&
        e.meter >= 100 &&
        t.state !== `knockdown` &&
        t.state !== `getup` &&
        n() < r.superChance
      ) {
        this.setPlan(`super`, 0.1);
        return;
      }
      if (e.char.id === `mbapu` && i < 2.5 && n() < 0.75) {
        this.planMbapuAttack(i, e.peaceful);
        return;
      }
      let a = t.attackPhase;
      if (
        t.attack?.def.grab &&
        a === `startup` &&
        i < 1.4 &&
        n() < r.breakChance
      ) {
        this.setPlan(`attack`, 0.2, [{ at: 0, button: `grab` }]);
        return;
      }
      if (
        !e.peaceful &&
        i < 1.05 &&
        (t.state === `blockstun` ||
          (t.holdingBack && t.actionable && !t.crouching)) &&
        n() < 0.3 * r.aggression
      ) {
        this.setPlan(`attack`, 0.6, [{ at: 0, button: `grab` }]);
        return;
      }
      if (
        !e.isBoss &&
        (a === `startup` || a === `active`) &&
        i < 2.2 &&
        n() < r.blockChance
      ) {
        let e = cc(t) === `low`;
        this.setPlan(e ? `lowBlock` : `block`, 0.45);
        return;
      }
      if (
        !e.isBoss &&
        t.state === `jump` &&
        t.y > 0.1 &&
        i < 2.4 &&
        e.canBlock
      ) {
        if (n() < r.blockChance) {
          this.setPlan(`block`, 0.45);
          return;
        }
        if (i < 1.5 && n() < r.punishChance) {
          this.setPlan(`attack`, 0.35, [{ at: 0, button: `punch` }]);
          return;
        }
      }
      if (
        i < 1.7 &&
        (a === `recovery` || t.state === `getup`) &&
        n() < r.punishChance
      ) {
        e.isBoss ? this.planMbapuAttack(i, e.peaceful) : this.planAttack(i);
        return;
      }
      if (i > 1.75) {
        i < 3.4 && n() < 0.12 * r.aggression
          ? this.setPlan(`jumpIn`, 0.9, [{ at: 0.28, button: `kick` }])
          : n() < 0.12 && this.plan.kind !== `retreat`
            ? this.setPlan(`wait`, 0.25 + n() * 0.3)
            : this.setPlan(`approach`, 0.3 + n() * 0.4);
        return;
      }
      let o = n();
      o < r.aggression
        ? this.planAttack(i)
        : o < r.aggression + 0.15
          ? this.setPlan(`retreat`, 0.25 + n() * 0.3)
          : o < r.aggression + 0.25
            ? this.setPlan(`block`, 0.3)
            : this.setPlan(`wait`, 0.2);
    }
    planMbapuAttack(e, t = !1) {
      let n = this.rng();
      t && e <= 1.5 && this.rng() < 0.3
        ? this.setPlan(`attack`, 0.6, [
            { at: 0, button: n < 0.5 ? `kick` : `punch`, down: !0 },
          ])
        : e > 1.35
          ? n < 0.4
            ? this.setPlan(`attack`, 0.65, [
                { at: 0, button: `punch`, forward: !0 },
              ])
            : n < 0.75
              ? this.setPlan(`attack`, 0.65, [
                  { at: 0, button: `kick`, forward: !0 },
                ])
              : this.setPlan(`jumpIn`, 0.85, [{ at: 0.25, button: `kick` }])
          : n < 0.3
            ? this.setPlan(`attack`, 0.8, [
                { at: 0, button: `punch` },
                { at: 0.18, button: `punch` },
                { at: 0.38, button: `punch` },
              ])
            : n < 0.55
              ? this.setPlan(`attack`, 0.8, [
                  { at: 0, button: `kick` },
                  { at: 0.28, button: `kick` },
                ])
              : n < 0.75
                ? this.setPlan(`attack`, 0.65, [
                    { at: 0, button: `kick`, down: !0 },
                  ])
                : n < 0.9
                  ? this.setPlan(`attack`, 0.75, [
                      { at: 0, button: `punch`, forward: !0 },
                      { at: 0.32, button: `kick` },
                    ])
                  : this.setPlan(`attack`, 0.6, [
                      { at: 0, button: t ? `kick` : `grab` },
                    ]);
    }
    planAttack(e) {
      let t = this.rng();
      e > 1.25
        ? t < 0.5
          ? this.setPlan(`attack`, 0.5, [
              { at: 0, button: `kick`, forward: !0 },
            ])
          : t < 0.75
            ? this.setPlan(`attack`, 0.5, [{ at: 0, button: `kick`, down: !0 }])
            : this.setPlan(`approach`, 0.25)
        : t < 0.18
          ? this.setPlan(`attack`, 0.75, [
              { at: 0, button: `punch` },
              { at: 0.2, button: `punch` },
              { at: 0.42, button: `kick` },
            ])
          : t < 0.32
            ? this.setPlan(`attack`, 0.75, [
                { at: 0, button: `punch` },
                { at: 0.2, button: `punch` },
                { at: 0.42, button: `punch` },
              ])
            : t < 0.44
              ? this.setPlan(`attack`, 0.8, [
                  { at: 0, button: `punch` },
                  { at: 0.2, button: `kick` },
                  { at: 0.5, button: `kick` },
                ])
              : t < 0.56
                ? this.setPlan(`attack`, 0.7, [
                    { at: 0, button: `kick` },
                    { at: 0.3, button: `kick` },
                  ])
                : t < 0.64
                  ? this.setPlan(`attack`, 0.45, [{ at: 0, button: `kick` }])
                  : t < 0.74
                    ? this.setPlan(`attack`, 0.7, [
                        { at: 0, button: `punch`, forward: !0 },
                        { at: 0.32, button: `kick` },
                      ])
                    : t < 0.84
                      ? this.setPlan(`attack`, 0.5, [
                          { at: 0, button: `kick`, down: !0 },
                        ])
                      : t < 0.88
                        ? this.setPlan(`attack`, 0.6, [
                            { at: 0, button: `punch`, down: !0 },
                            { at: 0.22, button: `punch` },
                          ])
                        : t < 0.94
                          ? this.setPlan(`attack`, 0.6, [
                              { at: 0, button: `grab` },
                            ])
                          : this.setPlan(`attack`, 0.55, [
                              { at: 0, button: `kick`, forward: !0 },
                            ]);
    }
    execute(e, t) {
      let n = Ur(),
        r = t.x >= e.x ? 1 : -1,
        i = this.plan;
      switch (i.kind) {
        case `approach`:
          n.moveX = r;
          break;
        case `retreat`:
          n.moveX = -r;
          break;
        case `block`:
          n.moveX = -r;
          break;
        case `lowBlock`:
          ((n.moveX = -r), (n.down = !0));
          break;
        case `jumpIn`:
          this.elapsed < 0.05 && ((n.up = !0), (n.moveX = r));
          break;
        case `super`:
          n.super = !0;
      }
      for (let e = 0; e < i.buttons.length; e++) {
        let t = i.buttons[e];
        if (this.elapsed >= t.at) {
          ((n[t.button] = !0),
            t.forward && (n.moveX = r),
            t.down && (n.down = !0),
            i.buttons.splice(e, 1));
          break;
        }
      }
      return (
        i.kind === `jumpIn` &&
          i.buttons.length === 0 &&
          e.state === `jump` &&
          (n.moveX = r),
        n
      );
    }
  };
function yc(e, t, n, r = null) {
  let i;
  if (r !== null) {
    let i = r === 0 ? e : t,
      a = r === 0 ? t : e;
    if (i <= 0) return { outcome: +(r === 0), perfect: a >= 100, timeUp: n };
    if (n || a <= 0) return { outcome: r, perfect: !1, timeUp: n };
  }
  return (
    (i =
      e <= 0 && t <= 0
        ? `draw`
        : t <= 0
          ? 0
          : e <= 0
            ? 1
            : e > t
              ? 0
              : t > e
                ? 1
                : `draw`),
    {
      outcome: i,
      perfect: i !== `draw` && (i === 0 ? e : i === 1 ? t : 0) >= 100,
      timeUp: n,
    }
  );
}
var bc = class {
    constructor() {
      (e(this, `wins`, [0, 0]),
        e(this, `round`, 1),
        e(this, `timer`, 60),
        e(this, `history`, []));
    }
    tick(e) {
      return ((this.timer = Math.max(0, this.timer - e)), this.timer <= 0);
    }
    record(e, t = !1) {
      (this.history.push(e),
        e.outcome === `draw`
          ? (this.wins[0]++, this.wins[1]++)
          : (this.wins[e.outcome]++,
            t && (this.wins[e.outcome] = Math.max(this.wins[e.outcome], 2))));
    }
    get winner() {
      let [e, t] = this.wins;
      return e >= 2 && e > t ? 0 : t >= 2 && t > e ? 1 : null;
    }
    get isFinalRound() {
      return (
        (this.wins[0] === 1 && this.wins[1] === 1) ||
        (this.wins[0] >= 2 && this.wins[0] === this.wins[1])
      );
    }
    nextRound() {
      (this.round++, (this.timer = 60));
    }
  },
  xc,
  Sc = 2.7,
  Cc = -2.2,
  wc = 1.7,
  Tc = 0.8,
  Ec = class t {
    constructor(t) {
      (e(this, `d`, void 0),
        e(this, `t`, 0),
        e(this, `done`, !1),
        e(this, `rig`, void 0),
        e(this, `glow`, nt(16765024, 3.2, 0)),
        e(this, `dir`, void 0),
        e(this, `startX`, void 0),
        e(this, `stopX`, void 0),
        e(this, `beatenFromX`, void 0),
        e(this, `beatenExitX`, void 0),
        e(this, `beatenSteps`, 0),
        e(this, `beats`, new Set()),
        e(this, `v1`, new T()),
        e(this, `v2`, new T()),
        (this.d = t));
      let n = O - t.winner.x >= t.winner.x + O;
      ((this.dir = n ? -1 : 1),
        (this.startX = n ? O : -O),
        (this.stopX = t.winner.x - this.dir * Sc),
        (this.beatenFromX = t.beaten.x),
        (this.beatenExitX = this.dir * (O + 5)),
        (this.rig = Xo(A.mbapu)),
        (this.rig.root.visible = !1),
        t.scene.add(this.rig.root, this.glow),
        (t.winner.attack = null),
        (t.winner.vx = 0),
        (t.winner.y = 0),
        t.winner.forceState(`idle`),
        (t.winner.holdingBack = !1),
        (t.winner.facing = -this.dir),
        (t.beaten.attack = null),
        (t.beaten.vx = 0),
        (t.beaten.vy = 0),
        (t.beaten.y = 0),
        t.hud.clearSay(),
        t.hud.clearPopups(),
        t.hud.show(!1),
        t.hud.cinema(!0, !0),
        t.hud.setVignette(!0),
        t.arena.setMood(Tc),
        t.arena.setLeader(null, 0),
        t.arena.setBoredom(0),
        t.audio.silenceMusic(!0),
        t.audio.startLoop(`charkha`, 0.9),
        t.audio.playClip(Qt));
    }
    get bossX() {
      return this.stopX;
    }
    get x() {
      return (
        this.startX + (this.stopX - this.startX) * P((this.t - t.REVEAL) / 7.8)
      );
    }
    once(e, t, n) {
      this.t >= t && !this.beats.has(e) && (this.beats.add(e), n());
    }
    beatenPose(e) {
      if (this.t < 1 || this.t >= 3.8) return null;
      let t = this.d.beaten.char.id;
      return M(R(e, t), {
        hipsT: 0,
        spineT: 0,
        spineF: 0.12,
        headF: 0.2,
        ..._a,
      });
    }
    skip() {
      this.t = this.t < t.BOW ? t.BOW : t.END;
    }
    placeBeaten() {
      let e = this.d,
        t = e.beaten.facing > 0 ? 1 : -1,
        n = I(P((this.t - 1) / 2.6));
      if (this.t < 3.8) {
        e.beatenRig.setFree(
          this.beatenFromX,
          0,
          Cc * n,
          t * (Math.PI / 2 + (0.55 - Math.PI / 2) * n),
        );
        return;
      }
      let r = Math.sign(this.beatenExitX - this.beatenFromX),
        i = Math.min(
          Math.abs(this.beatenExitX - this.beatenFromX),
          (this.t - 3.8) * wc,
        );
      (e.beatenRig.setFree(this.beatenFromX + r * i, 0, Cc, (r * Math.PI) / 2),
        (this.beatenSteps = i));
    }
    step(e, n) {
      let {
          REVEAL: r,
          BOW: i,
          TITLE: a,
          STANCE: o,
          END: s,
          MUSIC_FADE: c,
          SETTLE: l,
        } = t,
        u = this.d;
      this.t += e;
      let d = this.t,
        f = this.x;
      if (
        (this.once(`hush`, 0.6, () =>
          u.hud.cinemaCaption(`Sansad mein sannata…`),
        ),
        this.once(`up`, 1, () => {
          ((u.beaten.hp = Math.max(1, u.beaten.hp)),
            u.beaten.forceState(`idle`));
        }),
        this.once(`reveal`, r, () => {
          ((this.rig.root.visible = !0), u.hud.cinemaCaption(``));
        }),
        this.once(`leave`, 3.8, () => {
          (u.beaten.forceState(`walk`), (u.beaten.moveRel = 1));
        }),
        this.once(`bow`, i, () => u.audio.stopLoop(1.2)),
        this.once(`title`, a, () => {
          (u.audio.boom(),
            u.cam.shake(0.14, 0.4),
            u.hud.cinemaTitle(`AB ASLI PARIKSHA`, `MBAPU · ANTIM YODDHA`));
        }),
        this.once(`fade`, s - c, () => u.audio.stopClip(c * 1e3)),
        this.once(`open`, s - l + 0.5, () => {
          (u.hud.cinema(!1), u.hud.setVignette(!1));
        }),
        (u.beaten.walkDistance = this.beatenSteps),
        d >= r)
      ) {
        (this.rig.setMirror?.(this.dir < 0),
          this.rig.setTransform(f, 0, this.dir, 0, Zr));
        let t = { name: `hiphop`, time: d - r, fade: 0.2, loop: !1 };
        (d >= o
          ? (t = { name: `stance`, time: n, fade: 0.45, loop: !0 })
          : d >= i &&
            (t = { name: `bow`, time: 0.2 + (d - i), fade: 0.35, loop: !1 }),
          this.rig.playClip?.(t, e),
          this.glow.position.set(f, 1, -0.1),
          (this.glow.material.opacity =
            0.42 * P((d - r) / 1.2) * (1 - P((d - o) / 0.8))));
      }
      let p = P((d - (s - l)) / l);
      if ((u.arena.setMood(Tc * (1 - p)), d < r))
        (this.v1.set(u.winner.x, 1.05, 0),
          this.v2.set(u.winner.x - this.dir * 2.2, 0.8, 3.7));
      else {
        let e = I(P((d - (i - 0.8)) / (s - i))),
          t = (u.winner.x + f) / 2,
          n = Math.abs(u.winner.x - f);
        (this.v1.set(f + (t - f) * e, 1.05 - 0.05 * e, 0),
          this.v2.set(
            f + this.dir * 2.4 * (1 - e) + (t - f) * e,
            0.7 + (0.85 + n * 0.06) * e,
            4.1 + (Math.min(8.5, Math.max(4.4, 3.4 + n * 0.85)) - 4.1) * e,
          ));
      }
      (u.cam.set(this.v2, this.v1, 2.6, 42), d >= s && (this.done = !0));
    }
    afterVisuals() {
      this.t >= 1 && this.placeBeaten();
    }
    dispose() {
      let e = this.d;
      (e.audio.stopLoop(0.3),
        e.scene.remove(this.rig.root, this.glow),
        this.rig.dispose?.(),
        this.glow.material.dispose(),
        e.hud.cinema(!1),
        e.hud.setVignette(!1),
        e.arena.setMood(0));
    }
  };
((xc = Ec),
  e(Ec, `REVEAL`, 2.5),
  e(Ec, `BOW`, xc.REVEAL + 7.8),
  e(Ec, `TITLE`, xc.BOW + 0.3),
  e(Ec, `STANCE`, xc.BOW + 1.5),
  e(Ec, `END`, xc.STANCE + 1.1),
  e(Ec, `MUSIC_FADE`, 2.4),
  e(Ec, `SETTLE`, 1.6));
var Dc = (e, t = 0.85) => new x({ color: e, roughness: t });
function Oc() {
  let e = new c(),
    t = Dc(9067058),
    n = Dc(2829099, 0.7),
    r = (t, n, r, i, a, o, s) => {
      let c = new p(new C(t, n, r), i);
      return (c.position.set(a, o, s), (c.castShadow = !0), e.add(c), c);
    };
  r(1, 0.1, 1.7, t, 0, 0.72, 0);
  for (let e of [-0.48, 0.48]) r(0.05, 0.16, 1.7, t, e, 0.84, 0);
  for (let e of [-0.83, 0.83]) r(1, 0.16, 0.05, t, 0, 0.84, e);
  for (let e of [-0.35, 0.35]) r(0.05, 0.05, 0.75, t, e, 0.86, -1.15);
  r(0.75, 0.05, 0.05, t, 0, 0.86, -1.5);
  let o = [];
  for (let t of [-0.56, 0.56]) {
    let r = new p(new w(0.33, 0.035, 6, 20), n);
    ((r.rotation.y = Math.PI / 2), r.position.set(t, 0.35, -0.2));
    let i = new p(new E(0.01, 0.01, 0.64, 4), n);
    r.add(i);
    let a = i.clone();
    ((a.rotation.z = Math.PI / 2), r.add(a), e.add(r), o.push(r));
  }
  let s = new p(new E(0.14, 0.14, 0.08, 12), n);
  ((s.rotation.z = Math.PI / 2),
    s.position.set(0, 0.14, 0.7),
    e.add(s),
    o.push(s),
    r(0.04, 0.5, 0.04, t, 0, 0.45, 0.7));
  let l = new a(new i(0.075, 8, 6), Dc(14267258, 0.9), 70),
    d = new a(new i(0.07, 8, 6), Dc(10106192, 0.55), 55),
    f = new u(),
    m = new h(),
    g = new T(),
    _ = new T(),
    v = (t, n, r, i, a, o) => {
      for (let e = 0; e < n; e++) {
        let n = Math.random(),
          s = Math.random(),
          c = (n - 0.5) * 0.85,
          l = r * (0.08 + s * 0.7),
          u = 1 - Math.min(1, (c * c) / 0.2 + (Math.abs(l) - 0.4) ** 2 / 0.25);
        (_.set(c, 0.84 + Math.max(0, u) * 0.22 + Math.random() * 0.05, l),
          m.setFromEuler(new Ie(Math.random() * 3, Math.random() * 3, 0)),
          g.set(i, a, o),
          t.setMatrixAt(e, f.compose(_, m, g)));
      }
      ((t.castShadow = !0), e.add(t));
    };
  return (
    v(l, 70, 1, 1.25, 0.85, 0.9),
    v(d, 55, -1, 1, 0.92, 1),
    r(0.02, 0.4, 0.02, n, 0.3, 1.1, -0.6),
    r(0.22, 0.02, 0.22, Dc(11908533, 0.4), 0.3, 0.9, -0.6),
    { root: e, wheels: o }
  );
}
function kc() {
  let e = new c(),
    t = Dc(10118466, 0.7),
    n = Dc(15921126),
    r = Dc(3829416, 0.9),
    a = Dc(2760988),
    o = (t, n, r, i, a, o = e) => {
      let s = new p(t, n);
      return (s.position.set(r, i, a), (s.castShadow = !0), o.add(s), s);
    },
    s = new c();
  (s.position.set(0, 0.95, 0),
    (s.rotation.x = 0.35),
    e.add(s),
    o(new ge(0.17, 0.42, 4, 10), n, 0, 0.3, 0, s));
  let l = new c();
  (l.position.set(0, 0.8, 0),
    s.add(l),
    o(new i(0.13, 14, 10), t, 0, 0, 0, l),
    o(
      new i(0.135, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.2),
      a,
      0,
      0.02,
      -0.01,
      l,
    ),
    o(new C(0.12, 0.02, 0.02), a, 0, -0.04, 0.12, l),
    (o(new C(0.36, 0.06, 0.08), Dc(12728874), 0, 0.58, 0.02, s).rotation.z =
      0.5));
  for (let e of [-0.2, 0.2]) {
    let n = o(new ge(0.05, 0.5, 4, 8), t, e, 0.5, 0.25, s);
    n.rotation.x = 1.2;
  }
  return (
    o(new E(0.2, 0.24, 0.45, 12), r, 0, 0.72, 0),
    {
      root: e,
      legs: [-0.09, 0.09].map((n) => {
        let r = new c();
        return (
          r.position.set(n, 0.55, 0),
          e.add(r),
          o(new ge(0.055, 0.42, 4, 8), t, 0, -0.27, 0, r),
          o(new C(0.1, 0.05, 0.22), a, 0, -0.53, 0.05, r),
          r
        );
      }),
      head: l,
    }
  );
}
var Ac = class t {
  constructor(t, n, r, i = 1.25) {
    (e(this, `scene`, void 0),
      e(this, `root`, new c()),
      e(this, `cart`, void 0),
      e(this, `vendor`, void 0),
      e(this, `t`, 0),
      e(this, `walked`, 0),
      e(this, `x`, void 0),
      e(this, `dir`, void 0),
      e(this, `total`, void 0),
      e(this, `paused`, !1),
      e(this, `pauseLeft`, 0),
      e(this, `shoutedMid`, !1),
      e(this, `done`, !1),
      (this.scene = t),
      (this.cart = Oc()),
      (this.vendor = kc()),
      (this.vendor.root.position.z = -1.75),
      this.root.add(this.cart.root, this.vendor.root),
      (this.x = n),
      (this.dir = r >= n ? 1 : -1),
      (this.total = Math.abs(r - n)),
      this.root.position.set(n, 0, i),
      (this.root.rotation.y = this.dir > 0 ? Math.PI / 2 : -Math.PI / 2),
      t.add(this.root));
  }
  get posX() {
    return this.x;
  }
  get duration() {
    return this.total / t.SPEED + t.SHOUT_PAUSE;
  }
  update(e) {
    let n = {};
    if (this.done) return n;
    this.t += e;
    let r = this.vendor;
    if (this.paused) {
      ((this.pauseLeft -= e),
        (r.head.rotation.y += (1.1 - r.head.rotation.y) * Math.min(1, e * 5)));
      for (let e of r.legs) e.rotation.x *= 0.85;
      this.pauseLeft <= 0 && (this.paused = !1);
    } else {
      let i = t.SPEED * e;
      ((this.walked += i), (this.x += this.dir * i));
      let a = this.walked * 4.6;
      ((r.legs[0].rotation.x = Math.sin(a) * 0.5),
        (r.legs[1].rotation.x = -Math.sin(a) * 0.5),
        (r.root.position.y = Math.abs(Math.cos(a)) * 0.03),
        (r.head.rotation.y *= 0.9));
      for (let e of this.cart.wheels)
        e.rotation.x += (i / 0.33) * (e === this.cart.wheels[2] ? 2.3 : 1);
      ((this.cart.root.position.y = Math.abs(Math.sin(a * 1.5)) * 0.012),
        !this.shoutedMid &&
          this.walked >= this.total / 2 &&
          ((this.shoutedMid = !0),
          (this.paused = !0),
          (this.pauseLeft = t.SHOUT_PAUSE),
          (n.moo = !0)));
    }
    return (
      (this.root.position.x = this.x),
      this.walked >= this.total && (this.done = !0),
      n
    );
  }
  dispose() {
    (this.scene.remove(this.root),
      this.root.traverse((e) => {
        let t = e;
        t.geometry && t.geometry.dispose();
      }));
  }
};
(e(Ac, `SPEED`, 2.4), e(Ac, `SHOUT_PAUSE`, 1.4));
var jc = 30;
function Mc(e, t, n) {
  if ((e.update(n, t.x), (e.wantsSuper = !1), e.y > 1 || t.y > 1)) return;
  let r = e.x - t.x;
  if (Math.abs(r) >= 0.72) return;
  let i = r === 0 ? -e.facing : Math.sign(r);
  e.x = Math.max(-O, Math.min(O, t.x + i * Ke));
}
var Nc = class {
    constructor() {
      e(this, `frames`, []);
    }
    record(e, t, n) {
      (this.frames.push({ seq: e, bits: t, paused: n }),
        this.frames.length > jc && this.frames.shift());
    }
    confirm(e) {
      for (; this.frames.length && this.frames[0].seq <= e;)
        this.frames.shift();
    }
    replay(e, t) {
      let n = 0;
      for (let r of this.frames)
        r.paused ? (n |= r.bits & 240) : (Mc(e, t, Xs(r.bits | n)), (n = 0));
    }
    clear() {
      this.frames = [];
    }
    get size() {
      return this.frames.length;
    }
  },
  Pc = 1,
  Fc = 1.7,
  Ic = 1.2,
  Lc = 2.8,
  Rc = 0.9,
  zc = 3,
  Bc = 5.8,
  Vc = new Set([
    `kick`,
    `finisher`,
    `special2`,
    `sweep`,
    `roundhouse`,
    `airKick`,
  ]),
  Hc = {
    jab: `JAB`,
    cross: `CROSS`,
    kick: `KICK`,
    finisher: `FINISHER`,
    uppercut: `UPPERCUT`,
    roundhouse: `ROUNDHOUSE`,
    lowJab: `LOW JAB`,
    sweep: `SWEEP`,
    special1: `PALM STRIKE`,
    special2: `FLYING KICK`,
    airPunch: `AIR PUNCH`,
    airKick: `AIR KICK`,
    grab: `GRAB`,
    landing: ``,
  },
  Uc = 0.55,
  Wc = 12,
  Gc = 3,
  Kc = class {
    constructor(t, n) {
      (e(this, `ctx`, void 0),
        e(this, `fighters`, void 0),
        e(this, `rigs`, void 0),
        e(this, `match`, new bc()),
        e(this, `playerSide`, void 0),
        e(this, `phase`, `intro`),
        e(this, `phaseTime`, 0),
        e(this, `bot`, void 0),
        e(this, `superMove`, null),
        e(this, `superCaster`, 0),
        e(this, `hitStop`, 0),
        e(this, `timeScale`, 1),
        e(this, `slowMoTime`, 0),
        e(this, `acc`, 0),
        e(this, `time`, 0),
        e(this, `cues`, new Set()),
        e(this, `wasGrounded`, [!0, !0]),
        e(this, `timeUp`, !1),
        e(this, `tmp`, new T()),
        e(this, `tmp2`, new T()),
        e(this, `chaiwala`, void 0),
        e(this, `grapple`, null),
        e(this, `grappleSide`, 0),
        e(this, `dancer`, null),
        e(this, `danceCalled`, !1),
        e(this, `cow`, null),
        e(this, `cowAt`, -1),
        e(this, `calm`, 0),
        e(this, `boredFired`, !1),
        e(this, `tauntFired`, !1),
        e(this, `lastLeader`, null),
        e(this, `rng`, Math.random),
        e(this, `entrance`, null),
        e(this, `handover`, null),
        e(this, `chaiwalaLeft`, !1),
        e(this, `finale`, void 0),
        e(this, `peace`, new ii()),
        e(this, `peaceFromX`, 0),
        e(this, `peaceWon`, !1),
        e(this, `bossSeconds`, 0),
        e(this, `bossHpSeen`, 0),
        e(this, `roundDamage`, 0),
        e(this, `bestDamage`, 0),
        e(this, `paused`, !1),
        e(this, `net`, void 0),
        e(this, `isGuest`, void 0),
        e(this, `remoteInput`, new $s()),
        e(this, `snapSeq`, 0),
        e(this, `lastSnapIn`, -1),
        e(this, `inputSeq`, 0),
        e(this, `recentInputs`, []),
        e(this, `hostDelay`, new tc()),
        e(this, `ownMoves`, new Nc()),
        e(this, `whooshFrom`, 0),
        e(this, `predicting`, !0),
        e(this, `smooth`, [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ]),
        e(this, `onMatchEnd`, null),
        e(this, `onMatchDecided`, null),
        (this.ctx = t),
        (this.net = n.net ?? null),
        (this.isGuest = this.net?.role === `guest`),
        (this.playerSide = +!!this.isGuest));
      let r = A[n.player],
        i =
          A[n.opponent && n.opponent !== n.player ? n.opponent : Vr(n.player)],
        a = this.isGuest ? [i, r] : [r, i];
      (pi(a[0].id, a[1].id),
        (this.finale = !!n.bossEntrance),
        t.audio.preloadFighters([a[0].id, a[1].id]),
        (this.fighters = [new li(0, a[0], -qe / 2), new li(1, a[1], qe / 2)]),
        (this.rigs = [Xo(a[0]), Xo(a[1])]),
        this.rigs.forEach((e, n) => {
          let r = t.faceTextures[this.fighters[n].char.id];
          (r && e.setFacePhoto(r), t.scene.add(e.root));
        }),
        (this.bot = new vc(n.difficulty, n.rng)),
        t.hud.setup(
          a,
          [t.portraits[a[0].id], t.portraits[a[1].id]],
          this.playerSide,
          this.net ? `FRIEND` : `CPU`,
        ),
        t.hud.show(!0),
        t.news.reset(),
        (this.chaiwala = n.handover?.chaiwala ?? new Hi(t.scene, this.rng)),
        (this.time = n.handover?.time ?? 0),
        (this.handover = n.handover ?? null),
        this.startRound(!n.handover));
    }
    dispose() {
      for (let e of this.rigs) (this.ctx.scene.remove(e.root), e.dispose?.());
      (this.chaiwalaLeft || this.chaiwala.dispose(),
        this.grapple?.dispose(),
        (this.grapple = null),
        this.cow?.dispose(),
        (this.cow = null),
        this.ctx.audio.stopLoop(0.4),
        this.ctx.arena.setLeader(null, 0),
        this.ctx.arena.setBoredom(0),
        this.ctx.audio.stopClip(400),
        this.ctx.audio.silenceMusic(!1),
        this.ctx.hud.setPeace(0),
        this.ctx.hud.cinema(!1),
        this.entrance?.dispose(),
        (this.entrance = null),
        this.superMove?.dispose(),
        (this.superMove = null),
        this.ctx.hud.setVignette(!1),
        this.ctx.arena.setMood(0),
        this.ctx.hud.clearSay());
    }
    setPhase(e) {
      (this.emit({ t: `ev`, e: `phase`, p: e }),
        (this.phase = e),
        (this.phaseTime = 0),
        this.cues.clear());
    }
    cue(e, t, n) {
      this.phaseTime >= t && !this.cues.has(e) && (this.cues.add(e), n());
    }
    startRound(e) {
      e || this.emit({ t: `ev`, e: `round` });
      let [t, n] = this.fighters;
      (this.smooth.forEach((e) => ((e.x = 0), (e.y = 0))),
        this.ownMoves.clear(),
        this.tuneHostDelay(),
        t.reset(this.handover?.x[0] ?? -2.6 / 2),
        n.reset(this.handover?.x[1] ?? 2.6 / 2),
        t.x > n.x && ((t.facing = -1), (n.facing = 1)),
        (this.timeUp = !1),
        (this.timeScale = 1),
        (this.hitStop = 0),
        (this.calm = 0),
        (this.boredFired = !1),
        (this.tauntFired = !1),
        (this.lastLeader = null),
        (this.dancer = null),
        this.cow?.dispose(),
        (this.cow = null),
        this.ctx.audio.stopLoop(0.4),
        (this.cowAt = this.rng() < Uc ? 60 - (12 + this.rng() * 22) : -1),
        this.ctx.audio.stopClip(1200),
        (this.roundDamage = 0),
        (this.bossHpSeen = this.boss?.hp ?? 0),
        this.ctx.hud.setPeace(0),
        this.ctx.input.clearEdges(),
        this.rigs.forEach((e, t) => {
          let n = this.fighters[t];
          (e.setTransform(n.x, 0, n.facing, 0),
            e.snapTo(R(this.handover ? this.time : 0, n.char.id)));
        }),
        (this.handover = null),
        e
          ? (t.forceState(`intro`),
            n.forceState(`intro`),
            this.setPhase(`intro`))
          : this.setPhase(`roundCall`));
    }
    update(e) {
      if (this.paused) return;
      ((this.time += e),
        (this.phaseTime += e),
        this.slowMoTime > 0 &&
          ((this.slowMoTime -= e),
          this.slowMoTime <= 0 && (this.timeScale = 1)),
        this.runPhase(),
        this.phase === `entrance` && this.entrance?.step(e, this.time));
      let t = e * this.timeScale;
      this.acc += t;
      let n = 0;
      for (; this.acc >= 0.016666666666666666 && n < 5;)
        ((this.acc -= Ge), this.step(), n++);
      (n >= 5 && (this.acc = 0),
        this.net?.role === `host` && n > 0 && this.sendSnapshot(),
        this.updateVisuals(e, t));
    }
    runPhase() {
      let { hud: e, audio: t } = this.ctx,
        [n, r] = this.fighters;
      switch (this.phase) {
        case `intro`:
          (this.cue(`a`, 0.5, () => this.speech(0, n.char.introLine)),
            this.cue(`b`, 1.7, () => this.speech(1, r.char.introLine)),
            !this.isGuest &&
              this.phaseTime > 3.2 &&
              (n.forceState(`idle`),
              r.forceState(`idle`),
              this.setPhase(`roundCall`)));
          break;
        case `roundCall`: {
          let n = this.match.isFinalRound;
          (this.cue(`round`, 0.1, () => {
            let r = n ? `FINAL ROUND` : `ROUND ${this.match.round}`;
            (e.say(r, `round`, 1100),
              t.announce(n ? `final_round` : `round_${this.match.round}`),
              this.ctx.news.event({
                kind: `roundStart`,
                round: this.match.round,
                final: n,
              }));
          }),
            this.cue(`fight`, 1.35, () => {
              (e.say(`FIGHT!`, `fight`, 700), t.announce(`fight`));
            }),
            !this.isGuest && this.phaseTime > 1.9 && this.setPhase(`fight`));
          break;
        }
        case `ko`:
          (this.cue(`news`, 0.05, () => {
            let e =
              n.hp <= 0 && r.hp > 0
                ? r.char.id
                : r.hp <= 0 && n.hp > 0
                  ? n.char.id
                  : null;
            (this.ctx.news.event({
              kind: `ko`,
              winner: e,
              timeUp: this.timeUp,
            }),
              this.timeUp ||
                (this.ctx.arena.paparazzi(14), t.cameraClicks(10)));
          }),
            this.cue(`call`, 0.05, () => {
              this.timeUp
                ? (e.say(`TIME UP!`, `ko`, 1500), t.announce(`time_up`))
                : n.hp <= 0 && r.hp <= 0
                  ? (e.say(`DOUBLE GHEE KHATAM!`, `ko`, 1600),
                    t.announce(`double_ko`))
                  : (e.say(`GHEE KHATAM!`, `ko`, 1600),
                    t.announce(`ko`),
                    e.flash(`rgba(255,255,255,0.8)`, 300));
            }),
            !this.isGuest && this.phaseTime > 2.6 && this.finishRound());
          break;
        case `roundOver`:
          (this.bossWonMatch &&
            this.cue(`bossWin`, 2.7, () => t.playClip(en, tn)),
            !this.isGuest &&
              this.phaseTime > 3.6 &&
              (this.match.winner === null
                ? (this.match.nextRound(), this.startRound(!1))
                : this.setPhase(`matchOver`)));
          break;
        case `matchOver`: {
          let n = this.match.winner === this.playerSide;
          if (
            (this.cue(`call`, 0.1, () => {
              (e.say(n ? `YOU WIN!` : `YOU LOSE`, n ? `win` : `lose`, 0),
                this.bossWonMatch || t.announce(n ? `you_win` : `you_lose`));
            }),
            n && this.finale && this.phaseTime > 1.7)
          ) {
            this.startEntrance();
            break;
          }
          !this.isGuest &&
            this.phaseTime > 5.5 &&
            (this.setPhase(`done`), this.endMatch());
          break;
        }
        case `entrance`:
          this.entrance?.done && (this.setPhase(`done`), this.endMatch());
          break;
        case `peaceEnd`:
          this.runPeaceEnd();
      }
    }
    endMatch() {
      this.ctx.audio.stopClip(1500);
      let e = this.match.winner === this.playerSide,
        t = this.match.winner ?? this.playerSide,
        n = this.boss;
      (this.entrance && (this.chaiwalaLeft = !0),
        this.onMatchEnd?.(e, {
          entrance: this.entrance
            ? {
                x: [this.fighters[this.playerSide].x, this.entrance.bossX],
                time: this.time,
                chaiwala: this.chaiwala,
              }
            : void 0,
          boss: n
            ? {
                seconds: this.bossSeconds,
                damage:
                  n.hp <= 0
                    ? 100
                    : Math.min(100, (this.bestDamage / n.maxHp) * 100),
                peaceful: this.peaceWon,
              }
            : void 0,
          winner: this.fighters[t].char.id,
          wins: [...this.match.wins],
          player: this.fighters[this.playerSide].char.id,
        }));
    }
    finishRound(e) {
      let [t, n] = this.fighters,
        r = e ?? yc(t.hp, n.hp, this.timeUp, this.bossSide);
      if (
        (this.emit({
          t: `ev`,
          e: `roundEnd`,
          outcome: r.outcome,
          perfect: r.perfect,
          timeUp: r.timeUp,
        }),
        this.match.record(r, !!this.boss && this.boss.hp <= 0),
        this.match.winner !== null &&
          this.onMatchDecided?.(this.match.winner === this.playerSide),
        this.ctx.hud.setWins(this.match.wins),
        r.outcome === `draw`)
      )
        this.ctx.hud.say(`DRAW`, `round`, 2200);
      else {
        let e = this.fighters[r.outcome];
        (e.state !== `ko` && e.forceState(`victory`), (e.y = 0));
        let t = r.perfect ? `PERFECT!` : `${e.char.name} WINS`;
        (this.ctx.hud.say(t, r.perfect ? `perfect` : `round`, 2400),
          this.ctx.audio.announce(r.perfect ? `perfect` : `wins_${e.char.id}`),
          this.speech(r.outcome, e.char.winLine),
          e.state === `victory` &&
            ((this.dancer = r.outcome), (this.danceCalled = !1)),
          this.ctx.news.event({
            kind: `roundWin`,
            winner: e.char.id,
            perfect: r.perfect,
          }));
      }
      (this.ctx.arena.cheer(1.2), this.setPhase(`roundOver`));
    }
    speech(e, t) {
      (this.rigs[e].headWorld(this.tmp), (this.tmp.y += 0.45));
      let n = this.ctx.toScreen(this.tmp);
      this.ctx.hud.speech(t, n.x, n.y);
    }
    step() {
      if (this.isGuest) {
        this.guestStep();
        return;
      }
      let [e, t] = this.fighters,
        n = this.net ? this.remoteInput.take() : null;
      if (this.phase === `super`) {
        let e = this.superMove;
        (e.step(Ge), e.done && this.finishSuper());
        return;
      }
      if (this.phase === `grapple`) {
        let e = this.grapple;
        (e.step(Ge), e.done && this.finishGrapple());
        return;
      }
      if (this.phase === `cow`) {
        (e.update(Ur(), t.x), t.update(Ur(), e.x), gc(e, t));
        let [n, r] = e.x <= t.x ? [e, t] : [t, e],
          i = O - Gc / 2,
          a = Math.max(-i, Math.min(i, (n.x + r.x) / 2)),
          o = 1 - Math.exp(-6 * Ge);
        ((n.x += (a - Gc / 2 - n.x) * o), (r.x += (a + Gc / 2 - r.x) * o));
        return;
      }
      if (this.phase !== `fight`) {
        (e.update(Ur(), t.x), t.update(Ur(), e.x), gc(e, t));
        return;
      }
      if (this.hitStop > 0) {
        (n && this.remoteInput.defer(n), this.hitStop--);
        return;
      }
      let r = this.ctx.input.poll(),
        i = this.net ? this.hostDelay.pass(r) : r,
        a = +(this.playerSide === 0),
        o =
          n ??
          this.bot.think(
            this.fighters[a],
            this.fighters[this.playerSide],
            0.016666666666666666,
          ),
        s = this.playerSide === 0 ? [i, o] : [o, i];
      (e.update(s[0], t.x), t.update(s[1], e.x), (this.calm += Ge));
      for (let e of this.fighters) {
        let t = e.attack;
        t &&
          (t.frame === 1 &&
            t.def.id !== `landing` &&
            (e.state === `attack` &&
              (this.ctx.audio.whoosh(),
              this.emit({ t: `ev`, e: `whoosh`, side: e.side })),
            (this.calm = 0)),
          t.frame === t.def.startup + 1 &&
            Vc.has(t.def.id) &&
            this.checkChai(e));
      }
      this.calm === 0 && ((this.boredFired = !1), (this.tauntFired = !1));
      for (let e of this.fighters)
        if (e.wantsSuper) {
          this.startSuper(e.side);
          return;
        }
      let [c, l] = mc(e, t);
      (c && this.onHit(c),
        l && this.phase === `fight` && this.onHit(l),
        this.phase === `fight` &&
          (gc(e, t),
          e.hp <= 0 || t.hp <= 0
            ? this.enterKo(!0)
            : (this.boss?.regen(Ge),
              this.boss && this.stepPeace(this.boss),
              this.match.tick(0.016666666666666666)
                ? ((this.timeUp = !0), this.enterKo(!1))
                : (this.checkBoredom(),
                  this.cowAt > 0 &&
                    this.match.timer <= this.cowAt &&
                    this.canCowCross() &&
                    this.startCow()))));
    }
    emit(e) {
      this.net?.role === `host` && this.net.send(e);
    }
    pushRemoteInputs(e, t) {
      this.remoteInput.push(e, t);
    }
    tuneHostDelay() {
      this.net?.role === `host` &&
        this.hostDelay.reset(ec(this.net.roundTrip()));
    }
    sendSnapshot() {
      let e = {
        t: `s`,
        n: ++this.snapSeq,
        m: [
          this.match.round,
          this.match.wins[0],
          this.match.wins[1],
          rc(this.match.timer),
        ],
        f: [
          this.fighterSnap(this.fighters[0]),
          this.fighterSnap(this.fighters[1]),
        ],
        a: this.remoteInput.ack,
      };
      this.net.sendSnapshot(JSON.stringify(e));
    }
    fighterSnap(e) {
      let t =
        (e.crouching ? ic.crouching : 0) |
        (e.holdingBack ? ic.holdingBack : 0) |
        (e.grounded ? ic.grounded : 0) |
        (e.attack?.hasHit ? ic.attackHasHit : 0) |
        (e.airAttackUsed ? ic.airAttackUsed : 0);
      return [
        rc(e.x),
        rc(e.y),
        rc(e.vx),
        rc(e.vy),
        e.facing,
        rc(e.hp),
        rc(e.meter),
        nc.indexOf(e.state),
        e.stateFrames,
        e.attack ? e.attack.def.id : ``,
        e.attack ? e.attack.frame : 0,
        t,
        e.moveRel,
        e.comboHits,
        rc(e.walkDistance),
        e.downFrames,
        e.stun,
        e.buffer ? ac.indexOf(e.buffer.button) + 1 : 0,
        e.buffer?.frames ?? 0,
      ];
    }
    applySnapshot(e) {
      if (
        !this.isGuest ||
        e.n <= this.lastSnapIn ||
        ((this.lastSnapIn = e.n),
        (this.match.timer = e.m[3]),
        (this.predicting = e.a !== void 0),
        e.a === void 0 ? this.ownMoves.clear() : this.ownMoves.confirm(e.a),
        this.phase === `super` || this.phase === `grapple`)
      )
        return;
      let t = this.fighters.map((e, t) => [
        e.x + this.smooth[t].x,
        e.y + this.smooth[t].y,
      ]);
      if (
        (e.f.forEach((e, t) => {
          let n = this.fighters[t];
          ((n.x = e[0]),
            (n.y = e[1]),
            (n.vx = e[2]),
            (n.vy = e[3]),
            (n.facing = e[4]),
            (n.hp = e[5]),
            (n.meter = e[6]),
            (n.state = nc[e[7]] ?? `idle`),
            (n.stateFrames = e[8]));
          let r = e[9] ? Kr[e[9]] : void 0;
          ((n.attack = r
            ? { def: r, frame: e[10], hasHit: !!(e[11] & ic.attackHasHit) }
            : null),
            (n.crouching = !!(e[11] & ic.crouching)),
            (n.holdingBack = !!(e[11] & ic.holdingBack)),
            (n.grounded = !!(e[11] & ic.grounded)),
            (n.moveRel = e[12]),
            (n.comboHits = e[13]),
            (n.walkDistance = e[14]),
            (n.downFrames = e[15]),
            (n.stun = e[16] ?? 0),
            (n.buffer = e[17]
              ? { button: ac[e[17] - 1], frames: e[18] ?? 0 }
              : null),
            (n.airAttackUsed = !!(e[11] & ic.airAttackUsed)));
        }),
        this.phase === `fight` && this.predicting)
      ) {
        let e = this.playerSide;
        this.ownMoves.replay(this.fighters[e], this.fighters[+(e === 0)]);
      }
      this.fighters.forEach((e, n) => {
        let r = this.smooth[n],
          i = t[n][0] - e.x,
          a = t[n][1] - e.y;
        ((r.x = Math.abs(i) < 1.2 ? i : 0), (r.y = Math.abs(a) < 1.2 ? a : 0));
      });
    }
    guestStep() {
      let e = this.ctx.input.poll(),
        t = Ys(e),
        n = this.inputSeq++;
      if (
        (this.recentInputs.push(t),
        this.recentInputs.length > 8 && this.recentInputs.shift(),
        this.net.sendInputs(Zs(n, this.recentInputs)),
        this.phase === `super` && this.superMove)
      ) {
        this.superMove.done || this.superMove.step(Ge);
        return;
      }
      if (this.phase === `grapple` && this.grapple) {
        this.grapple.done || this.grapple.step(Ge);
        return;
      }
      let r = this.phase === `fight` && this.predicting;
      if (
        (r && this.ownMoves.record(n, t, this.hitStop > 0), this.hitStop > 0)
      ) {
        this.hitStop--;
        return;
      }
      let i = this.fighters[this.playerSide];
      for (let e of this.fighters)
        (r && e === i) ||
          (e.stateFrames++,
          e.attack && e.attack.frame++,
          (!e.grounded || e.y > 0) &&
            ((e.vy -= 24 * Ge),
            (e.y += e.vy * Ge),
            e.y <= 0 && ((e.y = 0), (e.vy = 0))),
          (e.x = Math.max(-O, Math.min(O, e.x + e.vx * Ge))));
      r &&
        (Mc(i, this.fighters[+(this.playerSide === 0)], e),
        i.state === `attack` &&
          i.attack?.frame === 1 &&
          n >= this.whooshFrom &&
          (this.ctx.audio.whoosh(), (this.whooshFrom = n + Wc)));
    }
    applyNetEvent(e) {
      if (this.isGuest)
        switch (
          ((e.e === `ko` ||
            e.e === `roundEnd` ||
            e.e === `round` ||
            e.e === `cow`) &&
            this.leaveCinematic(`fight`),
          e.e)
        ) {
          case `phase`:
            this.phaseFromHost(e.p);
            break;
          case `round`:
            (this.match.nextRound(), this.startRound(!1));
            break;
          case `whoosh`:
            e.side !== this.playerSide && this.ctx.audio.whoosh();
            break;
          case `chai`:
            this.chaiFx(this.fighters[e.side]);
            break;
          case `speech`:
            this.speech(e.side, e.text);
            break;
          case `bored`:
            (this.ctx.news.event({ kind: `bored` }),
              this.ctx.audio.newsSting());
            break;
          case `super`:
            this.phase !== `super` && this.startSuper(e.side);
            break;
          case `hit`: {
            let t = e.hit,
              n = this.fighters[t.a],
              r = this.fighters[+(t.a === 0)];
            ((r.comboHits = t.combo),
              this.onHit({
                attacker: n,
                defender: r,
                moveId: t.moveId,
                blocked: t.blocked,
                grab: t.grab,
                damage: t.damage,
                knockdown: t.knockdown,
                ko: t.ko,
                x: t.x,
                y: t.y,
              }));
            break;
          }
          case `ko`:
            ((this.timeUp = e.timeUp),
              this.phase !== `ko` && this.enterKo(e.slowMo));
            break;
          case `cow`:
            this.phase !== `cow` && this.startCow(e.fromLeft);
            break;
          case `roundEnd`:
            this.finishRound({
              outcome: e.outcome,
              perfect: e.perfect,
              timeUp: e.timeUp,
            });
        }
    }
    phaseFromHost(e) {
      e !== this.phase &&
        (this.leaveCinematic(e),
        (e === `intro` || e === `roundCall`) && this.ctx.input.clearEdges(),
        this.setPhase(e),
        e === `done` && this.endMatch());
    }
    leaveCinematic(e) {
      if (this.phase === `super` && this.superMove) {
        let e = this.fighters[this.superCaster];
        (this.superMove.dispose(),
          (this.superMove = null),
          (e.y = 0),
          this.ctx.hud.setVignette(!1),
          this.ctx.arena.setMood(0));
      }
      (this.phase === `grapple` &&
        this.grapple &&
        (this.grapple.dispose(),
        (this.grapple = null),
        (this.fighters[this.grappleSide].y = 0)),
        this.phase === `cow` &&
          this.cow &&
          (this.cow.dispose(),
          (this.cow = null),
          this.ctx.audio.stopLoop(0.4),
          e === `fight` &&
            (this.ctx.hud.say(`FIGHT!`, `fight`, 700),
            this.ctx.audio.announce(`fight`))));
    }
    checkChai(e) {
      let t = e.attack.def,
        n = e.x + e.facing * t.reach * 0.8;
      this.chaiwala.tryKnock(n, e.facing) &&
        (this.emit({ t: `ev`, e: `chai`, side: e.side }), this.chaiFx(e));
    }
    chaiFx(e) {
      let { audio: t, news: n, arena: r, hud: i } = this.ctx;
      (t.cupBreak(),
        t.newsSting(),
        n.event({ kind: `chai`, kicker: e.char.id }),
        r.cheer(0.8),
        this.chaiwala.headWorld(this.tmp),
        (this.tmp.y += 0.35));
      let a = this.ctx.toScreen(this.tmp);
      i.speech(this.chaiwala.upsetLine(), a.x, a.y, `small`);
    }
    checkBoredom() {
      if (this.calm > 3.2 && !this.tauntFired) {
        this.tauntFired = !0;
        let e = +(this.playerSide === 0);
        if (this.fighters[e].actionable) {
          let t = Mi(this.fighters[e].char.id, this.rng);
          (this.emit({ t: `ev`, e: `speech`, side: e, text: t }),
            this.speech(e, t));
        }
      }
      this.calm > 4.5 &&
        !this.boredFired &&
        ((this.boredFired = !0),
        this.emit({ t: `ev`, e: `bored` }),
        this.ctx.news.event({ kind: `bored` }),
        this.ctx.audio.newsSting());
    }
    canCowCross() {
      return (
        this.hitStop === 0 &&
        this.fighters.every((e) => e.actionable && e.y === 0 && e.hp > 0)
      );
    }
    triggerCow() {
      return this.phase !== `fight` || !this.canCowCross()
        ? !1
        : (this.startCow(), !0);
    }
    startCow(e) {
      this.cowAt = -1;
      let [t, n] = this.fighters;
      for (let e of this.fighters)
        ((e.attack = null),
          (e.buffer = null),
          (e.vx = 0),
          e.forceState(`idle`));
      let r = (t.x + n.x) / 2,
        i = e ?? this.rng() < 0.5;
      this.emit({ t: `ev`, e: `cow`, fromLeft: i });
      let a = 7.5,
        { hud: o, audio: s, news: c, arena: l } = this.ctx,
        u = r + (i ? -7.5 : a),
        d = r + (i ? a : -7.5);
      (l.stage === `road`
        ? ((this.cow = new Ac(this.ctx.scene, u, d)),
          o.say(
            `⚠ SABZI WALA<small>Aloo le lo, pyaaz le lo!</small>`,
            `cow`,
            2600,
          ),
          s.startLoop(`aloolelo`))
        : ((this.cow = new qi(this.ctx.scene, u, d)),
          o.say(`⚠ COW CROSSING<small>Sab ruk jao!</small>`, `cow`, 2600),
          s.moo()),
        s.newsSting(),
        c.event({ kind: `cow` }),
        this.setPhase(`cow`));
    }
    updateCow(e) {
      let t = this.cow;
      if (!t) return;
      let n = t.update(e),
        r = t instanceof Ac;
      if (n.moo) {
        (r || this.ctx.audio.moo(), this.tmp.set(t.posX, r ? 2.2 : 1.9, 1.25));
        let e = this.ctx.toScreen(this.tmp);
        this.ctx.hud.speech(
          r ? `ALOO LE LO! PYAAZ LE LO!` : `MOOOOO!`,
          e.x,
          e.y,
          `small`,
        );
      }
      (n.step && !r && this.ctx.audio.cowBell(),
        t.done &&
          (t.dispose(),
          (this.cow = null),
          this.ctx.audio.stopLoop(0.4),
          this.ctx.news.event({ kind: `cowGone` }),
          this.ctx.hud.say(`FIGHT!`, `fight`, 700),
          this.ctx.audio.announce(`fight`),
          (this.calm = 0),
          this.ctx.input.clearEdges(),
          this.setPhase(`fight`)));
    }
    updateChaiwala(e) {
      let t = this.chaiwala.update(e, this.time);
      if (t.shout && this.phase !== `super` && this.phase !== `entrance`) {
        (this.ctx.audio.chaiTing(),
          this.chaiwala.headWorld(this.tmp),
          (this.tmp.y += 0.35));
        let e = this.ctx.toScreen(this.tmp);
        e.x > 40 &&
          e.x < window.innerWidth - 40 &&
          e.y > 60 &&
          e.y < window.innerHeight - 60 &&
          this.ctx.hud.speech(t.shout, e.x, e.y, `small`);
      }
      let n = this.chaiwala.flyingCupPos(this.tmp2);
      n &&
        this.ctx.fx.particles.emit(n, {
          count: 2,
          speed: 0.8,
          color: 10510634,
          life: 0.5,
          size: 0.08,
          gravity: 6,
          drag: 1,
        });
    }
    updateCrowdMood() {
      let [e, t] = this.fighters,
        n = e.hp - t.hp,
        r = Math.abs(n) < 8 ? null : n > 0 ? e.char.id : t.char.id;
      (this.ctx.arena.setLeader(
        r,
        Math.abs(n) / 55,
        r === e.char.id ? t.char.id : e.char.id,
      ),
        r &&
          this.lastLeader &&
          r !== this.lastLeader &&
          this.phase === `fight` &&
          this.ctx.news.event({ kind: `comeback`, leader: r }),
        r && (this.lastLeader = r));
      let i =
        this.phase === `fight`
          ? Math.max(0, Math.min(1, (this.calm - 4) / 1.5))
          : 0;
      this.ctx.arena.setBoredom(i);
    }
    enterKo(e) {
      (this.ctx.hud.setPeace(0),
        this.emit({ t: `ev`, e: `ko`, slowMo: e, timeUp: this.timeUp }),
        e && ((this.timeScale = 0.3), (this.slowMoTime = 1.1)));
      for (let e of this.fighters)
        (e.hp > 0 && e.actionable && e.enter(`idle`),
          (e.vx = e.state === `ko` ? e.vx : 0));
      this.setPhase(`ko`);
    }
    onHit(e) {
      this.emit({
        t: `ev`,
        e: `hit`,
        hit: {
          a: e.attacker.side,
          moveId: e.moveId,
          blocked: e.blocked,
          grab: e.grab,
          damage: e.damage,
          knockdown: e.knockdown,
          ko: e.ko,
          x: rc(e.x),
          y: rc(e.y),
          combo: e.defender.comboHits,
        },
      });
      let { fx: t, audio: n, cam: r, arena: i, hud: a } = this.ctx,
        o = e.blocked
          ? 0.3
          : Math.min(1.4, e.damage / 11 + (e.knockdown ? 0.4 : 0));
      if (
        (this.tmp.set(e.x, e.y, 0.25),
        t.hitSpark(this.tmp, o, e.blocked, e.attacker.facing),
        e.attacker.char.id === `mbapu` &&
          (t.particles.emit(this.tmp, {
            count: 25,
            speed: 4.2,
            color: 16766720,
            life: 0.5,
            size: 0.22,
          }),
          (e.knockdown || o > 0.6) &&
            t.shockwave(this.tmp, 16766720, 0.35, 2.8)),
        (this.calm = 0),
        e.grab === `connect`)
      ) {
        this.startGrapple(e.attacker.side);
        return;
      }
      if (e.grab === `break`) {
        this.tmp.set(e.x, 1.9, 0.3);
        let t = this.ctx.toScreen(this.tmp);
        (a.popup(`THROW BREAK!`, t.x, t.y, `#7fd6ff`),
          n.block(),
          (this.hitStop = 6));
        return;
      }
      if (e.blocked) {
        (e.attacker === this.boss && this.peace.blocks++,
          this.ctx.news.event({ kind: `block`, attacker: e.attacker.char.id }),
          n.block(),
          (this.hitStop = 3),
          r.shake(0.03, 0.12));
        return;
      }
      (e.attacker.char.id === `mbapu` &&
        t.particles.emit(this.tmp, {
          count: 22,
          speed: 5.5,
          color: 16766720,
          life: 0.45,
          size: 0.22,
          drag: 2,
        }),
        n.hit(o),
        e.attacker === this.boss && this.peace.hit(),
        e.defender.side === this.playerSide && ht(e.knockdown ? 70 : 28),
        (this.hitStop = e.knockdown ? 8 : 5),
        r.shake(0.05 + o * 0.09, 0.18),
        i.cheer(0.25 + o * 0.3));
      let s = e.attacker.char.moveNames[e.moveId];
      if (
        (this.ctx.news.event({
          kind: `hit`,
          attacker: e.attacker.char.id,
          move: s ?? Hc[e.moveId],
          damage: e.damage,
          knockdown: e.knockdown,
        }),
        e.knockdown && (i.paparazzi(6), n.cameraClicks(5)),
        s)
      ) {
        this.tmp.y += 0.5;
        let t = this.ctx.toScreen(this.tmp);
        a.popup(s, t.x, t.y, e.attacker.char.accent);
      }
      a.combo(e.attacker.side, e.defender.comboHits);
    }
    get bossWonMatch() {
      let e = this.match.winner;
      return e !== null && e !== this.playerSide && this.fighters[e].isBoss;
    }
    get bossSide() {
      return this.boss?.side ?? null;
    }
    get boss() {
      return this.fighters.find((e) => e.isBoss) ?? null;
    }
    stepPeace(e) {
      let t = this.fighters[this.playerSide],
        n = this.ctx.hud;
      ((this.bossSeconds += Ge),
        e.hp < this.bossHpSeen && (this.roundDamage += this.bossHpSeen - e.hp),
        (this.bossHpSeen = e.hp),
        (this.bestDamage = Math.max(this.bestDamage, this.roundDamage)));
      let r = this.peace.step(t, e);
      (n.setPeace(e.peaceful ? Math.max(0.02, this.peace.progress) : 0),
        r && this.startPeaceEnd(t, e));
    }
    startPeaceEnd(e, t) {
      let { hud: n, audio: r, arena: i } = this.ctx;
      for (let n of [e, t])
        ((n.attack = null), (n.vx = 0), n.forceState(`frozen`));
      ((t.y = 0),
        (e.y = 0),
        (this.peaceWon = !0),
        (this.peaceFromX = t.x),
        r.silenceMusic(!0),
        i.setMood(0.3),
        n.setPeace(0),
        n.clearSay(),
        n.clearPopups(),
        n.show(!1),
        n.cinema(!0),
        n.flash(`rgba(255,236,190,0.7)`, 700),
        this.setPhase(`peaceEnd`));
    }
    peaceX(e) {
      let t = this.phaseTime,
        n = this.peaceFromX,
        r = e > n ? 1 : -1,
        i =
          n +
          ((Math.abs(e - n) > Fc ? e - r * Fc : n) - n) *
            I(Math.min(1, t / Pc)),
        a = Math.min(1, Math.max(0, (t - Ic) / 1.5999999999999999));
      return b.clamp(i - r * Rc * a, -O, O);
    }
    runPeaceEnd() {
      let { hud: e, audio: t, arena: n, fx: r } = this.ctx,
        i = this.boss,
        a = this.fighters[this.playerSide];
      (this.cue(`bow`, zc, () => {
        (t.playClip($t, tn), this.speech(i.side, `Shabash beta.`));
      }),
        this.cue(`line`, 4.2, () => this.speech(i.side, `Yahi asli jeet hai.`)),
        this.cue(`title`, Bc, () => {
          (e.flash(`rgba(255,240,200,0.8)`, 500),
            t.boom(),
            n.cheer(1.4),
            e.cinemaTitle(`SHANTI KI JEET`, `BINA HAATH UTHAYE JEET GAYE`));
        }),
        this.phaseTime > 5.3999999999999995 &&
          Math.random() < 0.7 &&
          (this.tmp.set(
            (a.x + i.x) / 2 + (Math.random() - 0.5) * 6,
            3.6,
            (Math.random() - 0.5) * 2.4,
          ),
          r.particles.emit(this.tmp, {
            count: 1,
            speed: 0.4,
            color: [16750899, 16777215, 1280008][Math.floor(Math.random() * 3)],
            life: 2.6,
            size: 0.13,
            gravity: 1.1,
          })),
        (i.x = this.peaceX(a.x)),
        this.phaseTime > 9.8 &&
          (e.cinema(!1),
          (this.match.wins[this.playerSide] = 2),
          (this.match.wins[i.side] = 0),
          this.setPhase(`done`),
          this.endMatch()));
    }
    startEntrance() {
      let { scene: e, cam: t, fx: n, audio: r, hud: i, arena: a } = this.ctx,
        o = this.fighters[this.playerSide],
        s = +(this.playerSide === 0);
      ((this.dancer = null),
        (this.entrance = new Ec({
          scene: e,
          cam: t,
          fx: n,
          audio: r,
          hud: i,
          arena: a,
          winner: o,
          beaten: this.fighters[s],
          winnerRig: this.rigs[this.playerSide],
          beatenRig: this.rigs[s],
        })),
        this.setPhase(`entrance`));
    }
    skipCinema() {
      this.entrance?.skip();
    }
    startSuper(e) {
      let t = this.fighters[e];
      (this.emit({ t: `ev`, e: `super`, side: e }),
        this.isGuest ||
          D(`super_used`, {
            character: t.char.id,
            by: e === this.playerSide ? `player` : this.net ? `friend` : `cpu`,
          }));
      let n = this.fighters[+(e === 0)],
        { hud: r, audio: i, arena: a, cam: o, fx: s, scene: c } = this.ctx;
      ((t.meter = 0),
        (t.attack = null),
        (t.vx = 0),
        t.forceState(`super`),
        (n.attack = null),
        (n.vx = 0),
        (n.vy = 0),
        n.forceState(`frozen`),
        (this.superCaster = e),
        (this.superMove = Ws({
          scene: c,
          cam: o,
          fx: s,
          audio: i,
          arena: a,
          caster: t,
          target: n,
          casterRig: this.rigs[e],
          targetRig: this.rigs[n.side],
          flash: (e, t) => r.flash(e, t),
          clipTime: () => i.clipTime(),
          popup: (e, t, n) => {
            let i = this.ctx.toScreen(t);
            r.popup(e, i.x, i.y, n);
          },
          speech: (t, r) => this.speech(t === `caster` ? e : n.side, r),
        })),
        r.superBanner(
          t.char,
          this.ctx.portraits[t.char.id],
          e,
          t.char.id === `nitin` ? 1e3 : 1700,
        ),
        r.setVignette(!0),
        a.setMood(0.65));
      let l = Zt[t.char.id];
      (l && i.playClip(l),
        this.ctx.news.event({
          kind: `super`,
          caster: t.char.id,
          superName: t.char.superName,
        }),
        this.setPhase(`super`));
    }
    startGrapple(e) {
      let t = this.fighters[e];
      this.isGuest ||
        D(`grapple`, {
          character: t.char.id,
          by: e === this.playerSide ? `player` : this.net ? `friend` : `cpu`,
        });
      let n = this.fighters[+(e === 0)],
        {
          hud: r,
          audio: i,
          arena: a,
          cam: o,
          fx: s,
          news: c,
          scene: l,
        } = this.ctx;
      ((this.grappleSide = e),
        (this.grapple = ao({
          scene: l,
          attacker: t,
          defender: n,
          fx: s,
          audio: i,
          arena: a,
          cam: o,
          attRig: this.rigs[e],
          defRig: this.rigs[n.side],
          popup: (e, t, n) => {
            let i = this.ctx.toScreen(t);
            r.popup(e, i.x, i.y, n);
          },
          speech: (t, r) => this.speech(t === `attacker` ? e : n.side, r),
          onImpact: (a, o) => {
            (c.event({
              kind: `hit`,
              attacker: t.char.id,
              move: t.char.moveNames.grab ?? `GRAB`,
              damage: a,
              knockdown: o,
            }),
              r.combo(e, n.comboHits),
              i.cameraClicks(6));
          },
        })),
        this.setPhase(`grapple`));
    }
    finishGrapple() {
      let e = this.fighters[this.grappleSide],
        t = this.fighters[+(this.grappleSide === 0)];
      (this.grapple?.dispose(),
        (this.grapple = null),
        (e.y = 0),
        e.forceState(`idle`),
        t.state === `frozen` && t.forceState(`idle`),
        this.ctx.input.clearEdges(),
        t.hp <= 0 ? this.enterKo(!1) : this.setPhase(`fight`));
    }
    finishSuper() {
      let e = this.fighters[this.superCaster],
        t = this.fighters[+(this.superCaster === 0)];
      (this.superMove?.dispose(),
        (this.superMove = null),
        (e.y = 0),
        e.forceState(`idle`),
        this.ctx.hud.setVignette(!1),
        this.ctx.arena.setMood(0),
        t.hp <= 0
          ? this.setPhase(`ko`)
          : (t.state === `frozen` && t.forceState(`idle`),
            this.setPhase(`fight`)));
    }
    danceCamera(e) {
      let { cam: t, hud: n, arena: r, fx: i } = this.ctx;
      if (!this.danceCalled) {
        this.danceCalled = !0;
        let t = e.char.dance.label;
        this.tmp.set(e.x, 2.6, 0.3);
        let r = this.ctx.toScreen(this.tmp);
        n.popup(t, r.x, r.y + 60, e.char.accent);
      }
      let a = Math.sin(this.time * 0.45) * 0.75 + (e.facing > 0 ? 0.25 : -0.25);
      if (
        (this.tmp.set(e.x, 1.05, 0),
        this.tmp2.set(e.x + Math.sin(a) * 4, 1.45, Math.cos(a) * 4),
        t.set(this.tmp2, this.tmp, 2.2, 40),
        r.cheer(0.02),
        Math.random() < 0.6)
      ) {
        let t = e.char.dance.colors;
        (this.tmp.set(
          e.x + (Math.random() - 0.5) * 3,
          3.2,
          (Math.random() - 0.5) * 2,
        ),
          i.particles.emit(this.tmp, {
            count: 2,
            speed: 0.6,
            color: t[Math.floor(Math.random() * 3)],
            life: 1.8,
            size: 0.14,
            gravity: 1.2,
            drag: 1.5,
          }));
      }
    }
    clipFor(e) {
      let t = this.fighters[e],
        n = this.fighters[+(e === 0)];
      if (this.phase === `peaceEnd`) {
        let e = this.phaseTime,
          t = Math.abs(this.peaceFromX - n.x) > Fc;
        return e < Pc && t
          ? { name: `walk_fwd`, time: e, loop: !0, fade: 0.25 }
          : e >= zc
            ? { name: `bow`, time: 0.2 + Math.min(2.2, e - zc), fade: 0.35 }
            : e >= Ic && e < Lc
              ? { name: `walk_back`, time: (e - Ic) * 1.2, loop: !0, fade: 0.2 }
              : { name: `stance`, time: this.time, loop: !0, fade: 0.3 };
      }
      if (this.phase === `super` && this.superMove) {
        let t =
          e === this.superCaster
            ? this.superMove.casterClip
            : this.superMove.targetClip;
        if (t) return t;
      }
      if (
        this.phase === `grapple` &&
        this.grapple &&
        e === this.grappleSide &&
        this.grapple.attClip
      )
        return this.grapple.attClip;
      let r = n.attackPhase,
        i = (r === `startup` || r === `active`) && Math.abs(n.x - t.x) < 2.4;
      return ai(t, this.time, i);
    }
    poseFor(e) {
      let t = this.fighters[e],
        n = this.fighters[+(e === 0)];
      if (
        this.phase === `entrance` &&
        this.entrance &&
        !t.isBoss &&
        e !== this.playerSide
      ) {
        let e = this.entrance.beatenPose(this.time);
        if (e) return { pose: e, rate: 6 };
      }
      if (this.phase === `peaceEnd` && e === this.playerSide) {
        let e = this.phaseTime > zc ? 0.3 : 0;
        return {
          pose: M(R(this.time, t.char.id), {
            hipsT: 0,
            spineT: 0,
            spineF: 0.08 + e,
            headF: 0.1 + e,
            ..._a,
          }),
          rate: 5,
        };
      }
      if (this.phase === `super` && this.superMove) {
        let t =
          e === this.superCaster
            ? this.superMove.casterPose
            : this.superMove.targetPose;
        if (t) return { pose: t, rate: 12 };
      }
      if (this.phase === `grapple` && this.grapple) {
        let t =
          e === this.grappleSide ? this.grapple.attPose : this.grapple.defPose;
        if (t) return { pose: t, rate: this.grapple.poseRate };
      }
      if (this.phase === `cow` && t.state === `idle`)
        return {
          pose: M(R(this.time, t.char.id), {
            rootY: -0.03,
            spineF: 0.12,
            headF: 0.15,
            headT: 0.6,
            hipsT: 0,
            spineT: 0,
            ..._a,
          }),
          rate: 6,
        };
      if (
        this.phase === `roundCall` &&
        this.match.round === 1 &&
        t.state === `idle`
      )
        return { pose: ba(this.time + e * 1.9, t.char.id), rate: 6 };
      let r = n.attackPhase,
        i = (r === `startup` || r === `active`) && Math.abs(n.x - t.x) < 2.4,
        a = Sa(t, { time: this.time, threatened: i }),
        o = 14;
      return (
        t.state === `attack` || (t.state === `jump` && t.attack)
          ? (o = 30)
          : t.state === `hitstun` || t.state === `blockstun`
            ? (o = 32)
            : t.state === `knockdown` || t.state === `ko`
              ? (o = 10)
              : t.state === `victory` && (o = 22),
        { pose: a, rate: o }
      );
    }
    updateVisuals(e, t) {
      let { cam: n, fx: r, arena: i, hud: a } = this.ctx;
      for (let i of [0, 1]) {
        let a = this.fighters[i],
          { pose: o, rate: s } = this.poseFor(i),
          c = this.rigs[i],
          l =
            a.state === `victory` &&
            this.phase !== `super` &&
            this.phase !== `grapple` &&
            !!c.playDance?.(t),
          u = !l && a.isBoss && !!c.playClip?.(this.clipFor(i), t);
        !l && !u && (c.stopDance?.(), c.stopClip?.(), c.blendTo(o, s, t));
        let d = this.phase === `grapple` ? this.grapple : null,
          f = d ? (i === this.grappleSide ? d.attTf : d.defTf) : null;
        if (f) c.setFree(f.x, f.y, f.z, f.yaw, f.roll);
        else {
          let n = this.smooth[i],
            r = Math.exp(-e * 14);
          ((n.x *= r), (n.y *= r));
          let o = a.x + n.x,
            s = Math.max(0, a.y + n.y);
          l
            ? c.setTransform(o, s, a.facing, t, Math.PI / 2 - 0.3)
            : a.isBoss
              ? (c.setMirror?.(a.facing < 0),
                c.setTransform(
                  o,
                  s,
                  a.facing,
                  t,
                  a.state === `victory` ? Math.PI / 2 - 0.08 : Zr,
                ))
              : c.setTransform(o, s, a.facing, t);
        }
        ((a.state === `knockdown` || a.state === `ko`) &&
          a.grounded &&
          !this.wasGrounded[i] &&
          (r.dust(this.tmp2.set(a.x, 0.05, 0), 1.2),
          this.ctx.audio.thud(),
          n.shake(0.12, 0.2)),
          (this.wasGrounded[i] = a.grounded));
      }
      let [o, s] = this.fighters;
      if (this.phase === `intro`) {
        let e = Math.min(1, this.phaseTime / 3.2),
          t = -1.1 + e * 1.1,
          r = this.phaseTime < 1.6 ? o : s;
        (this.tmp.set(r.x * 0.6, 1.3, 0),
          this.tmp2.set(
            Math.sin(t) * (3.5 + e * 2) + r.x * 0.4,
            1.4,
            Math.cos(t) * (3.5 + e * 2),
          ),
          n.set(this.tmp2, this.tmp, 2.5, 40));
      } else if (this.phase === `cow` && this.cow) {
        let e = (o.x + s.x) / 2;
        (this.tmp.set((this.cow.posX + e) / 2, 1.1, 0.6),
          this.tmp2.set((this.cow.posX + e) / 2, 2, 7.6),
          n.set(this.tmp2, this.tmp, 2.5, 44));
      } else if (
        this.dancer !== null &&
        this.fighters[this.dancer].state === `victory` &&
        (this.phase !== `roundOver` || this.phaseTime > 0.6)
      )
        this.danceCamera(this.fighters[this.dancer]);
      else if (this.phase === `peaceEnd`) {
        let e = (o.x + s.x) / 2,
          t = Math.abs(o.x - s.x);
        (this.tmp.set(e, 1.15, 0),
          this.tmp2.set(e, 1.45, Math.max(4.6, t * 1.5 + 2.6)),
          n.set(this.tmp2, this.tmp, 1.6, 40));
      } else
        this.phase !== `super` &&
          this.phase !== `grapple` &&
          this.phase !== `entrance` &&
          n.frameFight(o.x, s.x, o.y, s.y);
      (this.entrance?.afterVisuals(),
        this.phase === `grapple` && this.grapple?.afterVisuals(),
        this.phase === `cow` && this.updateCow(t),
        this.phase !== `peaceEnd` && this.updateChaiwala(t),
        this.phase !== `entrance` &&
          this.phase !== `peaceEnd` &&
          this.updateCrowdMood(),
        this.ctx.news.update(e),
        i.update(this.time, e),
        r.update(t, n.camera),
        n.update(e),
        a.update(this.fighters, this.match.timer, e));
    }
    triggerSuper(e) {
      this.startSuper(e);
    }
    triggerGrapple(e) {
      this.startGrapple(e);
    }
    triggerAttack(e, t) {
      this.fighters[e].startAttack(t);
    }
  },
  U = (e, t = document) => t.querySelector(e),
  qc = class {
    constructor() {
      (e(this, `el`, U(`#hud`)),
        e(this, `timer`, U(`#timer`)),
        e(this, `announce`, U(`#announce`)),
        e(this, `flashEl`, U(`#flash`)),
        e(this, `flashTimer`, 0),
        e(this, `banner`, U(`#super-banner`)),
        e(this, `popups`, U(`#popups`)),
        e(this, `vignette`, U(`#vignette`)),
        e(this, `cinemaEl`, U(`#cinema`)),
        e(this, `cineCaption`, U(`#cine-caption`)),
        e(this, `cineTitle`, U(`#cine-title`)),
        e(this, `peaceEl`, U(`#peace-meter`)),
        e(this, `peaceFill`, U(`#peace-meter i`)),
        e(this, `sides`, void 0),
        e(this, `trail`, [100, 100]),
        e(this, `announceTimer`, null),
        e(this, `comboTimers`, [0, 0]),
        e(this, `youSide`, 0),
        e(
          this,
          `touchSuper`,
          document.querySelector(`#touch [data-touch="super"]`),
        ));
      let t = (e) => {
        let t = U(`.side.${e}`, this.el);
        return {
          root: t,
          fill: U(`.hp-fill`, t),
          trail: U(`.hp-trail`, t),
          meter: U(`.meter.${e} .meter-fill`, this.el),
          meterLabel: U(`.meter.${e} .meter-label`, this.el),
          wins: Array.from(t.querySelectorAll(`.win`)),
          combo: U(`.combo.${e}`, this.el),
          portrait: U(`.portrait`, t),
          name: U(`.name`, t),
        };
      };
      this.sides = [t(`left`), t(`right`)];
    }
    setup(e, t, n, r = `CPU`) {
      this.youSide = n;
      for (let i of [0, 1]) {
        let a = this.sides[i],
          o = e[i].id === `mbapu` ? 200 : 100,
          s =
            e[i].id === `mbapu`
              ? ` (FINAL BOSS)`
              : i === n
                ? ` (YOU)`
                : ` (${r})`;
        ((a.name.textContent = e[i].name + s),
          (a.portrait.src = t[i]),
          a.root.style.setProperty(`--accent`, e[i].accent),
          (this.trail[i] = o));
      }
      this.setWins([0, 0]);
    }
    show(e) {
      (e || this.setPeace(0), this.el.classList.toggle(`hidden`, !e));
    }
    setWins(e) {
      for (let t of [0, 1])
        this.sides[t].wins.forEach((n, r) =>
          n.classList.toggle(`on`, r < e[t]),
        );
    }
    update(e, t, n) {
      ((this.timer.textContent = String(Math.ceil(t))),
        this.timer.classList.toggle(`low`, t <= 10));
      for (let t of [0, 1]) {
        let r = e[t],
          i = this.sides[t],
          a = r.maxHp ?? 100,
          o = Math.max(0, r.hp);
        (this.trail[t] > o
          ? (this.trail[t] = Math.max(o, this.trail[t] - n * 30))
          : (this.trail[t] = o),
          (i.fill.style.width = `${(o / a) * 100}%`),
          i.fill.classList.toggle(`danger`, o < a * 0.3),
          (i.trail.style.width = `${(this.trail[t] / a) * 100}%`));
        let s = r.meter / 100;
        i.meter.style.width = `${s * 100}%`;
        let c = r.meter >= 100;
        (i.meter.parentElement.classList.toggle(`ready`, c),
          (i.meterLabel.textContent = c
            ? `${r.char.superName} READY!`
            : `SHAKTI`),
          t === this.youSide && this.touchSuper?.classList.toggle(`ready`, c),
          (this.comboTimers[t] -= n),
          this.comboTimers[t] <= 0 && i.combo.classList.remove(`show`));
      }
    }
    combo(e, t) {
      if (t < 2) return;
      let n = this.sides[e];
      ((n.combo.innerHTML = `<b>${t}</b> HITS`),
        n.combo.classList.remove(`show`),
        n.combo.offsetWidth,
        n.combo.classList.add(`show`),
        (this.comboTimers[e] = 1.4));
    }
    say(e, t = ``, n = 1200) {
      ((this.announce.className = ``),
        this.announce.offsetWidth,
        (this.announce.innerHTML = e),
        (this.announce.className = `show ${t}`),
        this.announceTimer !== null && window.clearTimeout(this.announceTimer),
        n > 0 &&
          (this.announceTimer = window.setTimeout(() => {
            this.announce.className = ``;
          }, n)));
    }
    clearSay() {
      this.announce.className = ``;
    }
    flash(e, t) {
      ((this.flashEl.style.transition = `none`),
        (this.flashEl.style.background = e),
        (this.flashEl.style.opacity = `1`),
        this.flashEl.offsetWidth,
        (this.flashEl.style.transition = `opacity ${t}ms ease-out`),
        (this.flashEl.style.opacity = `0`),
        window.clearTimeout(this.flashTimer),
        (this.flashTimer = window.setTimeout(() => {
          ((this.flashEl.style.transition = `none`),
            (this.flashEl.style.opacity = `0`));
        }, t + 200)));
    }
    superBanner(e, t, n, r = 1700) {
      ((this.banner.innerHTML = `<img src="${t}" alt=""><div><small>${e.name}</small><span>${e.superName}!</span></div>`),
        this.banner.style.setProperty(`--accent`, e.accent),
        (this.banner.className = `show ${n === 0 ? `from-left` : `from-right`}`),
        window.setTimeout(() => (this.banner.className = ``), r));
    }
    clearPopups() {
      this.popups.replaceChildren();
    }
    cinema(e, t = !1) {
      (this.cinemaEl.classList.toggle(`on`, e),
        this.cinemaEl.classList.toggle(`skippable`, e && t),
        e ||
          ((this.cineTitle.className = ``), (this.cineCaption.className = ``)));
    }
    cinemaCaption(e) {
      ((this.cineCaption.textContent = e),
        (this.cineCaption.className = e ? `show` : ``));
    }
    cinemaTitle(e, t) {
      ((this.cineTitle.querySelector(`h1`).textContent = e),
        (this.cineTitle.querySelector(`small`).textContent = t),
        (this.cineTitle.className = `show`));
    }
    setPeace(e) {
      (this.peaceEl.classList.toggle(`show`, e > 0),
        (this.peaceFill.style.transform = `scaleX(${Math.min(1, e)})`));
    }
    setVignette(e) {
      this.vignette.classList.toggle(`on`, e);
    }
    popup(e, t, n, r) {
      let i = document.createElement(`div`);
      ((i.className = `popup`),
        (i.textContent = e),
        (i.style.left = `${t}px`),
        (i.style.top = `${n}px`),
        (i.style.color = r),
        this.popups.appendChild(i),
        window.setTimeout(() => i.remove(), 1100));
    }
    speech(e, t, n, r = ``) {
      let i = document.createElement(`div`);
      ((i.className = r ? `speech ${r}` : `speech`),
        (i.textContent = e),
        (i.style.left = `${t}px`),
        (i.style.top = `${n}px`),
        this.popups.appendChild(i));
      let a = i.offsetWidth,
        o = i.offsetHeight,
        s = window.innerWidth,
        c = window.innerHeight;
      a > s - 16 &&
        ((i.style.whiteSpace = `normal`), (i.style.width = `${s - 16}px`));
      let l = Math.min(i.offsetWidth, s - 16) / 2;
      ((i.style.left = `${Math.min(s - 8 - l, Math.max(8 + l, t))}px`),
        (i.style.top = `${Math.min(c * 0.62, Math.max(8 + o + 50, n))}px`),
        window.setTimeout(() => i.remove(), 2e3));
    }
  };
function Jc(e) {
  let t = document.createElement(`canvas`);
  t.width = t.height = 128;
  let n = t.getContext(`2d`);
  ((n.fillStyle = e === `godi` ? `#2a0f0f` : `#0d1b33`),
    n.fillRect(0, 0, 128, 128),
    (n.fillStyle =
      e === `godi` ? `rgba(255,60,40,0.25)` : `rgba(60,160,255,0.25)`));
  for (let e = 0; e < 6; e++) n.fillRect(0, e * 24, 128, 10);
  (e === `godi`
    ? ((n.fillStyle = `#1d2333`),
      n.beginPath(),
      n.moveTo(14, 128),
      n.quadraticCurveTo(64, 78, 114, 128),
      n.fill(),
      (n.fillStyle = `#ffffff`),
      n.beginPath(),
      n.moveTo(52, 98),
      n.lineTo(64, 128),
      n.lineTo(76, 98),
      n.fill(),
      (n.fillStyle = `#d61f1f`),
      n.beginPath(),
      n.moveTo(60, 100),
      n.lineTo(68, 100),
      n.lineTo(70, 128),
      n.lineTo(58, 128),
      n.fill())
    : ((n.fillStyle = `#3b3f48`),
      n.beginPath(),
      n.moveTo(10, 128),
      n.quadraticCurveTo(64, 74, 118, 128),
      n.fill(),
      (n.strokeStyle = `#ddd`),
      (n.lineWidth = 2),
      n.beginPath(),
      n.moveTo(56, 98),
      n.lineTo(54, 118),
      n.moveTo(72, 98),
      n.lineTo(74, 118),
      n.stroke()),
    (n.fillStyle = `#c98c5f`),
    n.fillRect(56, 80, 16, 18),
    n.beginPath(),
    n.ellipse(64, 58, 25, 30, 0, 0, Math.PI * 2),
    n.fill(),
    e === `godi`
      ? ((n.fillStyle = `#1a1310`),
        n.beginPath(),
        n.ellipse(64, 36, 26, 14, 0, Math.PI, Math.PI * 2),
        n.fill(),
        n.beginPath(),
        n.ellipse(52, 34, 18, 8, -0.3, 0, Math.PI * 2),
        n.fill())
      : ((n.fillStyle = `#1f6fe0`),
        n.beginPath(),
        n.ellipse(64, 36, 27, 15, 0, Math.PI, Math.PI * 2),
        n.fill(),
        n.fillRect(84, 30, 18, 6)),
    (n.fillStyle = `#fff`));
  for (let e of [54, 74])
    (n.beginPath(), n.ellipse(e, 54, 6, 7, 0, 0, Math.PI * 2), n.fill());
  n.fillStyle = `#111`;
  for (let e of [55, 75])
    (n.beginPath(), n.arc(e, 55, 3, 0, Math.PI * 2), n.fill());
  return (
    (n.strokeStyle = `#1a1310`),
    (n.lineWidth = 4),
    n.beginPath(),
    n.moveTo(46, 44),
    n.lineTo(60, 48),
    n.moveTo(82, 44),
    n.lineTo(68, 48),
    n.stroke(),
    (n.fillStyle = `#5a1010`),
    n.beginPath(),
    n.ellipse(64, 74, 9, 7, 0, 0, Math.PI * 2),
    n.fill(),
    e === `godi`
      ? ((n.fillStyle = `#222`),
        n.fillRect(92, 70, 8, 40),
        (n.fillStyle = `#888`),
        n.beginPath(),
        n.arc(96, 68, 9, 0, Math.PI * 2),
        n.fill())
      : ((n.fillStyle = `#111`),
        n.fillRect(90, 74, 18, 30),
        (n.fillStyle = `#4fc3ff`),
        n.fillRect(92, 77, 14, 23)),
    t.toDataURL()
  );
}
var Yc = class {
    constructor(t, n = Math.random) {
      (e(this, `rng`, void 0),
        e(this, `anchors`, void 0),
        e(this, `tickerTrack`, void 0),
        e(this, `queue`, []),
        e(this, `lastMinor`, -99),
        e(this, `time`, 0),
        e(this, `tickerX`, 0),
        e(this, `fillerIdx`, 0),
        e(this, `clearAt`, { godi: 0, troll: 0 }),
        (this.rng = n));
      let r = (e) => {
        let n = t.querySelector(`.anchor.${e}`);
        return (
          (n.querySelector(`img`).src = Jc(e)),
          (n.querySelector(`.channel`).textContent = ui[e].channel),
          (n.querySelector(`.who`).textContent = ui[e].name),
          { root: n, text: n.querySelector(`.line`) }
        );
      };
      ((this.anchors = { godi: r(`godi`), troll: r(`troll`) }),
        (this.tickerTrack = t.querySelector(`.ticker-track`)),
        this.reset());
    }
    reset() {
      ((this.queue.length = 0),
        (this.tickerTrack.innerHTML = ``),
        (this.tickerX = window.innerWidth),
        (this.fillerIdx = Math.floor(this.rng() * Ti.length)));
      for (let e of [`godi`, `troll`])
        ((this.anchors[e].text.textContent =
          e === `godi` ? `Desh jaanna chahta hai!` : `Chat, are we live??`),
          this.anchors[e].root.classList.remove(`talking`));
      this.pushTicker(
        `SATIRE LIVE: Sansad Showdown — the fight nobody demanded`,
      );
    }
    event(e) {
      let t = Di(e, this.rng);
      if (!t.priority) {
        if (this.time - this.lastMinor < 1.8) return;
        this.lastMinor = this.time;
      }
      for (let e of [`godi`, `troll`]) {
        let n = t[e];
        if (!n) continue;
        let r = this.anchors[e];
        ((r.text.textContent = n),
          r.root.classList.remove(`talking`),
          r.root.offsetWidth,
          r.root.classList.add(`talking`),
          (this.clearAt[e] = this.time + 2.6));
      }
      t.ticker && this.pushTicker(t.ticker, !0);
    }
    pushTicker(e, t = !1) {
      let n = document.createElement(`span`);
      ((n.className = t ? `item breaking` : `item`),
        (n.textContent = e),
        this.tickerTrack.appendChild(n));
    }
    update(e) {
      this.time += e;
      for (let e of [`godi`, `troll`])
        this.time > this.clearAt[e] &&
          this.anchors[e].root.classList.remove(`talking`);
      this.tickerX -= e * 110;
      let t = this.tickerTrack.firstElementChild;
      t &&
        this.tickerX + t.offsetWidth < 0 &&
        ((this.tickerX += t.offsetWidth), t.remove());
      let n = this.tickerTrack.scrollWidth;
      (this.tickerX + n < window.innerWidth + 200 &&
        (this.pushTicker(Ti[this.fillerIdx % Ti.length]), this.fillerIdx++),
        (this.tickerTrack.style.transform = `translateX(${this.tickerX.toFixed(1)}px)`));
    }
  },
  Xc = [`KeyA`, `ArrowLeft`],
  Zc = [`KeyD`, `ArrowRight`],
  Qc = [`KeyW`, `ArrowUp`],
  $c = [`KeyS`, `ArrowDown`],
  el = [`KeyJ`, `KeyZ`],
  tl = [`KeyK`, `KeyX`],
  nl = [`KeyL`, `Space`, `KeyC`],
  rl = [`KeyI`, `KeyV`],
  il = class {
    constructor() {
      (e(this, `held`, new Set()),
        e(this, `pressed`, new Set()),
        e(this, `touchHeld`, new Set()),
        e(this, `touchPressed`, new Set()),
        e(this, `onKey`, null),
        window.addEventListener(`keydown`, (e) => {
          (!e.target.closest?.(`.legal-scroll`) &&
            [
              `Space`,
              `ArrowUp`,
              `ArrowDown`,
              `ArrowLeft`,
              `ArrowRight`,
            ].includes(e.code) &&
            e.preventDefault(),
            e.repeat || (this.pressed.add(e.code), this.onKey?.(e.code)),
            this.held.add(e.code));
        }),
        window.addEventListener(`keyup`, (e) => this.held.delete(e.code)),
        window.addEventListener(`blur`, () => this.held.clear()));
    }
    bindTouch(e) {
      let t = e.querySelector(`.stick`);
      (t && this.bindStick(t),
        e.querySelectorAll(`[data-touch]`).forEach((e) => {
          let t = e.dataset.touch,
            n = (n) => {
              (n.preventDefault(),
                this.touchHeld.add(t),
                this.touchPressed.add(t),
                e.classList.add(`active`),
                ht(8));
            },
            r = (n) => {
              (n.preventDefault(),
                this.touchHeld.delete(t),
                e.classList.remove(`active`));
            };
          (e.addEventListener(`pointerdown`, n),
            e.addEventListener(`pointerup`, r),
            e.addEventListener(`pointercancel`, r),
            e.addEventListener(`pointerleave`, r));
        }));
    }
    bindStick(e) {
      let t = e.querySelector(`.knob`),
        n = null,
        r = [`left`, `right`, `up`, `down`],
        i = (e) => {
          for (let t of r) {
            let n = !!e[t];
            (n && !this.touchHeld.has(t) && this.touchPressed.add(t),
              n ? this.touchHeld.add(t) : this.touchHeld.delete(t));
          }
        },
        a = (n) => {
          let a = e.getBoundingClientRect(),
            o = a.width / 2,
            s = n.clientX - (a.left + o),
            c = n.clientY - (a.top + o),
            l = Math.hypot(s, c),
            u = o * 0.62;
          (l > u && ((s = (s / l) * u), (c = (c / l) * u)),
            t && (t.style.transform = `translate(${s}px, ${c}px)`));
          let d = s / u,
            f = c / u,
            p = r.filter((e) => this.touchHeld.has(e)).join();
          (i({ left: d < -0.38, right: d > 0.38, up: f < -0.5, down: f > 0.5 }),
            r.filter((e) => this.touchHeld.has(e)).join() !== p && ht(5),
            e.classList.toggle(`active`, l > o * 0.15));
        },
        o = (r) => {
          r.pointerId === n &&
            ((n = null),
            t && (t.style.transform = ``),
            i({}),
            e.classList.remove(`active`));
        };
      (e.addEventListener(`pointerdown`, (t) => {
        (t.preventDefault(),
          (n = t.pointerId),
          e.setPointerCapture(t.pointerId),
          a(t));
      }),
        e.addEventListener(`pointermove`, (e) => {
          e.pointerId === n && a(e);
        }),
        e.addEventListener(`pointerup`, o),
        e.addEventListener(`pointercancel`, o));
    }
    any(e, t) {
      return e.some((e) => t.has(e));
    }
    poll() {
      let e = Ur(),
        t = this.any(Xc, this.held) || this.touchHeld.has(`left`);
      return (
        (e.moveX =
          t === (this.any(Zc, this.held) || this.touchHeld.has(`right`))
            ? 0
            : t
              ? -1
              : 1),
        (e.up = this.any(Qc, this.held) || this.touchHeld.has(`up`)),
        (e.down = this.any($c, this.held) || this.touchHeld.has(`down`)),
        (e.punch =
          this.any(el, this.pressed) || this.touchPressed.has(`punch`)),
        (e.kick = this.any(tl, this.pressed) || this.touchPressed.has(`kick`)),
        (e.super =
          this.any(nl, this.pressed) || this.touchPressed.has(`super`)),
        (e.grab =
          this.any(rl, this.pressed) ||
          this.touchPressed.has(`grab`) ||
          (e.punch && e.kick)),
        e.grab && ((e.punch = !1), (e.kick = !1)),
        this.pressed.clear(),
        this.touchPressed.clear(),
        e
      );
    }
    clearEdges() {
      (this.pressed.clear(), this.touchPressed.clear());
    }
  },
  al = 12,
  ol = `huddle-fightkaro:legal-v1`,
  sl = 3e4;
function cl() {
  try {
    return localStorage.getItem(ol) === `1`;
  } catch {
    return !1;
  }
}
function ll() {
  try {
    localStorage.setItem(ol, `1`);
  } catch {}
}
function ul() {
  let e = document.querySelector(`#legal`);
  try {
    return e && cl()
      ? (D(`legal_skip`), e.remove(), Promise.resolve())
      : e
        ? dl(e)
        : Promise.resolve();
  } catch (t) {
    return (
      console.warn(`[legal] notice failed, letting the player through`, t),
      D(`legal_failed`),
      e?.remove(),
      Promise.resolve()
    );
  }
}
function dl(e) {
  let t = e.querySelector(`#legal-ok`),
    n = e.querySelector(`.legal-scroll`);
  n.focus();
  let r = window.visualViewport,
    i = () => {
      r &&
        ((e.style.height = `${r.height}px`),
        (e.style.top = `${r.offsetTop}px`));
    };
  (i(), r?.addEventListener(`resize`, i), r?.addEventListener(`scroll`, i));
  let a = performance.now();
  D(`legal_view`);
  let o = `failsafe`,
    s = 0,
    c = () => {
      (window.clearTimeout(s),
        D(`legal_unlocked`, { how: o, sec: We(a) }),
        n.removeEventListener(`scroll`, l),
        u?.disconnect(),
        (t.textContent = `I UNDERSTAND · CONTINUE`),
        (t.disabled = !1),
        t.classList.add(`ready`),
        t.focus());
    },
    l = () => {
      n.scrollTop + n.clientHeight < n.scrollHeight - al ||
        ((o = n.scrollTop > 0 ? `scroll` : `fits`), c());
    },
    u = `ResizeObserver` in window ? new ResizeObserver(l) : null;
  return (
    u?.observe(n),
    n.addEventListener(`scroll`, l, { passive: !0 }),
    (s = window.setTimeout(c, sl)),
    l(),
    new Promise((n) => {
      t.addEventListener(
        `click`,
        () => {
          (D(`legal_continue`, { how: o, sec: We(a) }),
            ll(),
            r?.removeEventListener(`resize`, i),
            r?.removeEventListener(`scroll`, i),
            e.remove(),
            n());
        },
        { once: !0 },
      );
    })
  );
}
dt();
var W = (e) => document.querySelector(e),
  fl = document.querySelector(`#game`),
  G = new Pe({
    canvas: fl,
    antialias: !k,
    powerPreference: `high-performance`,
  });
(G.setPixelRatio(Math.min(window.devicePixelRatio, k ? 1.5 : 2)),
  (G.shadowMap.enabled = !0),
  (G.shadowMap.type = 1),
  (G.toneMapping = 4),
  (G.toneMappingExposure = 1.05),
  (G.outputColorSpace = oe));
var pl = G.getContext(),
  ml = 0;
(fl.addEventListener(`webglcontextlost`, (e) => {
  (e.preventDefault(), ml++, D(`webgl_context_lost`, { screen: q, count: ml }));
}),
  fl.addEventListener(`webglcontextrestored`, () => {
    (Al(!0), D(`webgl_context_restored`, { screen: q }));
  }));
var hl = new ae(),
  gl = new Br(window.innerWidth / window.innerHeight),
  _l = new Lt(hl, G),
  vl = new st(hl),
  yl = new Gs(hl),
  K = new Lr(),
  bl = new qc(),
  xl = new il(),
  Sl = new Yc(document.querySelector(`#newsdesk`));
xl.bindTouch(document.querySelector(`#touch`));
var Cl = new fe(G);
Cl.addPass(new je(hl, gl.camera));
var wl = null;
(k ||
  ((wl = new Te(new Ee(window.innerWidth, window.innerHeight), 0.45, 0.4, 1.2)),
  Cl.addPass(wl)),
  Cl.addPass(new le()));
var Tl = 0,
  El = 0,
  Dl = !0,
  Ol = 0,
  kl = !1;
function Al(e = !1) {
  ((Dl = !0), (Ol = performance.now()), kl || (kl = e));
}
function jl() {
  let e = window.innerWidth,
    t = window.innerHeight;
  ((Dl = !1),
    (e !== Tl || t !== El || kl) &&
      ((kl = !1),
      (Tl = e),
      (El = t),
      G.setSize(e, t, !1),
      Cl.setSize(e, t),
      gl.resize(e / t)));
}
(window.addEventListener(`resize`, () => Al()), jl());
var Ml = (e) => {
    let t = e.clone().project(gl.camera);
    return {
      x: ((t.x + 1) / 2) * window.innerWidth,
      y: ((1 - t.y) / 2) * window.innerHeight,
    };
  },
  Nl = 320;
function Pl(e, t) {
  let n = new ae();
  n.add(new y(16774634, 5583650, 1.8));
  let r = new s(16777215, 2.6);
  (r.position.set(0.6, 2, 2.5), n.add(r));
  let i = new s(16772306, 1.2);
  (i.position.set(-1.2, 1, 1.8), n.add(i));
  let a = Xo(A[e]);
  (t && a.setFacePhoto(t),
    a.snapTo(Yi()),
    n.add(a.root),
    a.root.updateMatrixWorld(!0));
  let o = a.headWorld(new T()),
    c = new re(28, 1, 0.01, 10),
    l = A[e].modelHeight ?? 1;
  (c.position.set(o.x, o.y + 0.01 * l, o.z + 0.92 * l),
    c.lookAt(o.x, o.y + 0.005 * l, o.z));
  let u = new pe(Nl, Nl, { samples: 4, colorSpace: oe }),
    d = G.getRenderTarget();
  (G.setRenderTarget(u), G.setClearColor(0, 0), G.clear(), G.render(n, c));
  let f = new Uint8Array(Nl * Nl * 4);
  (G.readRenderTargetPixels(u, 0, 0, Nl, Nl, f),
    G.setRenderTarget(d),
    u.dispose());
  let p = document.createElement(`canvas`);
  p.width = p.height = Nl;
  let m = p.getContext(`2d`),
    h = m.createImageData(Nl, Nl);
  for (let e = 0; e < Nl; e++)
    h.data.set(f.subarray((319 - e) * Nl * 4, (Nl - e) * Nl * 4), e * Nl * 4);
  return (m.putImageData(h, 0, 0), p.toDataURL(`image/png`));
}
var q = `title`,
  J = `modi`,
  Fl = Vr(J),
  Il = `normal`,
  Y = `sansad`,
  Ll = [`sansad`, `jantar`, `road`],
  Rl = (e) => Ll[(Ll.indexOf(e) + 1) % Ll.length],
  X = null,
  Z = null,
  zl = null,
  Q = { ready: !1, friendPick: null, friendReady: !1 },
  Bl = `/fightkaro/`,
  Vl = `?v=20261101_smooth`,
  Hl = {
    modi: `${Bl}faces/modi.png${Vl}`,
    rahul: `${Bl}faces/rahul.png${Vl}`,
    didi: `${Bl}faces/didi.png${Vl}`,
    trump: `${Bl}faces/trump.png${Vl}`,
    yogi: `${Bl}faces/yogi.png${Vl}`,
    nitin: `${Bl}faces/nitin.png${Vl}`,
    mbapu: `${Bl}faces/mbapu.png${Vl}`,
  },
  Ul = {},
  Wl = {
    title: document.querySelector(`#title`),
    online: document.querySelector(`#online`),
    select: document.querySelector(`#select`),
    result: document.querySelector(`#result`),
    pause: document.querySelector(`#pause`),
    loading: document.querySelector(`#loading`),
  },
  Gl = document.querySelector(`#neta-download`),
  Kl = document.querySelector(`#dl-title`),
  ql = document.querySelector(`#dl-pct`),
  Jl = document.querySelector(`#dl-fill`),
  Yl = null;
function Xl(e, t) {
  Gl && Gl.classList.remove(`hidden`);
  let n = A[e]?.name?.toUpperCase() ?? e.toUpperCase();
  Kl && (Kl.textContent = `DOWNLOADING ${n}…`);
  let r = Math.min(100, Math.max(0, Math.round(t)));
  (ql && (ql.textContent = `${r}%`), Jl && (Jl.style.width = `${r}%`));
}
function Zl(e) {
  (Gl && Gl.classList.remove(`hidden`),
    Kl &&
      (Kl.textContent = `${A[e].name} DOWNLOAD FAILED · CHECK YOUR INTERNET`),
    ql && (ql.textContent = `RETRY`),
    Jl && (Jl.style.width = `0%`),
    window.setTimeout(() => {
      Yl || Ql();
    }, 3500));
}
function Ql() {
  (Gl && Gl.classList.add(`hidden`),
    Jl && (Jl.style.width = `0%`),
    ql && (ql.textContent = `0%`));
}
async function $l(e) {
  if (Ko(e)) return (Yl === e && ((Yl = null), Ql()), await nu(e), mu(), !0);
  ((Yl = e), Xl(e, 0), mu());
  let t = await qo(e, G, (t) => {
    Yl === e && Xl(e, t);
  });
  return (
    t && (await nu(e)),
    Yl === e && ((Yl = null), Ql(), t ? Cu([e]) : Zl(e)),
    mu(),
    t
  );
}
var eu = {};
function tu() {
  for (let e of Gr) {
    if (!Ko(e)) continue;
    let t = Xo(A[e]);
    ((eu[e] = t), hl.add(t.root));
  }
  iu();
}
async function nu(e) {
  if (!(await Jo(e, G)) || eu[e]) return;
  let t = Xo(A[e]);
  ((eu[e] = t), hl.add(t.root), Ul[e] && t.setFacePhoto(Ul[e]), iu());
}
function ru() {
  return Z ? Q.friendPick : Fl;
}
function iu() {
  let e = q === `select`,
    t = ru(),
    n = cu().filter(
      (e) =>
        Ko(e) &&
        (e === `didi` || e === `yogi` || e === `nitin` || e === `trump`),
    );
  for (let r of Gr) {
    !eu[r] && Ko(r) && ((eu[r] = Xo(A[r])), hl.add(eu[r].root));
    let i = eu[r];
    if (i) {
      if (!su(r)) i.root.visible = !1;
      else if (!Ko(r)) i.root.visible = !1;
      else if (
        ((i.root.visible = q === `title` || (e && (r === J || r === t))), e)
      ) {
        let e = r === J,
          t = k ? 1.4 : 1.2;
        i.setTransform(e ? -t : t, 0, e ? 1 : -1, 0, 0.5);
      } else if (
        r === `didi` ||
        r === `trump` ||
        r === `yogi` ||
        r === `nitin`
      ) {
        let e = n.indexOf(r);
        if (n.length === 4) {
          let e = {
            didi: [-1.3, -0.4, 0.24],
            yogi: [-0.43, -0.7, 0.08],
            nitin: [0.43, -0.7, -0.08],
            trump: [1.3, -0.4, -0.24],
          }[r];
          i.setFree(e[0], 0, e[1], e[2]);
        } else if (n.length === 3) {
          let t = [
            [-0.95, -0.4, 0.22],
            [0, -0.7, 0],
            [0.95, -0.4, -0.22],
          ][e];
          i.setFree(t[0], 0, t[1], t[2]);
        } else if (n.length === 2) {
          let t = e === 0 ? -0.5 : 0.55;
          i.setFree(t, 0, -0.4, e === 0 ? 0.18 : -0.18);
        } else n.length === 1 && i.setFree(0, 0, -0.4, 0);
      } else {
        let e = n.length > 0 ? 1.75 : 1.1;
        i.setTransform(r === `modi` ? -e : e, 0, r === `modi` ? 1 : -1, 0, 0.6);
      }
    }
  }
}
var au = !1;
function ou(e) {
  (e !== q && Ue(e),
    au ||
      (e !== `select` && e !== `online` && e !== `battle`) ||
      ((au = !0),
      D(`game_enter`, {
        via: new URLSearchParams(location.search).has(`room`)
          ? `invite`
          : `title`,
      })),
    (q = e),
    Wl.title.classList.toggle(`hidden`, e !== `title`),
    Wl.online.classList.toggle(`hidden`, e !== `online`),
    Wl.select.classList.toggle(`hidden`, e !== `select`),
    Wl.result.classList.toggle(`hidden`, e !== `result`),
    document.body.classList.toggle(`in-battle`, e === `battle`),
    iu(),
    e !== `battle` && bl.show(!1));
}
dn(location.hash) &&
  history.replaceState(null, ``, location.pathname + location.search);
var $ = cn();
window.addEventListener(`storage`, () => Object.assign($, cn()));
var su = (e) => e !== `mbapu` || $.unlocked,
  cu = () => Gr.filter(su);
function lu(e, t, n) {
  let r = cu(),
    i = r.length,
    a = r.indexOf(e);
  a < 0 && (a = 0);
  do a = (a + t + i) % i;
  while (r[a] === n && i > 1);
  return r[a];
}
var uu = (e, t = !0) => {
  let n = cu(),
    r = n.filter((n) => n !== e && (t || n !== `mbapu`));
  return (r.length ? r : n)[Math.floor(Math.random() * (r.length || n.length))];
};
function du(e) {
  if (Z) {
    if (Q.ready || e === Q.friendPick) return;
    ((J = e), Wu());
  } else (e === Fl && (Fl = J === e ? Vr(e) : J), (J = e));
  $l(e);
}
var fu = `p1`;
document.querySelectorAll(`[data-tile]`).forEach((e) => {
  let t = e.dataset.tile;
  t !== `random` && !Gr.includes(t) && e.remove();
});
function pu(e, t, n, r) {
  let i = t ? A[t] : null;
  (e.style.setProperty(`--accent`, i?.accent ?? `#888`),
    e.classList.toggle(`active`, r),
    (e.querySelector(`.plate-tag`).textContent = n),
    (e.querySelector(`.plate-name`).textContent = i ? i.name : `CHOOSING…`),
    (e.querySelector(`.plate-party`).textContent = i?.party ?? ``),
    (e.querySelector(`.plate-super`).textContent = i?.superName
      ? `SUPER · ${i.superName}`
      : ``),
    (e.querySelector(`.plate-desc`).textContent = i?.superDesc ?? ``));
}
function mu() {
  (su(J) || ((J = lu(J, 1, ru())), Z && Wu()),
    !Z && !su(Fl) && (Fl = lu(Fl, 1, J)));
  let e = ru();
  (Z && (fu = `p1`),
    document.body.classList.toggle(`online`, !!Z),
    document.body.classList.toggle(`guest`, Z?.role === `guest`),
    document.querySelectorAll(`[data-tile]`).forEach((t) => {
      let n = t.dataset.tile;
      ((t.style.display = n === `random` || su(n) ? `` : `none`),
        t.classList.toggle(`p1`, n === J),
        t.classList.toggle(`p2`, n === e));
      let r = Z ? n === e : fu === `p2` && n === J;
      (t.classList.toggle(`taken`, r),
        t
          .querySelector(`.cur.p2`)
          ?.replaceChildren(Z ? `2P` : n === `mbapu` ? `` : `CPU`),
        n === `mbapu` &&
          ((t.style.display = Z ? `none` : ``),
          t.classList.toggle(`locked`, !$.unlocked),
          t
            .querySelector(`.tile-name`)
            ?.replaceChildren($.unlocked ? A.mbapu.name : `???`),
          t
            .querySelector(`.boss-tag`)
            ?.replaceChildren($.unlocked ? `BOSS` : `LOCKED`)));
    }),
    hu());
  let t = Z
    ? `2P · FRIEND${Q.friendReady ? ` · READY ✓` : ``}`
    : e === `mbapu`
      ? `FINAL BOSS · OPPONENT`
      : `CPU`;
  (pu(
    W(`#plate-p1`),
    J,
    Z && Q.ready ? `1P · YOU · READY ✓` : `1P · YOU`,
    fu === `p1`,
  ),
    pu(W(`#plate-p2`), e, t, !Z && fu === `p2`));
  let n = W(`#pick-prompt`);
  ((n.textContent = Z
    ? Q.ready
      ? `WAITING FOR YOUR FRIEND…`
      : `PICK YOUR NETA`
    : fu === `p1`
      ? `PICK YOUR NETA`
      : `PICK YOUR OPPONENT`),
    n.classList.toggle(`p2`, !Z && fu === `p2`));
  let r = W(`#fight-btn`);
  (Yl
    ? ((r.disabled = !0),
      (r.textContent = `DOWNLOADING…`),
      r.classList.remove(`pulse`),
      r.classList.remove(`waiting`))
    : ((r.disabled = !1),
      (r.textContent = Z
        ? Q.ready
          ? Q.friendReady
            ? `STARTING…`
            : `WAITING…`
          : `READY`
        : `FIGHT!`),
      r.classList.toggle(`waiting`, !!Z && Q.ready),
      r.classList.toggle(`pulse`, !Z || !Q.ready)),
    iu(),
    document.querySelectorAll(`[data-diff]`).forEach((e) => {
      e.classList.toggle(`selected`, e.dataset.diff === Il);
    }),
    document.querySelectorAll(`[data-stage]`).forEach((e) => {
      e.classList.toggle(`selected`, e.dataset.stage === Y);
    }),
    _l.stage !== Y && _l.setStage(Y),
    (W(`#stage-sub`).textContent = wt[Y].subtitle),
    (W(`#vs-line`).textContent =
      `${A[J].name} (YOU) vs ${e ? A[e].name : `…`} (${Z ? `FRIEND` : e === `mbapu` ? `BOSS` : `CPU`})`));
}
function hu() {
  let e = W(`#bapu-quest`);
  if ((e.classList.toggle(`hidden`, !!Z), Z)) return;
  if (!$.unlocked) {
    let t = Array.from(
      { length: 3 },
      (e, t) => `<i class="${t < $.streak ? `on` : ``}"></i>`,
    ).join(``);
    ((e.className = ``),
      (e.innerHTML = `<span class="quest-pips">${t}</span><span>3 NETA LAGATAAR HARAO</span><b>?</b>`));
    return;
  }
  let t = $.bestSeconds
    ? `BEST ${$.bestSeconds}s · ${$.bestDamage}% DAMAGE`
    : `TAP HIS TILE TO FACE HIM`;
  ((e.className = `open`),
    (e.innerHTML = `<span>${$.peaceWins ? `☮ SHANTI DOOT` : `MBAPU KI PARIKSHA`}</span><b>${t}</b>`));
}
function gu() {
  K.uiBack();
  let e = W(`#bapu-quest`);
  (e.classList.remove(`nudge`), e.offsetWidth, e.classList.add(`nudge`));
  let t = W(`.tile[data-tile="mbapu"]`);
  (t.classList.remove(`nudge`), t.offsetWidth, t.classList.add(`nudge`));
}
function _u(e) {
  if ((K.unlock(), e === `mbapu` && !Z && !$.unlocked)) gu();
  else {
    if (Z) {
      if (e === `mbapu`) return;
      let t = e === `random` ? uu(Q.friendPick, !1) : e;
      if (t === Q.friendPick || t === `mbapu`) return;
      du(t);
    } else if (e === `mbapu`) ((Fl = e), (fu = `p1`), $l(e));
    else if (fu === `p1`) (du(e === `random` ? uu(null, !1) : e), (fu = `p2`));
    else {
      let t = e === `random` ? uu(J, !1) : e;
      if (t === J) return;
      ((Fl = t), (fu = `p1`), $l(t));
    }
    (K.uiSelect(), mu());
  }
}
He();
var vu = null,
  yu = null;
function bu(e) {
  vu !== null &&
    (D(`match_quit`, {
      how: e,
      duration_sec: We(vu),
      mode: Z ? `online` : `cpu`,
    }),
    (vu = null));
}
function xu() {
  Yl ||
    (Z && !Z.battle && q !== `battle`
      ? ((Q.ready = !Q.ready), K.uiSelect(), Wu(), mu(), Gu())
      : Tu());
}
var Su = new Set();
async function Cu(e) {
  let t = e.filter((e) => !Su.has(e));
  if (t.length !== 0)
    try {
      (await Js(G, gl.camera, hl, yl, t), t.forEach((e) => Su.add(e)));
    } catch (e) {
      console.warn(`[perf] on-demand prewarm failed`, e);
    }
}
var wu = !1;
async function Tu(e) {
  if (!(Yl || wu)) {
    wu = !0;
    try {
      await Eu(e);
    } finally {
      wu = !1;
    }
  }
}
async function Eu(e) {
  (K.unlock(),
    k && !ut() && pt(),
    e || K.uiConfirm(),
    K.setTrack(`battle`),
    X?.dispose(),
    (X = null),
    ou(`battle`));
  let t = Z && Q.friendPick ? Q.friendPick : Fl,
    n = t === J ? Vr(J) : t,
    r = !Z && n !== `mbapu` && fn($);
  (r && K.preloadClips([Qt]),
    K.preloadClips([J, n].flatMap((e) => Zt[e] ?? [])),
    n === `mbapu` && K.preloadClips([$t, en]));
  let [i, a] = await Promise.all([
    Jo(J, G),
    Jo(n, G),
    ...(r ? [Jo(`mbapu`, G)] : []),
  ]);
  if (!i || !a) {
    ((X = null),
      Z && Zu(),
      K.setTrack(`background`),
      ou(`select`),
      mu(),
      Zl(i ? n : J));
    return;
  }
  let o = r && Ko(`mbapu`);
  (Cu([J, n]),
    (X = new Kc(
      {
        scene: hl,
        cam: gl,
        fx: vl,
        audio: K,
        hud: bl,
        arena: _l,
        input: xl,
        portraits: Hl,
        faceTextures: Ul,
        toScreen: Ml,
        news: Sl,
      },
      {
        player: J,
        opponent: n,
        difficulty: Il,
        net: Z?.battleNet(),
        bossEntrance: o,
        handover: e,
      },
    )),
    Z && (Z.battle = X),
    kd(X.fighters.map((e) => e.char.id)),
    Iu.classList.toggle(`hidden`, !Z),
    bu(`rematch`),
    (vu = performance.now()),
    D(`match_start`, {
      player: J,
      opponent: n,
      stage: Y,
      difficulty: Z ? `online` : Il,
      mode: Z ? `online` : `cpu`,
    }),
    (X.onMatchDecided = (e) => {
      if (Z || n === `mbapu`) return;
      let t = pn($, e);
      (un($),
        navigator.storage?.persist?.().catch(() => void 0),
        t && D(`bapu_unlocked`, { player: J }));
    }),
    (X.onMatchEnd = (e, t) => {
      if (
        (D(`match_end`, {
          player: t.player,
          winner: t.winner,
          result: e ? `win` : `lose`,
          score: `${t.wins[0]}-${t.wins[1]}`,
          stage: Y,
          difficulty: Z ? `online` : Il,
          mode: Z ? `online` : `cpu`,
          duration_sec: vu === null ? 0 : We(vu),
        }),
        (vu = null),
        Z ||
          (t.boss &&
            (mn($, t.boss.seconds, t.boss.damage, t.boss.peaceful), un($)),
          t.boss &&
            D(`bapu_fought`, {
              result: t.boss.peaceful ? `peace` : e ? `win` : `lose`,
              seconds: Math.round(t.boss.seconds),
            })),
        t.entrance)
      ) {
        ((Fl = `mbapu`), Tu(t.entrance));
        return;
      }
      (Z && (Z.battle = null),
        (Q.ready = !1),
        (Q.friendReady = !1),
        Iu.classList.add(`hidden`),
        bl.clearSay(),
        K.matchJingle(e),
        K.setTrack(`background`, 3));
      let r = t.winner === J ? n : J,
        i = Ai(t.winner, r, t.wins),
        a = (e) => document.querySelector(e),
        o = !!t.boss?.peaceful;
      ((a(`#result-title`).textContent = o
        ? `SHANTI KI JEET`
        : e
          ? `YOU WIN!`
          : `YOU LOSE`),
        (a(`#result-title`).className = o
          ? `stamp win peace`
          : e
            ? `stamp win`
            : `stamp lose`),
        Du(t.boss),
        (a(`#paper-masthead`).textContent = i.masthead),
        (a(`#paper-date`).textContent =
          `${new Date().toLocaleDateString(`en-IN`, { weekday: `long`, day: `numeric`, month: `long`, year: `numeric` })} · Price ₹5 · Satire Edition`),
        (a(`#paper-headline`).textContent = o
          ? `${A[J].name} NE HAATH NAHI UTHAYA, MBAPU KA DIL JEET LIYA`
          : i.headline),
        (a(`#paper-sub`).textContent = o
          ? `Na mukka, na laat. Sansad ne pehli baar shanti dekhi.`
          : i.sub),
        (a(`#paper-excuse`).textContent = i.excuse),
        a(`#paper-photo`).setAttribute(`src`, Hl[t.winner]),
        (a(`#paper-caption`).textContent =
          `${A[t.winner].fullName} celebrates outside the Sansad. (Cartoon, not a real photo)`),
        (a(`#result-sub`).textContent =
          `${A[t.winner].name} WINS! ` +
          (e
            ? `${A[J].name} rules the Sansad!`
            : `Better luck next election, ${A[J].name}.`)),
        (a(`#select-btn`).textContent = Z ? `LEAVE ROOM` : `CHARACTER SELECT`),
        (a(`#rematch-btn`).textContent = Z ? `REMATCH (LOBBY)` : `REMATCH`),
        ou(`result`));
    }));
}
function Du(e) {
  let t = W(`#bapu-stats`);
  if ((t.classList.toggle(`hidden`, !e), !e)) return;
  let n = (e, t) => `<div><b>${e}</b><span>${t}</span></div>`;
  t.innerHTML =
    n(`${Math.round(e.seconds)}s`, `TIKE RAHE`) +
    n(`${Math.round(e.damage)}%`, `DAMAGE`) +
    n(`${$.bestSeconds}s`, `BEST`) +
    (e.peaceful ? n(`☮`, `SHANTI DOOT`) : ``);
}
function Ou() {
  X &&
    q === `battle` &&
    (Z
      ? ((W(`#quit-btn`).textContent = `LEAVE ROOM`),
        Wl.pause.classList.toggle(`hidden`),
        K.uiTap())
      : ((W(`#quit-btn`).textContent = `QUIT TO SELECT`),
        (X.paused = !X.paused),
        K.setClipPaused(X.paused),
        K.uiTap(),
        Wl.pause.classList.toggle(`hidden`, !X.paused),
        Mu()));
}
function ku() {
  Z
    ? Zu()
    : (K.setClipPaused(!1),
      K.uiBack(),
      K.setTrack(`background`),
      bu(`quit`),
      X?.dispose(),
      (X = null),
      Wl.pause.classList.add(`hidden`),
      ou(`select`),
      mu());
}
(document.querySelectorAll(`[data-tile]`).forEach((e) => {
  (e.addEventListener(`click`, () => _u(e.dataset.tile)),
    e.addEventListener(`dblclick`, () => xu()));
}),
  W(`#plate-p1`).addEventListener(`click`, () => {
    ((fu = `p1`), K.uiTap(), mu());
  }),
  W(`#plate-p2`).addEventListener(`click`, () => {
    Z || ((fu = `p2`), K.uiTap(), mu());
  }),
  document.querySelectorAll(`[data-diff]`).forEach((e) => {
    e.addEventListener(`click`, () => {
      ((Il = e.dataset.diff), K.uiSelect(), mu());
    });
  }),
  document.querySelectorAll(`[data-stage]`).forEach((e) => {
    e.addEventListener(`click`, () => {
      Z?.role !== `guest` &&
        ((Y = e.dataset.stage), K.uiSelect(), Z && Wu(), mu());
    });
  }),
  document.querySelector(`#fight-btn`).addEventListener(`click`, xu),
  document
    .querySelector(`#cine-skip`)
    .addEventListener(`click`, () => X?.skipCinema()),
  document
    .querySelector(`#rematch-btn`)
    .addEventListener(`click`, () => (Z ? Ku() : xu())),
  document.querySelector(`#select-btn`).addEventListener(`click`, ku),
  document.querySelector(`#resume-btn`).addEventListener(`click`, Ou),
  document.querySelector(`#quit-btn`).addEventListener(`click`, ku),
  document.querySelector(`#pause-btn`).addEventListener(`click`, Ou),
  Wl.title.addEventListener(`click`, (e) => {
    e.target.closest(`#online-btn`) ||
      (K.unlock(),
      K.uiConfirm(),
      K.setTrack(`background`),
      pt(),
      ou(`select`),
      mu());
  }));
var Au = document.querySelector(`#sound-btn`),
  ju = document.querySelector(`#pause-sound-btn`);
function Mu() {
  let e = !K.muted;
  ((Au.textContent = e ? `🔊` : `🔇`),
    Au.setAttribute(`aria-label`, e ? `Mute sound` : `Turn sound on`),
    Au.classList.toggle(`locked`, e && K.locked && !X?.paused),
    (ju.textContent = e ? `SOUND: ON` : `SOUND: OFF`));
}
var Nu = !1;
function Pu(e) {
  e.stopPropagation();
  let t = Nu;
  ((Nu = !1),
    t || (K.locked && !K.muted && !X?.paused) ? K.unlock() : K.toggleMute(),
    K.uiTap(),
    Mu());
}
(Au.addEventListener(`pointerdown`, () => {
  Nu = K.locked && !K.muted;
}),
  Au.addEventListener(`click`, Pu),
  ju.addEventListener(`click`, Pu),
  (K.onStateChange = Mu),
  Mu());
var Fu = () => {
  K.unlock();
};
(document.addEventListener(`pointerdown`, Fu, { capture: !0 }),
  document.addEventListener(`keydown`, Fu, { capture: !0 }),
  mt((e) => {
    e && X && q === `battle` && !X.paused && Ou();
  }),
  k &&
    document.addEventListener(`visibilitychange`, () => {
      Z || (document.hidden && X && q === `battle` && !X.paused && Ou());
    }),
  document.addEventListener(`visibilitychange`, () =>
    Z?.setAway(document.hidden),
  ),
  window.addEventListener(`pagehide`, (e) => {
    (e.persisted ||
      (bu(`closed_tab`),
      yu !== null &&
        D(`room_leave`, { how: `closed_tab`, duration_sec: We(yu) })),
      Z && (e.persisted ? Z.setAway(!0) : Z.leave()));
  }),
  (xl.onKey = (e) => {
    if (
      (e === `KeyN` && (K.toggleMute(), Mu()),
      e === `KeyM` && (K.musicOn = !K.musicOn),
      q === `title` && cd && (e === `Enter` || e === `Space`))
    )
      (K.unlock(), K.uiConfirm(), K.setTrack(`background`), ou(`select`), mu());
    else if (q === `select` && Z)
      ((e === `ArrowLeft` || e === `KeyA`) && du(lu(J, -1, Q.friendPick)),
        (e === `ArrowRight` || e === `KeyD`) && du(lu(J, 1, Q.friendPick)),
        e === `KeyT` && Z.role === `host` && ((Y = Rl(Y)), Wu()),
        mu(),
        e === `Enter` && xu(),
        e === `Escape` && Zu());
    else if (q === `select`) {
      let t = `${J}|${Fl}|${Il}|${Y}`;
      ((e === `ArrowLeft` || e === `KeyA`) && du(lu(J, -1)),
        (e === `ArrowRight` || e === `KeyD`) && du(lu(J, 1)),
        (e === `ArrowUp` || e === `KeyW`) && (Fl = lu(Fl, -1, J)),
        (e === `ArrowDown` || e === `KeyS`) && (Fl = lu(Fl, 1, J)),
        e === `Digit1` && (Il = `easy`),
        e === `Digit2` && (Il = `normal`),
        e === `Digit3` && (Il = `hard`),
        e === `KeyT` && (Y = Rl(Y)),
        `${J}|${Fl}|${Il}|${Y}` !== t && K.uiSelect(),
        mu(),
        e === `Enter` && xu());
    } else
      q === `result`
        ? (e === `Enter` && (Z ? Ku() : xu()), e === `Escape` && ku())
        : q === `battle` && e === `Escape` && Ou();
  }));
var Iu = W(`#net-badge`),
  Lu = W(`#net-away`),
  Ru = [`on-home`, `on-hosting`, `on-connecting`, `on-error`];
function zu(e) {
  for (let t of Ru) W(`#${t}`).classList.toggle(`hidden`, t !== e);
  ou(`online`);
}
function Bu(e) {
  ((W(`#on-error-text`).textContent = e), zu(`on-error`));
}
var Vu = {
    onLobby: (e) => {
      ((Q.friendPick = e.pick),
        (Q.friendReady = e.ready),
        Z?.role === `guest` && e.stage && e.stage !== Y && (Y = e.stage),
        J === e.pick &&
          (Z?.role === `guest` || e.ready) &&
          ((J = lu(J, 1, e.pick)), (Q.ready = !1), Wu()),
        $l(e.pick),
        q === `select` && mu(),
        Gu());
    },
    onStart: (e) => {
      Z &&
        Z.role === `guest` &&
        ((J = e.guest),
        (Q.friendPick = e.host),
        (Y = e.stage),
        _l.setStage(Y),
        Tu());
    },
    onAway: (e) => {
      (Lu.classList.toggle(`hidden`, !e),
        X && Z && ((X.paused = e), K.setClipPaused(e)));
    },
    onEnd: (e) => Qu(e),
  },
  Hu = [];
function Uu(e) {
  (Hu.push(`${(performance.now() / 1e3).toFixed(1)}s ${e}`),
    Hu.length > 150 && Hu.shift());
}
function Wu() {
  Z?.send({
    t: `lobby`,
    pick: J,
    ready: Q.ready,
    stage: Z.role === `host` ? Y : void 0,
  });
}
function Gu() {
  Z &&
    Z.role === `host` &&
    q === `select` &&
    Q.ready &&
    Q.friendReady &&
    Q.friendPick &&
    Q.friendPick !== J &&
    (Z.send({ t: `start`, host: J, guest: Q.friendPick, stage: Y }), Tu());
}
function Ku() {
  (X?.dispose(),
    (X = null),
    Z && (Z.battle = null),
    (Q.ready = !1),
    Lu.classList.add(`hidden`),
    Iu.classList.add(`hidden`),
    Wl.pause.classList.add(`hidden`),
    K.setTrack(`background`),
    ou(`select`),
    Wu(),
    mu());
}
function qu(e) {
  ((Z = e),
    (Q.ready = !1),
    (Q.friendPick = null),
    (Q.friendReady = !1),
    K.uiConfirm(),
    D(`online_connected`, { role: e.role }),
    (yu = performance.now()),
    e.linkInfo().then((t) => D(`online_link`, { kind: t.kind, role: e.role })),
    location.search && history.replaceState(null, ``, location.pathname),
    Ku());
}
async function Ju() {
  (zl?.abort(),
    (zl = new AbortController()),
    zu(`on-connecting`),
    (W(`#on-connecting-text`).textContent = `Creating room…`));
  try {
    let { code: e, connected: t } = await oc.host(Vu, zl.signal, Uu);
    ((W(`#on-room-code`).textContent = e),
      (W(`#on-room-code`).dataset.code = e),
      zu(`on-hosting`),
      D(`room_create`),
      qu(await t));
  } catch (e) {
    if (zl?.signal.aborted) return;
    Bu(e instanceof Error ? e.message : String(e));
  }
}
function Yu(e) {
  let t = e?.status;
  if (t === 404) return `not_found`;
  if (t === 409) return `room_full`;
  if (t === 400) return `bad_code`;
  if (t === 429) return `rate_limited`;
  if (t && t >= 500) return `server_error`;
  let n = e instanceof Error ? e.message : String(e);
  return /relay|TURN|connect/i.test(n)
    ? `webrtc_failed`
    : /fetch|network|load failed/i.test(n)
      ? `network`
      : /timed? ?out/i.test(n)
        ? `timeout`
        : `other`;
}
async function Xu(e) {
  let t = r(e);
  if (!t) Bu(`That room code looks wrong: it should be 4 letters/numbers.`);
  else {
    (zu(`on-connecting`),
      (W(`#on-connecting-text`).textContent = `Joining room ${t}…`),
      D(`room_join_attempt`, {
        via: new URLSearchParams(location.search).has(`room`) ? `link` : `code`,
      }));
    try {
      qu(await oc.join(t, Vu, Uu));
    } catch (e) {
      (D(`room_join_failed`, { reason: Yu(e) }),
        Bu(e instanceof Error ? e.message : String(e)));
    }
  }
}
function Zu() {
  (Z?.leave(), Qu(null));
}
function Qu(e) {
  void huddleRequest('DELETE').catch(() => {});
  (Z && Uu(`session ended: ${e ?? `left`}`),
    bu(e ? `connection_ended` : `left_room`),
    yu !== null &&
      (D(`room_leave`, {
        how: e ? (/left/i.test(e) ? `friend_left` : `connection_lost`) : `left`,
        duration_sec: We(yu),
      }),
      (yu = null)),
    zl?.abort(),
    (zl = null),
    Z?.close(),
    (Z = null),
    X?.dispose(),
    (X = null),
    Lu.classList.add(`hidden`),
    Iu.classList.add(`hidden`),
    Wl.pause.classList.add(`hidden`),
    K.setClipPaused(!1),
    K.setTrack(`background`),
    document.body.classList.remove(`online`, `guest`),
    e ? Bu(e) : (ou(`select`), mu()));
}
function $u(e) {
  const url = new URL(parent.location.href);
  url.pathname = '/dashboard';
  url.searchParams.set('activity', 'games');
  url.searchParams.set('game', 'fightkaro');
  url.searchParams.set('fightRoom', e);
  return url.href;
}
let huddleJoining = false;
async function huddleRequest(method) {
  const response = await fetch('/api/fightkaro/lobby', { method });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not connect to your Huddle room.');
  return result;
}
async function huddlePlay() {
  if (huddleJoining || Z) return;
  huddleJoining = true;
  K.unlock(); K.uiConfirm(); K.setTrack('background');
  k && !ut() && pt();
  zu('on-connecting');
  W('#on-connecting-text').textContent = 'Finding your room…';
  try {
    let result;
    do {
      result = await huddleRequest('POST');
      if (!huddleJoining) { void huddleRequest('DELETE').catch(() => {}); return; }
      if (result.role === 'waiting') await new Promise(resolve => setTimeout(resolve, 500));
    } while (result.role === 'waiting' && huddleJoining);
    if (!huddleJoining) { void huddleRequest('DELETE').catch(() => {}); return; }
    if (result.role === 'host') await Ju();
    else await Xu(result.code);
  } catch (error) { if (huddleJoining) Bu(error.message); }
  finally { huddleJoining = false; }
}
(W(`#online-btn`).addEventListener(`click`, (e) => {
  e.stopPropagation(); void huddlePlay();
}),
  W(`#on-host`).addEventListener(`click`, () => void Ju()),
  W(`#on-join-form`).addEventListener(`submit`, (e) => {
    (e.preventDefault(), W(`#on-code`).blur(), Xu(W(`#on-code`).value));
  }),
  W(`#on-back`).addEventListener(`click`, () => {
    huddleJoining = false; zl?.abort(); zl = null;
    void huddleRequest('DELETE').catch(() => {});
    K.uiBack(); ou('select'); mu();
  }),
  W(`#on-wa`).addEventListener(`click`, () => {
    let e = W(`#on-room-code`).dataset.code ?? ``,
      t = `Fight me in Sansad Showdown! 🥊 Room code ${e}: ${$u(e)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, `_blank`);
  }),
  W(`#on-copy`).addEventListener(`click`, async () => {
    let e = W(`#on-room-code`).dataset.code ?? ``;
    try {
      (await navigator.clipboard.writeText($u(e)),
        (W(`#on-copy`).textContent = `Copied!`));
    } catch {
      W(`#on-copy`).textContent = $u(e);
    }
    setTimeout(() => (W(`#on-copy`).textContent = `Copy link`), 2e3);
  }),
  W(`#net-away-leave`).addEventListener(`click`, () => {
    (K.uiBack(), Zu());
  }),
  W(`#online-leave`).addEventListener(`click`, () => {
    (K.uiBack(), Zu());
  }),
  (t.forceRelay = new URLSearchParams(location.search).get(`relay`) === `1`));
var ed = { lan: `same Wi-Fi`, direct: `direct`, relay: `relay`, unknown: `…` },
  td = null;
setInterval(async () => {
  if (!Z) return;
  let e = Z,
    t = e.latency(),
    n = t ? Math.round(t.avg) : null;
  if (
    !td ||
    td.session !== e ||
    performance.now() - td.at > 5e3 ||
    td.text === `…`
  ) {
    let t = await e.linkInfo().catch(() => null);
    td = { session: e, text: t ? ed[t.kind] : `…`, at: performance.now() };
  }
  if (Z !== e) return;
  let r = td.text;
  ((W(`#online-status`).textContent =
    `Huddle room · ${r}${n === null ? `` : ` · ${n} ms`}`),
    (Iu.textContent = n === null ? `…` : `${n} ms`),
    Iu.classList.toggle(`bad`, n !== null && n > 150));
}, 1e3);
var nd = document.querySelector(`#load-fill`),
  rd = 0,
  id = 0.05,
  ad = 0.6;
function od(e, t) {
  ((id = Math.max(id, e)), (ad = t));
}
var sd = window.setInterval(() => {
  ((rd = Math.max(id, rd + (ad - rd) * 0.03)),
    nd && (nd.style.transform = `scaleX(${rd})`));
}, 100);
S.onProgress = (e, t, n) => od(0.05 + (t / Math.max(1, n)) * 0.55, 0.6);
var cd = !1,
  ld = ul().then(() => {
    ((cd = !0), K.unlock());
  });
async function ud() {
  let e = [`modi`, `rahul`].filter((e) => Gr.includes(e));
  (await Go(G, e),
    K.preloadCommon(),
    K.setTrack(`intro`),
    K.unlock(),
    od(0.62, 0.72),
    tu());
  let t = async (e) => {
    let t = await Da(A[e].facePhoto);
    t && ((Ul[e] = t), eu[e]?.setFacePhoto(t));
  };
  await Promise.all(e.map(t));
  for (let e of Gr) Hl[e] || (Hl[e] = `${Bl}faces/${e}.png${Vl}`);
  od(0.72, 0.97);
  try {
    let e = performance.now(),
      t = [`modi`, `rahul`].filter((e) => Gr.includes(e));
    (await Js(G, gl.camera, hl, yl, t),
      t.forEach((e) => Su.add(e)),
      console.info(
        `[perf] initial moves prewarmed in ${Math.round(performance.now() - e)} ms`,
      ));
  } catch (e) {
    console.warn(`[perf] prewarm failed`, e);
  }
  (od(1, 1),
    (rd = 1),
    nd && (nd.style.transform = `scaleX(1)`),
    window.clearInterval(sd),
    await new Promise((e) => setTimeout(e, 250)),
    Wl.loading.classList.add(`hidden`),
    ou(`title`));
  for (let n of Gr) e.includes(n) || t(n);
  (document.querySelectorAll(`[data-portrait]`).forEach((e) => {
    let t = e.dataset.portrait;
    Hl[t] && ((e.src = Hl[t]), (e.alt = A[t]?.name ?? t));
  }),
    D(`game_loaded`, {
      load_sec: Math.round(performance.now() / 100) / 10,
      device: k ? `mobile` : `desktop`,
    }));
  let n = new URLSearchParams(location.search).get(`room`);
  n && (await ld, (W(`#on-code`).value = n.toUpperCase()), Xu(n));
}
ud();
var dd = new Ae();
dd.connect(document);
var fd = 0,
  pd = new T(),
  md = new T();
function hd(e) {
  ((fd += e),
    Gr.forEach((t, n) => {
      let r = eu[t];
      if (!r || !r.root.visible) return;
      let i = q === `select` && t === J;
      r.blendTo(i ? da(fd, t) : ba(fd + n * 1.9, t), 6, e);
    }));
  let t = Math.sin(fd * 0.25) * (q === `select` ? 0.12 : 0.3),
    n = 4.1 * Math.max(1, 1.5 / gl.camera.aspect);
  (pd.set(0, 1.15, 0),
    md.set(0 + Math.sin(t) * n, 1.45, Math.cos(t) * n),
    gl.set(md, pd, 2.5, 40),
    _l.update(fd, e),
    vl.update(e, gl.camera),
    gl.update(e));
}
var gd = 0;
function _d(e) {
  requestAnimationFrame(_d);
  let t = q === `battle` || (q === `result` && !!X),
    n = X?.paused ? 100 : t ? 1e3 / 60 : 1e3 / 30;
  if (e < gd - 1) return;
  gd = Math.max(gd + n, e - n);
  let r = k && ut();
  if ((!r && Dl && (kl || !k || e - Ol > 200) && jl(), pl.isContextLost()))
    return;
  dd.update();
  let i = Math.min(0.05, dd.getDelta());
  (q === `battle` || (q === `result` && X) ? X?.update(i) : hd(i),
    yl.balance(),
    !r && (Cl.render(), Od(i)));
}
var vd = Math.min(window.devicePixelRatio, k ? 1.5 : 2),
  yd = Math.min(1, vd),
  bd = vd,
  xd = 0,
  Sd = 0,
  Cd = 0,
  wd = 0,
  Td = 0,
  Ed = 0;
function Dd(e) {
  ((bd = e),
    Ed++,
    (Td = performance.now()),
    G.setPixelRatio(e),
    Cl.setPixelRatio(e),
    Al(!0));
}
function Od(e) {
  if (!k || q !== `battle` || X?.paused || X?.phase !== `fight`) {
    ((xd = 0), (Sd = 0));
    return;
  }
  if (((xd += e), Sd++, xd < 4)) return;
  let t = Sd / xd;
  ((xd = 0), (Sd = 0));
  let n = performance.now() - Td;
  if (t < 45) {
    if (((wd = 0), ++Cd < 2 || n < 3e4)) return;
    ((Cd = 0),
      bd > yd
        ? Dd(Math.max(yd, bd - 0.25))
        : wl && wl.enabled && t < 32 && (wl.enabled = !1));
  } else
    ((Cd = 0),
      (wd = t >= 58 ? wd + 4 : 0),
      wd >= 60 &&
        bd < vd &&
        n > 6e4 &&
        ((wd = 0), Dd(Math.min(vd, bd + 0.25))));
}
function kd(e) {
  if (!k) return;
  let t = new Set(e.flatMap((e) => [...Yo(e)]));
  for (let n of Gr)
    if (!e.includes(n)) for (let e of Yo(n)) t.has(e) || e.dispose();
}
if (new URLSearchParams(location.search).has(`debug`)) {
  let e = document.createElement(`div`);
  ((e.style.cssText = `position:fixed;left:4px;top:4px;z-index:99999;font:11px monospace;color:#0f0;background:rgba(0,0,0,.6);padding:3px 6px;pointer-events:none;white-space:pre`),
    document.body.appendChild(e));
  let t = 0,
    n = performance.now(),
    r = () => {
      (t++, requestAnimationFrame(r));
    };
  (requestAnimationFrame(r),
    window.setInterval(() => {
      let r = performance.now(),
        i = (t * 1e3) / (r - n);
      ((t = 0), (n = r));
      let a = G.info.memory,
        o = performance.memory?.usedJSHeapSize;
      e.textContent = `raf ${i.toFixed(0)} | draws ${G.info.render.calls}\nratio ${bd} | changes ${Ed} | bloom ${wl?.enabled ? `on` : `off`}\ntex ${a.textures} | geo ${a.geometries}${o ? ` | heap ${(o / 1048576).toFixed(0)}MB` : ``}\nsize ${Tl}x${El} | ctx lost ${ml}`;
    }, 500));
}
(requestAnimationFrame(_d),
  [`localhost`, `127.0.0.1`].includes(location.hostname) &&
    (window.__game = {
      get battle() {
        return X;
      },
      get bapu() {
        return $;
      },
      get audio() {
        return K;
      },
      get renderer() {
        return G;
      },
      get online() {
        return Z;
      },
      get netLog() {
        return Hu;
      },
      renderPortrait(e) {
        return Pl(e, Ul[e]);
      },
      ensureCharacterModel(e) {
        return Jo(e, G);
      },
      start(e, t = `normal`, n = Y, r) {
        (du(e),
          r && r !== e && (Fl = r),
          (Il = t),
          (Y = n),
          _l.setStage(Y),
          xu());
      },
    }));
