import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { initializeContract, getArticle, getArticleCount } from '../ContractIntegration';
import { ethers } from 'ethers';

const Profile = ({ walletAddress }) => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (walletAddress) {
      console.log('Wallet Address in Profile:', walletAddress); // Debug log to check if Profile gets the address
    } else {
      console.warn('Wallet address not provided.');
    }
  }, [walletAddress]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (walletAddress) {
        try {
          const { contract } = await initializeContract();
          const articleCount = await getArticleCount(contract);

          const fetchedArticles = [];
          for (let i = 1; i <= articleCount; i++) {
            const article = await getArticle(contract, i);

            if (article.author.toLowerCase() === walletAddress.toLowerCase()) {
              try {
                const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${article.contentHash}`);
                fetchedArticles.push({ ...article, content: response.data });
              } catch (error) {
                fetchedArticles.push({ ...article, content: 'Error fetching content' });
              }
            }
          }

          setArticles(fetchedArticles);
          setProfilePic('https://via.placeholder.com/150');
          setLoading(false);
        } catch (error) {
          console.error('Error fetching profile data:', error);
          setLoading(false);
        }
      } else {
        console.log('Wallet address not provided.');
      }
    };

    fetchProfileData();
  }, [walletAddress]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-48 w-48 bg-gray-400 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-gray-400 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-400 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-400 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-400 rounded-lg mb-2"></div>
            </div>
          ) : (
            <>
              <img
                src={profilePic}
                alt="Profile"
                className="h-48 w-48 rounded-full mb-6 object-cover shadow-lg"
              />
              <h1 className="text-3xl font-bold mb-2">
                {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'User'}
              </h1>
              <p className="text-gray-400 mb-8">Articles posted by you</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {articles.length === 0 ? (
                  <p>No articles posted yet.</p>
                ) : (
                  articles.map((article, index) => (
                    <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
                      <p className="text-gray-500 mb-4">
                        {article.isFree ? 'Free Article' : `Price: ${ethers.utils.formatEther(article.subscriptionPrice)} ETH`}
                      </p>
                      <p className="text-gray-300 mb-4">
                        {article.content.length > 100
                          ? `${article.content.substring(0, 100)}...`
                          : article.content}
                      </p>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                      >
                        View Article
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
