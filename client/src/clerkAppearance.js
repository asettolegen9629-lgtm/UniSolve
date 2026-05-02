/** Shared Clerk `<SignIn />` / `<SignUp />` styling. */
export const clerkAuthAppearance = {
  elements: {
    rootBox: 'w-full',
    card: 'shadow-none w-full',
    formButtonPrimary:
      'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm sm:text-base',
    formFieldInput:
      'rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm sm:text-base',
    footerActionLink: 'text-orange-500 hover:text-orange-600 text-sm',
    identityPreviewEditButton: 'text-orange-500 hover:text-orange-600',
    formHeaderTitle: 'text-gray-900 text-xl sm:text-2xl',
    formHeaderSubtitle: 'text-gray-600 text-sm',
    socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50 text-sm sm:text-base',
    dividerLine: 'bg-gray-300',
    dividerText: 'text-gray-500 text-xs sm:text-sm',
    formFieldLabel: 'text-sm',
    footer: 'text-sm',
  },
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'blockButton',
  },
}
