import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

gsap.registerPlugin(ScrollTrigger)

const artistsList = [
  'Silence','Meditation','Intuition','Authenticity','Presence','Listening','Curiosity','Patience','Surrender','Simplicity'
]
const categoriesList = [
  'Reduction','Essence','Space','Resonance','Truth','Feeling','Clarity','Emptiness','Awareness','Minimalism'
]
const featuredList = [
  'Creative Elements','Inner Stillness','Deep Knowing','True Expression','Now Moment','Deep Attention','Open Exploration','Calm Waiting','Let Go Control','Pure Essence'
]
const backgrounds = Array.from({length:10}).map((_,i)=> `https://assets.codepen.io/7558/flame-glow-blur-00${i+1}.jpg`)

export default function App(){
  const [currentSection, setCurrentSection] = useState(0)
  const prevSectionRef = useRef(0)
  const fixedContainerRef = useRef(null)
  const progressRef = useRef(null)
  const loadingRef = useRef(null)
  const [lenisInstance, setLenisInstance] = useState(null)

  useEffect(() => {
    let counter = 0;
    const loadingEl = loadingRef.current;
    const counterEl = loadingEl?.querySelector('.loading-counter');
    const interval = setInterval(() => {
      counter += Math.random() * 3 + 1;
      if (counter >= 100) {
        counter = 100;
        clearInterval(interval);
        gsap.to(loadingEl, { y: '-100%', duration: 1.2, ease: 'power3.inOut', onComplete: () => { loadingEl.style.display = 'none'; } });
      }
      if (counterEl) counterEl.textContent = `[${Math.round(counter).toString().padStart(2, '0')}]`;
    }, 30);

    let lenis;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        wrapper: window,
        gestureOrientation: 'vertical',
        syncTouch: true,
        touchMultiplier: 2,
        wheelMultiplier: 1,
        infinite: false
      });
      lenis.on('scroll', () => ScrollTrigger.update());
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      setLenisInstance(lenis);
    } catch (e) {
      console.warn('Lenis init failed, using native scroll', e);
      window.addEventListener('scroll', () => ScrollTrigger.update());
    }

    const fixedSection = document.querySelector('.fixed-section');
    let positions = [];
    let lastIdx = -1;
    
    function computePositions() {
      if (!fixedSection) return;
      const top = fixedSection.offsetTop;
      const height = fixedSection.offsetHeight;
      positions = [];
      for (let i = 0; i < 10; i++) {
        positions.push(top + (height * i) / 10);
      }
    }
    
    function handleLenisScroll() {
      if (positions.length === 0) return;
      
      const scrollY = lenis ? lenis.scroll : (window.scrollY || window.pageYOffset);
      
      let idx = 0;
      for (let i = 0; i < positions.length; i++) {
        if (scrollY >= positions[i]) idx = i;
      }
      idx = Math.min(9, idx);
      
      const images = document.querySelectorAll('.background-image');
      images.forEach((img, i) => {
        const sectionStart = positions[i] || 0;
        const sectionEnd = positions[i + 1] || (positions[i] + (positions[1] - positions[0]));
        let progress = (scrollY - sectionStart) / (sectionEnd - sectionStart);
        progress = Math.max(0, Math.min(1, progress));
        
        let yOffset = 0;
        let opacity = 0;
        
        if (i === idx) {
          opacity = 1;
        } else if (i === idx + 1) {
          yOffset = 100 - progress * 100;
          opacity = progress;
        } else if (i < idx) {
          yOffset = -50;
          opacity = 0;
        } else {
          yOffset = 100;
          opacity = 0;
        }
        
        gsap.set(img, {
          y: yOffset,
          opacity: opacity,
          zIndex: i === idx ? 2 : 1
        });
      });
      
      setCurrentSection(idx);
      if (progressRef.current) {
        progressRef.current.style.width = `${(idx / 9) * 100}%`;
      }
      
      document.querySelectorAll('.artist').forEach((el, i) => el.classList.toggle('active', i === idx));
      document.querySelectorAll('.category').forEach((el, i) => el.classList.toggle('active', i === idx));
    }
    
    setTimeout(() => {
      computePositions();
      if (lenis) {
        lenis.on('scroll', handleLenisScroll);
      } else {
        window.addEventListener('scroll', handleLenisScroll);
      }
    }, 100);

    setTimeout(() => {
      document.querySelectorAll('.artist').forEach((el, i) => setTimeout(() => el.classList.add('loaded'), i * 60));
      document.querySelectorAll('.category').forEach((el, i) => setTimeout(() => el.classList.add('loaded'), i * 60 + 200));
    }, 600);

    return () => {
      if (lenis) {
        lenis.off('scroll', handleLenisScroll);
      } else {
        window.removeEventListener('scroll', handleLenisScroll);
      }
      clearInterval(interval);
    };
  }, []);

  function navigateToSection(index){
    const fixedSection = document.querySelector('.fixed-section')
    const top = fixedSection.offsetTop
    const height = fixedSection.offsetHeight
    const target = top + (height * index)/10
    try {
      if (lenisInstance) lenisInstance.scrollTo(target, { duration: 1 });
      else window.scrollTo({ top: target, behavior: 'smooth' });
    } catch (e) { window.scrollTo({ top: target, behavior: 'smooth' }); }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div ref={loadingRef} className="loading-overlay">Loading <span className="loading-counter">[00]</span></div>
      <div className="debug-info" style={{display:'none'}}>Current Section: {currentSection}</div>
      <div className="scroll-container">
        <div className="fixed-section">
          <div className="fixed-container" ref={fixedContainerRef}>
            <div className="background-container">
              {backgrounds.map((src, i)=> (
                <img
                  key={i}
                  src={src}
                  alt={`bg-${i}`}
                  className="background-image"
                  style={{ opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 1 }}
                />
              ))}
            </div>
            <div className="grid-container">
              <div className="header">
                <div className="header-row">The Creative</div>
                <div className="header-row">Process</div>
              </div>
              <div className="content">
                <div className="left-column">
                  {artistsList.map((a,i)=> (
                    <div key={i} className={`artist ${i===0? 'active':''}`} onClick={(e)=>{ e.preventDefault(); navigateToSection(i) }} onMouseEnter={()=>{ /* optionally play hover sound */ }}>{a}</div>
                  ))}
                </div>
                <div className="featured">
                  {featuredList.map((f,i)=> (
                    <div key={i} className={`featured-content ${i===0? 'active':''}`}><h3>{f}</h3></div>
                  ))}
                </div>
                <div className="right-column">
                  {categoriesList.map((c,i)=> (
                    <div key={i} className={`category ${i===0? 'active':''}`} onClick={(e)=>{ e.preventDefault(); navigateToSection(i) }}>{c}</div>
                  ))}
                </div>
              </div>
              <div className="footer">
                <div className="header-row">Beyond</div>
                <div className="header-row">Thinking</div>
                <div className="progress-indicator">
                  <div className="progress-numbers">
                    <span>{String(currentSection+1).padStart(2,'0')}</span>
                    <span>{String(10).padStart(2,'0')}</span>
                  </div>
                  <div className="progress-fill" ref={progressRef}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="end-section h-screen flex items-center justify-center bg-white">
          <p className="fin rotate-90 text-2xl">fin</p>
        </div>
      </div>
    </div>
  )
}
