import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-white py-3 px-6 flex items-center justify-between border-b border-slate-700/50 flex-shrink-0">
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
          Tôi là <span className="text-yellow-400">Lữ Khách</span> - Trợ lý đắc lực của bạn
        </p>
      </div>

      <a href="https://lamyoutubeai.com/academy" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mx-6">
        <button className="px-6 py-2 rounded-md font-bold text-base text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transform hover:scale-110 transition-all duration-300">
          Tham gia khóa học
        </button>
      </a>
      
      <p className="flex-1 text-lg font-semibold text-white text-left truncate">
        Chia sẻ kiến thức công nghệ AI
      </p>
    </header>
  );
};

export default Header;