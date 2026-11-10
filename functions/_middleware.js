// Cloudflare Pages Function Middleware: Datacenter Headless Bot Interception for chanzong.space
// Known cloud datacenter ASNs generating automated headless scraping traffic without legitimate referer
const DATACENTER_BOT_ASNS = new Set([
  45102,  // Alibaba Cloud (Singapore / US)
  37963,  // Alibaba Cloud
  132203, // Tencent Cloud (Singapore)
  45090,  // Tencent Cloud
  14061,  // DigitalOcean
  20473,  // Vultr / Choopa
  16276,  // OVH
  24940,  // Hetzner
  9009,   // M247
]);

export async function onRequest(context) {
  const cfAsn = Number(context.request.cf && context.request.cf.asn ? context.request.cf.asn : 0);
  const referer = context.request.headers.get("referer") || "";
  const isSuspiciousDatacenterDirect = DATACENTER_BOT_ASNS.has(cfAsn) && !referer;

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  // Note: chanzong.space serves Chinese-language readers worldwide (including Mainland China, Taiwan, Hong Kong),
  // so we NEVER block or disable GA for CN visitors.
  if (isSuspiciousDatacenterDirect && contentType.includes("text/html") && typeof HTMLRewriter !== "undefined") {
    return new HTMLRewriter()
      .on("head", {
        element(el) {
          el.prepend(
            `<script>window['ga-disable-G-E33EPY0QV7']=true;</script>`,
            { html: true }
          );
        },
      })
      .transform(response);
  }

  return response;
}
