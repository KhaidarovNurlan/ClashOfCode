import React from 'react'
import { Link } from 'react-router-dom'
import { Code, Terminal, Award, Users, BookOpen, Trophy } from 'lucide-react'

const Home = () => {
  return (
    <div className="animate-fadeIn">
      {/* Hero section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Master Coding Through <span className="text-blue-500">Competition</span>
          </h1>
          <p className="mt-6 text-xl text-slate-300 max-w-3xl mx-auto">
            Learn programming languages by solving challenges, competing in tournaments, and progressing through gamified courses.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Coding Now
            </Link>
            <Link to="/courses" className="btn btn-outline btn-lg">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-slate-800/50 rounded-2xl my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Why Clash Of Code?</h2>
            <p className="mt-4 text-xl text-slate-300">
              Our platform combines learning with competition to keep you motivated
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Terminal size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Interactive Challenges</h3>
              <p className="text-slate-300">
                Solve coding problems in our interactive environment with real-time feedback and analysis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Trophy size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Competitive Tournaments</h3>
              <p className="text-slate-300">
                Compete against other programmers in live tournaments to test your skills and win rewards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <BookOpen size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Structured Courses</h3>
              <p className="text-slate-300">
                Learn programming languages from scratch with our comprehensive courses and progress tracking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Award size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Achievement System</h3>
              <p className="text-slate-300">
                Earn badges, points, and certificates as you complete challenges and master new skills.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Users size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Community Learning</h3>
              <p className="text-slate-300">
                Connect with other learners, share solutions, and learn together in a supportive community.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <Code size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multiple Languages</h3>
              <p className="text-slate-300">
                Practice in JavaScript, Python, Java, and more with language-specific challenges and support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to become a better programmer?
          </h2>
          <p className="mt-4 text-xl text-slate-300">
            Join thousands of programmers who are improving their skills through fun, competitive coding.
          </p>
          <div className="mt-10">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home