const { Question, sequelize } = require('../src/models/Question');

const dpQuestions = [
  {
    title: "Climbing Stairs",
    pattern: "Fibonacci Sequence",
    difficulty: "Easy",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    boilerplate: "class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2: return n\n        \n        # State: dp[i] = ways to reach step i\n        dp = [0] * (n + 1)\n        \n        # Base cases: 1 way for 1 step, 2 ways for 2 steps\n        dp[1] = 1\n        dp[2] = 2\n        \n        # TODO: Implement the transition logic\n        # Hint: How many ways to reach i using only 1-step or 2-step jumps?\n        \n        return dp[n]"
  },
  {
    title: "Coin Change",
    pattern: "Unbounded Knapsack",
    difficulty: "Medium",
    description: "You are given an integer array coins representing different denominations and an integer amount. Find the fewest number of coins that you need to make up that amount.",
    boilerplate: "class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        # State: dp[i] = min coins for amount i\n        # Initialize with infinity (amount + 1 is safe)\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n        \n        # TODO: Implement transition logic\n        # Hint: For each coin, update the dp table for all reachable amounts\n        # Iterate through coins and update dp[i] based on dp[i - coin]\n        \n        return dp[amount] if dp[amount] <= amount else -1"
  },
  {
    title: "Longest Common Subsequence",
    pattern: "LCS / Multi-String DP",
    difficulty: "Medium",
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    boilerplate: "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        m, n = len(text1), len(text2)\n        \n        # State: dp[i][j] = LCS length of text1[:i] and text2[:j]\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        \n        # TODO: Implement the nested loop transition\n        # Hint: If characters match: 1 + diagonal. Else: max(top, left).\n        \n        return dp[m][n]"
  },
  {
    title: "Longest Increasing Subsequence",
    pattern: "LIS / State Compression",
    difficulty: "Medium",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    boilerplate: "class Solution:\n    def lengthOfLIS(self, nums: list[int]) -> int:\n        if not nums: return 0\n        \n        # State: dp[i] = length of LIS ending exactly at index i\n        dp = [1] * len(nums)\n        \n        # TODO: Implement the nested loop comparison\n        # Hint: For each i, check all j < i. If nums[i] > nums[j], update dp[i].\n        \n        return max(dp)"
  },
  {
    title: "Partition Equal Subset Sum",
    pattern: "0/1 Knapsack",
    difficulty: "Medium",
    description: "Given a non-empty array nums containing only positive integers, find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal.",
    boilerplate: "class Solution:\n    def canPartition(self, nums: list[int]) -> bool:\n        total_sum = sum(nums)\n        if total_sum % 2 != 0: return False\n        \n        target = total_sum // 2\n        \n        # State: dp[i] = can we reach sum i using a subset?\n        dp = [False] * (target + 1)\n        dp[0] = True\n        \n        # TODO: Implement the 0/1 knapsack transition\n        # Hint: For each num, iterate backwards from target to num\n        \n        return dp[target]"
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    for (const q of dpQuestions) {
      const [question, created] = await Question.findOrCreate({
        where: { title: q.title },
        defaults: q
      });
      
      if (created) {
        console.log(`✅ Created: ${q.title}`);
      } else {
        console.log(`⏭️  Skipped (exists): ${q.title}`);
      }
    }

    console.log("DP Questions processed!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
