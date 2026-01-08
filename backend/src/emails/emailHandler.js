import { resendClient, sender } from "../lib/resend.js";
import createWelcomeEmailTemplate from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("Resend error:", error); 
      throw error;
    }

    console.log("Welcome Email sent successfully:", data?.id);
  } catch (err) {
    console.error("sendWelcomeEmail failed:", err);
    throw err;
  }
};
