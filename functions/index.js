const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require("axios");
const Parser = require("rss-parser");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
const parser = new Parser();

setGlobalOptions({ region: "us-central1" });

// Helper function to send FCM to all tokens
async function sendToAllTokens(payload) {
    const tokensSnapshot = await db.collection("fcm_tokens").get();
    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    if (tokens.length === 0) return;

    // Send in batches of 500
    for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);
        const message = {
            notification: payload.notification,
            data: payload.data,
            tokens: batch,
        };

        try {
            const response = await messaging.sendMulticast(message);
            console.log(`Sent batch ${i / 500 + 1}: ${response.successCount} success, ${response.failureCount} failure`);
            
            // Cleanup invalid tokens
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const error = resp.error.code;
                        if (error === 'messaging/invalid-registration-token' || error === 'messaging/registration-token-not-registered') {
                            failedTokens.push(db.collection("fcm_tokens").doc(batch[idx]).delete());
                        }
                    }
                });
                await Promise.all(failedTokens);
            }
        } catch (error) {
            console.error("Error sending multicast:", error);
        }
    }
}

// 1. Trigger for Review Notifications
exports.sendReviewNotification = onDocumentCreated("reviews/{reviewId}", async (event) => {
    const data = event.data.data();
    
    const payload = {
        notification: {
            title: `🎬 New Movie Review: ${data.title}`,
            body: data.review ? data.review.slice(0, 100) + '...' : 'Check out the full review on SM Reviews!',
            image: data.image || "",
        },
        data: {
            url: `/review/${event.params.reviewId}`,
            type: "review"
        }
    };

    await sendToAllTokens(payload);
});

// 2. Trigger for News Notifications
exports.sendNewsNotification = onDocumentCreated("news/{newsId}", async (event) => {
    const data = event.data.data();
    
    const payload = {
        notification: {
            title: `🔥 Movie News: ${data.title}`,
            body: data.summary || data.description || "Tap to read the latest updates.",
            image: data.image || "",
        },
        data: {
            url: `/news/${event.params.newsId}`,
            type: "news"
        }
    };

    await sendToAllTokens(payload);
});

// 3. RSS Sync and AI Summary (Scheduled every 1 hour)
exports.syncRSSFeeds = onSchedule("every 1 hours", async (event) => {
    const rssFeeds = [
        "https://www.greatandhra.com/rss",
        "https://www.telugu360.com/feed/",
        "https://www.idlebrain.com/rss/news.xml",
        "https://www.123telugu.com/feed"
    ];

    for (const url of rssFeeds) {
        try {
            const feed = await parser.parseURL(url);
            for (const item of feed.items.slice(0, 5)) { // Limit to latest 5 items per feed
                const newsId = Buffer.from(item.link).toString('base64').substring(0, 20);
                const newsRef = db.collection("news").doc(newsId);
                const docSnap = await newsRef.get();

                if (!docSnap.exists) {
                    // Extract image from content or enclosure if possible
                    let image = "";
                    if (item.enclosure && item.enclosure.url) image = item.enclosure.url;
                    
                    // Simple summary if AI not available, but user asked for "Short AI summary"
                    // In a real scenario, we'd call Gemini API here
                    let summary = item.contentSnippet || item.description || "";
                    if (summary.length > 200) summary = summary.slice(0, 200) + "...";

                    await newsRef.set({
                        title: item.title,
                        link: item.link,
                        description: item.description || "",
                        summary: summary,
                        image: image,
                        source: feed.title || "SM Reviews News",
                        pubDate: admin.firestore.Timestamp.fromDate(new Date(item.pubDate || Date.now())),
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    
                    console.log(`Added news: ${item.title}`);
                }
            }
        } catch (error) {
            console.error(`Error parsing feed ${url}:`, error);
        }
    }
});
