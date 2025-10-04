
import React from 'react';

const Header: React.FC = () => {
  // Base styles for all buttons to ensure consistency in size, font, and interaction
  const baseButtonClasses = "px-5 py-2 rounded-lg font-bold text-base text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg transform hover:scale-105 transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2";

  // Unique styles for each button
  const supportButtonClasses = "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40";


  return (
    <header className="text-white py-2 px-4 flex items-center justify-between border-b border-slate-700/50 flex-shrink-0">
      <div className="flex-1 flex items-center min-w-0">
        <a href="https://lamyoutubeai.com" target="_blank" rel="noopener noreferrer" className="text-lg font-bold whitespace-nowrap flex-shrink-0">
          <span className="text-white">AI</span>
          <span className="text-blue-500">Creators</span>
          <span className="text-slate-400 mx-2 font-light">|</span>
          <span className="text-white">Làm</span>
          <span className="text-red-500 ml-2">Youtube</span>
          <span className="text-white ml-1">AI</span>
        </a>
        <p className="flex-1 text-lg font-semibold text-white text-right truncate pl-6">
          Tôi là <span className="text-yellow-400">Huỳnh Xuyên Sơn</span> - Trợ lý đắc lực của bạn
        </p>
      </div>

      <div className="flex items-center space-x-4 mx-6 flex-shrink-0">
        <a href="https://lamyoutubeai.com/support" target="_blank" rel="noopener noreferrer">
          <button className={`${baseButtonClasses} ${supportButtonClasses}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0110 5c1.657 0 3 1.343 3 3 0 1.05-.6 1.954-1.448 2.457A1 1 0 1110.5 12.5v.5a1 1 0 11-2 0v-.5c0-.495.235-.954.632-1.293C9.67 10.375 10 9.875 10 9c0-.551-.449-1-1-1a1 1 0 00-1 1zM9 14a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
            </svg>
            <span>Giải đáp - Hỗ trợ</span>
          </button>
        </a>
      </div>
      
      <p className="flex-1 text-lg font-semibold text-white text-left truncate">
        Chia sẻ kiến thức công nghệ AI
      </p>
    </header>
  );
};

export default Header;
