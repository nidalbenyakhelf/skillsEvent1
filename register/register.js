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
// 2. تحميل الورشات من Firebase (ديناميكي)
// ==========================================
let allWorkshops = { day1: [], day2: [], day3: [], day4: [] };
const dayNames = { day1: 'الأحد 20/09', day2: 'الإثنين 21/09', day3: 'الثلاثاء 22/09', day4: 'الأربعاء 23/09' };

async function loadWorkshopsFromFirebase() {
    try {
        const snapshot = await db.collection('workshops').orderBy('day').orderBy('order').get();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (allWorkshops[data.day]) {
                allWorkshops[data.day].push({ id: doc.id, ...data });
            }
        });
        console.log('✅ تم تحميل الورشات:', allWorkshops);
    } catch (error) {
        console.error('خطأ في تحميل الورشات:', error);
        // استخدام بيانات افتراضية عند الفشل
        loadDefaultWorkshops();
    }
}

function loadDefaultWorkshops() {
    allWorkshops = {
        day1: [
            { id: 'w1_1', title: 'ورشة التسويق', time: '13:00 - 15:00', type: 'onsite', icon: 'fa-bullhorn', speaker: 'سيد أحمد بن عدة' },
            { id: 'w1_2', title: 'التواصل الفعال', time: '15:30 - 17:30', type: 'onsite', icon: 'fa-comments', speaker: 'سيد أحمد بن عدة' }
        ],
        day2: [
            { id: 'w2_1', title: 'التخطيط الاستراتيجي', time: '13:00 - 15:00', type: 'onsite', icon: 'fa-chess', speaker: 'محمد وعراب' },
            { id: 'w2_2', title: 'الذكاء الاصطناعي', time: '15:00 - 17:00', type: 'online', icon: 'fa-robot', speaker: 'الأستاذ طيبي', meetLink: 'https://meet.google.com/xxx' }
        ],
        day3: [
            { id: 'w3_1', title: 'اكتشاف الشغف', time: '13:00 - 15:00', type: 'onsite', icon: 'fa-plane', speaker: 'الأستاذة فلة' }
        ],
        day4: [
            { id: 'w4_1', title: 'الورشة الختامية', time: '13:00 - 15:00', type: 'onsite', icon: 'fa-award', speaker: 'فريق التنظيم' }
        ]
    };
}

// ==========================================
// 3. منطق التنقل بين الخطوات
// ==========================================
const steps = document.querySelectorAll(".step");
const nextButtons = document.querySelectorAll(".nextBtn:not([type='submit'])");
const prevButtons = document.querySelectorAll(".prevBtn");
const registerForm = document.getElementById("registerForm");
const progressBar = document.querySelector(".subProgress");
const currentStepNum = document.getElementById("currentStepNum");
const stepTitle = document.getElementById("stepTitle");

const stepData = [
    { title: "البيانات الأساسية" },
    { title: "ورشات اليوم الأول" },
    { title: "ورشات اليوم الثاني" },
    { title: "ورشات اليوم الثالث" },
    { title: "ورشات اليوم الرابع" },
    { title: "التعهد والتوقعات" }
];

let currentStep = 0;
let selectedWorkshops = { day1: [], day2: [], day3: [], day4: [] };

function showStep(index) {
    steps.forEach(s => s.classList.remove("active"));
    steps[index]?.classList.add("active");
    const totalSteps = steps.length;
    if (currentStepNum) currentStepNum.textContent = index + 1;
    if (stepTitle && stepData[index]) stepTitle.textContent = stepData[index].title;
    const progressPercent = ((index + 1) / totalSteps) * 100;
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// 4. التحقق من صحة كل خطوة
// ==========================================
function validateStep(stepIndex) {
    const currentStepElement = steps[stepIndex];
    if (!currentStepElement) return true;
    let valid = true;
    
    if (stepIndex === 0) {
        const fullName = document.getElementById("fullName");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        
        if (!fullName.value.trim()) {
            fullName.classList.add("input-error");
            fullName.parentElement.querySelector(".error-msg").style.display = "block";
            valid = false;
        } else {
            fullName.classList.remove("input-error");
            fullName.parentElement.querySelector(".error-msg").style.display = "none";
        }
        
        if (!email.value.trim() || !email.checkValidity()) {
            email.classList.add("input-error");
            email.parentElement.querySelector(".error-msg").style.display = "block";
            valid = false;
        } else {
            email.classList.remove("input-error");
            email.parentElement.querySelector(".error-msg").style.display = "none";
        }
        
        if (!phone.value.trim() || !phone.checkValidity()) {
            phone.classList.add("input-error");
            phone.parentElement.querySelector(".error-msg").style.display = "block";
            valid = false;
        } else {
            phone.classList.remove("input-error");
            phone.parentElement.querySelector(".error-msg").style.display = "none";
        }
    }
    
    if (stepIndex === 5) {
        const expectations = document.getElementById("expectations");
        const commitment = document.getElementById("commitment");
        const agree = document.getElementById("agree");
        
        if (!expectations.value.trim() || expectations.value.trim().length < 10) {
            expectations.classList.add("input-error");
            expectations.parentElement.querySelector(".error-msg").style.display = "block";
            valid = false;
        } else {
            expectations.classList.remove("input-error");
            expectations.parentElement.querySelector(".error-msg").style.display = "none";
        }
        
        if (!commitment.checked || !agree.checked) {
            alert("يرجى الموافقة على جميع الشروط والتعهدات");
            valid = false;
        }
    }
    
    return valid;
}

nextButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        }
    });
});

prevButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });
});

// ==========================================
// 5. تحميل وعرض الورشات
// ==========================================
function loadWorkshopsForDay(dayKey) {
    const container = document.getElementById(`${dayKey}Workshops`);
    if (!container) return;
    
    const workshops = allWorkshops[dayKey] || [];
    container.innerHTML = '';
    
    if (workshops.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 2em;">لا توجد ورشات متاحة لهذا اليوم حالياً</p>';
        return;
    }
    
    workshops.forEach(workshop => {
        const card = createWorkshopCard(workshop, dayKey);
        container.appendChild(card);
    });
}

function createWorkshopCard(workshop, dayKey) {
    const card = document.createElement('div');
    card.className = 'workshop-card';
    card.dataset.workshopId = workshop.id;
    
    const isSelected = selectedWorkshops[dayKey].includes(workshop.id);
    if (isSelected) card.classList.add('selected');
    
    const typeLabel = workshop.type === 'onsite' ? 'حضوري' : 'أونلاين';
    const typeIcon = workshop.type === 'onsite' ? 'fa-location-dot' : 'fa-video';
    
    let speakerHTML = workshop.speaker ? `<div class="workshop-speaker"><i class="fa-solid fa-user-tie"></i> ${workshop.speaker}</div>` : '';
    
    let meetBadge = '';
    if (workshop.type === 'online' && workshop.meetLink) {
        meetBadge = `<div class="meet-link-badge"><i class="fa-brands fa-google"></i> رابط Google Meet متاح</div>`;
    }
    
    card.innerHTML = `
        <input type="checkbox" name="${dayKey}_${workshop.id}" value="${workshop.id}" ${isSelected ? 'checked' : ''}>
        <div class="workshop-icon"><i class="fa-solid ${workshop.icon || 'fa-chalkboard-user'}"></i></div>
        <div class="workshop-info">
            <h3>${workshop.title}</h3>
            <div class="workshop-meta">
                <span class="workshop-time"><i class="fa-regular fa-clock"></i> ${workshop.time}</span>
                <span class="workshop-type"><i class="fa-solid ${typeIcon}"></i> ${typeLabel}</span>
            </div>
            ${speakerHTML}
            ${meetBadge}
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        const input = card.querySelector('input');
        input.checked = !input.checked;
        
        if (input.checked) {
            card.classList.add('selected');
            if (!selectedWorkshops[dayKey].includes(workshop.id)) {
                selectedWorkshops[dayKey].push(workshop.id);
            }
        } else {
            card.classList.remove('selected');
            selectedWorkshops[dayKey] = selectedWorkshops[dayKey].filter(id => id !== workshop.id);
        }
    });
    
    return card;
}

// ==========================================
// 6. توليد رقم تسلسلي
// ==========================================
async function generateSerialNumber() {
    const snapshot = await db.collection('participants').get();
    return String(snapshot.size + 1);
}

// ==========================================
// 7. إرسال بريد التأكيد (باستخدام mailto)
// ==========================================
function sendConfirmationEmail(participantData, serialNumber) {
    const onlineWorkshops = [];
    
    for (const [dayKey, workshopIds] of Object.entries(participantData.workshops)) {
        if (!workshopIds || workshopIds.length === 0) continue;
        const dayWorkshops = allWorkshops[dayKey] || [];
        workshopIds.forEach(workshopId => {
            const workshop = dayWorkshops.find(w => w.id === workshopId);
            if (workshop && workshop.type === 'online' && workshop.meetLink) {
                onlineWorkshops.push({
                    day: dayNames[dayKey],
                    title: workshop.title,
                    time: workshop.time,
                    link: workshop.meetLink
                });
            }
        });
    }
    
    if (onlineWorkshops.length === 0) return;
    
    let emailBody = `مرحباً ${participantData.fullName}،\n\n`;
    emailBody += `تم تسجيلك بنجاح في ملتقى المهارات الناعمة!\n`;
    emailBody += `رقمك التسلسلي: ${serialNumber}\n\n`;
    emailBody += `═══════════════════════════════\n`;
    emailBody += `📹 روابط الورشات الأونلاين:\n`;
    emailBody += `═══════════════════════════════\n\n`;
    
    onlineWorkshops.forEach((w, index) => {
        emailBody += `${index + 1}. ${w.day} - ${w.title}\n`;
        emailBody += `   ⏰ الوقت: ${w.time}\n`;
        emailBody += `   🔗 الرابط: ${w.link}\n\n`;
    });
    
    emailBody += `═══════════════════════════════\n`;
    emailBody += `⚠️ ملاحظات مهمة:\n`;
    emailBody += `• احفظ هذه الرسالة للرجوع إليها لاحقاً\n`;
    emailBody += `• انضم للورشة قبل 5 دقائق من بدايتها\n`;
    emailBody += `• في حال تغيير الرابط، سنرسل لك إشعاراً فورياً\n`;
    emailBody += `═══════════════════════════════\n\n`;
    emailBody += `مع أطيب التحيات،\nفريق ملتقى المهارات الناعمة - Skills-Craft`;
    
    const emailText = encodeURIComponent(emailBody);
    const subject = encodeURIComponent(`تأكيد التسجيل - ملتقى المهارات الناعمة (رقمك: ${serialNumber})`);
    const mailtoLink = `mailto:${participantData.email}?subject=${subject}&body=${emailText}`;
    
    // فتح تطبيق البريد
    window.open(mailtoLink, '_blank');
    
    // حفظ نسخة في Firebase لإرسالها لاحقاً إذا لزم الأمر
    saveEmailToFirebase(participantData, serialNumber, onlineWorkshops, emailBody);
}

async function saveEmailToFirebase(participantData, serialNumber, onlineWorkshops, emailBody) {
    try {
        await db.collection('emails').add({
            to: participantData.email,
            subject: `تأكيد التسجيل - ملتقى المهارات الناعمة (رقمك: ${serialNumber})`,
            body: emailBody,
            participantId: participantData.id,
            serialNumber: serialNumber,
            workshops: onlineWorkshops,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving email:', error);
    }
}

// ==========================================
// 8. إرسال النموذج
// ==========================================
registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري التسجيل... <i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const phone = document.getElementById("phone").value.trim();
        const expectations = document.getElementById("expectations").value.trim();
        
        // التحقق من عدم التكرار
        const existingUserQuery = await db.collection("participants")
            .where("email", "==", email)
            .limit(1)
            .get();
        
        if (!existingUserQuery.empty) {
            alert("عذراً، هذا البريد الإلكتروني مسجل لدينا بالفعل.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        const serialNumber = await generateSerialNumber();
        
        const participantData = {
            fullName,
            email,
            phone,
            expectations,
            workshops: selectedWorkshops,
            serialNumber,
            status: 'registered',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const docRef = await db.collection("participants").add(participantData);
        participantData.id = docRef.id;
        
        // إرسال بريد التأكيد
        sendConfirmationEmail(participantData, serialNumber);
        
        // عرض شاشة النجاح
        showSuccessScreen(fullName, serialNumber, selectedWorkshops);
        
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء التسجيل: " + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// ==========================================
// 9. عرض شاشة النجاح
// ==========================================
function showSuccessScreen(name, serialNumber, workshops) {
    registerForm.style.display = 'none';
    document.querySelector('.formHeader').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    
    const successScreen = document.getElementById('successScreen');
    successScreen.style.display = 'block';
    
    document.getElementById('cardName').textContent = name;
    document.getElementById('cardId').textContent = '#' + serialNumber;
    
    const scheduleContainer = document.getElementById('cardSchedule');
    scheduleContainer.innerHTML = '<h4 style="color: var(--accent); margin-bottom: 0.5em; font-size: 0.9rem;">جدولك الشخصي:</h4>';
    
    for (const [day, workshopIds] of Object.entries(workshops)) {
        if (workshopIds && workshopIds.length > 0) {
            workshopIds.forEach(workshopId => {
                const workshop = allWorkshops[day]?.find(w => w.id === workshopId);
                if (workshop) {
                    const item = document.createElement('div');
                    item.className = 'schedule-item';
                    item.innerHTML = `<span><strong>${dayNames[day]}:</strong> ${workshop.title}</span><span>${workshop.time}</span>`;
                    scheduleContainer.appendChild(item);
                }
            });
        }
    }
    
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: serialNumber,
        width: 128,
        height: 128,
        colorDark: "#1A1D23",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// 10. التهيئة
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadWorkshopsFromFirebase();
    showStep(0);
    loadWorkshopsForDay('day1');
    loadWorkshopsForDay('day2');
    loadWorkshopsForDay('day3');
    loadWorkshopsForDay('day4');
});