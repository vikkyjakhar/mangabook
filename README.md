<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=800&size=40&duration=3000&pause=1000&color=F97316&center=true&vCenter=true&width=600&height=80&lines=Welcome+to+MangaBook;Read+Manga+Anywhere;Decentralized+%26+Ad-Free" alt="Typing SVG" />
  
  <p><strong>A modern, fast, and Web3-ready platform for reading your favorite manga.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" />
    <img src="https://img.shields.io/badge/Web3-B500D0?style=for-the-badge&logo=web3.js&logoColor=white" alt="Web3" />
  </p>
</div>

<br />

## 📱 Android App — Coming Soon!

<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png" alt="Star-Struck" width="50" height="50" />
  <p>We are currently packaging our highly-optimized web experience into a native Android APK!</p>
  <p>Soon, you will be able to download the official MangaBook Android app, featuring native hardware back-button support, edge-proxied image caching, and a flawless full-screen reading experience.</p>
</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="Rainbow Line" width="100%">

## 🌐 Web3 Ready: Visit us on the Decentralized Web!

MangaBook is proudly hosted on the decentralized web. You can access our uncensorable, resilient Web3 domain exclusively through the **Brave Browser**:

🚀 **[comicbook.brave](comicbook.brave)** 
> *(Note: This Web3 domain link will only open in the Brave browser)*

### Why Web3?
Embracing Web3 technology gives our readers and our platform incredible advantages over traditional hosting:
- 🛡️ **Censorship Resistant:** Decentralized hosting ensures that your access to manga and literature cannot be blocked, taken down, or restricted by centralized authorities.
- 🔗 **Unstoppable & Resilient:** With no single point of failure (like a traditional central server), the website remains online even if individual nodes go down.
- 👁️ **Privacy First:** Web3 infrastructure fundamentally respects user privacy. No corporate trackers, no invasive data harvesting, and no central entity monitoring your reading habits.
- 🌍 **Community-Owned:** Web3 shifts the power back to the users and creators, fostering a free, open, and resilient internet.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="Rainbow Line" width="100%">

## ⚙️ How It Works (Architecture)

MangaBook acts as a lightning-fast aggregator and proxy, ensuring that your ISP or local network restrictions never get in the way of your reading.

```mermaid
graph TD
    classDef client fill:#f97316,stroke:#333,stroke-width:2px,color:#fff,font-weight:bold;
    classDef proxy fill:#000000,stroke:#fff,stroke-width:2px,color:#fff,font-weight:bold;
    classDef api fill:#38bdf8,stroke:#333,stroke-width:2px,color:#fff,font-weight:bold;

    User([👤 You])
    
    subgraph Clients ["Web3 & Mobile Clients"]
        Brave([🦁 Brave Browser<br>comicbook.brave]):::client
        App([📱 Android App<br>Coming Soon!]):::client
    end
    
    Proxy{⚡ Vercel Edge Network<br>API Proxy & Aggregator}:::proxy
    
    subgraph Data Sources ["Content Providers"]
        MD[📖 MangaDex API<br>Primary Source]:::api
        MK[🔥 MangaKakalot<br>Fallback Source]:::api
    end
    
    User -->|Reads| Brave
    User -->|Reads| App
    
    Brave -.-> |Encrypted Request| Proxy
    App -.-> |Capacitor Request| Proxy
    
    Proxy ==>|1. Fetch Metadata & Chapters| MD
    Proxy ==>|2. Proxy Chapter Images to bypass blocks| MD
    Proxy -.->|3. Scrape backup catalogs| MK
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="Rainbow Line" width="100%">

## ✨ Features

- **📖 Seamless Reading Experience:** Clean, intuitive, and distraction-free reader interface optimized for both desktop and mobile.
- **⚡ Lightning Fast Proxying:** All chapter images are proxied through our servers, meaning broken images from ISP blocks are a thing of the past.
- **🔍 Advanced Discovery:** Instantly search and find what you're looking for across aggregated sources.
- **🚫 Ad-Free:** Pure reading, exactly as it should be.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Mobile Integration:** [Capacitor](https://capacitorjs.com/) for building the Android APK.
- **Data Integration:** MangaDex API with Edge-Proxied Images

## 🛠️ Local Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
