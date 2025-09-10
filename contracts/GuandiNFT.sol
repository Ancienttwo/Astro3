// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GuandiNFT
 * @dev NFT contract for Guandi fortune slips in AstroZi Mutual Aid System
 * @author AstroZi Development Team
 */
contract GuandiNFT is ERC721, ERC721URIStorage, ERC721Enumerable, AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    // Counter for token IDs
    Counters.Counter private _tokenIdCounter;

    // Rarity enum
    enum Rarity { COMMON, EPIC, LEGENDARY }

    // NFT metadata structure
    struct FortuneNFTMetadata {
        uint256 slipNumber;        // Fortune slip number (1-100)
        string title;              // Chinese title
        string titleEn;            // English title
        Rarity rarity;             // Token rarity
        uint256 rarityScore;       // Rarity score (1-100)
        uint256 governanceWeight;  // Weight in governance voting
        uint256 validationWeight;  // Weight in community validation
        uint256 mintTimestamp;     // When the NFT was minted
        bool transferable;         // Can be transferred (default true)
        string fortuneLevel;       // 吉凶等级 (e.g., "中吉", "大吉")
        string[] attributes;       // Additional attributes
    }

    // Mappings
    mapping(uint256 => FortuneNFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userNFTs;
    mapping(uint256 => uint256) public slipNumberToLastTokenId; // Track latest NFT for each slip number
    
    // Collection bonuses tracking
    mapping(address => bool) public milestone5Claimed;   // 5 NFTs bonus
    mapping(address => bool) public milestone10Claimed;  // 10 NFTs bonus
    mapping(address => bool) public milestone25Claimed;  // 25 NFTs bonus
    
    // Rarity distribution (basis points - 10000 = 100%)
    uint256 public constant LEGENDARY_RATE = 200;  // 2%
    uint256 public constant EPIC_RATE = 900;       // 9%
    uint256 public constant COMMON_RATE = 8900;    // 89%

    // Collection bonus rewards
    uint256 public constant MILESTONE_5_BONUS = 1;   // Extra fortune reading per day
    uint256 public constant MILESTONE_10_BONUS = 2;  // 1.5x validation power
    uint256 public constant MILESTONE_25_BONUS = 3;  // Community moderator privileges

    // Events
    event FortuneNFTMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 slipNumber,
        Rarity rarity,
        string title
    );
    
    event CollectionMilestoneAchieved(
        address indexed collector,
        uint256 milestone,
        uint256 totalNFTs,
        uint256 bonusUnlocked
    );
    
    event NFTTransferredAsGift(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        string message
    );

    event RarityUpdated(
        uint256 indexed tokenId,
        Rarity oldRarity,
        Rarity newRarity
    );

    /**
     * @dev Constructor
     * @param initialOwner Address that will receive initial roles
     */
    constructor(address initialOwner) 
        ERC721("Guandi Fortune NFT", "GFNFT") 
    {
        require(initialOwner != address(0), "GuandiNFT: invalid initial owner");

        // Grant roles to initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        _grantRole(GOVERNANCE_ROLE, initialOwner);

        // Start token IDs from 1
        _tokenIdCounter.increment();
    }

    /**
     * @dev Mint a new Fortune NFT
     * @param recipient Address to receive the NFT
     * @param slipNumber Fortune slip number (1-100)
     * @param title Chinese title
     * @param titleEn English title
     * @param fortuneLevel Fortune level (e.g., "中吉")
     * @param attributes Additional attributes
     * @param metadataURI URI for the token metadata
     */
    function mintFortuneNFT(
        address recipient,
        uint256 slipNumber,
        string memory title,
        string memory titleEn,
        string memory fortuneLevel,
        string[] memory attributes,
        string memory metadataURI
    )
        external
        onlyRole(MINTER_ROLE)
        nonReentrant
        whenNotPaused
        returns (uint256)
    {
        require(recipient != address(0), "GuandiNFT: invalid recipient");
        require(slipNumber >= 1 && slipNumber <= 100, "GuandiNFT: slip number must be 1-100");
        require(bytes(title).length > 0, "GuandiNFT: title required");
        require(bytes(metadataURI).length > 0, "GuandiNFT: metadata URI required");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Determine rarity based on randomness and distribution
        Rarity rarity = _determineRarity(tokenId, slipNumber, recipient);
        uint256 rarityScore = _calculateRarityScore(rarity, slipNumber);
        
        // Set governance and validation weights based on rarity
        (uint256 govWeight, uint256 valWeight) = _calculateWeights(rarity);

        // Create metadata
        nftMetadata[tokenId] = FortuneNFTMetadata({
            slipNumber: slipNumber,
            title: title,
            titleEn: titleEn,
            rarity: rarity,
            rarityScore: rarityScore,
            governanceWeight: govWeight,
            validationWeight: valWeight,
            mintTimestamp: block.timestamp,
            transferable: true,
            fortuneLevel: fortuneLevel,
            attributes: attributes
        });

        // Update tracking
        userNFTs[recipient].push(tokenId);
        slipNumberToLastTokenId[slipNumber] = tokenId;

        // Mint the NFT
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Check for collection milestones
        _checkCollectionMilestones(recipient);

        emit FortuneNFTMinted(recipient, tokenId, slipNumber, rarity, title);

        return tokenId;
    }

    /**
     * @dev Batch mint multiple NFTs
     * @param recipients Array of recipient addresses
     * @param slipNumbers Array of slip numbers
     * @param titles Array of titles
     * @param titlesEn Array of English titles
     * @param fortuneLevels Array of fortune levels
     * @param metadataURIs Array of metadata URIs
     */
    function batchMintFortuneNFTs(
        address[] memory recipients,
        uint256[] memory slipNumbers,
        string[] memory titles,
        string[] memory titlesEn,
        string[] memory fortuneLevels,
        string[] memory metadataURIs
    )
        external
        onlyRole(MINTER_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(recipients.length == slipNumbers.length, "GuandiNFT: arrays length mismatch");
        require(slipNumbers.length == titles.length, "GuandiNFT: arrays length mismatch");
        require(titles.length == titlesEn.length, "GuandiNFT: arrays length mismatch");
        require(titlesEn.length == fortuneLevels.length, "GuandiNFT: arrays length mismatch");
        require(fortuneLevels.length == metadataURIs.length, "GuandiNFT: arrays length mismatch");
        require(recipients.length <= 20, "GuandiNFT: too many NFTs to mint");

        string[] memory emptyAttributes = new string[](0);

        for (uint256 i = 0; i < recipients.length; i++) {
            mintFortuneNFT(
                recipients[i],
                slipNumbers[i],
                titles[i],
                titlesEn[i],
                fortuneLevels[i],
                emptyAttributes,
                metadataURIs[i]
            );
        }
    }

    /**
     * @dev Transfer NFT as a gift with message
     * @param from Sender address
     * @param to Recipient address
     * @param tokenId Token ID to transfer
     * @param message Gift message
     */
    function transferAsGift(
        address from,
        address to,
        uint256 tokenId,
        string memory message
    )
        external
        nonReentrant
    {
        require(ownerOf(tokenId) == from, "GuandiNFT: not token owner");
        require(_isApprovedOrOwner(msg.sender, tokenId), "GuandiNFT: not approved");
        require(nftMetadata[tokenId].transferable, "GuandiNFT: token not transferable");
        require(to != address(0), "GuandiNFT: invalid recipient");

        // Update user NFT tracking
        _removeFromUserNFTs(from, tokenId);
        userNFTs[to].push(tokenId);

        // Transfer the NFT
        _transfer(from, to, tokenId);

        // Check collection milestones for recipient
        _checkCollectionMilestones(to);

        emit NFTTransferredAsGift(from, to, tokenId, message);
    }

    /**
     * @dev Claim collection milestone bonus
     * @param milestone Milestone to claim (5, 10, or 25)
     */
    function claimCollectionBonus(uint256 milestone) 
        external 
        nonReentrant 
    {
        uint256 userBalance = balanceOf(msg.sender);
        
        if (milestone == 5) {
            require(userBalance >= 5, "GuandiNFT: insufficient NFTs for milestone 5");
            require(!milestone5Claimed[msg.sender], "GuandiNFT: milestone 5 already claimed");
            milestone5Claimed[msg.sender] = true;
        } else if (milestone == 10) {
            require(userBalance >= 10, "GuandiNFT: insufficient NFTs for milestone 10");
            require(!milestone10Claimed[msg.sender], "GuandiNFT: milestone 10 already claimed");
            milestone10Claimed[msg.sender] = true;
        } else if (milestone == 25) {
            require(userBalance >= 25, "GuandiNFT: insufficient NFTs for milestone 25");
            require(!milestone25Claimed[msg.sender], "GuandiNFT: milestone 25 already claimed");
            milestone25Claimed[msg.sender] = true;
        } else {
            revert("GuandiNFT: invalid milestone");
        }

        emit CollectionMilestoneAchieved(msg.sender, milestone, userBalance, milestone);
    }

    /**
     * @dev Get user's NFT collection info
     * @param user User address
     */
    function getUserCollectionInfo(address user) 
        external 
        view 
        returns (
            uint256 totalNFTs,
            uint256 commonCount,
            uint256 epicCount,
            uint256 legendaryCount,
            uint256 totalGovernanceWeight,
            uint256 totalValidationWeight,
            bool milestone5Achieved,
            bool milestone10Achieved,
            bool milestone25Achieved
        ) 
    {
        uint256 balance = balanceOf(user);
        uint256 common = 0;
        uint256 epic = 0;
        uint256 legendary = 0;
        uint256 govWeight = 0;
        uint256 valWeight = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            FortuneNFTMetadata memory metadata = nftMetadata[tokenId];
            
            if (metadata.rarity == Rarity.COMMON) common++;
            else if (metadata.rarity == Rarity.EPIC) epic++;
            else if (metadata.rarity == Rarity.LEGENDARY) legendary++;
            
            govWeight += metadata.governanceWeight;
            valWeight += metadata.validationWeight;
        }

        return (
            balance,
            common,
            epic,
            legendary,
            govWeight,
            valWeight,
            balance >= 5 && milestone5Claimed[user],
            balance >= 10 && milestone10Claimed[user],
            balance >= 25 && milestone25Claimed[user]
        );
    }

    /**
     * @dev Get NFT metadata
     * @param tokenId Token ID
     */
    function getNFTMetadata(uint256 tokenId) 
        external 
        view 
        returns (FortuneNFTMetadata memory) 
    {
        require(_exists(tokenId), "GuandiNFT: token does not exist");
        return nftMetadata[tokenId];
    }

    /**
     * @dev Get user's total governance weight
     * @param user User address
     */
    function getUserGovernanceWeight(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);
        uint256 totalWeight = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            totalWeight += nftMetadata[tokenId].governanceWeight;
        }

        return totalWeight;
    }

    /**
     * @dev Get user's total validation weight
     * @param user User address
     */
    function getUserValidationWeight(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);
        uint256 totalWeight = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            totalWeight += nftMetadata[tokenId].validationWeight;
        }

        // Apply collection bonuses
        if (balance >= 10 && milestone10Claimed[user]) {
            totalWeight = totalWeight * 150 / 100; // 1.5x bonus
        }

        return totalWeight;
    }

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause function
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Internal functions

    function _determineRarity(uint256 tokenId, uint256 slipNumber, address recipient) 
        internal 
        view 
        returns (Rarity) 
    {
        // Pseudo-random based on multiple factors
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            tokenId,
            slipNumber,
            recipient,
            _tokenIdCounter.current()
        ))) % 10000;

        if (randomness < LEGENDARY_RATE) {
            return Rarity.LEGENDARY;
        } else if (randomness < LEGENDARY_RATE + EPIC_RATE) {
            return Rarity.EPIC;
        } else {
            return Rarity.COMMON;
        }
    }

    function _calculateRarityScore(Rarity rarity, uint256 slipNumber) 
        internal 
        pure 
        returns (uint256) 
    {
        uint256 baseScore = slipNumber; // Base score from slip number
        
        if (rarity == Rarity.LEGENDARY) {
            return baseScore + 50; // +50 for legendary
        } else if (rarity == Rarity.EPIC) {
            return baseScore + 25; // +25 for epic
        } else {
            return baseScore; // Base score for common
        }
    }

    function _calculateWeights(Rarity rarity) 
        internal 
        pure 
        returns (uint256 govWeight, uint256 valWeight) 
    {
        if (rarity == Rarity.LEGENDARY) {
            return (5, 300); // 5x governance, 3x validation
        } else if (rarity == Rarity.EPIC) {
            return (2, 150); // 2x governance, 1.5x validation
        } else {
            return (1, 100); // 1x governance, 1x validation (stored as basis points)
        }
    }

    function _checkCollectionMilestones(address user) internal {
        uint256 balance = balanceOf(user);
        
        if (balance >= 5 && !milestone5Claimed[user]) {
            emit CollectionMilestoneAchieved(user, 5, balance, MILESTONE_5_BONUS);
        }
        if (balance >= 10 && !milestone10Claimed[user]) {
            emit CollectionMilestoneAchieved(user, 10, balance, MILESTONE_10_BONUS);
        }
        if (balance >= 25 && !milestone25Claimed[user]) {
            emit CollectionMilestoneAchieved(user, 25, balance, MILESTONE_25_BONUS);
        }
    }

    function _removeFromUserNFTs(address user, uint256 tokenId) internal {
        uint256[] storage userTokens = userNFTs[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }

    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Update user NFT tracking on transfer
        if (from != address(0) && to != address(0)) {
            _removeFromUserNFTs(from, tokenId);
            userNFTs[to].push(tokenId);
        }
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete nftMetadata[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}