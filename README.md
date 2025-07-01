# � AI-Powered SaaS RAG Platform

A comprehensive SaaS platform that combines advanced AI capabilities with document intelligence, built by mixing three powerful repositories:

- **LangChain Next.js Template** - Advanced AI/LLM capabilities
- **Next.js SaaS Starter** - Modern SaaS infrastructure  
- **iaconc RAG SaaS** - Vector embeddings and RAG system

## ✨ Features

### 🎯 Core AI Capabilities
- **Advanced Chat Interface** with multiple LLM integrations
- **RAG (Retrieval-Augmented Generation)** with document search
- **Vector Embeddings** using OpenAI and pgvector
- **Document Processing** with automatic chunking and indexing
- **Semantic Search** across uploaded documents

### 🏢 SaaS Infrastructure
- **Multi-tenant Architecture** with teams and organizations
- **Role-based Access Control** (Admin/Member roles)
- **Stripe Integration** with subscription management
- **Usage Tracking & Billing** tied to AI queries
- **Admin Dashboard** for document and user management

### 💳 Subscription Plans
- **Free Plan**: 100 AI queries, 10 documents, 100MB storage
- **Pro Plan ($29/mo)**: 5,000 queries, 500 documents, 10GB storage
- **Enterprise Plan ($99/mo)**: Unlimited usage, custom models, dedicated support

### 🔐 Authentication & Security
- **NextAuth.js** with Google OAuth and email/password
- **JWT tokens** for API authentication
- **Role-based permissions** for admin functions
- **Team-based data isolation**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL with pgvector extension
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies**
```bash
git clone <your-repo-url>
cd ai-saas-mixed-starter
yarn install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. **Set up the database**
```bash
# Create PostgreSQL database with pgvector
createdb ai_saas_rag
psql ai_saas_rag -c "CREATE EXTENSION vector;"

# Run database migrations
yarn db:generate
yarn db:migrate
```

4. **Seed the database**
```bash
yarn db:seed
```

5. **Start the development server**
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with pgvector:

- **Users & Teams**: Multi-tenant user management
- **Subscriptions**: Stripe integration with plan limits
- **Documents**: File storage with metadata
- **Document Chunks**: Vector embeddings for RAG
- **Chat Sessions**: Conversation history
- **Usage Metrics**: Billing and analytics
- **Activity Logs**: Audit trail

## 🎨 Architecture

### Frontend
- **Next.js 15** with App Router
- **Tailwind CSS** + **shadcn/ui** components
- **React** with TypeScript
- **NextAuth.js** for authentication

### Backend
- **API Routes** for all business logic
- **Drizzle ORM** with PostgreSQL
- **pgvector** for semantic search
- **LangChain.js** for AI workflows

### AI Stack
- **OpenAI GPT** models for chat
- **OpenAI Embeddings** for vector search
- **LangChain** for advanced AI workflows
- **RAG Pipeline** with document chunking

### Payments
- **Stripe Checkout** for subscriptions
- **Stripe Webhooks** for automation
- **Usage-based billing** tracking

## 📁 Project Structure

```
├── app/
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── admin/            # Admin-only pages
│   │   ├── pricing/          # Subscription plans
│   │   └── chat/             # AI chat interface
│   ├── (auth)/               # Authentication pages
│   └── api/                  # API routes
│       ├── admin/            # Admin endpoints
│       ├── stripe/           # Payment webhooks
│       └── chat/             # AI chat APIs
├── lib/
│   ├── auth/                 # Authentication logic
│   ├── db/                   # Database schema & connection
│   ├── payments/             # Stripe integration
│   └── embeddings/           # RAG & vector search
├── components/
│   ├── ui/                   # Reusable UI components
│   └── chat/                 # Chat-specific components
└── drizzle/                  # Database migrations
```

## � API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration

### Admin Routes
- `GET /api/admin/documents` - List all documents
- `POST /api/admin/documents/upload` - Upload documents
- `DELETE /api/admin/documents/[id]` - Delete document

### Chat & RAG
- `POST /api/chat/rag` - RAG-powered chat
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions/[id]` - Get chat history

### Payments
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe events
- `POST /api/stripe/portal` - Customer portal

## 🎯 Usage Examples

### Admin Document Upload
1. Sign in as admin user
2. Navigate to `/admin/documents`
3. Upload PDF, DOCX, or text files
4. Documents are automatically processed and indexed

### RAG Chat Query
```typescript
// API call to RAG endpoint
const response = await fetch('/api/chat/rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are the main features of our product?",
    teamId: "team-id"
  })
});
```

### Subscription Management
1. Visit `/pricing` to view plans
2. Click "Upgrade" to start Stripe Checkout
3. Manage billing at `/dashboard/billing`

## 🏗️ Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker
```bash
# Build and run with Docker
docker build -t ai-saas-platform .
docker run -p 3000:3000 ai-saas-platform
```

### Environment Variables for Production
- Set `DATABASE_URL` to production PostgreSQL
- Use production Stripe keys
- Configure `NEXTAUTH_URL` to your domain
- Set secure `NEXTAUTH_SECRET`

## 📈 Monitoring & Analytics

- **Usage Tracking**: Monitor AI queries per user/team
- **Performance Metrics**: Track response times and success rates
- **Billing Analytics**: Revenue and subscription insights
- **Error Monitoring**: Comprehensive error tracking

## � Security Features

- **Data Encryption**: All sensitive data encrypted
- **Rate Limiting**: API endpoints protected
- **Input Validation**: Comprehensive input sanitization
- **Audit Logging**: Complete activity trails
- **GDPR Compliance**: User data management

## 🧪 Testing

```bash
# Run tests
yarn test

# Run with coverage
yarn test:coverage

# E2E tests
yarn test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.yourapp.com](https://docs.yourapp.com)
- **Discord**: [discord.gg/yourapp](https://discord.gg/yourapp)
- **Email**: support@yourapp.com

## 🙏 Acknowledgments

This project combines the best features from:
- [LangChain Next.js Template](https://github.com/langchain-ai/langchain-nextjs-template)
- [Next.js SaaS Starter](https://github.com/nextjs/saas-starter)
- [iaconc RAG SaaS](https://github.com/armmmo/iaconc)

Built with ❤️ using Next.js, LangChain, Stripe, and PostgreSQL.
