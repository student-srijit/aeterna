// GSAP and THREE are loaded via CDN in HTML, so they're available globally
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// --- Advanced Three.js Star Showroom ---
function initThree() {
  const canvas = document.getElementById("three-canvas")
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Galaxy Geometry
  const starCount = 12000
  const positions = new Float32Array(starCount * 3)
  const colors = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 1200
    colors[i] = 0.5 + Math.random() * 0.5 // Brightness
  }

  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

  const starMaterial = new THREE.PointsMaterial({
    size: 0.7,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  })

  const stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)

  camera.position.z = 1000

  // Intro Sequence
  const intro = document.getElementById("star-showroom")
  const title = document.getElementById("intro-title")
  const loaderProgress = document.getElementById("loader-progress")

  if (!intro || !title || !loaderProgress) {
    console.error("Loading screen elements not found!")
    return
  }

  // Animate loader progress from left to right
  if (typeof gsap !== 'undefined') {
    gsap.set(loaderProgress, { x: "-100%" })
    gsap.to(loaderProgress, {
      x: "200%",
      duration: 3,
      ease: "none",
      delay: 0.5
    })

    const tl = gsap.timeline({ delay: 0.5 })

    tl.to(title, { opacity: 1, y: 0, duration: 2, ease: "expo.out" })
      .to(camera.position, { z: 200, duration: 4, ease: "power4.inOut" }, 0)
      .to(stars.rotation, { z: 1.5, duration: 4, ease: "power2.inOut" }, 0)
      .to(intro, { 
        opacity: 0, 
        duration: 2.5, 
        ease: "power3.inOut",
        onComplete: () => {
          hideLoadingScreen()
        }
      }, "-=1")
  } else {
    // Fallback if GSAP not loaded
    console.warn("GSAP not loaded, using fallback")
    setTimeout(() => {
      hideLoadingScreen()
    }, 3000)
  }

  function hideLoadingScreen() {
    if (intro) {
      intro.style.opacity = "0"
      intro.style.pointerEvents = "none"
      setTimeout(() => {
        intro.style.display = "none"
        intro.classList.add("hidden")
        document.body.style.overflow = "auto"
        revealHero()
      }, 500)
    }
  }

  function animate() {
    requestAnimationFrame(animate)
    stars.rotation.y += 0.0005
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
}

// --- Reveal Hero Animation ---
function revealHero() {
  gsap.to(".reveal-item", {
    opacity: 1,
    y: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: "expo.out",
  })
}

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:3000/api'

// --- Auth Functions ---
let authToken = localStorage.getItem('authToken') || null
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

// Save auth to localStorage
function saveAuth(token, user) {
  authToken = token
  currentUser = user
  localStorage.setItem('authToken', token)
  localStorage.setItem('currentUser', JSON.stringify(user))
}

// Clear auth from localStorage
function clearAuth() {
  authToken = null
  currentUser = null
  localStorage.removeItem('authToken')
  localStorage.removeItem('currentUser')
}

// API Helper Function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// --- UI Logic ---
window.toggleModal = (id) => {
  const modal = document.getElementById(id)
  const isOpening = modal.classList.contains("hidden")

  if (isOpening) {
    modal.classList.remove("hidden")
    document.body.style.overflow = "hidden"
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.4 })
  } else {
    gsap.to(modal, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        modal.classList.add("hidden")
        document.body.style.overflow = "auto"
      },
    })
  }
}

window.openBooking = (model) => {
  document.getElementById("b-model").value = model
  window.toggleModal("booking-modal")
}

window.switchAuth = () => {
  const title = document.getElementById("auth-title")
  const signup = document.getElementById("signup-fields")
  const form = document.getElementById("auth-form")
  const errorMsg = document.getElementById("auth-error")
  
  signup.classList.toggle("hidden")
  title.innerText = signup.classList.contains("hidden") ? "Elite Portal" : "Member Enrollment"
  
  // Clear form and errors
  form.reset()
  if (errorMsg) {
    errorMsg.textContent = ""
    errorMsg.classList.add("hidden")
  }
}

// Show Error Message
function showAuthError(message) {
  let errorMsg = document.getElementById("auth-error")
  if (!errorMsg) {
    const form = document.getElementById("auth-form")
    errorMsg = document.createElement("div")
    errorMsg.id = "auth-error"
    errorMsg.className = "text-red-400 text-sm mt-4 text-center"
    form.appendChild(errorMsg)
  }
  errorMsg.textContent = message
  errorMsg.classList.remove("hidden")
}

// Handle Auth Form Submission
const authForm = document.getElementById("auth-form")
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    
    const form = e.target
    const isSignup = !document.getElementById("signup-fields").classList.contains("hidden")
    const submitBtn = form.querySelector("button[type='submit']")
    const originalText = submitBtn.innerText
    
    // Get form data
    const nameInput = form.querySelector('input[name="name"]')
    const emailInput = form.querySelector('input[name="email"]')
    const passwordInput = form.querySelector('input[name="password"]')
    
    const name = nameInput ? nameInput.value : ''
    const email = emailInput ? emailInput.value : ''
    const password = passwordInput ? passwordInput.value : ''
    
    // Validation
    if (!email || !password) {
      showAuthError("Email and password are required")
      return
    }
    
    if (isSignup && !name) {
      showAuthError("Name is required for signup")
      return
    }
    
    // Hide previous errors
    const errorMsg = document.getElementById("auth-error")
    if (errorMsg) {
      errorMsg.classList.add("hidden")
    }
    
    try {
      submitBtn.disabled = true
      submitBtn.innerText = isSignup ? "CREATING ACCOUNT..." : "AUTHENTICATING..."
      
      if (isSignup) {
        // Signup
        const response = await apiRequest('/auth/signup', {
          method: 'POST',
          body: { name, email, password }
        })
        
        saveAuth(response.token, response.user)
        submitBtn.innerText = "ACCOUNT CREATED!"
        
        setTimeout(() => {
          window.toggleModal("login-modal")
          alert(`Welcome to Aeterna, ${response.user.name}! Your account has been created successfully.`)
          form.reset()
        }, 1000)
      } else {
        // Login
        const response = await apiRequest('/auth/login', {
          method: 'POST',
          body: { email, password }
        })
        
        saveAuth(response.token, response.user)
        submitBtn.innerText = "ACCESS GRANTED!"
        
        setTimeout(() => {
          window.toggleModal("login-modal")
          alert(`Welcome back, ${response.user.name}!`)
          form.reset()
          updateAuthUI()
        }, 1000)
      }
    } catch (error) {
      showAuthError(error.message || "Authentication failed. Please try again.")
      submitBtn.innerText = originalText
    } finally {
      submitBtn.disabled = false
    }
  })
}

// Update Auth UI based on login status
function updateAuthUI() {
  const portalBtn = document.querySelector('button[onclick*="login-modal"]')
  if (currentUser && portalBtn) {
    portalBtn.textContent = currentUser.name.split(' ')[0]
    portalBtn.onclick = () => {
      if (confirm('Do you want to logout?')) {
        clearAuth()
        portalBtn.textContent = "Portal"
        portalBtn.onclick = () => window.toggleModal('login-modal')
      }
    }
  }
}

// --- Booking Form Submission ---
document.getElementById("booking-form").addEventListener("submit", async (e) => {
  e.preventDefault()

  const form = e.target
  const submitBtn = form.querySelector("button[type='submit']")
  const originalText = submitBtn.innerText

  const bookingData = {
    name: document.getElementById("b-name").value,
    email: document.getElementById("b-email").value,
    model: document.getElementById("b-model").value
  }

  try {
    submitBtn.disabled = true
    submitBtn.innerText = "ENCRYPTING DATA..."

    // Simulate encryption delay
    await new Promise(resolve => setTimeout(resolve, 800))
    submitBtn.innerText = "SYNCING WITH DATABASE..."

    // Create booking via API
    const response = await apiRequest('/bookings', {
      method: 'POST',
      body: bookingData
    })

    submitBtn.innerText = "SUCCESS!"
    
    setTimeout(() => {
      alert(
        `PROTOCOL SUCCESS: ${response.booking.name}, your reservation for ${response.booking.model} [Ref: ${response.booking.referenceId}] is active. Private Agent will respond on secure channel: ${response.booking.email}`
      )
      window.toggleModal("booking-modal")
      form.reset()
      submitBtn.innerText = originalText
      submitBtn.disabled = false
    }, 1000)

  } catch (error) {
    console.error("Booking error:", error)
    submitBtn.innerText = "ERROR - TRY AGAIN"
    alert(`Booking failed: ${error.message}. Please try again.`)
    
    setTimeout(() => {
      submitBtn.innerText = originalText
      submitBtn.disabled = false
    }, 2000)
  }
})

// Scroll Trigger Animations
function initScrollAnimations() {
  gsap.utils.toArray(".car-card-large").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top bottom-=100",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "expo.out",
      delay: (i % 2) * 0.2,
    })
  })

  // Engineering cards animation
  gsap.utils.toArray(".engineering-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top bottom-=50",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "expo.out",
      delay: i * 0.1,
    })
  })
}

// --- Premium Custom Cursor ---
function initCustomCursor() {
  const cursor = document.getElementById("custom-cursor")
  const follower = document.getElementById("cursor-follower")
  
  if (!cursor || !follower) return
  
  let mouseX = 0
  let mouseY = 0
  let followerX = 0
  let followerY = 0
  
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    
    cursor.style.left = mouseX + "px"
    cursor.style.top = mouseY + "px"
  })
  
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1
    followerY += (mouseY - followerY) * 0.1
    
    follower.style.left = followerX + "px"
    follower.style.top = followerY + "px"
    
    requestAnimationFrame(animateFollower)
  }
  animateFollower()
  
  // Hover effects
  const interactiveElements = document.querySelectorAll("a, button, .car-card-large, .card-3d")
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("hover")
      follower.classList.add("hover")
    })
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("hover")
      follower.classList.remove("hover")
    })
  })
}

// --- Scroll Progress Indicator ---
function initScrollProgress() {
  const progressBar = document.querySelector(".scroll-progress-bar")
  if (!progressBar) return
  
  window.addEventListener("scroll", () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrolled = (window.scrollY / windowHeight) * 100
    progressBar.style.width = scrolled + "%"
  })
}

// --- Premium Navigation Blur Effect ---
function initNavBlur() {
  const nav = document.getElementById("main-nav")
  if (!nav) return
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      nav.classList.add("scrolled")
    } else {
      nav.classList.remove("scrolled")
    }
  })
}

// --- 3D Tilt Effect for Cards ---
function init3DTilt() {
  const cards = document.querySelectorAll(".card-3d")
  
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    })
    
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)"
    })
  })
}

// --- Animated Counters ---
function initCounters() {
  const counters = document.querySelectorAll(".counter-number")
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px"
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains("counted")) {
        entry.target.classList.add("counted")
        animateCounter(entry.target)
      }
    })
  }, observerOptions)
  
  counters.forEach((counter) => {
    observer.observe(counter)
  })
}

function animateCounter(element) {
  const target = parseFloat(element.getAttribute("data-target"))
  const isDecimal = element.getAttribute("data-decimal") === "true"
  const duration = 2000
  const startTime = performance.now()
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const current = target * easeOutQuart
    
    if (isDecimal) {
      element.textContent = current.toFixed(2)
    } else {
      element.textContent = Math.floor(current)
    }
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter)
    } else {
      if (isDecimal) {
        element.textContent = target.toFixed(2)
      } else {
        element.textContent = target
      }
    }
  }
  
  requestAnimationFrame(updateCounter)
}

// --- Smooth Scroll with Parallax ---
function initParallax() {
  const parallaxElements = document.querySelectorAll(".parallax-element")
  
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const rate = scrolled * 0.5
    
    parallaxElements.forEach((el) => {
      el.style.transform = `translateY(${rate}px)`
    })
  })
}

// --- Magnetic Effect for Buttons (excluding 3D cards) ---
function initMagneticEffect() {
  const magneticElements = document.querySelectorAll("button:not(.car-card-large button), nav a")
  
  magneticElements.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      
      const moveX = x * 0.15
      const moveY = y * 0.15
      
      el.style.transform = `translate(${moveX}px, ${moveY}px)`
    })
    
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)"
    })
  })
}

// Global Init
function initializeApp() {
  document.body.style.overflow = "hidden"
  
  // Wait for GSAP to be available
  if (typeof gsap === 'undefined') {
    console.warn("Waiting for GSAP to load...")
    setTimeout(initializeApp, 100)
    return
  }
  
  initThree()
  initScrollAnimations()
  initCustomCursor()
  initScrollProgress()
  initNavBlur()
  init3DTilt()
  initCounters()
  initParallax()
  initMagneticEffect()
  
  // Aggressive fallback: Hide loading screen after 6 seconds if animation fails
  setTimeout(() => {
    const intro = document.getElementById("star-showroom")
    if (intro && !intro.classList.contains("hidden") && intro.style.display !== "none") {
      console.warn("Fallback: Force hiding loading screen")
      intro.style.opacity = "0"
      intro.style.pointerEvents = "none"
      intro.style.display = "none"
      intro.classList.add("hidden")
      document.body.style.overflow = "auto"
      if (typeof revealHero === 'function') {
        revealHero()
      }
    }
  }, 6000)
}

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  updateAuthUI()
  
  // Check if user is logged in on page load
  if (authToken) {
    apiRequest('/auth/me')
      .then(({ user }) => {
        currentUser = user
        localStorage.setItem('currentUser', JSON.stringify(user))
        updateAuthUI()
      })
      .catch(() => {
        // Token invalid, clear auth
        clearAuth()
      })
  }
})
