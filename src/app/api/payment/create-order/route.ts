import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("Razorpay keys are missing in environment variables");
      return NextResponse.json({ error: "Payment gateway misconfigured" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adId } = await req.json();

    // Fetch the ad to get the amount
    const ad = await prisma.ad.findUnique({ where: { id: adId } });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(ad.cost * 100), // convert ₹ to paise
      currency: "INR",
      receipt: `ad_${adId}`,
      notes: {
        adId: adId,
        userId: session.user.id,
      },
    });

    // Save Razorpay order ID to the ad record
    await prisma.ad.update({
      where: { id: adId },
      data: { razorpayOrderId: order.id },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
