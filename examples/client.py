import socket
import os
import json

from typing import Optional

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "3030"))

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((HOST, PORT))


def serialize(s: str) -> str:
    if " " in s or '"' in s:
        return f'"{s.replace('"', '\\"')}"'
    return s


def set_key(key: str, value: str, ttl: Optional[int] = None) -> str:
    command = (
        f"SET {serialize(key)} {serialize(value)} {ttl if ttl is not None else ''}"
    )
    client.sendall(command.encode("utf-8"))
    data = client.recv(4096)
    return data.decode("utf-8")


def get_key(key: str) -> str:
    command = f"GET {serialize(key)}"
    client.sendall(command.encode("utf-8"))
    data = client.recv(4096)
    return data.decode("utf-8")


def main():
    try:
        set_key("name", "Zaid", 10)
        response = set_key("bio", "I like to code", 10)
        print(json.loads(response))

        value = get_key("bio")
        print(json.loads(value))
    finally:
        client.close()


if __name__ == "__main__":
    main()
