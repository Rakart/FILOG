
  # Personal Finance Dashboard Design

  This is a code bundle for Personal Finance Dashboard Design. The original project is available at https://www.figma.com/design/sFc6IrIUFRHLlK6TL1POdw/Personal-Finance-Dashboard-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
 
 ## Environment setup
 
 Create a `.env` file in the project root with:
 
 ```bash
 VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
 VITE_SUPABASE_ANON_KEY=your-anon-key
 ```
 
 Restart the dev server after editing env.
 
 ### Supabase Auth (Google) configuration
 
 1. Supabase Dashboard → Authentication → URL Configuration
    - Site URL: `http://localhost:3000`
    - Additional Redirect URLs: add `http://localhost:3000`
 2. Google Cloud Console → APIs & Services → Credentials → your OAuth client
    - Authorized JavaScript origins: `http://localhost:3000`
    - Authorized redirect URIs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
 3. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set locally.
 
 The app triggers Google sign-in via Supabase and explicitly redirects back to your origin.
 
 ### Database and RLS
 
 In Supabase SQL editor, run the contents of `supabase/sql/schema.sql` and then `supabase/sql/rls.sql` to create tables and enable per-user row-level security.
 
 ### Edge Function: get-prices
 
 Deploy the `get-prices` function from `supabase/functions/get-prices/index.ts` using the Supabase CLI. Set these environment variables in the Supabase project (not in the client):
 
 - `ALPHA_VANTAGE_KEY`
 - `SUPABASE_URL` (your project URL)
 - `SUPABASE_SERVICE_ROLE_KEY` (service key)
 
 The function caches prices into the `public.prices` table.
 
 #### Deploy with Supabase CLI
 
 ```bash
 # Install CLI
 npm i -g supabase
 
 # Login and link project
 supabase login
 supabase link --project-ref YOUR_PROJECT_REF
 
 # Set required secrets (server-side only)
 supabase secrets set ALPHA_VANTAGE_KEY=your-alpha-key \
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 
 # Deploy the function
 supabase functions deploy get-prices --no-verify-jwt
 
 # (Optional) Invoke test
 supabase functions invoke get-prices --no-verify-jwt --data '{"symbols":["AAPL","MSFT"]}'
 ```
 
 Client calls function at `https://<project-ref>.supabase.co/functions/v1/get-prices` with the user's access token.

 ## QA checklist
 
 - Sign-in with Google succeeds and redirects to app
 - Create account/category; RLS prevents cross-user access
 - Import CSV → map → preview → commit creates transactions
 - Prices load via `get-prices` and cache to `public.prices`
 - Build succeeds: `npm run build`

 ## Deployment guide (Vercel + Supabase)
 
 1. Push code to GitHub and create a Vercel project linked to the repo.
 2. In Vercel Project Settings → Environment Variables, set:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
 3. In Supabase Dashboard:
    - Run `supabase/sql/schema.sql` then `supabase/sql/rls.sql` in SQL editor
    - Auth → URL Configuration: set production domain as Site URL and add it to Additional Redirect URLs
    - Auth → Providers → Google: ensure OAuth client matches redirect `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
 4. Deploy.
  