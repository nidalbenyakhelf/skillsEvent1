// ==========================================
// 1. إعدادات Firebase
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDeBCouhoc-sHioDeV_cH84kp3uO1jklsM",
    authDomain: "skillsevent.firebaseapp.com",
    projectId: "skillsevent",
    storageBucket: "skillsevent.firebasestorage.app",
    messagingSenderId: "387686310660",
    appId: "1:387686310660:web:2c94319c41e4256b592651",
    measurementId: "G-ZRJ0EEM05Q"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ==========================================
// 2. تحميل الورشات من Firebase
// ==========================================
let workshopsData = { day1: [], day2: [], day3: [], day4: [] };
const dayNames = { day1: 'الأحد 20/09', day2: 'الإثنين 21/09', day3: 'الثلاثاء 22/09', day4: 'الأربعاء 23/09' };

async function loadWorkshopsFromFirebase() {
    try {
        const snapshot = await db.collection('workshops').orderBy('day').orderBy('order').get();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (workshopsData[data.day]) {
                workshopsData[data.day].push({ id: doc.id, ...data });
            }
        });
    } catch (error) {
        console.error('Error loading workshops:', error);
    }
}

// ==========================================
// 3. البحث الآمن (بريد + رقم تسلسلي)
// ==========================================
async function searchParticipant() {
    const email = document.getElementById('searchEmail').value.trim().toLowerCase();
    const serial = document.getElementById('searchSerial').value.trim();
    
    if (!email || !serial) {
        showError('يرجى إدخال البريد الإلكتروني والرقم التسلسلي معاً.');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('يرجى إدخال بريد إلكتروني صحيح.');
        return;
    }
    
    showLoading();
    hideError();
    document.getElementById('searchBtn').disabled = true;
    
    try {
        const snapshot = await db.collection('participants')
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            hideLoading();
            showError('لم يتم العثور على أي تسجيل بهذا البريد.');
            return;
        }
        
        const participantDoc = snapshot.docs[0];
        const participant = participantDoc.data();
        
        if (participant.serialNumber !== serial) {
            hideLoading();
            showError('الرقم التسلسلي غير مطابق للبريد الإلكتروني.');
            return;
        }
        
        displayParticipantPlan(participant, participantDoc.id);
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        showError('حدث خطأ أثناء الاتصال بقاعدة البيانات.');
    } finally {
        document.getElementById('searchBtn').disabled = false;
    }
}

// ==========================================
// 4. عرض خطة المشارك مع الروابط
// ==========================================
function displayParticipantPlan(participant, participantId) {
    hideLoading();
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('planContainer').style.display = 'block';
    
    document.getElementById('participantName').textContent = participant.fullName;
    document.getElementById('cardName').textContent = participant.fullName;
    document.getElementById('cardId').textContent = '#' + participant.serialNumber;
    document.getElementById('cardEmail').textContent = participant.email;
    document.getElementById('cardPhone').textContent = participant.phone;
    
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: participant.serialNumber,
        width: 128,
        height: 128,
        colorDark: "#1A1D23",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    displaySchedule(participant.workshops);
    displayExpectations(participant.expectations);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displaySchedule(workshops) {
    const scheduleContainer = document.getElementById('scheduleDays');
    scheduleContainer.innerHTML = '';
    let hasWorkshops = false;
    
    for (const [dayKey, workshopIds] of Object.entries(workshops)) {
        if (!workshopIds || workshopIds.length === 0) continue;
        hasWorkshops = true;
        
        const dayBlock = document.createElement('div');
        dayBlock.className = 'day-block';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-block-header';
        dayHeader.innerHTML = `<i class="fa-solid fa-calendar-day"></i><span>${dayNames[dayKey] || dayKey}</span>`;
        dayBlock.appendChild(dayHeader);
        
        workshopIds.forEach(workshopId => {
            const workshop = workshopsData[dayKey]?.find(w => w.id === workshopId);
            if (!workshop) return;
            
            const workshopItem = document.createElement('div');
            workshopItem.className = 'workshop-item';
            const typeLabel = workshop.type === 'onsite' ? 'حضوري' : 'أونلاين';
            
            let meetLinkButton = '';
            if (workshop.type === 'online' && workshop.meetLink) {
                meetLinkButton = `
                    <a href="${workshop.meetLink}" target="_blank" class="meet-link-btn" style="
                        display: inline-flex; align-items: center; gap: 0.4em;
                        padding: 0.4em 0.8em; background: var(--accent-light);
                        color: var(--accent); border-radius: 6px;
                        text-decoration: none; font-size: 0.8rem; font-weight: 600;
                        margin-top: 0.5em; transition: all 0.2s;
                    " onmouseover="this.style.background='var(--accent)'; this.style.color='white'" 
                       onmouseout="this.style.background='var(--accent-light)'; this.style.color='var(--accent)'">
                        <i class="fa-brands fa-google"></i>
                        انضم الآن للورشة
                    </a>
                `;
            }
            
            workshopItem.innerHTML = `
                <div class="workshop-item-title">
                    <i class="fa-solid fa-circle-check"></i>
                    <span>${workshop.title}</span>
                    <span class="workshop-item-type">${typeLabel}</span>
                </div>
                <div class="workshop-item-time">
                    <i class="fa-regular fa-clock"></i>
                    ${workshop.time}
                </div>
                ${workshop.speaker ? `<div style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-solid fa-user-tie"></i> ${workshop.speaker}</div>` : ''}
                ${meetLinkButton}
            `;
            dayBlock.appendChild(workshopItem);
        });
        scheduleContainer.appendChild(dayBlock);
    }
    
    if (!hasWorkshops) {
        scheduleContainer.innerHTML = '<div class="empty-schedule"><i class="fa-regular fa-calendar-xmark"></i><p>لم تقم باختيار أي ورشات</p></div>';
    }
}

function displayExpectations(expectations) {
    const expectationsBox = document.getElementById('expectationsBox');
    if (expectations && expectations.trim()) {
        expectationsBox.textContent = expectations;
    } else {
        expectationsBox.textContent = 'لم يتم إضافة توقعات';
    }
}

// ==========================================
// 5. دوال مساعدة
// ==========================================
function showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').style.display = 'flex';
    document.getElementById('searchHint').style.display = 'none';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('searchHint').style.display = 'flex';
}

function showLoading() {
    document.getElementById('searchContainer').style.display = 'none';
    document.getElementById('planContainer').style.display = 'none';
    document.getElementById('loadingScreen').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingScreen').style.display = 'none';
}

// ==========================================
// 6. مستمعي الأحداث
// ==========================================
document.getElementById('searchBtn').addEventListener('click', searchParticipant);
document.getElementById('searchSerial').addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchParticipant(); }});
document.getElementById('searchEmail').addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchParticipant(); }});
document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('planContainer').style.display = 'none';
    document.getElementById('searchContainer').style.display = 'block';
    document.getElementById('searchEmail').value = '';
    document.getElementById('searchSerial').value = '';
    hideError();
});

// ==========================================
// 7. التهيئة
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadWorkshopsFromFirebase();
    document.getElementById('searchEmail').focus();
});