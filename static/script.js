// Untuk deteksi upload gambar
document.getElementById('upload-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const input = document.getElementById('upload-input');
  const file = input.files[0];
  if (!file) return alert("Pilih gambar terlebih dahulu!");

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });

  const blob = await response.blob();
  const imgUrl = URL.createObjectURL(blob);
  document.getElementById('result').src = imgUrl;
});

// Untuk deteksi dari kamera
const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');

if (video && navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Tidak dapat mengakses kamera:", err);
      alert("Kamera tidak tersedia di perangkat ini.");
    });
}

captureBtn?.addEventListener('click', async () => {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async function (blob) {
    const formData = new FormData();
    formData.append('file', blob, 'capture.jpg');

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const resultBlob = await response.blob();
    const resultUrl = URL.createObjectURL(resultBlob);
    document.getElementById('camera-result').src = resultUrl;
  }, 'image/jpeg');
});
