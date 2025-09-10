// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AstroZi Points System Contract (Security Fixed Version)
 * @dev 管理Web3用户积分、签到和空投资格的智能合约 - 安全修复版本
 * @author AstroZi Team
 */
contract AstroZiPointsSystemFixed is ReentrancyGuard, Ownable, Pausable {

    // ===============================================
    // 常量定义
    // ===============================================
    
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant MAX_BATCH_SIZE = 100;
    uint256 public constant MAX_PAYMENT_MULTIPLIER = 2;
    uint256 public constant TIMELOCK_DURATION = 48 hours;

    // ===============================================
    // 结构体定义
    // ===============================================
    
    struct UserStats {
        uint256 totalPoints;           // 总积分
        uint256 consecutiveDays;       // 连续签到天数
        uint256 lastCheckinDate;       // 最后签到日期（天数）
        uint256 airdropWeight;         // 空投权重（精度1000）
        uint256 totalBNBSpent;         // 总花费BNB（wei）
        uint256 totalCheckins;         // 总签到次数
        bool isActive;                 // 账户是否活跃
    }
    
    struct CheckinRecord {
        uint256 timestamp;             // 签到时间戳
        uint256 consecutiveDays;       // 当时连续天数
        uint256 pointsEarned;          // 获得积分
        uint256 airdropWeightEarned;   // 获得空投权重
        uint256 bnbPaid;              // 支付BNB数量
    }
    
    struct RewardConfig {
        uint256 basePoints;            // 基础积分
        uint256 baseAirdropWeight;     // 基础空投权重
        uint256 multiplier;            // 奖励倍数（基于连续天数）
    }

    // ===============================================
    // 状态变量
    // ===============================================
    
    // 合约配置
    uint256 public checkinCost = 0.0002 ether;        // 签到费用（BNB）
    uint256 public constant BASE_POINTS = 10;          // 基础积分
    uint256 public constant BASE_AIRDROP_WEIGHT = 100; // 基础空投权重（0.1，精度1000）
    uint256 public constant WEIGHT_PRECISION = 1000;   // 权重精度
    
    // 收入分配 - 扣除Gas后全部归平台钱包
    uint256 public constant PLATFORM_FEE_PERCENT = 100; // 平台收入100%（扣除Gas后）
    uint256 public constant GAS_RESERVE_PERCENT = 5;   // Gas储备5%（用于合约运营）
    
    // 统计数据
    uint256 public totalUsers = 0;                     // 总用户数
    uint256 public totalCheckins = 0;                  // 总签到次数
    uint256 public totalRevenue = 0;                   // 总收入
    uint256 public platformRevenue = 0;                // 平台收入（扣除Gas后）
    uint256 public gasReserve = 0;                     // Gas储备（用于合约运营）
    
    // 钱包地址
    address public platformTreasury;                   // 平台金库（收取净收入）
    
    // 数据存储
    mapping(address => UserStats) public userStats;
    mapping(address => CheckinRecord[]) public checkinHistory;
    mapping(uint256 => uint256) public consecutiveBonusMultiplier; // 连续奖励倍数
    mapping(address => bool) public blacklist;        // 黑名单
    
    // 时间锁相关
    mapping(bytes32 => uint256) public timelocks;

    // ===============================================
    // 事件定义
    // ===============================================
    
    event CheckinCompleted(
        address indexed user,
        uint256 pointsEarned,
        uint256 consecutiveDays,
        uint256 airdropWeightEarned,
        uint256 bnbPaid,
        uint256 timestamp
    );
    
    event PointsAwarded(
        address indexed user,
        uint256 points,
        string reason
    );
    
    event AirdropWeightUpdated(
        address indexed user,
        uint256 newWeight,
        string reason
    );
    
    event RevenueDistributed(
        uint256 platformAmount,
        uint256 gasReserveAmount
    );
    
    event CheckinCostUpdated(uint256 oldCost, uint256 newCost);
    event UserBlacklisted(address indexed user, bool isBlacklisted);
    event FundsWithdrawn(address indexed treasury, uint256 amount, string fundType);
    event PlatformTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event TimelockStarted(bytes32 indexed operation, uint256 executeTime);

    // ===============================================
    // 修饰符
    // ===============================================
    
    modifier notBlacklisted() {
        require(!blacklist[msg.sender], "User is blacklisted");
        _;
    }
    
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }

    modifier timelock(bytes32 operation) {
        if (timelocks[operation] == 0) {
            timelocks[operation] = block.timestamp + TIMELOCK_DURATION;
            emit TimelockStarted(operation, timelocks[operation]);
            revert("Timelock started, please wait 48 hours");
        }
        require(block.timestamp >= timelocks[operation], "Timelock not expired");
        delete timelocks[operation];
        _;
    }

    // ===============================================
    // 构造函数
    // ===============================================
    
    constructor(
        address _platformTreasury
    ) Ownable(msg.sender) {
        require(_platformTreasury != address(0), "Invalid platform treasury");
        
        platformTreasury = _platformTreasury;
        
        // 初始化连续签到奖励倍数（基数100）
        consecutiveBonusMultiplier[1] = 100;   // 1.0x
        consecutiveBonusMultiplier[7] = 150;   // 1.5x
        consecutiveBonusMultiplier[15] = 200;  // 2.0x
        consecutiveBonusMultiplier[30] = 300;  // 3.0x
        consecutiveBonusMultiplier[60] = 400;  // 4.0x
        consecutiveBonusMultiplier[100] = 500; // 5.0x
    }

    // ===============================================
    // 核心功能函数 - 安全修复版本
    // ===============================================
    
    /**
     * @dev 执行每日签到 - 安全修复版本
     */
    function performCheckin() 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        notBlacklisted 
    {
        require(msg.value >= checkinCost, "Insufficient BNB payment");
        require(msg.value <= checkinCost * MAX_PAYMENT_MULTIPLIER, "Payment too high");
        require(canCheckin(msg.sender), "Already checked in today");
        
        // 计算实际支付金额和退款
        uint256 actualPayment = msg.value > checkinCost ? checkinCost : msg.value;
        uint256 refund = msg.value - actualPayment;
        
        UserStats storage user = userStats[msg.sender];
        
        // 如果是新用户，初始化
        if (!user.isActive) {
            user.isActive = true;
            totalUsers += 1;
        }
        
        uint256 currentDay = getCurrentDay();
        uint256 consecutiveDays = calculateConsecutiveDays(msg.sender, currentDay);
        uint256 pointsEarned = calculatePoints(consecutiveDays);
        uint256 airdropWeightEarned = calculateAirdropWeight(consecutiveDays);
        
        // 更新用户统计
        user.totalPoints += pointsEarned;
        user.consecutiveDays = consecutiveDays;
        user.lastCheckinDate = currentDay;
        user.airdropWeight += airdropWeightEarned;
        user.totalBNBSpent += actualPayment;
        user.totalCheckins += 1;
        
        // 记录签到历史
        checkinHistory[msg.sender].push(CheckinRecord({
            timestamp: block.timestamp,
            consecutiveDays: consecutiveDays,
            pointsEarned: pointsEarned,
            airdropWeightEarned: airdropWeightEarned,
            bnbPaid: actualPayment
        }));
        
        // 更新全局统计
        totalCheckins += 1;
        totalRevenue += actualPayment;
        
        // 分配收入
        distributeRevenue(actualPayment);
        
        // 安全退款 - 使用call而不是transfer
        if (refund > 0) {
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
        
        emit CheckinCompleted(
            msg.sender,
            pointsEarned,
            consecutiveDays,
            airdropWeightEarned,
            actualPayment,
            block.timestamp
        );
    }

    // ===============================================
    // 查询函数 - 保持不变
    // ===============================================
    
    function canCheckin(address user) public view returns (bool) {
        if (blacklist[user]) return false;
        
        uint256 currentDay = getCurrentDay();
        return userStats[user].lastCheckinDate != currentDay;
    }
    
    function calculateConsecutiveDays(address user, uint256 currentDay) 
        internal 
        view 
        returns (uint256) 
    {
        UserStats memory userStat = userStats[user];
        
        if (userStat.lastCheckinDate == 0) {
            return 1;
        }
        
        if (userStat.lastCheckinDate == currentDay - 1) {
            return userStat.consecutiveDays + 1;
        } else {
            return 1;
        }
    }
    
    function calculatePoints(uint256 consecutiveDays) public view returns (uint256) {
        uint256 multiplier = getMultiplier(consecutiveDays);
        return (BASE_POINTS * multiplier) / 100;
    }
    
    function calculateAirdropWeight(uint256 consecutiveDays) public view returns (uint256) {
        uint256 multiplier = getMultiplier(consecutiveDays);
        return (BASE_AIRDROP_WEIGHT * multiplier) / 100;
    }
    
    function getMultiplier(uint256 consecutiveDays) public view returns (uint256) {
        if (consecutiveDays >= 100) return consecutiveBonusMultiplier[100];
        if (consecutiveDays >= 60) return consecutiveBonusMultiplier[60];
        if (consecutiveDays >= 30) return consecutiveBonusMultiplier[30];
        if (consecutiveDays >= 15) return consecutiveBonusMultiplier[15];
        if (consecutiveDays >= 7) return consecutiveBonusMultiplier[7];
        return consecutiveBonusMultiplier[1];
    }

    function distributeRevenue(uint256 amount) internal {
        uint256 gasReserveAmount = (amount * GAS_RESERVE_PERCENT) / 100;
        uint256 platformAmount = amount - gasReserveAmount;
        
        platformRevenue += platformAmount;
        gasReserve += gasReserveAmount;
        
        emit RevenueDistributed(platformAmount, gasReserveAmount);
    }
    
    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / SECONDS_PER_DAY;
    }

    // ===============================================
    // 管理员功能 - 安全修复版本
    // ===============================================
    
    /**
     * @dev 提取平台收入 - 安全修复版本
     */
    function withdrawPlatformRevenue() external onlyOwner {
        require(platformRevenue > 0, "No platform revenue to withdraw");
        uint256 amount = platformRevenue;
        
        // 使用call替代transfer，并先执行转账再更新状态
        (bool success, ) = payable(platformTreasury).call{value: amount}("");
        require(success, "Transfer failed");
        
        // 转账成功后再更新状态
        platformRevenue = 0;
        emit FundsWithdrawn(platformTreasury, amount, "platform");
    }
    
    /**
     * @dev 提取Gas储备（紧急情况）- 安全修复版本
     */
    function emergencyWithdrawGasReserve(uint256 amount) external onlyOwner {
        require(amount <= gasReserve, "Insufficient gas reserve");
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
        
        gasReserve -= amount;
        emit FundsWithdrawn(owner(), amount, "gas_reserve");
    }
    
    /**
     * @dev 更新平台金库地址 - 添加事件记录
     */
    function updatePlatformTreasury(address newPlatformTreasury) external onlyOwner {
        require(newPlatformTreasury != address(0), "Invalid platform treasury");
        address oldTreasury = platformTreasury;
        platformTreasury = newPlatformTreasury;
        emit PlatformTreasuryUpdated(oldTreasury, newPlatformTreasury);
    }

    /**
     * @dev 批量黑名单管理 - 添加大小限制
     */
    function setBatchBlacklist(address[] calldata users, bool isBlacklisted) 
        external 
        onlyOwner 
    {
        require(users.length <= MAX_BATCH_SIZE, "Batch size too large");
        for (uint256 i = 0; i < users.length; i++) {
            blacklist[users[i]] = isBlacklisted;
            emit UserBlacklisted(users[i], isBlacklisted);
        }
    }

    /**
     * @dev 紧急提取所有资金 - 添加时间锁保护
     */
    function emergencyWithdrawAll() external onlyOwner timelock(keccak256("EMERGENCY_WITHDRAW")) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
        
        // 重置所有收入计数器
        platformRevenue = 0;
        gasReserve = 0;
    }

    // ===============================================
    // 保持不变的功能
    // ===============================================
    
    function updateCheckinCost(uint256 newCost) external onlyOwner {
        require(newCost > 0, "Cost must be greater than 0");
        uint256 oldCost = checkinCost;
        checkinCost = newCost;
        emit CheckinCostUpdated(oldCost, newCost);
    }
    
    function updateBonusMultiplier(uint256 _days, uint256 multiplier) external onlyOwner {
        require(multiplier >= 100, "Multiplier must be at least 100 (1.0x)");
        consecutiveBonusMultiplier[_days] = multiplier;
    }
    
    function adminGrantPoints(address user, uint256 points, string calldata reason) 
        external 
        onlyOwner 
        validAddress(user) 
    {
        userStats[user].totalPoints += points;
        emit PointsAwarded(user, points, reason);
    }
    
    function adminGrantAirdropWeight(address user, uint256 weight, string calldata reason) 
        external 
        onlyOwner 
        validAddress(user) 
    {
        userStats[user].airdropWeight += weight;
        emit AirdropWeightUpdated(user, userStats[user].airdropWeight, reason);
    }
    
    function setBlacklist(address user, bool isBlacklisted) 
        external 
        onlyOwner 
        validAddress(user) 
    {
        blacklist[user] = isBlacklisted;
        emit UserBlacklisted(user, isBlacklisted);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // ===============================================
    // 查询函数 - 保持不变
    // ===============================================
    
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 totalPoints,
            uint256 consecutiveDays,
            uint256 lastCheckinDate,
            uint256 airdropWeight,
            uint256 totalBNBSpent,
            uint256 totalCheckins,
            bool isActive
        ) 
    {
        UserStats memory stats = userStats[user];
        return (
            stats.totalPoints,
            stats.consecutiveDays,
            stats.lastCheckinDate,
            stats.airdropWeight,
            stats.totalBNBSpent,
            stats.totalCheckins,
            stats.isActive
        );
    }
    
    function getUserCheckinHistory(address user) 
        external 
        view 
        returns (CheckinRecord[] memory) 
    {
        return checkinHistory[user];
    }
    
    function getUserCheckinCount(address user) external view returns (uint256) {
        return checkinHistory[user].length;
    }
    
    function getUserLatestCheckin(address user) 
        external 
        view 
        returns (CheckinRecord memory) 
    {
        require(checkinHistory[user].length > 0, "No checkin history");
        return checkinHistory[user][checkinHistory[user].length - 1];
    }
    
    function previewCheckinRewards(address user) 
        external 
        view 
        returns (
            uint256 pointsEarned,
            uint256 airdropWeightEarned,
            uint256 consecutiveDays
        ) 
    {
        if (!canCheckin(user)) {
            return (0, 0, 0);
        }
        
        uint256 currentDay = getCurrentDay();
        uint256 projectedConsecutiveDays = calculateConsecutiveDays(user, currentDay);
        
        return (
            calculatePoints(projectedConsecutiveDays),
            calculateAirdropWeight(projectedConsecutiveDays),
            projectedConsecutiveDays
        );
    }

    function getContractInfo() 
        external 
        view 
        returns (
            uint256 _checkinCost,
            uint256 _totalUsers,
            uint256 _totalCheckins,
            uint256 _totalRevenue,
            uint256 _contractBalance
        ) 
    {
        return (
            checkinCost,
            totalUsers,
            totalCheckins,
            totalRevenue,
            address(this).balance
        );
    }
    
    function getRevenueInfo() 
        external 
        view 
        returns (
            uint256 _platformRevenue,
            uint256 _gasReserve,
            address _platformTreasury
        ) 
    {
        return (
            platformRevenue,
            gasReserve,
            platformTreasury
        );
    }

    // ===============================================
    // 接收BNB函数
    // ===============================================
    
    receive() external payable {
        // 允许接收BNB，但不执行任何操作
        // 用户必须调用performCheckin()函数进行签到
    }
}