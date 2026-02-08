// Audio utility for number calling and sound effects

class AudioManager {
    constructor() {
        this.audioEnabled = true;
        this.speechSynthesis = window.speechSynthesis;
    }

    // Speak a number using text-to-speech
    speakNumber(number) {
        if (!this.audioEnabled || !this.speechSynthesis) return;

        // Cancel any ongoing speech
        this.speechSynthesis.cancel();

        const createUtterance = () => {
            const utterance = new SpeechSynthesisUtterance(number.toString());
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.lang = 'en-US';
            return utterance;
        };

        // Enqueue twice for repetition
        this.speechSynthesis.speak(createUtterance());

        // Add a slight intentional pause between repetitions if possible, 
        // or just speak again. SpeechSynthesis enqueues them.
        setTimeout(() => {
            if (this.audioEnabled) {
                this.speechSynthesis.speak(createUtterance());
            }
        }, 500);
    }

    // Play a beep sound
    playBeep() {
        if (!this.audioEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Play drum roll sound (simulated with oscillating tone)
    playDrumRoll() {
        if (!this.audioEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 2.5;

        for (let i = 0; i < 50; i++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 100 + Math.random() * 50;
            oscillator.type = 'triangle';

            const startTime = audioContext.currentTime + (i * duration / 50);
            gainNode.gain.setValueAtTime(0.1, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.05);
        }
    }

    // Play celebration sound
    playCelebration() {
        if (!this.audioEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (major chord)

        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = audioContext.currentTime + (index * 0.1);
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);
        });
    }

    // Play a short countdown beep
    playCountdownBeep() {
        if (!this.audioEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}
const audioManager = new AudioManager();
export default audioManager;

