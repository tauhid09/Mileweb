This repository is a converted React + Tailwind version of the original static site.

How to run:

1. Open a terminal in the project folder (PowerShell on Windows):

   npm install
   npm run dev

2. The dev server (Vite) will start and you can open the URL it prints (usually http://localhost:5173).

Notes:
- Tailwind is configured and the original stylesheet has been ported into `src/index.css` with Tailwind directives.
- GSAP and Lenis are used via npm packages. Some advanced GSAP plugins (SplitText / CustomEase) were not included; the code falls back gracefully.
- If you want an exact pixel-perfect port, we can further translate the original GSAP animations into React hooks using the installed GSAP plugins.
