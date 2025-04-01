document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const signupForm = document.getElementById('signup-form');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const patientFields = document.querySelectorAll('.patient-field');
    const clinicFields = document.querySelectorAll('.clinic-field');
    let lastScrollTop = 0;
    let ticking = false;

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
            
            // Update form
            signupForm.dataset.currentType = formType;
            
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
                document.querySelector('#signup-title').textContent = 'Join the Waitlist';
                document.querySelector('.form-subtitle').textContent = 'Be among the first to experience personalized beauty';
                document.querySelector('.signup-form .btn').textContent = 'Join Now';
            } else {
                patientFields.forEach(field => {
                    field.classList.add('hidden');
                    field.querySelector('select, input').required = false;
                });
                clinicFields.forEach(field => {
                    field.classList.remove('hidden');
                    field.querySelector('input').required = true;
                });
                document.querySelector('#signup-title').textContent = 'Partner With Us';
                document.querySelector('.form-subtitle').textContent = 'Transform your aesthetic practice';
                document.querySelector('.signup-form .btn').textContent = 'Connect Today';
            }

            // Reset form and validation
            signupForm.reset();
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
        const successMessage = form.querySelector('.success-message');
        const formType = form.dataset.currentType;

        console.log('Form submission started');
        console.log('Form type:', formType);

        // Validate form
        const isValid = validateForm(form);
        console.log('Form validation result:', isValid);
        
        if (!isValid) {
            console.log('Form validation failed');
            successMessage.textContent = 'Please fill in all required fields.';
            successMessage.style.display = 'block';
            successMessage.style.color = 'var(--error)';
            setTimeout(() => {
                successMessage.style.display = 'none';
                successMessage.style.color = 'var(--success)';
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
            console.log('Form submission successful');
            successMessage.textContent = formType === 'patient' 
                ? "Thank you! You've secured your place on our exclusive waitlist."
                : "Thank you! Our team will contact you about partnership opportunities.";
            successMessage.style.display = 'block';
            successMessage.style.color = 'var(--success)';
            form.reset();

            // Reset form type toggle if needed
            if (formType === 'clinic') {
                const patientBtn = document.querySelector('.toggle-btn[data-type="patient"]');
                if (patientBtn) patientBtn.click();
            }

            // Scroll success message into view
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);

        } catch (error) {
            console.error('Form submission error:', error);
            console.error('Error details:', error.message);
            successMessage.textContent = 'There was an error submitting the form. Please try again.';
            successMessage.style.display = 'block';
            successMessage.style.color = 'var(--error)';
            
            // Hide error message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
                successMessage.style.color = 'var(--success)';
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
    signupForm.addEventListener('submit', handleFormSubmit);

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
    document.getElementById('contact-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

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
                const successMessage = document.querySelector('.contact-success-message');
                successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                successMessage.style.display = 'block';
                this.reset();
            } else {
                throw new Error(result.message || 'Failed to submit form');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Sorry, there was an error submitting your message. Please try again.');
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });

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
});
