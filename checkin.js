emailjs.init("vKL5vSZ9wTmC991IF");

const form = document.getElementById('checkinForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = "📍 Checking location...";

  // 🔒 Disable button to prevent multiple clicks
  form.querySelector("button").disabled = true;

  const name = document.getElementById('name').value.trim();
  const timestamp = new Date();

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser.";
    form.querySelector("button").disabled = false; // 🔓 Re-enable on failure
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const officeLat = 7.36440;
    const officeLng = 3.85449;
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

    
    if (distance > 0.00002) {
      status.textContent = "❌ You are not within the allowed check-in area.";
      form.querySelector("button").disabled = false; // 🔓 Re-enable on invalid location
      return;
    }

    // 🔁 Reverse Geocode
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json();
    const locationName = data.display_name || "Unknown Location";

    try {
      await db.collection('checkins').add({
        name,
        time: timestamp.toISOString(),
        location: { latitude: lat, longitude: lng },
        locationName
      });

      await emailjs.send("service_6blg2ak", "template_3lu95i9", {
        name,
        time: timestamp.toLocaleString(),
        location: locationName
      });

      status.textContent = `✅ Checked in at ${timestamp.toLocaleTimeString()} from ${locationName}`;
      form.reset();

      const welcomeCard = document.createElement("div");
      welcomeCard.innerHTML = `
        <div class="welcome-card fade-in">
          <h2>👋 Welcome back, <span>${name}</span>!</h2>
          <p>You’ve successfully checked in at <strong>${timestamp.toLocaleTimeString()}</strong>.</p>
        </div>
      `;
      document.body.appendChild(welcomeCard);

      setTimeout(() => {
        welcomeCard.remove();
      }, 5000);

    } catch (error) {
      status.textContent = "Error saving check-in: " + error.message;
    }

    form.querySelector("button").disabled = false; // 🔓 Re-enable on success

  }, () => {
    status.textContent = "❌ Location access denied. Please enable it to check in.";
    form.querySelector("button").disabled = false; // 🔓 Re-enable on error
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
});
