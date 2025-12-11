CREATE TABLE "revenue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer NOT NULL,
	"month" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
