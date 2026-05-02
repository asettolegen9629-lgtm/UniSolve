import React from 'react'

/**
 * Shown when the production build has no VITE_API_URL (avoids silent failures / blank feeds).
 */
export const MissingApiConfig = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div className="max-w-lg w-full rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
      <h1 className="text-lg font-semibold mb-2">Backend URL not configured</h1>
      <p className="text-sm mb-3">
        Set <code className="rounded bg-amber-100 px-1">VITE_API_URL</code> in Vercel → Project →
        Settings → Environment Variables (for example{' '}
        <code className="rounded bg-amber-100 px-1 break-all">
          https://your-service.onrender.com/api
        </code>
        ), then redeploy.
      </p>
    </div>
  </div>
)
