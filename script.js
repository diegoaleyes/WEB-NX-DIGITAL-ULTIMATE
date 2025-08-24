/**
 * =====================================================
 * NEXODIGITAL - JAVASCRIPT RESPONSIVE NAVIGATION
 * Funcionalidades optimizadas para menú móvil
 * =====================================================
 */

// Configuración global
const CONFIG = {
  animations: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    stagger: 50
  },
  performance: {
    throttleDelay: 16,
    debounceDelay: 300
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024
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

// Detección de dispositivo
const deviceCapabilities = {
  isMobile: () => window.innerWidth <= CONFIG.breakpoints.mobile,
  isTablet: () => window.innerWidth > CONFIG.breakpoints.mobile && window.innerWidth <= CONFIG.breakpoints.tablet,
  supportsTouch: 'ontouchstart' in window,
  supportsHover: window.matchMedia('(hover: hover)').matches,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

/**
 * Clase principal de navegación
 */
class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navList = document.querySelector('.nav-list');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.logo = document.querySelector('.logo');
    
    // Estados
    this.isOpen = false;
    this.lastScrollY = 0;
    this.scrollTimeout = null;
    
    // Verificar si los elementos existen
    if (!this.navbar || !this.navToggle || !this.navList) {
      console.warn('Navigation: Elementos del navbar no encontrados');
      return;
    }
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.initSmoothScroll();
    this.updateActiveLink();
    this.handleResize();
    
    console.log('Navigation: Inicializado correctamente');
  }

  bindEvents() {
    // Toggle móvil
    this.navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    // Cerrar al hacer click en enlaces
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Si es móvil y el menú está abierto
        if (this.isOpen && deviceCapabilities.isMobile()) {
          // Solo cerrar si es un enlace interno (no páginas externas)
          const href = link.getAttribute('href');
          if (href.startsWith('#')) {
            e.preventDefault();
            this.close();
            // Navegar después del cierre
            setTimeout(() => {
              this.scrollToSection(href);
            }, 150);
          } else {
            // Para enlaces externos, cerrar inmediatamente
            this.close();
          }
        }
      });
    });

    // Cerrar al hacer click fuera (solo móvil)
    document.addEventListener('click', (e) => {
      if (this.isOpen && 
          deviceCapabilities.isMobile() && 
          !this.navbar.contains(e.target)) {
        this.close();
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Handle resize
    window.addEventListener('resize', debounce(() => {
      this.handleResize();
    }, CONFIG.performance.debounceDelay));

    // Scroll effects
    window.addEventListener('scroll', throttle(() => {
      this.handleScroll();
    }, CONFIG.performance.throttleDelay));

    // Prevenir scroll en móvil cuando menu está abierto
    this.preventBodyScroll();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.navList.classList.add('active');
    this.navToggle.classList.add('active');
    this.isOpen = true;
    
    // Prevenir scroll del body
    if (deviceCapabilities.isMobile()) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';
    }
    
    // Animar entrada de enlaces con retraso
    this.animateLinksIn();
    
    console.log('Navigation: Menú abierto');
  }

  close() {
    this.navList.classList.remove('active');
    this.navToggle.classList.remove('active');
    this.isOpen = false;
    
    // Restaurar scroll del body
    if (deviceCapabilities.isMobile()) {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    console.log('Navigation: Menú cerrado');
  }

  animateLinksIn() {
    if (deviceCapabilities.prefersReducedMotion) return;
    
    const links = this.navList.querySelectorAll('li');
    
    links.forEach((link, index) => {
      // Reset inicial
      link.style.opacity = '0';
      link.style.transform = 'translateX(-20px)';
      
      // Animar con retraso escalonado
      setTimeout(() => {
        link.style.transition = `opacity ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}, transform ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
        link.style.opacity = '1';
        link.style.transform = 'translateX(0)';
      }, index * CONFIG.animations.stagger + 100);
    });
  }

  handleResize() {
    // Cerrar menú móvil al cambiar a desktop
    if (!deviceCapabilities.isMobile() && this.isOpen) {
      this.close();
    }
    
    // Reset estilos de enlaces en desktop
    if (!deviceCapabilities.isMobile()) {
      const links = this.navList.querySelectorAll('li');
      links.forEach(link => {
        link.style.opacity = '';
        link.style.transform = '';
        link.style.transition = '';
      });
    }
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Auto-hide navbar en scroll (opcional)
    if (Math.abs(currentScrollY - this.lastScrollY) > 10) {
      if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
        // Scrolling down
        this.navbar.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        this.navbar.style.transform = 'translateY(0)';
      }
    }
    
    this.lastScrollY = currentScrollY;
    
    // Actualizar enlace activo
    this.updateActiveLink();
  }

  initSmoothScroll() {
    // Smooth scroll para enlaces internos
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href !== '#') {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToSection(href);
        });
      }
    });
  }

  scrollToSection(href) {
    const target = document.querySelector(href);
    if (target) {
      const offsetTop = target.offsetTop - (this.navbar.offsetHeight + 20);
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - this.navbar.offsetHeight - 50;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && 
          window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    // Si estamos al inicio de la página
    if (window.scrollY < 100) {
      current = '';
    }
    
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      if ((current === '' && href === '#') || 
          (current !== '' && href === `#${current}`)) {
        link.classList.add('active');
      }
    });
  }

  preventBodyScroll() {
    // Prevenir scroll en iOS Safari cuando el menú está abierto
    let startY = 0;
    
    this.navList.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    });

    this.navList.addEventListener('touchmove', (e) => {
      if (this.isOpen) {
        const currentY = e.touches[0].clientY;
        const scrollTop = this.navList.scrollTop;
        const scrollHeight = this.navList.scrollHeight;
        const height = this.navList.clientHeight;
        
        // Permitir scroll interno del menú pero no del body
        if ((scrollTop <= 0 && currentY > startY) || 
            (scrollTop + height >= scrollHeight && currentY < startY)) {
          e.preventDefault();
        }
      }
    }, { passive: false });
  }
}

/**
 * Sistema de animaciones por scroll (opcional)
 */
class ScrollAnimations {
  constructor() {
    if (deviceCapabilities.prefersReducedMotion) return;
    
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
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    
    requestAnimationFrame(() => {
      element.style.transition = `opacity ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}, transform ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Utilidades adicionales
 */
const Utils = {
  // Detectar si un elemento está en viewport
  isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -offset &&
      rect.left >= -offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  },

  // Obtener altura del navbar dinámicamente
  getNavbarHeight() {
    const navbar = document.querySelector('.navbar');
    return navbar ? navbar.offsetHeight : 0;
  },

  // Smooth scroll mejorado
  smoothScrollTo(target, duration = 800) {
    const targetPosition = target.offsetTop - this.getNavbarHeight() - 20;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  },

  // Función de easing
  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
};

/**
 * Inicialización global
 */
let navigation = null;
let scrollAnimations = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('NexoDigital: Inicializando aplicación...');
  
  try {
    // Inicializar navegación
    navigation = new Navigation();
    
    // Inicializar animaciones de scroll (opcional)
    if (!deviceCapabilities.isMobile()) {
      scrollAnimations = new ScrollAnimations();
    }
    
    console.log('NexoDigital: Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error('NexoDigital: Error durante la inicialización:', error);
  }
});

// Cleanup en caso de navegación SPA
window.addEventListener('beforeunload', () => {
  if (scrollAnimations) {
    scrollAnimations.destroy();
  }
});

// Exponer utilidades globalmente (opcional)
window.NexoDigital = {
  navigation,
  utils: Utils,
  config: CONFIG,
  deviceCapabilities
};