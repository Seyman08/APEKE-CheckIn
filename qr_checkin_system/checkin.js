const form = document.getElementById('checkinForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = "Checking location...";

  const name = document.getElementById('name').value.trim();
  const timestamp = new Date();

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    try {
      await db.collection('checkins').add({
        name: name,
        time: timestamp.toISOString(),
        location: {
          latitude: lat,
          longitude: lng
        }
      });

      status.textContent = `Checked in at ${timestamp.toLocaleTimeString()} from [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
      form.reset();
    } catch (error) {
      status.textContent = "Error saving check-in: " + error.message;
    }
  }, () => {
    status.textContent = "Location access denied. Please enable it to check in.";
  });
});
