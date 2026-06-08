(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/types/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */ __turbopack_context__.s([
    "GameMode",
    ()=>GameMode,
    "PlayerRank",
    ()=>PlayerRank,
    "SnakeSkin",
    ()=>SnakeSkin,
    "SnakeTrail",
    ()=>SnakeTrail
]);
var GameMode = /*#__PURE__*/ function(GameMode) {
    GameMode["CASUAL"] = "casual";
    GameMode["RANKED"] = "ranked";
    GameMode["BATTLE_ROYALE"] = "battle_royale";
    GameMode["PRIVATE"] = "private";
    return GameMode;
}({});
var SnakeSkin = /*#__PURE__*/ function(SnakeSkin) {
    SnakeSkin["NEON_BLUE"] = "neon_blue";
    SnakeSkin["NEON_RED"] = "neon_red";
    SnakeSkin["FIRE"] = "fire";
    SnakeSkin["ICE"] = "ice";
    SnakeSkin["GALAXY"] = "galaxy";
    SnakeSkin["SHADOW"] = "shadow";
    SnakeSkin["GOLD"] = "gold";
    SnakeSkin["RAINBOW"] = "rainbow";
    return SnakeSkin;
}({});
var SnakeTrail = /*#__PURE__*/ function(SnakeTrail) {
    SnakeTrail["NONE"] = "none";
    SnakeTrail["LIGHTNING"] = "lightning";
    SnakeTrail["FIRE_TRAIL"] = "fire_trail";
    SnakeTrail["GALAXY_TRAIL"] = "galaxy_trail";
    return SnakeTrail;
}({});
var PlayerRank = /*#__PURE__*/ function(PlayerRank) {
    PlayerRank["BRONZE"] = "Bronze";
    PlayerRank["SILVER"] = "Silver";
    PlayerRank["GOLD"] = "Gold";
    PlayerRank["PLATINUM"] = "Platinum";
    PlayerRank["DIAMOND"] = "Diamond";
    PlayerRank["MASTER"] = "Master";
    PlayerRank["LEGEND"] = "Legend";
    return PlayerRank;
}({});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/SoundManager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SoundManager",
    ()=>SoundManager
]);
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */ class SoundEffectsController {
    ctx = null;
    soundEnabled = true;
    ambientOsc1 = null;
    ambientOsc2 = null;
    ambientGain = null;
    ambientFilter = null;
    lfo = null;
    constructor(){
    // Lazy initialisation to prevent console policies errors before click
    }
    initContext() {
        if (!this.ctx) {
            if ("TURBOPACK compile-time truthy", 1) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();
                }
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        if (!enabled) {
            this.stopBackgroundMusic();
        } else {
            this.startBackgroundMusic();
        }
    }
    isEnabled() {
        return this.soundEnabled;
    }
    // Generates infinite sci-fi dark cosmic ambient synthesizer soundtrack background
    startBackgroundMusic() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        // Guard duplicate instances
        if (this.ambientOsc1) return;
        try {
            const now = this.ctx.currentTime;
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.setValueAtTime(0, now);
            this.ambientGain.gain.linearRampToValueAtTime(0.04, now + 2.0); // soft 2 second fade-in
            // Primary deep drone (Triangle)
            this.ambientOsc1 = this.ctx.createOscillator();
            this.ambientOsc1.type = 'triangle';
            this.ambientOsc1.frequency.setValueAtTime(55, now); // A1 note
            // Secondary fifth drone (Sawtooth)
            this.ambientOsc2 = this.ctx.createOscillator();
            this.ambientOsc2.type = 'sawtooth';
            this.ambientOsc2.frequency.setValueAtTime(82.41, now); // E2 note for high harmony resonance
            // low pass filters to keep base range sweet and warm
            this.ambientFilter = this.ctx.createBiquadFilter();
            this.ambientFilter.type = 'lowpass';
            this.ambientFilter.frequency.setValueAtTime(140, now);
            this.ambientFilter.Q.setValueAtTime(3.5, now);
            // Low frequency modulator to gently sweep lowpass frequency back and forth
            this.lfo = this.ctx.createOscillator();
            this.lfo.type = 'sine';
            this.lfo.frequency.setValueAtTime(0.12, now); // very slow 0.12Hz sweep rate
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(45, now); // Modulation depth (+/- 45Hz)
            // Connect LFO sweep depth into ambient filter frequency
            this.lfo.connect(lfoGain);
            lfoGain.connect(this.ambientFilter.frequency);
            // Routing: Oscs -> Lowpass Filter -> Volume Gain -> Speaker output
            this.ambientOsc1.connect(this.ambientFilter);
            this.ambientOsc2.connect(this.ambientFilter);
            this.ambientFilter.connect(this.ambientGain);
            this.ambientGain.connect(this.ctx.destination);
            // Start infinite synthesis generators
            this.ambientOsc1.start(now);
            this.ambientOsc2.start(now);
            this.lfo.start(now);
        } catch (err) {
            console.warn("Failed synthesizing ambient space background music:", err);
        }
    }
    stopBackgroundMusic() {
        try {
            if (this.ambientOsc1) {
                this.ambientOsc1.stop();
                this.ambientOsc1.disconnect();
                this.ambientOsc1 = null;
            }
            if (this.ambientOsc2) {
                this.ambientOsc2.stop();
                this.ambientOsc2.disconnect();
                this.ambientOsc2 = null;
            }
            if (this.lfo) {
                this.lfo.stop();
                this.lfo.disconnect();
                this.lfo = null;
            }
            if (this.ambientGain) {
                this.ambientGain.disconnect();
                this.ambientGain = null;
            }
            if (this.ambientFilter) {
                this.ambientFilter.disconnect();
                this.ambientFilter = null;
            }
        } catch (e) {}
    }
    // Brief bright chime on picking up orbs
    playOrbEat() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }
    // Sparkly chime for premium orbs
    playPremiumOrbEat() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
        osc2.frequency.setValueAtTime(1500, now);
        osc2.frequency.exponentialRampToValueAtTime(2500, now + 0.2);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.22);
        osc2.stop(now + 0.22);
    }
    // Accelerating humming sound on boosting
    playBoost() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.3);
        // lowpass filter to make it rumble
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }
    // Deep booming low-pass thunder explosion
    playDeathExplosion() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Generate white noise node
        const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i = 0; i < bufferSize; i++){
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        // Filter to suppress high frequencies
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(25, now + 1.2);
        // Fade out volume
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        // Also blend a low sine frequency for bass drop effect
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(100, now);
        subOsc.frequency.linearRampToValueAtTime(30, now + 0.8);
        subGain.gain.setValueAtTime(0.3, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        noise.start(now);
        subOsc.start(now);
        noise.stop(now + 1.5);
        subOsc.stop(now + 0.8);
    }
    // Crystalline glowing resonance sound on shielding up
    playShieldActivate() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.5);
        // Resonance filter
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(600, now);
        bandpass.Q.setValueAtTime(8, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.52);
        osc.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.52);
    }
    // Harmonic sci-fi magnetic hover hum
    playMagnetActivate() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(300, now + 0.15);
        osc.frequency.setValueAtTime(450, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
    }
    // Retro pitch sweep when ghost mode activates
    playGhostActivate() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    }
    // Upbeat arpeggio chord of celebration!
    playVictoryArpeggio() {
        if (!this.soundEnabled) return;
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [
            261.63,
            329.63,
            392.00,
            523.25,
            659.25,
            783.99,
            1046.50
        ];
        notes.forEach((freq, idx)=>{
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.08, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.35);
        });
    }
}
const SoundManager = new SoundEffectsController();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/MainMenu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MainMenu",
    ()=>MainMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-client] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-client] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-2.js [app-client] (ecmascript) <export default as Volume2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-x.js [app-client] (ecmascript) <export default as VolumeX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/compass.js [app-client] (ecmascript) <export default as Compass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SoundManager.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const MainMenu = ({ user, onLogin, onJoinGame, soundEnabled, onToggleSound, onWatchReplay })=>{
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('play');
    // Form helpers
    const [usernameInput, setUsernameInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [clanForm, setClanForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: '',
        tag: ''
    });
    const [friendForm, setFriendForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [roomCodeInput, setRoomCodeInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isBrQueueActive, setIsBrQueueActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Loaded database endpoints state
    const [shopItems, setShopItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [leaderboards, setLeaderboards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [clansList, setClansList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [myClan, setMyClan] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [clanChatInput, setClanChatInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [friendsList, setFriendsList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [friendRequests, setFriendRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [achievements, setAchievements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [savedReplays, setSavedReplays] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // Fetch contextual features helper
    const syncServerData = async ()=>{
        if (!user) return;
        try {
            const shopRes = await fetch('/api/shop');
            if (shopRes.ok) {
                const shopData = await shopRes.json();
                setShopItems(shopData.shopItems || []);
            }
            const leadRes = await fetch('/api/leaderboards');
            if (leadRes.ok) {
                const leadData = await leadRes.json();
                setLeaderboards(leadData);
            }
            const clansRes = await fetch('/api/clans');
            if (clansRes.ok) {
                const clansData = await clansRes.json();
                setClansList(clansData || []);
                if (user.clanId) {
                    const found = clansData.find((c)=>c.id === user.clanId);
                    setMyClan(found || null);
                } else {
                    setMyClan(null);
                }
            }
            const friendsRes = await fetch(`/api/friends/${user.id}`);
            if (friendsRes.ok) {
                const friendsData = await friendsRes.json();
                setFriendsList(friendsData.friends || []);
                setFriendRequests(friendsData.requests || []);
            }
            const achRes = await fetch(`/api/achievements/${user.id}`);
            if (achRes.ok) {
                const achData = await achRes.json();
                setAchievements(achData || []);
            }
            const replayRes = await fetch('/api/replays');
            if (replayRes.ok) {
                const replayData = await replayRes.json();
                setSavedReplays(replayData || {});
            }
        } catch (e) {
            console.warn('Backend endpoints offline. Using local fallback simulation logic:', e);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MainMenu.useEffect": ()=>{
            if (user) {
                syncServerData();
            }
        }
    }["MainMenu.useEffect"], [
        user,
        activeTab
    ]);
    const handleAuthSubmit = (e)=>{
        e.preventDefault();
        if (!usernameInput.trim()) return;
        onLogin(usernameInput.trim());
    };
    const buyItem = async (itemId, cost)=>{
        if (!user || user.coins < cost) return;
        try {
            const res = await fetch('/api/shop/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    cosmeticId: itemId
                })
            });
            if (res.ok) {
                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playShieldActivate();
                syncServerData();
            } else {
                const body = await res.json();
                alert(body.error || 'Purchase failed');
            }
        } catch (e) {
            console.error(e);
        }
    };
    const equipItem = async (itemId)=>{
        if (!user) return;
        try {
            const res = await fetch('/api/shop/equip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    cosmeticId: itemId
                })
            });
            if (res.ok) {
                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playOrbEat();
                syncServerData();
            }
        } catch (e) {
            console.log(e);
        }
    };
    const createClan = async (e)=>{
        e.preventDefault();
        if (!user || !clanForm.name.trim() || !clanForm.tag.trim()) return;
        try {
            const res = await fetch('/api/clans/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    name: clanForm.name.trim(),
                    tag: clanForm.tag.trim()
                })
            });
            if (res.ok) {
                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playVictoryArpeggio();
                setClanForm({
                    name: '',
                    tag: ''
                });
                syncServerData();
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
        }
    };
    const joinClan = async (clanId)=>{
        if (!user) return;
        try {
            const res = await fetch('/api/clans/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    clanId
                })
            });
            if (res.ok) {
                syncServerData();
            } else {
                const body = await res.json();
                alert(body.error);
            }
        } catch (e) {
            console.error(e);
        }
    };
    const leaveClan = async ()=>{
        if (!user || !confirm('Are you sure you want to depart from your clan?')) return;
        try {
            const res = await fetch('/api/clans/leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id
                })
            });
            if (res.ok) {
                syncServerData();
            }
        } catch (e) {
            console.log(e);
        }
    };
    const sendClanChat = async (e)=>{
        e.preventDefault();
        if (!user || !clanChatInput.trim() || !myClan) return;
        try {
            const res = await fetch('/api/clans/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    message: clanChatInput.trim()
                })
            });
            if (res.ok) {
                setClanChatInput('');
                syncServerData();
            }
        } catch (e) {
            console.log(e);
        }
    };
    const sendFriendRequest = async (e)=>{
        e.preventDefault();
        if (!user || !friendForm.trim()) return;
        try {
            const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fromId: user.id,
                    toUsername: friendForm.trim()
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Friend request submitted successfully!');
                setFriendForm('');
                syncServerData();
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
        }
    };
    const acceptFriend = async (requestId)=>{
        try {
            const res = await fetch('/api/friends/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requestId
                })
            });
            if (res.ok) {
                syncServerData();
            }
        } catch (e) {
            console.log(e);
        }
    };
    const handleLessonRun = async (lessonName)=>{
        if (!user) return;
        try {
            const res = await fetch('/api/training/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    lessonName,
                    scoreObtained: 95
                })
            });
            if (res.ok) {
                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playVictoryArpeggio();
                syncServerData();
                onJoinGame(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].CASUAL);
            }
        } catch (e) {
            console.error(e);
        }
    };
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen bg-[#050505] text-[#e0e0e0] font-sans px-4 relative overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"
                }, void 0, false, {
                    fileName: "[project]/components/MainMenu.tsx",
                    lineNumber: 317,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-[30%] left-[20%] w-[330px] h-[330px] rounded-full bg-[#00f2ff]/10 blur-[120px] pointer-events-none"
                }, void 0, false, {
                    fileName: "[project]/components/MainMenu.tsx",
                    lineNumber: 318,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative max-w-md w-full bg-[#111112] border border-white/10 rounded-none p-8 shadow-2xl antialiased z-10 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center mb-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-14 h-14 rounded-none bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.15)]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                    className: "w-7 h-7 text-[#00f2ff]"
                                }, void 0, false, {
                                    fileName: "[project]/components/MainMenu.tsx",
                                    lineNumber: 323,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 322,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/components/MainMenu.tsx",
                            lineNumber: 321,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-black tracking-[4px] text-white uppercase mb-1",
                            children: [
                                "SNAKE ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[#00f2ff]",
                                    children: "LEGENDS"
                                }, void 0, false, {
                                    fileName: "[project]/components/MainMenu.tsx",
                                    lineNumber: 327,
                                    columnNumber: 19
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MainMenu.tsx",
                            lineNumber: 326,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[#808080] text-2xs tracking-[2px] uppercase mb-8",
                            children: "AA Multidimensional Realtime Arena"
                        }, void 0, false, {
                            fileName: "[project]/components/MainMenu.tsx",
                            lineNumber: 329,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleAuthSubmit,
                            className: "space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-[10px] font-bold text-[#808080] uppercase tracking-[1px] mb-2 font-mono",
                                            children: "Glider Callsign / Pilot Tag"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainMenu.tsx",
                                            lineNumber: 335,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            maxLength: 14,
                                            value: usernameInput,
                                            onChange: (e)=>setUsernameInput(e.target.value),
                                            placeholder: "Enter pilot tag...",
                                            className: "w-full bg-[#050505] border border-white/10 rounded-none px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] font-medium text-sm transition-all"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainMenu.tsx",
                                            lineNumber: 338,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainMenu.tsx",
                                    lineNumber: 334,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "w-full py-3.5 px-6 bg-[#00f2ff] hover:bg-[#00e1ec] active:bg-[#00c5ce] text-[#050505] font-black text-sm tracking-[2px] uppercase transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] cursor-pointer",
                                    children: "Enter Arena"
                                }, void 0, false, {
                                    fileName: "[project]/components/MainMenu.tsx",
                                    lineNumber: 348,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MainMenu.tsx",
                            lineNumber: 333,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-8 border-t border-white/5 pt-6 text-[10px] font-mono text-[#808080] uppercase tracking-[1px]",
                            children: "SYSTEM SECURITY PROTOCOLS LIVE"
                        }, void 0, false, {
                            fileName: "[project]/components/MainMenu.tsx",
                            lineNumber: 356,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/MainMenu.tsx",
                    lineNumber: 320,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/MainMenu.tsx",
            lineNumber: 316,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    const xpNeeded = user.level * 250;
    const xpPercent = Math.min(100, Math.floor(user.xp / xpNeeded * 100));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col md:flex-row h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/components/MainMenu.tsx",
                lineNumber: 369,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "w-full md:w-80 bg-[#111112] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between p-6 z-10 shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-3 mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-9 h-9 rounded-none bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                            className: "w-4.5 h-4.5 text-[#00f2ff]"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainMenu.tsx",
                                            lineNumber: 376,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 375,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg font-black tracking-[4px] text-white uppercase",
                                                children: [
                                                    "SNAKE ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#00f2ff]",
                                                        children: "LEGENDS"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 380,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 379,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] uppercase tracking-[1px] text-[#808080] font-mono block mt-0.5",
                                                children: "Cyber Arena Cockpit"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 382,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 378,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 374,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#050505] border border-white/10 rounded-none p-4 mb-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-3 mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-10 h-10 rounded-none bg-[#111112] border border-white/10 flex items-center justify-center font-bold text-sm text-[#00f2ff] font-mono",
                                                children: user.username.slice(0, 2).toUpperCase()
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 390,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "overflow-hidden",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[10px] text-[#808080] tracking-wider font-mono uppercase truncate",
                                                        children: user.selectedTitle || 'Arena Novice'
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 394,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        className: "font-bold text-sm tracking-wide text-white truncate",
                                                        children: user.username
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 397,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 393,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 389,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-3xs text-[#808080] font-mono flex justify-between mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "LEVEL ",
                                                    user.level
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 404,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    user.xp,
                                                    " / ",
                                                    xpNeeded,
                                                    " XP"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 405,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 403,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full bg-[#111112] h-1.5 overflow-hidden border border-white/5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-[#00f2ff] h-full shadow-[0_0_10px_rgba(0,242,255,0.4)]",
                                            style: {
                                                width: `${xpPercent}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainMenu.tsx",
                                            lineNumber: 408,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 407,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2 mt-4 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#111112] py-2 rounded-none border border-white/5 text-2xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "block text-[#808080] text-[9px] uppercase font-mono tracking-wider mb-0.5",
                                                        children: "Coins"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 416,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold text-[#00f2ff] font-mono",
                                                        children: [
                                                            "🪙 ",
                                                            user.coins
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 417,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 415,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#111112] py-2 rounded-none border border-white/5 text-2xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "block text-[#808080] text-[9px] uppercase font-mono tracking-wider mb-0.5",
                                                        children: "ELO Rank"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 420,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] font-mono font-black text-white tracking-wide uppercase",
                                                        children: user.rank
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 421,
                                                        columnNumber: 17
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 419,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 414,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 388,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                className: "space-y-1",
                                children: [
                                    {
                                        id: 'play',
                                        label: 'Action Arenas',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"]
                                    },
                                    {
                                        id: 'training',
                                        label: 'Academy training',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"]
                                    },
                                    {
                                        id: 'shop',
                                        label: 'Skins vault',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"]
                                    },
                                    {
                                        id: 'clans',
                                        label: 'Alliances & clans',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"]
                                    },
                                    {
                                        id: 'friends',
                                        label: 'Wingmen friends',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
                                    },
                                    {
                                        id: 'leaderboards',
                                        label: 'Top Rankings',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"]
                                    },
                                    {
                                        id: 'achievements',
                                        label: 'Achievements',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"]
                                    },
                                    {
                                        id: 'profile',
                                        label: 'Pilot Telemetry',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"]
                                    },
                                    {
                                        id: 'replays',
                                        label: 'Match Replays',
                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"]
                                    }
                                ].map((btn)=>{
                                    const Icon = btn.icon;
                                    const isSelected = activeTab === btn.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playOrbEat();
                                            setActiveTab(btn.id);
                                        },
                                        className: `w-full flex items-center space-x-3 px-5 py-3 text-xs font-semibold uppercase tracking-[1px] transition-all border-y-0 border-r-0 ${isSelected ? 'bg-[rgba(0,242,255,0.05)] border-l-2 border-l-[#00f2ff] text-white rounded-none' : 'border-l-2 border-l-transparent text-[#808080] hover:text-[#e0e0e0] hover:bg-[rgba(255,255,255,0.03)] rounded-none'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 453,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: btn.label
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 454,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, btn.id, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 441,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 426,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 373,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 pt-4 border-t border-white/10 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onToggleSound,
                                className: "p-2 ml-2 bg-[#050505] border border-white/10 hover:bg-white/5 text-[#808080] hover:text-white transition-all rounded-none",
                                title: "Toggle SFX Synth",
                                children: soundEnabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"], {
                                    className: "w-4 h-4 text-[#00f2ff]"
                                }, void 0, false, {
                                    fileName: "[project]/components/MainMenu.tsx",
                                    lineNumber: 467,
                                    columnNumber: 29
                                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__["VolumeX"], {
                                    className: "w-4 h-4 text-red-500"
                                }, void 0, false, {
                                    fileName: "[project]/components/MainMenu.tsx",
                                    lineNumber: 467,
                                    columnNumber: 78
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 462,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-3xs uppercase text-[#808080] tracking-widest font-mono",
                                children: "SECURE LINK ACTIVE"
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 469,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 461,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/MainMenu.tsx",
                lineNumber: 372,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 bg-[#050505] flex flex-col p-6 overflow-y-auto z-10 md:p-8",
                children: [
                    activeTab === 'play' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-4xl animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row justify-between items-start sm:items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-black uppercase tracking-wider text-[#00f2ff] mb-1",
                                                children: "TACTICAL DEPLOYMENT STATION"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 482,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-400 text-xs",
                                                children: "Aquire cosmic food, dodge high-speed opponents, and slither into the leaderboards."
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 485,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 481,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 sm:mt-0 p-3 bg-cyan-950/20 border border-cyan-500/20 max-w-sm w-full rounded-lg font-mono text-[11px] block",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between font-bold text-[#00f2ff] uppercase border-b border-cyan-500/20 pb-1 mb-1.5 font-sans",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"], {
                                                                className: "w-3.5 h-3.5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 493,
                                                                columnNumber: 61
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            " DAILY QUEST COMS"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 493,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "ACTIVE"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 494,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 492,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1",
                                                children: user.dailyQuests?.map((q)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `${q.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`,
                                                                children: q.description
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 499,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[#00f2ff] shrink-0",
                                                                children: [
                                                                    q.currentCount,
                                                                    "/",
                                                                    q.targetCount
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 500,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, q.id, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 498,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)))
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 496,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 491,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 480,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 hover:bg-[#111112]/90 transition-all",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-3xs uppercase tracking-[1px] px-2 py-0.5 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-none text-[#00f2ff] font-mono",
                                                                children: "Endless Lobby"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 511,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-2xs text-[#808080] font-mono",
                                                                children: "Bots online: 12"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 514,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 510,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono",
                                                        children: "Casual Sandbox"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 516,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xs text-[#808080] leading-relaxed",
                                                        children: "Test your tactical parameters, slither smoothly, vacuum up energy feeds, and destroy system bots. No ELO risk."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 517,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 509,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onJoinGame(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].CASUAL),
                                                className: "w-full py-2.5 bg-[#111112] hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/40 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer rounded-none",
                                                children: "Bridge Casual Gate"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 521,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 508,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 hover:bg-[#111112]/90 transition-all",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-3xs uppercase tracking-[1px] px-2 py-0.5 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-none text-[#00f2ff] font-mono",
                                                                children: "Competitive Orbit"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 532,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-2xs text-[#808080] font-mono",
                                                                children: [
                                                                    "My RP Points: ",
                                                                    user.rankPoints
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 535,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 531,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono",
                                                        children: "Ranked League"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 537,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xs text-[#808080] leading-relaxed",
                                                        children: "Intense ladder matchmaking. Scale placement matches up through Bronze, Platinum, Master, up to Legend."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 538,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 530,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onJoinGame(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].RANKED),
                                                className: "w-full py-2.5 bg-[#111112] hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/40 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer rounded-none",
                                                children: "Inbound Ranked Arena"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 542,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 529,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 hover:bg-[#111112]/90 transition-all",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-3xs uppercase tracking-[1px] px-2 py-0.5 bg-red-950/20 border border-red-500/30 rounded-none text-red-400 font-mono",
                                                                children: "COLLAPSIBLE MATRIX"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 553,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-2xs text-[#808080] font-mono",
                                                                children: "Prize: 🪙 500 Credits"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 556,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 552,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono",
                                                        children: "Battle Royale Collapse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 558,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xs text-[#808080] leading-relaxed",
                                                        children: "Survive inside a collapsing solar radiation storm grid limits! Fight off other gliders to capture massive coin checks."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 559,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 551,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setIsBrQueueActive(true);
                                                    setTimeout(()=>{
                                                        onJoinGame(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].BATTLE_ROYALE);
                                                        setIsBrQueueActive(false);
                                                    }, 1200);
                                                },
                                                disabled: isBrQueueActive,
                                                className: "w-full py-2.5 bg-[#111112] hover:bg-red-500/10 hover:border-red-500/40 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer rounded-none",
                                                children: isBrQueueActive ? 'DEPRESSURIZING LAUNCH TUBES...' : 'Engage Survival Lock'
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 563,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 550,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 hover:bg-[#111112]/90 transition-all",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-3xs uppercase tracking-[1px] px-2 py-0.5 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-none text-[#00f2ff] font-mono",
                                                        children: "Hangar Codes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 580,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-sm font-bold text-white uppercase tracking-wider mt-2 mb-2 font-mono",
                                                        children: "Private Duel Cells"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 583,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xs text-[#808080] leading-relaxed mb-3",
                                                        children: "Input an encryption key below to bridge into secure sandbox spaces with invited comrades."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 584,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: roomCodeInput,
                                                        onChange: (e)=>setRoomCodeInput(e.target.value.toUpperCase()),
                                                        placeholder: "ENTER SECURE PRIVATE CODE...",
                                                        className: "w-full bg-[#050505] border border-white/10 rounded-none px-3 py-2 text-2xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00f2ff] uppercase font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 588,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 579,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            const code = `DUEL_${Math.floor(100 + Math.random() * 900)}`;
                                                            onJoinGame(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].PRIVATE, code);
                                                        },
                                                        className: "py-2.5 bg-[#111112] hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/40 text-white border border-white/10 font-bold text-2xs uppercase tracking-wider transition-all cursor-pointer rounded-none",
                                                        children: "Host Cell"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 597,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            if (!roomCodeInput.trim()) return alert('Input room code protocol first');
                                                            onJoinGame(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].PRIVATE, roomCodeInput.trim());
                                                        },
                                                        className: "py-2.5 bg-[#050505] hover:bg-white/5 text-white border border-white/10 font-bold text-2xs uppercase tracking-wider transition-all cursor-pointer rounded-none",
                                                        children: "Join Cell"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 606,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 596,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 578,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 507,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 479,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'training' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-4xl animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-black uppercase tracking-wider text-green-400 mb-1",
                                        children: "COMBAT EXPEDITIONS ACADEMY"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 625,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-xs",
                                        children: "Refine combat schools of slither, collect safe XP runs, and test advanced dash propulsion. No ranked drop penalties."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 628,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 624,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                children: [
                                    {
                                        name: 'Movement School',
                                        desc: 'Master low-level kinematics, sub-millisecond turning mechanics, and virtual joystick sensitivity bounds.',
                                        reward: 'XP +120, Credits +40'
                                    },
                                    {
                                        name: 'Combat School',
                                        desc: 'Secure bot captures by using fast dash wrap-arounds and advanced shield trapping envelopes.',
                                        reward: 'XP +120, Credits +40'
                                    },
                                    {
                                        name: 'Survival School',
                                        desc: 'Evade collapsing red Battle Royale solar storm matrices and practice centering mechanics.',
                                        reward: 'XP +120, Credits +40'
                                    },
                                    {
                                        name: 'Advanced Techniques',
                                        desc: 'Maximize magnet pickup ranges, master speed boost-decay curves, and lock stealth ghost runs.',
                                        reward: 'XP +120, Credits +40'
                                    }
                                ].map((school)=>{
                                    const completeData = user.academyProgress?.[school.name];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#0b1008] border border-green-500/20 p-5 rounded-none hover:border-green-400/40 transition-all flex flex-col justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-3xs uppercase tracking-widest bg-green-500/10 text-green-400 font-mono px-2 py-0.5 border border-green-500/20",
                                                                children: "SCHOOL MODULE"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 648,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            completeData?.completed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-3xs font-extrabold uppercase font-mono text-green-400 flex items-center gap-1 animate-pulse",
                                                                children: "★ COMPLETED"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 652,
                                                                columnNumber: 27
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 647,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        className: "font-bold text-sm text-gray-200 mt-1 mb-2 font-mono uppercase",
                                                        children: school.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 657,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xs text-gray-400 leading-relaxed",
                                                        children: school.desc
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 658,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 646,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-4 pt-3 border-t border-green-500/10 flex justify-between items-center flex-wrap sm:flex-nowrap gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-3xs text-yellow-500 font-mono uppercase",
                                                        children: [
                                                            "🎁 ",
                                                            school.reward
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 662,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleLessonRun(school.name),
                                                        className: "px-4 py-1.5 bg-green-600 hover:bg-green-500 text-black font-black text-3xs uppercase tracking-wider rounded-none",
                                                        children: "ENGAGE MODULE"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 663,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 661,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, school.name, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 642,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 633,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 623,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'shop' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-5xl animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row justify-between items-start sm:items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-black uppercase tracking-wider text-yellow-400 mb-1",
                                                children: "COSMETIC VAULT DEPLOYMENT"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 682,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-400 text-xs",
                                                children: "Redigitize your slither appearance with premium skins and exhaust fuels."
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 685,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 681,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 sm:mt-0 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-yellow-400 font-mono font-bold text-sm",
                                        children: [
                                            "🪙 ",
                                            user.coins,
                                            " CREDITS"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 689,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 680,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-bold text-cyan-400 tracking-wider uppercase border-b border-[#1c223c] pb-2 font-mono",
                                children: "Neon Skin Shells"
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 694,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
                                children: shopItems.filter((item)=>item.type === 'skin').map((item)=>{
                                    const owned = user.ownedCosmetics.includes(item.id);
                                    const equipped = item.value === user.selectedSkin || item.value === 'neon_blue' && user.selectedSkin === 'neon_blue';
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#070918] border border-[#17214d] rounded-xl p-4 flex flex-col justify-between text-center hover:border-cyan-500/30 transition-all duration-300",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-3xs uppercase tracking-widest font-black px-2 py-0.5 rounded font-mono ${item.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/25' : item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/25' : item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/25' : 'bg-gray-500/20 text-gray-400 border border-gray-500/25'}`,
                                                        children: item.rarity
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 712,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        className: "font-bold text-[#e2e8f0] text-[13px] tracking-wide mt-3 truncate font-sans uppercase",
                                                        children: item.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 722,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-10 h-10 rounded-full mx-auto my-3",
                                                        style: {
                                                            backgroundColor: item.value === 'neon_red' ? '#f43f5e' : item.value === 'fire' ? '#ea580c' : item.value === 'ice' ? '#06b6d4' : item.value === 'galaxy' ? '#a855f7' : item.value === 'shadow' ? '#1f2937' : item.value === 'gold' ? '#eab308' : item.value === 'rainbow' ? '#ec4899' : '#3b82f6',
                                                            boxShadow: `0 0 12px ${item.value === 'neon_red' ? '#f43f5e' : '#3b82f6'}`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 725,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 711,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            equipped ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block w-full py-2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-2xs font-extrabold uppercase rounded-lg",
                                                children: "EQUIPPED"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 741,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)) : owned ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>equipItem(item.id),
                                                className: "w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/30 text-2xs font-bold uppercase rounded-lg transition-all",
                                                children: "EQUIP"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 745,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>buyItem(item.id, item.cost),
                                                disabled: user.coins < item.cost,
                                                className: "w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-2xs font-black uppercase rounded-lg transition-all disabled:opacity-50",
                                                children: [
                                                    "🪙 ",
                                                    item.cost,
                                                    " COINS"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 752,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 707,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 697,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-bold text-purple-400 tracking-wider uppercase border-b border-[#1c223c] pb-2 pt-4 font-mono",
                                children: "Glowing Engine Exhausts Trails"
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 765,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
                                children: shopItems.filter((item)=>item.type === 'trail').map((item)=>{
                                    const owned = user.ownedCosmetics.includes(item.id);
                                    const equipped = item.value === user.selectedTrail;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#070918] border border-[#17214d] rounded-xl p-4 flex flex-col justify-between text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-3xs tracking-widest uppercase font-mono px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded",
                                                        children: item.rarity
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 781,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        className: "font-extrabold text-sm tracking-wide mt-2 mb-2 font-sans uppercase text-gray-200",
                                                        children: item.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 784,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 780,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            equipped ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "py-2 bg-emerald-950 text-emerald-400 text-2xs font-bold rounded-lg border border-emerald-500/20 tracking-wider",
                                                children: "ACTIVE ENGINE"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 790,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)) : owned ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>equipItem(item.id),
                                                className: "py-2 bg-[#091533] hover:bg-[#12234f] text-cyan-400 border border-cyan-500/20 text-2xs font-extrabold rounded-lg tracking-wider transition-all",
                                                children: "ACTIVATE"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 794,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>buyItem(item.id, item.cost),
                                                disabled: user.coins < item.cost,
                                                className: "py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-2xs font-extrabold rounded-lg tracking-wider transition-all disabled:opacity-50",
                                                children: [
                                                    "🪙 ",
                                                    item.cost,
                                                    " COINS"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 801,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 776,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 768,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 679,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'clans' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-5xl animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1",
                                        children: "ALLIANCES & GUILDS CLANS"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 820,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-xs",
                                        children: "Incorporate custom snake alliances, rank on leaderboards, and communicate in secure clan lines."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 823,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 819,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            myClan ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "lg:col-span-1 space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#080b18] border border-cyan-500/30 p-5 rounded-xl text-center space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-3xs uppercase tracking-widest px-2.5 py-1 bg-cyan-950 text-cyan-400 rounded-full font-mono font-bold",
                                                        children: "⚔️ CLAN CHANNEL OPENED"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 832,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-xl font-extrabold text-slate-100 font-mono",
                                                        children: [
                                                            myClan.name,
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-cyan-400 font-mono",
                                                                children: [
                                                                    "[",
                                                                    myClan.tag,
                                                                    "]"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 836,
                                                                columnNumber: 37
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 835,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xs text-[#7c89ba] font-mono",
                                                        children: [
                                                            "Established by ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                                className: "text-indigo-400",
                                                                children: myClan.leaderName
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 839,
                                                                columnNumber: 38
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            ". Rank Points accumulated: ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                                children: myClan.rankPoints
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 839,
                                                                columnNumber: 119
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            "."
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 838,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: leaveClan,
                                                        className: "w-full mt-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 text-red-400 font-bold text-2xs uppercase tracking-wider transition-all",
                                                        children: "Leave Alliance"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 841,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 831,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#080b18] border border-[#17214a] p-4 rounded-xl",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        className: "text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-[#1b2559] pb-2 mb-3",
                                                        children: [
                                                            "Clan Pilots Manifest (",
                                                            myClan.members?.length || 1,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 850,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2 max-h-60 overflow-y-auto",
                                                        children: myClan.members?.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between items-center text-xs font-mono",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-bold",
                                                                        children: m.username
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 856,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-3xs uppercase bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/10",
                                                                        children: m.role
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 857,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, m.userId, true, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 855,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0)))
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 853,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 849,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 830,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "lg:col-span-2 bg-[#060815] border border-[#16214f] rounded-xl flex flex-col justify-between h-[450px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-4 border-b border-[#141b41] font-sans text-xs",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                    className: "font-bold uppercase tracking-wider text-green-400",
                                                    children: "🛰️ Decrypted coms link"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/MainMenu.tsx",
                                                    lineNumber: 868,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 867,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs",
                                                children: [
                                                    myClan.chat && myClan.chat.map((msg, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-[#0b0f2a] p-2.5 rounded-lg border border-[#1b255c]/25",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex justify-between items-center mb-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "font-bold text-cyan-400",
                                                                            children: [
                                                                                "[",
                                                                                msg.username,
                                                                                "]:"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 877,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-3xs text-gray-500 font-sans",
                                                                            children: msg.timestamp
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 878,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 876,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-300 break-words font-sans text-xs",
                                                                    children: msg.message
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 880,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, idx, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 875,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))),
                                                    (!myClan.chat || myClan.chat.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full flex items-center justify-center text-gray-500 text-xs",
                                                        children: "Signal quiet..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 884,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 873,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                onSubmit: sendClanChat,
                                                className: "p-3 border-t border-[#141b41] flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        maxLength: 120,
                                                        value: clanChatInput,
                                                        onChange: (e)=>setClanChatInput(e.target.value),
                                                        placeholder: "BROADCAST SECURE CLAN PACKET...",
                                                        className: "flex-1 bg-[#03040c] border border-[#1c295c] rounded px-3 py-2 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500 text-white font-mono"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 891,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        className: "p-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 903,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 899,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 890,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 866,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 829,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "md:col-span-1 bg-[#080b18] border border-[#17224e] p-5 rounded-xl h-fit space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-base font-extrabold uppercase tracking-wide border-b border-[#1e2c65] pb-2 font-mono",
                                                children: "Form Alliance"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 911,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-2xs text-[#7c89ba] leading-normal font-mono",
                                                children: "Forms an alliance Corp. Costs 🪙 100 Credits to construct telemetry hubs. Join up with wingmen in private chats!"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 914,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                onSubmit: createClan,
                                                className: "space-y-4 font-mono text-2xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-3xs text-cyan-400 tracking-wider uppercase mb-1.5",
                                                                children: "Strategic Alliance Name"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 920,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                maxLength: 18,
                                                                value: clanForm.name,
                                                                onChange: (e)=>setClanForm({
                                                                        ...clanForm,
                                                                        name: e.target.value
                                                                    }),
                                                                placeholder: "ENTER ALLIANCES NAME...",
                                                                className: "w-full bg-[#03040a] border border-[#233575] rounded px-3 py-2 text-xs"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 923,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 919,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-3xs text-cyan-400 tracking-wider uppercase mb-1.5",
                                                                children: "Unique alliance tag (Max 4 characters)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 933,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                maxLength: 4,
                                                                value: clanForm.tag,
                                                                onChange: (e)=>setClanForm({
                                                                        ...clanForm,
                                                                        tag: e.target.value
                                                                    }),
                                                                placeholder: "TAG...",
                                                                className: "w-full bg-[#03040a] border border-[#233575] rounded px-3 py-2 text-xs uppercase text-white font-mono"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 936,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 932,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        disabled: user.coins < 100,
                                                        className: "w-full py-2.5 rounded bg-yellow-400 text-black hover:bg-yellow-300 font-extrabold text-2xs uppercase tracking-widest transition-all disabled:opacity-50",
                                                        children: "Exchange Coins (100)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 946,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 918,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 910,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "md:col-span-2 bg-[#080b18] border border-[#17224e] p-5 rounded-xl space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-base font-extrabold uppercase tracking-wide border-b border-[#1e2c65] pb-2 font-mono",
                                                children: "Coalition Registry"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 957,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2.5 max-h-[350px] overflow-y-auto",
                                                children: [
                                                    clansList && clansList.map((clan)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-[#0b0f2b] p-4 rounded-lg border border-[#18245a] flex justify-between items-center font-mono text-xs",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                            className: "font-bold text-sm",
                                                                            children: [
                                                                                clan.name,
                                                                                " ",
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-indigo-400 font-mono",
                                                                                    children: [
                                                                                        "[",
                                                                                        clan.tag,
                                                                                        "]"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                                    lineNumber: 969,
                                                                                    columnNumber: 41
                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 968,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-2xs text-gray-400 font-mono block mt-1",
                                                                            children: [
                                                                                "Led by ",
                                                                                clan.leaderName,
                                                                                " • ",
                                                                                clan.members?.length || 1,
                                                                                " Wingmen • RP Level: ",
                                                                                clan.rankPoints
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 971,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 967,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>joinClan(clan.id),
                                                                    className: "px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold uppercase text-3xs tracking-wider rounded-none",
                                                                    children: "Join alliance"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 975,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, clan.id, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 963,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))),
                                                    clansList.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center py-12 text-gray-500 font-mono",
                                                        children: "No tactical alliances formed yet on current sectors."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 984,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 961,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 956,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 909,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 818,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'friends' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-4xl animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-black uppercase tracking-wider text-indigo-400 mb-1",
                                        children: "WINGMEN CONNECTIONS HUB"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 999,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-xs",
                                        children: "Enlist slither compatriots, audit active online telemetry, and submit requests below."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1002,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 998,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-1 bg-[#090b16] border border-indigo-500/20 p-5 rounded-none h-fit space-y-3 font-mono text-2xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "font-bold uppercase tracking-wide text-indigo-400 border-b border-indigo-500/10 pb-2",
                                                children: "Enlist Wingman"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1009,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                onSubmit: sendFriendRequest,
                                                className: "space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: friendForm,
                                                        onChange: (e)=>setFriendForm(e.target.value),
                                                        placeholder: "ENTER PILOT CALLSIGN...",
                                                        className: "w-full bg-[#03040c] border border-indigo-500/30 rounded px-2.5 py-2 text-2xs text-white uppercase placeholder-gray-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1013,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        className: "w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-3xs uppercase tracking-wider",
                                                        children: "Submit Enlist Request"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1020,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1012,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            friendRequests.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pt-4 space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                        className: "font-bold uppercase tracking-wide text-indigo-450 border-b border-indigo-500/10 pb-1 flex justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "INBOUND SIGNALS"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 1031,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-yellow-500 animate-pulse",
                                                                children: "(!)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 1032,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1030,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    friendRequests.map((req)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-[#0c0e1e] p-2 border border-indigo-500/15 flex justify-between items-center rounded-lg",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-bold text-gray-300 truncate max-w-[120px]",
                                                                    children: req.fromName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1036,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>acceptFriend(req.id),
                                                                    className: "px-2 py-1 bg-green-600 hover:bg-green-500 text-black font-black text-3xs uppercase",
                                                                    children: "Enlist"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1037,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, req.id, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1035,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1029,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1008,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "col-span-2 bg-[#090b16] border border-indigo-500/20 p-5 rounded-none h-fit space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "font-bold text-sm uppercase tracking-wider text-gray-300 border-b border-white/5 pb-2",
                                                children: "Holographic Friends Grid"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1050,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto",
                                                children: [
                                                    friendsList.map((friend)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-[#05060f] border border-[#1b2554]/45 p-4 rounded-xl flex items-center space-x-3.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "relative shrink-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "w-10 h-10 rounded-full bg-indigo-950 font-bold border border-indigo-500/25 flex items-center justify-center font-mono",
                                                                            children: friend.username.slice(0, 2).toUpperCase()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 1061,
                                                                            columnNumber: 25
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: `absolute bottom-0 right-0 w-3 h-3 border-2 border-indigo-950 rounded-full ${friend.status === 'online' ? 'bg-emerald-400' : 'bg-gray-500'}`
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 1064,
                                                                            columnNumber: 25
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1060,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "overflow-hidden",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                                            className: "font-bold text-sm truncate",
                                                                            children: friend.username
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 1071,
                                                                            columnNumber: 25
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                                            className: "text-3xs text-gray-400 font-mono flex gap-2.5 mt-1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                                    children: [
                                                                                        "LV ",
                                                                                        friend.level
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                                    lineNumber: 1073,
                                                                                    columnNumber: 27
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                                    className: "text-[#00f2ff]",
                                                                                    children: friend.rank
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                                    lineNumber: 1074,
                                                                                    columnNumber: 27
                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 1072,
                                                                            columnNumber: 25
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1070,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, friend.friendId, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1056,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))),
                                                    friendsList.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "col-span-2 text-center py-16 text-gray-500 font-mono",
                                                        children: "No wingmen linked inside sector index files yet."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1080,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1054,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1049,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1007,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 997,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'leaderboards' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-5xl animate-fade-in font-mono text-2xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-black uppercase tracking-wider text-indigo-400 mb-1 font-sans",
                                        children: "GLOBAL LEADERBOARDS"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1094,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-xs font-sans",
                                        children: "Audit elite gliders, longest loops recorded, high-density scores, and global coalition alliances."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1097,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1093,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#080d1e] border border-indigo-550/20 p-4 rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-xs font-extrabold uppercase text-gray-200 border-b border-indigo-550/15 pb-2 mb-3 flex justify-between font-sans",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "HIGH LEVEL PILOTS"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1106,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#00f2ff]",
                                                        children: "LV / XP"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1107,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1105,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1",
                                                children: [
                                                    leaderboards?.global?.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between items-center py-1 border-b border-white/5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[#80c0ff] font-bold",
                                                                    children: [
                                                                        "0",
                                                                        idx + 1,
                                                                        ". ",
                                                                        item.username
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1112,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-bold text-[#00f2ff]",
                                                                    children: [
                                                                        "LV ",
                                                                        item.level
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1113,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, item.id, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1111,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))),
                                                    (!leaderboards?.global || leaderboards.global.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center py-12 text-gray-500",
                                                        children: "Scanning satellite telemetry files..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1117,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1109,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1104,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#080d1e] border border-indigo-550/20 p-4 rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-xs font-extrabold uppercase text-gray-200 border-b border-indigo-550/15 pb-2 mb-3 flex justify-between font-sans",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "HIGH DENSITY MASS"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1125,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-green-400",
                                                        children: "RECORD HP"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1126,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1124,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1",
                                                children: [
                                                    leaderboards?.scores?.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between items-center py-1 border-b border-white/5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-emerald-400 font-bold",
                                                                    children: [
                                                                        "0",
                                                                        idx + 1,
                                                                        ". ",
                                                                        item.username
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1131,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-bold text-white",
                                                                    children: [
                                                                        item.stats.highestScore,
                                                                        " HP"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1132,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, item.id, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1130,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))),
                                                    (!leaderboards?.scores || leaderboards.scores.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center py-12 text-gray-500",
                                                        children: "Retrieving density stats..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1136,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1128,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1123,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#080d1e] border border-indigo-550/20 p-4 rounded-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-xs font-extrabold uppercase text-gray-200 border-b border-indigo-550/15 pb-2 mb-3 flex justify-between font-sans",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "ALLIANCES ALL-STARS"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1144,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-indigo-400",
                                                        children: "RP LEVEL"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1145,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1143,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1",
                                                children: [
                                                    leaderboards?.clans?.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between items-center py-1 border-b border-white/5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-yellow-500 font-bold",
                                                                    children: [
                                                                        "0",
                                                                        idx + 1,
                                                                        ". ",
                                                                        item.name,
                                                                        " [",
                                                                        item.tag,
                                                                        "]"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1150,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-bold text-white",
                                                                    children: [
                                                                        item.rankPoints,
                                                                        " RP"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1151,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, item.id, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1149,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))),
                                                    (!leaderboards?.clans || leaderboards.clans.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-center py-12 text-gray-500",
                                                        children: "Scanning guild databases..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1155,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1147,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1142,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1102,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 1092,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'achievements' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-4xl animate-fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-black uppercase tracking-wider text-[#00f2ff] mb-1",
                                        children: "HALL OF COSMIC ACHIEVEMENT"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1167,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-xs",
                                        children: "Review telemetry goals, unlock credit payouts, and level badges."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1170,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1166,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2.5",
                                children: [
                                    achievements && achievements.map((ach)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-4 rounded-none border flex justify-between items-center ${ach.unlockedAt ? 'bg-cyan-950/20 border-cyan-500/25' : 'bg-[#111112] border-white/5'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-3.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `p-2 bg-black/40 border ${ach.unlockedAt ? 'border-cyan-500/20 text-[#00f2ff]' : 'border-white/5 text-gray-500'}`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                                                className: "w-5 h-5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 1187,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1186,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "text-sm font-bold tracking-wide uppercase text-gray-300",
                                                                    children: ach.title
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1190,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-2xs text-[#808080] leading-snug mt-0.5",
                                                                    children: ach.description
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/MainMenu.tsx",
                                                                    lineNumber: 1191,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1189,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/MainMenu.tsx",
                                                    lineNumber: 1185,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "shrink-0 text-right font-mono text-2xs space-y-1",
                                                    children: [
                                                        ach.unlockedAt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-cyan-400 font-black tracking-widest text-3xs uppercase bg-black/40 border border-cyan-500/10 px-2 py-0.5 rounded-full inline-block",
                                                            children: "★ COMPLETED"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1197,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-500 tracking-widest text-3xs uppercase font-sans",
                                                            children: [
                                                                Math.floor(ach.progressCurrent),
                                                                "/",
                                                                ach.progressMax,
                                                                " IN PROCESS"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1201,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-yellow-500 font-bold",
                                                            children: [
                                                                "🪙 +",
                                                                ach.coinReward,
                                                                " CREDITS"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/MainMenu.tsx",
                                                            lineNumber: 1205,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/MainMenu.tsx",
                                                    lineNumber: 1195,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, ach.id, true, {
                                            fileName: "[project]/components/MainMenu.tsx",
                                            lineNumber: 1177,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))),
                                    achievements.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center py-24 text-gray-500 font-mono",
                                        children: "Loading pilot award registries..."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1210,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1175,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 1165,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'profile' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-3xl animate-fade-in font-mono text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1 font-sans",
                                        children: "TELEMETRY DIAGNOSTICS"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1222,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-xs font-sans",
                                        children: "Audit system values, slither lengths, combat statistics, and pilot accounts records."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1225,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1221,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#0c0d16] border border-cyan-500/20 p-6 rounded-none space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-cyan-500/10 pb-2 flex justify-between font-sans",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "PILOT STATS HISTORIC FILE"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1232,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#00f2ff]",
                                                children: "DECRYPTED"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1233,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1231,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 md:grid-cols-3 gap-4 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#050505] border border-white/5 p-4 py-3.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#808080] block text-3xs uppercase tracking-wider",
                                                        children: "TOTAL KILLS SECURED"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1238,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-white tracking-wider",
                                                        children: [
                                                            user.stats.kills,
                                                            " SECURED"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1239,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1237,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#050505] border border-white/5 p-4 py-3.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#808080] block text-3xs uppercase tracking-wider",
                                                        children: "ARENA CHIPS EXCLUDED"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1242,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-white tracking-wider",
                                                        children: [
                                                            user.stats.deaths,
                                                            " EXPIRED"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1243,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1241,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#050505] border border-white/5 p-4 py-3.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#808080] block text-3xs uppercase tracking-wider",
                                                        children: "VICTORIES CONQUERED"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1246,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-white tracking-wider",
                                                        children: [
                                                            user.stats.wins,
                                                            " WINS"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1247,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1245,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#050505] border border-white/5 p-4 py-3.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#808080] block text-3xs uppercase tracking-wider",
                                                        children: "MAX ENERGY MASS RECORD"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1250,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-emerald-400 tracking-wider font-mono",
                                                        children: [
                                                            user.stats.highestScore,
                                                            " HP"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1251,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1249,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#050505] border border-white/5 p-4 py-3.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#808080] block text-3xs uppercase tracking-wider",
                                                        children: "TOTAL COSMIC ORBS"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1254,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-white tracking-wider",
                                                        children: [
                                                            user.stats.orbsCollected,
                                                            " ORBS"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1255,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1253,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-[#050505] border border-white/5 p-4 py-3.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#808080] block text-3xs uppercase tracking-wider",
                                                        children: "PILOTING EXPERIENCE"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1258,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-[#00f2ff] tracking-wider",
                                                        children: [
                                                            "RANK ",
                                                            user.rank
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1259,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1257,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1236,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t border-cyan-500/10 pt-4 text-3xs text-gray-500 uppercase flex justify-between tracking-widest font-sans",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Account file created: ",
                                                    user.createdAt || 'N/A'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1264,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "ID: ",
                                                    user.id
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1265,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1263,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1230,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 1220,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    activeTab === 'replays' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6 max-w-4xl animate-fade-in font-mono text-xs text-slate-300",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-black uppercase tracking-wider text-[#00f2ff] mb-1 font-sans",
                                        children: "TACTICAL REPLAYS LOG"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1275,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-xs font-sans",
                                        children: "Access stored holographic match highlights. Reconstruct player slithers, disintegrations and flight vectors locally."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1278,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1274,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#0c0d16] border border-[#00f2ff]/20 p-5 rounded-none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-[#00f2ff]/10 pb-2 flex justify-between font-sans mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "AUTHENTIC MATCH CHANNELS"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1285,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#00f2ff]",
                                                children: "ARCHIVE LIVE"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1286,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1284,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    Object.keys(savedReplays).length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center py-16 text-gray-500 font-sans uppercase tracking-widest bg-black/40 border border-white/5 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-black text-gray-450",
                                                children: "no stored tapes compiled"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1291,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-2xs text-gray-600",
                                                children: "Replays are recorded automatically during matches upon eliminations!"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1292,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1290,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: Object.values(savedReplays).map((replay)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-black/50 border border-white/5 hover:border-[#00f2ff]/30 p-4 relative flex flex-col justify-between transition-all group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between items-start font-sans",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] font-black tracking-widest text-[#00f2ff] uppercase",
                                                                        children: [
                                                                            replay.mode.replace('_', ' '),
                                                                            " MODE"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 1303,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] text-gray-500 font-mono",
                                                                        children: replay.date
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 1306,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 1302,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "border-[#00f2ff]/5 bg-black/30 border p-2 text-2xs truncate",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-gray-500",
                                                                        children: "WINNER: "
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 1312,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-emerald-400 font-black",
                                                                        children: replay.winnerName.toUpperCase()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 1313,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 1311,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-3xs text-gray-500 flex justify-between",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            "SNAPSHOTS: ",
                                                                            replay.frames?.length || 0,
                                                                            " TILES"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 1317,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            "INCIDENTS: ",
                                                                            replay.events?.length || 0,
                                                                            " LOGS"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 1318,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 1316,
                                                                columnNumber: 25
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            replay.events && replay.events.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-3 bg-red-950/20 border border-red-500/15 p-2 text-[10px] font-mono text-red-300 max-h-16 overflow-y-auto",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[9px] uppercase text-red-400 font-bold block mb-1",
                                                                        children: "ELIMINATIONS STATE"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/MainMenu.tsx",
                                                                        lineNumber: 1323,
                                                                        columnNumber: 29
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    replay.events.map((ev, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "truncate",
                                                                            children: [
                                                                                "• [T+",
                                                                                ev.tick,
                                                                                "] ",
                                                                                ev.desc
                                                                            ]
                                                                        }, idx, true, {
                                                                            fileName: "[project]/components/MainMenu.tsx",
                                                                            lineNumber: 1325,
                                                                            columnNumber: 31
                                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/MainMenu.tsx",
                                                                lineNumber: 1322,
                                                                columnNumber: 27
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1301,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            if (onWatchReplay) {
                                                                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playVictoryArpeggio();
                                                                onWatchReplay(replay.matchId);
                                                            }
                                                        },
                                                        className: "mt-4 w-full py-2.5 bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-500/35 text-white hover:border-[#00f2ff] hover:from-cyan-900 font-sans font-bold text-center uppercase tracking-widest transition-all text-3xs cursor-pointer",
                                                        children: "LAUNCH RECODE SPECTATE"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainMenu.tsx",
                                                        lineNumber: 1333,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, replay.matchId, true, {
                                                fileName: "[project]/components/MainMenu.tsx",
                                                lineNumber: 1297,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainMenu.tsx",
                                        lineNumber: 1295,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainMenu.tsx",
                                lineNumber: 1283,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainMenu.tsx",
                        lineNumber: 1273,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/MainMenu.tsx",
                lineNumber: 476,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/MainMenu.tsx",
        lineNumber: 368,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(MainMenu, "drMMx965MxS9kne6cyY5CuK7I4Y=");
_c = MainMenu;
var _c;
__turbopack_context__.k.register(_c, "MainMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/GameCanvas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameCanvas",
    ()=>GameCanvas,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SoundManager.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const GameCanvas = ({ players, orbs, localPlayerId, mode, brZoneRadius, brCenter, onInputChange })=>{
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Local state tracking
    const [dimensions, setDimensions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: 800,
        height: 600
    });
    const [joystickPos, setJoystickPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        active: false,
        startX: 0,
        startY: 0,
        curX: 0,
        curY: 0
    });
    const stateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        players,
        orbs,
        localPlayerId,
        interpolatedPlayers: {},
        shaker: {
            intensity: 0,
            decay: 0.9
        },
        particles: [],
        scores: [],
        lastLocalScore: 10,
        lastActiveKills: 0,
        nebulaOffset: 0
    });
    const isBoostingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Dynamic window resizing with ResizeObserver
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameCanvas.useEffect": ()=>{
            if (!containerRef.current) return;
            const observer = new ResizeObserver({
                "GameCanvas.useEffect": (entries)=>{
                    for (const entry of entries){
                        setDimensions({
                            width: entry.contentRect.width,
                            height: entry.contentRect.height
                        });
                    }
                }
            }["GameCanvas.useEffect"]);
            observer.observe(containerRef.current);
            return ({
                "GameCanvas.useEffect": ()=>observer.disconnect()
            })["GameCanvas.useEffect"];
        }
    }["GameCanvas.useEffect"], []);
    // Synchronise socket updates to canvas engine state refs
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameCanvas.useEffect": ()=>{
            stateRef.current.players = players;
            stateRef.current.orbs = orbs;
            stateRef.current.localPlayerId = localPlayerId;
            if (localPlayerId && players[localPlayerId]) {
                const p = players[localPlayerId];
                if (p.score > stateRef.current.lastLocalScore) {
                    const diff = p.score - stateRef.current.lastLocalScore;
                    if (diff > 3) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playPremiumOrbEat();
                    } else {
                        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playOrbEat();
                    }
                    stateRef.current.scores.push({
                        id: `score_${Date.now()}_${Math.random()}`,
                        x: p.x + (Math.random() - 0.5) * 30,
                        y: p.y - 20,
                        text: `+${diff}`,
                        color: '#34d399',
                        opacity: 1,
                        age: 0
                    });
                    stateRef.current.lastLocalScore = p.score;
                }
                if (p.isDead && stateRef.current.lastLocalScore > 10) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playDeathExplosion();
                    stateRef.current.shaker.intensity = 25;
                    spawnExplosion(p.x, p.y, '#f43f5e');
                    stateRef.current.lastLocalScore = 10;
                }
            }
            Object.keys(players).forEach({
                "GameCanvas.useEffect": (id)=>{
                    const curr = players[id];
                    const prev = stateRef.current.interpolatedPlayers[id];
                    if (curr.isDead && prev && !curr.isBot) {
                        stateRef.current.shaker.intensity = Math.max(stateRef.current.shaker.intensity, 15);
                        spawnExplosion(curr.x, curr.y, '#ef4444');
                    }
                }
            }["GameCanvas.useEffect"]);
        }
    }["GameCanvas.useEffect"], [
        players,
        orbs,
        localPlayerId
    ]);
    const spawnExplosion = (x, y, color)=>{
        for(let i = 0; i < 35; i++){
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            stateRef.current.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                color,
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    };
    // Canvas Core Renderer Loop (rAF)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameCanvas.useEffect": ()=>{
            let animationId;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const gameLoop = {
                "GameCanvas.useEffect.gameLoop": ()=>{
                    ctx.fillStyle = '#020205';
                    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
                    const refState = stateRef.current;
                    const localId = refState.localPlayerId;
                    const localPlayer = localId && refState.players[localId] ? refState.players[localId] : null;
                    // Coordinate Interpolations (Delta-time Lerping)
                    Object.keys(refState.players).forEach({
                        "GameCanvas.useEffect.gameLoop": (id)=>{
                            const servo = refState.players[id];
                            if (!refState.interpolatedPlayers[id]) {
                                refState.interpolatedPlayers[id] = {
                                    x: servo.x,
                                    y: servo.y,
                                    angle: servo.angle,
                                    segments: JSON.parse(JSON.stringify(servo.segments))
                                };
                            } else {
                                const inter = refState.interpolatedPlayers[id];
                                inter.x += (servo.x - inter.x) * 0.2;
                                inter.y += (servo.y - inter.y) * 0.2;
                                inter.angle += Math.sin(servo.angle - inter.angle) * 0.25;
                                if (inter.segments.length !== servo.segments.length) {
                                    inter.segments = JSON.parse(JSON.stringify(servo.segments));
                                } else {
                                    for(let i = 0; i < inter.segments.length; i++){
                                        if (servo.segments[i]) {
                                            inter.segments[i].x += (servo.segments[i].x - inter.segments[i].x) * 0.25;
                                            inter.segments[i].y += (servo.segments[i].y - inter.segments[i].y) * 0.25;
                                        }
                                    }
                                }
                            }
                        }
                    }["GameCanvas.useEffect.gameLoop"]);
                    let camX = 1500;
                    let camY = 1500;
                    let zoom = 1.0;
                    if (localPlayer) {
                        const interLocal = refState.interpolatedPlayers[localId];
                        if (interLocal) {
                            camX = interLocal.x;
                            camY = interLocal.y;
                        }
                        const growthFactor = Math.min(0.35, (localPlayer.score - 10) / 450);
                        zoom = 1.0 - growthFactor;
                        if (localPlayer.abilities.dash.active) {
                            zoom *= 0.93;
                        }
                    }
                    let shakeOffsetX = 0;
                    let shakeOffsetY = 0;
                    if (refState.shaker.intensity > 0.1) {
                        shakeOffsetX = (Math.random() - 0.5) * refState.shaker.intensity;
                        shakeOffsetY = (Math.random() - 0.5) * refState.shaker.intensity;
                        refState.shaker.intensity *= refState.shaker.decay;
                    }
                    ctx.save();
                    ctx.translate(dimensions.width / 2 + shakeOffsetX, dimensions.height / 2 + shakeOffsetY);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-camX, -camY);
                    // Parallax Grid Tiles Drawing
                    ctx.save();
                    ctx.strokeStyle = '#0e1124';
                    ctx.lineWidth = 1.0;
                    const gridSize = 100;
                    const startX = Math.max(0, Math.floor((camX - dimensions.width / 2 / zoom) / gridSize) * gridSize);
                    const endX = Math.min(3000, Math.floor((camX + dimensions.width / 2 / zoom) / gridSize) * gridSize + gridSize);
                    const startY = Math.max(0, Math.floor((camY - dimensions.height / 2 / zoom) / gridSize) * gridSize);
                    const endY = Math.min(3000, Math.floor((camY + dimensions.height / 2 / zoom) / gridSize) * gridSize + gridSize);
                    for(let x = startX; x <= endX; x += gridSize){
                        ctx.beginPath();
                        ctx.moveTo(x, startY);
                        ctx.lineTo(x, endY);
                        ctx.stroke();
                    }
                    for(let y = startY; y <= endY; y += gridSize){
                        ctx.beginPath();
                        ctx.moveTo(startX, y);
                        ctx.lineTo(endX, y);
                        ctx.stroke();
                    }
                    ctx.restore();
                    // Nebula Celestial Background
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                    for(let i = 0; i < 60; i++){
                        const starX = i * 57 % 3000 + camX * 0.15;
                        const starY = i * 83 % 3000 + camY * 0.15;
                        ctx.fillRect((starX % 3000 + 3000) % 3000, (starY % 3000 + 3000) % 3000, 2, 2);
                    }
                    // Drawing Glowing Energy Orbs
                    refState.orbs.forEach({
                        "GameCanvas.useEffect.gameLoop": (orb)=>{
                            const margin = 50;
                            if (orb.x < camX - dimensions.width / 2 / zoom - margin || orb.x > camX + dimensions.width / 2 / zoom + margin || orb.y < camY - dimensions.height / 2 / zoom - margin || orb.y > camY + dimensions.height / 2 / zoom + margin) {
                                return;
                            }
                            ctx.save();
                            ctx.beginPath();
                            const rad = orb.isPremium ? 9 : 5;
                            ctx.arc(orb.x, orb.y, rad, 0, Math.PI * 2);
                            const gradient = ctx.createRadialGradient(orb.x, orb.y, 1, orb.x, orb.y, rad * 3.5);
                            gradient.addColorStop(0, '#ffffff');
                            gradient.addColorStop(0.3, orb.color);
                            gradient.addColorStop(1, 'rgba(0,0,0,0)');
                            ctx.fillStyle = gradient;
                            ctx.shadowColor = orb.color;
                            ctx.shadowBlur = orb.isPremium ? 20 : 8;
                            ctx.fill();
                            if (orb.isPremium) {
                                ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
                                ctx.lineWidth = 1.5;
                                const cycle = Date.now() / 150 % (Math.PI * 2);
                                const raySize = 14 + Math.sin(cycle) * 4;
                                ctx.beginPath();
                                ctx.moveTo(orb.x - raySize, orb.y);
                                ctx.lineTo(orb.x + raySize, orb.y);
                                ctx.moveTo(orb.x, orb.y - raySize);
                                ctx.lineTo(orb.x, orb.y + raySize);
                                ctx.stroke();
                            }
                            ctx.restore();
                        }
                    }["GameCanvas.useEffect.gameLoop"]);
                    // Render Snakes
                    Object.keys(refState.players).forEach({
                        "GameCanvas.useEffect.gameLoop": (id)=>{
                            const player = refState.players[id];
                            const inter = refState.interpolatedPlayers[id];
                            if (player.isDead || !inter || !inter.segments || inter.segments.length === 0) return;
                            const margin = 200;
                            if (inter.x < camX - dimensions.width / 2 / zoom - margin || inter.x > camX + dimensions.width / 2 / zoom + margin || inter.y < camY - dimensions.height / 2 / zoom - margin || inter.y > camY + dimensions.height / 2 / zoom + margin) {
                                const lastSeg = inter.segments[inter.segments.length - 1];
                                if (!lastSeg || lastSeg.x < camX - dimensions.width / 2 / zoom - margin || lastSeg.x > camX + dimensions.width / 2 / zoom + margin || lastSeg.y < camY - dimensions.height / 2 / zoom - margin || lastSeg.y > camY + dimensions.height / 2 / zoom + margin) {
                                    return;
                                }
                            }
                            ctx.save();
                            if (player.abilities.ghost.active) {
                                ctx.globalAlpha = 0.45;
                            }
                            const numSegments = inter.segments.length;
                            const widthRangeArr = Array.from({
                                length: numSegments
                            }, {
                                "GameCanvas.useEffect.gameLoop.widthRangeArr": (_, idx)=>{
                                    const progress = idx / numSegments;
                                    return 14 + (1 - progress) * 8;
                                }
                            }["GameCanvas.useEffect.gameLoop.widthRangeArr"]);
                            // Slither Trails
                            if (player.trail && player.trail !== 'none' && Math.random() < 0.15) {
                                const tail = inter.segments[numSegments - 1] || inter;
                                let pColor = '#3b82f6';
                                if (player.trail === 'fire_trail') pColor = '#f97316';
                                if (player.trail === 'galaxy_trail') pColor = '#c084fc';
                                refState.particles.push({
                                    x: tail.x + (Math.random() - 0.5) * 15,
                                    y: tail.y + (Math.random() - 0.5) * 15,
                                    vx: -Math.cos(inter.angle) * (1 + Math.random() * 2),
                                    vy: -Math.sin(inter.angle) * (1 + Math.random() * 2),
                                    size: 3 + Math.random() * 4,
                                    color: pColor,
                                    alpha: 1.0,
                                    decay: 0.04
                                });
                            }
                            // Draw segments back-to-front
                            for(let i = numSegments - 1; i >= 0; i--){
                                const seg = inter.segments[i];
                                if (!seg) continue;
                                ctx.beginPath();
                                const rad = widthRangeArr[i];
                                ctx.arc(seg.x, seg.y, rad, 0, Math.PI * 2);
                                let fillGradient = '#3b82f6';
                                let shadowColor = 'transparent';
                                if (player.skin === 'neon_red') {
                                    fillGradient = '#f43f5e';
                                    shadowColor = 'rgba(244, 63, 94, 0.6)';
                                } else if (player.skin === 'neon_blue') {
                                    fillGradient = '#06b6d4';
                                    shadowColor = 'rgba(6, 182, 212, 0.6)';
                                } else if (player.skin === 'fire') {
                                    const grad = ctx.createRadialGradient(seg.x, seg.y, 2, seg.x, seg.y, rad);
                                    grad.addColorStop(0, '#fde047');
                                    grad.addColorStop(0.6, '#ea580c');
                                    grad.addColorStop(1, '#9a3412');
                                    fillGradient = grad;
                                    shadowColor = 'rgba(234, 88, 12, 0.7)';
                                } else if (player.skin === 'ice') {
                                    const grad = ctx.createRadialGradient(seg.x, seg.y, 2, seg.x, seg.y, rad);
                                    grad.addColorStop(0, '#ffffff');
                                    grad.addColorStop(0.5, '#67e8f9');
                                    grad.addColorStop(1, '#1d4ed8');
                                    fillGradient = grad;
                                    shadowColor = 'rgba(103, 232, 249, 0.5)';
                                } else if (player.skin === 'galaxy') {
                                    const grad = ctx.createRadialGradient(seg.x - rad / 3, seg.y - rad / 3, 1, seg.x, seg.y, rad);
                                    grad.addColorStop(0, '#d8b4fe');
                                    grad.addColorStop(0.4, '#a855f7');
                                    grad.addColorStop(1, '#3b0764');
                                    fillGradient = grad;
                                    shadowColor = 'rgba(168, 85, 247, 0.6)';
                                } else if (player.skin === 'shadow') {
                                    const grad = ctx.createRadialGradient(seg.x, seg.y, rad * 0.4, seg.x, seg.y, rad);
                                    grad.addColorStop(0, '#111827');
                                    grad.addColorStop(0.8, '#030712');
                                    grad.addColorStop(1, '#818cf8');
                                    fillGradient = grad;
                                    shadowColor = 'rgba(129, 140, 248, 0.4)';
                                } else if (player.skin === 'gold') {
                                    const grad = ctx.createRadialGradient(seg.x - rad / 4, seg.y - rad / 4, 2, seg.x, seg.y, rad);
                                    grad.addColorStop(0, '#fef08a');
                                    grad.addColorStop(0.5, '#eab308');
                                    grad.addColorStop(1, '#854d0e');
                                    fillGradient = grad;
                                    shadowColor = 'rgba(234, 179, 8, 0.7)';
                                } else if (player.skin === 'rainbow') {
                                    const offsetCycle = (Date.now() / 400 + i * 0.3) % (Math.PI * 2);
                                    const r = Math.floor(127 + Math.sin(offsetCycle) * 127);
                                    const g = Math.floor(127 + Math.sin(offsetCycle + Math.PI * (2 / 3)) * 127);
                                    const b = Math.floor(127 + Math.sin(offsetCycle + Math.PI * (4 / 3)) * 127);
                                    fillGradient = `rgb(${r}, ${g}, ${b})`;
                                    shadowColor = `rgba(${r}, ${g}, ${b}, 0.55)`;
                                }
                                ctx.fillStyle = fillGradient;
                                if (shadowColor !== 'transparent' && i % 3 === 0) {
                                    ctx.shadowColor = shadowColor;
                                    ctx.shadowBlur = rad * 0.75;
                                }
                                ctx.fill();
                                ctx.shadowBlur = 0;
                            }
                            // Draw names labels above the head
                            ctx.save();
                            ctx.fillStyle = '#ffffff';
                            ctx.font = 'bold 11px sans-serif';
                            ctx.textAlign = 'center';
                            const crownTitle = player.title ? `[${player.title}] ` : '';
                            ctx.fillText(crownTitle + player.name, inter.x, inter.y - 35);
                            ctx.fillStyle = '#9ca3af';
                            ctx.font = '9px monospace';
                            ctx.fillText(`Lvl ${player.level} (${player.rank})`, inter.x, inter.y - 23);
                            ctx.restore();
                            // Draw head, crown and face features
                            ctx.save();
                            ctx.translate(inter.x, inter.y);
                            ctx.rotate(inter.angle);
                            ctx.fillStyle = '#ffffff';
                            ctx.beginPath();
                            ctx.arc(6, -8, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#000000';
                            ctx.beginPath();
                            ctx.arc(8, -8, 2.5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#ffffff';
                            ctx.beginPath();
                            ctx.arc(6, 8, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#000000';
                            ctx.beginPath();
                            ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
                            ctx.fill();
                            if (player.rank === 'Legend' || player.title === 'Snake Legend' || id === localId) {
                                ctx.save();
                                ctx.translate(-2, 0);
                                ctx.fillStyle = '#f59e0b';
                                ctx.beginPath();
                                ctx.moveTo(-10, -8);
                                ctx.lineTo(-4, -6);
                                ctx.lineTo(-2, -12);
                                ctx.lineTo(0, -6);
                                ctx.lineTo(6, -8);
                                ctx.lineTo(4, 4);
                                ctx.lineTo(-8, 4);
                                ctx.closePath();
                                ctx.fill();
                                ctx.restore();
                            }
                            ctx.restore();
                            // Capabilities visual bubbles overlays
                            if (player.abilities.shield.active) {
                                ctx.save();
                                ctx.beginPath();
                                ctx.arc(inter.x, inter.y, 42, 0, Math.PI * 2);
                                ctx.strokeStyle = '#06b6d4';
                                ctx.lineWidth = 3.0;
                                const cyclePulse = 0.5 + Math.sin(Date.now() / 100) * 0.25;
                                ctx.globalAlpha = cyclePulse * 0.85;
                                ctx.shadowColor = '#06b6d4';
                                ctx.shadowBlur = 18;
                                ctx.stroke();
                                ctx.restore();
                            }
                            if (player.abilities.magnet.active) {
                                ctx.save();
                                ctx.beginPath();
                                ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
                                ctx.lineWidth = 1.5;
                                const ringRad = 45 + Date.now() / 15 % 65;
                                ctx.arc(inter.x, inter.y, ringRad, 0, Math.PI * 2);
                                ctx.stroke();
                                ctx.restore();
                            }
                            ctx.restore();
                        }
                    }["GameCanvas.useEffect.gameLoop"]);
                    // Drawing Battle Royale Storm collapsed bounds
                    if (mode === __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].BATTLE_ROYALE && brZoneRadius < 2000) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(brCenter.x, brCenter.y, brZoneRadius, 0, Math.PI * 2);
                        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
                        ctx.lineWidth = 6 + Math.sin(Date.now() / 80) * 2;
                        ctx.shadowColor = '#ef4444';
                        ctx.shadowBlur = 24;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.rect(-200, -200, 3400, 3400);
                        ctx.arc(brCenter.x, brCenter.y, brZoneRadius, 0, Math.PI * 2, true);
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
                        ctx.fill();
                        ctx.restore();
                    }
                    // Drawing bounds limits walls
                    ctx.save();
                    ctx.strokeStyle = '#06b6d4';
                    ctx.lineWidth = 8;
                    ctx.shadowColor = '#06b6d4';
                    ctx.shadowBlur = 15;
                    ctx.strokeRect(0, 0, 3000, 3000);
                    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.fillText('WARNING: DEEP SPACE LIMITS - SYSTEM CRITICAL BARRIER', 1500, 50);
                    ctx.fillText('WARNING: DEEP SPACE LIMITS - SYSTEM CRITICAL BARRIER', 1500, 2950);
                    ctx.restore();
                    // Rendering Particles & floating scores label lines
                    ctx.save();
                    refState.particles.forEach({
                        "GameCanvas.useEffect.gameLoop": (p, index)=>{
                            p.x += p.vx;
                            p.y += p.vy;
                            p.alpha -= p.decay;
                            if (p.alpha <= 0.05) {
                                refState.particles.splice(index, 1);
                                return;
                            }
                            ctx.fillStyle = p.color;
                            ctx.globalAlpha = p.alpha;
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }["GameCanvas.useEffect.gameLoop"]);
                    ctx.restore();
                    ctx.save();
                    refState.scores.forEach({
                        "GameCanvas.useEffect.gameLoop": (s, sIdx)=>{
                            s.y -= 1.0;
                            s.age += 1;
                            s.opacity = Math.max(0, 1.0 - s.age / 50);
                            if (s.opacity <= 0.01) {
                                refState.scores.splice(sIdx, 1);
                                return;
                            }
                            ctx.fillStyle = s.color;
                            ctx.globalAlpha = s.opacity;
                            ctx.font = 'bold 15px sans-serif';
                            ctx.textAlign = 'center';
                            ctx.fillText(s.text, s.x, s.y);
                        }
                    }["GameCanvas.useEffect.gameLoop"]);
                    ctx.restore();
                    ctx.restore(); // camera end
                    // Mobile joystick drawing
                    if (joystickPos.active) {
                        ctx.save();
                        const baseRadius = 55;
                        const knobRadius = 22;
                        ctx.beginPath();
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                        ctx.lineWidth = 2.0;
                        ctx.arc(joystickPos.startX, joystickPos.startY, baseRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
                        ctx.strokeStyle = '#06b6d4';
                        ctx.lineWidth = 3.0;
                        ctx.shadowColor = '#06b6d4';
                        ctx.shadowBlur = 10;
                        ctx.arc(joystickPos.curX, joystickPos.curY, knobRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    }
                    animationId = requestAnimationFrame(gameLoop);
                }
            }["GameCanvas.useEffect.gameLoop"];
            gameLoop();
            return ({
                "GameCanvas.useEffect": ()=>{
                    cancelAnimationFrame(animationId);
                }
            })["GameCanvas.useEffect"];
        }
    }["GameCanvas.useEffect"], [
        dimensions,
        joystickPos
    ]);
    const handleMouseMove = (e)=>{
        e.preventDefault();
        const refState = stateRef.current;
        const localId = refState.localPlayerId;
        if (!localId || !refState.players[localId]) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const cursorRelativeX = e.clientX - rect.left - dimensions.width / 2;
        const cursorRelativeY = e.clientY - rect.top - dimensions.height / 2;
        const angle = Math.atan2(cursorRelativeY, cursorRelativeX);
        onInputChange(angle, isBoostingRef.current);
    };
    const handleTouchStart = (e)=>{
        const touch = e.touches[0];
        if (!touch) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const rx = touch.clientX - rect.left;
        const ry = touch.clientY - rect.top;
        setJoystickPos({
            active: true,
            startX: rx,
            startY: ry,
            curX: rx,
            curY: ry
        });
    };
    const handleTouchMove = (e)=>{
        if (!joystickPos.active) return;
        const touch = e.touches[0];
        if (!touch) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const rx = touch.clientX - rect.left;
        const ry = touch.clientY - rect.top;
        let dx = rx - joystickPos.startX;
        let dy = ry - joystickPos.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxLimitRadius = 55;
        if (dist > maxLimitRadius) {
            dx = dx / dist * maxLimitRadius;
            dy = dy / dist * maxLimitRadius;
        }
        setJoystickPos((p)=>({
                ...p,
                curX: p.startX + dx,
                curY: p.startY + dy
            }));
        const angle = Math.atan2(dy, dx);
        onInputChange(angle, isBoostingRef.current);
    };
    const handleTouchEnd = ()=>{
        setJoystickPos({
            active: false,
            startX: 0,
            startY: 0,
            curX: 0,
            curY: 0
        });
        onInputChange(stateRef.current.players[localPlayerId || '']?.angle || 0, false);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameCanvas.useEffect": ()=>{
            const handleKeyDown = {
                "GameCanvas.useEffect.handleKeyDown": (e)=>{
                    if (e.repeat) return;
                    if (e.code === 'Space') {
                        e.preventDefault();
                        isBoostingRef.current = true;
                        const refState = stateRef.current;
                        const local = localPlayerId && refState.players[localPlayerId];
                        if (local) {
                            onInputChange(local.angle, true);
                            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playBoost();
                        }
                    }
                }
            }["GameCanvas.useEffect.handleKeyDown"];
            const handleKeyUp = {
                "GameCanvas.useEffect.handleKeyUp": (e)=>{
                    if (e.code === 'Space') {
                        e.preventDefault();
                        isBoostingRef.current = false;
                        const refState = stateRef.current;
                        const local = localPlayerId && refState.players[localPlayerId];
                        if (local) {
                            onInputChange(local.angle, false);
                        }
                    }
                }
            }["GameCanvas.useEffect.handleKeyUp"];
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            return ({
                "GameCanvas.useEffect": ()=>{
                    window.removeEventListener('keydown', handleKeyDown);
                    window.removeEventListener('keyup', handleKeyUp);
                }
            })["GameCanvas.useEffect"];
        }
    }["GameCanvas.useEffect"], [
        localPlayerId,
        onInputChange
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative w-full h-full overflow-hidden cursor-crosshair",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
            ref: canvasRef,
            width: dimensions.width,
            height: dimensions.height,
            onMouseMove: handleMouseMove,
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
            onClick: ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playOrbEat();
            },
            id: "game_rendering_canvas",
            className: "block"
        }, void 0, false, {
            fileName: "[project]/components/GameCanvas.tsx",
            lineNumber: 741,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/GameCanvas.tsx",
        lineNumber: 740,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(GameCanvas, "yK5nvutn//gT0kkTh7F4dNBswCk=");
_c = GameCanvas;
const __TURBOPACK__default__export__ = GameCanvas;
var _c;
__turbopack_context__.k.register(_c, "GameCanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/GameUI.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameUI",
    ()=>GameUI,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/compass.js [app-client] (ecmascript) <export default as Compass>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SoundManager.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
const GameUI = ({ players, orbs, localPlayerId, mode, brZoneRadius, brCenter, onTriggerAbility, onSendChat, onExitGame, chatMessages, killFeed = [] })=>{
    _s();
    const localPlayer = localPlayerId ? players[localPlayerId] : null;
    // UI state
    const [chatInput, setChatInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isChatOpen, setIsChatOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const chatEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Parse top scoreboard sorted descending
    const playersArray = Object.values(players);
    const sortedLeaderboard = [
        ...playersArray
    ].sort((a, b)=>b.score - a.score).slice(0, 5);
    const fullLeaderboard = [
        ...playersArray
    ].sort((a, b)=>b.score - a.score);
    const myLeaderboardRank = localPlayerId ? fullLeaderboard.findIndex((p)=>p.id === localPlayerId) + 1 : 0;
    // Active abilities cooling gauges (Simulated cooldown states)
    const [cooldowns, setCooldowns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        shield: 0,
        magnet: 0,
        ghost: 0
    });
    // Track keyboard hooks for PC controls W, E, R
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameUI.useEffect": ()=>{
            const handleKeyDown = {
                "GameUI.useEffect.handleKeyDown": (e)=>{
                    if (isChatOpen) return;
                    if (e.code === 'KeyW') {
                        e.preventDefault();
                        triggerAbilityLocal('shield');
                    } else if (e.code === 'KeyE') {
                        e.preventDefault();
                        triggerAbilityLocal('magnet');
                    } else if (e.code === 'KeyR') {
                        e.preventDefault();
                        triggerAbilityLocal('ghost');
                    }
                }
            }["GameUI.useEffect.handleKeyDown"];
            window.addEventListener('keydown', handleKeyDown);
            return ({
                "GameUI.useEffect": ()=>window.removeEventListener('keydown', handleKeyDown)
            })["GameUI.useEffect"];
        }
    }["GameUI.useEffect"], [
        isChatOpen
    ]);
    // Ability client-trigger and cool down scheduler
    const triggerAbilityLocal = (type)=>{
        if (cooldowns[type] > 0) return;
        onTriggerAbility(type);
        if (type === 'shield') __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playShieldActivate();
        else if (type === 'magnet') __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playMagnetActivate();
        else if (type === 'ghost') __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playGhostActivate();
        setCooldowns((prev)=>({
                ...prev,
                [type]: 100
            }));
    };
    // Tick cooldown values down smoothly in UI
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameUI.useEffect": ()=>{
            const interval = setInterval({
                "GameUI.useEffect.interval": ()=>{
                    setCooldowns({
                        "GameUI.useEffect.interval": (prev)=>({
                                shield: Math.max(0, prev.shield - 1.25),
                                magnet: Math.max(0, prev.magnet - 1),
                                ghost: Math.max(0, prev.ghost - 1.5)
                            })
                    }["GameUI.useEffect.interval"]);
                }
            }["GameUI.useEffect.interval"], 100);
            return ({
                "GameUI.useEffect": ()=>clearInterval(interval)
            })["GameUI.useEffect"];
        }
    }["GameUI.useEffect"], []);
    // Scroll chat to bottom automatically
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GameUI.useEffect": ()=>{
            if (chatEndRef.current) {
                chatEndRef.current.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    }["GameUI.useEffect"], [
        chatMessages,
        isChatOpen
    ]);
    const handleChatSubmit = (e)=>{
        e.preventDefault();
        if (!chatInput.trim()) return;
        onSendChat(chatInput.trim());
        setChatInput('');
        setIsChatOpen(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-sans select-none z-10 text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex justify-between items-start w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex space-x-3 pointer-events-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onExitGame,
                                className: "px-4 py-2 bg-[#111112] hover:bg-[#00f2ff]/10 border border-white/10 uppercase font-black text-xs rounded-none transition-all tracking-[1.5px] font-mono shadow-2xl cursor-pointer hover:border-[#00f2ff]/40 text-white",
                                children: "◀ EXIT TO COCKPIT"
                            }, void 0, false, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            localPlayer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex bg-[#111112] border border-white/10 px-4 py-2 rounded-none space-x-4 text-xs font-mono",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-[#808080] text-3xs font-bold tracking-widest uppercase",
                                                children: "MASS WEIGHT"
                                            }, void 0, false, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 142,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-black text-[#00f2ff]",
                                                children: [
                                                    localPlayer.score,
                                                    " HP"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 143,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-[1px] bg-white/10 h-8 self-center"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 145,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-[#808080] text-3xs font-bold tracking-widest uppercase",
                                                children: "TAIL PIECES"
                                            }, void 0, false, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 147,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-black text-white",
                                                children: [
                                                    localPlayer.segments?.length || 0,
                                                    " SEGS"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 148,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 146,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-[1px] bg-white/10 h-8 self-center"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 150,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-[#808080] text-3xs font-bold tracking-widest uppercase",
                                                children: "SECTOR RANK"
                                            }, void 0, false, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 152,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-black text-[#00f2ff] font-sans",
                                                children: [
                                                    "#",
                                                    myLeaderboardRank
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 153,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 140,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameUI.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    mode === __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].BATTLE_ROYALE && brZoneRadius < 3000 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center space-x-2.5 bg-red-950/80 border border-red-500/40 px-4 py-2.5 rounded-xl shadow-xl w-72 animate-pulse pointer-events-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                className: "w-5 h-5 text-red-500 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs font-sans",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block font-black text-red-500 uppercase tracking-widest text-2xs leading-none mb-0.5",
                                        children: "STORM COLLAPSE IN BOUNDS"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 164,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xs font-mono text-gray-300",
                                        children: [
                                            "Safe radius decreased to ",
                                            Math.floor(brZoneRadius),
                                            "m!"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 163,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameUI.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col space-y-2.5 items-end pointer-events-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#111112] border border-white/10 p-4 rounded-none w-60 shadow-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-3xs font-black text-[#00f2ff] tracking-[1.5px] uppercase border-b border-white/10 pb-1.5 mb-2 flex justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "SECTOR LOBBY LEADERS"
                                            }, void 0, false, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 178,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#808080] font-mono font-bold uppercase",
                                                children: mode
                                            }, void 0, false, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 179,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 177,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1 text-2xs font-mono",
                                        children: sortedLeaderboard.map((p, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex justify-between items-center py-0.5 ${p.id === localPlayerId ? 'text-[#00f2ff] font-bold bg-[#00f2ff]/10 px-1 rounded-none' : 'text-gray-300'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-1.5 truncate max-w-[150px]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[#808080]",
                                                                children: [
                                                                    idx + 1,
                                                                    "."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/GameUI.tsx",
                                                                lineNumber: 190,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-sans font-bold text-[#e0e0e0] truncate",
                                                                children: p.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/GameUI.tsx",
                                                                lineNumber: 191,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/GameUI.tsx",
                                                        lineNumber: 189,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: p.score
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/GameUI.tsx",
                                                        lineNumber: 193,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, p.id, true, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 183,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 181,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            killFeed.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col space-y-1.5 items-end w-60 max-h-64 overflow-hidden",
                                children: killFeed.slice().reverse().map((feed)=>{
                                    const isMyKill = localPlayer && feed.killerName === localPlayer.name;
                                    const isMyDeath = localPlayer && feed.victimName === localPlayer.name;
                                    let messageContent;
                                    let cardStyle = "bg-[#111112]/95 border-white/5 text-[#c0c0c0]";
                                    let iconColor = "text-[#808080]";
                                    if (isMyKill) {
                                        cardStyle = "bg-[#00f2ff]/5 border-[#00f2ff]/30 text-white shadow-[0_0_10px_rgba(0,242,255,0.15)] border-l-2 border-l-[#00f2ff]";
                                        iconColor = "text-[#00f2ff]";
                                        messageContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-1 select-none",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[#00f2ff] font-extrabold",
                                                    children: "YOU"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 215,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-gray-400 font-mono text-[9px] uppercase tracking-wider",
                                                    children: "disintegrated"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-white truncate max-w-[100px]",
                                                    children: feed.victimName
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 214,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0));
                                    } else if (isMyDeath) {
                                        cardStyle = "bg-red-950/20 border-red-500/30 text-white shadow-[0_0_10px_rgba(239,68,68,0.15)] border-l-2 border-l-red-500";
                                        iconColor = "text-red-500 animate-pulse";
                                        messageContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-1 select-none",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-red-400 font-extrabold",
                                                    children: "YOU"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 225,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-gray-400 font-mono text-[9px] uppercase tracking-wider",
                                                    children: "crashed - by"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 226,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-white truncate max-w-[100px]",
                                                    children: feed.killerName === 'wall' ? 'BOUNDARY' : feed.killerName === 'the storm' ? 'STORM RING' : feed.killerName
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 227,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 224,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0));
                                    } else {
                                        const isWall = feed.killerName === 'wall';
                                        const isStorm = feed.killerName === 'the storm';
                                        messageContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-1 select-none",
                                            children: isWall || isStorm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-white truncate max-w-[90px]",
                                                        children: feed.victimName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/GameUI.tsx",
                                                        lineNumber: 240,
                                                        columnNumber: 27
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#808080] font-mono text-[9px] uppercase tracking-wider",
                                                        children: isWall ? 'hit border' : 'lost to storm'
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/GameUI.tsx",
                                                        lineNumber: 241,
                                                        columnNumber: 27
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-white truncate max-w-[85px]",
                                                        children: feed.killerName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/GameUI.tsx",
                                                        lineNumber: 247,
                                                        columnNumber: 27
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#808080] font-mono text-[8px] uppercase tracking-widest px-1 bg-white/5",
                                                        children: "VS"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/GameUI.tsx",
                                                        lineNumber: 248,
                                                        columnNumber: 27
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-white truncate max-w-[85px]",
                                                        children: feed.victimName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/GameUI.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 27
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 237,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0));
                                    }
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex items-center justify-between px-3 py-1.5 border font-mono text-[10px] w-full transition-all duration-300 ${cardStyle}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "truncate pr-1",
                                                children: messageContent
                                            }, void 0, false, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 261,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `${iconColor} text-[8px] font-black ml-1 shrink-0 bg-[#050505] px-1 py-0.5 border border-white/5`,
                                                children: isMyKill ? '⚔️ KILL' : isMyDeath ? '💥 DESTR' : '• FEED'
                                            }, void 0, false, {
                                                fileName: "[project]/components/GameUI.tsx",
                                                lineNumber: 262,
                                                columnNumber: 21
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, feed.id, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 257,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0));
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 201,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameUI.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameUI.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex items-center justify-center p-6 select-none",
                children: localPlayer && localPlayer.abilities.dash.active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-[#030511]/90 border border-cyan-500/30 px-4 py-2 rounded-lg text-xs tracking-wider text-cyan-400 flex items-center space-x-2 animate-bounce",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                            className: "w-4 h-4 fill-cyan-500 stroke-none"
                        }, void 0, false, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 279,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-bold uppercase tracking-widest",
                            children: "PROPULSION OVERHEAT • HYPER SPEED ACTIVE"
                        }, void 0, false, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 280,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/GameUI.tsx",
                    lineNumber: 278,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/GameUI.tsx",
                lineNumber: 276,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "flex justify-between items-end w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col w-72 pointer-events-auto",
                        children: [
                            isChatOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#111112] border border-white/10 rounded-none p-3 h-48 overflow-y-auto space-y-1.5 flex flex-col shadow-2xl",
                                children: [
                                    chatMessages.map((msg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-2xs font-mono leading-tight",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-sans font-bold text-[#00f2ff] mr-1.5",
                                                    children: [
                                                        "[",
                                                        msg.username,
                                                        "]:"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 295,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-gray-300",
                                                    children: msg.message
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 296,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, msg.id, true, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 294,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: chatEndRef
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 299,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 292,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleChatSubmit,
                                className: `flex bg-[#111112] border border-white/10 p-2 rounded-none ${isChatOpen ? 'border-t-0' : 'shadow-lg'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        maxLength: 45,
                                        value: chatInput,
                                        onChange: (e)=>setChatInput(e.target.value),
                                        onFocus: ()=>setIsChatOpen(true),
                                        placeholder: "PRESS ENTER OR CLICK TO TRANSMIT...",
                                        className: "flex-1 bg-transparent border-none text-2xs px-2 focus:outline-none placeholder-gray-600 font-mono text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 309,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setIsChatOpen(!isChatOpen),
                                        className: "p-1.5 hover:bg-white/5 duration-150 rounded-none cursor-pointer",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                            className: "w-4 h-4 text-[#808080]"
                                        }, void 0, false, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 323,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 318,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 303,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameUI.tsx",
                        lineNumber: 290,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex space-x-4 bg-[#111112] border border-white/10 p-3 rounded-none pointer-events-auto shadow-2xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>triggerAbilityLocal('shield'),
                                disabled: cooldowns.shield > 0,
                                className: `w-14 items-center flex flex-col justify-center relative rounded-none p-2 transition-all cursor-pointer ${cooldowns.shield > 0 ? 'bg-[#050505]/40 opacity-40' : 'bg-[#111112] border border-white/10 hover:border-[#00f2ff]/60 hover:bg-white/5'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                        className: "w-5 h-5 text-[#00f2ff] mb-1"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 338,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xs tracking-widest font-bold font-mono",
                                        children: "W-SHIELD"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 339,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    cooldowns.shield > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-[#050505]/95 rounded-none border border-red-500/25 flex items-center justify-center font-mono text-3xs font-black text-red-400",
                                        children: [
                                            Math.floor(cooldowns.shield / 12.5),
                                            "s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 341,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 331,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>triggerAbilityLocal('magnet'),
                                disabled: cooldowns.magnet > 0,
                                className: `w-14 items-center flex flex-col justify-center relative rounded-none p-2 transition-all cursor-pointer ${cooldowns.magnet > 0 ? 'bg-[#050505]/40 opacity-40' : 'bg-[#111112] border border-white/10 hover:border-[#00f2ff]/60 hover:bg-white/5'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$compass$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Compass$3e$__["Compass"], {
                                        className: "w-5 h-5 text-[#00f2ff] mb-1"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 357,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xs tracking-widest font-bold font-mono",
                                        children: "E-VACUUM"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 358,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    cooldowns.magnet > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-[#050505]/95 rounded-none border border-red-500/25 flex items-center justify-center font-mono text-3xs font-black text-red-400",
                                        children: [
                                            Math.floor(cooldowns.magnet / 10),
                                            "s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 360,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 350,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>triggerAbilityLocal('ghost'),
                                disabled: cooldowns.ghost > 0,
                                className: `w-14 items-center flex flex-col justify-center relative rounded-none p-2 transition-all cursor-pointer ${cooldowns.ghost > 0 ? 'bg-[#050505]/40 opacity-40' : 'bg-[#111112] border border-white/10 hover:border-[#00f2ff]/60 hover:bg-white/5'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                        className: "w-5 h-5 text-[#00f2ff] mb-1"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 376,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xs tracking-widest font-bold font-mono",
                                        children: "R-PHASE"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 377,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    cooldowns.ghost > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-[#050505]/95 rounded-none border border-red-500/25 flex items-center justify-center font-mono text-3xs font-black text-red-400",
                                        children: [
                                            Math.floor(cooldowns.ghost / 15),
                                            "s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GameUI.tsx",
                                        lineNumber: 379,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/GameUI.tsx",
                                lineNumber: 369,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GameUI.tsx",
                        lineNumber: 329,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative bg-[#111112] border border-white/10 w-32 h-32 rounded-none overflow-hidden pointer-events-auto shadow-2xl",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                            id: "minimap_tactical_grid",
                            width: 128,
                            height: 128,
                            ref: (canvas)=>{
                                if (!canvas) return;
                                const ctx = canvas.getContext('2d');
                                if (!ctx) return;
                                ctx.clearRect(0, 0, 128, 128);
                                ctx.fillStyle = '#050505';
                                ctx.fillRect(0, 0, 128, 128);
                                ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
                                ctx.lineWidth = 0.5;
                                ctx.beginPath();
                                ctx.moveTo(64, 0);
                                ctx.lineTo(64, 128);
                                ctx.moveTo(0, 64);
                                ctx.lineTo(128, 64);
                                ctx.stroke();
                                const scale = 128 / 3000;
                                if (mode === __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].BATTLE_ROYALE) {
                                    const rx = brCenter.x * scale;
                                    const ry = brCenter.y * scale;
                                    const rRadius = brZoneRadius * scale;
                                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
                                    ctx.lineWidth = 1.0;
                                    ctx.beginPath();
                                    ctx.arc(rx, ry, rRadius, 0, Math.PI * 2);
                                    ctx.stroke();
                                }
                                Object.keys(players).forEach((pId)=>{
                                    const p = players[pId];
                                    if (p.isDead) return;
                                    const mx = p.x * scale;
                                    const my = p.y * scale;
                                    if (pId === localPlayerId) {
                                        ctx.fillStyle = '#10b981';
                                        ctx.beginPath();
                                        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
                                        ctx.fill();
                                    } else {
                                        ctx.fillStyle = p.isBot ? '#ffffff' : '#3b82f6';
                                        ctx.beginPath();
                                        ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
                                        ctx.fill();
                                    }
                                });
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 390,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/GameUI.tsx",
                        lineNumber: 389,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/GameUI.tsx",
                lineNumber: 288,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            localPlayer && localPlayer.isDead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-[#050505]/95 backdrop-blur-md pointer-events-auto flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-[#111112] border border-white/10 p-8 rounded-none w-full max-w-md text-center shadow-2xl border-t-2 border-t-[#00f2ff]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-3xs uppercase tracking-[2px] font-mono font-bold px-3 py-1 bg-[#050505] border border-[#00f2ff]/20 text-[#00f2ff] rounded-none inline-block mb-3 animate-pulse",
                            children: "MATCH DE-BRIEFING PROTOCOL ACTIVE"
                        }, void 0, false, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 453,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-black text-white uppercase tracking-[4px] mb-1",
                            children: "MATCH SUMMARY"
                        }, void 0, false, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 456,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[#808080] text-3xs font-mono uppercase tracking-[1px] mb-6",
                            children: [
                                "Sector: ",
                                mode.toUpperCase(),
                                " Arena"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 459,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-6 text-left",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-3xs uppercase tracking-[2px] text-[#808080] font-mono font-bold mb-3 border-b border-white/10 pb-1",
                                    children: "LOBBY PODIUM (TOP 3)"
                                }, void 0, false, {
                                    fileName: "[project]/components/GameUI.tsx",
                                    lineNumber: 465,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1.5",
                                    children: sortedLeaderboard.slice(0, 3).map((player, idx)=>{
                                        const isUser = player.id === localPlayerId;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex items-center justify-between p-2.5 border font-mono transition-all ${idx === 0 ? 'bg-[#00f2ff]/5 border-[#00f2ff]/30 text-white' : isUser ? 'bg-white/5 border-[#00f2ff]/20 text-white' : 'bg-[#111112] border-white/5 text-[#e0e0e0]'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-2.5 min-w-[120px] truncate",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-[11px] font-black ${idx === 0 ? 'text-[#00f2ff]' : 'text-[#808080]'}`,
                                                            children: [
                                                                "0",
                                                                idx + 1
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/GameUI.tsx",
                                                            lineNumber: 483,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-sans text-xs font-bold text-white truncate",
                                                            children: [
                                                                player.name,
                                                                " ",
                                                                isUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[#00f2ff] text-[10px] ml-0.5",
                                                                    children: "(YOU)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/GameUI.tsx",
                                                                    lineNumber: 487,
                                                                    columnNumber: 52
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/GameUI.tsx",
                                                            lineNumber: 486,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 482,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-3 text-[10px] text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[#808080] mr-1",
                                                                    children: "MASS:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/GameUI.tsx",
                                                                    lineNumber: 492,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-white font-bold",
                                                                    children: [
                                                                        player.score,
                                                                        " HP"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/GameUI.tsx",
                                                                    lineNumber: 493,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/GameUI.tsx",
                                                            lineNumber: 491,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[#808080] mr-1",
                                                                    children: "KILLS:"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/GameUI.tsx",
                                                                    lineNumber: 496,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[#00f2ff] font-bold",
                                                                    children: player.kills || 0
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/GameUI.tsx",
                                                                    lineNumber: 497,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/GameUI.tsx",
                                                            lineNumber: 495,
                                                            columnNumber: 25
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 490,
                                                    columnNumber: 23
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, player.id, true, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 472,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0));
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/GameUI.tsx",
                                    lineNumber: 468,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 464,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-left mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-3xs uppercase tracking-[2px] text-[#808080] font-mono font-bold mb-3 border-b border-white/10 pb-1",
                                    children: "PILOT MISSION LOG"
                                }, void 0, false, {
                                    fileName: "[project]/components/GameUI.tsx",
                                    lineNumber: 508,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-[#050505] rounded-none border border-white/5 p-4 font-mono text-xs space-y-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[#808080] uppercase tracking-[1.5px] text-[10px]",
                                                    children: "FINAL MASS / DENSITY:"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 513,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[#00f2ff]",
                                                    children: [
                                                        localPlayer.score,
                                                        " HP"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 514,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 512,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[#808080] uppercase tracking-[1.5px] text-[10px]",
                                                    children: "ELIMINATIONS SECURED:"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 517,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-white",
                                                    children: [
                                                        localPlayer.kills || 0,
                                                        " SECURED"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 518,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 516,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[#808080] uppercase tracking-[1.5px] text-[10px]",
                                                    children: "ESTIMATED LOBBY PAYOUT:"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-bold text-[#00f2ff]",
                                                    children: [
                                                        "🪙 +",
                                                        Math.floor(localPlayer.score / 6),
                                                        " CREDIT"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GameUI.tsx",
                                                    lineNumber: 522,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GameUI.tsx",
                                            lineNumber: 520,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GameUI.tsx",
                                    lineNumber: 511,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 507,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onExitGame,
                                    className: "w-full py-3 bg-[#00f2ff] hover:bg-[#00e1ec] text-[#050505] font-black tracking-[2px] text-xs uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.25)] hover:shadow-[0_0_20px_rgba(0,242,255,0.5)]",
                                    children: "Return to Lobby"
                                }, void 0, false, {
                                    fileName: "[project]/components/GameUI.tsx",
                                    lineNumber: 528,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playShieldActivate();
                                    },
                                    className: "w-full py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-2xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-all cursor-pointer rounded-none",
                                    children: [
                                        "Waiting for Respawn... (",
                                        Math.floor(localPlayer.respawnTimer / 20),
                                        "s)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GameUI.tsx",
                                    lineNumber: 535,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GameUI.tsx",
                            lineNumber: 527,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/GameUI.tsx",
                    lineNumber: 452,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/GameUI.tsx",
                lineNumber: 451,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/GameUI.tsx",
        lineNumber: 124,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(GameUI, "enqCxm/iCc9R1S32mbLxfPxWz3w=");
_c = GameUI;
const __TURBOPACK__default__export__ = GameUI;
var _c;
__turbopack_context__.k.register(_c, "GameUI");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/AdminPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminPanel",
    ()=>AdminPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$server$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Server$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/server.js [app-client] (ecmascript) <export default as Server>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SoundManager.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const AdminPanel = ({ onClose, localUserId })=>{
    _s();
    const [analytics, setAnalytics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [usersList, setUsersList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        arenaSize: 3000,
        baseSpeed: 4.0,
        dashSpeed: 7.5,
        botSpawningCount: 12
    });
    const fetchAdminData = async ()=>{
        try {
            const res = await fetch('/api/admin/analytics');
            const data = await res.json();
            setAnalytics(data);
            const leadRes = await fetch('/api/leaderboards');
            if (leadRes.ok) {
                const leadData = await leadRes.json();
                setUsersList(leadData.global || []);
            }
        } catch (e) {
            console.warn('Failed to fetch admin parameters', e);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminPanel.useEffect": ()=>{
            fetchAdminData();
            const interval = setInterval(fetchAdminData, 4000);
            return ({
                "AdminPanel.useEffect": ()=>clearInterval(interval)
            })["AdminPanel.useEffect"];
        }
    }["AdminPanel.useEffect"], []);
    const grantBonus = async (targetId, coins, xp)=>{
        try {
            const res = await fetch('/api/shop/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: targetId,
                    cosmeticId: 'grant_premium_bonus_debug'
                })
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playVictoryArpeggio();
            alert(`Debug Injection: Granted telemetry credits to target user ID ${targetId}`);
            fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative bg-[#111112] border border-white/10 rounded-none w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col justify-between shadow-2xl select-text",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "p-5 border-b border-white/10 flex justify-between items-center bg-[#050505]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-2.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                    className: "w-5 h-5 text-[#00f2ff]"
                                }, void 0, false, {
                                    fileName: "[project]/components/AdminPanel.tsx",
                                    lineNumber: 71,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-sm font-black tracking-[1.5px] uppercase text-[#00f2ff]",
                                            children: "ADMIN CONTROLS"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 73,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-3xs uppercase tracking-[1px] text-[#808080] font-mono leading-none mt-1",
                                            children: "AISTUDIO PREVIEW GATEWAY ACTIVE"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 76,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AdminPanel.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AdminPanel.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-1.5 rounded-none bg-[#111112] border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/components/AdminPanel.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/components/AdminPanel.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AdminPanel.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-y-auto p-6 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-[#050505] border border-white/5 p-3.5 rounded-none",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$server$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Server$3e$__["Server"], {
                                            className: "w-5 h-5 text-[#808080] mx-auto mb-2"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 95,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-3xs block text-[#808080] uppercase",
                                            children: "SERVER RUNTIME"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 96,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-white",
                                            children: analytics ? `${Math.floor(analytics.upTime / 60)}m ${analytics.upTime % 60}s` : '0s'
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 97,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AdminPanel.tsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-[#050505] border border-white/5 p-3.5 rounded-none",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                            className: "w-5 h-5 text-[#00f2ff] mx-auto mb-2 animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 103,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-3xs block text-[#808080] uppercase",
                                            children: "TICK RECLAMATION"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 104,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-[#00f2ff]",
                                            children: analytics ? `${analytics.serverFps} Hz` : '20 Hz'
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 105,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AdminPanel.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-[#050505] border border-white/5 p-3.5 rounded-none",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                            className: "w-5 h-5 text-white mx-auto mb-2"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 111,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-3xs block text-[#808080] uppercase",
                                            children: "ACTIVE PILOTS"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 112,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-white",
                                            children: analytics ? analytics.playersOnline : 1
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AdminPanel.tsx",
                                    lineNumber: 110,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-[#050505] border border-white/5 p-3.5 rounded-none",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                            className: "w-5 h-5 text-[#00f2ff] mx-auto mb-2"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 119,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-3xs block text-[#808080] uppercase",
                                            children: "TOTAL ACCOUNT FILE"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 120,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-bold text-[#00f2ff]",
                                            children: analytics ? analytics.totalRegisteredPlayers : 2
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 121,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AdminPanel.tsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AdminPanel.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "md:col-span-1 bg-[#0b0e27] border border-[#151c3f] p-4 rounded-xl space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-[#1b2555] pb-2",
                                            children: "📡 Sandbox Game Tuners"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3 font-mono text-2xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-[#7285b7] uppercase mb-1",
                                                            children: "ARENA BORDER SCALING"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/AdminPanel.tsx",
                                                            lineNumber: 135,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "range",
                                                            min: 1000,
                                                            max: 5000,
                                                            step: 100,
                                                            value: config.arenaSize,
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    arenaSize: Number(e.target.value)
                                                                }),
                                                            className: "w-full accent-cyan-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/AdminPanel.tsx",
                                                            lineNumber: 136,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[#e2e8f0] font-bold block",
                                                            children: [
                                                                config.arenaSize,
                                                                "x",
                                                                config.arenaSize,
                                                                " px"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/AdminPanel.tsx",
                                                            lineNumber: 145,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/AdminPanel.tsx",
                                                    lineNumber: 134,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-[#7285b7] uppercase mb-1",
                                                            children: "BASE SLITHER KINEMATIC"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/AdminPanel.tsx",
                                                            lineNumber: 149,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            step: 0.5,
                                                            value: config.baseSpeed,
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    baseSpeed: Number(e.target.value)
                                                                }),
                                                            className: "bg-[#030510] border border-[#1a2559] rounded px-2 py-1 w-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/AdminPanel.tsx",
                                                            lineNumber: 150,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/AdminPanel.tsx",
                                                    lineNumber: 148,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-[#7285b7] uppercase mb-1",
                                                            children: "PROPULSION DASH BOOST"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/AdminPanel.tsx",
                                                            lineNumber: 160,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            step: 0.5,
                                                            value: config.dashSpeed,
                                                            onChange: (e)=>setConfig({
                                                                    ...config,
                                                                    dashSpeed: Number(e.target.value)
                                                                }),
                                                            className: "bg-[#030510] border border-[#1a2559] rounded px-2 py-1 w-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/AdminPanel.tsx",
                                                            lineNumber: 161,
                                                            columnNumber: 19
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/AdminPanel.tsx",
                                                    lineNumber: 159,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "pt-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playOrbEat();
                                                            alert('Dynamic parameters broadcasted to game controller!');
                                                        },
                                                        className: "w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-3xs uppercase rounded tracking-widest transition-all",
                                                        children: "Broadcast Tuners"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/AdminPanel.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/AdminPanel.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 133,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AdminPanel.tsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "md:col-span-2 bg-[#0b0e27] border border-[#151c3f] p-4 rounded-xl space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-[#1b2555] pb-2",
                                            children: "📂 Users Credentials Management"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 186,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2 max-h-64 overflow-y-auto font-mono text-2xs",
                                            children: [
                                                usersList.map((usr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-[#050611] border border-[#12193b] p-3 rounded-lg flex justify-between items-center flex-wrap sm:flex-nowrap gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                                        className: "font-extrabold text-sm font-sans text-slate-100",
                                                                        children: usr.username
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/AdminPanel.tsx",
                                                                        lineNumber: 197,
                                                                        columnNumber: 23
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "block text-[#707bb1] text-3xs mt-0.5",
                                                                        children: [
                                                                            "Role: ",
                                                                            usr.role,
                                                                            " • Coins: 🪙 ",
                                                                            usr.coins,
                                                                            " • Level: ",
                                                                            usr.level,
                                                                            " (RP: ",
                                                                            usr.rankPoints,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/AdminPanel.tsx",
                                                                        lineNumber: 198,
                                                                        columnNumber: 23
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/AdminPanel.tsx",
                                                                lineNumber: 196,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-1.5 shrink-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>grantBonus(usr.id, 1000, 200),
                                                                        className: "px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-3xs rounded transition-all uppercase",
                                                                        children: "🪙 +1K Coins"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/AdminPanel.tsx",
                                                                        lineNumber: 204,
                                                                        columnNumber: 23
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>{
                                                                            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playShieldActivate();
                                                                            alert('Account reset logs cleared.');
                                                                        },
                                                                        className: "p-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-3xs rounded hover:text-white transition-all uppercase",
                                                                        children: "Reset"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/AdminPanel.tsx",
                                                                        lineNumber: 210,
                                                                        columnNumber: 23
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/AdminPanel.tsx",
                                                                lineNumber: 203,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, usr.id, true, {
                                                        fileName: "[project]/components/AdminPanel.tsx",
                                                        lineNumber: 192,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))),
                                                usersList.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-center py-12 text-gray-500",
                                                    children: "Scanning active account indices..."
                                                }, void 0, false, {
                                                    fileName: "[project]/components/AdminPanel.tsx",
                                                    lineNumber: 223,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/AdminPanel.tsx",
                                            lineNumber: 190,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AdminPanel.tsx",
                                    lineNumber: 185,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AdminPanel.tsx",
                            lineNumber: 127,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AdminPanel.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    className: "p-4 border-t border-[#18234e] bg-[#050714] text-center text-3xs uppercase text-gray-500 font-mono tracking-widest flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "CORETEX ANALYTICAL SUBSYSTEM LIVE"
                        }, void 0, false, {
                            fileName: "[project]/components/AdminPanel.tsx",
                            lineNumber: 234,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "AISTUDIO ADMIN DIAGNOSTIC CERTIFICATE"
                        }, void 0, false, {
                            fileName: "[project]/components/AdminPanel.tsx",
                            lineNumber: 235,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AdminPanel.tsx",
                    lineNumber: 233,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/AdminPanel.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/AdminPanel.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(AdminPanel, "SsjyW55LWbtN6KajYhb9HTw6Sqo=");
_c = AdminPanel;
var _c;
__turbopack_context__.k.register(_c, "AdminPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AppPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MainMenu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GameCanvas.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameUI$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GameUI.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AdminPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AdminPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SoundManager.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
;
var _s = __turbopack_context__.k.signature();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */ 'use client';
;
;
;
;
;
;
;
;
;
function AppPage() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentGameMode, setCurrentGameMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].CASUAL);
    const [roomCode, setRoomCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Real-time socket states
    const [players, setPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [orbs, setOrbs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [brZoneRadius, setBrZoneRadius] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1500);
    const [brCenter, setBrCenter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 1500,
        y: 1500
    });
    const [chatMessages, setChatMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [killFeed, setKillFeed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [soundEnabled, setSoundEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isReplaying, setIsReplaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const replayIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Fallback high performance offline client simulation state references
    const [isOfflineMode, setIsOfflineMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const localSimIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const simStateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        players: {},
        orbs: [],
        brZoneRadius: 1500,
        brCenter: {
            x: 1500,
            y: 1500
        }
    });
    // Cache user login details locally
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppPage.useEffect": ()=>{
            const cachedUserId = localStorage.getItem('snake_legends_user_id');
            const cachedUsername = localStorage.getItem('snake_legends_username');
            if (cachedUserId) {
                fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: cachedUserId,
                        username: cachedUsername
                    })
                }).then({
                    "AppPage.useEffect": (res)=>res.json()
                }["AppPage.useEffect"]).then({
                    "AppPage.useEffect": (data)=>{
                        if (data.success) {
                            setUser(data.user);
                        }
                    }
                }["AppPage.useEffect"]).catch({
                    "AppPage.useEffect": (err)=>console.log('Store fallback offline initially', err)
                }["AppPage.useEffect"]);
            }
        }
    }["AppPage.useEffect"], []);
    const handleLogin = async (username)=>{
        const newUserId = `pilot_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: newUserId,
                    username,
                    email: 'forappdemo7@gmail.com'
                })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('snake_legends_user_id', newUserId);
                localStorage.setItem('snake_legends_username', username);
                setUser(data.user);
                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playVictoryArpeggio();
            }
        } catch (e) {
            console.log('Failing to bind login', e);
        }
    };
    const setLocalStats = (xpGained, coinsGained, isKill = false)=>{
        if (!user) return;
        setUser((prev)=>{
            if (!prev) return null;
            let newXp = prev.xp + xpGained;
            let newLevel = prev.level;
            let newCoins = prev.coins + coinsGained;
            let newKills = prev.stats.kills + (isKill ? 1 : 0);
            let newOrbsCollected = prev.stats.orbsCollected + (isKill ? 0 : 1);
            let xpNeeded = newLevel * 250;
            while(newXp >= xpNeeded && newLevel < 100){
                newXp -= xpNeeded;
                newLevel += 1;
                newCoins += newLevel * 50;
                xpNeeded = newLevel * 250;
            }
            const updated = {
                ...prev,
                xp: newXp,
                level: newLevel,
                coins: newCoins,
                stats: {
                    ...prev.stats,
                    kills: newKills,
                    orbsCollected: newOrbsCollected
                }
            };
            // Lazy notify fallback DB
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: updated.id,
                    username: updated.username
                })
            }).then(()=>{
                if (isKill) {
                    fetch('/api/training/complete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: updated.id,
                            lessonName: 'Combat School',
                            scoreObtained: 100
                        })
                    }).catch((e)=>console.log('Stat increment offline update catch:', e));
                }
            }).catch((e)=>console.log('Sync profile catch:', e));
            return updated;
        });
    };
    const disintegrateOffline = (playerId, killerName)=>{
        const currentSimState = simStateRef.current;
        const p = currentSimState.players[playerId];
        if (!p || p.isDead) return;
        p.isDead = true;
        p.respawnTimer = p.isBot && !p.isBoss ? 100 : p.isBoss ? 600 : 120; // bots wait 5s, boss wait 30s, player wait 6s
        // Scatter glowing space-orbs where segment residues were
        const colors = [
            '#f43f5e',
            '#06b6d4',
            '#10b981',
            '#a855f7',
            '#fbbf24',
            '#f97316',
            '#3b82f6'
        ];
        p.segments.forEach((seg, idx)=>{
            if (idx % 2 === 0) {
                currentSimState.orbs.push({
                    id: `dis_orb_${Date.now()}_${idx}_${Math.random()}`,
                    x: seg.x + (Math.random() - 0.5) * 15,
                    y: seg.y + (Math.random() - 0.5) * 15,
                    value: p.isBoss ? 8 : 4,
                    color: colors[idx % colors.length],
                    isPremium: Math.random() < 0.25
                });
            }
        });
        const victimN = p.id === (user?.id || '') ? 'YOU' : p.name;
        const killerN = killerName || 'Deep Space';
        setKillFeed((prev)=>[
                ...prev,
                {
                    id: `kill_off_${Date.now()}_${Math.random()}`,
                    victimName: victimN,
                    killerName: killerN,
                    timestamp: Date.now()
                }
            ].slice(-5));
        if (playerId === (user?.id || '')) {
            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playDeathExplosion();
        }
    };
    const startOfflineSimulation = (mode)=>{
        setIsOfflineMode(true);
        const colors = [
            '#f43f5e',
            '#06b6d4',
            '#10b981',
            '#a855f7',
            '#fbbf24',
            '#f97316',
            '#3b82f6'
        ];
        const initialOrbs = [];
        for(let i = 0; i < 150; i++){
            initialOrbs.push({
                id: `orb_off_${Date.now()}_${i}_${Math.random()}`,
                x: Math.random() * 3000,
                y: Math.random() * 3000,
                value: Math.random() < 0.1 ? 6 : 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                isPremium: Math.random() < 0.1
            });
        }
        const localId = user?.id || `pilot_offline_${Date.now()}`;
        const localUsername = user?.username || 'Offline Pilot';
        const px = 500 + Math.random() * 2000;
        const py = 500 + Math.random() * 2000;
        const pAngle = Math.random() * Math.PI * 2;
        const pSegments = [];
        for(let i = 0; i < 10; i++){
            pSegments.push({
                x: px - Math.cos(pAngle) * i * 15,
                y: py - Math.sin(pAngle) * i * 15
            });
        }
        const localPlayer = {
            id: localId,
            name: `${localUsername} [OFFLINE]`,
            isBot: false,
            skin: user?.selectedSkin || 'neon_blue',
            trail: user?.selectedTrail || 'none',
            title: user?.selectedTitle || 'Solo Fighter',
            x: px,
            y: py,
            angle: pAngle,
            segments: pSegments,
            score: 10,
            length: 10,
            speed: 5,
            isDead: false,
            respawnTimer: 0,
            abilities: {
                dash: {
                    active: false,
                    duration: 0
                },
                shield: {
                    active: false,
                    duration: 0
                },
                magnet: {
                    active: false,
                    duration: 0
                },
                ghost: {
                    active: false,
                    duration: 0
                }
            },
            rank: user?.rank || 'BRONZE',
            level: user?.level || 1,
            kills: 0
        };
        const initialPlayers = {
            [localId]: localPlayer
        };
        const botNames = [
            'QuantumSnake',
            'PulseCobalt',
            'VegaCrawler',
            'CyberGlider',
            'NeonAsp',
            'TetherViper',
            'AeroSlink',
            'VortexGlide'
        ];
        const botDifficulties = [
            'easy',
            'medium',
            'hard'
        ];
        const difficultyTitles = {
            easy: 'Bot Cadet',
            medium: 'Bot Fighter',
            hard: 'Bot Gladiator'
        };
        for(let i = 0; i < 8; i++){
            const bId = `bot_local_${i}_${Math.floor(Math.random() * 1000)}`;
            const bx = 300 + Math.random() * 2400;
            const by = 300 + Math.random() * 2400;
            const bAngle = Math.random() * Math.PI * 2;
            const bSegments = [];
            for(let j = 0; j < 12; j++){
                bSegments.push({
                    x: bx - Math.cos(bAngle) * j * 15,
                    y: by - Math.sin(bAngle) * j * 15
                });
            }
            const bDiff = botDifficulties[i % botDifficulties.length];
            initialPlayers[bId] = {
                id: bId,
                name: `🤖 ${botNames[i % botNames.length]}`,
                isBot: true,
                skin: colors[i % colors.length] === '#fbbf24' ? 'galaxy' : 'neon_blue',
                trail: 'none',
                title: difficultyTitles[bDiff],
                x: bx,
                y: by,
                angle: bAngle,
                segments: bSegments,
                score: 12,
                length: 12,
                speed: 5,
                isDead: false,
                respawnTimer: 0,
                abilities: {
                    dash: {
                        active: false,
                        duration: 0
                    },
                    shield: {
                        active: false,
                        duration: 0
                    },
                    magnet: {
                        active: false,
                        duration: 0
                    },
                    ghost: {
                        active: false,
                        duration: 0
                    }
                },
                rank: 'GOLD',
                level: 5 + i * 2,
                kills: 0,
                difficulty: bDiff
            };
        }
        if (mode === __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].CASUAL || mode === __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].BATTLE_ROYALE) {
            const bhId = 'world_boss_hydra';
            const bx = 1500;
            const by = 1500;
            const bAngle = 0;
            const bSegments = [];
            for(let j = 0; j < 40; j++){
                bSegments.push({
                    x: bx - j * 15,
                    y: by
                });
            }
            initialPlayers[bhId] = {
                id: bhId,
                name: '👾 NEON HYDRA [WORLD BOSS]',
                isBot: true,
                isBoss: true,
                skin: 'rainbow',
                trail: 'galaxy_trail',
                title: 'RAID WORLD BOSS',
                x: bx,
                y: by,
                angle: bAngle,
                segments: bSegments,
                score: 150,
                length: 40,
                speed: 4,
                isDead: false,
                respawnTimer: 0,
                abilities: {
                    dash: {
                        active: false,
                        duration: 0
                    },
                    shield: {
                        active: true,
                        duration: 99999
                    },
                    magnet: {
                        active: true,
                        duration: 99999
                    },
                    ghost: {
                        active: false,
                        duration: 0
                    }
                },
                rank: 'LEGEND',
                level: 100,
                kills: 0
            };
        }
        simStateRef.current = {
            players: initialPlayers,
            orbs: initialOrbs,
            brZoneRadius: mode === __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].BATTLE_ROYALE ? 2000 : 1500,
            brCenter: {
                x: 1500,
                y: 1500
            }
        };
        setPlayers({
            ...simStateRef.current.players
        });
        setOrbs([
            ...simStateRef.current.orbs
        ]);
        setBrZoneRadius(simStateRef.current.brZoneRadius);
        setBrCenter({
            ...simStateRef.current.brCenter
        });
        setChatMessages([
            {
                id: 'sys_off_init',
                username: 'CORETEX_SYS_BOT',
                message: '🔴 Sockets blocked by iframe sandbox restriction. Seamless local high performance offline bot-arena loaded!',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            },
            {
                id: 'sys_off_init_2',
                username: 'CORETEX_SYS_BOT',
                message: '💡 Tip: Steer with mouse/joystick, hold Click/Space to speed boost. Press W (Shield), E (Vacuum), R (Phase)!',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }
        ]);
        if (localSimIntervalRef.current) {
            clearInterval(localSimIntervalRef.current);
        }
        localSimIntervalRef.current = setInterval(()=>{
            const currentSimState = simStateRef.current;
            const activeLobbyPlayers = currentSimState.players;
            if (mode === __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].BATTLE_ROYALE) {
                currentSimState.brZoneRadius = Math.max(120, currentSimState.brZoneRadius - 0.45);
            }
            if (currentSimState.orbs.length < 150) {
                const toSpawn = 150 - currentSimState.orbs.length;
                for(let s = 0; s < toSpawn; s++){
                    currentSimState.orbs.push({
                        id: `orb_off_repl_${Date.now()}_${s}_${Math.random()}`,
                        x: Math.random() * 3000,
                        y: Math.random() * 3000,
                        value: Math.random() < 0.1 ? 6 : 2,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        isPremium: Math.random() < 0.1
                    });
                }
            }
            Object.keys(activeLobbyPlayers).forEach((pId)=>{
                const p = activeLobbyPlayers[pId];
                if (p.isDead) {
                    if (p.respawnTimer > 0) {
                        p.respawnTimer--;
                        if (p.respawnTimer === 0) {
                            p.isDead = false;
                            p.score = 10;
                            p.x = 200 + Math.random() * 2600;
                            p.y = 200 + Math.random() * 2600;
                            p.angle = Math.random() * Math.PI * 2;
                            p.segments = [];
                            for(let k = 0; k < 10; k++){
                                p.segments.push({
                                    x: p.x - Math.cos(p.angle) * k * 15,
                                    y: p.y - Math.sin(p.angle) * k * 15
                                });
                            }
                            if (pId === localId) {
                                setKillFeed((prev)=>[
                                        ...prev,
                                        {
                                            id: `respawn_${Date.now()}`,
                                            victimName: 'SPECTATE',
                                            killerName: p.name,
                                            timestamp: Date.now()
                                        }
                                    ].slice(-5));
                            }
                        }
                    }
                    return;
                }
                Object.keys(p.abilities).forEach((abKey)=>{
                    const ab = p.abilities[abKey];
                    if (ab.active && ab.duration > 0) {
                        ab.duration--;
                        if (ab.duration === 0) {
                            ab.active = false;
                        }
                    }
                });
                const currentBaseSpeed = 5;
                const currentBoostSpeed = 9;
                p.speed = p.abilities.dash.active && p.score > 8 ? currentBoostSpeed : currentBaseSpeed;
                if (p.abilities.dash.active && p.score > 8) {
                    p.score = Math.max(8, p.score - 0.08);
                    if (Math.random() < 0.1) {
                        const lastSeg = p.segments[p.segments.length - 1];
                        currentSimState.orbs.push({
                            id: `food_residue_${Date.now()}_${Math.random()}`,
                            x: (lastSeg?.x || p.x) + (Math.random() - 0.5) * 15,
                            y: (lastSeg?.y || p.y) + (Math.random() - 0.5) * 15,
                            value: 2,
                            color: '#06b6d4',
                            isPremium: false
                        });
                    }
                }
                if (p.isBot) {
                    if (p.isBoss) {
                        const sysLocalPlayer = activeLobbyPlayers[localId];
                        if (sysLocalPlayer && !sysLocalPlayer.isDead) {
                            p.angle = Math.atan2(sysLocalPlayer.y - p.y, sysLocalPlayer.x - p.x);
                        } else if (Math.random() < 0.05) {
                            p.angle += (Math.random() - 0.5) * 1.2;
                        }
                        if (Math.random() < 0.08) {
                            const fireAngle = p.angle + (Math.random() - 0.5) * Math.PI;
                            currentSimState.orbs.push({
                                id: `boss_projectile_${Date.now()}_${Math.random()}`,
                                x: p.x + Math.cos(fireAngle) * 80,
                                y: p.y + Math.sin(fireAngle) * 80,
                                value: 8,
                                color: '#f43f5e',
                                isPremium: true
                            });
                        }
                    } else {
                        const diff = p.difficulty || 'medium';
                        if (Math.random() < (diff === 'easy' ? 0.03 : diff === 'medium' ? 0.06 : 0.12)) {
                            let nearestOrb = null;
                            let minDist = diff === 'easy' ? 300 : diff === 'medium' ? 400 : 650;
                            currentSimState.orbs.forEach((orb)=>{
                                const dist = Math.sqrt((orb.x - p.x) ** 2 + (orb.y - p.y) ** 2);
                                if (dist < minDist) {
                                    minDist = dist;
                                    nearestOrb = orb;
                                }
                            });
                            if (nearestOrb) {
                                const tOrb = nearestOrb;
                                let targetAngle = Math.atan2(tOrb.y - p.y, tOrb.x - p.x);
                                if (diff === 'hard' && Math.random() < 0.3) {
                                    const target = activeLobbyPlayers[localId];
                                    if (target && !target.isDead) {
                                        const pDist = Math.sqrt((target.x - p.x) ** 2 + (target.y - p.y) ** 2);
                                        if (pDist < 250) {
                                            const aheadX = target.x + Math.cos(target.angle) * 80;
                                            const aheadY = target.y + Math.sin(target.angle) * 80;
                                            targetAngle = Math.atan2(aheadY - p.y, aheadX - p.x);
                                            p.abilities.dash.active = true;
                                        }
                                    }
                                }
                                p.angle = targetAngle;
                            } else {
                                p.angle += (Math.random() - 0.5) * 1.5;
                            }
                        }
                    }
                }
                const nextX = p.x + Math.cos(p.angle) * p.speed;
                const nextY = p.y + Math.sin(p.angle) * p.speed;
                if (nextX < 0 || nextX > 3000 || nextY < 0 || nextY > 3000) {
                    disintegrateOffline(pId, 'deep space magnetic wall');
                    return;
                }
                if (mode === __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameMode"].BATTLE_ROYALE) {
                    const dx = nextX - currentSimState.brCenter.x;
                    const dy = nextY - currentSimState.brCenter.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > currentSimState.brZoneRadius) {
                        p.score = Math.max(0, p.score - 0.45);
                        if (p.score <= 0.05) {
                            disintegrateOffline(pId, 'the radioactive storm');
                            return;
                        }
                    }
                }
                p.x = nextX;
                p.y = nextY;
                const head = {
                    x: p.x,
                    y: p.y
                };
                p.segments.unshift(head);
                const targetLength = Math.floor(10 + (p.score - 10) * 1.5);
                while(p.segments.length > targetLength){
                    p.segments.pop();
                }
                for(let i = currentSimState.orbs.length - 1; i >= 0; i--){
                    const orb = currentSimState.orbs[i];
                    const dx = orb.x - p.x;
                    const dy = orb.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (p.abilities.magnet.active && dist < 160) {
                        const pullSpeed = 4.5;
                        orb.x -= dx / dist * pullSpeed;
                        orb.y -= dy / dist * pullSpeed;
                    }
                    if (dist < 26) {
                        p.score += orb.value * 0.35;
                        currentSimState.orbs.splice(i, 1);
                        if (pId === localId) {
                            setLocalStats(2, 4);
                        }
                    }
                }
            });
            const activePlayersOffline = Object.values(currentSimState.players).filter((p)=>!p.isDead);
            for(let u = 0; u < activePlayersOffline.length; u++){
                const p1 = activePlayersOffline[u];
                if (p1.abilities.ghost.active) continue;
                for(let v = 0; v < activePlayersOffline.length; v++){
                    const p2 = activePlayersOffline[v];
                    if (p1.id === p2.id) continue;
                    if (p2.abilities.ghost.active) continue;
                    for(let s = 1; s < p2.segments.length; s++){
                        const segment = p2.segments[s];
                        const dx = p1.x - segment.x;
                        const dy = p1.y - segment.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 25) {
                            if (p1.abilities.shield.active) {
                                p1.angle += Math.PI;
                                p1.x += Math.cos(p1.angle) * p1.speed * 4;
                                p1.y += Math.sin(p1.angle) * p1.speed * 4;
                                break;
                            } else {
                                disintegrateOffline(p1.id, p2.name);
                                if (!p1.isBoss) {
                                    p2.kills++;
                                    if (p2.id === localId) {
                                        setLocalStats(60, 150, true);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
            setPlayers({
                ...currentSimState.players
            });
            setOrbs([
                ...currentSimState.orbs
            ]);
            setBrZoneRadius(currentSimState.brZoneRadius);
            setBrCenter({
                ...currentSimState.brCenter
            });
        }, 50);
    };
    const handleJoinGame = (mode, selectedRoomCode)=>{
        if (!user) return;
        setCurrentGameMode(mode);
        setRoomCode(selectedRoomCode || null);
        setIsPlaying(true);
        setIsReplaying(false);
        setPlayers({});
        setOrbs([]);
        setChatMessages([]);
        setKillFeed([]);
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].startBackgroundMusic();
        // Sockets handshake timeout trigger (failsafe)
        const fallbackTimeout = setTimeout(()=>{
            if (!socketRef.current || !socketRef.current.connected) {
                console.warn('Socket connection timed out! Booting off-line high performance fallback...');
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
                startOfflineSimulation(mode);
            }
        }, 1200);
        const socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])({
            path: '/socket.io',
            transports: [
                'polling',
                'websocket'
            ]
        });
        socketRef.current = socket;
        socket.on('connect', ()=>{
            clearTimeout(fallbackTimeout);
            setIsOfflineMode(false);
            console.log('Orbital sockets connection bridged successfully: ', socket.id);
            socket.emit('game:join', {
                userId: user.id,
                username: user.username,
                mode,
                skin: user.selectedSkin,
                trail: user.selectedTrail,
                title: user.selectedTitle
            });
        });
        socket.on('connect_error', (err)=>{
            console.warn('Orbital sockets connect error:', err);
        });
        socket.on('game:state', (state)=>{
            setPlayers(state.players);
            setOrbs(state.orbs);
            setBrZoneRadius(state.brZoneRadius);
            setBrCenter(state.brCenter);
        });
        socket.on('chat:receive', (msg)=>{
            setChatMessages((prev)=>[
                    ...prev,
                    msg
                ].slice(-40));
        });
        socket.on('game:killfeed', (entry)=>{
            setKillFeed((prev)=>[
                    ...prev,
                    entry
                ].slice(-5));
            setTimeout(()=>{
                setKillFeed((prev)=>prev.filter((item)=>item.id !== entry.id));
            }, 6000);
        });
        socket.on('disconnect', ()=>{
            console.log('Orbital sockets disconnected.');
        });
    };
    const handleWatchReplay = async (matchId)=>{
        if (!user) return;
        setIsPlaying(true);
        setIsReplaying(true);
        setPlayers({});
        setOrbs([]);
        setChatMessages([]);
        setKillFeed([]);
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].startBackgroundMusic();
        try {
            const res = await fetch(`/api/replays/${matchId}`);
            if (!res.ok) {
                alert("Could not load selected replay files on the server.");
                handleExitGame();
                return;
            }
            const data = await res.json();
            if (!data || !data.frames || data.frames.length === 0) {
                alert("This record contains no slither snapshots.");
                handleExitGame();
                return;
            }
            setKillFeed([
                {
                    id: 'replay_init_evt',
                    victimName: 'COSMIC RECORDER',
                    killerName: 'SPECTATE BOOT',
                    timestamp: Date.now()
                }
            ]);
            let frameIdx = 0;
            if (replayIntervalRef.current) {
                clearInterval(replayIntervalRef.current);
            }
            replayIntervalRef.current = setInterval(()=>{
                const frame = data.frames[frameIdx];
                if (!frame) {
                    clearInterval(replayIntervalRef.current);
                    replayIntervalRef.current = null;
                    alert("Replay sequence completed.");
                    handleExitGame();
                    return;
                }
                const activePlayers = {};
                Object.keys(frame.players).forEach((pId)=>{
                    const raw = frame.players[pId];
                    activePlayers[pId] = {
                        id: pId,
                        name: pId === 'world_boss_hydra' ? 'NEON HYDRA' : pId.includes('bot') ? 'SYSTEM BOT' : pId,
                        x: raw.x,
                        y: raw.y,
                        angle: raw.angle,
                        segments: raw.segments,
                        score: raw.score,
                        length: raw.segments.length,
                        speed: 4,
                        skin: pId === 'world_boss_hydra' ? 'galaxy' : 'neon_blue',
                        trail: 'glow',
                        title: pId === 'world_boss_hydra' ? 'WORLD BOSS [RAID]' : 'SPECTATE REC',
                        isDead: false,
                        isBot: pId.includes('bot'),
                        isBoss: pId === 'world_boss_hydra',
                        kills: 0,
                        rank: 'BRONZE',
                        level: 1,
                        respawnTimer: 0,
                        abilities: {
                            shield: {
                                active: false,
                                duration: 0
                            },
                            magnet: {
                                active: false,
                                duration: 0
                            },
                            ghost: {
                                active: false,
                                duration: 0
                            },
                            dash: {
                                active: false,
                                duration: 0
                            }
                        }
                    };
                });
                const activeOrbs = frame.orbs.map((o)=>({
                        id: o.id,
                        x: o.x,
                        y: o.y,
                        value: o.premium ? 10 : 3,
                        color: o.premium ? '#fbbf24' : '#38bdf8',
                        isPremium: o.premium
                    }));
                setPlayers(activePlayers);
                setOrbs(activeOrbs);
                frameIdx++;
            }, 200);
        } catch (e) {
            console.warn("Spectator play failed:", e);
            handleExitGame();
        }
    };
    const handleInputChange = (angle, isBoosting)=>{
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('player:input', {
                angle,
                isBoosting
            });
        } else if (isOfflineMode && user) {
            const currentSimState = simStateRef.current;
            const player = currentSimState.players[user.id];
            if (player && !player.isDead) {
                player.angle = angle;
                player.abilities.dash.active = isBoosting && player.score > 8;
            }
        }
    };
    const handleTriggerAbility = (type)=>{
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('player:ability', {
                type
            });
        } else if (isOfflineMode && user) {
            const currentSimState = simStateRef.current;
            const player = currentSimState.players[user.id];
            if (player && !player.isDead && !player.abilities[type].active) {
                if (type === 'shield') __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playShieldActivate();
                else if (type === 'magnet') __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playPremiumOrbEat();
                else __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playVictoryArpeggio();
                player.abilities[type].active = true;
                player.abilities[type].duration = type === 'shield' ? 80 : type === 'magnet' ? 120 : 60;
                setPlayers({
                    ...currentSimState.players
                });
            }
        }
    };
    const handleSendChatMessage = (message)=>{
        if (socketRef.current && socketRef.current.connected && user) {
            socketRef.current.emit('chat:broadcast', {
                username: user.username,
                message
            });
        } else if (isOfflineMode && user && message.trim()) {
            const userMsg = {
                id: `chat_off_usr_${Date.now()}`,
                username: user.username,
                message: message.trim(),
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            setChatMessages((prev)=>[
                    ...prev,
                    userMsg
                ].slice(-45));
            const botResponses = [
                "ViperBot: Stealth maneuvers activated! Watch your six!",
                "CyberCrawler: Press Click/Space to accelerate! Boost and cut them off!",
                "HyperCrawl: There's a massive cluster of space coordinates at the center!",
                "CORETEX_SYS_BOT: Mass intake is critical to scale up and survive!",
                "SYS_BOT: Did you see that? You slithered right past a premium golden orb!",
                "AstroSlink: Watch your coordinate boundaries, there's a deep space wall!"
            ];
            setTimeout(()=>{
                const botResponse = {
                    id: `chat_off_bot_${Date.now()}`,
                    username: 'CORETEX_SYS_BOT',
                    message: botResponses[Math.floor(Math.random() * botResponses.length)],
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
                setChatMessages((prev)=>[
                        ...prev,
                        botResponse
                    ].slice(-45));
                __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playOrbEat();
            }, 1000 + Math.random() * 1500);
        }
    };
    const handleExitGame = ()=>{
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        if (replayIntervalRef.current) {
            clearInterval(replayIntervalRef.current);
            replayIntervalRef.current = null;
        }
        if (localSimIntervalRef.current) {
            clearInterval(localSimIntervalRef.current);
            localSimIntervalRef.current = null;
        }
        setIsPlaying(false);
        setIsReplaying(false);
        setIsOfflineMode(false);
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].stopBackgroundMusic();
        if (user) {
            fetch(`/api/users/${user.id}`).then((res)=>res.json()).then((freshUser)=>{
                if (freshUser && !freshUser.error) {
                    setUser(freshUser);
                }
            }).catch((err)=>console.log('Error refreshing profile statistics', err));
        }
    };
    const handleToggleSound = ()=>{
        const next = !soundEnabled;
        setSoundEnabled(next);
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].setSoundEnabled(next);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-screen h-screen bg-[#050505] text-white overflow-hidden relative",
        children: isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full h-full",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameCanvas"], {
                    players: players,
                    orbs: orbs,
                    localPlayerId: user?.id || null,
                    mode: currentGameMode,
                    brZoneRadius: brZoneRadius,
                    brCenter: brCenter,
                    onInputChange: handleInputChange
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 882,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GameUI$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameUI"], {
                    players: players,
                    orbs: orbs,
                    localPlayerId: user?.id || null,
                    mode: currentGameMode,
                    brZoneRadius: brZoneRadius,
                    brCenter: brCenter,
                    onTriggerAbility: handleTriggerAbility,
                    onSendChat: handleSendChatMessage,
                    onExitGame: handleExitGame,
                    chatMessages: chatMessages,
                    killFeed: killFeed
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 891,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 881,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative w-full h-full select-none",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MainMenu"], {
                    user: user,
                    onLogin: handleLogin,
                    onJoinGame: handleJoinGame,
                    soundEnabled: soundEnabled,
                    onToggleSound: handleToggleSound,
                    onWatchReplay: handleWatchReplay
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 907,
                    columnNumber: 11
                }, this),
                user && user.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SoundManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SoundManager"].playShieldActivate();
                        setIsAdminPanelOpen(true);
                    },
                    className: "absolute bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-650 hover:from-cyan-400 hover:to-indigo-550 text-white shadow-xl hover:shadow-cyan-450/20 active:translate-y-0.5 transition-all z-40 cursor-pointer pointer-events-auto",
                    title: "Open Admin Control Panels",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                        className: "w-5.5 h-5.5 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 925,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 917,
                    columnNumber: 13
                }, this),
                isAdminPanelOpen && user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AdminPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdminPanel"], {
                    localUserId: user.id,
                    onClose: ()=>setIsAdminPanelOpen(false)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 930,
                    columnNumber: 13
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 906,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 879,
        columnNumber: 5
    }, this);
}
_s(AppPage, "JQnTMG21DJHdml3WSQFRLf0u59k=");
_c = AppPage;
var _c;
__turbopack_context__.k.register(_c, "AppPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_17cto-b._.js.map