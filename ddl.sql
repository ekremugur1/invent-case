DROP DATABASE IF EXISTS "invent";
CREATE DATABASE "invent";

\c invent;

-- Creating the 'users' table
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Creating the 'books' table
CREATE TABLE "books" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "borrower_id" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("borrower_id") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Creating the 'scores' table
CREATE TABLE "scores" (
    "id" SERIAL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE ("user_id", "book_id"),
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE
);

-- Trigger to update 'updatedAt' on row modification
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_books_modtime
BEFORE UPDATE ON "books"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_scores_modtime
BEFORE UPDATE ON "scores"
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();