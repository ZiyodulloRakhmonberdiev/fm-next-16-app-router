import { unstable_cache } from "next/cache"
import { dbConnect } from "@/shared/common/lib/db"
import { TeamMemberModel } from "@/features/team/model/team.model"
import { mapTeamDocToClient } from "@/features/team/lib/team-api-map"
import { isClientDeliveryEnabled } from "./server-client-delivery"

export const getPublicTeam = unstable_cache(async () => {
  if (!(await isClientDeliveryEnabled("team"))) return []
  await dbConnect()
  const rows = await TeamMemberModel.find().sort({ certificateNumber: 1, createdAt: 1 }).lean()
  return JSON.parse(JSON.stringify(rows.map(mapTeamDocToClient)))
}, ["public-team-page"], { revalidate: 300, tags: ["team"] })
