# War Room Dashboard - Usage Guide

## Quick Start

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to [http://localhost:3000](http://localhost:3000)

## Dashboard Overview

### Layout

The dashboard is divided into three main sections:

```
┌─────────────────────────────────────────────────────────────┐
│  NEUROGRID DIGITAL                              ⚙️ Settings  │
├──────────────┬────────────────────┬─────────────────────────┤
│              │                    │                         │
│   AGENTS     │   TRADE SIGNALS    │      P&L PANEL         │
│   (Left)     │     (Center)       │       (Right)          │
│              │                    │                         │
│  • Prime     │  ETH-USDC 92%     │  Portfolio: $1,000     │
│  • Sentinel  │  PEPE-SOL 65%     │  Change: +$12.40       │
│  • Executor  │                    │  [EMERGENCY HALT]      │
│  • Warden    │  [APPROVE][REJECT] │                         │
│              │                    │  Transaction Log        │
│              │                    │  • SOL-USDC +$12.40    │
└──────────────┴────────────────────┴─────────────────────────┘
```

## Features Walkthrough

### 1️⃣ Agent Roster (Left Panel)

**What it shows**: Real-time status of all AI trading agents

**Agent Status Indicators**:
- 🟢 **Pulsing Green Dot** = Agent is online and working
- 🟡 **Pulsing Yellow Dot** = Agent is thinking/processing
- 🔴 **Red Dot** = Agent encountered an error

**Current Actions**: Each agent displays what it's currently doing
- "Filtering Noise..." (Prime)
- "Parsing Twitter Sentiment..." (Sentinel)
- "Calculating Optimal Entry..." (Executor)
- "Monitoring Risk Parameters..." (Warden)

### 2️⃣ Opportunity Feed (Center Panel)

**What it shows**: Live stream of trade opportunities waiting for approval

**Trade Card Zones**:

**🟢 Green Zone ($0-$20 gas)**
- Auto-executed
- Low risk, low cost
- Example: ETH-USDC arbitrage at $2.50 gas

**🟡 Yellow Zone ($20-$100 gas)**
- Requires manual approval
- Medium risk/cost
- Shows [APPROVE] and [REJECT] buttons
- Example: PEPE-SOL at $0.001 gas (but risky asset)

**🔴 Red Zone (>$100 gas)**
- High risk, manual approval required
- Large position sizes

**Card Information**:
- **Ticker**: Token pair (e.g., ETH-USDC)
- **Confidence**: AI confidence score (e.g., 92%)
- **Reason**: Why the trade is being proposed
- **Data Grid**:
  - Est. Gas: Transaction cost
  - Slippage: Expected price impact
  - Liquidity: Available liquidity in pool

**Actions**:
- Click **APPROVE** (green) to execute the trade
- Click **REJECT** (red) to dismiss the proposal

### 3️⃣ Execution Panel (Right Panel)

**Live P&L Section**:
- **Total Portfolio Value**: Current portfolio worth
- **24h Change**: Daily profit/loss in $ and %
- **Color Coding**:
  - Green = Profit
  - Red = Loss

**Emergency Halt Button**:
- Big red button to immediately stop all trading
- Confirms before executing
- Use in emergency situations only

**Transaction History**:
- Scrollable log of all executed trades
- Shows:
  - Token pair
  - Timestamp (HH:MM:SS)
  - Profit/Loss (color-coded)
  - Gas cost
  - Transaction hash
  - Link to explorer (placeholder)

### 4️⃣ Constitution Modal (Settings)

**How to access**: Click the ⚙️ gear icon in top right

**What it shows**:
- Hard-coded trading rules from Constitution.py
- Risk parameters:
  - Max Daily Drawdown: 5%
  - Green Zone Limit: $20
  - Yellow Zone Limit: $100
  - Red Zone: Manual approval required
- Additional safety constraints
- Displayed as read-only Python code

**How to close**:
- Click the X button
- Press ESC key
- Click outside the modal

## Interactive Elements

### Approve a Trade
1. Find a trade card with yellow zone badge
2. Click the green **APPROVE** button
3. Watch it move to the Transaction History
4. See the updated P&L

### Reject a Trade
1. Find any trade proposal
2. Click the red **REJECT** button
3. Card disappears from the feed

### Emergency Stop
1. Click the red **EMERGENCY HALT** button
2. Confirm the action
3. All pending trades are cancelled

### View Constitution
1. Click ⚙️ settings icon (top right)
2. Read the trading rules
3. Click **CLOSE** or press ESC

## Customization Points

### Adding New Agents
Edit [data/mockData.ts](data/mockData.ts):

```typescript
export const mockAgents: Agent[] = [
  {
    id: 'new-agent',
    name: 'Scanner',
    icon: 'Radar', // Must match a Lucide icon name
    status: 'online',
    currentAction: 'Scanning for arbitrage...',
  },
  // ... existing agents
]
```

### Adding New Trade Proposals
Edit [data/mockData.ts](data/mockData.ts):

```typescript
export const mockTradeProposals: TradeProposal[] = [
  {
    id: '3',
    ticker: 'BTC-USDT',
    confidence: 88,
    reason: 'Large buy wall detected at $95K',
    gas: 15.50,
    slippage: 0.2,
    liquidity: 10000000,
    zone: 'yellow',
    timestamp: Date.now(),
  },
  // ... existing proposals
]
```

### Changing Constitution Rules
Edit [data/mockData.ts](data/mockData.ts):

```typescript
export const constitution: Constitution = {
  maxDailyDrawdown: '10%', // Changed from 5%
  greenZoneLimit: '$50',   // Changed from $20
  yellowZoneLimit: '$200', // Changed from $100
  redZoneLimit: 'REQUIRES_MANUAL_APPROVAL',
}
```

## Keyboard Shortcuts

- **ESC**: Close Constitution modal
- **Mouse hover**: See interactive hover effects on all buttons

## Performance Notes

- Animations are GPU-accelerated via Framer Motion
- Smooth 60fps on modern browsers
- Optimized for desktop displays (1920x1080+)
- Mobile responsive version coming soon

## Troubleshooting

**Problem**: Blank screen
- Solution: Check console for errors, ensure all dependencies are installed

**Problem**: Buttons not responding
- Solution: Check that JavaScript is enabled

**Problem**: Styles not loading
- Solution: Ensure Tailwind CSS is properly configured

**Problem**: Modal won't close
- Solution: Press ESC key or refresh the page

## Design Philosophy

The interface draws inspiration from:
- Bloomberg Terminal (dense information, professional)
- Cyberpunk aesthetics (neon accents, dark mode)
- Trading desks (real-time data, critical actions)

Color meanings:
- 🟢 **Green (Emerald-500)**: Profit, success, safe actions
- 🔴 **Red (Rose-500)**: Loss, danger, emergency
- 🟡 **Yellow (Amber-400)**: Warnings, needs attention
- ⚪ **Gray**: Neutral information

All critical numbers use monospace fonts for precision and readability.

## Next Steps

1. Integrate with real trading APIs
2. Add WebSocket for live data updates
3. Implement historical charts
4. Add user authentication
5. Build mobile version
6. Add custom alert system

Enjoy your War Room! 🚀
