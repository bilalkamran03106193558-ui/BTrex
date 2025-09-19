// ================= Matrix Falling Background =================
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%';
const fontSize = 18;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 50);
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ================= YouTube API Setup =================
const API_KEY = 'AIzaSyCX3IAYHG-sVIypL-U3czYbSyHKcxqJhkU';
const CHANNEL_ID = 'UCEpyuVT33uWVKPfnGkUCqjw';

async function fetchChannelStats() {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const channel = data.items[0];

    document.getElementById('subs').querySelector('span').textContent = Number(channel.statistics.subscriberCount).toLocaleString();
    document.getElementById('views').querySelector('span').textContent = Number(channel.statistics.viewCount).toLocaleString();
    document.getElementById('likes').querySelector('span').textContent = Number(channel.statistics.videoCount).toLocaleString();
    const sinceDate = new Date(channel.snippet.publishedAt).toLocaleDateString();
    document.getElementById('since').querySelector('span').textContent = sinceDate;
}

// ================= Fetch Videos =================
let recentVideos = [];
let popularVideos = [];
const maxRecent = 5; // default visible
let showAllRecent = false;

async function fetchVideos() {
    // Recent Videos
    const recentURL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10`;
    const resRecent = await fetch(recentURL);
    const dataRecent = await resRecent.json();
    recentVideos = dataRecent.items;

    // Most Popular Videos
    const popularURL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=viewCount&maxResults=5`;
    const resPopular = await fetch(popularURL);
    const dataPopular = await resPopular.json();
    popularVideos = dataPopular.items;

    renderVideos();
}

// ================= Render Video Cards =================
function renderVideos() {
    const recentContainer = document.getElementById('recent-videos');
    recentContainer.innerHTML = '';

    const videosToShow = showAllRecent ? recentVideos : recentVideos.slice(0, maxRecent);

    videosToShow.forEach(video => {
        const videoId = video.id.videoId;
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
            <div class="video-info">
                <h3 title="${video.snippet.title}">${video.snippet.title}</h3>
                <p>${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                <span>Views: Loading...</span>
            </div>
        `;
        card.querySelector('img').addEventListener('click', () => {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        });
        recentContainer.appendChild(card);

        // Fetch view count for each video
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`)
            .then(r => r.json())
            .then(d => {
                const views = Number(d.items[0].statistics.viewCount).toLocaleString();
                card.querySelector('span').textContent = `Views: ${views}`;
            });
    });

    // Most Popular
    const popularContainer = document.getElementById('popular-videos');
    popularContainer.innerHTML = '';
    popularVideos.forEach(video => {
        const videoId = video.id.videoId;
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
            <div class="video-info">
                <h3 title="${video.snippet.title}">${video.snippet.title}</h3>
                <p>${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                <span>Views: Loading...</span>
            </div>
        `;
        card.querySelector('img').addEventListener('click', () => {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        });
        popularContainer.appendChild(card);

        // Fetch view count
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`)
            .then(r => r.json())
            .then(d => {
                const views = Number(d.items[0].statistics.viewCount).toLocaleString();
                card.querySelector('span').textContent = `Views: ${views}`;
            });
    });
}

// ================= See More / See Less Button =================
document.getElementById('toggleShortsBtn').addEventListener('click', () => {
    showAllRecent = !showAllRecent;
    document.getElementById('toggleShortsBtn').textContent = showAllRecent ? 'See Less' : 'See More';
    renderVideos();
});

// ================= Initial Load =================
fetchChannelStats();
fetchVideos();
