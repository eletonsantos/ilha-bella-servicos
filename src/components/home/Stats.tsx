const stats = [
  { value: '24h', label: 'Atendimento contínuo', sub: 'Todos os dias do ano' },
  { value: '7+', label: 'Especialidades', sub: 'Cobertura completa' },
  { value: '2', label: 'Regiões', sub: 'SC e RS' },
  { value: '100%', label: 'Foco em resolução', sub: 'Garantia no serviço' },
]

export default function Stats() {
  return (
    <section className="bg-brand-blue py-14">
      <div className="container-site">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center">
          {stats.map(({ value, label, sub }) => (
            <div key={label} className="space-y-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-white leading-none">{value}</p>
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className="text-blue-200 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
