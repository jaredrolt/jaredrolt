import React from "react"
import SEO from "../components/seo"

const IndexPage = () => (
  <>
    <SEO />
    <div className="flex-center position-ref full-height">
      <div className="content">
        <div className="title m-b-md" style={{ marginBottom: '1rem' }}>
          Jared Rolt
        </div>
        <h2 style={{ marginBottom: '2rem' }}>Software Engineer</h2>

        <div className="links">
          <a href="https://www.linkedin.com/in/jaredrolt/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/jaredrolt" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </div>
  </>
)

export default IndexPage
