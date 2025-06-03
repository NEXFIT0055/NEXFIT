import db from "@/lib/forum-db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM users");



    return Response.json({
      success: true,
      data: rows, 
      count: rows.length,
      message: "Database connection successful",
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
