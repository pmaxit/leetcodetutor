const { tavily } = require('@tavily/core');
require('dotenv').config();

class SearchService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.client = this.apiKey ? tavily({ apiKey: this.apiKey }) : null;
  }

  /**
   * Performs a web search and returns a concise summary of results.
   */
  async performSearch(query) {
    console.log(`Searching Tavily for: "${query}"...`);
    if (!this.client) {
      return "Web search is not available (TAVILY_API_KEY not configured).";
    }
    try {
      const results = await this.client.search(query, {
        searchDepth: "basic",
        maxResults: 3
      });

      if (!results || !results.results || results.results.length === 0) {
        return "No relevant web search results found.";
      }

      // Extract top results
      const topResults = results.results.map((res, i) => {
        return `[${i + 1}] ${res.title}\nURL: ${res.url}\nSnippet: ${res.content}\n`;
      }).join('\n');

      return `WEB SEARCH RESULTS for "${query}":\n\n${topResults}\n\nUse this information to answer the candidate's query or verify technical details.`;
    } catch (error) {
      console.error("Tavily Search Error:", error);
      return `Failed to perform web search for "${query}". Error: ${error.message}`;
    }
  }
}

module.exports = new SearchService();
