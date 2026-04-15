import { google } from "googleapis"

export type PartnersAnalyticsData = {
  summary: {
    sessions: number
    pageViews: number
    activeUsers: number
  }
  topPages: Array<{
    path: string
    pageViews: number
    sessions: number
  }>
  dateRange: {
    startDate: string
    endDate: string
  }
}

const GA_READONLY_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"

function toNumber(value?: string): number {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function getGoogleCredentials() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim()
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!propertyId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing GA4 env vars: GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
    )
  }

  return { propertyId, clientEmail, privateKey }
}

export async function getPartnersAnalytics(days = 30, maxPages = 8): Promise<PartnersAnalyticsData> {
  const { propertyId, clientEmail, privateKey } = getGoogleCredentials()
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [GA_READONLY_SCOPE],
  })

  const analyticsData = google.analyticsdata({
    version: "v1beta",
    auth,
  })

  const property = `properties/${propertyId}`
  const startDate = `${days}daysAgo`
  const endDate = "today"

  const [summaryRes, topPagesRes] = await Promise.all([
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: "sessions" }, { name: "screenPageViews" }, { name: "activeUsers" }],
      },
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: maxPages,
      },
    }),
  ])

  const summaryRow = summaryRes.data.rows?.[0]
  const summary = {
    sessions: toNumber(summaryRow?.metricValues?.[0]?.value),
    pageViews: toNumber(summaryRow?.metricValues?.[1]?.value),
    activeUsers: toNumber(summaryRow?.metricValues?.[2]?.value),
  }

  const topPages = (topPagesRes.data.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || "/",
    pageViews: toNumber(row.metricValues?.[0]?.value),
    sessions: toNumber(row.metricValues?.[1]?.value),
  }))

  return {
    summary,
    topPages,
    dateRange: { startDate, endDate },
  }
}
