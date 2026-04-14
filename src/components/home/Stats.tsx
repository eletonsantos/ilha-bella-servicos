const stats = [
  { value: '24h', label: 'Atendimento ininterrupto' },
  { value: '2', label: 'Regiões cobertas' },
  { value: '7+', label: 'Especialidades disponíveis' },
  { value: '100%', label: 'Compromisso com resolução' },
]

export default function Stats() {
  return (
    <section className="bg-brand-gold py-12">
      <div className="container-site">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-white/80 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
