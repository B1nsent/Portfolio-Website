import { createClient } from '@supabase/supabase-js';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const mainContent = document.getElementById('mainContent');
    let highlightedElements = [];

    const SUPABASE_URL = 'https://egyhtyvnwloetmpbkqjg.supabase.co'; 
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneWh0eXZud2xvZXRtcGJrcWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NTY0MTYsImV4cCI6MjA3MzQzMjQxNn0.RmaxyX9OzPo3_H-RKLcqIXO2mkYOaxHNgmFJ8iy8peg';
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const BUCKET_NAME = 'static'; 

    function clearHighlights() {
        highlightedElements.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                const textNode = document.createTextNode(el.textContent);
                parent.insertBefore(textNode, el);
                parent.removeChild(el);
            }
        });
        highlightedElements = [];
    }

    function highlightText(node, term) {
        const text = node.nodeValue;
        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase();
        let index = lowerText.indexOf(lowerTerm);

        while (index !== -1) {
            const beforeText = text.substring(0, index);
            const matchedText = text.substring(index, index + term.length);
            const afterText = text.substring(index + term.length);

            const highlightSpan = document.createElement('span');
            highlightSpan.classList.add('highlight');
            highlightSpan.textContent = matchedText;

            const parent = node.parentNode;
            parent.insertBefore(document.createTextNode(beforeText), node);
            parent.insertBefore(highlightSpan, node);
            node.nodeValue = afterText;

            highlightedElements.push(highlightSpan);
            index = node.nodeValue.toLowerCase().indexOf(lowerTerm);
        }
    }

    function findTextNodes(element, term) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.toLowerCase().includes(term.toLowerCase())) {
                textNodes.push(node);
            }
        }
        return textNodes;
    }

    function searchAndScroll() {
        clearHighlights();
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            return;
        }

        const textNodesToHighlight = findTextNodes(mainContent, searchTerm);

        if (textNodesToHighlight.length > 0) {
            [...textNodesToHighlight].forEach(node => {
                highlightText(node, searchTerm);
            });
            const firstHighlight = document.querySelector('.highlight');
            if (firstHighlight) {
                firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchAndScroll();
            }
        });

        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === "") {
                clearHighlights();
            }
        });
    }

    document.querySelectorAll('.share-button').forEach(button => {
        button.addEventListener('click', () => {
            const currentUrl = window.location.href;
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: currentUrl,
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(currentUrl).then(() => {
                    alert('Portfolio link copied to clipboard!');
                }).catch(() => {
                    alert('Could not copy link. Please copy it manually: ' + currentUrl);
                });
            }
        });
    });

    async function fetchProjects() {
        try {
            const isAllProjectsPage = window.location.pathname.includes('See-MoreProjects.html');
            let query = supabase.from('projects').select('*');

            if (!isAllProjectsPage) {
                query = query.eq('is_featured', true);
            }

            const { data, error } = await query;
            if (error) throw error;

            const container = document.querySelector('#projects .projects-grid');
            if (!container) return;

            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No projects available yet.</p>';
                return;
            }

            data.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';

            let imageUrl = '/static/default-project.png';
            if (project.image_url) {
                const fullPath = `uploads/${project.image_url}`; 
                
                const { data: imageData } = supabase.storage.from('static').getPublicUrl(fullPath);
                
                if (imageData && imageData.publicUrl) {
                    imageUrl = imageData.publicUrl;
                }
            }

            projectCard.innerHTML = `
                <div class="project-image" style="background-image: url('${imageUrl}');"></div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description || 'No description available'}</p>
                </div>
            `;
            container.appendChild(projectCard);
        });

            if (!isAllProjectsPage) {
                if (data.length > 0) {
                    const sectionBody = document.querySelector('#projects .section-body');
                    if (sectionBody && !document.getElementById('see-more-projects-link')) {
                        const seeMoreLink = document.createElement('a');
                        seeMoreLink.id = 'see-more-projects-link';
                        seeMoreLink.href = 'See-MoreProjects.html';
                        seeMoreLink.className = 'see-more-link';
                        seeMoreLink.textContent = 'See All Projects →';
                        sectionBody.appendChild(seeMoreLink);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            const container = document.querySelector('#projects .projects-grid');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Failed to load projects. Refresh the page or try again later.</p>';
            }
        }
    }

    async function fetchExperience() {
        try {
            // ➡️ Step 4: Update API call for Experience table
            const { data, error } = await supabase.from('experience').select('*');
            if (error) throw error;

            const container = document.getElementById('experience-container');
            if (!container) return;

            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No experience entries available yet.</p>';
                return;
            }

            data.forEach(item => {
                const jobItem = document.createElement('div');
                jobItem.className = 'job-item';
                jobItem.innerHTML = `
                    <h3>${item.title} | ${item.company}</h3>
                    <p>${item.description || 'No description available'}</p>
                `;
                container.appendChild(jobItem);
            });
        } catch (error) {
            console.error("Error fetching experience:", error);
            const container = document.getElementById('experience-container');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Failed to load experience. Refresh the page or try again later.</p>';
            }
        }
    }

    async function fetchCredentials() {
        try {
            const isAllCredentialsPage = window.location.pathname.includes('See-MoreCredentials.html');

            // ➡️ Step 5: Update API call for Credentials table
            const { data, error } = await supabase.from('credentials').select('*');
            if (error) throw error;

            const sortedData = data.sort((a, b) => {
                const dateA = new Date(a.date_issued);
                const dateB = new Date(b.date_issued);
                return dateB - dateA;
            });

            let container;
            if (isAllCredentialsPage) {
                container = document.getElementById('credentials-main-container');
            } else {
                container = document.getElementById('credentials-container');
            }

            if (!container) return;

            container.innerHTML = '';

            if (sortedData.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No credentials available yet.</p>';
                return;
            }

            const dataToRender = isAllCredentialsPage ? sortedData : sortedData.slice(0, 3);

            dataToRender.forEach(credential => {
                if (isAllCredentialsPage) {
                    const credentialItem = document.createElement('div');
                    credentialItem.className = 'credential-item';
                    const iconName = credential.icon_name || 'award';
                    credentialItem.innerHTML = `
                        <i class="bi bi-${iconName} credential-icon"></i>
                        <div class="credential-details">
                            <h3>${credential.title}</h3>
                            <p><strong>Issued by:</strong> ${credential.issuer || 'N/A'} | <strong>Date:</strong> ${credential.date_issued || 'N/A'}</p>
                            <p>${credential.description || 'No description available'}</p>
                        </div>
                    `;
                    container.appendChild(credentialItem);
                } else {
                    const listItem = document.createElement('div');
                    listItem.className = 'list-item';
                    const iconName = credential.icon_name || 'award';
                    listItem.innerHTML = `
                        <i class="bi bi-${iconName}"></i>
                        <span>${credential.title}</span>
                    `;
                    container.appendChild(listItem);
                }
            });

            if (!isAllCredentialsPage && sortedData.length > 3) {
                const seeMoreLink = document.createElement('a');
                seeMoreLink.href = 'See-MoreCredentials.html';
                seeMoreLink.className = 'see-more-link';
                seeMoreLink.textContent = 'See All Credentials →';
                container.parentElement.appendChild(seeMoreLink);
            }
        } catch (error) {
            console.error("Error fetching credentials:", error);
            const containerIndex = document.getElementById('credentials-container');
            if (containerIndex) {
                containerIndex.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Failed to load credentials.</p>';
            }
            const containerAll = document.getElementById('credentials-main-container');
            if (containerAll) {
                containerAll.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Failed to load credentials.</p>';
            }
        }
    }

    fetchProjects();
    fetchExperience();
    fetchCredentials();
});