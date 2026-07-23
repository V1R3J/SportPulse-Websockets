CREATE TABLE "user_sport_subscriptions" (
	"user_id" text NOT NULL,
	"sport" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sport_subscriptions_user_id_sport_pk" PRIMARY KEY("user_id","sport")
);
