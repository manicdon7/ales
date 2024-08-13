import React from 'react';
import Connect from './Connect';

const Navbar = () => {
  return (
    <div className="py-2 px-20 bg-black w-full">
      <div className="flex justify-between text-white py-2 bg-[#CCD5AE] rounded-full px-4">
        <div className="flex items-center">
          <h1 className="text-[#0C359E] text-2xl font-bold">Ales</h1>
        </div>
        <div className="flex text-black items-center gap-6">
          <a href="/" className="text-lg">
            Home
          </a>
          <a href="/Dashboard" className="text-lg">
            Dashboard
          </a>
          <a href="/postarticle" className="text-lg">
            Publish
          </a>
          <a href="/articles" className="text-lg">
            Articles
          </a>
        </div>
        <Connect />
      </div>
    </div>
  );
};

export default Navbar;