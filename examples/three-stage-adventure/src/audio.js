export class SoundSystem {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.tempo = 0.16;
        this.timerId = null;
        this.nextNoteTime = 0;
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextCtor();
        }
    }

    async resume() {
        this.ensureContext();
        if (this.ctx.state === "suspended") {
            await this.ctx.resume();
        }
    }

    speak(text) {
        if (!("speechSynthesis" in window) || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "zh-CN";
        utterance.rate = 1.15;
        window.speechSynthesis.speak(utterance);
    }

    startBGM() {
        this.ensureContext();
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    }

    stopBGM() {
        this.isPlaying = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    scheduler() {
        if (!this.isPlaying || !this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playMelody(this.nextNoteTime);
            this.nextNoteTime += this.tempo;
        }
        this.timerId = window.setTimeout(() => this.scheduler(), 25);
    }

    playMelody(time) {
        const notes = { C4: 261.6 };
        const step = Math.floor(time / this.tempo) % 8;
        if (step !== 0 && step !== 4) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(notes.C4, time);
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    playSFX(type) {
        this.ensureContext();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === "jump") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.linearRampToValueAtTime(600, t + 0.2);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.2);
            osc.start(t);
            osc.stop(t + 0.2);
            return;
        }

        if (type === "hit") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(110, t);
            osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
            return;
        }

        if (type === "splash") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(10, t + 0.8);
            gain.gain.setValueAtTime(0.32, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.8);
            osc.start(t);
            osc.stop(t + 0.8);
            return;
        }

        if (type === "land") {
            osc.type = "square";
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.linearRampToValueAtTime(220, t + 0.12);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.12);
            osc.start(t);
            osc.stop(t + 0.12);
        }
    }
}

