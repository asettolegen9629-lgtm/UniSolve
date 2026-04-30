import React from 'react'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crash:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="max-w-xl w-full rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h1 className="text-lg font-semibold mb-2">Application error</h1>
            <p className="text-sm mb-4">
              The page crashed while loading. Open browser console and copy the red error text.
            </p>
            <pre className="text-xs whitespace-pre-wrap break-words">{this.state.message}</pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
