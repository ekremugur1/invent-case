# Setup

- Fill a .env file according to the given .env.sample file.
- For database setup, you can just create an empty database and left the NODE_ENV environment variable as "development" to let typeorm synchronize the tables, if you provide another value sync would be turned off and you would need to use the provided ddl.sql file in the root directory.
- Install the dependencies using a package manager (I used pnpm and left my lockfile in).
- Run the "start" or "start:dev" scripts.

# Notes

- Since it was not specified, I assumed the users can borrow and review a book only once. Trying to borrow the same book once it has been returned by a user will return an error.
- In the postman collection, a default rating was returned as a number but the averages were returned as strings, I assumed this was a typo and returned the same type for both.
- Also in the collection some endpoints did not have response examples so I returned some values that I thought fit.