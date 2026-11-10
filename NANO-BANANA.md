# Test Nano Banana Edit in Lookrdy

You can first try one image in the [fal playground](https://fal.ai/models/fal-ai/nano-banana/edit). Use your own photo or a consenting test subject, and only use garment images you have permission to send to the provider.

## Connect the local app

1. Sign in to fal and [create an API key](https://fal.ai/dashboard/keys).
2. Open `.env.local` in the Lookrdy folder. Add or update:

   ```env
   IMAGE_PROVIDER=fal
   FAL_KEY=your_fal_key
   MOCK_AI=0
   ```

   The key stays server-side. Do not put it in `.env.local.example`, GitHub, chat, or a `NEXT_PUBLIC_*` variable. Fal does not need an OpenAI key to render outfits.
3. Stop the previous local Lookrdy server, then run `npm run dev -- --hostname 127.0.0.1 --port 3001` from the Lookrdy folder. Restart after every environment change.
4. Open [local health](http://127.0.0.1:3001/api/health). Expect `ai.engine: "fal"`, `ai.imageModel: "fal-ai/nano-banana/edit"`, `ai.apiKeyPresent: true` and `ai.previewMode: "on-demand"`. This checks configuration only; the first generated preview verifies the key and billing.
5. Open [Create](http://127.0.0.1:3001/create), upload a full-body test photo, pick an occasion, and submit from the budget step. Browse the shopping lists, then choose an outfit and click **Preview on me** to request one image. The photo stays in the tab until you request a preview. Check the image and the corresponding charge in fal before requesting more.

Fal is opt-in. With no provider setting, Lookrdy uses the original OpenAI configuration. `MOCK_AI=1` bypasses both providers. A missing fal key does not fall back to paid OpenAI. Finding outfits and viewing product lists do not spend image credits. Every deliberate preview request asks for one image and is not retried automatically.

Nano Banana is instructed to change only clothing and shoes and keep the face, pose and background. The preview is approximate and may still change details. Without authorized garment images and confirmed variants, it cannot show an exact product match. The server requests inline inputs and outputs and disables fal request-history payload storage. That setting is not a blanket zero-retention guarantee; review the [provider's retention terms](https://fal.ai/docs/documentation/model-apis/media-expiration) before enabling it for public users.
