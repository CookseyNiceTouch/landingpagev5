import React, { useEffect, useRef } from 'react'
import './LandingPage.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const Scene3D = () => {
  const mountRef = useRef(null);
  const loadingRef = useRef(null);

  useEffect(() => {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene()
    
    // Update the gradient colors to match the CSS
    const topColor = new THREE.Color(0x12a8ff); // Light blue
    const bottomColor = new THREE.Color(0x5a4aff); // Purple
    
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        float t = max(0.0, min(1.0, (h * 0.5 + 0.5)));
        vec3 color = mix(bottomColor, topColor, t);
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    const uniforms = {
      topColor: { value: topColor },
      bottomColor: { value: bottomColor },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };
    
    const skyGeo = new THREE.SphereGeometry(500, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
    
    // Set up camera with default position
    const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000)
    // Store the original camera position - this will be our "zero point"
    const defaultCameraPosition = new THREE.Vector3(4.84, 1.24, -4.59);
    camera.position.copy(defaultCameraPosition);
    camera.fov = 10;
    camera.updateProjectionMatrix();
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // Keep alpha for gradient blending
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap // Softer shadows
    renderer.physicallyCorrectLights = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    mountRef.current.appendChild(renderer.domElement)
    
    // Enhanced lighting setup
    // Ambient light - subtle base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)
    
    // Key light - main directional light (warm tint)
    const keyLight = new THREE.DirectionalLight(0xffffeb, 1.0)
    keyLight.position.set(5, 5, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 500
    keyLight.shadow.bias = -0.0001
    scene.add(keyLight)
    
    // Fill light - softer light from opposite side (cool tint)
    const fillLight = new THREE.DirectionalLight(0xe6f0ff, 0.6)
    fillLight.position.set(-5, 3, -5)
    scene.add(fillLight)
    
    // Rim light - dramatic backlight
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
    rimLight.position.set(0, -5, -5)
    scene.add(rimLight)
    
    // Set up orbit controls with enhanced damping
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enableZoom = false
    controls.enablePan = false
    controls.autoRotate = false
    controls.enableRotate = false // Disable direct rotation from OrbitControls
    controls.update()
    
    // Default camera target at the center of the scene
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    camera.lookAt(cameraTarget);
    
    // Initial camera parameters
    const initialDistance = defaultCameraPosition.length();
    const initialPhi = Math.acos(defaultCameraPosition.y / initialDistance); // polar angle
    const initialTheta = Math.atan2(defaultCameraPosition.x, defaultCameraPosition.z); // azimuthal angle
    
    // Variables for mouse-controlled rotation with the default position as zero point
    let targetPhi = initialPhi;
    let targetTheta = initialTheta;
    let currentPhi = initialPhi;
    let currentTheta = initialTheta;
    const damping = 0.05; // Damping factor for smooth motion
    
    // Track mouse position
    const handleMouseMove = (event) => {
      // Calculate mouse position as percentage from center
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      
      // Set target rotation based on mouse position, using original position as base
      targetPhi = initialPhi + mouseY * 0.1; // Limit vertical rotation
      targetTheta = initialTheta + mouseX * 0.2; // Allow more horizontal rotation
      
      // Clamp the polar angle to avoid flipping
      targetPhi = Math.max(0.1, Math.min(Math.PI - 0.1, targetPhi));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Load GLTF model
    const loader = new GLTFLoader()
    // Put your model in the public folder and reference it like: '/your-model.gltf'
    loader.load(
      '/officebitsgl.gltf',
      (gltf) => {
        // Model successfully loaded
        const model = gltf.scene
        scene.add(model)
        
        // Center model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.x = -center.x
        model.position.y = -center.y
        model.position.z = -center.z
        
        // Enable shadows on the model
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true
            node.receiveShadow = true
          }
        })
        
        // Hide loading indicator
        if (loadingRef.current) {
          loadingRef.current.style.display = 'none'
        }
        
        // Dispatch event to notify that 3D scene is loaded
        window.dispatchEvent(new Event('scene3d-loaded'));
        
        console.log('Model loaded successfully')
      },
      (xhr) => {
        // Loading progress
        const progress = Math.floor((xhr.loaded / xhr.total) * 100)
        if (loadingRef.current) {
          loadingRef.current.textContent = `Loading model: ${progress}%`
        }
        console.log(`${progress}% loaded`)
      },
      (error) => {
        // Error loading model
        if (loadingRef.current) {
          loadingRef.current.textContent = 'Error loading model'
          loadingRef.current.style.color = 'red'
        }
        console.error('Error loading model:', error)
      }
    )
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Animation loop with smooth camera movement
    function animate() {
      requestAnimationFrame(animate)
      
      // Apply damping to smoothly transition to target rotation
      currentPhi += (targetPhi - currentPhi) * damping;
      currentTheta += (targetTheta - currentTheta) * damping;
      
      // Calculate camera position using spherical coordinates
      camera.position.x = initialDistance * Math.sin(currentPhi) * Math.sin(currentTheta);
      camera.position.z = initialDistance * Math.sin(currentPhi) * Math.cos(currentTheta);
      camera.position.y = initialDistance * Math.cos(currentPhi);
      
      // Make sure camera always looks at the center
      camera.lookAt(cameraTarget);
      
      controls.update()
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      controls.dispose()
    }
  }, [])
  
  return (
    <div className="scene-container" ref={mountRef}>
      <div className="loading" ref={loadingRef}>Loading model...</div>
    </div>
  )
}

export default Scene3D
