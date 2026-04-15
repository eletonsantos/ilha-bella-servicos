'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import EditarCadastroForm from './EditarCadastroForm'

interface Field {
  label: string
  value: string
}

interface TechData {
  id: string
  fullName: string
  cpf: string
  phone: string
  email: string
  city: string
  pixKey: string
  pixKeyType: string
  iaAssistLogin: string | null
  cnpj: string | null
  razaoSocial: string | null
}

interface Props {
  fields: Field[]
  tech: TechData
}

export default function EditarCadastroWrapper({ fields, tech }: Props) {
  const [editing, setEditing] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-dark">Dados do cadastro</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-brand-blue hover:text-brand-blue-dark text-sm font-semibold transition-colors"
          >
            <Pencil size={14} />
            Editar
          </button>
        )}
      </div>

      {editing ? (
        <EditarCadastroForm
          tech={tech}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</dt>
              <dd className="text-sm font-medium text-dark">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  )
}
