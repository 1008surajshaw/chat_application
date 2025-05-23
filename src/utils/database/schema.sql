create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  created_at timestamp default now()
);

create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  chat_name text ,
  is_group boolean default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamp default now()
);

create table if not exists chat_members (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  is_admin boolean default false,
  joined_at timestamp default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null,
  content text,
  type text default 'text',
  sent_at timestamp default now()
);

create table if not exists labels (
  id uuid primary key default gen_random_uuid(),
  label_name text,
  color text
);

create table if not exists chat_labels (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  label_id uuid references labels(id) on delete cascade
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  assigned_to uuid references profiles(id) on delete set null,
  assigned_by uuid references profiles(id) on delete set null,
  created_at timestamp default now()
);

alter table profiles enable row level security;
create policy "Users manage their profile"
  on profiles for all
  using (auth.uid() = id);

alter table chats enable row level security;
alter table chat_members enable row level security;
alter table messages enable row level security;
alter table labels enable row level security;
alter table chat_labels enable row level security;
alter table assignments enable row level security; 