// Globomantics Robot Fleet Management System - Client JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Globomantics Robot Fleet Management System v2.3.0');
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                animateValue(entry.target);
            }
        });
    }, observerOptions);

    // Observe stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        observer.observe(card);
    });

    // Animate number counting
    function animateValue(element) {
        const valueElement = element.querySelector('h3');
        const endValue = valueElement.textContent;
        
        // Check if it's a number
        if (!/^\d+/.test(endValue)) return;
        
        const numericValue = parseInt(endValue);
        const duration = 2000;
        const startTime = Date.now();
        
        function updateValue() {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(progress * numericValue);
            valueElement.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            } else {
                valueElement.textContent = endValue; // Restore original value with any suffix
            }
        }
        
        updateValue();
    }

    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature, .model-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Mock real-time status update (for demo purposes)
    function updateSystemStatus() {
        const statusIndicator = document.createElement('div');
        statusIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
        `;
        statusIndicator.textContent = '● System Online';
        document.body.appendChild(statusIndicator);

        // Pulse effect
        setInterval(() => {
            statusIndicator.style.opacity = '0.7';
            setTimeout(() => {
                statusIndicator.style.opacity = '1';
            }, 500);
        }, 3000);
    }

    // Initialize status indicator after a short delay
    setTimeout(updateSystemStatus, 1000);

    // Log API endpoint for developers
    console.log('API Documentation available at: /api-docs');
    console.log('Default credentials - Username: admin, Password: Password1!');
});