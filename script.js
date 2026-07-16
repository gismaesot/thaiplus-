/* ==========================================
   ThaiSave Calculator - Plus PWA Edition
   Version 1.4 (Circular Loading Splash Screen)
========================================== */

const govInput = document.getElementById("govRemain");
const userPay = document.getElementById("userPay");
const totalSpend = document.getElementById("totalSpend");
const inputGroup = document.getElementById("govRemain").closest('.input-group');
const splashScreen = document.getElementById("splashScreen");
const appContainer = document.getElementById("appContainer");

// อุปกรณ์อ้างอิงความก้าวหน้า Progress
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

// --- สมาชิกใหม่: ตัวแปรฟังก์ชันคำนวณสัดส่วนราคสินค้า 60/40 ---
const productPriceInput = document.getElementById("productPrice");
const productInputGroup = document.getElementById("productInputGroup");
const priceResultBox = document.getElementById("priceResultBox");
const govShareVal = document.getElementById("govShareVal");
const userShareVal = document.getElementById("userShareVal");
const totalProductVal = document.getElementById("totalProductVal");

/* ---------- 3. ระบบนับเปอร์เซ็นต์และเส้นวงกลมโหลดวิ่ง (2 วินาที) ---------- */
window.addEventListener("DOMContentLoaded", () => {
    const duration = 2000; // เวลาทั้งหมด 2000ms (2 วินาที)
    const intervalTime = 20; // อัปเดตทุกๆ 20ms เพื่อความลื่นไหล
    let currentTime = 0;
    
    // เส้นรอบวงของวงกลมใน CSS (264)
    const strokeDasharray = 264; 

    const loadingInterval = setInterval(() => {
        currentTime += intervalTime;
        
        // คำนวณความคืบหน้าเป็นสัดส่วนเปอร์เซ็นต์ (0 - 100)
        let percent = Math.floor((currentTime / duration) * 100);
        
        if (percent >= 100) {
            percent = 100;
            clearInterval(loadingInterval);
            
            // เมื่อโหลดครบ 100% สั่งเฟดปิดหน้า Splash และเปิดหน้าแอปหลัก
            setTimeout(() => {
                splashScreen.classList.add("fade-out");
                appContainer.classList.remove("hidden-app");
                
                // สั่ง Auto Focus ช่องเงินพร้อมใช้ทันที
                setTimeout(() => {
                    govInput.focus();
                }, 300);
            }, 100);
        }

        // 1. อัปเดตตัวเลข % บนหน้าจอ
        progressText.textContent = percent + "%";

        // 2. อัปเดตเส้นวิ่ง SVG ขยับวงกลม
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

    // สลับสีขอบเรืองแสงตามสถานะตัวเลข
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

/* ---------- ตอนกำลังพิมพ์ (Focus) ช่องแรก ---------- */
govInput.addEventListener("focus", function() {
    let num = parseValue(this.value);
    if (num === 0) {
        this.value = "";
    } else {
        this.value = num.toString();
    }
});

/* ---------- ออกจากช่อง (Blur) ช่องแรก ---------- */
govInput.addEventListener("blur", function () {
    let num = parseValue(this.value);
    if (isNaN(num) || num === 0) {
        this.value = "";
    } else {
        this.value = formatNumber(num);
    }
    calculate();
});

/* ---------- กด Enter ช่องแรก ---------- */
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

    // เปิดขอบเรืองแสงสีฟ้าเขียว และเปิดแสดงกล่องผลแยกส่วน
    productInputGroup.classList.add("active-money");
    priceResultBox.classList.remove("hidden");

    // คำนวณแยก 60% และ 40%
    const govShare = price * 0.60;
    const userShare = price * 0.40;

    // ใส่ข้อมูลแบบทศนิยม 2 ตำแหน่ง
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

// เรียกใช้งานฟังก์ชันเริ่มต้นตอนโหลดแอป
calculate();