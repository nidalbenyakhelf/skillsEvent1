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
// 2. عداد المشاركين الحقيقي
// ==========================================
async function updateRegisteredCount() {
    const counterEl = document.getElementById('registeredCount');
    if (!counterEl) return;
    
    try {
        const snapshot = await db.collection('participants')
            .where('status', '==', 'registered')
            .get();
        
        const count = snapshot.size;
        let current = 0;
        const increment = Math.ceil(count / 30) || 1;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= count) {
                current = count;
                clearInterval(timer);
            }
            counterEl.textContent = current;
        }, 30);
    } catch (error) {
        console.error("Error fetching count:", error);
        counterEl.textContent = "0";
    }
}

// ==========================================
// 3. التهيئة عند تحميل الصفحة
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateRegisteredCount();
});