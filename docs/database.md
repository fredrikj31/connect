# Database

The schema lives in `database/src/schemas/` (one file per table) and is applied with the Drizzle migrations in `database/src/migrations/`. This page mirrors it; update both together.

```mermaid
erDiagram
  user {
    text id PK
    text name
    text email UK
    boolean email_verified
    text image "nullable"
    text username UK "nullable, lowercased"
    text display_username "nullable"
    timestamp created_at
    timestamp updated_at
  }

  session {
    text id PK
    text token UK
    timestamp expires_at
    text ip_address "nullable"
    text user_agent "nullable"
    text user_id FK
    timestamp created_at
    timestamp updated_at
  }
  user ||--o{ session : user_id

  account {
    text id PK
    text account_id
    text provider_id
    text user_id FK
    text password "nullable, hashed"
    text access_token "nullable"
    text refresh_token "nullable"
    text id_token "nullable"
    timestamp access_token_expires_at "nullable"
    timestamp refresh_token_expires_at "nullable"
    text scope "nullable"
    timestamp created_at
    timestamp updated_at
  }
  user ||--o{ account : user_id

  verification {
    text id PK
    text identifier
    text value
    timestamp expires_at
    timestamp created_at
    timestamp updated_at
  }

  profile {
    text user_id PK, FK
    varchar first_name
    varchar last_name
    date birth_date
    gender gender "MALE | FEMALE | PREFER_NOT_TO_SAY"
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at "nullable"
  }
  user ||--o| profile : user_id

  friend {
    uuid id PK
    text user_id FK
    text friend_id FK
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at "nullable"
  }
  user ||--o{ friend : user_id
  user ||--o{ friend : friend_id

  friend_request {
    uuid id PK
    text sender_id FK
    text receiver_id FK
    friend_request_status status "PENDING | ACCEPTED | DECLINED"
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at "nullable"
  }
  user ||--o{ friend_request : sender_id
  user ||--o{ friend_request : receiver_id

  post {
    uuid id PK
    text user_id FK
    text content
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at "nullable"
  }
  user ||--o{ post : user_id

  post_like {
    uuid id PK
    uuid post_id FK
    text user_id FK
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at "nullable"
  }
  post ||--o{ post_like : post_id
  user ||--o{ post_like : user_id
```

## Notes

- **Auth tables** (`user`, `session`, `account`, `verification`) are owned by better-auth and generated into `database/src/schemas/auth.ts` by `pnpm backend:auth:generate`. User ids are better-auth text ids, so every foreign key to `user` is `text`. `username` comes from the better-auth `username` plugin and is stored lowercased; `display_username` keeps the casing the user typed.
- **profile** is created right after signup (`POST /profiles`) and keyed by the user id, so a user has at most one. The frontend sends users without a profile to `/onboarding`. Email and username are read from `user`; the public profile shape returned by the API is the profile plus `username`.
- **friend** stores one row per direction. Accepting a friend request inserts both rows in one transaction, with `ON CONFLICT DO NOTHING` on `(user_id, friend_id)` so re-accepting is harmless.
- **friend_request** starts `PENDING` and is resolved by the receiver to `ACCEPTED` or `DECLINED`. Withdrawing a request soft-deletes it. Only one pending request may exist between two users, in either direction.
- **post_like** has a unique `(post_id, user_id)` pair. Liking again after an unlike clears `deleted_at` on the existing row instead of inserting a new one.
- **Soft deletes:** `profile`, `friend`, `friend_request`, `post` and `post_like` have `deleted_at`; every query filters `deleted_at IS NULL`. The auth tables are deleted for real, and deleting a user cascades to every table that references it.
- **The feed** (`GET /posts`) is the user's own posts plus the posts of everyone in their `friend` rows, newest first.
