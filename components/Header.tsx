import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="w-full flex flex-col items-center justify-center text-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/60">
            <h1 className="text-2xl md:text-3xl font-black text-gray-800">
                2025년 부산광역시 응급의료 유관기관 워크숍
            </h1>
            <p className="text-2xl md:text-3xl font-black text-pink-500 mt-2">
                <span role="img" aria-label="선물 아이콘" className="mr-2">🎁</span>
                <span>경품 추첨</span>
                <span role="img" aria-label="선물 아이콘" className="ml-2">🎁</span>
            </p>
        </header>
    );
};

export default Header;