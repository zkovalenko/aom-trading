// Modal functionality
function openNotifyModal() {
    const modal = document.getElementById('notifyModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeNotifyModal() {
    const modal = document.getElementById('notifyModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Form submission handlers
function submitNotification(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Simple email validation
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Here you would typically send to a server
    console.log('Notification signup:', email);
    
    // Show success message
    alert('Thank you! You\'ll be notified when AOM Trading launches.');
    event.target.reset();
}

function submitEarlyAccess(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email') || event.target.querySelector('input[type="email"]').value;
    const firstName = formData.get('firstName') || event.target.querySelector('input[type="text"]').value;
    const checkbox = event.target.querySelector('input[type="checkbox"]');
    
    // Validation
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }
    
    if (!firstName || firstName.trim().length < 2) {
        alert('Please enter your first name.');
        return;
    }
    
    if (!checkbox.checked) {
        alert('Please agree to receive updates about AOM Trading platform launch.');
        return;
    }
    
    // Send email to info@aomtrading.com
    const subject = encodeURIComponent('New Early Access Signup - AOM Trading');
    const body = encodeURIComponent(`New early access signup:

Name: ${firstName}
Email: ${email}
Timestamp: ${new Date().toLocaleString()}

This user has agreed to receive updates about the AOM Trading platform launch.`);
    
    const mailtoLink = `mailto:info@aomtrading.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    // Log for debugging
    console.log('Early access signup:', { email, firstName });
    
    // Show success message
    alert('Thank you for joining our early access list! Your default email client will open to complete the signup.');
    closeNotifyModal();
    event.target.reset();
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Handle navigation link clicks
    const navLinks = document.querySelectorAll('.nav-link, a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Close modal when clicking outside of it
    const modal = document.getElementById('notifyModal');
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeNotifyModal();
        }
    });
    
    // Handle escape key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeNotifyModal();
        }
    });
    
    // Add loading states to buttons
    const buttons = document.querySelectorAll('.cta-button, .service-button, .submit-button');
    buttons.forEach(button => {
        if (button.type === 'submit') {
            button.addEventListener('click', function() {
                const originalText = this.textContent;
                this.textContent = 'Please wait...';
                this.disabled = true;
                
                // Re-enable after form submission
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 2000);
            });
        }
    });
    
    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

// Update launch date dynamically (optional)
function updateLaunchInfo() {
    const launchElement = document.querySelector('.launch-info p');
    if (launchElement) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
        
        let nextQuarter, nextYear;
        if (currentQuarter === 4) {
            nextQuarter = 1;
            nextYear = currentYear + 1;
        } else {
            nextQuarter = currentQuarter + 1;
            nextYear = currentYear;
        }
        
        launchElement.innerHTML = `Full platform launching Q${nextQuarter} ${nextYear}`;
    }
}

// Initialize launch date on page load
document.addEventListener('DOMContentLoaded', updateLaunchInfo);