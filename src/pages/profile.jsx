import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { initializeContract, getArticle, getArticleCount } from '../ContractIntegration';
import { ethers } from 'ethers';

const Profile = ({ walletAddress }) => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

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

          // Load articles
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

          // Fetch followers and following from decentralized storage
          try {
            const socialDataResponse = await axios.get(`https://gateway.pinata.cloud/ipfs/YOUR_JSON_FILE_HASH`);
            const socialData = socialDataResponse.data;
            setFollowers(socialData.followers || []);
            setFollowing(socialData.following || []);
          } catch (error) {
            console.error('Error fetching social data:', error);
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
    <div className="bg-gray-900 text-white min-h-screen poppins-regular">
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
              <div className="flex flex-col items-center">
                <img
                  src={profilePic}
                  alt="Profile"
                  className="h-48 w-48 rounded-full mb-6 object-cover shadow-lg"
                />
                <h1 className="text-3xl font-bold mb-2">
                  {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'User'}
                </h1>
                <div className="flex space-x-8 mt-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{followers.length}</h2>
                    <p className="text-gray-400">Followers</p>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{following.length}</h2>
                    <p className="text-gray-400">Following</p>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{articles.length}</h2>
                    <p className="text-gray-400">Articles</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-10 lg:grid-cols-4 gap-8">
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
