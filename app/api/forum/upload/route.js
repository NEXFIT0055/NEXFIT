import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const postId = formData.get("postId");

    console.log("Received upload request:", { postId, fileName: file?.name });

    if (!file || !postId) {
      console.error("Missing file or postId:", { file: !!file, postId });
      return NextResponse.json({ error: "No file or postId" }, { status: 400 });
    }

    // 上傳到 Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary 環境變數未設定");
    }

    const formDataCloudinary = new FormData();
    formDataCloudinary.append("file", file);
    formDataCloudinary.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formDataCloudinary,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary 錯誤:", errorText);
      throw new Error("Cloudinary 上傳失敗");
    }

    const data = await response.json();
    const fileUrl = data.secure_url;
    console.log("Image URL:", fileUrl);

    // 從資料庫中取得現有的 images 欄位值
    let rows;
    try {
      [rows] = await db.query("SELECT images FROM forum_posts WHERE id = ?", [
        postId,
      ]);
    } catch (dbError) {
      console.error("Database query error:", dbError);
      throw new Error("Failed to query database");
    }

    if (rows.length === 0) {
      console.error("Post not found:", postId);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let existingImages;
    try {
      existingImages = rows[0].images ? JSON.parse(rows[0].images) : [];
    } catch (parseError) {
      console.error("Error parsing existing images:", parseError);
      existingImages = [];
    }

    // 將新圖片 URL 添加到現有的 images 陣列中
    const updatedImages = [...existingImages, fileUrl];

    // 更新資料庫中的 images 欄位
    try {
      await db.query("UPDATE forum_posts SET images = ? WHERE id = ?", [
        JSON.stringify(updatedImages),
        postId,
      ]);
    } catch (updateError) {
      console.error("Error updating database:", updateError);
      throw new Error("Failed to update database");
    }

    return NextResponse.json({ url: fileUrl, success: true, images: updatedImages });
  } catch (error) {
    console.error("圖片上傳失敗:", error);
    return NextResponse.json({ error: "上傳失敗" }, { status: 500 });
  }
}
