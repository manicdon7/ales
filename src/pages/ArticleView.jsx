import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { initializeContract, getArticle } from '../ContractIntegration';
import { ethers } from 'ethers';
import axios from 'axios';

const ArticleView = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async (retryCount = 0) => {
            if (retryCount >= 3) {
                setError('Failed to initialize contract after multiple attempts.');
                setLoading(false);
                return;
            }

            try {
                const { contract } = await initializeContract();
                const fetchedArticle = await getArticle(contract, id);

                // Fetch article content from IPFS using content hash
                try {
                    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${fetchedArticle.contentHash}`);
                    setArticle({ ...fetchedArticle, content: response.data });
                } catch (error) {
                    console.error('Error fetching article content from IPFS:', error);
                    setArticle({ ...fetchedArticle, content: 'Error fetching content' });
                }

                setLoading(false);
            } catch (error) {
                console.error('Error initializing contract, retrying...', error);
                setTimeout(() => fetchArticle(retryCount + 1), 2000); // Retry after 2 seconds
            }
        };

        fetchArticle();
    }, [id]);

    const renderSkeletonLoader = () => (
        <div className="animate-pulse p-4">
            <div className="h-10 bg-gray-400 rounded mb-4"></div>
            <div className="h-4 bg-gray-400 rounded mb-2"></div>
            <div className="h-4 bg-gray-400 rounded mb-2"></div>
            <div className="h-8 bg-gray-400 rounded mb-4"></div>
            <div className="h-40 bg-gray-400 rounded"></div>
        </div>
    );

    if (loading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen">
                <div className="container mx-auto p-4">
                    {renderSkeletonLoader()}
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="bg-gray-900 text-white min-h-screen">
                <div className="container mx-auto p-4">
                    <p>Article not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
                <p className="text-gray-400 mb-2">Author: {article.author}</p>
                <p className="text-gray-500 mb-4">
                    {article.isFree ? "Free" : `Price: ${ethers.utils.formatEther(article.subscriptionPrice)} ETH`}
                </p>
                <div className="mt-4 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">Content:</h2>
                    <p className="text-gray-300">{article.content}</p>
                </div>
            </div>
        </div>
    );
};

export default ArticleView;
