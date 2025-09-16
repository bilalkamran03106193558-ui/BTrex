const API_KEY = "AIzaSyCAL6n65CCaMVmOxP6P0rcif1G0ihKtig4"; 
const CHANNEL_ID = "UCEpyuVT33uWVKPfnGkUCqjw";

// Fetch channel stats
async function getChannelStats() {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const stats = data.items[0].statistics;

  document.getElementById("subscribers").textContent = stats.subscriberCount;
  document.getElementById("views").textContent = stats.viewCount;
}

// Fetch latest shorts
async function getShorts() {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=6&order=date&type=video&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  const shortsContainer = document.getElementById("shorts-container");
  shortsContainer.innerHTML = "";

  data.items.forEach(video => {
    const videoId = video.id.videoId;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allowFullscreen = true;
    shortsContainer.appendChild(iframe);
  });
}

getChannelStats();
getShorts();
