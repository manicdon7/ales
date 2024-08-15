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
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const uploadToIPFS = async (content) => {
        try {
            const added = await ipfsClient.add(content);
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
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
            setSelectedImage(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error publishing article:', error);
            alert('Failed to publish the article.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">Publish an Article</h1>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your article title here"
                    className="w-full p-3 mb-4 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ReactQuill
                    value={content}
                    onChange={setContent}
                    placeholder="Write your article content here..."
                    className="mb-4 bg-gray-800 text-gray-300"
                    theme="snow"
                />
                <div className="mb-4">
                    <label className="block text-gray-400">Upload an Image (Optional):</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full mt-2 bg-gray-800 p-3 rounded-md focus:outline-none"
                    />
                    {selectedImage && <p className="mt-2 text-sm text-gray-500">Selected Image: {selectedImage.name}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400">Attach a File (Optional):</label>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="w-full mt-2 bg-gray-800 p-3 rounded-md focus:outline-none"
                    />
                    {selectedFile && <p className="mt-2 text-sm text-gray-500">Selected File: {selectedFile.name}</p>}
                </div>
                <div className="flex flex-wrap gap-4 mb-6">
                    <label className="flex items-center text-gray-400">
                        Subscription Price (ETH):
                        <input
                            type="text"
                            value={subscriptionPrice}
                            onChange={(e) => setSubscriptionPrice(e.target.value)}
                            placeholder="0.0"
                            disabled={isFree}
                            className="ml-2 bg-gray-800 p-2 rounded-md focus:outline-none"
                        />
                    </label>
                    <label className="flex items-center text-gray-400">
                        <input
                            type="checkbox"
                            checked={isFree}
                            onChange={(e) => setIsFree(e.target.checked)}
                            className="mr-2"
                        />
                        Free Article
                    </label>
                </div>
                <button
                    onClick={handlePublish}
                    className={`w-full p-3 rounded-md font-bold ${loading ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition duration-200`}
                    disabled={loading}
                >
                    {loading ? 'Publishing...' : 'Publish Article'}
                </button>
            </div>
        </div>
    );
};

export default Post;
