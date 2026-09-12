export const MOCK_GIVEAWAYS = [
  {
    id: "GW-2026-08",
    title: "Summer Rewards Giveaway",
    description: "Complete eligible activities, collect entries and get a chance to win exciting rewards.",
    status: "active",
    // Ends in 12 days for mock purposes
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    participantsCount: 8523,
    prizes: [
      {
        id: "PRIZE-001",
        name: "iPhone 15 Pro",
        description: "Latest iPhone 15 Pro 256GB",
        position: 1,
        type: "physical",
        winnerCount: 1,
        entryFee: 250,
        entryCurrency: "VEs",
        image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&q=80"
      },
      {
        id: "PRIZE-002",
        name: "Apple Watch Series 9",
        description: "Stay active with the newest Apple Watch",
        position: 2,
        type: "physical",
        winnerCount: 3,
        entryFee: 200,
        entryCurrency: "VEs",
        image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80"
      },
      {
        id: "PRIZE-003",
        name: "AirPods Pro",
        description: "Immersive sound and noise cancellation",
        position: 3,
        type: "physical",
        winnerCount: 5,
        entryFee: 500,
        entryCurrency: "SVEs",
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&q=80"
      },
      {
        id: "PRIZE-004",
        name: "₹2,000 Amazon Voucher",
        description: "Shop for anything on Amazon",
        position: 4,
        type: "gift_card",
        winnerCount: 10,
        entryFee: 500,
        entryCurrency: "VEs",
        image: "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?w=500&q=80"
      }
    ]
  },
  {
    id: "GW-2026-07",
    title: "Independence Rewards",
    description: "Special independence day giveaway",
    status: "ended",
    startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    participantsCount: 12450,
    prizes: [
      {
        id: "PRIZE-005",
        name: "MacBook Air",
        position: 1,
        type: "physical",
        winnerCount: 1,
        entryFee: 1000,
        entryCurrency: "VEs",
      }
    ]
  }
];

export const MOCK_PREVIOUS_WINNERS = [
  { id: 1, maskedUserId: "VE****82", prize: "iPhone 15 Pro", giveaway: "July Reward Rush", date: "05 Aug 2026" },
  { id: 2, maskedUserId: "VE****91", prize: "Apple Watch", giveaway: "July Reward Rush", date: "05 Aug 2026" },
  { id: 3, maskedUserId: "VE****27", prize: "AirPods Pro", giveaway: "Summer Kickoff", date: "15 Jun 2026" },
  { id: 4, maskedUserId: "VE****45", prize: "Amazon Gift Card", giveaway: "Summer Kickoff", date: "15 Jun 2026" },
];
