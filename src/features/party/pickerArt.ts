/**
 * Each game's little animated scene on its Play card, as the design drew it.
 * Static markup; the motion lives in `gamePicker.css` and wakes on hover.
 */
export const PICKER_ART: Record<string, string> = {
  geo: `<svg viewBox="0 0 200 200">
<circle cx="100" cy="100" r="84" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.28)" stroke-width="1.5"/>
<circle cx="100" cy="100" r="72" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="7" stroke-dasharray="1.6 17.25"/>
<circle cx="100" cy="100" r="54" fill="none" stroke="#6fe3d0" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="3 5"/>
<polygon points="100,8 105,18 100,28 95,18" fill="#6fe3d0"/>
<polygon points="192,100 182,105 172,100 182,95" fill="rgba(255,255,255,.6)"/>
<polygon points="100,192 105,182 100,172 95,182" fill="rgba(255,255,255,.6)"/>
<polygon points="8,100 18,105 28,100 18,95" fill="rgba(255,255,255,.6)"/>
<g class="a-needle"><polygon points="100,34 113,100 100,90 87,100" fill="#6fe3d0"/><polygon points="100,166 113,100 100,110 87,100" fill="rgba(255,255,255,.5)"/></g>
<circle cx="100" cy="100" r="7" fill="#1a0f12" stroke="#6fe3d0" stroke-width="2.5"/>
</svg>`,
  mafia: `<svg viewBox="0 0 520 340" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="gpCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9c9" stop-opacity=".42"/><stop offset="1" stop-color="#ffd9c9" stop-opacity="0"/></linearGradient></defs>
<g class="a-cone"><polygon points="260,-10 120,340 400,340" fill="url(#gpCone)"/></g>
<g class="a-bob" style="animation-delay:-1s"><circle cx="70" cy="224" r="22" fill="#12050a"/><path d="M20 340 C20 284 44 260 70 260 C96 260 120 284 120 340 Z" fill="#12050a"/></g>
<g class="a-bob" style="animation-delay:-3s"><circle cx="450" cy="226" r="22" fill="#12050a"/><path d="M400 340 C400 286 424 262 450 262 C476 262 500 286 500 340 Z" fill="#12050a"/></g>
<g class="a-bob" style="animation-delay:-2s"><circle cx="165" cy="206" r="24" fill="#150610"/><path d="M110 340 C110 274 138 246 165 246 C192 246 220 274 220 340 Z" fill="#150610"/></g>
<g class="a-bob" style="animation-delay:-4s"><circle cx="355" cy="208" r="24" fill="#150610"/><path d="M300 340 C300 276 328 248 355 248 C382 248 410 276 410 340 Z" fill="#150610"/></g>
<g class="a-boss"><path d="M200 340 C200 262 230 228 260 228 C290 228 320 262 320 340 Z" fill="#0d040a"/><circle cx="260" cy="188" r="27" fill="#0d040a"/><path d="M236 174 L240 142 Q260 130 280 142 L284 174 Z" fill="#070204"/><rect x="237" y="160" width="46" height="9" fill="#ff4d5e"/><ellipse cx="260" cy="175" rx="46" ry="9" fill="#070204"/><g class="a-eyes"><circle cx="249" cy="192" r="3.4" fill="#ff4d5e"/><circle cx="271" cy="192" r="3.4" fill="#ff4d5e"/></g></g>
</svg>`,
  truthdare: `<svg viewBox="0 0 200 200">
<circle cx="100" cy="100" r="86" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="1.5" stroke-dasharray="4 7"/>
<circle cx="20" cy="100" r="16" fill="#ff6f91"/><text x="20" y="106" text-anchor="middle" font-size="18" font-weight="800" fill="#2b0c1e" font-family="Bricolage Grotesque, sans-serif">T</text>
<circle cx="180" cy="100" r="16" fill="#fff4ee"/><text x="180" y="106" text-anchor="middle" font-size="18" font-weight="800" fill="#2b0c1e" font-family="Bricolage Grotesque, sans-serif">D</text>
<g class="a-bottle"><rect x="92" y="26" width="16" height="48" rx="6" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.78)" stroke-width="2"/><path d="M92 70 C92 82 78 84 78 100 L78 164 Q78 176 90 176 L110 176 Q122 176 122 164 L122 100 C122 84 108 82 108 70 Z" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.78)" stroke-width="2"/><path d="M79 132 L121 132 L121 164 Q121 175 110 175 L90 175 Q79 175 79 164 Z" fill="#ff6f91" fill-opacity=".72"/><rect x="78" y="104" width="44" height="20" fill="#ff6f91"/><rect x="94" y="18" width="12" height="10" rx="2" fill="#ff6f91"/><path d="M88 112 L112 112" stroke="#2b0c1e" stroke-width="3" stroke-linecap="round"/></g>
</svg>`,
  draw: `<svg viewBox="0 0 200 200">
<g transform="rotate(-6 100 100)"><rect x="28" y="28" width="144" height="144" rx="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.36)" stroke-width="1.5"/></g>
<rect x="80" y="16" width="40" height="16" rx="3" fill="#ffc247" fill-opacity=".9" transform="rotate(-6 100 24)"/>
<path class="a-star" d="M100 50 L129.4 140.5 L52.5 84.5 L147.5 84.5 L70.6 140.5 Z" fill="none" stroke="#ffc247" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="480" stroke-dashoffset="0"/>
<g class="a-pencil"><polygon points="0,0 5,-13 13,-5" fill="#f5deb3"/><polygon points="0,0 2.4,-6 6,-2.4" fill="#2b1a0c"/><polygon points="5,-13 13,-5 49,-41 41,-49" fill="#fff4ee"/><polygon points="41,-49 49,-41 55,-47 47,-55" fill="#ff9db0"/></g>
</svg>`,
  knowme: `<svg viewBox="0 0 200 200">
<g class="a-beat"><path d="M100 166 C38 122 28 74 62 56 C82 45 98 56 100 70 C102 56 118 45 138 56 C172 74 162 122 100 166 Z" fill="#d88bff"/><path d="M68 72 C74 64 86 64 90 74" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="5" stroke-linecap="round"/></g>
<g class="a-bubble"><rect x="124" y="10" width="58" height="42" rx="17" fill="#fff4ee"/><path d="M140 50 L133 66 L154 50 Z" fill="#fff4ee"/><text x="153" y="41" text-anchor="middle" font-size="28" font-weight="800" fill="#3f1566" font-family="Bricolage Grotesque, sans-serif">?</text></g>
<g class="a-bubble2"><rect x="12" y="116" width="48" height="36" rx="15" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/><text x="36" y="142" text-anchor="middle" font-size="24" font-weight="800" fill="#fff4ee" font-family="Bricolage Grotesque, sans-serif">!</text></g>
</svg>`,
  trivia: `<svg viewBox="0 0 200 200">
<rect x="86" y="12" width="28" height="13" rx="4" fill="rgba(255,255,255,.75)"/><rect x="95" y="24" width="10" height="14" fill="rgba(255,255,255,.75)"/>
<circle cx="100" cy="106" r="66" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.42)" stroke-width="3"/>
<circle class="a-ring" cx="100" cy="106" r="52" fill="none" stroke="#5cc8ff" stroke-width="9" stroke-linecap="round" stroke-dasharray="327" stroke-dashoffset="80" transform="rotate(-90 100 106)"/>
<g class="a-hand"><line x1="100" y1="106" x2="100" y2="64" stroke="#fff4ee" stroke-width="4.5" stroke-linecap="round"/></g>
<circle cx="100" cy="106" r="7" fill="#fff4ee"/>
<g class="a-bolt"><polygon points="152,126 130,164 146,164 138,196 170,152 152,152 162,126" fill="#ffe066"/></g>
</svg>`,
  songquiz: `<svg viewBox="0 0 300 200">
<g class="a-vinyl"><circle cx="190" cy="100" r="86" fill="#07140f" stroke="rgba(255,255,255,.22)" stroke-width="2"/><circle cx="190" cy="100" r="74" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="2"/><circle cx="190" cy="100" r="62" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="2"/><circle cx="190" cy="100" r="50" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="2"/><path d="M130 100 A60 60 0 0 1 160 48" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="3.5" stroke-linecap="round"/><path d="M250 100 A60 60 0 0 1 220 152" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3.5" stroke-linecap="round"/><circle cx="190" cy="100" r="28" fill="#4fe3a3"/><path d="M176 100 A14 14 0 0 1 204 100" fill="none" stroke="#07140f" stroke-width="3" stroke-linecap="round"/><circle cx="190" cy="100" r="5" fill="#07140f"/></g>
<rect class="eq e1" x="0" y="130" width="11" height="50" rx="5" fill="#4fe3a3"/><rect class="eq e2" x="16" y="100" width="11" height="80" rx="5" fill="#4fe3a3" fill-opacity=".85"/><rect class="eq e3" x="32" y="140" width="11" height="40" rx="5" fill="#4fe3a3"/><rect class="eq e4" x="48" y="84" width="11" height="96" rx="5" fill="#4fe3a3" fill-opacity=".85"/><rect class="eq e5" x="64" y="116" width="11" height="64" rx="5" fill="#4fe3a3"/><rect class="eq e6" x="80" y="144" width="11" height="36" rx="5" fill="#4fe3a3" fill-opacity=".85"/>
</svg>`,
  penfight: `<svg viewBox="0 0 200 200">
<line x1="12" y1="152" x2="188" y2="152" stroke="rgba(255,255,255,.32)" stroke-width="3" stroke-linecap="round"/>
<g transform="translate(14 108) rotate(-10)"><g class="a-penA"><rect x="0" y="-8" width="52" height="16" rx="8" fill="#9b8cff"/><rect x="32" y="-8" width="16" height="16" fill="rgba(10,6,40,.35)"/><rect x="6" y="-12.5" width="22" height="4" rx="2" fill="#fff4ee"/><path d="M52 -8 L70 -2.5 L70 2.5 L52 8 Z" fill="#fff4ee"/><rect x="70" y="-2.5" width="5" height="5" fill="#1a1233"/></g></g>
<g transform="translate(186 108) rotate(10) scale(-1 1)"><g class="a-penB"><rect x="0" y="-8" width="52" height="16" rx="8" fill="#e6e1ff"/><rect x="32" y="-8" width="16" height="16" fill="rgba(10,6,40,.28)"/><rect x="6" y="-12.5" width="22" height="4" rx="2" fill="#9b8cff"/><path d="M52 -8 L70 -2.5 L70 2.5 L52 8 Z" fill="#fff4ee"/><rect x="70" y="-2.5" width="5" height="5" fill="#1a1233"/></g></g>
<g class="a-spark"><polygon points="100,74 106,90 122,96 106,102 100,118 94,102 78,96 94,90" fill="#ffe066"/></g>
</svg>`,
}
