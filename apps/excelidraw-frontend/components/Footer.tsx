import { GithubIcon } from "lucide-react";
import Link from "next/link";

export function Footer () {
  return (
    <>
      <footer className="py-6 fixed bottom-0 w-screen px-4 md:px-6 border-t border-gray-700 bg-white/10 z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-white">
            © 2025 100xDraws. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6 sm:mt-0">
            <Link href="/terms" className="text-sm hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm hover:underline underline-offset-4">
              Privacy
            </Link>
            
          </nav>
        </div>
      </footer>
    </>
  )
}