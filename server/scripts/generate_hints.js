const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Generating hints for all problems...\n');
});

// Hints templates by pattern (strict format: 3 hints max, focus on critical sections)
const hintsTemplates = {
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
  'Intervals': {
    hints: [
      'Sort intervals first. Why does sorting by start time matter for overlap detection?',
      'Two intervals overlap if one starts before the other ends. How do you merge them efficiently?',
      'Track the current merged interval and update it as you iterate. Handle edge cases where intervals touch at boundaries.'
    ]
  },
  'Stack': {
    hints: [
      'Stack property: Last-In-First-Out. When do you push vs pop? What invariant must the stack maintain?',
      'Use the stack to defer decisions. What information do you store on the stack to match/validate later?',
      'Peek at the top without popping to make decisions. Handle empty stack edge cases carefully.'
    ]
  },
  'Linked List': {
    hints: [
      'Pointer manipulation is key. How do you reverse pointers or skip nodes without losing references?',
      'Use slow/fast pointers for cycle detection. Why does the tortoise-hare algorithm work?',
      'Be careful with null checks and edge cases: empty list, single node, or operations at head/tail.'
    ]
  },
  'Binary Search': {
    hints: [
      'Define your search space clearly: what is the invariant at each step? When do you narrow left vs right?',
      'Exit condition: when does left == right or left > right? Which boundary includes your answer?',
      'Off-by-one errors are common. Test with small arrays: 1 element, 2 elements, and verify boundaries.'
    ]
  },
  'Hash Map': {
    hints: [
      'What key-value relationship solves the problem? Map each element to what it depends on or what depends on it.',
      'Use a hash map to avoid nested loops. How does it reduce time complexity from O(n²) to O(n)?',
      'Handle collisions and duplicates carefully. Do you need counts, indices, or just existence checks?'
    ]
  },
  'Graph': {
    hints: [
      'Build your graph explicitly: adjacency list or matrix? What does each edge represent in the problem?',
      'Choose DFS or BFS based on your goal. DFS for depth-first exploration, BFS for shortest paths or level-order.',
      'Track visited nodes to avoid cycles. Use topological sort for DAGs or detect cycles in directed graphs.'
    ]
  },
  'Dynamic Programming': {
    hints: [
      'Define your DP state: what does dp[i] or dp[i][j] represent? This is the critical insight.',
      'Derive the recurrence: how does the current state depend on smaller subproblems? Work backward from the goal.',
      'Base cases matter. What are the simplest subproblems? Ensure your recurrence handles boundaries correctly.'
    ]
  },
  'BFS / DFS': {
    hints: [
      'Choose your traversal order: breadth-first explores level-by-level, depth-first goes deep first. Which fits your goal?',
      'Track visited/explored states to avoid redundant work. Use a queue (BFS) or recursion/stack (DFS).',
      'Reconstruct paths if needed. Store parent pointers or track the path as you traverse.'
    ]
  },
  'Greedy': {
    hints: [
      'Greedy works only if local optimal choices lead to global optimality. Prove this property for your problem.',
      'Sort or prioritize by the right metric first. What quantity should you optimize at each step?',
      'Test greedy against counterexamples. Does it fail on certain inputs? If so, you may need DP instead.'
    ]
  },
  'String': {
    hints: [
      'Clarify character types: ASCII, Unicode, case-sensitive? Are spaces or special characters significant?',
      'Common patterns: rolling hash for substring matching, KMP for pattern search, or character frequency maps.',
      'Edge cases: empty strings, single characters, repeated patterns. Verify your algorithm handles them.'
    ]
  },
  'Array': {
    hints: [
      'In-place operations save space. Can you use the array itself as auxiliary storage? Rearrange elements wisely.',
      'Sorted vs unsorted? Sorting unlocks two-pointer, binary search, or greedy approaches. Cost: O(n log n).',
      'Prefix/suffix sums or products can precompute results. What can you answer in O(1) after O(n) preprocessing?'
    ]
  },
  'Matrix': {
    hints: [
      'Row-major vs column-major traversal matters. Are you scanning row-by-row, column-by-column, or diagonally?',
      'Use index arithmetic to avoid nested loops: index = row * cols + col. Can you treat the matrix as a 1D array?',
      'Spiral, zigzag, or layer-by-layer traversal. Identify your traversal pattern first, then implement boundaries.'
    ]
  },
  'Backtracking': {
    hints: [
      'Define your decision tree: at each step, what choices do you explore? When do you backtrack and undo?',
      'Use a DFS helper with current state, remaining choices, and result collection. Build solutions incrementally.',
      'Pruning is key. Can you cut branches early if they violate constraints? This dramatically reduces search space.'
    ]
  },
  'Divide and Conquer': {
    hints: [
      'Break the problem into independent subproblems. How do you divide input to make subproblems disjoint?',
      'Conquer recursively. What is the base case? When do you stop dividing?',
      'Combine subproblem results into the final answer. How do you merge or aggregate partial results?'
    ]
  },
  'LCS / Multi-String DP': {
    hints: [
      'State: dp[i][j] = longest common subsequence of first i characters of string1 and first j of string2.',
      'Recurrence: if chars match, take diagonal + 1; otherwise, take max of left or top. Why does this work?',
      'Reconstruct the LCS by backtracking through the DP table, moving diagonal when characters match.'
    ]
  },
  'LIS / State Compression': {
    hints: [
      'State: dp[i] = length of LIS ending at index i. Iterate through all previous elements to compute.',
      'Optimization: use binary search to find the position to insert current element in an auxiliary array (O(n log n)).',
      'Why binary search? The auxiliary array stays sorted, so you can find the rightmost position ≤ current element.'
    ]
  },
  '0/1 Knapsack': {
    hints: [
      'State: dp[i][w] = max value using first i items with capacity w. Each item is included or excluded.',
      'Recurrence: dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i]). Why the two cases?',
      'Space optimization: use 1D DP and iterate weight backwards to avoid using an item twice.'
    ]
  },
  'Unbounded Knapsack': {
    hints: [
      'State: dp[i] = max value achievable with capacity i. Each item can be used unlimited times.',
      'Recurrence: dp[i] = max(dp[i], dp[i-weight[j]] + value[j]) for all items j. Why iterate weight forward?',
      'Forward iteration allows reusing items. The 1D DP is sufficient; no 2D needed.'
    ]
  },
  'Fibonacci Sequence': {
    hints: [
      'Recursive definition: F(n) = F(n-1) + F(n-2) with base cases F(0)=0, F(1)=1. Memoize to avoid recomputation.',
      'DP approach: build bottom-up from base cases. Why is this faster than naive recursion?',
      'Space optimization: you only need the last two values. Can you reduce space from O(n) to O(1)?'
    ]
  }
};

// Default hints for patterns not in the template
const defaultHints = [
  'Identify the problem\'s critical constraint or invariant. What property must always be true?',
  'Break the problem into smaller subproblems. How does the current state depend on previous states?',
  'Consider edge cases: empty input, single element, or boundary conditions. Do they work correctly?'
];

function getHintsForPattern(pattern) {
  // Try exact match
  if (hintsTemplates[pattern]) {
    return hintsTemplates[pattern].hints;
  }

  // Try partial match (case-insensitive)
  const lowerPattern = pattern.toLowerCase();
  for (const [key, value] of Object.entries(hintsTemplates)) {
    if (key.toLowerCase().includes(lowerPattern) || lowerPattern.includes(key.toLowerCase())) {
      return value.hints;
    }
  }

  // Return default hints
  return defaultHints;
}

db.serialize(() => {
  db.all('SELECT id, title, pattern FROM Questions ORDER BY id', (err, rows) => {
    if (err) {
      console.error('Error fetching questions:', err);
      process.exit(1);
    }

    console.log(`Found ${rows.length} problems. Generating hints...\n`);

    let completed = 0;
    const errors = [];

    rows.forEach((row, index) => {
      const hints = getHintsForPattern(row.pattern);
      const hintsJson = JSON.stringify(hints);

      db.run(
        'UPDATE Questions SET hints = ? WHERE id = ?',
        [hintsJson, row.id],
        (err) => {
          completed++;

          if (err) {
            console.error(`✗ Problem #${row.id} (${row.title}):`, err);
            errors.push(`#${row.id}: ${row.title}`);
          } else {
            console.log(`✓ Problem #${row.id}: ${row.title} [${row.pattern}]`);
          }

          if (completed === rows.length) {
            console.log(`\n✓ Hints generated for ${rows.length - errors.length}/${rows.length} problems`);

            if (errors.length > 0) {
              console.log('\nFailed problems:');
              errors.forEach(e => console.log(`  - ${e}`));
            }

            db.close();
            process.exit(errors.length > 0 ? 1 : 0);
          }
        }
      );
    });
  });
});
