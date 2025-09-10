// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./GuandiNFT.sol";

/**
 * @title MutualAidGovernance
 * @dev Governance contract for AstroZi Mutual Aid System using NFT-based voting
 * @author AstroZi Development Team
 */
contract MutualAidGovernance is 
    Governor, 
    GovernorSettings, 
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction,
    GovernorTimelockControl,
    AccessControl 
{
    // Role definitions
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");

    // Reference to GuandiNFT contract for voting weight calculation
    GuandiNFT public immutable guangdiNFT;

    // Proposal categories
    enum ProposalCategory { 
        TOKENOMICS,           // Token distribution and economics
        PLATFORM_IMPROVEMENT, // Platform features and improvements
        FEATURE_REQUEST,      // New feature requests
        GOVERNANCE,           // Governance process changes
        EMERGENCY,            // Emergency proposals
        PARTNERSHIP,          // Partnership and integration proposals
        SECURITY             // Security-related proposals
    }

    // Enhanced proposal metadata
    struct ProposalMetadata {
        ProposalCategory category;
        string title;
        string description;
        string implementationPlan;
        uint256 estimatedCost;
        uint256 timeline;
        address proposer;
        uint256 stakingAmount;
        uint256 createdAt;
        bool executed;
        string[] tags;
    }

    // Mappings
    mapping(uint256 => ProposalMetadata) public proposalMetadata;
    mapping(address => uint256) public proposerStaking; // Staked amount per proposer
    mapping(uint256 => mapping(address => bool)) public hasVoted; // Track voting participation
    mapping(address => uint256) public userVotingPower; // Cached voting power
    
    // Configuration
    uint256 public constant MIN_STAKING_AMOUNT = 100 * 10**18; // 100 AZI to propose
    uint256 public constant QUORUM_PERCENTAGE = 4; // 4% of total voting power
    uint256 public constant VOTING_DELAY = 1 days; // 1 day delay before voting starts
    uint256 public constant VOTING_PERIOD = 7 days; // 7 days voting period
    
    // Events
    event ProposalCreatedWithMetadata(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalCategory category,
        string title,
        uint256 stakingAmount
    );
    
    event VotingPowerUpdated(
        address indexed user,
        uint256 oldPower,
        uint256 newPower
    );
    
    event ProposalStakingUpdated(
        address indexed proposer,
        uint256 oldAmount,
        uint256 newAmount
    );

    event EmergencyProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string reason
    );

    /**
     * @dev Constructor
     * @param _guangdiNFT Address of the GuandiNFT contract
     * @param _token Address of the voting token (if any)
     * @param _timelock Address of the timelock controller
     */
    constructor(
        GuandiNFT _guangdiNFT,
        IVotes _token,
        TimelockController _timelock
    )
        Governor("AstroZi Mutual Aid Governance")
        GovernorSettings(
            VOTING_DELAY,     // voting delay
            VOTING_PERIOD,    // voting period  
            0                 // proposal threshold
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(QUORUM_PERCENTAGE)
        GovernorTimelockControl(_timelock)
    {
        require(address(_guangdiNFT) != address(0), "MutualAidGovernance: invalid NFT contract");
        
        guangdiNFT = _guangdiNFT;
        
        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, address(this));
        _grantRole(EXECUTOR_ROLE, address(_timelock));
        _grantRole(CANCELLER_ROLE, msg.sender);
    }

    /**
     * @dev Create a proposal with enhanced metadata
     * @param targets Array of target addresses
     * @param values Array of values to send
     * @param calldatas Array of function call data
     * @param title Proposal title
     * @param description Proposal description
     * @param category Proposal category
     * @param implementationPlan Implementation plan details
     * @param estimatedCost Estimated cost in AZI tokens
     * @param timeline Timeline in days
     * @param stakingAmount Amount to stake for this proposal
     * @param tags Tags for categorization
     */
    function proposeWithMetadata(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        ProposalCategory category,
        string memory implementationPlan,
        uint256 estimatedCost,
        uint256 timeline,
        uint256 stakingAmount,
        string[] memory tags
    ) public returns (uint256) {
        require(stakingAmount >= MIN_STAKING_AMOUNT, "MutualAidGovernance: insufficient staking amount");
        require(bytes(title).length > 0, "MutualAidGovernance: title required");
        require(bytes(description).length > 0, "MutualAidGovernance: description required");
        require(timeline > 0, "MutualAidGovernance: timeline must be positive");

        // Update proposer staking
        proposerStaking[msg.sender] += stakingAmount;

        // Create the proposal
        uint256 proposalId = propose(targets, values, calldatas, description);

        // Store metadata
        proposalMetadata[proposalId] = ProposalMetadata({
            category: category,
            title: title,
            description: description,
            implementationPlan: implementationPlan,
            estimatedCost: estimatedCost,
            timeline: timeline,
            proposer: msg.sender,
            stakingAmount: stakingAmount,
            createdAt: block.timestamp,
            executed: false,
            tags: tags
        });

        emit ProposalCreatedWithMetadata(proposalId, msg.sender, category, title, stakingAmount);

        return proposalId;
    }

    /**
     * @dev Create an emergency proposal with expedited timeline
     * @param targets Array of target addresses
     * @param values Array of values to send
     * @param calldatas Array of function call data
     * @param title Proposal title
     * @param description Proposal description
     * @param reason Emergency reason
     */
    function proposeEmergency(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        string memory reason
    ) public onlyRole(PROPOSER_ROLE) returns (uint256) {
        require(bytes(reason).length > 0, "MutualAidGovernance: emergency reason required");

        string[] memory emergencyTags = new string[](1);
        emergencyTags[0] = "emergency";

        uint256 proposalId = proposeWithMetadata(
            targets,
            values,
            calldatas,
            title,
            description,
            ProposalCategory.EMERGENCY,
            "Emergency implementation",
            0,
            1, // 1 day timeline for emergency
            MIN_STAKING_AMOUNT,
            emergencyTags
        );

        emit EmergencyProposalCreated(proposalId, msg.sender, reason);

        return proposalId;
    }

    /**
     * @dev Cast vote with NFT-weighted voting power
     * @param proposalId Proposal ID
     * @param support Vote support (0=against, 1=for, 2=abstain)
     * @param reason Voting reason
     * @param params Additional parameters (unused)
     */
    function castVoteWithReasonAndParams(
        uint256 proposalId,
        uint8 support,
        string calldata reason,
        bytes memory params
    ) public override returns (uint256) {
        require(!hasVoted[proposalId][msg.sender], "MutualAidGovernance: already voted");
        
        // Update voting power based on current NFT holdings
        _updateVotingPower(msg.sender);
        
        hasVoted[proposalId][msg.sender] = true;
        
        return super.castVoteWithReasonAndParams(proposalId, support, reason, params);
    }

    /**
     * @dev Get voting power for an account based on NFT holdings
     * @param account Account to check
     */
    function getVotes(address account, uint256 blockNumber) 
        public 
        view 
        override 
        returns (uint256) 
    {
        // For historical voting power, we use the cached value
        // In production, this would need to track historical NFT holdings
        return _getCurrentVotingPower(account);
    }

    /**
     * @dev Update voting power for an account
     * @param account Account to update
     */
    function updateVotingPower(address account) external {
        _updateVotingPower(account);
    }

    /**
     * @dev Get current voting power based on NFT holdings
     * @param account Account to check
     */
    function getCurrentVotingPower(address account) external view returns (uint256) {
        return _getCurrentVotingPower(account);
    }

    /**
     * @dev Get proposal metadata
     * @param proposalId Proposal ID
     */
    function getProposalMetadata(uint256 proposalId) 
        external 
        view 
        returns (ProposalMetadata memory) 
    {
        return proposalMetadata[proposalId];
    }

    /**
     * @dev Get user's participation stats
     * @param user User address
     */
    function getUserParticipationStats(address user) 
        external 
        view 
        returns (
            uint256 currentVotingPower,
            uint256 totalStaked,
            uint256 nftCount
        ) 
    {
        return (
            _getCurrentVotingPower(user),
            proposerStaking[user],
            guangdiNFT.balanceOf(user)
        );
    }

    /**
     * @dev Cancel a proposal (only by canceller role or proposer)
     * @param targets Array of target addresses
     * @param values Array of values to send
     * @param calldatas Array of function call data
     * @param descriptionHash Description hash
     */
    function cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public override returns (uint256) {
        uint256 proposalId = hashProposal(targets, values, calldatas, descriptionHash);
        address proposer = proposalMetadata[proposalId].proposer;
        
        require(
            hasRole(CANCELLER_ROLE, msg.sender) || msg.sender == proposer,
            "MutualAidGovernance: unauthorized cancellation"
        );

        // Refund staking if proposal is cancelled by proposer
        if (msg.sender == proposer) {
            uint256 stakingAmount = proposalMetadata[proposalId].stakingAmount;
            if (stakingAmount > 0) {
                proposerStaking[proposer] -= stakingAmount;
                // Note: In production, this would transfer tokens back
                emit ProposalStakingUpdated(proposer, proposerStaking[proposer] + stakingAmount, proposerStaking[proposer]);
            }
        }

        return super.cancel(targets, values, calldatas, descriptionHash);
    }

    // Internal functions

    function _updateVotingPower(address account) internal {
        uint256 oldPower = userVotingPower[account];
        uint256 newPower = _getCurrentVotingPower(account);
        
        if (oldPower != newPower) {
            userVotingPower[account] = newPower;
            emit VotingPowerUpdated(account, oldPower, newPower);
        }
    }

    function _getCurrentVotingPower(address account) internal view returns (uint256) {
        // Get voting power from NFT holdings
        return guangdiNFT.getUserGovernanceWeight(account);
    }

    // Required overrides

    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
        
        // Mark as executed in metadata
        proposalMetadata[proposalId].executed = true;
        
        // Refund staking to proposer on successful execution
        address proposer = proposalMetadata[proposalId].proposer;
        uint256 stakingAmount = proposalMetadata[proposalId].stakingAmount;
        if (stakingAmount > 0) {
            proposerStaking[proposer] -= stakingAmount;
            // Note: In production, this would transfer tokens back
            emit ProposalStakingUpdated(proposer, proposerStaking[proposer] + stakingAmount, proposerStaking[proposer]);
        }
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}