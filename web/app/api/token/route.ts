import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

    const { username, roomId } = await request.json();

    if (!username || !roomId) {
      return new Response(
        JSON.stringify({ error: "Username and Room ID are required" }),
        { status: 400 }
      );
    }

    const token = jwt.sign({ username, roomId }, JWT_SECRET);
    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    console.error("Token generation error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
