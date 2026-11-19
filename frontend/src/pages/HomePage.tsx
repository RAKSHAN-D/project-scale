import townshipIllustration from '../assets/images/Home Page bottom.png'
import '../styles/home-page.css'

function HomePage() {
  return (
    <main className="home-page">
      <header className="home-page__intro">
        <h1>PROJECT-SCALE</h1>
        <p>A Town Directory Built to Test Backend Scalability</p>
        <div className="home-page__actions">
          <a className="home-page__button home-page__button--signup" href="/signup">
            Sign up
          </a>
          <button className="home-page__button" type="button" disabled>
            Log in
          </button>
        </div>
      </header>
      <div className="home-page__artwork">
        <div className="home-page__scene">
          <img
            className="home-page__illustration"
            src={townshipIllustration}
            alt=""
            width={2172}
            height={724}
          />
          <div className="flying-birds home-page__birds" aria-hidden="true">
            <span className="flying-bird" />
            <span className="flying-bird" />
            <span className="flying-bird" />
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePage
