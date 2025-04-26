# Fastify API for Next.js with Supabase Authentication

This is a Fastify-based API that works with Next.js and uses Supabase for authentication and database access. It also includes CLI support for programmatic access via API keys.

## Features

- **Fastify API** - Fast, efficient Node.js backend framework
- **Supabase Integration** - Authentication and database access
- **Next.js Compatibility** - Designed to work seamlessly with Next.js frontend
- **Vercel Deployment** - Ready for deployment on Vercel
- **CLI Support** - Command-line interface for API access
- **API Documentation** - Swagger UI for API documentation
- **CORS Support** - Configured for cross-origin requests
- **JWT Authentication** - Secure authentication with JWT
- **Environment Configuration** - Easily configure the API for different environments

## Prerequisites

- Node.js 18.x or higher
- Supabase account and project
- Next.js frontend (optional but recommended)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fastify-nextjs-api.git
cd fastify-nextjs-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials and other configuration.

5. Set up database schema (run these in Supabase SQL editor):

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  key TEXT UNIQUE NOT NULL,
  name TEXT,
  permissions TEXT[] DEFAULT ARRAY['read']::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create RLS policies (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- API keys policies
CREATE POLICY "Users can view their own API keys" 
  ON public.api_keys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" 
  ON public.api_keys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
  ON public.api_keys FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
  ON public.api_keys FOR DELETE 
  USING (auth.uid() = user_id);
```

6. Start the development server:

```bash
npm run dev
```

## Next.js Integration

In your Next.js application, you can connect to this API using fetch or a library like axios:

```javascript
// Example Next.js API call
const fetchUserData = async () => {
  const response = await fetch('http://localhost:3001/api/users/me', {
    headers: {
      'Authorization': `Bearer ${supabaseSession.access_token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  
  return await response.json();
};
```

## CLI Usage

The API includes a CLI client for easy command-line access:

1. Install CLI dependencies:

```bash
cd cli
npm install
```

2. Link the CLI globally:

```bash
npm link
```

3. Use the CLI commands:

```bash
# Login to get an API key
api-cli login

# Check current user
api-cli whoami

# Fetch data from a table
api-cli data items --limit 10

# Logout and revoke API key
api-cli logout
```

## Deployment to Vercel

1. Push your code to a Git repository.

2. Connect the repository to Vercel.

3. Configure the environment variables in Vercel dashboard.

4. Deploy the project!

## API Documentation

Once the server is running, you can access the API documentation at:

```
http://localhost:3001/documentation
```

This provides a Swagger UI interface to test and explore all available endpoints.

Convert your OpenAPI spec to Markdown

```
npx widdershins swagger.json -o api-documentation.md
```

## Security Considerations

- The API key is stored in the user's home directory in a config file (`~/.my-api-cli/config.json`).
- API keys have expiration dates and can be revoked.
- Supabase handles authentication and manages JWT tokens.
- Row Level Security (RLS) is used in Supabase to ensure users can only access their own data.

## License

MIT