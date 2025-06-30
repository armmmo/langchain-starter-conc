'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight, Bot, FileText, Zap, Shield, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            {session ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Get Started</Button>
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
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-4">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-4">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    View Pricing
                  </Button>
                </Link>
              </>
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle className="text-xl">Smart Document Processing</CardTitle>
              <CardDescription>
                Upload PDFs, Word docs, and text files. Our AI automatically extracts, chunks, and indexes your content for intelligent search.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Bot className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle className="text-xl">RAG-Powered Chat</CardTitle>
              <CardDescription>
                Ask questions about your documents in natural language. Get accurate answers with source citations and context.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Zap className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle className="text-xl">Lightning Fast Search</CardTitle>
              <CardDescription>
                Vector-powered semantic search finds relevant information instantly, even when exact keywords don&apos;t match.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle className="text-xl">Enterprise Security</CardTitle>
              <CardDescription>
                Role-based access control, team isolation, and secure data handling. Your documents stay private and protected.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle className="text-xl">Team Collaboration</CardTitle>
              <CardDescription>
                Share knowledge bases with your team. Multiple users can chat with the same documents and build collective intelligence.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle className="text-xl">Flexible Pricing</CardTitle>
              <CardDescription>
                Start free and scale as you grow. Pay only for what you use with transparent, usage-based pricing.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Trusted by teams worldwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to make your documents intelligent?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of teams using AI to unlock the knowledge in their documents.
          </p>
          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-4">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6" />
                <span className="text-lg font-bold">AI SaaS Platform</span>
              </div>
              <p className="text-gray-400">
                Intelligent document processing powered by advanced AI.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI SaaS Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
