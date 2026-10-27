
import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const NAV_ITEMS = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Check Internship", icon: "⌕" },
  { name: "Job Analyzer", icon: "▤" },
  { name: "Scam Reports", icon: "⚑" },
  { name: "Safety Tips", icon: "✓" },
];

const FREE_EMAIL_PROVIDERS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "rediffmail.com",
  "icloud.com",
];

const JOB_WARNING_RULES = [
  {
    phrase: "registration fee",
    explanation:
      "A registration fee deserves independent verification before you pay.",
    level: "Verify carefully",
  },
  {
    phrase: "pay immediately",
    explanation:
      "Pressure to pay immediately can lead to rushed decisions.",
    level: "High attention",
  },
  {
    phrase: "guaranteed placement",
    explanation:
      "Verify claims promising guaranteed jobs or placements.",
    level: "Verify carefully",
  },
  {
    phrase: "security deposit",
    explanation:
      "Independently verify any requested security deposit.",
    level: "High attention",
  },
  {
    phrase: "training fee",
    explanation:
      "Check whether the fee is legitimate and clearly documented.",
    level: "Verify carefully",
  },
  {
    phrase: "no interview required",
    explanation:
      "An unusually easy hiring process may deserve additional checks.",
    level: "Verify carefully",
  },
  {
    phrase: "limited seats pay now",
    explanation:
      "Urgency combined with payment requests is a reason to pause.",
    level: "High attention",
  },
  {
    phrase: "send your otp",
    explanation: "Never share an OTP with a recruiter.",
    level: "High attention",
  },
  {
    phrase: "pay to get selected",
    explanation:
      "Verify the offer independently before paying for selection.",
    level: "High attention",
  },
  {
    phrase: "processing fee",
    explanation:
      "Investigate why a processing fee is being requested.",
    level: "Verify carefully",
  },
  {
    phrase: "work from home earn",
    explanation:
      "Check the actual responsibilities, pay terms, and employer identity.",
    level: "Verify carefully",
  },
  {
    phrase: "instant job offer",
    explanation:
      "Verify the employer and offer before sharing information.",
    level: "Verify carefully",
  },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [asksPayment, setAsksPayment] = useState("no");
  const [feeAmount, setFeeAmount] = useState("");
  const [result, setResult] = useState(null);
  const [checkedCount, setCheckedCount] = useState(0);
  const [jobDescription, setJobDescription] = useState("");
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [reportCompany, setReportCompany] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reports, setReports] = useState([]);

  // Load saved reports from the backend.
  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch(`${API_URL}/api/reports`);

        if (!response.ok) {
          throw new Error("Could not load reports");
        }

        const data = await response.json();

        setReports(
          data.map((report) => ({
            id: report.id,
            company: report.company,
            details: report.description,
            date: new Date(report.createdAt).toLocaleDateString(),
          }))
        );
      } catch (error) {
        console.error("Failed to load reports:", error);
      }
    }

    loadReports();
  }, []);

  function checkInternship(event) {
    event.preventDefault();

    if (!company.trim()) {
      alert("Please enter the company name.");
      return;
    }

    const warnings = [];
    let riskScore = 10;

    if (asksPayment === "yes") {
      riskScore += 50;

      warnings.push(
        `Payment requested${
          feeAmount.trim() ? `: ₹${feeAmount.trim()}` : ""
        }. Independently verify the company and offer before paying.`
      );
    }

    if (!website.trim()) {
      riskScore += 20;

      warnings.push(
        "No company website provided. Find and verify the official website independently."
      );
    }

    const email = recruiterEmail.trim().toLowerCase();

    if (!email) {
      riskScore += 10;

      warnings.push(
        "No recruiter email provided. Verify the recruiter's identity independently."
      );
    } else {
      const parts = email.split("@");

      const validEmail =
        parts.length === 2 &&
        /^[^\s@]+$/.test(parts[0]) &&
        /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(parts[1]) &&
        !parts[1].includes("..") &&
        !parts[1].startsWith(".") &&
        !parts[1].endsWith(".");

      if (!validEmail) {
        riskScore += 20;

        warnings.push(
          "The email format appears invalid. Double-check the address."
        );
      } else {
        const emailDomain = parts[1];

        if (FREE_EMAIL_PROVIDERS.includes(emailDomain)) {
          riskScore += 15;

          warnings.push(
            "The recruiter uses a free email provider. This alone does not prove fraud; verify the recruiter's identity."
          );
        }

        if (website.trim()) {
          const websiteDomain = website
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .split(/[/?#:]/)[0];

          if (
            websiteDomain &&
            websiteDomain.includes(".") &&
            !websiteDomain.includes(" ") &&
            !FREE_EMAIL_PROVIDERS.includes(emailDomain) &&
            emailDomain !== websiteDomain
          ) {
            riskScore += 25;

            warnings.push(
              "The email domain differs from the website domain. Some legitimate companies use different domains, so verify this independently."
            );
          }
        }
      }
    }

    riskScore = Math.min(riskScore, 100);

    let riskLevel = "Low";
    let status = "Few warning indicators found";

    if (riskScore >= 60) {
      riskLevel = "High";
      status = "Significant warning indicators found";
    } else if (riskScore >= 30) {
      riskLevel = "Medium";
      status = "Some warning indicators found";
    }

    if (warnings.length === 0) {
      warnings.push(
        "No warning was triggered by these answers. This does not prove the offer is genuine."
      );
    }

    setResult({
      company: company.trim(),
      warnings,
      riskScore,
      riskLevel,
      status,
    });

    setCheckedCount((count) => count + 1);
  }

  function resetChecker() {
    setCompany("");
    setWebsite("");
    setRecruiterEmail("");
    setAsksPayment("no");
    setFeeAmount("");
    setResult(null);
  }

  function analyzeJobDescription(event) {
    event.preventDefault();

    const description = jobDescription.trim();

    if (!description) {
      alert("Please paste a job description first.");
      return;
    }

    const lowerDescription = description.toLowerCase();

    const matches = JOB_WARNING_RULES.filter((rule) =>
      lowerDescription.includes(rule.phrase)
    );

    setJobAnalysis({
      matches,
      wordCount: description.split(/\s+/).filter(Boolean).length,
      characterCount: description.length,
    });
  }

  async function submitReport(event) {
    event.preventDefault();

    if (!reportCompany.trim() || !reportDetails.trim()) {
      alert("Please enter the company name and report details.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: reportCompany.trim(),
          description: reportDetails.trim(),
          category: "Suspicious internship offer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit report");
      }

      const savedReport = {
        id: data.report.id,
        company: data.report.company,
        details: data.report.description,
        date: new Date(data.report.createdAt).toLocaleDateString(),
      };

      setReports((previous) => [savedReport, ...previous]);
      setReportCompany("");
      setReportDetails("");

      alert("Report submitted successfully!");
    } catch (error) {
      console.error("Failed to submit report:", error);

      alert(
        "Could not submit the report. Check whether your backend is running and the API URL is correct."
      );
    }
  }

  function renderResult() {
    if (!result) {
      return (
        <div className="empty-result">
          <div className="empty-icon">⌕</div>
          <h3>Your safety report will appear here</h3>
          <p>
            Enter internship details and analyze them to see possible warning
            indicators.
          </p>
        </div>
      );
    }

    return (
      <div className="result-content">
        <div className="result-heading">
          <div>
            <span className="eyebrow">INITIAL CHECK</span>
            <h3>{result.company}</h3>
          </div>

          <span className={`risk-badge ${result.riskLevel.toLowerCase()}`}>
            {result.riskLevel} risk indicators
          </span>
        </div>

        <div className="risk-summary">
          <div>
            <span className="risk-label">Initial risk indicator score</span>
            <div className="risk-level">{result.status}</div>
          </div>
          <strong>{result.riskScore}/100</strong>
        </div>

        <div
          className="risk-track"
          role="progressbar"
          aria-label="Initial risk indicator score"
          aria-valuenow={result.riskScore}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`risk-fill ${result.riskLevel.toLowerCase()}`}
            style={{ width: `${result.riskScore}%` }}
          />
        </div>

        <h4 className="warning-title">Things to verify</h4>

        <ul className="warning-list">
          {result.warnings.map((warning, index) => (
            <li key={index}>
              <span className="warning-dot">!</span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>

        <div className="disclaimer">
          This is a rule-based estimate, not a validated probability of fraud.
          Independently verify offers before paying or sharing sensitive
          information.
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={resetChecker}
        >
          Check another internship
        </button>
      </div>
    );
  }

  function renderCheckerForm() {
    return (
      <form className="checker-form" onSubmit={checkInternship}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="company-name">Company name *</label>
            <input
              id="company-name"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="e.g. ABC Technologies"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="company-website">Company website</label>
            <input
              id="company-website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="e.g. https://company.com"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="recruiter-email">Recruiter email address</label>
            <input
              id="recruiter-email"
              type="text"
              value={recruiterEmail}
              onChange={(event) => setRecruiterEmail(event.target.value)}
              placeholder="e.g. recruiter@company.com"
            />
            <small>
              A free email address or domain mismatch is a reason to verify,
              not proof of fraud.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="payment-request">Is payment requested? *</label>
            <select
              id="payment-request"
              value={asksPayment}
              onChange={(event) => setAsksPayment(event.target.value)}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {asksPayment === "yes" && (
            <div className="form-group">
              <label htmlFor="fee-amount">Requested fee (₹)</label>
              <input
                id="fee-amount"
                type="number"
                min="0"
                value={feeAmount}
                onChange={(event) => setFeeAmount(event.target.value)}
                placeholder="e.g. 129"
              />
            </div>
          )}
        </div>

        <button type="submit" className="primary-button">
          Analyze internship <span aria-hidden="true">→</span>
        </button>

        <p className="form-note">
          This browser-based checker uses simple rules. It does not contact
          companies or verify offers automatically.
        </p>
      </form>
    );
  }

  function renderDashboard() {
    return (
      <>
        <section className="welcome-banner">
          <div className="welcome-copy">
            <span className="eyebrow">YOUR CAREER, YOUR SAFETY</span>
            <h2>Find opportunities. Avoid internship scams.</h2>
            <p>
              Review possible warning signs before trusting an internship
              offer.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => setActivePage("Check Internship")}
            >
              Check an internship <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="shield-art" aria-hidden="true">
            <div className="shield-circle">
              <svg
                viewBox="0 0 100 100"
                width="100"
                height="100"
                fill="none"
              >
                <path
                  d="M50 9 L82 22 V46 C82 66 69 82 50 92 C31 82 18 66 18 46 V22 Z"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M34 49 L45 60 L67 37"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">⌕</div>
            <div>
              <span className="stat-label">Checks performed</span>
              <strong>{checkedCount}</strong>
              <small>In this session</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">⚑</div>
            <div>
              <span className="stat-label">Reports recorded</span>
              <strong>{reports.length}</strong>
              <small>Loaded from the backend</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span className="stat-label">Safety resources</span>
              <strong>5</strong>
              <small>Helpful safety habits</small>
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">QUICK CHECK</span>
              <h2>Analyze an internship</h2>
              <p>Enter the details provided by the recruiter.</p>
            </div>
          </div>
          {renderCheckerForm()}
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ASSESSMENT</span>
              <h2>Initial safety report</h2>
              <p>Review the indicators from your latest check.</p>
            </div>
          </div>
          {renderResult()}
        </section>

        <section className="tips-grid">
          <article className="tip-card">
            <div className="tip-icon">₹</div>
            <h3>Unexpected fees</h3>
            <p>
              Verify unexpected registration, training, or security fees before
              paying.
            </p>
          </article>

          <article className="tip-card">
            <div className="tip-icon">@</div>
            <h3>Recruiter identity</h3>
            <p>
              Verify the recruiter's identity using independently confirmed
              company contact details.
            </p>
          </article>

          <article className="tip-card">
            <div className="tip-icon">✓</div>
            <h3>Written offer</h3>
            <p>
              Read the responsibilities, stipend, duration, and conditions
              carefully before accepting.
            </p>
          </article>
        </section>
      </>
    );
  }

  function renderCheckPage() {
    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">INTERNSHIP VERIFICATION</span>
          <h2>Check before you accept.</h2>
          <p>
            Look for warning indicators in the company details, recruiter
            email, and payment request.
          </p>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Internship details</h2>
              <p>Fields marked with * are required.</p>
            </div>
          </div>
          {renderCheckerForm()}
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Safety assessment</h2>
              <p>Your current check result appears below.</p>
            </div>
          </div>
          {renderResult()}
        </section>
      </>
    );
  }

  function renderJobAnalyzer() {
    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">JOB DESCRIPTION SCREENING</span>
          <h2>Analyze a job description.</h2>
          <p>
            Paste an internship or job post to identify phrases that may need
            extra verification.
          </p>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Job description</h2>
              <p>Paste the complete job post below.</p>
            </div>
          </div>

          <form className="checker-form" onSubmit={analyzeJobDescription}>
            <div className="form-group">
              <label htmlFor="job-description">Job post text *</label>
              <textarea
                id="job-description"
                rows={10}
                value={jobDescription}
                onChange={(event) => {
                  setJobDescription(event.target.value);
                  setJobAnalysis(null);
                }}
                placeholder="Paste the internship description here..."
                required
              />
            </div>

            <button type="submit" className="primary-button">
              Analyze job post <span aria-hidden="true">→</span>
            </button>

            <p className="form-note">
              This is keyword-based screening, not a trained AI model or a
              definitive scam detector.
            </p>
          </form>
        </section>

        {jobAnalysis && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ANALYSIS RESULTS</span>
                <h2>Screening summary</h2>
                <p>
                  {jobAnalysis.wordCount} words ·{" "}
                  {jobAnalysis.characterCount} characters
                </p>
              </div>
            </div>

            <div className="analysis-summary">
              <strong>{jobAnalysis.matches.length}</strong>
              <span>warning phrase(s) detected</span>
            </div>

            {jobAnalysis.matches.length === 0 ? (
              <div className="empty-result">
                <div className="empty-icon">✓</div>
                <h3>No listed warning phrases found</h3>
                <p>
                  This does not prove the job is genuine. Scams can use
                  different wording, so verify the employer independently.
                </p>
              </div>
            ) : (
              <div className="reports-list">
                {jobAnalysis.matches.map((match) => (
                  <article className="report-item" key={match.phrase}>
                    <div className="report-topline">
                      <h3>{match.phrase}</h3>
                      <span>{match.level}</span>
                    </div>
                    <p>{match.explanation}</p>
                  </article>
                ))}
              </div>
            )}

            <div className="disclaimer">
              Detected phrases are signals to investigate, not proof of fraud.
              Review the entire offer and verify the employer independently.
            </div>
          </section>
        )}
      </>
    );
  }

  function renderReportsPage() {
    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">COMMUNITY SAFETY</span>
          <h2>Scam report notebook</h2>
          <p>
            Record suspicious internship messages so you can keep track of
            what needs verification.
          </p>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Record a suspicious offer</h2>
              <p>
                Do not include passwords, OTPs, or sensitive identity
                information.
              </p>
            </div>
          </div>

          <form className="checker-form" onSubmit={submitReport}>
            <div className="form-group">
              <label htmlFor="report-company">
                Company or recruiter name *
              </label>
              <input
                id="report-company"
                value={reportCompany}
                onChange={(event) => setReportCompany(event.target.value)}
                placeholder="Enter the name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="report-details">What happened? *</label>
              <textarea
                id="report-details"
                rows={5}
                value={reportDetails}
                onChange={(event) => setReportDetails(event.target.value)}
                placeholder="Describe the suspicious request or message..."
                required
              />
            </div>

            <button type="submit" className="primary-button">
              Save report <span aria-hidden="true">→</span>
            </button>

            <p className="form-note">
              Reports are saved through the InternSafe-AI backend to its
              configured database.
            </p>
          </form>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Your recorded reports</h2>
              <p>{reports.length} report(s) loaded</p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="empty-result">
              <div className="empty-icon">⚑</div>
              <h3>No reports recorded yet</h3>
              <p>Reports saved to the backend will appear here.</p>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <article className="report-item" key={report.id}>
                  <div className="report-topline">
                    <h3>{report.company}</h3>
                    <span>{report.date}</span>
                  </div>
                  <p>{report.details}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  function renderSafetyTips() {
    const tips = [
      {
        number: "01",
        title: "Never rush into paying",
        text: "Treat unexpected registration, interview, training, or security fees as a reason to pause and verify. Do not pay just because a recruiter creates urgency.",
      },
      {
        number: "02",
        title: "Verify the company independently",
        text: "Find the company's official website yourself and use independently verified contact details to confirm the offer.",
      },
      {
        number: "03",
        title: "Inspect the recruiter email",
        text: "Look for misspellings and unusual domains. A free email address or domain mismatch deserves checking, but neither alone proves fraud.",
      },
      {
        number: "04",
        title: "Read the offer letter",
        text: "Check the role, work, duration, stipend, reporting contact, and conditions. Be cautious if important details are missing or contradictory.",
      },
      {
        number: "05",
        title: "Protect personal information",
        text: "Never share passwords, OTPs, or banking PINs. Avoid sending unnecessary identity documents or installing unknown software at a recruiter's request.",
      },
    ];

    return (
      <>
        <section className="page-intro">
          <span className="eyebrow">STAY INFORMED</span>
          <h2>Five habits for safer applications.</h2>
          <p>
            Use this checklist whenever you apply for an internship, job, or
            training program.
          </p>
        </section>

        <section className="tips-list">
          {tips.map((tip) => (
            <article className="safety-tip" key={tip.number}>
              <div className="tip-number">{tip.number}</div>
              <div>
                <h3>{tip.title}</h3>
                <p>{tip.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="content-card safety-reminder">
          <div className="tip-icon">!</div>
          <div>
            <h3>Think you encountered a scam?</h3>
            <p>
              Preserve messages and transaction records. In India, you can
              report cybercrime through the official National Cyber Crime
              Reporting Portal at cybercrime.gov.in. If money has been lost,
              contact your bank promptly and consider calling 1930.
            </p>
          </div>
        </section>
      </>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "Check Internship":
        return renderCheckPage();
      case "Job Analyzer":
        return renderJobAnalyzer();
      case "Scam Reports":
        return renderReportsPage();
      case "Safety Tips":
        return renderSafetyTips();
      default:
        return renderDashboard();
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          type="button"
          className="brand"
          onClick={() => setActivePage("Dashboard")}
          aria-label="InternSafe-AI dashboard"
        >
          <span className="brand-mark">IS</span>
          <span className="brand-name">
            InternSafe<span>-AI</span>
            <small>CAREER SAFETY PLATFORM</small>
          </span>
        </button>

        <div className="nav-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.name}</span>
              {activePage === item.name && (
                <span className="nav-active-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-shield">✓</div>
          <h3>Stay one step ahead.</h3>
          <p>Verify first. Apply confidently.</p>
        </div>

        <div className="sidebar-footer">INTERN SAFE · 2026</div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-crumb">
            <span className="breadcrumb">Workspace /</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <span className="status-dot" />
            <span>Safety workspace</span>
            <div className="avatar" aria-label="User">
              IS
            </div>
          </div>
        </header>

        <div className="page-content">
          {renderPage()}

          <footer className="app-footer">
            <span>© 2026 InternSafe-AI</span>
            <span>Verify every offer independently.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
