import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center gap-6 px-4 text-center py-20">
          <p className="text-slate-400 text-sm max-w-xs">
            Algo salió mal. Recarga la página o vuelve al inicio.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
            >
              Recargar
            </button>
            <a
              href="/"
              className="bg-[#60A5FA] text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all"
            >
              Ir al inicio
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
