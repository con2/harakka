import path from 'path';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

// Load and expand env variables
const myEnv = dotenv.config({
  path: path.resolve(process.cwd(), '../.env.local'),
});
dotenvExpand.expand(myEnv);

interface SupabaseConfig {
  url: string | undefined;
  key: string | undefined;
  projectId: string | undefined;
}

interface Config {
  port: number;
  nodeEnv: string;
  supabase: SupabaseConfig;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    projectId: process.env.SUPABASE_PROJECT_ID,
  },
};

export default config;
