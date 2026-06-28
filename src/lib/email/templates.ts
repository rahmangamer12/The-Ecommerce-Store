import { siteConfig, siteUrl } from "@/config/site";

// -------------------------------------------------------------
//  Ready-to-use transactional email templates (HTML).
//  Pair with src/lib/email/send.ts (Resend) to actually deliver.
// -------------------------------------------------------------

const shell = (title: string, body: string) => `
<!doctype html><html><body style="margin:0;background:#fbfaf8;font-family:Helvetica,Arial,sans-serif;color:#14120e">
  <div style="max-width:560px;margin:0 auto;padding:32px">
    <div style="font-size:22px;font-weight:700;letter-spacing:-0.5px">${siteConfig.name}</div>
    <div style="height:1px;background:#e8e3d8;margin:20px 0"></div>
    <h1 style="font-size:24px;margin:0 0 12px">${title}</h1>
    ${body}
    <div style="height:1px;background:#e8e3d8;margin:28px 0"></div>
    <p style="font-size:12px;color:#8a8378">
      ${siteConfig.legalName} · <a href="${siteUrl}" style="color:#b08a4f">${siteUrl.replace(/^https?:\/\//, "")}</a><br/>
      Need help? ${siteConfig.supportEmail}
    </p>
  </div>
</body></html>`;

export function welcomeEmail(name = "there") {
  return {
    subject: `Welcome to ${siteConfig.name} 🤍`,
    html: shell(
      `Welcome, ${name}!`,
      `<p style="font-size:15px;line-height:1.7;color:#46413a">
        Thank you for joining ${siteConfig.name}. As a welcome gift, here's
        <strong>10% off</strong> your first order with code <strong>WELCOME10</strong>.
      </p>
      <p style="margin-top:20px"><a href="${siteUrl}/shop" style="background:#14120e;color:#fbfaf8;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px">Start shopping</a></p>`,
    ),
  };
}

export function orderConfirmationEmail(orderNumber: string, total: string) {
  return {
    subject: `Your ${siteConfig.name} order ${orderNumber} is confirmed`,
    html: shell(
      "Order confirmed",
      `<p style="font-size:15px;line-height:1.7;color:#46413a">
        We've received your order <strong>${orderNumber}</strong> and are preparing it now.
        Order total: <strong>${total}</strong>.
      </p>
      <p style="margin-top:20px"><a href="${siteUrl}/account/orders" style="background:#b08a4f;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px">View order</a></p>`,
    ),
  };
}

export function shippingEmail(orderNumber: string, tracking = "#") {
  return {
    subject: `Your ${siteConfig.name} order ${orderNumber} has shipped 🚚`,
    html: shell(
      "On its way!",
      `<p style="font-size:15px;line-height:1.7;color:#46413a">
        Good news — order <strong>${orderNumber}</strong> is on its way to you.
      </p>
      <p style="margin-top:20px"><a href="${tracking}" style="background:#14120e;color:#fbfaf8;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px">Track package</a></p>`,
    ),
  };
}

export function abandonedCartEmail(name = "there") {
  return {
    subject: `You left something behind, ${name} 👀`,
    html: shell(
      "Still thinking it over?",
      `<p style="font-size:15px;line-height:1.7;color:#46413a">
        Your cart is waiting. Complete your order in the next 24 hours and enjoy
        free shipping with code <strong>FREESHIP</strong>.
      </p>
      <p style="margin-top:20px"><a href="${siteUrl}/cart" style="background:#b08a4f;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:14px">Return to cart</a></p>`,
    ),
  };
}
