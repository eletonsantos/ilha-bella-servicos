import { useState } from 'react'

interface CnpjData {
  razao_social: string
  nome_fantasia: string
  municipio: string
  uf: string
  ddd_telefone_1?: string
}

export function useCnpjLookup() {
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState('')

  async function lookup(cnpj: string): Promise<CnpjData | null> {
    const digits = cnpj.replace(/\D/g, '')
    if (digits.length !== 14) return null

    setLookingUp(true)
    setLookupError('')
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
      if (!res.ok) {
        setLookupError('CNPJ não encontrado na Receita Federal.')
        return null
      }
      return await res.json()
    } catch {
      setLookupError('Erro ao consultar CNPJ. Verifique sua conexão.')
      return null
    } finally {
      setLookingUp(false)
    }
  }

  return { lookup, lookingUp, lookupError, setLookupError }
}
