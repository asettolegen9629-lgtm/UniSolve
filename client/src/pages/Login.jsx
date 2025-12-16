import React from 'react'
import {assets} from '../assets/assets'
import { Star } from 'lucide-react'
import { Check } from 'lucide-react'
import {SignIn} from '@clerk/clerk-react'

const Login = () => {
  return (
  
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-5 bg-gray-50 transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-orange-500 to-red-500 rounded-full -top-32 sm:-top-64 -right-32 sm:-right-64 opacity-10 animate-float" />
      <div className="absolute w-[240px] sm:w-96 h-[240px] sm:h-96 bg-gradient-to-tl from-orange-500 to-red-500 rounded-full -bottom-24 sm:-bottom-48 -left-24 sm:-left-48 opacity-10 animate-float-reverse" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center bg-gradient-to-br from-orange-500 to-red-500 p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden min-h-[250px] md:min-h-0">
          {/* Decorative Blobs */}
          <div className="absolute w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-white/10 rounded-full -top-16 sm:-top-24 -right-16 sm:-right-24" />
          <div className="absolute w-[100px] sm:w-[150px] h-[100px] sm:h-[150px] bg-white/10 rounded-full -bottom-12 sm:-bottom-20 -left-12 sm:-left-20" />
          
          {/* Logo */}
          <div className="relative w-16 sm:w-20 h-16 sm:h-20 bg-white/20 backdrop-blur-md rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-[32px] sm:text-[40px] font-bold mb-4 sm:mb-6 border-2 border-white/30">
            U
          </div>

          {/* Title */}
          <h1 className="relative text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">UniSolve</h1>
          
          {/* Subtitle */}
          <p className="relative text-sm sm:text-base opacity-90 leading-relaxed mb-6 sm:mb-10">
            Your campus, your voice. Report issues and make a difference in your university community.
          </p>

          {/* Features - Hidden on mobile, visible on tablet+ */}
          <div className="relative space-y-3 sm:space-y-4 hidden sm:block">
            {[
              'Quick issue reporting',
              'Real-time status updates',
              'Anonymous submissions',
              'Community feedback'
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

        {/* Right Side - Clerk SignIn */}
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none w-full",
                formButtonPrimary: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm sm:text-base",
                formFieldInput: "rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm sm:text-base",
                footerActionLink: "text-orange-500 hover:text-orange-600 text-sm",
                identityPreviewEditButton: "text-orange-500 hover:text-orange-600",
                formHeaderTitle: "text-gray-900 text-xl sm:text-2xl",
                formHeaderSubtitle: "text-gray-600 text-sm",
                socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50 text-sm sm:text-base",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-500 text-xs sm:text-sm",
                formFieldLabel: "text-sm",
                footer: "text-sm"
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton"
              }
            }}
            routing="path"
            path="/"
            signUpUrl="/sign-up"
          />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -50px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float 15s ease-in-out infinite reverse;
        }

        /* Mobile optimizations for Clerk */
        @media (max-width: 640px) {
          .cl-internal-b3fm6y {
            padding: 0 !important;
          }
          
          .cl-card {
            box-shadow: none !important;
          }

          .cl-formButtonPrimary {
            font-size: 14px !important;
            padding: 12px !important;
          }

          .cl-socialButtonsBlockButton {
            font-size: 14px !important;
            padding: 10px !important;
          }

          .cl-formFieldInput {
            font-size: 14px !important;
            padding: 10px 12px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Login