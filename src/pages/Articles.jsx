import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import axios from 'axios';
import { initializeContract, getArticleCount, getArticle, buyArticle, buyCoffee } from '../ContractIntegration';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState({});

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { contract } = await initializeContract();
                const count = await getArticleCount(contract);
                const articlePromises = [];

                for (let i = 1; i <= count; i++) {
                    articlePromises.push(getArticle(contract, i));
                }

                const articles = await Promise.all(articlePromises);

                // Fetch content for each article from Pinata
                const articlesWithContent = await Promise.all(articles.map(async (article) => {
                    try {
                        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${article.contentHash}`);
                        return { ...article, content: response.data };
                    } catch (error) {
                        console.error('Error fetching article content from IPFS:', error);
                        return { ...article, content: 'Error fetching content' };
                    }
                }));

                setArticles(articlesWithContent);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching articles:', error);
                setError('Failed to load articles. Please check your MetaMask connection and try again.');
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const handleBuyCoffee = async (articleId) => {
        const amount = prompt("Enter the amount of ETH to send:");
        if (!amount) return;

        try {
            const { contract } = await initializeContract();
            await buyCoffee(contract, articleId, amount);
            alert(`You have successfully sent ${amount} ETH to the author.`);
        } catch (error) {
            console.error('Error sending coffee:', error);
            alert('Failed to send ETH. Please try again.');
        }
    };

    const handleBuyArticle = async (articleId, subscriptionPrice) => {
        try {
            const { contract } = await initializeContract();
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

    if (loading) {
        return <div className="text-white">Loading articles...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold mb-8 text-center">Articles</h1>
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
            </div>
        </div>
    );
};

export default Articles;
