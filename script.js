document.addEventListener('DOMContentLoaded', () => {
    // --- Localization Start ---
    const supportedLangs = ['en', 'fr', 'de', 'it', 'es', 'pt', 'ru', 'zh-CN', 'ar']; // Add language codes here
    const defaultLang = 'en';
    let currentLang = defaultLang;
    let translations = {};
    // Get the language dropdown element
    const langSelect = document.getElementById('lang-select');

    // Function to fetch translation file
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) {
                console.error(`Could not load translations for ${lang}: ${response.statusText}`);
                return null; // Or load default language as fallback
            }
            translations = await response.json();
            console.log(`Translations loaded for ${lang}:`, translations);
            return translations;
        } catch (error) {
            console.error(`Error fetching translations for ${lang}:`, error);
            return null;
        }
    }

    // Function to apply translations to the DOM
    function applyTranslations() {
        // Update elements with data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
        // Update elements with data-translate-placeholder
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = currentLang;
        // Update dropdown value
        if (langSelect) {
            langSelect.value = currentLang;
        }

        // --- Additions for dynamic content ---
        // Re-apply dynamic form text based on current type
        const currentFormType = signupForm ? signupForm.dataset.currentType : 'patient';
        updateSignupFormText(currentFormType);
        // Update any other dynamically added elements here if needed
        // --- End Additions ---

        console.log("Translations applied for", currentLang);
    }

    // Function to get a specific translation string
    function getTranslation(key) {
        return translations[key] || key; // Return key itself as fallback
    }

    // Function to change language
    async function setLanguage(lang) {
        if (lang === currentLang && Object.keys(translations).length > 0) return; // No change needed
        const loaded = await loadTranslations(lang);
        if (loaded) {
            currentLang = lang;
            
            // --- RTL Handling --- 
            if (currentLang === 'ar') { // Add other RTL languages here if needed (e.g., 'he' for Hebrew)
                document.documentElement.dir = 'rtl';
            } else {
                document.documentElement.dir = 'ltr';
            }
            // --- End RTL Handling ---
            
            applyTranslations(); // Apply translations *after* setting direction
            // Optional: Save language preference
            localStorage.setItem('preferredLang', lang);
        } else {
            console.warn(`Failed to load ${lang}, falling back or staying on ${currentLang}`);
            // Optional: try loading default language if specified lang failed
            if (currentLang !== defaultLang) {
                await setLanguage(defaultLang);
            }
        }
    }

    // Initialize localization on page load
    async function initLocalization() {
        // Attempt to get browser language or stored preference
        const storedLang = localStorage.getItem('preferredLang');
        const browserLang = navigator.language.split('-')[0]; // Get base language (e.g., 'en' from 'en-US')

        let initialLang = defaultLang;
        if (storedLang && supportedLangs.includes(storedLang)) {
            initialLang = storedLang;
            console.log("Using stored language:", initialLang);
        } else if (browserLang && supportedLangs.includes(browserLang)) {
            initialLang = browserLang;
            console.log("Using browser language:", initialLang);
        } else {
            console.log("Using default language:", initialLang);
        }
        
        // Make sure the dropdown options are populated before setting language
        // (Assuming HTML is static for now)
        
        await setLanguage(initialLang);
    }

    // Add event listener to the language dropdown
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            // Save preference when user explicitly changes it
            localStorage.setItem('preferredLang', e.target.value);
            setLanguage(e.target.value);
        });
    }

    // Initialize
    // initLocalization(); // Moved initialization further down
    // --- Localization End ---

    // Form elements
    const signupForm = document.getElementById('signup-form');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const patientFields = document.querySelectorAll('.patient-field');
    const clinicFields = document.querySelectorAll('.clinic-field');
    // Make sure these are defined if they exist
    const signupTitleElement = document.querySelector('#signup-title'); 
    const signupSubtitleElement = signupForm ? signupForm.querySelector('.form-subtitle') : null;
    const signupButtonElement = signupForm ? signupForm.querySelector('.signup-form .btn') : null;
    const successMessageElement = signupForm ? signupForm.querySelector('.success-message') : null;

    let lastScrollTop = 0;
    let ticking = false;

    // --- Function to Update Signup Form Dynamic Text (Called by Toggle and applyTranslations) ---
    function updateSignupFormText(formType) {
        if (!signupTitleElement || !signupSubtitleElement || !signupButtonElement) return;
        
        if (formType === 'patient') {
            signupTitleElement.textContent = getTranslation('signup_title_patient');
            signupSubtitleElement.textContent = getTranslation('signup_subtitle_patient');
            signupButtonElement.textContent = getTranslation('signup_button_patient');
        } else {
            signupTitleElement.textContent = getTranslation('signup_title_clinic');
            signupSubtitleElement.textContent = getTranslation('signup_subtitle_clinic');
            signupButtonElement.textContent = getTranslation('signup_button_clinic');
        }
    }
    // --- End Update Function ---

    // Header scroll behavior
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const header = document.querySelector('header');
                const currentScroll = window.pageYOffset;
                
                // Only trigger header hide/show on significant scroll
                if (Math.abs(currentScroll - lastScrollTop) > 50) {
                    if (currentScroll > lastScrollTop && currentScroll > 100) {
                        // Scrolling down
                        header.classList.add('hidden');
                    } else {
                        // Scrolling up
                        header.classList.remove('hidden');
                    }
                    lastScrollTop = currentScroll;
                }
                
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Form type toggle
    toggleBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const formType = btn.dataset.type;
            
            // Update buttons
            toggleBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
            
            // Update form dataset
            if(signupForm) signupForm.dataset.currentType = formType;
            
            // Update fields visibility and required attributes
            if (formType === 'patient') {
                patientFields.forEach(field => {
                    field.classList.remove('hidden');
                    field.querySelector('select, input').required = true;
                });
                clinicFields.forEach(field => {
                    field.classList.add('hidden');
                    field.querySelector('input').required = false;
                });
                // --- Update dynamic text using translations --- 
                updateSignupFormText(formType);
                // ---------------------------------------------
            } else {
                patientFields.forEach(field => {
                    field.classList.add('hidden');
                    field.querySelector('select, input').required = false;
                });
                clinicFields.forEach(field => {
                    field.classList.remove('hidden');
                    field.querySelector('input').required = true;
                });
                // --- Update dynamic text using translations --- 
                updateSignupFormText(formType);
                // ---------------------------------------------
            }

            // Reset form and validation
            if(signupForm) signupForm.reset();
            // Hide success message if visible
            if (successMessageElement) successMessageElement.style.display = 'none';
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Skip empty hash links
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form submission handler
    async function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const successMessage = form.querySelector('.success-message'); // Already defined above as successMessageElement
        const formType = form.dataset.currentType;

        console.log('Form submission started');
        console.log('Form type:', formType);

        // Validate form
        const isValid = validateForm(form);
        console.log('Form validation result:', isValid);
        
        if (!isValid) {
            console.log('Form validation failed');
            // --- Debugging Log ---
            const validationKey = 'signup_error_validation';
            console.log(`[Debug] Getting validation msg. Lang: ${currentLang}, Key: ${validationKey}, Value: ${translations[validationKey]}`);
            // --- End Debugging Log ---
            successMessage.textContent = getTranslation(validationKey);
            // -----------------------------------------
            successMessage.style.display = 'block';
            successMessage.style.color = 'var(--error)';
            setTimeout(() => {
                successMessage.style.display = 'none';
                successMessage.style.color = 'var(--success)'; // Reset color
            }, 5000);
            return;
        }

        // Show loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        console.log('Loading state activated');

        try {
            // Get form data
            const formData = new FormData(form);
            const data = {};
            
            // Log all form data entries
            console.log('Raw form data entries:');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
                if (value.trim()) {
                    data[key] = value.trim();
                }
            }
            
            // Add form type and timestamp
            data.formType = formType;
            data.timestamp = new Date().toISOString();

            // Clean up data based on form type
            if (formType === 'patient') {
                delete data['clinic-name'];
                delete data['location'];
            } else {
                delete data['interest'];
            }

            console.log('Processed form data:', data);

            // Send data to server
            console.log('Sending request to server...');
            const response = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('Server response status:', response.status);
            const responseData = await response.json();
            console.log('Server response data:', responseData);
            
            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to submit form');
            }

            // Show success message
            console.log('Form submission successful for type:', formType);
            const successKey = formType === 'patient' ? 'signup_success_patient' : 'signup_success_clinic';
            console.log(`[Debug] Using success key: ${successKey}`);
            
            // Ensure the success message element exists
            if (successMessage) {
                const messageText = getTranslation(successKey);
                console.log(`[Debug] Retrieved translation for ${successKey}: "${messageText}"`);
                
                if (messageText) { // Check if translation was found
                    successMessage.textContent = messageText;
                    successMessage.style.color = 'var(--success)'; // Ensure success color
                    successMessage.style.display = 'block'; 
                    console.log('[Debug] Success message element display style set to block');
                    
                    form.reset(); // Reset form on success
                    console.log('[Debug] Form reset.');
                    
                    // Hide message after delay
                    setTimeout(() => {
                        if (successMessage) { // Check again inside timeout
                             successMessage.style.display = 'none';
                             console.log('[Debug] Success message hidden after timeout');
                        }
                    }, 5000);
                } else {
                     console.error(`[Error] Translation not found for key: ${successKey}`);
                     // Optionally display a generic success message as fallback
                     successMessage.textContent = 'Submission successful!'; // Generic fallback
                     successMessage.style.color = 'var(--success)';
                     successMessage.style.display = 'block';
                     form.reset(); 
                     setTimeout(() => { if (successMessage) successMessage.style.display = 'none'; }, 5000);
                }
            } else {
                console.error("[Error] Could not find the success message element (.success-message) inside the form.");
                // Cannot display message, maybe alert?
                alert(getTranslation(successKey) || "Submission successful!"); // Alert as fallback
                form.reset();
            }

            // Scroll success message into view
            // Ensure successMessage is valid before scrolling
            if (successMessage && successMessage.style.display === 'block') { 
                 successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

        } catch (error) {
            console.error('Form submission error:', error);
            console.error('Error details:', error.message);
            // --- Debugging Log ---
            const errorKey = 'signup_error_submit';
            console.log(`[Debug] Getting submit error msg. Lang: ${currentLang}, Key: ${errorKey}, Value: ${translations[errorKey]}`);
            // --- End Debugging Log ---
            successMessage.textContent = getTranslation(errorKey);
            // -----------------------------------------
            successMessage.style.display = 'block';
            successMessage.style.color = 'var(--error)';
            
            // Hide error message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
                successMessage.style.color = 'var(--success)'; // Reset color
            }, 5000);
        } finally {
            // Reset button state
            console.log('Resetting form state');
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    }

    // Form validation
    function validateForm(form) {
        const formType = form.dataset.currentType;
        const inputs = formType === 'patient' 
            ? form.querySelectorAll('.patient-field input[required], .patient-field select[required], input[name="name"], input[name="email"], input[name="consent"]')
            : form.querySelectorAll('.clinic-field input[required], input[name="name"], input[name="email"], input[name="consent"]');
        
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
            }
        });

        return isValid;
    }

    // Add form submission handler
    if (signupForm) {
        signupForm.addEventListener('submit', handleFormSubmit);
    }

    // Add real-time validation
    signupForm.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => {
            if (input.hasAttribute('required')) {
                if (input.value.trim()) {
                    input.classList.remove('invalid');
                } else {
                    input.classList.add('invalid');
                }
            }
        });
    });

    // Mobile menu toggle
    const createMobileMenu = () => {
        const nav = document.querySelector('nav');
        const navLinks = document.querySelector('.nav-links');
        
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-button';
        menuButton.innerHTML = '☰';
        
        nav.insertBefore(menuButton, navLinks);
        
        menuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuButton.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    };
    
    createMobileMenu();

    // Modal handling
    document.querySelectorAll('.modal-trigger').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = link.dataset.modal;
            const modal = document.getElementById(`${modalId}-modal`);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close modal when clicking close button or outside
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }
    });

    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent; // Use translated text eventually?
            // Consider translating "Sending..." too if needed
            submitButton.textContent = 'Sending...'; 
            submitButton.disabled = true;
            const successMessage = this.querySelector('.contact-success-message');
            successMessage.style.display = 'none'; // Hide previous message

            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            try {
                console.log('Sending contact form data:', data);
                const response = await fetch('/api/submit-contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                console.log('Server response status:', response.status);
                const result = await response.json();
                console.log('Server response:', result);

                if (response.ok) {
                    // --- Debugging Log ---
                    const contactSuccessKey = 'contact_form_success';
                    console.log(`[Debug] Getting contact success msg. Lang: ${currentLang}, Key: ${contactSuccessKey}, Value: ${translations[contactSuccessKey]}`);
                    // --- End Debugging Log ---
                    successMessage.textContent = getTranslation(contactSuccessKey);
                    // -------------------------------------
                    successMessage.style.display = 'block';
                    this.reset();
                    // Hide message after delay
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 5000); 
                } else {
                    throw new Error(result.message || 'Failed to submit form');
                }
            } catch (error) {
                console.error('Contact form submission error:', error);
                // --- Debugging Log ---
                const contactErrorKey = 'contact_form_error_submit';
                console.log(`[Debug] Getting contact error alert. Lang: ${currentLang}, Key: ${contactErrorKey}, Value: ${translations[contactErrorKey]}`);
                // --- End Debugging Log ---
                alert(getTranslation(contactErrorKey));
                // -------------------------------------------
            } finally {
                // --- Restore translated button text? --- 
                // If button text changes dynamically, restore it here
                // For now, we added data-translate, so applyTranslations should handle it,
                // but setting it explicitly might be safer after manual change.
                submitButton.textContent = getTranslation('contact_form_button_send');
                // submitButton.textContent = originalButtonText; // Reverts to whatever it was before 'Sending...'
                // -----------------------------------------
                submitButton.disabled = false;
            }
        });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('user-is-tabbing');
    });

    // Lazy Loading Images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // --- Initialize Localization AFTER getting form elements ---
    initLocalization(); 
    // --- End Initialization ---
});
