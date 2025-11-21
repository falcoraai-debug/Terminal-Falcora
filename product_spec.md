# Terminal Cast - Product Specification

## 1. Product Overview
**Terminal Cast** is a "financial terminal" style Farcaster mini-app designed for crypto traders. It allows users to view real-time price charts, generate AI-powered market analysis, and instantly "cast" (publish) these insights as high-quality images to the Farcaster social network.

The app aesthetic is strictly "Dark Mode / Cyberpunk / Terminal," appealing to the crypto-native audience.

## 2. Core Features

### 2.1. Live Crypto Charting
*   **Data Source**: Fetches OHLC (Open, High, Low, Close) candlestick data from Binance (with automatic fallback to Binance US).
*   **Visualization**: Uses `lightweight-charts` to render interactive candlestick charts.
*   **Indicators**:
    *   **EMA 5**: Fast moving average (Purple).
    *   **EMA 25**: Medium moving average (Violet).
    *   **EMA 99**: Slow trend filter (Dark Blue).
*   **Interactivity**: Zoom, pan, and crosshair tooltips showing precise price values.

### 2.2. Pattern & Signal Detection
*   **Automated Analysis**: The app automatically scans the chart data for:
    *   **Trend Direction**: Bullish vs. Bearish based on price relative to EMA 99.
    *   **Crossovers**: Golden Cross / Death Cross (EMA 5 vs EMA 25).
    *   **Candlestick Patterns**: Simple detection for Hammer, Engulfing, etc.
*   **UI Feedback**: Displays detected signals as "Badges" (e.g., `BULLISH`, `GOLDEN CROSS`) below the chart.

### 2.3. AI Market Commentary
*   **Engine**: OpenAI `gpt-4o-mini`.
*   **Input**: Feeds the current price, symbol, timeframe, and detected technical signals to the AI.
*   **Output**: A single, witty, professional "terminal-style" sentence summarizing the market outlook (e.g., *"BTC is reclaiming the 99 EMA; leverage accordingly, anon."*).

### 2.4. One-Click Casting
*   **Snapshot Generation**: Instantly converts the current DOM state of the chart into a high-resolution PNG image.
*   **Image Hosting**: Uploads the snapshot to Vercel Blob storage.
*   **Farcaster Integration**:
    *   Constructs a cast with the AI caption and the chart image.
    *   Publishes directly to Farcaster using the Neynar API (Bot/App signer integration).

### 2.5. History Log
*   **Local Storage**: Saves the last 50 generated casts locally in the browser.
*   **Review**: Users can scroll through a "Transmission Log" to see their past analysis and casts.

## 3. Technical Architecture

### 3.1. Stack
*   **Framework**: Next.js 15 (App Router).
*   **Styling**: Tailwind CSS (Custom "Terminal" Theme).
*   **State Management**: React Hooks + LocalStorage.

### 3.2. Key Libraries
*   `lightweight-charts`: Financial charting.
*   `html-to-image`: DOM-to-PNG conversion.
*   `@vercel/blob`: Image storage.
*   `openai`: Intelligence layer.
*   `@neynar/nodejs-sdk`: Farcaster interaction.

### 3.3. API Routes
*   `GET /api/chart`: Proxy for Binance public APIs (handles CORS and region blocking).
*   `POST /api/ai`: Generates text analysis.
*   `POST /api/upload`: Handles image upload to Blob storage.
*   `POST /api/cast`: Publishes the final cast.

## 4. User Flow
1.  **Select**: User picks a pair (e.g., `ETHUSDT`) and interval (`1h`).
2.  **View**: Chart loads with indicators; signals appear automatically.
3.  **Action**: User clicks **"GENERATE & CAST SIGNAL"**.
4.  **Process**:
    *   App captures chart image.
    *   App requests AI analysis.
    *   App uploads image.
    *   App posts to Farcaster.
5.  **Result**: User sees "Success" status and the new entry in their History Log.

## 5. Future Roadmap (Level-2)
*   **User Auth**: Sign in with Farcaster (SIWF) to cast from the user's own account instead of the App Bot.
*   **More Indicators**: RSI, MACD, Bollinger Bands.
*   **Frame Actions**: Interactive frames allowing other users to "Remix" the chart directly from the feed.
