import fs from 'fs';
import path from 'path';

const USERNAME = 'emanoeldelfino';
const README_PATH = path.join(process.cwd(), 'README.md');

const BADGE_CONFIG = {
    'JavaScript': { color: '323330', logo: 'javascript', logoColor: 'F7DF1E' },
    'HTML': { color: 'E34F26', logo: 'html5', logoColor: 'white', label: 'HTML5' },
    'CSS': { color: '1572B6', logo: 'css3', logoColor: 'white', label: 'CSS3' },
    'Shell': { color: '121011', logo: 'gnu-bash', logoColor: 'white', label: 'Shell_Script' },
    'Vim Script': { color: '11AB00', logo: 'vim', logoColor: 'white', label: 'VIM' },
    'TypeScript': { color: '3178C6', logo: 'typescript', logoColor: 'white' },
    'Python': { color: '3776AB', logo: 'python', logoColor: 'white' },
    'Go': { color: '00ADD8', logo: 'go', logoColor: 'white' },
};

async function fetchStats() {
    const token = process.env.GITHUB_TOKEN;
    const headers = token ? { 'Authorization': `token ${token}` } : {};

    console.log(`Fetching repositories for ${USERNAME}...`);
    const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, { headers });
    if (!response.ok) throw new Error(`Failed to fetch repos: ${response.statusText}`);
    const repos = await response.json();

    const languages = {};
    for (const repo of repos) {
        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
    }

    // Sort by frequency and take top 6
    return Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name]) => name);
}

function generateBadge(lang) {
    const config = BADGE_CONFIG[lang] || { color: 'grey', logo: lang.toLowerCase(), logoColor: 'white' };
    const label = config.label || lang;
    return `  <img src="https://img.shields.io/badge/${label}-${config.color}.svg?style=for-the-badge&logo=${config.logo}&logoColor=${config.logoColor}" alt="${lang}" />`;
}

async function updateReadme() {
    try {
        const topLangs = await fetchStats();
        console.log('Top languages:', topLangs);

        const badges = topLangs.map(generateBadge).join('\n');
        const readmeContent = fs.readFileSync(README_PATH, 'utf8');

        const startMarker = '<!-- README_STATS_START -->';
        const endMarker = '<!-- README_STATS_END -->';

        const startIndex = readmeContent.indexOf(startMarker);
        const endIndex = readmeContent.indexOf(endMarker);

        if (startIndex === -1 || endIndex === -1) {
            throw new Error('Markers not found in README.md');
        }

        const newContent =
            readmeContent.substring(0, startIndex + startMarker.length) +
            '\n' + badges + '\n' +
            readmeContent.substring(endIndex);

        fs.writeFileSync(README_PATH, newContent);
        console.log('README.md updated successfully!');
    } catch (error) {
        console.error('Error updating README:', error);
        process.exit(1);
    }
}

updateReadme();
