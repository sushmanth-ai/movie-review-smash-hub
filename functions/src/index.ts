import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Triggered when a new movie update is created.
 */
export const onMovieUpdateCreated = functions.firestore
  .document("movie_updates/{updateId}")
  .onCreate(async (snap: any, context: any) => {
    const data = snap.data();
    if (!data) return;

    const title = data.movieName ? `${data.movieName}: ${data.title}` : data.title;
    const bodyStr = data.description || "New update available!";
    const imageUrl = data.imageUrl || "";

    // The payload specifically structured for our Service Worker
    const payload = {
      notification: {
        title: "SM Reviews",
        body: bodyStr,
        image: imageUrl || undefined, // Big Poster
      },
      data: {
        url: "/updates", // Or deep link to specific update
        movieName: data.movieName || "",
      },
    };

    // Fetch all tokens
    const tokensSnapshot = await admin.firestore().collection("fcm_tokens").get();
    const tokens = tokensSnapshot.docs.map((doc: any) => doc.data().token).filter((t: any) => !!t);

    if (tokens.length === 0) {
      console.log("No FCM tokens found.");
      return;
    }

    // Send Multicast
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data,
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "high_importance_channel"
        }
      },
      webpush: {
        headers: {
          Urgency: "high"
        }
      }
    });

    console.log(`Successfully sent ${response.successCount} messages. Failed: ${response.failureCount}`);
    
    // Cleanup invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (errCode === "messaging/invalid-registration-token" || errCode === "messaging/registration-token-not-registered") {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      if (failedTokens.length > 0) {
        const batch = admin.firestore().batch();
        tokensSnapshot.docs.forEach((doc: any) => {
          if (failedTokens.includes(doc.data().token)) {
            batch.delete(doc.ref);
          }
        });
        await batch.commit();
        console.log(`Cleaned up ${failedTokens.length} invalid tokens.`);
      }
    }
  });

/**
 * Triggered when a new review is published.
 */
export const onReviewCreated = functions.firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snap: any, context: any) => {
    const data = snap.data();
    if (!data) return;

    const payload = {
      notification: {
        title: "SM Reviews",
        body: `New Review: ${data.movieName} - ⭐ ${data.rating}/5`,
        image: data.posterUrl || undefined,
      },
      data: {
        url: "/", 
        movieName: data.movieName || "",
      },
    };

    const tokensSnapshot = await admin.firestore().collection("fcm_tokens").get();
    const tokens = tokensSnapshot.docs.map((doc: any) => doc.data().token).filter((t: any) => !!t);

    if (tokens.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data,
      android: {
        priority: "high"
      },
      webpush: {
        headers: {
          Urgency: "high"
        }
      }
    });
  });
