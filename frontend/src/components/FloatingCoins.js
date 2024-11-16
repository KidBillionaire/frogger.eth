import React from 'react';

function FloatingCoins() {
  // Array to hold multiple coins
  const coins = Array.from({ length: 20 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {coins.map((_, index) => (
        <div
          key={index}
          className="coin animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          <img src="/assets/gold_coin.png" alt="Gold Coin" className="w-8 h-8" />
        </div>
      ))}
    </div>
  );
}

export default FloatingCoins; 