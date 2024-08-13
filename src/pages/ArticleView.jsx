import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { initializeContract, getArticle } from '../ContractIntegration';
import { ethers } from 'ethers';

const ArticleView = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { contract } = await initializeContract();
                const fetchedArticle = await getArticle(contract, id);
                setArticle(fetchedArticle);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching article:', error);
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    if (loading) {
        return <div>Loading article...</div>;
    }

    if (!article) {
        return <div>Article not found</div>;
    }

    return (
        <div className="text-black">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                <p className="text-gray-700">Author: {article.author}</p>
                <p className="text-gray-500">{article.isFree ? "Free" : `Price: ${ethers.utils.formatEther(article.subscriptionPrice)} ETH`}</p>
                <div className="mt-4">
                    <h2 className="text-2xl font-bold mb-2">Content:</h2>
                    <p>{article.contentHash}</p>
                </div>
            </div>
        </div>
    );
};

export default ArticleView;
