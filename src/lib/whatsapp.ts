import { COMPANY } from './constants'

export function getWhatsAppUrl(message?: string): string {
  const text = encodeURIComponent(message ?? COMPANY.whatsappMessage)
  return `https://wa.me/${COMPANY.whatsapp}?text=${text}`
}

export function getWhatsAppUrlForService(serviceName: string): string {
  const message = `Olá! Preciso de um serviço de *${serviceName}*. Podem me ajudar?`
  return getWhatsAppUrl(message)
}
