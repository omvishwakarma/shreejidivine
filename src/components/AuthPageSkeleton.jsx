import '../app/auth.css'

export default function AuthPageSkeleton() {
  return (
    <div className="auth-split" aria-busy="true" aria-label="Loading">
      <aside className="auth-visual auth-visual--skel" aria-hidden="true">
        <span className="skel auth-skel__visual" />
      </aside>
      <section className="auth-panel">
        <div className="auth-panel__body">
          <span className="skel auth-skel__logo" />
          <span className="skel auth-skel__title" />
          <span className="skel auth-skel__sub" />
          <span className="skel auth-skel__field" />
          <span className="skel auth-skel__field" />
          <span className="skel auth-skel__field" />
          <span className="skel auth-skel__btn" />
        </div>
      </section>
    </div>
  )
}
