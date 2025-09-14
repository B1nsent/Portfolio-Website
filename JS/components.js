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
        
    }

}

document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.initializeSharedComponents();
});

function handleMobileWidgets() {
    const aboutWidget = document.getElementById('about-widget-container');
    const credentialsWidget = document.getElementById('credentials-widget-container');
    const mobileAboutWidget = document.getElementById('mobile-about-widget');
    const mobileCredentialsWidget = document.getElementById('mobile-credentials-widget');
    
    if (aboutWidget && mobileAboutWidget) {
        mobileAboutWidget.innerHTML = aboutWidget.innerHTML;
    }
    
    if (credentialsWidget && mobileCredentialsWidget) {
        mobileCredentialsWidget.innerHTML = credentialsWidget.innerHTML;
    }
}

function isMobileView() {
    return window.innerWidth <= 768;
}

function initMobileWidgets() {
    if (isMobileView()) {
        handleMobileWidgets();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initMobileWidgets();
        
        window.addEventListener('resize', () => {
            if (isMobileView()) {
                handleMobileWidgets();
            }
        });
    }, 100);
});

if (typeof window.componentsLoaded !== 'undefined') {
    window.componentsLoaded = function() {
        initMobileWidgets();
    };
}

