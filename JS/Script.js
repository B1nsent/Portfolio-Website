const DATA_BASE = 'https://raw.githubusercontent.com/B1nsent/portfolio-data/main';
const IMAGES_BASE = 'https://raw.githubusercontent.com/B1nsent/portfolio-data/main/images/projects';

let allData = {
experience: [],
projects: [],
credentials: []
};

const ABOUT_TEXT_HTML = `
`;

const SOCIAL_MEDIA_HTML = `
<div class="mobile-social-icons-row">
<a href="mailto:vincent.macasinag@proton.me" class="social-link social-link-icon">
<i class="bi bi-envelope"></i>
<span>vincent.macasinag@proton.me</span>
</a>
<a href="tel:+639612222627" class="social-link social-link-icon">
<i class="bi bi-telephone"></i>
<span>+63 961 2222 627</span>
</a>
<a href="https://www.facebook.com/b1nsent" class="social-link social-link-icon" target="_blank">
<i class="bi bi-facebook"></i>
<span>Vincent Macasinag</span>
</a>
<a href="./File/MacasinagVincent_Resume.pdf" download class="btn-sidebar-primary" target="_blank">
<i class="bi bi-file-earmark-arrow-down-fill"></i>
<span>Download Resume</span>
</a>
</div>
`;


function addCacheBuster(url) {
return `${url}?_=${Date.now()}`;
}

async function fetchAllData() {
try {
const [expRes, projRes, credRes] = await Promise.all([
fetch(addCacheBuster(`${DATA_BASE}/experience.json`)),
fetch(addCacheBuster(`${DATA_BASE}/projects.json`)),
fetch(addCacheBuster(`${DATA_BASE}/credentials.json`))
]);

allData.experience = await expRes.json();
allData.projects = await projRes.json();
allData.credentials = await credRes.json();

updateStats();
setupSidebarContent(); 
renderContent('overview'); 
} catch (error) {
console.error('Error fetching data:', error);
}
}

function setupSidebarContent() {
const expCount = allData.experience.length;
const projCount = allData.projects.length;
const credCount = allData.credentials.length;

document.getElementById('about-content-placeholder').innerHTML = ABOUT_TEXT_HTML;

const STATS_HTML = `
 <div class="stats-row-three-items">
 <div class="stat-item-lg">
  <span class="stat-value-lg" id="exp-count">${expCount}</span>
  <span class="stat-label-sm">Experiences</span>
 </div>
 <div class="stat-item-lg">
  <span class="stat-value-lg" id="proj-count">${projCount}</span>
  <span class="stat-label-sm">Projects</span>
 </div>
 <div class="stat-item-lg">
  <span class="stat-value-lg" id="cred-count">${credCount}</span>
  <span class="stat-label-sm">Credentials</span>
 </div>
 </div>
`;

document.getElementById('social-media-placeholder').innerHTML = SOCIAL_MEDIA_HTML;

 document.getElementById('mobile-social-bar-placeholder').innerHTML = SOCIAL_MEDIA_HTML + `
 <div class="mobile-stats-container">${STATS_HTML}</div>
 `;

const statsGrid = document.getElementById('portfolio-stats-grid');
statsGrid.innerHTML = STATS_HTML;
}

function updateStats() {

}

function createPost(args) {
const { title, sub, body, contentHtml, flair, subredditName, subredditIcon } = args;

const randomVotes = Math.floor(Math.random() * 500);
const randomComments = Math.floor(Math.random() * 50);

const subredditHtml = subredditName ? `
 <div class="subreddit-info">
  <div class="subreddit-icon">${subredditIcon}</div>
  <span>${subredditName}</span>
 </div>
 <span>•</span>
` : '';

const flairClass = flair ? flair.toLowerCase().replace(/ /g, '') : '';
const flairHtml = flair ? `
 <div class="flair-container">
  <span class="flair ${flairClass}">${flair}</span>
 </div>
` : '';

return `
<div class="post-card">
<div class="post-container">
<div class="post-meta">
 ${subredditHtml}
<span>Posted by u/Aya</span>
</div>
<h2 class="post-title">${title} ${sub ? `<span class="post-title-subtext">(${sub})</span>` : ''}</h2>
 ${flairHtml} 
${body ? `<div class="post-body">${body}</div>` : ''}
${contentHtml ? `<div class="post-content-wrapper">${contentHtml}</div>` : ''}

<div class="post-footer">
<div class="vote-controls">
<button class="vote-arrow" aria-label="Upvote"><i class="bi bi-arrow-up-circle-fill"></i></button>
<span class="vote-score">${randomVotes}</span>
<button class="vote-arrow" aria-label="Downvote"><i class="bi bi-arrow-down-circle"></i></button>
</div>

<button class="footer-btn"><i class="bi bi-chat"></i> ${randomComments} Reply</button>
<button class="footer-btn"><i class="bi bi-arrow-90deg-right"></i> Share</button>
<button class="footer-btn"><i class="bi bi-three-dots"></i></button>
</div>
</div>
</div>
`;
}


function buildExperiencePost(exp) {
return createPost({
title: exp.title,
sub: exp.company,
body: exp.description || 'No description available.',
flair: 'Experience',
 subredditName: 'r/experiences',
 subredditIcon: '<i class="bi bi-briefcase"></i>'
});
}

function buildProjectPost(project) {
const projectHtml = `
<div class="showcase-card">
${project.image_url ? `<img src="${IMAGES_BASE}/${project.image_url}" class="showcase-img" alt="${project.title} screenshot" onerror="this.src='https://via.placeholder.com/600x450/1A1A1B/818384?text=No+Image'">` : '<div class="showcase-img"></div>'}
</div>
`;

return createPost({
title: 'Project Showcase: ' + project.title,
body: project.description || 'Check out this recently completed project!', 
contentHtml: `<div class="showcase-grid">${projectHtml}</div>`, 
flair: 'Project',
 subredditName: 'r/projects',
 subredditIcon: '<i class="bi bi-code-slash"></i>'
});
}

function buildCredentialPost(cred) {
const credHtml = `
<div class="credential-item">
<i class="bi bi-${cred.icon_name || 'award'} credential-icon"></i>
<div class="credential-info">
<h3>${cred.title}</h3>
<p><strong>Issued by:</strong> ${cred.issuer || 'N/A'} | <strong>Date:</strong> ${cred.date_issued || 'N/A'}</p>
<p style="margin-top: 4px;">${cred.description || 'No description'}</p>
</div>
</div>
`;
return createPost({
title: 'New Credential Earned: ' + cred.title,
contentHtml: credHtml,
flair: 'Certification',
 subredditName: 'r/credentials',
 subredditIcon: '<i class="bi bi-patch-check"></i>'
});
}


function renderContent(tab) {
const contentArea = document.getElementById('content-area');
let html = '';

document.querySelectorAll('.tabs a').forEach(t => {
const dataTab = t.dataset.tab === 'info' ? 'education' : t.dataset.tab;
t.classList.toggle('active', dataTab === tab);
});

switch(tab) {
case 'overview':
const allItems = [
...allData.experience.map(e => ({type: 'experience', data: e})),
...allData.projects.map(p => ({type: 'project', data: p})),
...allData.credentials.map(c => ({type: 'credential', data: c}))
];

html += createPost({
title: "Introduction: Welcome to my Digital Portfolio",
body: "Yokoso! I am Vincent, an IT Student. My passion lies in IT and Politics. I believe that blending these 2 fields can make this country a better place. This website is a showcase of my student journey. Feel free to explore and learn more about myself.",
flair: "Pinned",
 subredditName: 'r/Aya',
 subredditIcon: '<i class="bi bi-reddit"></i>'
});

allItems.sort(() => Math.random() - 0.5);

allItems.forEach(item => {
if (item.type === 'experience') {
html += buildExperiencePost(item.data);
} else if (item.type === 'project') {
html += buildProjectPost(item.data);
} else if (item.type === 'credential') {
html += buildCredentialPost(item.data);
}
});
break;

case 'education':
const educationHtml = `
<div class="credential-item">
<i class="bi bi-mortarboard credential-icon"></i>
<div class="credential-info">
<h3>University of Nueva Caceres</h3>
<p><strong>Tertiary:</strong> BS Information Technology (2023-Present)</p>
</div>
</div>
<div class="credential-item">
<i class="bi bi-book credential-icon"></i>
<div class="credential-info">
<h3>University of Nueva Caceres</h3>
<p><strong>Basic Education:</strong> TVL - ICT (2021-2023)</p>
</div>
</div>
`;
const educationPost = createPost({
title: 'Education & Background',
contentHtml: educationHtml,
flair: 'Education',
 subredditName: 'r/education',
 subredditIcon: '<i class="bi bi-mortarboard"></i>'
});

html = educationPost; 
break;

case 'experience':
allData.experience.forEach(exp => {
html += buildExperiencePost(exp);
});
break;

case 'projects':
allData.projects.forEach(p => {
html += buildProjectPost(p);
});
break;

case 'credentials':
allData.credentials.forEach(cred => {
html += buildCredentialPost(cred);
});
break;
}

contentArea.innerHTML = html || '<div style="padding:40px; text-align:center; color:var(--text-secondary);">Nothing to see here yet!</div>';
}

document.querySelectorAll('.tabs a').forEach(tab => {
tab.addEventListener('click', (e) => {
e.preventDefault();
const tabKey = tab.dataset.tab === 'info' ? 'education' : tab.dataset.tab;

if (tabKey) {
history.pushState(null, '', tab.href);
renderContent(tabKey);
}
});
});

fetchAllData();