// ============================================================
// Builds the "new posts are ready" notification email from
// social-new.json (written by generate-social.mjs each run).
// Outputs: email.html (body) + email-subject.txt (subject line).
// The workflow sends it via Gmail SMTP after pushing, so the
// image URLs below resolve once Netlify deploys (~1 min).
// ============================================================
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://usamastersfh.com";
const NAVY = "#1b3668", NAVY_DEEP = "#0e1f42", RED = "#e31837", GOLD = "#ffb25a", CREAM = "#f7f5f0";
const TYPE_LABEL = { preview: "Game day", result: "Result", recap: "Daily recap", event: "Event" };

const posts = JSON.parse(readFileSync("social-new.json", "utf8"));
if (!posts.length) process.exit(0);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const subject = posts.length === 1
  ? `📸 Social post ready: ${posts[0].title}`
  : `📸 ${posts.length} social posts ready — ${posts.map((p) => TYPE_LABEL[p.type] || p.type).join(", ")}`;

const card = (p) => `
  <div style="background:#fff;border-radius:14px;box-shadow:0 4px 16px rgba(14,31,66,0.12);margin:0 0 22px;overflow:hidden;">
    <div style="padding:14px 18px 0;">
      <span style="display:inline-block;background:${p.type === "result" ? RED : NAVY};color:#fff;font-weight:800;font-size:11px;letter-spacing:1px;text-transform:uppercase;border-radius:6px;padding:4px 9px;">${esc(TYPE_LABEL[p.type] || p.type)}</span>
      <span style="color:#5c6478;font-size:13px;margin-left:8px;">${esc(p.date)}</span>
      <h2 style="font-size:18px;color:${NAVY};margin:10px 0 4px;">${esc(p.title)}</h2>
    </div>
    <div style="padding:10px 18px;white-space:nowrap;overflow-x:auto;">
      ${p.images.map((img) => `<img src="${SITE}/${img}" alt="slide" width="200" style="border-radius:8px;margin-right:8px;vertical-align:top;">`).join("")}
    </div>
    <div style="margin:0 18px 16px;background:${CREAM};border-radius:10px;padding:12px 14px;">
      <div style="font-size:11px;font-weight:800;color:${NAVY};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Caption — copy &amp; paste</div>
      <pre style="margin:0;font-family:inherit;font-size:13px;line-height:1.45;white-space:pre-wrap;">${esc(p.caption)}</pre>
    </div>
  </div>`;

const html = `
<div style="background:${CREAM};padding:24px 12px;font-family:-apple-system,'Segoe UI',Arial,sans-serif;color:#101a30;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="background:${NAVY_DEEP};border-radius:14px;padding:20px 22px;margin-bottom:22px;">
      <div style="color:${GOLD};font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">USA Masters × WC2026</div>
      <h1 style="color:#fff;font-size:24px;margin:6px 0 0;">New post${posts.length === 1 ? "" : "s"} ready to share 🇺🇸</h1>
    </div>
    ${posts.map(card).join("")}
    <div style="text-align:center;margin:26px 0;">
      <a href="${SITE}/social" style="background:${RED};color:#fff;font-weight:800;text-decoration:none;border-radius:999px;padding:13px 26px;display:inline-block;">Open the Social Kit →</a>
      <div style="color:#5c6478;font-size:12px;margin-top:10px;">Open on your phone → Share slides → Instagram. The caption copies automatically.</div>
    </div>
  </div>
</div>`;

writeFileSync("email.html", html);
writeFileSync("email-subject.txt", subject + "\n");
console.log(`Email built: ${subject}`);
