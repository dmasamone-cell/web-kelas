import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, collection, addDoc, deleteDoc, query, orderBy, onSnapshot, setDoc, updateDoc, arrayUnion, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAn5wWXD25t5VmJhGlcqSi7AgNGfRExkmo",
  authDomain: "billy-90047.firebaseapp.com",
  projectId: "billy-90047",
  storageBucket: "billy-90047.firebasestorage.app",
  messagingSenderId: "923982691334",
  appId: "1:923982691334:web:e6d9db25c4671b0d85d787",
  measurementId: "G-YYD9RFELFZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let activeUnsub = null;
let activeId = null;
const GIPHY_API_KEY = "5LH1haWcbeynWswBCKF02uErlR0xMZWf";

// MENFESS REALTIME
const menfessCollection = collection(db, "menfess");
const menfessForm = document.getElementById('menfess-form');
const menfessContainer = document.getElementById('menfess-container');

if (menfessForm) {
  menfessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fromVal = document.getElementById('menfess-from').value.trim() || 'Anonim';
    const toVal = document.getElementById('menfess-to').value.trim();
    const textVal = document.getElementById('menfess-text').value.trim();

    if (!toVal || !textVal) return;

    const btnSubmit = document.getElementById('btn-send-menfess');
    btnSubmit.innerText = '⏳ Mengirim...';
    btnSubmit.disabled = true;

    try {
      await addDoc(menfessCollection, {
        from: fromVal,
        to: toVal,
        text: textVal,
        createdAt: serverTimestamp()
      });
      menfessForm.reset();
    } catch (err) {
      alert("Gagal mengirim menfess. Coba lagi.");
    } finally {
      btnSubmit.innerText = '🚀 Kirim Menfess Anonim';
      btnSubmit.disabled = false;
    }
  });
}

const qMenfess = query(menfessCollection, orderBy("createdAt", "desc"));
onSnapshot(qMenfess, (snapshot) => {
  if (snapshot.empty) {
    menfessContainer.innerHTML = '<p class="text-xs text-stone-400 italic col-span-2 text-center py-4">Belum ada menfess terkirim. Jadi yang pertama mengirim!</p>';
    return;
  }

  menfessContainer.innerHTML = '';
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    menfessContainer.innerHTML += `
      <div class="bg-[#efe9dd]/60 dark:bg-[#262522]/60 backdrop-blur-xl p-4 rounded-2xl border border-stone-300/60 dark:border-stone-700/60 shadow-sm relative flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-2">
            <span class="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">Untuk: ${escapeHtml(data.to)}</span>
            <button onclick="deleteMenfess('${id}')" class="text-stone-400 hover:text-red-500 transition text-xs" title="Hapus (Khusus Admin)">🗑️</button>
          </div>
          <p class="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-medium my-2">"${escapeHtml(data.text)}"</p>
        </div>
        <div class="border-t border-stone-300/40 dark:border-stone-700/40 pt-2 mt-2 flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400 italic">
          <span>Dari: ${escapeHtml(data.from)}</span>
          <span>💌 Menfess X TJKT 4</span>
        </div>
      </div>
    `;
  });
});

window.deleteMenfess = async (id) => {
  const ADMIN_PIN = "2212";
  const inputPin = prompt("Masukkan PIN Admin untuk menghapus menfess ini:");
  if (inputPin !== ADMIN_PIN) {
    if (inputPin !== null) alert("PIN Salah! Akses ditolak.");
    return;
  }

  if (confirm("Yakin ingin menghapus menfess ini?")) {
    try {
      await deleteDoc(doc(db, "menfess", id));
    } catch (err) {
      alert("Gagal menghapus pesan.");
    }
  }
};

// GIF GIPHY
window.toggleStickerPicker = () => {
  const picker = document.getElementById('sticker-picker');
  picker.classList.toggle('hidden');
  if (!picker.classList.contains('hidden')) {
    const query = document.getElementById('gif-search-input').value.trim();
    searchGifs(query || 'funny');
  }
};

window.searchGifs = async (customQuery) => {
  const input = document.getElementById('gif-search-input');
  const query = customQuery || input.value.trim() || 'funny';
  const resultsContainer = document.getElementById('gif-results');
  resultsContainer.innerHTML = '<p class="col-span-4 text-center text-xs text-stone-400 py-4">Mencari GIF...</p>';

  try {
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=12&rating=g`);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      resultsContainer.innerHTML = '';
      data.data.forEach(gif => {
        const gifUrl = gif.images.fixed_height.url;
        const imgEl = document.createElement('img');
        imgEl.src = gifUrl;
        imgEl.referrerPolicy = 'no-referrer';
        imgEl.className = 'w-full h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition border border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-800';
        imgEl.onclick = () => window.sendSticker(gifUrl);
        resultsContainer.appendChild(imgEl);
      });
    } else {
      resultsContainer.innerHTML = '<p class="col-span-4 text-center text-xs text-stone-400 py-4">GIF tidak ditemukan.</p>';
    }
  } catch (error) {
    resultsContainer.innerHTML = '<p class="col-span-4 text-center text-xs text-red-400 py-4">Gagal memuat GIF.</p>';
  }
};

const btnSearchGif = document.getElementById('btn-search-gif');
if (btnSearchGif) btnSearchGif.addEventListener('click', () => searchGifs());

const inputSearchGif = document.getElementById('gif-search-input');
if (inputSearchGif) {
  inputSearchGif.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchGifs();
    }
  });
}

// MODAL DETAIL & REALTIME COMMENTS
window.openDetailModal = (id, imgSrc, title, subtitle = '') => {
  activeId = id;
  
  if (id === 'walikelas') {
    subtitle = 'Wali Kelas X TJKT 4 • 💻 Lead Developer • 🐯 Manusia Unggul';
  }

  document.getElementById('modal-img').src = imgSrc;
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-subtitle').innerText = subtitle;
  document.getElementById('image-modal').classList.remove('hidden');
  document.getElementById('sticker-picker').classList.add('hidden');

  const photoRef = doc(db, "photos", id);
  if (activeUnsub) activeUnsub();

  activeUnsub = onSnapshot(photoRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById('modal-like-count').innerText = data.likes || 0;
      const comments = data.comments || [];
      document.getElementById('modal-comment-count').innerText = comments.length;

      const container = document.getElementById('modal-comments-container');
      if (comments.length === 0) {
        container.innerHTML = '<p class="text-stone-400 italic">Belum ada komentar...</p>';
      } else {
        container.innerHTML = '';
        comments.forEach(c => {
          const isMedia = c.type === 'gif' || (c.text && c.text.startsWith('http'));
          const textContent = isMedia 
            ? `<img src="${escapeHtml(c.text)}" referrerpolicy="no-referrer" class="max-w-[200px] max-h-40 object-cover rounded-xl mt-1 border border-stone-300/80 dark:border-stone-700 bg-stone-200 dark:bg-stone-800">`
            : `<span class="text-stone-600 dark:text-stone-400 block mt-0.5">${escapeHtml(c.text)}</span>`;

          const userNameLower = (c.user || '').toLowerCase();
          const isDev = userNameLower.includes('billy') || userNameLower.includes('developer') || userNameLower.includes('mulyana') || userNameLower.includes('dev') || userNameLower.includes('wali kelas');
          
          const devBadge = isDev 
            ? `<span class="bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[9px] px-2 py-0.5 rounded-full border border-sky-500/20 inline-flex items-center gap-0.5 uppercase tracking-wider">💻 DEVELOPER</span>`
            : '';

          container.innerHTML += `
            <div class="bg-[#f7f3eb]/80 dark:bg-[#181715]/80 backdrop-blur-sm p-2.5 rounded-xl border border-stone-300/40 dark:border-stone-700/40">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-stone-900 dark:text-stone-200">${escapeHtml(c.user)}</span>
                ${devBadge}
              </div>
              ${textContent}
            </div>`;
        });
        container.scrollTop = container.scrollHeight;
      }
    } else {
      setDoc(photoRef, { likes: 0, comments: [] });
    }
  });
};

window.closeModal = () => {
  document.getElementById('image-modal').classList.add('hidden');
  document.getElementById('sticker-picker').classList.add('hidden');
  if (activeUnsub) {
    activeUnsub();
    activeUnsub = null;
  }
  activeId = null;
};

window.sendSticker = async (gifUrl) => {
  if (!activeId) return;

  let userName = localStorage.getItem('class_user_name');
  if (!userName) {
    userName = prompt("Masukkan nama kamu untuk berkomentar:", "Teman X TJKT 4");
    if (!userName) userName = "Anonim";
    localStorage.setItem('class_user_name', userName);
  }

  const photoRef = doc(db, "photos", activeId);
  try {
    await updateDoc(photoRef, {
      comments: arrayUnion({ user: userName, text: gifUrl, type: 'gif' })
    });
  } catch (err) {
    await setDoc(photoRef, {
      likes: 0,
      comments: [{ user: userName, text: gifUrl, type: 'gif' }]
    }, { merge: true });
  }

  document.getElementById('sticker-picker').classList.add('hidden');
};

window.resetPhotoData = async () => {
  if (!activeId) return;

  const ADMIN_PIN = "2212";
  const inputPin = prompt("Masukkan PIN Admin untuk mereset Like & Komentar:");

  if (inputPin !== ADMIN_PIN) {
    if (inputPin !== null) alert("PIN salah! Akses ditolak.");
    return;
  }

  const konfirmasi = confirm(`Yakin ingin mereset data untuk foto ini?`);
  if (!konfirmasi) return;

  const photoRef = doc(db, "photos", activeId);
  try {
    await updateDoc(photoRef, { likes: 0, comments: [] });
    alert("Data Like dan Komentar berhasil direset ke 0!");
  } catch (err) {
    await setDoc(photoRef, { likes: 0, comments: [] }, { merge: true });
    alert("Data Like dan Komentar berhasil direset ke 0!");
  }
};

const btnLike = document.getElementById('modal-like-btn');
if (btnLike) {
  btnLike.addEventListener('click', async () => {
    if (!activeId) return;
    const photoRef = doc(db, "photos", activeId);
    try {
      await updateDoc(photoRef, { likes: increment(1) });
    } catch (err) {
      await setDoc(photoRef, { likes: 1, comments: [] }, { merge: true });
    }
  });
}

const formComment = document.getElementById('modal-comment-form');
if (formComment) {
  formComment.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeId) return;

    const input = document.getElementById('modal-comment-input');
    const val = input.value.trim();
    if (!val) return;

    let userName = localStorage.getItem('class_user_name');
    if (!userName) {
      userName = prompt("Masukkan nama kamu untuk berkomentar:", "Teman X TJKT 4");
      if (!userName) userName = "Anonim";
      localStorage.setItem('class_user_name', userName);
    }

    const photoRef = doc(db, "photos", activeId);
    try {
      await updateDoc(photoRef, {
        comments: arrayUnion({ user: userName, text: val, type: 'text' })
      });
    } catch (err) {
      await setDoc(photoRef, {
        likes: 0,
        comments: [{ user: userName, text: val, type: 'text' }]
      }, { merge: true });
    }

    input.value = '';
  });
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}
