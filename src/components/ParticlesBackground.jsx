import React, { useEffect, useRef } from 'react';
import './ParticlesBackground.css';

// Configuration variables - feel free to adjust these
const PARTICLE_CONFIG = {
  count: 2000,                 // Increased to 5000 particles
  sizeMin: 2,                  // Minimum size in pixels
  sizeMax: 8,                  // Maximum size in pixels
  opacityMin: 0.1,             // Minimum opacity
  opacityMax: 0.6,             // Maximum opacity
  speedMin: 0.03,              // Minimum parallax speed factor
  speedMax: 0.06,              // Maximum parallax speed factor
  floatAmplitude: 15,          // Float animation distance in pixels
  floatSpeed: 200,              // Float animation duration in seconds
  zDepthMin: -1500,            // Minimum z-depth value
  zDepthMax: 0,                // Maximum z-depth value
  colors: [                    // Array of possible colors
    'rgba(255, 255, 255, 1)',  // White
    'rgb(167, 167, 255)',  // Light blue-ish
    'rgb(255, 190, 255)'   // Light pink-ish
  ],
  // New Voronoi configuration
  voronoiPoints: 200,          // Number of Voronoi points
  densityVariation: 0.7,      // How much the density varies (0-1)
  minClusterSize: 50,         // Minimum size of a cluster
  maxClusterSize: 200         // Maximum size of a cluster
};

const ParticlesBackground = ({ config = {} }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  
  // Merge provided config with defaults
  const particleConfig = { ...PARTICLE_CONFIG, ...config };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = canvas.width;
    let height = canvas.height;

    // Generate Voronoi points
    const generateVoronoiPoints = () => {
      const points = [];
      for (let i = 0; i < particleConfig.voronoiPoints; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          density: Math.random() * particleConfig.densityVariation
        });
      }
      return points;
    };

    // Calculate distance between two points
    const distance = (x1, y1, x2, y2) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    // Find the closest Voronoi point to a given position
    const findClosestPoint = (x, y, points) => {
      let closest = points[0];
      let minDist = distance(x, y, points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        const dist = distance(x, y, points[i].x, points[i].y);
        if (dist < minDist) {
          minDist = dist;
          closest = points[i];
        }
      }
      return closest;
    };

    // Initialize particles with Voronoi-based distribution
    const initParticles = () => {
      particles = [];
      const voronoiPoints = generateVoronoiPoints();
      const totalParticles = particleConfig.count;
      
      // Create a grid of potential particle positions
      const gridSize = 20; // Size of grid cells
      const grid = [];
      
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const closestPoint = findClosestPoint(x, y, voronoiPoints);
          const dist = distance(x, y, closestPoint.x, closestPoint.y);
          const maxDist = Math.max(width, height) * 0.3; // Maximum influence distance
          
          // Calculate density based on distance and Voronoi point's density
          const density = closestPoint.density * (1 - Math.min(dist / maxDist, 1));
          
          // Add position to grid with its density
          grid.push({ x, y, density });
        }
      }
      
      // Sort grid by density
      grid.sort((a, b) => b.density - a.density);
      
      // Distribute particles based on density
      for (let i = 0; i < totalParticles; i++) {
        const gridIndex = Math.floor(Math.random() * (grid.length * 0.3)); // Use top 30% of dense areas
        const pos = grid[gridIndex];
        
        // Add some randomness to the position
        const x = pos.x + (Math.random() - 0.5) * gridSize;
        const y = pos.y + (Math.random() - 0.5) * gridSize;
        
        particles.push({
          x,
          y,
          size: lerp(
            particleConfig.sizeMin,
            particleConfig.sizeMax,
            Math.pow(Math.random(), 10) // Logarithmic-like distribution: more small, fewer large
          ),
          opacity: lerp(particleConfig.opacityMin, particleConfig.opacityMax, Math.random()),
          speed: lerp(particleConfig.speedMin, particleConfig.speedMax, Math.random()),
          color: particleConfig.colors[Math.floor(Math.random() * particleConfig.colors.length)],
          zDepth: lerp(particleConfig.zDepthMin, particleConfig.zDepthMax, Math.random()),
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeed: lerp(0.5, 1.5, Math.random())
        });
      }
    };

    // Handle resize
    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initParticles();
    };

    // Animation loop
    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach(particle => {
        // Update position
        const floatX = Math.sin(time * 0.001 * particle.floatSpeed + particle.floatOffset) * particleConfig.floatAmplitude;
        const floatY = Math.cos(time * 0.001 * particle.floatSpeed + particle.floatOffset) * particleConfig.floatAmplitude;
        
        // Calculate parallax effect
        const scrollY = window.scrollY || window.pageYOffset;
        const parallaxY = scrollY * particle.speed;

        // Draw particle
        ctx.beginPath();
        ctx.arc(
          particle.x + floatX,
          particle.y + floatY - parallaxY,
          particle.size,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    handleResize();
    window.addEventListener('resize', handleResize);
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleConfig]);

  return (
    <div className="particles-container">
      <canvas ref={canvasRef} className="particles-canvas" />
    </div>
  );
};

// Utility function for linear interpolation
function lerp(min, max, t) {
  return min * (1 - t) + max * t;
}

export default ParticlesBackground; 