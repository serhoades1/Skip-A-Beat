import secrets

secret_key = secrets.token_hex(32)  # Generates a 32-byte (64-character) hex key
print("Your Secret Key:", secret_key)
