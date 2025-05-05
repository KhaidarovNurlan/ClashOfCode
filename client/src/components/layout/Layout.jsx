import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Toast from '../common/Toast'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  )
}

export default Layout