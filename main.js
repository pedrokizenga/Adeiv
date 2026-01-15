import { supabase } from './supabase.js';

// Reveal animations on scroll
const reveals = document.querySelectorAll('.reveal, .fade-in, .sin-card, .testimonial-card, .faq-item, .features-list li');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Add a staggered delay based on proximity if they appear together
            setTimeout(() => {
                entry.target.classList.add('active');
            }, 100);
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

reveals.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close others
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
        });

        // Toggle current
        if (!isOpen) {
            item.classList.add('active');
        }
    });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Dashboard Chat Animation - More interactive
function animateChat() {
    const bubbles = document.querySelectorAll('.chat-bubble');
    bubbles.forEach((bubble, index) => {
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(20px) scale(0.9)';
        bubble.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';

        setTimeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0) scale(1)';
        }, index * 1200 + 500);
    });
}

const chatObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        animateChat();
        chatObserver.unobserve(entries[0].target);
    }
}, { threshold: 0.7 });

const dashboard = document.querySelector('.dashboard-mock');
if (dashboard) chatObserver.observe(dashboard);

// Qualification Form Handling
const qualificationForm = document.getElementById('qualificationForm');

// Masking logic for Clinic and WhatsApp
if (qualificationForm) {
    const clinicField = qualificationForm.querySelector('input[name="Clínica e Localização"]');
    const whatsappInput = qualificationForm.querySelector('input[name="WhatsApp"]');

    // WhatsApp Masking: +244 9XX XXX XXX
    if (whatsappInput) {
        // Initialize with prefix
        if (!whatsappInput.value) whatsappInput.value = '+244 ';

        whatsappInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, ''); // Get only digits

            // Remove 244 if it starts with it to avoid double prefixing
            if (value.startsWith('244')) {
                value = value.substring(3);
            }

            // Limit to 9 digits (Angolan mobile numbers)
            value = value.substring(0, 9);

            // Reconstruct with spaces
            let formatted = '+244';
            if (value.length > 0) formatted += ' ' + value.substring(0, 3);
            if (value.length > 3) formatted += ' ' + value.substring(3, 6);
            if (value.length > 6) formatted += ' ' + value.substring(6, 9);

            e.target.value = formatted;
        });

        // Prevent deleting the prefix
        whatsappInput.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && e.target.value.length <= 5) {
                e.preventDefault();
            }
        });
    }

    // Clinic - Location Mask Logic (Estilo Data/Input Mascarado)
    if (clinicField) {
        clinicField.addEventListener('keydown', function (e) {
            const value = e.target.value;

            // Se o utilizador carregar em '/' e ainda não houver o separador
            if (e.key === '/' && !value.includes(' / ')) {
                e.preventDefault();
                if (value.length > 0) {
                    e.target.value = value.trim() + ' / ';
                }
            }
        });

        // Garantir o traço final no banco de dados
        clinicField.addEventListener('blur', function (e) {
            let value = e.target.value.trim();
            if (value && value.includes(' / ')) {
                e.target.value = value.replace(' / ', ' - ');
            } else if (value && value.includes(' ') && !value.includes(' - ')) {
                const parts = value.split(' ');
                e.target.value = parts[0] + ' - ' + parts.slice(1).join(' ');
            }
        });
    }

    qualificationForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn = this.querySelector('.btn-submit');

        btn.innerText = 'PROCESSANDO PROTOCOLO...';
        btn.disabled = true;
        btn.classList.remove('pulse');

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        // Check if supabase is configured
        if (!supabase) {
            console.warn('Supabase não configurado. Redirecionando (Modo de Teste)...');
            setTimeout(() => {
                window.location.href = '/obrigado';
            }, 1000);
            return;
        }

        try {
            const { error } = await supabase
                .from('leads')
                .insert([data]);

            if (error) throw error;

            window.location.href = '/obrigado';
        } catch (error) {
            console.error('Erro ao salvar no Supabase:', error);
            // Fallback para não travar o lead mesmo com erro no banco
            setTimeout(() => {
                window.location.href = '/obrigado';
            }, 500);
        }
    });
}

// Simple interaction feedback
document.querySelectorAll('.btn-primary, .sin-card').forEach(el => {
    el.addEventListener('touchstart', () => {
        el.style.transform = 'scale(0.98)';
    });
    el.addEventListener('touchend', () => {
        el.style.transform = '';
    });
});
