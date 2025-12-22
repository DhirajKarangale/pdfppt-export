import { memo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Presentation,
  Github,
  BookOpen,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Code2,
  Sparkles,
  ArrowRight,
  Heart,
  MessageSquare,
  GitPullRequest
} from "lucide-react";

function Home() {
  const features = [
    {
      icon: FileText,
      title: "Smart PDF Export",
      description: "Multi-page A4 PDFs with intelligent pagination. Elements never split across pages.",
    },
    {
      icon: Presentation,
      title: "Native PowerPoint",
      description: "Real editable PPT elements—charts, text boxes, and shapes, not just screenshots.",
    },
    {
      icon: Code2,
      title: "DOM-Driven",
      description: "No component rewrites needed. If it renders in the browser, we can export it.",
    },
    {
      icon: Sparkles,
      title: "Chart Support",
      description: "Works with Recharts, Chart.js, Victory, Nivo, and any React chart library.",
    },
  ];

  const roadmapItems = [
    "Enhanced PPT layout algorithms",
    "More chart type support",
    "Custom theme system",
    "Export hooks API",
    "Batch export capabilities",
    "TypeScript definitions"
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Open Source • MIT Licensed
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Export React Dashboards to
              <span className="text-blue-600"> PDF & PowerPoint</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              A structure-first export utility that converts your rendered charts, KPIs, and tables into professional PDFs and editable PowerPoint presentations—without rewriting your components.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Monitor className="w-5 h-5" />
                View Live Demo
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/documentation"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors border border-slate-300 shadow"
              >
                <BookOpen className="w-5 h-5" />
                Read Documentation
              </Link>

              <a
                href="https://github.com/DhirajKarangale/pdfppt-export"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Zero Config</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>React 16.8+</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Battle-Tested Deps</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Why Choose This Library?
              </h2>
              <p className="text-lg text-slate-600">
                Built on stable, battle-tested packages with 1M+ weekly downloads
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* PPT Disclaimer */}
      <section className="py-16 bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-amber-200 p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">
                    PowerPoint Export Status
                  </h3>
                  <p className="text-amber-800 leading-relaxed mb-3">
                    PPT export is currently <strong>experimental</strong> and uses heuristic-based layout algorithms. While it works well for standard card layouts, complex absolute positioning or deeply nested structures may not translate perfectly.
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    <strong>We're actively improving:</strong> Slide layout intelligence, alignment accuracy, and style preservation. Follow the documented conventions for best results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4 text-red-400" />
              Built by Developers, for Developers
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Open Source & Community Driven
            </h2>

            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              This project is <strong>MIT licensed</strong> and welcomes contributions from the community. Whether you're fixing bugs, adding features, or improving documentation—your help is valued.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <Github className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Fork & Star</h3>
                <p className="text-slate-400 text-sm">
                  Clone the repository and start contributing today
                </p>
              </div>

              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <MessageSquare className="w-8 h-8 text-emerald-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Report Issues</h3>
                <p className="text-slate-400 text-sm">
                  Found a bug? Open an issue and help us improve
                </p>
              </div>

              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <GitPullRequest className="w-8 h-8 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Submit PRs</h3>
                <p className="text-slate-400 text-sm">
                  Contribute features, fixes, or documentation updates
                </p>
              </div>
            </div>

            <a
              href="https://github.com/DhirajKarangale/pdfppt-export"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors shadow-xl"
            >
              <Github className="w-5 h-5" />
              Contribute on GitHub
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Future Roadmap
              </h2>
              <p className="text-lg text-slate-600">
                Planned improvements and upcoming features
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {roadmapItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-center text-slate-700">
                <strong>Have a feature request?</strong>{" "}
                <a
                  href="https://github.com/DhirajKarangale/pdfppt-export/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  Open an issue on GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Export Your Dashboard?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get started in under 5 minutes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Monitor className="w-5 h-5" />
              Try Live Demo
            </Link>
            <Link
              to="/documentation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors border border-blue-500"
            >
              <BookOpen className="w-5 h-5" />
              View Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm mb-2">
            Built with React, TailwindCSS, jsPDF, html-to-image, and PptxGenJS
          </p>
          <p className="text-xs text-slate-500">
            MIT Licensed • Open Source • Community Driven
          </p>
        </div>
      </footer>
    </div>
  );
}

export default memo(Home);