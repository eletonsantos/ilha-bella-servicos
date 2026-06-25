'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function SairButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/tecnico/login' })}
      className="w-full inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition-colors"
    >
      <LogOut size={17} /> Sair da conta
    </button>
  )
}
