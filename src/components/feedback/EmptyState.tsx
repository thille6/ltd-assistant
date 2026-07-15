export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="panel empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  )
}
