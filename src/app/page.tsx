import Link from 'next/link'
import { ArrowRight, GitBranch, GitCommit, GitPullRequest } from 'lucide-react'

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-b from-gray-50 to-white">
      <main className="text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to <span className="text-indigo-600">Greptilog</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Automatically generate changelogs from your GitHub repository's commits. Simplify your release process and keep your users informed.
        </p>
        <div className="mt-10 flex justify-center">
          <Link href="/create" passHref>
            <Button size="lg" className="inline-flex items-center">
              Create a Changelog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-start space-y-10 sm:space-y-0 sm:space-x-10">
            <FeatureCard
              icon={GitBranch}
              title="Connect Repository"
              description="Link your GitHub repository to Greptilog"
            />
            <FeatureCard
              icon={GitCommit}
              title="Analyze Commits"
              description="We scan and categorize your commits"
            />
            <FeatureCard
              icon={GitPullRequest}
              title="Generate Changelog"
              description="Create a beautifully formatted changelog"
            />
          </div>
        </div>
      </main>
      <footer className="mt-20 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Greptilog. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center max-w-xs">
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-base text-gray-500">{description}</p>
    </div>
  )
}