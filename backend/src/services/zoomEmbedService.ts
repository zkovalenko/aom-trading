import express from "express";
import crypto from "crypto";

const app = express();

app.get("/api/zoom-signature", (req, res) => {
  const sdkKey = process.env.ZOOM_SDK_KEY!;
  const sdkSecret = process.env.ZOOM_SDK_SECRET!;
  const meetingNumber = req.query.meetingNumber as string;
  const role = 0; // 0 = attendee, 1 = host

  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2; // valid 2h

  const msg = Buffer.from(
    `${sdkKey}${meetingNumber}${iat}${exp}${role}`
  ).toString("base64");

  const hash = crypto
    .createHmac("sha256", sdkSecret)
    .update(msg)
    .digest("base64");

  const signature = Buffer.from(
    `${sdkKey}.${meetingNumber}.${iat}.${exp}.${role}.${hash}`
  ).toString("base64");

  res.json({ signature });
});

app.listen(4000, () => console.log("Zoom signature server running"));
