import React, { useEffect, useRef } from 'react';
import LoadingOverlay from './components/LoadingOverlay';
import BackgroundImages from './components/BackgroundImages';
import Header from './components/Header';
import ContentColumns from './components/ContentColumns';
import Footer from './components/Footer';
import EndSection from './components/EndSection';
import { soundManager } from './services/soundManager';
import './index.css';

// GSAP, Lenis, etc. are loaded globally from public/index.html
const { gsap, ScrollTrigger, CustomEase, SplitText, Lenis } = window;

function App() {
  // Create refs for all elements the script needs
  const loadingOverlayRef = useRef(null);
  const loadingCounterRef = useRef(null);
  const debugInfoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fixedSectionRef = useRef(null);
  const fixedContainerRef = useRef(null);
  const backgroundContainerRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const featuredRef = useRef(null);
  const footerRef = useRef(null);
  const progressFillRef = useRef(null);
  const currentSectionRef = useRef(null);

  // This useEffect hook replaces "DOMContentLoaded"
  useEffect(() => {
    // Wait for GSAP and Lenis to be ready
    if (!gsap || !ScrollTrigger || !CustomEase || !SplitText || !Lenis) {
      console.error("Required libraries not loaded!");
      return;
    }
    
    gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
    CustomEase.create("customEase", "M0,0 C0.86,0 0.07,1 1,1");

    let lenis;
    
    // --- Start of Ported script.js Logic ---
    
    // 1. Lenis Initialization
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
      window.addEventListener("scroll", () => {
        ScrollTrigger.update();
      });
    }

    // 2. Loading Counter Animation
    const loadingOverlay = loadingOverlayRef.current;
    const loadingCounter = loadingCounterRef.current;
    
    let counter = 0;
    const counterInterval = setInterval(() => {
      counter += Math.random() * 3 + 1;
      if (counter >= 100) {
        counter = 100;
        clearInterval(counterInterval);
        setTimeout(() => {
          gsap.to(loadingCounter, { opacity: 0, y: -20, duration: 0.6, ease: "power2.inOut" });
          gsap.to(loadingOverlay.childNodes[0], {
            opacity: 0, y: -20, duration: 0.6, ease: "power2.inOut",
            onComplete: () => {
              gsap.to(loadingOverlay, {
                y: "-100%", duration: 1.2, ease: "power3.inOut", delay: 0.3,
                onComplete: () => {
                  loadingOverlay.style.display = "none";
                  ScrollTrigger.refresh();
                  animateColumns();
                }
              });
            }
          });
        }, 200);
      }
      loadingCounter.textContent = `[${counter.toFixed(0).padStart(2, "0")}]`;
    }, 30);

    // 3. Get All DOM Element Refs
    const duration = 0.64;
    const debugInfo = debugInfoRef.current;
    const fixedContainer = fixedContainerRef.current;
    const fixedSectionElement = fixedSectionRef.current;
    const header = headerRef.current; // This ref will be populated by the component
    const content = contentRef.current;
    const footer = footerRef.current;
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;
    const featured = featuredRef.current;
    
    // Use querySelector *within* the refs to find child groups
    const backgrounds = fixedContainer.querySelectorAll(".background-image");
    const artists = leftColumn.querySelectorAll(".artist");
    const categories = rightColumn.querySelectorAll(".category");
    const featuredContents = featured.querySelectorAll(".featured-content");
    
    const progressFill = progressFillRef.current;
    const currentSectionDisplay = currentSectionRef.current;
    const splitTexts = {};

    function animateColumns() {
      artists.forEach((item, index) => {
        setTimeout(() => item.classList.add("loaded"), index * 60);
      });
      categories.forEach((item, index) => {
        setTimeout(() => item.classList.add("loaded"), index * 60 + 200);
      });
    }

    function updateProgressNumbers() {
      currentSectionDisplay.textContent = (currentSection + 1).toString().padStart(2, "0");
    }

    const fixedSectionTop = fixedSectionElement.offsetTop;
    const fixedSectionHeight = fixedSectionElement.offsetHeight;
    let currentSection = 0;
    let isAnimating = false;
    let isSnapping = false;
    let lastProgress = 0;
    let scrollDirection = 0;
    let sectionPositions = [];
    for (let i = 0; i < 10; i++) {
      sectionPositions.push(fixedSectionTop + (fixedSectionHeight * i) / 10);
    }

    function navigateToSection(index) {
      if (index === currentSection || isAnimating || isSnapping) return;
      soundManager.enableAudio();
      soundManager.play("click");
      isSnapping = true;
      const targetPosition = sectionPositions[index];
      changeSection(index);
      try {
        if (lenis) {
          lenis.scrollTo(targetPosition, {
            duration: 0.8, easing: (t) => 1 - Math.pow(1 - t, 3), lock: true,
            onComplete: () => { isSnapping = false; }
          });
        } else {
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
          isSnapping = false;
        }
      } catch (error) {
        console.error("Scroll error:", error);
        isSnapping = false;
      }
    }

    artists.forEach((artist, index) => {
      artist.addEventListener("click", (e) => { e.preventDefault(); navigateToSection(index); });
      artist.addEventListener("mouseenter", () => { soundManager.enableAudio(); soundManager.play("hover"); });
    });
    categories.forEach((category, index) => {
      category.addEventListener("click", (e) => { e.preventDefault(); navigateToSection(index); });
      category.addEventListener("mouseenter", () => { soundManager.enableAudio(); soundManager.play("hover"); });
    });

    document.addEventListener("click", () => { soundManager.enableAudio(); }, { once: true });

    try {
      featuredContents.forEach((content, index) => {
        const h3 = content.querySelector("h3");
        if (h3) {
          gsap.set(h3, { opacity: 1, y: 0 });
          splitTexts[`featured-${index}`] = { words: [] };
        }
      });
    } catch (error) {
      console.error("Featured content setup error:", error);
    }
    
    gsap.set(fixedContainer, { height: "100vh" });

    setTimeout(() => {
      try {
        ScrollTrigger.create({
          trigger: fixedSectionElement,
          start: "top top",
          end: "bottom bottom",
          pin: fixedContainer,
          pinSpacing: true,
          onUpdate: (self) => {
            if (isSnapping) return;
            const progress = self.progress;
            const progressDelta = progress - lastProgress;
            if (Math.abs(progressDelta) > 0.001) {
              scrollDirection = progressDelta > 0 ? 1 : -1;
            }
            const targetSection = Math.min(9, Math.floor(progress * 10));
            if (targetSection !== currentSection && !isAnimating) {
              const nextSection = currentSection + (targetSection > currentSection ? 1 : -1);
              snapToSection(nextSection);
            }
            lastProgress = progress;
            const sectionProgress = currentSection / 9;
            progressFill.style.width = `${sectionProgress * 100}%`;
            if(debugInfo) debugInfo.textContent = `Section: ${currentSection}, Target: ${targetSection}, Progress: ${progress.toFixed(3)}, Direction: ${scrollDirection}`;
          }
        });
        console.log("ScrollTrigger created successfully");
        ScrollTrigger.refresh();
      } catch (error) {
        console.error("ScrollTrigger creation error:", error);
      }
    }, 100);

    function snapToSection(targetSection) {
      if (targetSection < 0 || targetSection > 9 || targetSection === currentSection || isAnimating) return;
      isSnapping = true;
      changeSection(targetSection);
      const targetPosition = sectionPositions[targetSection];
      try {
        if (lenis) {
          lenis.scrollTo(targetPosition, {
            duration: 0.6, easing: (t) => 1 - Math.pow(1 - t, 3), lock: true,
            onComplete: () => { isSnapping = false; }
          });
        } else {
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
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

      updateProgressNumbers();
      const sectionProgress = currentSection / 9;
      progressFill.style.width = `${sectionProgress * 100}%`;

      if(debugInfo) debugInfo.textContent = `Changing to Section: ${newSection} (${isScrollingDown ? "Down" : "Up"})`;
      
      featuredContents.forEach((content, i) => {
        if (i !== newSection && i !== previousSection) {
          content.classList.remove("active");
          gsap.set(content, { visibility: "hidden", opacity: 0 });
        }
      });
      
      if (previousSection !== null) {
        const prevWords = splitTexts[`featured-${previousSection}`]?.words;
        if (prevWords && prevWords.length > 0) {
          gsap.to(prevWords, {
            yPercent: isScrollingDown ? -100 : 100, opacity: 0, duration: duration * 0.6,
            stagger: isScrollingDown ? 0.03 : -0.03, ease: "customEase",
            onComplete: () => {
              featuredContents[previousSection].classList.remove("active");
              gsap.set(featuredContents[previousSection], { visibility: "hidden" });
            }
          });
        } else {
          featuredContents[previousSection].classList.remove("active");
          gsap.set(featuredContents[previousSection], { visibility: "hidden" });
        }
      }
      
      const newWords = splitTexts[`featured-${newSection}`]?.words;
      if (newWords && newWords.length > 0) {
        soundManager.play("textChange", 250);
        featuredContents[newSection].classList.add("active");
        gsap.set(featuredContents[newSection], { visibility: "visible", opacity: 1 });
        gsap.set(newWords, { yPercent: isScrollingDown ? 100 : -100, opacity: 0 });
        gsap.to(newWords, {
          yPercent: 0, opacity: 1, duration: duration,
          stagger: isScrollingDown ? 0.05 : -0.05, ease: "customEase"
        });
      } else {
        soundManager.play("textChange", 250);
        featuredContents[newSection].classList.add("active");
        gsap.set(featuredContents[newSection], { visibility: "visible", opacity: 1 });
      }
      
      backgrounds.forEach((bg, i) => {
        bg.classList.remove("previous", "active");
        if (i === newSection) {
          if (isScrollingDown) {
            gsap.set(bg, { opacity: 1, y: 0, clipPath: "inset(100% 0 0 0)" });
            gsap.to(bg, { clipPath: "inset(0% 0 0 0)", duration: duration, ease: "customEase" });
          } else {
            gsap.set(bg, { opacity: 1, y: 0, clipPath: "inset(0 0 100% 0)" });
            gsap.to(bg, { clipPath: "inset(0 0 0% 0)", duration: duration, ease: "customEase" });
          }
          bg.classList.add("active");
        } else if (i === previousSection) {
          bg.classList.add("previous");
          gsap.to(bg, { y: isScrollingDown ? `${parallaxAmount}%` : `-${parallaxAmount}%`, duration: duration, ease: "customEase" });
          gsap.to(bg, {
            opacity: 0, delay: duration * 0.5, duration: duration * 0.5, ease: "customEase",
            onComplete: () => {
              bg.classList.remove("previous");
              gsap.set(bg, { y: 0 });
              isAnimating = false;
            }
          });
        } else {
          gsap.to(bg, { opacity: 0, duration: duration * 0.3, ease: "customEase" });
        }
      });

      artists.forEach((artist, i) => {
        if (i === newSection) {
          artist.classList.add("active");
          gsap.to(artist, { opacity: 1, duration: 0.3, ease: "power2.out" });
        } else {
          artist.classList.remove("active");
          gsap.to(artist, { opacity: 0.3, duration: 0.3, ease: "power2.out" });
        }
      });
      categories.forEach((category, i) => {
        if (i === newSection) {
          category.classList.add("active");
          gsap.to(category, { opacity: 1, duration: 0.3, ease: "power2.out" });
        } else {
          category.classList.remove("active");
          gsap.to(category, { opacity: 0.3, duration: 0.3, ease: "power2.out" });
        }
      });
    }

    ScrollTrigger.create({
      trigger: ".end-section",
      start: "top center",
      end: "bottom bottom",
      onUpdate: (self) => {
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
        if (self.progress > 0.1) {
          const newHeight = Math.max(0, 100 - ((self.progress - 0.1) / 0.9) * 100);
          gsap.to(fixedContainer, { height: `${newHeight}vh`, duration: 0.1, ease: "power1.out" });
          const moveY = (-(self.progress - 0.1) / 0.9) * 200;
          gsap.to(header, { y: moveY * 1.5, duration: 0.1, ease: "power1.out" });
          gsap.to(content, { y: `calc(${moveY}px + (-50%))`, duration: 0.1, ease: "power1.out" });
          gsap.to(footer, { y: moveY * 0.5, duration: 0.1, ease: "power1.out" });
        } else {
          gsap.to(fixedContainer, { height: "100vh", duration: 0.1, ease: "power1.out" });
          gsap.to(header, { y: 0, duration: 0.1, ease: "power1.out" });
          gsap.to(content, { y: "-50%", duration: 0.1, ease: "power1.out" });
          gsap.to(footer, { y: 0, duration: 0.1, ease: "power1.out" });
        }
        if(debugInfo) debugInfo.textContent = `End Section - Height: ${fixedContainer.style.height}, Progress: ${self.progress.toFixed(2)}`;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "h" && debugInfo) {
        debugInfo.style.display = debugInfo.style.display === "none" ? "block" : "none";
      }
    });

    updateProgressNumbers();
    if(debugInfo) debugInfo.textContent = `Current Section: 0 (Initial)`;
    
    // Cleanup function for when component unmounts
    return () => {
      // Kill all ScrollTriggers
      ScrollTrigger.getAll().forEach(st => st.kill());
      // Stop Lenis
      if(lenis) lenis.destroy();
      // Stop GSAP ticker
      gsap.ticker.remove(lenis.raf);
      // Remove all event listeners
      artists.forEach((artist, index) => {
        artist.removeEventListener("click", (e) => { e.preventDefault(); navigateToSection(index); });
        artist.removeEventListener("mouseenter", () => { soundManager.enableAudio(); soundManager.play("hover"); });
      });
      categories.forEach((category, index) => {
        category.removeEventListener("click", (e) => { e.preventDefault(); navigateToSection(index); });
        category.removeEventListener("mouseenter", () => { soundManager.enableAudio(); soundManager.play("hover"); });
      });
      // ... (add cleanup for other listeners if necessary)
    }

  }, []); // Empty dependency array means this runs once on mount

  return (
    <>
      <LoadingOverlay ref={loadingOverlayRef} counterRef={loadingCounterRef} />
      <div className="debug-info" id="debug-info" ref={debugInfoRef}>Current Section: 0</div>
      
      <div className="scroll-container" id="scroll-container" ref={scrollContainerRef}>
        <div className="fixed-section" id="fixed-section" ref={fixedSectionRef}>
          <div className="fixed-container" id="fixed-container" ref={fixedContainerRef}>
            
            <BackgroundImages ref={backgroundContainerRef} />
            
            <div className="grid-container">
              <Header />
              
              <ContentColumns 
                ref={contentRef}
                leftColRef={leftColumnRef}
                rightColRef={rightColumnRef}
                featuredRef={featuredRef}
              />
              
              <Footer 
                ref={footerRef}
                progressFillRef={progressFillRef}
                currentSectionRef={currentSectionRef}
              />
            </div>
          </div>
        </div>
        
        <EndSection />
      </div>
    </>
  );
}

export default App;