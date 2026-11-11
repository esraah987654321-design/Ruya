/**
 * Ruya Agency - Main Application Script
 * Handles interactivity, navigation, AJAX form handling, counters, and UI animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 0. Bilingual Language Switcher (Arabic / English)
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    let currentLang = urlLang || localStorage.getItem('ruya_lang') || 'ar';

    function setLanguage(lang) {
        if (typeof translations === 'undefined' || !translations[lang]) return;
        currentLang = lang;
        localStorage.setItem('ruya_lang', lang);

        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar' ? 'rtl' : 'ltr');

        // Update all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Update all placeholder elements
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                el.setAttribute('placeholder', translations[lang][key]);
            }
        });

        // Update toggle buttons text
        document.querySelectorAll('.lang-switch-btn .lang-text').forEach(el => {
            el.innerText = (lang === 'ar' ? 'English' : 'العربية');
        });

        // Update page title
        if (lang === 'en') {
            document.title = 'Ruya | Digital Marketing & Business Growth Agency';
        } else {
            document.title = 'رؤية | Ruya - شركة التسويق الرقمي ونمو الأعمال';
        }
    }

    // Initialize saved language
    setLanguage(currentLang);

    // Language toggle click handlers
    document.querySelectorAll('.lang-switch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetLang = (currentLang === 'ar' ? 'en' : 'ar');
            setLanguage(targetLang);
        });
    });

    // 1. Navigation Sticky & Active State
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlighting
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Menu Toggle & Overlay
    const mobileClose = document.getElementById('mobile-close');
    const mobileOverlay = document.getElementById('mobile-overlay');

    function closeMobileDrawer() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('open');
        if (mobileToggle) mobileToggle.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    function openMobileDrawer() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('open');
        if (mobileToggle) mobileToggle.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) {
                closeMobileDrawer();
            } else {
                openMobileDrawer();
            }
        });

        if (mobileClose) {
            mobileClose.addEventListener('click', closeMobileDrawer);
        }

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', closeMobileDrawer);
        }

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileDrawer);
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMobileDrawer();
            }
        });
    }

    // 2. Animated Numbers / Stats Counter
    const counters = document.querySelectorAll('.counter-number');
    let animated = false;

    function runCounters() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000;
            const step = target / (duration / 16);
            let currentVal = 0;

            const updateNumber = () => {
                currentVal += step;
                if (currentVal < target) {
                    counter.innerText = Math.floor(currentVal);
                    requestAnimationFrame(updateNumber);
                } else {
                    counter.innerText = target;
                }
            };
            updateNumber();
        });
    }

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    runCounters();
                    animated = true;
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    // 3. Portfolio Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 4. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            // Close other items
            faqItems.forEach(i => i.classList.remove('active'));

            if (!isOpen) {
                item.classList.add('active');
            }
        });
    });

    // 5. Connect Forms to ruya76199@gmail.com using FormSubmit AJAX
    const forms = document.querySelectorAll('form[data-ajax-form]');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    function showToast(message, isSuccess = true) {
        if (!toast) return;
        toastMessage.innerText = message;
        toast.className = `toast ${isSuccess ? 'success' : 'error'} show`;
        setTimeout(() => {
            toast.className = 'toast';
        }, 5000);
    }

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

            const formData = new FormData(form);

            // Add metadata fields for email clarity
            formData.append('_subject', 'طلب استشارة جديد من موقع Ruya Marketing!');
            formData.append('_template', 'table');
            formData.append('_captcha', 'false');

            try {
                const response = await fetch('https://formsubmit.co/ajax/ruya76199@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                if (response.ok) {
                    showToast('تم استلام طلبك بنجاح! سيتواصل معك فريق رؤية خلال أقل من ساعتين.', true);
                    form.reset();
                } else {
                    throw new Error('Network error');
                }
            } catch (err) {
                // Fallback option: allow user to send via WhatsApp directly
                showToast('تم حفظ رسالتك! يمكنك أيضاً تأكيد التواصل فوراً عبر واتساب.', true);
                
                // Form values for quick WhatsApp backup
                const name = form.querySelector('[name="name"]')?.value || 'عميل محتمل';
                const phone = form.querySelector('[name="phone"]')?.value || '';
                const service = form.querySelector('[name="service"]')?.value || 'استشارة تسويقية';
                const msg = form.querySelector('[name="message"]')?.value || '';

                const waText = encodeURIComponent(
                    `مرحباً شركة رؤية للتسويق، أنا ${name} (${phone})\nأرغب في الاستفسار عن: ${service}\nالتفاصيل: ${msg}`
                );
                
                // Optional prompt to open WhatsApp directly
                setTimeout(() => {
                    const openWA = confirm('هل تود أيضاً فتح محادثة مباشرة عبر واتساب مع فريق الدعم الآن؟');
                    if (openWA) {
                        window.open(`https://wa.me/201558054551?text=${waText}`, '_blank');
                    }
                }, 800);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    });

    // 6. Interactive 3D Card Hover Effect
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });

    // 7. Scroll to Top Button
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 8. WhatsApp floating widget quick toggle
    const waPopupBtn = document.getElementById('wa-popup-toggle');
    const waPopupBox = document.getElementById('wa-popup-box');
    const waPopupClose = document.getElementById('wa-popup-close');

    if (waPopupBtn && waPopupBox) {
        waPopupBtn.addEventListener('click', () => {
            waPopupBox.classList.toggle('active');
        });

        if (waPopupClose) {
            waPopupClose.addEventListener('click', () => {
                waPopupBox.classList.remove('active');
            });
        }
    }
});

