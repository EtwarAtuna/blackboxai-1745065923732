// JavaScript for both index.html and admin.html

// Utility to get cameras from localStorage
function getCameras() {
  const cameras = localStorage.getItem('cameras');
  return cameras ? JSON.parse(cameras) : [];
}

// Utility to save cameras to localStorage
function saveCameras(cameras) {
  localStorage.setItem('cameras', JSON.stringify(cameras));
}

// Common function to create a map and add camera markers
function createMap(mapId, onMarkerClick) {
  const map = L.map(mapId).setView([-6.2, 106.8], 11); // Centered on Jakarta for example

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  const cameras = getCameras();

  cameras.forEach((camera) => {
    const marker = L.marker([camera.lat, camera.lng]).addTo(map);
    marker.bindPopup(camera.name);
    marker.on('click', () => {
      onMarkerClick(camera);
    });
  });

  return map;
}

// Public page logic
function initPublicPage() {
  const feedContainer = document.getElementById('feedContainer');
  const cameraNameEl = document.getElementById('cameraName');

  function showFeed(camera) {
    cameraNameEl.textContent = camera.name;
    feedContainer.innerHTML = '';
    const video = document.createElement('video');
    video.src = camera.feed;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.className = 'w-full max-h-96 rounded shadow';
    feedContainer.appendChild(video);
  }

  createMap('map', showFeed);

  // Show first camera feed by default if available
  const cameras = getCameras();
  if (cameras.length > 0) {
    showFeed(cameras[0]);
  } else {
    cameraNameEl.textContent = 'No cameras available';
  }
}

// Admin page logic
function initAdminPage() {
  const cameraForm = document.getElementById('cameraForm');
  const cameraList = document.getElementById('cameraList');
  const cameraIdInput = document.getElementById('cameraId');
  const cameraNameInput = document.getElementById('cameraName');
  const cameraLatInput = document.getElementById('cameraLat');
  const cameraLngInput = document.getElementById('cameraLng');
  const cameraFeedInput = document.getElementById('cameraFeed');
  const cancelEditBtn = document.getElementById('cancelEdit');

  function renderCameraList() {
    const cameras = getCameras();
    cameraList.innerHTML = '';
    if (cameras.length === 0) {
      cameraList.innerHTML = '<p class="text-gray-500">No cameras added yet.</p>';
      return;
    }
    cameras.forEach((camera) => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center border-b border-gray-200 py-2';
      div.innerHTML = `
        <div>
          <p class="font-semibold">${camera.name}</p>
          <p class="text-sm text-gray-600">Lat: ${camera.lat}, Lng: ${camera.lng}</p>
          <p class="text-sm text-gray-600 break-all">${camera.feed}</p>
        </div>
        <div class="space-x-2">
          <button class="edit-btn text-blue-600 hover:underline" data-id="${camera.id}">Edit</button>
          <button class="delete-btn text-red-600 hover:underline" data-id="${camera.id}">Delete</button>
        </div>
      `;
      cameraList.appendChild(div);
    });

    // Attach event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        editCamera(id);
      });
    });
    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteCamera(id);
      });
    });
  }

  function resetForm() {
    cameraIdInput.value = '';
    cameraNameInput.value = '';
    cameraLatInput.value = '';
    cameraLngInput.value = '';
    cameraFeedInput.value = '';
  }

  function editCamera(id) {
    const cameras = getCameras();
    const camera = cameras.find((c) => c.id === id);
    if (!camera) return;
    cameraIdInput.value = camera.id;
    cameraNameInput.value = camera.name;
    cameraLatInput.value = camera.lat;
    cameraLngInput.value = camera.lng;
    cameraFeedInput.value = camera.feed;
  }

  function deleteCamera(id) {
    let cameras = getCameras();
    cameras = cameras.filter((c) => c.id !== id);
    saveCameras(cameras);
    renderCameraList();
  }

  cameraForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = cameraIdInput.value;
    const name = cameraNameInput.value.trim();
    const lat = parseFloat(cameraLatInput.value);
    const lng = parseFloat(cameraLngInput.value);
    const feed = cameraFeedInput.value.trim();

    if (!name || isNaN(lat) || isNaN(lng) || !feed) {
      alert('Please fill in all fields correctly.');
      return;
    }

    let cameras = getCameras();

    if (id) {
      // Update existing
      cameras = cameras.map((c) =>
        c.id === id ? { id, name, lat, lng, feed } : c
      );
    } else {
      // Add new
      const newCamera = {
        id: Date.now().toString(),
        name,
        lat,
        lng,
        feed,
      };
      cameras.push(newCamera);
    }

    saveCameras(cameras);
    renderCameraList();
    resetForm();
  });

  cancelEditBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetForm();
  });

  renderCameraList();
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('map')) {
    initPublicPage();
  }
  if (document.getElementById('cameraForm')) {
    initAdminPage();
  }
});
