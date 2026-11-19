import townshipIllustration from '../assets/images/Home Page bottom.png'
import '../styles/home-page.css'

function HomePage() {
  return (
    <main className="home-page">
      <header className="home-page__intro">
        <h1>PROJECT-SCALE</h1>
        <p>A Town Directory Built to Test Backend Scalability</p>
      </header>
      <img
        className="home-page__illustration"
        src={townshipIllustration}
        alt=""
        width={2172}
        height={724}
      />
    </main>
  )
}

export default HomePage
