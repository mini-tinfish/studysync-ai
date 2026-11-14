import { Component } from 'react'

/**
 * Catches render errors (including a lazily loaded chunk that fails to download) in one
 * part of the page, so the rest of the app keeps working. `fallback({ error, reset })`
 * renders the recovery UI; `reset` clears the error and renders the children again.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
    this.reset = () => this.setState({ error: null })
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.error) return this.props.fallback({ error: this.state.error, reset: this.reset })
    return this.props.children
  }
}
