# EzDB

EzDB is a lightweight, Redis-compatible key-value store powered by **Bun** and backed by **SQLite** (via Drizzle ORM). It provides a familiar TCP interface for caching and storage while offering the simplicity and persistence of a local SQLite database.

## Features

- **Redis-compatible Protocol**: Connect using standard Redis clients or the built-in CLI.
- **SQLite Backend**: Data is persisted reliably in a local SQLite database (`local.db`).
- **TTL Support**: Built-in specialized handling for key expiration.
- **Data Types**: Supports Strings, Hashes, and Sets.
- **Built with Modern Tech**: Bun, TypeScript, Drizzle ORM, and Biome.

## Prerequisites

- [Bun](https://bun.sh) (latest version recommended)

## Installation

Clone the repository and install dependencies:

```bash
bun install
```

## Setup

Initialize the database (generates schema and runs migrations):

```bash
bun run init:db
```

This will create a `local.db` file in your project root.

## Usage

### Starting the Server

Start the EzDB server:

```bash
bun start
```

By default, the server listens on `127.0.0.1:3030`. You can configure this via environment variables.

### Using the CLI

EzDB comes with a built-in CLI to interact with the server:

```bash
bun cli
```

Once connected, you can run commands like:

```
ezdb 127.0.0.1:6379> SET mykey "Hello World" 60
"OK"
ezdb 127.0.0.1:6379> GET mykey
"Hello World"
```

## Supported Commands

EzDB supports a subset of core Redis commands:

- **Strings**
  - `GET <key>`
  - `SET <key> <value> [ttl]`
  - `DEL <key>`
- **Hashes**

  - `HSET <key> <field> <value> [ttl]`
  - `HGET <key> <field>`
  - `HGETALL <key>`
  - `HKEYS` (Global hash keys)
  - `HDEL <key> <field>`
  - `HDELALL <key>` (Delete entire hash)

- **Sets / Lists**
  - `APPEND <key> <member> [ttl]` (Acts like SADD)
  - `REMOVE <key> <member>` (Acts like SREM)
  - `FETCH <key>` (Acts like SMEMBERS)
  - `LDEL <key>` (Delete entire set/list)

## Configuration

You can configure the server using environment variables (create a `.env` file):

```env
PORT=6379
HOST=127.0.0.1
DB_FILE_NAME=local.db
```

## detailed Architecture

- **Server**: A TCP server implemented with `node:net` running on Bun.
- **Persistence**: SQLite database accessed via `drizzle-orm` and `@libsql/client`.
- **Schema**: Single generalized table (`ezdb`) storing keys, values, types, and members with composite primary keys for flexibility.

## Development

- **Lint/Check**: `bun run check`
- **Build**: `bun run build`
- **Database Generation**: `bun run db:generate`
- **Database Migration**: `bun run db:migrate`
- **Test**: `bun test`

## License

Private / Proprietary
