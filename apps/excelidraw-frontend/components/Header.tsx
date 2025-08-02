'use client'

import React, { useState, useEffect } from 'react';
import { Pen, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
// Import useSession and signOut for authentication state
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Get session status and data from NextAuth
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' }); // Sign out and redirect to homepage
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-black/20 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Pen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">Excelidraw</span>
          </Link>

          {/* FIX: Wrapper for all right-side desktop elements */}
          <div className="hidden md:flex items-center space-x-10">
            {/* Desktop Navigation */}
            <div className="flex items-baseline space-x-4 lg:space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1">
                Features
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1">
                About
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-200 px-2 py-1">
                Pricing
              </a>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {status === 'loading' && (
                <div className="h-10 w-36 bg-gray-700 rounded-full animate-pulse"></div>
              )}

              {status === 'unauthenticated' && (
                <>
                  <Link href={{ pathname: '/auth', query: { authType: 'signIn' } }}>
                    <Button variant="ghost" className="text-gray-300 hover:text-white rounded-full transition-colors duration-200 px-3 lg:px-6 py-2 text-sm lg:text-base transform hover:scale-105 whitespace-nowrap">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={{ pathname: '/auth', query: { authType: 'signUp' } }}>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 lg:px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 text-sm lg:text-base whitespace-nowrap">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              {status === 'authenticated' && (
                <>
                  <span className="text-sm text-gray-300 hidden lg:block whitespace-nowrap">Welcome, {session.user?.name || session.user?.email}</span>
                  <Button onClick={handleLogout} variant="destructive" className="px-4 lg:px-6 py-2 rounded-full text-sm lg:text-base whitespace-nowrap">
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        {/* ... your mobile menu logic, which can also be updated with auth status ... */}
      </div>
    </nav>
  );
}