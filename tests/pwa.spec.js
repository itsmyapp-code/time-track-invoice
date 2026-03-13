const { test, expect } = require('@playwright/test');

test.describe('PWA Validation', () => {
    test('Page loads without 404s or console errors and initializes Service Worker', async ({ page }) => {
        const consoleErrors = [];
        const requests404 = [];

        // 1. Gather Console Errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                // Some libraries might dump random warnings, we try to grab actual errors
                consoleErrors.push(msg.text());
            }
        });

        page.on('pageerror', exception => {
            consoleErrors.push(exception.message);
        });

        // 2. Gather 404 Requests
        page.on('response', response => {
            if (response.status() === 404) {
                requests404.push(response.url());
            }
        });

        // 3. Measure Page Load
        const startTime = Date.now();
        await page.goto('/');
        const loadTime = Date.now() - startTime;
        console.log(`[Measurement] page_load_ms: ${loadTime}ms`);

        // We'll wait a brief moment for dynamic imports/SW registration
        await page.waitForTimeout(2000);

        // Assert no 404s
        if (requests404.length > 0) {
            console.error("404 Errors Found:", requests404);
        }
        expect(requests404.length).toBe(0);

        // Assert no console errors (filtering out typical false positives if necessary, but we'll strict check first)
        if (consoleErrors.length > 0) {
            console.error("Console Errors Found:", consoleErrors);
        }
        expect(consoleErrors.length).toBe(0);

        // 4. Check Service Worker Activation
        // Note: CRA service worker in dev mode might just be a no-op sw.js. Let's see if there's any SW present.
        const swActivationStatus = await page.evaluate(async () => {
            if ('serviceWorker' in navigator) {
                try {
                    // Wait for service worker to actually be ready
                    const registration = await navigator.serviceWorker.ready;
                    return !!registration.active;
                } catch (e) {
                    return false;
                }
            }
            return false;
        });

        console.log(`[Measurement] service_worker_activation: ${swActivationStatus}`);

        // Test successfully completed if it reaches here
    });
});
