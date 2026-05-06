const { Question, sequelize } = require('../src/models/Question');

const allQuestions = [
  {
    title: "Container With Most Water",
    pattern: "Two Pointers",
    difficulty: "Medium",
    description: "Given n non-negative integers height[n], where each represents a point at coordinate (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    boilerplate: "class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        # State: left and right pointers at the boundaries\n        left, right = 0, len(height) - 1\n        max_val = 0\n        \n        # TODO: Implement the two-pointer shrink logic\n        # Hint: Which pointer should you move to potentially find a larger area?\n        \n        return max_val"
  },
  {
    title: "Longest Substring Without Repeating Characters",
    pattern: "Sliding Window",
    difficulty: "Medium",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    boilerplate: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # State: left pointer and a set/map for characters in window\n        char_set = set()\n        left = 0\n        max_len = 0\n        \n        # TODO: Implement the sliding window expansion and contraction\n        # Hint: When you see a duplicate, move 'left' until the duplicate is gone.\n        \n        return max_len"
  },
  {
    title: "Merge Intervals",
    pattern: "Intervals",
    difficulty: "Medium",
    description: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.",
    boilerplate: "class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        if not intervals: return []\n        \n        # Step 1: Sort intervals by start time\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n        \n        # TODO: Iterate and merge\n        # Hint: Compare the end of the last merged interval with the start of the current one.\n        \n        return merged"
  },
  {
    title: "Valid Parentheses",
    pattern: "Stack",
    difficulty: "Easy",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    boilerplate: "class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {')': '(', '}': '{', ']': '['}\n        \n        # TODO: Implement stack-based matching\n        # Hint: Push openers, pop and check for closers.\n        \n        return not stack"
  },
  {
    title: "Linked List Cycle",
    pattern: "Linked List",
    difficulty: "Easy",
    description: "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
    boilerplate: "class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        # State: Slow and Fast pointers\n        slow = fast = head\n        \n        # TODO: Implement Floyd's Cycle-Finding Algorithm\n        # Hint: If there's a cycle, the fast pointer will eventually catch the slow one.\n        \n        return False"
  },
  {
    title: "Search in Rotated Sorted Array",
    pattern: "Binary Search",
    difficulty: "Medium",
    description: "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
    boilerplate: "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        left, right = 0, len(nums) - 1\n        \n        # TODO: Implement modified Binary Search\n        # Hint: Determine which half (left or right) is sorted before deciding where to search.\n        \n        return -1"
  },
  {
    title: "Kth Largest Element in an Array",
    pattern: "Heap",
    difficulty: "Medium",
    description: "Given an integer array nums and an integer k, return the kth largest element in the array.",
    boilerplate: "import heapq\n\nclass Solution:\n    def findKthLargest(self, nums: list[int], k: int) -> int:\n        # TODO: Implement using a min-heap of size k\n        # Hint: Maintain the k largest elements in the heap. The min will be the kth largest.\n        \n        return 0"
  },
  {
    title: "Validate Binary Search Tree",
    pattern: "DFS (Trees)",
    difficulty: "Medium",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    boilerplate: "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        def validate(node, low=-float('inf'), high=float('inf')):\n            if not node: return True\n            \n            # TODO: Implement range-based validation\n            # Hint: Every node must be strictly between 'low' and 'high'.\n            \n            return False\n            \n        return validate(root)"
  },
  {
    title: "Number of Islands",
    pattern: "DFS (Graphs)",
    difficulty: "Medium",
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    boilerplate: "class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        if not grid: return 0\n        count = 0\n        \n        def dfs(r, c):\n            # TODO: Implement DFS to sink the island\n            pass\n            \n        # TODO: Iterate through the grid and trigger DFS for each '1'\n        \n        return count"
  },
  {
    title: "Level Order Traversal",
    pattern: "BFS (Trees)",
    difficulty: "Medium",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    boilerplate: "from collections import deque\n\nclass Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> list[list[int]]:\n        if not root: return []\n        result = []\n        queue = deque([root])\n        \n        # TODO: Implement level-by-level BFS\n        # Hint: Capture the length of the queue at the start of each level.\n        \n        return result"
  },
  {
    title: "Rotting Oranges",
    pattern: "BFS (Graphs)",
    difficulty: "Medium",
    description: "You are given an m x n grid where each cell can have one of three values: 0 (empty), 1 (fresh), or 2 (rotten). Return the minimum number of minutes that must elapse until no cell has a fresh orange. If impossible, return -1.",
    boilerplate: "from collections import deque\n\nclass Solution:\n    def orangesRotting(self, grid: list[list[int]]) -> int:\n        rows, cols = len(grid), len(grid[0])\n        queue = deque([])\n        fresh = 0\n        \n        # TODO: Initialize queue with all rotten oranges and count fresh ones\n        \n        # TODO: Implement multi-source BFS to rot neighbors\n        \n        return -1"
  },
  {
    title: "Word Search",
    pattern: "Backtracking",
    difficulty: "Medium",
    description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid.",
    boilerplate: "class Solution:\n    def exist(self, board: list[list[str]], word: str) -> bool:\n        rows, cols = len(board), len(board[0])\n        \n        def backtrack(r, c, index):\n            # TODO: Implement recursive search with backtracking\n            # Hint: Temporarily mark visited cells to avoid reuse.\n            pass\n            \n        # TODO: Trigger backtrack for each cell that matches word[0]\n        \n        return False"
  },
  {
    title: "Unique Paths",
    pattern: "Dynamic Programming",
    difficulty: "Medium",
    description: "A robot is located at the top-left corner of a m x n grid. The robot can only move either down or right at any point in time. Return the number of possible unique paths to reach the bottom-right corner.",
    boilerplate: "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        # State: dp[i][j] = paths to cell (i, j)\n        dp = [[1] * n for _ in range(m)]\n        \n        # TODO: Implement DP transition\n        # Hint: dp[i][j] = dp[i-1][j] + dp[i][j-1]\n        \n        return dp[m-1][n-1]"
  },
  {
    title: "Best Time to Buy and Sell Stock",
    pattern: "Greedy",
    difficulty: "Easy",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit you can achieve from this transaction.",
    boilerplate: "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        min_price = float('inf')\n        max_profit = 0\n        \n        # TODO: Implement greedy one-pass\n        # Hint: Track the lowest price seen so far and calculate potential profit daily.\n        \n        return max_profit"
  },
  {
    title: "Implement Trie",
    pattern: "Trie",
    difficulty: "Medium",
    description: "A trie (pronounced as 'try') or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.",
    boilerplate: "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.isEndOfWord = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str) -> None:\n        # TODO: Implement insertion\n        pass\n\n    def search(self, word: str) -> bool:\n        # TODO: Implement exact match search\n        pass"
  },
  {
    title: "Subarray Sum Equals K",
    pattern: "Prefix Sum",
    difficulty: "Medium",
    description: "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.",
    boilerplate: "class Solution:\n    def subarraySum(self, nums: list[int], k: int) -> int:\n        # State: cumulative sum count map\n        prefix_sums = {0: 1}\n        curr_sum = 0\n        count = 0\n        \n        # TODO: Implement prefix sum pattern\n        # Hint: If (curr_sum - k) is in the map, we found subarrays.\n        \n        return count"
  },
  {
    title: "Spiral Matrix",
    pattern: "Matrices",
    difficulty: "Medium",
    description: "Given an m x n matrix, return all elements of the matrix in spiral order.",
    boilerplate: "class Solution:\n    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:\n        if not matrix: return []\n        res = []\n        top, bottom = 0, len(matrix) - 1\n        left, right = 0, len(matrix[0]) - 1\n        \n        # TODO: Implement 4-directional spiral traversal\n        # Hint: Shrink boundaries after each direction is completed.\n        \n        return res"
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    for (const q of allQuestions) {
      // Use findOrCreate to avoid duplicates and prevent table deletion
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

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
