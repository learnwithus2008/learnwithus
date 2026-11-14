/**
 * src/services/adScriptManager.js
 * Centralized singleton service for managing third-party advertising script lifecycles.
 *
 * Capabilities:
 * - Strict duplicate script prevention (singleton registry)
 * - Safe reference counting across React component mounts/unmounts
 * - Graceful ad-blocker error handling (prevents uncaught exceptions)
 * - Controlled DOM cleanup on unmount
 * - Full protection of React Virtual DOM and application state
 */

import { AD_SCRIPTS, isRouteAdRestricted } from "../config/adConfig";

class AdScriptManager {
  constructor() {
    this.injectedScripts = new Map(); // url -> { element, refCount, status: 'loading' | 'loaded' | 'error' }
    this.listeners = new Set();
  }

  /**
   * Check if a script is currently loaded and active in the DOM
   * @param {string} url
   * @returns {boolean}
   */
  isScriptActive(url) {
    const entry = this.injectedScripts.get(url);
    return Boolean(entry && entry.status === "loaded");
  }

  /**
   * Safely inject an advertising script with deduplication & ref-counting
   * @param {Object} options
   * @param {string} options.url
   * @param {boolean} [options.async=true]
   * @param {boolean} [options.dataCfasync=false]
   * @param {string} [options.scriptId]
   * @returns {Promise<boolean>} Resolves true when loaded, false if blocked/failed
   */
  loadScript({ url, async = true, dataCfasync = false, scriptId = null }) {
    if (typeof window === "undefined" || !url) {
      return Promise.resolve(false);
    }

    // 1. If script is already registered, increment reference count and return
    const existing = this.injectedScripts.get(url);
    if (existing) {
      existing.refCount += 1;
      if (existing.status === "loaded") {
        return Promise.resolve(true);
      }
      if (existing.status === "error") {
        return Promise.resolve(false);
      }
      // Currently loading, wait for resolution
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (existing.status !== "loading") {
            clearInterval(check);
            resolve(existing.status === "loaded");
          }
        }, 100);
      });
    }

    // 2. Also check if another copy exists in document by selector
    const selector = scriptId
      ? `script#${scriptId}`
      : `script[src="${url}"]`;
    const existingTag = document.querySelector(selector);
    if (existingTag) {
      this.injectedScripts.set(url, {
        element: existingTag,
        refCount: 1,
        status: "loaded"
      });
      return Promise.resolve(true);
    }

    // 3. Create fresh script tag
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      if (async) script.async = true;
      if (dataCfasync === false) {
        script.setAttribute("data-cfasync", "false");
      }
      if (scriptId) script.id = scriptId;

      const record = {
        element: script,
        refCount: 1,
        status: "loading"
      };
      this.injectedScripts.set(url, record);

      script.onload = () => {
        record.status = "loaded";
        resolve(true);
      };

      script.onerror = () => {
        // Typical when student uses uBlock Origin, Brave Shields, or AdGuard
        record.status = "error";
        console.warn(`[AdScriptManager] Ad script blocked or unreachable: ${url}`);
        resolve(false);
      };

      // Append safely to document.head or body
      try {
        (document.head || document.body).appendChild(script);
      } catch (err) {
        record.status = "error";
        console.warn(`[AdScriptManager] Could not append script: ${err.message}`);
        resolve(false);
      }
    });
  }

  /**
   * Decrement reference count and unload script if unused
   * @param {Object} options
   * @param {string} options.url
   * @param {boolean} [options.force=false]
   */
  unloadScript({ url, force = false }) {
    if (typeof window === "undefined" || !url) return;

    const existing = this.injectedScripts.get(url);
    if (!existing) return;

    existing.refCount -= 1;

    if (existing.refCount <= 0 || force) {
      if (existing.element && existing.element.parentNode) {
        try {
          existing.element.parentNode.removeChild(existing.element);
        } catch (_) {}
      }
      this.injectedScripts.delete(url);
    }
  }

  /**
   * Cleanup known ad network intrusive artifacts (e.g. transparent overlays or sticky social bars)
   */
  cleanIntrusiveArtifacts() {
    if (typeof document === "undefined") return;

    // Remove any popunder transparent click layers (transpLayerId / pu_click)
    const popunderLayers = document.querySelectorAll(
      '[id*="transpLayer"], [class*="transpLayer"], [id*="popunder"], [id*="pu_"]'
    );
    popunderLayers.forEach((el) => {
      try {
        el.remove();
      } catch (_) {}
    });

    // Remove any sticky social bar containers injected outside our controlled components
    const socialBarElements = document.querySelectorAll(
      '[id*="sbar_"], [class*="sbar_"], [class*="social-bar"], [id*="socialbar"]'
    );
    socialBarElements.forEach((el) => {
      try {
        el.remove();
      } catch (_) {}
    });
  }
}

// Export singleton instance
export const adScriptManager = new AdScriptManager();

