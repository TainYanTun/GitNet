import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { LRUCache } from 'lru-cache'; // Named import
import fetch from 'node-fetch';


// Define a simple in-memory cache
const cache = new LRUCache({
  max: 100, // cache up to 100 GitHub profiles
  ttl: 1000 * 60 * 60, // 1 hour cache
});

interface GitHubProfileResponse {
  avatar_url: string;
  html_url: string;
  login: string;
}

export class GitHubService {
  private apiBaseUrl = 'https://api.github.com';

  async getProfileByEmail(email: string): Promise<GitHubProfileResponse | null> {
    const cached = cache.get(email);
    if (cached) {
      return cached as GitHubProfileResponse;
    }

    try {
      // GitHub API does not directly support searching by email for public profiles efficiently.
      // A common approach is to search for repos by the user's email or rely on username.
      // For simplicity, we'll assume we can search by username derived from email or
      // if we had an authenticated user, we could do more.
      // Let's assume we can get a username from the email if it's a GitHub-associated one.
      // This is a simplification. A real implementation might use:
      // 1. Search commits by email to get usernames
      // 2. Directly query by username.
      // Since we only have email, and public API search by email is rate-limited/difficult,
      // we'll primarily rely on the client providing a username, or attempt to derive one.

      // For demonstration, let's assume we get a username.
      // This part will need refinement based on how authors are mapped to GitHub users.
      console.warn(`GitHubService: Searching profile for email ${email} - direct email search is limited.`);
      return null; // Placeholder: No direct public API to get profile from email without complex searching.

    } catch (error) {
      console.error(`Error fetching GitHub profile for email ${email}:`, error);
      return null;
    }
  }

  async getProfileByUsername(username: string): Promise<GitHubProfileResponse | null> {
    const cached = cache.get(username);
    if (cached) {
      return cached as GitHubProfileResponse;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/users/${username}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`GitHub profile not found for username: ${username}`);
          return null;
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const profile = (await response.json()) as GitHubProfileResponse;
      cache.set(username, profile);
      return profile;
    } catch (error) {
      console.error(`Error fetching GitHub profile for username ${username}:`, error);
      return null;
    }
  }
}
