import { NextResponse } from "next/server";
import { Dropbox } from "dropbox";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }


    if (!process.env.DROPBOX_APP_KEY || !process.env.DROPBOX_APP_SECRET || !process.env.DROPBOX_REFRESH_TOKEN) {
      console.error("Missing Dropbox Environment Variables");
      return NextResponse.json({ error: "Dropbox configuration missing" }, { status: 500 });
    }

    const dbx = new Dropbox({
      clientId: process.env.DROPBOX_APP_KEY,
      clientSecret: process.env.DROPBOX_APP_SECRET,
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
      fetch: fetch,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `/ads/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    // 1. Upload file
    const uploadResponse = await dbx.filesUpload({
      path,
      contents: buffer,
    });

    // 2. Create a shared link
    let sharedLinkResponse;
    try {
      sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: uploadResponse.result.path_display || path,
      });
    } catch (sharingError: any) {
      // If link already exists, get it
      if (sharingError.status === 409) {
         const links = await dbx.sharingListSharedLinks({
           path: uploadResponse.result.path_display || path,
           direct_only: true
         });
         sharedLinkResponse = { result: links.result.links[0] };
      } else {
        throw sharingError;
      }
    }

    // Convert dropbox link to direct download link
    // Replace dl=0 with raw=1 to get the direct file access
    const finalUrl = sharedLinkResponse.result.url.replace(/dl=0$/, "raw=1");

    return NextResponse.json({ url: finalUrl }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || "Failed to upload to Dropbox",
        status: error.status,
      },
      { status: 500 }
    );
  }
}
