// js/components.js - Component loader
class ComponentLoader {
    static async loadComponent(componentPath, targetSelector) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
            
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);
            
            if (targetElement) {
                targetElement.innerHTML = html;
            } else {
                console.warn(`Target element ${targetSelector} not found`);
            }
        } catch (error) {
            console.error('Error loading component:', error);
        }
    }

    static async loadMultipleComponents(components) {
        const promises = components.map(({ path, target }) => 
            this.loadComponent(path, target)
        );
        await Promise.all(promises);
    }

    static async initializeSharedComponents() {
        const isCredentialsPage = window.location.pathname.includes('See-MoreCredentials.html');
        
        const components = [
            { path: './Components/sidebar.html', target: '#sidebar-container' },
            { path: './Components/about-widget.html', target: '#about-widget-container' }
        ];

        if (!isCredentialsPage) {
            components.push({ path: './Components/credentials-widget.html', target: '#credentials-widget-container' });
        }

        await this.loadMultipleComponents(components);
        
        this.initializeComponentEvents();
    }

    static initializeComponentEvents() {
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch);
        }

        this.initializeNavigation();
    }

    static handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
    }

    static initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.initializeSharedComponents();
});