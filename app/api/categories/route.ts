// import { NextRequest } from "next/server";
// import {dbConnect} from "@/shared/common/lib/db";
// import { CategoryModel } from "@/features/categories/models/category.model";

// export async function GET() {
//   await dbConnect()
//   const categories = await CategoryModel.find().lean()
//   return Response.json(categories)
// }

// export async function POST(req: NextRequest) {
//   await dbConnect()
//   const body = await req.json()
//   const category = await CategoryModel.create(body)
//   return Response.json(category, { status: 201 })
// }