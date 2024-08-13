import React, { useState } from 'react';
import { ethers } from 'ethers';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Navbar from '../components/Navbar';
import abi from '../abi/abi.json';
import { create as createIPFSClient } from 'ipfs-http-client';
import axios from 'axios';

const ArticlePublisherAddress = '0x2C7061B0942F4D0859988Ffa631cc188131E1fC1';
const ArticlePublisherABI = abi;

// Configure the IPFS client (Infura)
const ipfsClient = createIPFSClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
});

// Pinata credentials
const pinataApiKey = 'f1dc71a4aff3d1f5e0fc';
const pinataSecretApiKey = '5bef6e30d218910dcad305cecced85028142b4ad648c2b6a029970423fa127cf';

const Post = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subscriptionPrice, setSubscriptionPrice] = useState('');
    const [isFree, setIsFree] = useState(true);
    const [loading, setLoading] = useState(false);

    const uploadToIPFS = async (content) => {
        try {
            const added = await ipfsClient.add(content);
            console.log(added.path);
            return added.path; // IPFS hash
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw error;
        }
    };

    const uploadToPinata = async (content) => {
        try {
            const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
            const data = new FormData();
            const blob = new Blob([content], { type: 'text/plain' });
            data.append('file', blob);

            const metadata = JSON.stringify({
                name: 'ArticleContent',
            });
            data.append('pinataMetadata', metadata);

            const response = await axios.post(url, data, {
                maxContentLength: Infinity,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretApiKey,
                },
            });

            return response.data.IpfsHash; // Pinata IPFS hash
        } catch (error) {
            console.error('Error uploading to Pinata:', error);
            throw error;
        }
    };

    const handlePublish = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask to use this feature!");
            return;
        }

        setLoading(true);
        try {
            // Upload content to IPFS (via Infura) or Pinata
            const contentHash = await uploadToPinata(content); // or use uploadToIPFS(content)

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(ArticlePublisherAddress, ArticlePublisherABI, signer);

            const tx = await contract.publishArticle(
                title,
                contentHash,
                ethers.utils.parseEther(subscriptionPrice || '0'),
                isFree,
                await signer.getAddress()
            );

            await tx.wait();
            alert('Article published successfully!');
            // Clear form after successful submission
            setTitle('');
            setContent('');
            setSubscriptionPrice('');
            setIsFree(true);
        } catch (error) {
            console.error('Error publishing article:', error);
            alert('Failed to publish the article.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="post-container">
                <h1 className="post-title">Publish an Article</h1>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your article title here"
                    className="post-input"
                />
                <ReactQuill
                    value={content}
                    onChange={setContent}
                    placeholder="Write your article content here..."
                    className="post-editor"
                />
                <div className="post-options">
                    <label className="post-option">
                        Subscription Price (ETH):
                        <input
                            type="text"
                            value={subscriptionPrice}
                            onChange={(e) => setSubscriptionPrice(e.target.value)}
                            placeholder="0.0"
                            disabled={isFree}
                            className="post-input"
                        />
                    </label>
                    <label className="post-option">
                        <input
                            type="checkbox"
                            checked={isFree}
                            onChange={(e) => setIsFree(e.target.checked)}
                        />
                        Free Article
                    </label>
                </div>
                <button onClick={handlePublish} className="post-button" disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish Article'}
                </button>
            </div>
        </div>
    );
};

export default Post;
