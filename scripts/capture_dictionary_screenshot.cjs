/**
 * scripts/capture_dictionary_screenshot.cjs
 * Starts a static HTTP server on dist/ and uses puppeteer to test the dictionary UI and take a screenshot.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DIST_DIR = path.resolve(__dirname, "../dist");
const SCREENSHOT_PATH = "C:\\Users\\ravir\\.gemini\\antigravity\\brain\\dac72d40-2456-4a15-997e-1e2c8de764c4\\dictionary_view_fixed.png";
const PORT = 4174;

function serveStatic(req, res) {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/" || !path.extname(reqPath)) {
    reqPath = "/index.html";
  }
  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".json": "application/json"
    };
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fallback to index.html for SPA routing
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(path.join(DIST_DIR, "index.html")).pipe(res);
  }
}

async function main() {
  const server = http.createServer(serveStatic);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Local preview server listening on http://localhost:${PORT}`);

  const tmpUserDataDir = path.join(__dirname, "../node_modules/.cache/puppeteer_tmp_" + Date.now());
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    userDataDir: tmpUserDataDir,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Ensure tour is marked complete before page loads
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("py_guide_tutorial_completed_v1", "true");
    });

    console.log("Navigating to local build...");
    await page.goto(`http://localhost:${PORT}/#/learn`, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2000));

    const domInfo = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button")).map(b => b.innerText.trim() + " (title:" + b.title + ")");
      const floatingTools = document.querySelector("#tour-floating-tools");
      return { btns, hasFloatingTools: !!floatingTools };
    });
    console.log("DOM Info on /#/learn:", domInfo);
    await page.keyboard.down("Control");
    await page.keyboard.press("k");
    await page.keyboard.up("Control");
    await new Promise(r => setTimeout(r, 1000));

    const modalExists = await page.$("#tour-floating-dictionary-window");
    console.log("Dictionary window open:", !!modalExists);

    if (modalExists) {
      console.log("Searching for 'Algorithm'...");
      // Click Algorithm chip
      const clicked = await page.evaluate(() => {
        const chips = Array.from(document.querySelectorAll(".word-meaning-chip, button"));
        const algoChip = chips.find(c => c.innerText.trim().toLowerCase() === "algorithm");
        if (algoChip) {
          algoChip.click();
          return true;
        }
        return false;
      });
      console.log("Clicked Algorithm chip:", clicked);

      if (!clicked) {
        // Fallback to typing in input
        const input = await page.$(".word-meaning-input");
        if (input) {
          await input.type("Algorithm");
          const searchBtn = await page.$("button[type='submit']");
          if (searchBtn) await searchBtn.click();
        }
      }

      await new Promise(r => setTimeout(r, 1500));

      // Get dimensions of dictionary window and definition card
      const metrics = await page.evaluate(() => {
        const win = document.querySelector("#tour-floating-dictionary-window");
        const card = document.querySelector(".word-meaning-card");
        const resultsArea = win ? win.querySelector(".flex-1") : null;
        return {
          windowHeight: win ? win.offsetHeight : 0,
          windowWidth: win ? win.offsetWidth : 0,
          resultsAreaHeight: resultsArea ? resultsArea.offsetHeight : 0,
          cardHeight: card ? card.offsetHeight : 0,
          textSnippet: resultsArea ? resultsArea.innerText.slice(0, 300) : "None"
        };
      });
      console.log("Visual Layout Metrics:", metrics);

      // Screenshot the dictionary window
      const winEl = await page.$("#tour-floating-dictionary-window");
      if (winEl) {
        await winEl.screenshot({ path: SCREENSHOT_PATH });
        console.log(`Saved screenshot to: ${SCREENSHOT_PATH}`);
      }
    }
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
    server.close();
    console.log("Server closed.");
  }
}

main();
