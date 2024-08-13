// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArticlePublisher {
    struct Article {
        uint256 id;
        string title;
        string contentHash; // IPFS hash of the content
        address payable author; // Wallet address of the publisher
        uint256 subscriptionPrice;
        bool isFree;
    }

    mapping(uint256 => Article) public articles;
    uint256 public articleCount;

    event ArticlePublished(uint256 id, string title, address author, bool isFree);
    event ArticlePurchased(uint256 id, address buyer);
    event CoffeeBought(uint256 articleId, address author, uint256 amount, address supporter);

    function publishArticle(
        string memory _title,
        string memory _contentHash,
        uint256 _subscriptionPrice,
        bool _isFree,
        address payable _author
    ) external {
        articleCount++;
        articles[articleCount] = Article(
            articleCount,
            _title,
            _contentHash,
            _author,
            _subscriptionPrice,
            _isFree
        );
        emit ArticlePublished(articleCount, _title, _author, _isFree);
    }

    function buyArticle(uint256 _id) external payable {
        Article memory article = articles[_id];
        require(!article.isFree, "Article is free");
        require(msg.value >= article.subscriptionPrice, "Insufficient payment");

        article.author.transfer(msg.value);
        emit ArticlePurchased(_id, msg.sender);
    }

    function buyCoffee(uint256 _articleId, uint256 amount) external payable {
        Article memory article = articles[_articleId];
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value == amount, "Sent value must match the specified amount");

        // Transfer the ETH to the author's wallet address
        article.author.transfer(msg.value);
        emit CoffeeBought(_articleId, article.author, msg.value, msg.sender);
    }
}
