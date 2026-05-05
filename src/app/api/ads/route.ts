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

    let finalCost = cost;
    let actualWordCount = wordCount;

    if (type === "CLASSIFIED_TEXT" && content) {
      actualWordCount = content.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
      finalCost = actualWordCount * 14;
    } else if (type === "CLASSIFIED_DISPLAY" || type === "DISPLAY") {
      if (width && length) {
        if (type === "CLASSIFIED_DISPLAY") {
          finalCost = width * length * 150;
        } else if (type === "DISPLAY") {
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
