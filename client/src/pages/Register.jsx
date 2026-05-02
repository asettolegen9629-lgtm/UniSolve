import React from 'react'
import { Check } from 'lucide-react'
import { SignUp } from '@clerk/clerk-react'
import { clerkAuthAppearance } from '../clerkAppearance'

/**
 * Must match `signUpUrl` on `<SignIn />` and `Route path="/sign-up"` in `App.jsx`.
 * Without this route, `/sign-up` was caught by `*` and broke Clerk OAuth / sign-up flows.
 */
const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-5 bg-gray-50 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-orange-500 to-red-500 rounded-full -top-32 sm:-top-64 -right-32 sm:-right-64 opacity-10 animate-float" />
      <div className="absolute w-[240px] sm:w-96 h-[240px] sm:h-96 bg-gradient-to-tl from-orange-500 to-red-500 rounded-full -bottom-24 sm:-bottom-48 -left-24 sm:-left-48 opacity-10 animate-float-reverse" />

      <div className="relative z-10 w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="flex flex-col justify-center bg-gradient-to-br from-orange-500 to-red-500 p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden min-h-[250px] md:min-h-0">
          <div className="absolute w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-white/10 rounded-full -top-16 sm:-top-24 -right-16 sm:-right-24" />
          <div className="absolute w-[100px] sm:w-[150px] h-[100px] sm:h-[150px] bg-white/10 rounded-full -bottom-12 sm:-bottom-20 -left-12 sm:-left-20" />
          <div className="relative w-16 sm:w-20 h-16 sm:h-20 bg-white/20 backdrop-blur-md rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-[32px] sm:text-[40px] font-bold mb-4 sm:mb-6 border-2 border-white/30">
            U
          </div>
          <h1 className="relative text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">UniSolve</h1>
          <p className="relative text-sm sm:text-base opacity-90 leading-relaxed mb-6 sm:mb-10">
            Join your campus community and start reporting what matters.
          </p>
          <div className="relative space-y-3 sm:space-y-4 hidden sm:block">
            {[
              'Quick issue reporting',
              'Real-time status updates',
              'Community feedback',
            ].map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="w-5 sm:w-6 h-5 sm:h-6 bg-white/20 rounded-full flex items-center justify-center mr-2 sm:mr-3 text-sm">
                  <Check className="w-3 sm:w-4 h-3 sm:h-4" />
                </div>
                <span className="text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center">
          <SignUp
            appearance={clerkAuthAppearance}
            routing="virtual"
            signInUrl="/"
          />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -50px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-reverse { animation: float 15s ease-in-out infinite reverse; }
        @media (max-width: 640px) {
          .cl-internal-b3fm6y { padding: 0 !important; }
          .cl-card { box-shadow: none !important; }
          .cl-formButtonPrimary { font-size: 14px !important; padding: 12px !important; }
          .cl-socialButtonsBlockButton { font-size: 14px !important; padding: 10px !important; }
          .cl-formFieldInput { font-size: 14px !important; padding: 10px 12px !important; }
        }
      `}</style>
    </div>
  )
}

export default Register
