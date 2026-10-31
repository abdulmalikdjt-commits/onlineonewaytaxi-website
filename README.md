# OnlineOneWayTaxi.com Website

## Run locally
1. Install Node.js (LTS).
2. Extract this ZIP.
3. Open a terminal in this folder.
4. Run `npm install`
5. Run `npm run dev`
6. Open the local URL shown by Vite.

## Deploy to Vercel
1. Upload this project to a GitHub repository.
2. In Vercel choose Add New -> Project and import that repository.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Deploy.

## Important before going live
- Admin demo password is `Taxi@2026`. Change it in `src/App.jsx` for a temporary demo. This frontend-only password is NOT secure.
- Admin settings are saved in the current browser only (localStorage). To securely manage prices from multiple devices, add a backend/database and real admin authentication before public launch.
- The petrol adjustment is a manual input and a preview/approval calculation; it does not fetch petrol prices automatically.
- The fare estimate uses the distance entered by the customer multiplied by the selected vehicle's rate. It is an estimate only, not a final quote. Verify the rate units and business policy before launch.
- Vehicle photos are sample external images. Replace with licensed photos of the actual vehicles before commercial use.
- The website does not collect online payments.
- WhatsApp number: +91 9600919526. Call number: +91 9600919525.
