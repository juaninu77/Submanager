// Service to fetch company logos from various APIs

interface LogoResult {
  url: string
  source: string
}

export class LogoService {
  // Clearbit Logo API (free tier available)
  static async searchClearbitLogo(companyName: string): Promise<string | null> {
    try {
      // Clearbit domain-based logo API
      const domain = LogoService.getDomainFromCompanyName(companyName)
      if (domain) {
        const logoUrl = `https://logo.clearbit.com/${domain}`
        
        // For Clearbit, we'll return the URL directly since it works with CORS
        // and will fallback to placeholder if the logo doesn't exist
        return logoUrl
      }
      return null
    } catch (error) {
      console.warn('Clearbit logo fetch failed:', error)
      return null
    }
  }

  // Brandfetch API (alternative)
  static async searchBrandfetchLogo(companyName: string): Promise<string | null> {
    try {
      const domain = LogoService.getDomainFromCompanyName(companyName)
      if (!domain) return null

      // This would require an API key in production
      // For now, we'll use a simplified approach
      const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`)
      if (response.ok) {
        const data = await response.json()
        return data.logos?.[0]?.formats?.[0]?.src || null
      }
      return null
    } catch (error) {
      console.warn('Brandfetch logo fetch failed:', error)
      return null
    }
  }

  // DuckDuckGo favicon API (reliable and free)
  static async searchDuckDuckGoFavicon(companyName: string): Promise<string | null> {
    try {
      const domain = LogoService.getDomainFromCompanyName(companyName)
      if (domain) {
        // DuckDuckGo provides favicons for most domains
        const logoUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`
        return logoUrl
      }
      return null
    } catch (error) {
      console.warn('DuckDuckGo favicon fetch failed:', error)
      return null
    }
  }

  // Google S2 favicon API (backup option)
  static async searchGoogleFavicon(companyName: string): Promise<string | null> {
    try {
      const domain = LogoService.getDomainFromCompanyName(companyName)
      if (domain) {
        const logoUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
        return logoUrl
      }
      return null
    } catch (error) {
      console.warn('Google favicon fetch failed:', error)
      return null
    }
  }

  // Helper function to map company names to domains
  static getDomainFromCompanyName(companyName: string): string | null {
    const normalized = companyName.toLowerCase().trim()
    
    // Common service mappings
    const knownDomains: Record<string, string> = {
      'netflix': 'netflix.com',
      'spotify': 'spotify.com',
      'amazon': 'amazon.com',
      'amazon prime': 'amazon.com',
      'disney plus': 'disneyplus.com',
      'disney+': 'disneyplus.com',
      'hbo max': 'hbomax.com',
      'hulu': 'hulu.com',
      'youtube premium': 'youtube.com',
      'apple music': 'apple.com',
      'adobe': 'adobe.com',
      'adobe cc': 'adobe.com',
      'creative cloud': 'adobe.com',
      'microsoft': 'microsoft.com',
      'office 365': 'microsoft.com',
      'google': 'google.com',
      'google drive': 'google.com',
      'dropbox': 'dropbox.com',
      'slack': 'slack.com',
      'zoom': 'zoom.us',
      'notion': 'notion.so',
      'figma': 'figma.com',
      'github': 'github.com',
      'steam': 'steampowered.com',
      'playstation': 'playstation.com',
      'xbox': 'xbox.com',
      'nintendo': 'nintendo.com',
      'twitch': 'twitch.tv',
      'twitter': 'twitter.com',
      'x': 'twitter.com',
      'facebook': 'facebook.com',
      'instagram': 'instagram.com',
      'linkedin': 'linkedin.com',
      'whatsapp': 'whatsapp.com',
      'telegram': 'telegram.org',
      'discord': 'discord.com',
      'reddit': 'reddit.com',
      'tiktok': 'tiktok.com',
      'pinterest': 'pinterest.com',
      'snapchat': 'snapchat.com',
      'uber': 'uber.com',
      'lyft': 'lyft.com',
      'airbnb': 'airbnb.com',
      'booking': 'booking.com',
      'expedia': 'expedia.com',
      'paypal': 'paypal.com',
      'stripe': 'stripe.com',
      'square': 'squareup.com',
      'venmo': 'venmo.com',
      'cashapp': 'cash.app',
      'zelle': 'zellepay.com'
    }

    if (knownDomains[normalized]) {
      return knownDomains[normalized]
    }

    // Try to guess domain by adding .com
    if (normalized.match(/^[a-z0-9]+$/)) {
      return `${normalized}.com`
    }

    return null
  }

  // Main search function that tries multiple APIs
  static async searchLogo(companyName: string): Promise<LogoResult | null> {
    if (!companyName.trim()) return null

    try {
      // Try Clearbit first (most reliable and free)
      const clearbitLogo = await LogoService.searchClearbitLogo(companyName)
      if (clearbitLogo) {
        return { url: clearbitLogo, source: 'clearbit' }
      }

      // If Clearbit fails, try DuckDuckGo favicon
      const duckDuckGoLogo = await LogoService.searchDuckDuckGoFavicon(companyName)
      if (duckDuckGoLogo) {
        return { url: duckDuckGoLogo, source: 'duckduckgo' }
      }

      // Finally, try Google favicon
      const googleLogo = await LogoService.searchGoogleFavicon(companyName)
      if (googleLogo) {
        return { url: googleLogo, source: 'google' }
      }

      return null
    } catch (error) {
      console.error('Logo search failed:', error)
      return null
    }
  }
}