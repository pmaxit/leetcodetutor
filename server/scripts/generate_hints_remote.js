const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false
});

// Hints templates by pattern (from our strict pattern)
const hintsTemplates = {
  'Arrays & Hashing': {
    hints: [
      'What key-value relationship solves the problem? Map each element to what it depends on or what depends on it.',
      'Use a hash map or set to avoid nested loops. How does it reduce time complexity from O(n²) to O(n)?',
      'Handle collisions and duplicates carefully. Do you need counts, indices, or just existence checks?'
    ]
  },
  'Linked List': {
    hints: [
      'Pointer manipulation is key. How do you reverse pointers or skip nodes without losing references?',
      'Use slow/fast pointers for cycle detection. Why does the tortoise-hare algorithm work?',
      'Be careful with null checks and edge cases: empty list, single node, or operations at head/tail.'
    ]
  },
  'Two Pointers': {
    hints: [
      'What are the two boundary conditions you need to check? Start at opposite ends and move inward.',
      'Each pointer moves toward the optimal solution. When does your left pointer advance vs when does your right pointer retreat?',
      'Watch for off-by-one errors in the termination condition and handle edge cases like duplicate values.'
    ]
  },
  'Sliding Window': {
    hints: [
      'Define your window explicitly: what are the start and end positions? When do you expand vs shrink the window?',
      'Maintain invariants inside the window. What condition must be true when you expand, and what breaks it?',
      'Optimize using a hash map or counter to track elements in the current window for O(1) updates.'
    ]
  },
  'Trees': {
    hints: [
      'Build your tree explicitly if needed: left/right children? What does each edge represent in the problem?',
      'Choose DFS or BFS based on your goal. DFS for depth exploration, BFS for level-order or shortest paths.',
      'Track visited/explored nodes to avoid cycles. Use inorder, preorder, or postorder traversal as needed.'
    ]
  },
  'Stack': {
    hints: [
      'Stack property: Last-In-First-Out. When do you push vs pop? What invariant must the stack maintain?',
      'Use the stack to defer decisions. What information do you store on the stack to match/validate later?',
      'Peek at the top without popping to make decisions. Handle empty stack edge cases carefully.'
    ]
  },
  'Intervals': {
    hints: [
      'Sort intervals first. Why does sorting by start time matter for overlap detection?',
      'Two intervals overlap if one starts before the other ends. How do you merge them efficiently?',
      'Track the current merged interval and update it as you iterate. Handle edge cases where intervals touch at boundaries.'
    ]
  },
  'Binary Search': {
    hints: [
      'Define your search space clearly: what is the invariant at each step? When do you narrow left vs right?',
      'Exit condition: when does left == right or left > right? Which boundary includes your answer?',
      'Off-by-one errors are common. Test with small arrays: 1 element, 2 elements, and verify boundaries.'
    ]
  },
  'Heap': {
    hints: [
      'What property must the heap maintain? Min-heap vs max-heap? How does insertion/deletion preserve it?',
      'Use a heap to efficiently track top K elements. Why is a heap better than sorting?',
      'Heapify operations take O(log n). What happens when you insert, remove, or replace the root?'
    ]
  },
  'Dynamic Programming': {
    hints: [
      'Define your DP state: what does dp[i] or dp[i][j] represent? This is the critical insight.',
      'Derive the recurrence: how does the current state depend on smaller subproblems? Work backward from the goal.',
      'Base cases matter. What are the simplest subproblems? Ensure your recurrence handles boundaries correctly.'
    ]
  },
  'Graphs': {
    hints: [
      'Build your graph explicitly: adjacency list or matrix? What does each edge represent in the problem?',
      'Choose DFS or BFS based on your goal. DFS for depth exploration, BFS for shortest paths or level-order.',
      'Track visited nodes to avoid cycles. Use topological sort for DAGs or detect cycles in directed graphs.'
    ]
  },
  'Backtracking': {
    hints: [
      'Define your decision tree: at each step, what choices do you explore? When do you backtrack and undo?',
      'Use a DFS helper with current state, remaining choices, and result collection. Build solutions incrementally.',
      'Pruning is key. Can you cut branches early if they violate constraints? This dramatically reduces search space.'
    ]
  },
  'Greedy': {
    hints: [
      'Greedy works only if local optimal choices lead to global optimality. Prove this property for your problem.',
      'Sort or prioritize by the right metric first. What quantity should you optimize at each step?',
      'Test greedy against counterexamples. Does it fail on certain inputs? If so, you may need DP instead.'
    ]
  },
  'Trie': {
    hints: [
      'Design your Trie structure: node fields for children and end-of-word flag. What else do you track?',
      'Insertion and search are both O(word length). How do you traverse the Trie for each character?',
      'Handle edge cases: empty string, prefix vs full word, character existence checks.'
    ]
  },
  'Matrix': {
    hints: [
      'Row-major vs column-major traversal matters. Are you scanning row-by-row, column-by-column, or diagonally?',
      'Use index arithmetic to avoid nested loops: index = row * cols + col. Can you treat the matrix as a 1D array?',
      'Spiral, zigzag, or layer-by-layer traversal. Identify your traversal pattern first, then implement boundaries.'
    ]
  },
  'String': {
    hints: [
      'Clarify character types: ASCII, Unicode, case-sensitive? Are spaces or special characters significant?',
      'Common patterns: rolling hash for substring matching, KMP for pattern search, or character frequency maps.',
      'Edge cases: empty strings, single characters, repeated patterns. Verify your algorithm handles them.'
    ]
  },
  'Divide and Conquer': {
    hints: [
      'Break the problem into independent subproblems. How do you divide input to make subproblems disjoint?',
      'Conquer recursively. What is the base case? When do you stop dividing?',
      'Combine subproblem results into the final answer. How do you merge or aggregate partial results?'
    ]
  },
  'Bit Manipulation': {
    hints: [
      'Understand bit operations: AND, OR, XOR, NOT, shifts. Which one isolates, combines, or transforms bits?',
      'Two\'s complement for negative numbers. How do sign bits work in your operation?',
      'Check bit positions, flip bits, or count set bits. Use bit masks to track state efficiently.'
    ]
  },
  'Prefix Sum': {
    hints: [
      'Precompute prefix sums: prefix[i] = sum of first i elements. What does prefix[j] - prefix[i] represent?',
      'Use prefix sums to answer range queries in O(1) after O(n) preprocessing.',
      'Extend to 2D prefix sums for matrix range queries. Handle zero-indexing vs one-indexing carefully.'
    ]
  }
};

// Default hints for unmapped categories
const defaultHints = [
  'Identify the problem\'s critical constraint or invariant. What property must always be true?',
  'Break the problem into smaller subproblems. How does the current state depend on previous states?',
  'Consider edge cases: empty input, single element, or boundary conditions. Do they work correctly?'
];

function getHintsForCategory(category) {
  // Try exact match
  if (hintsTemplates[category]) {
    return hintsTemplates[category].hints;
  }

  // Try partial match (case-insensitive)
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(hintsTemplates)) {
    if (key.toLowerCase().includes(lowerCategory) || lowerCategory.includes(key.toLowerCase())) {
      return value.hints;
    }
  }

  // Return default hints
  return defaultHints;
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log(`\n${'='.repeat(80)}`);
    console.log('🚀 Generating Hints for Remote neetcode_db.problems');
    console.log(`${'='.repeat(80)}\n`);

    // Get all problems from remote database
    const [problems] = await sequelize.query(
      'SELECT id, title, category FROM problems ORDER BY id'
    );

    console.log(`📊 Found ${problems.length} problems to update\n`);

    let updated = 0;
    let skipped = 0;
    const errors = [];
    const categoryMap = {};

    for (const problem of problems) {
      try {
        const hints = getHintsForCategory(problem.category);
        const hintsJson = JSON.stringify(hints);

        // Track categories
        if (!categoryMap[problem.category]) {
          categoryMap[problem.category] = 0;
        }
        categoryMap[problem.category]++;

        // Update database
        await sequelize.query(
          'UPDATE problems SET hints = ? WHERE id = ?',
          { replacements: [hintsJson, problem.id] }
        );

        updated++;

        if (updated % 100 === 0) {
          console.log(`✓ Processed ${updated}/${problems.length} problems...`);
        }
      } catch (error) {
        errors.push(`ID ${problem.id} (${problem.title}): ${error.message}`);
        skipped++;
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`✓ Hints Generation Complete!`);
    console.log(`${'='.repeat(80)}\n`);

    console.log('📈 Summary:');
    console.log(`   ✓ Updated: ${updated}/${problems.length} problems`);
    console.log(`   ✗ Errors: ${skipped}\n`);

    console.log('📂 Category Coverage:');
    const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
    sortedCategories.forEach(([category, count]) => {
      console.log(`   ${category}: ${count} problems`);
    });

    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(e => console.log(`   - ${e}`));
    }

    console.log(`\n✓ Remote database neetcode_db.problems is now fully populated with hints!\n`);

  } catch (error) {
    console.error('✗ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
