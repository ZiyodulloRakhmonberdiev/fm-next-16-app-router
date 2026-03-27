export type TeamRow = {
  _id: string
  order: string
  certificateNumber?: string
  image?: string
  fullName: string
  position: string
  qrCode?: string
  badgeImage?: string
}

export type TeamForm = {
  certificateNumber: string
  image: string
  fullName: string
  position: string
  qrCode: string
  badgeImage: string
}

export const emptyForm: TeamForm = {
  certificateNumber: '',
  image: '',
  fullName: '',
  position: '',
  qrCode: '',
  badgeImage: '',
}
