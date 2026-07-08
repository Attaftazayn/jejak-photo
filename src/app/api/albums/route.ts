// API Route deleted in favor of Server Actions
export async function GET() {
  return new Response("Deleted", { status: 410 });
}
