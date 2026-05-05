const { Question, sequelize } = require('../src/models/Question');

const curriculum = {
  "Two Pointers": [
    "Container With Most Water", "Two Sum (Sorted Array)", "3-Sum", 
    "Triangle Numbers", "Move Zeroes", "Sort Colors", "Trapping Rain Water"
  ],
  "Sliding Window": [
    "Maximum Sum of Subarrays of Size K", "Max Points You Can Obtain From Cards", 
    "Max Sum of Distinct Subarrays Length k", "Longest Substring Without Repeating Characters", 
    "Longest Repeating Character Replacement"
  ],
  "Intervals": [
    "Can Attend Meetings", "Insert Interval", "Non-Overlapping Intervals", 
    "Merge Intervals", "Employee Free Time"
  ],
  "Stack": [
    "Valid Parentheses", "Decode String", "Longest Valid Parentheses", 
    "Daily Temperatures", "Largest Rectangle in Histogram"
  ],
  "Linked List": [
    "Linked List Cycle", "Palindrome Linked List", "Remove Nth Node From End of List", 
    "Reorder List", "Swap Nodes in Pairs"
  ],
  "Binary Search": [
    "Apple Harvest (Koko Eating Bananas)", "Search in Rotated Sorted Array"
  ],
  "Heap": [
    "Kth Largest Element in an Array", "K Closest Points to Origin", 
    "Find K Closest Elements", "Merge K Sorted Lists"
  ],
  "DFS": [
    "Maximum Depth of Binary Tree", "Path Sum", "Validate Binary Search Tree", 
    "Calculate Tilt", "Diameter of a Binary Tree", "Path Sum II", 
    "Longest Univalue Path", "Copy Graph", "Graph Valid Tree", 
    "Flood Fill", "Number of Islands", "Surrounded Regions", "Pacific Atlantic Water Flow"
  ],
  "BFS": [
    "Level Order Sum", "Rightmost Node", "Zigzag Level Order", 
    "Maximum Width of Binary Tree", "Minimum Knight Moves", 
    "Rotting Oranges", "01-Matrix", "Bus Routes"
  ],
  "Backtracking": [
    "Word Search", "Subsets", "Generate Parentheses", "Combination Sum"
  ],
  "Graphs": [
    "Course Schedule", "Course Schedule II"
  ],
  "Dynamic Programming": [
    "Counting Bits", "Decode Ways", "Unique Paths", "Maximal Square", 
    "Longest Increasing Subsequence", "Word Break", "Maximum Profit in Job Scheduling"
  ],
  "Greedy": [
    "Best Time to Buy and Sell Stock", "Gas Station", "Jump Game"
  ],
  "Trie": [
    "Implement Trie Methods", "Prefix Matching"
  ],
  "Prefix Sum": [
    "Count Vowels in Substrings", "Subarray Sum Equals K"
  ],
  "Matrices": [
    "Spiral Matrix", "Rotate Image", "Set Matrix Zeroes"
  ]
};

function getBoilerplate(title, pattern) {
  return `class Solution:\n    def solve(self, ...):\n        # Pattern: ${pattern}\n        # Problem: ${title}\n        \n        # TODO: Implement the core logic here.\n        # Hint: Think about how the ${pattern} pattern applies to this specific problem.\n        \n        pass`;
}

const allQuestions = [];
for (const [pattern, titles] of Object.entries(curriculum)) {
  for (const title of titles) {
    allQuestions.push({
      title,
      pattern,
      difficulty: "Medium", // Default
      description: `Practice the ${pattern} pattern with this classic problem: ${title}.`,
      boilerplate: getBoilerplate(title, pattern)
    });
  }
}

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synced.");
    await Question.bulkCreate(allQuestions);
    console.log(`Seeded ${allQuestions.length} questions from Hello Interview!`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
