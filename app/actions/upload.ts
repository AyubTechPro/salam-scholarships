"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function uploadImageAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await uploadToCloudinary(buffer, "salam-consulting", "image");
    return { success: true, url: result.secure_url };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message || "Failed to upload image" };
  }
}
