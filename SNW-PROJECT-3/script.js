let map;
let heatLayer;
let markerGroup;
let userPoints = 0;
let reportCount = 0;
let currentUser = null;

const USERS = { admin: "1234", demo: "demo" };

const heatData = [
    [12.9716, 77.5946, 0.8],
    [12.9800, 77.6000, 0.6],
    [12.9600, 77.5800, 0.7],
    [12.9750, 77.6100, 0.5]
];

let issues = [
    {
        id: 1,
        title: "Massive Pothole",
        category: "Pothole",
        desc: "Dangerous pothole near the main junction.",
        dateStr: "14/05/2026",
        status: "OPEN",
        lat: 12.9716,
        lng: 77.5946,
        image: "pothole.png"
    },
    {
        id: 2,
        title: "Garbage Pileup",
        category: "Garbage",
        desc: "Overflowing bins near the park entrance.",
        dateStr: "13/05/2026",
        status: "OPEN",
        lat: 12.9800,
        lng: 77.6000,
        image: "garbage.png"
    },
    {
        id: 3,
        title: "Blocked Drain",
        category: "Drainage",
        desc: "Water logging after light rain.",
        dateStr: "12/05/2026",
        status: "OPEN",
        lat: 12.9600,
        lng: 77.5800,
        image: "drain.png"
    },
    {
        id: 4,
        title: "Illegal Parking",
        category: "Parking",
        desc: "Cars parked on the sidewalk blocking pedestrians.",
        dateStr: "11/05/2026",
        status: "OPEN",
        lat: 12.9750,
        lng: 77.6100,
        image: "parking.png"
    }
];

function doLogin() {
    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value;
    const err = document.getElementById("loginError");
    err.style.display = "none";

    if (!u || !p) {
        err.textContent = "Please enter both username and password.";
        err.style.display = "block";
        return;
    }
    if (USERS[u] !== p) {
        err.textContent = "Invalid username or password.";
        err.style.display = "block";
        return;
    }

    currentUser = u;
    document.getElementById("loginOverlay").classList.add("hidden");
    document.getElementById("userLabel").textContent = "👤 " + currentUser;
    updateLeaderboard();
}

function doLogout() {
    if (!confirm("Logout?")) return;
    currentUser = null;
    userPoints = 0;
    reportCount = 0;
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
    document.getElementById("points-display").textContent = "Your Reputation: 0 Points";
    document.getElementById("userLabel").textContent = "";
    document.getElementById("loginOverlay").classList.remove("hidden");
    updateLeaderboard();
    updateWeeklyReport();
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-mode");
    document.getElementById("themeBtn").textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function openSidebar() {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebarOverlay").classList.add("open");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarOverlay").classList.remove("open");
}

function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    if (id === "map-section") {
        if (!map) {
            map = L.map("map").setView([12.9716, 77.5946], 13);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
            markerGroup = L.layerGroup().addTo(map);
            heatLayer = L.heatLayer(heatData, { radius: 30, blur: 20, maxZoom: 17 }).addTo(map);
        }
        renderMapMarkers();
        setTimeout(() => map.invalidateSize(), 100);
    }
    closeSidebar();
}

function renderMapMarkers() {
    if (!map || !markerGroup) return;
    markerGroup.clearLayers();
    issues.filter(i => i.lat !== null && i.lng !== null && i.lat !== undefined && i.lng !== undefined && i.status !== "RESOLVED")
          .forEach(i => L.marker([i.lat, i.lng]).addTo(markerGroup).bindPopup(i.title));
}

function updatePoints(amount) {
    userPoints += amount;
    document.getElementById("points-display").textContent = `Your Reputation: ${userPoints} Points`;
    updateLeaderboard();
}

function updateLeaderboard() {
    const entries = [
        { name: "Rahul", pts: 450 },
        { name: "Priya", pts: 320 },
        { name: currentUser || "You", pts: userPoints }
    ].sort((a, b) => b.pts - a.pts);
    document.getElementById("hero-list").innerHTML = entries.map(e => `<li>${e.name} - ${e.pts} pts</li>`).join("");
}

function updateWeeklyReport() {
    document.getElementById("report-count").textContent = reportCount;
    const resolvedCount = issues.filter(i => i.status === "RESOLVED").length;
    document.getElementById("report-resolved").textContent = resolvedCount;
    const totalActivity = reportCount + resolvedCount;
    const impact = totalActivity >= 5 ? "High" : (totalActivity >= 2 ? "Medium" : "Low");
    document.getElementById("report-impact").textContent = impact;
}

async function submitReport() {
    if (!currentUser) return alert("Please log in first.");

    const titleInput = document.getElementById("issueTitle");
    if (!titleInput.value.trim()) return titleInput.reportValidity();

    const shareLocation = document.getElementById("issueShareLocation").checked;
    let lat = null, lng = null;

    if (shareLocation) {
        lat = 12.97 + (Math.random() * 0.02 - 0.01);
        lng = 77.59 + (Math.random() * 0.02 - 0.01);
        try {
            const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
        } catch (e) {}
    }

    const photoFile = document.getElementById("issuePhoto").files[0];
    const newIssue = {
        id: Date.now(),
        title: titleInput.value,
        category: document.getElementById("issueCategory").value,
        desc: document.getElementById("issueDesc").value,
        dateStr: new Date().toLocaleDateString(),
        status: "OPEN",
        lat: lat,
        lng: lng,
        image: photoFile ? URL.createObjectURL(photoFile) : ""
    };

    issues.unshift(newIssue);
    renderIssues();

    if (shareLocation) {
        heatData.push([lat, lng, 0.7]);
        if (heatLayer) heatLayer.setLatLngs(heatData);
        if (map) renderMapMarkers();
    }

    reportCount++;
    updatePoints(50);
    updateWeeklyReport();

    alert("Submitted! +50 Reputation Points");
    document.getElementById("reportForm").reset();
    showSection("feed");
}

async function shareIssue(title, category, desc) {
    const text = `CivicLens Report: ${title}\n${category}\n${desc}\n${window.location.href}`;
    if (navigator.share) {
        try {
            await navigator.share({ title: "CivicLens Issue", text: text, url: window.location.href });
            return;
        } catch (e) {}
    }
    try {
        await navigator.clipboard.writeText(text);
        alert("Issue details copied to clipboard!");
    } catch (e) {
        alert("Could not share. Please copy manually.");
    }
}

function resolveIssue(id) {
    if (!currentUser) return alert("Please log in first.");
    const issue = issues.find(i => i.id === id);
    if (issue && issue.status !== "RESOLVED") {
        issue.status = "RESOLVED";
        renderIssues();
        if (map) renderMapMarkers();
        updateWeeklyReport();
    }
}

function downloadReport() {
    html2pdf().from(document.getElementById("report-card")).save("Report.pdf");
}

document.getElementById("loginPass").addEventListener("keydown", e => {
    if (e.key === "Enter") doLogin();
});

function renderIssues() {
    document.getElementById("issue-list").innerHTML = issues.map(issue => {
        const imgHTML = issue.image ? `<img src="${issue.image}" class="issue-img">` : "";
        const isResolved = issue.status === "RESOLVED";
        const statusStyle = isResolved ? "color:#2ecc71; font-weight:bold;" : "color:red; font-weight:bold;";
        return `
            <div class="issue-item">
                ${imgHTML}
                <div>
                    <strong>${issue.title}</strong> - <span class="issue-status" style="${statusStyle}">${issue.status}</span><br>
                    <small>${issue.category} | ${issue.dateStr}</small><br>
                    <p>${issue.desc}</p>
                    <button class="share-btn" onclick="shareIssue('${issue.title.replace(/'/g, "\\'")}', '${issue.category}', '${issue.desc.replace(/'/g, "\\'")}')">🔗 Share</button>
                    <button class="resolve-btn" ${isResolved ? "disabled" : ""} onclick="resolveIssue(${issue.id})">${isResolved ? "Resolved" : "✅ Resolve"}</button>
                </div>
                <div style="clear:both"></div>
            </div>
        `;
    }).join("");
}

renderIssues();
updateLeaderboard();
updateWeeklyReport();
showSection("feed");
