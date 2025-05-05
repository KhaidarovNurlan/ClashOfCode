import React from 'react'
import { Link } from 'react-router-dom'
import { Code, Github, Twitter, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-slate-800 border-t border-slate-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and tagline */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center">
              <Code size={28} className="text-blue-500 mr-2" />
              <span className="text-xl font-bold">Clash Of Code</span>
            </Link>
            <p className="mt-4 text-sm text-slate-400">
              Master programming through interactive challenges, competitions, and collaborative learning.
            </p>
            <div className="mt-4 flex space-x-4">
              <a 
                href="#" 
                className="text-slate-400 hover:text-blue-500"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="#" 
                className="text-slate-400 hover:text-blue-500"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-slate-400 hover:text-blue-500"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/courses" className="text-sm text-slate-400 hover:text-blue-500">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="text-sm text-slate-400 hover:text-blue-500">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-slate-400 hover:text-blue-500">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-slate-400 hover:text-blue-500">
                  Community
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-slate-400 hover:text-blue-500">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="#" className="text-sm text-slate-400 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-slate-400 hover:text-blue-500">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-slate-400 hover:text-blue-500">
                  Code of Conduct
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} Clash Of Code. All rights reserved.
          </p>
          <p className="text-sm text-slate-400 mt-4 md:mt-0">
            Made with <span className="text-red-500">♥</span> for programmers everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer