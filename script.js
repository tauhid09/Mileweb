// Wait for GSAP and Lenis to be defined before using it
function waitForGSAP() {
    return new Promise((resolve) => {
        const checkGSAP = setInterval(() => {
            const gsapLoaded = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof CustomEase !== 'undefined' && typeof SplitText !== 'undefined';
            const lenisLoaded = typeof Lenis !== 'undefined';
            
            console.log("Checking libraries...", { gsap: typeof gsap, Lenis: typeof Lenis });
            
            if (gsapLoaded && lenisLoaded) {
                clearInterval(checkGSAP);
                console.log("GSAP and Lenis loaded successfully");
                gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
                CustomEase.create("customEase", "M0,0 C0.86,0 0.07,1 1,1");
                resolve();
            }
        }, 100);
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkGSAP);
            console.warn("Library loading timeout - proceeding anyway");
            if (typeof gsap === 'undefined') {
                console.error("GSAP failed to load");
            }
            if (typeof Lenis === 'undefined') {
                console.error("Lenis failed to load");
            }
            resolve();
        }, 10000);
    });
}

let lenis;

// Sound management
class SoundManager {
    constructor() {
        this.sounds = {};
        this.isEnabled = false;
        this.init();
    }

    init() {
        // Preload sounds
        this.loadSound(
            "hover",
            "https://assets.codepen.io/7558/click-reverb-001.mp3"
        );
        this.loadSound(
            "click",
            "https://assets.codepen.io/7558/shutter-fx-001.mp3"
        );
        this.loadSound(
            "textChange",
            "https://assets.codepen.io/7558/whoosh-fx-001.mp3"
        );
    }

    loadSound(name, url) {
        const audio = new Audio(url);
        audio.preload = "auto";
        // Set different volumes for different sounds
        if (name === "hover") {
            audio.volume = 0.15; // Lower volume for hover
        } else {
            audio.volume = 0.3; // Default volume for click and text change
        }
        this.sounds[name] = audio;
    }

    enableAudio() {
        if (!this.isEnabled) {
            this.isEnabled = true;
            console.log("Audio enabled");
        }
    }

    play(soundName, delay = 0) {
        if (this.isEnabled && this.sounds[soundName]) {
            if (delay > 0) {
                setTimeout(() => {
                    this.sounds[soundName].currentTime = 0;
                    this.sounds[soundName].play().catch((e) => {
                        console.log("Audio play failed:", e);
                    });
                }, delay);
            } else {
                // Reset the audio to beginning and play immediately
                this.sounds[soundName].currentTime = 0;
                this.sounds[soundName].play().catch((e) => {
                    console.log("Audio play failed:", e);
                });
            }
        }
    }

    // Method to add more sounds later
    addSound(name, url, volume = 0.3) {
        this.loadSound(name, url);
        if (this.sounds[name]) {
            this.sounds[name].volume = volume;
        }
    }
}

// Initialize sound manager
const soundManager = new SoundManager();

document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOMContentLoaded fired");
    
    // Start initialization immediately, don't wait for fonts
    await waitForGSAP();
    console.log("GSAP ready, initializing Lenis and page");
    
    try {
        initLenis();
    } catch (error) {
        console.error("Failed to initialize Lenis:", error);
    }
    
    try {
        initPage();
    } catch (error) {
        console.error("Failed to initialize page:", error);
    }
    
    // Also wait for fonts with a timeout fallback
    setTimeout(() => {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                // Fonts loaded successfully
                console.log("Fonts loaded");
            }).catch((error) => {
                console.error("Font loading error:", error);
            });
        }
    }, 500);
});

function initLenis() {
    if (typeof Lenis === 'undefined') {
        console.warn("Lenis not loaded, using native scroll");
        // Use native scroll as fallback
        window.addEventListener("scroll", () => {
            ScrollTrigger.update();
        });
        return;
    }
    
    try {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: "vertical",
            gestureDirection: "vertical",
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2
        });
        
        // Connect Lenis to ScrollTrigger
        lenis.on("scroll", () => {
            ScrollTrigger.update();
        });
        
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        console.log("Lenis initialized successfully");
    } catch (error) {
        console.error("Lenis initialization failed:", error);
        // Fallback to native scroll
        window.addEventListener("scroll", () => {
            ScrollTrigger.update();
        });
    }
}

function initPage() {
    // Loading counter animation
    const loadingOverlay = document.getElementById("loading-overlay");
    const loadingCounter = document.getElementById("loading-counter");
    
    console.log("initPage called");
    console.log("loadingOverlay:", loadingOverlay);
    console.log("loadingCounter:", loadingCounter);
    
    let counter = 0;
    // Animate counter from 00 to 100
    const counterInterval = setInterval(() => {
        counter += Math.random() * 3 + 1; // Random increment for realistic feel
        if (counter >= 100) {
            counter = 100;
            clearInterval(counterInterval);
            console.log("Counter reached 100, starting fade out");
            // When counter reaches 100, start fade out
            setTimeout(() => {
                // First animate the loading text out
                gsap.to(loadingOverlay.querySelector(".loading-counter"), {
                    opacity: 0,
                    y: -20,
                    duration: 0.6,
                    ease: "power2.inOut"
                });
                gsap.to(loadingOverlay.childNodes[0], {
                    opacity: 0,
                    y: -20,
                    duration: 0.6,
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Then slide overlay up and out to reveal content
                        gsap.to(loadingOverlay, {
                            y: "-100%",
                            duration: 1.2,
                            ease: "power3.inOut",
                            delay: 0.3,
                            onComplete: () => {
                                console.log("Overlay animation complete");
                                loadingOverlay.style.display = "none";
                                // Refresh ScrollTrigger after overlay is hidden
                                ScrollTrigger.refresh();
                                // Start staggered animation for left and right columns
                                animateColumns();
                            }
                        });
                    }
                });
            }, 200); // Small delay after reaching 100
        }
        loadingCounter.textContent = `[${counter.toFixed(0).padStart(2, "0")}]`;
    }, 30);
    const duration = 0.64;
    const debugInfo = document.getElementById("debug-info");
    const fixedContainer = document.getElementById("fixed-container");
    const fixedSectionElement = document.querySelector(".fixed-section");
    const header = document.querySelector(".header");
    const content = document.querySelector(".content");
    const footer = document.getElementById("footer");
    const leftColumn = document.getElementById("left-column");
    const rightColumn = document.getElementById("right-column");
    const featured = document.getElementById("featured");
    const backgrounds = document.querySelectorAll(".background-image");
    const artists = document.querySelectorAll(".artist");
    const categories = document.querySelectorAll(".category");
    const featuredContents = document.querySelectorAll(".featured-content");
    const progressFill = document.getElementById("progress-fill");
    const currentSectionDisplay = document.getElementById("current-section");
    const splitTexts = {};

    // Function to animate columns with stagger
    function animateColumns() {
        const artistItems = document.querySelectorAll(".artist");
        const categoryItems = document.querySelectorAll(".category");
        // Animate left column (artists) first
        artistItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add("loaded");
            }, index * 60);
        });
        // Animate right column (categories) with slight delay
        categoryItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add("loaded");
            }, index * 60 + 200); // 200ms delay after artists start
        });
    }

    // Function to update progress numbers
    function updateProgressNumbers() {
        currentSectionDisplay.textContent = (currentSection + 1)
            .toString()
            .padStart(2, "0");
    }

    // Calculate exact scroll positions for each section
    const fixedSectionTop = fixedSectionElement.offsetTop;
    const fixedSectionHeight = fixedSectionElement.offsetHeight;
    let currentSection = 0;
    let isAnimating = false;
    let isSnapping = false;
    let lastProgress = 0;
    let scrollDirection = 0;
    let sectionPositions = [];
    // Each section takes 10% of the total scroll distance
    for (let i = 0; i < 10; i++) {
        sectionPositions.push(fixedSectionTop + (fixedSectionHeight * i) / 10);
    }

    // Function to navigate to a specific section
    function navigateToSection(index) {
        if (index === currentSection || isAnimating || isSnapping) return;

        // Enable audio on first user interaction and play sound
        soundManager.enableAudio();
        soundManager.play("click");

        isSnapping = true;
        const targetPosition = sectionPositions[index];

        // Start the visual transition
        changeSection(index);

        // Scroll to the target position
        try {
            if (lenis) {
                lenis.scrollTo(targetPosition, {
                    duration: 0.8,
                    easing: (t) => 1 - Math.pow(1 - t, 3),
                    lock: true,
                    onComplete: () => {
                        isSnapping = false;
                    }
                });
            } else {
                // Fallback to native scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
                isSnapping = false;
            }
        } catch (error) {
            console.error("Scroll error:", error);
            isSnapping = false;
        }
    }

    // Add click and hover handlers for navigation
    artists.forEach((artist, index) => {
        artist.addEventListener("click", (e) => {
            e.preventDefault();
            navigateToSection(index);
        });

        artist.addEventListener("mouseenter", () => {
            soundManager.enableAudio();
            soundManager.play("hover");
        });
    });

    categories.forEach((category, index) => {
        category.addEventListener("click", (e) => {
            e.preventDefault();
            navigateToSection(index);
        });

        category.addEventListener("mouseenter", () => {
            soundManager.enableAudio();
            soundManager.play("hover");
        });
    });

    // Enable audio on any user interaction
    document.addEventListener(
        "click",
        () => {
            soundManager.enableAudio();
        },
        { once: true }
    );

    try {
        featuredContents.forEach((content, index) => {
            const h3 = content.querySelector("h3");
            if (h3) {
                gsap.set(h3, { opacity: 1, y: 0 });
                // Initialize empty splitTexts object for each section
                splitTexts[`featured-${index}`] = { words: [] };
            }
        });
    } catch (error) {
        console.error("Featured content setup error:", error);
    }
    gsap.set(fixedContainer, {
        height: "100vh"
    });
    
    // Wait a moment for the page to settle before creating ScrollTrigger
    setTimeout(() => {
        try {
            const mainScrollTrigger = ScrollTrigger.create({
                trigger: ".fixed-section",
                start: "top top",
                end: "bottom bottom",
                pin: ".fixed-container",
                pinSpacing: true,
                onUpdate: (self) => {
                    if (isSnapping) return; // Don't process updates while snapping
                    const progress = self.progress;
                    const progressDelta = progress - lastProgress;
                    // Detect scroll direction
                    if (Math.abs(progressDelta) > 0.001) {
                        scrollDirection = progressDelta > 0 ? 1 : -1;
                    }
                    // Calculate which section we should be in
                    const targetSection = Math.min(9, Math.floor(progress * 10));
                    // Check if we've crossed a section boundary
                    if (targetSection !== currentSection && !isAnimating) {
                        // Determine the next section (only allow moving one section at a time)
                        const nextSection =
                            currentSection + (targetSection > currentSection ? 1 : -1);
                        // Snap to this section
                        snapToSection(nextSection);
                    }
                    lastProgress = progress;
                    // Update progress fill based on current section
                    const sectionProgress = currentSection / 9;
                    progressFill.style.width = `${sectionProgress * 100}%`;
                    debugInfo.textContent = `Section: ${currentSection}, Target: ${targetSection}, Progress: ${progress.toFixed(
                        3
                    )}, Direction: ${scrollDirection}`;
                }
            });
            console.log("ScrollTrigger created successfully");
            ScrollTrigger.refresh();
        } catch (error) {
            console.error("ScrollTrigger creation error:", error);
        }
    }, 100);

    function snapToSection(targetSection) {
        if (
            targetSection < 0 ||
            targetSection > 9 ||
            targetSection === currentSection ||
            isAnimating
        )
            return;
        isSnapping = true;
        // Start the visual transition
        changeSection(targetSection);
        // Snap the scroll position to this exact section
        const targetPosition = sectionPositions[targetSection];
        try {
            if (lenis) {
                lenis.scrollTo(targetPosition, {
                    duration: 0.6,
                    easing: (t) => 1 - Math.pow(1 - t, 3),
                    lock: true, // Prevent other scroll events during snap
                    onComplete: () => {
                        isSnapping = false;
                    }
                });
            } else {
                // Fallback to native scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
                isSnapping = false;
            }
        } catch (error) {
            console.error("Snap to section error:", error);
            isSnapping = false;
        }
    }
    const parallaxAmount = 5;

    function changeSection(newSection) {
        if (newSection === currentSection || isAnimating) return;
        isAnimating = true;
        const isScrollingDown = newSection > currentSection;
        const previousSection = currentSection;
        currentSection = newSection;

        // Update progress numbers
        updateProgressNumbers();

        // Update progress fill based on current section - THIS IS THE FIX
        const sectionProgress = currentSection / 9;
        progressFill.style.width = `${sectionProgress * 100}%`;

        debugInfo.textContent = `Changing to Section: ${newSection} (${isScrollingDown ? "Down" : "Up"
            })`;
        featuredContents.forEach((content, i) => {
            if (i !== newSection && i !== previousSection) {
                content.classList.remove("active");
                gsap.set(content, {
                    visibility: "hidden",
                    opacity: 0
                });
            }
        });
        if (previousSection !== null) {
            const prevWords = splitTexts[`featured-${previousSection}`]?.words;
            if (prevWords && prevWords.length > 0) {
                gsap.to(prevWords, {
                    yPercent: isScrollingDown ? -100 : 100,
                    opacity: 0,
                    duration: duration * 0.6,
                    stagger: isScrollingDown ? 0.03 : -0.03,
                    ease: "customEase",
                    onComplete: () => {
                        featuredContents[previousSection].classList.remove("active");
                        gsap.set(featuredContents[previousSection], {
                            visibility: "hidden"
                        });
                    }
                });
            } else {
                // If no SplitText words, just hide the previous content
                featuredContents[previousSection].classList.remove("active");
                gsap.set(featuredContents[previousSection], {
                    visibility: "hidden"
                });
            }
        }
        const newWords = splitTexts[`featured-${newSection}`]?.words;
        if (newWords && newWords.length > 0) {
            // Play text change sound with a 250ms delay to avoid overlapping with click sound
            soundManager.play("textChange", 250);

            featuredContents[newSection].classList.add("active");
            gsap.set(featuredContents[newSection], {
                visibility: "visible",
                opacity: 1
            });
            gsap.set(newWords, {
                yPercent: isScrollingDown ? 100 : -100,
                opacity: 0
            });
            gsap.to(newWords, {
                yPercent: 0,
                opacity: 1,
                duration: duration,
                stagger: isScrollingDown ? 0.05 : -0.05,
                ease: "customEase"
            });
        } else {
            // If no SplitText words, just show the featured content
            soundManager.play("textChange", 250);
            featuredContents[newSection].classList.add("active");
            gsap.set(featuredContents[newSection], {
                visibility: "visible",
                opacity: 1
            });
        }
        backgrounds.forEach((bg, i) => {
            bg.classList.remove("previous", "active");
            if (i === newSection) {
                if (isScrollingDown) {
                    gsap.set(bg, {
                        opacity: 1,
                        y: 0,
                        clipPath: "inset(100% 0 0 0)"
                    });
                    gsap.to(bg, {
                        clipPath: "inset(0% 0 0 0)",
                        duration: duration,
                        ease: "customEase"
                    });
                } else {
                    gsap.set(bg, {
                        opacity: 1,
                        y: 0,
                        clipPath: "inset(0 0 100% 0)"
                    });
                    gsap.to(bg, {
                        clipPath: "inset(0 0 0% 0)",
                        duration: duration,
                        ease: "customEase"
                    });
                }
                bg.classList.add("active");
            } else if (i === previousSection) {
                bg.classList.add("previous");
                gsap.to(bg, {
                    y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`,
                    duration: duration,
                    ease: "customEase"
                });
                gsap.to(bg, {
                    opacity: 0,
                    delay: duration * 0.5,
                    duration: duration * 0.5,
                    ease: "customEase",
                    onComplete: () => {
                        bg.classList.remove("previous");
                        gsap.set(bg, {
                            y: 0
                        });
                        isAnimating = false;
                    }
                });
            } else {
                gsap.to(bg, {
                    opacity: 0,
                    duration: duration * 0.3,
                    ease: "customEase"
                });
            }
        });
        artists.forEach((artist, i) => {
            if (i === newSection) {
                artist.classList.add("active");
                gsap.to(artist, {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                artist.classList.remove("active");
                gsap.to(artist, {
                    opacity: 0.3,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
        categories.forEach((category, i) => {
            if (i === newSection) {
                category.classList.add("active");
                gsap.to(category, {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                category.classList.remove("active");
                gsap.to(category, {
                    opacity: 0.3,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    }
    let globalProgress = 0;
    const progressBarTrigger = ScrollTrigger.create({
        trigger: ".scroll-container",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
            globalProgress = self.progress;
        }
    });
    // End section scroll handling - fixed to prevent overlap
    ScrollTrigger.create({
        trigger: ".end-section",
        start: "top center",
        end: "bottom bottom",
        onUpdate: (self) => {
            // Handle blur effects first (always execute)
            if (self.progress > 0.1) {
                footer.classList.add("blur");
                leftColumn.classList.add("blur");
                rightColumn.classList.add("blur");
                featured.classList.add("blur");
            } else {
                footer.classList.remove("blur");
                leftColumn.classList.remove("blur");
                rightColumn.classList.remove("blur");
                featured.classList.remove("blur");
            }
            // Only start unpinning when we're actually in the end section
            if (self.progress > 0.1) {
                const newHeight = Math.max(
                    0,
                    100 - ((self.progress - 0.1) / 0.9) * 100
                );
                gsap.to(fixedContainer, {
                    height: `${newHeight}vh`,
                    duration: 0.1,
                    ease: "power1.out"
                });
                const moveY = (-(self.progress - 0.1) / 0.9) * 200;
                gsap.to(header, {
                    y: moveY * 1.5,
                    duration: 0.1,
                    ease: "power1.out"
                });
                gsap.to(content, {
                    y: `calc(${moveY}px + (-50%))`,
                    duration: 0.1,
                    ease: "power1.out"
                });
                gsap.to(footer, {
                    y: moveY * 0.5,
                    duration: 0.1,
                    ease: "power1.out"
                });
            } else {
                // Reset positions when scrolling back up
                gsap.to(fixedContainer, {
                    height: "100vh",
                    duration: 0.1,
                    ease: "power1.out"
                });
                gsap.to(header, {
                    y: 0,
                    duration: 0.1,
                    ease: "power1.out"
                });
                gsap.to(content, {
                    y: "-50%",
                    duration: 0.1,
                    ease: "power1.out"
                });
                gsap.to(footer, {
                    y: 0,
                    duration: 0.1,
                    ease: "power1.out"
                });
            }
            debugInfo.textContent = `End Section - Height: ${fixedContainer.style.height
                }, Progress: ${self.progress.toFixed(2)}`;
        }
    });
    document.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "h") {
            debugInfo.style.display =
                debugInfo.style.display === "none" ? "block" : "none";
        }
    });

    // Initialize progress numbers
    updateProgressNumbers();

    debugInfo.textContent = `Current Section: 0 (Initial)`;
}

// Global access to sound manager for adding more sounds later
window.addSound = function (name, url, volume = 0.3) {
    soundManager.addSound(name, url, volume);
};

// Example usage for adding more sounds later:
// window.addSound('background', 'path/to/background-music.mp3', 0.1);
