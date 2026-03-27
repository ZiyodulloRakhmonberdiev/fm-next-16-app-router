export const CLIENT_DELIVERY_MODEL_KEYS = [
  'news',
  'categories',
  'tags',
  'comments',
  'reactions',
  'ads',
  'team',
  'users',
] as const

export type ClientDeliveryModelKey = (typeof CLIENT_DELIVERY_MODEL_KEYS)[number]
