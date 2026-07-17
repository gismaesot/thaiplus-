/* ==========================================================
   ThaiSave Calculator - Plus PWA Edition
   Version 1.7.0 (Fully Match HTML & Smooth Splash Screen)
========================================================== */

// ==========================================================
// 🚀 1. ระบบจัดการหน้าจอ Splash Screen (อนิเมชันเปิดแอป)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const splashScreen = document.getElementById("splashScreen");
    const appContainer = document.getElementById("appContainer");

    // ตรวจจับวงกลมดาวน์โหลดใน HTML
    let strokeDashoffset = 264; // ค่าเริ่มต้นของความกว้างขอบวงกลม (2 * PI * r)
    if (progressBar) {
        progressBar.style.strokeDashoffset = strokeDashoffset;
    }

    let progress = 0;
    const interval = setInterval(() => {
        progress += 5; // ขยับความเร็วในการโหลดทีละ 5%
        
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
        
        if (progressBar) {
            // คำนวณขอบสีเพื่อทำการวาดวงกลมตามเปอร์เซ็นต์
            const offset = 264 - (264 * progress) / 100;
            progressBar.style.strokeDashoffset = offset;
        }

        if (progress >= 100) {
            clearInterval(interval);
            
            // เมื่อโหลดเสร็จ 100% ให้จางหน้า Splash Screen ออก แล้วเปิดตัวแอป
            setTimeout(() => {
                if (splashScreen) {
                    splashScreen.style.opacity = "0";
                    splashScreen.style.transition = "opacity 0.5s ease";
                }
                setTimeout(() => {
                    if (splashScreen) splashScreen.style.display = "none";
                    if (appContainer) {
                        appContainer.classList.remove("hidden-app");
                        appContainer.style.opacity = "1";
                        appContainer.style.transition = "opacity 0.5s ease";
                    }
                }, 500);
            }, 300);
        }
    }, 40); // โหลดเสร็จสมบูรณ์ภายในประมาณ 1 วินาทีเศษ
});

// ==========================================================
// 💸 2. ระบบคำนวณวงเงินคงเหลือ (60%) และเงินที่ผู้ใช้ต้องเติม (40%)
// ==========================================================
const govInput = document.getElementById("govRemain");
const coPayValue = document.getElementById("userPay"); // แมตช์กับ ID ใน HTML
const totalBudget = document.getElementById("totalSpend"); // แมตช์กับ ID ใน HTML
const inputGroup = document.querySelector(".input-group");

if (govInput) {
    // เอฟเฟกต์แสงไฟเมื่อโฟกัสช่องกรอกเงิน
    govInput.addEventListener("focus", () => {
        if (inputGroup) {
            inputGroup.classList.add("active-money");
        }
    });

    govInput.addEventListener("blur", () => {
        if (inputGroup) {
            inputGroup.classList.remove("active-money");
        }
    });

    // ตรวจจับการพิมพ์และคำนวณยอดเงินสะสมเรียลไทม์
    govInput.addEventListener("input", function() {
        const govMoney = parseFloat(this.value) || 0;
        
        if (govMoney <= 0) {
            if (coPayValue) coPayValue.textContent = "0.00";
            if (totalBudget) totalBudget.textContent = "0.00";
            return;
        }

        // สูตรคำนวณ: รัฐช่วย 60% -> เราเติมเพิ่มอีก 40%
        const userMoney = (govMoney * 40) / 60;
        const total = govMoney + userMoney;

        // อัปเดตยอดเงินแบบปัดเศษทศนิยม 2 ตำแหน่ง
        if (coPayValue) {
            coPayValue.textContent = userMoney.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (totalBudget) {
            totalBudget.textContent = total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    });
}

// ==========================================================
// 🛍️ 3. ระบบคำนวณแยกสัดส่วนราคาสินค้ารายชิ้น (60/40)
// ==========================================================
const productPriceInput = document.getElementById("productPrice");
const priceResultBox = document.getElementById("priceResultBox");
const payGovValue = document.getElementById("govShareVal"); // แมตช์กับ ID ใน HTML
const payUserValue = document.getElementById("userShareVal"); // แมตช์กับ ID ใน HTML
const totalProductVal = document.getElementById("totalProductVal"); // ไอดีราคารวมสินค้าด้านล่างสุดของบล็อก

if (productPriceInput) {
    productPriceInput.addEventListener("input", function() {
        const price = parseFloat(this.value) || 0;

        if (price <= 0) {
            if (priceResultBox) {
                priceResultBox.classList.add("hidden");
            }
            return;
        }

        // คำนวณแยกยอดเงิน รัฐช่วย 60% และ เราออกเอง 40%
        const govShare = price * 0.60;
        const userShare = price * 0.40;

        // แสดงยอดเงินบนหน้าจอมือถืออย่างปลอดภัย
        if (payGovValue) {
            payGovValue.textContent = govShare.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (payUserValue) {
            payUserValue.textContent = userShare.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (totalProductVal) {
            totalProductVal.textContent = price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // เปิดแสดงหน้าต่างผลลัพธ์สีฟ้า
        if (priceResultBox) {
            priceResultBox.classList.remove("hidden");
        }
    });
}