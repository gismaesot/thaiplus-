/* ==========================================
   ThaiSave Calculator - Plus PWA Edition
   Version 1.4 (Fixed Update Edition)
========================================== */

// ==========================================================
// 💥 ระบบหักดิบทำลาย Service Worker ตัวเก่าที่ค้างและล็อกระบบ
// ==========================================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            // สั่งยกเลิกการลงทะเบียน Service Worker ทั้งหมดที่ค้างอยู่ในเครื่อง
            registration.unregister().then(function(boolean) {
                if(boolean) {
                    console.log('Old Service Worker unregistered successfully.');
                    
                    // ทำการล้างคลังแคชไฟล์ (Cache Storage) ทั้งหมดทิ้งทันที
                    caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                    }).then(function() {
                        // รีเฟรชหน้าจอตัวเองอัตโนมัติ 1 ครั้งเพื่อดึงโค้ดใหม่แกะกล่องจาก GitHub มาใช้
                        window.location.reload();
                    });
                }
            });
        }
    });
}

// ==========================================================
// ตัวแปรและฟังก์ชันแอปหลักเดิมของคุณ (ทำงานได้เต็มประสิทธิภาพแล้ว)
// ==========================================================
const govInput = document.getElementById("govRemain");
const userPay = document.getElementById("userPay");
const totalSpend = document.getElementById("totalSpend");
const inputGroup = document.getElementById("govRemain").closest('.input-group');
const splashScreen = document.getElementById("splashScreen");
const appContainer = document.getElementById("appContainer");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const productPriceInput = document.getElementById("productPrice");
const productInputGroup = document.getElementById("productInputGroup");
const priceResultBox = document.getElementById("priceResultBox");
const govShareVal = document.getElementById("govShareVal");
const userShareVal = document.getElementById("userShareVal");
const totalProductVal = document.getElementById("totalProductVal");

/* ---------- ระบบนับเปอร์เซ็นต์และเส้นวงกลมโหลดวิ่ง ---------- */
window.addEventListener("DOMContentLoaded", () => {
    const duration = 2000; 
    const intervalTime = 20; 
    let currentTime = 0;
    const strokeDasharray = 264; 

    const loadingInterval = setInterval(() => {
        currentTime += intervalTime;
        let percent = Math.floor((currentTime / duration) * 100);
        
        if (percent >= 100) {
            percent = 100;
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                splashScreen.classList.add("fade-out");
                appContainer.classList.remove("hidden-app");
                
                setTimeout(() => {
                    govInput.focus();
                }, 300);
            }, 100);
        }

        progressText.textContent = percent + "%";
        let offset = strokeDasharray - (strokeDasharray * percent) / 100;
        progressBar.style.strokeDashoffset = offset;

    }, intervalTime);
});

/* ---------- โหลดข้อมูลเดิม ---------- */
window.addEventListener("load", () => {
    const saved = localStorage.getItem("govRemain");
    if (saved) {
        const num = parseValue(saved);
        govInput.value = isNaN(num) || num === 0 ? "" : formatNumber(num);
        calculate();
    }
});

/* ---------- ฟอร์แมตตัวเลข ---------- */
function formatNumber(num) {
    return Number(num).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* ---------- แปลงข้อความเป็นตัวเลข ---------- */
function parseValue(value) {
    if (!value) return 0;
    return Number(value.toString().replace(/,/g, ""));
}

/* ---------- คำนวณกระเป๋าเงินหลัก ---------- */
function calculate() {
    let gov = parseValue(govInput.value);

    if (isNaN(gov) || gov < 0) {
        gov = 0;
    }

    if (gov > 0) {
        inputGroup.classList.add("active-money");
    } else {
        inputGroup.classList.remove("active-money");
    }

    const total = gov / 0.60;
    const user = total * 0.40;

    const formattedUser = formatNumber(user);
    const formattedTotal = formatNumber(total);

    if (userPay.textContent !== formattedUser) {
        userPay.textContent = formattedUser;
        triggerAnimation(userPay);
    }
    if (totalSpend.textContent !== formattedTotal) {
        totalSpend.textContent = formattedTotal;
        triggerAnimation(totalSpend);
    }

    if (gov > 0) {
        localStorage.setItem("govRemain", gov.toString());
    } else {
        localStorage.removeItem("govRemain");
    }
}

/* ---------- ฟังก์ชันกระตุ้นอนิเมชัน ---------- */
function triggerAnimation(element) {
    element.style.animation = 'none';
    element.offsetHeight; 
    element.style.animation = null;
}

/* ---------- พิมพ์แล้วคำนวณช่องแรก ---------- */
govInput.addEventListener("input", function () {
    let value = this.value;
    value = value.replace(/,/g, ""); 
    value = value.replace(/[^\d.]/g, "");

    const parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
    }

    this.value = value;
    calculate();
});

govInput.addEventListener("focus", function() {
    let num = parseValue(this.value);
    if (num === 0) {
        this.value = "";
    } else {
        this.value = num.toString();
    }
});

govInput.addEventListener("blur", function () {
    let num = parseValue(this.value);
    if (isNaN(num) || num === 0) {
        this.value = "";
    } else {
        this.value = formatNumber(num);
    }
    calculate();
});

govInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        this.blur();
    }
});

// ==========================================================
// ➕ ฟังก์ชันเสริมระบบใหม่: คำนวณสัดส่วนราคาสินค้า 60/40 เรียลไทม์
// ==========================================================
function calculateProductPrice() {
    let price = parseValue(productPriceInput.value);

    if (isNaN(price) || price <= 0) {
        productInputGroup.classList.remove("active-money");
        priceResultBox.classList.add("hidden");
        return;
    }

    productInputGroup.classList.add("active-money");
    priceResultBox.classList.remove("hidden");

    const govShare = price * 0.60;
    const userShare = price * 0.40;

    govShareVal.textContent = formatNumber(govShare);
    userShareVal.textContent = formatNumber(userShare);
    totalProductVal.textContent = formatNumber(price);
}

/* ---------- ดักเหตุการณ์กรอกช่องราคาสินค้า ---------- */
productPriceInput.addEventListener("input", function () {
    let value = this.value;
    value = value.replace(/,/g, ""); 
    value = value.replace(/[^\d.]/g, "");

    const parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
    }

    this.value = value;
    calculateProductPrice();
});

productPriceInput.addEventListener("focus", function() {
    let num = parseValue(this.value);
    if (num === 0) {
        this.value = "";
    } else {
        this.value = num.toString();
    }
});

productPriceInput.addEventListener("blur", function () {
    let num = parseValue(this.value);
    if (isNaN(num) || num === 0) {
        this.value = "";
    } else {
        this.value = formatNumber(num);
    }
    calculateProductPrice();
});

productPriceInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        this.blur();
    }
});

calculate();