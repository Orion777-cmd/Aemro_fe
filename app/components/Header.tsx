"use client";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="border-b border-gold-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden text-gold-500 hover:text-gold-400 transition-colors p-2"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center overflow-hidden">
              <svg
                className="w-5 h-5 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h1v1c0 1.1.9 2 2 2h.5c.28 0 .5.22.5.5v.5c0 .28.22.5.5.5h1c.28 0 .5-.22.5-.5V21c0-.28.22-.5.5-.5H15c1.1 0 2-.9 2-2v-1h1c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 2.88-2.88 7.19-5 9.88C9.88 16.19 7 11.88 7 9c0-2.76 2.24-5 5-5z"/>
                <circle cx="9" cy="9" r="1.5"/>
                <circle cx="15" cy="9" r="1.5"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-gold-500 to-gold-600 bg-clip-text text-transparent">
              Aemro <span className="text-gold-400 text-lg">አምሮ</span>
            </h1>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
            Your AI Study Buddy
          </div>
        </div>
      </div>
    </header>
  );
}
