// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MutualAidToken (AZI)
 * @dev ERC20 token for AstroZi Mutual Aid System
 * @author AstroZi Development Team
 */
contract MutualAidToken is ERC20, ERC20Permit, AccessControl, Pausable, ReentrancyGuard {
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    // Token configuration
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MUTUAL_AID_ALLOCATION = 600000000 * 10**18; // 60% for mutual aid
    uint256 public constant TEAM_ALLOCATION = 200000000 * 10**18; // 20% for team
    uint256 public constant MARKETING_ALLOCATION = 150000000 * 10**18; // 15% for marketing
    uint256 public constant RESERVE_ALLOCATION = 50000000 * 10**18; // 5% for reserve

    // Distribution tracking
    uint256 public mutualAidDistributed;
    uint256 public teamDistributed;
    uint256 public marketingDistributed;
    uint256 public reserveDistributed;

    // Mutual aid system
    mapping(bytes32 => bool) public processedRequests;
    mapping(address => uint256) public dailyLimits;
    mapping(address => uint256) public lastDistributionDate;
    
    uint256 public maxDailyDistribution = 1000 * 10**18; // 1000 AZI per day max
    uint256 public emergencyPauseThreshold = 10000 * 10**18; // Emergency pause if >10k distributed in 1 hour

    // Events
    event MutualAidDistributed(
        address indexed recipient,
        uint256 amount,
        bytes32 indexed requestId,
        string reason
    );
    
    event EmergencyPauseTriggered(
        uint256 amount,
        uint256 timeframe,
        address triggeredBy
    );
    
    event DailyLimitUpdated(
        address indexed user,
        uint256 oldLimit,
        uint256 newLimit
    );

    // Modifiers
    modifier onlyDistributor() {
        require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "MutualAidToken: must have distributor role");
        _;
    }

    modifier validAllocation(uint256 amount, uint256 distributed, uint256 allocation) {
        require(distributed + amount <= allocation, "MutualAidToken: exceeds allocation");
        _;
    }

    /**
     * @dev Constructor
     * @param initialOwner Address that will receive initial roles
     */
    constructor(address initialOwner) 
        ERC20("AstroZi Mutual Aid Token", "AZI") 
        ERC20Permit("AstroZi Mutual Aid Token") 
    {
        require(initialOwner != address(0), "MutualAidToken: invalid initial owner");

        // Grant roles to initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        _grantRole(DISTRIBUTOR_ROLE, initialOwner);
        _grantRole(GOVERNANCE_ROLE, initialOwner);

        // Mint initial allocations
        _mint(initialOwner, TEAM_ALLOCATION + MARKETING_ALLOCATION + RESERVE_ALLOCATION);
        
        // Update distributed counters
        teamDistributed = TEAM_ALLOCATION;
        marketingDistributed = MARKETING_ALLOCATION;
        reserveDistributed = RESERVE_ALLOCATION;
    }

    /**
     * @dev Distribute tokens for mutual aid
     * @param recipient Address to receive tokens
     * @param amount Amount of tokens to distribute
     * @param requestId Unique identifier for the aid request
     * @param reason Brief description of the aid reason
     */
    function distributeMutualAid(
        address recipient,
        uint256 amount,
        bytes32 requestId,
        string calldata reason
    ) 
        external 
        onlyDistributor 
        nonReentrant 
        whenNotPaused
        validAllocation(amount, mutualAidDistributed, MUTUAL_AID_ALLOCATION)
    {
        require(recipient != address(0), "MutualAidToken: invalid recipient");
        require(amount > 0, "MutualAidToken: amount must be positive");
        require(requestId != bytes32(0), "MutualAidToken: invalid request ID");
        require(!processedRequests[requestId], "MutualAidToken: request already processed");
        require(bytes(reason).length > 0, "MutualAidToken: reason required");

        // Check daily limits
        uint256 today = block.timestamp / 86400; // Days since epoch
        if (lastDistributionDate[recipient] < today) {
            dailyLimits[recipient] = 0; // Reset daily limit
            lastDistributionDate[recipient] = today;
        }
        
        require(
            dailyLimits[recipient] + amount <= maxDailyDistribution,
            "MutualAidToken: exceeds daily limit"
        );

        // Emergency pause check (more than threshold in 1 hour)
        // This would be implemented with a more sophisticated rate limiting in production

        // Mark request as processed
        processedRequests[requestId] = true;
        
        // Update counters
        mutualAidDistributed += amount;
        dailyLimits[recipient] += amount;

        // Mint tokens to recipient
        _mint(recipient, amount);

        emit MutualAidDistributed(recipient, amount, requestId, reason);
    }

    /**
     * @dev Batch distribute tokens for multiple recipients
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of token amounts
     * @param requestIds Array of request identifiers
     * @param reasons Array of aid reasons
     */
    function batchDistributeMutualAid(
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[] calldata requestIds,
        string[] calldata reasons
    )
        external
        onlyDistributor
        nonReentrant
        whenNotPaused
    {
        require(
            recipients.length == amounts.length && 
            amounts.length == requestIds.length && 
            requestIds.length == reasons.length,
            "MutualAidToken: arrays length mismatch"
        );
        require(recipients.length <= 50, "MutualAidToken: too many recipients");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(
            mutualAidDistributed + totalAmount <= MUTUAL_AID_ALLOCATION,
            "MutualAidToken: batch exceeds allocation"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            distributeMutualAid(recipients[i], amounts[i], requestIds[i], reasons[i]);
        }
    }

    /**
     * @dev Update daily distribution limit for a user
     * @param user User address
     * @param newLimit New daily limit
     */
    function updateDailyLimit(address user, uint256 newLimit)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        require(user != address(0), "MutualAidToken: invalid user address");
        require(newLimit <= maxDailyDistribution, "MutualAidToken: exceeds max daily distribution");

        uint256 oldLimit = dailyLimits[user];
        dailyLimits[user] = newLimit;

        emit DailyLimitUpdated(user, oldLimit, newLimit);
    }

    /**
     * @dev Update maximum daily distribution amount
     * @param newMaxDaily New maximum daily distribution
     */
    function updateMaxDailyDistribution(uint256 newMaxDaily)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        require(newMaxDaily > 0, "MutualAidToken: invalid max daily distribution");
        maxDailyDistribution = newMaxDaily;
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause function
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Get remaining allocation for mutual aid
     */
    function getRemainingMutualAidAllocation() external view returns (uint256) {
        return MUTUAL_AID_ALLOCATION - mutualAidDistributed;
    }

    /**
     * @dev Get daily remaining limit for user
     */
    function getDailyRemainingLimit(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 86400;
        if (lastDistributionDate[user] < today) {
            return maxDailyDistribution;
        }
        return maxDailyDistribution - dailyLimits[user];
    }

    /**
     * @dev Check if request has been processed
     */
    function isRequestProcessed(bytes32 requestId) external view returns (bool) {
        return processedRequests[requestId];
    }

    /**
     * @dev Get token distribution stats
     */
    function getDistributionStats() external view returns (
        uint256 totalSupply_,
        uint256 mutualAidDistributed_,
        uint256 mutualAidRemaining_,
        uint256 teamDistributed_,
        uint256 marketingDistributed_,
        uint256 reserveDistributed_
    ) {
        return (
            totalSupply(),
            mutualAidDistributed,
            MUTUAL_AID_ALLOCATION - mutualAidDistributed,
            teamDistributed,
            marketingDistributed,
            reserveDistributed
        );
    }

    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    // Interface support
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}