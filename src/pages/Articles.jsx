import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import { initializeContract, getArticleCount, getArticle, buyCoffee } from '../ContractIntegration';

const Articles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

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
                setArticles(articles);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching articles:', error);
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const handleBuyCoffee = async (articleId, author) => {
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

    if (loading) {
        return <div className="text-white">Loading articles...</div>;
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
                                <p className="text-gray-400 mb-4">Author: {article.author}</p>
                                <p className="text-gray-500 mb-4">{article.isFree ? "Free Article" : `Price: ${ethers.utils.formatEther(article.subscriptionPrice)} ETH`}</p>
                            </Link>
                            {article.isFree && (
                                <button
                                    onClick={() => handleBuyCoffee(index + 1, article.author)}
                                    className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 transition-colors duration-200"
                                >
                                    Buy Me a Coffee
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
