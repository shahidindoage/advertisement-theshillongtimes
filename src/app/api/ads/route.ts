import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, content, gstNumber, startDate, endDate, wordCount, cost, type, width, length, fileUrl } = body;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const userState = user?.state || "Meghalaya";
    const gstRate = 0.05;

    let finalCost = cost;
    let actualWordCount = wordCount;

    if (type === "CLASSIFIED_TEXT" && content) {
      actualWordCount = content.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
      const baseCost = actualWordCount * 14;
      finalCost = baseCost + Math.round(baseCost * gstRate);
    } else if (type === "CLASSIFIED_DISPLAY" || type === "DISPLAY") {
      if (width && length) {
        if (type === "CLASSIFIED_DISPLAY") {
          const baseCost = width * length * 150;
          finalCost = baseCost + Math.round(baseCost * gstRate);
        } else if (type === "DISPLAY") {
          // For DISPLAY, the cost is already calculated with GST on the frontend or set per placement
          // but we should ensure it matches our expectations if we want to be safe.
          // However, the user asked to show base + GST, and I'm sending finalAmount.
          finalCost = cost; 
        }
      }
    }

    const ad = await prisma.ad.create({
      data: {
        user: { connect: { id: session.user.id } },
        type,
        category,
        content: content || null,
        wordCount: actualWordCount || null,
        width: width || null,
        length: length || null,
        fileUrl: fileUrl || null,
        cost: finalCost,
        gstNumber,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "PENDING",
      },
    });

    return NextResponse.json({ adId: ad.id }, { status: 201 });
  } catch (error) {
    console.error("Save ad error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
