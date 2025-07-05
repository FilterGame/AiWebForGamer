// 等待整個 HTML 文件載入完成後再執行
document.addEventListener('DOMContentLoaded', () => {

  // --- Helper Functions (從 page.tsx 移植過來) ---

  /**
   * 根據區域名稱返回對應的 Tailwind CSS 顏色 class
   * @param {string} area - 區域名稱 (例如 "A區")
   * @returns {string} - CSS class
   */
  function getAreaColor(area) {
    const colors = {
      "A區": "bg-red-100 text-red-800",
      "B區": "bg-blue-100 text-blue-800",
      "C區": "bg-green-100 text-green-800",
      "D區": "bg-yellow-100 text-yellow-800",
    };
    return colors[area] || "bg-gray-100 text-gray-800";
  }

  /**
   * 根據商品類型返回對應的 Tailwind CSS 顏色 class
   * @param {string} type - 商品類型 (例如 "二手商品")
   * @returns {string} - CSS class
   */
  function getProductTypeColor(type) {
    const colors = {
      "二手商品": "bg-orange-100 text-orange-800",
      "自創商品": "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  }
  
  /**
   * 解析 CSV 格式的純文字為物件陣列
   * @param {string} csvText - CSV 檔案的內容
   * @returns {object[]} - 攤位物件的陣列
   */
  function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return []; // 如果沒有資料行，返回空陣列
    const headers = lines[0].split(",").map(h => h.trim());
    
    return lines.slice(1).map((line) => {
      const values = line.split(",").map(v => v.trim());
      const booth = {};
      headers.forEach((header, index) => {
        booth[header] = values[index];
      });
      return booth;
    });
  }

  // --- Main Logic ---

  /**
   * 主函式：獲取並顯示攤位資料
   */
  async function displayBooths() {
    const boothGrid = document.getElementById('booth-grid');
    const noBoothsMessage = document.getElementById('no-booths-message');
    noBoothsMessage.classList.remove('hidden'); // 先顯示載入中訊息

    try {
      // 使用 fetch API 從瀏覽器端讀取 CSV 檔案
      // 這個檔案必須和 index.html 在同一個目錄，或使用相對路徑
      const response = await fetch('booths.csv');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      const booths = parseCSV(csvText);

      if (booths.length === 0) {
        // 如果沒有攤位資料，顯示提示訊息
        noBoothsMessage.querySelector('p:first-child').textContent = "目前沒有攤位資料";
        noBoothsMessage.querySelector('p:last-child').textContent = "請檢查 public/booths.csv 檔案";
        boothGrid.innerHTML = ''; // 清空網格
      } else {
        // 如果有資料，隱藏提示訊息並產生攤位卡片
        noBoothsMessage.classList.add('hidden');
        
        // 使用 map 產生每個攤位的 HTML 字串，再用 join 組合成一個大字串
        boothGrid.innerHTML = booths.map(booth => `
          <div class="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
            <div class="relative">
              <img
                src="${booth.攤位圖片 || '/placeholder.svg'}"
                alt="${booth.攤位名稱}"
                width="300"
                height="200"
                class="w-full h-48 object-cover"
              />
              <div class="absolute top-2 left-2 flex flex-wrap gap-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAreaColor(booth.區域)}">${booth.區域}</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProductTypeColor(booth.商品類型)}">${booth.商品類型}</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${booth.時間}</span>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-lg mb-2 text-gray-800">${booth.攤位名稱}</h3>
              <p class="text-gray-600 mb-3">${booth.攤主帳號}</p>
              <div class="flex items-center justify-between">
                <a 
                  href="${booth.攤位介紹連結}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  查看攤位介紹
                </a>
                <div class="text-lg font-bold text-orange-600">${booth.攤位編號}</div>
              </div>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error("Error fetching or parsing CSV file:", error);
      noBoothsMessage.querySelector('p:first-child').textContent = "讀取攤位資料時發生錯誤";
      noBoothsMessage.querySelector('p:last-child').textContent = "請檢查主控台以獲取更多資訊。";
      boothGrid.innerHTML = ''; // 清空網格
    }
  }

  // 執行主函式
  displayBooths();
});