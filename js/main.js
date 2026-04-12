// ============================================
// BEST TOP LOCK LOCKSMITH NYC - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    // ---------- Header Scroll Effect ----------
    const header = document.getElementById('header');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ---------- Mobile Menu ----------
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        nav.classList.toggle('open');
        document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when clicking a nav link
    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            nav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Mobile dropdown toggle
    document.querySelectorAll('.has-dropdown > .nav-link').forEach(function (link) {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                this.parentElement.classList.toggle('open');
            }
        });
    });

    // ---------- Active Nav on Scroll ----------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function () {
        var current = '';
        sections.forEach(function (section) {
            var sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ---------- Reviews Slider ----------
    var reviewsTrack = document.getElementById('reviewsTrack');
    var prevBtn = document.getElementById('prevReview');
    var nextBtn = document.getElementById('nextReview');
    var dotsContainer = document.getElementById('reviewsDots');
    var reviewCards = document.querySelectorAll('.review-card');

    if (reviewsTrack && reviewCards.length > 0) {
        var currentSlide = 0;
        var slidesPerView = getSlidesPerView();
        var totalDots = Math.ceil(reviewCards.length / slidesPerView);

        function getSlidesPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function createDots() {
            dotsContainer.innerHTML = '';
            totalDots = Math.ceil(reviewCards.length / slidesPerView);
            for (var i = 0; i < totalDots; i++) {
                var dot = document.createElement('span');
                dot.className = 'dot' + (i === currentSlide ? ' active' : '');
                dot.setAttribute('data-index', i);
                dot.addEventListener('click', function () {
                    currentSlide = parseInt(this.getAttribute('data-index'));
                    updateSlider();
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateSlider() {
            var cardWidth = reviewCards[0].offsetWidth + 24; // gap
            var offset = currentSlide * cardWidth * slidesPerView;
            var maxOffset = reviewsTrack.scrollWidth - reviewsTrack.parentElement.offsetWidth;
            if (offset > maxOffset) offset = maxOffset;
            reviewsTrack.style.transform = 'translateX(-' + offset + 'px)';

            document.querySelectorAll('.reviews-dots .dot').forEach(function (dot, index) {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        prevBtn.addEventListener('click', function () {
            currentSlide = Math.max(0, currentSlide - 1);
            updateSlider();
        });

        nextBtn.addEventListener('click', function () {
            currentSlide = Math.min(totalDots - 1, currentSlide + 1);
            updateSlider();
        });

        createDots();

        // Auto-slide every 5 seconds
        setInterval(function () {
            currentSlide = (currentSlide + 1) % totalDots;
            updateSlider();
        }, 5000);

        window.addEventListener('resize', function () {
            slidesPerView = getSlidesPerView();
            createDots();
            updateSlider();
        });
    }

    // ---------- FAQ Accordion ----------
    document.querySelectorAll('.faq-question').forEach(function (question) {
        question.addEventListener('click', function () {
            var item = this.parentElement;
            var answer = item.querySelector('.faq-answer');
            var isActive = item.classList.contains('active');

            // Close all other items
            document.querySelectorAll('.faq-item').forEach(function (otherItem) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // ---------- Scroll Animations ----------
    var animateElements = document.querySelectorAll(
        '.service-card, .area-card, .step, .pricing-card, .blog-card, .why-feature, .faq-item'
    );

    animateElements.forEach(function (el) {
        el.classList.add('animate-on-scroll');
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(function (el) {
        observer.observe(el);
    });

    // ---------- Contact Form ----------
    var contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var formData = new FormData(contactForm);
            var data = {};
            formData.forEach(function (value, key) {
                data[key] = value;
            });

            // Show success message
            var submitBtn = contactForm.querySelector('button[type="submit"]');
            var originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            submitBtn.style.background = '#2d6a4f';
            submitBtn.style.borderColor = '#2d6a4f';
            submitBtn.disabled = true;

            setTimeout(function () {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.style.borderColor = '';
                submitBtn.disabled = false;
                contactForm.reset();
            }, 3000);
        });
    }

    // ---------- Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });

                // Close mobile menu if open
                hamburger.classList.remove('active');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    // ---------- Phone number tracking (GA4 event) ----------
    document.querySelectorAll('a[href^="tel:"]').forEach(function (phoneLink) {
        phoneLink.addEventListener('click', function () {
            if (typeof gtag === 'function') {
                gtag('event', 'phone_call', {
                    event_category: 'contact',
                    event_label: this.getAttribute('href'),
                    value: 1
                });
            }
        });
    });

});
