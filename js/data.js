<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
  import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "API_KEY_KAMU",
    authDomain: "AUTH_DOMAIN",
    databaseURL: "https://YOUR-DATABASE.firebaseio.com",
    projectId: "PROJECT_ID"
  };

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const dropdownToggle = document.getElementById("dropdownToggle");
  const deviceDropdown = document.getElementById("deviceDropdown");
  const deviceList = document.getElementById("deviceList");
  const deviceName = document.getElementById("deviceName");
  const batteryText = document.getElementById("batteryText");
  const availableCount = document.getElementById("availableCount");
  const uo2 = document.getElementById("uo2");

  // Buka/tutup dropdown
  dropdownToggle.addEventListener("click", () => {
    deviceDropdown.classList.toggle("hidden");
  });

  // Load data dari Firebase
  function userss() {
    const refData = ref(database, "/online/akubisa");
    onValue(refData, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const keys = Object.keys(data);
        let html = "";
        keys.forEach((k) => {
          const info = data[k].device;
          const model = info.phone || "Unknown";
          const battery = info.battery || "0%";
          const uid = info.id || k;

          html += `
            <div class="device-item" data-uid="${uid}" data-model="${model}" data-battery="${battery}">
              <img src="https://cdn-icons-png.flaticon.com/512/888/888857.png">
              <div>
                <p>${model}</p>
                <span class="status inuse">Battery: ${battery}</span>
              </div>
            </div>`;
        });

        deviceList.innerHTML = html;
        availableCount.textContent = `Available: ${keys.length}/3`;

        // Tambahkan event klik setiap item
        document.querySelectorAll(".device-item").forEach(item => {
          item.addEventListener("click", () => {
            const model = item.getAttribute("data-model");
            const battery = item.getAttribute("data-battery");
            const uid = item.getAttribute("data-uid");

            // Update header
            deviceName.textContent = model;
            batteryText.textContent = battery;
            deviceDropdown.classList.add("hidden");

            // Panggil fungsi untuk load data milik device itu
            setdev(uid);
          });
        });
      } else {
        deviceList.innerHTML = "<p>No online devices</p>";
        availableCount.textContent = "Available: 0/3";
      }
    });
  }

  userss();

  // Fungsi contoh untuk load data milik device terpilih
  function setdev(uid) {
    // Kosongkan halaman dulu
    uo2.innerHTML = "<p>Loading data untuk device: " + uid + " ...</p>";

    // Misal ambil data detail berdasarkan UID
    const refDetail = ref(database, "/devices/" + uid);
    onValue(refDetail, (snap) => {
      if (snap.exists()) {
        const detail = snap.val();
        uo2.innerHTML = JSON.stringify(detail, null, 2);
      } else {
        uo2.innerHTML = "<p>Tidak ada data untuk device ini.</p>";
      }
    });
  }
</script>