-- A Google subject is immutable for a Google account. It must be linked to
-- exactly one Eduvia account, even when different Google accounts share a
-- recoverable email address over time.
CREATE UNIQUE INDEX `accounts_providerId_accountId_key`
ON `accounts`(`providerId`, `accountId`);
