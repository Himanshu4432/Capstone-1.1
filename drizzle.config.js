/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://AI-interviewer_owner:KN1OypHg8QbL@ep-plain-mouse-a1j1wnky.ap-southeast-1.aws.neon.tech/AI-interviewer?sslmode=require",
  },
};
