export const DEVICON_COMMIT = "7330accdbc47e2dc0c19789a48533c4a3c50fe58";
export const DEVICON_PREFIX =
  `https://raw.githubusercontent.com/devicons/devicon/${DEVICON_COMMIT}/`;
export const DEVICON_PATHS = [
  "icons/typescript/typescript-original.svg",
  "icons/javascript/javascript-original.svg",
  "icons/rust/rust-original.svg",
  "icons/python/python-original.svg",
  "icons/sqlite/sqlite-original.svg",
  "icons/html5/html5-original.svg",
  "icons/css3/css3-original.svg",
  "icons/react/react-original.svg",
  "icons/vitejs/vitejs-original.svg",
  "icons/cloudflareworkers/cloudflareworkers-original.svg",
  "icons/cloudflare/cloudflare-original.svg",
  "icons/nodejs/nodejs-original.svg",
  "icons/tauri/tauri-original.svg",
];
export const DEVICON_URLS = DEVICON_PATHS.map((path) => `${DEVICON_PREFIX}${path}`);

export const PAGE_ORIGIN = "https://lcv-leo.lcv.dev";
export const PAGE_DOCUMENT_URL = `${PAGE_ORIGIN}/`;
export const PAGE_BRAND_LOGO_PATH = "assets/lcv-ideas-software-logo.svg";
export const BRAND_LOGO_URL = new URL(
  PAGE_BRAND_LOGO_PATH,
  PAGE_DOCUMENT_URL,
).href;
export const README_BRAND_LOGO_URL =
  "https://raw.githubusercontent.com/lcv-leo/lcv-leo/main/site/assets/lcv-ideas-software-logo.svg";

export const GIF_CATALOG_COMMIT = "278efd0acc149f89992349d4a5bd349b058aaf0e";
export const GIF_URLS = [
  "https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif",
  "https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif",
  "https://user-images.githubusercontent.com/74038190/212747903-e9bdf048-2dc8-41f9-b973-0e72ff07bfba.gif",
  "https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif",
  "https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif",
];

const SHIELDS_PATHS = [
  "github/followers/lcv-leo?label=Followers&style=flat-square&color=3B82F6",
  "github/stars/lcv-leo?label=Stars&style=flat-square&color=3B82F6",
  "badge/TipTap-000000?style=flat-square&logo=tiptap&logoColor=white",
  "badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white",
  "badge/DOMPurify-7952B3?style=flat-square",
  "badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white",
  "badge/D1-F38020?style=flat-square&logo=cloudflare&logoColor=white",
  "badge/Model_Context_Protocol-000000?style=for-the-badge&logo=anthropic&logoColor=white",
  "badge/Vertex_AI_(Gemini)-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white",
  "badge/Claude-D97757?style=for-the-badge&logo=anthropic&logoColor=white",
  "badge/GPT-412991?style=for-the-badge&logo=openai&logoColor=white",
  "badge/Grok-000000?style=for-the-badge&logo=x&logoColor=white",
  "badge/DeepSeek-4D6BFE?style=for-the-badge",
  "badge/Perplexity-1FB8CD?style=for-the-badge&logo=perplexity&logoColor=white",
  "badge/Mercado_Pago-00B1EA?style=for-the-badge&logo=mercadopago&logoColor=white",
  "badge/Stripe_(planned)-635BFF?style=for-the-badge&logo=stripe&logoColor=white",
  "badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white",
  "badge/Slack_Integrations-4A154B?style=for-the-badge&logo=slack&logoColor=white",
  "badge/Linear-5E6AD2?style=for-the-badge&logo=linear&logoColor=white",
  "badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white",
  "badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white",
  "badge/Biome-60A5FA?style=for-the-badge&logo=biome&logoColor=white",
  "badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white",
  "badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black",
  "badge/CodeQL-2088FF?style=for-the-badge&logo=github&logoColor=white",
  "badge/Zizmor-FF6B6B?style=for-the-badge",
  "badge/OpenSSF_Scorecard-2E7D32?style=for-the-badge&logo=openssf&logoColor=white",
  "badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white",
  "badge/Wrangler-F38020?style=for-the-badge&logo=cloudflare&logoColor=white",
  "badge/Dependabot-025E8C?style=for-the-badge&logo=dependabot&logoColor=white",
  "badge/SHA--pinned_Actions-181717?style=for-the-badge&logo=git&logoColor=white",
  "badge/npm_Publishing-CB3837?style=for-the-badge&logo=npm&logoColor=white",
  "badge/Status-Live_on_npm-brightgreen?style=flat-square",
  "badge/Status-Live_on_npm-brightgreen?style=flat-square",
  "badge/Status-Live-brightgreen?style=flat-square",
  "badge/Status-Live-brightgreen?style=flat-square",
  "badge/Status-Shipping-blue?style=flat-square",
  "badge/Status-Live_→_Stripe_planned-blue?style=flat-square",
  "badge/TypeScript_end--to--end-3178C6?style=flat-square&logo=typescript&logoColor=white",
  "badge/React_19_+_Vite-20232A?style=flat-square&logo=react&logoColor=61DAFB",
  "badge/Cloudflare_Workers_+_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white",
  "badge/Hono_on_the_edge-E36002?style=flat-square&logo=hono&logoColor=white",
  "badge/D1_+_migrations-F38020?style=flat-square&logo=sqlite&logoColor=white",
  "badge/MCP_servers_(stdio)-000000?style=flat-square&logo=anthropic&logoColor=white",
  "badge/Vertex_AI_SA_OAuth-4285F4?style=flat-square&logo=googlecloud&logoColor=white",
  "badge/Mercado_Pago_3DS-00B1EA?style=flat-square&logo=mercadopago&logoColor=white",
  "badge/HMAC_signed_webhooks-333333?style=flat-square&logo=letsencrypt&logoColor=white",
  "badge/Tauri_desktop-24C8DB?style=flat-square&logo=tauri&logoColor=white",
  "badge/Vitest_TDD-6E9F18?style=flat-square&logo=vitest&logoColor=white",
  "badge/Zod_validation-3E67B1?style=flat-square&logo=zod&logoColor=white",
  "badge/npm_publishing-CB3837?style=flat-square&logo=npm&logoColor=white",
  "badge/PWA_offline--first-5A0FC8?style=flat-square&logo=pwa&logoColor=white",
  "badge/Stripe_migration-635BFF?style=flat-square&logo=stripe&logoColor=white",
  "badge/Gemini_explicit_caching-4285F4?style=flat-square&logo=googlecloud&logoColor=white",
  "badge/Android_(Play_Store)-3DDC84?style=flat-square&logo=android&logoColor=white",
  "badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white",
  "badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white",
  "badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white",
  "badge/www.lcv.dev-3B82F6?style=for-the-badge&logo=googlechrome&logoColor=white",
  "badge/LCV_Ideas_%26_Software-0A66C2?style=for-the-badge&logo=github&logoColor=white",
];

const README_OTHER_IMAGE_URLS = [
  README_BRAND_LOGO_URL,
  "https://readme-typing-svg.herokuapp.com?font=Poppins&weight=600&size=32&duration=3000&pause=1000&color=3B82F6&center=true&vCenter=true&width=820&lines=Hi+I'm+Leonardo+Cardozo+Vargas;Full-Stack+%26+Edge+Developer;TypeScript+%E2%80%A2+React+%E2%80%A2+Cloudflare;Rust+%E2%80%A2+Tauri+%E2%80%A2+MCP+Servers;Building+Real+Products+at+LCV+Ideas+%26+Software",
  "https://komarev.com/ghpvc/?username=lcv-leo&label=Profile%20Views&color=3B82F6&style=flat-square",
  "https://www.bestpractices.dev/projects/14239/badge",
  "https://streak-stats.demolab.com/?user=lcv-leo&theme=tokyonight&hide_border=true",
  "https://github-readme-activity-graph.vercel.app/graph?username=lcv-leo&theme=tokyo-night&hide_border=true&area=true&custom_title=Leonardo%27s%20Contribution%20Graph",
  "https://lcv-leo.lcv.dev/github-contribution-grid-snake-dark.svg",
  "https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/stats?username=lcv-leo&theme=tokyonight",
  "https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&text=Thanks%20for%20visiting!&fontSize=35&fontAlignY=70&animation=twinkling",
  "https://komarev.com/ghpvc/?username=lcv-leo&label=Profile%20Views&color=3B82F6&style=for-the-badge",
];

export const README_IMAGE_URLS = [
  ...DEVICON_URLS,
  ...GIF_URLS,
  ...SHIELDS_PATHS.map((path) => `https://img.shields.io/${path}`),
  ...README_OTHER_IMAGE_URLS,
];

export const PAGE_STYLESHEET_URLS = [
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap",
  "styles.css",
];
export const PAGE_IMAGE_URLS = [
  PAGE_BRAND_LOGO_PATH,
  PAGE_BRAND_LOGO_PATH,
  "/github-contribution-grid-snake-dark.svg",
  ...DEVICON_URLS,
  "https://streak-stats.demolab.com/?user=lcv-leo&theme=tokyonight&hide_border=true&background=1a1b26",
  "https://github-readme-activity-graph.vercel.app/graph?username=lcv-leo&theme=tokyo-night&hide_border=true&area=true&custom_title=Leonardo%27s%20Contribution%20Graph",
  "https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/stats?username=lcv-leo&theme=tokyonight",
];

const pageCspImageSources = [...new Set(PAGE_IMAGE_URLS.map((source) => {
  const url = new URL(source, PAGE_DOCUMENT_URL);
  return `${url.origin}${url.pathname}`;
}))].sort((left, right) => left.localeCompare(right, "en"));

export const PAGE_CONTENT_SECURITY_POLICY =
  `default-src 'none'; base-uri 'none'; connect-src https://api.github.com https://fonts.googleapis.com https://fonts.gstatic.com; font-src https://fonts.gstatic.com; form-action 'none'; img-src ${pageCspImageSources.join(" ")}; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`;
