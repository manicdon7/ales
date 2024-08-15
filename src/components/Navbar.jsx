import React, { useState } from 'react';
import Connect from './Connect';

const Navbar = ({ onWalletAddressUpdate }) => { // Forwarding the prop

  const [walletAddress, setWalletAddress] = useState(null);

  const handleWalletAddressUpdate = (address) => {
    console.log("Wallet Address Updated:", address);
    setWalletAddress(address);

    // Also forward the updated address to the App component
    if (onWalletAddressUpdate) {
      onWalletAddressUpdate(address);
    }
  };

  return (
    <div className="py-2 px-20 bg-gray-800 w-full">
      <div className="flex justify-between text-white py-2 bg-[#CCD5AE] rounded-full px-4">
        <div className="flex items-center">
          <h1 className="text-[#0C359E] text-2xl font-bold font-bowlby">Ales</h1>
        </div>
        <div className="flex text-black items-center gap-6">
          <a href="/" className="text-lg">Home</a>
          <a href="/profile" className="text-lg">Profile</a>
          <a href="/postarticle" className="text-lg">Publish</a>
          <a href="/articles" className="text-lg">Articles</a>
        </div>
        <Connect onWalletAddressUpdate={handleWalletAddressUpdate} />
      </div>
    </div>
  );
};

export default Navbar;
