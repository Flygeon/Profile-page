export interface Donor {
  name: string
  amount: string
  message?: string
}

export const alipayQrCode = '/alipay-qrcode.png'

export const donors: Donor[] = []
