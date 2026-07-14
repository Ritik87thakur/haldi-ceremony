/* script.js */
const Album = {
    // Application State
    state: {
        imagesCount: 103,
        brideImagesCount: 33,
        currentImageIndex: 1,

        // Lightbox interactive state
        zoomLevel: 1,
        maxZoom: 5,
        minZoom: 1,
        translateX: 0,
        translateY: 0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,

        // Touch states for mobile gestures
        touchStartX: 0,
        touchStartY: 0,
        touchEndX: 0,
        touchEndY: 0,
        pinchStartDist: 0,
        isPinching: false,

        // Dynamic backgrounds state
        canvasCtx: null,
        canvasElement: null,
        canvasWidth: 0,
        canvasHeight: 0,
        particles: [],
        maxParticles: 45,

        // Auto-slideshow
        heroTimer: null,
        currentHeroIndex: 1
    },

    // Cache elements once at initiation
    cache() {
        this.dom = {
            bgMusic: document.getElementById('bg-music'),
            welcomeScreen: document.getElementById('welcome-screen'),
            mainAlbum: document.getElementById('main-album'),
            btnOpenAlbum: document.getElementById('btn-open-album'),
            heartCollage: document.getElementById('heart-collage'),
            heroSlideshow: document.getElementById('hero-slideshow'),
            showcaseCarousel: document.getElementById('showcase-carousel'),
            showcasePrev: document.getElementById('showcase-prev'),
            showcaseNext: document.getElementById('showcase-next'),
            galleryGrid: document.getElementById('gallery-grid'),
            lightbox: document.getElementById('lightbox'),
            lightboxImg: document.getElementById('lightbox-img'),
            lightboxClose: document.getElementById('lightbox-close'),
            lightboxPrev: document.getElementById('lightbox-prev'),
            lightboxNext: document.getElementById('lightbox-next'),
            lightboxZoom: document.getElementById('lightbox-zoom-container'),
            imageCounter: document.getElementById('image-counter'),
            ambientCanvas: document.getElementById('ambient-canvas'),

            videoPopup: document.getElementById('video-popup'),
            popupVideo: document.getElementById('popup-video'),
            videoClose: document.getElementById('video-close'),
        };
    },

    // Initialize module
    init() {
        this.cache();
        this.startMusic();
        this.initAmbientEngine();
        this.buildHeartCollage();
        setTimeout(() => {

            this.buildHeartCollage();

        }, 300);
        this.buildHeroSlideshow();
        this.startHeaderBanner();
        this.buildShowcaseCarousel();
        this.renderGallery();
        this.initVideoGallery();
        this.bindEvents();
    },

    // Premium interactive elements & layout bindings
    bindEvents() {
        // Music & Open Screen Sequence
        this.dom.btnOpenAlbum.addEventListener('click', () => this.openAlbum());

        // Lightbox global actions
        this.dom.lightboxClose.addEventListener('click', () => this.closeViewer());
        this.dom.lightboxPrev.addEventListener('click', () => this.previous());
        this.dom.lightboxNext.addEventListener('click', () => this.next());

        // Dismiss viewer on structural outer click
        this.dom.lightbox.addEventListener("click", (e) => {

            // Image पर Click होगा तो Close नहीं होगा

            if (

                e.target.closest("#lightbox-zoom-container") ||

                e.target === this.dom.lightboxPrev ||

                e.target === this.dom.lightboxNext ||

                e.target === this.dom.lightboxClose

            ) {
                return;
            }

            this.closeViewer();

        });

        // Key bindings
        document.addEventListener('keydown', (e) => {
            if (this.dom.lightbox.getAttribute('aria-hidden') === 'false') {
                if (e.key === 'Escape') this.closeViewer();
                if (e.key === 'ArrowRight') this.next();
                if (e.key === 'ArrowLeft') this.previous();
            }
        });

        // Horizontal Showcase Carousel Controls
        this.dom.showcasePrev.addEventListener('click', () => {
            this.dom.showcaseCarousel.scrollBy({ left: -300, behavior: 'smooth' });
        });
        this.dom.showcaseNext.addEventListener('click', () => {
            this.dom.showcaseCarousel.scrollBy({ left: 300, behavior: 'smooth' });
        });

        // Setup mouse zoom & drag inside light stage
        this.setupLightboxInteraction();
        document.addEventListener("visibilitychange", () => {

            if (!this.dom.bgMusic) return;

            if (document.hidden) {

                this.dom.bgMusic.pause();

            } else {

                this.dom.bgMusic.play().catch(() => { });

            }

        });
        // Rebuild heart collage after screen size changes
        const rebuildHeart = () => {

            if (!this.dom.heartCollage) return;

            this.buildHeartCollage();

        };

        window.addEventListener("resize", rebuildHeart);

        window.addEventListener("orientationchange", rebuildHeart);
    },

    // Music System
    startMusic() {

        if (!this.dom.bgMusic) return;

        this.dom.bgMusic.volume = 0.6;

        const playMusic = () => {

            this.dom.bgMusic.play().catch(() => { });

            document.removeEventListener("click", playMusic);

            document.removeEventListener("touchstart", playMusic);

        };

        document.addEventListener("click", playMusic, { once: true });

        document.addEventListener("touchstart", playMusic, { once: true });

    },

    // Transition from Invitation Wall into Complete Digital Album
    openAlbum() {
        if (this.dom.bgMusic) {

            this.dom.bgMusic.play().catch(() => { });

        }
        // Seamless Fade Out / Fade In transitions
        this.dom.welcomeScreen.classList.add('fade-out');
        this.dom.mainAlbum.classList.remove('hidden');

        setTimeout(() => {
            this.dom.welcomeScreen.classList.add('hidden');
            this.dom.mainAlbum.classList.add('visible');
            // Trigger layout recalculation for masonry performance
            window.dispatchEvent(new Event('resize'));
            this.buildHeartCollage();
        }, 1200);

        // Terminate hero loop once inside the general system
        if (this.state.heroTimer) {
            clearInterval(this.state.heroTimer);
        }
    },
    buildHeartCollage() {

        this.dom.heartCollage.innerHTML = "";

        const coords = [
            [-260, -120], [-215, -150], [-165, -165], [-110, -170], [-55, -155],
            [-15, -120], [15, -120],
            [55, -155], [110, -170], [165, -165], [215, -150], [260, -120],
            [-285, -70], [285, -70],
            [-285, -10], [285, -10],
            [-275, 55], [275, 55],
            [-245, 120], [245, 120],
            [-195, 180], [195, 180],
            [-145, 235], [145, 235],
            [-95, 285], [95, 285],
            [-45, 335], [45, 335],
            [0, 395],
            [-15, -55], [15, -55]
        ];

        const isMobile = window.innerWidth <= 480;

        const scale = isMobile ? 0.45 : 0.9;

        coords.forEach((point, index) => {

            const img = document.createElement("img");

            img.src = `1 (${index + 1}).png`;

            img.className = "heart-img";

            img.style.left = "50%";
            img.style.top = "50%";

            img.style.transform =
                `translate(calc(-50% + ${point[0] * scale}px),
                   calc(-50% + ${point[1] * scale}px))`;

            img.onclick = () => this.openViewer(index + 1);

            this.dom.heartCollage.appendChild(img);

        });

    },

    // Infinite transitions for Hero Arch (Invitation Frame)
    buildHeroSlideshow() {
        this.dom.heroSlideshow.innerHTML = "";
        for (let i = 1; i <= this.state.brideImagesCount; i++) {
            const img = document.createElement('img');
            img.src = `1 (${i}).png`;
            img.alt = 'Wedding Portrait Hero';
            img.className = 'hero-slide';
            if (i === 1) img.classList.add('active');
            this.dom.heroSlideshow.appendChild(img);
        }

        // Auto rotational loop execution (Every 3.5s)
        this.state.heroTimer = setInterval(() => {
            const slides = this.dom.heroSlideshow.querySelectorAll('.hero-slide');
            slides[this.state.currentHeroIndex - 1].classList.remove('active');

            this.state.currentHeroIndex = (this.state.currentHeroIndex % this.state.brideImagesCount) + 1;

            slides[this.state.currentHeroIndex - 1].classList.add('active');
        }, 3500);
    },

    // Horizontal showcase generator
    buildShowcaseCarousel() {
        for (let i = 1; i <= this.state.brideImagesCount; i++) {
            const card = document.createElement('div');
            card.className = 'carousel-card';

            const img = document.createElement('img');
            img.src = `1 (${i}).png`;
            img.alt = `Bride Portrait ${i}`;
            img.loading = 'lazy';

            const overlay = document.createElement('div');
            overlay.className = 'carousel-card-overlay';

            const title = document.createElement('h4');
            title.className = 'carousel-card-title';
            title.textContent = `Bride Portrait #${i}`;

            overlay.appendChild(title);
            card.appendChild(img);
            card.appendChild(overlay);

            card.addEventListener('click', () => this.openViewer(i));
            this.dom.showcaseCarousel.appendChild(card);
        }
    },

    // Complete Luxury Gallery Grid Builder (Images 1-103)
    renderGallery() {
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= this.state.imagesCount; i++) {
            const isBride = i <= this.state.brideImagesCount;

            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.dataset.src = `1 (${i}).png`;
            img.alt = `Haldi Ceremony Ceremony Image ${i}`;
            img.loading = 'lazy';

            // Progressive image resolution render logic
            img.onload = () => {
                item.classList.add('loaded');
            };

            const info = document.createElement('div');
            info.className = 'gallery-info';

            const title = document.createElement('h4');
            title.className = 'gallery-info-title';
            title.textContent = `Moment ${i}`;

            const tag = document.createElement('span');
            tag.className = 'gallery-info-tag';
            tag.textContent = isBride ? 'The Divine Bride' : 'Haldi Celebration';

            info.appendChild(title);
            info.appendChild(tag);
            item.appendChild(img);
            item.appendChild(info);

            // Bind click to open directly in the unified luxury lightbox
            item.addEventListener('click', () => this.openViewer(i));

            fragment.appendChild(item);
        }

        this.dom.galleryGrid.appendChild(fragment);
        this.initLazyLoading();
    },

    // Setup progressive high performance viewport loader
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target.querySelector('img');
                        if (img && img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px 400px 0px' });

            const items = this.dom.galleryGrid.querySelectorAll('.gallery-item');
            items.forEach(item => observer.observe(item));
        } else {
            // Fallback for older browsers
            const items = this.dom.galleryGrid.querySelectorAll('.gallery-item img');
            items.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    },

    // OPENS HIGH RESOLUTION LIGHTBOX
    openViewer(index) {
        this.state.currentImageIndex = index;
        this.dom.lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Lock main scroll

        this.resetZoom();
        this.loadImageInViewer(index);
        this.preloadNeighboringImages(index);
    },

    // Core image injection
    loadImageInViewer(index) {

        const imagePath = `1 (${index}).png`;

        this.dom.lightboxImg.style.opacity = "0";
        this.dom.lightboxImg.style.transform = "scale(.96) rotateY(12deg)";

        setTimeout(() => {

            this.dom.lightboxImg.src = imagePath;

            this.dom.imageCounter.textContent =
                `${String(index).padStart(2, "0")} / ${String(this.state.imagesCount).padStart(2, "0")}`;

            this.dom.lightboxImg.style.opacity = "1";
            this.dom.lightboxImg.style.transform = "scale(1) rotateY(0deg)";

        }, 170);

    },

    closeViewer() {
        this.dom.lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Release scroll lock
        this.resetZoom();
    },

    // Navigational Controls
    next() {

        this.state.flipDirection = "flip-next";

        const flip = document.getElementById("lightbox-flip");

        flip.classList.remove("flip-next", "flip-prev");

        void flip.offsetWidth;

        flip.classList.add("flip-next");
        flip.classList.remove("flip-next", "flip-prev");

        void flip.offsetWidth;

        flip.classList.add("flip-next");

        flip.addEventListener("animationend", function () {
            flip.classList.remove("flip-next");
        }, { once: true });

        setTimeout(() => {

            this.state.currentImageIndex =
                (this.state.currentImageIndex % this.state.imagesCount) + 1;

            this.resetZoom();

            this.loadImageInViewer(this.state.currentImageIndex);

            this.preloadNeighboringImages(this.state.currentImageIndex);

        }, 250);

    },

    previous() {

        this.state.flipDirection = "flip-prev";

        const flip = document.getElementById("lightbox-flip");

        flip.classList.remove("flip-next", "flip-prev");

        void flip.offsetWidth;

        flip.classList.add("flip-prev");
        flip.addEventListener("animationend", function () {
            flip.classList.remove("flip-prev");
        }, { once: true });

        setTimeout(() => {

            this.state.currentImageIndex--;

            if (this.state.currentImageIndex < 1) {

                this.state.currentImageIndex = this.state.imagesCount;

            }

            this.resetZoom();

            this.loadImageInViewer(this.state.currentImageIndex);

            this.preloadNeighboringImages(this.state.currentImageIndex);

        }, 250);

    },

    // Ultra Performance Cache Preloading (Saves 2 adjacent images on UI runtime)
    preloadNeighboringImages(currentIndex) {
        const nextIndex = (currentIndex % this.state.imagesCount) + 1;
        const prevIndex = currentIndex - 1 < 1 ? this.state.imagesCount : currentIndex - 1;

        const preloaderNext = new Image();
        preloaderNext.src = `1 (${nextIndex}).png`;

        const preloaderPrev = new Image();
        preloaderPrev.src = `1 (${prevIndex}).png`;
    },

    // RESET ZOOM STATES
    resetZoom() {
        this.state.zoomLevel = 1;
        this.state.translateX = 0;
        this.state.translateY = 0;
        this.applyZoomTransforms();
    },

    // Applies matrix transforms to the image container
    applyZoomTransforms() {
        this.dom.lightboxZoom.style.transform = `translate3d(${this.state.translateX}px, ${this.state.translateY}px, 0) scale(${this.state.zoomLevel})`;
    },

    // HIGH END INTERACTION FRAMEWORK
    // Mouse wheel Zoom, Double-click zoom, Pinch zoom, Touch swipe, Drag operations
    setupLightboxInteraction() {
        const self = this;
        const zoomContainer = this.dom.lightboxZoom;
        const stage = document.getElementById('lightbox-stage');

        // MOUSE WHEEL ZOOM
        stage.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const delta = -e.deltaY;
            const targetZoom = self.state.zoomLevel + (delta > 0 ? zoomSpeed : -zoomSpeed);

            self.zoom(targetZoom, e.clientX, e.clientY);
        }, { passive: false });

        // DOUBLE CLICK ZOOM
        stage.addEventListener('dblclick', (e) => {
            if (self.state.zoomLevel > 1) {
                self.resetZoom();
            } else {
                self.zoom(2.5, e.clientX, e.clientY);
            }
        });

        // DRAG AND SWIPE SYSTEM (Unified pointer event pipeline)
        stage.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (!self.state.isDragging) return;
            dragMove(e.clientX, e.clientY);
        });

        window.addEventListener('mouseup', () => {
            endDrag();
        });

        // TOUCH GESTURE PIPELINE (Mobile/Tablets support)
        stage.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // Drag / Swipe start
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
                self.state.touchStartX = e.touches[0].clientX;
                self.state.touchStartY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                // Pinch start
                self.state.isPinching = true;
                self.state.pinchStartDist = getPinchDistance(e);
            }
        }, { passive: true });

        stage.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && !self.state.isPinching) {
                // Perform dynamic viewport panning/dragging
                dragMove(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2 && self.state.isPinching) {
                // Execute Real-Time Multi-Touch Pinch Zooming
                e.preventDefault();
                const dist = getPinchDistance(e);
                const zoomFactor = dist / self.state.pinchStartDist;
                const targetZoom = self.state.zoomLevel * zoomFactor;

                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                self.zoom(targetZoom, midX, midY);
                self.state.pinchStartDist = dist; // update baseline
            }
        }, { passive: false });

        stage.addEventListener('touchend', (e) => {
            if (self.state.isPinching) {
                self.state.isPinching = false;
            } else {
                // Execute Swipe Gestures on release if normal aspect ratio (no zoom)
                if (self.state.zoomLevel === 1) {
                    const endX = e.changedTouches[0].clientX;
                    const endY = e.changedTouches[0].clientY;
                    self.swipe(self.state.touchStartX, self.state.touchStartY, endX, endY);
                }
                endDrag();
            }
        }, { passive: true });

        // Inner Helpers for mathematical transformations
        function startDrag(clientX, clientY) {
            self.state.isDragging = true;
            self.state.dragStartX = clientX - self.state.translateX;
            self.state.dragStartY = clientY - self.state.translateY;
        }

        function dragMove(clientX, clientY) {
            if (!self.state.isDragging) return;

            // Only perform translation (panning) if zoomed in
            if (self.state.zoomLevel > 1) {
                self.state.translateX = clientX - self.state.dragStartX;
                self.state.translateY = clientY - self.state.dragStartY;
                self.applyZoomTransforms();
            }
        }

        function endDrag() {
            self.state.isDragging = false;
        }

        function getPinchDistance(e) {
            return Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    },

    // Zoom Execution Engine
    zoom(level, clientX, clientY) {
        const oldZoom = this.state.zoomLevel;
        this.state.zoomLevel = Math.max(this.state.minZoom, Math.min(this.state.maxZoom, level));

        if (this.state.zoomLevel > 1) {
            const zoomCenterElement = this.dom.lightboxZoom.getBoundingClientRect();
            const clickX = clientX - zoomCenterElement.left;
            const clickY = clientY - zoomCenterElement.top;

            // Re-calculate translations coordinates inside matrix relative to magnification levels
            this.state.translateX -= (clickX / oldZoom) * (this.state.zoomLevel - oldZoom);
            this.state.translateY -= (clickY / oldZoom) * (this.state.zoomLevel - oldZoom);
        } else {
            this.state.translateX = 0;
            this.state.translateY = 0;
        }

        this.applyZoomTransforms();
    },

    // Mobile Swipe Handler
    swipe(startX, startY, endX, endY) {
        const threshold = 60; // minimum touch delta
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > threshold) {
                this.previous(); // Swipe right
            } else if (deltaX < -threshold) {
                this.next(); // Swipe left
            }
        }
    },

    // AMBIENT ENGINE: Floating Marigold Petals & Shimmering Sparkles (Canvas Powered)
    initAmbientEngine() {
        this.state.canvasElement = this.dom.ambientCanvas;
        this.state.canvasCtx = this.state.canvasElement.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Spawn dynamic instances
        for (let i = 0; i < this.state.maxParticles; i++) {
            this.state.particles.push(this.createParticle(true));
        }

        // Run high performance animation loop
        const self = this;
        function animate() {
            self.renderAmbientFrame();
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    },

    resizeCanvas() {
        this.state.canvasWidth = window.innerWidth;
        this.state.canvasHeight = window.innerHeight;
        this.state.canvasElement.width = this.state.canvasWidth;
        this.state.canvasElement.height = this.state.canvasHeight;
    },

    createParticle(isInitial = false) {
        const isMarigold = Math.random() > 0.4; // 60% Marigold Petals, 40% Sparkles

        return {
            isMarigold,
            x: Math.random() * this.state.canvasWidth,
            y: isInitial ? Math.random() * this.state.canvasHeight : -20,
            size: isMarigold ? (Math.random() * 10 + 6) : (Math.random() * 4 + 1.5),
            speedX: isMarigold ? (Math.random() * 1.5 - 0.7) : (Math.random() * 0.4 - 0.2),
            speedY: isMarigold ? (Math.random() * 1.8 + 0.8) : (Math.random() * 0.8 + 0.4),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() * 0.02 - 0.01) * Math.PI,
            opacity: Math.random() * 0.6 + 0.4,
            pulseSpeed: Math.random() * 0.03 + 0.01,
            pulseDir: 1
        };
    },
    startHeaderBanner() {

        const track = document.querySelector(".header-track");

        if (!track) return;

        let start = 0;

        const loadImages = () => {

            track.style.opacity = "0";

            setTimeout(() => {

                track.innerHTML = "";
                const photos = [

                    1, 2, 3, 4,
                    5, 6, 7, 8,
                    9, 10, 11, 12,
                    13, 14, 15, 16,
                    17, 18, 19, 20,
                    21, 22, 24, 25,
                    26, 27, 28, 29,
                    30, 31, 32, 33

                ];

                for (let i = 0; i < 4; i++) {

                    const index = (start + i) % photos.length;

                    const img = document.createElement("img");

                    img.src = `1 (${photos[index]}).png`;

                    img.alt = "";

                    track.appendChild(img);

                }

                track.style.opacity = "1";

                start += 4;

                if (start >= photos.length) {

                    start = 0;

                }
            }, 600);

        };

        loadImages();

        setInterval(loadImages, 5000);

    },

    renderAmbientFrame() {
        const ctx = this.state.canvasCtx;
        ctx.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

        for (let i = 0; i < this.state.particles.length; i++) {
            let p = this.state.particles[i];

            p.x += p.speedX;
            p.y += p.speedY;

            if (p.isMarigold) {
                p.rotation += p.rotationSpeed;

                // Draw Marigold Flower Petals
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.globalAlpha = p.opacity;

                // Gradient for rich natural marigold orange-yellow color range
                let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
                grad.addColorStop(0, '#FFC000'); // Vibrant Yellow
                grad.addColorStop(1, '#E15A03'); // Rich Marigold Orange

                ctx.fillStyle = grad;
                ctx.beginPath();
                // Draw luxury teardrop petal geometry
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-p.size / 2, -p.size / 2, 0, -p.size);
                ctx.quadraticCurveTo(p.size / 2, -p.size / 2, 0, 0);
                ctx.fill();
                ctx.restore();
            } else {
                // Pulsing sparkle logic
                p.opacity += p.pulseSpeed * p.pulseDir;
                if (p.opacity > 0.95 || p.opacity < 0.2) p.pulseDir *= -1;

                // Draw Glowing Sparkles
                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`; // Golden Sparkle
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#D4AF37';
                ctx.fill();
                ctx.restore();
            }

            // Recycler boundaries
            if (p.y > this.state.canvasHeight + 20 || p.x < -20 || p.x > this.state.canvasWidth + 20) {
                this.state.particles[i] = this.createParticle(false);
            }
        }
    },
    initVideoGallery() {

        const videos = document.querySelectorAll(".video-item");

        videos.forEach(item => {

            item.addEventListener("click", () => {

                const videoSrc = item.dataset.video;

                this.dom.popupVideo.pause();
                this.dom.popupVideo.currentTime = 0;

                this.dom.popupVideo.src = videoSrc;
                this.dom.popupVideo.load();

                this.dom.videoPopup.classList.add("active");

                if (this.dom.bgMusic) {
                    this.dom.bgMusic.pause();
                }

                // this.dom.popupVideo.play().catch(() => {});

            });

        });

        this.dom.videoClose.addEventListener("click", () => {

            this.dom.popupVideo.pause();

            this.dom.popupVideo.currentTime = 0;

            this.dom.videoPopup.classList.remove("active");

            if (this.dom.bgMusic) {
                this.dom.bgMusic.play().catch(() => { });
            }

        });

    },
};

document.addEventListener('DOMContentLoaded', () => {
    Album.init();
});
