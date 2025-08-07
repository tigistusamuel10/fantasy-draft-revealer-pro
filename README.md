# 🏈 Fantasy Draft Revealer Pro

A professional Fantasy Football draft order revealer with NFL Draft-style drama, animations, and interactive features. Perfect for adding excitement to your fantasy football draft day!

![Fantasy Draft Revealer](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan) ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-pink)

## ✨ Features

### 🎭 **Dramatic Reveal System**
- **Top 3 Pick Countdown**: Special dramatic countdown animation for the most important picks
- **NFL Draft Styling**: Professional broadcast-style interface with authentic colors and typography
- **Screen Shake Effects**: Dramatic visual feedback during big moments
- **Fireworks Animation**: Special celebration for the #1 overall pick

### 🎮 **Interactive Experience**
- **Keyboard Shortcuts**: 
  - `Space/Enter`: Reveal current pick or advance to next
  - `N`: Next pick (when current is revealed)
  - `R`: Reset reveal order
- **Auto-Scroll**: Automatically scrolls to the current pick being revealed
- **Smart Header**: Fixed header that hides during dramatic moments

### 🏗️ **Team Management**
- **Drag & Drop Setup**: Easily arrange your fantasy league members
- **Fantasy Team Names**: Support for creative team names and strategies
- **Member Profiles**: Include team mottos and draft strategies
- **Flexible Roster**: Support for any number of teams (typically 8-14)

### 🎨 **Professional Design**
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **3D Card Flips**: Smooth card animations for revealing picks
- **Gradient Backgrounds**: Beautiful color schemes throughout
- **Loading States**: Smooth transitions between all phases

### 🔒 **Advanced Randomization**
- **Cryptographically Secure**: Uses `window.crypto.getRandomValues()` when available
- **True Randomization**: Fisher-Yates shuffle algorithm ensures fair ordering
- **Reset & Re-randomize**: Start over with a completely new random order
- **Fallback Support**: Works even in older browsers

### 📊 **Results & Analytics**
- **Final Draft Board**: Clean summary of the complete draft order
- **Team Statistics**: View all team information in organized format
- **Export Ready**: Easy to screenshot or share results

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tigistusamuel10/fantasy-draft-revealer-pro.git
cd fantasy-draft-revealer-pro
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### 1. **Setup Phase**
- Add your fantasy league members by typing names and pressing Enter
- Drag and drop to reorder members if needed
- Add team names, strategies, and mottos for extra fun
- Click "Start Draft Reveal" when ready

### 2. **Reveal Phase** 
- Click "START THE DRAFT!" or use keyboard shortcuts
- Watch the dramatic countdown for top 3 picks
- Use `Space` to reveal picks and advance through the draft
- Use `R` to reset and re-randomize the order anytime

### 3. **Results Phase**
- View the final draft board with all selections
- Take screenshots to share with your league
- Start over with "New Draft" for multiple reveals

## 🛠️ Built With

- **[Next.js 14](https://nextjs.org/)** - React framework with app router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and better developer experience  
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations and transitions
- **[React DnD](https://react-dnd.github.io/react-dnd/)** - Drag and drop functionality
- **[Heroicons](https://heroicons.com/)** - Beautiful SVG icons

## 🎨 Customization

### Themes
The app uses a professional NFL Draft color scheme, but you can easily customize:
- Edit `src/app/globals.css` for global styles
- Modify Tailwind classes in components for quick color changes
- Update gradient combinations in the reveal animations

### Animation Timing
Adjust animation speeds in the components:
- `RevealPhase.tsx` - Main reveal animations
- `DraftCard.tsx` - Card flip timing
- Framer Motion `transition` props throughout

### Team Limits
Change the maximum number of teams by modifying the validation in `SetupPhase.tsx`

## 📝 Performance Notes

The app is optimized for smooth performance:
- **Memoized calculations** prevent unnecessary re-renders
- **Simplified animations** for better mobile performance  
- **Efficient state management** with minimal re-calculations
- **Lazy loading** for better initial load times

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the excitement of real NFL Draft coverage
- Built for fantasy football commissioners who want to add drama to draft day
- Thanks to the React and Next.js communities for amazing tools

---

**Made with ❤️ for fantasy football fans everywhere!**

🏆 *May the odds be ever in your favor... unless you're picking last!* 🏆
