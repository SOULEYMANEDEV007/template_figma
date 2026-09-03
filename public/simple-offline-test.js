// Simple offline test that works without React components
console.log("🧪 Simple Offline Test Loaded");

// Test 1: Check if we can create textbook entries using your form
async function testOfflineFormSubmission() {
    console.log("📝 Testing offline form submission...");

    try {
        // Check if we're on the create page
        const isCreatePage =
            window.location.pathname.includes("/textbooks/create");
        console.log("📍 On create page:", isCreatePage);

        if (isCreatePage) {
            // Look for form elements
            const titleInput = document.querySelector('input[name="title"]');
            const subjectSelect = document.querySelector(
                'select[name="subject"]'
            );
            const classSelect = document.querySelector(
                'select[name="class_id"]'
            );
            const contentEditor = document.querySelector(".ql-editor");
            const form = document.querySelector("form");

            if (titleInput && subjectSelect && classSelect && form) {
                console.log("✅ Form elements found");

                // Fill out the form
                titleInput.value = "Test Offline Entry " + Date.now();
                subjectSelect.value = "Mathématiques";
                classSelect.value = "1"; // Assuming class ID 1 exists

                // Trigger input events
                titleInput.dispatchEvent(new Event("input", { bubbles: true }));
                subjectSelect.dispatchEvent(
                    new Event("change", { bubbles: true })
                );
                classSelect.dispatchEvent(
                    new Event("change", { bubbles: true })
                );

                if (contentEditor) {
                    contentEditor.innerHTML =
                        "<p>This is a test entry created while offline</p>";
                    contentEditor.dispatchEvent(
                        new Event("input", { bubbles: true })
                    );
                }

                console.log("📝 Form filled with test data");
                console.log(
                    "💡 You can now manually click the submit button to test offline creation"
                );

                return {
                    success: true,
                    message: "Form ready for manual submission",
                };
            } else {
                console.log("❌ Form elements not found");
                return { success: false, error: "Form elements not found" };
            }
        } else {
            console.log(
                "⚠️ Not on create page, navigate to /dashboard/textbooks/create first"
            );
            return { success: false, error: "Not on create page" };
        }
    } catch (error) {
        console.error("❌ Form test failed:", error);
        return { success: false, error: error.message };
    }
}

// Test 2: Check IndexedDB directly
async function testIndexedDBDirect() {
    console.log("🗄️ Testing IndexedDB directly...");

    return new Promise(resolve => {
        const request = indexedDB.open("ClassroomOfflineDB", 1);

        request.onerror = function () {
            console.error("❌ IndexedDB not accessible");
            resolve({ success: false, error: "IndexedDB not accessible" });
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            console.log("✅ IndexedDB opened successfully");
            console.log(
                "📊 Available stores:",
                Array.from(db.objectStoreNames)
            );

            // Check existing entries
            try {
                const transaction = db.transaction(
                    ["textbookEntries"],
                    "readonly"
                );
                const store = transaction.objectStore("textbookEntries");
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = function () {
                    const entries = getAllRequest.result;
                    console.log(
                        "📚 Existing textbook entries:",
                        entries.length
                    );
                    entries.forEach((entry, index) => {
                        console.log(
                            `  ${index + 1}. ${entry.title} (${entry.syncStatus})`
                        );
                    });

                    resolve({
                        success: true,
                        totalEntries: entries.length,
                        entries: entries.map(e => ({
                            title: e.title,
                            syncStatus: e.syncStatus,
                        })),
                    });
                };

                getAllRequest.onerror = function () {
                    console.error("❌ Failed to read entries");
                    resolve({
                        success: false,
                        error: "Failed to read entries",
                    });
                };
            } catch (error) {
                console.error("❌ IndexedDB transaction failed:", error);
                resolve({ success: false, error: error.message });
            }
        };

        request.onupgradeneeded = function (event) {
            console.log("⚠️ IndexedDB schema not initialized yet");
            resolve({
                success: false,
                error: "IndexedDB schema not initialized",
            });
        };
    });
}

// Test 3: Check service worker and PWA
async function testPWAStatus() {
    console.log("🔧 Testing PWA status...");

    const status = {
        online: navigator.onLine,
        serviceWorker: "serviceWorker" in navigator,
        swRegistered: false,
        swActive: false,
        cacheInfo: null,
    };

    if (status.serviceWorker) {
        try {
            const registration = await navigator.serviceWorker.ready;
            status.swRegistered = true;
            status.swActive = registration.active
                ? registration.active.state
                : "none";

            // Check caches
            if ("caches" in window) {
                const cacheNames = await caches.keys();
                status.cacheInfo = cacheNames;
                console.log("💾 Available caches:", cacheNames);
            }
        } catch (error) {
            console.error("❌ Service worker check failed:", error);
        }
    }

    console.log("📊 PWA Status:", status);
    return status;
}

// Combined test function
async function runAllOfflineTests() {
    console.log("🧪 Running all offline tests...");

    const results = {
        pwa: await testPWAStatus(),
        indexedDB: await testIndexedDBDirect(),
        form: await testOfflineFormSubmission(),
    };

    console.log("📊 Test Results Summary:", results);
    return results;
}

// Expose functions globally
window.testOfflineFormSubmission = testOfflineFormSubmission;
window.testIndexedDBDirect = testIndexedDBDirect;
window.testPWAStatus = testPWAStatus;
window.runAllOfflineTests = runAllOfflineTests;

console.log(`
🧪 Simple Offline Test Commands Available:
- testOfflineFormSubmission() - Fill form with test data
- testIndexedDBDirect() - Check IndexedDB entries
- testPWAStatus() - Check PWA/Service Worker status
- runAllOfflineTests() - Run all tests

📍 Usage:
1. Go offline (Network tab > Offline checkbox)
2. Navigate to /dashboard/textbooks/create
3. Run: runAllOfflineTests()
`);
