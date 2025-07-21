'use client'

import React, { useState, useEffect } from 'react';
import { Pen, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-black/20 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <Pen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">Excelidraw</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4 lg:space-x-8">
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
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Link href={{
              pathname: '/auth',
              query: {
                authType: 'signIn'
              }
            }}>
              <Button type='submit' className="text-gray-300 hover:text-white rounded-full transition-colors duration-200 px-3 lg:px-6 py-2 text-sm lg:text-base transform hover:scale-105 whitespace-nowrap">
                Sign In
              </Button>
            </Link>

            <Link href={{
              pathname: '/auth',
              query: {
                authType: 'signUp'
              }
            }}>
              <Button type='submit' className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 lg:px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 text-sm lg:text-base whitespace-nowrap">
                Sign Up
              </Button>
            </Link>
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
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
        <div className="bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <a
              href="#features"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#about"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#pricing"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col sm:flex-row gap-2 px-3 py-2">
              <Link href={{
                pathname: '/auth',
                query: {
                  authType: 'signIn'
                }
              }}>
                <Button
                  type='submit'
                  className="text-center text-gray-300 hover:text-white px-4 py-2 hover:bg-white/10 rounded-md transition-colors duration-200"
                >
                  Sign In
                </Button>
              </Link>
              <Link href={{
                pathname: '/auth',
                query: {
                  authType: 'signUp'
                }
              }}>
                <Button
                  type='submit'
                  className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}