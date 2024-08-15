import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Post from './pages/Post';
import Articles from './pages/Articles';
import ArticleView from './pages/ArticleView';
import Profile from './pages/profile';
import Navbar from './components/Navbar';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  const handleWalletAddressUpdate = (address) => {
    setWalletAddress(address);
  };

  return (
    <div>
      <Navbar onWalletAddressUpdate={handleWalletAddressUpdate} />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/postarticle" element={<Post />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/profile" element={<Profile walletAddress={walletAddress} />} />
          <Route path="/articleview/:id" element={<ArticleView />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
