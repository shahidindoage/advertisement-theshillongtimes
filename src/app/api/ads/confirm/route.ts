import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adId } = await req.json();

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: { user: true },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ad should already be marked PAID by /api/payment/verify
    const updatedAd = await prisma.ad.findUnique({
      where: { id: adId },
    });

    // Send Emails (Dummy check for API key)
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_123") {
      try {
        // To User
        await resend.emails.send({
          from: "The Shillong Times <noreply@bhalowell.com>",
          to: ad.user.email,
          subject: "Ad Booking Confirmed!",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #4f46e5;">Booking Confirmed!</h2>
              <p>Hello,</p>
              <p>Your ad booking has been successfully confirmed. Our team will connect with you shortly regarding the placement and next steps.</p>
              <p style="margin-top: 20px;">Thank you for choosing The Shillong Times!</p>
            </div>
          `,
        });

        // To Admin
        await resend.emails.send({
          from: "The Shillong Times <noreply@bhalowell.com>",
          to: "shahid.indoage@gmail.com", // Replace with real admin email
          subject: "New Ad Booking Received",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #4f46e5;">New Ad Booking Received</h2>
              <p>A new advertisement has been booked and paid for. Here are the full details:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #eee;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>User Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.user.email}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>Ad ID:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.id}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>Type:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.type}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>Category:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.category}</td></tr>
                ${ad.type === "CLASSIFIED_TEXT" ? `
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>Ad Content:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.content}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>Word Count:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.wordCount}</td></tr>
                ` : `
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>Dimensions:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.width}cm x ${ad.length}cm</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>File URL:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="${ad.fileUrl}">${ad.fileUrl}</a></td></tr>
                `}
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>Start Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.startDate.toDateString()}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>End Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.endDate.toDateString()}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>Amount Paid:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">₹${ad.cost}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; background: #f9fafb;"><strong>GST Number:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${ad.gstNumber || "N/A"}</td></tr>
              </table>
            </div>
          `,
        });

      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // We don't fail the transaction if email fails
      }
    } else {
      console.log("Skipping email: No valid RESEND_API_KEY found");
    }

    return NextResponse.json({ success: true, ad: updatedAd });
  } catch (error) {
    console.error("Confirm ad error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
