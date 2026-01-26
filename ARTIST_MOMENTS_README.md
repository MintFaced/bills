# Artist Moments - Atari Timeline

Transform your Ethereum blockchain history into an 80s Atari-style visual timeline!

## Features

- **CSV Upload**: Upload your Etherscan transaction export
- **Moment Detection**: Automatically identifies key moments:
  - 🚀 Contract Deployments
  - 🎨 Genesis Mint (your first NFT drop)
  - 💵 First Sale
  - 💰 Biggest Sale
  - 📊 Volume Milestones (1, 10, 50, 100+ ETH)
  - 🎮 Mint Milestones (100th, 500th, 1000th+ mint)
- **Atari Aesthetics**: Full 80s retro styling with:
  - MintFace purple & pink color palette
  - Pixel art borders
  - Scanline effects
  - Retro glow text
  - Game-style animations

## How to Use

### Step 1: Export Your Etherscan Data

1. Go to [Etherscan.io](https://etherscan.io)
2. Navigate to your wallet address
3. Go to the "Transactions" tab
4. Click "Download CSV Export"
5. Save the CSV file

### Step 2: Upload to Artist Moments

1. Visit the Artist Moments app
2. Drag & drop your Etherscan CSV or click to browse
3. Click "GENERATE TIMELINE"
4. Watch your journey unfold!

### Step 3: Explore Your Timeline

- Scroll through your chronological moments
- Click on any moment for detailed information
- View transaction hashes and contract addresses
- See your stats summary at the bottom

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **PapaParse** - CSV parsing

## Moment Types

| Type | Description | Icon |
|------|-------------|------|
| CONTRACT_DEPLOY | Smart contract creation | 🚀 |
| GENESIS_MINT | First NFT mint | 🎨 |
| FIRST_SALE | Your first sale | 💵 |
| BIGGEST_SALE | Highest value sale | 💰 |
| VOLUME_MILESTONE | Total volume milestones | 📊 |
| MINT_MILESTONE | Mint count milestones | 🎮 |

## CSV Format

The app supports standard Etherscan CSV exports with columns like:
- Transaction Hash
- Block Number
- Timestamp
- From/To Addresses
- Contract Address (for deployments)
- Value (in ETH)
- Method (mint, transfer, etc.)
- Status

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Color Palette

**Purple Tones** (Primary):
- `--purple-950` to `--purple-100`
- Used for backgrounds and main UI elements

**Pink Tones** (Secondary):
- `--pink-950` to `--pink-100`
- Used for highlights and important moments

**Cyan Tones** (Accent):
- `--cyan-950` to `--cyan-100`
- Used for sales and special milestones

## Future Enhancements

- [ ] Export timeline as image
- [ ] Share on social media
- [ ] Support for multiple chains
- [ ] Animated sprite characters
- [ ] Sound effects (optional Atari beeps!)
- [ ] Pixel art NFT badges for milestones
- [ ] Compare timelines with other artists

---

Built with ❤️ and retro vibes
