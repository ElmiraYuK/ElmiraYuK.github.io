/* eslint-disable @next/next/no-img-element */

const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <span aria-hidden="true" className={diagonal ? "arrow diagonal" : "arrow"}>
    {diagonal ? "↗" : "→"}
  </span>
);

const industryExperience = [
  {
    period: "2016—present",
    company: "MIRWIFI JSC",
    role: "R&D Expert · Telecommunications Platforms",
    description:
      "Analytical and simulation models of performance and reliability for large transport data networks operating under mobility, unstable channels and variable demand.",
    tags: ["queueing models", "simulation", "mobile networks"],
  },
  {
    period: "2020—2022",
    company: "TWIM · UAE",
    role: "Quantitative Analyst",
    description:
      "Financial mathematics, development and backtesting of trading strategies, and ongoing monitoring and analysis of production algorithms.",
    tags: ["quant research", "risk", "strategy validation"],
  },
  {
    period: "2007—2009",
    company: "Yandex",
    role: "Research Engineer · Search Quality",
    description:
      "Machine-learning models for web-spam detection, classification and forecasting for contextual advertising, using Hadoop, MapReduce, Java, Python and R.",
    tags: ["machine learning", "webspam", "ad tech"],
  },
  {
    period: "since 2025",
    company: "Scientific & Technical Review",
    role: "Expert for the Ministry of Industry and Trade",
    description:
      "Expert assessment of scientific equipment and technology proposals at the interface between research requirements and engineering feasibility.",
    tags: ["expert review", "technology", "R&D assessment"],
  },
];

const researchTracks = [
  {
    index: "01",
    title: "Stochastic networks",
    text: "Ergodicity, stability and quantitative convergence rates for queueing networks with dynamic or random structure.",
    tags: ["Jackson & Kelly networks", "dynamic graphs"],
  },
  {
    index: "02",
    title: "Reliability and performance",
    text: "Models of failure, repair, delay and throughput for telecommunications, computing and transport systems.",
    tags: ["reliability", "performance evaluation"],
  },
  {
    index: "03",
    title: "Random processes on graphs",
    text: "Interacting systems, zero-range processes, random walks and asymptotic properties of large networks.",
    tags: ["zero-range process", "random walks"],
  },
  {
    index: "04",
    title: "Information and logic",
    text: "Weighted Chernoff information, context-sensitive hypothesis testing and many-valued logic for complex-system analysis.",
    tags: ["information geometry", "many-valued logic"],
  },
];

const publications = [
  {
    year: "2026",
    topic: "Information theory",
    title:
      "Weighted Chernoff Information and Optimal Loss Exponent in Context-Sensitive Hypothesis Testing",
    venue: "Entropy · 28(5), 536 · with Mark Kelbert",
    href: "https://doi.org/10.3390/e28050536",
  },
  {
    year: "2026",
    topic: "Mobile networks",
    title:
      "Markov-modulated queueing network for mobile traffic aggregation with threshold-controlled buffers",
    venue: "Mathematical Modelling and Numerical Simulation with Applications · 6(1)",
    href: "https://doi.org/10.53391/2791-8564.1019",
  },
  {
    year: "2024",
    topic: "Many-valued logic",
    title: "Finiteness of One-Valued Function Classes in Many-Valued Logic",
    venue: "Fractal and Fractional · 8(1)",
    href: "https://doi.org/10.3390/fractalfract8010029",
  },
  {
    year: "2022",
    topic: "Algebraic structure",
    title:
      "Lattice Structure of Some Closed Classes for Three-Valued Logic and Its Applications",
    venue: "Mathematics · 10(1)",
    href: "https://doi.org/10.3390/math10010094",
  },
  {
    year: "2020",
    topic: "Queueing networks",
    title: "On Exponential Convergence of Dynamic Queueing Network and Its Applications",
    venue: "Springer · Communications in Computer and Information Science 1337",
    href: "https://doi.org/10.1007/978-3-030-66471-8_35",
  },
  {
    year: "2016",
    topic: "Reliability",
    title:
      "Analysis of System Reliability with Control, Dependent Failures, and Arbitrary Repair Times",
    venue: "International Journal of System Assurance Engineering and Management",
    href: "https://doi.org/10.1007/s13198-016-0520-5",
  },
];

const courses = [
  {
    title: "Stochastic Networks",
    details: "Author-designed course · lectures · 34 hours",
    place: "Faculty of Mechanics and Mathematics, MSU · Department of Probability",
  },
  {
    title: "Stochastic Networks and Their Applications in Complex Systems",
    details: "Elective course · seminars · 34 hours",
    place: "Faculty of Mechanics and Mathematics, MSU",
  },
  {
    title: "Statistical Practicum",
    details: "Specialised course · lectures · 36 hours",
    place: "Faculty of Chemistry, MSU",
  },
  {
    title: "Probability Theory and Mathematical Statistics",
    details: "Core university course",
    place: "Lomonosov Moscow State University",
  },
];

const profiles = [
  {
    label: "ISTINA",
    value: "Publications · courses · projects",
    href: "https://istina.msu.ru/workers/482331401/all/",
  },
  {
    label: "ORCID",
    value: "0000-0001-7158-040X",
    href: "https://orcid.org/0000-0001-7158-040X",
  },
  {
    label: "Google Scholar",
    value: "Research profile",
    href: "https://scholar.google.com/citations?user=AEGxhxoAAAAJ",
  },
  {
    label: "Scopus",
    value: "Author ID 34972853000",
    href: "https://www.scopus.com/authid/detail.uri?authorId=34972853000",
  },
  {
    label: "Math-Net.Ru",
    value: "Papers · talks · video lectures",
    href: "https://www.mathnet.ru/eng/person56146",
  },
  {
    label: "Web of Science",
    value: "ResearcherID J-8343-2013",
    href: "https://www.webofscience.com/wos/author/rid/J-8343-2013",
  },
];

const NetworkField = ({
  compact = false,
  left = false,
}: {
  compact?: boolean;
  left?: boolean;
}) => (
  <div
    className={`network-field${compact ? " compact" : ""}${left ? " left" : ""}`}
    aria-hidden="true"
  >
    {Array.from({ length: 14 }, (_, index) => (
      <i className={`edge edge-${index + 1}`} key={`edge-${index + 1}`} />
    ))}
    <i className="mesh-ring mesh-ring-1" />
    <i className="mesh-ring mesh-ring-2" />
    <span className="graph-node graph-node-1">+</span>
    <span className="graph-node graph-node-2">−</span>
    <span className="graph-node graph-node-3">λ</span>
    <span className="graph-node graph-node-4">+</span>
    <span className="graph-node graph-node-5">π</span>
    <span className="graph-node graph-node-6">−</span>
    <span className="graph-node graph-node-7">q</span>
    <span className="graph-node graph-node-8">+</span>
    <span className="graph-node graph-node-9">G</span>
    <span className="graph-node graph-node-10">−</span>
    <span className="graph-node graph-node-11">ρ</span>
    <span className="graph-node graph-node-12">+</span>
    <span className="network-equation equation-1">G = (V, E)</span>
    <span className="network-equation equation-2">P<sub>t</sub>(x, ·)</span>
    <span className="network-equation equation-3">πQ = 0</span>
  </div>
);

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Home">
          <span className="brand-mark">EK</span>
          <span className="brand-copy">
            <strong>Elmira Yu. Kalimulina</strong>
            <small>stochastic systems · applied mathematics</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#industry">Industry</a>
          <a href="#research">Research</a>
          <a href="#teaching">Teaching</a>
          <a href="#publications">Publications</a>
        </nav>

        <a className="header-contact" href="mailto:elmira.yu.k@gmail.com">
          Contact <Arrow diagonal />
        </a>
      </header>

      <section className="hero">
        <NetworkField />
        <div className="hero-copy">
          <p className="eyebrow">PhD in Computer Science · Moscow</p>
          <h1>
            Elmira Yu.
            <br />
            Kalimulina
          </h1>
          <p className="hero-title">Mathematician for complex systems</p>
          <p className="hero-lead">
            I connect stochastic modelling, machine learning and engineering
            practice — from stability theory for networks to R&amp;D for mobile
            telecommunications traffic and quantitative strategies.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="mailto:elmira.yu.k@gmail.com">
              Discuss a project <Arrow />
            </a>
            <a className="button button-ghost" href="#industry">
              Explore experience <Arrow diagonal />
            </a>
          </div>

          <div className="hero-affiliations" aria-label="Current positions">
            <span>MSU · Senior Research Fellow</span>
            <span>IITP RAS · Researcher</span>
            <span>RUT (MIIT) · Associate Professor</span>
          </div>
        </div>

        <div className="portrait-column">
          <div className="portrait-frame">
            <div className="portrait-glow" />
            <img
              src="/elmira-kalimulina-portrait.webp"
              alt="Elmira Yu. Kalimulina"
              width="720"
              height="929"
            />
            <div className="portrait-grid" aria-hidden="true" />
            <div className="portrait-label label-top">
              <span>research / industry</span>
              <strong>20+ years</strong>
            </div>
            <div className="portrait-label label-bottom">
              <span>focus</span>
              <strong>Networks under uncertainty</strong>
            </div>
          </div>
        </div>

        <div className="proof-strip" aria-label="Key facts">
          <div>
            <strong>20+</strong>
            <span>years in research and teaching</span>
          </div>
          <div>
            <strong>50+</strong>
            <span>research publications</span>
          </div>
          <div>
            <strong>50+</strong>
            <span>degree projects supervised</span>
          </div>
          <div>
            <strong>2025</strong>
            <span>patent and registered software</span>
          </div>
        </div>
      </section>

      <section className="section value-section" id="expertise">
        <NetworkField compact />
        <div className="section-index">01 / VALUE</div>
        <div className="section-heading split-heading">
          <h2>
            From rigorous models
            <br />to systems that work
          </h2>
          <p>
            My strength is the ability to see the same system simultaneously as a
            mathematical object, a data flow and an engineering process. This makes
            it possible to produce solutions that are not only correct, but useful.
          </p>
        </div>

        <div className="value-grid">
          <article>
            <span>01</span>
            <h3>Formalise uncertainty</h3>
            <p>
              I translate demand, failures, mobility and random disturbances into
              model parameters, stability criteria and measurable risks.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Test before implementation</h3>
            <p>
              I combine analytical estimates, simulation and data analysis to
              compare scenarios and expose system constraints.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Connect research and product</h3>
            <p>
              I work across research, data and engineering teams — from a hypothesis
              and prototype to expert review or a protectable technical result.
            </p>
          </article>
        </div>
      </section>

      <section className="section industry-section" id="industry">
        <NetworkField compact left />
        <div className="industry-backdrop" aria-hidden="true">
          <span>λ(t)</span>
          <span>Q/G/∞</span>
          <span>P(X&gt;x)</span>
        </div>
        <div className="section-index">02 / INDUSTRY</div>
        <div className="section-heading split-heading">
          <h2>
            Industry:
            <br />models that reach the real system
          </h2>
          <p>
            Experience across search and ad tech, transport Wi-Fi, quantitative
            finance and technology assessment — without an artificial boundary
            between fundamental and applied mathematics.
          </p>
        </div>

        <div className="experience-list">
          {industryExperience.map((item, index) => (
            <article className="experience-row" key={item.company}>
              <div className="experience-number">0{index + 1}</div>
              <div className="experience-period">{item.period}</div>
              <div className="experience-main">
                <h3>{item.company}</h3>
                <p className="experience-role">{item.role}</p>
                <p className="experience-description">{item.description}</p>
                <div className="tag-list">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="impact-grid">
          <article className="impact-card impact-featured">
            <p className="card-kicker">Protected result · 2025</p>
            <h3>Intelligent control of network-traffic aggregation</h3>
            <p>
              Co-inventor of patent RU 2843669 C1 and co-author of registered
              software for modelling buffer dynamics in networks with mobile
              aggregators. The solution targets stable, high-performance
              transmission under unreliable channels.
            </p>
            <a href="https://istina.msu.ru/patents/784082559/" target="_blank" rel="noreferrer">
              View patent <Arrow diagonal />
            </a>
          </article>
          <article className="impact-card">
            <p className="card-kicker">Transport · 2022</p>
            <h3>Predicting failures of locomotive equipment</h3>
            <p>
              Supervised an applied student project commissioned by Russian
              Railways: problem formulation, forecasting models and translation of
              analytics into an operational setting.
            </p>
          </article>
          <article className="impact-card">
            <p className="card-kicker">Research leadership</p>
            <h3>Principal Investigator of an RFBR grant</h3>
            <p>
              Led a project on analytical models, methods and algorithms for
              optimising distributed systems with evolving structure.
            </p>
          </article>
        </div>
      </section>

      <section className="section research-section" id="research">
        <NetworkField compact />
        <div className="section-index">03 / RESEARCH</div>
        <div className="section-heading split-heading">
          <h2>
            Systems that evolve
            <br />under uncertainty
          </h2>
          <p>
            My work centres on large random systems: proving stability, estimating
            convergence to stationarity and turning asymptotic theory into an
            engineering benchmark.
          </p>
        </div>

        <div className="research-grid">
          {researchTracks.map((track) => (
            <article key={track.index}>
              <div className="research-card-head">
                <span>{track.index}</span>
                <i aria-hidden="true">±</i>
              </div>
              <h3>{track.title}</h3>
              <p>{track.text}</p>
              <div className="tag-list">
                {track.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="academic-roles">
          <div>
            <p className="card-kicker">Current academic base</p>
            <h3>Lomonosov Moscow State University</h3>
            <p>
              Senior Research Fellow at the Laboratory of Large Random Systems,
              Faculty of Mechanics and Mathematics, since 2024.
            </p>
          </div>
          <div>
            <p className="card-kicker">Research collaboration</p>
            <h3>IITP RAS</h3>
            <p>
              Ergodicity of Markov processes and applied stochastic models, with a
              focus on the theory of dynamic networks.
            </p>
          </div>
          <div>
            <p className="card-kicker">Research foundation</p>
            <h3>ICS RAS · 2009—2024</h3>
            <p>
              Fifteen years of research in reliability, queueing systems and
              network modelling, together with editorial and organisational work.
            </p>
          </div>
        </div>
      </section>

      <section className="section teaching-section" id="teaching">
        <NetworkField compact left />
        <div className="section-index">04 / TEACHING</div>
        <div className="teaching-intro">
          <div>
            <p className="award-label">Student recognition</p>
            <div className="award-years">2023 / 2024</div>
            <h2>“Best Lecturer, Higher School of Engineering”</h2>
            <p>
              Russian University of Transport. I teach rigorous probability as a
              working language for data analysis, engineering and decision-making.
            </p>
          </div>
          <div className="teaching-principle">
            <span>Teaching principle</span>
            <p>
              A strong course does not simplify mathematics — it reveals why the
              mathematics matters and how to use it.
            </p>
          </div>
        </div>

        <div className="courses-layout">
          <div className="courses-title">
            <p className="card-kicker">Author-designed courses at MSU</p>
            <h3>From probability to models of real networks</h3>
          </div>
          <div className="course-list">
            {courses.map((course, index) => (
              <article key={course.title}>
                <span>0{index + 1}</span>
                <div>
                  <h4>{course.title}</h4>
                  <p>{course.details}</p>
                  <small>{course.place}</small>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="teaching-proof">
          <div>
            <strong>50+</strong>
            <span>degree projects</span>
            <p>
              Supervision in credit scoring, financial risk, network systems, NLP,
              failure monitoring and transport analytics.
            </p>
          </div>
          <div>
            <strong>20+</strong>
            <span>years of teaching</span>
            <p>
              MSU, RUT (MIIT), MTUCI and Yandex School of Data Analysis: Bachelor’s
              and Master’s teaching, staff development and research supervision.
            </p>
          </div>
          <div className="curriculum-list">
            <p className="card-kicker">Previously taught</p>
            <p>
              Machine learning · optimisation for ML · distributed systems ·
              Hadoop &amp; Spark · NoSQL &amp; Neo4j · data mining in R/Python ·
              mathematical models in economics · Wolfram Mathematica · reliability
              theory.
            </p>
          </div>
        </div>
      </section>

      <section className="section publications-section" id="publications">
        <NetworkField compact />
        <div className="section-index">05 / PUBLICATIONS</div>
        <div className="section-heading split-heading">
          <h2>
            Publications —
            <br />from reliability to information
          </h2>
          <p>
            More than 50 research publications. This selected trajectory moves from
            reliability of telecommunications systems through dynamic networks and
            many-valued logic to contemporary information theory.
          </p>
        </div>

        <div className="publication-list">
          {publications.map((publication, index) => (
            <a
              className={index === 0 ? "publication-row featured" : "publication-row"}
              href={publication.href}
              target="_blank"
              rel="noreferrer"
              key={publication.title}
            >
              <span className="publication-year">{publication.year}</span>
              <span className="publication-topic">{publication.topic}</span>
              <span className="publication-main">
                <strong>{publication.title}</strong>
                <small>{publication.venue}</small>
              </span>
              <Arrow diagonal />
            </a>
          ))}
        </div>
      </section>

      <section className="section credentials-section" id="credentials">
        <NetworkField compact left />
        <div className="section-index">06 / CREDENTIALS</div>
        <div className="credentials-grid">
          <div className="credentials-heading">
            <h2>Research depth. Engineering range.</h2>
            <p>
              Formal training in telecommunications and systems analysis,
              advanced probability, and an early foundation in machine learning.
            </p>
          </div>
          <div className="credential-column">
            <p className="card-kicker">Education</p>
            <article>
              <span>2009</span>
              <div>
                <h3>PhD / Candidate of Technical Sciences</h3>
                <p>
                  MTUCI · analytical reliability models for distributed
                  telecommunications networks.
                </p>
              </div>
            </article>
            <article>
              <span>2004</span>
              <div>
                <h3>Diploma with honours</h3>
                <p>MTUCI · Information Technology.</p>
              </div>
            </article>
          </div>
          <div className="credential-column">
            <p className="card-kicker">Advanced training</p>
            <article>
              <span>MSU</span>
              <div>
                <h3>Stochastic analysis</h3>
                <p>
                  Markov processes, random fields, stochastic differential
                  equations and optimal stopping.
                </p>
              </div>
            </article>
            <article>
              <span>YSDA</span>
              <div>
                <h3>Machine Learning · MIPT</h3>
                <p>
                  Pattern recognition, optimisation, statistics, algorithms and
                  parallel computing.
                </p>
              </div>
            </article>
          </div>
        </div>

        <div className="toolbox">
          <p>Tools selected for the problem</p>
          <div>
            <span>Python</span>
            <span>R</span>
            <span>Spark</span>
            <span>Hadoop</span>
            <span>NumPy / SciPy / pandas</span>
            <span>Wolfram Mathematica</span>
            <span>Docker</span>
            <span>Neo4j / SQL</span>
            <span>simulation</span>
            <span>LaTeX</span>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <NetworkField compact />
        <p className="eyebrow">Research · R&amp;D · teaching · expert work</p>
        <h2>
          Working on a complex system?
          <br />Let us build a clear model for it.
        </h2>
        <div className="contact-actions">
          <a className="button button-light" href="mailto:elmira.yu.k@gmail.com">
            elmira.yu.k@gmail.com <Arrow />
          </a>
          <a className="button button-ghost light" href="https://t.me/ElmiraYuK" target="_blank" rel="noreferrer">
            Telegram · @ElmiraYuK <Arrow diagonal />
          </a>
        </div>
      </section>

      <footer className="site-footer" id="profiles">
        <div className="footer-top">
          <div>
            <span className="brand-mark">EK</span>
            <p>
              Elmira Yu. Kalimulina
              <small>Mathematician · researcher · lecturer</small>
            </p>
          </div>
          <a href="#top">Back to top ↑</a>
        </div>
        <div className="profile-grid">
          {profiles.map((profile) => (
            <a href={profile.href} target="_blank" rel="noreferrer" key={profile.label}>
              <span>{profile.label}</span>
              <strong>{profile.value}</strong>
              <Arrow diagonal />
            </a>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Elmira Yu. Kalimulina</span>
          <span>Moscow · available for research, R&amp;D and expert collaborations</span>
        </div>
      </footer>
    </main>
  );
}
