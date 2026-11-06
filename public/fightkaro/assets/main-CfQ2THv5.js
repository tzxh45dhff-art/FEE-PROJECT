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
  Q as x,
  R as S,
  S as ee,
  T as te,
  U as ne,
  V as C,
  W as re,
  X as ie,
  Y as ae,
  Z as oe,
  _ as se,
  a as ce,
  at as le,
  b as ue,
  c as de,
  ct as fe,
  d as pe,
  dt as me,
  et as he,
  f as w,
  ft as T,
  g as ge,
  h as _e,
  i as ve,
  it as ye,
  j as be,
  k as xe,
  l as Se,
  lt as E,
  m as Ce,
  n as we,
  nt as Te,
  o as Ee,
  ot as De,
  p as Oe,
  pt as ke,
  q as Ae,
  r as je,
  rt as D,
  s as Me,
  st as Ne,
  t as Pe,
  tt as Fe,
  u as Ie,
  ut as Le,
  v as Re,
  w as ze,
  x as O,
  y as Be,
  z as k,
} from "./three-CJyKo-TQ.js";
var Ve = `G-8K3H62CSPH`,
  He = null;
function Ue(e) {
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
function We() {}
function A(e, t) {
  if (typeof window < `u` && He)
    try {
      He(`event`, e, t ?? {});
    } catch {}
}
function Ge(e) {
  A(`page_view`, {
    page_title: e,
    page_location: `${location.origin}${location.pathname}#${e}`,
  });
}
var Ke = (e) => Math.round((performance.now() - e) / 1e3),
  qe = 1 / 60,
  j = 6.5,
  Je = 0.72,
  Ye = 1.85,
  Xe = 0.62,
  Ze = { legs: 0.2, torso: 0.26, head: 0.16 },
  Qe = 0.52,
  $e = 0.15,
  et = 1.2,
  tt = 2.6,
  nt = 0.45,
  rt = 0.45,
  it = 0.07,
  at = 0.97,
  ot = 1.2,
  st = 0.3,
  ct = null;
function lt() {
  if (ct) return ct;
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
    (ct = new _e(e)),
    (ct.userData.shared = !0),
    ct
  );
}
function M(e, t, n = 1) {
  let r = new le(
    new De({
      map: lt(),
      color: e,
      transparent: !0,
      opacity: n,
      blending: 2,
      depthWrite: !1,
    }),
  );
  return (r.scale.setScalar(t), r);
}
var ut = 3e3,
  dt = class {
    constructor(t) {
      (e(this, `points`, void 0),
        e(this, `pos`, new Float32Array(ut * 3)),
        e(this, `col`, new Float32Array(ut * 3)),
        e(this, `size`, new Float32Array(ut)),
        e(this, `alpha`, new Float32Array(ut)),
        e(this, `vel`, new Float32Array(ut * 3)),
        e(this, `life`, new Float32Array(ut)),
        e(this, `maxLife`, new Float32Array(ut)),
        e(this, `grav`, new Float32Array(ut)),
        e(this, `drag`, new Float32Array(ut)),
        e(this, `baseSize`, new Float32Array(ut)),
        e(this, `cursor`, 0),
        e(this, `tmpColor`, new Be()));
      let n = new Ce();
      (n.setAttribute(`position`, new Oe(this.pos, 3)),
        n.setAttribute(`color`, new Oe(this.col, 3)),
        n.setAttribute(`size`, new Oe(this.size, 1)),
        n.setAttribute(`alpha`, new Oe(this.alpha, 1)));
      let r = new Fe({
        uniforms: { map: { value: lt() } },
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
      ((this.points = new Ae(n, r)),
        (this.points.frustumCulled = !1),
        t.add(this.points));
    }
    emit(e, t) {
      this.tmpColor.set(t.color);
      for (let n = 0; n < t.count; n++) {
        let n = this.cursor;
        this.cursor = (this.cursor + 1) % ut;
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
      for (let t = 0; t < ut; t++) {
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
  ft = new T(0, 0.3, 0),
  pt = new x(0.6, 0.8, 48),
  mt = class {
    constructor(t) {
      (e(this, `scene`, void 0),
        e(this, `particles`, void 0),
        e(this, `waves`, []),
        e(this, `sparkDir`, new T()),
        (this.scene = t),
        (this.particles = new dt(t)));
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
        dir: ft,
        spread: 1.4,
      });
    }
    shockwave(e, t, n, r, i = !1) {
      let a = new S(
        pt,
        new k({
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
  N =
    typeof window < `u` &&
    ((window.matchMedia(`(pointer: coarse)`).matches &&
      (navigator.maxTouchPoints ?? 0) > 0) ||
      new URLSearchParams(window.location.search).get(`mobile`) === `1`),
  ht =
    typeof navigator < `u` &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === `MacIntel` &&
        (navigator.maxTouchPoints ?? 0) > 1)),
  gt =
    typeof window < `u` &&
    (window.matchMedia(`(display-mode: fullscreen)`).matches ||
      window.matchMedia(`(display-mode: standalone)`).matches ||
      navigator.standalone === !0);
function _t() {
  return window.matchMedia(`(orientation: portrait)`).matches;
}
function vt() {
  N &&
    (document.documentElement.classList.add(`touch`),
    document.addEventListener(`contextmenu`, (e) => e.preventDefault()),
    document.addEventListener(`gesturestart`, (e) => e.preventDefault()),
    document.addEventListener(`dblclick`, (e) => e.preventDefault(), {
      passive: !1,
    }),
    yt());
}
function yt() {
  if (!ht || gt) return;
  document.documentElement.classList.add(`ios-scroll`);
  let e = document.getElementById(`ios-swipe`),
    t = !1,
    n = !1,
    r = 0,
    i = () => {
      let i = !_t(),
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
async function bt() {
  if (parent !== window) return; // Huddle owns fullscreen.

  if (N) {
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
function xt(e) {
  if (!N) return;
  let t = window.matchMedia(`(orientation: portrait)`);
  t.addEventListener(`change`, () => e(t.matches));
}
function St(e) {
  if (N)
    try {
      navigator.vibrate?.(e);
    } catch {}
}
var Ct = (e, t = 0.85, n = 0) =>
  new C({ color: e, roughness: t, metalness: n });
function wt(e) {
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
function Tt(e, t, n, r, i, a, o, s, c = 0) {
  let l = new S(new w(t, n, r), i);
  return (l.position.set(a, o, s), (l.rotation.y = c), e.add(l), l);
}
function Et(e, t, n, r, i, a) {
  let o = new S(new O(t, t, 0.1, 14), n);
  ((o.rotation.x = Math.PI / 2), o.position.set(r, i, a), e.add(o));
}
function Dt(e, t) {
  let n = new y(),
    r = Ct(9067058);
  (Tt(n, 1.8, 0.12, 1, r, 0, 0.75, 0),
    Tt(n, 1.8, 0.18, 0.06, r, 0, 0.88, 0.47),
    Tt(n, 1.8, 0.18, 0.06, r, 0, 0.88, -0.47));
  for (let e of [-0.45, 0.45]) Et(n, 0.36, Ct(2829099), -0.25, 0.36, e);
  (Tt(n, 0.06, 0.06, 1.1, r, -1.15, 0.8, 0),
    Tt(n, 0.5, 0.05, 0.05, r, -1, 0.8, 0.5),
    Tt(n, 0.5, 0.05, 0.05, r, -1, 0.8, -0.5));
  let i = Ct(e, 0.6),
    a = new D(0.11, 8, 6),
    o = new be(a, i, 40),
    s = new g();
  for (let e = 0; e < 40; e++) {
    let t = Math.random() * 0.7,
      n = Math.random() * Math.PI * 2;
    (s.setPosition(
      Math.cos(n) * t * 1.1,
      0.88 + (0.7 - t) * 0.35 + Math.random() * 0.05,
      Math.sin(n) * t * 0.55,
    ),
      o.setMatrixAt(e, s));
  }
  (n.add(o), Tt(n, 0.04, 1.3, 0.04, Ct(6710886), 0.6, 1.45, 0));
  let c = new S(new ue(1, 0.4, 8), Ct(t, 0.9));
  return (c.position.set(0.6, 2.15, 0), n.add(c), n);
}
function Ot() {
  let e = new y(),
    t = Ct(3116858, 0.5, 0.2),
    n = Ct(16040960, 0.6),
    r = Ct(1907997, 0.7);
  (Tt(e, 1.6, 0.55, 1.2, t, 0, 0.6, 0),
    Tt(e, 0.55, 0.75, 0.9, t, 0.95, 0.75, 0));
  let i = new S(new O(0.45, 0.45, 0.9, 12, 1, !1, 0, Math.PI), t);
  return (
    (i.rotation.x = Math.PI / 2),
    (i.rotation.z = -Math.PI / 2),
    i.position.set(1.22, 0.75, 0),
    e.add(i),
    Tt(e, 1.9, 0.12, 1.3, n, 0.15, 1.65, 0),
    Tt(e, 1.6, 0.9, 0.06, r, -0.05, 1.15, 0.6),
    (Tt(e, 1.6, 0.9, 0.06, r, -0.05, 1.15, -0.6).visible = !1),
    Tt(e, 0.06, 0.95, 1.2, r, -0.75, 1.15, 0),
    Tt(e, 0.05, 0.55, 0.8, Ct(11065599, 0.1, 0.1), 1.25, 1.35, 0),
    Et(e, 0.28, r, 1.15, 0.28, 0),
    Et(e, 0.28, r, -0.5, 0.28, 0.6),
    Et(e, 0.28, r, -0.5, 0.28, -0.6),
    e
  );
}
function kt(e, t) {
  let n = new y(),
    r = Ct(e, 0.95),
    i = new S(new ge(0.17, 0.5, 4, 8), r);
  ((i.rotation.z = Math.PI / 2), (i.position.y = t ? 0.17 : 0.48), n.add(i));
  let a = new S(new D(0.15, 10, 8), r);
  (a.position.set(0.42, t ? 0.22 : 0.68, 0), n.add(a));
  let o = new S(new w(0.16, 0.09, 0.1), r);
  (o.position.set(0.56, t ? 0.19 : 0.64, 0), n.add(o));
  for (let e of [-0.07, 0.07]) {
    let r = new S(new ue(0.05, 0.12, 4), Ct(3811868, 0.95));
    (r.position.set(0.4, t ? 0.35 : 0.81, e), n.add(r));
  }
  let s = new S(new O(0.025, 0.04, 0.35, 5), r);
  if (
    (s.position.set(-0.45, t ? 0.2 : 0.62, 0),
    (s.rotation.z = t ? 1.4 : 0.7),
    n.add(s),
    !t)
  )
    for (let [e, t] of [
      [0.25, 0.09],
      [0.25, -0.09],
      [-0.25, 0.09],
      [-0.25, -0.09],
    ]) {
      let i = new S(new O(0.04, 0.035, 0.34, 5), r);
      (i.position.set(e, 0.17, t), n.add(i));
    }
  return n;
}
function At(e) {
  let t = [15902389, 16175979, 6539200, 12048746, 15899227, 14141680, 16771e3],
    n = Ct(2762272, 0.6),
    r = Ct(14209216, 0.9),
    i = Ct(1842204, 0.6),
    a = new w(0.9, 1, 0.1),
    o = [],
    s = -34,
    c = 0;
  for (; s < 34;) {
    let n = 4 + Math.random() * 3,
      a = 2 + Math.floor(Math.random() * 3),
      l = a * 3,
      u = -17 - Math.random() * 2;
    Tt(e, n, l, 6, Ct(t[c % t.length], 0.95), s + n / 2, l / 2, u);
    for (let t = 0; t < a; t++) {
      Tt(e, n * 0.9, 0.15, 1, r, s + n / 2, t * 3 + 2.3, u + 3.4);
      for (let e = 0; e < Math.floor(n / 1.6); e++)
        o.push(new T(s + 0.9 + e * 1.6, t * 3 + 1.6, u + 3.02));
    }
    let d = new S(new O(0.55, 0.55, 1.1, 12), i);
    (d.position.set(s + n * 0.6, l + 0.55, u), e.add(d), (s += n + 0.3), c++);
  }
  let l = new be(a, n, o.length),
    u = new g();
  (o.forEach((e, t) => l.setMatrixAt(t, u.makeTranslation(e.x, e.y, e.z))),
    e.add(l));
  let d = Ct(7827560, 0.8),
    f = [-24, -12, 0, 12, 24];
  for (let t of f) Tt(e, 0.18, 8, 0.18, d, t, 4, -11);
  let p = new b({ color: 1118481 });
  for (let t = 0; t < f.length - 1; t++)
    for (let n = 0; n < 4; n++) {
      let r = new T(f[t], 7.4 - n * 0.25, -11),
        i = new T(f[t + 1], 7.4 - n * 0.2, -11),
        a = r
          .clone()
          .lerp(i, 0.5)
          .add(new T(0, -0.9 - Math.random() * 0.8, 0)),
        o = new ae(r, a, i).getPoints(16);
      e.add(new v(new Ce().setFromPoints(o), p));
    }
  for (let [t, n, r, i, a] of [
    [-9, -8, 0.3, 16747039, 14169130],
    [7.5, -9, -0.25, 6012730, 3108820],
    [-17, -10.5, 0.1, 15088186, 15909424],
  ]) {
    let o = Dt(i, a);
    (o.position.set(t, 0, n), (o.rotation.y = r), e.add(o));
  }
  for (let [t, n, r] of [
    [13, -10, -0.5],
    [-4, -12, 0.35],
    [19, -12.5, 3],
  ]) {
    let i = Ot();
    (i.position.set(t, 0, n), (i.rotation.y = r), e.add(i));
  }
  for (let [t, n, r, i, a] of [
    [-6.5, -5.2, 0.5, 13146714, !0],
    [10.5, -6, -2.2, 7031342, !1],
    [3, -7.5, 2.6, 15259312, !0],
  ]) {
    let o = kt(i, a);
    (o.position.set(t, 0, n), (o.rotation.y = r), e.add(o));
  }
  let m = new be(new w(0.22, 0.02, 0.16), Ct(16777215, 0.9), 120),
    h = [15328470, 14039594, 3112916, 15909424, 6076508, 16777215],
    _ = new ie(),
    y = new T(1, 1, 1);
  for (let e = 0; e < 120; e++) {
    let t = new T(
      (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 20),
      0.02,
      -4 - Math.random() * 10,
    );
    (_.setFromAxisAngle(new T(0, 1, 0), Math.random() * 3),
      m.setMatrixAt(e, u.compose(t, _, y)),
      m.setColorAt(e, new Be(h[e % h.length])));
  }
  e.add(m);
  let x = new C({ color: 3815999, roughness: 0.05, metalness: 0.3 });
  for (let [t, n, r] of [
    [-11, -4.5, 1.2],
    [9, -5, 0.9],
    [-2, -9, 1.5],
  ]) {
    let i = new S(new Re(r, 18), x);
    ((i.rotation.x = -Math.PI / 2),
      i.scale.set(1.4, 1, 1),
      i.position.set(t, 0.03, n),
      e.add(i));
  }
}
function jt() {
  return typeof window > `u`
    ? !1
    : new URLSearchParams(location.search).get(`diwali`) !== `0`;
}
var Mt = jt(),
  Nt = {
    skyTop: 263450,
    skyMid: 1840968,
    skyBottom: 5188698,
    fog: 1709360,
    fogNear: 30,
    fogFar: 95,
    sunColor: 16767400,
    sunIntensity: 1.5,
    hemiSky: 8025288,
    hemiGround: 3810328,
    hemiIntensity: 1.05,
    sunDiscColor: 16774880,
    exposure: 1.15,
  },
  Pt = {
    modi: {
      intro: `Mitron, Shubh Deepavali!`,
      win: `Is Diwali, vikas ka diya jala!`,
    },
    rahul: {
      intro: `Happy Diwali! Pyaar ki dukaan mein mithai bhi hai!`,
      win: `Nafrat nahi, ladoo baanto!`,
    },
    didi: {
      intro: `Shubho Deepaboli! Khela hobe!`,
      win: `Diwali-te jeet amar!`,
    },
    trump: {
      intro: `Happy Diwali! The biggest Diwali ever!`,
      win: `Tremendous Diwali! Tariff on sadness!`,
    },
    yogi: {
      intro: `Deepotsav ki shubhkaamnayein!`,
      win: `Diye bhi jalenge, bulldozer bhi chalega!`,
    },
    nitin: {
      intro: `Diwali pe sadak bhi chamkegi!`,
      win: `Expressway jaisi Diwali, bina toll ke!`,
    },
    ravi: {
      intro: `Diwali mein bhi paisa follow karta hai!`,
      win: `Sutti Babu ne Diwali loot li!`,
    },
    lalu: {
      intro: `Diwali pe gaadi time pe!`,
      win: `Ladoo khao, agli gaadi se ghar jao!`,
    },
    mbapu: {
      intro: `Diwali ki shubhkaamnayein, beta.`,
      win: `Andhere pe roshni ki jeet.`,
    },
  };
function Ft(e) {
  return Mt && e === `sansad`;
}
function It(e, t, n) {
  return Mt ? (Pt[e]?.[t] ?? n) : n;
}
var Lt = [
  `Mithai le lo! Kaju katli!`,
  `Ladoo garam garam!`,
  `Diwali special: chai + mithai!`,
  `Soan papdi bhi hai!`,
];
function Rt(e) {
  return Mt && Math.random() < 0.75
    ? Lt[Math.floor(Math.random() * Lt.length)]
    : e;
}
var zt = [16765803, 16734810, 5963658, 7317759, 16743136, 16777215, 16752704],
  Bt = class {
    constructor(t, n = N ? 6 : 12) {
      (e(this, `parent`, void 0),
        e(this, `bursts`, []),
        e(this, `n`, void 0),
        (this.parent = t),
        (this.n = N ? 46 : 90));
      for (let e = 0; e < n; e++) {
        let e = new Float32Array(this.n * 3),
          n = new Ce().setAttribute(`position`, new Oe(e, 3)),
          r = new Ae(
            n,
            new m({
              map: lt(),
              color: 16777215,
              size: 0.5,
              transparent: !0,
              opacity: 0,
              blending: 2,
              depthWrite: !1,
              fog: !1,
              toneMapped: !1,
            }),
          );
        ((r.frustumCulled = !1),
          (r.visible = !1),
          t.add(r),
          this.bursts.push({
            points: r,
            pos: e,
            vel: new Float32Array(this.n * 3),
            age: 0,
            life: 1,
            gravity: 2,
            drag: 1,
            live: !1,
          }));
      }
    }
    burst(e, t = {}) {
      let n =
          this.bursts.find((e) => !e.live) ??
          this.bursts.reduce((e, t) =>
            t.age / t.life > e.age / e.life ? t : e,
          ),
        r = t.speed ?? 6,
        i = t.up ?? 0;
      for (let t = 0; t < this.n; t++) {
        ((n.pos[t * 3] = e.x),
          (n.pos[t * 3 + 1] = e.y),
          (n.pos[t * 3 + 2] = e.z));
        let a, o, s;
        if (i > 0) {
          let e = Math.random() * Math.PI * 2,
            t = Math.random() * 0.35;
          ((a = Math.cos(e) * t), (s = Math.sin(e) * t), (o = 1));
        } else {
          let e = Math.random() * 2 - 1,
            t = Math.random() * Math.PI * 2,
            n = Math.sqrt(1 - e * e);
          ((a = Math.cos(t) * n), (o = e), (s = Math.sin(t) * n));
        }
        let c =
          r *
          (i > 0
            ? i * (0.6 + Math.random() * 0.5)
            : 0.75 + Math.random() * 0.25);
        ((n.vel[t * 3] = a * c),
          (n.vel[t * 3 + 1] = o * c),
          (n.vel[t * 3 + 2] = s * c));
      }
      let a = n.points.material;
      (a.color.setHex(t.color ?? zt[Math.floor(Math.random() * zt.length)]),
        (a.size = t.size ?? 0.5),
        (n.age = 0),
        (n.life = t.life ?? 1.6),
        (n.gravity = i > 0 ? 7 : 2.2),
        (n.drag = i > 0 ? 0.6 : 1.4),
        (n.live = !0),
        (n.points.visible = !0),
        (n.points.geometry.attributes.position.needsUpdate = !0));
    }
    update(e) {
      for (let t of this.bursts) {
        if (!t.live) continue;
        t.age += e;
        let n = t.age / t.life;
        if (n >= 1) {
          ((t.live = !1), (t.points.visible = !1));
          continue;
        }
        let r = Math.exp(-t.drag * e);
        for (let n = 0; n < this.n; n++)
          ((t.vel[n * 3] *= r),
            (t.vel[n * 3 + 1] = t.vel[n * 3 + 1] * r - t.gravity * e),
            (t.vel[n * 3 + 2] *= r),
            (t.pos[n * 3] += t.vel[n * 3] * e),
            (t.pos[n * 3 + 1] += t.vel[n * 3 + 1] * e),
            (t.pos[n * 3 + 2] += t.vel[n * 3 + 2] * e));
        ((t.points.geometry.attributes.position.needsUpdate = !0),
          (t.points.material.opacity =
            (1 - n) ** 1.4 * (0.75 + 0.25 * Math.sin(t.age * 40))));
      }
    }
    dispose() {
      for (let e of this.bursts)
        (this.parent.remove(e.points),
          e.points.geometry.dispose(),
          e.points.material.dispose());
    }
  },
  Vt = class {
    constructor(t, n) {
      (e(this, `audio`, void 0),
        e(this, `fw`, void 0),
        e(this, `v`, new T()),
        (this.audio = n),
        (this.fw = new Bt(t, N ? 6 : 10)));
    }
    knockout(e, t) {
      t &&
        (this.fw.burst(this.v.set(e, 2.2, 0.3), {
          color: 16765803,
          speed: 5,
          size: 0.28,
          life: 1.4,
        }),
        this.audio.pataka(),
        [0.2, 0.55, 0.9, 1.4, 1.9, 2.5, 3.1].forEach((t, n) => {
          window.setTimeout(() => {
            this.fw.burst(
              this.v.set(e + ((n % 3) - 1) * 5, 8.5 + (n % 3) * 1.5, -8),
              { speed: 8, size: 0.55, life: 1.8 },
            );
          }, t * 1e3);
        }));
    }
    superEnd() {
      for (let e of [-5.6, 5.6])
        this.fw.burst(this.v.set(e, 0.1, 1.5), {
          color: 16760906,
          speed: 9,
          size: 0.18,
          life: 1.3,
          up: 1,
        });
    }
    update(e) {
      this.fw.update(e);
    }
    dispose() {
      this.fw.dispose();
    }
  },
  Ht = [16773572, 16765803, 16752704, 16742970];
function Ut(e, t, n) {
  let r = new Ce()
      .setAttribute(`position`, new l(e, 3))
      .setAttribute(`color`, new l(t, 3)),
    i = new Ae(
      r,
      new m({
        map: lt(),
        size: n,
        vertexColors: !0,
        transparent: !0,
        blending: 2,
        depthWrite: !1,
        fog: !1,
      }),
    );
  return ((i.frustumCulled = !1), i);
}
function Wt(e, t, n, r, i, a) {
  e.push(n, r, i);
  let o = new Be(Ht[a % Ht.length]);
  t.push(o.r, o.g, o.b);
}
function Gt() {
  let e = [
    [0, 0],
    [0.07, 0.005],
    [0.1, 0.03],
    [0.11, 0.055],
    [0.1, 0.06],
  ].map(([e, t]) => new me(e, t));
  return new _(e, 14);
}
var Kt = class {
    constructor(t, n) {
      (e(this, `root`, new y()),
        e(this, `flames`, []),
        e(this, `lanterns`, []),
        e(this, `sparklers`, []),
        e(this, `fairy`, []),
        e(this, `sky`, void 0),
        e(this, `sparks`, void 0),
        e(this, `nextBurst`, 1),
        e(this, `v`, new T()),
        t.add(this.root));
      let r = new C({
          color: 11817770,
          emissive: 3805702,
          emissiveIntensity: 0.6,
          roughness: 0.85,
        }),
        i = Gt(),
        a = N ? 12 : 16;
      for (let e of [3.7, -3.7])
        for (let t = 0; t < a; t++) {
          let n = -7.4 + (14.8 * t) / (a - 1),
            o = new S(i, r);
          o.position.set(n, 0.005, e);
          let s = M(16754240, 0.28, 0.95);
          s.position.set(n, 0.14, e);
          let c = M(16774352, 0.1, 1);
          (c.position.set(0, -0.01, 0),
            s.add(c),
            this.root.add(o, s),
            this.flames.push(s));
        }
      let o = [],
        s = [],
        c = 0;
      for (let [e, t, n] of [
        [15.7, 6.35, 72],
        [13.3, 8.9, 60],
      ])
        for (let r = 0; r < n; r++) {
          let i = (r / n) * Math.PI * 2;
          Wt(o, s, 0 + Math.cos(i) * e, t, -34 + Math.sin(i) * e, c++);
        }
      for (let e = 0; e < 10; e++) {
        let t = (e / 10) * Math.PI * 2;
        for (let e = 0; e <= 10; e++) {
          let n = (e / 10) * (Math.PI / 2);
          Wt(
            o,
            s,
            0 + Math.cos(t) * Math.cos(n) * 5.05,
            8.8 + Math.sin(n) * 5.05,
            -34 + Math.sin(t) * Math.cos(n) * 5.05,
            c++,
          );
        }
      }
      let l = Ut(o, s, 0.9);
      (this.root.add(l), this.fairy.push(l));
      let u = [
          [-10.5, 3.5],
          [-8, -5],
          [-5, -8],
          [5, -8],
          [8, -5],
          [10.5, 3.5],
        ],
        d = [],
        f = [],
        p = [16726843, 16756768, 16734920, 3920239, 16769126, 5941503];
      for (let e = 0; e < u.length - 1; e++) {
        let [t, n] = u[e],
          [r, i] = u[e + 1];
        for (let a = 0; a <= 16; a++) {
          let o = a / 16,
            s = Math.sin(o * Math.PI) * 0.7;
          Wt(d, f, t + (r - t) * o, 5.3 - s, n + (i - n) * o, a + e);
        }
        let a = new y();
        a.position.set((t + r) / 2, 4.6 - 0.7, (n + i) / 2);
        let o = p[e % p.length],
          s = new S(
            new ne(0.32),
            new C({
              color: o,
              emissive: o,
              emissiveIntensity: 0.9,
              roughness: 0.6,
              transparent: !0,
              opacity: 0.92,
            }),
          );
        s.scale.set(1, 1.25, 1);
        let c = M(o, 1.5, 0.55),
          l = new S(new O(0.008, 0.008, 0.7, 4), new k({ color: 2236962 }));
        ((l.position.y = 0.6), a.add(s, c, l));
        for (let e of [-0.12, 0, 0.12]) {
          let t = new S(new O(0.012, 0.004, 0.3, 4), new k({ color: o }));
          (t.position.set(e, -0.52, 0), a.add(t));
        }
        (this.root.add(a), this.lanterns.push(a));
      }
      let m = Ut(d, f, 0.45);
      (this.root.add(m), this.fairy.push(m));
      let h = n.filter((e) => e.y < 0.5),
        g = Math.max(1, Math.floor(h.length / (N ? 10 : 22)));
      for (let e = 0; e < h.length; e += g) {
        let t = h[e],
          n = M(16773552, 0.4, 0.9);
        (n.position.set(t.x + (t.x > 0 ? -0.25 : 0.25), t.y + 1.55, t.z),
          this.root.add(n),
          this.sparklers.push(n));
      }
      ((this.sky = new Bt(this.root, N ? 4 : 8)),
        (this.sparks = new Bt(this.root, N ? 3 : 6)));
    }
    update(e, t) {
      if (this.root.parent?.visible) {
        (this.flames.forEach((t, n) => {
          let r =
            0.85 +
            0.15 * Math.sin(e * 11 + n * 1.7) +
            0.06 * Math.sin(e * 23 + n);
          t.scale.set(0.24 * r, 0.32 * r, 1);
        }),
          this.lanterns.forEach((n, r) => {
            ((n.rotation.z = Math.sin(e * 1.3 + r) * 0.08),
              (n.rotation.y += t * 0.4));
          }),
          this.sparklers.forEach((t, n) => {
            t.scale.setScalar(0.3 + 0.2 * Math.abs(Math.sin(e * 17 + n * 2.3)));
          }));
        for (let t of this.fairy)
          t.material.opacity = 0.8 + 0.2 * Math.sin(e * 3);
        if (((this.nextBurst -= t), this.nextBurst <= 0)) {
          this.nextBurst = 0.9 + Math.random() * 1.6;
          let e = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 11);
          (this.sky.burst(
            this.v.set(e, 6 + Math.random() * 3, -15 - Math.random() * 4),
            { speed: 6 + Math.random() * 2.5, size: 0.85, life: 2.1 },
          ),
            Math.random() < 0.3 &&
              this.sky.burst(this.v.set(-e * 0.8, 7 + Math.random() * 2, -17), {
                speed: 5.5,
                size: 0.8,
                life: 2,
              }));
        }
        if (Math.random() < (N ? 0.04 : 0.08) && this.sparklers.length) {
          let e =
            this.sparklers[Math.floor(Math.random() * this.sparklers.length)];
          this.sparks.burst(e.position, {
            color: 16773552,
            speed: 1.6,
            size: 0.08,
            life: 0.5,
          });
        }
        (this.sky.update(t), this.sparks.update(t));
      }
    }
    dispose() {
      (this.sky.dispose(),
        this.sparks.dispose(),
        this.root.parent?.remove(this.root));
    }
  },
  qt = {
    sansad: { name: `SANSAD BHAVAN`, subtitle: `Parliament at sunset` },
    jantar: { name: `JANTAR MANTAR`, subtitle: `Protest ground, New Delhi` },
    road: { name: `DESI SADAK`, subtitle: `Gali, thela aur traffic` },
  },
  Jt = {
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
function Yt(e, t, n) {
  let r = document.createElement(`canvas`);
  ((r.width = e), (r.height = t), n(r.getContext(`2d`)));
  let a = new _e(r);
  return ((a.colorSpace = i), (a.anisotropy = 4), a);
}
function Xt(e, t, n, r, i) {
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
function Zt(e, t, n, r) {
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
function Qt(e, t, n, r) {
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
function $t() {
  return Yt(1024, 1024, (e) => {
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
    Zt(e, 512, 512, 70);
  });
}
function en() {
  return Yt(1024, 1024, (e) => {
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
    Qt(e, 512, 512, 52);
  });
}
function tn() {
  return new Fe({
    side: 1,
    depthWrite: !1,
    uniforms: {
      top: { value: new Be() },
      mid: { value: new Be() },
      bottom: { value: new Be() },
    },
    vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vPos;
      void main(){ float h = vPos.y; vec3 c = h > 0.12 ? mix(mid, top, smoothstep(0.12, 0.6, h)) : mix(bottom, mid, smoothstep(-0.05, 0.12, h));
      gl_FragColor = vec4(c, 1.0); }`,
  });
}
function nn() {
  return Yt(192, 128, (e) => {
    ((e.fillStyle = `#ff9933`),
      e.fillRect(0, 0, 192, 43),
      (e.fillStyle = `#ffffff`),
      e.fillRect(0, 43, 192, 42),
      (e.fillStyle = `#138808`),
      e.fillRect(0, 85, 192, 43),
      Xt(e, 96, 64, 17, `#000080`));
  });
}
function rn(e, t, n) {
  return Yt(256, 160, (r) => {
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
var an = [
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
    { pool: `ravi`, text: `SUTTI BABU`, bg: `#8b5cf6`, fg: `#ffffff` },
    { pool: `ravi`, text: `SUPERSTAR!`, bg: `#ffffff`, fg: `#6d28d9` },
    { pool: `ravi`, text: `MEME KING`, bg: `#1f2a4a`, fg: `#ffd23f` },
    { pool: `lalu`, text: `RAIL RAJA`, bg: `#16a34a`, fg: `#ffffff` },
    { pool: `lalu`, text: `KULHAD CHAI`, bg: `#ffd21f`, fg: `#5a2a0a` },
    { pool: `lalu`, text: `SUPERFAST!`, bg: `#7a1010`, fg: `#ffd23f` },
    { pool: `mbapu`, text: `SHANTI`, bg: `#ffd700`, fg: `#1a1000` },
    { pool: `mbapu`, text: `SABAR RAKHO`, bg: `#ffffff`, fg: `#b8860b` },
    { pool: `mbapu`, text: `MBAPU! MBAPU!`, bg: `#b8860b`, fg: `#ffffff` },
  ],
  on = 0.45,
  sn = class {
    constructor(t, n) {
      (e(this, `scene`, void 0),
        e(this, `renderer`, void 0),
        e(this, `group`, new y()),
        e(this, `diwali`, void 0),
        e(this, `themeGroups`, {
          sansad: new y(),
          jantar: new y(),
          road: new y(),
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
        e(this, `dummy`, new f()),
        e(this, `sky`, tn()),
        e(this, `sunDisc`, void 0),
        e(this, `groundMat`, new C({ roughness: 1 })),
        e(this, `floorMat`, new C({ roughness: 0.45, metalness: 0.05 })),
        e(this, `platformSideMat`, new C({ roughness: 0.8 })),
        e(this, `floorTextures`, void 0),
        e(this, `sun`, void 0),
        e(this, `hemi`, void 0),
        e(this, `excitement`, 0),
        e(this, `mood`, 0),
        e(this, `stage`, `sansad`),
        (this.scene = t),
        (this.renderer = n),
        t.add(this.group),
        (t.fog = new c(16777215, 30, 80)),
        this.group.add(
          this.themeGroups.sansad,
          this.themeGroups.jantar,
          this.themeGroups.road,
        ),
        this.group.add(new S(new D(140, 32, 16), this.sky)),
        (this.sunDisc = new S(
          new Re(4, 32),
          new k({ color: 16777215, fog: !1 }),
        )),
        this.group.add(this.sunDisc),
        (this.hemi = new xe(16777215, 4473924, 1)),
        this.group.add(this.hemi),
        (this.sun = new s(16777215, 2.6)),
        (this.sun.castShadow = !0));
      let r = N ? 1024 : 2048;
      this.sun.shadow.mapSize.set(r, r);
      let i = this.sun.shadow.camera;
      ((i.left = -11),
        (i.right = 11),
        (i.top = 8),
        (i.bottom = -6),
        (i.near = 1),
        (i.far = 45),
        (this.sun.shadow.bias = -4e-4),
        (this.sun.shadow.normalBias = 0.02),
        this.group.add(this.sun));
      let a = new s(9417983, 1.1);
      (a.position.set(4, 6, -10), this.group.add(a));
      let o = new S(new Re(130, 48), this.groundMat);
      ((o.rotation.x = -Math.PI / 2),
        (o.position.y = -0.31),
        (o.receiveShadow = !0),
        this.group.add(o),
        (this.floorTextures = { sansad: $t(), jantar: en(), road: wt(Yt) }));
      for (let e of Object.values(this.floorTextures)) n?.initTexture(e);
      let l = j * 2 + 2.5,
        u = this.platformSideMat,
        p = new S(new w(l, 0.3, 8), [u, u, this.floorMat, u, u, u]);
      ((p.position.y = -0.15), (p.receiveShadow = !0), this.group.add(p));
      let m = new be(
          new D(0.07, 8, 6),
          new C({ color: 16747546, roughness: 0.9 }),
          240,
        ),
        h = 0;
      for (let e = 0; e < 120; e++) {
        let t = -l / 2 + (e / 119) * l;
        for (let n of [4.02, -4.02])
          (this.dummy.position.set(
            t,
            -0.08 - Math.abs(Math.sin(e * 0.5)) * 0.08,
            n,
          ),
            this.dummy.updateMatrix(),
            m.setMatrixAt(h, this.dummy.matrix),
            m.setColorAt(h, new Be(e % 3 == 0 ? 16765466 : 16742928)),
            h++);
      }
      (this.group.add(m),
        this.buildSansad(this.themeGroups.sansad),
        this.buildJantarMantar(this.themeGroups.jantar),
        At(this.themeGroups.road),
        (this.crowd = new be(
          new ge(0.22, 0.5, 4, 8),
          new C({ roughness: 0.9 }),
          420,
        )),
        (this.crowdHeads = new be(
          new D(0.16, 10, 8),
          new C({ roughness: 0.8 }),
          420,
        )));
      let g = [
          16750899, 16777215, 1280008, 3054591, 14688650, 16765503, 11022898,
          7031766,
        ],
        _ = [9263675, 11565650, 13210736, 7226668];
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
          this.crowd.setColorAt(e, new Be(g[e % g.length])),
          this.crowdHeads.setColorAt(e, new Be(_[e % _.length])));
      }
      ((this.crowdHeights = new Float32Array(420)),
        (this.crowd.frustumCulled = !1),
        (this.crowdHeads.frustumCulled = !1),
        this.group.add(this.crowd, this.crowdHeads));
      for (let e = 0; e < 5; e++)
        for (let t of [-1, 1]) {
          let n = new S(
            new w(0.9, 0.45, 12),
            new C({ color: 8154204, roughness: 1 }),
          );
          (n.position.set(t * (8.5 + e * 0.9), e * 0.45 - 0.3, -2),
            (n.receiveShadow = !0),
            this.group.add(n));
        }
      (this.buildPlacards(this.group, 420), this.buildBoredFans(420));
      for (let e = 0; e < 14; e++) {
        let e = M(16777215, 0.9, 0);
        ((e.visible = !1),
          this.group.add(e),
          this.flashes.push({ s: e, life: 0 }));
      }
      let v = nn();
      for (let [e, t] of [
        [-8, -5],
        [8, -5],
        [-5, -8],
        [5, -8],
        [-10.5, 3.5],
        [10.5, 3.5],
      ]) {
        let n = new S(
          new O(0.05, 0.06, 6, 8),
          new C({ color: 14540253, metalness: 0.6, roughness: 0.3 }),
        );
        (n.position.set(e, 2.7, t), (n.castShadow = !0), this.group.add(n));
        let r = new d(1.8, 1.2, 16, 8);
        r.translate(0.9, 0, 0);
        let i = new S(r, new C({ map: v, side: 2, roughness: 0.8 }));
        (i.position.set(e + 0.05, 5, t),
          this.group.add(i),
          this.flags.push({
            mesh: i,
            base: Float32Array.from(r.attributes.position.array),
            phase: Math.random() * 6,
          }));
      }
      ((this.diwali = Mt
        ? new Kt(this.themeGroups.sansad, this.crowdData)
        : null),
        this.setStage(`sansad`));
    }
    theme(e) {
      return Mt && e === `sansad` ? { ...Jt[e], ...Nt } : Jt[e];
    }
    setStage(e) {
      this.stage = e;
      let t = this.theme(e);
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
      let t = new C({ color: 14264186, roughness: 0.85 }),
        n = new C({ color: 11763287, roughness: 0.9 }),
        r = new y();
      (r.position.set(0, -0.3, -34), e.add(r));
      let i = new S(new O(15.8, 16.2, 1.2, 64), n);
      ((i.position.y = 0.6), r.add(i));
      let a = new S(new O(13.8, 13.8, 7.5, 64), n);
      ((a.position.y = 4.4), r.add(a));
      let o = new be(new O(0.28, 0.32, 5.2, 10), t, 144),
        s = new f();
      for (let e = 0; e < 144; e++) {
        let t = (e / 144) * Math.PI * 2;
        (s.position.set(Math.cos(t) * 15, 3.8, Math.sin(t) * 15),
          s.updateMatrix(),
          o.setMatrixAt(e, s.matrix));
      }
      r.add(o);
      let c = new S(new O(15.6, 15.6, 0.6, 64), t);
      ((c.position.y = 6.6), r.add(c));
      let l = new S(new O(13, 13.4, 2.2, 64), t);
      ((l.position.y = 8), r.add(l));
      let u = new S(new D(5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), n);
      ((u.position.y = 9.1), (u.scale.y = 0.45), r.add(u));
      let d = new S(new O(0.08, 0.08, 4, 6), t);
      ((d.position.y = 12.5), r.add(d));
      let p = new C({ color: 13208674, roughness: 0.9 }),
        m = new y();
      (m.position.set(24, -0.3, -46), (m.rotation.y = -0.4), e.add(m));
      for (let e of [-1, 1]) {
        let t = new S(new w(3, 14, 3), p);
        (t.position.set(e * 4, 7, 0), m.add(t));
      }
      let g = new S(new w(11.5, 4, 3.2), p);
      ((g.position.y = 15.5), m.add(g));
      let _ = new S(new E(2.5, 0.6, 8, 24, Math.PI), p);
      ((_.position.y = 11.5), m.add(_));
      let v = new S(new O(1.6, 2.2, 1.5, 24), p);
      ((v.position.y = 18.2), m.add(v));
      let b = new C({ color: 15259320, roughness: 0.6 }),
        x = new C({ color: 13936192, roughness: 0.35, metalness: 0.7 });
      for (let t of [-j - 1.6, j + 1.6]) {
        let n = -3.2,
          r = new S(new O(0.28, 0.36, 6, 16), b);
        (r.position.set(t, 3, n), (r.castShadow = !0), e.add(r));
        let i = new S(new O(0.5, 0.3, 0.6, 16), x);
        (i.position.set(t, 6.3, n), e.add(i));
        for (let r = 0; r < 4; r++) {
          let i = new S(new D(0.22, 10, 8), x),
            a = (r / 4) * Math.PI * 2;
          (i.position.set(t + Math.cos(a) * 0.25, 6.8, n + Math.sin(a) * 0.25),
            e.add(i));
        }
        let a = new h(16756832, 6, 9, 2);
        (a.position.set(t, 6.8, -2.6), (a.userData.keepLight = !0), e.add(a));
      }
    }
    buildJantarMantar(e) {
      let t = new C({ color: 12867391, roughness: 0.85 }),
        n = new C({ color: 13658703, roughness: 0.85 }),
        r = new C({ color: 15854560, roughness: 0.7 }),
        i = new C({ color: 15392712, roughness: 0.8, side: 2 }),
        a = 4.6,
        o = Math.atan2(13, 24),
        s = new y();
      (s.position.set(0, -0.3, -26), (s.rotation.y = Math.PI / 2), e.add(s));
      let c = new Te();
      (c.moveTo(0, 0), c.lineTo(24, 0), c.lineTo(24, 13), c.lineTo(0, 0));
      let l = new te(c, { depth: a, bevelEnabled: !1 });
      l.translate(0, 0, -4.6 / 2);
      let u = new S(l, t);
      ((u.castShadow = !0), (u.receiveShadow = !0), s.add(u));
      let d = new be(new w(24 / 46, 13 / 46, 2.4), r, 46);
      for (let e = 0; e < 46; e++)
        (this.dummy.position.set(
          (e + 0.5) * (24 / 46),
          (e + 0.5) * (13 / 46) + 0.02,
          0,
        ),
          this.dummy.rotation.set(0, 0, 0),
          this.dummy.scale.set(1, 1, 1),
          this.dummy.updateMatrix(),
          d.setMatrixAt(e, this.dummy.matrix));
      s.add(d);
      let f = Math.hypot(24, 13);
      for (let e of [1, -1]) {
        let t = new S(new w(f, 0.35, 0.3), r);
        (t.position.set(12, 6.75, e * (a / 2 - 0.15)),
          (t.rotation.z = o),
          s.add(t));
      }
      let p = new y();
      (p.position.set(22.4, 13, 0), s.add(p));
      for (let [e, t] of [
        [-1, -1.6],
        [1, -1.6],
        [-1, 1.6],
        [1, 1.6],
      ]) {
        let r = new S(new w(0.35, 2.2, 0.35), n);
        (r.position.set(e, 1.1, t), p.add(r));
      }
      let m = new S(new w(2.8, 0.35, 4), r);
      ((m.position.y = 2.3), p.add(m));
      let g = new S(new D(1.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), r);
      ((g.position.y = 2.45), p.add(g));
      let _ = 6.2,
        v = new Te();
      for (let e = 0; e <= 24; e++) {
        let t = -Math.PI / 2 + (e / 24) * (Math.PI / 2),
          n = [
            Math.cos(t) * 7.1000000000000005,
            Math.sin(t) * 7.1000000000000005,
          ];
        e === 0 ? v.moveTo(n[0], n[1]) : v.lineTo(n[0], n[1]);
      }
      for (let e = 24; e >= 0; e--) {
        let t = -Math.PI / 2 + (e / 24) * (Math.PI / 2);
        v.lineTo(Math.cos(t) * _, Math.sin(t) * _);
      }
      let b = new te(v, { depth: 3.2, bevelEnabled: !1, curveSegments: 24 });
      b.translate(0, 0, -1.6);
      let x = new T(Math.cos(o), Math.sin(o), 0),
        ee = new T(-Math.sin(o), Math.cos(o), 0);
      for (let e of [1, -1]) {
        let t = new T(24 * 0.4, 5.2, (a / 2) * e),
          i = new S(b, [n, r]),
          o = new T(0, 0, e),
          c = x.clone().multiplyScalar(e);
        ((i.matrixAutoUpdate = !1),
          i.matrix.makeBasis(o, ee, c).setPosition(t),
          (i.castShadow = !0),
          s.add(i));
      }
      for (let a of [-1, 1]) {
        let o = new y();
        (o.position.set(a * 19, -0.3, -18), e.add(o));
        let s = 4.6,
          c = new S(new O(s, 4.8999999999999995, 0.6, 40), i);
        ((c.position.y = 0.3), o.add(c));
        for (let e = 0; e < 12; e++) {
          let n = (e / 12) * Math.PI * 2,
            r = new S(new w(0.9, 6.2, 0.9), t);
          (r.position.set(Math.cos(n) * s, 3.4, Math.sin(n) * s),
            (r.rotation.y = -n),
            (r.castShadow = !0),
            o.add(r));
        }
        for (let e of [3.2, 6.4]) {
          let t = new S(
            new O(5.1, 5.1, e > 5 ? 0.6 : 0.4, 40, 1, !0),
            e > 5 ? r : n,
          );
          ((t.material.side = 2), (t.position.y = e), o.add(t));
        }
        let l = new S(new O(0.35, 0.45, 6.4, 16), r);
        ((l.position.y = 3.5), o.add(l));
      }
      for (let n of [-1, 1]) {
        let a = new y();
        (a.position.set(n * 6.5, -0.3, -12.5), e.add(a));
        let o = new S(
          new D(2.6, 36, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
          i,
        );
        ((o.position.y = 0.9), a.add(o));
        let s = new S(new O(2.85, 2.95, 1, 40, 1, !0), t);
        ((s.material.side = 2), (s.position.y = 0.5), a.add(s));
        let c = new S(new E(2.85, 0.13, 8, 48), r);
        ((c.rotation.x = Math.PI / 2), (c.position.y = 1), a.add(c));
        for (let e of [0, Math.PI / 2]) {
          let t = new S(new O(0.025, 0.025, 5.7, 6), r);
          ((t.rotation.z = Math.PI / 2),
            (t.rotation.y = e),
            (t.position.y = 1.15),
            a.add(t));
        }
        let l = new S(new E(0.22, 0.04, 6, 16), r);
        ((l.rotation.x = Math.PI / 2), (l.position.y = 1.15), a.add(l));
      }
      let ne = new C({ color: 12081990, roughness: 0.95 }),
        re = new S(new w(90, 1.4, 0.5), ne);
      (re.position.set(0, 0.4, -52), e.add(re));
      let ie = new C({ color: 5913894, roughness: 1 }),
        ae = [4160046, 4950580, 3500840].map(
          (e) => new C({ color: e, roughness: 0.95 }),
        ),
        oe = [];
      for (let e = 0; e < 22; e++) {
        let e = (Math.random() - 0.5) * 100,
          t = -30 - Math.random() * 20;
        Math.abs(e) < 9 || oe.push([e, t]);
      }
      for (let e of [-1, 1])
        for (let t of [-6, -11, 2]) oe.push([e * (27 + Math.random() * 6), t]);
      for (let [t, n] of oe) {
        let r = 2.5 + Math.random() * 2,
          i = new S(new O(0.2, 0.3, r, 8), ie);
        (i.position.set(t, r / 2 - 0.3, n), e.add(i));
        let a = ae[Math.floor(Math.random() * ae.length)];
        for (let i = 0; i < 3; i++) {
          let i = new S(new D(1.4 + Math.random() * 0.8, 12, 10), a);
          (i.position.set(
            t + (Math.random() - 0.5) * 1.6,
            r + Math.random() * 1.2 - 0.3,
            n + (Math.random() - 0.5) * 1.6,
          ),
            e.add(i));
        }
      }
      let se = new C({ color: 12563877, roughness: 1 });
      for (let t = 0; t < 40; t++) {
        let n = 4 + Math.random() * 8,
          r = 6 + Math.random() * 22,
          i = new S(new w(n, r, 5), se);
        (i.position.set(
          -100 + t * 5 + Math.random() * 3,
          r / 2 - 0.3,
          -80 - Math.random() * 15,
        ),
          e.add(i));
      }
      let ce = Yt(512, 160, (e) => {
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
        le = new S(new w(5.2, 1.6, 0.2), [
          ne,
          ne,
          ne,
          ne,
          new C({ map: ce, roughness: 0.7 }),
          ne,
        ]);
      (le.position.set(0, 1.25, -21), e.add(le));
      for (let t of [-1, 1]) {
        let n = new S(new w(0.15, 1, 0.15), ne);
        (n.position.set(t * 2.2, 0.2, -21), e.add(n));
      }
      for (let n of [-j - 1.6, j + 1.6]) {
        let i = -3.2,
          a = new S(new w(0.7, 5.6, 0.7), t);
        (a.position.set(n, 2.8, i), (a.castShadow = !0), e.add(a));
        let o = new S(new w(1.2, 0.3, 1.2), r);
        (o.position.set(n, 5.75, i), e.add(o));
        let s = new S(new D(0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), r);
        (s.position.set(n, 5.9, i), e.add(s));
        let c = new h(16767392, 4, 8, 2);
        (c.position.set(n, 5.3, -2.6), (c.userData.keepLight = !0), e.add(c));
      }
    }
    buildPlacards(e, t) {
      let n = [];
      for (let e = 3; e < t; e += 6) n.push(e);
      let r = new d(0.8, 0.5);
      r.translate(0, 0.95, 0);
      for (let t of an) {
        let i = new be(
          r,
          new C({ map: rn(t.text, t.bg, t.fg), side: 2, roughness: 0.8 }),
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
        an.forEach((t, r) => {
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
      ((this.phones = new be(
        new w(0.07, 0.13, 0.015),
        new C({
          color: 1118481,
          roughness: 0.3,
          emissive: 3832789,
          emissiveIntensity: 0.4,
        }),
        t,
      )),
        (this.samosas = new be(
          new ue(0.07, 0.11, 3),
          new C({ color: 14263361, roughness: 0.7 }),
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
        r = new g().makeScale(0, 0, 0);
      for (let i = 0; i < this.holders.length; i++) {
        let a = this.holders[i],
          o = this.targetSlogan(a);
        a.flip <= 0 &&
          a.cur !== o &&
          (a.delay < 0 && (a.delay = Math.random() * 1.2),
          (a.delay -= t),
          a.delay <= 0 && ((a.next = o), (a.flip = on), (a.delay = -1)));
        let s = 1;
        if (a.flip > 0) {
          a.flip -= t;
          let e = 1 - a.flip / on;
          (e >= 0.5 && a.cur !== a.next && (a.cur = a.next),
            (s = Math.max(0.02, Math.abs(Math.cos(e * Math.PI)))));
        }
        let c = this.crowdData[a.ci],
          l = an[a.cur].pool !== `neutral`,
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
        r = new g().makeScale(0, 0, 0);
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
      let t = this.theme(this.stage);
      ((this.sun.intensity = t.sunIntensity * (1 - e * 0.75)),
        (this.hemi.intensity = t.hemiIntensity * (1 - e * 0.7)));
    }
    update(e, t) {
      (this.diwali?.update(e, t),
        (this.excitement = Math.max(0, this.excitement - t * 0.6)));
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
  cn = `/fightkaro/assets/modi-R8FpxZEb.mp3`,
  ln = `/fightkaro/assets/rahul-C7Jjp4hs.mp3`,
  un = `/fightkaro/assets/didi-CjTHLKgc.mp3`,
  dn = `/fightkaro/assets/trump-Czs6_rQc.mp3`,
  fn = `/fightkaro/assets/yogi-CJEN4Csa.mp3`,
  pn = `/fightkaro/assets/nitin-B2ZG9HV5.mp3`,
  mn = `/fightkaro/assets/mbapu-D85PVY1T.mp3`,
  hn = `/fightkaro/assets/ravi-BUhOMgaW.mp3`,
  gn = `/fightkaro/assets/lalu-vVsgGZuo.mp3`,
  _n = `/fightkaro/assets/nirmala-Dq7cz8UN.mp3`,
  vn = `/fightkaro/assets/raviwin-Q4j69frZ.mp3`,
  yn = `/fightkaro/assets/gulaam-BnDUPSAr.mp3`,
  bn = `/fightkaro/assets/portal-voice-CC4H9Es4.mp3`,
  xn = `/fightkaro/assets/mbapuintro-BI_jQwTJ.mp3`,
  Sn = `/fightkaro/assets/intro-CxITfm7k.mp3`,
  Cn = `/fightkaro/assets/background-sFl8lOjr.mp3`,
  wn = `/fightkaro/assets/battle-CqvMijZR.mp3`,
  Tn = {
    modi: cn,
    rahul: ln,
    didi: un,
    trump: dn,
    yogi: fn,
    nitin: pn,
    mbapu: mn,
    ravi: hn,
    lalu: gn,
  },
  En = _n,
  Dn = { ravi: vn },
  On = xn,
  kn = bn,
  An = yn,
  jn = 1.43,
  Mn = {
    intro: { url: Sn, level: 2.2 },
    background: { url: Cn, level: 3 },
    battle: { url: wn, level: 1.242 },
  },
  Nn = `huddle-fightkaro:bapu-v1`,
  Pn = `#carry=`,
  Fn = () => ({
    streak: 0,
    unlocked: !1,
    bestSeconds: 0,
    bestDamage: 0,
    peaceWins: 0,
    portalSeen: !1,
  }),
  In = () => {
    try {
      return typeof localStorage > `u` ? null : localStorage;
    } catch {
      return null;
    }
  };
function Ln(e = In()) {
  try {
    let t = JSON.parse(e?.getItem(Nn) ?? `null`);
    return { ...Fn(), ...t };
  } catch {
    return Fn();
  }
}
function Rn(e, t) {
  (e.unlocked || (e.unlocked = t.unlocked),
    (e.bestSeconds = Math.max(e.bestSeconds, t.bestSeconds)),
    (e.bestDamage = Math.max(e.bestDamage, t.bestDamage)),
    (e.peaceWins = Math.max(e.peaceWins, t.peaceWins)),
    e.portalSeen || (e.portalSeen = t.portalSeen));
}
function zn(e, t = In()) {
  try {
    (Rn(e, Ln(t)), t?.setItem(Nn, JSON.stringify(e)));
  } catch {}
}
function Bn(e, t = In()) {
  if (!e.startsWith(Pn)) return !1;
  try {
    let n = JSON.parse(decodeURIComponent(e.slice(7))),
      r = n[Nn] ? JSON.parse(n[Nn]) : null;
    if (r) {
      let e = Ln(t);
      ((e.streak = Math.max(e.streak, Number(r.streak) || 0)),
        Rn(e, { ...Fn(), ...r }),
        zn(e, t));
    }
    for (let [e, r] of Object.entries(n))
      e !== Nn &&
        e.startsWith(`huddle-fightkaro:`) &&
        t?.getItem(e) == null &&
        t?.setItem(e, r);
  } catch {}
  return !0;
}
var Vn = (e) => !e.unlocked && e.streak >= 2;
function Hn(e, t) {
  return e.unlocked || ((e.streak = t ? e.streak + 1 : 0), e.streak < 3)
    ? !1
    : ((e.unlocked = !0), !0);
}
function Un(e, t, n) {
  ((e.bestSeconds = Math.max(e.bestSeconds, Math.round(t))),
    (e.bestDamage = Math.max(e.bestDamage, Math.round(n))));
}
var Wn = 0.35;
function Gn(e, t, n = 0.003) {
  for (let r = 0; r < e.length; r++)
    if (Math.abs(e[r]) > n) return Math.max(0, r / t - 0.01);
  return 0;
}
var Kn = class t {
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
                lead: Gn(t.getChannelData(0), t.sampleRate),
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
          a.gain.linearRampToValueAtTime(1, n + Wn),
          a.gain.setValueAtTime(1, n + r - Wn),
          a.gain.linearRampToValueAtTime(0, n + r),
          i.connect(a).connect(e.gain),
          i.start(n, t.lead, r),
          (i.onended = () => {
            a.disconnect();
            let t = e.sources.indexOf(i);
            t >= 0 && e.sources.splice(t, 1);
          }),
          e.sources.push(i),
          (e.nextStart = n + r - Wn));
      }
    }
  },
  qn = `/fightkaro/assets/aloolelo-BopBNjJr.mp3`,
  Jn = `/fightkaro/assets/bed_bulldozer-BE_e8yDo.mp3`,
  Yn = `/fightkaro/assets/bed_chakra-CjyFjT3l.mp3`,
  Xn = `/fightkaro/assets/bed_jadu-jl3ElSBF.mp3`,
  Zn = `/fightkaro/assets/bed_tariff-CLVTzIAp.mp3`,
  Qn = `/fightkaro/assets/bell-DW1wbKh0.mp3`,
  $n = `data:audio/mpeg;base64,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`,
  er = `/fightkaro/assets/bomb-1fSoTLVm.mp3`,
  tr = `/fightkaro/assets/boom-Brg2wdT5.mp3`,
  nr = `/fightkaro/assets/camera_clicks-DJHuyBDj.mp3`,
  rr = `/fightkaro/assets/chai_ting-Q1sP8TcN.mp3`,
  ir = `/fightkaro/assets/charge_chakra-1s5EOYKm.mp3`,
  ar = `/fightkaro/assets/charkha-ze2BHoz_.mp3`,
  or = `/fightkaro/assets/coins-DVYyL0Kv.mp3`,
  sr = `/fightkaro/assets/cow_bell-Cj3rAWh8.mp3`,
  cr = `/fightkaro/assets/crate_crash-Cr6VTWOz.mp3`,
  lr = `/fightkaro/assets/cup_break-BgaQYkuS.mp3`,
  ur = `/fightkaro/assets/drone-DhDpKSwO.mp3`,
  dr = `/fightkaro/assets/drumroll-BzHoJfte.mp3`,
  fr = `/fightkaro/assets/engine_loop-D0YGxkt_.mp3`,
  pr = `/fightkaro/assets/eye_zing-qZiVqGmG.mp3`,
  mr = `data:audio/mpeg;base64,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`,
  hr = `data:audio/mpeg;base64,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`,
  gr = `data:audio/mpeg;base64,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`,
  _r = `data:audio/mpeg;base64,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`,
  vr = `data:audio/mpeg;base64,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`,
  yr = `/fightkaro/assets/horn_long-dLtoq4Pf.mp3`,
  br = `data:audio/mpeg;base64,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`,
  xr = `/fightkaro/assets/jingle_lose-gAS4mNKd.mp3`,
  Sr = `/fightkaro/assets/jingle_win-DqlQ62Fq.mp3`,
  Cr = `/fightkaro/assets/kaching-wbD5pe6-.mp3`,
  wr = `/fightkaro/assets/metal_crunch-DdbVoplE.mp3`,
  Tr = `/fightkaro/assets/moo-C_6f5G0B.mp3`,
  Er = `/fightkaro/assets/news_sting-C-mndS4t.mp3`,
  Dr = `/fightkaro/assets/pataka-DtLTRxFJ.mp3`,
  Or = `/fightkaro/assets/pen_scribble-BM1Jp2uD.mp3`,
  kr = `data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYzLjEuMTAyAAAAAAAAAAAAAAD/+1DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAwAAAqbACcnJycnJycnOjo6Ojo6OjpOTk5OTk5OTmJiYmJiYmJiYnZ2dnZ2dnZ2iYmJiYmJiYmdnZ2dnZ2dnZ2xsbGxsbGxscTExMTExMTE2NjY2NjY2NjY7Ozs7Ozs7Oz//////////wAAAABMYXZjNjMuMS4AAAAAAAAAAAAAAAAkBaIAAAAAAAAKm4OuVY4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAAAAABpBQAACI/Qh+DPHAA/zAOAWFgIDBnMCNJYyz/LfuOYgQDJgPgG/9NOCQCcVwfg/DYFOLwkYMCSEPvxkAsRAz+e+Ih6gkJX+PkzDCA1IlwXF/7GDQgTeNhuNBqhMc/9XdGJoxQ0VEhuUBYev/3MMXnntHiQ6WJjccEVBEHv//MMY89+26GGECBxpcaHuNTkB4NP////Zv///8qIpxJAAkko4gQAAAAMDgLoxtyVzCfCNNTkcQwbhDTSGHqAw45gKgDmEqCOnqPCP/7UsQVgA40hR0554ABnpmnK7SAAIbGQHAMBwW9W13wBYGakjq/AlxzluO1rUP/CMFQZI42zD6X/9SrSgYnXrj4//7PBjvI0S3wdBwCN/QfBxD4a/jkNU7/+q1wAABANu20Tb0EAYCpDK+xGHZK+7fw47lfKhZ21+H42AEEQOwXh/ANBEBWAACAXKFDOK0qXuK0T3gUHC4eDhcXtERIIFEqXvd3d/fSpd3tKREl30QXPuFjgIHAQE4e+IDhQM+IIP1HOlXRZJk1G0mD3CNKaWhr//tSxAaADCjXVUeYb/Fxk+kk9hkXm+zluVYuqFwVKwPn1ySKOHk9cCZRRJiKQdggwSs8K5ps3y37P4sJH1CZIuj9ug27SyZd7TlcXUUdEZAvpsKzavTx6thFIJ2gN6ElXLV75EI1Sl9CYBJABVGCjAXENQ9zDUhpqUkI4xQbByLR/bIZwCnwclNyYc0Ov13aKitXlxV1kxSDarXj61RML8H+iJeQl/0eWA64nEWP3ZV/D+/enDHmruhuz+1yaGYd+rezQtviBKUu/O0gwiRvDib/+1LEBYMLzGs+Z7DMiXiKZ02GGZkQqivDHPUTVTAfxYCRBkcryeajwvIardBTZmD6e8Z1my/yFbTTqeVDpd5shEwkm42wvPG9DR51l2B1IgT9Wn9Nqdfb+4TX296/7sF9++7Wdb///2ACpLwz9CUX2gF21pjoBtw8xiqEkmstpasMCxoMAlgNzk1JzqpdjEBkmYeIoohKk3SylAt2UGwN42colx3c0CTM4Ca0GddjTrPWQe/P5Tq+e6/+t+zPkcrlf7ysHnDqf+LK0aO5VHKX5f/7UsQFAAts90bHpGr5XJXnDPMOEIOUoYJ7DfKt5OAUCyx4XKoi4wRtsBVYCca6oQ4cZHYqx8ZiQwqCK1cjUrqJUqW66NSqnvtodKH+RQ/8HfdHL87K4gvr9ybJYk3yb49lnNTWv0AS5N8uB+EBUhfw8kyF3MgLgfR3F+BCF5Ig/zkUCtcbWNoQCBGkKCGrdRxFdYlJUdvWHsqu38pEQHsW2f/qWFQStJYwA3Pze8aRGBoylmUqUkWsRzKpzroAFJwBmSeUqWHG3q3tqWWS+b8t//tSxAmASzSTLmwwbwlaFiWk8w5Qsv9gKZScLwrNXCJbwPqEo1k09JzV6RJ+LKHaWV/O3nkQNgjE4pt5gBndPdipKJN8AC9YnHfOrrvF33m3x+qfqb7n/f57D+QACAASASg8wVjwhZCWsSVWEzAoC7l+FUX18hhSHk+YDkM1WOBMmeLFqQrJg2VkWS0xohAmPd0yuCPyY6gpAcFFdXQrnMgZmpoyaHjLEoIm9Eo0u9dx5NUAlS2goCckkiFUmjLMwpBwFWJoghzKIXJDDLEeMqv/+1LEDwMJ8GEwZ6RuwUEOZImEmglpPRN6H0mpXyzWQnf4QIhQkDoaCcq0s1x5g4iVlwwH4RLiO4IAU+PPIoW0ZaLdvo9pEAGAXGv1FdYZfy1QuOB0ekvAIQ46a2gnS2YMvlpsdV0/8vDIpEpIWPjqy5ocJJhpOS8i4CTy429hsqzVcXap7xpbHrnVnOcyUjc/s2fVLM/pIADN4IwL+UWBaJmGeGacI7yCJ0V9TC6i5H6Wj8A/gTqRtUcghKVrHrVAmysxqToqvrkrlyPeMqtrTP/7UsQdAQpghSbHsM5BTg3jhYYaER7yJ1pZpM2GRwqaDtZ00ho4tVvrcp+eaqoOB0I2wZkOgYOlSDBGIycaTgoMLQAREwVIJAoeNNR6Z60d+APD+NDhNGYkl4kofIBi866A2oJQXEMUln1eoIvIZ4+kfhZ7bAF78mF5af9v1/trv7UAYAicMQO11LYQHbR4maPShsXtISSlEYCYhkIeXAaH4lByLTwPDEvLzhITA04okkRB31JM+8N8GY3vjb70nrUBX4Qag5sWtGb0AUPl8AxH//tSxCeDCRxpHEwwzMlAEWOI9g2okkAjKEDCE3CBA3D2ihzkEFf4VhAGJVdPywpLq31taJm0Tahey5iu37+OVlyW27olSf0SyjTmvTUhYuKiK3v//R9F37KrtXu7+1YA5czJrSRS9k0EXkWkaAsAAhWqFhuwt5QyAp6bnGLMxaCs7HklsLhGMgdTVi60L0fQKUo1tT2L04s4oKCjRaLSFO1K9SF3/9f//V//3ChhhhkOZBukTBepHtIkfBKwFdNx2WdL7glJwlmQmFQgoLZkWhL/+1LEOQNJnHMWLDEwQR6PooWGDdhLC/zpccd6wCWmqL4VHGQ0qw4kFQXYNpe0jaT0b0G2//X+ijAOMHMc4IwAXxRDSwCIgmw5QgQEoFrNRuExBFUtNaoBkZOEBcdL0hZh60PAVFmlP6YnJSTqLOPgzHjRG48daaxqRouZY22jcj7P9l3jknBEDpAD5KenUSUQRFKRONgBI13k4kSAm8MDT9ctq6Pz3iWS5bzyPy0h//PKf/8t/+0BKVCGkYLecA+OHyUVCI6QI4JrFThxeE0sMv/7UsRMg4lkbxAHsM7Az4hiCMMJkFaz1YKDjpyy0v/+WfyyVP5Z//9WX4oYGDBOthrEIoLVCwr/FRbFhf+sUb/XxVv+ykxBTUU0LjCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tSxGsDyTC2ykekY4AAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=`,
  Ar = `/fightkaro/assets/poof-BlJFjDeg.mp3`,
  jr = `/fightkaro/assets/release_bulldozer-CyubjB_l.mp3`,
  Mr = `/fightkaro/assets/release_chakra-BvOYn27E.mp3`,
  Nr = `/fightkaro/assets/release_jadu-BVQ3aIZ7.mp3`,
  Pr = `/fightkaro/assets/release_tariff-DZ1JBEzs.mp3`,
  Fr = `/fightkaro/assets/reverse_beeps-DaQ4ZZDr.mp3`,
  Ir = `/fightkaro/assets/shimmer-XQUc4lgS.mp3`,
  Lr = `data:audio/mpeg;base64,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`,
  Rr = `data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYzLjEuMTAyAAAAAAAAAAAAAAD/+1DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAUAAATkAFVVVVVVVVVVVVVVVVVVVVVVVVV/f39/f39/f39/f39/f39/f39/f6qqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dX//////////////////////////wAAAABMYXZjNjMuMS4AAAAAAAAAAAAAAAAkA78AAAAAAAAE5ArY6YUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAACTCS4RQTAAGfI6u3CtAARAAIA3pGNkNkAEY934iM/u//4z/vviIchhMBplAAIkADDwGF0QIINER7u2JhYEBoPuB8LAgUOCf9EP3fyjgwXej5//5D/8o4MLG38HP4/H4/H4/A4GAY4nW4gGoXcdLUIyCRqWhmYIyBj3VTUgBeFR8d9E1WyRoaOCsgtwwIlosFo1Mggt3k00GEEYJIcbuy/s2kMOXiTJUl0ur/8pD0WdOLJNJH///LD7GJuHzgD//6lYzdu2UTAAEolf/7UsQEgArEs1P9hAAhhhSlUAekcD+1bNSCZ1/XidWWx7cpjbT0qgQcJwAo5jrlvta4Zl1Fa5VVblaWJiGtaq//mqbVovXprtu+4KeExYkn4i3sikr/I88g6RnZL1Rv3870AJxgAjNYsiuZZT/OMcMIWUNEkR+HFBgIuiIUKyNZERCMEe0AzbKhMCIEpoYIgSLmBUaZZlopQoVpX1kW/Jer8pR9+aFMNDgmIiIMipyZZgqMOjyD1p8OiasJKBU7PHv8WHrLueMBgGtM+xjMng6s//tSxAaDyrCnFgC9KYF6pGJBRhZo+pEXXY5ThdIp0xninijIlVIhUismEyT1lyp40q5p6jPaauMYSylpf7KV3nkqGQSEoqGihUVSaT1EqZuKi0S6aipMj7dV6tP+pTvdBJ0TEfgashHiZcZOqgnlo7EweNFRKJ5sUgGmb93hwbWRPPGKxY3droDyX5ef+j93c6FiFhmemLee20NXU51Jc87mkXOdSNdX2b6l6bpd0r/HBPS/NUKd+JEff/TVYAAAAHRrqOXSLoCmD0tnqXbxiPH/+1LECgHLAJsXCDBtgV2U4sBsINCEr0NUhweuWPUIlDc3ZEdtesm/HmrkOlaVo8O9CpY1z4b9yVxJwkMXA0LGhiBRRcm8BBFTGdMcwz2uQihafldBeP9H7XTMNpEmCROIwMZJoWP/cFR4qVbKy7S4PB8cIooERQRbg8xQPA2FzFNHrE2Yd1jTW3QcU6XS1axaPXF5IqdU54VUfgm4R2jHlmG2AKROhUrTVTYp3////QogQDN+UmvZaRqyyyH6/6r8AjwodOkohqeysNWal6PuXP/7UsQQAQaMSQ7AhGABKIzPSBAJyfSeWKniXI/2fhoS1na5HiVwiVs9wIDKZGRkZGeRkZdUVFT/0MUMDBAwMR///aaaVP//qqqqrppppqqqqr/6f///lVVVQSVph0VVVVW/tP//6RVVVV00001VVVV000w6TEFNRTQuMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`,
  zr = `/fightkaro/assets/stamp_slam-CAslQB_C.mp3`,
  Br = `data:audio/mpeg;base64,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7USYNc6CEVsQ06D6D5oMnBgxvyP078Z0IP/v//dfru5t/zv39n7pffx3FUaNz+YaDDVrJ/2/tmuhnGb/+1LEvYIG0A8bLRkgIT8E4QHEjAlOAAwgCAzHrfRNAZOZRXzY0oiL8tj+GZcUSXbnwd8u9WVuHyQiTU3LIaL0QcxaB2p31qvvCw4YIrmmUO07NaRW56ZqmRlKf/kv/zK+ZdMp+RzM4RdznZ9jnxxS4acTtUZDAACABTlCVicPTtu9hvPLWsu6/fGh+ua0tjrGtp9KiYT7HylgV6V2t3zLCQOmii1odhFhZXMq6K8NAkoO/9Ln+dH39/+18vVc3+Y7bzNgv8ovbr9+wzm+PxD7uf/7UsTYAgoEFQgNmEBJPhthYbMMCCPGGP6Y2HrOCS9mwDEkk5bZsYsskdSvzJrEga7kAwm0cWa2CHaO+Icbo9rPD2ocYuocadcfPmihosPiJ1zYiJ3UT0z7U0yeqmo9GDyTzRakLhF5Y00KUoh0sbUTfPW+NSs/FMOfc/PHxPJ/Z3vo5L5fn4ZDYi93XxER1Eb73v/98UxFd971NBsasRf////////Xf///////+fD1OEFjIRYzgFcapRg0FAoFM17ml3oO87TWhBQHSShfSRD4//tSxOYACqRvCs0IYAl/sGElowwpEVGIPVBTUgqwnwXoXWUt0kniXD+MCPomJyaqZbaQ0DhLhSJIYZ30lbKXGKPYmkqSI5Spa1Vqf15iTjYkiWJpkTT1JWy76/yRJUnGpONzI+SKRN1V1//81LpqXkTI+ZHzGXTAxPP+32//8yYvJ//0Ao0aKIMLkXJygvdBwGjwKgqsFToNBwRA0sFXgqdLBz+txU7BqHZU6VOwa/90s9WCvU////g1BqVOrDUGlUxBTUU0LjBVVVVVVVVVVVX/+1LE6YAL5PUHFbGAClnBYQM2sAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTMgBIFoQYZtoAA8IIaS54wAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`,
  Vr = `/fightkaro/assets/thunder-BRWemNyY.mp3`,
  Hr = `data:audio/mpeg;base64,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rqTWgn1GpVsxOWk7TuffdUKHxSr5T922xtDndyVptjkod9qW/U0jVQBt3fZ0xMaMyiiUIv58Mzyx7mT/+1LET4MIkF8QI2jjwRyMIcG3iWAPzKx9b0mV9+986C0uuyxOnM191X/vAW76mbF/5Dd6KffIiVL9x2B4IBtSmj/WOVjDCH1IFgNbC38aXvsrM16tGz/O//f3u9et/dR9jNn/QsAGVelAriegPsUOa4yDlbmIZX518q+LaMPbMPbva7+jdu2fZ/b9n2/R9318VEAIUSXG5lHwp1l9Jvei0T8KAG+NfVl5Z7ZLIZ7O/0ffs+7206GbtC/yvQVLs6LL7TfmqgGDNf7wxgJwM2z2C//7UsRngQakXRrB4aLAtgejWDyUWA1PlgbV86+jZKP3V69ORyOT3/t2M27Nn2Iuqp9fna3/q+uAAAgQa8zIbABPAaS3rR/CbB9u8ueq5QdyUSuxL87Dvz30KPfkee+7vqfI/orh1Z2SLeJiv+DTy1VMQU1FNC4wVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQMgqzYCBRRZwkaA8DgeD4eGyg2MDYgOLpXS//tSxJQABZgvHyC9ouDKBeMcHBRYaSZRJdILCwt1C4qKioqLNULC4qsVZ/Fhb4rxZuv/txYVFRUVFBb+VFRUVFRYWFhYXFWLFRZMQU1FNC4wVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+1LEwgAFwDEYwL4CAOCE4WQXsFhVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UsTJA8ngPKbDJSTAAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`,
  Ur = `/fightkaro/assets/ui_confirm-DEEar_Kj.mp3`,
  Wr = `/fightkaro/assets/ui_select-DvWPzIZM.mp3`,
  Gr = `data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYzLjEuMTAyAAAAAAAAAAAAAAD/+1DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAQAAAQTAGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZpmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZnMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM/////////////////////////////////wAAAABMYXZjNjMuMS4AAAAAAAAAAAAAAAAkBloAAAAAAAAEE6xvqicAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAAB6CQznQBAAkssGdDBUAARBTUY//tq+p6EIpGU56EyE1OdBbkCCChwNw/xH4Mh/DP/xGGY+AYARz8PwMjnj8HT//5vP///o+AYIjnwMjGNxBk2FmNjMEAJoExHHAN8igKQjjeaHyYPGSKjL5cPF89Z1u/6CSKiKFxqBfGZPfzR0LKoIsr/9b96CFvWVm/+63////////6jioAZoIiAA4AMF1KDM8VLYdQ7wMevA1PQDlpgMiCBu4QVEojMlVkkknqSSqdT6T0UUUUlv/7UsQZAA5hUyPcGgABe6jisB010ImLJF4vJLZJRNkHEYB1QuZJ50n9SLf6SXW3/9qaicJspjMkiXnRRR0Ufv76v/6tSDGhmaF5MxNQV//+YIGgKAgZBDdAAEoJBzzrLAp45J/mhhnyhmuMqCOvGKSvhkv/1+u3/6zo5wkgRICJAdIcJLLdkv//u3/7plwmkkTxhRhRymD737b3//9a0000DYul5Mul0uni8p//+04bBYeCqhkwYAIAru2q6OoxPH0S6H8Ag1A2x0BgqOUdQW7d//tSxA4DScktDQo8WgE/pB9A1Yooa/3e+jvRU751fNW9XksEJFxRr46fv7t///rKgEBEMtdvt/T/vznBBwFAw91Hv3foW6Y9SX+mXTIxMABKBXwChJCZx7K/h3/DnX9RW1rW/y39IrARLEH1/Tt3Q2UpfqUpSldDGf6GMa35jf5jP/RwoePKBpnLO+W5FhJYKgqnJagaDqpMQU1FNC4wqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+1LEHIPAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==`,
  Kr = `data:audio/mpeg;base64,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`,
  qr = `/fightkaro/assets/ko-CYX5YdIq.mp3`,
  Jr = `/fightkaro/assets/fight-BTHw9nHH.mp3`,
  Yr = `/fightkaro/assets/final_round-2ps4Gt_y.mp3`,
  Xr = `/fightkaro/assets/ko-CYX5YdIq.mp3`,
  Zr = `/fightkaro/assets/perfect-Dm5Oy3HT.mp3`,
  Qr = `/fightkaro/assets/round_1-4pTCkOAK.mp3`,
  $r = `/fightkaro/assets/round_2-BIyjSuFz.mp3`,
  ei = `/fightkaro/assets/time_up-Carf_3Z9.mp3`,
  ti = `/fightkaro/assets/you_lose-mLbO-eAT.mp3`,
  ni = `/fightkaro/assets/you_win-DHsvvWFw.mp3`,
  ri = Object.assign({
    "../assets/sfx/aloolelo.mp3": qn,
    "../assets/sfx/bed_bulldozer.mp3": Jn,
    "../assets/sfx/bed_chakra.mp3": Yn,
    "../assets/sfx/bed_jadu.mp3": Xn,
    "../assets/sfx/bed_tariff.mp3": Zn,
    "../assets/sfx/bell.mp3": Qn,
    "../assets/sfx/block.mp3": $n,
    "../assets/sfx/bomb.mp3": er,
    "../assets/sfx/boom.mp3": tr,
    "../assets/sfx/camera_clicks.mp3": nr,
    "../assets/sfx/chai_ting.mp3": rr,
    "../assets/sfx/charge_chakra.mp3": ir,
    "../assets/sfx/charkha.mp3": ar,
    "../assets/sfx/coins.mp3": or,
    "../assets/sfx/cow_bell.mp3": sr,
    "../assets/sfx/crate_crash.mp3": cr,
    "../assets/sfx/cup_break.mp3": lr,
    "../assets/sfx/drone.mp3": ur,
    "../assets/sfx/drumroll.mp3": dr,
    "../assets/sfx/engine_loop.mp3": fr,
    "../assets/sfx/eye_zing.mp3": pr,
    "../assets/sfx/frog.mp3": mr,
    "../assets/sfx/heartbeat.mp3": hr,
    "../assets/sfx/hit_1.mp3": gr,
    "../assets/sfx/hit_2.mp3": _r,
    "../assets/sfx/hit_3.mp3": vr,
    "../assets/sfx/horn_long.mp3": yr,
    "../assets/sfx/horn_short.mp3": br,
    "../assets/sfx/jingle_lose.mp3": xr,
    "../assets/sfx/jingle_win.mp3": Sr,
    "../assets/sfx/kaching.mp3": Cr,
    "../assets/sfx/metal_crunch.mp3": wr,
    "../assets/sfx/moo.mp3": Tr,
    "../assets/sfx/news_sting.mp3": Er,
    "../assets/sfx/pataka.mp3": Dr,
    "../assets/sfx/pen_scribble.mp3": Or,
    "../assets/sfx/plop.mp3": kr,
    "../assets/sfx/poof.mp3": Ar,
    "../assets/sfx/release_bulldozer.mp3": jr,
    "../assets/sfx/release_chakra.mp3": Mr,
    "../assets/sfx/release_jadu.mp3": Nr,
    "../assets/sfx/release_tariff.mp3": Pr,
    "../assets/sfx/reverse_beeps.mp3": Fr,
    "../assets/sfx/shimmer.mp3": Ir,
    "../assets/sfx/slap.mp3": Lr,
    "../assets/sfx/snap.mp3": Rr,
    "../assets/sfx/stamp_slam.mp3": zr,
    "../assets/sfx/thud.mp3": Br,
    "../assets/sfx/thunder.mp3": Vr,
    "../assets/sfx/ui_back.mp3": Hr,
    "../assets/sfx/ui_confirm.mp3": Ur,
    "../assets/sfx/ui_select.mp3": Wr,
    "../assets/sfx/ui_tap.mp3": Gr,
    "../assets/sfx/whoosh.mp3": Kr,
  }),
  ii = Object.assign({
    "../assets/voice/double_ko.mp3": qr,
    "../assets/voice/fight.mp3": Jr,
    "../assets/voice/final_round.mp3": Yr,
    "../assets/voice/ko.mp3": Xr,
    "../assets/voice/perfect.mp3": Zr,
    "../assets/voice/round_1.mp3": Qr,
    "../assets/voice/round_2.mp3": $r,
    "../assets/voice/time_up.mp3": ei,
    "../assets/voice/you_lose.mp3": ti,
    "../assets/voice/you_win.mp3": ni,
  });
function ai(e) {
  let t = new Map();
  for (let [n, r] of Object.entries(e))
    t.set(n.replace(/^.*\/(.+)\.mp3$/, `$1`), r);
  return t;
}
var oi = ai(ri),
  si = ai(ii),
  ci = [
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
    `bomb`,
    `pataka`,
  ],
  li = {
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
    mbapu: [
      `whoosh`,
      `thud`,
      `boom`,
      `slap`,
      `thunder`,
      `eye_zing`,
      `stamp_slam`,
      `drone`,
      `heartbeat`,
      `bell`,
      `shimmer`,
    ],
    ravi: [
      `release_tariff`,
      `reverse_beeps`,
      `eye_zing`,
      `snap`,
      `metal_crunch`,
      `kaching`,
      `coins`,
    ],
    lalu: [
      `release_bulldozer`,
      `horn_long`,
      `horn_short`,
      `engine_loop`,
      `metal_crunch`,
      `thunder`,
    ],
  },
  ui = {
    charge_chakra: 8 / 1.2,
    bed_chakra: 8 / 1.2,
    bed_jadu: 6.45 / 1.2,
    bed_tariff: 5 / 1.2,
    bed_bulldozer: 4.05 / 1.2,
    drumroll: 4.2,
  },
  di = { engine_loop: 1.244 },
  fi = `huddle-fightkaro:muted`;
function pi(e) {
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
var mi = 8,
  hi = 0.03,
  gi = 12.5,
  _i = -2,
  vi = 0.88,
  yi = class {
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
        e(this, `drone`, null),
        e(this, `musicOn`, !0),
        e(this, `muted`, xi()),
        e(this, `gamePaused`, !1),
        e(this, `charkhaV`, null),
        e(this, `clipCache`, new Map()),
        e(this, `fading`, null),
        e(this, `clipBytes`, new Map()),
        e(this, `clipBuffers`, new Map()));
    }
    preloadCommon() {
      this.preloadSfx([...ci, ...[...si.keys()].map((e) => `voice:${e}`)]);
    }
    unlock() {
      if (!this.ctx) {
        let e = window.AudioContext ?? window.webkitAudioContext;
        if (!e) return;
        this.ctx = new e();
        let t = this.ctx.createDynamicsCompressor();
        ((t.threshold.value = _i),
          (t.knee.value = 0),
          (t.ratio.value = 20),
          (t.attack.value = 0.002),
          (t.release.value = 0.1),
          (this.output = this.ctx.createGain()),
          (this.output.gain.value = vi),
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
          (this.music = new Kn(this.ctx, this.musicGain, {
            intro: { ...Mn.intro },
            background: { ...Mn.background },
            battle: { ...Mn.battle },
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
        localStorage.setItem(fi, e ? `1` : `0`);
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
        let e = t.startsWith(`voice:`) ? si.get(t.slice(6)) : oi.get(t);
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
      this.preloadSfx(e.flatMap((e) => li[e] ?? []));
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
      if (i - (this.lastPlayed.get(e) ?? -1) < hi) return null;
      (this.lastPlayed.set(e, i),
        !t.keep &&
          this.voices.length >= mi &&
          this.fadeOut(this.voices.shift(), 0.02));
      let a = n.createBufferSource();
      ((a.buffer = r), (a.playbackRate.value = t.rate ?? 1));
      let o = n.createGain();
      ((o.gain.value = (t.gain ?? 1) * (di[e] ?? 1)),
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
      let r = ui[e] ?? t;
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
      this.play(t, { gain: (0.6 + e * 0.3) / (0.6 + n * 0.3), rate: bi() });
    }
    block() {
      this.play(`block`, { rate: bi() });
    }
    whoosh() {
      this.play(`whoosh`, { rate: bi() });
    }
    thud() {
      this.play(`thud`, { rate: bi() });
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
        rate: bi(),
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
      this.play(`poof`, { rate: bi() });
    }
    frogCroak() {
      this.play(`frog`);
    }
    snap() {
      this.play(`snap`);
    }
    slap(e = 1) {
      this.play(`slap`, { gain: e, rate: bi() });
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
      this.play(`crate_crash`, { rate: bi() });
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
    startDrone() {
      this.stopDrone(0.05);
      let e = this.play(`drone`, { keep: !0, gain: 1e-4 });
      if (!e || !this.ctx) return;
      ((e.src.loop = !0), (e.src.loopStart = 0), (e.src.loopEnd = gi));
      let t = this.ctx.currentTime;
      (e.gain.gain.setValueAtTime(1e-4, t),
        e.gain.gain.linearRampToValueAtTime(1, t + 2.5),
        (this.drone = e));
    }
    setDrone(e, t = 1) {
      let n = this.ctx;
      if (!n || !this.drone) return;
      let r = this.drone.gain.gain,
        i = n.currentTime;
      (r.cancelScheduledValues(i),
        r.setValueAtTime(r.value, i),
        r.linearRampToValueAtTime(e, i + t));
    }
    stopDrone(e = 1) {
      this.drone && (this.fadeOut(this.drone, e), (this.drone = null));
    }
    heartbeat(e = 1) {
      this.play(`heartbeat`, { gain: e });
    }
    bell(e = 1) {
      this.play(`bell`, { gain: e, keep: !0 });
    }
    bombBlast() {
      this.play(`bomb`, { keep: !0 });
    }
    pataka() {
      this.play(`pataka`, { keep: !0 });
    }
    charkha(e = 0.8) {
      (this.stopCharkha(0.05),
        (this.charkhaV = this.play(`charkha`, { keep: !0, gain: e })));
    }
    stopCharkha(e = 0.3) {
      this.charkhaV && (this.fadeOut(this.charkhaV, e), (this.charkhaV = null));
    }
    shimmer(e = 1) {
      this.play(`shimmer`, { gain: e });
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
        Math.max(1e-4, e * (di.engine_loop ?? 1)),
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
        return t >= 0 && t < e.duration ? t * ot : null;
      }
      let t = this.clip;
      return !t || t.paused || t.readyState < 2 ? null : t.currentTime * ot;
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
function bi() {
  return 0.96 + Math.random() * 0.08;
}
function xi() {
  try {
    return localStorage.getItem(fi) === `1`;
  } catch {
    return !1;
  }
}
var Si = class {
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
    snap(e = !1) {
      (this.pos.copy(this.targetPos),
        this.look.copy(this.targetLook),
        e &&
          ((this.camera.fov = this.fovTarget),
          this.camera.updateProjectionMatrix()));
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
  P = {
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
      walkFwd: 2.2,
      walkBack: 1.7,
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1,
      fightClips: !0,
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
      facePhoto: `/fightkaro/faces/modi.webp?v=20261101_smooth`,
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
      walkFwd: 2.35,
      walkBack: 1.8,
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1,
      fightClips: !0,
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
      facePhoto: `/fightkaro/faces/rahul.webp?v=20261101_smooth`,
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
      walkFwd: 2.4,
      walkBack: 1.85,
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1,
      fightClips: !0,
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
      facePhoto: `/fightkaro/faces/didi.webp?v=20261101_smooth`,
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
      walkFwd: 2.1,
      walkBack: 1.65,
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1,
      fightClips: !0,
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
      facePhoto: `/fightkaro/faces/trump.webp?v=20261101_smooth`,
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
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1,
      fightClips: !0,
      moveNames: {
        special1: `BULLDOZER PUNCH!`,
        special2: `DEMOLITION KICK!`,
        finisher: `NON-STOP DOZER COMBO!`,
        sweep: `DOZER SWEEP!`,
        uppercut: `HARD HAT UPPERCUT!`,
        grab: `BULLDOZER SLAM!`,
        roundhouse: `CEMENT ROUNDHOUSE!`,
      },
      superName: `DOZER KA DHAMAKA`,
      superDesc: `Eyes glow red, a bulldozer charges in, raises its front loader bucket and slams it down 3 times on the opponent for 30% damage.`,
      introLine: `Bulldozer taiyaar hai!`,
      winLine: `Kaam chalu, bulldozer chalu!`,
      facePhoto: `/fightkaro/faces/yogi.webp?v=20261101_smooth`,
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
      walkFwd: 2.2,
      walkBack: 1.7,
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1,
      fightClips: !0,
      moveNames: {
        special1: `TOLL TAX UPPERCUT!`,
        special2: `FLYOVER KICK!`,
        finisher: `FULL SPEED COMBO!`,
        sweep: `SPEED BREAKER SWEEP!`,
        uppercut: `UDGHATAN UPPERCUT!`,
        grab: `HIGHWAY TAKEDOWN!`,
        roundhouse: `RING ROAD ROUNDHOUSE!`,
      },
      superName: `GADDHA BLAST`,
      superDesc: `Opens a pothole under the opponent, turns sugarcane into E20 in his machine, pours it in, flicks a matchstick and walks away from the fire, for 30% damage.`,
      introLine: `Toll bharo, aage badho!`,
      winLine: `Highway ban gaya, kaam ho gaya!`,
      facePhoto: `/fightkaro/faces/nitin.webp?v=20261101_smooth`,
      dance: { label: `ZINGAAT!`, colors: [16751135, 16777215, 1280008] },
    },
    ravi: {
      id: `ravi`,
      name: `SUTTI BABU`,
      fullName: `Sutti Babu`,
      party: `Team Viral`,
      accent: `#8b5cf6`,
      look: {
        skin: 12157018,
        skinShade: 10118726,
        hair: 1380623,
        hairStyle: `side-part`,
        beard: 1906194,
        beardStyle: `none`,
        brows: 1709073,
        topStyle: `tshirt`,
        top: 2042442,
        jacket: 2042442,
        pants: 14207144,
        shoes: 4860954,
        glasses: !1,
        shoulders: 1.05,
        belly: 1.1,
        scale: 1,
      },
      modelHeight: 0.817,
      walkFwd: 2.25,
      walkBack: 1.75,
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1,
      fightClips: !0,
      danceIntro: !0,
      moveNames: {
        jab: `SUTTI JAB!`,
        kick: `GHAMANDWA KICK!`,
        finisher: `LATE THE JALDI COMBO!`,
        special1: `MONEY FOLLOWS PUNCH!`,
        special2: `SUPERSTAR STEP KICK!`,
        sweep: `FILMY SWEEP!`,
        uppercut: `BLOCKBUSTER UPPERCUT!`,
        roundhouse: `HOME FROM WORK ROUNDHOUSE!`,
        grab: `FILMY UPPERCUT!`,
      },
      superName: `TIME IS MONEY`,
      superDesc: `A giant coin-clock freezes time; its coins come alive as a dragon that follows him, strikes with him three times and coils into a giant coin that rolls the opponent flat, for 30% damage.`,
      introLine: `Jaldi aao, late mat karo!`,
      winLine: `Main late nahi, jaldi jeeta!`,
      facePhoto: `/fightkaro/faces/ravi.webp?v=20261104_face`,
      dance: { label: `FILMY STEP!`, colors: [9133302, 16765503, 2042442] },
    },
    lalu: {
      id: `lalu`,
      name: `RAIL RAJA`,
      fullName: `Rail Raja`,
      party: `Team Kulhad`,
      accent: `#16a34a`,
      look: {
        skin: 11565136,
        skinShade: 9658430,
        hair: 15263456,
        hairStyle: `receding`,
        beard: 15263456,
        beardStyle: `none`,
        brows: 14210768,
        topStyle: `kurta-jacket`,
        top: 16184558,
        jacket: 16184558,
        pants: 15921386,
        shoes: 3811870,
        glasses: !1,
        shoulders: 1.1,
        belly: 1.3,
        scale: 1,
      },
      modelHeight: 0.826,
      brightness: 0.66,
      walkFwd: 2.15,
      walkBack: 1.65,
      jumpV: 7.6,
      jumpVx: 2.5,
      damageMul: 1,
      fightClips: !0,
      moveNames: {
        jab: `KULHAD JAB!`,
        cross: `DESI THAPPAD!`,
        kick: `BHAINS KICK!`,
        uppercut: `SAMOSA UPPERCUT!`,
        roundhouse: `PLATFORM ROUNDHOUSE!`,
        finisher: `SUPERFAST COMBO!`,
        lowJab: `CHHOTA STATION JAB!`,
        sweep: `PATRI SWEEP!`,
        special1: `SIGNAL PALM!`,
        special2: `EXPRESS KICK!`,
        grab: `DHOBI PACHHAD!`,
      },
      superName: `RAIL RAJA EXPRESS`,
      superDesc: `Night falls on Sansad Junction. The signal turns green, a blazing tunnel of fire opens and a steam express with lit coaches thunders out, headlamp blazing, with him riding the roof straight through the opponent, for 30% damage.`,
      introLine: `Gaadi platform pe aa gayi hai!`,
      winLine: `Agli gaadi se ghar jao!`,
      facePhoto: `/fightkaro/faces/lalu.webp?v=20261104_face`,
      dance: { label: `KULHAD PARTY!`, colors: [1483594, 16765471, 11884079] },
    },
    mbapu: {
      id: `mbapu`,
      name: `MBAPU`,
      fullName: `Mbapu`,
      party: `Shanti Akhada`,
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
      damageMul: 1,
      fightClips: !0,
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
      superDesc: `Rises high, spins a giant wheel of light, wraps the foe in cloth inside a glittering storm, then throws them across the stage for 30% damage (40% as the final boss).`,
      introLine: `Shant raho, phir haaro.`,
      winLine: `Shanti se bada koi mukka nahi.`,
      facePhoto: `/fightkaro/faces/mbapu.webp?v=20261101_smooth`,
      dance: {
        label: `SHANTI ZINDABAD!`,
        colors: [16766720, 16777215, 1280008],
      },
    },
  },
  Ci = (e) => (e === `modi` ? `rahul` : `modi`),
  wi = [
    `modi`,
    `rahul`,
    `didi`,
    `trump`,
    `yogi`,
    `nitin`,
    `mbapu`,
    `ravi`,
    `lalu`,
  ],
  Ti = () => ({
    moveX: 0,
    up: !1,
    down: !1,
    punch: !1,
    kick: !1,
    grab: !1,
    super: !1,
  }),
  Ei = {
    modi: !0,
    rahul: !0,
    didi: !0,
    trump: !0,
    yogi: !0,
    nitin: !0,
    mbapu: !0,
    ravi: !0,
    lalu: !0,
  },
  Di = wi.filter((e) => Ei[e]),
  Oi =
    `rootY.rootZ.hipsF.hipsT.hipsS.spineF.spineT.spineS.chestF.chestT.headF.headT.headS.lShF.lShO.lShT.lEl.lHand.lWf.lWr.rShF.rShO.rShT.rEl.rHand.rWf.rWr.lThF.lThO.lKn.lAnk.rThF.rThO.rKn.rAnk`.split(
      `.`,
    );
function ki() {
  let e = {};
  for (let t of Oi) e[t] = 0;
  return e;
}
function Ai(e) {
  return { ...e };
}
function F(e, t) {
  return { ...e, ...t };
}
function I(e, t, n, r = ki()) {
  for (let i of Oi) r[i] = e[i] + (t[i] - e[i]) * n;
  return r;
}
var L = (e) => (e < 0 ? 0 : e > 1 ? 1 : e),
  R = (e) => 1 - (1 - L(e)) ** 3,
  z = (e) => {
    let t = L(e);
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  };
function ji(e, t, n = 0) {
  let r = Math.max(0.05, e - it - n),
    i = t,
    a = nt + rt - 1e-6,
    o = Math.min(a, Math.max(0.05, Math.hypot(r, i))),
    s = (nt * nt + rt * rt - o * o) / (2 * nt * rt),
    c = Math.PI - Math.acos(Math.max(-1, Math.min(1, s))),
    l = Math.atan2(i, r),
    u = (nt * nt + o * o - rt * rt) / (2 * nt * o);
  return { thF: l + Math.acos(Math.max(-1, Math.min(1, u))), kn: c };
}
function B(e, t, n, r = 0, i = 0) {
  let a = at + e,
    o = ji(a, t, r),
    s = ji(a, n, i);
  return {
    lThF: o.thF,
    lKn: o.kn,
    lAnk: o.thF - o.kn,
    rThF: s.thF,
    rKn: s.kn,
    rAnk: s.thF - s.kn,
  };
}
var Mi = {
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
function V(e, t) {
  let n = Math.sin(e * 4.2) * 0.012,
    r = Math.sin(e * 1.3),
    i = Math.sin(e * 4.2 + 0.9),
    a = -0.07 + n,
    o = F(ki(), {
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
      ...Mi,
      ...B(a, 0.24 + r * 0.015, -0.26 + r * 0.015),
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
function Ni(e, t, n, r) {
  let i = V(e, r),
    a = (t / 0.55) * Math.PI,
    o = n >= 0 ? 1 : -1,
    s = Math.sin(a) * o,
    c = Math.cos(a),
    l = -0.07 + Math.abs(c) * 0.025;
  return F(i, {
    rootY: l,
    ...B(
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
function Pi(e, t, n) {
  let r = -0.42 + Math.sin(e * 4) * 0.008;
  return F(V(e, t), {
    rootY: r,
    spineF: 0.42,
    headF: -0.3,
    lShF: n ? 1.3 : 1,
    lEl: n ? 2.2 : 1.7,
    rShF: n ? 1.1 : 0.8,
    rEl: 2.2,
    ...B(r, 0.3, -0.18),
  });
}
function Fi(e, t) {
  return F(V(e, t), {
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
function Ii(e, t) {
  let n = L(1 - Math.abs(e) / 8);
  return F(V(0, t), {
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
function Li(e, t) {
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
          ...Ri(e, 0.06),
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
          ...Ri(n, -0.02),
        },
      };
    }
    case `uppercut`: {
      let e = -0.3;
      return {
        windup: {
          rootY: e,
          ...B(e, 0.32, -0.3),
          spineF: 0.4,
          spineT: -0.25,
          lShF: 0.2,
          lShO: 0.1,
          lEl: 1.7,
        },
        strike: {
          rootY: 0.03,
          ...B(0.03, 0.16, -0.3),
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
          ...Ri(0, 0.05),
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
          ...Ri(0, 0),
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
          ...B(e, 0.3, -0.18),
        },
      };
    }
    case `sweep`: {
      let e = -0.55,
        t = ji(at + e, -0.32);
      return {
        windup: {
          rootY: -0.45,
          spineF: 0.5,
          hipsT: -0.3,
          ...B(-0.45, 0.3, -0.2),
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
              ...B(-0.12, 0.42, -0.36),
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
              ...B(-0.25, 0.3, -0.3),
            },
            strike: {
              rShF: 2.75,
              rShO: -0.15,
              rEl: 0.6,
              spineF: -0.25,
              spineT: 0.35,
              rootY: 0.02,
              rootZ: 0.08,
              ...B(0.02, 0.2, -0.3),
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
function Ri(e, t) {
  let n = ji(at + e, t);
  return { lThF: n.thF, lKn: n.kn, lAnk: n.thF - n.kn };
}
function zi(e, t) {
  let n = e.attack,
    r = n.def,
    i = r.air
      ? Ii(e.vy, e.char.id)
      : r.crouching || r.id === `landing`
        ? Pi(t, e.char.id, !1)
        : V(t, e.char.id),
    a = Li(r.id, e.char.id),
    o = F(i, a.windup),
    s = F(i, a.strike);
  if (n.frame <= r.startup) {
    let e = n.frame / Math.max(1, r.startup);
    return e < 0.6 ? I(i, o, R(e / 0.6)) : I(o, s, R((e - 0.6) / 0.4));
  }
  return n.frame <= r.startup + r.active
    ? s
    : I(s, i, z((n.frame - r.startup - r.active) / Math.max(1, r.recovery)));
}
function Bi(e, t) {
  let n = V(t, e.char.id),
    r = L(e.stateFrames / 4),
    i = L((e.stateFrames - 4) / Math.max(1, e.stun + e.stateFrames - 4)),
    a = Math.sin(e.stateFrames * 0.9) * Math.exp(-e.stateFrames * 0.18) * 0.25,
    o = (1 - i * 0.75) * R(r),
    s = e.lastHitHeight === `low`,
    c = e.lastHitHeight === `high`,
    l = I(
      n,
      F(n, {
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
        ...B(s ? -0.18 : -0.1, 0.16, -0.34),
        lHand: 1,
        rHand: 1,
      }),
      o,
    );
  return ((l.spineS += a * 0.4), l);
}
function Vi(e) {
  let t = L(e.stateFrames / 20);
  return F(ki(), {
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
function Hi(e, t = 0) {
  return F(ki(), {
    rootY: -(at - 0.13),
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
function Ui(e, t) {
  if (!e.grounded) return Vi(e);
  let n = L(e.downFrames / 8);
  return I(Vi(e), Hi(t), R(n));
}
function Wi(e, t) {
  let n = e.stateFrames / 24,
    r = F(Pi(t, e.char.id, !0), { rootY: -0.6, hipsF: -0.4, spineF: 0.8 });
  return n < 0.5
    ? I(Hi(t), r, z(n / 0.5))
    : I(r, V(t, e.char.id), z((n - 0.5) / 0.5));
}
function Gi(e, t) {
  return F(V(e, t), {
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
function Ki(e, t) {
  let n = V(e, t);
  if (t === `modi`) {
    let t = Math.sin(e * 2) * 0.08;
    return F(n, {
      rootY: 0,
      ...B(0, 0.1, -0.1),
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
    return F(n, {
      rootY: 0,
      ...B(0, 0.1, -0.12),
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
    return F(n, {
      rootY: 0,
      ...B(0, 0.12, -0.12),
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
    ? $i(e, t)
    : F(n, {
        rootY: 0,
        ...B(0, 0.12, -0.12),
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
function qi(e, t) {
  let n = (e * 132) / 60,
    r = n % 4,
    i = Math.floor(n) % 2 == 0 ? 1 : -1,
    a = n % 1,
    o = -0.08 + Math.abs(Math.sin(n * Math.PI)) * 0.05,
    s = F(V(e, t), { hipsT: 0, spineT: 0, headT: 0.6, headF: -0.05 });
  if (r < 2) {
    let e = Math.sin(a * Math.PI) ** 2,
      t = i * 0.14;
    return F(s, {
      rootY: o,
      ...B(o, 0.12 + t, -0.12 + t, i > 0 ? 0 : 0.08 * e, i > 0 ? 0.08 * e : 0),
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
    l = z(c) * Math.PI * 2,
    u = Math.sin(n * Math.PI * 2) * 0.35;
  return F(s, {
    rootY: o - 0.03,
    ...B(o - 0.03, 0.1, -0.1, Math.max(0, Math.sin(c * Math.PI * 4)) * 0.07, 0),
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
function Ji(e, t) {
  let n = (e * 132) / 60,
    r = Math.floor(n) % 2 == 0 ? 1 : -1,
    i = n % 1,
    a = Math.sin(i * Math.PI),
    o = Math.abs(Math.sin(n * Math.PI * 2)) * 0.12,
    s = -0.12 + a * 0.09,
    c = a * 0.95,
    l = F(V(e, t), { hipsT: r * 0.18, spineT: -r * 0.12, headT: 0.55 }),
    u = B(s, 0.08, -0.08),
    d =
      r > 0
        ? { lThF: 0.3 + c, lKn: 0.4 + c * 1.3, lAnk: 0.4 }
        : { rThF: 0.3 + c, rKn: 0.4 + c * 1.3, rAnk: 0.4 };
  return F(l, {
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
function Yi(e, t) {
  let n = (e * 132) / 60,
    r = n % 8,
    i = Math.floor(n) % 2 == 0 ? 1 : -1,
    a = n % 1,
    o = Math.sin(n * Math.PI) * 0.16,
    s = -0.06 - Math.abs(Math.sin(n * Math.PI)) * 0.05,
    c = Math.sin(a * Math.PI),
    l = r >= 6 ? z((r - 6) / 2) * Math.PI * 2 : 0,
    u = F(V(e, t), { hipsT: 0, spineT: 0, headT: 0.6, headF: -0.1 }),
    d = i > 0 ? `r` : `l`;
  return F(u, {
    rootY: s,
    ...B(
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
function Xi(e, t) {
  let n = (e * 132) / 60,
    r = n % 8,
    i = Math.sin(n * Math.PI * 0.5),
    a = -0.07 + Math.abs(Math.sin(n * Math.PI)) * 0.035,
    o = F(V(e, t), { hipsT: 0, spineT: 0, headT: 0.6, headF: -0.08 }),
    s = i * 0.12,
    c = F(o, {
      rootY: a,
      ...B(a, 0.12 + s, -0.12 + s),
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
  return I(
    c,
    F(o, {
      rootY: -0.04,
      ...B(-0.04, 0.1, -0.1),
      spineF: 0.42,
      headF: 0.3,
      ...Qi,
    }),
    z(l),
  );
}
function Zi(e, t) {
  let n = (e * 132) / 60,
    r = Math.sin(n * Math.PI),
    i = -0.05 - Math.abs(r) * 0.03;
  return F(F(V(e, t), { hipsT: 0, spineT: 0, headT: 0.6, headF: -0.2 }), {
    rootY: i,
    ...B(i, 0.12, -0.12),
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
var Qi = {
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
function $i(e, t) {
  let n = Math.max(0, Math.sin(e * 1.6)) ** 2;
  return F(V(e, t), {
    rootY: 0,
    ...B(0, 0.1, -0.1),
    hipsT: 0,
    hipsS: 0,
    spineT: 0,
    spineS: 0,
    spineF: 0.04 + n * 0.08,
    chestF: 0,
    headT: 0.45,
    headS: 0,
    headF: -0.04 + n * 0.22,
    ...Qi,
  });
}
var ea = 2.6;
function ta(e, t) {
  if (t === `yogi`) return $i(e, t);
  let n = F(V(e, t), {
      rootY: 0,
      ...B(0, 0.11, -0.11),
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
    r = Math.floor(e / (ea * 4)),
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
          F(n, o)
        );
      },
      (e) => {
        let t = Math.sin(e * 1.3);
        return F(n, {
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
        return F(n, {
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
        return F(n, {
          rootY: t,
          ...B(t, 0.11, -0.11),
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
    a = e / ea,
    o = Math.floor(a) % i.length,
    s = z(L(((a % 1) - 0.75) / 0.25)),
    c = i[o](e);
  return s > 0 ? I(c, i[(o + 1) % i.length](e), s) : c;
}
function na(e, t) {
  return t === `didi`
    ? Yi(e, t)
    : t === `trump`
      ? Zi(e, t)
      : t === `yogi`
        ? Xi(e, t)
        : t === `modi`
          ? qi(e, t)
          : Ji(e, t);
}
function ra(e, t) {
  let n = t.time + e.side * 0.7,
    r = e.char.id;
  switch (e.state) {
    case `idle`:
      return e.holdingBack && t.threatened ? Fi(n, r) : V(n, r);
    case `walk`:
      return e.holdingBack && t.threatened
        ? Fi(n, r)
        : Ni(n, e.walkDistance, e.moveRel, r);
    case `crouch`:
      return Pi(n, r, e.holdingBack);
    case `jump`:
      return e.attack && e.attackPhase !== `recovery` ? zi(e, n) : Ii(e.vy, r);
    case `attack`:
      return e.attack ? zi(e, n) : V(n, r);
    case `hitstun`:
      return Bi(e, n);
    case `blockstun`:
      return e.crouching ? Pi(n, r, !0) : Fi(n, r);
    case `knockdown`:
    case `ko`:
      return Ui(e, n);
    case `getup`:
      return Wi(e, n);
    case `victory`:
      return na(e.stateFrames / 60, r);
    case `intro`:
      return Ki(n, r);
    case `frozen`:
      return Gi(n, r);
    case `super`:
      return V(n, r);
  }
}
var ia = new T(0, 1, 0),
  aa = class {
    constructor(t) {
      (e(this, `d`, void 0),
        e(this, `t`, 0),
        e(this, `casterPose`, null),
        e(this, `targetPose`, null),
        e(this, `casterClip`, null),
        e(this, `targetClip`, null),
        e(this, `targetTf`, null),
        e(this, `done`, !1),
        e(this, `v1`, new T()),
        e(this, `v2`, new T()),
        e(this, `v3`, new T()),
        (this.d = t));
    }
    advance(e, t) {
      this.t += e * (this.t < t ? ot : 1);
      let n = this.d.clipTime();
      n !== null &&
        this.t < t &&
        Math.abs(n - this.t) < 1 &&
        (this.t += (n - this.t) * 0.08);
    }
    landSuperHit(e, t, n, r, i = st) {
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
function oa() {
  let e = new y(),
    t = new y();
  e.add(t);
  let n = new C({
      color: 16765803,
      emissive: 16747024,
      emissiveIntensity: 0.75,
      metalness: 0.7,
      roughness: 0.3,
      side: 2,
    }),
    r = new C({
      color: 16773552,
      emissive: 16756784,
      emissiveIntensity: 1.15,
      metalness: 0.4,
      roughness: 0.3,
      side: 2,
    }),
    i = (e, n, r = 0, i = 0, a = 0) => {
      let o = new S(e, n);
      return (o.position.set(r, i, 0), (o.rotation.z = a), t.add(o), o);
    };
  (i(new E(1, 0.07, 10, 64), n),
    i(new E(0.82, 0.03, 8, 64), r),
    i(new E(0.42, 0.05, 8, 48), n),
    i(new Re(0.2, 32), r));
  for (let e = 0; e < 16; e++) {
    let t = (e / 16) * Math.PI * 2;
    i(
      new w(0.04, 0.6, 0.03),
      n,
      Math.cos(t) * 0.62,
      Math.sin(t) * 0.62,
      t - Math.PI / 2,
    );
  }
  let a = new ue(0.1, 0.32, 4);
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
  let o = new S(
    new x(0.25, 1.3, 64),
    new k({
      color: 16756800,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
      side: 2,
    }),
  );
  e.add(o);
  let s = M(16751136, 3.4, 0.4);
  e.add(s);
  let c = M(16769162, 1.2, 0.55);
  e.add(c);
  let l = new h(16752704, 0, 9, 2);
  return (
    e.add(l),
    { root: e, spinner: t, light: l, glow: s, halo: c, blur: o }
  );
}
var sa = class t extends aa {
  constructor(n) {
    (super(n),
      e(this, `GROW_START`, 0.25),
      e(this, `WIND`, 7.6),
      e(this, `IMPACT`, 8.6),
      e(this, `RETURN_END`, 9.7),
      e(this, `END`, 10.8),
      e(this, `FLOAT_H`, 1.9),
      e(this, `MAX_SCALE`, 1.4),
      e(this, `chakra`, oa()),
      e(this, `impactDone`, !1),
      e(this, `released`, !1),
      e(this, `throwFrom`, new T()),
      e(this, `impactPoint`, new T()),
      e(this, `scale`, 0.001),
      e(this, `sparkAcc`, 0),
      e(this, `spinQuat`, new ie()),
      n.scene.add(this.chakra.root),
      this.chakra.root.scale.setScalar(0.001),
      n.audio.charge(t.RELEASE / ot, `chakra`),
      n.audio.startSuperBed(t.RELEASE / ot, `chakra`));
  }
  floatPose(e, t = 1) {
    let n = this.d.caster.char.id,
      r = Math.sin(e * 2.2) * 0.05;
    return F(V(e, n), {
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
    return F(this.floatPose(e), {
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
    return F(this.floatPose(e, 0), {
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
    let n = L((e - this.GROW_START) / (t.RELEASE - this.GROW_START));
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
        ? this.FLOAT_H * z(a / r)
        : a < c
          ? this.FLOAT_H + Math.sin((a - r) * 2.4) * 0.06
          : Math.max(0, this.FLOAT_H * (1 - z((a - c) / 1)))),
      (this.casterPose =
        a < this.WIND
          ? this.floatPose(a)
          : a < i
            ? I(
                this.floatPose(a),
                this.windPose(a),
                R((a - this.WIND) / (i - this.WIND)),
              )
            : a < i + 0.2
              ? I(this.windPose(a), this.throwPose(a), R((a - i) / 0.2))
              : a < this.RETURN_END
                ? I(
                    this.throwPose(a),
                    this.floatPose(a),
                    z((a - this.IMPACT) / 0.8),
                  )
                : I(
                    this.floatPose(a),
                    V(a, o.char.id),
                    z((a - this.RETURN_END) / 0.9),
                  )),
      this.impactDone
        ? ((this.targetPose = null), n.target.update(Ti(), o.x))
        : (this.targetPose = F(Gi(a, n.target.char.id), {
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
      let e = z((a - i) / (this.IMPACT - i));
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
      let e = z((a - this.IMPACT) / (this.RETURN_END - this.IMPACT));
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
      (l.blur.material.opacity = L((d - 8) / 30) * 0.32),
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
          dir: ia,
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
(e(sa, `RISE`, 2), e(sa, `RELEASE`, 8));
var ca = 0.4,
  la = 11735594,
  ua = 0.38,
  da = 2.13,
  fa = `/fightkaro/art/${N ? `mobile/` : ``}nirmala.webp?v=20261104`,
  pa = 1.76,
  ma = 576 / 1600,
  ha = 0.66,
  ga = null,
  _a = !1;
function va() {
  ga ||
    ((ga = new Ne().load(
      fa,
      () => {
        _a = !0;
      },
      void 0,
      () => {
        ga = null;
      },
    )),
    (ga.colorSpace = i),
    (ga.userData.shared = !0));
}
function ya() {
  va();
  let e = new y(),
    t = new S(
      new d(pa * ma, pa),
      new k({ map: ga, transparent: !0, alphaTest: 0.08, toneMapped: !1 }),
    );
  ((t.position.y = pa / 2), e.add(t));
  let n = new S(
    new Re(0.3, 24),
    new k({ color: 0, transparent: !0, opacity: 0.3, depthWrite: !1 }),
  );
  ((n.rotation.x = -Math.PI / 2),
    (n.scale.y = 0.45),
    (n.position.y = 0.01),
    e.add(n));
  let r = Ca();
  return (
    r.book.position.set(0, ha, 0.1),
    e.add(r.book),
    { root: e, card: t, book: r }
  );
}
function ba(e, t, n) {
  let r = document.createElement(`canvas`);
  ((r.width = e), (r.height = t), n(r.getContext(`2d`)));
  let a = new _e(r);
  return ((a.colorSpace = i), a);
}
var xa = () =>
    ba(192, 256, (e) => {
      ((e.fillStyle = `#d3122a`), e.fillRect(0, 0, 192, 256));
      for (let t = 0; t < 400; t++)
        ((e.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`),
          e.fillRect(Math.random() * 192, Math.random() * 256, 2, 2));
      ((e.strokeStyle = `#ffc94a`),
        (e.lineWidth = 6),
        e.strokeRect(12, 12, 168, 232),
        (e.fillStyle = `#ffd76e`),
        (e.font = `bold 46px Impact, sans-serif`),
        (e.textAlign = `center`),
        (e.textBaseline = `middle`),
        e.fillText(`BUDGET`, 96, 110),
        (e.font = `bold 34px Impact, sans-serif`),
        e.fillText(`2026`, 96, 160));
    }),
  Sa = (e) =>
    ba(256, 128, (t) => {
      ((t.fillStyle = `#e4e0d6`), t.fillRect(0, 0, 256, 128));
      for (let e = 0; e < 300; e++)
        ((t.fillStyle = `rgba(${Math.random() < 0.5 ? `0,0,0` : `255,255,255`},${Math.random() * 0.08})`),
          t.fillRect(Math.random() * 256, Math.random() * 128, 3, 3));
      ((t.fillStyle = `#b00020`),
        (t.font = `bold 84px Impact, sans-serif`),
        (t.textAlign = `center`),
        (t.textBaseline = `middle`),
        t.fillText(e, 128, 68),
        (t.fillStyle = `#2a2a2a`),
        (t.font = `bold 20px Impact, sans-serif`),
        t.fillText(`GST`, 128, 16));
    });
function Ca(e = 0.2, t = 0.28) {
  let n = e * 0.075,
    r = e * 0.1,
    i = r + n / 2,
    a = new y(),
    o = new y();
  a.add(o);
  let s = new C({
      map: xa(),
      roughness: 0.6,
      emissive: 7995408,
      emissiveIntensity: 0.55,
    }),
    c = new C({
      color: 13832746,
      roughness: 0.6,
      emissive: 7995408,
      emissiveIntensity: 0.55,
    }),
    l = new C({ color: 16051416, roughness: 0.9 }),
    u = (a) => {
      let c = new y();
      c.position.x = a * i;
      let u = new S(new w(e, t, n), s);
      u.position.x = (a * e) / 2;
      let d = new S(new w(e * 0.95, t * 0.94, r), l);
      return (
        d.position.set(a * e * 0.49, 0, n / 2 + r / 2),
        c.add(u, d),
        o.add(c),
        c
      );
    },
    d = [u(-1), u(1)];
  return (
    o.add(new S(new w(2 * i, t, n), c)),
    { book: a, body: o, covers: d, w: e }
  );
}
function wa(e, t, n = 0.35) {
  let r = n + (Math.PI / 2 - n) * t;
  ((e.covers[0].rotation.y = r),
    (e.covers[1].rotation.y = -r),
    (e.body.rotation.y = (Math.PI / 2) * t),
    (e.body.position.x = (-e.w / 2) * t));
}
var Ta = class t extends aa {
  constructor(n, r = ca) {
    (super(n),
      e(this, `share`, void 0),
      e(this, `root`, new y()),
      e(this, `nirmala`, ya()),
      e(this, `aura`, void 0),
      e(this, `bookGlow`, void 0),
      e(this, `bookPos`, new T()),
      e(this, `pages`, []),
      e(this, `slabs`, []),
      e(this, `coins`, []),
      e(this, `coinT`, []),
      e(this, `giant`, Ca(1.4, 2)),
      e(this, `dir`, void 0),
      e(this, `nx`, void 0),
      e(this, `slammed`, !1),
      e(this, `wide`, !1),
      e(this, `key`, void 0),
      e(this, `look`, new T()),
      e(this, `pos`, new T()),
      (this.share = r),
      n.scene.add(this.root),
      (this.dir = n.target.x >= n.caster.x ? 1 : -1),
      (this.nx = n.caster.x - this.dir * 1.05));
    let i = this.nirmala;
    (i.root.position.set(this.nx, -2, 0.55), this.root.add(i.root));
    let a = new h(16769720, 0, 6, 1.5);
    (a.position.set(0.5 * this.dir, 1.8, 1.4),
      i.root.add(a),
      (this.key = a),
      (this.aura = M(16760906, 3.2, 0)),
      this.aura.position.set(this.nx, 1.1, 0.4),
      this.root.add(this.aura),
      (this.bookGlow = M(16769162, 1, 0)),
      this.root.add(this.bookGlow));
    let o = new k({ color: 16774876, side: 2 });
    for (let e = 0; e < (N ? 14 : 26); e++) {
      let e = new S(new d(0.16, 0.22), o);
      ((e.visible = !1), this.root.add(e), this.pages.push(e));
    }
    [`5%`, `12%`, `18%`, `28%`].forEach((e, n) => {
      let r = Sa(e),
        i = new C({
          map: r,
          roughness: 0.9,
          emissive: 16777215,
          emissiveMap: r,
          emissiveIntensity: 0.35,
        }),
        a = new C({
          color: 13815234,
          roughness: 0.95,
          emissive: 13815234,
          emissiveIntensity: 0.2,
        }),
        o = new S(new w(0.95, ua, 0.3), [a, a, a, a, i, a]);
      ((o.visible = !1),
        this.root.add(o),
        this.slabs.push({ m: o, at: t.SLABS + n * 0.38, rate: e, landed: !1 }));
    });
    let s = new C({
        color: 16765514,
        emissive: 9067008,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.25,
      }),
      c = new O(0.07, 0.07, 0.015, 16);
    for (let e = 0; e < (N ? 16 : 30); e++) {
      let n = new S(c, s);
      ((n.visible = !1),
        this.root.add(n),
        this.coins.push(n),
        this.coinT.push(t.COLLECT + (e / 30) * 1));
    }
    ((this.giant.book.visible = !1), this.root.add(this.giant.book));
  }
  step(e) {
    let n = this.d,
      { ARRIVE: r, OPEN: i, COLLECT: a, SLAM: o, END: s } = t,
      c = this.t;
    this.advance(e, 0);
    let l = this.t,
      u = n.caster,
      d = n.target,
      f = this.nirmala,
      p = (e) => l >= e && c < e,
      m = L(l / 0.5) * (1 - L((l - s + 0.7) / 0.7));
    (n.arena.setMood(m * 0.5), (this.key.intensity = 7 * L(l / 0.6)));
    let h = R(L(l / r));
    ((f.root.position.y = -2 + 2 * h),
      (this.aura.material.opacity =
        0.6 * Math.max(h * (1 - L((l - 1.4) / 0.6)), m * 0.25)),
      p(0.1) && (n.audio.whoosh(), n.flash(`rgba(255,210,120,0.4)`, 160)),
      p(r) && n.audio.stampSlam());
    let g = n.cam.camera.position;
    ((f.root.rotation.y = Math.atan2(
      g.x - f.root.position.x,
      g.z - f.root.position.z,
    )),
      (f.card.visible = _a));
    let _ = z(L((l - r + 0.2) / 0.5)),
      v = z(L((l - (t.SLABS + 0.2)) / 0.5)),
      y = f.book.book;
    (y.position.set(
      this.dir * (0.45 * _ - 0.2 * v),
      ha + 0.72 * _ + 0.8 * v,
      0.1 + 0.25 * _,
    ),
      y.scale.setScalar(1 + 0.35 * _ + 0.25 * v));
    let b = R(L((l - i) / 0.35));
    (wa(f.book, 1 - b),
      y.rotation.set(-0.95 * b, Math.sin(l * 2) * 0.15 * _, 0),
      (y.visible = l < o - 0.55),
      y.getWorldPosition(this.bookPos),
      this.bookGlow.position.copy(this.bookPos),
      (this.bookGlow.position.y += 0.3),
      (this.bookGlow.material.opacity =
        b * (0.22 + 0.08 * Math.sin(l * 12)) * (l < o - 0.55)),
      p(i) && (n.audio.boom(), n.cam.shake(0.15, 0.3)),
      this.pages.forEach((e, t) => {
        let n = (l * 0.9 + t / this.pages.length) % 1,
          r = l < o;
        if (((e.visible = r), r)) {
          if (l < i) {
            let r = n * Math.PI * 2 + t;
            (e.position.set(
              this.nx + Math.cos(r) * 0.7,
              0.2 + n * 2.2,
              0.55 + Math.sin(r) * 0.7,
            ),
              e.scale.setScalar(1));
          } else
            (this.v1.copy(this.bookPos).lerp(this.v3.set(d.x, 1.3, 0.2), n),
              (this.v1.y +=
                Math.sin(n * Math.PI) * 1.2 + Math.sin(t) * 0.3 * n),
              e.position.copy(this.v1),
              e.scale.setScalar(0.3 + 0.7 * L(n * 5)));
          e.rotation.set(l * 5 + t, l * 3 + t * 2, 0);
        }
      }));
    let x = Math.atan2(g.x - d.x, g.z - 0.3);
    (this.slabs.forEach((e, t) => {
      let r = L((l - e.at) / 0.3);
      if (((e.m.visible = l >= e.at - 0.25 && l < a + 0.6), !e.m.visible))
        return;
      let i = da + t * 0.39;
      (e.m.position.set(
        d.x + [0, 0.05, -0.04, 0.03][t],
        i + (1 - r * r) * 4,
        0.3,
      ),
        e.m.rotation.set(0, x, [0.03, -0.04, 0.05, -0.02][t] + (1 - r) * 0.3),
        r >= 1 &&
          !e.landed &&
          ((e.landed = !0),
          this.v1.set(d.x, 2, 0.4),
          n.fx.hitSpark(this.v1, 1, !1, this.dir),
          n.fx.dust(this.v3.set(d.x, 0.1, 0.3), 1.2),
          n.cam.shake(0.22, 0.25),
          n.audio.hit(1.1),
          n.audio.stampSlam(),
          n.popup(
            `GST ${e.rate}!`,
            this.v2.set(d.x + (t % 2 ? 1 : -1) * this.dir * 1.05, i, 0.4),
            `#ff5a5a`,
          )));
    }),
      y.getWorldPosition(this.v2),
      this.coins.forEach((e, t) => {
        let n = L((l - this.coinT[t]) / 0.55);
        ((e.visible = n > 0 && n < 1),
          e.visible &&
            (this.v1.set(d.x, 1.2 + Math.sin(t) * 0.3, 0.3).lerp(this.v2, z(n)),
            (this.v1.y += Math.sin(n * Math.PI) * 0.8),
            e.position.copy(this.v1),
            e.rotation.set(l * 10 + t, 0, l * 6)));
      }),
      p(a) &&
        n.popup(`TAX COLLECTED!`, this.v1.set(this.nx, 2.9, 0.6), `#ffd76e`),
      l > a && l < o && Math.random() < 0.3 && n.audio.coins(4));
    let S = z(L((l - (o - 0.55)) / 0.4)),
      ee = this.giant.book;
    if (((ee.visible = l >= o - 0.55 && l < o + 0.9), ee.visible)) {
      (ee.position.set(d.x, 1.3 + (1 - S) * 1.5, 0.25),
        ee.scale.setScalar(0.3 + 0.7 * S));
      let e = R(L((l - (o - 0.12)) / 0.12));
      (wa(this.giant, e, 0.6), (ee.rotation.y = this.dir > 0 ? -0.2 : 0.2));
    }
    (!this.slammed && l >= o && this.slam(),
      this.slammed
        ? ((this.targetClip = null),
          (this.targetPose = null),
          d.update(Ti(), u.x))
        : ((this.targetClip = {
            name: `hit`,
            time: (l * 1.6) % 0.4,
            fade: 0.08,
          }),
          this.settleTarget(e)));
    let te = +(l > o + 0.2);
    ((this.casterPose = F(
      V(l, u.char.id),
      te ? { rShF: 2.8, rShO: 0.2, rEl: 0.2, rHand: 0 } : {},
    )),
      p(o + 0.6) &&
        n.popup(
          `"Sabka hissa banta hai, Bapu!"`,
          this.v1.set(this.nx, 2.3, 0.6),
          `#fff2d6`,
        ));
    let ne = z(L((l - (s - 0.6)) / 0.6));
    (ne > 0 && (f.root.position.y = -2.2 * ne),
      this.stepCamera(l),
      l >= s && (n.arena.setMood(0), (this.done = !0)));
  }
  slam() {
    let e = this.d,
      t = e.target;
    ((this.slammed = !0),
      e.audio.superRelease(`bulldozer`),
      e.audio.boom(),
      e.flash(`rgba(255,60,60,0.55)`, 240),
      e.cam.shake(0.6, 0.6),
      this.v1.set(t.x, 1.2, 0.3),
      e.fx.shockwave(this.v1, 16763210, 0.7, 4, !0),
      e.fx.shockwave(this.v2.set(t.x, 0.06, 0.2), la, 0.7, 3.5),
      e.fx.particles.emit(this.v1, {
        count: N ? 40 : 90,
        speed: 6,
        color: 16774876,
        life: 1,
        size: 0.1,
        gravity: 4,
        drag: 1.2,
      }),
      e.popup(`BUDGET PASSED!`, this.v2.set(t.x, 2.9, 0.4), `#ffd23f`),
      e.arena.cheer(1.8));
    let n = Math.min(
      this.share * (t.maxHp / 100),
      Math.max(0, (t.hp - 1) / 100),
    );
    this.landSuperHit(t.hp, this.dir, 3.2, 5.5, n);
  }
  stepCamera(e) {
    let n = this.d,
      r = n.caster,
      i = n.target,
      { look: a, pos: o } = this,
      { OPEN: s, SLABS: c, SLAM: l } = t;
    if (e < s + 0.2)
      (a.set(this.nx, 1.45, 0.5),
        o.set(this.nx + this.dir * 1.4, 1.35, 3),
        n.cam.set(o, a, 3, 40));
    else if (e < c + 0.2)
      (a.set(this.nx, 1.9, 0.5),
        o.set(this.nx + this.dir * 0.8, 1, 2.4),
        n.cam.set(o, a, 4, 46));
    else if (e < l + 0.4) {
      let e = (r.x + i.x) / 2;
      (a.set(e + this.dir * 0.5, 2.05, 0),
        o.set(e, 2.1, 6.6),
        n.cam.set(o, a, 3, 48),
        this.wide || ((this.wide = !0), n.cam.snap(!0)));
    } else {
      let e = (r.x + i.x) / 2;
      (a.set(e, 1.1, 0), o.set(e, 1.7, 7), n.cam.set(o, a, 2.5, 44));
    }
  }
  dispose() {
    let e = this.d;
    (e.arena.setMood(0), e.scene.remove(this.root));
    let t = new Set();
    this.root.traverse((e) => {
      let n = e;
      n.geometry?.dispose();
      let r = n.material;
      r && (Array.isArray(r) ? r : [r]).forEach((e) => t.add(e));
    });
    for (let e of t) {
      let t = e.map;
      (t && !t.userData.shared && !e.isSpriteMaterial && t.dispose(),
        e.dispose());
    }
  }
};
(e(Ta, `ARRIVE`, 0.8),
  e(Ta, `OPEN`, 1.3),
  e(Ta, `SLABS`, 1.8),
  e(Ta, `COLLECT`, 3.4),
  e(Ta, `SLAM`, 4.6),
  e(Ta, `END`, 6.2));
var Ea = `paytm.s27wkqb@pty`,
  Da = `/fightkaro/art/upi-qr.png`,
  Oa = [
    [21, `Cutting chai`],
    [51, `Chai + samosa`],
    [101, `Chai party`],
  ],
  ka = 51,
  Aa = `GPay · PhonePe · Paytm · BHIM`,
  ja = `huddle-fightkaro:support-on`;
function Ma() {
  try {
    return localStorage.getItem(ja) !== `0`;
  } catch {
    return !0;
  }
}
async function Na() {
  try {
    let e = await fetch(`/api/flags`, { signal: AbortSignal.timeout(4e3) });
    if (!e.ok) return Ma();
    let t = (await e.json()).support !== !1;
    try {
      localStorage.setItem(ja, t ? `1` : `0`);
    } catch {}
    return t;
  } catch {
    return Ma();
  }
}
var Pa = `huddle-fightkaro:supporter-v1`;
function Fa() {
  try {
    return localStorage.getItem(Pa) === `1`;
  } catch {
    return !1;
  }
}
function Ia() {
  try {
    localStorage.setItem(Pa, `1`);
  } catch {}
}
var La = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints ?? 0) > 1;
async function Ra(e) {
  try {
    return (await navigator.clipboard.writeText(e), !0);
  } catch {
    let t = document.createElement(`textarea`);
    ((t.value = e),
      (t.style.cssText = `position:fixed;opacity:0`),
      document.body.append(t),
      t.select());
    let n = document.execCommand(`copy`);
    return (t.remove(), n);
  }
}
async function za() {
  let e = await (await fetch(Da)).blob(),
    t = new File([e], `sansad-showdown-upi-qr.png`, { type: `image/png` });
  if (navigator.canShare?.({ files: [t] })) {
    await navigator.share({ files: [t] }).catch(() => {});
    return;
  }
  let n = document.createElement(`a`);
  ((n.href = URL.createObjectURL(e)),
    (n.download = t.name),
    n.click(),
    window.setTimeout(() => URL.revokeObjectURL(n.href), 4e3));
}
var H = (e, t, n) => {
    let r = document.createElement(e);
    return (t && (r.className = t), n && (r.textContent = n), r);
  },
  Ba = null;
function Va(e = `button`) {
  (A(`support_open`, { from: e }), Ba?.remove());
  let t = ka,
    n = La(),
    r = H(`div`, `support-overlay`),
    i = H(`div`, `support-card`);
  (r.append(i),
    r.addEventListener(`click`, (e) => {
      e.target === r && a();
    }));
  let a = () => {
      (r.remove(), (Ba = null), document.removeEventListener(`keydown`, o));
    },
    o = (e) => {
      e.key === `Escape` && a();
    };
  document.addEventListener(`keydown`, o);
  let s = H(`button`, `support-x`, `✕`);
  ((s.type = `button`),
    s.setAttribute(`aria-label`, `Close`),
    s.addEventListener(`click`, a),
    i.append(s));
  let c = H(`div`, `support-body`);
  i.append(c);
  let l = (e) => {
      (A(`support_pay`, { amount: t, via: e }),
        Ia(),
        i.classList.add(`thanks`),
        c.replaceChildren(
          H(`div`, `support-cup big`, `🙏`),
          H(`h2`, ``, `Shukriya, Sansad Supporter!`),
          H(
            `p`,
            `support-sub`,
            `Aapki ₹${t} ki chai se game free rehta hai aur Chapter 2 paas aata hai.`,
          ),
          H(
            `p`,
            `support-sub small`,
            `Payment ka screenshot Instagram pe @shivmbuilds ko bhejo, dil se thank you bolenge.`,
          ),
        ));
      let n = H(`button`, `support-pay`, `Wapas fight pe 🥊`);
      ((n.type = `button`), n.addEventListener(`click`, a), c.append(n));
    },
    u = () => {
      let e = H(`div`, `support-qr-code`),
        t = H(`img`);
      return ((t.src = Da), (t.alt = `UPI QR for ${Ea}`), e.append(t), e);
    },
    d = () => {
      (c.replaceChildren(),
        c.append(H(`div`, `support-cup`, `☕`), H(`h2`, ``, `Ek chai pilao?`)),
        c.append(
          H(
            `p`,
            `support-sub`,
            `Game free hai, koi ad nahi. Aapki chai se servers chalte hain aur Chapter 2 jaldi aata hai.`,
          ),
        ));
      let e = H(`div`, `support-chips`);
      for (let [n, r] of Oa) {
        let i = H(`button`, `support-chip${n === t ? ` on` : ``}`);
        ((i.type = `button`),
          i.append(H(`b`, ``, `₹${n}`), H(`small`, ``, r)),
          n === ka && i.append(H(`i`, `support-tag`, `👍 Best`)),
          i.addEventListener(`click`, () => {
            ((t = n), d());
          }),
          e.append(i));
      }
      c.append(e);
      let r = H(`input`, `support-own`);
      ((r.type = `number`),
        (r.inputMode = `numeric`),
        (r.min = `1`),
        (r.max = `100000`),
        (r.placeholder = `Apna amount (₹)`));
      let a = !Oa.some(([e]) => e === t);
      (a && (r.value = String(t)), (r.hidden = !a));
      let o = H(`button`, `support-link small`, `Koi aur amount?`);
      ((o.type = `button`),
        (o.hidden = a),
        o.addEventListener(`click`, () => {
          ((o.hidden = !0), (r.hidden = !1), r.focus());
        }));
      let s = H(`p`, `support-err`);
      (r.addEventListener(`input`, () => {
        let n = Math.round(Number(r.value));
        if (((s.textContent = ``), n >= 1 && n <= 1e5)) {
          t = n;
          for (let t of e.children) t.classList.remove(`on`);
          g();
        }
      }),
        c.append(o, r, s));
      let f = () =>
          r.value && !(Number(r.value) >= 1 && Number(r.value) <= 1e5)
            ? ((s.textContent = `₹1 se ₹1,00,000 tak ka amount daalo.`), !1)
            : !0,
        p = H(
          `p`,
          `support-fine`,
          `Sirf UPI · paisa seedha game banane wale ko · app mein bank ka registered naam dikhega (Vikas Chandra) · game koi payment detail nahi rakhta.`,
        ),
        m = H(`button`, `support-done`, `Ho gaya ✓`);
      ((m.type = `button`),
        m.addEventListener(`click`, () => {
          f() && l(n ? `phone` : `qr`);
        }));
      let h = (e, t) => {
          let n = H(`div`, `support-step`);
          return (
            n.append(
              H(`span`, `support-num`, e),
              H(`span`, `support-step-title`, t),
            ),
            n
          );
        },
        g = () => {
          for (let e of c.querySelectorAll(`[data-amount]`))
            e.textContent = `₹${t}`;
        },
        _ = () => {
          let e = H(`b`, `support-amt`);
          return ((e.dataset.amount = ``), e);
        };
      if (n) {
        let e = h(`1`, `UPI ID copy karo`);
        e.classList.add(`start`, `now`);
        let t = H(`button`, `support-pay copy`);
        ((t.type = `button`),
          t.append(
            H(`span`, `support-vpa`, Ea),
            H(`span`, `support-copy-tag`, `📋 Copy`),
          ));
        let n = h(`2`, ``);
        n.querySelector(`.support-step-title`).append(
          `UPI app mein `,
          H(`b`, ``, `Pay UPI ID`),
          ` → paste → `,
          _(),
        );
        let r = H(`div`, `support-appnames`, Aa);
        t.addEventListener(`click`, async () => {
          if (!f()) return;
          let r = await Ra(Ea);
          (A(`support_copy`, { ok: r }),
            r
              ? (t.classList.add(`done`),
                t.replaceChildren(
                  H(`span`, `support-vpa`, `✓ Copied!`),
                  H(`span`, `support-copy-tag`, `Ab app kholo`),
                ),
                e.classList.replace(`now`, `ok`),
                (e.querySelector(`.support-num`).textContent = `✓`),
                n.classList.add(`now`))
              : (t.querySelector(`.support-copy-tag`).textContent =
                  `Dabake copy karo`));
        });
        let a = H(`div`, `support-alt`),
          o = H(
            `button`,
            `support-link small`,
            `⬇ QR save karke gallery se scan`,
          );
        ((o.type = `button`),
          o.addEventListener(`click`, () => {
            f() && (za(), A(`support_qr_save`));
          }));
        let s = H(`button`, `support-link small`, `Doosra phone? QR dikhao`);
        s.type = `button`;
        let l = H(`div`, `support-qr-view`),
          d = H(`button`, `support-link`, `← Wapas`);
        ((d.type = `button`),
          d.addEventListener(`click`, () => {
            (l.remove(), (c.hidden = !1));
          }));
        let v = H(`small`, `support-qr-cap`);
        v.append(`Scan karo, phir `, _(), ` daalo`);
        let y = H(`div`, `support-qr`);
        (y.append(u(), v),
          l.append(
            H(`div`, `support-label`, `Doosre phone se scan karo`),
            y,
            d,
          ),
          s.addEventListener(`click`, () => {
            ((c.hidden = !0), i.append(l), g(), A(`support_qr`));
          }),
          a.append(o, s),
          c.append(p, e, t, n, r, a, m));
      } else {
        let e = h(`1`, ``);
        (e.classList.add(`start`, `now`),
          e
            .querySelector(`.support-step-title`)
            .append(`Phone ke UPI app se scan karo`));
        let t = H(`div`, `support-qr`);
        t.append(u());
        let n = h(`2`, ``);
        n.querySelector(`.support-step-title`).append(
          _(),
          ` daalo aur pay karo`,
        );
        let r = H(`div`, `support-id`);
        r.append(H(`span`, ``, `UPI ID: ${Ea}`));
        let i = H(`button`, `support-copy`, `Copy`);
        ((i.type = `button`),
          i.addEventListener(`click`, async () => {
            ((i.textContent = (await Ra(`paytm.s27wkqb@pty`))
              ? `Copied ✓`
              : `Copy nahi hua`),
              A(`support_copy`));
          }),
          r.append(i),
          c.append(e, t, n, m, r, p));
      }
      g();
    };
  (d(), document.body.append(r), (Ba = r));
}
var Ha = null;
function Ua(e) {
  Ha && (Ha.hidden = !(e && Wa && !Fa()));
}
var Wa = !1;
function Ga() {
  let e = document.querySelector(`#support-btn`);
  if (!e) return;
  (e.addEventListener(`click`, () => Va(`button`)),
    (e.hidden = !0),
    Na().then((t) => {
      ((Wa = t), (e.hidden = !t));
    }));
  let t = document.querySelector(`.result-buttons`);
  t &&
    ((Ha = H(`button`, `chai-nudge`, `Maza aaya? ☕ Ek chai pilao`)),
    (Ha.type = `button`),
    (Ha.hidden = !0),
    Ha.addEventListener(`click`, () => Va(`win`)),
    t.after(Ha));
}
var Ka = {
    modi: `Mitron, is Diwali vikas ka diya jalao!`,
    rahul: `Pyaar ki dukaan se, Diwali ki mithai!`,
    didi: `Shubho Deepaboli! Khela hobe, khushiyan hobe!`,
    trump: `The best Diwali. Tremendous lights. Everybody says so!`,
    yogi: `Deepotsav ki shubhkaamnayein! Har ghar roshan ho!`,
    nitin: `Expressway jaisi khushiyan, bina toll ke!`,
    ravi: `Diwali mein paisa bhi follow kare, khushi bhi!`,
    lalu: `Khushiyon ki gaadi, bilkul time pe!`,
    mbapu: `Andhere pe roshni ki jeet ho, beta.`,
  },
  qa = () =>
    /fightkaro\.com|sansad-showdown/.test(location.host)
      ? location.origin
      : `https://fightkaro.com`;
function Ja(e) {
  return new Promise((t) => {
    let n = new Image();
    ((n.crossOrigin = `anonymous`),
      (n.onload = () => t(n)),
      (n.onerror = () => t(null)),
      (n.src = e));
  });
}
async function Ya(e, t, n, r, i = !1) {
  await document.fonts?.load(`80px "Bebas Neue"`).catch(() => void 0);
  let a = 1080,
    o = 1350,
    s = document.createElement(`canvas`);
  ((s.width = a), (s.height = o));
  let c = s.getContext(`2d`),
    l = c.createLinearGradient(0, 0, 0, o);
  (l.addColorStop(0, `#05061c`),
    l.addColorStop(0.55, `#24164a`),
    l.addColorStop(1, `#5a2a3a`),
    (c.fillStyle = l),
    c.fillRect(0, 0, a, o));
  let u = [`#ffd36b`, `#ff6b6b`, `#6bff9a`, `#7fb0ff`, `#ff86e6`];
  for (let e = 0; e < 7; e++) {
    let t = 80 + Math.random() * 920,
      n = 90 + Math.random() * 380,
      r = 60 + Math.random() * 80;
    ((c.strokeStyle = u[e % u.length]),
      (c.lineWidth = 3),
      (c.globalAlpha = 0.85));
    for (let e = 0; e < 26; e++) {
      let i = (e / 26) * Math.PI * 2;
      (c.beginPath(),
        c.moveTo(t + Math.cos(i) * r * 0.25, n + Math.sin(i) * r * 0.25),
        c.lineTo(t + Math.cos(i) * r, n + Math.sin(i) * r),
        c.stroke());
    }
  }
  c.globalAlpha = 1;
  let d = c.createRadialGradient(540, 560, 138, 540, 560, 345);
  (d.addColorStop(0, `rgba(255,200,90,0.55)`),
    d.addColorStop(1, `rgba(255,200,90,0)`),
    (c.fillStyle = d),
    c.fillRect(0, 0, a, o));
  for (let e = 0; e < 3; e++)
    for (let t = 0; t <= 14; t++) {
      let n = t / 14;
      ((c.fillStyle = t % 2 ? `#ffd21a` : `#ff8c1a`),
        c.beginPath(),
        c.arc(
          e * 360 + n * 360,
          14 + Math.sin(n * Math.PI) * 60,
          15,
          0,
          Math.PI * 2,
        ),
        c.fill());
    }
  for (let [e, t] of [
    [110, `#ff3b3b`],
    [970, `#ff5ac8`],
  ]) {
    let n = c.createRadialGradient(e, 210, 5, e, 210, 110);
    (n.addColorStop(0, t),
      n.addColorStop(1, `rgba(0,0,0,0)`),
      (c.fillStyle = n),
      c.fillRect(e - 110, 100, 220, 220),
      (c.fillStyle = t),
      c.beginPath(),
      c.moveTo(e, 150),
      c.lineTo(e + 45, 210),
      c.lineTo(e, 270),
      c.lineTo(e - 45, 210),
      c.fill());
  }
  let f = r ? await Ja(r) : null;
  if (f) {
    let e = c.createRadialGradient(540, 1080, 20, 540, 1080, 330);
    return (
      [`#ff3b6b`, `#ffd21a`, `#3bd16f`, `#5aa8ff`, `#ff8c1a`].forEach((t, n) =>
        e.addColorStop(n / 5, t),
      ),
      e.addColorStop(1, `rgba(0,0,0,0)`),
      c.save(),
      c.translate(540, 1080),
      c.scale(1, 0.32),
      (c.fillStyle = e),
      c.beginPath(),
      c.arc(0, 0, 330, 0, Math.PI * 2),
      c.fill(),
      c.restore(),
      c.drawImage(f, 195, 250, 690, 920),
      i &&
        ((c.fillStyle = `#ffd76e`),
        (c.font = `bold 50px "Bebas Neue", Impact, sans-serif`),
        c.fillText(`🏆 WINNER`, 540, 300)),
      m(),
      s
    );
  }
  let p = await Ja(n);
  return (
    c.save(),
    c.beginPath(),
    c.arc(540, 560, 230, 0, Math.PI * 2),
    c.clip(),
    (c.fillStyle = `#2b1806`),
    c.fillRect(310, 330, 460, 460),
    p && c.drawImage(p, 310, 330, 460, 460),
    c.restore(),
    (c.lineWidth = 12),
    (c.strokeStyle = `#ffc94a`),
    c.beginPath(),
    c.arc(540, 560, 230, 0, Math.PI * 2),
    c.stroke(),
    m(),
    s
  );
  function m() {
    ((c.textAlign = `center`),
      (c.fillStyle = `#ffd76e`),
      (c.font = `bold 92px "Bebas Neue", Impact, sans-serif`),
      c.fillText(`SHUBH DEEPAVALI`, 540, 175),
      (c.fillStyle = `#fff2d6`),
      (c.font = `bold 54px "Bebas Neue", Impact, sans-serif`),
      c.fillText(t.toUpperCase(), 540, 870),
      (c.font = `italic 44px Georgia, serif`));
    let n = `"${Ka[e] ?? `Happy Diwali!`}"`.split(` `),
      r = ``,
      i = 950;
    for (let e of n) {
      let t = r ? `${r} ${e}` : e;
      c.measureText(t).width > 920
        ? (c.fillText(r, 540, i), (r = e), (i += 58))
        : (r = t);
    }
    c.fillText(r, 540, i);
    for (let e = 0; e < 9; e++) {
      let t = 90 + e * 112.5;
      ((c.fillStyle = `#b4532a`),
        c.beginPath(),
        c.ellipse(t, 1200, 42, 18, 0, 0, Math.PI),
        c.fill());
      let n = c.createRadialGradient(t, 1166, 2, t, 1166, 34);
      (n.addColorStop(0, `rgba(255,250,220,1)`),
        n.addColorStop(0.4, `rgba(255,180,60,0.9)`),
        n.addColorStop(1, `rgba(255,140,30,0)`),
        (c.fillStyle = n),
        c.beginPath(),
        c.ellipse(t, 1170, 14, 30, 0, 0, Math.PI * 2),
        c.fill());
    }
    ((c.fillStyle = `#e9d5a8`),
      (c.font = `34px "Bebas Neue", Impact, sans-serif`),
      c.fillText(
        `SANSAD SHOWDOWN · ${qa().replace(/^https?:\/\//, ``)}`,
        540,
        1300,
      ));
  }
}
async function Xa(e, t, n, r, i = !1) {
  let a = await Ya(e, t, n, r, i),
    o = `Shubh Deepavali! 🪔 Iss Diwali ${t} ke saath Sansad Showdown khelo: ${qa()}`,
    s = await new Promise((e) => a.toBlob(e, `image/png`));
  if ((A(`diwali_card`, { neta: e }), s)) {
    let t = new File([s], `sansad-showdown-diwali-${e}.png`, {
      type: `image/png`,
    });
    if (navigator.canShare?.({ files: [t] }))
      try {
        await navigator.share({ files: [t], text: o });
        return;
      } catch {}
    let n = document.createElement(`a`);
    ((n.href = URL.createObjectURL(s)),
      (n.download = t.name),
      n.click(),
      window.setTimeout(() => URL.revokeObjectURL(n.href), 4e3));
  }
  window.open(
    `https://wa.me/?text=${encodeURIComponent(o)}`,
    `_blank`,
    `noopener`,
  );
}
function Za(e) {
  if (!Mt) return;
  document.documentElement.classList.add(`diwali`);
  let t = (t, n, r = !1) => {
    if (!t) return;
    let i = document.createElement(`button`);
    ((i.type = `button`),
      (i.className = `diwali-card-btn ${n}`),
      (i.innerHTML = `<span>🪔</span><span>Diwali card bhejo</span>`),
      i.addEventListener(`click`, (t) => {
        t.stopPropagation();
        let r = n === `on-result` ? e.winner() : null,
          i = r ?? e.neta(),
          a;
        try {
          a = e.hero(i);
        } catch {
          a = void 0;
        }
        Xa(i, e.name(i), e.portrait(i), a, !!r);
      }),
      r ? t.after(i) : t.append(i));
  };
  (t(
    document.querySelector(`#portal-banner`) ??
      document.querySelector(`#title .tag`),
    `on-title`,
    !0,
  ),
    t(document.querySelector(`.result-buttons`), `on-result`));
  let n = document.querySelector(`#support-btn span:last-child`);
  n && (n.textContent = `Diwali pe mithai khilao`);
}
function Qa(e, t) {
  return Mt
    ? {
        date: e.replace(`Satire Edition`, `Diwali Special Edition 🪔`),
        excuse:
          Math.random() < 0.5
            ? `Breaking: Sansad mein sirf green patakhe allowed.`
            : t,
      }
    : { date: e, excuse: t };
}
function $a() {
  let e = document.createElement(`canvas`);
  ((e.width = 256), (e.height = 128));
  let t = e.getContext(`2d`);
  ((t.fillStyle = `#ffcf2e`),
    t.fillRect(0, 0, 256, 128),
    (t.fillStyle = `#c8102e`),
    t.fillRect(0, 0, 256, 22),
    t.fillRect(0, 106, 256, 22),
    (t.fillStyle = `#7a0c1c`),
    (t.font = `bold 40px Impact, sans-serif`),
    (t.textAlign = `center`),
    (t.textBaseline = `middle`),
    t.fillText(`SOAN PAPDI`, 128, 66));
  let n = new _e(e);
  return ((n.colorSpace = i), n);
}
function eo(e = 0.2) {
  let t = new y(),
    n = new C({ map: $a(), roughness: 0.55 }),
    r = new C({ color: 16764718, roughness: 0.55 }),
    i = new S(new w(e, e * 0.4, e * 0.7), [n, n, r, r, n, n]);
  i.position.y = e * 0.2;
  let a = new S(
    new w(e * 0.12, e * 0.42, e * 0.72),
    new C({ color: 13111342, roughness: 0.5 }),
  );
  a.position.y = e * 0.2;
  let o = new S(
    new E(e * 0.09, e * 0.025, 6, 14),
    new C({ color: 13111342, roughness: 0.5 }),
  );
  return ((o.position.y = e * 0.43), t.add(i, a, o), t);
}
function to(e) {
  ((e.kurta.map = null),
    e.kurta.color.setHex(13898842),
    (e.kurta.roughness = 0.4),
    (e.kurta.metalness = 0.15),
    (e.kurta.needsUpdate = !0));
  let t = new C({ color: 16763210, roughness: 0.3, metalness: 0.7 }),
    n = new S(new E(0.17, 0.014, 6, 28), t);
  ((n.rotation.x = Math.PI / 2), (n.position.y = 0.06), e.body.add(n));
  let r = [
    new C({ color: 16747546, roughness: 0.9 }),
    new C({ color: 16765466, roughness: 0.9 }),
  ];
  for (let t = 0; t < 18; t++) {
    let n = (t / 18) * Math.PI * 2,
      i = new S(new D(0.026, 8, 6), r[t % 2]);
    (i.position.set(
      Math.sin(n) * 0.15,
      0.55 + Math.cos(n) * 0.06 - (Math.cos(n) > 0 ? 0.05 : 0),
      Math.cos(n) * 0.13 + 0.02,
    ),
      e.body.add(i));
  }
  let i = new S(
    new D(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new C({ color: 16748319, roughness: 0.7 }),
  );
  (i.scale.set(1.08, 0.85, 1.05), (i.position.y = 0.07));
  let a = new S(new E(0.15, 0.018, 6, 24), t);
  ((a.rotation.x = Math.PI / 2), (a.position.y = 0.075));
  let o = new S(new ue(0.02, 0.1, 8), t);
  (o.position.set(0.05, 0.2, 0.06), e.head.add(i, a, o));
  for (let t of e.kettle.children) t.visible = !1;
  let s = eo(0.22);
  ((s.position.y = -0.05), e.kettle.add(s));
}
var no,
  ro = (e, t = 0, n = 0.6) =>
    new C({
      color: e,
      emissive: t,
      emissiveIntensity: t ? 0.5 : 0,
      roughness: n,
    }),
  io = 9,
  ao = class t {
    constructor(t, n, r) {
      (e(this, `scene`, void 0),
        e(this, `x`, void 0),
        e(this, `root`, new y()),
        e(this, `done`, !1),
        e(this, `y`, 0),
        e(this, `vy`, 0),
        e(this, `age`, 0),
        e(this, `landed`, !1),
        e(this, `flying`, !0),
        e(this, `glow`, void 0),
        e(this, `from`, new T()),
        (this.scene = t),
        (this.x = r),
        this.from.copy(n),
        this.root.add(eo(0.42)),
        (this.glow = M(16765803, 1.1, 0.6)),
        (this.glow.position.y = 0.12),
        this.root.add(this.glow),
        this.root.position.copy(n),
        t.add(this.root));
    }
    get ready() {
      return this.landed && !this.done;
    }
    update(e, n) {
      if (((this.age += e), this.flying)) {
        let n = Math.min(1, this.age / t.FLIGHT);
        (this.root.position.set(
          this.from.x + (this.x - this.from.x) * n,
          this.from.y * (1 - n) + Math.sin(n * Math.PI) * 1.6,
          this.from.z + (0.25 - this.from.z) * n,
        ),
          (this.root.rotation.x += e * 9),
          n >= 1 &&
            ((this.flying = !1), (this.vy = 2.4), (this.root.rotation.x = 0)));
      } else
        this.landed
          ? ((this.root.position.y = Math.abs(Math.sin(n * 3)) * 0.03),
            (this.root.rotation.y += e * 0.8))
          : ((this.vy -= 14 * e),
            (this.y += this.vy * e),
            this.y <= 0 &&
              ((this.y = 0),
              (this.vy = Math.abs(this.vy) > 1.2 ? -this.vy * 0.3 : 0),
              this.vy === 0 && (this.landed = !0)),
            this.root.position.set(this.x, this.y, 0.25));
      ((this.glow.material.opacity = 0.45 + 0.2 * Math.sin(n * 6)),
        this.age > 7.5 && (this.root.visible = Math.sin(this.age * 20) > 0),
        this.age > io && (this.done = !0));
    }
    dispose() {
      (this.scene.remove(this.root),
        this.root.traverse((e) => {
          let t = e;
          t.geometry?.dispose();
          let n = t.material;
          for (let e of n ? (Array.isArray(n) ? n : [n]) : [])
            e.map !== lt() && (e.map?.dispose(), e.dispose());
        }));
    }
  };
e(ao, `FLIGHT`, 0.9);
var oo = 1.5,
  so = class t {
    constructor(t, n, r) {
      (e(this, `scene`, void 0),
        e(this, `from`, void 0),
        e(this, `to`, void 0),
        e(this, `done`, !1),
        e(this, `root`, new y()),
        e(this, `bomb`, new y()),
        e(this, `spark`, void 0),
        e(this, `smoke`, []),
        e(this, `flash`, void 0),
        e(this, `paper`, []),
        e(this, `paperVel`, []),
        e(this, `ring`, void 0),
        e(this, `t`, 0),
        e(this, `x`, void 0),
        e(this, `hissed`, !1),
        e(this, `boomed`, !1),
        (this.scene = t),
        (this.from = n),
        (this.to = r),
        (this.x = n));
      let i = ro(9071162, 0, 0.95),
        a = new S(new D(0.2, 18, 14), i);
      this.bomb.add(a);
      for (let e = 0; e < 6; e++) {
        let e = new S(new E(0.2, 0.012, 6, 24), ro(5914658, 0, 0.9));
        (e.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0),
          this.bomb.add(e));
      }
      let o = new S(new O(0.205, 0.205, 0.09, 18), ro(14034984, 3801088, 0.7));
      this.bomb.add(o);
      let s = new S(new O(0.012, 0.012, 0.18, 6), ro(3811866));
      ((s.position.y = 0.26),
        this.bomb.add(s),
        (this.spark = M(16765803, 0.35, 1)),
        (this.spark.position.y = 0.36),
        this.bomb.add(this.spark),
        this.bomb.position.set(n, 0.2, 0.4),
        this.root.add(this.bomb),
        (this.ring = new S(
          new x(1.34, oo, 72),
          new k({
            color: 16722458,
            transparent: !0,
            opacity: 0,
            depthWrite: !1,
            toneMapped: !1,
          }),
        )));
      let c = new S(
        new Re(1.34, 72),
        new k({
          color: 16722458,
          transparent: !0,
          opacity: 0.22,
          depthWrite: !1,
          toneMapped: !1,
        }),
      );
      (this.ring.add(c),
        (this.ring.rotation.x = -Math.PI / 2),
        this.ring.position.set(n, 0.03, 0.4),
        this.root.add(this.ring),
        (this.flash = M(16773312, 6, 0)),
        this.flash.position.set(0, 1, 0.4),
        this.root.add(this.flash));
      let l = lt();
      for (let e = 0; e < (N ? 8 : 14); e++) {
        let e = new le(
          new De({
            map: l,
            color: 10132130,
            transparent: !0,
            opacity: 0,
            depthWrite: !1,
          }),
        );
        (this.root.add(e), this.smoke.push(e));
      }
      let u = [14034984, 16765803, 16777215, 2792778];
      for (let e = 0; e < (N ? 16 : 30); e++) {
        let t = new S(
          new d(0.08, 0.05),
          new k({ color: u[e % u.length], side: 2 }),
        );
        ((t.visible = !1),
          this.root.add(t),
          this.paper.push(t),
          this.paperVel.push(new T()));
      }
      t.add(this.root);
    }
    get posX() {
      return this.x;
    }
    get fuseLeft() {
      return Math.max(0, t.BOOM - this.t);
    }
    update(e) {
      let n = {};
      if (this.done) return n;
      this.t += e;
      let r = this.t,
        { ROLL: i, BOOM: a, END: o } = t,
        s = (this.from + this.to) / 2;
      if (r < i) {
        let e = 1 - (1 - r / i) ** 2,
          t = this.from + (s - this.from) * e;
        ((this.bomb.rotation.z -= (t - this.x) / 0.2),
          (this.x = t),
          (this.bomb.position.x = this.x));
      }
      !this.hissed && r > i * 0.6 && ((this.hissed = !0), (n.moo = !0));
      let c = Math.min(1, r / i);
      this.ring.position.x = this.x;
      let l =
        r < a
          ? c * (0.55 + 0.4 * Math.abs(Math.sin(r * (4 + (r / a) * 10))))
          : 0;
      if (
        ((this.ring.material.opacity = l),
        (this.ring.children[0].material.opacity = l * 0.3),
        r < a &&
          (this.spark.scale.setScalar(0.25 + 0.15 * Math.random()),
          (this.spark.position.y =
            0.36 - 0.14 * Math.min(1, Math.max(0, (r - i) / (a - i)))),
          Math.random() < 0.5 && (n.step = !0)),
        !this.boomed &&
          r >= a &&
          ((this.boomed = !0),
          (n.boom = !0),
          (this.bomb.visible = !1),
          (this.flash.position.x = this.x),
          this.smoke.forEach((e) => {
            (e.position.set(
              this.x + (Math.random() - 0.5) * 0.8,
              0.3 + Math.random() * 0.6,
              0.4 + (Math.random() - 0.5) * 0.6,
            ),
              e.scale.setScalar(0.6 + Math.random() * 0.6));
          }),
          this.paper.forEach((e, t) => {
            ((e.visible = !0),
              e.position.set(this.x, 0.4, 0.4),
              this.paperVel[t].set(
                (Math.random() - 0.5) * 6,
                3 + Math.random() * 5,
                (Math.random() - 0.5) * 3,
              ));
          })),
        this.boomed)
      ) {
        let t = (r - a) / (o - a);
        ((this.flash.material.opacity = Math.max(0, 1 - t * 5)),
          this.smoke.forEach((n) => {
            ((n.position.y += e * 0.6),
              n.scale.multiplyScalar(1 + e * 0.9),
              (n.material.opacity = 0.55 * (1 - t)));
          }),
          this.paper.forEach((t, n) => {
            let r = this.paperVel[n];
            ((r.y -= 6 * e),
              r.multiplyScalar(Math.exp(-e * 1.8)),
              t.position.addScaledVector(r, e),
              (t.position.y = Math.max(0.02, t.position.y)),
              (t.rotation.x += e * 9),
              (t.rotation.y += e * 7));
          }));
      }
      return (r >= o && (this.done = !0), n);
    }
    dispose() {
      (this.scene.remove(this.root),
        this.root.traverse((e) => {
          let t = e;
          t.geometry?.dispose();
          let n = t.material;
          n && n.map !== lt() && n.dispose();
        }));
    }
  };
((no = so),
  e(so, `ROLL`, 1.6),
  e(so, `FUSE`, 1.3),
  e(so, `BOOM`, no.ROLL + no.FUSE),
  e(so, `END`, no.BOOM + 1.6));
var co = {
  jab: {
    id: `jab`,
    startup: 5,
    active: 3,
    recovery: 10,
    damage: 5,
    height: `high`,
    hitstun: 16,
    blockstun: 10,
    knockdown: !1,
    launch: 0,
    push: 1.6,
    lunge: 1.6,
    chains: { punch: `cross`, kick: `kick` },
  },
  cross: {
    id: `cross`,
    startup: 6,
    active: 3,
    recovery: 12,
    damage: 6,
    height: `high`,
    hitstun: 18,
    blockstun: 11,
    knockdown: !1,
    launch: 0,
    push: 1.8,
    lunge: 2,
    chains: { punch: `uppercut`, kick: `finisher` },
  },
  kick: {
    id: `kick`,
    startup: 9,
    active: 4,
    recovery: 15,
    damage: 9,
    height: `mid`,
    hitstun: 22,
    blockstun: 13,
    knockdown: !1,
    launch: 0,
    push: 2,
    lunge: 1.4,
    chains: { kick: `roundhouse` },
  },
  uppercut: {
    id: `uppercut`,
    startup: 9,
    active: 4,
    recovery: 20,
    damage: 11,
    height: `mid`,
    hitstun: 24,
    blockstun: 15,
    knockdown: !0,
    launch: 8,
    push: 1.4,
    lunge: 1.8,
  },
  roundhouse: {
    id: `roundhouse`,
    startup: 11,
    active: 5,
    recovery: 22,
    damage: 13,
    height: `high`,
    hitstun: 26,
    blockstun: 16,
    knockdown: !0,
    launch: 5,
    push: 4.5,
    lunge: 1.6,
  },
  finisher: {
    id: `finisher`,
    startup: 10,
    active: 4,
    recovery: 20,
    damage: 12,
    height: `mid`,
    hitstun: 24,
    blockstun: 15,
    knockdown: !0,
    launch: 5.5,
    push: 3.5,
    lunge: 2.2,
  },
  lowJab: {
    id: `lowJab`,
    startup: 6,
    active: 3,
    recovery: 11,
    damage: 4,
    height: `low`,
    hitstun: 18,
    blockstun: 9,
    knockdown: !1,
    launch: 0,
    push: 1.2,
    lunge: 1,
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
    hitstun: 22,
    blockstun: 14,
    knockdown: !0,
    launch: 3.2,
    push: 1.6,
    lunge: 1,
    crouching: !0,
  },
  special1: {
    id: `special1`,
    startup: 13,
    active: 4,
    recovery: 19,
    damage: 13,
    height: `mid`,
    hitstun: 26,
    blockstun: 16,
    knockdown: !0,
    launch: 7.5,
    push: 2.2,
    lunge: 3,
  },
  special2: {
    id: `special2`,
    startup: 15,
    active: 5,
    recovery: 20,
    damage: 14,
    height: `mid`,
    hitstun: 26,
    blockstun: 16,
    knockdown: !0,
    launch: 4.5,
    push: 5.2,
    lunge: 2.6,
  },
  airPunch: {
    id: `airPunch`,
    startup: 4,
    active: 10,
    recovery: 0,
    damage: 6,
    height: `mid`,
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
    hitstun: 0,
    blockstun: 0,
    knockdown: !1,
    launch: 0,
    push: 0,
    lunge: 0,
  },
};
function lo(e, t, n) {
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
var uo = (e) => e.startup + e.active + e.recovery,
  fo = {
    jab: [0.2, 0.56, 0.95],
    cross: [0.1, 0.37, 0.8],
    uppercut: [0.15, 0.47, 1.2],
    palm: [1, 1.4, 2],
    lowjab: [0.55, 0.9, 1.5],
    kick: [0.25, 0.67, 1.4],
    highkick: [0.25, 0.73, 1.5],
    roundhouse: [0.5, 1, 1.9],
    spinback: [0.3, 0.9, 1.9],
    flyingkick: [0, 0.37, 1.4],
    hurricane: [0.46, 0.92, 1.8],
    sweep: [0.35, 0.87, 1.6],
    sweep360: [0.6, 1.3, 2.2],
    crescent: [0.9, 1.33, 1.9],
    butterfly: [1.45, 1.97, 2.5],
    jabelbow: [0.6, 1, 1.6],
    frontkick: [0.55, 0.97, 1.5],
    jabcross: [0.3, 0.67, 1.2],
    flipkick: [0.75, 1.33, 2],
    snapkick2: [0.3, 0.63, 1.2],
    thaiknee: [0.3, 0.63, 1.2],
    elbowhead: [0.4, 0.77, 1.3],
    stomp: [0.5, 0.93, 1.5],
    hook: [0.3, 0.63, 1.2],
    headbutt: [0.45, 0.87, 1.5],
    dropkick: [0.9, 1.4, 2.2],
    thrustkick: [0.6, 1.03, 1.6],
    elbowupper: [0.35, 0.7, 1.3],
    kneeupper: [1.3, 1.63, 2.2],
    mmaround: [0.4, 0.83, 1.4],
    spinback2: [1.3, 1.83, 2.4],
    quadpunch: [0.2, 0.5, 1.4],
    sidekick: [0.3, 0.7, 1.3],
    eightpunch: [0.9, 1.67, 2.45],
    spinflip: [1.3, 1.93, 2.6],
    twirl: [0.85, 1.3, 1.95],
    longhook: [0.25, 0.63, 1.2],
    pushkick: [0.8, 1.27, 1.8],
    bodypunch: [0.5, 0.9, 1.5],
  };
function U(e, t) {
  let [n, r, i] = fo[e.replace(/_m$/, ``)];
  return { clip: e, start: n, hit: r, end: i, open: t };
}
var po = [2.9, 5.9],
  mo = {
    modi: {
      stance: `guardbounce`,
      getup: po,
      strikes: {
        jab: U(`palm`, 1),
        cross: U(`jabelbow`),
        kick: U(`frontkick`),
        uppercut: U(`uppercut`),
        roundhouse: U(`crescent`),
        finisher: U(`butterfly`),
        lowJab: U(`lowjab`),
        sweep: U(`sweep360`),
        special1: U(`palm`, 1),
        special2: U(`flyingkick`),
        airPunch: U(`cross`),
        airKick: U(`kick`),
        grab: U(`palm`, 1),
      },
      chains: { cross: { punch: `special1`, kick: `finisher` } },
      combos: [
        { name: `Mann Ki Baat Palm`, inputs: `J, J, J` },
        { name: `Lamba Bhashan Butterfly`, inputs: `J, J, K` },
        { name: `Sunehre Din Crescent`, inputs: `J, K, K  or  K, K` },
      ],
    },
    rahul: {
      stance: `guardbounce`,
      pace: 1.3,
      getup: po,
      strikes: {
        jab: U(`jabcross`),
        cross: U(`jab_m`),
        kick: U(`kick_m`),
        uppercut: U(`uppercut_m`),
        roundhouse: U(`highkick_m`),
        finisher: U(`hurricane_m`),
        lowJab: U(`lowjab_m`),
        sweep: U(`sweep360_m`),
        special1: U(`uppercut`),
        special2: U(`flipkick`),
        airPunch: U(`jab`),
        airKick: U(`highkick`),
        grab: U(`palm_m`, 1),
      },
      chains: {
        cross: { punch: `uppercut`, kick: `special2` },
        kick: { kick: `finisher` },
      },
      combos: [
        { name: `Bharat Jodo Uppercut`, inputs: `J, J, J` },
        { name: `Yatra Flip Kick`, inputs: `J, J, K` },
        { name: `Khata-Khat Hurricane`, inputs: `K, K` },
      ],
    },
    didi: {
      stance: `stance`,
      pace: 1.35,
      getup: po,
      strikes: {
        jab: U(`palm_m`, 1),
        cross: U(`palm`, 1),
        kick: U(`snapkick2`),
        uppercut: U(`uppercut`, 1),
        roundhouse: U(`roundhouse_m`),
        finisher: U(`thaiknee`),
        lowJab: U(`lowjab`, 1),
        sweep: U(`stomp`),
        special1: U(`elbowhead`),
        special2: U(`kick_m`),
        airPunch: U(`cross_m`, 1),
        airKick: U(`kick_m`),
        grab: U(`palm_m`, 1),
      },
      chains: {
        cross: { punch: `special1`, kick: `finisher` },
        lowJab: { punch: `special1`, kick: `sweep` },
      },
      combos: [
        { name: `Khela Hobe Elbow`, inputs: `J, J, J  or  ↓J, J` },
        { name: `Didi Ka Ghutna`, inputs: `J, J, K` },
        { name: `Thappad-Thappad Stomp`, inputs: `↓J, K` },
      ],
    },
    trump: {
      stance: `stance`,
      pace: 0.7,
      getup: po,
      strikes: {
        jab: U(`cross_m`),
        cross: U(`hook`),
        kick: U(`kick_m`),
        uppercut: U(`uppercut`),
        roundhouse: U(`spinback`),
        finisher: U(`palm`, 1),
        lowJab: U(`lowjab_m`),
        sweep: U(`sweep`),
        special1: U(`headbutt`),
        special2: U(`dropkick`),
        airPunch: U(`cross`),
        airKick: U(`kick_m`),
        grab: U(`palm`, 1),
      },
      chains: {
        cross: { punch: `special1`, kick: `special2` },
        kick: { kick: `finisher` },
      },
      combos: [
        { name: `Huge Headbutt`, inputs: `J, J, J` },
        { name: `Dropkick Deal`, inputs: `J, J, K` },
        { name: `Tremendous Shove`, inputs: `K, K` },
      ],
    },
    yogi: {
      stance: `guardbounce`,
      pace: 0.65,
      getup: po,
      strikes: {
        jab: U(`cross`),
        cross: U(`cross_m`),
        kick: U(`thrustkick`),
        uppercut: U(`elbowupper`),
        roundhouse: U(`roundhouse`),
        finisher: U(`spinback`),
        lowJab: U(`lowjab`),
        sweep: U(`sweep360_m`),
        special1: U(`kneeupper`),
        special2: U(`roundhouse_m`),
        airPunch: U(`jab_m`),
        airKick: U(`highkick_m`),
        grab: U(`cross`, 1),
      },
      chains: {
        cross: { punch: `uppercut`, kick: `special1` },
        kick: { kick: `finisher` },
      },
      combos: [
        { name: `Bulldozer Elbow`, inputs: `J, J, J` },
        { name: `Akhada Knee`, inputs: `J, J, K` },
        { name: `Ram Kick Spinback`, inputs: `K, K` },
      ],
    },
    ravi: {
      stance: `stance`,
      pace: 1.1,
      getup: po,
      strikes: {
        jab: U(`jab`),
        cross: U(`palm_m`, 1),
        kick: U(`highkick`),
        uppercut: U(`uppercut`),
        roundhouse: U(`twirl`),
        finisher: U(`spinflip`),
        lowJab: U(`lowjab_m`),
        sweep: U(`sweep360`),
        special1: U(`eightpunch`),
        special2: U(`hurricane`),
        airPunch: U(`cross`),
        airKick: U(`kick`),
        grab: U(`palm`, 1),
      },
      chains: {
        cross: { punch: `special1`, kick: `roundhouse` },
        kick: { kick: `finisher` },
      },
      combos: [
        { name: `Aath Mukke Dhishoom`, inputs: `J, J, J` },
        { name: `Hero Twirl`, inputs: `J, J, K` },
        { name: `Climax Flip Kick`, inputs: `K, K` },
        { name: `Hurricane Entry`, inputs: `→K` },
      ],
    },
    lalu: {
      stance: `guardbounce`,
      pace: 0.85,
      getup: po,
      strikes: {
        jab: U(`cross_m`),
        cross: U(`longhook`),
        kick: U(`pushkick`),
        uppercut: U(`uppercut_m`),
        roundhouse: U(`spinback`),
        finisher: U(`spinback_m`),
        lowJab: U(`bodypunch`),
        sweep: U(`sweep`),
        special1: U(`palm_m`, 1),
        special2: U(`roundhouse`),
        airPunch: U(`jab`),
        airKick: U(`kick_m`),
        grab: U(`palm`, 1),
      },
      chains: {
        cross: { punch: `uppercut`, kick: `roundhouse` },
        kick: { kick: `finisher` },
      },
      combos: [
        { name: `Lathi Charge Uppercut`, inputs: `J, J, J` },
        { name: `Gaadi Spin Kick`, inputs: `J, J, K` },
        { name: `Dhakka Push-Spin`, inputs: `K, K` },
      ],
    },
    nitin: {
      stance: `guardbounce`,
      getup: po,
      strikes: {
        jab: U(`jab_m`),
        cross: U(`cross_m`),
        kick: U(`mmaround`),
        uppercut: U(`uppercut`),
        roundhouse: U(`spinback_m`),
        finisher: U(`spinback2`),
        lowJab: U(`lowjab_m`),
        sweep: U(`sweep360`),
        special1: U(`quadpunch`),
        special2: U(`sidekick`),
        airPunch: U(`cross`),
        airKick: U(`kick`),
        grab: U(`jab_m`),
      },
      chains: {
        cross: { punch: `special1`, kick: `finisher` },
        kick: { kick: `special2` },
      },
      combos: [
        { name: `Four-Lane Punches`, inputs: `J, J, J` },
        { name: `Expressway Spin Kick`, inputs: `J, J, K` },
        { name: `Toll Barrier Kick`, inputs: `K, K` },
      ],
    },
  },
  ho = {
    modi: {
      jab: [0.72, 1.57, 1.41],
      cross: [0.59, 1.53, 0.97],
      kick: [0.94, 0.93, 1.16],
      uppercut: [0.67, 1.32, 0.46],
      roundhouse: [1.05, 1.33, 1.34],
      finisher: [0.58, 0.96, 2.26],
      lowJab: [0.44, 0.99, 0.82],
      sweep: [1, 0.77, 1.34],
      special1: [0.72, 1.57, 1.41],
      special2: [0.94, 1.62, 0.44],
      airPunch: [0.75, 1.34, 0.37],
      airKick: [0.75, 1.34, 0.66],
    },
    rahul: {
      jab: [0.67, 1.08, 0.67],
      cross: [0.77, 1.39, 0.57],
      kick: [0.89, 1.34, 0.62],
      uppercut: [0.56, 1.46, 1.02],
      roundhouse: [0.85, 1.5, 0.56],
      finisher: [1.06, 1.16, 0.87],
      lowJab: [0.45, 1.2, 0.89],
      sweep: [0.97, 0.81, 1.44],
      special1: [0.67, 1.31, 0.46],
      special2: [0.92, 1.18, 1.32],
      airPunch: [0.64, 1.39, 0.57],
      airKick: [0.93, 1.54, 0.69],
    },
    didi: {
      jab: [0.58, 1.37, 1.77],
      cross: [0.61, 1.32, 1.41],
      kick: [0.75, 0.83, 0.67],
      uppercut: [0.57, 1.11, 0.46],
      roundhouse: [0.79, 1.15, 1.07],
      finisher: [0.33, 1, 0.84],
      lowJab: [0.38, 0.83, 0.82],
      sweep: [0.5, 0.1, 0.71],
      special1: [0.49, 1.1, 0.74],
      special2: [0.75, 1.13, 0.62],
      airPunch: [0.55, 1.14, 0.34],
      airKick: [0.75, 1.13, 0.62],
    },
    trump: {
      jab: [0.64, 1.4, 0.34],
      cross: [0.48, 1.16, 0.77],
      kick: [1.08, 1.39, 0.66],
      uppercut: [0.6, 1.34, 0.46],
      roundhouse: [1, 1.68, 0.94],
      finisher: [0.62, 1.68, 1.41],
      lowJab: [0.43, 1.29, 0.92],
      sweep: [0.92, 0.09, 0.89],
      special1: [0.48, 1.32, 0.82],
      special2: [0.88, 1.35, 1.37],
      airPunch: [0.68, 1.39, 0.37],
      airKick: [1.08, 1.39, 0.66],
    },
    yogi: {
      jab: [0.74, 1.2, 0.34],
      cross: [0.65, 1.2, 0.34],
      kick: [0.77, 0.91, 1.04],
      uppercut: [0.61, 1.31, 0.62],
      roundhouse: [0.95, 1.1, 0.97],
      finisher: [0.86, 1.4, 0.91],
      lowJab: [0.42, 0.98, 0.86],
      sweep: [0.94, 0.79, 1.44],
      special1: [0.39, 0.46, 1.34],
      special2: [0.9, 1.33, 1.07],
      airPunch: [0.78, 1.23, 0.57],
      airKick: [0.83, 1.46, 0.56],
    },
    nitin: {
      jab: [0.89, 1.39, 0.54],
      cross: [0.84, 1.25, 0.34],
      kick: [1.02, 1.57, 0.77],
      uppercut: [0.77, 1.19, 0.46],
      roundhouse: [0.84, 1.42, 1.04],
      finisher: [1.12, 1.38, 1.84],
      lowJab: [0.6, 1.09, 0.89],
      sweep: [1.09, 0.67, 1.34],
      special1: [0.73, 1.46, 1.17],
      special2: [0.97, 1.29, 0.71],
      airPunch: [0.9, 1.25, 0.34],
      airKick: [0.78, 1.27, 0.69],
    },
    ravi: {
      jab: [0.73, 1.28, 0.57],
      cross: [0.72, 1.49, 1.77],
      kick: [0.82, 1.38, 0.76],
      uppercut: [0.72, 1.07, 0.46],
      roundhouse: [0.92, 0.61, 1.69],
      finisher: [0.91, 1.26, 1.94],
      lowJab: [0.53, 1.07, 0.92],
      sweep: [0.94, 0.57, 1.34],
      special1: [0.69, 1.18, 1.64],
      special2: [0.75, 1.41, 0.5],
      airPunch: [0.82, 1.13, 0.37],
      airKick: [0.67, 0.95, 0.32],
    },
    lalu: {
      jab: [0.76, 1.02, 0.34],
      cross: [0.73, 1.11, 0.59],
      kick: [0.86, 0.93, 1.27],
      uppercut: [0.64, 1.28, 0.99],
      roundhouse: [0.76, 1.43, 0.94],
      finisher: [0.73, 1.36, 1.04],
      lowJab: [0.6, 0.54, 1.04],
      sweep: [0.75, 0.12, 0.89],
      special1: [0.75, 1.38, 1.77],
      special2: [0.92, 0.83, 0.94],
      airPunch: [0.74, 1.17, 0.57],
      airKick: [0.84, 1.18, 0.66],
    },
    mbapu: {
      jab: [0.78, 1.42, 0.61],
      cross: [0.85, 1.3, 0.37],
      kick: [0.8, 1.24, 0.69],
      uppercut: [0.72, 1.22, 0.49],
      roundhouse: [1.04, 1.05, 1.01],
      finisher: [1, 1.5, 0.97],
      lowJab: [0.48, 1, 0.89],
      sweep: [0.75, 0.03, 0.92],
      special1: [0.79, 1.65, 1.44],
      special2: [0.95, 1.57, 0.47],
      airPunch: [0.85, 1.3, 0.37],
      airKick: [1.1, 1.14, 1.44],
    },
  },
  go = {
    hp: 2,
    power: 1.15,
    super: 0.4,
    regen: 2,
    regenDelay: 3,
    budgetShare: 0.25,
    budgetSeconds: 15,
  },
  _o = 0.5,
  vo = {
    mbapu: {
      strikes: {
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
      },
      stance: `stance`,
      getup: [2.4, 4.9],
    },
    ...mo,
  };
for (let [e, t] of Object.entries(vo))
  for (let [n, r] of Object.entries(t.strikes)) {
    let i = ho[e][n];
    i && (t.strikes[n] = { ...r, hit: i[2] });
  }
function yo(e, t, n) {
  let r = vo[e]?.chains?.[t.id];
  return r && (n === `punch` || n === `kick`) && r[n] ? r[n] : t.chains?.[n];
}
function bo(e) {
  return vo[e] ?? vo.mbapu;
}
function xo(e, t, n) {
  if (n < t.startup) return e.start + (e.hit - e.start) * (n / t.startup);
  let r = n - t.startup - t.active;
  if (r < 0) return e.hit;
  let i = uo(t) - t.startup - t.active;
  return e.hit + (e.end - e.hit) * Math.min(1, r / Math.max(1, i));
}
function So(e) {
  if (e < Co) return { name: `bow`, time: 0.2 + e };
  let t = e - Co;
  return t < wo
    ? { name: `standsit`, time: (t / wo) * 1.15, fade: 0.3 }
    : { name: `lotus`, time: e, loop: !0, fade: 0.75 };
}
var Co = 1.5,
  wo = 0.8;
function To(e, t, n) {
  let r = e.stateFrames * qe,
    i = bo(e.char.id);
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
      let t = e.attack && i.strikes[e.attack.def.id];
      return e.attack && t
        ? {
            name: t.clip,
            time: xo(t, e.attack.def, e.attack.frame),
            fade: 0.06,
            open: t.open,
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
        time:
          i.getup[0] +
          (i.getup[1] - i.getup[0]) * Math.min(1, e.stateFrames / 24),
        fade: 0.05,
      };
    case `victory`:
      return So(r);
    case `intro`:
      return { name: `intro`, time: t, loop: !0, fade: 0.3 };
    case `idle`:
      return e.holdingBack && n
        ? { name: `block`, time: 0.45, fade: 0.08 }
        : { name: i.stance, time: t * (i.pace ?? 1), loop: !0 };
    default:
      return { name: i.stance, time: t * (i.pace ?? 1), loop: !0 };
  }
}
var Eo = [`modi`, `rahul`, `didi`, `trump`, `yogi`, `nitin`, `ravi`, `lalu`],
  Do = (e) => Eo.includes(e.char.id);
function Oo(e, t) {
  return Math.max(ho[e][t]?.[0] ?? 0, Qe);
}
var ko = {};
for (let e of Object.keys(co)) {
  let t = Eo.map((t) => Oo(t, e));
  ko[e] = co[e].air ? Math.min(...t) : t.reduce((e, t) => e + t, 0) / t.length;
}
function Ao(e, t) {
  let n = Oo(e.char.id, t);
  return co[t].air && Do(e) ? Math.min(n, ko[t]) : n;
}
function jo(e, t) {
  let n = co[t];
  if (!Do(e) || n.air || n.grab || !ho[e.char.id][t]) return 0;
  let r = (n.startup + 1) * qe;
  return Math.max(-n.lunge, (ko[t] - Oo(e.char.id, t)) / r);
}
var Mo = 30,
  No = new Set([`super`, `frozen`, `victory`, `intro`]),
  Po = new Set([
    `knockdown`,
    `getup`,
    `ko`,
    `super`,
    `frozen`,
    `victory`,
    `intro`,
  ]),
  Fo = class {
    get isBoss() {
      return this.boss;
    }
    get maxHp() {
      return 100 * this.hpScale;
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
        e(this, `boss`, !1),
        e(this, `hpScale`, 1),
        e(this, `power`, 1),
        e(this, `superShare`, null),
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
      return Po.has(this.state);
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
      ((this.attack = { def: co[e], frame: 0, hasHit: !1 }),
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
          ? (this.superBuffer = Mo)
          : this.superBuffer > 0 && this.superBuffer--,
        No.has(this.state))
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
              def: co[e === `kick` ? `airKick` : `airPunch`],
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
        ? this.startAttack(lo(r, this.crouching, n > 0))
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
          ? (this.vx =
              (t.lunge + (e.frame <= t.startup + 1 ? jo(this, t.id) : 0)) *
              this.facing)
          : (this.vx *= 0.75),
        t.chains && e.hasHit && this.buffer && e.frame >= t.startup + t.active)
      ) {
        let e = yo(this.char.id, t, this.buffer.button);
        if (e) {
          ((this.buffer = null), this.startAttack(e));
          return;
        }
      }
      e.frame >= uo(t) &&
        ((this.attack = null),
        (this.crouching = !!t.crouching),
        this.enter(t.crouching ? `crouch` : `idle`));
    }
    integrate() {
      let e = this.y > 0 || this.vy !== 0;
      (e && (this.vy -= 24 * qe),
        (this.x += this.vx * qe),
        (this.y += this.vy * qe),
        this.state === `walk` && (this.walkDistance += Math.abs(this.vx) * qe),
        (this.x = Math.max(-j, Math.min(j, this.x))),
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
    stepPhysics() {
      this.integrate();
    }
  },
  Io = {
    godi: { name: `SHOR SHARMA`, channel: `BREAKING BAKWAS` },
    troll: { name: `TWEETY TROLLWALA`, channel: `TROLL ARMY` },
  };
function Lo(e, t) {
  return e === `modi` || t === `rahul`
    ? { godi: e, troll: t }
    : t === `modi` || e === `rahul`
      ? { godi: t, troll: e }
      : { godi: e, troll: t };
}
var Ro = { godi: `modi`, troll: `rahul` };
function zo(e, t) {
  return ((Ro = Lo(e, t)), Ro);
}
var Bo = {
    modi: `MITRAMAN`,
    rahul: `YATRA BOY`,
    didi: `DEEDEE`,
    trump: `TARIFF TAAU`,
    yogi: `DOZER DADA`,
    nitin: `TOLL MAN`,
    mbapu: `MBAPU`,
    ravi: `SUTTI BABU`,
    lalu: `RAIL RAJA`,
  },
  Vo = {
    modi: `MitraMan ji`,
    rahul: `Yatra bhai`,
    didi: `Deedee ji`,
    trump: `Taau ji`,
    yogi: `Dada ji`,
    nitin: `Toll bhau`,
    mbapu: `Mbapu ji`,
    ravi: `Babu ji`,
    lalu: `Raja ji`,
  },
  Ho = (e, t) => e[Math.min(e.length - 1, Math.floor(t() * e.length))],
  Uo = (e, t) => e.replace(/\{(\w+)\}/g, (e, n) => t[n] ?? ``),
  Wo = (e) => (Ro.godi === e ? `godi` : `troll`),
  Go = (e) => (e === `godi` ? `troll` : `godi`),
  Ko = (e) => (Ro.godi === e ? Ro.troll : Ro.godi);
function qo(e, t, n, r, i) {
  let a = { ticker: r, priority: i };
  return ((a[e] = t), (a[Go(e)] = n), a);
}
var Jo = {
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
  Yo = {
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
  Xo = [
    `BREAKING: {A}'s {M} lands. Experts call it a masterstroke!`,
    `KURSI INDEX {DIR} {N} points after {A}'s {M}`,
    `{D} demands JPC probe into {M}`,
    `Opposition stages walkout after {M}`,
    `Twitter splits into two after {A}'s {M}`,
    `Panel of 14 experts shouting simultaneously over {M}`,
    `Fact-checkers still verifying {M}. Results by 2029.`,
  ],
  Zo = [
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
function Qo(e) {
  let t = 35 + Math.floor(e() * 40),
    n = 35 + Math.floor(e() * 40),
    r = Math.floor(e() * 30);
  return `FAKE POLL: ${Bo[Ro.godi]} ${t}% · ${Bo[Ro.troll]} ${n}% · OTHERS ${r}% · TOTAL ${t + n + r}% · Margin of error: ±100%`;
}
function $o(e, t = Math.random) {
  switch (e.kind) {
    case `roundStart`:
      return {
        godi: e.final
          ? `FINAL ROUND! Desh dekh raha hai!`
          : `Round ${e.round}! ${Vo[Ro.godi]} is READY!`,
        troll: e.final
          ? `Final round, bhai. Popcorn ready!`
          : `Round ${e.round}! ${Vo[Ro.troll]} warming up!`,
        ticker: Qo(t),
        priority: !0,
      };
    case `hit`: {
      let n = {
          A: Bo[e.attacker],
          D: Bo[Ko(e.attacker)],
          AN: Vo[e.attacker],
          DN: Vo[Ko(e.attacker)],
          M: e.move.replace(/!$/, ``),
          DIR: t() < 0.5 ? `jumps` : `crashes`,
          N: String(100 + Math.floor(t() * 900)),
        },
        r = Wo(e.attacker),
        i = e.knockdown || t() < 0.35 ? Uo(Ho(Xo, t), n) : void 0;
      return qo(
        r,
        Uo(Ho(Jo[r], t), n),
        Uo(Ho(Yo[Go(r)], t), n),
        i,
        e.knockdown,
      );
    }
    case `block`:
      return qo(
        Wo(Ko(e.attacker)),
        Ho(
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
      let t = Wo(e.caster),
        n = es[e.caster];
      return qo(
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
          godi: `Time up! ${Vo[Ro.godi]} was just being merciful!`,
          troll: `Time up! Moral victory for ${Vo[Ro.troll]}!`,
          ticker: `TIME UP: Both sides claim victory, celebrations planned`,
          priority: !0,
        };
      let t = Wo(e.winner);
      return qo(
        t,
        {
          godi: `K.O.! Is baar, knockout paar!`,
          troll: `K.O.! Pack it up, bots!`,
        }[t],
        {
          godi: `Scoreboard malfunction! Recount demanded!`,
          troll: `Rigged! We demand a re-match!`,
        }[Go(t)],
        `BREAKING: ${Bo[e.winner]} wins by K.O. Opposition calls emergency meeting`,
        !0,
      );
    }
    case `roundWin`:
      return {
        ticker: e.perfect
          ? `PERFECT ROUND for ${Bo[e.winner]}! Not a single scratch, say sources`
          : `${Bo[e.winner]} takes the round. Sweets distributed outside party office`,
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
      return qo(
        Wo(e.kicker),
        `Collateral chai! Minor loss for the nation!`,
        `${Bo[e.kicker]} kicked the chai bhaiya's cup! Shame!`,
        `BREAKING: Chai cup lost in crossfire. ${Bo[e.kicker]} blamed.`,
        !0,
      );
    case `bored`:
      return {
        godi: `Kuch toh karo! Viewers are switching channels!`,
        troll: `Chat is dead. Crowd is eating samosas now 💀`,
        ticker: Ho(
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
      let t = Wo(e.leader);
      return qo(
        t,
        {
          godi: `Comeback! ${Bo[e.leader]} wave is back!`,
          troll: `Comeback arc loading... ${Vo[e.leader]} era!`,
        }[t],
        void 0,
        void 0,
        !1,
      );
    }
  }
}
var es = {
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
    ravi: {
      hype: `TIME IS MONEY! Sikke bhi uske fan hain!`,
      spin: `Bro froze time and got chased by his own coins 💀`,
      ticker: `Clock towers across India run backwards as a coin dragon is spotted`,
    },
    lalu: {
      hype: `RAIL RAJA EXPRESS! Superfast, no waiting list!`,
      spin: `Bro got hit by the 3:15 express 💀`,
      ticker: `Railways announce a new non-stop service through Sansad`,
    },
    mbapu: {
      hype: `MANCH CHHODO! Shanti wheel spinning at lightspeed!`,
      spin: `Bro got gift-wrapped and thrown off the stage 💀`,
      ticker: `Shanti Index hits a record high across the stage`,
    },
  },
  ts = {
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
    ravi: [
      `"Main late nahi, bas thoda jaldi haar gaya." — Babu camp`,
      `"Shooting chal rahi thi, retake hoga." — Babu camp`,
      `"Interval hua hai, climax abhi aayega." — Babu camp`,
    ],
    lalu: [
      `"Signal laal tha, isliye ruk gaye." — Raja camp`,
      `"Gaadi late thi, haar nahi." — Raja camp`,
      `"Agli baar superfast se aayenge." — Raja camp`,
    ],
    mbapu: [
      `"Shanti kamzori nahi, strategy hai." — Mbapu camp`,
      `"Main sirf aapka sabar dekh raha tha." — Mbapu camp`,
      `"Aaj ka sabak poora hua." — Mbapu camp`,
    ],
  };
function ns(e, t, n, r = Math.random) {
  let i = Math.max(...n),
    a = Math.min(...n),
    o = i - a >= 2;
  return {
    masthead: Ho(
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
          ravi: `SUTTI BABU STEALS THE SHOW!`,
          lalu: `RAIL RAJA RUNS OVER SANSAD!`,
        }[e]
      : {
          modi: `MITRAMAN SCRAPES THROUGH!`,
          rahul: `YATRA BOY WINS THRILLER!`,
          didi: `DEEDEE SITS ON VICTORY!`,
          trump: `TARIFF TAAU CLOSES THE DEAL!`,
          yogi: `DOZER DADA WINS BY A WHISKER!`,
          nitin: `TOLL MAN WINS IN THE FAST LANE!`,
          mbapu: `MBAPU WINS WITH SABAR & SHANTI!`,
          ravi: `SUTTI BABU WINS IN THE LAST REEL!`,
          lalu: `RAIL RAJA ARRIVES JUST IN TIME!`,
        }[e],
    sub: o
      ? `LANDSLIDE ${i}–${a} · Opposition in shock`
      : `NAIL-BITER ${i}–${a} · Recount demanded`,
    excuse: Ho(ts[t], r),
  };
}
var rs = {
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
  ravi: [
    `Jaldi aao, late mat karo!`,
    `Home from work chalo!`,
    `Step dekho, step!`,
  ],
  lalu: [
    `Gaadi chhoot jayegi, jaldi aao!`,
    `Kulhad wali chai piyoge?`,
    `Yatrigan, dhyan dein!`,
  ],
  mbapu: [
    `Shanti rakho... par defense bhi seekho!`,
    `Sabar se bada koi hathiyar nahi.`,
    `Gehri saans lo, phir haaro!`,
  ],
};
function is(e, t = Math.random) {
  return Ho(rs[e], t);
}
var as = [
    `Chai! Chai!`,
    `Garam chai!`,
    `Cutting chai, ₹10!`,
    `Chai le lo, chai!`,
  ],
  os = [`Arre! Mera cup!`, `Oye! Chai gira di!`, `Paise kaun dega?!`];
function ss(e, t = 0.7, n = 0) {
  return new C({ color: e, roughness: t, metalness: n });
}
function W(e, t, n, r = 0, i = 0, a = 0) {
  let o = new S(e, t);
  return (o.position.set(r, i, a), (o.castShadow = !0), n.add(o), o);
}
var cs = null;
function ls() {
  if (cs) return cs;
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
    (n.colorSpace = i),
    (n.wrapS = n.wrapT = oe),
    n.repeat.set(3, 3),
    (n.userData.shared = !0),
    (cs = n),
    n
  );
}
function us(e) {
  e.traverse((e) => e.geometry?.dispose());
}
function ds(e, t, n, r) {
  let i = new y();
  return (i.position.set(t, n, r), e.add(i), i);
}
function fs() {
  let e = new y(),
    t = new C({
      color: 15267071,
      transparent: !0,
      opacity: 0.55,
      roughness: 0.1,
    });
  return (
    W(new O(0.035, 0.026, 0.075, 14, 1, !0), t, e, 0, 0.037, 0),
    (W(new Re(0.032, 14), ss(10510634, 0.4), e, 0, 0.06, 0).rotation.x =
      -Math.PI / 2),
    W(new O(0.03, 0.026, 0.05, 14), ss(12088115, 0.5), e, 0, 0.03, 0),
    e
  );
}
function ps(e) {
  let t = Math.abs(e);
  return t <= 7.75
    ? 0
    : t < 8.05
      ? -0.075
      : Math.min(4, Math.floor((t - 8.05) / 0.9)) * 0.45 - 0.075;
}
var ms = class {
  constructor(t, n = Math.random, r = Mt) {
    (e(this, `scene`, void 0),
      e(this, `rng`, void 0),
      e(this, `root`, new y()),
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
    let i = ss(10709829, 0.55),
      a = ls(),
      o = new C({ color: a ? 16777215 : 1710620, map: a, roughness: 0.75 }),
      s = ss(2764602, 0.85),
      c = ss(920330, 0.55),
      l = ss(11735594, 0.6);
    this.body = ds(this.root, 0, 0.82, 0);
    let u = (e) => {
      let t = ds(this.body, e * 0.09, 0, 0);
      return (
        W(new ge(0.075, 0.6, 4, 10), s, t, 0, -0.38, 0),
        W(new w(0.09, 0.05, 0.2), ss(4860952, 0.6), t, 0, -0.79, 0.04),
        t
      );
    };
    ((this.legs = [u(1), u(-1)]),
      W(new ge(0.17, 0.42, 6, 14), o, this.body, 0, 0.32, 0));
    for (let e of [1, -1])
      W(
        new w(0.09, 0.03, 0.12),
        o,
        this.body,
        e * 0.07,
        0.66,
        0.06,
      ).rotation.set(0.5, 0, e * 0.5);
    (W(
      new E(0.075, 0.006, 4, 20, Math.PI),
      ss(14212580, 0.2, 0.9),
      this.body,
      0,
      0.62,
      0.12,
    ).rotation.set(-0.4, 0, Math.PI),
      W(new ne(0.018), ss(14212580, 0.2, 0.9), this.body, 0, 0.535, 0.16),
      (this.head = ds(this.body, 0, 0.78, 0)),
      W(new D(0.12, 18, 14), i, this.head, 0, 0, 0),
      W(
        new D(0.14, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.6),
        c,
        this.head,
        0,
        0.04,
        -0.025,
      ).scale.set(1.1, 1.25, 1.05));
    let d = W(new w(0.17, 0.05, 0.04), c, this.head, 0.03, 0.085, 0.1);
    d.rotation.z = -0.3;
    for (let e of [1, -1]) {
      let t = W(new w(0.04, 0.2, 0.12), c, this.head, e * 0.125, -0.05, -0.04);
      t.rotation.z = e * 0.12;
      let n = W(new w(0.04, 0.07, 0.08), l, this.head, e * 0.13, -0.18, -0.03);
      n.rotation.z = e * 0.15;
    }
    W(new w(0.22, 0.18, 0.05), c, this.head, 0, -0.06, -0.12);
    let f = W(new ge(0.016, 0.085, 4, 8), c, this.head, 0, -0.04, 0.115);
    ((f.rotation.z = Math.PI / 2),
      W(new D(0.018, 8, 6), c, this.head, 0, -0.095, 0.1).scale.set(
        1,
        1.4,
        0.7,
      ));
    let p = ss(13222576, 0.3, 0.8),
      m = new C({
        color: 15913274,
        roughness: 0.1,
        metalness: 0.1,
        transparent: !0,
        opacity: 0.75,
      });
    for (let e of [1, -1]) {
      (W(new Re(0.048, 16), m, this.head, e * 0.047, 0.012, 0.118).scale.set(
        1.15,
        0.85,
        1,
      ),
        W(
          new E(0.049, 0.005, 4, 18),
          p,
          this.head,
          e * 0.047,
          0.012,
          0.118,
        ).scale.set(1.15, 0.85, 1));
      let t = W(new w(0.006, 0.006, 0.12), p, this.head, e * 0.11, 0.02, 0.06);
      t.rotation.y = e * 0.15;
    }
    W(new w(0.03, 0.006, 0.006), p, this.head, 0, 0.03, 0.12);
    let h = (e) => {
        let t = ds(this.body, e * 0.21, 0.58, 0);
        (W(new ge(0.05, 0.22, 4, 8), o, t, 0, -0.13, 0),
          W(new O(0.058, 0.058, 0.05, 12), o, t, 0, -0.25, 0));
        let n = ds(t, 0, -0.28, 0);
        return (
          W(new ge(0.042, 0.2, 4, 8), i, n, 0, -0.12, 0),
          W(new D(0.045, 10, 8), i, n, 0, -0.26, 0),
          [t, n]
        );
      },
      [g, _] = h(1),
      [v, b] = h(-1);
    ((this.arms = [g, v]), (this.elbows = [_, b]));
    let x = ds(_, 0, -0.38, 0),
      S = ss(13159634, 0.25, 0.85);
    (W(new O(0.075, 0.09, 0.16, 18), S, x, 0, 0, 0),
      W(new D(0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), S, x, 0, 0.08, 0));
    let ee = W(new O(0.012, 0.02, 0.14, 8), S, x, 0, 0.03, 0.1);
    ee.rotation.x = 0.9;
    let te = W(new E(0.06, 0.008, 6, 16, Math.PI), S, x, 0, 0.12, 0);
    te.rotation.y = Math.PI / 2;
    for (let e = 0; e < 3; e++) {
      let e = new le(
        new De({
          color: 16777215,
          transparent: !0,
          opacity: 0.25,
          depthWrite: !1,
        }),
      );
      (e.scale.setScalar(0.08), x.add(e), this.steam.push(e));
    }
    ((this.cupHand = ds(b, 0, -0.3, 0.02)),
      (this.cup = fs()),
      this.cupHand.add(this.cup),
      r && to({ body: this.body, head: this.head, kurta: o, kettle: x }),
      (this.stopAt = this.pickStop()),
      this.root.position.set(this.x, ps(this.x), this.z));
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
    return os[Math.floor(this.rng() * os.length)];
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
            (n.shout = as[Math.floor(this.rng() * as.length)]),
            (this.stopAt = this.pickStop())),
          Math.abs(this.x) > 9.2 &&
            ((this.dir = this.x > 0 ? -1 : 1),
            (this.x = Math.sign(this.x) * 9.2))),
      this.newCupTimer > 0 &&
        ((this.newCupTimer -= e),
        this.newCupTimer <= 0 &&
          !this.cup &&
          ((this.cup = fs()), this.cupHand.add(this.cup))));
    let i = ps(this.x);
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
          (this.scene.remove(n.obj), us(n.obj), this.flying.splice(t, 1)));
    }
    return n;
  }
  dispose() {
    (this.scene.remove(this.root), us(this.root));
    for (let e of this.flying) (this.scene.remove(e.obj), us(e.obj));
    this.flying.length = 0;
  }
};
function hs(e, t = 0.8, n = 0) {
  return new C({ color: e, roughness: t, metalness: n });
}
function gs(e, t, n, r, i, a = 0, o = 0, s = 0) {
  let c = new S(new D(1, 20, 14), r);
  return (
    c.scale.set(e, t, n),
    c.position.set(a, o, s),
    (c.castShadow = !0),
    i.add(c),
    c
  );
}
function _s(e, t, n, r) {
  let i = new y();
  return (i.position.set(t, n, r), e.add(i), i);
}
function vs() {
  let e = new y(),
    t = hs(15854818, 0.85),
    n = hs(12169638, 0.85),
    r = hs(13212306, 0.6),
    i = hs(2762018, 0.6),
    a = _s(e, 0, 0, 0);
  (gs(0.33, 0.36, 0.78, t, a, 0, 1, 0),
    gs(0.2, 0.2, 0.22, t, a, 0, 1.33, 0.42),
    gs(0.12, 0.22, 0.2, t, a, 0, 0.82, 0.68),
    gs(0.2, 0.18, 0.22, n, a, 0.18, 1.08, -0.25),
    gs(0.16, 0.14, 0.18, n, a, -0.17, 0.98, 0.18));
  let o = [];
  for (let [e, n] of [
    [0.17, 0.5],
    [-0.17, 0.5],
    [0.17, -0.52],
    [-0.17, -0.52],
  ]) {
    let r = _s(a, e, 0.82, n),
      s = new S(new ge(0.065, 0.62, 4, 10), t);
    ((s.position.y = -0.38), (s.castShadow = !0), r.add(s));
    let c = new S(new O(0.07, 0.075, 0.08, 10), i);
    ((c.position.y = -0.76), r.add(c), o.push(r));
  }
  let s = _s(a, 0, 1.22, 0.78),
    c = gs(0.14, 0.15, 0.24, t, s, 0, 0, 0.12);
  c.rotation.x = 0.5;
  let l = gs(0.11, 0.09, 0.1, r, s, 0, -0.14, 0.3);
  l.rotation.x = 0.4;
  for (let e of [1, -1])
    gs(0.018, 0.012, 0.01, hs(3809312), s, e * 0.04, -0.15, 0.39);
  let u = gs(0.08, 0.035, 0.08, r, s, 0, -0.2, 0.25);
  for (let e of [1, -1]) {
    gs(0.025, 0.03, 0.02, hs(1118481, 0.3), s, e * 0.1, 0.05, 0.18);
    let n = gs(0.1, 0.035, 0.05, t, s, e * 0.17, 0, 0.05);
    n.rotation.z = e * -0.6;
    let r = new S(new ue(0.035, 0.22, 10), hs(16747546, 0.5));
    (r.position.set(e * 0.1, 0.17, 0.02), (r.rotation.z = e * -0.55), s.add(r));
    let i = new S(new ue(0.018, 0.08, 8), hs(1280008, 0.5));
    (i.position.set(e * 0.165, 0.27, 0.02),
      (i.rotation.z = e * -0.55),
      s.add(i));
  }
  gs(0.012, 0.03, 0.005, hs(14032671, 0.5), s, 0, 0.06, 0.25);
  let d = new S(new E(0.22, 0.04, 8, 24), hs(16751130, 0.9));
  (d.position.set(0, 1.05, 0.66), (d.rotation.x = 1.2), a.add(d));
  let f = new S(new D(0.055, 12, 10), hs(13936192, 0.3, 0.8));
  (f.position.set(0, 0.8, 0.8), a.add(f));
  let p = _s(a, 0, 1.15, -0.75),
    m = new S(new O(0.012, 0.018, 0.6, 6), t);
  ((m.position.y = -0.3), p.add(m));
  let h = gs(0.04, 0.08, 0.04, hs(2762018), p, 0, -0.62, 0);
  return (
    (h.castShadow = !1),
    (p.rotation.x = 0.25),
    { root: e, legs: o, head: s, tail: p, jaw: u }
  );
}
var ys = class t {
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
      (this.parts = vs()),
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
(e(ys, `SPEED`, 3), e(ys, `MOO_PAUSE`, 1));
var bs = 0.1,
  xs = {
    shackle: {
      from: 0.9,
      rows: [
        [
          0, 0.396, 1.173, -0.519, -0.027, 0.129, -0.826, 2.55, 1.047, 0.223,
          -0.153, -0.167, 0.336, 0.601,
        ],
        [
          -0.081, 0.493, 1.105, -0.312, 0.084, 0.107, 0.265, 1.476, 0.652,
          0.399, -0.198, -0.614, 0.293, 1.246,
        ],
        [
          -0.13, 0.571, 1.102, -0.198, 0.228, 0.14, 0.872, 1.133, 0.475, 0.517,
          -0.369, -0.757, 0.28, 1.279,
        ],
        [
          -0.172, 0.615, 1.11, -0.106, 0.243, 0.17, 1.002, 1.2, 0.44, 0.563,
          -0.327, -0.707, 0.247, 1.236,
        ],
        [
          -0.231, 0.665, 1.121, -0.042, 0.19, 0.177, -2.074, 1.343, 0.441,
          0.539, -0.322, -0.625, 0.392, 1.246,
        ],
        [
          -0.298, 0.737, 1.145, -0.052, 0.215, 0.23, -2.032, 1.401, 0.599,
          0.596, -0.44, -0.662, 0.777, 1.004,
        ],
        [
          -0.301, 0.795, 1.154, -0.037, 0.352, 0.245, -1.982, 1.231, 0.614,
          0.686, -0.342, -0.459, 0.475, 0.873,
        ],
        [
          -0.295, 0.841, 1.074, 0.07, 0.503, 0.136, -1.148, 1.112, 0.545, 0.81,
          -0.423, -0.259, 0.423, 1.2,
        ],
        [
          -0.305, 0.87, 0.921, 0.09, 0.566, 0.115, -0.689, 1.2, 0.419, 0.766,
          -0.409, 0.02, 1.059, 0.515,
        ],
        [
          -0.309, 0.851, 0.714, 0.139, 0.836, 0.181, -0.936, 1.269, 0.28, 0.697,
          -0.398, 0.071, 1.491, 0.474,
        ],
        [
          -0.327, 0.828, 0.602, 0.233, -2.082, 0.254, 1.704, -1.932, 0.989,
          0.905, 2.726, 2.922, 1.702, 0.476,
        ],
        [
          -0.338, 0.801, 0.572, 0.285, -1.572, 0.264, 1.035, -2.311, 1.114,
          1.127, 2.186, 1.803, 1.882, 0.334,
        ],
        [
          -0.315, 0.769, 0.578, 0.239, -1.168, 0.272, 0.622, -2.716, 1.092,
          1.055, 1.799, 1.208, 1.896, 0.427,
        ],
        [
          -0.299, 0.751, 0.58, 0.166, -1.38, 0.25, 0.849, -2.35, 1.023, 0.961,
          1.981, 1.65, 1.805, 0.512,
        ],
        [
          -0.32, 0.793, 0.616, 0.125, -0.894, 0.197, 0.503, -2.905, 0.781,
          0.714, 1.437, 1.35, 1.897, 0.618,
        ],
        [
          -0.328, 0.837, 0.658, 0.05, -0.029, 0.223, -0.208, 2.34, 0.546, 0.456,
          0.491, 0.386, 2.032, 0.703,
        ],
        [
          -0.256, 0.796, 0.719, -0.069, 0.473, 0.158, -0.462, 1.469, 0.289,
          0.601, -0.111, 0.085, 2.167, 1.017,
        ],
        [
          -0.139, 0.715, 0.769, -0.177, 0.643, 0.107, -0.451, 1.367, 0.485,
          1.051, -0.395, -0.172, 2.034, 0.833,
        ],
        [
          -0.089, 0.705, 0.759, -0.23, 0.747, 0.139, -0.809, 1.284, 1.464,
          1.011, -0.746, -0.214, 1.939, 0.555,
        ],
        [
          -0.066, 0.709, 0.683, -0.196, 0.949, 0.193, -1.302, 1.212, 0.773,
          1.096, -1.596, -0.271, 1.784, 0.522,
        ],
        [
          -0.045, 0.743, 0.518, -0.187, 1.171, 0.229, -1.516, 1.167, 0.68,
          0.995, -2.24, -0.251, 1.539, 0.413,
        ],
        [
          -0.026, 0.751, 0.31, -0.167, 1.186, 0.255, -1.332, -1.628, 1.621,
          0.484, 3.141, 0.241, 1.265, 0.063,
        ],
        [
          0.006, 0.764, 0.188, -0.157, 1.385, 0.23, -1.356, -1.258, 1.783, 1.34,
          3.134, 0.342, 1.781, 0.327,
        ],
        [
          0.031, 0.742, 0.189, -0.222, 1.406, 0.201, -1.125, -1.373, 1.946,
          1.416, 3.126, 0.308, 2.418, 0.501,
        ],
        [
          0.061, 0.729, 0.165, -0.312, 1.472, 0.178, -1.038, -1.332, 2.153,
          1.539, -3.049, 0.128, 2.465, 0.444,
        ],
        [
          0.06, 0.738, 0.159, -0.4, 1.487, 0.174, -1.005, -1.383, 2.198, 1.503,
          -2.819, 0.075, 1.974, 0.263,
        ],
        [
          0.069, 0.736, 0.162, -0.503, 1.495, 0.133, -0.909, -1.364, 2.269,
          1.505, -2.636, 0.011, 1.47, 0.184,
        ],
        [
          0.097, 0.709, 0.165, -0.65, 1.483, 0.106, -0.876, -1.413, 2.268, 1.44,
          -2.617, -0.006, 1.592, 0.217,
        ],
      ],
    },
    slammer: {
      from: 3.6,
      rows: [
        [
          0, 0.494, 1.183, 0.094, -0.121, 0.02, 0.475, -0.519, 0.823, 0.416,
          0.478, -0.195, 0.991, 0.69,
        ],
        [
          0.051, 0.421, 1.152, 0.142, -0.078, 0.041, 0.613, -0.706, 1.436,
          0.858, 0.349, -0.392, 1.009, 0.957,
        ],
        [
          0.091, 0.372, 1.118, 0.173, -0.048, 0.058, 0.714, -0.627, 1.512,
          1.353, 0.27, -0.556, 0.962, 1.074,
        ],
        [
          0.092, 0.381, 1.104, 0.151, 0.001, 0.057, 0.684, -0.474, 1.881, 1.867,
          0.234, -0.621, 0.973, 1.207,
        ],
        [
          0.069, 0.438, 1.084, 0.111, 0.074, 0.048, 0.823, -0.612, 1.971, 1.834,
          0.192, -0.557, 0.966, 0.982,
        ],
        [
          0.022, 0.529, 1.068, 0.075, 0.184, 0.043, 0.872, -0.743, 1.978, 1.723,
          0.119, -0.565, 0.958, 0.876,
        ],
        [
          -0.02, 0.594, 1.076, 0.076, 0.265, 0.057, 0.696, -0.604, 2.113, 1.682,
          0.039, -0.648, 0.896, 0.832,
        ],
        [
          -0.048, 0.643, 1.096, 0.099, 0.311, 0.056, 0.638, -0.272, 2.071,
          1.554, -0.008, -0.676, 0.87, 0.835,
        ],
        [
          -0.101, 0.712, 1.132, 0.106, 0.299, 0.085, 0.563, -0.316, 1.467,
          1.443, 0.041, -0.645, 0.903, 0.865,
        ],
        [
          -0.139, 0.748, 1.173, 0.077, 0.197, 0.151, 0.408, -0.379, 0.725,
          1.434, 0.202, -0.534, 1.01, 1.06,
        ],
        [
          -0.128, 0.721, 1.184, -0.006, 0.06, 0.242, 0.552, -0.38, 0.443, 1.512,
          0.41, -0.368, 1.129, 1.201,
        ],
        [
          -0.088, 0.688, 1.174, -0.137, 0.038, 0.275, 1.942, -0.577, 1.105,
          1.422, 0.455, -0.309, 1.114, 1.161,
        ],
        [
          -0.081, 0.698, 1.166, -0.23, 0.065, 0.257, 2.374, -0.685, 0.574,
          1.182, 0.491, -0.31, 1.09, 1.21,
        ],
        [
          -0.088, 0.71, 1.209, -0.321, 0.058, 0.209, 2.659, -0.493, 0.963, 1.14,
          0.436, -0.263, 0.851, 1.062,
        ],
        [
          -0.116, 0.733, 1.263, -0.432, 0.016, 0.165, 2.78, -0.249, 1.323,
          1.159, 0.353, -0.225, 0.425, 0.732,
        ],
        [
          -0.124, 0.717, 1.274, -0.536, -0.068, 0.169, 2.313, -0.054, 1.063,
          1.248, 0.434, -0.138, 0.436, 0.603,
        ],
        [
          -0.16, 0.707, 1.228, -0.611, -0.242, 0.228, 1.66, 0.135, 0.572, 1.419,
          0.669, 0.094, 0.712, 0.989,
        ],
        [
          -0.208, 0.685, 1.066, -0.61, -0.57, 0.342, 1.855, -0.063, 1.098,
          1.819, 1.048, 0.48, 1.06, 1.256,
        ],
        [
          -0.223, 0.617, 0.87, -0.648, -1.202, 0.562, 2.237, -0.242, 0.744,
          1.509, 1.731, 1.073, 1.295, 1.35,
        ],
        [
          -0.182, 0.442, 0.734, -0.725, -2.257, 0.54, -0.425, 0.699, 0, 0.848,
          2.444, 2.026, 0.272, 0.611,
        ],
        [
          -0.126, 0.292, 0.615, -0.699, -2.52, 0.258, -0.169, 0.958, 0, 1.003,
          2.549, 2.15, 0.725, 0.642,
        ],
        [
          -0.104, 0.204, 0.472, -0.693, -2.408, 0.352, -0.593, 1.112, 0, 1.323,
          -0.368, 1.389, 1.289, 1.292,
        ],
        [
          -0.109, 0.191, 0.351, -0.632, -1.749, 0.464, -2.726, 0.895, 0.291,
          1.35, -1.442, -0.945, 1.423, 1.793,
        ],
        [
          -0.135, 0.222, 0.274, -0.646, -0.976, 0.423, 1.796, 0.154, 0.382,
          1.235, -2.496, -1.961, 1.545, 2.129,
        ],
        [
          -0.153, 0.221, 0.18, -0.753, -1.049, 0.403, 2.031, 0.032, 0.923,
          0.698, -2.934, -1.731, 1.653, 2.283,
        ],
        [
          -0.136, 0.204, 0.119, -0.928, -1.785, 0.494, 3.1, 0.929, 0.795, 0.936,
          -2.312, -1.188, 1.901, 2.186,
        ],
        [
          -0.117, 0.164, 0.093, -1.042, -1.899, 0.601, -3.04, 0.8, 0.699, 0.986,
          -2.065, -0.974, 1.3, 1.85,
        ],
        [
          -0.109, 0.16, 0.115, -1.107, -0.853, 0.697, 2.129, -0.358, 0.647,
          1.004, -3.125, -1.924, 1.186, 1.913,
        ],
      ],
    },
    takedown: {
      from: 0.5,
      rows: [
        [
          0, 0.959, 1.213, 0.244, -0.149, 0.106, 0.652, 0.84, 1.859, 1.902,
          0.779, 0.33, 0.868, 0.845,
        ],
        [
          0.221, 0.743, 1.191, 0.339, -0.16, 0.11, 0.919, 0.846, 1.81, 1.884,
          0.858, 0.395, 0.954, 0.963,
        ],
        [
          0.458, 0.509, 1.168, 0.405, -0.37, 0.156, 1.352, 0.929, 1.488, 1.845,
          1.087, 0.786, 0.764, 1.166,
        ],
        [
          0.619, 0.415, 1.141, 0.426, -0.551, 0.236, 1.289, 0.925, 1.213, 1.415,
          1.211, 1.08, 0.54, 1.18,
        ],
        [
          0.719, 0.441, 1.108, 0.362, -0.505, 0.34, 1.056, 0.702, 1.396, 0.734,
          1.238, 1.354, 1.223, 1.49,
        ],
        [
          0.852, 0.449, 1.077, 0.267, -0.382, 0.338, 0.911, 0.488, 1.333, 0.289,
          1.189, 1.571, 1.551, 1.575,
        ],
        [
          0.968, 0.5, 0.991, 0.203, -0.208, 0.274, 1.396, 0.21, 1.222, 0.393,
          1.07, 1.728, 1.575, 1.082,
        ],
        [
          1.056, 0.612, 0.817, 0.157, 0.055, 0.242, 2.936, -0.044, 1.003, 0.397,
          1.442, 1.669, 1.711, 0.485,
        ],
        [
          1.139, 0.703, 0.546, 0.101, 0.338, 0.2, -2.945, -0.466, 0.63, 0.45,
          1.894, 1.669, 1.876, 0.41,
        ],
        [
          1.234, 0.782, 0.26, 0.032, 0.798, 0.268, -3.016, -1.042, 0.417, 1.829,
          1.696, 1.364, 1.801, 0.451,
        ],
        [
          1.323, 0.827, 0.166, -0.015, 1.425, 0.178, -2.947, -0.566, 0.536,
          0.718, 1.246, 0.788, 1.108, 0.427,
        ],
        [
          1.364, 0.862, 0.097, 0.005, 1.713, 0.182, -3.117, -0.423, 0.264,
          0.856, 0.874, 0.555, 0.417, 0.377,
        ],
        [
          1.399, 0.845, 0.112, 0.058, 1.716, 0.112, -3.138, -0.359, 0.746,
          1.158, 0.88, 0.727, 0.052, 0.391,
        ],
        [
          1.424, 0.806, 0.114, 0.082, 1.747, 0.033, 3.135, -0.352, 1.453, 1.609,
          0.99, 0.87, 0.065, 0.577,
        ],
        [
          1.414, 0.809, 0.108, 0.081, 1.771, 0.083, -3.077, -0.33, 1.872, 1.982,
          0.951, 0.952, 0.14, 0.738,
        ],
        [
          1.362, 0.857, 0.105, 0.068, 1.783, 0.131, -2.654, -0.278, 2.019,
          2.129, 0.93, 0.903, 0.523, 0.771,
        ],
        [
          1.312, 0.894, 0.109, 0.035, 1.755, 0.133, -2.981, -0.243, 2.055,
          2.174, 1.023, 0.92, 0.822, 0.8,
        ],
        [
          1.272, 0.925, 0.109, -0.013, 1.726, 0.078, 2.744, -0.213, 2.032,
          2.207, 1.146, 0.958, 0.984, 0.967,
        ],
        [
          1.207, 0.994, 0.103, -0.093, 1.712, 0.04, 2.154, -0.173, 1.976, 2.197,
          1.262, 1, 1.024, 1.258,
        ],
        [
          1.103, 1.107, 0.088, -0.201, 1.74, 0.057, 1.552, -0.066, 1.79, 2.078,
          1.25, 0.98, 1.208, 1.446,
        ],
        [
          0.999, 1.215, 0.081, -0.304, 1.761, 0.076, 1.26, -0.045, 1.645, 1.961,
          1.272, 0.975, 1.409, 1.559,
        ],
        [
          0.913, 1.302, 0.085, -0.366, 1.752, 0.089, 1.067, -0.057, 1.594,
          1.945, 1.321, 1.007, 1.497, 1.589,
        ],
      ],
    },
    upper: {
      from: 0.9,
      rows: [
        [
          0, 0.837, 1.224, 0.078, 0.025, 0.294, -0.159, 0.991, 1.023, 1.208,
          -0.003, 0.545, 0.74, 1.102,
        ],
        [
          0.064, 0.747, 1.228, 0.113, -0.021, 0.222, -0.397, 0.963, 1.177,
          1.175, -0.038, 0.566, 0.685, 1.093,
        ],
        [
          0.111, 0.679, 1.231, 0.15, -0.077, 0.149, -0.591, 1.007, 1.205, 1.204,
          -0.082, 0.6, 0.639, 1.091,
        ],
        [
          0.153, 0.667, 1.469, 0.072, -0.022, 0.099, -0.71, 0.587, 0.861, 0.87,
          -0.187, 0.36, 0.485, 0.582,
        ],
        [
          0.234, 0.64, 1.743, -0.035, 0.101, 0.11, -0.486, 0.314, 0.28, 0.355,
          -0.381, 0.344, 0.594, 0.532,
        ],
        [
          0.294, 0.655, 1.842, -0.232, 0.249, 0.093, 2.218, 2.063, 0.3, 0.337,
          -0.625, 0.891, 0.974, 1.05,
        ],
        [
          0.298, 0.707, 1.829, -0.445, 0.308, 0.19, 2.017, 2.493, 0.471, 0.158,
          -1.517, 1.498, 1.126, 1.154,
        ],
        [
          0.266, 0.775, 1.644, -0.611, 0.444, 0.244, 2.524, 2.492, 0.763, 0.278,
          -3, 1.76, 0.427, 0.58,
        ],
        [
          0.193, 0.874, 1.328, -0.74, 1.123, 0.259, 2.386, 1.923, 0.664, 0.297,
          2.361, 1.387, 0.239, 0.484,
        ],
        [
          0.132, 0.968, 0.917, -0.849, 2.084, 0.428, 2.478, -0.165, 1.19, 1.145,
          1.413, 0.659, 0.242, 0.394,
        ],
        [
          0.105, 1.035, 0.32, -0.976, 2.48, 0.65, 2.719, -1.337, 1.499, 1.566,
          1.074, 0.399, 0.242, 0.335,
        ],
        [
          0.091, 1.059, 0.064, -1.119, 1.64, 0.629, -3.046, -0.423, 1.652, 1.56,
          2.238, 1.2, 0.378, 0.598,
        ],
        [
          0.057, 1.077, 0.088, -1.197, 2.182, 0.673, 2.471, -0.7, 1.849, 1.861,
          2.249, 0.193, 0.993, 0.852,
        ],
        [
          0.047, 1.096, 0.11, -1.27, 2.561, 0.643, 2.299, -1.077, 1.937, 2.029,
          1.843, 0.056, 0.896, 0.521,
        ],
        [
          0.052, 1.107, 0.118, -1.284, 2.748, 0.535, 2.139, -1.547, 1.866,
          1.756, 1.559, -0.126, 0.91, 0.326,
        ],
        [
          0.054, 1.117, 0.107, -1.307, 2.811, 0.406, 2.081, -1.719, 1.715,
          1.455, 1.371, -0.23, 0.851, 0.288,
        ],
      ],
    },
  },
  Ss = 1.7,
  Cs = 0.1,
  ws = [
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
function Ts(e) {
  return Math.atan2(Math.sin(e), Math.cos(e));
}
function Es(e) {
  return new Promise((t) => {
    new Ne().load(
      e,
      (e) => t(e),
      void 0,
      () => t(null),
    );
  });
}
var Ds,
  Os = 10112511,
  ks = 4063098,
  As = (e, t = 0.6, n = {}) => new C({ color: e, roughness: t, ...n });
function js(e, t, n, r, i, a = 0, o = 0, s = 0, c = 16) {
  let l = new S(new D(1, c, Math.max(8, c * 0.75)), r);
  return (l.scale.set(e, t, n), l.position.set(a, o, s), i.add(l), l);
}
function Ms(e = 1) {
  let t = new y(),
    n = new S(new ge(0.045, 0.15, 4, 12), As(16053488, 0.8));
  ((n.rotation.x = Math.PI / 2), n.scale.set(1, 1, 0.28), t.add(n));
  let r = As(2781142, 0.5);
  for (let e of [1, -1]) {
    let n = new S(new E(0.05, 0.008, 6, 14, Math.PI), r);
    (n.position.set(e * 0.012, 0.012, 0.03),
      n.rotation.set(0, e * 0.6 + Math.PI / 2, 0),
      t.add(n));
  }
  return (t.scale.setScalar(e), t);
}
function Ns() {
  let e = new y(),
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
    ].map(([e, t]) => new me(e, t)),
    n = As(1511957, 0.55, { metalness: 0.15, side: 2 });
  e.add(new S(new _(t, 28), n));
  let r = new S(
    new E(0.305, 0.012, 6, 40),
    As(13214266, 0.4, { metalness: 0.6 }),
  );
  ((r.rotation.x = Math.PI / 2), (r.position.y = 0.25), e.add(r));
  let i = new S(
    new Re(0.175, 24),
    As(1937210, 0.3, { emissive: ks, emissiveIntensity: 1.1 }),
  );
  ((i.rotation.x = -Math.PI / 2), (i.position.y = 0.48), e.add(i));
  let a = M(ks, 1.4, 0.35);
  ((a.position.y = 0.62), e.add(a));
  let o = new h(ks, 0, 5, 2);
  ((o.position.y = 0.8), e.add(o));
  for (let t = 0; t < 3; t++) {
    let n = (t / 3) * Math.PI * 2 + 0.4;
    js(
      0.07,
      0.05,
      0.07,
      As(4867136, 0.95),
      e,
      Math.cos(n) * 0.24,
      0.02,
      Math.sin(n) * 0.24,
      8,
    );
  }
  return { root: e, liquid: i, light: o, glow: a };
}
function Ps() {
  let e = new y(),
    t = As(8014370, 0.75),
    n = new S(new O(0.014, 0.018, 1, 8), t);
  return (
    (n.position.y = -0.5),
    e.add(n),
    js(0.05, 0.03, 0.06, t, e, 0, -1, 0, 10),
    e
  );
}
var Fs = new T(0, 1, 0),
  Is = new T(0, -1, 0),
  Ls;
function Rs() {
  return (Ls === void 0 && (Ls = zs()), Ls);
}
function zs() {
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
  return ((r.colorSpace = i), r);
}
function Bs(e, t = 0) {
  return new k({
    color: e,
    transparent: !0,
    opacity: t,
    blending: 2,
    depthWrite: !1,
    side: 2,
  });
}
function Vs() {
  let e = new y(),
    t = As(1312799, 0.9, {
      emissive: 2755141,
      emissiveIntensity: 0.6,
      transparent: !0,
      opacity: 0.92,
    });
  js(0.11, 0.13, 0.1, t, e, 0, 0, 0, 12);
  let n = new S(new ue(0.07, 0.28, 8), t);
  ((n.position.y = -0.2), (n.rotation.x = Math.PI), e.add(n));
  let r = new k({ color: 16769357 });
  for (let t of [1, -1]) js(0.022, 0.03, 0.01, r, e, t * 0.04, 0.03, 0.095, 8);
  return e;
}
function Hs(e, t) {
  let n = new y(),
    r = new y();
  n.add(r);
  let i = As(5025594, 0.45),
    a = As(13166240, 0.6);
  (js(0.26, 0.19, 0.24, i, r, 0, 0.19, 0, 20),
    js(0.19, 0.12, 0.12, a, r, 0, 0.15, 0.13, 16));
  for (let e of [1, -1])
    (js(0.11, 0.08, 0.17, i, r, e * 0.21, 0.08, -0.05, 12),
      js(0.09, 0.025, 0.12, i, r, e * 0.25, 0.015, 0.08, 10),
      js(0.035, 0.09, 0.035, i, r, e * 0.13, 0.08, 0.18, 8),
      js(0.08, 0.08, 0.08, i, r, e * 0.12, 0.38, 0.06, 14),
      js(0.06, 0.06, 0.04, As(16777215, 0.3), r, e * 0.12, 0.39, 0.115, 12),
      js(0.028, 0.034, 0.02, As(1118481, 0.2), r, e * 0.12, 0.39, 0.15, 8));
  let o = new S(new E(0.15, 0.008, 6, 20, Math.PI * 0.8), As(1985815, 0.6));
  (o.position.set(0, 0.25, 0.165),
    o.rotation.set(0.3, 0, Math.PI * 1.1),
    r.add(o));
  let s = js(0.1, 0.07, 0.08, As(15265968, 0.4), r, 0, 0.13, 0.19, 14);
  if (e !== null) {
    let t = js(0.09, 0.07, 0.05, As(e, 0.95), r, 0, 0.12, 0.21, 12);
    t.renderOrder = 1;
  }
  if (t) {
    let e = As(13216090, 0.3, { metalness: 0.8 });
    for (let t of [1, -1]) {
      let n = new S(new E(0.06, 0.008, 6, 20), e);
      (n.position.set(t * 0.12, 0.39, 0.16), r.add(n));
    }
  }
  return { root: n, body: r, sac: s };
}
var Us = class t extends aa {
  constructor(n) {
    (super(n),
      e(this, `root`, new y()),
      e(this, `pot`, Ns()),
      e(this, `ladle`, Ps()),
      e(this, `circle`, void 0),
      e(this, `innerRing`, void 0),
      e(this, `circleLight`, new h(Os, 0, 6, 2)),
      e(this, `imps`, []),
      e(this, `tosses`, []),
      e(this, `handChain`, []),
      e(this, `smokeHand`, new y()),
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
      e(this, `curve`, new ae(new T(), new T(), new T())));
    let r = n.caster.facing;
    (n.scene.add(this.root),
      this.potPos.set(n.caster.x + r * 0.62, 0, 0.18),
      this.pot.root.position.copy(this.potPos),
      this.pot.root.scale.setScalar(0.001),
      this.root.add(this.pot.root, this.ladle),
      (this.ladle.visible = !1),
      this.circlePos.set(n.target.x, 0.025, 0));
    let i = Rs(),
      a = Bs(Os);
    (i && (a.map = i),
      (this.circle = new S(new Re(1.25, 48), a)),
      (this.circle.rotation.x = -Math.PI / 2),
      this.circle.position.copy(this.circlePos),
      (this.innerRing = new S(new x(0.55, 0.64, 48), Bs(ks))),
      (this.innerRing.rotation.x = -Math.PI / 2),
      this.innerRing.position.copy(this.circlePos).setY(0.03),
      this.circleLight.position.set(this.circlePos.x, 0.6, 0.4),
      this.root.add(this.circle, this.innerRing, this.circleLight));
    for (let e = 0; e < 5; e++) {
      let t = Vs();
      ((t.visible = !1),
        this.root.add(t),
        this.imps.push({
          g: t,
          phase: (e / 5) * Math.PI * 2,
          radius: 0.75 + (e % 2) * 0.2,
          height: 0.9 + (e % 3) * 0.35,
        }));
    }
    let o = js(0.07, 0.065, 0.07, As(16512742, 0.25), new y(), 0, 0, 0, 14),
      s = new S(new w(0.16, 0.005, 0.22), As(15921126, 0.9)),
      c = [
        [`CHAPPAL!`, Ms(1.4)],
        [`ROSOGOLLA!`, o],
        [`BALLOT PAPER!`, s],
      ];
    (t.TOSS_AT.forEach((e, t) => {
      let [n, r] = c[t];
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
      (this.smokeMat = As(2755136, 0.9, {
        emissive: 8006911,
        emissiveIntensity: 0.55,
        transparent: !0,
        opacity: 0.88,
      })));
    for (let e = 0; e < 18; e++) {
      let e = js(1, 1, 1, this.smokeMat, this.root, 0, 0, 0, 12);
      ((e.visible = !1), this.handChain.push(e));
    }
    js(0.17, 0.06, 0.19, this.smokeMat, this.smokeHand, 0, 0, 0, 14);
    for (let e = 0; e < 5; e++) {
      let t = e === 4,
        n = new y();
      (n.position.set(t ? -0.16 : -0.11 + e * 0.075, 0, t ? 0.02 : 0.16),
        t && (n.rotation.y = -0.9));
      let r = new S(new ge(0.03, t ? 0.1 : 0.15, 4, 8), this.smokeMat);
      ((r.rotation.x = Math.PI / 2),
        (r.position.z = t ? 0.07 : 0.1),
        n.add(r),
        this.smokeHand.add(n),
        this.fingers.push(n));
    }
    ((this.smokeHand.visible = !1), this.root.add(this.smokeHand));
    let l = n.target.char.look;
    ((this.frog = Hs(l.beardStyle === `none` ? null : l.beard, l.glasses)),
      (this.frog.root.visible = !1),
      this.root.add(this.frog.root),
      (this.syllables = pi(t.BOIL - t.CHANT_START)),
      n.audio.startSuperBed(t.BOIL / ot, `jadu`),
      n.audio.whoosh());
  }
  invokePose(e) {
    let t = Math.sin(e * 14) * 0.08;
    return F(V(e, `didi`), {
      rootY: -0.02,
      ...B(-0.02, 0.16, -0.2),
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
      a = F(V(e, `didi`), {
        rootY: -0.1,
        ...B(-0.1, 0.22, -0.24),
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
        ((a.lShF = Ws(a.lShF, t < 0.5 ? -0.3 : 1.9, e)),
          (a.lEl = Ws(a.lEl, 0.25, e)),
          (a.lHand = t < 0.6 ? 0 : 1));
      }
    }
    return a;
  }
  commandPose(e) {
    let t = Math.sin(e * 40) * 0.03;
    return F(V(e, `didi`), {
      rootY: -0.12,
      ...B(-0.12, 0.38, -0.32),
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
    return F(V(e, `didi`), {
      rootY: -0.03,
      ...B(-0.03, 0.12, -0.14),
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
    return F(this.laughPose(e), {
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
    return F(Gi(e, this.d.target.char.id), {
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
    return F(Gi(e, this.d.target.char.id), {
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
          ? I(V(l, `didi`), this.invokePose(l), R(l / 0.3))
          : l < r
            ? I(this.invokePose(l), this.stirPose(l), z((l - 0.6) / 0.35))
            : l < a + 0.15
              ? I(this.stirPose(l), this.commandPose(l), R((l - r) / 0.18))
              : l < o
                ? I(
                    this.commandPose(l),
                    this.laughPose(l),
                    z((l - a - 0.15) / 0.3),
                  )
                : l < o + 0.6
                  ? I(
                      this.laughPose(l),
                      this.snapPose(l),
                      R((l - o + 0.25) / 0.25),
                    )
                  : I(this.snapPose(l), V(l, `didi`), z((l - o - 0.6) / 0.5))),
      l < r
        ? ((this.targetPose = this.panicPose(l, L((l - 1) / 3))),
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
            (d.y = 0.45 * R((l - i + 0.3) / 0.3)))
          : l < o
            ? ((d.y = 0), (this.targetPose = Gi(l, d.char.id)))
            : ((this.targetPose = null), d.update(Ti(), u.x)),
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
          color: ks,
          life: 0.9,
          size: 0.3,
          gravity: 3,
          drag: 1.5,
          dir: Fs,
          spread: 0.6,
        }),
        n.fx.particles.emit(p, {
          count: 60,
          speed: 3,
          color: Os,
          life: 1.4,
          size: 0.6,
          gravity: -1,
          drag: 2,
        }),
        n.fx.shockwave(this.v1.copy(this.potPos).setY(0.05), ks, 0.6, 1.4),
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
      l = R(L((e - 0.25) / 0.45));
    (e > s - 0.9 && (l *= 1 - z((e - (s - 0.9)) / 0.7)),
      c.root.scale.setScalar(Math.max(0.001, l)));
    let u = L((e - 0.7) / (a - 0.7));
    if (
      ((c.root.rotation.z = Math.sin(e * 30) * 0.03 * u * (e < o ? 1 : 0.2)),
      (c.light.intensity = (0.4 + u * 0.8 + Math.sin(e * 17) * 0.15) * l),
      (c.glow.material.opacity = (0.15 + u * 0.2) * l),
      e > 0.2 &&
        n <= 0.2 &&
        (i.fx.particles.emit(this.v1.copy(this.potPos).setY(0.3), {
          count: 40,
          speed: 2,
          color: Os,
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
          color: Math.random() < 0.7 ? ks : Os,
          life: 0.7,
          size: 0.12 + Math.random() * 0.12,
          gravity: -1.5,
          drag: 1.5,
          dir: Fs,
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
        this.ladle.quaternion.setFromUnitVectors(Is, a.normalize()),
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
              color: ks,
              life: 0.6,
              size: 0.18,
              gravity: 7,
              drag: 1,
              dir: Fs,
              spread: 0.7,
            }),
            r.fx.particles.emit(n, {
              count: 10,
              speed: 1,
              color: Os,
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
    let c = R(L((e - 0.9) / 1.2)),
      l = e < o ? 1 : 1 - L((e - o) / 0.5),
      u = Math.exp(-(e - this.lastSylAt) * 6),
      d = L((e - 0.9) / (i - 0.9));
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
    let f = L((e - 2.6) / 1.6) * +(e < i);
    if (f > 0 && Math.random() < f * 0.9) {
      let e = Math.random() * Math.PI * 2;
      (this.v1.set(s.x + Math.cos(e) * 1.1, 0.05, Math.sin(e) * 0.9),
        r.fx.particles.emit(this.v1, {
          count: 1,
          speed: 1.6 + f,
          color: Math.random() < 0.6 ? Os : ks,
          life: 1,
          size: 0.14,
          gravity: -2.5,
          drag: 0.6,
          dir: Fs,
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
      let o = R(L((e - 2 - t.phase * 0.1) / 0.3));
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
      l = R(L((e - i) / (a - i - 0.1))),
      u = L((e - o) / 0.5);
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
    let m = e < a - 0.1 ? 0.15 : R(L((e - a + 0.1) / 0.12)) * 1.6;
    (this.fingers.forEach((e, t) => {
      e.rotation.x = t === 4 ? m * 0.6 : m;
    }),
      Math.random() < 0.6 &&
        r.fx.particles.emit(this.curve.getPoint(Math.random() * l, this.v3), {
          count: 1,
          speed: 0.4,
          color: Os,
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
      s = o < 0.25 ? R(o / 0.25) * 1.15 : 1.15 - 0.15 * L((o - 0.25) / 0.15);
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
    let r = new Le(new se(t, !1, `catmullrom`, 0.1), 40, 0.04, 6, !1);
    ((this.bolt = new S(r, Bs(15257855, 1))),
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
((Ds = Us),
  e(Us, `CHANT_START`, 0.7),
  e(Us, `BOIL`, 6.45),
  e(Us, `GRAB`, Ds.BOIL + 0.55),
  e(Us, `POOF`, Ds.BOIL + 0.6),
  e(Us, `UNPOOF`, Ds.BOIL + 1.9),
  e(Us, `END`, Ds.BOIL + 3),
  e(Us, `TOSS_AT`, [1.9, 3.2, 4.5]),
  e(Us, `TOSS_DUR`, 0.55));
var Ws = (e, t, n) => e + (t - e) * n,
  Gs = new T(),
  Ks = new T(0, 1, 0),
  qs = (e) => (e > 0 ? Math.PI / 2 : -Math.PI / 2);
function Js(e, t, n) {
  return [
    e * Math.cos(n) + t * Math.sin(n),
    -e * Math.sin(n) + t * Math.cos(n),
  ];
}
var Ys = class {
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
      this.released && this.d.defender.update(Ti(), this.d.attacker.x);
    }
  },
  Xs = class extends Ys {
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
      return F(V(e, this.d.attacker.char.id), {
        rootY: -0.04,
        ...B(-0.04, 0.22, -0.26),
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
      return F(V(e, this.d.attacker.char.id), {
        rootY: -0.12,
        ...B(-0.12, 0.3, -0.32),
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
      return F(Gi(e, this.d.defender.char.id), {
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
      return F(V(e, this.d.attacker.char.id), {
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
          let e = R(n / this.REACH);
          ((u = this.bx0 + (this.ax + a * this.SEP - this.bx0) * e),
            (this.attPose = this.openArms(n)),
            (this.defPose = F(Gi(n, i.char.id), { headF: -0.3 })),
            !this.bubbled &&
              n > 0.05 &&
              ((this.bubbled = !0),
              t.speech(`attacker`, `Gale milo, mitron!`)));
        } else {
          u = this.ax + a * this.SEP;
          let r = L((n - this.REACH) / (this.SQUEEZE - this.REACH));
          c = z(L((n - this.REACH - 0.15) / 0.45));
          let i = L((n - this.SQUEEZE) / (this.SPIN_END - this.SQUEEZE));
          if (
            ((s = this.TURNS * Math.PI * 2 * z(i) * a),
            (l = Math.sin(i * Math.PI)),
            (this.attPose = I(this.openArms(n), this.hug(n, c), R(r * 2))),
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
        let [d, f] = Js(this.ax - o, 0, s),
          [p, m] = Js(u - o, 0, s);
        ((this.attTf = { x: o + d, y: 0, z: f, yaw: qs(a) + s, roll: 0 }),
          (this.defTf = {
            x: o + p,
            y: c * 0.38,
            z: m,
            yaw: qs(-a) + s,
            roll: 0,
          }),
          (r.x = this.attTf.x),
          (i.x = this.defTf.x),
          (i.y = 0),
          this.v.set(o, 1.35, 0));
        let h = Math.sin(n * 1.4) * 0.6;
        t.cam.set(
          Gs.set(o + Math.sin(h) * 3.8, 1.75, Math.cos(h) * 3.8),
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
        this.damage(14),
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
        (1 - L((n - this.SPIN_END) / (this.END - this.SPIN_END)));
      if (
        ((this.attPose = I(
          this.dizzy(n),
          V(n, r.char.id),
          z((n - this.SPIN_END - 0.35) / 0.25),
        )),
        (this.attTf = { x: this.ax, y: 0, z: 0, yaw: qs(a) + s, roll: 0 }),
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
      (t.cam.set(Gs.set(c, 1.8, 6.2), this.v.set(c, 1, 0), 3, 42),
        n >= this.END && ((this.attTf = null), (this.done = !0)));
    }
  },
  Zs = class extends Ys {
    constructor(...t) {
      (super(...t),
        e(this, `GRAB`, 0.3),
        e(this, `PIVOT`, 0.72),
        e(this, `THROW`, 1.3),
        e(this, `END`, 1.75),
        e(this, `clicked`, !1));
    }
    reach(e) {
      return F(V(e, this.d.attacker.char.id), {
        rootY: -0.1,
        ...B(-0.1, 0.36, -0.3),
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
      return F(V(e, this.d.attacker.char.id), {
        rootY: -0.32,
        ...B(-0.32, 0.3, -0.34),
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
      return F(V(e, this.d.attacker.char.id), {
        rootY: -0.38,
        ...B(-0.38, 0.34, -0.4),
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
      return F(Gi(e, this.d.defender.char.id), {
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
        ...B(-0.02, 0.25 + t * 0.15, -0.2, 0, t * 0.1),
      });
    }
    airborne(e) {
      let t = Math.sin(e * 24);
      return F(Gi(e, this.d.defender.char.id), {
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
        let e = R(n / this.GRAB);
        ((this.attPose = this.reach(n)),
          (this.defPose = this.pulled(n, e * 0.3)),
          (this.attTf = { x: o, y: 0, z: 0, yaw: qs(a), roll: 0 }));
        let r = this.bx0 + (o + a * 0.72 - this.bx0) * e;
        ((this.defTf = { x: r, y: 0, z: 0, yaw: qs(-a), roll: 0 }),
          !this.clicked &&
            n > 0.18 &&
            ((this.clicked = !0),
            t.audio.block(),
            t.speech(`attacker`, `Wrist lock!`)));
      } else if (n < this.PIVOT) {
        let e = z((n - this.GRAB) / (this.PIVOT - this.GRAB));
        ((this.attPose = I(this.reach(n), this.pivot(n), e)),
          (this.defPose = this.pulled(n, 0.3 + e * 0.7)),
          (this.attTf = {
            x: o,
            y: 0,
            z: 0,
            yaw: qs(a) + Math.PI * e,
            roll: 0,
          }),
          (this.defTf = {
            x: o + a * (0.72 - 0.3 * e),
            y: 0,
            z: 0,
            yaw: qs(-a),
            roll: 0,
          }));
      } else if (n < this.THROW) {
        let r = z((n - this.PIVOT) / (this.THROW - this.PIVOT));
        ((this.attPose = I(this.pivot(n), this.heave(n), R(r * 1.5))),
          (this.attTf = { x: o, y: 0, z: 0, yaw: qs(a) + Math.PI, roll: 0 }),
          (this.defPose = this.airborne(n)));
        let s = o + a * 0.42,
          c = o + a * 0.05,
          l = o - a * 0.95,
          u = 1 - r,
          d = u * u * s + 2 * u * r * c + r * r * l,
          f = u * u * 0.95 + 2 * u * r * 2.75 + r * r * 0.16,
          p = a * 1.5 * Math.PI * r,
          m = at * (i.char.modelHeight ?? 1);
        ((this.defTf = {
          x: d + m * Math.sin(p),
          y: f - m * Math.cos(p),
          z: 0,
          yaw: qs(-a),
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
          this.damage(14),
          (i.vx = 0),
          (i.vy = 0),
          (i.grounded = !0),
          (i.downFrames = 0),
          i.hp <= 0
            ? ((i.hp = 0), i.forceState(`ko`))
            : i.forceState(`knockdown`),
          (this.defTf = null),
          (this.defPose = Hi(n)),
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
        let e = z((n - this.THROW) / 0.45);
        ((this.attPose = I(this.heave(n), V(n, r.char.id), e)),
          (this.attTf = null));
      }
      (this.v.set(s - a * 0.2, 1.3, 0),
        t.cam.set(Gs.set(s - a * 0.3, 1.9, 5), this.v, 3.5, 44),
        n >= this.END && (this.done = !0));
    }
  },
  Qs = class t extends Ys {
    constructor(t) {
      (super(t),
        e(this, `chappal`, Ms(1.5)),
        e(this, `slapIdx`, 0),
        e(this, `spoke`, !1),
        e(this, `SEP`, 0.62),
        e(this, `tmpQ`, new ie()),
        (this.chappal.visible = !1),
        t.scene.add(this.chappal));
    }
    hold(e) {
      return F(V(e, this.d.attacker.char.id), {
        rootY: -0.06,
        ...B(-0.06, 0.3, -0.26),
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
      return F(e, {
        rShF: 1.35 + Math.abs(t) * 0.15,
        rShO: 0.9 * -t + 0.1,
        rShT: 0.5 * -t,
        rEl: 0.5 + (1 - Math.abs(t)) * 0.3,
        rHand: 0,
        spineT: 0.1 + t * 0.25,
      });
    }
    overhead(e, t) {
      return F(this.hold(e), {
        rShF: 2.9 - t * 1.7,
        rShO: 0.15,
        rEl: 0.9 - t * 0.8,
        rHand: 0,
        spineF: 0.12 + t * 0.3,
        rootY: -0.06 - t * 0.08,
      });
    }
    slapped(e, t, n) {
      return F(Gi(e, this.d.defender.char.id), {
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
        let e = R(L(r / s)),
          t = this.bx0 + (this.ax + o * this.SEP - this.bx0) * e;
        ((this.attTf = { x: this.ax, y: 0, z: 0, yaw: qs(o), roll: 0 }),
          (this.defTf = { x: t, y: 0, z: 0, yaw: qs(-o), roll: 0 }),
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
          (i >= 0 && (u = i < 1 ? n + -2 * n * z(i) : -n),
            r >= t && ((d = -n * o), (f = Math.exp(-(r - t) * 5))));
        }
        let p = this.slapArm(i, u);
        for (
          r > l - 0.3 &&
            (p = I(p, this.overhead(r, 0), R((r - l + 0.3) / 0.18))),
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
          this.damage(14),
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
        let e = R(L((r - l) / 0.15));
        this.attPose = I(
          this.overhead(r, e),
          V(r, i.char.id),
          z((r - l - 0.25) / 0.3),
        );
      }
      this.chappal.visible &&
        (n.attRig.handWorld(`r`, this.v),
        this.chappal.position.copy(this.v),
        this.tmpQ.setFromAxisAngle(Ks, qs(o)),
        this.chappal.quaternion.copy(this.tmpQ),
        this.chappal.rotateX(-Math.PI / 2),
        this.chappal.rotateZ(Math.sin(r * 20) * 0.2),
        r > l + 0.35 && (this.chappal.visible = !1));
      let d = this.ax + o * 0.3;
      (this.v.set(d, 1.2, 0),
        n.cam.set(Gs.set(d - o * 0.2, 1.6, 4), this.v, 3.5, 40),
        r >= u && ((this.attTf = null), (this.done = !0)));
    }
    dispose() {
      (super.dispose(), this.d.scene.remove(this.chappal));
    }
  };
(e(Qs, `GRAB`, 0.3),
  e(Qs, `SLAPS`, [0.62, 0.9, 1.18]),
  e(Qs, `WHACK`, 1.62),
  e(Qs, `END`, 2.2));
var $s = class t extends Ys {
  constructor(...t) {
    (super(...t),
      e(this, `SEP`, 0.72),
      e(this, `YANK_SEP`, 0.5),
      e(this, `patIdx`, 0),
      e(this, `yanked`, !1),
      e(this, `spoke`, !1));
  }
  offer(e, t) {
    return F(V(e, this.d.attacker.char.id), {
      rootY: -0.03,
      ...B(-0.03, 0.26, -0.24),
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
    return F(e, {
      lShF: 1.05 + (1 - t) * 0.35,
      lShO: -0.15,
      lShT: 0.2,
      lEl: 0.75 + (1 - t) * 0.4,
      lHand: 1,
    });
  }
  yank(e, t) {
    return F(this.offer(e, 0), {
      rShF: 1.15 - t * 0.55,
      rEl: 0.45 + t * 0.9,
      spineF: 0.05 - t * 0.12,
      spineT: 0.05 - t * 0.25,
      rootY: -0.06,
    });
  }
  shove(e, t) {
    return F(V(e, this.d.attacker.char.id), {
      rootY: -0.1,
      ...B(-0.1, 0.42, -0.34),
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
    return F(Gi(e, this.d.defender.char.id), {
      rootY: -0.04 - n * 0.08,
      ...B(-0.04 - n * 0.08, 0.22, -0.2),
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
      let t = R(L(r / s)),
        i = R(L((r - c) / 0.14)),
        d = this.SEP + (this.YANK_SEP - this.SEP) * i,
        f = this.bx0 + (this.ax + o * d - this.bx0) * t;
      ((this.attTf = { x: this.ax, y: 0, z: 0, yaw: qs(o), roll: 0 }),
        (this.defTf = { x: f, y: 0, z: 0, yaw: qs(-o), roll: 0 }),
        (a.x = f),
        !this.spoke &&
          r > 0.08 &&
          ((this.spoke = !0), n.speech(`attacker`, `Great to see you!`)));
      let p = r > s ? Math.sin((r - s) * 26) * (r > c ? 1 : 0.6) : 0,
        m =
          r < c
            ? this.offer(r, p)
            : this.yank(r, i * (1 - L((r - c - 0.2) / 0.2)));
      r > c + 0.1 && (m = F(m, { rShF: m.rShF + p * 0.15 }));
      for (let e of l) {
        let t = (r - (e - 0.09)) / 0.18;
        t > 0 && t < 1 && (m = this.pat(m, Math.sin(t * Math.PI)));
      }
      for (
        r > u - 0.25 && (m = I(m, this.shove(r, 0), R((r - u + 0.25) / 0.2))),
          this.attPose = m,
          this.defPose = this.shaken(
            r,
            r > s ? p : 0,
            i * (1 - L((r - c - 0.35) / 0.3)) + (r > l[0] ? 0.25 : 0),
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
                ravi: `Arre bhaiya, haath chhodo na!`,
                lalu: `Arre bhai, haath chhodo, gaadi chhoot jaayegi!`,
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
        this.damage(14),
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
      let e = R(L((r - u) / 0.12));
      this.attPose = I(
        this.shove(r, e),
        V(r, i.char.id),
        z((r - u - 0.3) / 0.3),
      );
    }
    let f = this.ax + o * 0.35;
    (this.v.set(f, 1.25, 0),
      n.cam.set(Gs.set(f - o * 0.15, 1.55, 3.6), this.v, 3.5, 40),
      r >= d && ((this.attTf = null), (this.done = !0)));
  }
};
(e($s, `GRIP`, 0.3),
  e($s, `YANK`, 0.62),
  e($s, `PATS`, [0.85, 1.05]),
  e($s, `SHOVE`, 1.5),
  e($s, `END`, 2.15));
var ec = class t extends Ys {
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
      a = F(V(e, `yogi`), {
        rootY: i,
        ...B(i, 0.24 + n * 0.08, -0.3),
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
    return F(V(e, `yogi`), {
      rootY: -0.02,
      ...B(-0.02, 0.1, -0.1),
      hipsT: 0,
      spineT: 0,
      spineF: 0.04 + t * 0.25,
      headT: 0.4,
      headF: t * 0.3,
      ...Qi,
    });
  }
  flail(e, t) {
    let n = Math.sin(e * 26);
    return F(Gi(e, this.d.defender.char.id), {
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
      yaw: qs(-this.dir),
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
    if (((this.attTf = { x: s, y: 0, z: 0, yaw: qs(o), roll: 0 }), r < c)) {
      let t = R(r / c),
        i = this.bx0 + (s + o * this.SEP - this.bx0) * t;
      ((this.defTf = { x: i, y: 0, z: 0, yaw: qs(-o), roll: 0 }),
        (a.x = i),
        (this.attPose = this.gripPose(r, 0.6 + t * 0.8, 0.1, 0.12)),
        (this.defPose = F(Gi(r, a.char.id), { headF: -0.3, spineF: -0.1 })),
        !this.spoke &&
          r > 0.08 &&
          ((this.spoke = !0), n.speech(`attacker`, `Dhobi pachhad!`)),
        r + e >= c && r < c && n.audio.block());
    } else if (r < l) {
      let e = z((r - c) / (l - c)),
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
        let n = z((r - l) / (u - l));
        ((e = y(h, g, Math.min(1, n * 2))), (t = n * 3 * Math.PI), (s = -0.12));
      } else if (r < d) {
        let n = (r - u) / (d - u);
        ((e = y(g, _, n * n)),
          (t = (3 + 0.5 * n * n) * Math.PI),
          (i = n),
          (s = -0.12 - n * 0.3));
      } else if (r < f) {
        let n = R((r - d) / (f - d));
        ((e = y(_, g, n)),
          (t = (3.5 - 0.5 * n) * Math.PI),
          (i = 1 - n),
          (s = -0.42 + n * 0.3));
      } else {
        let n = L((r - f) / (p - f));
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
        (this.defPose = Hi(r)),
        n.defRig.snapTo?.(this.defPose),
        this.slamFx(a.x, !0),
        n.popup(
          i.char.moveNames.grab ?? `GRAB!`,
          this.v.set(a.x, 1.5, 0.3),
          i.char.accent,
        )),
        r > p + 0.1 && (this.defPose = null),
        this.stepDefenderPhysics());
      let e = z((r - p - 0.15) / 0.4);
      this.attPose = I(
        this.gripPose(r, this.aim(v.x, v.y), 1, 0.5),
        this.namaste(r, Math.sin(L((r - p - 0.2) / 0.5) * Math.PI)),
        e,
      );
    }
    let b = r > p ? z(L((r - p) / 0.5)) : 0;
    (this.v.set(s + o * 0.25, 1.7 - b * 0.6, 0),
      n.cam.set(
        Gs.set(s + o * 0.2, 1.9 - b * 0.2, 7.2 - b * 1.2),
        this.v,
        3.5,
        48,
      ),
      r >= m && ((this.attTf = null), (this.done = !0)));
  }
};
(e(ec, `GRAB`, 0.28),
  e(ec, `LIFT`, 0.62),
  e(ec, `SPIN`, 1.38),
  e(ec, `SLAM1`, 1.6),
  e(ec, `HAUL`, 1.92),
  e(ec, `SLAM2`, 2.12),
  e(ec, `END`, 2.85));
var tc = class t extends Ys {
  constructor(...n) {
    (super(...n),
      e(this, `poseRate`, 60),
      e(this, `CLIP_REACH`, 1.7),
      e(this, `CLIP_READY`, 2),
      e(this, `CLIP_SLAM`, 3.45),
      e(this, `LET_GO`, [3.1, 3.3]),
      e(this, `R`, 1.2),
      e(this, `CLEAR_HEAD`, 0.46),
      e(this, `throws`, t.THROWS),
      e(this, `end`, t.END),
      e(this, `between`, 4),
      e(this, `words`, {
        start: `Great Patki!`,
        first: `PATKI!`,
        next: `PHIR SE!`,
        last: `GREAT PATKI!`,
      }),
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
    let t = this.throws;
    for (let n = 0; n < t.length; n++)
      if (e >= t[n][0] && e < t[n][1])
        return { index: n, k: (e - t[n][0]) / (t[n][1] - t[n][0]) };
    return null;
  }
  throwDir(e) {
    return e % 2 == 0 ? this.dir : -this.dir;
  }
  rowAt(e, t) {
    let n = L((e - Ss) / (Cs * (ws.length - 1))) * (ws.length - 1),
      r = Math.min(ws.length - 2, Math.floor(n)),
      i = ws[r],
      a = ws[r + 1];
    for (let e = 0; e < i.length; e++) t[e] = i[e] + (a[e] - i[e]) * (n - r);
    return t;
  }
  bodyPose(e, t) {
    return F(Gi(t, this.d.defender.char.id), {
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
    let i = L((n - this.LET_GO[0]) / (this.CLIP_SLAM - this.LET_GO[0]));
    return r.set(this.ax - this.throwDir(t) * e[3], e[4], e[5] * (1 - i));
  }
  slam(e, t) {
    let n = this.d,
      r = e === this.throws.length - 1,
      i = this.v.set(t, 0.1, 0.1);
    (n.fx.dust(i, r ? 3 : 1.6),
      n.fx.shockwave(i, 16765024, 0.5, r ? 6 : 2.6),
      n.fx.particles.emit(i, {
        count: r ? 70 : 28,
        speed: r ? 7 : 4.5,
        color: 16777215,
        life: 0.8,
        size: 0.16,
        drag: 1.6,
      }),
      n.cam.shake(r ? 0.42 : 0.2, r ? 0.5 : 0.25),
      n.audio.thud(),
      n.audio.slap(1),
      r && n.audio.boom(),
      n.arena.cheer(r ? 1 : 0.5),
      r
        ? n.popup(
            this.words.last,
            this.v.set(t, 2.3, 0.3),
            n.attacker.char.accent,
          )
        : n.popup(
            e === 0 ? this.words.first : this.words.next,
            this.v.set(t, 1.7, 0.3),
            `#ffffff`,
          ));
  }
  step(e) {
    let n = this.d;
    this.t += e;
    let r = this.t,
      i = n.defender,
      { GRIP: a, REST: o } = t,
      s = this.throws,
      c = this.end,
      l = s[s.length - 1][1],
      {
        CLIP_REACH: u,
        CLIP_READY: d,
        CLIP_SLAM: f,
        LET_GO: p,
        row: m,
        otherRow: h,
      } = this,
      g = this.arcOf(r);
    for (; this.landed < s.length && r >= s[this.landed][1];) {
      let e = this.landed++;
      (this.slam(e, this.ax - this.throwDir(e) * this.R),
        e < s.length - 1 &&
          this.between > 0 &&
          (i.hp = Math.max(1, i.hp - this.between)));
    }
    if (((this.attTf = { x: this.ax, y: 0, z: 0, yaw: 0, roll: 0 }), r < a)) {
      let t = R(r / a),
        o = u + (d - u) * t;
      (this.rowAt(d, m),
        n.attRig.setMirror?.(this.dir > 0),
        (this.attClip = { name: `throw`, time: o, fade: 0.1 }),
        this.placePath(m, 0, d, this.path),
        (this.path.x = this.bx0 + (this.path.x - this.bx0) * t),
        (this.path.z *= t),
        this.fromHand.set(-this.dir * m[0], m[1], m[2]),
        (this.grip = t),
        (this.defTf = {
          x: this.path.x,
          y: 0,
          z: this.path.z,
          yaw: qs(-this.dir),
          roll: this.dir * m[6] * t,
        }),
        (i.x = this.path.x),
        (this.defPose = I(
          F(Gi(r, i.char.id), { headF: -0.3, spineF: -0.1 }),
          this.bodyPose(m, r),
          t,
        )),
        r >= 0.08 && r - e < 0.08 && n.speech(`attacker`, this.words.start));
    } else if (g) {
      let e = this.throwDir(g.index),
        t = d + (f - d) * g.k;
      (this.rowAt(t, m),
        n.attRig.setMirror?.(e > 0),
        (this.attClip = { name: `throw`, time: t, fade: 0.05 }),
        this.placePath(m, g.index, t, this.path));
      let a = R(L(g.k / 0.16)) * (1 - z(L((g.k - 0.4) / 0.3)));
      (this.fromHand.set(-e * m[0], m[1], m[2] + this.CLEAR_HEAD * a),
        (this.grip = 1 - L((t - p[0]) / (p[1] - p[0]))),
        (this.defTf = {
          x: this.path.x,
          y: 0,
          z: this.path.z,
          yaw: qs(-e),
          roll: e * m[6],
        }),
        (i.x = this.path.x),
        (this.defPose = this.bodyPose(m, r)),
        g.k < 0.05 && n.audio.whoosh());
    } else if (this.landed < s.length) {
      let e = this.landed - 1,
        t = z(L((r - s[e][1] - o) / (s[this.landed][0] - s[e][1] - o))),
        a = this.throwDir(this.landed);
      (this.rowAt(f, m),
        this.rowAt(d, h),
        n.attRig.setMirror?.((t > 0 ? a : this.throwDir(e)) > 0),
        (this.attClip = { name: `throw`, time: t > 0 ? d : f, fade: 0.28 }),
        this.placePath(m, e, f, this.path),
        this.path.lerp(this.placePath(h, this.landed, d, this.chest), t),
        this.fromHand.set(-a * h[0], h[1], h[2]),
        (this.grip = t));
      let c = Ts(this.throwDir(e) * m[6]),
        l = qs(-this.throwDir(e));
      ((this.defTf = {
        x: this.path.x,
        y: 0,
        z: this.path.z,
        yaw: l + (qs(-a) - l) * t,
        roll: c + (a * h[6] - c) * t,
      }),
        (i.x = this.path.x),
        (this.defPose =
          t > 0
            ? I(this.bodyPose(m, r), this.bodyPose(h, r), t)
            : this.bodyPose(m, r)));
    } else
      (this.released ||
        ((this.released = !0),
        (i.x = this.ax - this.throwDir(s.length - 1) * this.R),
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
        (this.defPose = Hi(r)),
        n.defRig.snapTo?.(this.defPose)),
        r > l + 0.1 && (this.defPose = null),
        this.stepDefenderPhysics(),
        (this.attClip = { name: `throw`, time: f + (r - l) * 0.8, fade: 0.1 }));
    let _ = r > l ? z(L((r - l) / 0.5)) : 0;
    (this.v.set(this.ax, 1.35 - _ * 0.3, 0),
      n.cam.set(Gs.set(this.ax, 1.6 - _ * 0.2, 6.6 - _ * 0.8), this.v, 3.5, 48),
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
(e(tc, `GRIP`, 0.35),
  e(tc, `THROWS`, [
    [0.35, 1.05],
    [1.45, 2.15],
    [2.55, 3.3],
  ]),
  e(tc, `REST`, 0.1),
  e(tc, `END`, 4.05));
var nc = class extends tc {
    constructor(...t) {
      (super(...t),
        e(this, `throws`, [[0.35, 1.3]]),
        e(this, `end`, 2.2),
        e(this, `between`, 0),
        e(this, `words`, {
          start: `Dhobi pachhad!`,
          first: `DHOBI PACHHAD!`,
          next: `DHOBI PACHHAD!`,
          last: `DHOBI PACHHAD!`,
        }));
    }
    slam(e, t) {
      super.slam(e, t);
      let n = this.d;
      (n.audio.cupBreak(),
        n.fx.particles.emit(this.v.set(t, 0.3, 0.1), {
          count: 30,
          speed: 4,
          color: 11884079,
          life: 0.7,
          size: 0.07,
          gravity: 9,
          drag: 0.8,
        }));
    }
  },
  rc = 0.35,
  ic = 0.22,
  ac = class extends Ys {
    constructor(t, n) {
      (super(t),
        e(this, `cfg`, void 0),
        e(this, `poseRate`, 40),
        e(this, `table`, void 0),
        e(this, `row`, []),
        e(this, `path`, new T()),
        e(this, `startChest`, new T()),
        e(this, `chest`, new T()),
        e(this, `attX`, void 0),
        e(this, `beat`, 0),
        e(this, `roll`, 0),
        (this.cfg = n),
        (this.table = xs[n.pair]),
        (this.attX = this.ax),
        t.defRig.chestWorld(this.startChest));
    }
    clip() {
      return this.table.from + this.t * this.cfg.rate;
    }
    rowAt(e) {
      let t = this.table.rows,
        n = Math.max(0, Math.min(t.length - 1, (e - this.table.from) / bs)),
        r = Math.min(t.length - 2, Math.floor(n)),
        i = t[r],
        a = t[r + 1];
      for (let e = 0; e < i.length; e++)
        this.row[e] = i[e] + (a[e] - i[e]) * (n - r);
      return this.row;
    }
    bodyPose(e, t) {
      return F(Gi(t, this.d.defender.char.id), {
        rootY: 0,
        hipsF: 0,
        hipsT: 0,
        spineF: e[5],
        spineT: 0,
        headF: -0.2,
        lShF: e[6],
        rShF: e[7],
        lEl: e[8],
        rEl: e[9],
        lShO: 0.2,
        rShO: 0.2,
        lThF: e[10],
        rThF: e[11],
        lKn: e[12],
        rKn: e[13],
      });
    }
    land(e) {
      let t = this.d,
        n = e.power;
      (this.v.set(this.path.x, Math.max(0.3, this.path.y), 0.2),
        t.fx.hitSpark(this.v, 0.6 + n, !1, this.dir),
        n >= 0.6 &&
          (this.v.set(this.path.x, 0.08, 0.1),
          t.fx.dust(this.v, 1 + n * 2),
          t.fx.shockwave(this.v, 16765024, 0.5, 2 + n * 3)),
        t.cam.shake(0.12 + n * 0.3, 0.2 + n * 0.3),
        t.audio.hit(0.8 + n * 0.6),
        n >= 0.6 && t.audio.thud(),
        n >= 1 && t.audio.boom(),
        t.arena.cheer(0.4 + n * 0.6),
        t.popup(
          e.word,
          this.v.set(this.path.x, 2 + n * 0.3, 0.3),
          n >= 1 ? t.attacker.char.accent : `#ffffff`,
        ));
    }
    step(e) {
      let t = this.d,
        n = this.cfg;
      this.t += e;
      let r = this.t,
        i = this.clip(),
        a = t.attacker,
        o = t.defender,
        s = this.dir,
        c = this.rowAt(Math.min(i, n.release));
      for (
        r >= 0.06 && r - e < 0.06 && t.speech(`attacker`, n.start),
          r >= 0.35 && r - e < 0.35 && t.speech(`defender`, n.ouch);
        this.beat < n.beats.length && i >= n.beats[this.beat].at;
      )
        this.land(n.beats[this.beat++]);
      let l = j - 0.3;
      if (
        ((this.attX = Math.max(-l, Math.min(l, this.ax + s * c[0]))),
        (a.x = this.attX),
        (this.attClip = {
          name: n.pair,
          time: Math.min(i, n.end),
          fade: r < 0.1 ? 0.12 : 0.05,
        }),
        (this.attTf = { x: this.attX, y: 0, z: 0, yaw: qs(s), roll: 0 }),
        this.released)
      )
        (i > n.release + 0.15 && (this.defPose = null),
          this.stepDefenderPhysics());
      else {
        ((this.roll = -s * c[4]),
          this.path.set(this.attX + s * c[1], c[2], c[3] * rc));
        let e = R(L(r / ic));
        e < 1 && this.path.lerpVectors(this.startChest, this.path, e);
        let a = Math.max(-j, Math.min(j, this.path.x));
        ((this.path.x = a),
          (this.defTf = { x: a, y: 0, z: 0, yaw: qs(-s), roll: this.roll * e }),
          (o.x = a));
        let l = this.bodyPose(c, r);
        ((this.defPose =
          e < 1 ? I(F(Gi(r, o.char.id), { headF: -0.3 }), l, e) : l),
          i >= n.release &&
            ((this.released = !0),
            (o.y = 0),
            this.damage(14),
            (o.vx = 0),
            (o.vy = 0),
            (o.grounded = !0),
            (o.downFrames = 0),
            o.hp <= 0
              ? ((o.hp = 0), o.forceState(`ko`))
              : o.forceState(`knockdown`),
            (this.defTf = null),
            (this.defPose = Hi(r)),
            t.defRig.snapTo?.(this.defPose)));
      }
      let u = (this.attX + (this.released ? o.x : this.path.x)) / 2;
      (t.cam.set(Gs.set(u, 1.6, 6), this.v.set(u, 1.05, 0), 3.2, 46),
        i >= n.end &&
          ((a.x = this.attX),
          (this.attTf = null),
          (this.attClip = null),
          (this.done = !0)));
    }
    afterVisuals() {
      let e = this.defTf;
      if (!e || this.released) return;
      let t = this.d;
      ((this.path.y = Math.max(0.14, this.path.y)),
        t.defRig.chestWorld(this.chest));
      let n = t.defRig.root.position;
      t.defRig.setFree(
        n.x + this.path.x - this.chest.x,
        n.y + this.path.y - this.chest.y,
        n.z + this.path.z - this.chest.z,
        e.yaw,
        e.roll,
      );
    }
  },
  oc = {
    rahul: {
      pair: `shackle`,
      rate: 1.05,
      release: 3.35,
      end: 3.75,
      start: `Aikido, bhai!`,
      ouch: `Aah, haath!`,
      beats: [
        { at: 1.75, word: `TWIST!`, power: 0.3 },
        { at: 2.7, word: `KHATA-KHAT!`, power: 0.7 },
        { at: 3.3, word: `AIKIDO FATAFAT!`, power: 1 },
      ],
    },
    yogi: {
      pair: `slammer`,
      rate: 1.25,
      release: 6,
      end: 6.3,
      start: `Bulldozer chalega!`,
      ouch: `Arre, utaro mujhe!`,
      beats: [
        { at: 4.6, word: `UTHA!`, power: 0.3 },
        { at: 5.4, word: `PALAT!`, power: 0.4 },
        { at: 5.95, word: `BULLDOZER SLAM!`, power: 1 },
      ],
    },
    nitin: {
      pair: `takedown`,
      rate: 1,
      release: 1.6,
      end: 2.6,
      start: `Road roller aa raha hai!`,
      ouch: `Arre, rukiye!`,
      beats: [
        { at: 0.85, word: `TOLL FREE!`, power: 0.3 },
        { at: 1.55, word: `HIGHWAY TAKEDOWN!`, power: 1 },
      ],
    },
    ravi: {
      pair: `upper`,
      rate: 0.75,
      release: 2,
      end: 2.4,
      start: `Dekh, hero ki entry!`,
      ouch: `Nahi, hero nahi!`,
      beats: [
        { at: 1.3, word: `DHISHOOM!`, power: 0.7 },
        { at: 1.98, word: `FILMY UPPERCUT!`, power: 1 },
      ],
    },
  };
function sc(e) {
  let t = oc[e.attacker.char.id];
  if (t) return new ac(e, t);
  switch (e.attacker.char.id) {
    case `mbapu`:
      return new tc(e);
    case `lalu`:
      return new nc(e);
    case `modi`:
      return new Xs(e);
    case `didi`:
      return new Qs(e);
    case `trump`:
      return new $s(e);
    default:
      return new Zs(e);
  }
}
var cc,
  lc = 14689839,
  uc = 16763200,
  dc = (e, t = 0.6, n = {}) => new C({ color: e, roughness: t, ...n }),
  fc = new T(0, 1, 0),
  pc = new Map();
function mc(e, t) {
  if (!pc.has(e)) {
    let n = t();
    (n && (n.userData.shared = !0), pc.set(e, n));
  }
  return pc.get(e);
}
function hc(e, t, n) {
  if (typeof document > `u`) return null;
  let r = document.createElement(`canvas`);
  ((r.width = e), (r.height = t));
  let a = r.getContext(`2d`);
  if (!a) return null;
  n(a);
  let o = new _e(r);
  return ((o.colorSpace = i), (o.anisotropy = 4), o);
}
function gc(e, t, n, r, i) {
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
function _c() {
  return hc(256, 256, (e) => {
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
function vc(e) {
  return hc(256, 128, (t) => {
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
function yc() {
  return hc(512, 512, (e) => {
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
function bc() {
  return hc(384, 512, (e) => {
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
    (gc(e, 70, 370, 250, 90), (e.fillStyle = `#d4a019`), e.beginPath());
    for (let t = 0; t < 10; t++) {
      let n = (t / 10) * Math.PI * 2 - Math.PI / 2,
        r = t % 2 ? 16 : 36;
      e.lineTo(316 + Math.cos(n) * r, 450 + Math.sin(n) * r);
    }
    e.fill();
  });
}
function xc() {
  return hc(512, 256, (e) => {
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
function Sc() {
  return hc(128, 56, (e) => {
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
function Cc() {
  let e = new y(),
    t = dc(4860434, 0.45, { metalness: 0.05 }),
    n = dc(uc, 0.3, { metalness: 0.85 }),
    r = new S(new w(0.66, 0.06, 1.25), t);
  ((r.position.y = 0.76), e.add(r));
  let i = new S(new w(0.58, 0.7, 1.15), t);
  ((i.position.y = 0.38), e.add(i));
  for (let t of [0.735, 0.04]) {
    let r = new S(new w(0.62, 0.03, 1.19), n);
    ((r.position.y = t), e.add(r));
  }
  let a = new S(new w(0.02, 0.46, 0.8), dc(5977368, 0.4));
  (a.position.set(0.3, 0.4, 0), e.add(a));
  let o = new Te();
  for (let e = 0; e < 10; e++) {
    let t = (e / 10) * Math.PI * 2 + Math.PI / 2,
      n = e % 2 ? 0.05 : 0.12;
    e === 0
      ? o.moveTo(Math.cos(t) * n, Math.sin(t) * n)
      : o.lineTo(Math.cos(t) * n, Math.sin(t) * n);
  }
  let s = new S(new te(o, { depth: 0.02, bevelEnabled: !1 }), n);
  ((s.rotation.y = Math.PI / 2), s.position.set(0.315, 0.42, 0), e.add(s));
  let c = new S(new E(0.16, 0.012, 8, 40), n);
  return (
    (c.rotation.y = Math.PI / 2),
    c.position.set(0.315, 0.42, 0),
    e.add(c),
    e
  );
}
function wc() {
  let e = new y(),
    t = new S(new O(0.022, 0.022, 0.26, 12), dc(uc, 0.25, { metalness: 0.9 }));
  ((t.position.y = -0.05), e.add(t));
  let n = new S(new ue(0.02, 0.06, 10), dc(1118481, 0.5));
  return ((n.rotation.x = Math.PI), (n.position.y = -0.21), e.add(n), e);
}
function Tc() {
  let e = new y(),
    t = dc(11735583, 0.55),
    n = dc(uc, 0.3, { metalness: 0.85 }),
    r = dc(7027223, 0.5),
    i = new S(new w(1.5, 0.14, 1.05), t);
  ((i.position.y = 0.07), e.add(i));
  let a = new S(new w(1.62, 0.36, 1.16), r);
  ((a.position.y = 0.32), e.add(a));
  let o = new S(new w(1.66, 0.06, 1.2), n);
  ((o.position.y = 0.46), e.add(o));
  let s = new S(new O(0.12, 0.16, 0.85, 16), r);
  ((s.position.y = 0.92), e.add(s));
  let c = new S(new D(0.3, 20, 16), n);
  ((c.position.y = 1.45), c.scale.set(1, 0.85, 1), e.add(c));
  let l = mc(`stamp-label`, () =>
    hc(512, 128, (e) => {
      ((e.fillStyle = `#f6f0dc`),
        e.fillRect(0, 0, 512, 128),
        (e.fillStyle = `#c8102e`),
        (e.font = `bold 92px Impact, sans-serif`),
        (e.textAlign = `center`),
        (e.textBaseline = `middle`),
        e.fillText(`TARIFF 50%`, 256, 68));
    }),
  );
  if (l)
    for (let t of [0.585, -0.585]) {
      let n = new S(new d(1.2, 0.26), new C({ map: l, roughness: 0.6 }));
      (n.position.set(0, 0.32, t), t < 0 && (n.rotation.y = Math.PI), e.add(n));
    }
  let u = new h(lc, 0, 6, 2);
  return ((u.position.y = -0.3), e.add(u), { root: e, light: u });
}
var Ec = class t extends aa {
  constructor(n) {
    (super(n),
      e(this, `root`, new y()),
      e(this, `desk`, Cc()),
      e(this, `deskPos`, new T()),
      e(this, `paper`, void 0),
      e(this, `marker`, wc()),
      e(this, `folder`, void 0),
      e(this, `ring`, void 0),
      e(this, `ringLight`, new h(lc, 0, 5, 2)),
      e(this, `deskLight`, new h(uc, 0, 4, 2)),
      e(this, `deskGlow`, void 0),
      e(this, `keyLight`, new h(16769720, 0, 7, 1.6)),
      e(this, `stamp`, Tc()),
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
      (this.deskGlow = M(uc, 2.2, 0)),
      this.deskGlow.position.copy(this.deskPos).setY(0.9),
      this.deskLight.position.copy(this.deskPos).setY(1.4),
      this.keyLight.position.set(n.caster.x + r * 0.9, 2.3, 2),
      this.root.add(this.deskGlow, this.deskLight, this.keyLight));
    let i = mc(`order`, bc),
      a = new C({
        color: i ? 16777215 : 16183516,
        map: i,
        roughness: 0.8,
        side: 2,
      });
    ((this.paper = new S(new d(0.3, 0.4), a)),
      (this.paper.rotation.x = -Math.PI / 2),
      (this.paper.rotation.z = r > 0 ? Math.PI / 2 : -Math.PI / 2),
      (this.paper.visible = !1),
      this.desk.add(this.paper),
      this.paper.position.set(-0.08, 0.795, 0),
      (this.folder = new S(new d(0.42, 0.56), a)),
      (this.folder.visible = !1),
      this.root.add(this.folder),
      (this.marker.visible = !1),
      this.root.add(this.marker));
    let o = mc(`ring`, yc),
      s = new k({
        color: o ? 16777215 : lc,
        map: o,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
        side: 2,
      });
    ((this.ring = new S(new Re(1.15, 48), s)),
      (this.ring.rotation.x = -Math.PI / 2),
      this.ring.position.set(n.target.x, 0.03, 0),
      this.ringLight.position.set(n.target.x, 0.8, 0.4),
      this.root.add(this.ring, this.ringLight),
      (this.stamp.root.visible = !1),
      this.root.add(this.stamp.root));
    let c = mc(`ink`, xc);
    ((this.ink = new S(
      new d(1.6, 0.8),
      new k({
        color: c ? 16777215 : lc,
        map: c,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
      }),
    )),
      (this.ink.rotation.x = -Math.PI / 2),
      (this.ink.visible = !1),
      this.root.add(this.ink));
    let l = mc(`crate`, _c),
      u = dc(l ? 16777215 : 11565630, 0.75, { map: l }),
      f = new w(0.42, 0.42, 0.42),
      { CRATES: p, TAGS: m, SHOW_END: g, STAMP_IN: _ } = t,
      v = _ + 0.9 - g;
    for (let e = 0; e < p; e++) {
      let t = new S(f, u);
      ((t.visible = !1),
        (t.castShadow = !N),
        this.root.add(t),
        this.crates.push({
          m: t,
          at: g + (e / p) * v,
          phase: (e * 2.399) % (Math.PI * 2),
          r: 1 + (e % 4) * 0.26,
          h: 2 + ((e * 7) % 11) * 0.2,
          spin: new T(Math.random() * 3, Math.random() * 3, Math.random() * 3),
          vel: new T(),
          bounces: 0,
          free: !1,
        }));
    }
    let b = new d(0.36, 0.18),
      x = [`+50%`, `+25%`, `+100%`, `TAX!`].map((e) => {
        let t = mc(`tag:${e}`, () => vc(e));
        return new k({
          color: t ? 16777215 : lc,
          map: t,
          transparent: !0,
          alphaTest: 0.3,
          side: 2,
        });
      });
    for (let e = 0; e < m; e++) {
      let t = new S(b, x[e % x.length]);
      ((t.visible = !1),
        this.root.add(t),
        this.tags.push({
          m: t,
          at: g + 0.1 + (e / m) * v,
          phase: (e * 1.7) % (Math.PI * 2),
          r: 0.55 + (e % 3) * 0.3,
          h: 1.8 + (e % 5) * 0.3,
          spin: new T(0, 2 + Math.random() * 3, 0),
          vel: new T(),
          bounces: 0,
          free: !1,
        }));
    }
    let ee = mc(`bill`, Sc),
      te = new k({ color: ee ? 16777215 : 8368762, map: ee, side: 2 }),
      ne = new d(0.26, 0.11);
    for (let e = 0; e < 16; e++) {
      let e = new S(ne, te);
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
    (n.audio.startSuperBed(t.STAMP / ot, `tariff`), n.audio.whoosh());
  }
  presentPose(e) {
    return F(V(e, `trump`), {
      rootY: 0,
      ...B(0, 0.12, -0.14),
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
    return F(V(e, `trump`), {
      rootY: -0.06,
      ...B(-0.06, 0.2, -0.22),
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
    return F(V(e, `trump`), {
      rootY: 0,
      ...B(0, 0.12, -0.14),
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
    return F(V(e, `trump`), {
      rootY: -0.02,
      ...B(-0.02, 0.16, -0.18),
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
    return F(this.commandPose(e), {
      rShF: 2.95 - t * 1.85,
      rEl: 0.05 + t * 0.1,
      spineF: -0.14 + t * 0.3,
      headF: -0.42 + t * 0.4,
      rootY: -0.02 - t * 0.06,
    });
  }
  gloatPose(e) {
    let t = Math.sin(e * 3.4);
    return F(V(e, `trump`), {
      rootY: 0,
      ...B(0, 0.12, -0.12),
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
    return F(Gi(e, this.d.target.char.id), {
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
    return F(Gi(e, this.d.target.char.id), {
      rootY: -0.3,
      ...B(-0.3, 0.3, -0.3),
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
          ? I(V(d, `trump`), this.presentPose(d), R(d / 0.3))
          : d < i
            ? I(this.presentPose(d), this.signPose(d), z((d - r) / 0.3))
            : d < a
              ? I(this.signPose(d), this.showPose(d), R((d - i) / 0.25))
              : d < o - 0.35
                ? I(this.showPose(d), this.commandPose(d), z((d - a) / 0.35))
                : d < c
                  ? this.chopPose(d, R(L((d - o + 0.35) / 0.3)))
                  : I(
                      this.chopPose(d, 1),
                      this.gloatPose(d),
                      z((d - c) / 0.4),
                    )),
      d < a
        ? ((this.targetPose = Gi(d, p.char.id)), this.settleTarget(e))
        : d < o
          ? ((this.targetPose = this.lookUpPose(d, L((d - a) / 1.2))),
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
                  ravi: `Tariff? Paisa toh mere peeche aata hai!`,
                  lalu: `Tariff? Railway mein toh concession milta hai!`,
                }[p.char.id],
              ))
          : d < c
            ? (this.targetPose = this.squashedPose(d))
            : ((this.targetPose = null), p.update(Ti(), f.x)),
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
        n.fx.shockwave(this.v1, lc, 0.7, 2.2),
        n.fx.shockwave(this.v1, 16777215, 0.5, 1.4),
        n.fx.dust(this.v1, 2.5),
        n.fx.particles.emit(this.v1.set(p.x, 0.4, 0), {
          count: 90,
          speed: 6,
          color: uc,
          life: 1.2,
          size: 0.12,
          gravity: 9,
          drag: 0.8,
          dir: fc,
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
        2.6 * R(L(d / 0.4)) * (1 - L((d - (l - 0.6)) / 0.5))),
      d >= l && ((f.y = 0), (this.done = !0)));
  }
  stepDesk(e, n) {
    let r = this.d,
      { DESK_UP: i, SIGN_END: a, SHOW_END: o, LIFT: s, END: c } = t,
      l = r.caster.facing,
      u = R(L((e - 0.1) / (i - 0.1)));
    (e > s + 0.4 && (u *= 1 - z(L((e - s - 0.4) / (c - s - 0.8)))),
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
          color: uc,
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
        r.audio.penScribble((a - i - 0.1) / ot, 7),
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
            color: uc,
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
      let i = L((e - o) / 0.6);
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
      s = R(L((e - r) / 0.6)),
      c = e < i ? 1 : 1 - L((e - i) / 0.5),
      l = L((e - r) / (a - r));
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
    let l = L((e - t.SHOW_END) / (r - t.SHOW_END));
    ((this.nextChant = e + 0.55 - l * 0.3),
      this.chantIdx === 1 && n.audio.drumroll((t.STAMP - e) / ot));
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
      s = L((e - i) / (a - i)),
      c = 1.2 + s * s * 3.5,
      l = 1 - z(L((e - a + 0.5) / 0.5)) * 0.45;
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
          let r = L((e - (o - 0.7)) / 0.6);
          (t.m.scale.setScalar(Math.max(0.001, 1 - r)),
            r >= 1 && (t.m.visible = !1));
        } else {
          let r = this.orbit(t, e, c, l, this.v1),
            i = R(L((e - t.at) / 0.55));
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
      o = L((e - r) / (i - r)),
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
            i = R(L((e - t.at) / 0.5));
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
      d = 10 + -6.8 * R(L((e - i) / 0.5)) + Math.sin(e * 9) * 0.05;
    else if (e < a) {
      let t = (e - (a - 0.4)) / 0.4;
      d =
        t < 0.5
          ? 3.2 + R(t / 0.5) * 0.5
          : 3.7 - 3.04 * ((t - 0.5) / 0.5) ** 2.2;
    } else
      d =
        e < o
          ? u +
            Math.max(0, Math.sin((e - a) * 18) * 0.05 * Math.exp(-(e - a) * 6))
          : u + z(L((e - o) / 0.6)) * 9;
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
    let a = L((e - n) / 0.15);
    this.ink.material.opacity = a * (1 - L((e - (r - 0.8)) / 0.7));
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
((cc = Ec),
  e(Ec, `DESK_UP`, 0.6),
  e(Ec, `SIGN_END`, 2),
  e(Ec, `SHOW_END`, 2.8),
  e(Ec, `STAMP`, 5),
  e(Ec, `STAMP_IN`, 3.5),
  e(Ec, `LIFT`, cc.STAMP + 0.6),
  e(Ec, `END`, cc.STAMP + 2.4),
  e(Ec, `CRATES`, 20),
  e(Ec, `TAGS`, 10),
  e(Ec, `CHANT`, [
    `TARIFF!`,
    `TARIFF!!`,
    `50%!`,
    `HUGE!`,
    `TARIFF!`,
    `TREMENDOUS!`,
  ]));
var Dc = `/fightkaro/models/${N ? `mobile/` : ``}`,
  Oc = `?v=20261104_webp`,
  kc = `?v=20261104_webp`,
  Ac = {
    modi: `${Dc}modi.glb${kc}`,
    rahul: `${Dc}rahul.glb${kc}`,
    didi: `${Dc}didi.glb${kc}`,
    trump: `${Dc}trump.glb${kc}`,
    yogi: `${Dc}yogi.glb${kc}`,
    nitin: `${Dc}nitin.glb${kc}`,
    mbapu: `${Dc}mbapu.glb${Oc}`,
    ravi: `${Dc}ravi.glb${kc}`,
    lalu: `${Dc}lalu.glb${kc}`,
  },
  jc = {
    modi: `/fightkaro/models/modi.glb${kc}`,
    rahul: `/fightkaro/models/rahul.glb${kc}`,
    didi: `/fightkaro/models/didi.glb${kc}`,
    trump: `/fightkaro/models/trump.glb${kc}`,
    yogi: `/fightkaro/models/yogi.glb${kc}`,
    nitin: `/fightkaro/models/nitin.glb${kc}`,
    mbapu: `/fightkaro/models/mbapu.glb${Oc}`,
    ravi: `/fightkaro/models/ravi.glb${kc}`,
    lalu: `/fightkaro/models/lalu.glb${kc}`,
  },
  Mc = { bulldozer: { url: `${Dc}bull1.glb${Oc}`, owner: `yogi` } },
  Nc = {};
function Pc(e) {
  let t = Nc[e];
  return t ? t.clone(!0) : null;
}
var Fc = 1.32;
function Ic(e) {
  for (let t of e)
    t.tracks = t.tracks.filter((e) => !/Head(?!Top)[^.]*\.scale$/.test(e.name));
}
var Lc = p.degToRad(82),
  Rc = new T(1, 0, 0),
  zc = new T(0, 1, 0),
  Bc = new T(0, 0, 1),
  Vc = [`Index`, `Middle`, `Ring`, `Pinky`],
  Hc = [1.45, 1.6, 1.05],
  Uc = [0.18, 0.22, 0.12],
  Wc = {},
  Gc = null;
function Kc(e) {
  if (!Gc) {
    let t = new Se(e);
    ((Gc = t.fromScene(new Pe(), 0.04).texture), t.dispose());
  }
  return Gc;
}
var qc = 12e3;
function Jc(e, t) {
  return new Promise((n, r) => {
    let i = 0,
      a = () => {
        (window.clearTimeout(i),
          (i = window.setTimeout(
            () => r(Error(`download stalled: ${t}`)),
            qc,
          )));
      };
    (a(),
      e.load(
        t,
        (e) => {
          (window.clearTimeout(i), n(e));
        },
        a,
        (e) => {
          (window.clearTimeout(i), r(e));
        },
      ));
  });
}
async function Yc(e, t) {
  let n = new ve(),
    r = new we();
  r.setDRACOLoader(n);
  let i = Kc(e),
    a = (t ?? Di).filter((e) => e in Ac && !Wc[e]),
    o = [],
    s = Object.keys(Mc).filter((e) => a.includes(Mc[e].owner) && !Nc[e]);
  return (
    await Promise.all([
      ...s.map(async (e) => {
        try {
          let t = await Jc(r, Mc[e].url);
          (tl(t.scene),
            al(t.scene, i),
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
            (Nc[e] = t.scene));
        } catch (t) {
          console.warn(
            `[models] prop ${e} failed to load, using a stand-in`,
            t,
          );
        }
      }),
      ...a.map(async (e) => {
        try {
          let t = await Jc(r, Ac[e])
              .catch(() =>
                new Promise((e) => setTimeout(e, 600)).then(() =>
                  Jc(r, `${Ac[e]}&retry=1`),
                ),
              )
              .catch(() => Jc(r, jc[e])),
            n = t.scene;
          (Ic(t.animations),
            tl(n),
            al(n, i),
            il(n, P[e].brightness),
            n.updateMatrixWorld(!0));
          let a = ll(n, `LeftUpLeg`);
          ((Wc[e] = {
            scene: n,
            scale: at / (a ? a.getWorldPosition(new T()).y : at),
            dance: t.animations.find((e) => e.name === `dance`) ?? null,
            clips: P[e].fightClips ? t.animations : [],
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
function Xc(e) {
  return e in Wc;
}
async function Zc(e, t, n) {
  if (Wc[e]) return (n?.(100), !0);
  let r = new ve(),
    i = new we();
  i.setDRACOLoader(r);
  let a = Kc(t),
    o = Ac[e] || jc[e],
    s = new AbortController(),
    c = 0,
    l = () => {
      (window.clearTimeout(c), (c = window.setTimeout(() => s.abort(), qc)));
    };
  try {
    l();
    let t = await fetch(o, { signal: s.signal });
    if (!t.ok) throw Error(`HTTP ${t.status}`);
    let u = Number(t.headers.get(`content-length`)) || (N ? 13e5 : 22e5),
      d = 0,
      f = t.body?.getReader(),
      p = [];
    if (f)
      for (;;) {
        let { done: e, value: t } = await f.read();
        if (e) break;
        (l(),
          p.push(t),
          (d += t.length),
          n?.(Math.min(92, Math.round((d / u) * 92))));
      }
    window.clearTimeout(c);
    let m = new Uint8Array(d),
      h = 0;
    for (let e of p) (m.set(e, h), (h += e.length));
    let g = await new Promise((e, t) => {
        i.parse(m.buffer, ``, e, t);
      }),
      _ = g.scene;
    (Ic(g.animations),
      tl(_),
      al(_, a),
      il(_, P[e].brightness),
      _.updateMatrixWorld(!0));
    let v = ll(_, `LeftUpLeg`);
    Wc[e] = {
      scene: _,
      scale: at / (v ? v.getWorldPosition(new T()).y : at),
      dance: g.animations.find((e) => e.name === `dance`) ?? null,
      clips: P[e].fightClips ? g.animations : [],
    };
    let y = Object.keys(Mc).filter((t) => Mc[t].owner === e && !Nc[t]);
    for (let e of y)
      try {
        let t = await Jc(i, Mc[e].url);
        (tl(t.scene),
          al(t.scene, a),
          t.scene.traverse((e) => {
            if (!e.isMesh) return;
            e.geometry.userData.shared = !0;
            let t = Array.isArray(e.material) ? e.material : [e.material];
            for (let e of t)
              ((e.userData.shared = !0), e.map && (e.map.userData.shared = !0));
          }),
          (Nc[e] = t.scene));
      } catch (t) {
        console.warn(`[models] prop ${e} failed to load`, t);
      }
    return (n?.(100), r.dispose(), !0);
  } catch (n) {
    return (
      window.clearTimeout(c),
      console.warn(
        `[models] progress download failed for ${e}, falling back`,
        n,
      ),
      r.dispose(),
      Qc(e, t)
    );
  }
}
async function Qc(e, t) {
  return Wc[e] ? !0 : (await Yc(t, [e])).includes(e);
}
function $c(e) {
  let t = new Set(),
    n = [],
    r = Wc[e];
  r && n.push(r.scene);
  for (let [t, r] of Object.entries(Mc)) {
    let i = Nc[t];
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
function el(e, t = !1) {
  let n = Wc[e.id];
  if (!n) throw Error(`${e.id}: model not loaded`);
  return new ml(e, n, t);
}
function tl(e, t = 1024) {
  if (!N) return;
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
var nl = [
  {
    re: /^outfit_(top|bottom)$|^didi_(sari|blouse)$|^yogi_body$|^nitin_body$/,
    mode: `all`,
  },
  { re: /^trump_body$/, mode: `blue` },
];
function rl(e, t) {
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
function il(e, t = 1) {
  t !== 1 &&
    e.traverse((e) => {
      let n = e;
      if (n.isMesh)
        for (let e of Array.isArray(n.material) ? n.material : [n.material])
          e.color?.multiplyScalar(t);
    });
}
function al(e, t) {
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
                    : n === `glasses` && ol(e);
    }
  });
}
function ol(e) {
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
var sl = null;
function cl() {
  if (sl) return sl.clone();
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
    (sl = new k({
      map: new _e(e),
      transparent: !0,
      depthWrite: !1,
      opacity: 0.55,
    })),
    sl.clone()
  );
}
function ll(e, t) {
  let n = null,
    r = RegExp(`^${t}(_\\d+)?$`);
  return (
    e.traverse((e) => {
      !n && e.isBone && r.test(e.name) && (n = e);
    }),
    n
  );
}
var ul = new ie(),
  dl = new ie(),
  fl = new ie(),
  pl = new ze(),
  ml = class {
    constructor(t, n, r = !1) {
      (e(this, `def`, void 0),
        e(this, `root`, new y()),
        e(this, `current`, ki()),
        e(this, `yaw`, 0),
        e(this, `body`, new y()),
        e(this, `model`, void 0),
        e(this, `scale`, void 0),
        e(this, `j`, {}),
        e(this, `fingers`, { l: [], r: [], lThumb: [], rThumb: [] }),
        e(this, `hipsRestPos`, new T()),
        e(this, `headCenter`, new f()),
        e(this, `handAnchor`, void 0),
        e(this, `eyes`, []),
        e(this, `hands`, void 0),
        e(this, `handRest`, void 0),
        e(this, `eyeAnchors`, {}),
        e(this, `A0L`, new ie().setFromAxisAngle(Bc, -Lc)),
        e(this, `A0R`, new ie().setFromAxisAngle(Bc, Lc)),
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
        (this.model = je(n.scene)),
        r &&
          this.model.traverse((e) => {
            let t = e;
            if (!t.isMesh) return;
            let n = (e) => {
              let t = nl.find((t) => t.re.test(e.name));
              return t ? rl(e, t.mode) : e;
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
        let t = ll(this.model, e);
        if (!t) return null;
        let n = new ie();
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
        for (let n of Vc)
          t.push(
            [1, 2, 3].map((t) => i(`${e}Hand${n}${t}`)).filter((e) => !!e),
          );
        let n = [1, 2, 3].map((t) => i(`${e}HandThumb${t}`)).filter((e) => !!e);
        e === `Left` ? (this.fingers.lThumb = n) : (this.fingers.rThumb = n);
        let r = ll(this.model, `${e}Eye`);
        r && this.eyes.push(r);
      }
      this.hipsRestPos.copy(this.j.Hips.bone.position);
      let a = t.forearmScale ?? 1;
      if (a !== 1)
        for (let e of [`LeftForeArm`, `RightForeArm`])
          this.j[e]?.bone.scale.set(a, 1, a);
      this.j.Head.bone.scale.multiplyScalar(Fc);
      let o = this.j.Head.bone,
        s = o.getWorldQuaternion(new ie()).invert();
      (this.headCenter.position.copy(new T(0, 0.1, 0.03).applyQuaternion(s)),
        o.add(this.headCenter));
      for (let e of [`Left`, `Right`]) {
        let t = ll(this.model, `${e}Eye`);
        if (!t) continue;
        let n = new f();
        (n.position.copy(
          o.worldToLocal(t.getWorldPosition(new T()).add(new T(0, 0, 0.012))),
        ),
          o.add(n),
          (this.eyeAnchors[e === `Left` ? `l` : `r`] = n));
      }
      let c = (e) =>
        ll(this.model, `${e}HandMiddle1`) ?? ll(this.model, `${e}Hand`);
      if (
        ((this.handAnchor = { l: c(`Left`), r: c(`Right`) }),
        (this.hands = {
          l: ll(this.model, `LeftHand`),
          r: ll(this.model, `RightHand`),
        }),
        (this.handRest = {
          l: this.hands.l?.quaternion.clone() ?? new ie(),
          r: this.hands.r?.quaternion.clone() ?? new ie(),
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
          (this.mixer = new pe(this.model)),
          n.dance && (this.danceAction = this.mixer.clipAction(n.dance)));
        for (let e of n.clips)
          this.clipActions.set(e.name, this.mixer.clipAction(e));
      }
      ((this.contact = new S(new Re(0.42, 32), cl())),
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
      return ul.setFromEuler(pl.set(e * r, t * r, n * r, `XYZ`));
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
        dl
          .setFromEuler(pl.set(-e.lShF, e.lShT, e.lShO, `XYZ`))
          .multiply(this.A0L),
        this.set(t.LeftArm, dl),
        fl.setFromAxisAngle(Rc, -e.lEl),
        dl.copy(this.A0Linv).multiply(fl).multiply(this.A0L),
        this.set(t.LeftForeArm, dl),
        dl
          .setFromEuler(pl.set(-e.rShF, -e.rShT, -e.rShO, `XYZ`))
          .multiply(this.A0R),
        this.set(t.RightArm, dl),
        fl.setFromAxisAngle(Rc, -e.rEl),
        dl.copy(this.A0Rinv).multiply(fl).multiply(this.A0R),
        this.set(t.RightForeArm, dl),
        this.set(t.LeftUpLeg, this.fromEuler(-e.lThF, 0, e.lThO)),
        this.set(t.LeftLeg, fl.setFromAxisAngle(Rc, e.lKn)),
        this.set(t.LeftFoot, fl.setFromAxisAngle(Rc, e.lAnk)),
        this.set(t.RightUpLeg, this.fromEuler(-e.rThF, 0, -e.rThO)),
        this.set(t.RightLeg, fl.setFromAxisAngle(Rc, e.rKn)),
        this.set(t.RightFoot, fl.setFromAxisAngle(Rc, e.rAnk)),
        this.applyHand(this.fingers.l, this.fingers.lThumb, e.lHand, -1),
        this.applyHand(this.fingers.r, this.fingers.rThumb, e.rHand, 1));
      for (let [t, n, r, i] of [
        [this.hands.l, this.handRest.l, e.lWf, e.lWr],
        [this.hands.r, this.handRest.r, -e.rWf, -e.rWr],
      ])
        t &&
          t.quaternion
            .copy(n)
            .multiply(fl.setFromAxisAngle(Bc, r))
            .multiply(dl.setFromAxisAngle(zc, i));
    }
    applyHand(e, t, n, r) {
      let i = Math.max(0, Math.min(1, n));
      for (let t = 0; t < e.length; t++) {
        let n = e[t],
          a = 0.92 + t * 0.05;
        for (let e = 0; e < n.length; e++) {
          let t = (Hc[e] * (1 - i) + Uc[e] * i) * a;
          this.set(n[e], fl.setFromAxisAngle(Bc, r * t));
        }
      }
      for (let e = 0; e < t.length; e++) {
        let n = (1 - i) * [0.55, 0.5, 0.4][e] + i * 0.05;
        (fl.setFromAxisAngle(Rc, n),
          dl.setFromAxisAngle(zc, r * (1 - i) * (e === 0 ? 0.35 : 0)),
          this.set(t[e], fl.multiply(dl)));
      }
    }
    blendTo(e, t, n) {
      let r = 1 - Math.exp(-t * n);
      for (let t of Oi) this.current[t] += (e[t] - this.current[t]) * r;
      (this.tickLife(n), this.applyPose(this.current));
    }
    snapTo(e) {
      (Object.assign(this.current, Ai(e)), this.applyPose(this.current));
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
      ((this.yaw = Ts(this.yaw + Ts(a - this.yaw) * o)),
        this.root.rotation.set(0, this.yaw, 0),
        this.updateContact());
    }
    setFree(e, t, n, r, i = 0) {
      (this.root.position.set(e, t, n),
        (this.yaw = Ts(r)),
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
        this.applyHand(this.fingers.l, this.fingers.lThumb, e.open ?? 0, -1),
        this.applyHand(this.fingers.r, this.fingers.rThumb, e.open ?? 0, 1),
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
  hl,
  gl = 16718362,
  _l = 16711680,
  vl = 15751680,
  yl = new T(0, 1, 0),
  bl = 0.036,
  xl = 0.108,
  Sl = -0.02,
  Cl = `radial-gradient(ellipse at center, rgba(255,0,0,0) 42%, rgba(150,0,0,0.6) 100%)`,
  wl = new Map();
function Tl(e, t, n, r) {
  if (!wl.has(e)) {
    let a = null;
    if (typeof document < `u`) {
      let e = document.createElement(`canvas`);
      ((e.width = t), (e.height = n));
      let o = e.getContext(`2d`);
      o &&
        (r(o), (a = new _e(e)), (a.colorSpace = i), (a.userData.shared = !0));
    }
    wl.set(e, a);
  }
  return wl.get(e);
}
var El = () =>
    Tl(`dozer-puff`, 64, 64, (e) => {
      let t = e.createRadialGradient(32, 32, 0, 32, 32, 32);
      (t.addColorStop(0, `rgba(255,255,255,0.95)`),
        t.addColorStop(0.45, `rgba(255,255,255,0.55)`),
        t.addColorStop(1, `rgba(255,255,255,0)`),
        (e.fillStyle = t),
        e.fillRect(0, 0, 64, 64));
    }),
  Dl = () => {
    let e = Tl(`dozer-tread`, 128, 64, (e) => {
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
    return (e && (e.wrapS = oe), e);
  },
  Ol = () =>
    Tl(`dozer-dust`, 256, 256, (e) => {
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
function kl() {
  let e = new y(),
    t = new C({ color: 15246138, roughness: 0.55, metalness: 0.2 }),
    n = new C({ color: 2236446, roughness: 0.8 }),
    r = new C({ color: 9422040, roughness: 0.15, metalness: 0.3 }),
    i = (t, n, r, i, a, o, s) => {
      let c = new S(new w(t, n, r), i);
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
var Al = class t extends aa {
  constructor(n) {
    (super(n),
      e(this, `root`, new y()),
      e(this, `dozer`, new y()),
      e(this, `tilt`, new y()),
      e(this, `loader`, void 0),
      e(this, `eyes`, []),
      e(this, `beams`, []),
      e(this, `eyeLight`, new h(gl, 0, 3.2, 2)),
      e(this, `eyeTmp`, new T()),
      e(this, `headLight`, new h(16769184, 0, 7, 1.6)),
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
    let a = j - 0.45,
      o =
        Math.abs(n.target.x - n.caster.x) < i ? n.caster.x + r * i : n.target.x;
    o = Math.max(-a, Math.min(a, o));
    let s = n.caster.x;
    ((o - s) * r < i && (s = Math.max(-a, Math.min(a, o - r * i))),
      (this.casterX1 = s),
      (this.targetX1 = o));
    for (let e = 0; e < 2; e++) {
      let e = M(gl, 0.3, 0),
        t = M(16730682, 0.035, 0),
        n = M(gl, 1, 0);
      (n.scale.set(0.9, 0.05, 1),
        this.root.add(e, t, n),
        this.eyes.push({ glow: e, core: t, flare: n }));
      let r = new S(
        new O(0.03, 0.012, 1, 6, 1, !0),
        new k({
          color: _l,
          transparent: !0,
          opacity: 0,
          blending: 2,
          depthWrite: !1,
        }),
      );
      ((r.visible = !1), this.root.add(r), this.beams.push(r));
    }
    this.root.add(this.eyeLight);
    let c = Pc(`bulldozer`) ?? kl();
    ((this.loader = c.getObjectByName(`Loader`) ?? null),
      this.tilt.add(c),
      this.dozer.add(this.tilt),
      (this.dozer.rotation.y = -r * (Math.PI / 2)),
      (this.dozer.visible = !1),
      this.root.add(this.dozer));
    for (let e of [-0.36, 0.36]) {
      let t = M(16770720, 0.32, 0);
      (t.position.set(e, 1.2, 0.55), this.tilt.add(t), this.lamps.push(t));
    }
    (this.headLight.position.set(0, 1.3, 3), this.tilt.add(this.headLight));
    let l = Ol();
    for (let e = 0; e < 3; e++) {
      let t = new k({
          color: l ? 16777215 : 12888706,
          map: l,
          transparent: !0,
          opacity: 0,
          depthWrite: !1,
        }),
        n = new S(new d(1, 1), t);
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
    let u = Dl(),
      f = new k({
        color: u ? 16777215 : 2759698,
        map: u,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
      });
    for (let e of [-0.6, 0.6]) {
      let t = new S(new d(1, 0.42), f);
      ((t.rotation.x = -Math.PI / 2),
        t.position.set(0, 0.025, e),
        (t.visible = !1),
        this.root.add(t),
        this.treads.push(t));
    }
    let p = El();
    for (let e = 0; e < (N ? 20 : 32); e++) {
      let e = new le(
        new De({
          map: p,
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
    let m = new w(0.16, 0.1, 0.12),
      g = [
        new C({ color: 10129284, roughness: 0.9 }),
        new C({ color: 10769722, roughness: 0.85 }),
      ];
    for (let e = 0; e < 14; e++) {
      let t = new S(m, g[e % 2]);
      ((t.visible = !1),
        t.scale.setScalar(0.7 + (e % 4) * 0.25),
        this.root.add(t),
        this.chunks.push({ m: t, vel: new T(), spin: new T() }));
    }
    n.audio.startSuperBed(t.CRUSH / ot, `bulldozer`);
  }
  namaste(e, t, n = 0) {
    return F(V(e, `yogi`), {
      rootY: -0.02,
      ...B(-0.02, 0.1, -0.1),
      hipsT: -this.d.caster.facing * 0.85 * n,
      spineT: 0,
      spineF: 0.04 + t * 0.12,
      chestF: 0,
      headT: 0,
      headF: -0.06 + t * 0.34,
      ...Qi,
    });
  }
  shield(e, t) {
    return F(Gi(e, this.d.target.char.id), {
      rootY: -0.08 * t,
      ...B(-0.08 * t, 0.18, -0.34),
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
    return F(Gi(e, this.d.target.char.id), {
      rootY: -0.06,
      ...B(-0.06, 0.16 + n * 0.3, -0.2 - n * 0.3),
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
    return F(Hi(e), {
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
      y = R(L((p - r - 0.15) / (i + 0.25 - r - 0.15)));
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
          ? I(V(p, `yogi`), this.namaste(p, 1, 1), R(p / 0.25))
          : p < a
            ? this.namaste(p, 1 - R((p - r) / 0.3), 1)
            : this.namaste(
                p,
                0.25 * Math.sin(L((p - a) / 0.6) * Math.PI),
                1 - z((p - a) / 0.5),
              )),
      p < o)
    ) {
      let t = R(L((p - r - 0.1) / 0.3)) * (1 - 0.5 * L((p - i - 0.3) / 0.35));
      ((this.targetPose = this.shield(p, t)), this.settleTarget(e));
    } else
      p < s[0]
        ? ((this.targetPose = this.panic(p, R(L((p - o - 0.15) / 0.35)))),
          this.settleTarget(e))
        : this.popped
          ? ((this.targetPose = null), h.update(Ti(), m.x))
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
            ravi: `Bulldozer? Shooting ka set mat todo!`,
            lalu: `Bulldozer? Patri pe mat chadhao!`,
            mbapu: `Bulldozer nahi, shanti chahiye!`,
          }[h.char.id],
        ),
      _(r) && (n.audio.eyeZing(), n.flash(Cl, 650)),
      _(i) && (n.audio.whoosh(), n.flash(Cl, 550), n.cam.shake(0.08, 0.28)),
      _(a) && n.flash(Cl, 450),
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
      x = [`#ff4d2e`, `#ff2222`, `#ff0022`];
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
        t && n.fx.shockwave(this.v1, vl, 0.7, 2.4),
        n.fx.dust(this.v1, 1.5 + e * 0.8),
        n.fx.particles.emit(this.v2.set(h.x, 0.22, 0), {
          count: 38 + e * 22,
          speed: 3.6 + e * 1.1,
          color: 12888706,
          life: 0.75 + e * 0.15,
          size: 0.11 + e * 0.02,
          gravity: 11,
          drag: 1.2,
          dir: yl,
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
          dir: yl,
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
        n.popup(b[e], this.v1.set(h.x, 2.4 + e * 0.15, 0.3), x[e]),
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
      o = e * bl * a,
      s = xl * a;
    return t.set(
      t.x + o * Math.cos(i) + s * Math.sin(i),
      t.y + Sl * a,
      t.z - o * Math.sin(i) + s * Math.cos(i),
    );
  }
  stepEyes(e, n) {
    let { IGNITE: r, GLARE: i, CRUSH: a, REVERSE: o } = t,
      s = R(L((e - r) / (i - r))) * (1 - L((e - a - 0.6) / (o - a - 0.6))),
      c = 0.85 + Math.sin(e * 37) * 0.08 + Math.sin(e * 61) * 0.07,
      l =
        1 +
        0.6 * Math.max(0, 1 - Math.abs(e - i) / 0.25) +
        0.4 * Math.max(0, 1 - Math.abs(e - a) / 0.3),
      u = s * c * l,
      d = this.d.target,
      f = L((e - i + 0.12) / 0.1) * (1 - L((e - i - 1.68) / 0.2));
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
          i.quaternion.setFromUnitVectors(yl, a.multiplyScalar(1 / o)),
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
              color: _l,
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
    if (e < o) return z(L((e - (n + 0.25)) / Math.max(0.1, o - (n + 0.25))));
    for (let t = 0; t < r.length; t++) {
      let n = r[t],
        i = t === 0 ? o : r[t - 1] + 0.08;
      if (e <= n + 0.08) {
        let r = n - 0.16;
        if (e < r) {
          let n = L((e - i) / Math.max(0.05, r - i));
          return t === 0 ? 1 : R(n);
        }
        if (e < n) {
          let t = L((e - r) / 0.16);
          return 1 - t * t;
        }
        return 0;
      }
    }
    return e < i
      ? 0
      : e < a
        ? 0.25 * z(L((e - i) / (a - i)))
        : 0.25 * (1 - L((e - a) / 0.5));
  }
  dozerXAt(e) {
    let { ARRIVE: n, SLAMS: r, REVERSE: i, END: a, ENTRY: o } = t,
      s = this.d.caster.facing,
      c = r[0] - 0.35;
    if (e < c) {
      let t = R(L((e - n) / (c - n)));
      return this.crushX + s * o * (1 - t);
    }
    if (e < i) return this.crushX;
    let l = L((e - i) / (a - i));
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
    let m = L((e - i) / 0.3) * (0.8 + Math.sin(e * 13) * 0.1);
    for (let e of this.lamps) e.material.opacity = m * 0.7;
    this.headLight.intensity = 1.1 * m;
    let h = 1 - L(Math.abs(this.dozerX - this.targetX1) / 9);
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
      x = 1 - L((e - (s - 0.35)) / 0.3);
    for (let e of this.treads) {
      ((e.position.x = (_ + y) / 2), (e.scale.x = b));
      let t = e.material;
      ((t.opacity = 0.85 * x), t.map && t.map.repeat.set(b / 0.55, 1));
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
          t.s.scale.setScalar(t.size * (1 + t.grow * R(n))),
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
      i = 1 - L((e - (r - 0.45)) / 0.4);
    for (let t = 0; t < this.dustPools.length; t++) {
      let r = this.dustPools[t],
        a = e - n[t];
      if (a < 0) {
        r.mesh.visible = !1;
        continue;
      }
      ((r.mesh.visible = !0),
        (r.mesh.position.x = this.targetX1 + (t - 1) * 0.16));
      let o = (0.25 + 0.75 * R(L(a / 0.28))) * r.maxScale;
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
            o = R(L((e - (n[r] - 0.04)) / 0.08)),
            s =
              r < 2 && e > n[r] + 0.12
                ? Math.sin(L((e - n[r] - 0.12) / 0.4) * Math.PI) * 0.1
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
        a = 1.05 - z(L((e - r) / (i - r))) * 0.35;
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
((hl = Al),
  e(Al, `IGNITE`, 0.35),
  e(Al, `GLARE`, 0.85),
  e(Al, `POINT`, 1.2),
  e(Al, `ARRIVE`, 1.5),
  e(Al, `SLAMS`, [2.65, 3.35, 4.05]),
  e(Al, `CRUSH`, hl.SLAMS[2]),
  e(Al, `STOP`, hl.CRUSH + 0.55),
  e(Al, `REVERSE`, hl.CRUSH + 0.95),
  e(Al, `END`, hl.CRUSH + 2.6),
  e(Al, `GAP`, 2.6),
  e(Al, `HALF_LEN`, 1.6),
  e(Al, `ENTRY`, 9.5),
  e(Al, `BUCKET_REACH`, 1.35),
  e(Al, `LIFT_ANGLE`, 1.2));
var jl = 16764730;
function Ml() {
  let e = new D(0.5, 36, 22),
    t = e.attributes.position,
    n = new T(),
    r = new Float32Array(t.count * 3),
    i = new Be(14464124),
    a = new Be(15519898),
    o = new Be(12094293),
    s = new Be();
  for (let e = 0; e < t.count; e++) {
    n.fromBufferAttribute(t, e);
    let c =
      1 +
      0.045 * Math.sin(n.x * 5 + 1) * Math.cos(n.z * 4) +
      0.03 * Math.sin(n.y * 6 + n.x * 2.5);
    (n.set(n.x * 1.42, n.y * 0.8, n.z * 0.92).multiplyScalar(c),
      n.y < -0.26 && (n.y = -0.26 + (n.y + 0.26) * 0.45),
      t.setXYZ(e, n.x, n.y, n.z));
    let l = 0.5 + 0.5 * Math.sin(n.x * 7 + n.z * 5) * Math.cos(n.y * 9);
    s.copy(i).lerp(a, l * 0.45);
    let u = Math.sin(e * 12.9898) * 43758.5453;
    (u - Math.floor(u) > 0.93 && s.lerp(o, 0.6),
      (r[e * 3] = s.r),
      (r[e * 3 + 1] = s.g),
      (r[e * 3 + 2] = s.b));
  }
  return (e.setAttribute(`color`, new Oe(r, 3)), e.computeVertexNormals(), e);
}
function Nl(e) {
  let t = new y(),
    n = new S(e, new C({ vertexColors: !0, roughness: 0.85, metalness: 0 }));
  ((n.castShadow = !0), t.add(n));
  let r = e.attributes.position,
    i = e.attributes.normal,
    a = new C({ color: 11042892, roughness: 1 }),
    o = new D(0.035, 8, 6),
    s = new C({ color: 15327928, roughness: 0.8 }),
    c = new ue(0.018, 0.07, 6),
    l = new T(),
    u = new T(),
    d = new T(0, 1, 0);
  return (
    [0.11, 0.27, 0.36, 0.52, 0.64, 0.78, 0.9].forEach((e, t) => {
      let f = Math.floor(e * r.count);
      if ((l.fromBufferAttribute(r, f), l.y < -0.2)) return;
      u.fromBufferAttribute(i, f);
      let p = new S(o, a);
      if (
        (p.position.copy(l).addScaledVector(u, -0.012),
        p.quaternion.setFromUnitVectors(d, u),
        p.scale.set(1, 0.3, 1),
        n.add(p),
        t === 1 || t === 4)
      ) {
        let e = new S(c, s);
        (e.position.copy(l).addScaledVector(u, 0.03),
          e.quaternion.setFromUnitVectors(d, u),
          n.add(e));
      }
    }),
    { root: t, body: n }
  );
}
function Pl() {
  let e = new w(0.62, 0.22, 0.32),
    t = e.attributes.position;
  for (let e = 0; e < t.count; e++)
    t.getY(e) > 0 && t.setXYZ(e, t.getX(e) * 0.78, t.getY(e), t.getZ(e) * 0.72);
  return (e.computeVertexNormals(), e);
}
function Fl(e) {
  let t = new y(),
    n = new C({
      color: 16762170,
      emissive: 9067008,
      emissiveIntensity: 0.45,
      metalness: 1,
      roughness: 0.2,
    }),
    r = new C({
      color: 16764746,
      emissive: 9067008,
      emissiveIntensity: 0.5,
      metalness: 1,
      roughness: 0.3,
      flatShading: !0,
    }),
    i = Pl(),
    o = new a(0.2, 0),
    s = [];
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
    ].forEach(([a, c, l, u], d) => {
      let f = new S(u ? i : o, u ? n : r);
      ((f.castShadow = !0),
        u || f.scale.set(1.4, 1.1, 1.2),
        (f.visible = !1),
        t.add(f),
        s.push({
          mesh: f,
          delay: d * 0.09,
          end: new T(e + a, c, l),
          spin: new T(
            6 + Math.random() * 6,
            4 + Math.random() * 5,
            3 + Math.random() * 4,
          ),
          rest: new ze(0, (Math.random() - 0.5) * 0.5, 0),
        }));
    }),
    { root: t, pieces: s }
  );
}
function Il() {
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
  return ((n.colorSpace = i), n);
}
function Ll(e, t) {
  let n = new y(),
    r = new S(new O(e, e, 0.05, 20), t);
  ((r.rotation.x = Math.PI / 2), n.add(r));
  let i = new w(0.07, 0.08, 0.05),
    a = Math.round(e * 40);
  for (let r = 0; r < a; r++) {
    let o = (r / a) * Math.PI * 2,
      s = new S(i, t);
    (s.position.set(Math.cos(o) * (e + 0.03), Math.sin(o) * (e + 0.03), 0),
      (s.rotation.z = o),
      n.add(s));
  }
  return n;
}
function Rl(e) {
  let t = new y(),
    n = new y();
  t.add(n);
  let r = new C({ color: 4608094, metalness: 0.75, roughness: 0.35 }),
    i = new C({ color: 2303790, metalness: 0.6, roughness: 0.5 }),
    a = new C({
      color: 16762938,
      emissive: 8014336,
      emissiveIntensity: 0.35,
      metalness: 0.9,
      roughness: 0.25,
    }),
    o = (e, t, r, i, a, o, s = 0) => {
      let c = new S(new w(e, t, r), i);
      return (c.position.set(a, o, s), (c.castShadow = !0), n.add(c), c);
    };
  (o(1.25, 0.18, 0.9, i, 0, 0.09),
    o(1.05, 1, 0.75, r, 0, 0.68),
    o(1.09, 0.07, 0.79, a, 0, 0.22),
    o(1.09, 0.07, 0.79, a, 0, 1.16));
  let s = new D(0.025, 6, 4);
  for (let e of [-0.46, 0.46])
    for (let t of [0.32, 0.6, 0.88, 1.06]) {
      let r = new S(s, a);
      (r.position.set(e, t, 0.38), n.add(r));
    }
  let c = new S(
    new O(0.42, 0.16, 0.42, 20, 1, !0),
    new C({ color: 6976900, metalness: 0.8, roughness: 0.3, side: 2 }),
  );
  (c.position.set(-e * 0.12, 1.42, 0), n.add(c));
  let l = new S(new E(0.42, 0.03, 8, 28), a);
  ((l.rotation.x = Math.PI / 2), l.position.set(-e * 0.12, 1.63, 0), n.add(l));
  let u = new S(new O(0.07, 0.09, 0.55, 10), i);
  (u.position.set(e * 0.36, 1.45, -0.18), n.add(u));
  let f = o(0.5, 0.08, 0.42, a, e * 0.7, 0.42);
  f.rotation.z = e * -0.45;
  let p = new k({ color: 4063098 }),
    m = new S(new Re(0.17, 28), p);
  (m.position.set(-0.18, 0.72, 0.38), n.add(m));
  let g = new S(new E(0.18, 0.025, 8, 28), a);
  (g.position.copy(m.position), n.add(g));
  let _ = [Ll(0.16, a), Ll(0.1, i)];
  (_[0].position.set(0.22, 0.76, 0.4),
    _[1].position.set(0.37, 0.52, 0.4),
    n.add(..._));
  let v = Il(),
    b = new S(
      new d(0.9, 0.28),
      new k({ map: v, color: v ? 16777215 : 1446410 }),
    );
  (b.position.set(0, 0.36, 0.385), n.add(b));
  let x = [16726831, 16756736].map((e, t) => {
      let r = new k({ color: e }),
        i = new S(new D(0.05, 10, 8), r);
      return (i.position.set(t === 0 ? -0.45 : 0.45, 1.24, 0.3), n.add(i), r);
    }),
    ee = new h(8257434, 0, 5, 2);
  (ee.position.set(0, 0.8, 0.8), t.add(ee));
  let te = M(8257434, 1.4, 0);
  return (
    te.position.copy(m.position).setZ(0.45),
    n.add(te),
    {
      root: t,
      body: n,
      gears: _,
      window: p,
      lamps: x,
      light: ee,
      glow: te,
      hopperTop: new T(-e * 0.12, 1.7, 0),
      chimneyTop: new T(e * 0.36, 1.78, -0.18),
      chuteMouth: new T(e * 0.98, 0.3, 0),
    }
  );
}
var zl = class t extends aa {
  constructor(t) {
    (super(t),
      e(this, `root`, new y()),
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
    let a = Ml();
    ((this.potato = Nl(a)),
      (this.potato.root.visible = !1),
      (this.gold = Fl(r.x)),
      (this.goldGlow = M(16767072, 2.6, 0)),
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
      (this.machine = Rl(i)),
      this.machine.root.position.copy(this.machinePos).setY(-2),
      (this.machine.root.visible = !1),
      this.root.add(this.machine.root),
      this.alooHome.set(r.x, 0.42, 0.1),
      (this.bolt = new S(
        new O(0.035, 0.035, 1, 6, 1, !0),
        new k({
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
    return F(V(e, `rahul`), {
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
    return F(V(e, `rahul`), {
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
    return F(V(e, `rahul`), {
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
    return F(V(e, `rahul`), {
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
    return F(V(e, `rahul`), {
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
        ? I(V(a, `rahul`), this.pointPose(a), R(a / 0.35))
        : a < r.PICK
          ? I(
              this.pointPose(a),
              this.presentPose(a),
              z((a - r.ZAP - 0.3) / 0.4),
            )
          : a < r.WINDUP
            ? I(this.presentPose(a), this.catchPose(a), R((a - r.PICK) / 0.3))
            : a < r.TOSS
              ? I(
                  this.catchPose(a),
                  this.windupPose(a),
                  R((a - r.WINDUP) / 0.22),
                )
              : a < r.IN
                ? I(
                    this.windupPose(a),
                    this.throwPose(a),
                    R((a - r.TOSS) / 0.15),
                  )
                : a < r.END - 0.6
                  ? I(
                      this.throwPose(a),
                      this.presentPose(a),
                      z((a - r.IN) / 0.5),
                    )
                  : I(
                      this.presentPose(a),
                      V(a, `rahul`),
                      z((a - (r.END - 0.6)) / 0.5),
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
        this.puff(this.v1.set(s.x, 0.7, 0.1), jl, 90),
        (n.targetRig.root.visible = !0),
        this.landSuperHit(s.hp, c, 3, 6),
        this.layFlat(),
        n.audio.poof(),
        n.audio.thud(),
        n.cam.shake(0.3, 0.4),
        n.arena.cheer(1.5)),
      a >= r.BACK &&
        (this.targetPose = Hi(a, Math.max(0, 0.06 - (a - r.BACK) * 0.06))),
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
      let t = R(L((e - i.ALOO) / 0.25)),
        n =
          1 + Math.sin((e - i.ALOO) * 26) * Math.exp(-(e - i.ALOO) * 5) * 0.25;
      (a.scale.set(t * n, t / n, t),
        a.position.copy(this.alooHome),
        a.rotation.set(0, r > 0 ? -0.4 : 0.4, Math.sin(e * 18) * 0.08));
    } else if (e < i.TOSS) {
      let t = z(L((e - i.PICK) / 0.6)),
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
      let t = L((e - i.TOSS) / (i.IN - i.TOSS)),
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
          ? R((e - a.RISE) / 0.55) * 1.06 -
            Math.max(0, (e - a.RISE - 0.4) / 0.15) * 0.06
          : 1,
      u = e > a.END - 0.8 ? z((e - (a.END - 0.8)) / 0.7) : 0,
      d = e >= a.IN && e < a.OUT + 0.2,
      f = d ? L((e - a.IN) / (a.OUT - a.IN)) : 0,
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
        new Be(4063098),
        new Be(jl),
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
          color: jl,
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
              color: jl,
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
                color: jl,
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
(e(zl, `ZAP`, 0.75),
  e(zl, `ALOO`, 1.2),
  e(zl, `RISE`, 1.5),
  e(zl, `PICK`, 2.55),
  e(zl, `WINDUP`, 3.25),
  e(zl, `TOSS`, 3.55),
  e(zl, `IN`, 4.1),
  e(zl, `OUT`, 6.1),
  e(zl, `LAND`, 6.8),
  e(zl, `BACK`, 7.6),
  e(zl, `END`, 8.7));
function Bl() {
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
  return ((n.colorSpace = i), n);
}
var Vl = (e) =>
    new k({
      color: e,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
    }),
  Hl = class t extends aa {
    constructor(t) {
      (super(t),
        e(this, `root`, new y()),
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
        (this.edgeX = Math.max(-j, Math.min(j, r.x - this.f * 2.95))),
        (this.machineX = r.x - this.f * 1.15),
        (this.hole = new S(new Re(0.75, 32), new k({ color: 328707 }))),
        (this.hole.rotation.x = -Math.PI / 2),
        this.hole.position.copy(this.holePos),
        this.hole.scale.setScalar(0.001));
      let i = new x(0.72, 0.95, 32, 1),
        a = i.attributes.position;
      for (let e = 0; e < a.count; e++)
        if (Math.hypot(a.getX(e), a.getY(e)) > 0.8) {
          let t = 1 + (Math.sin(e * 7.3) * 0.5 + 0.5) * 0.18;
          a.setXY(e, a.getX(e) * t, a.getY(e) * t);
        }
      ((this.rim = new S(i, new C({ color: 2827810, roughness: 1 }))),
        (this.rim.rotation.x = -Math.PI / 2),
        this.rim.position.copy(this.holePos).setY(0.025),
        this.rim.scale.setScalar(0.001),
        this.root.add(this.hole, this.rim));
      let o = this.f;
      this.machine = new y();
      let s = new C({ color: 2067004, roughness: 0.45, metalness: 0.3 }),
        c = new C({ color: 15909424, roughness: 0.5, metalness: 0.2 }),
        l = new C({ color: 9080985, roughness: 0.3, metalness: 0.8 }),
        u = (e, t, n, r, i, a, o = 0) => {
          let s = new S(new w(e, t, n), r);
          return (
            s.position.set(i, a, o),
            (s.castShadow = !0),
            this.machine.add(s),
            s
          );
        };
      u(1, 0.14, 0.8, l, 0, 0.07);
      let d = Bl();
      (u(
        0.85,
        0.85,
        0.65,
        [
          s,
          s,
          s,
          s,
          new C({ map: d, color: d ? 16777215 : 16765466, roughness: 0.5 }),
          s,
        ],
        0,
        0.56,
      ),
        u(0.89, 0.06, 0.69, c, 0, 0.22),
        u(0.89, 0.06, 0.69, c, 0, 0.98));
      let f = new S(
        new O(0.16, 0.09, 0.3, 14, 1, !0),
        new C({ color: 6976900, metalness: 0.8, roughness: 0.3, side: 2 }),
      );
      ((f.rotation.z = Math.PI / 2),
        f.position.set(-o * 0.57, 0.78, 0),
        this.machine.add(f));
      let p = new S(new Re(0.09, 14), new k({ color: 526344 }));
      ((p.rotation.y = (-o * Math.PI) / 2),
        p.position.set(-o * 0.426, 0.78, 0),
        this.machine.add(p),
        (this.tankGlow = new k({ color: 3811848 })));
      let m = new S(new Re(0.11, 20), this.tankGlow);
      (m.position.set(o * 0.25, 0.75, 0.331), this.machine.add(m));
      for (let [e, t, n] of [
        [-0.25, 0.42, 0.1],
        [-0.1, 0.38, 0.07],
      ]) {
        let r = new S(new O(n, n, 0.04, 10), c);
        ((r.rotation.x = Math.PI / 2),
          r.position.set(o * e, t, 0.34),
          this.machine.add(r),
          this.gears.push(r));
      }
      let g = new S(new O(0.05, 0.05, 0.45, 10), l);
      (g.position.set(o * 0.6, 0.72, 0),
        (g.rotation.z = o * 0.9),
        this.machine.add(g),
        this.machine.position.set(this.machineX, -1.6, -0.15),
        (this.machine.visible = !1),
        this.root.add(this.machine),
        (this.cane = new y()));
      let _ = new C({ color: 10270778, roughness: 0.6 }),
        v = new C({ color: 6254114, roughness: 0.7 });
      for (let [e, t] of [
        [0, 0],
        [0.05, 0.04],
        [0.05, -0.04],
      ]) {
        let n = new S(new O(0.025, 0.028, 1.2, 8), _);
        (n.position.set(0, e, t), this.cane.add(n));
        for (let e = -4; e <= 4; e++) {
          let t = new S(new E(0.027, 0.006, 4, 10), v);
          ((t.rotation.x = Math.PI / 2),
            t.position.set(0, e * 0.14, 0),
            n.add(t));
        }
      }
      ((this.cane.visible = !1),
        this.root.add(this.cane),
        (this.stream = new S(new O(0.012, 0.02, 1, 6, 1, !0), Vl(16757818))),
        this.root.add(this.stream),
        (this.match = new y()));
      let b = new S(new O(0.009, 0.009, 0.14, 5), new C({ color: 15255696 })),
        ee = new S(new D(0.012, 6, 5), new C({ color: 9048080 }));
      ((ee.position.y = 0.07),
        (this.matchFlame = M(16752672, 0.3, 0)),
        (this.matchFlame.position.y = 0.1),
        this.match.add(b, ee, this.matchFlame),
        (this.match.visible = !1),
        this.root.add(this.match));
      for (let e = 0; e < 11; e++) {
        let t = new S(
          new ue(0.65, 1.4, 10, 1, !0),
          Vl(e % 3 == 0 ? 13138448 : e % 3 == 1 ? 11551240 : 9052160),
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
      ((this.fireGlow = M(16740368, 8.5, 0)),
        this.fireGlow.position.copy(this.holePos).setY(2.6),
        this.root.add(this.fireGlow),
        (this.fireLight = new h(16742944, 0, 12, 2)),
        this.fireLight.position.copy(this.holePos).setY(1.2),
        this.root.add(this.fireLight));
    }
    carryPose(e, t) {
      return F(Ni(e, t, 1, `nitin`), {
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
      return F(V(e, `nitin`), {
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
      return F(V(e, `nitin`), {
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
      return F(V(e, `nitin`), {
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
      return F(V(e, `nitin`), {
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
        u = R(L((a - r.CRACK) / 0.35)),
        d = a > r.OUT ? z(L((a - r.OUT) / 0.5)) : 0;
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
        ((this.targetPose = F(V(a, s.char.id), {
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
        let e = L((a - r.SINK) / (r.GONE - r.SINK));
        ((s.y = -2.6 * e * e),
          (this.targetPose = F(V(a, s.char.id), {
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
      if (a < r.WALK) this.casterPose = V(a, `nitin`);
      else if (a < r.POUR) {
        let e = z(L((a - r.WALK) / (r.POUR - r.WALK - 0.1)));
        ((o.x = this.startX + (this.edgeX - this.startX) * e),
          (this.casterPose = this.carryPose(a, Math.abs(o.x - this.startX))));
      } else if (a < r.FLOW)
        this.casterPose = this.feedPose(
          a,
          z(L((a - r.POUR) / (r.FLOW - r.POUR - 0.1))),
        );
      else if (a < r.MATCH)
        this.casterPose = I(
          this.feedPose(a, 1),
          this.watchPose(a),
          R((a - r.FLOW) / 0.4),
        );
      else if (a < r.FLICK)
        this.casterPose = I(
          this.watchPose(a),
          this.strikePose(a),
          R((a - r.MATCH) / 0.25),
        );
      else if (a < r.TURN)
        this.casterPose = I(
          this.strikePose(a),
          this.flickPose(a),
          R((a - r.FLICK) / 0.12),
        );
      else {
        l(r.TURN) && (o.facing = -c);
        let e = Math.max(0, a - r.FIRE) * 0.55;
        ((o.x = Math.max(-j, Math.min(j, this.edgeX - c * e))),
          (this.casterPose =
            a < r.FIRE ? V(a, `nitin`) : Ni(a, e, 1, `nitin`)));
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
          (this.targetPose = Hi(a, Math.max(0, 0.08 - (a - r.OUT) * 0.08))),
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
      let l = R(L((e - i.RISE) / 0.45)),
        u = z(L((e - i.HIDE) / 0.5)),
        d = e >= i.POUR + 0.4 && e < i.POUR_END;
      ((s.position.y =
        -1.6 + 1.6 * l - 1.7 * u + (d ? Math.sin(e * 40) * 0.01 : 0)),
        (s.position.x =
          this.machineX + (d ? (Math.random() - 0.5) * 0.015 : 0)),
        e >= i.HIDE + 0.55 && (s.visible = !1));
      for (let [e, t] of this.gears.entries())
        t.rotation.y += r * (d ? 14 : 2) * (e ? -1.5 : 1);
      let f = L((e - i.FLOW + 0.4) / 0.6) * (1 - L((e - i.POUR_END) / 0.3));
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
          u = e < i.POUR ? 0 : z(L((e - i.POUR) / (i.FLOW - i.POUR - 0.1))),
          d = L(u / 0.3),
          f = 1.2 * (1 - 0.92 * L((u - 0.3) / 0.7)),
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
        let t = L((e - r.FLICK) / (r.FIRE - r.FLICK));
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
        Ul(e, n, i.FIRE + 0.6) &&
          a.speech(`caster`, `Quality ka koi compromise nahi!`),
        e < i.FIRE)
      )
        return;
      let o =
        R(L((e - i.FIRE) / 0.35)) *
        (e > i.OUT - 0.4 ? 1 - L((e - (i.OUT - 0.4)) / 0.5) : 1);
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
(e(Hl, `CRACK`, 1.1),
  e(Hl, `SINK`, 1.9),
  e(Hl, `GONE`, 2.65),
  e(Hl, `WALK`, 2.75),
  e(Hl, `RISE`, 2.85),
  e(Hl, `POUR`, 3.55),
  e(Hl, `FLOW`, 4.2),
  e(Hl, `POUR_END`, 5.7),
  e(Hl, `HIDE`, 5.75),
  e(Hl, `MATCH`, 6.05),
  e(Hl, `FLICK`, 6.8),
  e(Hl, `TURN`, 7.05),
  e(Hl, `FIRE`, 7.2),
  e(Hl, `OUT`, 8.95),
  e(Hl, `END`, 9.45));
function Ul(e, t, n) {
  return e >= n && t < n;
}
var Wl = 16763196,
  Gl = 9427199,
  Kl = new T(0, 1, 0),
  ql = N ? 34 : 60,
  Jl = 2;
function Yl() {
  let e = document.createElement(`canvas`);
  e.width = e.height = 512;
  let t = e.getContext(`2d`),
    n = t.createRadialGradient(200, 190, 30, 256, 256, 256);
  (n.addColorStop(0, `#fff3b8`),
    n.addColorStop(0.55, `#ffc93c`),
    n.addColorStop(1, `#9a6400`),
    (t.fillStyle = n),
    t.beginPath(),
    t.arc(256, 256, 252, 0, Math.PI * 2),
    t.fill(),
    (t.strokeStyle = `rgba(110,70,0,0.9)`),
    (t.lineWidth = 10),
    t.beginPath(),
    t.arc(256, 256, 226, 0, Math.PI * 2),
    t.stroke());
  for (let e = 0; e < 60; e++) {
    let n = (e / 60) * Math.PI * 2;
    ((t.lineWidth = e % 5 == 0 ? 7 : 3),
      t.beginPath(),
      t.moveTo(256 + Math.sin(n) * 206, 256 - Math.cos(n) * 206),
      t.lineTo(256 + Math.sin(n) * 220, 256 - Math.cos(n) * 220),
      t.stroke());
  }
  ((t.fillStyle = `#6b4300`),
    (t.font = `bold 34px Impact, sans-serif`),
    (t.textAlign = `center`),
    (t.textBaseline = `middle`),
    t.fillText(`TIME IS MONEY`, 256, 330),
    (t.font = `bold 26px Impact, sans-serif`),
    t.fillText(`BROTHER`, 256, 362));
  let r = new _e(e);
  return ((r.colorSpace = i), r);
}
var Xl = class t extends aa {
  constructor(t) {
    (super(t),
      e(this, `root`, new y()),
      e(this, `clock`, new y()),
      e(this, `clockGlow`, void 0),
      e(this, `minuteHand`, void 0),
      e(this, `hourCoins`, []),
      e(this, `coins`, []),
      e(this, `headGlow`, void 0),
      e(this, `wheel`, void 0),
      e(this, `wheelGlow`, void 0),
      e(this, `flip`, void 0),
      e(this, `streak`, void 0),
      e(this, `trail`, []),
      e(this, `head`, new T()),
      e(this, `headGoal`, new T()),
      e(this, `slammed`, !1),
      e(this, `lifted`, !1),
      e(this, `flipCaught`, !1),
      e(this, `struck`, 0),
      e(this, `startX`, void 0),
      e(this, `look`, new T()),
      e(this, `pos`, new T()),
      (this.startX = t.caster.x),
      t.scene.add(this.root));
    let n = new C({
        color: Wl,
        emissive: 11565056,
        emissiveIntensity: 0.65,
        metalness: 0.3,
        roughness: 0.32,
      }),
      r = new O(0.12, 0.12, 0.026, 24);
    r.rotateX(Math.PI / 2);
    let i = (t.caster.x + t.target.x) / 2;
    this.clock.position.set(i, 3.5, -2.6);
    let a = new S(new Re(1.9, 64), new k({ map: Yl(), transparent: !0 }));
    this.clock.add(a);
    let o = new S(new E(1.92, 0.1, 12, 72), n);
    (this.clock.add(o),
      (this.minuteHand = new S(
        new w(0.08, 1.4, 0.04),
        new k({ color: 5904906 }),
      )),
      this.minuteHand.geometry.translate(0, 0.65, 0.04),
      this.clock.add(this.minuteHand));
    for (let e = 0; e < 12; e++) {
      let t = (e / 12) * Math.PI * 2,
        i = new S(r, n);
      (i.scale.setScalar(1.6),
        i.position.set(Math.sin(t) * 1.5, Math.cos(t) * 1.5, 0.06),
        this.clock.add(i),
        this.hourCoins.push(i));
    }
    ((this.clockGlow = M(16765024, 7.5, 0)),
      (this.clockGlow.position.z = -0.05),
      this.clock.add(this.clockGlow),
      this.clock.scale.setScalar(0.01),
      this.root.add(this.clock));
    for (let e = 0; e < ql; e++) {
      let t = new S(r, n);
      ((t.visible = !1),
        t.scale.setScalar(1.6 - (e / ql) * 0.9),
        this.root.add(t),
        this.coins.push(t));
    }
    ((this.headGlow = M(16769162, 1.6, 0)), this.root.add(this.headGlow));
    let s = new O(0.95, 0.95, 0.16, 48);
    (s.rotateX(Math.PI / 2),
      (this.wheel = new S(s, n)),
      (this.wheel.visible = !1),
      this.root.add(this.wheel),
      (this.wheelGlow = M(16765024, 3.4, 0)),
      this.root.add(this.wheelGlow),
      (this.flip = new S(r, n)),
      (this.flip.visible = !1),
      this.root.add(this.flip),
      (this.streak = M(16769162, 1, 0)),
      this.root.add(this.streak));
  }
  dashAt(e) {
    let n = t.DASHES;
    for (let t = n.length - 1; t >= 0; t--) if (e >= n[t].at) return n[t];
    return null;
  }
  step(e) {
    let n = this.d,
      { PEEL: r, FREEZE: i, SLAM: a, LIFT: o, END: s } = t,
      c = this.t;
    this.advance(e, s);
    let l = this.t,
      u = n.caster,
      d = n.target,
      f = (e) => l >= e && c < e;
    (n.clipTime() === null &&
      f(0.1) &&
      n.speech(`caster`, `Money follows, brother!`),
      f(a + 0.9) &&
        n.speech(`caster`, `Main nahi bhaagta, yeh mere peeche aata hai!`),
      this.stepClock(l, c, e));
    let p = L((l - i) / 0.25) * (1 - L((l - a) / 0.3));
    (n.arena.setMood(p * 0.75),
      f(i) &&
        (n.audio.eyeZing(),
        n.audio.reverseBeeps(5),
        n.flash(`rgba(140,200,255,0.55)`, 260),
        n.fx.shockwave(this.v1.copy(this.clock.position), Gl, 0.8, 4, !0),
        n.fx.shockwave(this.v1.set(d.x, 0.06, 0), Gl, 0.6, 2.4),
        n.popup(`TIME FREEZE!`, this.v2.set(d.x, 2.5, 0.3), `#8fd8ff`),
        n.cam.shake(0.15, 0.3)),
      p > 0.5 &&
        Math.random() < (N ? 0.3 : 0.6) &&
        (this.v1.set(
          d.x + (Math.random() - 0.5) * 3,
          Math.random() * 2.4,
          (Math.random() - 0.5) * 1.5,
        ),
        n.fx.particles.emit(this.v1, {
          count: 1,
          speed: 0.4,
          color: Gl,
          life: 1.1,
          size: 0.07,
          gravity: -1.2,
          drag: 1,
        })),
      this.slammed
        ? l < o
          ? (this.targetPose = this.squashedPose(l))
          : ((this.targetPose = null), d.update(Ti(), u.x))
        : ((this.targetPose = Gi(l >= i ? i : l, d.char.id)),
          this.settleTarget(e),
          f(i + 0.25) &&
            n.speech(`target`, `Arre! Main hil kyun nahi pa raha?!`)),
      this.slammed &&
        !this.lifted &&
        l >= o &&
        ((this.lifted = !0),
        this.landSuperHit(d.hp, u.facing, 3.4, 6),
        n.audio.thud(),
        n.audio.kaching(1),
        n.cam.shake(0.2, 0.3)),
      this.stepSquash(l),
      this.stepCaster(l, c),
      this.stepDragon(l, c),
      this.stepWheel(l, c),
      this.stepFlip(l),
      this.stepCamera(l),
      f(r) && n.audio.snap(),
      l >= s && (n.arena.setMood(0), (u.y = 0), (this.done = !0)));
  }
  stepClock(e, n, r) {
    let i = this.d,
      { PEEL: a, FREEZE: o, WHEEL: s } = t,
      c = R(L((e - 0.05) / 0.8)) * (1 - z(L((e - s) / 0.5)));
    if (
      (this.clock.scale.setScalar(Math.max(0.01, c)),
      (this.clock.visible = c > 0.02),
      (this.clockGlow.material.opacity = 0.55 * c),
      e < o)
    ) {
      let t = Math.floor(e * 4);
      ((this.minuteHand.rotation.z = -t * 0.12),
        t !== Math.floor(n * 4) && e < a && i.audio.snap());
    } else this.minuteHand.rotation.z += r * 12;
    this.hourCoins.forEach((t, r) => {
      let o = a + r * 0.05;
      ((t.visible = e < o),
        e >= o &&
          n < o &&
          (i.audio.kaching(0.25 + r * 0.03),
          t.getWorldPosition(this.v1),
          i.fx.particles.emit(this.v1, {
            count: 6,
            speed: 1.4,
            color: Wl,
            life: 0.5,
            size: 0.07,
            drag: 2,
          })));
    });
  }
  stepCaster(e, n) {
    let r = this.d,
      i = r.caster,
      a = r.target,
      { FREEZE: o, SLAM: s } = t,
      c = this.streak.material;
    if (
      ((c.opacity = Math.max(0, c.opacity - 0.08)),
      (this.casterPose = V(e, `ravi`)),
      e >= s + 0.4)
    ) {
      ((i.x += (this.startX - i.x) * 0.12),
        (i.facing = a.x >= i.x ? 1 : -1),
        (this.casterClip = {
          name: `dance`,
          time: e - s + 0.6,
          loop: !0,
          fade: 0.25,
        }));
      return;
    }
    let l = e >= o ? this.dashAt(e) : null;
    if (!l) {
      this.casterClip = { name: `stance`, time: e, loop: !0, fade: 0.2 };
      return;
    }
    if (e >= l.at && n < l.at) {
      let e = a.x + l.side * 0.8;
      (r.audio.whoosh(),
        this.streak.position.set((i.x + e) / 2, 1.1, 0.1),
        this.streak.scale.set(Math.max(0.6, Math.abs(e - i.x) + 0.6), 0.5, 1),
        (c.opacity = 0.95),
        r.fx.particles.emit(this.v1.set(i.x, 1, 0), {
          count: 20,
          speed: 2.5,
          color: Wl,
          life: 0.5,
          size: 0.1,
          drag: 2,
        }),
        (i.x = e),
        (i.facing = l.side > 0 ? -1 : 1));
    }
    let u = L((e - l.at) / ((l.hit - l.at) * 2.2));
    ((this.casterClip = {
      name: l.clip,
      time: l.from + (l.to - l.from) * u,
      fade: 0.06,
    }),
      e >= l.hit &&
        n < l.hit &&
        (this.struck++,
        this.v1.set(a.x - i.facing * 0.2, 1.25, 0.2),
        r.fx.hitSpark(this.v1, 1.3, !1, i.facing),
        r.fx.shockwave(this.v1, Wl, 0.4, 1.6, !0),
        r.fx.particles.emit(this.v1, {
          count: N ? 20 : 40,
          speed: 5,
          color: Wl,
          life: 0.7,
          size: 0.1,
          gravity: 7,
          drag: 1,
        }),
        r.audio.hit(1.3),
        r.audio.kaching(0.7),
        r.cam.shake(0.2, 0.2),
        r.popup(
          l.word,
          this.v2.set(a.x, 2.1 + this.struck * 0.25, 0.3),
          l.color,
        )));
  }
  stepDragon(e, n) {
    let r = this.d,
      i = r.caster,
      a = r.target,
      { PEEL: o, DRAGON_UP: s, FREEZE: c, WHEEL: l } = t,
      u = this.headGlow.material;
    if (e < o || e >= l + 0.3) {
      (this.coins.forEach((e) => (e.visible = !1)), (u.opacity = 0));
      return;
    }
    let d = e >= c ? this.dashAt(e) : null;
    if (e < s) {
      let t = z(L((e - o) / (s - o)));
      this.headGoal.lerpVectors(
        this.clock.position,
        this.v1.set(i.x - i.facing * 0.6, 1.6, 0.6),
        t,
      );
    } else if (e >= l - 0.25) this.headGoal.set(a.x, 3.2, 0);
    else if (d && e < d.hit + 0.15) {
      let t = L((e - d.at) / (d.hit - d.at));
      this.headGoal.set(
        a.x - d.side * 0.2 * (1 - t),
        1.25 + 0.8 * (1 - t),
        0.4,
      );
    } else
      this.headGoal.set(
        i.x + Math.sin(e * 3.1) * 1.1,
        1.5 + Math.sin(e * 4.7) * 0.5,
        0.5 + Math.cos(e * 3.1) * 0.8,
      );
    (this.trail.length === 0 && this.head.copy(this.clock.position),
      this.head.lerp(this.headGoal, e < s ? 0.25 : 0.18),
      this.trail.unshift(this.head.clone()),
      this.trail.length > ql * Jl + 2 && this.trail.pop());
    let f = Math.round(12 + (ql - 12) * R(L((e - s + 0.3) / 1.2))),
      p = 1 - L((e - l) / 0.3);
    (this.coins.forEach((t, n) => {
      let r = this.trail[Math.min(this.trail.length - 1, n * Jl)];
      ((t.visible = n < f && p > 0),
        t.visible &&
          (t.position.copy(r),
          (t.position.y += Math.sin(e * 9 - n * 0.4) * 0.05),
          t.rotation.set(0, e * 7 + n * 0.5, 0),
          e >= l - 0.25 &&
            t.position.lerp(this.headGoal, L((e - l + 0.25) / 0.5))));
    }),
      this.headGlow.position.copy(this.head),
      (u.opacity = 0.75 * p),
      e < c && Math.random() < 0.35 && this.d.audio.kaching(0.08),
      e >= s && n < s && r.audio.coins(12));
  }
  stepWheel(e, n) {
    let r = this.d,
      { WHEEL: i, SLAM: a, LIFT: o } = t,
      s = r.target,
      c = this.wheelGlow.material;
    if (e < i) {
      ((this.wheel.visible = !1), (c.opacity = 0));
      return;
    }
    ((this.wheel.visible = !0), r.targetRig.headWorld(this.v3));
    let l = this.v3.y + 0.2 * this.squash(e) + 0.08;
    if (e < a - 0.3) {
      let t = R(L((e - i) / 0.45));
      (this.wheel.scale.setScalar(Math.max(0.05, t)),
        this.wheel.position.set(s.x, 3.2, 0),
        this.wheel.rotation.set(
          z(L((e - i) / 0.45)) * (Math.PI / 2),
          0,
          e * 10,
        ),
        (c.opacity = 0.6 * t),
        e >= i &&
          n < i &&
          (r.audio.coins(16), r.flash(`rgba(255,240,170,0.4)`, 90)));
    } else if (e < a) {
      let t = L((e - a + 0.3) / 0.3);
      (this.wheel.scale.setScalar(1),
        this.wheel.position.set(s.x, 3.2 + (l - 3.2) * t * t, 0),
        this.wheel.rotation.set(Math.PI / 2, 0, e * 10),
        (c.opacity = 0.6));
    } else if (e < o) {
      this.slammed || this.slam();
      let t = e - a;
      (this.wheel.position.set(s.x, l, 0),
        this.wheel.rotation.set(
          Math.PI / 2 + Math.sin(t * 40) * 0.05 * Math.exp(-t * 5),
          0,
          this.wheel.rotation.z,
        ),
        (c.opacity = 0.6));
    } else {
      let t = L((e - o) / 0.5);
      ((this.wheel.position.y = l + 1.4 * R(t)),
        (this.wheel.position.z = -0.4 * t),
        this.wheel.rotation.set(Math.PI / 2 + t * 1.2, 0, e * 14),
        this.wheel.scale.setScalar(Math.max(0.01, 1 - t)),
        (c.opacity = 0.6 * (1 - t)));
    }
    this.wheelGlow.position.copy(this.wheel.position);
  }
  squash(e) {
    let { SLAM: n, LIFT: r } = t;
    if (!this.slammed || e < n) return 1;
    if (e < r) return 1 - 0.58 * R(L((e - n) / 0.12));
    let i = e - r;
    return i > 0.6 ? 1 : 1 + Math.sin(i * 22) * 0.35 * Math.exp(-i * 7);
  }
  stepSquash(e) {
    if (!this.slammed) return;
    let t = this.squash(e),
      n = 1 + (1 - t) * 0.6;
    this.d.targetRig.root.scale.set(n, t, n);
  }
  squashedPose(e) {
    return F(Gi(e, this.d.target.char.id), {
      rootY: -0.3,
      ...B(-0.3, 0.3, -0.3),
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
  slam() {
    let e = this.d,
      t = e.target;
    ((this.slammed = !0),
      e.audio.superRelease(`tariff`),
      e.audio.boom(),
      e.audio.coins(18),
      e.audio.metalCrunch(),
      e.flash(`rgba(255,255,255,0.9)`, 220),
      e.cam.shake(0.5, 0.7),
      this.v1.set(t.x, 0.06, 0),
      e.fx.shockwave(this.v1, Wl, 0.7, 2.8),
      e.fx.shockwave(this.v2.set(t.x, 1, 0), Gl, 0.6, 3.2, !0),
      e.fx.dust(this.v1, 2.6),
      e.fx.particles.emit(this.v1.set(t.x, 0.6, 0), {
        count: N ? 60 : 120,
        speed: 7,
        color: Wl,
        life: 1.2,
        size: 0.12,
        gravity: 9,
        drag: 0.8,
        dir: Kl,
        spread: 1.2,
      }),
      e.popup(`TIME IS MONEY!`, this.v2.set(t.x, 2.6, 0.3), `#ffd23f`),
      e.arena.cheer(1.5));
  }
  stepFlip(e) {
    let n = this.d,
      { SLAM: r, END: i } = t,
      a = r + 0.55;
    if (e < a || e > i) {
      this.flip.visible = !1;
      return;
    }
    let o = L((e - a) / 0.6);
    (n.casterRig.handWorld(`r`, this.v3),
      (this.flip.visible = !0),
      this.flip.position.set(
        this.v3.x,
        this.v3.y + Math.sin(o * Math.PI) * 0.75,
        this.v3.z,
      ),
      this.flip.rotation.set(o * Math.PI * 8, 0, 0),
      o >= 1 &&
        !this.flipCaught &&
        ((this.flipCaught = !0), n.audio.kaching(0.7)));
  }
  stepCamera(e) {
    let n = this.d,
      { DRAGON_UP: r, FREEZE: i, SLAM: a } = t,
      o = n.caster,
      s = n.target,
      c = (o.x + s.x) / 2,
      { look: l, pos: u } = this;
    if (e < r)
      (l.set(this.clock.position.x, 2.4, -1.2),
        u.set(c, 1.3, 6.4),
        n.cam.set(u, l, 2.5, 50));
    else if (e < i)
      (l.set(o.x, 1.4, 0),
        u.set(o.x + o.facing * 1.2, 1.5, 4.8),
        n.cam.set(u, l, 3, 46));
    else if (e < a) {
      let t = Math.sin(e * 0.9) * 1.4;
      (l.set(s.x, 1.5, 0), u.set(s.x + t, 1.6, 5), n.cam.set(u, l, 3.5, 48));
    } else (l.set(c, 1.3, -0.4), u.set(c, 1.8, 7), n.cam.set(u, l, 2.5, 46));
  }
  dispose() {
    let e = this.d;
    (e.arena.setMood(0),
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
(e(Xl, `PEEL`, 1.22),
  e(Xl, `DRAGON_UP`, 1.9),
  e(Xl, `FREEZE`, 3.42),
  e(Xl, `WHEEL`, 5.6),
  e(Xl, `SLAM`, 6.5),
  e(Xl, `LIFT`, 7.3),
  e(Xl, `END`, 8.3),
  e(Xl, `DASHES`, [
    {
      at: 3.75,
      hit: 4,
      clip: `cross`,
      from: 0.1,
      to: 0.8,
      side: -1,
      word: `NAAM!`,
      color: `#ffd23f`,
    },
    {
      at: 4.35,
      hit: 4.65,
      clip: `highkick`,
      from: 0.25,
      to: 1.3,
      side: 1,
      word: `YA!`,
      color: `#ffffff`,
    },
    {
      at: 4.95,
      hit: 5.3,
      clip: `hurricane`,
      from: 0.46,
      to: 1.8,
      side: -1,
      word: `DAAM!`,
      color: `#ffd23f`,
    },
  ]));
var Zl = 16763196,
  Ql = 16747050,
  $l = new T(0, 1, 0),
  eu = 3.9,
  tu = N ? 14 : 32,
  nu = N ? 10 : 22;
function ru(e, t, n, r = !1) {
  let a = document.createElement(`canvas`);
  ((a.width = e), (a.height = t), n(a.getContext(`2d`)));
  let o = new _e(a);
  return ((o.colorSpace = i), r && ((o.repeat.x = -1), (o.offset.x = 1)), o);
}
function iu() {
  return ru(512, 200, (e) => {
    ((e.fillStyle = `#ffd21f`),
      e.fillRect(0, 0, 512, 200),
      (e.strokeStyle = `#111`),
      (e.lineWidth = 10),
      e.strokeRect(5, 5, 502, 190),
      (e.fillStyle = `#111`),
      (e.textAlign = `center`),
      (e.textBaseline = `middle`),
      (e.font = `bold 64px "Noto Sans Devanagari", "Kohinoor Devanagari", sans-serif`),
      e.fillText(`संसद जंक्शन`, 256, 68),
      (e.font = `bold 60px Impact, sans-serif`),
      e.fillText(`SANSAD JN.`, 256, 148));
  });
}
function au(e) {
  return ru(
    512,
    96,
    (e) => {
      ((e.fillStyle = `#5a0d0d`),
        e.fillRect(0, 0, 512, 96),
        (e.fillStyle = `#ffd23f`),
        (e.font = `bold 70px Impact, sans-serif`),
        (e.textAlign = `center`),
        (e.textBaseline = `middle`),
        e.fillText(`RAIL RAJA`, 256, 52));
    },
    e,
  );
}
function ou() {
  return ru(512, 160, (e) => {
    ((e.fillStyle = `#f1e3c0`),
      e.fillRect(0, 0, 512, 160),
      (e.fillStyle = `#b3121b`),
      e.fillRect(0, 0, 512, 30),
      e.fillRect(0, 128, 512, 32),
      (e.fillStyle = `#ffd23f`),
      e.fillRect(0, 30, 512, 5),
      e.fillRect(0, 123, 512, 5));
    for (let t = 0; t < 8; t++) {
      let n = 20 + t * 60,
        r = e.createLinearGradient(0, 46, 0, 104);
      (r.addColorStop(0, `#fff6c8`),
        r.addColorStop(1, `#ffb347`),
        (e.fillStyle = r),
        e.fillRect(n, 46, 40, 56),
        (e.fillStyle = `rgba(60,30,10,0.55)`),
        e.fillRect(n + 6, 74, 12, 28),
        e.fillRect(n + 22, 70, 12, 32));
    }
    ((e.fillStyle = `#fff`),
      (e.font = `bold 22px Impact, sans-serif`),
      (e.textAlign = `center`),
      (e.textBaseline = `middle`),
      e.fillText(`SANSAD EXPRESS  •  संसद एक्सप्रेस`, 256, 144));
  });
}
function su() {
  return ru(256, 256, (e) => {
    let t = e.createRadialGradient(128, 128, 0, 128, 128, 128);
    (t.addColorStop(0, `rgba(255,250,220,1)`),
      t.addColorStop(0.18, `rgba(255,190,80,1)`),
      t.addColorStop(0.55, `rgba(200,60,10,0.95)`),
      t.addColorStop(1, `rgba(60,8,0,0.95)`),
      (e.fillStyle = t),
      e.fillRect(0, 0, 256, 256));
    for (let t = 0; t < 6; t++)
      for (let n = 0; n < 50; n++) {
        let r = n / 50,
          i = (Math.PI / 3) * t + r * 4.4,
          a = 10 + r * 118;
        ((e.fillStyle = `rgba(255,${Math.round(220 - r * 120)},${Math.round(120 - r * 100)},${0.5 * (1 - r)})`),
          e.beginPath(),
          e.arc(
            128 + Math.cos(i) * a,
            128 + Math.sin(i) * a,
            4 + r * 10,
            0,
            Math.PI * 2,
          ),
          e.fill());
      }
  });
}
function cu(e) {
  let t = new y(),
    n = new C({
      color: 2500134,
      emissive: 1181702,
      emissiveIntensity: 1,
      metalness: 0.55,
      roughness: 0.35,
    }),
    r = new C({
      color: 9049108,
      emissive: 2753540,
      emissiveIntensity: 1,
      metalness: 0.2,
      roughness: 0.45,
    }),
    i = new C({
      color: 13840175,
      emissive: 3802630,
      emissiveIntensity: 1,
      metalness: 0.2,
      roughness: 0.45,
    }),
    a = new C({
      color: Zl,
      emissive: 9067008,
      emissiveIntensity: 0.6,
      metalness: 0.45,
      roughness: 0.3,
    }),
    o = new C({
      color: 13840175,
      emissive: 16726528,
      emissiveIntensity: 0,
      metalness: 0.3,
      roughness: 0.4,
    }),
    s = (e, n, r, i, a = 0) => {
      let o = new S(e, n);
      return (o.position.set(r, i, a), (o.castShadow = !0), t.add(o), o);
    };
  s(new w(3.6, 0.3, 1.1), n, 0, 0.62);
  let c = s(new O(0.55, 0.55, 2.3, 32), n, 0.45, 1.25);
  c.rotation.z = Math.PI / 2;
  for (let e of [-0.4, 0.45, 1.3]) {
    let t = s(new O(0.57, 0.57, 0.07, 32), a, e, 1.25);
    t.rotation.z = Math.PI / 2;
  }
  let l = s(new O(0.58, 0.58, 0.32, 32), n, 1.62, 1.25);
  l.rotation.z = Math.PI / 2;
  let u = s(new O(0.45, 0.45, 0.06, 32), a, 1.8, 1.25);
  u.rotation.z = Math.PI / 2;
  let f = s(new O(0.18, 0.14, 0.62, 18), n, 1.35, 2.05);
  (s(new O(0.24, 0.18, 0.1, 18), a, 1.35, 2.38),
    s(new O(0.2, 0.2, 0.32, 18), a, 0.5, 1.92),
    s(new w(1.1, 1.25, 1.15), r, -1.2, 1.5),
    s(new w(1.3, 0.1, 1.3), n, -1.2, 2.17));
  let p = new k({ color: 16767370, side: 2 });
  for (let e of [-0.58, 0.58]) s(new d(0.42, 0.36), p, -1.15, 1.7, e);
  s(new w(0.16, 0.32, 1.25), i, 1.82, 0.7);
  let m = s(new ue(0.6, 0.5, 4), o, 2, 0.42);
  (m.rotation.set(0, Math.PI / 4, -Math.PI / 2), m.scale.set(1, 1, 1.6));
  let h = new S(new d(1.2, 0.22), new k({ map: au(e), side: 2 }));
  (h.position.set(0.45, 1.25, 0.58), t.add(h));
  let g = [],
    _ = new O(0.42, 0.42, 0.1, 24);
  for (let e of [-0.9, 0.1, 1.05])
    for (let t of [-0.55, 0.55]) {
      let n = s(_, i, e, 0.42, t);
      ((n.rotation.x = Math.PI / 2), g.push(n));
      let r = s(new O(0.12, 0.12, 0.12, 12), a, e, 0.42, t * 1.02);
      r.rotation.x = Math.PI / 2;
    }
  let v = [-0.62, 0.62].map((e) => s(new w(2.1, 0.06, 0.04), a, 0.07, 0.42, e)),
    b = M(16773296, 2.2, 0.95);
  (b.position.set(1.95, 1.25, 0), t.add(b));
  let x = new S(
    new ue(1.3, 7, 32, 1, !0),
    new k({
      color: 16773824,
      transparent: !0,
      opacity: 0.16,
      blending: 2,
      depthWrite: !1,
      side: 2,
    }),
  );
  ((x.rotation.z = Math.PI / 2), x.position.set(5.45, 1, 0), t.add(x));
  let ee = M(16738842, 1.8, 0.8);
  return (
    ee.position.set(-0.9, 0.75, 0.5),
    t.add(ee),
    {
      root: t,
      wheels: g,
      rods: v,
      chimney: f,
      beam: x,
      glare: b,
      firebox: ee,
      catcher: o,
    }
  );
}
function lu() {
  let e = new y(),
    t = new C({
      color: 11735579,
      emissive: 2753540,
      emissiveIntensity: 1,
      roughness: 0.5,
    }),
    n = new C({ color: 4868682, metalness: 0.4, roughness: 0.5 }),
    r = new S(new w(3.7, 1.25, 1.12), t);
  ((r.position.y = 1.3), e.add(r));
  let i = new S(new O(0.6, 0.6, 3.75, 20), n);
  ((i.rotation.z = Math.PI / 2),
    (i.scale.x = 0.35),
    (i.position.y = 1.9),
    e.add(i));
  let a = new k({ map: ou(), side: 2 });
  for (let t of [-0.57, 0.57]) {
    let n = new S(new d(3.6, 1.12), a);
    (n.position.set(0, 1.3, t), e.add(n));
  }
  let o = new S(new w(3.3, 0.25, 0.9), n);
  ((o.position.y = 0.55), e.add(o));
  let s = [],
    c = new O(0.3, 0.3, 0.08, 18),
    l = new C({ color: 2236962, metalness: 0.6, roughness: 0.4 });
  for (let t of [-1.4, -0.85, 0.85, 1.4])
    for (let n of [-0.5, 0.5]) {
      let r = new S(c, l);
      ((r.rotation.x = Math.PI / 2),
        r.position.set(t, 0.3, n),
        e.add(r),
        s.push(r));
    }
  return { root: e, wheels: s };
}
var uu = class t extends aa {
  constructor(t) {
    (super(t),
      e(this, `root`, new y()),
      e(this, `board`, void 0),
      e(this, `rails`, new y()),
      e(this, `railMat`, void 0),
      e(this, `sleepers`, []),
      e(this, `portal`, new y()),
      e(this, `portalRings`, []),
      e(this, `portalDisc`, void 0),
      e(this, `portalGlow`, void 0),
      e(this, `signal`, new y()),
      e(this, `redLamp`, void 0),
      e(this, `greenLamp`, void 0),
      e(this, `engine`, void 0),
      e(this, `coaches`, []),
      e(this, `sky`, void 0),
      e(this, `stars`, void 0),
      e(this, `flag`, new y()),
      e(this, `sip`, void 0),
      e(this, `flyers`, []),
      e(this, `streaks`, []),
      e(this, `dir`, void 0),
      e(this, `portalX`, void 0),
      e(this, `hitX`, void 0),
      e(this, `engineX`, void 0),
      e(this, `engineSpeed`, 0),
      e(this, `wheelAng`, 0),
      e(this, `chuff`, 0),
      e(this, `hit`, !1),
      e(this, `hornOn`, !1),
      e(this, `landX`, void 0),
      e(this, `look`, new T()),
      e(this, `pos`, new T()),
      t.scene.add(this.root));
    let n = t.caster.facing,
      r = n < 0;
    ((this.dir = n),
      (this.portalX = t.caster.x - n * 3.4),
      (this.hitX = t.target.x - n * 0.45),
      (this.landX = t.target.x - n * 1.3),
      (this.engineX = this.portalX),
      (this.sky = new S(
        new D(120, 32, 16),
        new k({
          color: 395804,
          transparent: !0,
          opacity: 0,
          side: 1,
          depthWrite: !1,
          fog: !1,
        }),
      )),
      this.root.add(this.sky));
    let i = [];
    for (let e = 0; e < 400; e++) {
      let e = Math.random() * Math.PI * 2,
        t = 0.08 + Math.random() * 1.3;
      i.push(
        Math.cos(e) * Math.cos(t) * 110,
        Math.sin(t) * 110,
        Math.sin(e) * Math.cos(t) * 110,
      );
    }
    ((this.stars = new Ae(
      new Ce().setAttribute(`position`, new l(i, 3)),
      new m({
        color: 16777215,
        size: 0.7,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
        fog: !1,
      }),
    )),
      this.root.add(this.stars),
      (this.board = new y()));
    let a = new S(new d(1.8, 0.7), new k({ map: iu() }));
    ((a.position.y = 2.5), this.board.add(a));
    let o = new C({ color: 3355443, roughness: 0.6 });
    for (let e of [-0.75, 0.75]) {
      let t = new S(new O(0.04, 0.04, 2.5, 8), o);
      (t.position.set(e, 1.25, -0.02), this.board.add(t));
    }
    let s = M(16773296, 2.4, 0.35);
    (s.position.set(0, 2.5, 0.05),
      this.board.add(s),
      this.board.position.set(t.caster.x - n * 0.6, -3, -2.2),
      this.root.add(this.board));
    let c = new S(new O(0.05, 0.06, 2.8, 8), o);
    c.position.y = 1.4;
    let u = new S(new w(0.32, 0.7, 0.2), new C({ color: 1118481 }));
    ((u.position.y = 2.75),
      this.signal.add(c, u),
      (this.redLamp = M(16722474, 0.9, 0)),
      this.redLamp.position.set(0, 2.92, 0.12),
      (this.greenLamp = M(2817898, 0.9, 0)),
      this.greenLamp.position.set(0, 2.58, 0.12),
      this.signal.add(this.redLamp, this.greenLamp),
      this.signal.position.set(this.portalX + n * 1.9, -3.2, -1.2),
      this.root.add(this.signal),
      (this.railMat = new C({
        color: 14211288,
        emissive: Zl,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.3,
      })));
    for (let e of [-0.55, 0.55]) {
      let t = new S(new w(22, 0.06, 0.07), this.railMat);
      (t.position.set((n * 22) / 2, 0.05, e), this.rails.add(t));
    }
    let f = new C({ color: 5913122, roughness: 0.9 });
    for (let e = 0; e < 40; e++) {
      let t = new S(new w(0.2, 0.04, 1.45), f);
      (t.position.set(e * 0.55 * n, 0.02, 0),
        (t.visible = !1),
        this.rails.add(t),
        this.sleepers.push(t));
    }
    (this.rails.position.set(this.portalX, 0, 0),
      (this.rails.scale.x = 0.001),
      this.root.add(this.rails));
    for (let [e, t, n] of [
      [1.6, 0.16, Ql],
      [1.85, 0.07, Zl],
      [1.35, 0.05, 16773312],
    ]) {
      let r = new S(new E(e, t, 12, 64), new k({ color: n }));
      (this.portal.add(r), this.portalRings.push(r));
    }
    ((this.portalDisc = new S(
      new Re(1.55, 48),
      new k({ map: su(), transparent: !0, opacity: 0.95 }),
    )),
      this.portal.add(this.portalDisc),
      (this.portalGlow = M(Ql, 7, 0)),
      this.portal.add(this.portalGlow),
      this.portal.position.set(this.portalX, 1.5, 0),
      (this.portal.rotation.y = n * 1.15),
      this.portal.scale.setScalar(0.01),
      this.root.add(this.portal),
      (this.engine = cu(r)),
      (this.engine.root.scale.x = n),
      (this.engine.root.visible = !1),
      this.root.add(this.engine.root));
    for (let e = 0; e < 2; e++) {
      let e = lu();
      ((e.root.visible = !1), this.root.add(e.root), this.coaches.push(e));
    }
    let p = new S(new O(0.015, 0.015, 0.7, 6), new C({ color: 9132587 }));
    p.position.y = 0.35;
    let h = new S(new d(0.42, 0.28), new k({ color: 1622874, side: 2 }));
    h.position.set(0.21, 0.56, 0);
    let g = M(2817898, 0.7, 0.5);
    (g.position.set(0.21, 0.56, 0),
      this.flag.add(p, h, g),
      (this.flag.visible = !1),
      this.root.add(this.flag));
    let _ = new C({
        color: 13658684,
        emissive: 5905928,
        emissiveIntensity: 0.5,
        roughness: 0.8,
      }),
      v = new O(0.07, 0.05, 0.11, 14);
    ((this.sip = new S(v, _)),
      (this.sip.visible = !1),
      this.root.add(this.sip));
    let b = new d(0.16, 0.09),
      x = [16748472, 16773800, 16777215, 11069183].map(
        (e) => new k({ color: e, side: 2 }),
      );
    for (let e = 0; e < tu + 18; e++) {
      let t = e < tu,
        n = new S(t ? b : v, t ? x[e % x.length] : _);
      ((n.visible = !1),
        this.root.add(n),
        this.flyers.push({
          m: n,
          vel: new T(),
          spin: (Math.random() - 0.5) * 18,
          paper: t,
        }));
    }
    let ee = new k({
      color: 16774876,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
    });
    for (let e = 0; e < nu; e++) {
      let e = new S(new w(1.6, 0.025, 0.025), ee.clone());
      ((e.visible = !1),
        this.root.add(e),
        this.streaks.push({ m: e, life: 0 }));
    }
  }
  flagPose(e) {
    let t = Math.sin(e * 9) * 0.25;
    return F(V(e, `lalu`), {
      spineF: -0.08,
      headF: -0.2,
      headT: 0.3,
      rShF: 2.6 + t,
      rShO: 0.25,
      rEl: 0.25,
      rHand: 0,
      lShF: 0.2,
      lShO: 0.35,
      lEl: 1.1,
    });
  }
  ridePose(e) {
    let t = Math.sin(e * 11) * 0.3;
    return F(V(e, `lalu`), {
      rootY: -0.14,
      spineF: 0.2,
      headF: -0.15,
      rShF: 2.7 + t,
      rShO: 0.2,
      rEl: 0.2,
      rHand: 0,
      lShF: 0.9,
      lShO: 0.9,
      lEl: 0.3,
      lHand: 1,
    });
  }
  sipPose(e) {
    return F(V(e, `lalu`), {
      headF: 0.1,
      rShF: 1.2,
      rShO: -0.25,
      rEl: 2.1,
      rHand: 0,
      lShF: 0.2,
      lShO: 0.3,
      lEl: 0.4,
    });
  }
  step(e) {
    let n = this.d,
      { RAILS: r, PORTAL: i, SIGNAL: a, OUT: o, IMPACT: s, END: c } = t,
      l = this.t;
    this.advance(e, 0);
    let u = this.t,
      d = n.caster,
      f = n.target,
      p = this.dir,
      m = (e) => u >= e && l < e;
    (m(0.15) &&
      (n.speech(`caster`, `Yatrigan kripya dhyan dein!`), n.audio.newsSting()),
      m(s + 1.1) && n.speech(`caster`, `Chai garam, gaadi time pe!`));
    let h = R(L(u / 0.6)) * (1 - z(L((u - c + 0.9) / 0.8)));
    (n.arena.setMood(h * 0.72),
      (this.sky.material.opacity = 0.85 * h),
      (this.stars.material.opacity = h));
    let g = R(L((u - 0.1) / 0.6)) * (1 - z(L((u - c + 0.6) / 0.5)));
    ((this.board.position.y = -3 + 3 * g),
      (this.signal.position.y =
        -3.2 + 3.2 * R(L((u - 0.5) / 0.5)) * (1 - z(L((u - c + 0.6) / 0.5)))));
    let _ = u >= a,
      v = 0.85 + Math.sin(u * 30) * 0.15;
    ((this.redLamp.material.opacity = _ ? 0.15 : 0.95 * v * L((u - 0.6) / 0.3)),
      (this.greenLamp.material.opacity = _ ? 0.95 * v : 0.12),
      m(a) &&
        (n.audio.horn(0.45),
        this.greenLamp.getWorldPosition(this.v1),
        n.fx.shockwave(this.v1, 2817898, 0.4, 1.2, !0),
        n.popup(
          `GREEN SIGNAL!`,
          this.v2.set(this.portalX + p * 1.9, 3.3, 0),
          `#3dff8a`,
        )),
      (this.flag.visible = u < o + 0.9),
      this.flag.visible &&
        (n.casterRig.handWorld(`r`, this.v3),
        this.flag.position.copy(this.v3),
        this.flag.rotation.set(0, p > 0 ? 0 : Math.PI, Math.sin(u * 9) * 0.3)));
    let y = z(L((u - r) / 0.7)) * (1 - z(L((u - c + 0.5) / 0.4)));
    this.rails.scale.x = Math.max(0.001, y);
    let b = Math.floor(y * this.sleepers.length);
    (this.sleepers.forEach((e, t) => (e.visible = t < b)),
      m(r) && n.audio.metalCrunch(),
      y > 0 &&
        y < 1 &&
        Math.random() < 0.7 &&
        n.fx.particles.emit(
          this.v1.set(
            this.portalX + p * 22 * y,
            0.08,
            (Math.random() < 0.5 ? -1 : 1) * 0.55,
          ),
          {
            count: 3,
            speed: 2.5,
            color: Zl,
            life: 0.45,
            size: 0.06,
            drag: 2,
            dir: $l,
            spread: 1,
          },
        ));
    let x = u < s ? L((u - o) / (s - o)) : Math.max(0, 1 - (u - s) * 0.8);
    this.railMat.emissiveIntensity = 0.6 + 1.4 * x;
    let S = R(L((u - i) / 0.45)) * (1 - z(L((u - s - 1) / 0.5)));
    if (
      (this.portal.scale.setScalar(
        Math.max(0.01, S * (1 + Math.sin(u * 14) * 0.03)),
      ),
      (this.portalGlow.material.opacity = 0.8 * S),
      this.portalRings.forEach(
        (t, n) => (t.rotation.z += e * (n === 1 ? -3.5 : 2.5 + n)),
      ),
      (this.portalDisc.rotation.z -= e * 4),
      S > 0.05)
    )
      for (let e = 0; e < (N ? 1 : 3); e++) {
        let e = Math.random() * Math.PI * 2;
        (this.v1.set(
          this.portalX + Math.cos(e) * 0.35,
          1.5 + Math.sin(e) * 1.6,
          Math.cos(e) * 1.4,
        ),
          n.fx.particles.emit(this.v1, {
            count: 1,
            speed: 1.6,
            color: Math.random() < 0.5 ? Ql : Zl,
            life: 0.7,
            size: 0.11,
            gravity: -1.5,
            drag: 1.5,
          }));
      }
    (m(i) &&
      (n.audio.thunder(),
      n.flash(`rgba(255,140,40,0.35)`, 140),
      n.cam.shake(0.2, 0.3),
      n.fx.shockwave(this.v1.set(this.portalX, 1.5, 0), Ql, 0.6, 3.5, !0)),
      this.stepTrain(u, e, l));
    let ee = this.engineX - p * 1.2;
    if (u < o + 0.3) this.casterPose = this.flagPose(u);
    else if (u < s + 0.15) {
      let e = R(L((u - o - 0.3) / 0.3));
      ((d.x += (ee - d.x) * e),
        (d.y =
          2.22 * e + Math.sin(e * Math.PI) * 0.5 + Math.sin(u * 30) * 0.015),
        (d.facing = p),
        (this.casterPose = this.ridePose(u)));
    } else {
      let t = L((u - s - 0.15) / 0.8);
      ((d.x += (this.landX - d.x) * Math.min(1, e * 7)),
        (d.y = Math.max(
          0,
          2.22 * (1 - t * t * t) + Math.sin(t * Math.PI) * 0.9,
        )),
        (d.facing = f.x >= d.x ? 1 : -1),
        (this.casterPose = t < 1 ? this.ridePose(u) : this.sipPose(u)),
        t >= 1 &&
          l < s + 0.95 &&
          (n.fx.dust(this.v1.set(d.x, 0.05, 0), 1.5), n.audio.thud()));
    }
    ((this.sip.visible = u > s + 1),
      this.sip.visible &&
        (n.casterRig.handWorld(`r`, this.v3),
        this.sip.position.copy(this.v3),
        Math.random() < 0.3 &&
          n.fx.particles.emit(this.v1.copy(this.v3).setY(this.v3.y + 0.1), {
            count: 1,
            speed: 0.2,
            color: 16777215,
            life: 0.8,
            size: 0.08,
            gravity: -1.2,
            drag: 1,
          })),
      this.hit
        ? ((this.targetPose = null), f.update(Ti(), d.x))
        : ((this.targetPose = Gi(u, f.char.id)),
          this.settleTarget(e),
          m(o + 0.2) && n.speech(`target`, `Arre! Gaadi aa rahi hai?!`)),
      !this.hit && u >= s && this.impact(),
      this.stepFlyers(e),
      this.stepCamera(u),
      u >= c && (n.arena.setMood(0), (d.y = 0), (this.done = !0)));
  }
  stepTrain(e, n, r) {
    let i = this.d,
      { OUT: a, IMPACT: o } = t,
      s = this.dir,
      c = this.engine;
    if (!(e < a)) {
      if (
        (r < a &&
          ((c.root.visible = !0),
          i.audio.horn(1.4),
          i.audio.startEngine(),
          (this.hornOn = !0),
          i.cam.shake(0.35, 0.6),
          i.flash(`rgba(255,170,60,0.45)`, 160),
          i.fx.shockwave(this.v1.set(this.portalX, 1.5, 0), Zl, 0.6, 4, !0)),
        e < o)
      ) {
        let t = L((e - a) / (o - a));
        ((this.engineX =
          this.portalX +
          (this.hitX - s * 2 - this.portalX) * (t * t * (1.6 - 0.6 * t))),
          (this.engineSpeed = 15));
      } else
        ((this.engineX += s * this.engineSpeed * n),
          (this.engineSpeed = Math.min(26, this.engineSpeed + n * 10)));
      (c.root.position.set(this.engineX, 0, 0),
        (c.root.visible = Math.abs(this.engineX) < 16),
        (this.wheelAng += n * 18));
      for (let e of c.wheels) e.rotation.y = -this.wheelAng;
      (c.rods.forEach((e, t) =>
        e.position.set(
          0.07 + Math.cos(this.wheelAng + t * Math.PI) * 0.22,
          0.42 + Math.sin(this.wheelAng + t * Math.PI) * 0.22,
          e.position.z,
        ),
      ),
        (c.glare.material.opacity = 0.85 + Math.sin(e * 40) * 0.1),
        (c.firebox.material.opacity = 0.6 + Math.random() * 0.35),
        (c.catcher.emissiveIntensity =
          e < o
            ? 1.6 * L((e - a - 0.6) / (o - a - 0.6))
            : Math.max(0, 1.6 - (e - o) * 2)),
        this.coaches.forEach((e, t) => {
          let n = this.engineX - s * (2.05 + eu * (t + 0.5));
          (e.root.position.set(n, 0, 0),
            (e.root.visible =
              s * (n + (s * eu) / 2 - this.portalX) > 0.3 && Math.abs(n) < 16));
          for (let t of e.wheels) t.rotation.y = -this.wheelAng * 1.4;
        }),
        i.audio.setEngine(0.95, e < o ? 1.3 : 0.85),
        c.chimney.getWorldPosition(this.v1),
        (this.v1.y += 0.4),
        i.fx.particles.emit(this.v1, {
          count: N ? 1 : 2,
          speed: 1.2,
          color: 15658734,
          life: 1.2,
          size: 0.45,
          gravity: -2.2,
          drag: 1.2,
        }),
        (this.chuff -= n),
        this.chuff <= 0 &&
          ((this.chuff = 0.16),
          i.fx.particles.emit(this.v1, {
            count: N ? 4 : 8,
            speed: 2.4,
            color: 16777215,
            life: 1.4,
            size: 0.6,
            gravity: -2.6,
            drag: 1.4,
            dir: $l,
            spread: 0.6,
          }),
          this.v2.set(this.engineX + s * 0.9, 0.4, 0.7),
          i.fx.particles.emit(this.v2, {
            count: N ? 2 : 4,
            speed: 1.6,
            color: 16053492,
            life: 0.6,
            size: 0.3,
            gravity: -0.5,
            drag: 2,
          })),
        Math.random() < 0.8 &&
          (this.v2.set(
            this.engineX + s * (Math.random() * 2.2 - 0.8),
            0.08,
            (Math.random() < 0.5 ? -1 : 1) * 0.55,
          ),
          i.fx.particles.emit(this.v2, {
            count: N ? 2 : 4,
            speed: 3,
            color: 16760896,
            life: 0.35,
            size: 0.05,
            gravity: 7,
            drag: 1,
            dir: $l,
            spread: 1.2,
          })),
        this.stepStreaks(n, e < o + 0.8),
        this.hornOn &&
          e > o + 1.6 &&
          ((this.hornOn = !1), i.audio.stopEngine(0.6)));
    }
  }
  stepStreaks(e, t) {
    let n = this.dir;
    for (let r of this.streaks) {
      let i = r.m.material;
      if (r.life <= 0) {
        if (!t || Math.random() > 0.25) {
          r.m.visible = !1;
          continue;
        }
        ((r.life = 0.3),
          r.m.position.set(
            this.engineX + n * (Math.random() * 4 - 1),
            0.3 + Math.random() * 2.4,
            (Math.random() - 0.5) * 3,
          ));
      }
      ((r.life -= e),
        (r.m.visible = !0),
        (r.m.position.x -= n * e * 22),
        (i.opacity = 0.55 * Math.sin(L(r.life / 0.3) * Math.PI)));
    }
  }
  impact() {
    let e = this.d,
      t = e.target;
    ((this.hit = !0),
      e.audio.superRelease(`bulldozer`),
      e.audio.boom(),
      e.audio.metalCrunch(),
      e.audio.thunder(),
      e.audio.horn(0.5),
      e.flash(`rgba(255,236,190,0.95)`, 260),
      e.cam.shake(0.8, 0.8),
      this.v1.set(t.x, 1, 0),
      e.fx.shockwave(this.v1, Ql, 0.8, 4.5, !0),
      e.fx.shockwave(this.v1, 16777215, 0.4, 2.2, !0),
      e.fx.shockwave(this.v2.set(t.x, 0.06, 0), Zl, 0.8, 4),
      e.fx.dust(this.v2, 3.5),
      e.fx.particles.emit(this.v1, {
        count: N ? 70 : 160,
        speed: 8,
        color: Ql,
        life: 1,
        size: 0.12,
        gravity: 5,
        drag: 1.2,
      }),
      e.fx.particles.emit(this.v1, {
        count: N ? 30 : 70,
        speed: 5,
        color: Zl,
        life: 0.8,
        size: 0.08,
        gravity: 4,
        drag: 1.4,
        dir: $l,
        spread: 1.3,
      }),
      e.fx.particles.emit(this.v1, {
        count: N ? 15 : 30,
        speed: 2.5,
        color: 16777215,
        life: 1.5,
        size: 0.55,
        gravity: -1.5,
        drag: 1,
      }),
      e.popup(`RAIL RAJA EXPRESS!`, this.v2.set(t.x, 2.7, 0.3), `#ffd23f`),
      e.arena.cheer(1.8));
    for (let e of this.flyers) {
      ((e.m.visible = !0),
        e.m.position.set(
          t.x + (Math.random() - 0.5) * 0.6,
          1 + Math.random() * 0.8,
          (Math.random() - 0.5) * 0.6,
        ));
      let n = e.paper ? 1.3 : 1;
      e.vel.set(
        (Math.random() - 0.2) * 6 * this.dir * n,
        (4 + Math.random() * 5) * n,
        (Math.random() - 0.5) * 5 * n,
      );
    }
    this.landSuperHit(t.hp, this.dir, 5.5, 7.5);
  }
  stepFlyers(e) {
    let n = this.d,
      r = 0;
    this.hit &&
      this.t > t.IMPACT + 0.5 &&
      this.t - e <= t.IMPACT + 0.5 &&
      n.popup(`NO WAITING LIST!`, this.v2.set(n.target.x, 2.2, 0.3), `#ff8fb8`);
    for (let t of this.flyers) {
      let i = t.m;
      i.visible &&
        (t.paper
          ? ((t.vel.y -= 4 * e),
            t.vel.multiplyScalar(Math.exp(-e * 1.6)),
            i.position.addScaledVector(t.vel, e),
            (i.position.x += Math.sin(this.t * 6 + t.spin) * e * 0.6),
            (i.rotation.x += t.spin * e),
            (i.rotation.y += t.spin * 0.7 * e),
            i.position.y <= 0.03 && (i.visible = !1))
          : ((t.vel.y -= 12 * e),
            i.position.addScaledVector(t.vel, e),
            (i.rotation.x += t.spin * e),
            (i.rotation.z += t.spin * 0.6 * e),
            i.position.y <= 0.06 &&
              ((i.visible = !1),
              n.fx.particles.emit(this.v1.copy(i.position).setY(0.08), {
                count: 6,
                speed: 2,
                color: 11884079,
                life: 0.5,
                size: 0.05,
                gravity: 8,
                drag: 1,
              }),
              r++ < 2 && n.audio.cupBreak())));
    }
  }
  stepCamera(e) {
    let n = this.d,
      { OUT: r, IMPACT: i } = t,
      a = n.caster,
      o = n.target,
      s = this.dir,
      { look: c, pos: l } = this;
    e < r
      ? (c.set(a.x - s * 1.6, 1.6, -0.6),
        l.set(a.x + s * 1.4, 1.3, 6.6),
        n.cam.set(l, c, 2.5, 52))
      : e < r + 0.75
        ? (c.set(this.engineX + s * 1.5, 1.4, 0),
          l.set(o.x + s * 2.6, 0.7, 2.6),
          n.cam.set(l, c, 5, 56))
        : e < i + 0.25
          ? (c.set(this.engineX + s * 2.4, 1.6, 0),
            l.set(this.engineX + s * 0.6, 0.9, 6),
            n.cam.set(l, c, 4, 56))
          : (c.set((a.x + o.x) / 2 + s * 0.5, 1.2, 0),
            l.set((a.x + o.x) / 2, 1.9, 7.6),
            n.cam.set(l, c, 2.5, 46));
  }
  dispose() {
    let e = this.d;
    (e.audio.stopEngine(0.2), e.arena.setMood(0), e.scene.remove(this.root));
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
(e(uu, `RAILS`, 0.6),
  e(uu, `PORTAL`, 1),
  e(uu, `SIGNAL`, 1.45),
  e(uu, `OUT`, 1.75),
  e(uu, `IMPACT`, 3.4),
  e(uu, `END`, 5.9));
var du = new T(0, 0, 1),
  fu = 260;
function pu() {
  let e = new y(),
    t = new y();
  e.add(t);
  let n = new C({
    color: 16765803,
    emissive: 16753183,
    emissiveIntensity: 1.1,
    metalness: 0.5,
    roughness: 0.3,
  });
  for (let e of [-0.14, 0.14]) {
    let r = new S(new E(2, 0.07, 10, 72), n);
    ((r.position.z = e), t.add(r));
  }
  let r = new S(new O(0.24, 0.24, 0.5, 24), n);
  ((r.rotation.x = Math.PI / 2), t.add(r));
  let i = new S(
    new x(0.3, 2.1, 72),
    new k({
      color: 16762976,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
      side: 2,
    }),
  );
  e.add(i);
  let a = M(16756800, 6, 0.3);
  e.add(a);
  let o = new h(16760928, 0, 14, 2);
  return (e.add(o), { root: e, wheel: t, blur: i, glow: a, light: o });
}
var mu = class t extends aa {
  constructor(t) {
    (super(t),
      e(this, `END`, 7.9),
      e(this, `FLOAT_H`, 0.75),
      e(this, `charkha`, pu()),
      e(this, `threads`, []),
      e(
        this,
        `threadMat`,
        new k({
          color: 16769162,
          transparent: !0,
          opacity: 0,
          blending: 2,
          depthWrite: !1,
        }),
      ),
      e(this, `threadGeo`, new O(0.014, 0.014, 1, 6)),
      e(this, `cocoon`, new y()),
      e(
        this,
        `cocoonMat`,
        new C({
          color: 16774098,
          emissive: 16764784,
          emissiveIntensity: 0.55,
          roughness: 0.7,
        }),
      ),
      e(this, `cocoonGeo`, new E(0.46, 0.022, 6, 40)),
      e(this, `salt`, void 0),
      e(this, `saltGeo`, new ne(0.05)),
      e(
        this,
        `saltMat`,
        new C({
          color: 16777215,
          emissive: 14676479,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.1,
        }),
      ),
      e(this, `saltSeed`, []),
      e(this, `dummy`, new f()),
      e(this, `aura`, M(16765024, 2.6, 0)),
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
      let e = new S(this.threadGeo, this.threadMat);
      ((e.visible = !1), t.scene.add(e), this.threads.push(e));
    }
    for (let e = 0; e < 16; e++) {
      let t = new S(this.cocoonGeo, this.cocoonMat);
      (t.rotation.set(Math.PI / 2 + (e % 2 ? 0.3 : -0.3), 0, 0),
        (t.position.y = (e - 7.5) * 0.11),
        t.scale.setScalar(0.001),
        this.cocoon.add(t));
    }
    (t.scene.add(this.cocoon),
      (this.salt = new be(this.saltGeo, this.saltMat, fu)),
      (this.salt.frustumCulled = !1),
      (this.salt.visible = !1));
    for (let e = 0; e < fu; e++)
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
          this.FLOAT_H * z(L((e - 0.4) / 1.3)) + Math.sin(e * 2.1) * 0.03),
        (this.casterClip = { name: `sit`, time: e, loop: !0, fade: 0.25 }))
      : e < n
        ? ((a.y = Math.max(0, this.FLOAT_H * (1 - z((e - r + 0.3) / 0.6)))),
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
      l = R(L((e - r) / 0.8));
    if (!this.released)
      (s.root.scale.setScalar(
        Math.max(0.001, l * (1 + Math.sin(e * 8) * 0.01)),
      ),
        (this.spinSpeed = e < r ? 0 : 2 + (e - r) * 3.6),
        (s.blur.material.opacity = 0.2 * L((e - i + 0.6) / 1.5)),
        (s.glow.material.opacity = 0.32 * l),
        (s.light.intensity = 14 * l));
    else {
      let t = L((e - a) / 0.45);
      ((this.wheelX += n * 15 * c),
        s.root.position.set(this.wheelX, 2.05, 0),
        (this.spinSpeed = 26));
      let r = L((e - a - 0.5) / 0.5);
      (s.root.scale.setScalar(Math.max(0.001, 1.05 * (1 - r))),
        (s.blur.material.opacity = 0.6 * (1 - r)),
        (s.light.intensity = 40 * (1 - t * 0.5) * (1 - r)));
    }
    ((this.spin -= this.spinSpeed * n * c),
      s.wheel.quaternion.setFromAxisAngle(du, this.spin));
  }
  stepTarget(e, n) {
    let { CHARKHA: r, NAMAK: i, RELEASE: a } = t,
      o = this.d,
      s = o.target;
    if (this.released) {
      ((this.targetPose = null),
        (this.targetClip = null),
        s.update(Ti(), o.caster.x));
      return;
    }
    let c = z(L((e - r - 0.5) / 1.1)),
      l = p.clamp(o.caster.x + o.caster.facing * 2.6, -j + 0.6, j - 0.6);
    ((s.x = this.tx + (l - this.tx) * z(L((e - r - 0.4) / 1.2))),
      (s.y = c * 1.15 + Math.sin(e * 3) * 0.04 * c),
      (this.targetPose = F(Gi(e, s.char.id), {
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
    let u = L((e - r - 1.2) / 1.1);
    (this.cocoon.position.set(s.x, s.y + 0.95, 0),
      (this.cocoon.rotation.y += n * (2 + u * 16)),
      this.cocoon.children.forEach((e, t) =>
        e.scale.setScalar(Math.max(0.001, R(L(u * 16 - (15 - t) * 0.75)))),
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
    let f = L((e - i) / 0.6);
    if (((this.salt.visible = f > 0), f > 0)) {
      for (let t = 0; t < fu; t++) {
        let n = this.saltSeed[t],
          r = n.phase + e * n.speed,
          i = n.r * f * (1 - L((e - a + 0.5) / 0.5) * 0.55);
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
      this.landSuperHit(
        this.hpBefore,
        n,
        10,
        9.5,
        this.d.caster.superShare ?? 0.3,
      ));
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
        this.aura.material.opacity = 0.6 * L(o / 0.8) * (1 - L((o - a) / 0.6)),
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
      let e = z(o / r);
      (this.v1.set(s.x, 1 + s.y * 0.5, 0),
        this.v2.set(s.x - c * (2 - e * 0.7), 1.1, 3.8 - e * 1.1),
        n.cam.set(this.v2, this.v1, 2.6, 40));
    } else if (o < a) {
      let e = z(L((o - r) / 1.2));
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
(e(mu, `CHARKHA`, 2),
  e(mu, `NAMAK`, 4),
  e(mu, `WIND`, 5.6),
  e(mu, `RELEASE`, 6));
function hu(e) {
  switch (e.caster.char.id) {
    case `modi`:
      return new sa(e);
    case `didi`:
      return new Us(e);
    case `trump`:
      return new Ec(e);
    case `nitin`:
      return new Hl(e);
    case `yogi`:
      return new Al(e);
    case `mbapu`:
      return new mu(e);
    case `ravi`:
      return new Xl(e);
    case `lalu`:
      return new uu(e);
    default:
      return new zl(e);
  }
}
var gu = class {
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
        (this.total = N ? 0 : r + n),
        !N)
      )
        for (let e = 0; e < this.total; e++) {
          let e = new h(0, 0, 0.001);
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
          (N && !n.userData.keepLight ? (n.visible = !1) : t.push(n));
      };
      this.scene.traverseVisible(n);
      for (let t of e) t.traverseVisible(n);
      if (N) return;
      if (t.length > this.total) {
        for (let e = this.total; e < t.length; e++) {
          let e = new h(0, 0, 0.001);
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
  G = () => void 0,
  _u = new Proxy({}, { get: (e, t) => (t === `clipTime` ? () => null : G) });
function vu() {
  let e = new y(),
    t = (e) => (t) => t.set(0, e, 0);
  return {
    root: e,
    current: ki(),
    yaw: 0,
    applyPose: G,
    blendTo: G,
    snapTo: G,
    setTransform: G,
    setFree: G,
    wink: G,
    handWorld: (e, t) => t.set(0.4, 1.2, 0),
    headWorld: t(1.65),
    chestWorld: t(1.3),
    setFacePhoto: G,
  };
}
async function yu(e, t, n, r, i) {
  let a = new y();
  ((a.visible = !1), n.add(a));
  let o = new ke(64, 64),
    s = new Set(),
    c = new Set(),
    l = new Set(),
    u = () =>
      a.traverse((e) => {
        let t = e.geometry;
        t && !t.userData.shared && l.add(t);
        let n = e.material;
        if (n)
          for (let e of Array.isArray(n) ? n : [n])
            for (let t of Object.values(e)) {
              let n = t;
              n?.isTexture &&
                !n.isRenderTargetTexture &&
                (e.userData.shared || n.userData.shared ? c : s).add(n);
            }
      }),
    d = [],
    f = async () => {
      (u(),
        (d.length = 0),
        a.traverse((e) => {
          (d.push([e, e.visible, e.frustumCulled]),
            (e.visible = !e.isLight),
            (e.frustumCulled = !1));
        }),
        r.balance());
      let i = e.getRenderTarget();
      (e.setRenderTarget(o), e.render(n, t), e.setRenderTarget(i));
      for (let [e, t, n] of d) ((e.visible = t), (e.frustumCulled = n));
      ((a.visible = !1), await new Promise((e) => setTimeout(e, 0)));
    },
    p = () => {
      u();
      for (let e of [...a.children]) e.userData.keepWarm || a.remove(e);
    },
    m = new S(
      new x(0.6, 0.8, 8),
      new k({ transparent: !0, blending: 2, depthWrite: !1, side: 2 }),
    );
  ((m.userData.keepWarm = !0), a.add(m));
  let h = a;
  for (let e of i) {
    let n = i.find((t) => t !== e) ?? (e === `modi` ? `rahul` : `modi`),
      r = { particles: { emit: G }, dust: G, shockwave: G, hitSpark: G },
      a = { set: G, shake: G, camera: t },
      o = { cheer: G, paparazzi: G, setMood: G };
    try {
      let t = new Fo(0, P[e], -1.5),
        i = new Fo(1, P[n], 1.5);
      (t.forceState(`super`), i.forceState(`frozen`));
      let s = hu({
          scene: h,
          caster: t,
          target: i,
          casterRig: vu(),
          targetRig: vu(),
          fx: r,
          audio: _u,
          cam: a,
          arena: o,
          flash: G,
          clipTime: () => null,
          popup: G,
          speech: G,
        }),
        c = 0,
        l = 0;
      for (; !s.done && c < 600;)
        (s.step(1 / 30), c++, c >= l && (await f(), (l += 8)));
      await f();
    } catch (t) {
      console.warn(`[prewarm] super`, e, t);
    }
    p();
    try {
      let t = sc({
          scene: h,
          attacker: new Fo(0, P[e], -0.4),
          defender: new Fo(1, P[n], 0.4),
          attRig: vu(),
          defRig: vu(),
          fx: r,
          audio: _u,
          arena: o,
          cam: a,
          popup: G,
          speech: G,
          onImpact: G,
        }),
        i = 0;
      for (; !t.done && i < 180;)
        (t.step(1 / 30), i++, i === 20 && (await f()));
    } catch (t) {
      console.warn(`[prewarm] grapple`, e, t);
    }
    p();
  }
  if (i.includes(`mbapu`)) {
    p();
    try {
      va();
      let e = { particles: { emit: G }, dust: G, shockwave: G, hitSpark: G },
        n = { set: G, shake: G, snap: G, camera: t },
        r = { cheer: G, paparazzi: G, setMood: G },
        i = new Fo(0, P.modi, -1.5),
        a = new Fo(1, P.mbapu, 1.5);
      ((a.boss = !0), (a.hp = a.maxHp));
      let o = new Ta({
          scene: h,
          caster: i,
          target: a,
          casterRig: vu(),
          targetRig: vu(),
          fx: e,
          audio: _u,
          cam: n,
          arena: r,
          flash: G,
          clipTime: () => null,
          popup: G,
          speech: G,
        }),
        s = 0;
      for (; !o.done && s < 240;)
        (o.step(1 / 30), s++, s % 8 == 0 && (await f()));
      await f();
    } catch (e) {
      console.warn(`[prewarm] budget`, e);
    }
    p();
  }
  try {
    (new ms(h),
      new ys(h, -1, 1),
      new so(h, -1, 1),
      new ao(h, new T(0, 1, 0), 0));
  } catch (e) {
    console.warn(`[prewarm] extras`, e);
  }
  (await f(), p(), n.remove(a), o.dispose());
  for (let e of l) e.dispose();
  for (let e of s) c.has(e) || e.dispose();
  r.balance();
  try {
    await e.compileAsync(n, t);
  } catch {
    e.compile(n, t);
  }
  let g = new Set();
  n.traverseVisible((e) => {
    e.isLight && g.add(e);
  });
  let _ = [];
  n.traverse((e) => {
    !e.visible && !e.isLight && (_.push(e), (e.visible = !0));
  });
  let v = [];
  n.traverseVisible((e) => {
    e.isLight && !g.has(e) && v.push(e);
  });
  for (let e of v) e.visible = !1;
  r.balance();
  let b = new ke(64, 64),
    ee = e.getRenderTarget();
  (e.setRenderTarget(b), e.render(n, t), e.setRenderTarget(ee), b.dispose());
  for (let e of v) e.visible = !0;
  for (let e of _) e.visible = !1;
  r.balance();
  for (let t of c) e.initTexture(t);
  n.traverse((t) => {
    let n = t.material;
    if (n)
      for (let t of Array.isArray(n) ? n : [n]) {
        let n = t.map;
        n && e.initTexture(n);
      }
  });
}
function bu(e) {
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
function xu(e) {
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
function Su(e, t) {
  let n = Math.min(t.length, 8),
    r = new ArrayBuffer(6 + n),
    i = new DataView(r);
  (i.setUint8(0, 1), i.setUint32(1, e), i.setUint8(5, n));
  for (let e = 0; e < n; e++) i.setUint8(6 + e, t[t.length - n + e]);
  return r;
}
function Cu(e) {
  if (e.byteLength < 6) return null;
  let t = new DataView(e);
  if (t.getUint8(0) !== 1) return null;
  let n = t.getUint8(5);
  if (e.byteLength < 6 + n) return null;
  let r = [];
  for (let e = 0; e < n; e++) r.push(t.getUint8(6 + e));
  return { seq: t.getUint32(1), frames: r };
}
var wu = class t {
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
    if (this.next < 0) return xu(0);
    for (; this.newest - this.next > t.MAX_BACKLOG;) this.skip();
    if ((this.drain(), this.frames.has(this.next))) {
      let e = this.frames.get(this.next);
      (this.frames.delete(this.next), this.next++);
      let t = e | this.pendingEdges;
      return ((this.pendingEdges = 0), (this.held = e & -241), xu(t));
    }
    return this.newest > this.next + 1
      ? (this.skip(), this.take())
      : xu(this.held);
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
    this.pendingEdges |= bu(e) & 240;
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
(e(wu, `MAX_BACKLOG`, 4), e(wu, `DRAIN_EVERY`, 30));
function Tu(e) {
  return e === null ? 3 : Math.min(6, Math.round((e / 2 + 33) * (60 / 1e3)));
}
var Eu = class {
    constructor() {
      (e(this, `held`, []), e(this, `frames`, 0));
    }
    reset(e) {
      ((this.frames = e), (this.held.length = 0));
    }
    pass(e) {
      return (
        this.held.push(e),
        this.held.length > this.frames ? this.held.shift() : Ti()
      );
    }
  },
  Du = [
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
  Ou = (e) => Math.round(e * 1e3) / 1e3,
  ku = {
    crouching: 1,
    holdingBack: 2,
    grounded: 4,
    attackHasHit: 8,
    airAttackUsed: 16,
  },
  Au = [`punch`, `kick`, `grab`],
  ju = class t {
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
      let n = Cu(e);
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
  };
function Mu(e) {
  return e.attack ? (e.attack.def.air ? `mid` : e.attack.def.height) : null;
}
function Nu(e) {
  return Ye * (e.char.modelHeight ?? 1) * (e.crouching ? Xe : 1);
}
function Pu(e, t) {
  let n = Nu(e);
  if (t < -0.1 || t > n + 0.1) return null;
  let r = t / n;
  return r < 0.48 ? Ze.legs : r < 0.8 ? Ze.torso : Ze.head;
}
function Fu(e, t) {
  let n = e.attack,
    r = (t.x - e.x) * e.facing;
  if (r < -0.15) return null;
  if (n.def.grab)
    return r <= 1.05 ? { x: t.x - e.facing * Ze.torso, y: 1.2 } : null;
  let i = ho[e.char.id][n.def.id];
  if (!i) return null;
  let a = i[1],
    o = !!n.def.air || t.y > 0.25,
    s = n.def.air ? e.y + a - t.y : o ? a - t.y : Math.min(a, Nu(t) * 0.6),
    c = Pu(t, s);
  return c === null || r - c > Ao(e, n.def.id) + 0.1
    ? null
    : {
        x: t.x - e.facing * Math.max(0, c - 0.05),
        y: t.y + Math.min(Math.max(s, 0.2), Nu(t) - 0.1),
      };
}
function Iu(e, t) {
  let n = e.attack;
  if (
    !n ||
    n.hasHit ||
    !e.isAttackActive ||
    t.invulnerable ||
    (n.def.grab && (t.state === `hitstun` || t.airborne || t.y > 0.01))
  )
    return !1;
  let r = Mu(e);
  return (t.y > 0.25 && r === `low`) || (t.isLow && r === `high`)
    ? !1
    : Fu(e, t) !== null;
}
function Lu(e, t) {
  return !e.canBlock || !e.holdingBack || e.airborne
    ? !1
    : e.crouching
      ? t === `low`
      : t === `high` || t === `mid`;
}
var Ru = [1, 0.9, 0.78, 0.66, 0.54, 0.44],
  zu = 0.35;
function Bu(e) {
  return Ru[e] ?? zu;
}
function Vu(e, t, n) {
  let r = t.isBoss ? 0.8 : 1;
  return Math.max(
    1,
    Math.round(n * e.char.damageMul * e.power * Bu(t.comboHits) * r),
  );
}
function Hu(e, t) {
  if (!Iu(e, t)) return null;
  let n = e.attack;
  n.hasHit = !0;
  let r = Mu(e),
    i = e.facing,
    a = Lu(t, r),
    { x: o, y: s } = Fu(e, t);
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
      x: o,
      y: 1.2,
    };
  }
  if (a) {
    n.blocked = !0;
    let r = Math.min(
      Math.round(n.def.damage * e.char.damageMul * $e),
      Math.ceil(t.hp) - 1,
    );
    return (
      r > 0 && (t.hp -= r),
      t.applyBlock(n.def, i),
      e.addMeter(2),
      t.addMeter(3),
      Wu(e, t, n.def.push * 0.6),
      {
        attacker: e,
        defender: t,
        moveId: n.def.id,
        blocked: !0,
        damage: Math.max(0, r),
        knockdown: !1,
        ko: !1,
        x: o,
        y: s,
      }
    );
  }
  let c = t.attackPhase === `startup`,
    l = Vu(e, t, n.def.damage * (c ? et : 1));
  return (
    t.applyHit(n.def, l, i),
    e.addMeter(l * 0.9 + 2),
    t.addMeter(l * 0.6),
    Wu(e, t, n.def.push * 0.8),
    {
      attacker: e,
      defender: t,
      moveId: n.def.id,
      blocked: !1,
      damage: l,
      knockdown: t.state === `knockdown`,
      ko: t.state === `ko`,
      counter: c,
      x: o,
      y: s,
    }
  );
}
function Uu(e, t) {
  if (!Iu(e, t) || !Iu(t, e)) return [Hu(e, t), Hu(t, e)];
  let n = !!e.attack?.def.grab;
  if (n !== !!t.attack?.def.grab) {
    let [r, i] = n ? [t, e] : [e, t],
      a = Hu(r, i);
    return n ? [null, a] : [a, null];
  }
  if (n) return [Hu(e, t), null];
  let r = t.attack,
    i = Hu(e, t);
  t.attack = r;
  let a = Hu(t, e);
  return ((t.attack = null), [i, a]);
}
function Wu(e, t, n) {
  Math.abs(t.x) >= 6.45 && (e.vx = -e.facing * n);
}
function Gu(e, t) {
  if (e.y > 1 || t.y > 1) return;
  let n = t.x - e.x,
    r = Math.abs(n);
  if (r >= 0.72) return;
  let i = n === 0 ? e.facing : Math.sign(n),
    a = (Je - r) / 2;
  ((e.x -= i * a), (t.x += i * a));
  let o = (e, t) => {
    e.x < -6.5
      ? ((t.x += -j - e.x), (e.x = -j))
      : e.x > 6.5 && ((t.x -= e.x - j), (e.x = j));
  };
  (o(e, t), o(t, e));
}
var Ku = {
    easy: {
      breakChance: 0.08,
      reaction: 0.42,
      blockChance: 0.18,
      punishChance: 0.2,
      aggression: 0.45,
      superChance: 0.35,
      bossRead: 0.2,
    },
    normal: {
      breakChance: 0.3,
      reaction: 0.26,
      blockChance: 0.45,
      punishChance: 0.5,
      aggression: 0.65,
      superChance: 0.7,
      bossRead: 0.35,
    },
    hard: {
      breakChance: 0.6,
      reaction: 0.14,
      blockChance: 0.75,
      punishChance: 0.85,
      aggression: 0.8,
      superChance: 1,
      bossRead: 0.8,
      bossReaction: 0.06,
    },
  },
  qu = class {
    constructor(t, n = Math.random) {
      (e(this, `rng`, void 0),
        e(this, `plan`, { kind: `wait`, time: 0, buttons: [] }),
        e(this, `elapsed`, 0),
        e(this, `sinceDecision`, 99),
        e(this, `profile`, void 0),
        e(this, `read`, null),
        e(this, `readIt`, !1),
        (this.rng = n),
        (this.profile = Ku[t]));
    }
    think(e, t, n) {
      if (
        ((this.elapsed += n),
        (this.sinceDecision += n),
        e.isBoss && this.readAttack(e, t))
      )
        return this.execute(e, t);
      let r = e.isBoss
        ? (this.profile.bossReaction ?? this.profile.reaction)
        : this.profile.reaction;
      return (
        (this.sinceDecision >= r || this.elapsed >= this.plan.time) &&
          this.decide(e, t),
        this.execute(e, t)
      );
    }
    readAttack(e, t) {
      let n = Math.abs(t.x - e.x),
        r = t.attack,
        i = !r && t.state === `jump` && t.y > 0.1;
      if (i ? n > 2.3 : !r || t.attackPhase === `recovery` || n > 1.9)
        return (!r && !i && (this.read = null), !1);
      let a = r ?? t;
      if (
        (this.read !== a &&
          ((this.read = a), (this.readIt = this.rng() < this.profile.bossRead)),
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
      let s = !i && Mu(t) === `low`;
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
        e.meter >= 100 &&
        t.state !== `knockdown` &&
        t.state !== `getup` &&
        n() < r.superChance
      ) {
        this.setPlan(`super`, 0.1);
        return;
      }
      if (e.char.id === `mbapu` && i < 1.9 && n() < 0.75) {
        this.planMbapuAttack(i);
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
        let e = Mu(t) === `low`;
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
        e.isBoss ? this.planMbapuAttack(i) : this.planAttack(i);
        return;
      }
      if (i > 1.4) {
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
    planMbapuAttack(e) {
      let t = this.rng();
      e > 1.15
        ? t < 0.4
          ? this.setPlan(`attack`, 0.65, [
              { at: 0, button: `punch`, forward: !0 },
            ])
          : t < 0.75
            ? this.setPlan(`attack`, 0.65, [
                { at: 0, button: `kick`, forward: !0 },
              ])
            : this.setPlan(`jumpIn`, 0.85, [{ at: 0.25, button: `kick` }])
        : t < 0.3
          ? this.setPlan(`attack`, 0.8, [
              { at: 0, button: `punch` },
              { at: 0.18, button: `punch` },
              { at: 0.38, button: `punch` },
            ])
          : t < 0.55
            ? this.setPlan(`attack`, 0.8, [
                { at: 0, button: `kick` },
                { at: 0.28, button: `kick` },
              ])
            : t < 0.75
              ? this.setPlan(`attack`, 0.65, [
                  { at: 0, button: `kick`, down: !0 },
                ])
              : t < 0.9
                ? this.setPlan(`attack`, 0.75, [
                    { at: 0, button: `punch`, forward: !0 },
                    { at: 0.32, button: `kick` },
                  ])
                : this.setPlan(`attack`, 0.6, [{ at: 0, button: `grab` }]);
    }
    planAttack(e) {
      let t = this.rng();
      e > 1.05
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
      let n = Ti(),
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
function Ju(e, t, n, r = null) {
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
var Yu = class {
    constructor() {
      (e(this, `wins`, [0, 0]),
        e(this, `round`, 1),
        e(this, `timer`, 60),
        e(this, `history`, []));
    }
    tick(e) {
      return ((this.timer = Math.max(0, this.timer - e)), this.timer <= 0);
    }
    record(e) {
      (this.history.push(e),
        e.outcome === `draw`
          ? (this.wins[0]++, this.wins[1]++)
          : this.wins[e.outcome]++);
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
  Xu,
  Zu = 2.7,
  Qu = -2.2,
  $u = 1.7,
  ed = 0.8,
  td = class t {
    constructor(t) {
      (e(this, `d`, void 0),
        e(this, `t`, 0),
        e(this, `done`, !1),
        e(this, `rig`, void 0),
        e(this, `glow`, M(16765024, 3.2, 0)),
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
      let n = j - t.winner.x >= t.winner.x + j;
      ((this.dir = n ? -1 : 1),
        (this.startX = n ? j : -j),
        (this.stopX = t.winner.x - this.dir * Zu),
        (this.beatenFromX = t.beaten.x),
        (this.beatenExitX = this.dir * (j + 5)),
        (this.rig = el(P.mbapu)),
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
        t.arena.setMood(ed),
        t.arena.setLeader(null, 0),
        t.arena.setBoredom(0),
        t.audio.silenceMusic(!0),
        t.audio.playClip(On));
    }
    get bossX() {
      return this.stopX;
    }
    get x() {
      return (
        this.startX + (this.stopX - this.startX) * L((this.t - t.REVEAL) / 7.8)
      );
    }
    once(e, t, n) {
      this.t >= t && !this.beats.has(e) && (this.beats.add(e), n());
    }
    beatenPose(e) {
      if (this.t < 1 || this.t >= 3.8) return null;
      let t = this.d.beaten.char.id;
      return F(V(e, t), {
        hipsT: 0,
        spineT: 0,
        spineF: 0.12,
        headF: 0.2,
        ...Qi,
      });
    }
    skip() {
      this.t = this.t < t.BOW ? t.BOW : t.END;
    }
    placeBeaten() {
      let e = this.d,
        t = e.beaten.facing > 0 ? 1 : -1,
        n = z(L((this.t - 1) / 2.6));
      if (this.t < 3.8) {
        e.beatenRig.setFree(
          this.beatenFromX,
          0,
          Qu * n,
          t * (Math.PI / 2 + (0.55 - Math.PI / 2) * n),
        );
        return;
      }
      let r = Math.sign(this.beatenExitX - this.beatenFromX),
        i = Math.min(
          Math.abs(this.beatenExitX - this.beatenFromX),
          (this.t - 3.8) * $u,
        );
      (e.beatenRig.setFree(this.beatenFromX + r * i, 0, Qu, (r * Math.PI) / 2),
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
          this.rig.setTransform(f, 0, this.dir, 0, _o));
        let t = { name: `hiphop`, time: d - r, fade: 0.2, loop: !1 };
        (d >= o
          ? (t = { name: `stance`, time: n, fade: 0.45, loop: !0 })
          : d >= i &&
            (t = { name: `bow`, time: 0.2 + (d - i), fade: 0.35, loop: !1 }),
          this.rig.playClip?.(t, e),
          this.glow.position.set(f, 1, -0.1),
          (this.glow.material.opacity =
            0.42 * L((d - r) / 1.2) * (1 - L((d - o) / 0.8))));
      }
      let p = L((d - (s - l)) / l);
      if ((u.arena.setMood(ed * (1 - p)), d < r))
        (this.v1.set(u.winner.x, 1.05, 0),
          this.v2.set(u.winner.x - this.dir * 2.2, 0.8, 3.7));
      else {
        let e = z(L((d - (i - 0.8)) / (s - i))),
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
((Xu = td),
  e(td, `REVEAL`, 2.5),
  e(td, `BOW`, Xu.REVEAL + 7.8),
  e(td, `TITLE`, Xu.BOW + 0.3),
  e(td, `STANCE`, Xu.BOW + 1.5),
  e(td, `END`, Xu.STANCE + 1.1),
  e(td, `MUSIC_FADE`, 2.4),
  e(td, `SETTLE`, 1.6));
var nd = new T(400, 0, 0),
  rd = 1317936,
  K = {
    TALK: 1.9,
    SIT: 4.4,
    WHEEL: 4.9,
    OPEN: 7.4,
    FLY: 10,
    LONDON: 11.2,
    CLOCK: 14.4,
    PEDESTAL: 16.4,
    SHADOW: 19.2,
    CLOSE: 22.4,
    TITLE: 23.8,
    END: 30.6,
  },
  id = K.FLY + 1.05,
  ad = id - 5.65;
function od(e, t) {
  let n = Math.sin(e * 1.6) * 0.02;
  return F(V(e, t), {
    rootY: -(at - 0.16),
    rootZ: 0,
    hipsF: 0,
    hipsT: 0,
    hipsS: 0,
    spineF: 0.1 + n,
    spineT: 0,
    spineS: 0,
    chestF: 0,
    chestT: 0,
    headF: 0.08,
    headT: 0,
    headS: 0,
    lThF: 1.4,
    lThO: 0.8,
    lKn: 2.5,
    lAnk: 0.35,
    rThF: 1.4,
    rThO: 0.8,
    rKn: 2.5,
    rAnk: 0.35,
    lShF: 0.5,
    lShO: 0.3,
    lShT: 0,
    lEl: 0.75,
    lHand: 1,
    rShF: 0.5,
    rShO: 0.3,
    rShT: 0,
    rEl: 0.75,
    rHand: 1,
  });
}
function sd(e, t, n) {
  let r = document.createElement(`canvas`);
  ((r.width = e), (r.height = t), n(r.getContext(`2d`)));
  let a = new _e(r);
  return ((a.colorSpace = i), a);
}
var cd = () =>
    sd(4, 512, (e) => {
      let t = e.createLinearGradient(0, 0, 0, 512);
      (t.addColorStop(0, `#010209`),
        t.addColorStop(0.42, `#08102a`),
        t.addColorStop(0.5, `#26304f`),
        t.addColorStop(0.56, `#121a33`),
        t.addColorStop(1, `#05070f`),
        (e.fillStyle = t),
        e.fillRect(0, 0, 4, 512));
    }),
  ld = () =>
    sd(128, 128, (e) => {
      for (let t = 0; t < 26; t++) {
        let t = 30 + Math.random() * 68,
          n = 40 + Math.random() * 48,
          r = 14 + Math.random() * 26,
          i = e.createRadialGradient(t, n, 0, t, n, r);
        (i.addColorStop(0, `rgba(255,255,255,0.22)`),
          i.addColorStop(1, `rgba(255,255,255,0)`),
          (e.fillStyle = i),
          e.fillRect(0, 0, 128, 128));
      }
    }),
  ud = () =>
    sd(256, 256, (e) => {
      let t = e.createRadialGradient(128, 128, 0, 128, 128, 60);
      (t.addColorStop(0, `rgba(255,255,255,1)`),
        t.addColorStop(0.25, `rgba(200,230,255,0.6)`),
        t.addColorStop(1, `rgba(160,200,255,0)`),
        (e.fillStyle = t),
        e.fillRect(0, 0, 256, 256));
      for (let [t, n, r] of [
        [0, 128, 5],
        [Math.PI / 2, 128, 5],
        [Math.PI / 4, 70, 2.5],
        [-Math.PI / 4, 70, 2.5],
      ]) {
        (e.save(), e.translate(128, 128), e.rotate(t));
        let i = e.createLinearGradient(-n, 0, n, 0);
        (i.addColorStop(0, `rgba(255,255,255,0)`),
          i.addColorStop(0.5, `rgba(255,255,255,1)`),
          i.addColorStop(1, `rgba(255,255,255,0)`),
          (e.fillStyle = i),
          e.beginPath(),
          e.moveTo(-n, 0),
          e.lineTo(0, -r),
          e.lineTo(n, 0),
          e.lineTo(0, r),
          e.fill(),
          e.restore());
      }
    }),
  dd = () =>
    sd(64, 256, (e) => {
      let t = e.createLinearGradient(0, 256, 0, 0);
      (t.addColorStop(0, `rgba(200,225,255,0.9)`),
        t.addColorStop(1, `rgba(200,225,255,0)`),
        (e.fillStyle = t),
        e.beginPath(),
        e.moveTo(26, 256),
        e.lineTo(38, 256),
        e.lineTo(64, 0),
        e.lineTo(0, 0),
        e.fill());
    });
function fd(e, t, n, r = 0.55) {
  return sd(128, 256, (i) => {
    ((i.fillStyle = `#20232c`), i.fillRect(0, 0, 128, 256));
    let a = 128 / e,
      o = 256 / t;
    for (let s = 0; s < e; s++)
      for (let e = 0; e < t; e++)
        ((i.fillStyle = Math.random() < r ? n : `#0b0c11`),
          i.fillRect(s * a + a * 0.3, e * o + o * 0.25, a * 0.4, o * 0.5));
  });
}
var pd = () =>
    sd(256, 256, (e) => {
      let t = e.createRadialGradient(128, 128, 10, 128, 128, 124);
      (t.addColorStop(0, `#fff4d0`),
        t.addColorStop(0.8, `#f2d79a`),
        t.addColorStop(1, `#8a6a2a`),
        (e.fillStyle = t),
        e.beginPath(),
        e.arc(128, 128, 124, 0, Math.PI * 2),
        e.fill(),
        (e.strokeStyle = `#2b1d08`),
        (e.lineWidth = 6),
        e.stroke(),
        (e.fillStyle = `#2b1d08`),
        (e.font = `bold 26px Georgia, serif`),
        (e.textAlign = `center`),
        (e.textBaseline = `middle`),
        [
          `XII`,
          `I`,
          `II`,
          `III`,
          `IIII`,
          `V`,
          `VI`,
          `VII`,
          `VIII`,
          `IX`,
          `X`,
          `XI`,
        ].forEach((t, n) => {
          let r = (n / 12) * Math.PI * 2 - Math.PI / 2;
          e.fillText(t, 128 + Math.cos(r) * 96, 128 + Math.sin(r) * 96);
        }));
    }),
  md = () =>
    sd(512, 512, (e) => {
      let t = e.createRadialGradient(256, 256, 0, 256, 256, 256);
      (t.addColorStop(0, `rgba(255,250,225,0.95)`),
        t.addColorStop(0.18, `rgba(255,224,140,0.7)`),
        t.addColorStop(0.6, `rgba(255,186,70,0.4)`),
        t.addColorStop(0.95, `rgba(255,160,40,0.25)`),
        t.addColorStop(1, `rgba(255,160,40,0)`),
        (e.fillStyle = t),
        e.fillRect(0, 0, 512, 512));
      for (let t = 0; t < 24; t++) {
        let n = (t / 24) * Math.PI * 2;
        (e.save(), e.translate(256, 256), e.rotate(n));
        let r = e.createLinearGradient(0, 0, 250, 0);
        (r.addColorStop(0, `rgba(255,255,235,0.5)`),
          r.addColorStop(1, `rgba(255,210,110,0)`),
          (e.fillStyle = r),
          e.beginPath(),
          e.moveTo(0, -3),
          e.lineTo(250, -16),
          e.lineTo(250, 16),
          e.lineTo(0, 3),
          e.fill(),
          e.restore());
      }
    });
function hd() {
  let e = sd(256, 256, (e) => {
    ((e.fillStyle = `#ffc95e`), e.fillRect(0, 0, 256, 256));
    for (let t = 0; t < 70; t++) {
      let t = Math.random() * 256,
        n = Math.random() * 256,
        r = 30 + Math.random() * 120,
        i = e.createLinearGradient(t, n, t, n + r),
        a = Math.random() < 0.5 ? `255,255,240` : `255,232,160`;
      (i.addColorStop(0, `rgba(${a},0)`),
        i.addColorStop(0.5, `rgba(${a},0.9)`),
        i.addColorStop(1, `rgba(${a},0)`),
        (e.fillStyle = i),
        e.fillRect(t, n, 2 + Math.random() * 3, r));
    }
  });
  return ((e.wrapS = e.wrapT = oe), e.repeat.set(6, 3), e);
}
function gd() {
  let e = new y(),
    t = new C({ color: 4870499, roughness: 0.85 }),
    n = fd(4, 10, `#ffcf87`, 0.45),
    r = new C({
      color: 10133680,
      map: n,
      emissiveMap: n,
      emissive: 16767392,
      emissiveIntensity: 1.5,
      roughness: 0.8,
    }),
    i = new C({
      color: 6258628,
      emissive: 1714773,
      emissiveIntensity: 0.8,
      roughness: 0.5,
      metalness: 0.4,
    }),
    a = new C({ color: 2896709, roughness: 0.7 });
  for (let n of [-6.5, 6.5]) {
    let i = new S(new w(5, 2.2, 5), t);
    i.position.set(n, 1.1, 0);
    let o = new S(new w(3.6, 13, 3.6), r);
    o.position.set(n, 8.7, 0);
    let s = new S(new ue(2.9, 3.4, 4), a);
    ((s.rotation.y = Math.PI / 4), s.position.set(n, 16.9, 0), e.add(i, o, s));
    for (let [t, i] of [
      [-1.7, -1.7],
      [1.7, -1.7],
      [-1.7, 1.7],
      [1.7, 1.7],
    ]) {
      let o = new S(new O(0.38, 0.38, 3.2, 10), r);
      o.position.set(n + t, 16.2, i);
      let s = new S(new ue(0.5, 1.8, 10), a);
      (s.position.set(n + t, 18.7, i), e.add(o, s));
    }
    let c = M(7314687, 9, 0.35);
    (c.position.set(n, 9, 2.4), e.add(c));
  }
  let o = new S(new w(11, 0.8, 3.2), t);
  (o.position.set(0, 5, 0), e.add(o));
  for (let t of [-0.9, 0.9]) {
    let n = new S(new w(9.4, 1.1, 1.1), i);
    (n.position.set(0, 13.6, t), e.add(n));
  }
  for (let n of [-1, 1]) {
    let r = [
        new T(n * 6.5, 13, 0),
        new T(n * 12, 7.4, 0),
        new T(n * 19, 5.4, 0),
      ],
      a = new S(new Le(new se(r), 24, 0.22, 8), i),
      o = new S(new w(12.5, 0.7, 3), t);
    (o.position.set(n * 12.8, 5, 0), e.add(a, o));
  }
  for (let t = 0; t < (N ? 14 : 26); t++) {
    let n = -18 + (36 * t) / ((N ? 14 : 26) - 1),
      r = M(16764800, 0.9, 0.85);
    (r.position.set(n, 5.6, 1.7), e.add(r));
  }
  return e;
}
function _d() {
  let e = new y(),
    t = new C({
      color: 15265532,
      emissive: 12110079,
      emissiveIntensity: 0.7,
      roughness: 0.4,
      metalness: 0.5,
    }),
    n = new y();
  ((n.position.y = 14), e.add(n));
  for (let [e, r] of [
    [12, 0.13],
    [11.1, 0.07],
  ])
    n.add(new S(new E(e, r, 8, 128), t));
  let r = [];
  for (let e = 0; e < 64; e++) {
    let t = (e / 64) * Math.PI * 2,
      n = ((e + 0.5) / 64) * Math.PI * 2;
    if (
      (r.push(
        Math.cos(t) * 12,
        Math.sin(t) * 12,
        0,
        Math.cos(n) * 11.1,
        Math.sin(n) * 11.1,
        0,
      ),
      r.push(
        Math.cos(n) * 11.1,
        Math.sin(n) * 11.1,
        0,
        Math.cos(t + (Math.PI * 2) / 64) * 12,
        Math.sin(t + (Math.PI * 2) / 64) * 12,
        0,
      ),
      e % 2 == 0)
    )
      for (let e of [-0.5, 0.5])
        r.push(
          Math.cos(t) * 0.8,
          Math.sin(t) * 0.8,
          e,
          Math.cos(t) * 11.1,
          Math.sin(t) * 11.1,
          0,
        );
  }
  n.add(
    new u(
      new Ce().setAttribute(`position`, new l(r, 3)),
      new b({ color: 13490431, transparent: !0, opacity: 0.55 }),
    ),
  );
  let i = new S(new O(0.9, 0.9, 1.2, 20), t);
  ((i.rotation.x = Math.PI / 2), n.add(i));
  let a = new C({
      color: 14674431,
      emissive: 10469631,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.3,
    }),
    o = new ge(0.42, 0.75, 4, 10);
  o.rotateZ(Math.PI / 2);
  let s = [];
  for (let e = 0; e < 32; e++) {
    let t = (e / 32) * Math.PI * 2,
      r = new y();
    (r.position.set(Math.cos(t) * 12.75, Math.sin(t) * 12.75, 0),
      r.add(new S(o, a)));
    let i = M(12375295, 1.6, 0.55);
    ((i.material.fog = !1), r.add(i), n.add(r), s.push(r));
  }
  let c = (n, r, i) => {
      let a = new S(new O(i * 0.8, i, n.distanceTo(r), 10), t);
      (a.position.copy(n).lerp(r, 0.5),
        a.quaternion.setFromUnitVectors(
          new T(0, 1, 0),
          r.clone().sub(n).normalize(),
        ),
        e.add(a));
    },
    d = new T(0, 14, 0);
  for (let e of [-3.2, 3.2]) c(new T(9.5, 0, e), d, 0.4);
  c(new T(14, 0, 0), new T(9.5, 3.2, 0), 0.15);
  let f = new S(new w(22, 1.2, 9), new C({ color: 2764604, roughness: 0.9 }));
  (f.position.set(4, -0.4, 0), e.add(f));
  for (let t of [-8, 4, 12]) {
    let n = M(7311359, 6, 0.4);
    (n.position.set(t, 1.2, 3), e.add(n));
  }
  return { root: e, wheel: n, pods: s };
}
function vd() {
  let e = new y(),
    t = fd(3, 16, `#ffd79a`, 0.25),
    n = new C({
      color: 12100734,
      map: t,
      emissiveMap: t,
      emissive: 16765066,
      emissiveIntensity: 1.1,
      roughness: 0.8,
    }),
    r = new C({ color: 2764088, roughness: 0.7 }),
    i = new S(new w(3.4, 19.5, 3.4), n);
  i.position.y = 9.75;
  let a = new S(new w(4.3, 4.3, 4.3), n);
  a.position.y = 21.6;
  let o = new S(new w(3.7, 3, 3.7), n);
  o.position.y = 25.2;
  let s = new S(new ue(2.8, 6.5, 4), r);
  ((s.rotation.y = Math.PI / 4), (s.position.y = 30));
  let c = new S(new ue(0.35, 3.5, 8), r);
  ((c.position.y = 34.6), e.add(i, a, o, s, c));
  let l = new k({ map: pd() });
  for (let [t, n, r] of [
    [0, 2.16, 0],
    [2.16, 0, Math.PI / 2],
  ]) {
    let i = new S(new Re(1.75, 48), l);
    (i.position.set(t, 21.6, n), (i.rotation.y = r), e.add(i));
  }
  let u = M(16769184, 7, 0.45);
  u.position.set(0, 21.6, 2.4);
  let d = M(16761466, 12, 0.3);
  (d.scale.set(8, 20, 1), d.position.set(0, 9, 2.2), e.add(u, d));
  let p = new k({ color: 1708550 }),
    m = (t, n) => {
      let r = new f();
      r.position.set(0, 21.6, 2.2);
      let i = new S(new w(n, t, 0.04), p);
      return ((i.position.y = t / 2 - 0.12), r.add(i), e.add(r), r);
    },
    h = m(0.95, 0.12);
  return { root: e, minute: m(1.45, 0.08), hour: h };
}
var yd = 0.15;
function bd() {
  let e = yd,
    t = [
      [0, 0.32 * e],
      [0.57 * e, 0.32 * e],
      [0.86 * e, 0.17 * e],
      [e, 0.03 * e],
      [e, -0.03 * e],
      [0.62 * e, -0.36 * e],
      [0, -0.86 * e],
    ];
  return new _(
    t.map(([e, t]) => new me(e, t)),
    16,
  ).toNonIndexed();
}
function xd() {
  let e = sd(512, 256, (e) => {
    let t = e.createLinearGradient(0, 0, 0, 256);
    (t.addColorStop(0, `#0a0f24`),
      t.addColorStop(0.5, `#1a2340`),
      t.addColorStop(1, `#05060c`),
      (e.fillStyle = t),
      e.fillRect(0, 0, 512, 256));
    let n = (t, n, r, i) => {
      let a = e.createRadialGradient(t, n, 0, t, n, r);
      (a.addColorStop(0, i),
        a.addColorStop(1, `rgba(0,0,0,0)`),
        (e.fillStyle = a),
        e.fillRect(t - r, n - r, r * 2, r * 2));
    };
    n(256, 10, 70, `rgba(255,248,230,1)`);
    for (let e = 0; e < 26; e++)
      n(
        Math.random() * 512,
        100 + Math.random() * 60,
        6 + Math.random() * 10,
        Math.random() < 0.6 ? `rgba(255,214,150,1)` : `rgba(170,200,255,1)`,
      );
    n(120, 70, 40, `rgba(255,200,90,0.9)`);
  });
  return ((e.mapping = 303), e);
}
function Sd() {
  let e = new y(),
    t = new k({ color: 0 }),
    n = (n, r, i, a = 0, o = e) => {
      let s = new S(n, t);
      return (s.position.set(r, i, a), o.add(s), s);
    };
  for (let e of [-0.14, 0.14]) n(new O(0.09, 0.08, 0.9, 10), e, 0.45);
  (n(new O(0.3, 0.52, 1, 16), 0, 1.05), n(new O(0.3, 0.32, 0.6, 16), 0, 1.75));
  for (let e of [-0.36, 0.36]) n(new D(0.11, 10, 8), e, 2.02);
  (n(new D(0.17, 16, 12), 0, 2.24),
    n(new D(0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, 2.3).scale.set(
      1,
      1.25,
      1.1,
    ),
    n(new O(0.33, 0.33, 0.025, 20), 0, 2.31),
    n(new ue(0.035, 0.14, 8), 0, 2.62));
  let r = n(new E(0.12, 0.025, 6, 16, Math.PI), 0, 2.17, 0.15);
  r.rotation.z = Math.PI;
  let i = new y();
  (i.position.set(-0.38, 1.98, 0),
    (i.rotation.z = -0.18),
    n(new O(0.06, 0.055, 0.72, 8), 0, -0.36, 0, i),
    n(new O(0.018, 0.018, 1.3, 6), -0.05, -1.1, 0.08, i),
    e.add(i));
  let a = new y();
  (a.position.set(0.38, 1.98, 0),
    n(new O(0.06, 0.05, 0.75, 8), 0, -0.37, 0, a),
    n(new D(0.07, 10, 8), 0, -0.78, 0, a).scale.set(1, 1.4, 0.6));
  for (let e = 0; e < 4; e++) {
    let t = n(new O(0.012, 0.01, 0.16, 5), -0.045 + e * 0.03, -0.9, 0.02, a);
    t.rotation.x = 0.4;
  }
  return (
    e.add(a),
    {
      root: e,
      reach: a,
      eyes: [-0.06, 0.06].map((t) => {
        let n = M(16719904, 0.2, 0);
        return (n.position.set(t, 2.27, 0.17), e.add(n), n);
      }),
    }
  );
}
function Cd() {
  let e = new y();
  (e.position.copy(nd), (e.visible = !1));
  let t = new S(new D(70, 32, 16), new k({ map: cd(), side: 1, fog: !1 }));
  e.add(t);
  let n = [];
  for (let e = 0; e < (N ? 250 : 500); e++) {
    let e = Math.random() * Math.PI * 2,
      t = 0.15 + Math.random() * 1.2;
    n.push(
      Math.cos(e) * Math.cos(t) * 66,
      Math.sin(t) * 66,
      Math.sin(e) * Math.cos(t) * 66,
    );
  }
  e.add(
    new Ae(
      new Ce().setAttribute(`position`, new l(n, 3)),
      new m({ color: 14673663, size: 0.35, fog: !1 }),
    ),
  );
  let r = M(14477055, 7, 1);
  (r.position.set(26, 36, -52), (r.material.fog = !1));
  let i = M(9414911, 24, 0.35);
  (i.position.copy(r.position), (i.material.fog = !1), e.add(i, r));
  let a = ld(),
    c = [];
  for (let t = 0; t < 7; t++) {
    let n = new le(
      new De({
        map: a,
        color: 3159630,
        transparent: !0,
        opacity: 0.85,
        depthWrite: !1,
        fog: !1,
      }),
    );
    (n.scale.set(34, 14, 1),
      n.position.set(-50 + t * 17, 30 + Math.random() * 10, -55),
      e.add(n),
      c.push(n));
  }
  let u = new S(
    new d(140, 30),
    new C({ color: 1316639, roughness: 0.3, metalness: 0.75 }),
  );
  ((u.rotation.x = -Math.PI / 2), (u.position.z = 2));
  let f = new C({ color: 660006, roughness: 0.08, metalness: 0.9 }),
    p = new S(new d(140, 60), f);
  ((p.rotation.x = -Math.PI / 2), p.position.set(0, -0.6, -43));
  let g = new S(new w(140, 1.2, 1), new C({ color: 3817292, roughness: 0.9 }));
  (g.position.set(0, -0.3, -12.8), e.add(u, p, g));
  for (let t = 0; t < 7; t++) {
    let n = -24 + t * 8,
      r = new S(new O(0.06, 0.08, 3.2, 8), new C({ color: 1381915 }));
    r.position.set(n, 1.6, -12.2);
    let i = M(16763e3, 1.6, 0.95);
    i.position.set(n, 3.3, -12.2);
    let a = M(16758880, 1, 0.3);
    (a.scale.set(0.7, 5, 1), a.position.set(n, -0.5, -16), e.add(r, i, a));
  }
  let _ = gd();
  (_.position.set(8, 0, -40), e.add(_));
  let v = vd();
  (v.root.position.set(-20, 0, -27), e.add(v.root));
  let b = [];
  for (let t = 0; t < (N ? 10 : 18); t++) {
    let t = new le(
      new De({
        map: a,
        color: 8885944,
        transparent: !0,
        opacity: 0.28,
        depthWrite: !1,
      }),
    );
    (t.scale.set(9 + Math.random() * 7, 3.2 + Math.random() * 2, 1),
      t.position.set(
        -18 + Math.random() * 36,
        0.6 + Math.random() * 1.4,
        -9 + Math.random() * 12,
      ),
      e.add(t),
      b.push(t));
  }
  let x = new C({ color: 2764086, roughness: 0.25, metalness: 0.3 }),
    ee = new C({
      color: 14263866,
      emissive: 5913088,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.9,
    }),
    te = new S(new O(1, 1.1, 0.28, 32), x);
  te.position.y = 0.14;
  let ne = new S(new O(0.42, 0.5, 1.1, 32), x);
  ne.position.y = 0.83;
  let re = new S(new O(0.62, 0.55, 0.12, 32), x);
  re.position.y = 1.44;
  let ie = new S(
    new D(0.36, 20, 10),
    new C({ color: 6950174, roughness: 0.9 }),
  );
  (ie.scale.set(1, 0.28, 1), (ie.position.y = 1.53), e.add(te, ne, re, ie));
  for (let t of [0.3, 1.38]) {
    let n = new S(new E(t < 1 ? 0.5 : 0.45, 0.035, 8, 40), ee);
    ((n.rotation.x = Math.PI / 2), (n.position.y = t), e.add(n));
  }
  let oe = [];
  for (let [t, n] of [
    [-1.5, 1.2],
    [1.5, 1.2],
    [-1.5, -1.2],
    [1.5, -1.2],
  ]) {
    let r = new S(new O(0.04, 0.07, 0.95, 10), ee);
    r.position.set(t, 0.48, n);
    let i = new S(new D(0.07, 10, 8), ee);
    (i.position.set(t, 1, n), e.add(r, i), oe.push(new T(t, 0.92, n)));
  }
  let se = new C({ color: 9048098, roughness: 0.8 });
  for (let [t, n] of [
    [0, 1],
    [0, 2],
    [1, 3],
  ]) {
    let r = oe[t].clone().lerp(oe[n], 0.5);
    ((r.y -= 0.28),
      e.add(new S(new Le(new ae(oe[t], r, oe[n]), 16, 0.03, 6), se)));
  }
  let ce = new ye(16773590, 0, 16, 0.2, 0.5, 1.2);
  (ce.position.set(0, 9, 0),
    ce.target.position.set(0, 1.5, 0),
    e.add(ce, ce.target));
  let de = new S(
    new ue(1, 8.4, 40, 1, !0),
    new k({
      color: 16773590,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
      side: 2,
    }),
  );
  (de.position.set(0, 5.1, 0), e.add(de));
  let fe = new s(9414399, 1.4);
  (fe.position.set(20, 30, 20),
    fe.target.position.set(0, 0, -10),
    e.add(fe, fe.target, new xe(5925808, 790040, 0.7)));
  let pe = new y();
  pe.position.set(0, 1.66, 0);
  let me = xd(),
    he = N
      ? new C({
          color: 15661055,
          metalness: 1,
          roughness: 0.02,
          envMap: me,
          envMapIntensity: 2.4,
          flatShading: !0,
        })
      : new o({
          color: 16777215,
          metalness: 0,
          roughness: 0,
          transmission: 1,
          thickness: 0.25,
          ior: 2.42,
          dispersion: 6,
          envMap: me,
          envMapIntensity: 3,
          specularIntensity: 1,
          flatShading: !0,
        }),
    ge = new S(bd(), he);
  pe.add(ge);
  let _e = M(11064575, 0.8, 0);
  pe.add(_e);
  let ve = new le(
    new De({
      map: ud(),
      color: 16777215,
      transparent: !0,
      opacity: 0,
      blending: 2,
      depthWrite: !1,
    }),
  );
  (ve.scale.setScalar(0.55), pe.add(ve));
  let be = new y(),
    Se = dd();
  for (let e = 0; e < 9; e++) {
    let t = new S(
      new d(0.5, 4),
      new k({
        map: Se,
        color: 12245247,
        transparent: !0,
        opacity: 0,
        blending: 2,
        depthWrite: !1,
        side: 2,
      }),
    );
    (t.geometry.translate(0, 2, 0),
      (t.rotation.z = (e / 9) * Math.PI * 2),
      be.add(t));
  }
  ((be.position.z = -0.1), be.scale.setScalar(0.3), pe.add(be));
  let we = [],
    Te = ve.material.map;
  for (let e = 0; e < (N ? 8 : 16); e++) {
    let e = new le(
      new De({
        map: Te,
        transparent: !0,
        opacity: 0,
        blending: 2,
        depthWrite: !1,
      }),
    );
    (e.scale.setScalar(0.05 + Math.random() * 0.07),
      e.position.set(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.34,
        (Math.random() - 0.5) * 0.2,
      ),
      pe.add(e),
      we.push(e));
  }
  let Ee = (N ? [8378623] : [8378623, 16743136, 16765562]).map((e) => {
    let t = new h(e, 0, 1.6, 2);
    return (pe.add(t), t);
  });
  e.add(pe);
  let Oe = Sd();
  (Oe.root.position.set(0, 0, -1.5),
    Oe.root.scale.setScalar(1.15),
    (Oe.root.visible = !1),
    e.add(Oe.root));
  let ke = M(5206015, 6.5, 0);
  (ke.position.set(0, 2.3, -4.2), e.add(ke));
  let je = _d();
  return (
    je.root.position.set(-3, 0, -50),
    (je.root.rotation.y = 0.45),
    e.add(je.root),
    {
      root: e,
      minute: v.minute,
      hour: v.hour,
      fog: b,
      clouds: c,
      moonLight: fe,
      spot: ce,
      beam: de,
      diamond: pe,
      gem: ge,
      gemGlow: _e,
      flare: ve,
      rays: be,
      sparkles: we,
      gemLights: Ee,
      shadow: Oe.root,
      reach: Oe.reach,
      eyes: Oe.eyes,
      backlight: ke,
      water: f,
      eye: je,
    }
  );
}
var wd = [
    `<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#de2910"/><polygon points="5.00,2.00 5.67,4.07 7.85,4.07 6.09,5.35 6.76,7.43 5.00,6.15 3.24,7.43 3.91,5.35 2.15,4.07 4.33,4.07" fill="#ffde00"/><polygon points="10.00,1.00 10.22,1.69 10.95,1.69 10.36,2.12 10.59,2.81 10.00,2.38 9.41,2.81 9.64,2.12 9.05,1.69 9.78,1.69" fill="#ffde00"/><polygon points="12.00,3.00 12.22,3.69 12.95,3.69 12.36,4.12 12.59,4.81 12.00,4.38 11.41,4.81 11.64,4.12 11.05,3.69 11.78,3.69" fill="#ffde00"/><polygon points="12.00,6.00 12.22,6.69 12.95,6.69 12.36,7.12 12.59,7.81 12.00,7.38 11.41,7.81 11.64,7.12 11.05,6.69 11.78,6.69" fill="#ffde00"/><polygon points="10.00,8.00 10.22,8.69 10.95,8.69 10.36,9.12 10.59,9.81 10.00,9.38 9.41,9.81 9.64,9.12 9.05,8.69 9.78,8.69" fill="#ffde00"/></svg>`,
    `<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#0039a6"/><rect y="13.33" width="30" height="6.67" fill="#d52b1e"/></svg>`,
    `<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce2b37"/></svg>`,
    `<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#024fa2"/><rect y="4" width="30" height="12" fill="#fff"/><rect y="5" width="30" height="10" fill="#ed1c27"/><circle cx="10" cy="10" r="3.6" fill="#fff"/><polygon points="10,7 10.9,9.3 13.3,9.3 11.4,10.8 12.1,13.1 10,11.7 7.9,13.1 8.6,10.8 6.7,9.3 9.1,9.3" fill="#ed1c27"/></svg>`,
  ],
  Td = class {
    constructor(t) {
      (e(this, `d`, void 0),
        e(this, `t`, 0),
        e(this, `done`, !1),
        e(this, `night`, Cd()),
        e(this, `portal`, new y()),
        e(this, `wheel`, pu()),
        e(this, `vortex`, void 0),
        e(this, `rim`, void 0),
        e(this, `rimGlow`, void 0),
        e(this, `tunnel`, void 0),
        e(this, `bolts`, []),
        e(this, `beats`, new Set()),
        e(this, `fogWas`, void 0),
        e(this, `shot`, -1),
        e(this, `flash`, 0),
        e(this, `toward`, void 0),
        e(this, `bossX`, void 0),
        e(this, `pos`, new T()),
        e(this, `look`, new T()),
        e(this, `v`, new T()),
        e(this, `w`, new T()),
        (this.d = t));
      let { scene: n, player: r, boss: i } = t,
        a = i.x >= r.x ? 1 : -1;
      ((this.bossX = a * 0.8), (this.toward = -a));
      for (let e of [r, i])
        ((e.attack = null), (e.vx = 0), (e.vy = 0), (e.y = 0));
      ((r.x = -a * 0.8),
        (i.x = this.bossX),
        (r.facing = a),
        (i.facing = this.toward),
        r.forceState(`idle`),
        (i.hp = Math.max(1, i.hp)),
        i.forceState(`frozen`),
        n.add(this.night.root));
      let o = n.fog;
      ((this.fogWas = o
        ? { color: o.color.clone(), near: o.near, far: o.far }
        : null),
        this.wheel.root.scale.setScalar(0.001),
        (this.wheel.root.visible = !1),
        n.add(this.wheel.root),
        (this.vortex = new S(
          new Re(2, 64),
          new k({
            map: md(),
            transparent: !0,
            opacity: 0,
            blending: 2,
            depthWrite: !1,
            fog: !1,
          }),
        )),
        (this.rim = new S(
          new E(2.2, 0.05, 10, 96),
          new k({ color: 16773304, transparent: !0, opacity: 0, fog: !1 }),
        )),
        (this.rimGlow = M(16760906, 9, 0)),
        this.portal.add(this.vortex, this.rim, this.rimGlow),
        this.portal.position.set(0, 3.2, -3.4),
        this.portal.scale.setScalar(0.001),
        n.add(this.portal),
        (this.tunnel = new S(
          new O(2.3, 2.3, 14, 40, 1, !0),
          new k({ map: hd(), side: 1, fog: !1 }),
        )),
        (this.tunnel.rotation.x = Math.PI / 2),
        this.tunnel.position.set(0, 3.2, -10.6));
      let s = new S(
        new Re(2.35, 48),
        new k({ color: 16773570, fog: !1, toneMapped: !1 }),
      );
      ((s.rotation.x = -Math.PI / 2), (s.position.y = -6.95));
      let c = M(16771496, 5, 0.9);
      ((c.position.y = -6.5),
        this.tunnel.add(s, c),
        (this.tunnel.visible = !1),
        n.add(this.tunnel));
      let l = new b({ color: 16773824, transparent: !0, fog: !1 });
      for (let e = 0; e < 4; e++) {
        let e = new v(new Ce(), l.clone());
        ((e.visible = !1), this.portal.add(e), this.bolts.push(e));
      }
      (t.hud.clearSay(),
        t.hud.clearPopups(),
        t.hud.show(!1),
        t.hud.cinema(!0, !0),
        t.hud.setVignette(!0),
        t.hud.cinemaFade(1),
        t.arena.setLeader(null, 0),
        t.arena.setBoredom(0),
        t.audio.silenceMusic(!0),
        t.audio.startDrone());
    }
    once(e, t, n) {
      this.t >= t && !this.beats.has(e) && (this.beats.add(e), n());
    }
    skip() {
      ((this.t = this.t < K.TITLE ? K.TITLE : K.END),
        this.d.audio.stopCharkha(0.25));
    }
    bossClip(e) {
      let t = this.t;
      return t < K.SIT
        ? { name: `bow`, time: Math.min(2.6, 0.2 + t * 0.6), fade: 0.4 }
        : t < K.SIT + 0.8
          ? { name: `standsit`, time: ((t - K.SIT) / 0.8) * 1.15, fade: 0.3 }
          : { name: `lotus`, time: e, loop: !0, fade: 0.75 };
    }
    playerPose(e, t) {
      let n = this.t,
        r = F(V(e, t), {
          hipsT: 0,
          spineT: 0,
          spineF: 0.08,
          headF: 0.12,
          ...Qi,
        });
      return n < K.SIT
        ? n < 0.6
          ? V(e, t)
          : r
        : I(r, od(e, t), z(L((n - K.SIT) / 0.8)));
    }
    lightning(e = 1) {
      ((this.flash = e),
        this.d.hud.flash(`rgba(190,210,255,${0.5 * e})`, 150),
        this.d.audio.thunder());
    }
    step(e) {
      this.t += e;
      let t = this.t,
        n = t >= K.LONDON;
      (this.story(),
        this.stepStage(t, e),
        this.stepNight(t, e, n),
        this.stepCamera(t),
        t >= K.END && (this.done = !0));
    }
    story() {
      let e = this.d;
      (this.once(`fadein`, 0, () => e.hud.cinemaFade(0, 900)),
        this.once(`bless`, K.TALK + 0.15, () => e.audio.playClip(kn, jn)),
        this.once(`wheel`, ad, () => e.audio.charkha()));
      for (let [t, n] of [
        K.WHEEL + 0.5,
        K.WHEEL + 1.3,
        K.WHEEL + 1.95,
        K.WHEEL + 2.45,
      ].entries())
        this.once(`beat${t}`, n, () => e.audio.heartbeat(0.7 + t * 0.12));
      (this.once(`tear`, K.OPEN + 0.05, () => {
        (e.audio.boom(),
          e.audio.thunder(),
          e.cam.shake(0.35, 1.2),
          e.hud.flash(`rgba(170,200,255,0.7)`, 220),
          e.audio.setDrone(1, 0.5));
      }),
        this.once(`rumble`, K.OPEN + 1.3, () => e.audio.thunder()),
        this.once(`whoosh`, K.FLY + 0.1, () => {
          (e.audio.whoosh(), e.audio.eyeZing());
        }),
        this.once(`white`, K.FLY + 1.05, () =>
          e.hud.flash(`rgba(255,255,255,1)`, 500),
        ),
        this.once(`city`, K.LONDON, () => e.audio.setDrone(0.6, 1.5)),
        this.once(`strike1`, K.LONDON + 1, () => this.lightning(1)),
        this.once(`bong1`, K.CLOCK + 0.55, () => {
          (e.audio.bell(1), e.cam.shake(0.05, 0.6));
        }),
        this.once(`bong2`, K.CLOCK + 1.6, () => e.audio.bell(0.8)),
        this.once(`clunk`, K.PEDESTAL + 0.6, () => {
          (e.audio.thud(), e.audio.boom());
        }),
        this.once(`glint`, K.PEDESTAL + 2, () => e.audio.shimmer(1)));
      for (let [t, n] of [
        K.SHADOW + 0.2,
        K.SHADOW + 0.9,
        K.SHADOW + 1.5,
        K.SHADOW + 2,
        K.SHADOW + 2.45,
      ].entries())
        this.once(`hb${t}`, n, () => e.audio.heartbeat(0.8 + t * 0.08));
      (this.once(`eyes`, K.SHADOW + 1.1, () => e.audio.eyeZing()),
        this.once(`strike2`, K.SHADOW + 2.4, () => this.lightning(1.3)));
      for (let [t, n] of [
        K.CLOSE + 0.2,
        K.CLOSE + 0.55,
        K.CLOSE + 0.85,
        K.CLOSE + 1.1,
      ].entries())
        this.once(`hf${t}`, n, () => e.audio.heartbeat(1));
      (this.once(`cut`, K.TITLE - 0.1, () => {
        (e.audio.boom(),
          e.audio.shimmer(1.2),
          e.hud.flash(`rgba(255,255,255,1)`, 600),
          e.audio.setDrone(0.45, 2));
      }),
        this.once(`title`, K.TITLE + 0.5, () => {
          (e.hud.cinemaTitle(`COMING SOON`, `CHAPTER 2`), e.audio.boom());
        }),
        this.once(`stamps`, K.TITLE + 1.6, () => e.hud.cinemaStamps(wd)));
      for (let t = 0; t < wd.length; t++)
        this.once(`stamp${t}`, K.TITLE + 1.75 + t * 0.32, () =>
          e.audio.stampSlam(),
        );
      this.once(`out`, K.END - 1.4, () => {
        (e.hud.cinemaFade(1, 1200), e.audio.stopDrone(1.3));
      });
    }
    stepStage(e, t) {
      let n = this.d,
        r = e >= K.WHEEL && e < K.LONDON;
      n.arena.setMood(e < K.LONDON ? 0.45 + 0.35 * L(e / 2) : 1);
      let i = this.wheel;
      if (
        ((i.root.visible = r),
        (this.portal.visible = r),
        (this.tunnel.visible = e >= K.FLY && e < K.LONDON),
        !r)
      )
        return;
      let a = R(L((e - K.WHEEL) / 1.2)),
        o = z(L((e - K.OPEN) / 1));
      if (
        (this.v.set(0, 0.2 + 1.1 * a, 0.55),
        this.w.set(0, 3.2, -3.35),
        i.root.position.lerpVectors(this.v, this.w, o),
        i.root.scale.setScalar(Math.max(0.001, 0.2 * a + (1.6 - 0.2) * o)),
        (i.wheel.rotation.z -= t * (3 + 9 * L((e - K.WHEEL) / 2.4) + 5 * o)),
        (i.blur.material.opacity = 0.32 * a + 0.18 * o),
        (i.glow.material.opacity = 0.55 * a * (1 - 0.4 * o)),
        (i.light.intensity = 5 * a + 4 * o),
        a > 0.2 && Math.random() < (N ? 0.4 : 0.8))
      ) {
        let e = Math.random() * Math.PI * 2,
          t = 2 * i.root.scale.x;
        (this.v.set(
          i.root.position.x + Math.cos(e) * t,
          i.root.position.y + Math.sin(e) * t,
          i.root.position.z,
        ),
          n.fx.particles.emit(this.v, {
            count: 1,
            speed: 1.2,
            color: 16765803,
            life: 0.9,
            size: 0.07,
            gravity: -0.6,
            drag: 1.2,
          }));
      }
      let s = R(L((e - K.OPEN - 0.4) / 1));
      this.portal.scale.setScalar(
        Math.max(0.001, 1.45 * s * (1 + Math.sin(e * 9) * 0.015)),
      );
      let c = this.vortex.material;
      if (
        ((c.opacity = 0.85 * s),
        (this.vortex.rotation.z -= t * 1.6),
        (this.rim.material.opacity = 0.8 * s),
        (this.rimGlow.material.opacity = 0.35 * s),
        s > 0.1)
      ) {
        for (let e = 0; e < (N ? 2 : 5); e++) {
          let e = Math.random() * Math.PI * 2,
            t = 3.4 + Math.random() * 2.4;
          (this.v.set(Math.cos(e) * t, 3.2 + Math.sin(e) * t, -3.2),
            this.w.set(-Math.cos(e), -Math.sin(e), 0),
            n.fx.particles.emit(this.v, {
              count: 1,
              speed: 3.6,
              color: Math.random() < 0.5 ? 16765803 : 16774352,
              life: 0.6,
              size: 0.07,
              drag: 0.3,
              dir: this.w,
              spread: 0.15,
            }));
        }
        for (let e of this.bolts) {
          let n = e.material;
          if (Math.random() < 0.12) {
            let t = Math.random() * Math.PI * 2,
              r = t + (Math.random() - 0.5) * 2.5,
              i = [];
            for (let e = 0; e <= 8; e++) {
              let n = e / 8,
                a = t + (r - t) * n,
                o =
                  2.05 * (1 - Math.sin(n * Math.PI) * 0.45) +
                  (Math.random() - 0.5) * 0.25;
              i.push(new T(Math.cos(a) * o, Math.sin(a) * o, 0.05));
            }
            (e.geometry.dispose(),
              (e.geometry = new Ce().setFromPoints(i)),
              (n.opacity = 1));
          }
          ((n.opacity = Math.max(0, n.opacity - t * 7)),
            (e.visible = n.opacity > 0.02));
        }
      }
      if (this.tunnel.visible) {
        let e = this.tunnel.material.map;
        ((e.offset.y += t * 3.5), (e.offset.x += t * 0.25));
      }
    }
    stepNight(e, t, n) {
      let r = this.d,
        i = this.night;
      if (i.root.visible !== n) {
        i.root.visible = n;
        let e = r.scene.fog;
        e &&
          this.fogWas &&
          (n
            ? (e.color.setHex(rd), (e.near = 10), (e.far = 85))
            : (e.color.copy(this.fogWas.color),
              (e.near = this.fogWas.near),
              (e.far = this.fogWas.far)));
      }
      if (!n) return;
      i.eye.wheel.rotation.z += t * 0.04;
      for (let e of i.eye.pods) e.rotation.z = -i.eye.wheel.rotation.z;
      let a = r.cam.camera.position;
      for (let e of i.fog)
        ((e.position.x += t * 0.35),
          e.position.x > 20 && (e.position.x = -20),
          e.getWorldPosition(this.w),
          (e.material.opacity = 0.28 * L((this.w.distanceTo(a) - 4) / 6)));
      for (let e of i.clouds) e.position.x += t * 0.6;
      ((this.flash = Math.max(0, this.flash - t * 3)),
        (i.moonLight.intensity = 1.4 + this.flash * 3));
      let o = e >= K.CLOCK + 0.45 ? 0 : -Math.PI / 30;
      ((i.minute.rotation.z = o), (i.hour.rotation.z = -Math.PI / 360));
      let s = e >= K.PEDESTAL + 0.6,
        c = e < K.PEDESTAL + 0.85 && Math.sin(e * 70) > 0 ? 0.3 : 1,
        l = e >= K.TITLE;
      ((i.spot.intensity = s ? 32 * c * (l ? 0.4 : 1) : 0),
        (i.beam.material.opacity = s ? 0.06 * c * !l : 0));
      let u = z(L((e - (K.PEDESTAL + 0.9)) / 1.5)),
        d = i.diamond;
      ((d.position.y = 1.7 + 0.26 * u + Math.sin(e * 1.6) * 0.012 * u),
        (d.visible = e >= K.PEDESTAL),
        (i.gem.rotation.y += t * (0.5 + 0.6 * u)));
      let f = u * (1 + 0.15 * Math.sin(e * 5));
      i.gemGlow.material.opacity = 0.2 * f;
      let p = Math.max(0, Math.sin(e * 2.3)) ** 12;
      ((i.flare.material.opacity =
        u * (0.12 + 0.6 * p) + +(e > K.TITLE - 0.4 && e < K.TITLE + 0.3)),
        (i.flare.material.rotation = e * 0.3),
        (i.rays.rotation.z += t * 0.25),
        i.rays.children.forEach((t, n) => {
          t.material.opacity = u * (0.06 + 0.05 * Math.sin(e * 1.7 + n * 1.3));
        }),
        i.sparkles.forEach((t, n) => {
          t.material.opacity =
            u * Math.max(0, Math.sin(e * (3 + (n % 5)) + n * 2.1)) ** 6;
        }),
        i.gemLights.forEach((t, n) => {
          let r = e * 1.4 + (n * Math.PI * 2) / i.gemLights.length;
          (t.position.set(
            Math.cos(r) * 0.45,
            0.15 + Math.sin(r * 0.7) * 0.15,
            Math.sin(r) * 0.45,
          ),
            (t.intensity = 2 * u));
        }),
        i.rays.quaternion.copy(r.cam.camera.quaternion));
      let m = e >= K.SHADOW && !l;
      i.shadow.visible = m;
      let h = R(L((e - (K.SHADOW + 0.3)) / 0.9)) * +!l;
      i.backlight.material.opacity = Math.min(0.7, 0.42 * h + this.flash * 0.5);
      let g =
        L((e - (K.SHADOW + 1.1)) / 0.25) * (0.85 + 0.15 * Math.sin(e * 13));
      for (let e of i.eyes) e.material.opacity = m ? g : 0;
      let _ = z(L((e - (K.SHADOW + 1.4)) / 0.9));
      ((i.reach.rotation.x = -1.45 * _), (i.reach.rotation.z = 0.15 * _));
      let v = e >= K.SHADOW + 1.6 ? Math.abs(Math.sin(e * 9)) * 0.03 : 0;
      i.shadow.position.y = v;
    }
    stepCamera(e) {
      let t = this.d,
        { pos: n, look: r } = this,
        i = this.bossX,
        a = this.toward,
        o,
        s,
        c = (e, t, n) => this.v.set(nd.x + e, nd.y + t, nd.z + n),
        l = this.night;
      if (e < K.TALK) {
        o = 0;
        let t = L(e / K.TALK);
        (n.set(0, 1.45, 4.8 - 0.4 * t), r.set(0, 1.15, 0), (s = 38));
      } else if (e < K.SIT) {
        o = 1;
        let t = L((e - K.TALK) / (K.SIT - K.TALK));
        (n.set(i + a * 1.45, 1.55, 1.7 - 0.25 * t), r.set(i, 1.5, 0), (s = 30));
      } else if (e < K.OPEN) {
        o = 2;
        let t = L((e - K.SIT) / (K.OPEN - K.SIT));
        (n.set(0, 0.55 + 0.35 * t, 3.4 - 0.4 * t),
          r.set(0, 0.85 + 0.35 * t, 0),
          (s = 42));
      } else if (e < K.FLY) {
        o = 3;
        let t = z(L((e - K.OPEN) / (K.FLY - K.OPEN)));
        (n.set(Math.sin(e * 0.4) * 0.6, 1.4 + 0.5 * t, 10.5 - 2 * t),
          r.set(0, 2.5 + 0.4 * t, -2.5),
          (s = 52));
      } else if (e < K.LONDON) {
        o = 4;
        let t = L((e - K.FLY) / (K.LONDON - K.FLY)),
          i = 7.5 - 22 * t * t;
        (n.set(0, 3.2, i), r.set(0, 3.2, i - 10), (s = 55 + 35 * t));
      } else if (e < K.CLOCK) {
        o = 5;
        let t = z(L((e - K.LONDON) / (K.CLOCK - K.LONDON)));
        (n.copy(c(1.5 - t, 4.6 - 0.8 * t, 5 - 5 * t)),
          r.copy(c(-4.5, 10.5, -30)),
          (s = 54));
      } else if (e < K.PEDESTAL) {
        o = 6;
        let t = L((e - K.CLOCK) / (K.PEDESTAL - K.CLOCK));
        (n.copy(c(-15.5 + t, 18.6 + 0.4 * t, -15)),
          r.copy(c(-20, 21.6, -24.8)),
          (s = 28 - 3 * t));
      } else if (e < K.SHADOW) {
        o = 7;
        let t = R(L((e - K.PEDESTAL) / (K.SHADOW - K.PEDESTAL)));
        (n.copy(c(0, 0.45 + 0.45 * t, 7 - 3.2 * t)),
          r.copy(c(0, 1.5 + 0.4 * t, 0)),
          (s = 40));
      } else if (e < K.CLOSE) {
        o = 8;
        let t = z(L((e - K.SHADOW) / (K.CLOSE - K.SHADOW)));
        (n.copy(c(0.25 - 0.25 * t, 2.05, 3.9 - 0.9 * t)),
          r.copy(c(0, 2.15 + 0.1 * t, -1.2)),
          (s = 40));
      } else if (e < K.TITLE) {
        o = 9;
        let t = (e - K.CLOSE) * 0.45,
          i = l.diamond.position;
        (n.copy(c(Math.sin(t) * 0.5, i.y + 0.06, Math.cos(t) * 0.5)),
          r.copy(c(0, i.y, 0)),
          (s = 30));
      } else {
        o = 10;
        let t = l.diamond.position,
          i = L((e - K.TITLE) / (K.END - K.TITLE));
        (n.copy(c(0, t.y + 0.06, 1.3 - 0.12 * i)),
          r.copy(c(0, t.y - 0.13, 0)),
          (s = 32));
      }
      (t.cam.set(n, r, 30, s),
        o !== this.shot && ((this.shot = o), t.cam.snap(!0)));
    }
    dispose() {
      let e = this.d;
      (e.audio.stopDrone(0.3),
        e.audio.stopLoop(0.3),
        e.audio.stopCharkha(0.3),
        e.audio.silenceMusic(!1));
      let t = e.scene.fog;
      t &&
        this.fogWas &&
        (t.color.copy(this.fogWas.color),
        (t.near = this.fogWas.near),
        (t.far = this.fogWas.far));
      for (let t of [
        this.night.root,
        this.wheel.root,
        this.portal,
        this.tunnel,
      ])
        (e.scene.remove(t),
          t.traverse((e) => {
            let t = e;
            t.geometry?.dispose();
            let n = t.material;
            for (let e of n ? (Array.isArray(n) ? n : [n]) : []) {
              let t = e.map;
              (t && t !== lt() && !t.userData.shared && t.dispose(),
                e.dispose());
            }
          }));
      (e.hud.cinemaStamps(null),
        e.hud.cinemaFade(0),
        e.hud.cinema(!1),
        e.hud.setVignette(!1),
        e.arena.setMood(0));
    }
  },
  Ed = (e, t = 0.85) => new C({ color: e, roughness: t });
function Dd() {
  let e = new y(),
    t = Ed(9067058),
    n = Ed(2829099, 0.7),
    r = (t, n, r, i, a, o, s) => {
      let c = new S(new w(t, n, r), i);
      return (c.position.set(a, o, s), (c.castShadow = !0), e.add(c), c);
    };
  r(1, 0.1, 1.7, t, 0, 0.72, 0);
  for (let e of [-0.48, 0.48]) r(0.05, 0.16, 1.7, t, e, 0.84, 0);
  for (let e of [-0.83, 0.83]) r(1, 0.16, 0.05, t, 0, 0.84, e);
  for (let e of [-0.35, 0.35]) r(0.05, 0.05, 0.75, t, e, 0.86, -1.15);
  r(0.75, 0.05, 0.05, t, 0, 0.86, -1.5);
  let i = [];
  for (let t of [-0.56, 0.56]) {
    let r = new S(new E(0.33, 0.035, 6, 20), n);
    ((r.rotation.y = Math.PI / 2), r.position.set(t, 0.35, -0.2));
    let a = new S(new O(0.01, 0.01, 0.64, 4), n);
    r.add(a);
    let o = a.clone();
    ((o.rotation.z = Math.PI / 2), r.add(o), e.add(r), i.push(r));
  }
  let a = new S(new O(0.14, 0.14, 0.08, 12), n);
  ((a.rotation.z = Math.PI / 2),
    a.position.set(0, 0.14, 0.7),
    e.add(a),
    i.push(a),
    r(0.04, 0.5, 0.04, t, 0, 0.45, 0.7));
  let o = new be(new D(0.075, 8, 6), Ed(14267258, 0.9), 70),
    s = new be(new D(0.07, 8, 6), Ed(10106192, 0.55), 55),
    c = new g(),
    l = new ie(),
    u = new T(),
    d = new T(),
    f = (t, n, r, i, a, o) => {
      for (let e = 0; e < n; e++) {
        let n = Math.random(),
          s = Math.random(),
          f = (n - 0.5) * 0.85,
          p = r * (0.08 + s * 0.7),
          m = 1 - Math.min(1, (f * f) / 0.2 + (Math.abs(p) - 0.4) ** 2 / 0.25);
        (d.set(f, 0.84 + Math.max(0, m) * 0.22 + Math.random() * 0.05, p),
          l.setFromEuler(new ze(Math.random() * 3, Math.random() * 3, 0)),
          u.set(i, a, o),
          t.setMatrixAt(e, c.compose(d, l, u)));
      }
      ((t.castShadow = !0), e.add(t));
    };
  return (
    f(o, 70, 1, 1.25, 0.85, 0.9),
    f(s, 55, -1, 1, 0.92, 1),
    r(0.02, 0.4, 0.02, n, 0.3, 1.1, -0.6),
    r(0.22, 0.02, 0.22, Ed(11908533, 0.4), 0.3, 0.9, -0.6),
    { root: e, wheels: i }
  );
}
function Od() {
  let e = new y(),
    t = Ed(10118466, 0.7),
    n = Ed(15921126),
    r = Ed(3829416, 0.9),
    i = Ed(2760988),
    a = (t, n, r, i, a, o = e) => {
      let s = new S(t, n);
      return (s.position.set(r, i, a), (s.castShadow = !0), o.add(s), s);
    },
    o = new y();
  (o.position.set(0, 0.95, 0),
    (o.rotation.x = 0.35),
    e.add(o),
    a(new ge(0.17, 0.42, 4, 10), n, 0, 0.3, 0, o));
  let s = new y();
  (s.position.set(0, 0.8, 0),
    o.add(s),
    a(new D(0.13, 14, 10), t, 0, 0, 0, s),
    a(
      new D(0.135, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.2),
      i,
      0,
      0.02,
      -0.01,
      s,
    ),
    a(new w(0.12, 0.02, 0.02), i, 0, -0.04, 0.12, s),
    (a(new w(0.36, 0.06, 0.08), Ed(12728874), 0, 0.58, 0.02, o).rotation.z =
      0.5));
  for (let e of [-0.2, 0.2]) {
    let n = a(new ge(0.05, 0.5, 4, 8), t, e, 0.5, 0.25, o);
    n.rotation.x = 1.2;
  }
  return (
    a(new O(0.2, 0.24, 0.45, 12), r, 0, 0.72, 0),
    {
      root: e,
      legs: [-0.09, 0.09].map((n) => {
        let r = new y();
        return (
          r.position.set(n, 0.55, 0),
          e.add(r),
          a(new ge(0.055, 0.42, 4, 8), t, 0, -0.27, 0, r),
          a(new w(0.1, 0.05, 0.22), i, 0, -0.53, 0.05, r),
          r
        );
      }),
      head: s,
    }
  );
}
var kd = class t {
  constructor(t, n, r, i = 1.25) {
    (e(this, `scene`, void 0),
      e(this, `root`, new y()),
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
      (this.cart = Dd()),
      (this.vendor = Od()),
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
(e(kd, `SPEED`, 2.4), e(kd, `SHOUT_PAUSE`, 1.4));
var Ad = 30;
function jd(e, t, n) {
  if ((e.update(n, t.x), (e.wantsSuper = !1), e.y > 1 || t.y > 1)) return;
  let r = e.x - t.x;
  if (Math.abs(r) >= 0.72) return;
  let i = r === 0 ? -e.facing : Math.sign(r);
  e.x = Math.max(-j, Math.min(j, t.x + i * Je));
}
var Md = class {
    constructor() {
      e(this, `frames`, []);
    }
    record(e, t, n) {
      (this.frames.push({ seq: e, bits: t, paused: n }),
        this.frames.length > Ad && this.frames.shift());
    }
    confirm(e) {
      for (; this.frames.length && this.frames[0].seq <= e;)
        this.frames.shift();
    }
    replay(e, t) {
      let n = 0;
      for (let r of this.frames)
        r.paused ? (n |= r.bits & 240) : (jd(e, t, xu(r.bits | n)), (n = 0));
    }
    clear() {
      this.frames = [];
    }
    get size() {
      return this.frames.length;
    }
  },
  Nd = 7.8,
  Pd = 10.4,
  Fd = new Set([
    `kick`,
    `finisher`,
    `special2`,
    `sweep`,
    `roundhouse`,
    `airKick`,
  ]),
  Id = {
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
  Ld = 0.55,
  Rd = 12,
  zd = 3,
  Bd = class {
    constructor(t, n) {
      (e(this, `ctx`, void 0),
        e(this, `fighters`, void 0),
        e(this, `rigs`, void 0),
        e(this, `match`, new Yu()),
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
        e(this, `bomb`, null),
        e(this, `bombDodge`, !1),
        e(this, `diwali`, null),
        e(this, `mithai`, null),
        e(this, `mithaiAt`, 0),
        e(this, `budget`, 0),
        e(this, `budgetUsed`, !1),
        e(this, `cowAt`, -1),
        e(this, `calm`, 0),
        e(this, `boredFired`, !1),
        e(this, `tauntFired`, !1),
        e(this, `lastLeader`, null),
        e(this, `rng`, Math.random),
        e(this, `entrance`, null),
        e(this, `portal`, null),
        e(this, `portalVideo`, !1),
        e(this, `handover`, null),
        e(this, `chaiwalaLeft`, !1),
        e(this, `finale`, void 0),
        e(this, `hardBoss`, void 0),
        e(this, `bossCalm`, 0),
        e(this, `bossIntro`, void 0),
        e(this, `bossSeconds`, 0),
        e(this, `bossHpSeen`, 0),
        e(this, `roundDamage`, 0),
        e(this, `bestDamage`, 0),
        e(this, `paused`, !1),
        e(this, `net`, void 0),
        e(this, `isGuest`, void 0),
        e(this, `remoteInput`, new wu()),
        e(this, `snapSeq`, 0),
        e(this, `lastSnapIn`, -1),
        e(this, `inputSeq`, 0),
        e(this, `recentInputs`, []),
        e(this, `hostDelay`, new Eu()),
        e(this, `ownMoves`, new Md()),
        e(this, `whooshFrom`, 0),
        e(this, `predicting`, !0),
        e(this, `smooth`, [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ]),
        e(this, `onMatchEnd`, null),
        e(this, `onMatchDecided`, null),
        e(this, `onPortal`, null),
        (this.ctx = t),
        (this.net = n.net ?? null),
        (this.isGuest = this.net?.role === `guest`),
        (this.playerSide = +!!this.isGuest));
      let r = P[n.player],
        i =
          P[n.opponent && n.opponent !== n.player ? n.opponent : Ci(n.player)],
        a = this.isGuest ? [i, r] : [r, i];
      (zo(a[0].id, a[1].id),
        (this.finale = !!n.bossEntrance),
        t.audio.preloadFighters([a[0].id, a[1].id]),
        (this.fighters = [new Fo(0, a[0], -tt / 2), new Fo(1, a[1], tt / 2)]),
        (this.hardBoss = n.difficulty === `hard`));
      for (let e of this.fighters)
        ((e.boss =
          e.char.id === `mbapu` && !this.net && e.side !== this.playerSide),
          e.boss &&
            this.hardBoss &&
            ((e.hpScale = go.hp),
            (e.power = go.power),
            (e.superShare = go.super)),
          (e.hp = e.maxHp));
      ((this.rigs = [el(a[0]), el(a[1])]),
        this.rigs.forEach((e, n) => {
          let r = t.faceTextures[this.fighters[n].char.id];
          (r && e.setFacePhoto(r), t.scene.add(e.root));
        }),
        (this.bot = new qu(n.difficulty, n.rng)),
        t.hud.setup(
          a,
          [t.portraits[a[0].id], t.portraits[a[1].id]],
          this.playerSide,
          this.net ? `FRIEND` : `CPU`,
          this.bossSide,
        ),
        t.hud.show(!0),
        t.news.reset(),
        (this.chaiwala =
          n.handover?.chaiwala ?? new ms(t.scene, this.rng, Ft(t.arena.stage))),
        Ft(t.arena.stage) && (this.diwali = new Vt(t.scene, t.audio)),
        (this.time = n.handover?.time ?? 0),
        (this.handover = n.handover ?? null),
        (this.bossIntro = !!this.boss && !n.handover),
        this.startRound(!n.handover));
    }
    dispose() {
      for (let e of this.rigs) (this.ctx.scene.remove(e.root), e.dispose?.());
      (this.chaiwalaLeft || this.chaiwala.dispose(),
        this.grapple?.dispose(),
        (this.grapple = null),
        this.bomb?.dispose(),
        this.cow?.dispose(),
        (this.cow = null),
        this.ctx.audio.stopLoop(0.4),
        this.ctx.arena.setLeader(null, 0),
        this.ctx.arena.setBoredom(0),
        this.ctx.audio.stopClip(400),
        this.ctx.audio.silenceMusic(!1),
        this.ctx.hud.cinema(!1),
        this.ctx.hud.stopPortalVideo(),
        this.entrance?.dispose(),
        (this.entrance = null),
        this.portal?.dispose(),
        (this.portal = null),
        this.diwali?.dispose(),
        this.mithai?.dispose(),
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
        this.bomb?.dispose(),
        (this.bomb = null),
        this.ctx.audio.stopLoop(0.4));
      let r = !!this.diwali && !this.net;
      ((this.cowAt = r
        ? 60 - (7 + this.rng() * 8)
        : this.rng() < Ld
          ? 60 - (12 + this.rng() * 22)
          : -1),
        this.mithai?.dispose(),
        (this.mithai = null),
        (this.mithaiAt = this.time + 10 + this.rng() * 8),
        (this.budget = 0),
        (this.budgetUsed = !1),
        this.boss && !this.net && (va(), this.ctx.hud.preparePortalVideo()),
        this.ctx.audio.stopClip(1200),
        (this.roundDamage = 0),
        (this.bossHpSeen = this.boss?.hp ?? 0),
        (this.bossCalm = 0),
        this.ctx.input.clearEdges(),
        this.rigs.forEach((e, t) => {
          let n = this.fighters[t];
          (e.setTransform(n.x, 0, n.facing, 0),
            e.snapTo(V(this.handover ? this.time : 0, n.char.id)));
        }),
        (this.handover = null),
        e
          ? (t.forceState(`intro`),
            n.forceState(`intro`),
            this.setPhase(`intro`),
            this.bossIntro && this.beginBossIntro())
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
        this.phase === `entrance` && this.entrance?.step(e, this.time),
        this.phase === `portal` && this.portal?.step(e),
        this.boss && !this.net
          ? this.ctx.hud.setBudget(
              this.budgetUsed ? 0 : this.budget,
              this.phase === `fight` && !this.budgetUsed,
            )
          : this.ctx.hud.setBudget(0, !1),
        this.ctx.hud.setSuperView(this.phase === `super`),
        this.diwali?.update(e));
      let t = e * this.timeScale;
      this.acc += t;
      let n = 0;
      for (; this.acc >= 0.016666666666666666 && n < 5;)
        ((this.acc -= qe), this.step(), n++);
      (n >= 5 && (this.acc = 0),
        this.net?.role === `host` && n > 0 && this.sendSnapshot(),
        this.updateVisuals(e, t));
    }
    runPhase() {
      let { hud: e, audio: t } = this.ctx,
        [n, r] = this.fighters;
      switch (this.phase) {
        case `intro`:
          if (this.bossIntro) {
            (this.stepBossIntro(),
              this.phaseTime > this.introLength &&
                (n.forceState(`idle`),
                r.forceState(`idle`),
                this.setPhase(`roundCall`)));
            break;
          }
          (this.cue(`a`, 0.5, () =>
            this.speech(
              0,
              this.diwali
                ? It(n.char.id, `intro`, n.char.introLine)
                : n.char.introLine,
            ),
          ),
            this.cue(`b`, this.introLength / 2 + 0.1, () =>
              this.speech(
                1,
                this.diwali
                  ? It(r.char.id, `intro`, r.char.introLine)
                  : r.char.introLine,
              ),
            ),
            this.cue(`paparazzi`, 0.3, () => {
              (n.char.danceIntro || r.char.danceIntro) &&
                (this.ctx.arena.paparazzi(10), t.cameraClicks(8));
            }),
            !this.isGuest &&
              this.phaseTime > this.introLength &&
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
                    t.announce(`double_ko`),
                    this.diwali?.knockout(0, !1))
                  : (e.say(`GHEE KHATAM!`, `ko`, 1600),
                    t.announce(`ko`),
                    this.diwali?.knockout(
                      (n.hp <= 0 ? n : r).x,
                      (n.hp <= 0 ? r : n).side === this.playerSide,
                    ),
                    e.flash(`rgba(255,255,255,0.8)`, 300));
            }),
            !this.isGuest && this.phaseTime > 2.6 && this.finishRound());
          break;
        case `roundOver`:
          if (this.bossWonMatch)
            this.cue(`bossWin`, 2.7, () => t.playClip(An, jn));
          else if (this.match.winner !== null) {
            let e = Dn[this.fighters[this.match.winner].char.id];
            e && this.cue(`winLine`, 1.2, () => t.playClip(e, jn));
          }
          !this.isGuest &&
            this.phaseTime > 3.6 &&
            (this.match.winner === null
              ? (this.match.nextRound(), this.startRound(!1))
              : this.setPhase(`matchOver`));
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
          if (n && this.boss && this.phaseTime > 2.4) {
            this.startPortal();
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
        case `portal`:
          (this.portal &&
            !this.portalVideo &&
            this.portal.t >= id &&
            ((this.portalVideo = !0),
            this.ctx.hud.playPortalVideo(this.portal.t - id)),
            this.portal &&
              this.portalVideo &&
              this.ctx.hud.watchPortalVideo(this.portal.t - id),
            this.portal?.done && this.finishPortal());
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
              }
            : void 0,
          winner: this.fighters[t].char.id,
          wins: [...this.match.wins],
          player: this.fighters[this.playerSide].char.id,
        }));
    }
    finishRound(e) {
      let [t, n] = this.fighters,
        r = e ?? Ju(t.hp, n.hp, this.timeUp, this.bossSide);
      if (
        (this.emit({
          t: `ev`,
          e: `roundEnd`,
          outcome: r.outcome,
          perfect: r.perfect,
          timeUp: r.timeUp,
        }),
        this.match.record(r),
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
          this.speech(
            r.outcome,
            this.diwali ? It(e.char.id, `win`, e.char.winLine) : e.char.winLine,
          ),
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
        (e.step(qe), e.done && this.finishSuper());
        return;
      }
      if (this.phase === `grapple`) {
        let e = this.grapple;
        (e.step(qe), e.done && this.finishGrapple());
        return;
      }
      if (this.phase === `cow`) {
        (e.update(Ti(), t.x), t.update(Ti(), e.x), Gu(e, t));
        let [n, r] = e.x <= t.x ? [e, t] : [t, e],
          i = j - zd / 2,
          a = Math.max(-i, Math.min(i, (n.x + r.x) / 2)),
          o = 1 - Math.exp(-6 * qe);
        ((n.x += (a - zd / 2 - n.x) * o), (r.x += (a + zd / 2 - r.x) * o));
        return;
      }
      if (this.phase !== `fight`) {
        (e.update(Ti(), t.x), t.update(Ti(), e.x), Gu(e, t));
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
        s = n ? o : this.dodgeBomb(this.fighters[a], o),
        c = this.playerSide === 0 ? [i, s] : [s, i];
      (e.update(c[0], t.x), t.update(c[1], e.x), (this.calm += qe));
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
            Fd.has(t.def.id) &&
            this.checkChai(e));
      }
      this.calm === 0 && ((this.boredFired = !1), (this.tauntFired = !1));
      for (let e of this.fighters)
        if (e.wantsSuper) {
          this.startSuper(e.side);
          return;
        }
      let [l, u] = Uu(e, t);
      (l && this.onHit(l),
        u && this.phase === `fight` && this.onHit(u),
        this.phase === `fight` &&
          (Gu(e, t),
          e.hp <= 0 || t.hp <= 0
            ? this.enterKo(!0)
            : (this.boss &&
                !this.budgetUsed &&
                !this.net &&
                (this.budget = Math.min(
                  1,
                  this.budget + qe / (this.hardBoss ? go.budgetSeconds : 10),
                )),
              this.boss && this.trackBoss(this.boss),
              this.match.tick(0.016666666666666666)
                ? ((this.timeUp = !0), this.enterKo(!1))
                : (this.checkBoredom(),
                  this.diwali && !this.net && !this.boss && this.stepMithai(),
                  this.bomb && this.stepBomb(this.bomb),
                  this.cowAt > 0 &&
                    this.match.timer <= this.cowAt &&
                    this.canCowCross() &&
                    (this.diwali && !this.net
                      ? this.startBomb()
                      : this.startCow())))));
    }
    emit(e) {
      this.net?.role === `host` && this.net.send(e);
    }
    pushRemoteInputs(e, t) {
      this.remoteInput.push(e, t);
    }
    tuneHostDelay() {
      this.net?.role === `host` &&
        this.hostDelay.reset(Tu(this.net.roundTrip()));
    }
    sendSnapshot() {
      let e = {
        t: `s`,
        n: ++this.snapSeq,
        m: [
          this.match.round,
          this.match.wins[0],
          this.match.wins[1],
          Ou(this.match.timer),
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
        (e.crouching ? ku.crouching : 0) |
        (e.holdingBack ? ku.holdingBack : 0) |
        (e.grounded ? ku.grounded : 0) |
        (e.attack?.hasHit ? ku.attackHasHit : 0) |
        (e.airAttackUsed ? ku.airAttackUsed : 0);
      return [
        Ou(e.x),
        Ou(e.y),
        Ou(e.vx),
        Ou(e.vy),
        e.facing,
        Ou(e.hp),
        Ou(e.meter),
        Du.indexOf(e.state),
        e.stateFrames,
        e.attack ? e.attack.def.id : ``,
        e.attack ? e.attack.frame : 0,
        t,
        e.moveRel,
        e.comboHits,
        Ou(e.walkDistance),
        e.downFrames,
        e.stun,
        e.buffer ? Au.indexOf(e.buffer.button) + 1 : 0,
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
            (n.state = Du[e[7]] ?? `idle`),
            (n.stateFrames = e[8]));
          let r = e[9] ? co[e[9]] : void 0;
          ((n.attack = r
            ? { def: r, frame: e[10], hasHit: !!(e[11] & ku.attackHasHit) }
            : null),
            (n.crouching = !!(e[11] & ku.crouching)),
            (n.holdingBack = !!(e[11] & ku.holdingBack)),
            (n.grounded = !!(e[11] & ku.grounded)),
            (n.moveRel = e[12]),
            (n.comboHits = e[13]),
            (n.walkDistance = e[14]),
            (n.downFrames = e[15]),
            (n.stun = e[16] ?? 0),
            (n.buffer = e[17]
              ? { button: Au[e[17] - 1], frames: e[18] ?? 0 }
              : null),
            (n.airAttackUsed = !!(e[11] & ku.airAttackUsed)));
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
        t = bu(e),
        n = this.inputSeq++;
      if (
        (this.recentInputs.push(t),
        this.recentInputs.length > 8 && this.recentInputs.shift(),
        this.net.sendInputs(Su(n, this.recentInputs)),
        this.phase === `super` && this.superMove)
      ) {
        this.superMove.done || this.superMove.step(qe);
        return;
      }
      if (this.phase === `grapple` && this.grapple) {
        this.grapple.done || this.grapple.step(qe);
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
            ((e.vy -= 24 * qe),
            (e.y += e.vy * qe),
            e.y <= 0 && ((e.y = 0), (e.vy = 0))),
          (e.x = Math.max(-j, Math.min(j, e.x + e.vx * qe))));
      r &&
        (jd(i, this.fighters[+(this.playerSide === 0)], e),
        i.state === `attack` &&
          i.attack?.frame === 1 &&
          n >= this.whooshFrom &&
          (this.ctx.audio.whoosh(), (this.whooshFrom = n + Rd)));
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
                counter: t.counter,
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
      let t = e.x + e.facing * Ao(e, e.attack.def.id) * 0.8;
      this.chaiwala.tryKnock(t, e.facing) &&
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
          let t = is(this.fighters[e].char.id, this.rng);
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
        ? ((this.cow = new kd(this.ctx.scene, u, d)),
          o.say(
            `⚠ SABZI WALA<small>Aloo le lo, pyaaz le lo!</small>`,
            `cow`,
            2600,
          ),
          s.startLoop(`aloolelo`))
        : ((this.cow = new ys(this.ctx.scene, u, d)),
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
        r = t instanceof kd;
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
    startBomb() {
      this.cowAt = -1;
      let [e, t] = this.fighters,
        n = (e.x + t.x) / 2,
        r = this.rng() < 0.5,
        i = 7.5;
      ((this.bomb = new so(
        this.ctx.scene,
        n + (r ? -7.5 : i),
        n + (r ? i : -7.5),
      )),
        (this.bombDodge = this.rng() < 0.8),
        this.ctx.hud.say(
          `⚠ SUTLI BOMB<small>Ring se bahar bhaago!</small>`,
          `cow`,
          2200,
        ),
        this.ctx.audio.newsSting());
    }
    stepBomb(e) {
      let { hud: t, audio: n, cam: r } = this.ctx,
        i = e.update(qe);
      if (i.moo) {
        this.tmp.set(e.posX, 0.9, 0.4);
        let n = this.ctx.toScreen(this.tmp);
        t.speech(`SSSSSSS… 🧨`, n.x, n.y, `small`);
      }
      if (i.boom) {
        (n.bombBlast(),
          r.shake(0.45, 0.6),
          t.flash(`rgba(255,230,180,0.75)`, 220),
          this.ctx.arena.cheer(1.4));
        for (let n of this.fighters) {
          if (Math.abs(n.x - e.posX) > 1.5 || n.y > 0.5 || n.hp <= 0) continue;
          let r = n.x < e.posX ? -1 : 1;
          ((n.hp = Math.max(0, n.hp - 10)),
            (n.attack = null),
            (n.buffer = null),
            n.hp <= 0
              ? n.knockOut(r, 3, 6)
              : (n.forceState(`knockdown`),
                (n.vx = r * 2.4),
                (n.vy = 5.5),
                (n.grounded = !1),
                (n.downFrames = 0)),
            this.tmp.set(n.x, 2.1, 0.3));
          let i = this.ctx.toScreen(this.tmp);
          (t.popup(`−10 🧨`, i.x, i.y, `#ff7a3a`),
            n.side === this.playerSide && St(80));
        }
      }
      e.done && (e.dispose(), (this.bomb = null));
    }
    dodgeBomb(e, t) {
      let n = this.bomb;
      if (!n || !this.bombDodge || n.fuseLeft <= 0 || n.fuseLeft > 1.1)
        return t;
      let r = e.x - n.posX;
      if (Math.abs(r) > 1.8) return t;
      let i = r > 0 || (r === 0 && e.x < 0) ? 1 : -1,
        a = Math.abs(e.x + i * 0.6) > j - 0.3,
        o = Ti();
      return (a ? (o.up = n.fuseLeft < 0.35) : (o.moveX = i), o);
    }
    stepMithai() {
      let e = this.mithai;
      if (e) {
        if ((e.update(qe, this.time), e.ready)) {
          let t = this.fighters.find(
            (t) => t.hp > 0 && t.y === 0 && Math.abs(t.x - e.x) < 0.55,
          );
          if (t) {
            ((t.hp = Math.min(t.maxHp, t.hp + 10)),
              this.tmp.set(t.x, 2.3, 0.3));
            let n = this.ctx.toScreen(this.tmp);
            (this.ctx.hud.popup(`+10 SOAN PAPDI!`, n.x, n.y, `#5aff8a`),
              this.ctx.audio.chaiTing(),
              (e.done = !0));
          }
        }
        e.done &&
          (e.dispose(),
          (this.mithai = null),
          (this.mithaiAt = this.time + 18 + this.rng() * 10));
      } else {
        if (this.time < this.mithaiAt) return;
        let [e, t] = this.fighters,
          n = Math.max(
            -j + 1,
            Math.min(j - 1, (e.x + t.x) / 2 + (this.rng() - 0.5) * 3),
          );
        this.chaiwala.headWorld(this.tmp);
        let r = this.ctx.toScreen(this.tmp.setY(this.tmp.y + 0.35));
        (this.ctx.hud.speech(`Lo ji, soan papdi! 🪔`, r.x, r.y, `small`),
          (this.tmp.y -= 0.85),
          (this.mithai = new ao(this.ctx.scene, this.tmp, n)),
          this.ctx.audio.whoosh());
      }
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
          this.ctx.hud.speech(
            this.diwali ? Rt(t.shout) : t.shout,
            e.x,
            e.y,
            `small`,
          );
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
      (this.emit({ t: `ev`, e: `ko`, slowMo: e, timeUp: this.timeUp }),
        e && ((this.timeScale = 0.3), (this.slowMoTime = 1.1)));
      for (let e of this.fighters)
        (e.hp > 0 && e.actionable && e.enter(`idle`),
          (e.vx = e.state === `ko` ? e.vx : 0));
      this.setPhase(`ko`);
    }
    onHit(e) {
      (e.defender === this.boss &&
        e.attacker.side === this.playerSide &&
        !e.blocked &&
        !this.budgetUsed &&
        (this.budget = Math.min(1, this.budget + e.damage / 40)),
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
            counter: e.counter,
            x: Ou(e.x),
            y: Ou(e.y),
            combo: e.defender.comboHits,
          },
        }));
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
        (this.ctx.news.event({ kind: `block`, attacker: e.attacker.char.id }),
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
        e.defender.side === this.playerSide && St(e.knockdown ? 70 : 28),
        (this.hitStop = e.knockdown ? 8 : 5),
        r.shake(0.05 + o * 0.09, 0.18),
        i.cheer(0.25 + o * 0.3));
      let s = e.attacker.char.moveNames[e.moveId];
      if (
        (this.ctx.news.event({
          kind: `hit`,
          attacker: e.attacker.char.id,
          move: s ?? Id[e.moveId],
          damage: e.damage,
          knockdown: e.knockdown,
        }),
        e.knockdown && (i.paparazzi(6), n.cameraClicks(5)),
        s || e.counter)
      ) {
        this.tmp.y += 0.5;
        let t = this.ctx.toScreen(this.tmp);
        a.popup(
          e.counter ? `COUNTER!` : s,
          t.x,
          t.y,
          e.counter ? `#ffe14d` : e.attacker.char.accent,
        );
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
    trackBoss(e) {
      ((this.bossSeconds += qe),
        e.hp < this.bossHpSeen
          ? ((this.roundDamage += this.bossHpSeen - e.hp), (this.bossCalm = 0))
          : (this.bossCalm += qe),
        this.hardBoss &&
          this.bossCalm >= go.regenDelay &&
          e.hp > 0 &&
          (e.hp = Math.min(e.maxHp, e.hp + go.regen * qe)),
        (this.bossHpSeen = e.hp),
        (this.bestDamage = Math.max(this.bestDamage, this.roundDamage)));
    }
    beginBossIntro() {
      let { audio: e, hud: t, arena: n } = this.ctx;
      (t.show(!1),
        t.cinema(!0, !0),
        t.setVignette(!0),
        n.setMood(0.8),
        e.silenceMusic(!0),
        e.playClip(On));
    }
    stepBossIntro() {
      let { audio: e, hud: t, cam: n, arena: r } = this.ctx;
      (this.cue(`bossTitle`, 8.1, () => {
        (e.boom(),
          n.shake(0.14, 0.4),
          t.cinemaTitle(`AB ASLI PARIKSHA`, `MBAPU · ANTIM YODDHA`));
      }),
        this.cue(`bossFade`, 8, () => e.stopClip(2400)),
        this.cue(`bossOpen`, 9.3, () => {
          (t.cinema(!1), t.setVignette(!1), t.show(!0), e.silenceMusic(!1));
        }),
        r.setMood(0.8 * (1 - L((this.phaseTime - 8.8) / 1.6))));
    }
    startEntrance() {
      let { scene: e, cam: t, fx: n, audio: r, hud: i, arena: a } = this.ctx,
        o = this.fighters[this.playerSide],
        s = +(this.playerSide === 0);
      ((this.dancer = null),
        (this.entrance = new td({
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
    get budgetReady() {
      let e = this.fighters[this.playerSide];
      return (
        !!this.boss &&
        !this.net &&
        !this.budgetUsed &&
        this.budget >= 1 &&
        this.phase === `fight` &&
        this.hitStop === 0 &&
        e.actionable &&
        e.hp > 0 &&
        this.boss.hp > 1
      );
    }
    callBudget() {
      if (!this.budgetReady) return !1;
      let e = this.playerSide,
        t = this.fighters[e],
        n = this.boss,
        { hud: r, audio: i, arena: a, cam: o, fx: s, scene: c } = this.ctx;
      ((this.budgetUsed = !0),
        (this.budget = 0),
        A(`budget_called`, { player: t.char.id }));
      for (let e of [t, n]) ((e.attack = null), (e.vx = 0), (e.vy = 0));
      return (
        t.forceState(`super`),
        n.forceState(`frozen`),
        (this.superCaster = e),
        (this.superMove = new Ta(
          {
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
            clipTime: () => null,
            popup: (e, t, n) => {
              let i = this.ctx.toScreen(t);
              r.popup(e, i.x, i.y, n);
            },
            speech: (t, r) => this.speech(t === `caster` ? e : n.side, r),
          },
          this.hardBoss ? go.budgetShare : void 0,
        )),
        r.say(`📕 BUDGET PESH HAI!<small>Ab lagega tax</small>`, `cow`, 1800),
        i.playClip(En),
        r.setVignette(!0),
        a.setMood(0.6),
        i.newsSting(),
        this.setPhase(`super`),
        !0
      );
    }
    skipCinema() {
      (this.phase === `intro` &&
        this.bossIntro &&
        (this.phaseTime = this.phaseTime < Nd ? Nd : Pd),
        this.entrance?.skip(),
        this.portal?.skip(),
        this.portal &&
          this.portalVideo &&
          this.ctx.hud.seekPortalVideo(this.portal.t - id));
    }
    startPortal() {
      let { scene: e, cam: t, fx: n, audio: r, hud: i, arena: a } = this.ctx,
        o = this.boss;
      ((this.dancer = null),
        (this.chaiwala.root.visible = !1),
        (this.portal = new Td({
          scene: e,
          cam: t,
          fx: n,
          audio: r,
          hud: i,
          arena: a,
          player: this.fighters[this.playerSide],
          boss: o,
        })),
        this.setPhase(`portal`),
        this.onPortal?.());
    }
    finishPortal() {
      (this.ctx.hud.stopPortalVideo(),
        this.portal?.dispose(),
        (this.portal = null),
        (this.chaiwala.root.visible = !0),
        this.fighters[this.playerSide].forceState(`victory`),
        (this.dancer = this.playerSide),
        this.setPhase(`done`),
        this.endMatch());
    }
    startSuper(e) {
      let t = this.fighters[e];
      (this.emit({ t: `ev`, e: `super`, side: e }),
        this.isGuest ||
          A(`super_used`, {
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
        (this.superMove = hu({
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
      let l = Tn[t.char.id];
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
        A(`grapple`, {
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
        (this.grapple = sc({
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
        this.diwali?.superEnd(),
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
    get introLength() {
      return this.bossIntro
        ? Pd
        : this.fighters.some((e) => e.char.danceIntro)
          ? 4.4
          : 3.2;
    }
    showsClip(e) {
      let t = this.fighters[e];
      return t.char.id === `mbapu`
        ? !0
        : t.char.fightClips
          ? this.phase === `grapple`
            ? e === this.grappleSide && !!this.grapple?.attClip
            : this.phase === `super`
              ? e === this.superCaster && !!this.superMove?.casterClip
              : [`super`, `frozen`, `victory`, `intro`].includes(t.state) ||
                  this.phase === `entrance` ||
                  this.phase === `portal`
                ? !1
                : t.state !== `idle` ||
                  (this.phase !== `cow` &&
                    (this.phase !== `roundCall` || this.match.round !== 1))
          : !1;
    }
    clipFor(e) {
      let t = this.fighters[e],
        n = this.fighters[+(e === 0)];
      if (this.phase === `portal` && this.portal && t.isBoss)
        return this.portal.bossClip(this.time);
      if (this.phase === `intro` && this.bossIntro && t.isBoss) {
        let e = this.phaseTime;
        return e < Nd
          ? { name: `hiphop`, time: e, fade: 0.2 }
          : e < 9.3
            ? { name: `bow`, time: 0.2 + (e - Nd), fade: 0.35 }
            : { name: `stance`, time: this.time, loop: !0, fade: 0.45 };
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
      return To(t, this.time, i);
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
      if (this.phase === `portal` && this.portal && e === this.playerSide)
        return { pose: this.portal.playerPose(this.time, t.char.id), rate: 5 };
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
          pose: F(V(this.time, t.char.id), {
            rootY: -0.03,
            spineF: 0.12,
            headF: 0.15,
            headT: 0.6,
            hipsT: 0,
            spineT: 0,
            ...Qi,
          }),
          rate: 6,
        };
      if (
        this.phase === `roundCall` &&
        this.match.round === 1 &&
        t.state === `idle`
      )
        return { pose: ta(this.time + e * 1.9, t.char.id), rate: 6 };
      let r = n.attackPhase,
        i = (r === `startup` || r === `active`) && Math.abs(n.x - t.x) < 2.4,
        a = ra(t, { time: this.time, threatened: i }),
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
            (a.state === `victory` ||
              (a.state === `intro` && !!a.char.danceIntro)) &&
            this.phase !== `super` &&
            this.phase !== `grapple` &&
            !!c.playDance?.(t),
          u = !l && this.showsClip(i) && !!c.playClip?.(this.clipFor(i), t);
        (!l && !u && (c.stopDance?.(), c.stopClip?.(), c.blendTo(o, s, t)),
          u || c.setMirror?.(!1));
        let d = this.phase === `grapple` ? this.grapple : null,
          f =
            this.phase === `super` && i !== this.superCaster
              ? this.superMove
              : null,
          p = d
            ? i === this.grappleSide
              ? d.attTf
              : d.defTf
            : (f?.targetTf ?? null);
        if (p) c.setFree(p.x, p.y, p.z, p.yaw, p.roll);
        else {
          let n = this.smooth[i],
            r = Math.exp(-e * 14);
          ((n.x *= r), (n.y *= r));
          let o = a.x + n.x,
            s = Math.max(0, a.y + n.y);
          l
            ? c.setTransform(o, s, a.facing, t, Math.PI / 2 - 0.3)
            : u
              ? (c.setMirror?.(a.facing < 0),
                c.setTransform(
                  o,
                  s,
                  a.facing,
                  t,
                  a.state === `victory` ? Math.PI / 2 - 0.08 : _o,
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
      if (this.phase !== `portal`) {
        if (this.phase === `intro` && this.bossIntro && this.boss) {
          let e = this.boss,
            t = this.fighters[this.playerSide],
            r = t.x >= e.x ? 1 : -1,
            i = z(L((this.phaseTime - 7) / 3.4000000000000004)),
            a = (t.x + e.x) / 2,
            o = Math.abs(t.x - e.x);
          (this.tmp.set(e.x + (a - e.x) * i, 1.05 - 0.05 * i, 0),
            this.tmp2.set(
              e.x + r * 2.4 * (1 - i) + (a - e.x) * i,
              0.7 + (0.85 + o * 0.06) * i,
              4.1 + (Math.min(8.5, Math.max(4.4, 3.4 + o * 0.85)) - 4.1) * i,
            ),
            n.set(this.tmp2, this.tmp, 2.6, 42));
        } else if (this.phase === `intro`) {
          let e = Math.min(1, this.phaseTime / this.introLength),
            t = -1.1 + e * 1.1,
            r = this.phaseTime < this.introLength / 2 ? o : s;
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
        } else
          this.dancer !== null &&
          this.fighters[this.dancer].state === `victory` &&
          (this.phase !== `roundOver` || this.phaseTime > 0.6)
            ? this.danceCamera(this.fighters[this.dancer])
            : this.phase !== `super` &&
              this.phase !== `grapple` &&
              this.phase !== `entrance` &&
              n.frameFight(o.x, s.x, o.y, s.y);
      }
      (this.entrance?.afterVisuals(),
        this.phase === `grapple` && this.grapple?.afterVisuals(),
        this.phase === `cow` && this.updateCow(t),
        this.phase !== `portal` && this.updateChaiwala(t),
        this.phase !== `entrance` &&
          this.phase !== `portal` &&
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
  Vd = (e, t = document) => t.querySelector(e),
  Hd = class {
    constructor() {
      (e(this, `el`, Vd(`#hud`)),
        e(this, `timer`, Vd(`#timer`)),
        e(this, `announce`, Vd(`#announce`)),
        e(this, `flashEl`, Vd(`#flash`)),
        e(this, `flashTimer`, 0),
        e(this, `banner`, Vd(`#super-banner`)),
        e(this, `popups`, Vd(`#popups`)),
        e(this, `vignette`, Vd(`#vignette`)),
        e(this, `cinemaEl`, Vd(`#cinema`)),
        e(this, `cineCaption`, Vd(`#cine-caption`)),
        e(this, `cineTitle`, Vd(`#cine-title`)),
        e(this, `cineFade`, Vd(`#cine-fade`)),
        e(this, `cineStamps`, Vd(`#cine-stamps`)),
        e(this, `budgetEl`, Vd(`#budget-meter`)),
        e(this, `budgetFill`, Vd(`#budget-meter i`)),
        e(this, `budgetBtn`, document.querySelector(`#touch-budget`)),
        e(this, `sides`, void 0),
        e(this, `trail`, [100, 100]),
        e(this, `announceTimer`, null),
        e(this, `comboTimers`, [0, 0]),
        e(this, `youSide`, 0),
        e(
          this,
          `touchSuper`,
          document.querySelector(`#touch [data-touch="super"]`),
        ),
        e(this, `portalVideo`, document.querySelector(`#portal-video`)),
        e(this, `videoOn`, !1),
        e(this, `videoBlob`, null),
        e(this, `videoFetch`, null),
        e(this, `videoLastT`, -1),
        e(this, `videoLastAt`, 0),
        e(this, `superView`, !1));
      let t = (e) => {
        let t = Vd(`.side.${e}`, this.el);
        return {
          root: t,
          fill: Vd(`.hp-fill`, t),
          trail: Vd(`.hp-trail`, t),
          meter: Vd(`.meter.${e} .meter-fill`, this.el),
          meterLabel: Vd(`.meter.${e} .meter-label`, this.el),
          wins: Array.from(t.querySelectorAll(`.win`)),
          combo: Vd(`.combo.${e}`, this.el),
          portrait: Vd(`.portrait`, t),
          name: Vd(`.name`, t),
        };
      };
      this.sides = [t(`left`), t(`right`)];
    }
    setup(e, t, n, r = `CPU`, i = null) {
      this.youSide = n;
      for (let a of [0, 1]) {
        let o = this.sides[a],
          s = a === i ? ` (FINAL BOSS)` : a === n ? ` (YOU)` : ` (${r})`;
        ((o.name.textContent = e[a].name + s),
          (o.portrait.src = t[a]),
          o.root.style.setProperty(`--accent`, e[a].accent),
          (this.trail[a] = 100));
      }
      this.setWins([0, 0]);
    }
    show(e) {
      this.el.classList.toggle(`hidden`, !e);
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
          (i.meterLabel.textContent = c ? `SHAKTI READY!` : `SHAKTI`),
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
    cinemaFade(e, t = 0) {
      ((this.cineFade.style.transition = t ? `opacity ${t}ms ease` : `none`),
        (this.cineFade.style.opacity = String(e)));
    }
    cinemaStamps(e) {
      ((this.cineStamps.className = e ? `show` : ``),
        (this.cineStamps.innerHTML = (e ?? [])
          .map(
            (e, t) =>
              `<div class="stamp-card" style="--i:${t}">${e}<b>🔒</b></div>`,
          )
          .join(``)));
    }
    cinemaTitle(e, t) {
      ((this.cineTitle.querySelector(`h1`).textContent = e),
        (this.cineTitle.querySelector(`small`).textContent = t),
        (this.cineTitle.className = `show`));
    }
    get videoCovering() {
      return this.videoOn;
    }
    preparePortalVideo() {
      let e = this.portalVideo;
      if (!e || this.videoFetch) return;
      ((e.muted = !0),
        (e.playsInline = !0),
        e.setAttribute(`webkit-playsinline`, ``));
      let t = `/fightkaro/video/${N ? `portal-mobile` : `portal`}.mp4?v=20261104`;
      this.videoFetch = fetch(t)
        .then((e) =>
          e.ok ? e.blob() : Promise.reject(Error(String(e.status))),
        )
        .then((t) => {
          ((this.videoBlob = URL.createObjectURL(t)),
            (e.src = this.videoBlob),
            e.load());
        })
        .catch(() => {
          this.videoFetch = null;
        });
    }
    playPortalVideo(e) {
      let t = this.portalVideo;
      if (!(
        !t ||
        !this.videoBlob ||
        t.readyState < HTMLMediaElement.HAVE_FUTURE_DATA
      )) {
        try {
          t.currentTime = Math.max(0, e);
        } catch {}
        ((this.videoLastT = -1),
          (this.videoLastAt = performance.now()),
          t
            .play()
            .then(() => {
              (t.classList.add(`on`), (this.videoOn = !0));
            })
            .catch(() => this.stopPortalVideo()));
      }
    }
    watchPortalVideo(e) {
      let t = this.portalVideo;
      if (!t || !this.videoOn) return;
      let n = performance.now(),
        r = t.duration > 0 && t.currentTime > t.duration - 0.2;
      if (
        t.error ||
        (t.paused && !r && t.play().catch(() => this.stopPortalVideo()),
        !t.paused &&
          !t.seeking &&
          t.currentTime > this.videoLastT + 0.01 &&
          ((this.videoLastT = t.currentTime), (this.videoLastAt = n)),
        n - this.videoLastAt > 700 && !r)
      )
        return this.stopPortalVideo();
      !t.paused &&
        e < t.duration - 0.3 &&
        Math.abs(t.currentTime - e) > 0.6 &&
        ((t.currentTime = e), (this.videoLastT = e));
    }
    seekPortalVideo(e) {
      let t = this.portalVideo;
      t &&
        this.videoOn &&
        ((t.currentTime = Math.min(e, Math.max(0, t.duration - 0.05) || e)),
        (this.videoLastT = t.currentTime),
        (this.videoLastAt = performance.now()));
    }
    stopPortalVideo() {
      let e = this.portalVideo;
      ((this.videoOn = !1), e && (e.classList.remove(`on`), e.pause()));
    }
    setBudget(e, t) {
      (this.budgetEl.classList.toggle(`show`, t),
        this.budgetEl.classList.toggle(`ready`, t && e >= 1),
        this.budgetBtn &&
          ((this.budgetBtn.hidden = !t),
          this.budgetBtn.classList.toggle(`ready`, t && e >= 1),
          this.budgetBtn.style.setProperty(`--k`, String(Math.min(1, e)))),
        (this.budgetFill.style.transform = `scaleX(${Math.min(1, e)})`));
    }
    setSuperView(e) {
      e !== this.superView &&
        ((this.superView = e),
        document.documentElement.classList.toggle(`super-view`, e));
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
        this.popups.appendChild(i));
      let a = i.offsetWidth / 2 + 8,
        o = i.offsetHeight / 2 + 8;
      ((i.style.left = `${Math.min(Math.max(t, a), window.innerWidth - a)}px`),
        (i.style.top = `${Math.min(Math.max(n, o + window.innerHeight * 0.12), window.innerHeight - o)}px`),
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
function Ud(e) {
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
var Wd = class {
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
          (n.querySelector(`img`).src = Ud(e)),
          (n.querySelector(`.channel`).textContent = Io[e].channel),
          (n.querySelector(`.who`).textContent = Io[e].name),
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
        (this.fillerIdx = Math.floor(this.rng() * Zo.length)));
      for (let e of [`godi`, `troll`])
        ((this.anchors[e].text.textContent =
          e === `godi` ? `Desh jaanna chahta hai!` : `Chat, are we live??`),
          this.anchors[e].root.classList.remove(`talking`));
      this.pushTicker(
        `SATIRE LIVE: Sansad Showdown — the fight nobody demanded`,
      );
    }
    event(e) {
      let t = $o(e, this.rng);
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
        (this.pushTicker(Zo[this.fillerIdx % Zo.length]), this.fillerIdx++),
        (this.tickerTrack.style.transform = `translateX(${this.tickerX.toFixed(1)}px)`));
    }
  },
  Gd = [`KeyA`, `ArrowLeft`],
  Kd = [`KeyD`, `ArrowRight`],
  qd = [`KeyW`, `ArrowUp`],
  Jd = [`KeyS`, `ArrowDown`],
  Yd = [`KeyJ`, `KeyZ`],
  Xd = [`KeyK`, `KeyX`],
  Zd = [`KeyL`, `Space`, `KeyC`],
  Qd = [`KeyI`, `KeyV`],
  $d = class {
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
                St(8));
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
            r.filter((e) => this.touchHeld.has(e)).join() !== p && St(5),
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
      let e = Ti(),
        t = this.any(Gd, this.held) || this.touchHeld.has(`left`);
      return (
        (e.moveX =
          t === (this.any(Kd, this.held) || this.touchHeld.has(`right`))
            ? 0
            : t
              ? -1
              : 1),
        (e.up = this.any(qd, this.held) || this.touchHeld.has(`up`)),
        (e.down = this.any(Jd, this.held) || this.touchHeld.has(`down`)),
        (e.punch =
          this.any(Yd, this.pressed) || this.touchPressed.has(`punch`)),
        (e.kick = this.any(Xd, this.pressed) || this.touchPressed.has(`kick`)),
        (e.super =
          this.any(Zd, this.pressed) || this.touchPressed.has(`super`)),
        (e.grab =
          this.any(Qd, this.pressed) ||
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
  ef = 12,
  tf = `huddle-fightkaro:legal-v1`;
function nf() {
  try {
    return localStorage.getItem(tf) === `1`;
  } catch {
    return !1;
  }
}
function rf() {
  try {
    localStorage.setItem(tf, `1`);
  } catch {}
}
function af() {
  let e = document.querySelector(`#legal`);
  try {
    return e && nf()
      ? (A(`legal_skip`), e.remove(), Promise.resolve())
      : e
        ? of(e)
        : Promise.resolve();
  } catch (t) {
    return (
      console.warn(`[legal] notice failed, letting the player through`, t),
      A(`legal_failed`),
      e?.remove(),
      Promise.resolve()
    );
  }
}
function of(e) {
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
  A(`legal_view`);
  let o = `skipped`,
    s = () => {
      n.scrollTop + n.clientHeight < n.scrollHeight - ef ||
        ((o = n.scrollTop > 0 ? `scroll` : `fits`),
        n.removeEventListener(`scroll`, s));
    };
  return (
    n.addEventListener(`scroll`, s, { passive: !0 }),
    s(),
    t.focus(),
    new Promise((c) => {
      t.addEventListener(
        `click`,
        () => {
          (n.removeEventListener(`scroll`, s),
            A(`legal_continue`, { how: o, sec: Ke(a) }),
            rf(),
            r?.removeEventListener(`resize`, i),
            r?.removeEventListener(`scroll`, i),
            e.remove(),
            c());
        },
        { once: !0 },
      );
    })
  );
}
vt();
var q = (e) => document.querySelector(e),
  sf = `huddle-fightkaro:gfx-copy`;
function cf() {
  let e = new URLSearchParams(location.search).get(`gfx`);
  if (e === `copy` || e === `normal`) return e === `copy`;
  try {
    return localStorage.getItem(sf) === `1`;
  } catch {
    return !1;
  }
}
var lf = N && cf(),
  uf = document.querySelector(`#game`),
  df = lf ? document.createElement(`canvas`) : uf,
  ff = lf ? uf.getContext(`2d`, { alpha: !1 }) : null,
  J = new Ie({
    canvas: df,
    antialias: !N,
    powerPreference: `high-performance`,
  });
(J.setPixelRatio(Math.min(window.devicePixelRatio, N ? 1.5 : 2)),
  (J.shadowMap.enabled = !0),
  (J.shadowMap.type = 1),
  (J.toneMapping = 4),
  (J.toneMappingExposure = 1.05),
  (J.outputColorSpace = i));
var pf = J.getContext();
lf && A(`gfx_mode_active`, { gpu: Af() });
var mf = 0;
(df.addEventListener(`webglcontextlost`, (e) => {
  (e.preventDefault(),
    mf++,
    A(`webgl_context_lost`, { screen: Uf, count: mf }));
}),
  df.addEventListener(`webglcontextrestored`, () => {
    (Lf(!0), A(`webgl_context_restored`, { screen: Uf }));
  }));
var hf = new he(),
  gf = new Si(window.innerWidth / window.innerHeight),
  _f = new sn(hf, J),
  vf = new mt(hf),
  yf = new gu(hf),
  Y = new yi(),
  bf = new Hd(),
  xf = new $d(),
  Sf = new Wd(document.querySelector(`#newsdesk`));
xf.bindTouch(document.querySelector(`#touch`));
var Cf = N ? null : new de(J),
  wf = Cf
    ? new Ee(new me(window.innerWidth, window.innerHeight), 0.45, 0.4, 1.2)
    : null;
Cf &&
  wf &&
  (Cf.addPass(new Me(hf, gf.camera)), Cf.addPass(wf), Cf.addPass(new ce()));
var Tf = [
    [0.5, 0.5],
    [0.3, 0.4],
    [0.7, 0.4],
    [0.3, 0.7],
    [0.7, 0.7],
  ],
  Ef = new Uint8Array(4),
  Df = 0,
  Of = 0,
  kf = 0;
function Af() {
  let e = pf.getExtension(`WEBGL_debug_renderer_info`);
  return String(
    e
      ? pf.getParameter(e.UNMASKED_RENDERER_WEBGL)
      : pf.getParameter(pf.RENDERER),
  ).slice(0, 80);
}
function jf() {
  if (!N || Df >= 12) return;
  Df++;
  let e = pf.drawingBufferWidth,
    t = pf.drawingBufferHeight;
  ((Of = Tf.every(
    ([n, r]) => (
      pf.readPixels(
        Math.floor(e * n),
        Math.floor(t * r),
        1,
        1,
        pf.RGBA,
        pf.UNSIGNED_BYTE,
        Ef,
      ),
      Ef[0] > 250 && Ef[1] > 250 && Ef[2] > 250
    ),
  )
    ? Of + 1
    : 0),
    !(Of < 2 || kf >= 2) &&
      ((Of = 0),
      kf++,
      kf === 1
        ? ((J.shadowMap.enabled = !1),
          hf.traverse((e) => {
            let t = e.material;
            for (let e of Array.isArray(t) ? t : t ? [t] : [])
              e.needsUpdate = !0;
          }))
        : ((J.toneMapping = 0), Hm(1)),
      A(`render_blank`, { screen: Uf, step: kf, gpu: Af() })));
}
var Mf = 0,
  Nf = 0,
  Pf = !0,
  Ff = 0,
  If = !1;
function Lf(e = !1) {
  ((Pf = !0), (Ff = performance.now()), If || (If = e));
}
function Rf() {
  let e = window.innerWidth,
    t = window.innerHeight;
  ((Pf = !1),
    (e !== Mf || t !== Nf || If) &&
      ((If = !1),
      (Mf = e),
      (Nf = t),
      J.setSize(e, t, !1),
      Cf?.setSize(e, t),
      gf.resize(e / t)));
}
(window.addEventListener(`resize`, () => Lf()), Rf());
var zf = (e) => {
    let t = e.clone().project(gf.camera);
    return {
      x: ((t.x + 1) / 2) * window.innerWidth,
      y: ((1 - t.y) / 2) * window.innerHeight,
    };
  },
  Bf = 320;
function Vf(e, t, n = 1) {
  let r = new he();
  r.add(new xe(16774634, 5583650, 1.8));
  let a = new s(16777215, 2.6);
  (a.position.set(0.6, 2, 2.5), r.add(a));
  let o = new s(16772306, 1.2);
  (o.position.set(-1.2, 1, 1.8), r.add(o));
  let c = el(P[e]);
  (t && c.setFacePhoto(t),
    c.snapTo(ki()),
    r.add(c.root),
    c.root.updateMatrixWorld(!0));
  let l = c.headWorld(new T()),
    u = new re(28, 1, 0.01, 10),
    d = P[e].modelHeight ?? 1;
  (u.position.set(l.x, l.y + 0.01 * d + 0.09 * (n - 1), l.z + 0.92 * d * n),
    u.lookAt(l.x, l.y + 0.005 * d + 0.09 * (n - 1), l.z));
  let f = new ke(Bf, Bf, { samples: 4, colorSpace: i }),
    p = J.getRenderTarget();
  (J.setRenderTarget(f), J.setClearColor(0, 0), J.clear(), J.render(r, u));
  let m = new Uint8Array(Bf * Bf * 4);
  (J.readRenderTargetPixels(f, 0, 0, Bf, Bf, m),
    J.setRenderTarget(p),
    f.dispose());
  let h = document.createElement(`canvas`);
  h.width = h.height = Bf;
  let g = h.getContext(`2d`),
    _ = g.createImageData(Bf, Bf);
  for (let e = 0; e < Bf; e++)
    _.data.set(m.subarray((319 - e) * Bf * 4, (Bf - e) * Bf * 4), e * Bf * 4);
  return (g.putImageData(_, 0, 0), h.toDataURL(`image/png`));
}
function Hf(e) {
  let t = new he();
  t.add(new xe(16774634, 5583650, 1.8));
  let n = new s(16769712, 2.8);
  (n.position.set(0.8, 2.2, 2.5), t.add(n));
  let r = el(P[e]);
  ($f[e] && r.setFacePhoto($f[e]),
    r.snapTo(
      F(V(0, e), {
        hipsT: 0,
        spineT: 0,
        spineF: -0.05,
        headF: -0.08,
        lShF: 2.7,
        lShO: 0.4,
        lEl: 0.25,
        lHand: 0,
        rShF: 2.7,
        rShO: 0.4,
        rEl: 0.25,
        rHand: 0,
      }),
    ),
    t.add(r.root),
    r.root.updateMatrixWorld(!0));
  let a = P[e].modelHeight ?? 1,
    o = new re(30, 600 / 800, 0.01, 20);
  (o.position.set(0.5 * a, 1.05 * a, 4.4 * a), o.lookAt(0, 1 * a, 0));
  let c = new ke(600, 800, { samples: 4, colorSpace: i }),
    l = J.getRenderTarget();
  (J.setRenderTarget(c), J.setClearColor(0, 0), J.clear(), J.render(t, o));
  let u = new Uint8Array(192e4);
  (J.readRenderTargetPixels(c, 0, 0, 600, 800, u),
    J.setRenderTarget(l),
    c.dispose(),
    r.dispose?.());
  let d = document.createElement(`canvas`);
  ((d.width = 600), (d.height = 800));
  let f = d.getContext(`2d`),
    p = f.createImageData(600, 800);
  for (let e = 0; e < 800; e++)
    p.data.set(
      u.subarray((799 - e) * 600 * 4, (800 - e) * 600 * 4),
      e * 600 * 4,
    );
  return (f.putImageData(p, 0, 0), d.toDataURL(`image/png`));
}
var Uf = `title`,
  X = `modi`,
  Wf = Ci(X),
  Gf = `normal`,
  Kf = `sansad`,
  qf = [`sansad`, `jantar`, `road`],
  Jf = (e) => qf[(qf.indexOf(e) + 1) % qf.length],
  Z = null,
  Q = null,
  Yf = null,
  $ = { ready: !1, friendPick: null, friendReady: !1 },
  Xf = `/fightkaro/`,
  Zf = `?v=20261101_smooth`,
  Qf = {
    modi: `${Xf}faces/modi.webp${Zf}`,
    rahul: `${Xf}faces/rahul.webp${Zf}`,
    didi: `${Xf}faces/didi.webp${Zf}`,
    trump: `${Xf}faces/trump.webp${Zf}`,
    yogi: `${Xf}faces/yogi.webp${Zf}`,
    nitin: `${Xf}faces/nitin.webp${Zf}`,
    mbapu: `${Xf}faces/mbapu.webp${Zf}`,
    ravi: `${Xf}faces/ravi.webp?v=20261104_face`,
    lalu: `${Xf}faces/lalu.webp?v=20261104_face`,
  },
  $f = {},
  ep = {
    title: document.querySelector(`#title`),
    online: document.querySelector(`#online`),
    select: document.querySelector(`#select`),
    result: document.querySelector(`#result`),
    pause: document.querySelector(`#pause`),
    loading: document.querySelector(`#loading`),
  },
  tp = document.querySelector(`#neta-download`),
  np = document.querySelector(`#dl-title`),
  rp = document.querySelector(`#dl-pct`),
  ip = document.querySelector(`#dl-fill`),
  ap = null;
function op(e, t) {
  tp && tp.classList.remove(`hidden`);
  let n = P[e]?.name?.toUpperCase() ?? e.toUpperCase();
  np && (np.textContent = `DOWNLOADING ${n}…`);
  let r = Math.min(100, Math.max(0, Math.round(t)));
  (rp && (rp.textContent = `${r}%`), ip && (ip.style.width = `${r}%`));
}
function sp(e) {
  (tp && tp.classList.remove(`hidden`),
    np &&
      (np.textContent = `${P[e].name} DOWNLOAD FAILED · CHECK YOUR INTERNET`),
    rp && (rp.textContent = `RETRY`),
    ip && (ip.style.width = `0%`),
    window.setTimeout(() => {
      ap || cp();
    }, 3500));
}
function cp() {
  (tp && tp.classList.add(`hidden`),
    ip && (ip.style.width = `0%`),
    rp && (rp.textContent = `0%`));
}
async function lp(e) {
  if ((e === `mbapu` && (va(), Y.preloadClips([On, En])), Xc(e)))
    return (ap === e && ((ap = null), cp()), await fp(e), kp(), !0);
  ((ap = e), op(e, 0), kp());
  let t = await Zc(e, J, (t) => {
    ap === e && op(e, t);
  });
  return (
    t && (await fp(e)),
    ap === e && ((ap = null), cp(), t ? Lp([e]) : sp(e)),
    kp(),
    t
  );
}
var up = {};
function dp() {
  for (let e of Di) {
    if (!Xc(e)) continue;
    let t = el(P[e]);
    ((up[e] = t), hf.add(t.root));
  }
  hp();
}
async function fp(e) {
  if (!(await Qc(e, J)) || up[e]) return;
  let t = el(P[e]);
  ((up[e] = t), hf.add(t.root), $f[e] && t.setFacePhoto($f[e]), hp());
}
function pp() {
  return Q ? $.friendPick : Wf;
}
var mp = [`didi`, `yogi`, `ravi`, `lalu`, `nitin`, `trump`];
function hp() {
  let e = Uf === `select`,
    t = pp(),
    n = Cp().filter((e) => Xc(e) && mp.includes(e));
  for (let r of Di) {
    !up[r] && Xc(r) && ((up[r] = el(P[r])), hf.add(up[r].root));
    let i = up[r];
    if (i) {
      if (!Sp(r) && (!e || (r !== X && r !== t))) i.root.visible = !1;
      else if (!Xc(r)) i.root.visible = !1;
      else if (
        ((i.root.visible = Uf === `title` || (e && (r === X || r === t))), e)
      ) {
        let e = r === X,
          t = N ? 1.4 : 1.2;
        i.setTransform(e ? -t : t, 0, e ? 1 : -1, 0, 0.5);
      } else if (mp.includes(r)) {
        let e = n.indexOf(r);
        if (
          n.length >= 5 ||
          (n.length === 4 && n.some((e) => e === `ravi` || e === `lalu`))
        ) {
          let t = (e / (n.length - 1)) * 2 - 1;
          i.setFree(t * 1.85, 0, -0.45 - 0.45 * (1 - Math.abs(t)), -t * 0.28);
        } else if (n.length === 4) {
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
var gp = !1;
function _p(e) {
  (e !== Uf && Ge(e),
    gp ||
      (e !== `select` && e !== `online` && e !== `battle`) ||
      ((gp = !0),
      A(`game_enter`, {
        via: new URLSearchParams(location.search).has(`room`)
          ? `invite`
          : `title`,
      })),
    (Uf = e),
    ep.title.classList.toggle(`hidden`, e !== `title`),
    ep.online.classList.toggle(`hidden`, e !== `online`),
    ep.select.classList.toggle(`hidden`, e !== `select`),
    ep.result.classList.toggle(`hidden`, e !== `result`),
    document.body.classList.toggle(`in-battle`, e === `battle`),
    hp(),
    e !== `battle` && bf.show(!1));
}
Bn(location.hash) &&
  history.replaceState(null, ``, location.pathname + location.search);
var vp = Ln();
vp.unlocked = !0;
function yp() {
  zn(vp);
}
function bp() {
  let e = document.querySelector(`#portal-banner`);
  e &&
    (e.classList.toggle(`open`, vp.portalSeen),
    (e.querySelector(`span`).textContent = vp.portalSeen
      ? `The portal is open · Chapter 2 coming soon`
      : `Beat Mbapu to open the portal 🔒`));
}
(bp(), Ga());
var xp = null;
(Za({
  neta: () => X,
  winner: () => xp,
  name: (e) => P[e].name,
  portrait: (e) => Qf[e],
  hero: (e) => Hf(e),
}),
  window.addEventListener(`storage`, () => {
    (Object.assign(vp, Ln()), (vp.unlocked = !0), bp());
  }));
var Sp = (e) => e !== `mbapu` || vp.unlocked,
  Cp = () => Di.filter(Sp);
function wp(e, t, n, r = Di) {
  let i = r.length,
    a = r.indexOf(e);
  a < 0 && (a = 0);
  do a = (a + t + i) % i;
  while (r[a] === n && i > 1);
  return r[a];
}
var Tp = (e, t = !0) => {
  let n = Cp(),
    r = n.filter((n) => n !== e && (t || n !== `mbapu`));
  return (r.length ? r : n)[Math.floor(Math.random() * (r.length || n.length))];
};
function Ep(e) {
  if (Q) {
    if ($.ready || e === $.friendPick) return;
    ((X = e), im());
  } else {
    if (e === Wf) {
      let t = X === e ? Ci(e) : X;
      Wf = Sp(t) ? t : Ci(e);
    }
    X = e;
  }
  lp(e);
}
var Dp = `p1`;
document.querySelectorAll(`[data-tile]`).forEach((e) => {
  let t = e.dataset.tile;
  t !== `random` && !Di.includes(t) && e.remove();
});
function Op(e, t, n, r) {
  let i = t ? P[t] : null;
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
function kp() {
  !Q && !Sp(Wf) && (Wf = wp(Wf, 1, X, Cp()));
  let e = pp();
  (Q && (Dp = `p1`),
    document.body.classList.toggle(`online`, !!Q),
    document.body.classList.toggle(`guest`, Q?.role === `guest`),
    document.querySelectorAll(`[data-tile]`).forEach((t) => {
      let n = t.dataset.tile;
      ((t.style.display = ``),
        t.classList.toggle(`p1`, n === X),
        t.classList.toggle(`p2`, n === e));
      let r = Q ? n === e : Dp === `p2` && n === X;
      (t.classList.toggle(`taken`, r),
        t
          .querySelector(`.cur.p2`)
          ?.replaceChildren(
            Q ? `2P` : n === `mbapu` && vp.unlocked ? `BOSS` : `CPU`,
          ),
        n === `mbapu` &&
          (t.classList.remove(`locked`),
          t.querySelector(`.tile-name`)?.replaceChildren(P.mbapu.name),
          t.querySelector(`.boss-tag`)?.replaceChildren(Q ? `` : `BOSS`)));
    }),
    Ap());
  let t = Q
    ? `2P · FRIEND${$.friendReady ? ` · READY ✓` : ``}`
    : e === `mbapu`
      ? `FINAL BOSS · OPPONENT`
      : `CPU`;
  (Op(
    q(`#plate-p1`),
    X,
    Q && $.ready ? `1P · YOU · READY ✓` : `1P · YOU`,
    Dp === `p1`,
  ),
    Op(q(`#plate-p2`), e, t, !Q && Dp === `p2`));
  let n = q(`#pick-prompt`);
  ((n.textContent = Q
    ? $.ready
      ? `WAITING FOR YOUR FRIEND…`
      : `PICK YOUR NETA`
    : Dp === `p1`
      ? `PICK YOUR NETA`
      : `PICK YOUR OPPONENT`),
    n.classList.toggle(`p2`, !Q && Dp === `p2`));
  let r = q(`#fight-btn`);
  (ap
    ? ((r.disabled = !0),
      (r.textContent = `DOWNLOADING…`),
      r.classList.remove(`pulse`),
      r.classList.remove(`waiting`))
    : ((r.disabled = !1),
      (r.textContent = Q
        ? $.ready
          ? $.friendReady
            ? `STARTING…`
            : `WAITING…`
          : `READY`
        : `FIGHT!`),
      r.classList.toggle(`waiting`, !!Q && $.ready),
      r.classList.toggle(`pulse`, !Q || !$.ready)),
    hp(),
    document.querySelectorAll(`[data-diff]`).forEach((e) => {
      e.classList.toggle(`selected`, e.dataset.diff === Gf);
    }),
    document.querySelectorAll(`[data-stage]`).forEach((e) => {
      e.classList.toggle(`selected`, e.dataset.stage === Kf);
    }),
    _f.stage !== Kf && _f.setStage(Kf),
    (q(`#stage-sub`).textContent = qt[Kf].subtitle),
    (q(`#vs-line`).textContent =
      `${P[X].name} (YOU) vs ${e ? P[e].name : `…`} (${Q ? `FRIEND` : e === `mbapu` ? `BOSS` : `CPU`})`));
}
function Ap() {
  q(`#bapu-quest`).classList.add(`hidden`);
}
function jp(e) {
  if ((Y.unlock(), Q)) {
    let t = e === `random` ? Tp($.friendPick, !1) : e;
    if (t === $.friendPick) return;
    Ep(t);
  } else if (Dp === `p1`) (Ep(e === `random` ? Tp(null, !1) : e), (Dp = `p2`));
  else {
    let t = e === `random` ? Tp(X, !1) : e;
    if (t === X) return;
    ((Wf = t), (Dp = `p1`), lp(t));
  }
  (Y.uiSelect(), kp());
}
We();
var Mp = null,
  Np = null;
function Pp(e) {
  Mp !== null &&
    (A(`match_quit`, {
      how: e,
      duration_sec: Ke(Mp),
      mode: Q ? `online` : `cpu`,
    }),
    (Mp = null));
}
function Fp() {
  ap ||
    (Q && !Q.battle && Uf !== `battle`
      ? (($.ready = !$.ready), Y.uiSelect(), im(), kp(), am())
      : zp());
}
var Ip = new Map();
function Lp(e) {
  let t = e.filter((e) => !Ip.has(e));
  if (t.length > 0) {
    let e = yu(J, gf.camera, hf, yf, t).catch((e) => {
      console.warn(`[perf] on-demand prewarm failed`, e);
      for (let e of t) Ip.delete(e);
    });
    for (let n of t) Ip.set(n, e);
  }
  return Promise.all(e.map((e) => Ip.get(e))).then(() => void 0);
}
var Rp = !1;
async function zp(e) {
  if (!(ap || Rp)) {
    Rp = !0;
    try {
      await Bp(e);
    } finally {
      Rp = !1;
    }
  }
}
async function Bp(e) {
  (Y.unlock(),
    N && !_t() && bt(),
    e || Y.uiConfirm(),
    Y.setTrack(`battle`),
    Z?.dispose(),
    (Z = null),
    _p(`battle`));
  let t = Q && $.friendPick ? $.friendPick : Wf,
    n = t === X ? Ci(X) : t,
    r = !Q && n !== `mbapu` && X !== `mbapu` && Vn(vp);
  (r && Y.preloadClips([On]),
    Y.preloadClips([X, n].flatMap((e) => Tn[e] ?? [])),
    !Q && n === `mbapu` && Y.preloadClips([On, An, En, kn]));
  let [i, a] = await Promise.all([
    Qc(X, J),
    Qc(n, J),
    ...(r ? [Qc(`mbapu`, J)] : []),
  ]);
  if (!i || !a) {
    ((Z = null),
      Q && dm(),
      Y.setTrack(`background`),
      _p(`select`),
      kp(),
      sp(i ? n : X));
    return;
  }
  let o = r && Xc(`mbapu`);
  (await Lp(o ? [X, n, `mbapu`] : [X, n]),
    Uf === `battle` &&
      ((Z = new Bd(
        {
          scene: hf,
          cam: gf,
          fx: vf,
          audio: Y,
          hud: bf,
          arena: _f,
          input: xf,
          portraits: Qf,
          faceTextures: $f,
          toScreen: zf,
          news: Sf,
        },
        {
          player: X,
          opponent: n,
          difficulty: Gf,
          net: Q?.battleNet(),
          bossEntrance: o,
          handover: e,
        },
      )),
      Q && (Q.battle = Z),
      Wm(Z.fighters.map((e) => e.char.id)),
      Xp.classList.toggle(`hidden`, !Q),
      Pp(`rematch`),
      (Mp = performance.now()),
      A(`match_start`, {
        player: X,
        opponent: n,
        stage: Kf,
        difficulty: Q ? `online` : Gf,
        mode: Q ? `online` : `cpu`,
      }),
      (Z.onPortal = () => {
        let e = !vp.portalSeen;
        ((vp.portalSeen = !0),
          yp(),
          bp(),
          A(`portal_opened`, { player: X, first: e ? `yes` : `no` }));
      }),
      (Z.onMatchDecided = (e) => {
        if (Q || n === `mbapu`) return;
        let t = Hn(vp, e);
        (yp(),
          navigator.storage?.persist?.().catch(() => void 0),
          t && A(`bapu_unlocked`, { player: X }));
      }),
      (Z.onMatchEnd = (e, t) => {
        if (
          ((xp = t.winner),
          A(`match_end`, {
            player: t.player,
            winner: t.winner,
            result: e ? `win` : `lose`,
            score: `${t.wins[0]}-${t.wins[1]}`,
            stage: Kf,
            difficulty: Q ? `online` : Gf,
            mode: Q ? `online` : `cpu`,
            duration_sec: Mp === null ? 0 : Ke(Mp),
          }),
          (Mp = null),
          Q ||
            (t.boss && (Un(vp, t.boss.seconds, t.boss.damage), yp()),
            t.boss &&
              A(`bapu_fought`, {
                result: e ? `win` : `lose`,
                seconds: Math.round(t.boss.seconds),
              })),
          t.entrance)
        ) {
          ((Wf = `mbapu`), zp(t.entrance));
          return;
        }
        (Q && (Q.battle = null),
          ($.ready = !1),
          ($.friendReady = !1),
          Xp.classList.add(`hidden`),
          bf.clearSay(),
          Y.matchJingle(e),
          Y.setTrack(`background`, 3));
        let r = t.winner === X ? n : X,
          i = ns(t.winner, r, t.wins),
          a = (e) => document.querySelector(e);
        ((a(`#result-title`).textContent = e ? `YOU WIN!` : `YOU LOSE`),
          (a(`#result-title`).className = e ? `stamp win` : `stamp lose`),
          Vp(t.boss),
          (a(`#paper-masthead`).textContent = i.masthead),
          (a(`#paper-date`).textContent =
            `${new Date().toLocaleDateString(`en-IN`, { weekday: `long`, day: `numeric`, month: `long`, year: `numeric` })} · Price ₹5 · Satire Edition`));
        let o = Qa(a(`#paper-date`).textContent ?? ``, i.excuse);
        ((a(`#paper-date`).textContent = o.date),
          (a(`#paper-headline`).textContent = i.headline),
          (a(`#paper-sub`).textContent = i.sub),
          (a(`#paper-excuse`).textContent = o.excuse),
          a(`#paper-photo`).setAttribute(`src`, Qf[t.winner]),
          (a(`#paper-caption`).textContent =
            `${P[t.winner].fullName} celebrates outside the Sansad. (Cartoon, not a real photo)`),
          (a(`#result-sub`).textContent =
            `${P[t.winner].name} WINS! ` +
            (e
              ? `${P[X].name} rules the Sansad!`
              : `Better luck next election, ${P[X].name}.`)),
          (a(`#select-btn`).textContent = Q
            ? `LEAVE ROOM`
            : `CHARACTER SELECT`),
          (a(`#rematch-btn`).textContent = Q ? `REMATCH (LOBBY)` : `REMATCH`),
          Ua(e && !Q),
          _p(`result`));
      })));
}
function Vp(e) {
  let t = q(`#bapu-stats`);
  if ((t.classList.toggle(`hidden`, !e), !e)) return;
  let n = (e, t) => `<div><b>${e}</b><span>${t}</span></div>`;
  t.innerHTML =
    n(`${Math.round(e.seconds)}s`, `TIKE RAHE`) +
    n(`${Math.round(e.damage)}%`, `DAMAGE`) +
    n(`${vp.bestSeconds}s`, `BEST`);
}
function Hp() {
  Z &&
    Uf === `battle` &&
    (Q
      ? ((q(`#quit-btn`).textContent = `LEAVE ROOM`),
        ep.pause.classList.toggle(`hidden`),
        Y.uiTap())
      : ((q(`#quit-btn`).textContent = `QUIT TO SELECT`),
        (Z.paused = !Z.paused),
        Y.setClipPaused(Z.paused),
        Y.uiTap(),
        ep.pause.classList.toggle(`hidden`, !Z.paused),
        Kp()));
}
function Up() {
  Q
    ? dm()
    : (Y.setClipPaused(!1),
      Y.uiBack(),
      Y.setTrack(`background`),
      Pp(`quit`),
      Z?.dispose(),
      (Z = null),
      ep.pause.classList.add(`hidden`),
      _p(`select`),
      kp());
}
(document.querySelectorAll(`[data-tile]`).forEach((e) => {
  (e.addEventListener(`click`, () => jp(e.dataset.tile)),
    e.addEventListener(`dblclick`, () => Fp()));
}),
  q(`#plate-p1`).addEventListener(`click`, () => {
    ((Dp = `p1`), Y.uiTap(), kp());
  }),
  q(`#plate-p2`).addEventListener(`click`, () => {
    Q || ((Dp = `p2`), Y.uiTap(), kp());
  }),
  document.querySelectorAll(`[data-diff]`).forEach((e) => {
    e.addEventListener(`click`, () => {
      ((Gf = e.dataset.diff), Y.uiSelect(), kp());
    });
  }),
  document.querySelectorAll(`[data-stage]`).forEach((e) => {
    e.addEventListener(`click`, () => {
      Q?.role !== `guest` &&
        ((Kf = e.dataset.stage), Y.uiSelect(), Q && im(), kp());
    });
  }),
  document.querySelector(`#fight-btn`).addEventListener(`click`, Fp),
  document
    .querySelector(`#cine-skip`)
    .addEventListener(`click`, () => Z?.skipCinema()));
for (let e of [`#budget-meter`, `#touch-budget`])
  document.querySelector(e).addEventListener(`click`, (e) => {
    (e.stopPropagation(), Z?.callBudget());
  });
(document
  .querySelector(`#rematch-btn`)
  .addEventListener(`click`, () => (Q ? om() : Fp())),
  document.querySelector(`#select-btn`).addEventListener(`click`, Up),
  document.querySelector(`#resume-btn`).addEventListener(`click`, Hp),
  document.querySelector(`#quit-btn`).addEventListener(`click`, Up),
  document.querySelector(`#pause-btn`).addEventListener(`click`, Hp),
  ep.title.addEventListener(`click`, (e) => {
    e.target.closest(`#online-btn`) ||
      (Y.unlock(),
      Y.uiConfirm(),
      Y.setTrack(`background`),
      bt(),
      _p(`select`),
      kp());
  }));
var Wp = document.querySelector(`#sound-btn`),
  Gp = document.querySelector(`#pause-sound-btn`);
function Kp() {
  let e = !Y.muted;
  ((Wp.textContent = e ? `🔊` : `🔇`),
    Wp.setAttribute(`aria-label`, e ? `Mute sound` : `Turn sound on`),
    Wp.classList.toggle(`locked`, e && Y.locked && !Z?.paused),
    (Gp.textContent = e ? `SOUND: ON` : `SOUND: OFF`));
}
var qp = !1;
function Jp(e) {
  e.stopPropagation();
  let t = qp;
  ((qp = !1),
    t || (Y.locked && !Y.muted && !Z?.paused) ? Y.unlock() : Y.toggleMute(),
    Y.uiTap(),
    Kp());
}
(Wp.addEventListener(`pointerdown`, () => {
  qp = Y.locked && !Y.muted;
}),
  Wp.addEventListener(`click`, Jp),
  Gp.addEventListener(`click`, Jp),
  (Y.onStateChange = Kp),
  Kp());
var Yp = () => {
  Y.unlock();
};
(document.addEventListener(`pointerdown`, Yp, { capture: !0 }),
  document.addEventListener(`keydown`, Yp, { capture: !0 }),
  xt((e) => {
    e && Z && Uf === `battle` && !Z.paused && Hp();
  }),
  N &&
    document.addEventListener(`visibilitychange`, () => {
      Q || (document.hidden && Z && Uf === `battle` && !Z.paused && Hp());
    }),
  document.addEventListener(`visibilitychange`, () =>
    Q?.setAway(document.hidden),
  ),
  window.addEventListener(`pagehide`, (e) => {
    (e.persisted ||
      (Pp(`closed_tab`),
      Np !== null &&
        A(`room_leave`, { how: `closed_tab`, duration_sec: Ke(Np) })),
      Q && (e.persisted ? Q.setAway(!0) : Q.leave()));
  }),
  (xf.onKey = (e) => {
    if (
      (e === `KeyN` && (Y.toggleMute(), Kp()),
      e === `KeyM` && (Y.musicOn = !Y.musicOn),
      e === `KeyB` && Z?.callBudget(),
      Uf === `title` && Sm && (e === `Enter` || e === `Space`))
    )
      (Y.unlock(), Y.uiConfirm(), Y.setTrack(`background`), _p(`select`), kp());
    else if (Uf === `select` && Q)
      ((e === `ArrowLeft` || e === `KeyA`) && Ep(wp(X, -1, $.friendPick)),
        (e === `ArrowRight` || e === `KeyD`) && Ep(wp(X, 1, $.friendPick)),
        e === `KeyT` && Q.role === `host` && ((Kf = Jf(Kf)), im()),
        kp(),
        e === `Enter` && Fp(),
        e === `Escape` && dm());
    else if (Uf === `select`) {
      let t = `${X}|${Wf}|${Gf}|${Kf}`;
      ((e === `ArrowLeft` || e === `KeyA`) && Ep(wp(X, -1)),
        (e === `ArrowRight` || e === `KeyD`) && Ep(wp(X, 1)),
        (e === `ArrowUp` || e === `KeyW`) && (Wf = wp(Wf, -1, X, Cp())),
        (e === `ArrowDown` || e === `KeyS`) && (Wf = wp(Wf, 1, X, Cp())),
        e === `Digit1` && (Gf = `easy`),
        e === `Digit2` && (Gf = `normal`),
        e === `Digit3` && (Gf = `hard`),
        e === `KeyT` && (Kf = Jf(Kf)),
        `${X}|${Wf}|${Gf}|${Kf}` !== t && Y.uiSelect(),
        kp(),
        e === `Enter` && Fp());
    } else
      Uf === `result`
        ? (e === `Enter` && (Q ? om() : Fp()), e === `Escape` && Up())
        : Uf === `battle` && e === `Escape` && Hp();
  }));
var Xp = q(`#net-badge`),
  Zp = q(`#net-away`),
  Qp = [`on-home`, `on-hosting`, `on-connecting`, `on-error`];
function $p(e) {
  for (let t of Qp) q(`#${t}`).classList.toggle(`hidden`, t !== e);
  _p(`online`);
}
function em(e) {
  ((q(`#on-error-text`).textContent = e), $p(`on-error`));
}
var tm = {
    onLobby: (e) => {
      if (e.build !== "huddle-20261106") { fm("Your friend has an older arena open. Both players should close Play and refresh Huddle before reconnecting."); return; }
      (($.friendPick = e.pick),
        ($.friendReady = e.ready),
        Q?.role === `guest` && e.stage && e.stage !== Kf && (Kf = e.stage),
        X === e.pick &&
          (Q?.role === `guest` || e.ready) &&
          ((X = wp(X, 1, e.pick)), ($.ready = !1), im()),
        lp(e.pick),
        Uf === `select` && kp(),
        am());
    },
    onStart: (e) => {
      Q &&
        Q.role === `guest` &&
        ((X = e.guest),
        ($.friendPick = e.host),
        (Kf = e.stage),
        _f.setStage(Kf),
        zp());
    },
    onAway: (e) => {
      (Zp.classList.toggle(`hidden`, !e),
        Z && Q && ((Z.paused = e), Y.setClipPaused(e)));
    },
    onEnd: (e) => fm(e),
  },
  nm = [];
function rm(e) {
  (nm.push(`${(performance.now() / 1e3).toFixed(1)}s ${e}`),
    nm.length > 150 && nm.shift());
}
function im() {
  Q?.send({
    t: `lobby`,
    build: "huddle-20261106",
    pick: X,
    ready: $.ready,
    stage: Q.role === `host` ? Kf : void 0,
  });
}
function am() {
  Q &&
    Q.role === `host` &&
    Uf === `select` &&
    $.ready &&
    $.friendReady &&
    $.friendPick &&
    $.friendPick !== X &&
    (Q.send({ t: `start`, host: X, guest: $.friendPick, stage: Kf }), zp());
}
function om() {
  (Z?.dispose(),
    (Z = null),
    Q && (Q.battle = null),
    ($.ready = !1),
    Zp.classList.add(`hidden`),
    Xp.classList.add(`hidden`),
    ep.pause.classList.add(`hidden`),
    Y.setTrack(`background`),
    _p(`select`),
    im(),
    kp());
}
function sm(e) {
  ((Q = e),
    ($.ready = !1),
    ($.friendPick = null),
    ($.friendReady = !1),
    Y.uiConfirm(),
    A(`online_connected`, { role: e.role }),
    (Np = performance.now()),
    e.linkInfo().then((t) => A(`online_link`, { kind: t.kind, role: e.role })),
    location.search && history.replaceState(null, ``, location.pathname),
    om());
}
async function cm() {
  (Yf?.abort(),
    (Yf = new AbortController()),
    $p(`on-connecting`),
    (q(`#on-connecting-text`).textContent = `Creating room…`));
  try {
    let { code: e, connected: t } = await ju.host(tm, Yf.signal, rm);
    ((q(`#on-room-code`).textContent = e),
      (q(`#on-room-code`).dataset.code = e),
      $p(`on-hosting`),
      A(`room_create`),
      sm(await t));
  } catch (e) {
    if (Yf?.signal.aborted) return;
    em(e instanceof Error ? e.message : String(e));
  }
}
function lm(e) {
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
async function um(e) {
  let t = r(e);
  if (!t) em(`That room code looks wrong: it should be 4 letters/numbers.`);
  else {
    ($p(`on-connecting`),
      (q(`#on-connecting-text`).textContent = `Joining room ${t}…`),
      A(`room_join_attempt`, {
        via: new URLSearchParams(location.search).has(`room`) ? `link` : `code`,
      }));
    try {
      sm(await ju.join(t, tm, rm));
    } catch (e) {
      (A(`room_join_failed`, { reason: lm(e) }),
        em(e instanceof Error ? e.message : String(e)));
    }
  }
}
function dm() {
  (Q?.leave(), fm(null));
}
function fm(e) {
  void huddleRequest('DELETE').catch(() => {});
  (Q && rm(`session ended: ${e ?? `left`}`),
    Pp(e ? `connection_ended` : `left_room`),
    Np !== null &&
      (A(`room_leave`, {
        how: e ? (/left/i.test(e) ? `friend_left` : `connection_lost`) : `left`,
        duration_sec: Ke(Np),
      }),
      (Np = null)),
    Yf?.abort(),
    (Yf = null),
    Q?.close(),
    (Q = null),
    Z?.dispose(),
    (Z = null),
    Zp.classList.add(`hidden`),
    Xp.classList.add(`hidden`),
    ep.pause.classList.add(`hidden`),
    Y.setClipPaused(!1),
    Y.setTrack(`background`),
    document.body.classList.remove(`online`, `guest`),
    e ? em(e) : (_p(`select`), kp()));
}
function pm(e) {
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
  if (huddleJoining || Q) return;
  huddleJoining = true;
  Y.unlock(); Y.uiConfirm(); Y.setTrack('background');
  $p('on-connecting');
  q('#on-connecting-text').textContent = 'Finding your room…';
  try {
    let result;
    do {
      result = await huddleRequest('POST');
      if (!huddleJoining) { void huddleRequest('DELETE').catch(() => {}); return; }
      if (result.role === 'waiting') await new Promise(resolve => setTimeout(resolve, 500));
    } while (result.role === 'waiting' && huddleJoining);
    if (!huddleJoining) { void huddleRequest('DELETE').catch(() => {}); return; }
    if (result.role === 'host') await cm();
    else await um(result.code);
  } catch (error) { if (huddleJoining) em(error.message); }
  finally { huddleJoining = false; }
}
(q(`#online-btn`).addEventListener(`click`, (e) => {
  e.stopPropagation(); void huddlePlay();
}),
  q(`#on-host`).addEventListener(`click`, () => void cm()),
  q(`#on-join-form`).addEventListener(`submit`, (e) => {
    (e.preventDefault(), q(`#on-code`).blur(), um(q(`#on-code`).value));
  }),
  q(`#on-back`).addEventListener(`click`, () => {
    huddleJoining = false; Yf?.abort(); Yf = null;
    void huddleRequest('DELETE').catch(() => {});
    Y.uiBack(); _p('select'); kp();
  }),
  q(`#on-wa`).addEventListener(`click`, () => {
    let e = q(`#on-room-code`).dataset.code ?? ``,
      t = `Fight me in Sansad Showdown! 🥊 Room code ${e}: ${pm(e)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, `_blank`);
  }),
  q(`#on-copy`).addEventListener(`click`, async () => {
    let e = q(`#on-room-code`).dataset.code ?? ``;
    try {
      (await navigator.clipboard.writeText(pm(e)),
        (q(`#on-copy`).textContent = `Copied!`));
    } catch {
      q(`#on-copy`).textContent = pm(e);
    }
    setTimeout(() => (q(`#on-copy`).textContent = `Copy link`), 2e3);
  }),
  q(`#net-away-leave`).addEventListener(`click`, () => {
    (Y.uiBack(), dm());
  }),
  q(`#online-leave`).addEventListener(`click`, () => {
    (Y.uiBack(), dm());
  }),
  (t.forceRelay = new URLSearchParams(location.search).get(`relay`) === `1`));
var mm = { lan: `same Wi-Fi`, direct: `direct`, relay: `relay`, unknown: `…` },
  hm = null;
setInterval(async () => {
  if (!Q) return;
  let e = Q,
    t = e.latency(),
    n = t ? Math.round(t.avg) : null;
  if (
    !hm ||
    hm.session !== e ||
    performance.now() - hm.at > 5e3 ||
    hm.text === `…`
  ) {
    let t = await e.linkInfo().catch(() => null);
    hm = { session: e, text: t ? mm[t.kind] : `…`, at: performance.now() };
  }
  if (Q !== e) return;
  let r = hm.text;
  ((q(`#online-status`).textContent =
    `Huddle room · ${Q.role === `host` ? `you host` : `you joined`} · ${r}${n === null ? `` : ` · ${n} ms`}`),
    (Xp.textContent = n === null ? `…` : `${n} ms`),
    Xp.classList.toggle(`bad`, n !== null && n > 150));
}, 1e3);
var gm = document.querySelector(`#load-fill`),
  _m = 0,
  vm = 0.05,
  ym = 0.6;
function bm(e, t) {
  ((vm = Math.max(vm, e)), (ym = t));
}
var xm = window.setInterval(() => {
  ((_m = Math.max(vm, _m + (ym - _m) * 0.03)),
    gm && (gm.style.transform = `scaleX(${_m})`));
}, 100);
ee.onProgress = (e, t, n) => bm(0.05 + (t / Math.max(1, n)) * 0.55, 0.6);
var Sm = !1,
  Cm = af().then(() => {
    ((Sm = !0), Y.unlock());
  });
async function wm() {
  let e = [`modi`, `rahul`].filter((e) => Di.includes(e));
  (await Yc(J, e),
    Y.preloadCommon(),
    Y.setTrack(`intro`),
    Y.unlock(),
    bm(0.62, 0.72),
    dp());
  let t = async (e) => {
    let t = await Es(P[e].facePhoto);
    t && (($f[e] = t), up[e]?.setFacePhoto(t));
  };
  await Promise.all(e.map(t));
  for (let e of Di) Qf[e] || (Qf[e] = `${Xf}faces/${e}.webp${Zf}`);
  bm(0.72, 0.97);
  try {
    let e = performance.now();
    (await Lp([`modi`, `rahul`].filter((e) => Di.includes(e))),
      console.info(
        `[perf] initial moves prewarmed in ${Math.round(performance.now() - e)} ms`,
      ));
  } catch (e) {
    console.warn(`[perf] prewarm failed`, e);
  }
  (bm(1, 1),
    (_m = 1),
    gm && (gm.style.transform = `scaleX(1)`),
    window.clearInterval(xm),
    await new Promise((e) => setTimeout(e, 250)),
    ep.loading.classList.add(`hidden`),
    _p(`title`));
  for (let n of Di) e.includes(n) || t(n);
  (document.querySelectorAll(`[data-portrait]`).forEach((e) => {
    let t = e.dataset.portrait;
    Qf[t] && ((e.src = Qf[t]), (e.alt = P[t]?.name ?? t));
  }),
    A(`game_loaded`, {
      load_sec: Math.round(performance.now() / 100) / 10,
      device: N ? `mobile` : `desktop`,
    }));
  let n = new URLSearchParams(location.search).get(`room`);
  n && (await Cm, (q(`#on-code`).value = n.toUpperCase()), um(n));
}
wm();
var Tm = new fe();
Tm.connect(document);
var Em = 0,
  Dm = new T(),
  Om = new T();
function km(e) {
  ((Em += e),
    Di.forEach((t, n) => {
      let r = up[t];
      if (!r || !r.root.visible) return;
      let i = Uf === `select` && t === X;
      r.blendTo(i ? Ki(Em, t) : ta(Em + n * 1.9, t), 6, e);
    }));
  let t = Math.sin(Em * 0.25) * (Uf === `select` ? 0.12 : 0.3),
    n = 4.1 * Math.max(1, 1.5 / gf.camera.aspect);
  (Dm.set(0, 1.15, 0),
    Om.set(0 + Math.sin(t) * n, 1.45, Math.cos(t) * n),
    gf.set(Om, Dm, 2.5, 40),
    _f.update(Em, e),
    vf.update(e, gf.camera),
    gf.update(e));
}
var Am = 0,
  jm = 0;
function Mm(e) {
  requestAnimationFrame(Mm);
  let t = Uf === `battle` || (Uf === `result` && !!Z),
    n = Z?.paused ? 100 : t ? 1e3 / 60 : 1e3 / 30;
  if (e < Am - 1) return;
  Am = Math.max(Am + n, e - n);
  let r = N && _t();
  if ((!r && Pf && (If || !N || e - Ff > 200) && Rf(), pf.isContextLost()))
    return;
  Tm.update();
  let i = Math.min(0.05, Tm.getDelta());
  (Uf === `battle` || (Uf === `result` && Z) ? Z?.update(i) : km(i),
    yf.balance(),
    r ||
      bf.videoCovering ||
      (Cf ? Cf.render() : J.render(hf, gf.camera),
      ff &&
        ((uf.width !== df.width || uf.height !== df.height) &&
          ((uf.width = df.width), (uf.height = df.height)),
        ff.drawImage(df, 0, 0)),
      e > jm && ((jm = e + 700), jf()),
      Um(i)));
}
var Nm = Math.min(window.devicePixelRatio, N ? 1.5 : 2),
  Pm = Math.min(1, Nm),
  Fm = Nm,
  Im = 0,
  Lm = 0,
  Rm = 0,
  zm = 0,
  Bm = 0,
  Vm = 0;
function Hm(e) {
  ((Fm = e),
    Vm++,
    (Bm = performance.now()),
    J.setPixelRatio(e),
    Cf?.setPixelRatio(e),
    Lf(!0));
}
function Um(e) {
  if (!N || Uf !== `battle` || Z?.paused || Z?.phase !== `fight`) {
    ((Im = 0), (Lm = 0));
    return;
  }
  if (((Im += e), Lm++, Im < 4)) return;
  let t = Lm / Im;
  ((Im = 0), (Lm = 0));
  let n = performance.now() - Bm;
  if (t < 45) {
    if (((zm = 0), ++Rm < 2 || n < 3e4)) return;
    ((Rm = 0),
      Fm > Pm
        ? Hm(Math.max(Pm, Fm - 0.25))
        : wf && wf.enabled && t < 32 && (wf.enabled = !1));
  } else
    ((Rm = 0),
      (zm = t >= 58 ? zm + 4 : 0),
      zm >= 60 &&
        Fm < Nm &&
        n > 6e4 &&
        ((zm = 0), Hm(Math.min(Nm, Fm + 0.25))));
}
function Wm(e) {
  if (!N) return;
  let t = new Set(e.flatMap((e) => [...$c(e)]));
  for (let n of Di)
    if (!e.includes(n)) for (let e of $c(n)) t.has(e) || e.dispose();
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
      let a = J.info.memory,
        o = performance.memory?.usedJSHeapSize;
      e.textContent = `raf ${i.toFixed(0)} | draws ${J.info.render.calls}\nratio ${Fm} | changes ${Vm} | bloom ${wf?.enabled ? `on` : `off`}\ntex ${a.textures} | geo ${a.geometries}${o ? ` | heap ${(o / 1048576).toFixed(0)}MB` : ``}\nsize ${Mf}x${Nf} | ctx lost ${mf}`;
    }, 500));
}
(requestAnimationFrame(Mm),
  [`localhost`, `127.0.0.1`].includes(location.hostname) &&
    (window.__game = {
      get battle() {
        return Z;
      },
      get bapu() {
        return vp;
      },
      get audio() {
        return Y;
      },
      get renderer() {
        return J;
      },
      get online() {
        return Q;
      },
      get netLog() {
        return nm;
      },
      renderPortrait(e, t = 1) {
        return Vf(e, $f[e], t);
      },
      ensureCharacterModel(e) {
        return Qc(e, J);
      },
      start(e, t = `normal`, n = Kf, r) {
        (Ep(e),
          r && r !== e && (Wf = r),
          (Gf = t),
          (Kf = n),
          _f.setStage(Kf),
          Fp());
      },
    }));
