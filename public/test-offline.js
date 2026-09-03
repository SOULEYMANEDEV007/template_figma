// Simple test script to check offline functionality
// This file is for local testing only - not included in build
// Copy to public/ folder if you want it available in production

async function testOfflineTextbookCreation() {
    console.log("🧪 Testing offline textbook creation...");

    try {
        // Try to access syncManager from different sources
        let syncManager = null;

        // Method 1: Check if it's on window (after we expose it)
        if (typeof window !== "undefined" && window.syncManager) {
            syncManager = window.syncManager;
            console.log("✅ SyncManager found on window");
        }
        // Method 2: Try to import it directly (if modules are available)
        else if (typeof window !== "undefined" && window.__NEXT_DATA__) {
            try {
                // Try to access via React DevTools or global state
                const reactFiberKey = Object.keys(
                    document.querySelector("#__next")
                ).find(key => key.startsWith("__reactFiber"));
                if (reactFiberKey) {
                    console.log(
                        "🔍 Searching for syncManager in React components..."
                    );
                }
            } catch (e) {
                console.log("⚠️ React component search failed");
            }
        }
        // Method 3: Direct IndexedDB access as fallback
        else {
            console.log(
                "📦 SyncManager not found, testing IndexedDB directly..."
            );
            return await testIndexedDBDirectly();
        }

        if (syncManager) {
            // Test data
            const testData = {
                title: "Test Offline Entry " + Date.now(),
                content: "<p>This is a test entry created offline</p>",
                subject: "Mathématiques",
                class_id: 1,
                session_date: new Date().toISOString().split("T")[0],
                session_time: "10:00",
                description: "Test description",
            };

            console.log("📝 Creating textbook entry offline...", testData);

            // Create textbook entry
            const tempId = await syncManager.createTextbookEntry(testData);
            console.log("✅ Created with tempId:", tempId);

            // Check sync status
            const status = await syncManager.getSyncStatus();
            console.log("📊 Sync status:", status);

            return { success: true, tempId, status };
        } else {
            console.error(
                "❌ SyncManager not accessible, trying direct IndexedDB test"
            );
            return await testIndexedDBDirectly();
        }
    } catch (error) {
        console.error("❌ Test failed:", error);
        return { success: false, error: error.message };
    }
}

// Direct IndexedDB test as fallback
async function testIndexedDBDirectly() {
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

            // Try to create a test entry directly
            try {
                const transaction = db.transaction(
                    ["textbookEntries"],
                    "readwrite"
                );
                const store = transaction.objectStore("textbookEntries");

                const testEntry = {
                    tempId: `textbook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: "Direct IndexedDB Test " + Date.now(),
                    content: "<p>Created directly via IndexedDB</p>",
                    subject: "Test Subject",
                    classId: "1",
                    sessionDate: new Date().toISOString().split("T")[0],
                    sessionTime: "10:00",
                    createdAt: Date.now(),
                    lastModified: Date.now(),
                    isSynced: false,
                    isDeleted: false,
                    syncStatus: "pending",
                    retryCount: 0,
                    action: "create",
                };

                const addRequest = store.add(testEntry);

                addRequest.onsuccess = function () {
                    console.log(
                        "✅ Test entry created directly in IndexedDB:",
                        testEntry.tempId
                    );

                    // Check how many entries we have
                    const countRequest = store.count();
                    countRequest.onsuccess = function () {
                        console.log(
                            "📊 Total textbook entries in IndexedDB:",
                            countRequest.result
                        );
                        resolve({
                            success: true,
                            method: "direct-indexeddb",
                            tempId: testEntry.tempId,
                            totalEntries: countRequest.result,
                        });
                    };
                };

                addRequest.onerror = function () {
                    console.error("❌ Failed to create test entry");
                    resolve({
                        success: false,
                        error: "Failed to create IndexedDB entry",
                    });
                };
            } catch (error) {
                console.error("❌ IndexedDB transaction failed:", error);
                resolve({ success: false, error: error.message });
            }
        };

        request.onupgradeneeded = function (event) {
            console.log(
                "🔧 IndexedDB needs upgrade - this means the database schema is not set up"
            );
            resolve({
                success: false,
                error: "IndexedDB schema not initialized",
            });
        };
    });
}

// Instructions
console.log(`
🧪 Offline Test Instructions:
1. Disable your internet connection
2. Go to your textbooks page
3. Run: testOfflineTextbookCreation()
4. Check the console for results
5. Re-enable internet and check if it syncs
`);

// Export for browser console
window.testOfflineTextbookCreation = testOfflineTextbookCreation;
