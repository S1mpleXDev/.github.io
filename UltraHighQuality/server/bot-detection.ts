import type { Request } from "express";

/**
 * Military-grade bot detection system
 * Analyzes request fingerprints to block unauthorized access
 */
export class BotDetector {
  /**
   * Analyze request and determine if it should be blocked
   * Returns true if the request should be blocked
   */
  static shouldBlock(req: Request): boolean {
    const userAgent = (req.get("User-Agent") || "").toLowerCase();
    const accept = (req.get("Accept") || "").toLowerCase();
    const referer = req.get("Referer") || "";
    const secFetchDest = req.get("Sec-Fetch-Dest") || "";
    const secFetchMode = req.get("Sec-Fetch-Mode") || "";
    const secFetchSite = req.get("Sec-Fetch-Site") || "";

    // Browser patterns (Chrome, Firefox, Safari, Edge, etc.)
    const browserPatterns = /mozilla|chrome|safari|firefox|edge|opera|msie|trident/i;
    
    // Command-line tools and debugging tools
    const toolPatterns = /curl|wget|python|requests|postman|insomnia|httpie|axios|go-http|java|okhttp|perl|ruby/i;
    
    // Legitimate Roblox game requests
    const robloxPattern = /roblox/i;
    
    // Check 1: Block if it's a browser (but not Roblox)
    const isBrowser = browserPatterns.test(userAgent) && !robloxPattern.test(userAgent);
    
    // Check 2: Block common HTTP tools
    const isTool = toolPatterns.test(userAgent);
    
    // Check 3: Block if Accept header contains HTML (indicates browser navigation)
    const wantsHTML = accept.includes("text/html");
    
    // Check 4: Block if there's a Referer (indicates navigation from another page)
    const hasReferer = referer.length > 0;
    
    // Check 5: Block if Sec-Fetch-Dest indicates document navigation
    const isDocumentRequest = secFetchDest === "document";
    
    // Check 6: Block if Sec-Fetch-Mode indicates navigation
    const isNavigate = secFetchMode === "navigate";
    
    // Check 7: Block if no User-Agent (suspicious)
    const noUserAgent = userAgent.length === 0;
    
    // Additional security: Check for common scraper/bot user agents
    const botPatterns = /bot|crawler|spider|scraper|headless|phantom|selenium/i;
    const isBot = botPatterns.test(userAgent);

    // Allow if it matches Roblox pattern
    if (robloxPattern.test(userAgent)) {
      return false;
    }

    // Block if any suspicious indicators
    if (
      isBrowser ||
      isTool ||
      wantsHTML ||
      hasReferer ||
      isDocumentRequest ||
      isNavigate ||
      noUserAgent ||
      isBot
    ) {
      return true;
    }

    return false;
  }

  /**
   * Generate blocked response HTML
   */
  static getBlockedResponse(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SOF - Access Denied</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, hsl(222, 47%, 9%) 0%, hsl(222, 47%, 11%) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: hsl(210, 40%, 98%);
            padding: 20px;
          }
          .container {
            max-width: 600px;
            text-align: center;
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .badge {
            display: inline-block;
            background: rgba(239, 68, 68, 0.15);
            border: 2px solid hsl(0, 84%, 60%);
            color: hsl(0, 84%, 70%);
            padding: 12px 28px;
            border-radius: 30px;
            font-weight: 600;
            margin-bottom: 48px;
            font-size: 14px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, hsl(217, 91%, 60%), hsl(271, 76%, 53%));
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .shield {
            width: 40px;
            height: 40px;
            fill: white;
          }
          h1 {
            font-size: 64px;
            margin-bottom: 12px;
            background: linear-gradient(135deg, hsl(217, 91%, 60%), hsl(271, 76%, 53%));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
          }
          .divider {
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, hsl(217, 91%, 60%), hsl(271, 76%, 53%));
            margin: 20px auto;
            border-radius: 2px;
          }
          h2 {
            font-size: 24px;
            margin-bottom: 60px;
            color: hsl(215, 20%, 65%);
            font-weight: 500;
          }
          .message-box {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.15);
            border-radius: 16px;
            padding: 48px;
            backdrop-filter: blur(10px);
          }
          .message-box p {
            font-size: 16px;
            line-height: 1.6;
            color: hsl(215, 20%, 65%);
          }
          .features {
            margin-top: 32px;
            display: grid;
            gap: 16px;
            text-align: left;
          }
          .feature {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            color: hsl(215, 20%, 65%);
          }
          .check {
            width: 20px;
            height: 20px;
            background: hsl(142, 76%, 45%);
            border-radius: 50%;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">Access Denied</div>
          <div class="logo">
            <svg class="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1>SOF</h1>
          <div class="divider"></div>
          <h2>Safety of Obfuscation</h2>
          <div class="message-box">
            <p><strong>This script is protected by military-grade security.</strong></p>
            <p style="margin-top: 16px;">Direct browser access is not permitted. This content is only accessible through authorized Roblox game execution.</p>
            <div class="features">
              <div class="feature">
                <div class="check">✓</div>
                <span>Advanced bot detection active</span>
              </div>
              <div class="feature">
                <div class="check">✓</div>
                <span>Request fingerprinting enabled</span>
              </div>
              <div class="feature">
                <div class="check">✓</div>
                <span>Unauthorized access blocked</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
