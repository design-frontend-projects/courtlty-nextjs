/**
 * Validate court size for a specific sport
 */
export function validateCourtSize(
  sport: string,
  width: number,
  length: number
): { valid: boolean; message?: string } {
  const sizeRequirements: Record<
    string,
    { minWidth: number; minLength: number }
  > = {
    basketball: { minWidth: 15, minLength: 28 },
    football: { minWidth: 45, minLength: 90 },
    tennis: { minWidth: 10.97, minLength: 23.77 },
    volleyball: { minWidth: 9, minLength: 18 },
    badminton: { minWidth: 6.1, minLength: 13.4 },
    padel: { minWidth: 10, minLength: 20 },
  };

  const requirements = sizeRequirements[sport.toLowerCase()];
  if (!requirements) {
    return { valid: true }; // No validation for unknown sports
  }

  if (width < requirements.minWidth || length < requirements.minLength) {
    return {
      valid: false,
      message: `Court size for ${sport} must be at least ${requirements.minWidth}m x ${requirements.minLength}m`,
    };
  }

  return { valid: true };
}

/**
 * Calculate split payment amount for team bookings
 */
export function calculateSplitPayment(
  totalAmount: number,
  numberOfPlayers: number
): number {
  return Math.ceil((totalAmount / numberOfPlayers) * 100) / 100; // Round up to 2 decimals
}

/**
 * Get max players for a sport
 */
export function getMaxPlayersForSport(sport: string): number {
  const maxPlayers: Record<string, number> = {
    basketball: 12,
    football: 18,
    tennis: 4,
    volleyball: 12,
    badminton: 4,
    padel: 4,
  };

  return maxPlayers[sport.toLowerCase()] || 10; // Default to 10
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
