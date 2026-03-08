# Dr. Mitambo TZ - AI Heavy Machinery Assistant

Dr. Mitambo TZ ni mfumo wa kisasa wa akili bandia (AI) ulioundwa mahususi kwa ajili ya mafundi wa mitambo mizito (Heavy Machinery) nchini Tanzania. Mfumo huu unasaidia katika utambuzi wa hitilafu (diagnosis), usimamizi wa meli ya mitambo (fleet management), na mafunzo ya kiufundi.

## Sifa kuu (Key Features)

*   **AI Diagnosis Engine:** Utambuzi wa hitilafu kwa kutumia maelezo ya maandishi au picha za mitambo.
*   **Live Audio Chat:** Mazungumzo ya sauti ya moja kwa moja na "Dr. Mitambo" (AI) kwa lugha ya Kiswahili cha kiufundi.
*   **Fleet Management:** Usimamizi wa mitambo, saa za kazi, na ratiba za matengenezo.
*   **Technical Search:** Utafutaji wa haraka wa nyaraka za kiufundi.
*   **Video Simulator:** Simulizi za video za utendaji wa mitambo.

## Teknolojia Zilizotumika (Tech Stack)

*   **Frontend:** React (TypeScript), Tailwind CSS, Vite.
*   **AI/LLM:** Google Gemini API (Flash & Pro models).
*   **Real-time Audio:** Gemini Live API.
*   **State Management:** React Hooks & LocalStorage.

## Usanidi wa Mfumo (Setup Instructions)

Ili kuendesha mfumo huu kwenye kompyuta yako (Local Development):

1.  **Clone repository:**
    ```bash
    git clone <repository-url>
    cd dr-mitambo-tz
    ```

2.  **Sakinisha dependencies:**
    ```bash
    npm install
    ```

3.  **Sanidi Environment Variables:**
    Unda faili la `.env` kwenye root ya mradi na uongeze API Key yako ya Gemini:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Anzisha server ya maendeleo:**
    ```bash
    npm run dev
    ```

## Deployment (Kupeleka kwenye Server)

Mfumo huu umejengwa kuwa tayari kwa deployment kwenye majukwaa kama Google Cloud Run au Vercel.

1.  **Build:**
    ```bash
    npm run build
    ```

2.  **Start:**
    Hakikisha script ya `start` kwenye `package.json` imewekwa vizuri:
    ```json
    "scripts": {
      "start": "node server.ts"
    }
    ```

## Mawasiliano na Msaada

Kwa msaada zaidi wa kiufundi, tafadhali wasiliana na timu ya maendeleo ya Dr. Mitambo TZ.

---
*Imejengwa kwa ajili ya ufanisi wa mafundi wa Tanzania.*
