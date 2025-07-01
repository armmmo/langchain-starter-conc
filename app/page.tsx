'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight, Bot, FileText, Zap, Shield, Users, Check } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">AI SaaS Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <Link href="/chat" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Go to Chat
              </Link>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth/signin" className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Document Intelligence
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your documents into intelligent conversations. Upload, search, and chat with your knowledge base using advanced RAG technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <Link href="/chat" className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg hover:bg-blue-700 inline-flex items-center">
                Start Chatting <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link href="/auth/signup" className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg hover:bg-blue-700 inline-flex items-center">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful AI Features
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to make your documents intelligent
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <FileText className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Smart Document Processing</h3>
            <p className="text-gray-600">
              Upload PDFs, Word docs, and text files. Our AI automatically extracts, chunks, and indexes your content for intelligent search.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Bot className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">RAG-Powered Chat</h3>
            <p className="text-gray-600">
              Ask questions about your documents in natural language. Get accurate answers with source citations and context.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Zap className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Lightning Fast Search</h3>
            <p className="text-gray-600">
              Vector-powered semantic search finds relevant information instantly, even when exact keywords don&apos;t match.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Shield className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Enterprise Security</h3>
            <p className="text-gray-600">
              Role-based access control, team isolation, and secure data handling. Your documents stay private and protected.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Users className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
            <p className="text-gray-600">
              Share knowledge bases with your team. Multiple users can chat with the same documents and build collective intelligence.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Zap className="h-12 w-12 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Flexible Pricing</h3>
            <p className="text-gray-600">
              Start free and scale as you grow. Pay only for what you use with transparent, usage-based pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bot className="h-6 w-6" />
              <span className="text-lg font-bold">AI SaaS Platform</span>
            </div>
            <p className="text-gray-400">
              Intelligent document processing powered by advanced AI.
            </p>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 AI SaaS Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
