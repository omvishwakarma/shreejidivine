import './PerfectFor.css'

const places = ['Home', 'Pooja Room', 'Office', 'Meditation', 'Gifting']

export default function PerfectFor() {
  return (
    <section className="perfect" id="perfect-for">
      <div className="container perfect__inner reveal">
        <p className="perfect__label">Perfect For</p>
        <ul className="perfect__list">
          {places.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="perfect__closing">
          A daily ritual of gratitude, fragrance &amp; faith.
          <br />
          Transform every space into a sacred space.
        </p>
      </div>
    </section>
  )
}
