export type AdItem = {
  _id: string
  type: "content" | "image"
  placement: "header_top_full" | "sidebar_widget" | "home_bottom_full" | "article_bottom_full"
  media?: string | string[]
  mediaMobile?: string | string[]
  logo?: string
  siteName: string
  title: string
  description?: string
  links?: Array<{ label: string; href: string }>
  adUrl?: string
  advertiserUrl?: string
  adInfoUrl?: string
  advertiseWithUsUrl?: string
  active: boolean
  priority: number
  displaySeconds: number
}

export type AdFormState = {
  type: AdItem["type"]
  placement: AdItem["placement"]
  media: string[]
  logo: string
  siteName: string
  title: string
  description: string
  links: Array<{ label: string; href: string }>
  adUrl: string
  advertiserUrl: string
  adInfoUrl: string
  advertiseWithUsUrl: string
  active: boolean
  priority: number
  displaySeconds: number
}

export const emptyForm: AdFormState = {
  type: "content",
  placement: "header_top_full",
  media: [""],
  logo: "",
  siteName: "",
  title: "",
  description: "",
  links: [{ label: "", href: "" }],
  adUrl: "",
  advertiserUrl: "",
  adInfoUrl: "",
  advertiseWithUsUrl: "",
  active: true,
  priority: 1,
  displaySeconds: 12,
}

export function applyAdItemToForm(item: AdItem): AdFormState {
  return {
    type: item.type ?? "content",
    placement: item.placement ?? "header_top_full",
    media: Array.isArray(item.media) ? item.media : item.media ? [item.media] : [""],
    logo: item.logo ?? "",
    siteName: item.siteName ?? "",
    title: item.title ?? "",
    description: item.description ?? "",
    links: item.links?.length ? item.links : [{ label: "", href: "" }],
    adUrl: item.adUrl ?? "",
    advertiserUrl: item.advertiserUrl ?? "",
    adInfoUrl: item.adInfoUrl ?? "",
    advertiseWithUsUrl: item.advertiseWithUsUrl ?? "",
    active: item.active,
    priority: item.priority ?? 0,
    displaySeconds: item.displaySeconds ?? 12,
  }
}
