# Mood Journal  

Pixel art defter tasarımı ile kişisel duygu günlüğü.  
Kullanıcıların yazdıkları günlükler sadece saklanmaz, aynı zamanda AI (Gemini) tarafından analiz edilerek duygular, etiketler, öneriler ve özetlerle desteklenir.  

**Not:** Tüm defter ve ikon tasarımları tarafımdan Pixel Studio kullanılarak çizilmiştir. Çizimlerime pinterestten ulaşabilirsiniz [Pixel-art](https://tr.pinterest.com/bilgekoosee/pixel-art/)  

---

## Demo  

[Demo Videosunu İzle](https://youtu.be/ZPaeU_NcxN0)

---

## Özellikler  

- Pixel art defter, tıklandığında açılan animasyonlu sayfa  
- Günlük yazma alanı, otomatik saklama ve temizleme özelliği  
- Mood Picker ile duyguların görselleştirilmesi  
- AI analizi (Gemini API üzerinden):  
  - Duyguyu özetleme  
  - -1 ile +1 arasında skor verme  
  - Etiketler üretme  
  - Öneriler sunma  
  - Kısa özet oluşturma  
- MongoDB Atlas üzerinde verilerin güvenle saklanması  
- Temizle butonu ile kolay sıfırlama  

---

# Mood Journal

A pixel-art themed personal mood journal.  
Users can write their daily entries, which are then analyzed by AI (Gemini API) to generate emotional summaries, sentiment scores, tags, suggestions, and short overviews.

> **Note:** All notebook and icon designs were created by me using Pixel Studio. You can find my illustrations on Pinterest [Pixel-art](https://tr.pinterest.com/bilgekoosee/pixel-art/)  .

---

## Demo

[Watch the Demo Video](https://youtu.be/ZPaeU_NcxN0)

---

## Features

- Animated pixel art notebook that opens on click  
- Journal writing area with autosave and clear functionality  
- Mood Picker to visualize emotions  
- AI-powered analysis via Gemini API:
  - Emotion summarization  
  - Sentiment scoring (between -1 and +1)  
  - Tag generation  
  - Suggestion generation  
  - Short summary creation  
- Secure data storage using MongoDB Atlas  
- "Clear" button for easy reset  

---

## Kurulum / Installation

### 1. Repo'yu klonla / Clone the repository

```bash
git clone https://github.com/bilgekosee/mood-journal.git
cd mood-journal


### 2. Sunucuyu Başlat / Start the Server
cd server
npm install

### .env dosyası oluşturun / Create a .env file:
PORT=5050
MONGODB_URI=<your MongoDB Atlas URI>
GEMINI_API_KEY=<your Gemini API key>


###  Uygulamayı başlat / Start the frontend
cd ..
npm install
npm run dev

