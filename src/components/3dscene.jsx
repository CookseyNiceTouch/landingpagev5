import React, { useEffect, useRef } from 'react'
import './LandingPage.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Configuration object for easy tweaking
const CONFIG = {
  // Object hover animation settings
  objectAnimation: {
    movementDistance: 0.025, // Maximum distance objects move when hovered (reduced from 0.05)
    rotationDegrees: 1, // Maximum rotation in degrees (+/-)
    resetDelay: 3000, // Time in ms before objects return to original position
    animationSpeed: 0.05 // Animation interpolation speed (higher = faster)
  }
};

const Scene3D = () => {
  const mountRef = useRef(null);
  const loadingRef = useRef(null);
  const isInitializedRef = useRef(false); // Ref to prevent double initialization
  const rendererRef = useRef(null); // Ref to store renderer for cleanup
  const sceneRef = useRef(null); // Ref to store scene for cleanup
  const controlsRef = useRef(null); // Ref to store controls for cleanup
  const animationFrameIdRef = useRef(null); // Ref for animation frame ID
  const modelObjectsRef = useRef({}); // Ref to store model objects
  const hoveredObjectRef = useRef(null); // Ref to track currently hovered object
  const lastInteractionTimeRef = useRef(Date.now()); // Track last interaction time

  useEffect(() => {
    // --- Prevent Double Initialization --- 
    if (isInitializedRef.current) {
      console.log('Skipping initialization, already done.');
      return;
    }
    isInitializedRef.current = true;
    console.log('Initializing 3D scene...');
    
    // --- Guard against missing mount point --- 
    if (!mountRef.current) {
      console.error("Mount point not found for 3D scene.");
      return;
    }
    
    // --- Check if canvas already exists (safety net) --- 
    if (mountRef.current.querySelector('canvas')) {
      console.warn('Canvas already exists in mount point, removing...');
      mountRef.current.innerHTML = ''; // Clear previous canvas if any
    }

    // Create scene, camera, and renderer
    const scene = new THREE.Scene()
    sceneRef.current = scene; // Store scene in ref
    
    // Make the scene background transparent
    scene.background = null;
    
    // Set up camera with default position
    const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000)
    // Store the original camera position - this will be our "zero point"
    const defaultCameraPosition = new THREE.Vector3(4.08, 2.06, -4.61);
    camera.position.copy(defaultCameraPosition);
    camera.fov = 10;
    camera.updateProjectionMatrix();
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // Enable alpha for transparent background
    })
    rendererRef.current = renderer; // Store renderer in ref
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap // Softer shadows
    renderer.physicallyCorrectLights = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    mountRef.current.appendChild(renderer.domElement)
    
    // Enhanced lighting setup
    // Ambient light - subtle base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    
    // Key light - main directional light (warm tint)
    const keyLight = new THREE.DirectionalLight(0xffffeb, 2.0)
    keyLight.position.set(5, 5, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 500
    keyLight.shadow.bias = -0.0001
    scene.add(keyLight)
    
    // Fill light - softer light from opposite side (cool tint)
    const fillLight = new THREE.DirectionalLight(0xe6f0ff, 1.5)
    fillLight.position.set(-5, 3, -5)
    scene.add(fillLight)
    
    // Rim light - dramatic backlight
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
    rimLight.position.set(0, -5, -5)
    scene.add(rimLight)
    
    // Set up orbit controls with enhanced damping
    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls; // Store controls in ref
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
    
    // Setup raycaster for object interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
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
      
      // Update mouse position for raycasting
      mouse.x = mouseX;
      mouse.y = -mouseY; // Invert Y for Three.js coordinate system
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Load GLTF model
    const loader = new GLTFLoader()
    // Put your model in the public folder and reference it like: '/your-model.gltf'
    loader.load(
      '/officebitsreduced.gltf',
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
        
        // Process each object in the model
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Skip specified objects for animations
            if (node.name !== "Polygon Reduction.12" && node.name !== "SM_AI_vol1_05_table_01") {
              // Store original position and rotation
              node.userData.originalPosition = node.position.clone();
              node.userData.originalRotation = node.rotation.clone();
              
              // Random direction vector (normalized)
              node.userData.randomDirection = new THREE.Vector3(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
              ).normalize().multiplyScalar(CONFIG.objectAnimation.movementDistance);
              
              // Random rotation in degrees (within CONFIG range), converted to radians
              const randomDegrees = (Math.random() * 2 - 1) * CONFIG.objectAnimation.rotationDegrees;
              const randomRadians = randomDegrees * (Math.PI / 180);
              node.userData.rotationOffset = new THREE.Vector3(
                randomRadians,
                randomRadians,
                randomRadians
              );
              
              // Remove the hasBeenHovered flag so objects can be animated multiple times
              // Set a reset timer for this object
              node.userData.resetTimerId = null;
              
              // Store reference to mesh
              modelObjectsRef.current[node.uuid] = node;
            }
            
            console.log(`Model part found: ${node.name}`);
          }
        });
        
        // Hide loading indicator
        if (loadingRef.current) {
          loadingRef.current.style.display = 'none';
        }
        
        // Dispatch event to notify that 3D scene is loaded
        window.dispatchEvent(new Event('scene3d-loaded'));
        
        console.log('Model loaded successfully');
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
      if (!rendererRef.current) return; // Ensure renderer exists
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Animation loop with smooth camera movement
    function animate() {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      // Apply damping to smoothly transition to target rotation
      currentPhi += (targetPhi - currentPhi) * damping;
      currentTheta += (targetTheta - currentTheta) * damping;
      
      // Calculate camera position using spherical coordinates
      camera.position.x = initialDistance * Math.sin(currentPhi) * Math.sin(currentTheta);
      camera.position.z = initialDistance * Math.sin(currentPhi) * Math.cos(currentTheta);
      camera.position.y = initialDistance * Math.cos(currentPhi);
      
      // Make sure camera always looks at the center
      camera.lookAt(cameraTarget);
      
      // Perform raycasting if scene is loaded
      if (sceneRef.current) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
        
        // Handle new hover
        if (intersects.length > 0) {
          // Find the first object that's not in the excluded list
          const hoveredObject = intersects.find(intersect => 
            intersect.object.name !== "Polygon Reduction.12" && 
            intersect.object.name !== "SM_AI_vol1_05_table_01" && 
            modelObjectsRef.current[intersect.object.uuid]
          );
          
          if (hoveredObject) {
            const obj = hoveredObject.object;
            hoveredObjectRef.current = obj.uuid;
            
            // Update last interaction time
            lastInteractionTimeRef.current = Date.now();
            
            // Clear any existing reset timer
            if (obj.userData.resetTimerId) {
              clearTimeout(obj.userData.resetTimerId);
              obj.userData.resetTimerId = null;
            }
            
            // Calculate target position using random direction from current position
            const targetPos = obj.position.clone().add(obj.userData.randomDirection);
            
            // Calculate target rotation from current rotation
            const targetRotX = obj.rotation.x + obj.userData.rotationOffset.x;
            const targetRotY = obj.rotation.y + obj.userData.rotationOffset.y;
            const targetRotZ = obj.rotation.z + obj.userData.rotationOffset.z;
            
            // Animate to new position and rotation
            obj.userData.targetPosition = targetPos;
            obj.userData.targetRotation = new THREE.Vector3(targetRotX, targetRotY, targetRotZ);
            
            // Set a timeout to return to original position after CONFIG.resetDelay
            obj.userData.resetTimerId = setTimeout(() => {
              obj.userData.targetPosition = obj.userData.originalPosition.clone();
              obj.userData.targetRotation = new THREE.Vector3(
                obj.userData.originalRotation.x,
                obj.userData.originalRotation.y,
                obj.userData.originalRotation.z
              );
            }, CONFIG.objectAnimation.resetDelay);
            
            // Continue animation until target is reached
            if (obj.userData.targetPosition) {
              obj.position.lerp(obj.userData.targetPosition, CONFIG.objectAnimation.animationSpeed * 2);
              obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, obj.userData.targetRotation.x, CONFIG.objectAnimation.animationSpeed * 2);
              obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, obj.userData.targetRotation.y, CONFIG.objectAnimation.animationSpeed * 2);
              obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, obj.userData.targetRotation.z, CONFIG.objectAnimation.animationSpeed * 2);
            }
          } else {
            hoveredObjectRef.current = null;
          }
        } else {
          hoveredObjectRef.current = null;
        }
        
        // Continue animations for all objects with target positions
        Object.values(modelObjectsRef.current).forEach(obj => {
          if (obj.userData.targetPosition) {
            // Continue animation to target position and rotation
            obj.position.lerp(obj.userData.targetPosition, CONFIG.objectAnimation.animationSpeed);
            obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, obj.userData.targetRotation.x, CONFIG.objectAnimation.animationSpeed);
            obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, obj.userData.targetRotation.y, CONFIG.objectAnimation.animationSpeed);
            obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, obj.userData.targetRotation.z, CONFIG.objectAnimation.animationSpeed);
          }
        });
      }
      
      if (controlsRef.current) controlsRef.current.update()
      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera)
      }
    }
    
    animate()
    
    // --- Enhanced Cleanup on component unmount --- 
    return () => {
      console.log('Cleaning up 3D scene...');
      isInitializedRef.current = false; // Reset initialization flag
      
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      
      // Cancel animation frame
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      
      // Dispose of Three.js objects
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      
      // Clear object references and timers
      Object.values(modelObjectsRef.current).forEach(obj => {
        if (obj.userData.resetTimerId) {
          clearTimeout(obj.userData.resetTimerId);
        }
      });
      modelObjectsRef.current = {};
      hoveredObjectRef.current = null;
      
      // Dispose scene resources (geometry, materials, textures)
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            // Properly handle arrays of materials
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(material => {
              // Dispose textures
              Object.values(material).forEach(value => {
                if (value instanceof THREE.Texture) {
                  value.dispose();
                }
              });
              material.dispose();
            });
          }
        });
        sceneRef.current = null;
      }
      
      // Remove the renderer and its canvas
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement && mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }
      
      console.log('3D scene cleanup complete.');
    }
  }, []) // Empty dependency array ensures this runs only on mount/unmount
  
  return (
    <div className="scene-container" ref={mountRef}>
      <div className="loading" ref={loadingRef}>Loading model...</div>
    </div>
  )
}

export default Scene3D
