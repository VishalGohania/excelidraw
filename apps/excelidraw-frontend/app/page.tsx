'use client';

import React from 'react';
import { Pen, Zap, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ExcelidrawLanding() {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Pen className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Intuitive Drawing",
      description: "Create beautiful diagrams and sketches with our powerful yet simple drawing tools."
    },
    {
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Lightning Fast",
      description: "Experience smooth, responsive drawing with optimized performance and real-time updates."
    },
    {
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Collaborate Live",
      description: "Work together in real-time with your team on shared canvases and projects."
    },
    {
      icon: <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "AI-Powered",
      description: "Smart suggestions and auto-complete features to enhance your creative workflow."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30 sm:opacity-50">
          <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-4 sm:-bottom-8 left-20 sm:left-40 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Draw Beyond
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Imagination
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
            The most intuitive collaborative drawing tool that transforms your ideas into stunning visuals.
            Create, collaborate, and innovate with powerful features designed for modern teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <a href="/signup" className="group w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
              Start Drawing Free
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Button className="w-full sm:w-auto text-white border border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/10 transition-all duration-300">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Preview */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-32">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform duration-700">
          <div className="bg-white rounded-xl sm:rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
            <svg viewBox="0 0 400 200" className="w-full h-full relative z-10">
              <circle cx="100" cy="80" r="30" fill="#8b5cf6" className="animate-pulse" />
              <rect x="200" y="50" width="60" height="60" fill="#ec4899" className="animate-pulse animation-delay-1000" />
              <path d="M 50 150 Q 150 100 250 150 T 350 150" stroke="#06b6d4" strokeWidth="3" fill="none" className="animate-pulse animation-delay-2000" />
              <polygon points="300,40 320,80 280,80" fill="#10b981" className="animate-pulse animation-delay-3000" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Powerful Features for
              <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Creative Minds</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Everything you need to bring your ideas to life with professional-grade tools and seamless collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Ready to Start Creating?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
              Join thousands of creators who are already using Excelidraw to bring their ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <a href="/signup" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 text-center">
                Get Started Free
              </a>
              <Link href={{
                pathname: '/auth',
                query: {
                  authType: 'signIn'
                }
              }}>
                <Button className="w-full sm:w-auto text-white border border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/10 transition-all duration-300 text-center">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <Pen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">Excelidraw</span>
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">
              © 2025 Excelidraw. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}