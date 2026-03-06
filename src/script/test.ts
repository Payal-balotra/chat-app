import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient } from "../config/sns";

export async function sendOTP(phoneNumber: string, otpCode: string) {
  const params = {
    Message: `Your verification code is ${otpCode}. It expires in 5 minutes.`,
    PhoneNumber: phoneNumber, // Must be in E.164 format (e.g., +1234567890)
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": { DataType: "String", StringValue: "MyBrand" },
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Transactional",
      },
    },
  };

  try {
    const data = await snsClient.send(new PublishCommand(params));
    console.log("OTP sent! MessageID:", data.MessageId);
  } catch (err) {
    console.error("Error sending OTP:", err);
  }
}
