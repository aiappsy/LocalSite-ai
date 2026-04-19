# Aiappsy WebCrafter - Professional AI Web Workspace

> **What's new in 0.6.0?** Global Refinement-First AI, Integrated GitHub Sync, and Quick-Start Templates.

**Aiappsy WebCrafter** is a high-performance web development environment that uses world-class AI models to turn descriptions into production-ready code. Designed for creators who demand precision, it combines local and cloud AI with a sophisticated three-pane layout for real-time build and preview.

## 🌟 Key Features

- **Refinement-First AI**: Optimized system prompts ensure the AI performs targeted, iterative changes rather than full re-generations, preserving your existing design and logic.
- **Professional Independence**: A "Bring Your Own Key" (BYOK) model that bypasses corporate markups. You pay industry-low rates directly to providers like DeepSeek, Anthropic, or Google.
- **Integrated GitHub Sync**: One-click push/pull functionality to keep your projects synced with version control and ready for production deployment.
- **Quick-Start Masterpieces**: Pre-configured template cards (SaaS, Portfolio, AI Startup) to jumpstart your inspiration.
- **Live Multi-Viewport Preview**: Responsive testing across Desktop, Tablet, and Mobile with instant Hot Reload.
- **Monaco Code Editor**: Professional-grade editor integrated directly into the workspace for manual fine-tuning.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **AI Orchestration**: [Vercel AI SDK v5](https://sdk.vercel.ai/) with NDJSON streaming
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- An API Key from [OpenRouter](https://openrouter.ai), [DeepSeek](https://platform.deepseek.com), [Anthropic](https://console.anthropic.com), or [Google AI Studio](https://aistudio.google.com).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aiappsy/LocalSite-ai.git
   cd LocalSite-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env.local` and add your default provider:
   ```bash
   DEFAULT_PROVIDER=openai_compatible
   OPENAI_COMPATIBLE_API_BASE=https://openrouter.ai/api/v1
   ```

4. **Launch**:
   ```bash
   npm run dev
   ```

## 🧠 Supported AI Engines

| Provider | Model Recommendations | Strengths |
| :--- | :--- | :--- |
| **DeepSeek** | `deepseek-chat` (V3) | Elite engineering logic at incredible cost-efficiency. |
| **Anthropic** | `claude-3-5-sonnet` | The gold standard for frontend aesthetics and UI precision. |
| **Google** | `gemini-1.5-flash` | The fastest prototyping engine for rapid iteration. |
| **OpenRouter** | Any (Gateway) | Access any model in the world through a single unified API. |
| **Local (Ollama)** | `llama3`, `codellama` | 100% private, free-to-run local development. |

## 📦 Deployment & Sync

Aiappsy WebCrafter is optimized for production. Use the **Source Control** tab to:
1. Create a GitHub Personal Access Token (PAT).
2. Connect your repository.
3. Push your generated code instantly.
4. Deploy to **Coolify**, **Vercel**, or any host using the generated `Dockerfile`.

## 🛤️ Roadmap

- [x] **0.6.0**: Multi-provider support, System Instructions, and Mobile Viewports.
- [x] **0.6.5**: Refinement-First Logic & Integrated GitHub Sync.
- [ ] **0.7.0**: Multi-file project generation and ZIP export.
- [ ] **0.8.0**: AI Design Agent for autonomous CSS debugging.
- [ ] **1.0.0**: Cross-platform Electron Desktop App.

## 🤝 Contributing

We welcome professional contributions. Please follow the [MIT License](LICENSE) guidelines and submit Pull Requests for enhancements.

---
Built with ❤️ by the **Aiappsy** team.

