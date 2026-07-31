import fs from "fs";
import path from "path";

/**
 * Downloads an image from a URL and saves it to a local folder under public/uploads/products/
 * Returns the public path (e.g. '/uploads/products/filename.jpg')
 */
export async function downloadImage(url: string, productId: number, type: "thumbnail" | "image", index?: number): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure directory exists
    const publicDir = path.join(process.cwd(), "public");
    const uploadsDir = path.join(publicDir, "uploads", "products");
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Determine file extension from URL or fallback
    const urlObj = new URL(url);
    let ext = path.extname(urlObj.pathname);
    if (!ext || ext.length > 5) {
      ext = ".jpg"; // fallback
    }

    // Standardize filename
    const filename = type === "thumbnail" 
      ? `product_${productId}_thumb${ext}`
      : `product_${productId}_img_${index ?? 0}${ext}`;

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Return the absolute public path for front-end consumption
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    // Fallback to original URL if download fails
    return url;
  }
}
