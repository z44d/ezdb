# EzDB

EzDB is a lightweight key-value store powered by **Bun** and backed by **SQLite**.

## Prerequisites

- [Bun](https://bun.sh) (latest version)

## Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Initialize the database:
   ```bash
   bun run init:db
   ```

## Usage

### Start Server

```bash
bun start
```

Starts the server on `127.0.0.1:3030` (default).

### CLI

```bash
bun cli
```

### Examples

Run the client example:

```bash
bun run examples/client.ts
```

Or the Python client:

```bash
python3 examples/client.py
```

## Commands

### Keys

- `SET <key> <value> [ttl]` - Set key to hold the string value.
- `GET <key>` - Get the value of key.
- `DEL <key>` - Delete a key.
- `KEYS` - Find all keys.
- `COUNT` - Count total number of keys.

### Hashes

- `HSET <key> <field> <value> [ttl]` - Set field in the hash stored at key to value.
- `HGET <key> <field>` - Get the value of a hash field.
- `HDEL <key> <field>` - Delete one or more hash fields.
- `HDELALL <key>` - Delete the entire hash.
- `HGETALL <key>` - Get all the fields and values in a hash.
- `HKEYS` - Get all keys in strings/hashes.

### Lists & Sets

- `APPEND <key> <member> [ttl]` - Add a member to a set/list.
- `FETCH <key>` - Get all members of a set/list.
- `REMOVE <key> <member>` - Remove a member from a set/list.
- `LDEL <key>` - Delete the entire set/list.
- `LKEYS` - Get all list keys.
- `LEN <key>` - Get the length of a set/list.
