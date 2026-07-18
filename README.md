# DRAPE

Hybrid mobile fashion app: capture your likeness (full body + face), build a wardrobe, and generate photorealistic outfit looks with Gemini when an API key is set.

## Run

```bash
npm install
cp .env.example .env
# add EXPO_PUBLIC_GEMINI_API_KEY to .env
npx expo start
```

## Flow

1. **Onboarding** — brand + start
2. **Likeness** — full body + face photos
3. **Wardrobe** — add clothing photos by category
4. **Compose** — select pieces + mood → generate
5. **Result** — save / share

Without an API key, capture and wardrobe still work; generate offers a collage preview fallback.
