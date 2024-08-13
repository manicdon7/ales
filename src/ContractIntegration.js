import { ethers } from 'ethers';
import Abi from './abi/abi.json';

export async function initializeContract() {
  try {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contractAddress = "0x2C7061B0942F4D0859988Ffa631cc188131E1fC1"; // Replace with your actual contract address
      const contract = new ethers.Contract(contractAddress, Abi, signer);
      console.log(contract);
      return { provider, signer, address, contract };
    } else {
      throw new Error("MetaMask not found");
    }
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw error;
  }
}

export async function publishArticle(contract, title, contentHash, subscriptionPrice, isFree) {
  try {
    const tx = await contract.publishArticle(
      title,
      contentHash,
      ethers.utils.parseEther(subscriptionPrice || '0'),
      isFree,
      await contract.signer.getAddress(),
      { gasLimit: 500000 }
    );
    await tx.wait();
    console.log('Article published successfully!');
  } catch (error) {
    console.error('Error publishing article:', error);
    throw error;
  }
}

export async function buyArticle(contract, articleId, paymentAmount) {
  try {
    const tx = await contract.buyArticle(articleId, {
      value: ethers.utils.parseEther(paymentAmount),
      gasLimit: 500000,
    });
    await tx.wait();
    console.log('Article purchased successfully!');
  } catch (error) {
    console.error('Error purchasing article:', error);
    throw error;
  }
}

export async function buyCoffee(contract, articleId, amount) {
  try {
    const tx = await contract.buyCoffee(articleId, ethers.utils.parseEther(amount), {
      value: ethers.utils.parseEther(amount),
      gasLimit: 500000,
    });
    await tx.wait();
    console.log('Coffee bought successfully!');
  } catch (error) {
    console.error('Error buying coffee:', error);
    throw error;
  }
}

export async function getArticle(contract, articleId) {
  try {
    const article = await contract.articles(articleId);
    console.log('Article fetched:', article);
    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
}

export async function getArticleCount(contract) {
  try {
    const count = await contract.articleCount();
    console.log('Total articles:', count.toString());
    return count.toString();
  } catch (error) {
    console.error('Error fetching article count:', error);
    throw error;
  }
}
