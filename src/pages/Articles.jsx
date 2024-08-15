import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import { initializeContract, getArticleCount, getArticle, buyArticle, buyCoffee } from '../ContractIntegration';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [freeArticles, setFreeArticles] = useState([]);
    const [premiumArticles, setPremiumArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState({});
    const [walletConnected, setWalletConnected] = useState(false);
    const [contract, setContract] = useState(null);
    const [activeTab, setActiveTab] = useState('free'); // Default to 'free' articles tab

    useEffect(() => {
        const initialize = async (retryCount = 0) => {
            if (retryCount >= 3) { // Retry up to 3 times
                setError('Failed to initialize contract after multiple attempts.');
                setLoading(false);
                return;
            }

            console.log("Initializing contract... Attempt:", retryCount + 1);
            try {
                const { contract, address } = await initializeContract();
                if (address) {
                    console.log("Contract initialized:", address, contract);
                    setContract(contract);
                    setWalletConnected(true);
                    setLoading(false);
                } else {
                    throw new Error('Wallet address not found.');
                }
            } catch (error) {
                console.error('Error initializing contract, retrying...', error);
                // Retry after a brief delay
                setTimeout(() => initialize(retryCount + 1), 2000); // Retry after 2 seconds
            }
        };

        initialize();
    }, []);

    useEffect(() => {
        if (!contract) return;

        const fetchArticles = async () => {
            console.log("Fetching articles...");
            try {
                const count = await getArticleCount(contract);
                const articlePromises = [];

                for (let i = 1; i <= count; i++) {
                    articlePromises.push(getArticle(contract, i));
                }

                const articles = await Promise.all(articlePromises);

                const articlesWithContent = await Promise.all(articles.map(async (article) => {
                    try {
                        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${article.contentHash}`);
                        return { ...article, content: response.data };
                    } catch (error) {
                        console.error('Error fetching article content from IPFS:', error);
                        return { ...article, content: 'Error fetching content' };
                    }
                }));

                // Filter and separate free and premium articles
                const free = articlesWithContent.filter(article => article.isFree);
                const premium = articlesWithContent.filter(article => !article.isFree);

                setFreeArticles(free);
                setPremiumArticles(premium);
            } catch (error) {
                console.error('Error fetching articles:', error);
                setError('Failed to load articles. Please try again.');
            }
        };

        fetchArticles();
    }, [contract]);

    const handleBuyCoffee = async (articleId) => {
        const amount = prompt("Enter the amount of ETH to send:");
        if (!amount) return;

        try {
            await buyCoffee(contract, articleId, amount);
            alert(`You have successfully sent ${amount} ETH to the author.`);
        } catch (error) {
            console.error('Error sending coffee:', error);
            alert('Failed to send ETH. Please try again.');
        }
    };

    const handleBuyArticle = async (articleId, subscriptionPrice) => {
        try {
            await buyArticle(contract, articleId, subscriptionPrice);
            alert('Article purchased successfully! You can now read it anytime.');
        } catch (error) {
            console.error('Error purchasing article:', error);
            alert('Failed to purchase article. Please try again.');
        }
    };

    const truncateAddress = (address) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const truncateContent = (content, length = 100) => {
        const strippedContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
        return strippedContent.length > length ? `${strippedContent.substring(0, length)}...` : strippedContent;
    };

    // Show error message if there's an error
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    const renderArticleList = (articles) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {articles.map((article, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <Link to={`/articleView/${index + 1}`}>
                        <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
                        <p className="text-gray-400 mb-4 flex items-center">
                            Author: 
                            <CopyToClipboard text={article.author} onCopy={() => setCopied({ ...copied, [index]: true })}>
                                <span className="ml-2 cursor-pointer text-yellow-500 hover:text-yellow-600" title="Click to copy">
                                    {truncateAddress(article.author)}
                                </span>
                            </CopyToClipboard>
                            {copied[index] && <span className="text-green-500 ml-2">Copied!</span>}
                        </p>
                        <p className="text-gray-500 mb-4">{article.isFree ? "Free Article" : `Price: ${ethers.utils.formatEther(article.subscriptionPrice)} ETH`}</p>
                        <p className="text-gray-300 mb-4">{truncateContent(article.content)}</p>
                    </Link>
                    {article.isFree ? (
                        <button
                            onClick={() => handleBuyCoffee(index + 1)}
                            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 transition-colors duration-200"
                        >
                            Buy Me a Coffee
                        </button>
                    ) : (
                        <button
                            onClick={() => handleBuyArticle(index + 1, article.subscriptionPrice)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                        >
                            Buy Article
                        </button>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold mb-8 text-center">Articles</h1>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-6">
                    <button
                        className={`px-6 py-2 font-semibold rounded-l-lg ${activeTab === 'free' ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-700 transition`}
                        onClick={() => setActiveTab('free')}
                    >
                        Free Articles
                    </button>
                    <button
                        className={`px-6 py-2 font-semibold rounded-r-lg ${activeTab === 'premium' ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-700 transition`}
                        onClick={() => setActiveTab('premium')}
                    >
                        Premium Articles
                    </button>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {Array(4).fill(0).map((_, index) => (
                            <div key={index} className="bg-gray-700 p-6 rounded-lg animate-pulse">
                                <div className="h-6 bg-gray-600 rounded mb-4"></div>
                                <div className="h-4 bg-gray-600 rounded mb-4"></div>
                                <div className="h-16 bg-gray-600 rounded mb-4"></div>
                                <div className="h-8 bg-gray-600 rounded"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Articles display */}
                {!loading && (
                    <>
                        {activeTab === 'free' && renderArticleList(freeArticles)}
                        {activeTab === 'premium' && renderArticleList(premiumArticles)}
                    </>
                )}
            </div>
        </div>
    );
};

export default Articles;
