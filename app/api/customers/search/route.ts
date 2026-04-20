import { NextResponse } from "next/dist/server/web/spec-extension/response";
import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    await connectToDatabase();

    // Construct the role-based filter
    let match: any = {};
    if (session.user.role !== "admin") {
      match.region = session.user.region;
      match.branch = session.user.branch;
    }

    if (query) {
      match.$or = [
        { organization: { $regex: query, $options: "i" } },
        { customerName: { $regex: query, $options: "i" } },
        { contactNo: { $regex: query, $options: "i" } }
      ];
    }

    const customers = await Customer.find(match)
      .select("_id organization customerName region branch")
      .limit(50)
      .lean();

    return NextResponse.json(customers);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
