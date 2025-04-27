const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const crypto = require("crypto");

// For development/testing only - in production use environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || "https://abcdefghijklmnopqrst.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0IiwicmUiOiJhbm9uIiwiaWF0IjoxNjM0NTY3ODkwLCJleHAiOjE5NTAxNDM4OTB9.EXAMPLE_KEY_REPLACE_WITH_YOUR_ACTUAL_KEY";

// Initialize Supabase client
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/**
 * Uploads a file to Supabase Storage
 * @param {Object} file - The file object from multer
 * @returns {Promise<Object>} The uploaded file data
 */
const uploadToSupabase = async (file) => {
  try {
    // Generate a unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${crypto.randomBytes(16).toString("hex")}${fileExt}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("pdfs") // Make sure this bucket exists in your Supabase storage
      .upload(`uploads/${fileName}`, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("pdfs").getPublicUrl(`uploads/${fileName}`);

    console.log("File uploaded successfully:", {
      fileName,
      publicUrl,
      originalName: file.originalname,
    });

    return {
      url: publicUrl,
      _id: fileName,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    console.error("Error in uploadToSupabase:", error);
    throw error;
  }
};

module.exports = {
  uploadToSupabase,
  supabase,
};
