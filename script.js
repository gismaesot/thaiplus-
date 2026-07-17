/* ==========================================================
   ThaiSave Calculator - Plus PWA Edition
   Version 1.6 (PWA Active Edition)
========================================================== */

// ==========================================================
// 🚀 1. เปิดระบบลงทะเบียน Service Worker เพื่อให้กดติดตั้งแอปได้
// ==========================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered successfully!', reg))
            .catch(err => console.log('Service Worker registration failed.', err));
    });
}

// ==========================================================
// 💸 2. ระบบคำนวณวงเงินคงเหลือ (60%) และเงินที่ผู้ใช้ต้องเติม (40%)
// ==========================================================
const govInput = document.getElementById("govRemain");
const coPayValue = document.getElementById("coPayValue");
const totalBudget = document.getElementById("totalBudget");
const inputGroup = document.querySelector(".input-group");

if (govInput) {
    // ดึงเอฟเฟกต์แสงไฟเมื่อมีการคลิกที่ช่องกรอกเงิน
    govInput.addEventListener("focus", () => {
        inputGroup.classList.add("active-money");
    });

    govInput.addEventListener("blur", () => {
        inputGroup.classList.remove("active-money");
    });

    // ฟังก์ชันคำนวณยอดเงินสะสมเรียลไทม์
    govInput.addEventListener("input", function() {
        const govMoney = parseFloat(this.value) || 0;
        
        if (govMoney <= 0) {
            coPayValue.textContent = "0.00";
            totalBudget.textContent = "0.00";
            return;
        }

        // สูตรคำนวณ:
        // เงินรัฐ 60% -> เงินเราเติม 40% คิดเป็น: (เงินรัฐ * 40) / 60
        const userMoney = (govMoney * 40) / 60;
        const total = govMoney + userMoney;

        // แสดงผลลัพธ์ทศนิยม 2 ตำแหน่ง พร้อมใส่คอมมาคั่นหลักพัน
        coPayValue.textContent = userMoney.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalBudget.textContent = total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });
}

// ==========================================================
// 🛍️ 3. ระบบคำนวณแยกสัดส่วนราคาสินค้ารายชิ้น (60/40)
// ==========================================================
const productPriceInput = document.getElementById("productPrice");
const priceResultBox = document.getElementById("priceResultBox");
const payGovValue = document.getElementById("payGovValue");
const payUserValue = document.getElementById("payUserValue");

if (productPriceInput) {
    productPriceInput.addEventListener("input", function() {
        const price = parseFloat(this.value) || 0;

        if (price <= 0) {
            // หากไม่มีการกรอกตัวเลข หรือยอดเงินเป็น 0 ให้ซ่อนกล่องผลลัพธ์สีฟ้า
            if (priceResultBox) {
                priceResultBox.classList.add("hidden");
            }
            return;
        }

        // สูตรคำนวณราคาสินค้า:
        // รัฐช่วยจ่าย 60% ของราคาสินค้า
        // เราต้องจ่ายเอง 40% ของราคาสินค้า
        const govShare = price * 0.60;
        const userShare = price * 0.40;

        // อัปเดตตัวเลขลงในกล่องผลลัพธ์
        if (payGovValue) {
            payGovValue.textContent = govShare.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (payUserValue) {
            payUserValue.textContent = userShare.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // แสดงกล่องผลลัพธ์สีฟ้าขึ้นมาแบบมีอนิเมชันจางเข้า
        if (priceResultBox) {
            priceResultBox.classList.remove("hidden");
        }
    });
}