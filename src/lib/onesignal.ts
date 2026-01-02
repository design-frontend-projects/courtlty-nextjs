import * as OneSignal from "@onesignal/node-onesignal";

// Initialize OneSignal client with REST API key
const configuration = OneSignal.createConfiguration({
  restApiKey: process.env.ONESIGNAL_REST_API_KEY,
});

export const OneSignalClient = new OneSignal.DefaultApi(configuration);

// Export the app ID for convenience
export const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "";
