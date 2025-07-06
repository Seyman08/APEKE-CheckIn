const form = document.getElementById('checkinForm');
const status = document.getElementById('status');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  status.textContent = "Checking your location...";

  const name = document.getElementById('name').value.trim();
  const timestamp = new Date();

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const officeLat = 7.364350976013214;
    const officeLng = 3.8545583911102015;
    const distance = Math.sqrt(Math.pow(lat - officeLat, 2) + Math.pow(lng - officeLng, 2));

    // Map setup
    const mapContainer = document.getElementById("map");
    mapContainer.innerHTML = "";

    const map = L.map('map').setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // User marker
    L.marker([lat, lng]).addTo(map).bindPopup("📍 You are here").openPopup();

    // Office marker
    L.marker([officeLat, officeLng], {
      icon: L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        iconSize: [30, 30]
      })
    }).addTo(map).bindPopup("🏢 Office Location");

    if (distance > 0.001) {
      status.textContent = "❌ You are not within the allowed check-in area.";
      return;
    }

    // Step 1: Reverse geocode to get readable location name
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const locationName = data.display_name || `[${lat.toFixed(4)}, ${lng.toFixed(4)}]`;

        // Step 2: Save all data to Firestore
        db.collection('checkins').add({
          name: name,
          time: timestamp.toISOString(),
          location: {
            latitude: lat,
            longitude: lng
          },
          locationName: locationName
        }).then(() => {
          status.textContent = `✅ Checked in at ${timestamp.toLocaleTimeString()} from ${locationName}`;
          form.reset();
        }).catch((error) => {
          status.textContent = "Error saving check-in: " + error.message;
        });
      })
      .catch(() => {
        status.textContent = `✅ Checked in at ${timestamp.toLocaleTimeString()} (location name not found)`;
      });

  }, () => {
    status.textContent = "❌ Location access denied. Please enable it to check in.";
  });
});
