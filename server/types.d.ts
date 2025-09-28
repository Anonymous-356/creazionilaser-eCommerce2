    declare namespace NodeJS {
        interface ProcessEnv {
        STRIPE_SECRET_KEY: string;
        // Add other environment variables here if needed
        }
    }