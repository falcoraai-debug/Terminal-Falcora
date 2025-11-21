# Terminal Cast - Product Specification (v2.0)

## 1. Product Overview
**Terminal Cast** is a specialized Farcaster mini-app for crypto traders. It serves as a "cyberpunk financial terminal" that enables users to analyze real-time market data, generate AI-powered insights (or write their own), and instantly share actionable charts to Farcaster.

The app offers dual sharing modes: casting a static **Image** for permanence or sharing an interactive **Frame** for engagement.

## 2. Core Features

### 2.1. Advanced Crypto Charting
*   **Expanded Pairs**: Support for Top-20 crypto assets (BTC, ETH, SOL, DOGE, etc.) vs USDT.
*   **Multi-Timeframe**: Full support for `15m`, `1H`, `4H`, and `1D` intervals.
*   **Indicators**:
    *   **EMA 5**: Momentum/Trigger line.
    *   **EMA 25**: Trend confirmation line.
    *   **EMA 99**: Major trend baseline.
*   **Crosshair Tooltip**: Hovering over the chart displays real-time OHLC price and exact EMA values.
*   **Auto-Refresh**: Chart data and signals automatically update every 60 seconds.

### 2.2. Signal & Pattern Detection
*   **Trend Analysis**:
    *   **UPTREND**: Price > EMA 99.
    *   **DOWNTREND**: Price < EMA 99.
    *   **SIDEWAYS**: Price ranging within 0.2% of EMA 99.
*   **Momentum**: Golden Cross / Death Cross detection.
*   **Candlestick Patterns**: Hammer, Shooting Star, Engulfing (Bull/Bear), and Doji detection.

### 2.3. Flexible Captioning System
*   **AI Mode (Default)**: Uses OpenAI (`gpt-4o-mini`) to generate a witty, professional 1-sentence analysis based on chart data and signals.
*   **Manual Mode**: Users can toggle AI off to write their own custom analysis/caption before casting.

### 2.4. Dual Casting Modes
Users have two distinct ways to publish content:
1.  **Cast Image**:
    *   Captures a high-res PNG of the chart.
    *   Uploads to Vercel Blob.
    *   Casts the image directly to the Farcaster feed.
2.  **Share Frame**:
    *   Generates a Farcaster Frame URL (`/api/frames`).
    *   The Frame displays the chart image and includes interactive buttons:
        *   **"Regen AI"**: Links back to the app to generate new analysis.
        *   **"Refresh Chart"**: Links back to the app to view the latest data.

### 2.5. History & Recast
*   **Transmission Log**: Stores the last 50 actions locally.
*   **Recast Capability**: Users can instantly repost any historical chart (Image or Frame) with a single click from the history list.

## 3. Technical Architecture

### 3.1. Stack
*   **Framework**: Next.js 15 (App Router).
*   **Styling**: Tailwind CSS (Custom "Terminal" Theme).
*   **Chart Lib**: `lightweight-charts`.
*   **Storage**: Vercel Blob.
*   **AI**: OpenAI `gpt-4o-mini`.
*   **Farcaster**: `@neynar/nodejs-sdk` & `@neynar/react`.

### 3.2. API Routes
*   `GET /api/chart`: Proxies Binance API (Global/US fallback) for OHLC data.
*   `POST /api/ai`: Generates context-aware market commentary.
*   `POST /api/upload`: Handles binary image uploads.
*   `POST /api/cast`: Publishes casts via Neynar (Server-side signer).
*   `GET /api/frames`: Serves Open Graph (OG) metadata for Farcaster Frames.

## 4. User Experience (UX)
1.  **Configuration**: User selects Pair (e.g., SOLUSDT) and Timeframe (e.g., 4H).
2.  **Analysis**:
    *   Chart renders with auto-calculated EMAs.
    *   Signal badges (e.g., "GOLDEN CROSS") appear below the chart.
    *   User chooses between "Auto-Generate AI Caption" or typing manually.
3.  **Distribution**:
    *   **Button A**: "CAST IMAGE" → Static post.
    *   **Button B**: "SHARE FRAME" → Interactive Frame post.
4.  **Feedback**: Real-time status updates (Analyzing → Capturing → Uploading → Transmitting → Success).
5.  **Retention**: Action is saved to History, allowing for easy re-sharing.

## 5. Deployment
*   **Platform**: Vercel.
*   **Environment Variables**:
    *   `NEXT_PUBLIC_URL`: Production domain.
    *   `NEYNAR_API_KEY` & `NEYNAR_SIGNER_UUID`: Farcaster auth.
    *   `OPENAI_API_KEY`: AI generation.
    *   `BLOB_READ_WRITE_TOKEN`: Image storage.
