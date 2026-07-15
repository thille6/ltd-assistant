import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled error boundary', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel">
          <h2>Ett allvarligt fel inträffade</h2>
          <p>Appen kunde inte fortsätta säkert. Ladda om sidan och exportera data om felet återkommer.</p>
        </section>
      )
    }

    return this.props.children
  }
}
