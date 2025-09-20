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

// ================= Fetch Channel Stats =================
async function fetchChannelStats() {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const channel = data.items[0];

    document.getElementById('subs').querySelector('span').textContent = Number(channel.statistics.subscriberCount).toLocaleString();
    document.getElementById('views').querySelector('span').textContent = Number(channel.statistics.viewCount).toLocaleString();
    document.getElementById('since').querySelector('span').textContent = new Date(channel.snippet.publishedAt).toLocaleDateString();
    document.getElementById('videos').querySelector('span').textContent = Number(channel.statistics.videoCount).toLocaleString();

    // Fetch total likes from uploads playlist
    const uploadsPlaylist = channel.contentDetails.relatedPlaylists.uploads;
    const totalLikes = await fetchTotalLikes(uploadsPlaylist);
    document.getElementById('likes').querySelector('span').textContent = totalLikes.toLocaleString();
}

// ================= Fetch Total Likes =================
async function fetchTotalLikes(playlistId) {
    let totalLikes = 0;
    let nextPage = '';
    do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPage}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const videoIds = data.items.map(item => item.contentDetails.videoId).join(',');

        // Fetch likes for batch
        if(videoIds.length > 0){
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
            const statsRes = await fetch(statsUrl);
            const statsData = await statsRes.json();
            statsData.items.forEach(v => {
                if(v.statistics.likeCount) totalLikes += parseInt(v.statistics.likeCount);
            });
        }
        nextPage = data.nextPageToken || '';
    } while(nextPage);

    return totalLikes;
}

// ================= Fetch Videos =================
let recentVideos = [];
let popularVideos = [];
const maxRecent = 4; // visible
let showAllRecent = false;

async function fetchVideos() {
    // Recent Videos
    const recentURL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=12`;
    const resRecent = await fetch(recentURL);
    const dataRecent = await resRecent.json();
    recentVideos = dataRecent.items;

    // Most Popular Videos
    const popularURL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=viewCount&maxResults=4`;
    const resPopular = await fetch(popularURL);
    const dataPopular = await resPopular.json();
    popularVideos = dataPopular.items;

    renderVideos();
}

// ================= Render Video Cards =================
function renderVideos() {
    // Recent Videos
    const recentContainer = document.getElementById('recent-videos');
    recentContainer.innerHTML = '';
    const videosToShow = showAllRecent ? recentVideos.slice(0,12) : recentVideos.slice(0,maxRecent);

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

        // Fetch views
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`)
            .then(r => r.json())
            .then(d => {
                const views = Number(d.items[0].statistics.viewCount).toLocaleString();
                card.querySelector('span').textContent = `Views: ${views}`;
                card.querySelector('span').style.fontWeight = 'bold';
            });
    });

    // Popular Videos
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

        // Fetch views
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`)
            .then(r => r.json())
            .then(d => {
                const views = Number(d.items[0].statistics.viewCount).toLocaleString();
                card.querySelector('span').textContent = `Views: ${views}`;
                card.querySelector('span').style.fontWeight = 'bold';
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
