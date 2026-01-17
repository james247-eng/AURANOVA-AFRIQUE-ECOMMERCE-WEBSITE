/* ==========================================
   AURANOVA-AFRIQUE - HERO SLIDESHOW
   ========================================== */

class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.hero-indicators .indicator');
        this.prevBtn = document.getElementById('heroPrev');
        this.nextBtn = document.getElementById('heroNext');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.autoPlayDelay = 6000; // 6 seconds per slide
        
        this.init();
    }
    
    init() {
        if (this.slides.length === 0) return;
        
        // Set up event listeners
        this.prevBtn?.addEventListener('click', () => this.previousSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        
        // Indicator click events
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Touch/Swipe support
        this.initTouchEvents();
        
        // Start autoplay
        this.startAutoPlay();
        
        // Pause on hover
        const hero = document.getElementById('hero');
        if (hero) {
            hero.addEventListener('mouseenter', () => this.stopAutoPlay());
            hero.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }
    
    goToSlide(index) {
        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');
        this.indicators[this.currentSlide]?.classList.remove('active');
        
        // Update current slide
        this.currentSlide = index;
        
        // Add active class to new slide
        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide]?.classList.add('active');
        
        // Reset autoplay timer
        this.resetAutoPlay();
    }
    
    nextSlide() {
        let next = this.currentSlide + 1;
        if (next >= this.slides.length) {
            next = 0;
        }
        this.goToSlide(next);
    }
    
    previousSlide() {
        let prev = this.currentSlide - 1;
        if (prev < 0) {
            prev = this.slides.length - 1;
        }
        this.goToSlide(prev);
    }
    
    startAutoPlay() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }
    
    stopAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
    
    initTouchEvents() {
        const hero = document.getElementById('hero');
        if (!hero) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        hero.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        hero.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, false);
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.previousSlide();
            }
        }
    }
}

// Initialize hero slider when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const heroSlider = new HeroSlider();
});