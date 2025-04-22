import React, { useEffect, useRef } from 'react';
import './ParticlesBackground.css';

// Configuration variables - feel free to adjust these
const PARTICLE_CONFIG = {
  count: 500,                  // Number of particles
  sizeMin: 2,                  // Minimum size in pixels
  sizeMax: 12,                 // Maximum size in pixels
  opacityMin: 0.1,             // Minimum opacity
  opacityMax: 0.6,             // Maximum opacity
  speedMin: 0.03,              // Minimum parallax speed factor (reduced for slower movement)
  speedMax: 0.15,              // Maximum parallax speed factor (reduced for slower movement)
  floatAmplitude: 15,          // Float animation distance in pixels
  floatSpeed: 15,              // Float animation duration in seconds
  zDepthMin: -1500,             // Minimum z-depth value (negative = further away) (increased range)
  zDepthMax: 0,                // Maximum z-depth value (positive = closer)
  perspective: 400,           // CSS perspective value for 3D effect
  colors: [                    // Array of possible colors (will pick randomly)
    'rgba(255, 255, 255, 1)',  // White
    'rgba(230, 230, 255, 1)',  // Light blue-ish
    'rgba(255, 230, 255, 1)'   // Light pink-ish
  ]
};

const ParticlesBackground = ({ config = {} }) => {
  const particlesRef = useRef(null);
  
  // Merge provided config with defaults
  const particleConfig = { ...PARTICLE_CONFIG, ...config };
  
  useEffect(() => {
    const particles = [];
    const container = particlesRef.current;
    
    // IMPORTANT: Directly set CSS variables for the container
    container.style.setProperty('--perspective', `${particleConfig.perspective}px`);
    
    // Use ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      // Clear existing particles
      particles.forEach(particle => particle.remove());
      particles.length = 0;
      
      // Get current container dimensions
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      // Create new particles with updated dimensions
      createParticles(containerWidth, containerHeight);
    });
    
    resizeObserver.observe(container);
    
    // Function to create particles
    const createParticles = (width, height) => {
      // Create a document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      for (let i = 0; i < particleConfig.count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Create 3 equal groups of particles for each depth layer
        // This ensures we have visible particles at different depths
        let zDepthNormalized;
        if (i < particleConfig.count / 3) {
          // Far layer (0.0 - 0.33)
          zDepthNormalized = Math.random() * 0.33;
        } else if (i < 2 * particleConfig.count / 3) {
          // Middle layer (0.33 - 0.66)
          zDepthNormalized = 0.33 + Math.random() * 0.33;
        } else {
          // Near layer (0.66 - 1.0)
          zDepthNormalized = 0.66 + Math.random() * 0.34;
        }
        
        // Calculate z-depth from normalized value
        const zDepth = lerp(particleConfig.zDepthMin, particleConfig.zDepthMax, zDepthNormalized);
        
        // Distribute particles evenly across width and height
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        // Use a stronger non-linear scaling for more dramatic depth effect
        const depthFactor = Math.pow(zDepthNormalized, 1.2);
        
        // Size scales with depth - closer particles are larger (higher z-index values)
        const baseSize = lerp(particleConfig.sizeMin, particleConfig.sizeMax, Math.random());
        const size = baseSize * lerp(0.5, 3.0, depthFactor);
        
        // Opacity scales with depth - closer particles are more opaque
        const opacity = lerp(
          particleConfig.opacityMin, 
          particleConfig.opacityMax,
          lerp(0.7, 1.0, depthFactor) * Math.random()
        );
        
        // Speed scales with depth - CRITICAL CHANGE:
        // Lower speed for closer particles to create a proper parallax effect
        // Background elements should move slower than foreground elements
        const baseSpeedFactor = lerp(particleConfig.speedMin, particleConfig.speedMax, Math.random());
        const speedFactor = baseSpeedFactor * lerp(1.5, 0.5, depthFactor); // Inverted scaling - farther particles move faster
        
        // Float animation properties
        const animationDelay = Math.random() * particleConfig.floatSpeed;
        const animationDuration = particleConfig.floatSpeed * lerp(1.2, 0.8, depthFactor);
        
        // Random animation type (1-3)
        const animationType = Math.floor(Math.random() * 3) + 1;
        
        // Random color from the defined array
        const colorIndex = Math.floor(Math.random() * particleConfig.colors.length);
        const color = particleConfig.colors[colorIndex];
        
        // Apply styles
        Object.assign(particle.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${x}px`,
          top: `${y}px`,
          opacity: opacity.toString(),
          backgroundColor: color,
          animationDuration: `${animationDuration}s`,
          animationDelay: `-${animationDelay}s`,
          // IMPORTANT: Add animation class based on type rather than using nth-child
          animationName: `float-alt${animationType}`
        });
        
        // Set z-index based on depth (closest particles on top)
        const zIndex = Math.floor(lerp(1, 100, depthFactor)); // Increased z-index range
        particle.style.zIndex = zIndex.toString();
        
        // Store data for scroll handling
        particle.dataset.speed = speedFactor.toString();
        particle.dataset.baseY = y.toString();
        particle.dataset.z = zDepth.toString();
        particle.dataset.x = x.toString();
        particle.dataset.depthFactor = depthFactor.toString();
        
        // Add to fragment
        fragment.appendChild(particle);
        particles.push(particle);
      }
      
      // Add all particles at once for better performance
      container.appendChild(fragment);
      
      // Initial position update
      handleScroll();
    };
    
    // Function to update particle position based on scroll
    function updateParticlePosition(particle, scrollOffset) {
      const speed = parseFloat(particle.dataset.speed);
      const zDepth = parseFloat(particle.dataset.z);
      const x = parseFloat(particle.dataset.x);
      const baseY = parseFloat(particle.dataset.baseY);
      
      // IMPORTANT CHANGE: Reverse the direction of scrollOffset
      // This makes particles move slower than page content (negative parallax)
      // for a true "background" effect
      particle.style.transform = `translate3d(0, ${-scrollOffset * speed}px, ${zDepth}px)`;
    }
    
    // Utility function for linear interpolation
    function lerp(min, max, t) {
      return min * (1 - t) + max * t;
    }
    
    // Add scroll listener for parallax effect
    const handleScroll = () => {
      // Get window scroll position
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Get container's position
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + scrollY;
      
      // Calculate relative scroll position
      const relativeScrollY = scrollY - containerTop;
      
      // Update particle positions
      requestAnimationFrame(() => {
        particles.forEach(particle => {
          updateParticlePosition(particle, relativeScrollY);
        });
      });
    };
    
    // Add scroll event listener and trigger initial positioning
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // Clean up on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      particles.forEach(particle => particle.remove());
    };
  }, [particleConfig]);
  
  return (
    <div className="particles-container" ref={particlesRef}></div>
  );
};

export default ParticlesBackground; 