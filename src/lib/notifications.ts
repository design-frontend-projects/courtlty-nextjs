import { OneSignalClient, ONESIGNAL_APP_ID } from "@/lib/onesignal";

export async function sendPaymentNotification(
  userIds: string[],
  matchName: string,
) {
  if (!userIds.length) return;

  // Send Push via OneSignal
  try {
    await OneSignalClient.createNotification({
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: userIds },
      contents: {
        en: `Payment required for match: ${matchName}. Please pay to participate.`,
      },
      headings: {
        en: "Payment Required",
      },
    });
    console.log(`[OneSignal] Notification sent to ${userIds.length} users`);
  } catch (e) {
    console.error("OneSignal Error", e);
  }

  // Mock SendGrid Email
  // In a real app, you would use @sendgrid/mail
  // sgMail.send({ ... })
  console.log(
    `[SendGrid] Sending email to users ${userIds.join(
      ", ",
    )} for match ${matchName}`,
  );
}

export async function sendTeamJoinNotification(
  ownerId: string,
  userName: string,
) {
  try {
    await OneSignalClient.createNotification({
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: [ownerId] },
      contents: {
        en: `${userName} requested to join your team.`,
      },
      headings: {
        en: "New Team Request",
      },
    });
  } catch (e) {
    console.error("OneSignal Error", e);
  }
}

export async function sendBookingNotification(
  userIds: string[],
  message: string,
  heading: string = "Booking Update",
) {
  if (!userIds.length) return;

  try {
    await OneSignalClient.createNotification({
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: userIds },
      contents: {
        en: message,
      },
      headings: {
        en: heading,
      },
    });
    console.log(`[OneSignal] Notification sent to ${userIds.length} users`);
  } catch (e) {
    console.error("OneSignal Error", e);
  }
}
