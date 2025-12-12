# ⚡ Quick Start Guide

Get the War Room dashboard running in under 2 minutes!

## 🚀 Installation (30 seconds)

```bash
# Navigate to project
cd war-room

# Install dependencies
npm install
```

## ▶️ Run the App (10 seconds)

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

## 🎯 What You'll See

```
┌─────────────────────────────────────────────────────┐
│ NEUROGRID DIGITAL                           ⚙️      │
├──────────┬─────────────────┬────────────────────────┤
│ AGENTS   │ TRADE SIGNALS   │ P&L & HISTORY         │
│          │                 │                        │
│ • Prime  │ ETH-USDC 92%   │ Portfolio: $1,000     │
│ • Senti  │ [APPROVE]      │ 24h: +$12.40 (1.2%)   │
│ • Execu  │                 │ [EMERGENCY HALT]      │
│ • Warden │ PEPE-SOL 65%   │ Tx Log...             │
│          │ [APPROVE]      │                        │
└──────────┴─────────────────┴────────────────────────┘
                                    [Chat with Prime] 💬
```

## ✅ Test the Features (1 minute)

### 1. View Trade Proposals
Look at the center panel - you'll see 2 trade cards ready for review.

### 2. Approve a Trade
Click the green **APPROVE** button on the PEPE-SOL trade. Watch it move to the execution log!

### 3. Chat with Prime
1. Click the **"Chat with Prime"** button (bottom right)
2. Type: "What's your analysis on ETH?"
3. Press Enter
4. Get an instant AI response!

### 4. View Constitution
Click the ⚙️ gear icon (top right) to see the trading rules.

### 5. Emergency Halt
Click the red **EMERGENCY HALT** button to test the kill switch (you'll get a confirmation).

## 💬 Try the AI Chat

The chat works immediately with smart mock responses. Try these:

```
"How's our portfolio?"
"What trades are you watching?"
"Tell me about BTC"
"What's your status?"
```

## 🔑 Optional: Enable Real AI (2 minutes)

Want actual AI instead of mock responses?

1. **Get a free Hugging Face API key**:
   - Visit: https://huggingface.co/settings/tokens
   - Click "New token"
   - Copy the token (starts with `hf_`)

2. **Add to environment**:
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local`**:
   ```
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

4. **Restart**:
   ```bash
   npm run dev
   ```

Now your chat uses real AI! 🤖

## 🎨 What's Inside?

- **4 AI Agents** monitoring the markets
- **2 Trade Proposals** ready for approval
- **Live P&L** showing +$12.40 profit
- **Transaction History** with 2 completed trades
- **AI Chat** to talk with Prime
- **Emergency Controls** for safety

## 📚 Learn More

- **Full Documentation**: [README.md](README.md)
- **Chat Guide**: [CHAT_GUIDE.md](CHAT_GUIDE.md)
- **Usage Instructions**: [USAGE.md](USAGE.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

## 🆘 Troubleshooting

**Blank screen?**
- Check the terminal for errors
- Make sure port 3000 is available
- Try `npm install` again

**Chat not working?**
- Mock responses work without API key
- Check browser console for errors
- Make sure you clicked the chat button

**Styles broken?**
- Clear browser cache
- Restart dev server
- Check Tailwind is configured

## 🎉 You're Ready!

The War Room is now operational. Start exploring the cyberpunk trading interface!

**Quick Actions**:
- Approve trades
- Chat with Prime
- Monitor agent status
- Watch the P&L
- Test emergency halt

---

Built with ❤️ using Next.js, React, Tailwind CSS, and Hugging Face AI
