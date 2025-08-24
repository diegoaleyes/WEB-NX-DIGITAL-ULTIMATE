/**
 * =====================================================
 * NEXODIGITAL - JAVASCRIPT TECH VANGUARDISTA
 * Funcionalidades avanzadas con efectos modernos
 * =====================================================
 */

// Configuración global
const CONFIG = {
  animations: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 100
  },
  particles: {
    count: 50,
    speed: 1,
    size: { min: 1, max: 3 }
  },
  performance: {
    throttleDelay: 16,
    debounceDelay: 300
  }
};

// Utilidades de performance
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Detección de capacidades del dispositivo
const deviceCapabilities = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: window.innerWidth >= 768 && window.innerWidth <= 1024,
  supportsTouch: 'ontouchstart' in window,
  supportsHover: window.matchMedia('(hover: hover)').matches,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isRetina: window.devicePixelRatio > 1
};

// Sistema de partículas
class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    
    if (!deviceCapabilities.prefersReducedMotion && !deviceCapabilities.isMobile) {
      this.init();
    }
  }

  init() {
    this.createCanvas();
    this.createParticles();
    this.animate();
    this.handleResize();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '-1';
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    this.resize();
  }

  createParticles() {
    for (let i = 0; i < CONFIG.particles.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.particles.speed,
        vy: (Math.random() - 0.5) * CONFIG.particles.speed,
        size: Math.random() * (CONFIG.particles.size.max - CONFIG.particles.size.min) + CONFIG.particles.size.min,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      // Actualizar posición
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Rebotar en los bordes
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      // Dibujar partícula
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 209, 178, ${particle.opacity})`;
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  resize() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
  }

  handleResize() {
    window.addEventListener('resize', debounce(() => this.resize(), CONFIG.performance.debounceDelay));
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas) {
      this.canvas.remove();
    }
  }
}

// Cursor personalizado
class CustomCursor {
  constructor() {
    if (!deviceCapabilities.supportsHover || deviceCapabilities.isMobile) return;
    
    this.cursor = document.querySelector('.custom-cursor');
    this.dot = document.querySelector('.cursor-dot');
    this.ring = document.querySelector('.cursor-ring');
    this.isVisible = false;
    
    if (this.cursor) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
    this.cursor.style.opacity = '0';
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => this.updatePosition(e));
    document.addEventListener('mouseenter', () => this.show());
    document.addEventListener('mouseleave', () => this.hide());
    
    // Efectos hover en elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, .clickable');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.grow());
      el.addEventListener('mouseleave', () => this.shrink());
    });
  }

  updatePosition(e) {
    const x = e.clientX;
    const y = e.clientY;
    
    this.dot.style.left = `${x}px`;
    this.dot.style.top = `${y}px`;
    this.ring.style.left = `${x}px`;
    this.ring.style.top = `${y}px`;
  }

  show() {
    this.isVisible = true;
    this.cursor.style.opacity = '1';
  }

  hide() {
    this.isVisible = false;
    this.cursor.style.opacity = '0';
  }

  grow() {
    this.ring.style.transform = 'translate(-50%, -50%) scale(1.5)';
    this.dot.style.transform = 'translate(-50%, -50%) scale(2)';
  }

  shrink() {
    this.ring.style.transform = 'translate(-50%, -50%) scale(1)';
    this.dot.style.transform = 'translate(-50%, -50%) scale(1)';
  }
}

// Sistema de animaciones por scroll
class ScrollAnimations {
  constructor() {
    this.observers = [];
    this.init();
  }

  init() {
    this.createIntersectionObserver();
    this.observeElements();
  }

  createIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  observeElements() {
    const elements = document.querySelectorAll('.section, .service-card, .project-card, .blog-card');
    elements.forEach(el => this.observer.observe(el));
  }

  animateElement(element) {
    if (deviceCapabilities.prefersReducedMotion) {
      element.style.opacity = '1';
      return;
    }

    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    
    requestAnimationFrame(() => {
      element.style.transition = `opacity ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}, transform ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }
}

// Navegación mejorada
class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navList = document.querySelector('.nav-list');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.isOpen = false;
    this.lastScrollY = 0;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.initSmoothScroll();
    this.updateActiveLink();
  }

  bindEvents() {
    // Toggle móvil
    if (this.navToggle) {
      this.navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    }

    // Cerrar al hacer click en enlaces (móvil)
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isOpen) {
          this.close();
        }
      });
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.navbar.contains(e.target)) {
        this.close();
      }
    });

    // Scroll effects
    window.addEventListener('scroll', throttle(() => {
      this.handleScroll();
    }, CONFIG.performance.throttleDelay));

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' &&