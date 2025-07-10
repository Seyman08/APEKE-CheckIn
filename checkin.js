// Make sure EmailJS script is included in index.html:
// <script src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"></script>

emailjs.init("vKL5vSZ9wTmC991IF");

const form = document.getElementById('checkinForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = "📍 Checking location...";

  const name = document.getElementById('name').value.trim();
  const timestamp = new Date();

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const officeLat = 7.364999;
    const officeLng = 3.854641;
    const distance = Math.sqrt(Math.pow(lat - officeLat, 2) + Math.pow(lng - officeLng, 2));

    const mapContainer = document.getElementById("map");
    mapContainer.innerHTML = "";

    const map = L.map('map').setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup("📍 You are here").openPopup();

    L.marker([officeLat, officeLng], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        iconSize: [30, 30]
      })
    }).addTo(map).bindPopup("🏢 Office Location");

    // if (distance > 0.001) {
    //   status.textContent = "❌ You are not within the allowed check-in area.";
    //   return;
    // }

    // 🔁 Reverse Geocode to get human-readable address
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json();
    const locationName = data.display_name || "Unknown Location";

    try {
      // Save check-in to Firebase
      await db.collection('checkins').add({
        name,
        time: timestamp.toISOString(),
        location: { latitude: lat, longitude: lng },
        locationName
      });

      // Send email using EmailJS
      await emailjs.send("service_6blg2ak", "template_3lu95i9", {
        name,
        time: timestamp.toLocaleString(),
        location: locationName
      });

      // ✅ Show success status
      status.textContent = `✅ Checked in at ${timestamp.toLocaleTimeString()} from ${locationName}`;
      form.reset();

      // 🎉 Show welcome card
      const welcomeCard = document.createElement("div");
      welcomeCard.innerHTML = `
        <div class="welcome-card fade-in">
          <h2>👋 Welcome back, <span>${name}</span>!</h2>
          <p>You’ve successfully checked in at <strong>${timestamp.toLocaleTimeString()}</strong>.</p>
        </div>
      `;
      document.body.appendChild(welcomeCard);

      // ⏱ Auto-dismiss after 5 seconds
      setTimeout(() => {
        welcomeCard.remove();
      }, 5000);

    } catch (error) {
      status.textContent = "Error saving check-in: " + error.message;
    }

  }, () => {
    status.textContent = "❌ Location access denied. Please enable it to check in.";
  });
});
